"""Tests del Milestone 3 (traducción dual backend).

- El test de Gemini requiere GEMINI_API_KEY en el entorno (skip si falta).
- El test local requiere llama-server en PATH + modelo GGUF descargado
  (skip si falta cualquiera de los dos).
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
from pathlib import Path

import pytest

from videodub.schemas.segment import Segment, Transcript
from videodub.schemas.translation import Translation

ROOT = Path(__file__).resolve().parents[1]
STAGE = ROOT / "videodub" / "stages" / "translate.py"
GGUF_DIR = ROOT / "models" / "llm"

SAMPLE = Transcript(
    language="en",
    segments=[
        Segment(start=0.0, end=2.0, text="Hello and welcome to the channel."),
        Segment(start=2.5, end=5.0, text="Today we look at seventeen new AI tools."),
        Segment(start=5.5, end=8.0, text="Apple released a new model at Stanford."),
    ],
)


@pytest.fixture()
def sample_files(tmp_path: Path) -> dict[str, Path]:
    srt = tmp_path / "03_transcript.srt"
    js = tmp_path / "03_transcript.json"
    srt.write_text(SAMPLE.to_srt())
    js.write_text(SAMPLE.model_dump_json())
    return {"srt": srt, "json": js, "dir": tmp_path}


def _run_stage(files: dict[str, Path], backend: str) -> Translation:
    out_srt = files["dir"] / "04_translation.srt"
    out_json = files["dir"] / "04_translation.json"
    proc = subprocess.run(
        [
            "uv", "run", "python", str(STAGE),
            "--input-srt", str(files["srt"]),
            "--input-json", str(files["json"]),
            "--output-srt", str(out_srt),
            "--output-json", str(out_json),
            "--config", str(ROOT / "config" / "pipeline.yaml"),
            "--backend", backend,
        ],
        capture_output=True,
        text=True,
        timeout=1800,
        cwd=ROOT,
    )
    assert proc.returncode == 0, proc.stderr
    summary = json.loads(proc.stdout.strip().splitlines()[-1])
    assert summary["stage"] == "translate"
    assert summary["backend"] == backend
    assert out_srt.exists()
    return Translation.model_validate_json(out_json.read_text())


def _check_translation(translation: Translation, backend: str) -> None:
    assert translation.backend_used == backend
    assert len(translation.segments) == len(SAMPLE.segments)
    for orig, seg in zip(SAMPLE.segments, translation.segments):
        assert seg.start == orig.start and seg.end == orig.end
        assert seg.source_text == orig.text
        assert seg.text.strip()
    # Heurística mínima de que sí está en español.
    full = " ".join(s.text.lower() for s in translation.segments)
    assert any(w in full for w in ("hola", "bienvenid", "canal", "nuevo", "hoy"))


def test_translation_schema_srt_roundtrip():
    t = Translation(
        source_language="en",
        target_language="es",
        backend_used="gemini",
        segments=[],
    )
    assert t.to_srt() == ""


@pytest.mark.skipif("GEMINI_API_KEY" not in os.environ, reason="sin GEMINI_API_KEY")
def test_translate_gemini_backend(sample_files):
    _check_translation(_run_stage(sample_files, "gemini"), "gemini")


@pytest.mark.skipif(
    shutil.which("llama-server") is None or not list(GGUF_DIR.glob("*.gguf"))
    if GGUF_DIR.exists()
    else True,
    reason="sin llama-server o sin modelo GGUF descargado",
)
def test_translate_local_backend(sample_files):
    _check_translation(_run_stage(sample_files, "local"), "local")
