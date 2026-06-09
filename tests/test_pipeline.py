"""Tests del pipeline de audio (Milestone 2).

Los tests de GPU (demucs/whisperx) descargan modelos y entornos pesados la
primera vez; se saltan si no hay GPU NVIDIA disponible.
"""

from __future__ import annotations

import re
import shutil
import time
from pathlib import Path

import pytest

from videodub.core import vram
from videodub.core.orchestrator import Orchestrator
from videodub.core.runner import StageRunner
from videodub.schemas.segment import Segment, Transcript

FIXTURE = Path(__file__).parent / "fixtures" / "sample_10s.mp4"
STAGES = Path(__file__).parent.parent / "videodub" / "stages"

needs_gpu = pytest.mark.skipif(not vram.is_available(), reason="sin GPU NVIDIA")
needs_ffmpeg = pytest.mark.skipif(shutil.which("ffmpeg") is None, reason="sin ffmpeg")


def test_transcript_schema_and_srt():
    t = Transcript(
        language="en",
        segments=[Segment(start=0.0, end=1.5, text="Hello world", confidence=0.9)],
    )
    srt = t.to_srt()
    assert "00:00:00,000 --> 00:00:01,500" in srt
    assert "Hello world" in srt


@needs_ffmpeg
def test_extract_audio_stage(tmp_path):
    runner = StageRunner(uv_command=["uv", "run", "--script"], check_vram=False)
    out = tmp_path / "01_audio.wav"
    result = runner.run(
        STAGES / "extract_audio.py",
        ["--input", str(FIXTURE), "--output", str(out)],
        timeout_s=120,
    )
    assert result.ok, result.stderr
    assert out.exists() and out.stat().st_size > 100_000  # ~10s de 16kHz mono
    assert result.summary()["stage"] == "extract_audio"


@needs_ffmpeg
@needs_gpu
def test_pipeline_end_to_end_and_cache(tmp_path):
    """Corre extract → demucs → whisperx y verifica SRT + caché."""
    orch = Orchestrator(workspace_root=tmp_path / "workspace")
    job_dir = orch.run(FIXTURE, until_stage="transcribe")

    srt = (job_dir / "03_transcript.srt").read_text()
    assert re.search(r"\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}", srt)
    transcript = Transcript.model_validate_json(
        (job_dir / "03_transcript.json").read_text()
    )
    assert transcript.segments, "transcripción vacía"
    text = " ".join(s.text for s in transcript.segments).lower()
    assert "welcome" in text or "channel" in text or "video" in text

    # Segunda corrida: todo debe salir del caché (rápido, sin re-correr GPU).
    start = time.monotonic()
    orch.run(FIXTURE, until_stage="transcribe")
    elapsed = time.monotonic() - start
    assert elapsed < 10, f"el caché no evitó re-ejecutar etapas ({elapsed:.1f}s)"
