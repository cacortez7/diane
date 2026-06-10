"""Orquestador del pipeline (sin GPU, sin modelos — sección 3 de CLAUDE.md).

Coordina las etapas como subprocesos aislados vía StageRunner, con caché por
hash de inputs + config. Milestone 2: extract_audio → separate_vocals →
transcribe.
"""

from __future__ import annotations

import hashlib
import json
import shutil
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Callable

import psutil
import yaml
from pydantic import ValidationError

from videodub.core import vram

from videodub.core.cache import StageCache, hash_inputs
from videodub.core.logger import get_logger
from videodub.core.runner import StageError, StageRunner
from videodub.schemas.segment import Transcript
from videodub.schemas.translation import Translation

logger = get_logger(__name__)

STAGES_DIR = Path(__file__).parent.parent / "stages"


@dataclass(frozen=True)
class StageSpec:
    """Definición declarativa de una etapa del pipeline."""

    name: str
    script: Path
    inputs: Callable[[Path], list[Path]]   # job_dir -> archivos de input
    outputs: Callable[[Path], list[Path]]  # job_dir -> archivos de output
    args: Callable[[Path], list[str]]      # job_dir -> argv para el script
    timeout_s: float = 1800.0
    # True: corre en el entorno del proyecto (uv run python, puede importar
    # videodub). False: script PEP 723 con entorno uv efímero propio.
    project_env: bool = False
    # VRAM libre mínima para arrancar (MiB). El orquestador espera/reintenta
    # y mata procesos GPU huérfanos del pipeline antes de rendirse.
    min_free_vram_mib: int | None = None
    # Variables de entorno extra para el subproceso de la etapa.
    extra_env: dict[str, str] | None = None


