"""Backend FastAPI de la UI de Diane (Milestone 6, spec actualizada).

Sirve el frontend React (vendorizado del design system en ``static/``) y
expone la API del pipeline. El server NO carga modelos (sección 3): solo
lanza el orquestador en un hilo, que a su vez lanza cada etapa como
subproceso aislado. Los eventos de progreso fluyen por SSE.

La UI nunca modifica pipeline.yaml global: cada job escribe su propio YAML
(config global + overrides de la UI) y se lo pasa al orquestador.
"""

from __future__ import annotations

import json
import os
import re
import threading
import uuid
from dataclasses import dataclass, field
from pathlib import Path

import yaml
from fastapi import Body, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles

from videodub.core import vram
from videodub.core.logger import get_logger
from videodub.core.orchestrator import Orchestrator

logger = get_logger(__name__)

ROOT = Path(__file__).resolve().parents[2]
STATIC_DIR = Path(__file__).parent / "static"
WORKSPACE = ROOT / "workspace"
GLOBAL_CONFIG = ROOT / "config" / "pipeline.yaml"

# Mapa preset → última etapa. "quality" incluirá lipdub cuando exista (M7).
PRESET_UNTIL = {"fast": "compose", "balanced": "compose", "quality": "compose"}

ARTIFACT_WHITELIST = {
    "03_transcript.srt", "03_transcript.json",
    "04_translation.srt", "04_translation.json",
    "06_synth_aligned.wav", "07_final.mp4", "08_lipdub.mp4",
}


@dataclass
class Job:
    """Estado de un job + historial de eventos.

    Los suscriptores SSE leen ``events`` por índice bajo ``cond`` — el
    historial es la única fuente de verdad. Antes había una queue paralela
    al historial y la reconexión reemitía duplicados (los eventos quedaban
    en ambos); con índice + Condition no hay duplicados y soporta varios
    suscriptores a la vez.
    """

    id: str
    events: list[dict] = field(default_factory=list)
    cond: threading.Condition = field(default_factory=threading.Condition)
    job_dir: Path | None = None
    status: str = "running"  # running | done | failed


JOBS: dict[str, Job] = {}

app = FastAPI(title="diane", version="1.0.0")


@app.get("/api/health")
def health() -> dict:
    return {"ok": True, "gemini_key": bool(os.environ.get("GEMINI_API_KEY"))}


@app.get("/api/vram")
def vram_info() -> dict:
    if not vram.is_available():
        return {"available": False, "used_mib": 0, "total_mib": 0}
    snap = vram.snapshot(0)
    return {"available": True, "used_mib": snap.used_mib, "total_mib": snap.total_mib}


_YOUTUBE_RE = re.compile(
    r"^https?://(www\.)?(youtube\.com/(watch\?|shorts/)|youtu\.be/)", re.I
)


@app.post("/api/download-url")
def download_url(payload: dict = Body(...)) -> dict:
    """Descarga un video de YouTube con yt-dlp a workspace/uploads/.

    Devuelve un ``file_id`` que POST /api/jobs acepta en lugar del upload —
    el video descargado entra al pipeline igual que un archivo subido.
    """
    url = str(payload.get("url", "")).strip()
    if not _YOUTUBE_RE.match(url):
        raise HTTPException(400, "URL de YouTube inválida")

    import yt_dlp

    upload_id = uuid.uuid4().hex[:12]
    uploads = WORKSPACE / "uploads"
    uploads.mkdir(parents=True, exist_ok=True)
    outpath = uploads / f"{upload_id}.mp4"

    opts = {
        "outtmpl": str(uploads / f"{upload_id}.%(ext)s"),
        # H.264 mp4 para mantener -c:v copy en compose.
        "format": "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/b",
        "merge_output_format": "mp4",
        "noplaylist": True,
        "quiet": True,
        "no_warnings": True,
    }
    try:
        with yt_dlp.YoutubeDL(opts) as ydl:
            info = ydl.extract_info(url, download=True)
    except yt_dlp.utils.DownloadError as exc:
        raise HTTPException(502, f"yt-dlp falló: {str(exc)[-300:]}")
    if not outpath.exists():
        raise HTTPException(502, "yt-dlp no produjo el MP4 esperado")

    return {
        "file_id": upload_id,
        "name": f"{info.get('title', 'video')}.mp4",
        "duration_s": info.get("duration"),
        "resolution": f"{info.get('width', '?')}×{info.get('height', '?')}",
        "size_bytes": outpath.stat().st_size,
    }


