"""Orquestador del pipeline (sin GPU, sin modelos — sección 3 de CLAUDE.md).

Coordina las etapas como subprocesos aislados vía StageRunner, con caché por
hash de inputs + config. Milestone 2: extract_audio → separate_vocals →
transcribe.
"""

from __future__ import annotations

import hashlib
import json
import shutil
from dataclasses import dataclass
from pathlib import Path
from typing import Callable

import yaml
from pydantic import ValidationError

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
            inputs=lambda d: [d / "04_translation.json", d / "02_vocals.wav"],
            outputs=lambda d: [d / "05_segments" / "manifest.json"],
            args=lambda d: [
                "--translation", str(d / "04_translation.json"),
                "--vocals", str(d / "02_vocals.wav"),
                "--outdir", str(d / "05_segments"),
            ],
            timeout_s=3600.0,
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
    ):
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

        cache = StageCache(job_dir)
        stages = _pipeline_stages()

        for spec in stages:
            stage_config = self._config_subset(spec.name)
            input_hash = hash_inputs(spec.inputs(job_dir), stage_config)
            outputs = spec.outputs(job_dir)

            if cache.is_fresh(spec.name, input_hash, outputs):
                if spec.name == until_stage:
                    break
                continue

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
            runner = self.project_runner if spec.project_env else self.runner
            result = runner.run(spec.script, stage_args, timeout_s=spec.timeout_s)
            if not result.ok:
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

            if spec.name == until_stage:
                break

        return job_dir

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