def _pipeline_stages() -> list[StageSpec]:
    return [
        StageSpec(
            name="extract_audio",
            script=STAGES_DIR / "extract_audio.py",
            inputs=lambda d: [d / "00_source.mp4"],
            outputs=lambda d: [d / "01_audio.wav"],
            args=lambda d: [
                "--input", str(d / "00_source.mp4"),
                "--output", str(d / "01_audio.wav"),
            ],
            timeout_s=300.0,
        ),
        StageSpec(
            name="separate_vocals",
            script=STAGES_DIR / "separate_vocals.py",
            inputs=lambda d: [d / "01_audio.wav"],
            outputs=lambda d: [d / "02_vocals.wav", d / "02_instrumental.wav"],
            args=lambda d: [
                "--input", str(d / "01_audio.wav"),
                "--vocals", str(d / "02_vocals.wav"),
                "--instrumental", str(d / "02_instrumental.wav"),
            ],
        ),
        StageSpec(
            name="transcribe",
            script=STAGES_DIR / "transcribe.py",
            inputs=lambda d: [d / "02_vocals.wav"],
            outputs=lambda d: [d / "03_transcript.srt", d / "03_transcript.json"],
            args=lambda d: [
                "--input", str(d / "02_vocals.wav"),
                "--srt", str(d / "03_transcript.srt"),
                "--json", str(d / "03_transcript.json"),
            ],
        ),
        StageSpec(
            name="translate",
            script=STAGES_DIR / "translate.py",
            inputs=lambda d: [d / "03_transcript.srt", d / "03_transcript.json"],
            outputs=lambda d: [d / "04_translation.srt", d / "04_translation.json"],
            args=lambda d: [
                "--input-srt", str(d / "03_transcript.srt"),
                "--input-json", str(d / "03_transcript.json"),
                "--output-srt", str(d / "04_translation.srt"),
                "--output-json", str(d / "04_translation.json"),
            ],
            timeout_s=3600.0,  # free tier de Gemini añade delays; local es lento
            project_env=True,
        ),
        StageSpec(
            name="synthesize",
            script=STAGES_DIR / "synthesize.py",
            # 00_reference.wav (voz de referencia subida) entra al hash de
            # caché solo si existe: cambiar la referencia re-sintetiza.
            inputs=lambda d: [d / "04_translation.json", d / "02_vocals.wav"]
            + ([d / "00_reference.wav"] if (d / "00_reference.wav").exists() else []),
            outputs=lambda d: [d / "05_segments" / "manifest.json"],
            args=lambda d: [
                "--translation", str(d / "04_translation.json"),
                "--vocals", str(d / "02_vocals.wav"),
                "--outdir", str(d / "05_segments"),
            ] + (
                ["--reference", str(d / "00_reference.wav")]
                if (d / "00_reference.wav").exists() else []
            ),
            timeout_s=3600.0,
            # Pico real medido del proceso: ~13.9 GiB (AR BF16 + KV + DAC
            # BF16 + activaciones de decode). Con 11 GiB el guard pasaba y
            # el OOM llegaba a mitad de carga si el escritorio retenía
            # unas centenas de MiB (Brave/Showtime).
            min_free_vram_mib=14336,
            # Evita OOM por fragmentación del allocator de PyTorch.
            extra_env={"PYTORCH_CUDA_ALLOC_CONF": "expandable_segments:True"},
        ),
        StageSpec(
            name="align_timing",
            script=STAGES_DIR / "align_timing.py",
            inputs=lambda d: [d / "05_segments" / "manifest.json", d / "04_translation.json"],
            outputs=lambda d: [d / "06_synth_aligned.wav"],
            args=lambda d: [
                "--segments-dir", str(d / "05_segments"),
                "--translation", str(d / "04_translation.json"),
                "--output", str(d / "06_synth_aligned.wav"),
            ],
            timeout_s=600.0,
        ),
        StageSpec(
            name="compose",
            script=STAGES_DIR / "compose.py",
            inputs=lambda d: [
                d / "00_source.mp4",
                d / "06_synth_aligned.wav",
                d / "02_instrumental.wav",
            ],
            outputs=lambda d: [d / "07_final.mp4"],
            args=lambda d: [
                "--video", str(d / "00_source.mp4"),
                "--voice", str(d / "06_synth_aligned.wav"),
                "--instrumental", str(d / "02_instrumental.wav"),
                "--output", str(d / "07_final.mp4"),
            ],
            timeout_s=600.0,
        ),
    ]