@app.post("/api/jobs")
async def create_job(
    file: UploadFile | None = File(None),
    file_id: str = Form(""),
    preset: str = Form("balanced"),
    backend: str = Form("gemini"),
    instructions: str = Form(""),
    api_key: str = Form(""),
    until_stage: str = Form(""),
) -> dict:
    if preset not in PRESET_UNTIL:
        raise HTTPException(400, f"preset desconocido: {preset}")
    if backend not in ("gemini", "local"):
        raise HTTPException(400, f"backend desconocido: {backend}")
    if backend == "gemini" and not (api_key or os.environ.get("GEMINI_API_KEY")):
        raise HTTPException(400, "GEMINI_API_KEY no configurada (entorno o campo de la UI)")

    uploads = WORKSPACE / "uploads"
    uploads.mkdir(parents=True, exist_ok=True)
    if file_id:
        # Video ya descargado por /api/download-url.
        if not re.fullmatch(r"[0-9a-f]{12}", file_id):
            raise HTTPException(400, "file_id inválido")
        upload_id = file_id
        video_path = uploads / f"{file_id}.mp4"
        if not video_path.exists():
            raise HTTPException(404, f"file_id {file_id} no existe")
    elif file is not None:
        upload_id = uuid.uuid4().hex[:12]
        video_path = uploads / f"{upload_id}.mp4"
        with video_path.open("wb") as fh:
            while chunk := await file.read(1 << 20):
                fh.write(chunk)
    else:
        raise HTTPException(400, "falta el video: envía 'file' o 'file_id'")

    # Config por job: global + overrides de la UI (sin tocar pipeline.yaml).
    config = yaml.safe_load(GLOBAL_CONFIG.read_text()) if GLOBAL_CONFIG.exists() else {}
    config["translation_backend"] = backend
    if instructions.strip():
        config["translation_description"] = instructions.strip()
    config_path = uploads / f"{upload_id}.yaml"
    config_path.write_text(yaml.safe_dump(config, allow_unicode=True))

    if api_key:
        # Proceso local single-user: el subproceso de translate hereda el env.
        os.environ["GEMINI_API_KEY"] = api_key

    job = Job(id=upload_id)
    JOBS[upload_id] = job
    until = until_stage or PRESET_UNTIL[preset]

    def emit(event: dict) -> None:
        with job.cond:
            job.events.append(event)
            job.cond.notify_all()

    def run() -> None:
        try:
            orch = Orchestrator(
                workspace_root=WORKSPACE, config_path=config_path, on_event=emit
            )
            job.job_dir = orch.run(video_path, until_stage=until)
            status = "done"
        except Exception as exc:  # noqa: BLE001 — el error viaja a la UI
            status = "failed"
            emit({"type": "error", "stage": None, "message": str(exc)[-2000:]})
        with job.cond:
            job.status = status
            job.cond.notify_all()  # despierta streams para que emitan eof

    threading.Thread(target=run, daemon=True, name=f"job-{upload_id}").start()
    return {"job_id": upload_id, "until_stage": until}


@app.get("/api/jobs/{job_id}/events")
def job_events(job_id: str) -> StreamingResponse:
    job = JOBS.get(job_id)
    if job is None:
        raise HTTPException(404, "job no encontrado")

    def stream():
        # Cursor por suscriptor sobre el historial: reemite desde 0 (sirve
        # de replay en reconexión) y sigue en vivo sin duplicados.
        idx = 0
        while True:
            with job.cond:
                while idx >= len(job.events) and job.status == "running":
                    job.cond.wait(timeout=30)
                batch = job.events[idx:]
                idx += len(batch)
                status = job.status
            for ev in batch:
                yield f"data: {json.dumps(ev, ensure_ascii=False)}\n\n"
            if not batch and status == "running":
                # Heartbeat: mantiene viva la conexión SSE en silencios largos.
                yield ": keepalive\n\n"
            if status != "running" and idx >= len(job.events):
                yield f"data: {json.dumps({'type': 'eof', 'status': status})}\n\n"
                return

    return StreamingResponse(stream(), media_type="text/event-stream")


@app.get("/api/jobs/{job_id}/artifacts")
def list_artifacts(job_id: str) -> dict:
    job = JOBS.get(job_id)
    if job is None or job.job_dir is None:
        raise HTTPException(404, "job sin outputs todavía")
    files = [
        {"name": p.name, "size_bytes": p.stat().st_size}
        for p in sorted(job.job_dir.iterdir())
        if p.name in ARTIFACT_WHITELIST
    ]
    return {"job_id": job_id, "artifacts": files}


@app.get("/api/jobs/{job_id}/artifacts/{name}")
def get_artifact(job_id: str, name: str) -> FileResponse:
    job = JOBS.get(job_id)
    if job is None or job.job_dir is None:
        raise HTTPException(404, "job sin outputs todavía")
    if name not in ARTIFACT_WHITELIST:
        raise HTTPException(403, "artefacto no permitido")
    path = job.job_dir / name
    if not path.exists():
        raise HTTPException(404, f"{name} no existe")
    return FileResponse(path, filename=name)


# El frontend (React + tokens del design system) al final, para no opacar /api.
app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")


def main(host: str = "127.0.0.1", port: int = 7860) -> None:
    import uvicorn

    logger.info("UI de diane en http://%s:%d", host, port)
    uvicorn.run(app, host=host, port=port, log_level="info")


if __name__ == "__main__":
    main()