class Orchestrator:
    """Ejecuta el pipeline etapa por etapa con caché y verificación de VRAM."""

    def __init__(
        self,
        workspace_root: Path = Path("workspace"),
        config_path: Path = Path("config/pipeline.yaml"),
        runner: StageRunner | None = None,
        on_event: Callable[[dict], None] | None = None,
        on_review: Callable[[], None] | None = None,
        should_cancel: Callable[[], bool] | None = None,
    ):
        # on_event recibe dicts {"type": "stage_start"|"stage_done"|"stage_cached"
        # |"review_wait"|"job_done"|"error", ...} — lo usa la UI para progreso.
        self.on_event = on_event or (lambda e: None)
        # on_review: si está definido, el pipeline PAUSA tras translate (emite
        # review_wait y llama esta función bloqueante). El server la usa para
        # esperar la aprobación humana de la traducción antes de synthesize.
        self.on_review = on_review
        # should_cancel: chequeado entre etapas y entre lotes de synthesize.
        # Permite abortar un job viejo cuando el usuario lanza uno nuevo
        # (el server serializa la GPU con un lock global).
        self.should_cancel = should_cancel
        self.workspace_root = workspace_root
        self.config_path = config_path
        self.config = yaml.safe_load(config_path.read_text()) if config_path.exists() else {}
        # Las etapas son scripts PEP 723: uv crea un entorno efímero por etapa.
        self.runner = runner or StageRunner(uv_command=["uv", "run", "--script"])
        # Etapas livianas que importan videodub corren en el entorno del proyecto.
        self.project_runner = StageRunner(uv_command=["uv", "run", "python"])

    def job_id_for(self, input_video: Path) -> str:
        """ID de job determinista: hash del contenido del video."""
        h = hashlib.sha256(input_video.read_bytes()).hexdigest()[:16]
        return h

    def run(self, input_video: Path, until_stage: str | None = None) -> Path:
        """Corre el pipeline para un video. Devuelve el dir del job.

        ``until_stage`` permite cortar el pipeline (ej. "transcribe").
        """
        input_video = input_video.resolve()
        if not input_video.exists():
            raise FileNotFoundError(input_video)

        job_id = self.job_id_for(input_video)
        job_dir = self.workspace_root / job_id
        job_dir.mkdir(parents=True, exist_ok=True)
        logger.info("[bold]job %s[/bold] → %s", job_id, job_dir)

        source = job_dir / "00_source.mp4"
        if not source.exists():
            shutil.copy2(input_video, source)

        # Audio de referencia opcional para la clonación de voz (WAV ya
        # normalizado por la UI). Si está configurado, synthesize lo usa en
        # vez de extraer los primeros segundos de 02_vocals.wav.
        ref_cfg = self.config.get("tts_reference_audio")
        if ref_cfg and Path(ref_cfg).exists():
            shutil.copy2(ref_cfg, job_dir / "00_reference.wav")
            logger.info("voz de referencia: %s", ref_cfg)

        cache = StageCache(job_dir)
        stages = _pipeline_stages()
        if until_stage:
            names = [s.name for s in stages]
            if until_stage in names:
                stages = stages[: names.index(until_stage) + 1]
        self.on_event({
            "type": "job_start", "job_id": job_id,
            "stages": [s.name for s in stages],
        })

        for spec in stages:
            self._check_cancel()
            stage_config = self._config_subset(spec.name)
            input_hash = hash_inputs(spec.inputs(job_dir), stage_config)
            outputs = spec.outputs(job_dir)

            if cache.is_fresh(spec.name, input_hash, outputs):
                self.on_event({"type": "stage_cached", "stage": spec.name})
                if spec.name == "translate":
                    self._review_pause()
                if spec.name == until_stage:
                    break
                continue

            self.on_event({"type": "stage_start", "stage": spec.name})

            stage_args = spec.args(job_dir)
            if spec.name == "translate":
                stage_args += ["--config", str(self.config_path)]
            elif spec.name == "synthesize":
                if self.config.get("tts_model_dir"):
                    stage_args += ["--model-dir", str(self.config["tts_model_dir"])]
                if self.config.get("tts_half"):
                    stage_args += ["--half"]
            elif spec.name == "align_timing" and self.config.get("max_speed"):
                stage_args += ["--max-speed", str(self.config["max_speed"])]
            elif spec.name == "compose" and self.config.get("instrumental_volume"):
                stage_args += ["--instrumental-volume", str(self.config["instrumental_volume"])]
            if spec.min_free_vram_mib and vram.is_available():
                self._ensure_free_vram(spec.name, spec.min_free_vram_mib)

            runner = self.project_runner if spec.project_env else self.runner
            if spec.name == "synthesize":
                # Por lotes: el subproceso muere entre lotes y el OS recupera
                # el 100% de la VRAM (el engine de Fish tiene un leak gradual
                # ~14.4→14.9 GB a lo largo de ~100 segmentos). Los WAVs ya
                # generados se saltan, así que reanuda donde quedó.
                result = self._run_synthesize_batched(spec, stage_args, runner)
            else:
                result = runner.run(
                    spec.script, stage_args, timeout_s=spec.timeout_s,
                    extra_env=spec.extra_env,
                )
            if not result.ok:
                self.on_event({
                    "type": "error", "stage": spec.name,
                    "returncode": result.returncode,
                    "stderr_tail": result.stderr[-1500:],
                })
                raise StageError(
                    f"Etapa {spec.name} falló (rc={result.returncode}, "
                    f"timeout={result.timed_out}).\nstderr:\n{result.stderr[-3000:]}"
                )
            missing = [p for p in outputs if not p.exists()]
            if missing:
                raise StageError(f"Etapa {spec.name} no produjo: {missing}")

            if spec.name == "transcribe":
                self._validate_transcript(job_dir / "03_transcript.json")
            elif spec.name == "translate":
                self._validate_translation(job_dir / "04_translation.json")

            cache.store(spec.name, input_hash, outputs)
            logger.info("etapa %s completada: %s", spec.name, result.summary())

            if spec.name == "translate":
                if vram.is_available():
                    # El backend local debe matar su llama-server al salir; si
                    # quedó residente (~13.5 GB) lo detectamos y matamos AQUÍ,
                    # no recién en el vram-guard de synthesize.
                    self._kill_stray_gpu_processes()

            self.on_event({
                "type": "stage_done", "stage": spec.name,
                "duration_s": round(result.duration_s, 1),
                "vram_before_mib": result.vram_used_before_mib,
                "vram_after_mib": result.vram_used_after_mib,
                "summary": result.summary(),
            })

            if spec.name == "translate":
                self._review_pause()

            if spec.name == until_stage:
                break

        self.on_event({"type": "job_done", "job_id": job_id})
        return job_dir

    def _check_cancel(self) -> None:
        if self.should_cancel is not None and self.should_cancel():
            raise StageError("job cancelado: se lanzó un doblaje nuevo")

    def _review_pause(self) -> None:
        """Pausa para revisión humana de la traducción (si está habilitada).

        Bloquea hasta que el server llame resume; el usuario puede editar
        04_translation.{json,srt} mientras tanto — synthesize recalcula su
        hash al reanudar, así que los cambios invalidan su caché solos.
        """
        if self.on_review is None:
            return
        logger.info("pipeline en pausa: esperando revisión de la traducción")
        self.on_event({"type": "review_wait", "stage": "translate"})
        self.on_review()
        logger.info("traducción aprobada — reanudando pipeline")
        self.on_event({"type": "review_done", "stage": "translate"})

    def _run_synthesize_batched(self, spec, stage_args, runner):
        """Corre synthesize en lotes de subprocesos independientes.

        Cada invocación sintetiza hasta ``synthesize_batch_size`` segmentos
        pendientes y muere (VRAM a cero garantizada por el SO). Se relanza
        hasta que el stage reporta ``complete``; si un lote no avanza, falla.
        """
        batch_size = int(self.config.get("synthesize_batch_size", 25))
        prev_remaining: int | None = None

        while True:
            self._check_cancel()
            if spec.min_free_vram_mib and vram.is_available():
                self._ensure_free_vram(spec.name, spec.min_free_vram_mib)

            result = runner.run(
                spec.script,
                stage_args + ["--max-segments", str(batch_size)],
                timeout_s=spec.timeout_s,
                extra_env=spec.extra_env,
            )
            if not result.ok:
                return result

            summary = result.summary() or {}
            remaining = int(summary.get("remaining", 0))
            if summary.get("complete"):
                return result

            logger.info(
                "[synthesize] lote de %s listo, faltan %d segmentos — "
                "relanzando subproceso (VRAM limpia)",
                summary.get("batch_done"), remaining,
            )
            self.on_event({
                "type": "stage_progress", "stage": spec.name,
                "remaining": remaining,
            })
            if prev_remaining is not None and remaining >= prev_remaining:
                raise StageError(
                    f"synthesize no avanza: {remaining} segmentos pendientes "
                    "tras un lote completo. Revisar logs del stage."
                )
            prev_remaining = remaining

    # Patrones de procesos GPU que pertenecen al pipeline y pueden quedar
    # huérfanos (un stage que no murió limpio, un llama-server colgado).
    _STRAY_PATTERNS = ("llama-server", ".cache/uv/environments")

    def _ensure_free_vram(
        self,
        stage: str,
        min_free_mib: int,
        *,
        retries: int = 3,
        wait_s: float = 10.0,
    ) -> None:
        """Bloquea hasta que haya VRAM libre suficiente para la etapa.

        En cada intento mata procesos GPU huérfanos del pipeline (subprocesos
        de etapas anteriores que no murieron, llama-server colgado). Si tras
        ``retries`` reintentos no se libera, lanza StageError en vez de dejar
        que la etapa muera por OOM a mitad de carga del modelo.
        """
        for attempt in range(1, retries + 1):
            free = vram.get_vram_free()
            if free >= min_free_mib:
                if attempt > 1:
                    logger.info(
                        "[vram-guard] %s: %d MiB libres (>= %d) tras %d intento(s)",
                        stage, free, min_free_mib, attempt,
                    )
                return

            logger.warning(
                "[vram-guard] %s necesita %d MiB libres, hay %d (intento %d/%d)",
                stage, min_free_mib, free, attempt, retries,
            )
            self._kill_stray_gpu_processes()
            if attempt < retries:
                time.sleep(wait_s)

        free = vram.get_vram_free()
        if free < min_free_mib:
            self.on_event({
                "type": "error", "stage": stage,
                "message": f"VRAM insuficiente: {free} MiB libres, "
                           f"se requieren {min_free_mib} MiB",
            })
            raise StageError(
                f"Etapa {stage}: VRAM insuficiente tras {retries} reintentos "
                f"({free} MiB libres < {min_free_mib} MiB requeridos). "
                "Revisa procesos GPU con nvidia-smi."
            )

    def _kill_stray_gpu_processes(self) -> None:
        """Mata procesos GPU huérfanos que pertenecen al pipeline.

        Solo toca procesos cuyo binario coincide con los patrones del
        pipeline (llama-server, entornos uv efímeros de etapas); nunca
        procesos ajenos (escritorio, otras apps CUDA).
        """
        try:
            apps = vram.get_compute_apps()
        except vram.NvidiaSmiUnavailable:
            return
        for app in apps:
            if not any(p in app.name for p in self._STRAY_PATTERNS):
                continue
            try:
                proc = psutil.Process(app.pid)
                logger.warning(
                    "[vram-guard] matando proceso GPU huérfano del pipeline: "
                    "pid=%d %s (%d MiB)", app.pid, app.name, app.used_mib,
                )
                proc.terminate()
                try:
                    proc.wait(timeout=5)
                except psutil.TimeoutExpired:
                    proc.kill()
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue

    def _config_subset(self, stage: str) -> dict:
        """Subconjunto de config que afecta a una etapa (para el hash)."""
        keys = {
            "extract_audio": [],
            "separate_vocals": [],
            "transcribe": ["source_language"],
            "synthesize": ["tts_model_dir", "tts_half"],
            "align_timing": ["max_speed"],
            "compose": ["instrumental_volume"],
            "translate": [
                "translation_backend",
                "translation_description",
                "target_language",
                "gemini_model",
                "translation_context_window",
            ],
        }.get(stage, [])
        return {"stage": stage, **{k: self.config.get(k) for k in keys}}

    @staticmethod
    def _validate_transcript(json_path: Path) -> Transcript:
        """Valida el JSON de la etapa contra el schema pydantic."""
        try:
            transcript = Transcript.model_validate_json(json_path.read_text())
        except ValidationError as exc:
            raise StageError(f"03_transcript.json no valida contra Transcript:\n{exc}")
        logger.info(
            "transcript válido: %d segmentos, idioma=%s",
            len(transcript.segments),
            transcript.language,
        )
        return transcript

    @staticmethod
    def _validate_translation(json_path: Path) -> Translation:
        try:
            translation = Translation.model_validate_json(json_path.read_text())
        except ValidationError as exc:
            raise StageError(f"04_translation.json no valida contra Translation:\n{exc}")
        logger.info(
            "translation válida: %d segmentos, backend=%s",
            len(translation.segments),
            translation.backend_used,
        )
        return translation


__all__ = ["Orchestrator", "StageSpec"]
