"""Tests del Milestone 5 (alineación temporal + composición final).

- test_align_timing: unitario con WAVs sintéticos, corre en cualquier máquina.
- test_full_pipeline_to_final_mp4: e2e completo (GPU + GEMINI_API_KEY +
  modelos descargados); produce 07_final.mp4 desde el fixture.
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
from pathlib import Path

import numpy as np
import pytest
import soundfile as sf

from videodub.core import vram

ROOT = Path(__file__).resolve().parents[1]
STAGES = ROOT / "videodub" / "stages"
FIXTURE = ROOT / "tests" / "fixtures" / "sample_10s.mp4"
TTS_MODEL = ROOT / "models" / "tts" / "fish-s2-pro" / "codec.pth"

needs_ffmpeg = pytest.mark.skipif(shutil.which("ffmpeg") is None, reason="sin ffmpeg")


@needs_ffmpeg
def test_align_timing_stretches_and_assembles(tmp_path):
    sr = 44100
    seg_dir = tmp_path / "05_segments"
    seg_dir.mkdir()

    # seg 1: 3.0s de audio para un hueco de 2.0s → debe acelerarse 1.5x,
    # pero el cap 1.25x lo limita (queda ~2.4s).
    # seg 2: 1.0s de audio para un hueco de 2.0s → se coloca tal cual.
    t1 = np.sin(2 * np.pi * 440 * np.arange(int(3.0 * sr)) / sr) * 0.5
    t2 = np.sin(2 * np.pi * 330 * np.arange(int(1.0 * sr)) / sr) * 0.5
    sf.write(str(seg_dir / "0001.wav"), t1, sr)
    sf.write(str(seg_dir / "0002.wav"), t2, sr)

    translation = {
        "source_language": "en", "target_language": "es",
        "backend_used": "gemini", "model_name": "test",
        "segments": [
            {"start": 0.0, "end": 2.0, "source_text": "a", "text": "a"},
            {"start": 5.0, "end": 7.0, "source_text": "b", "text": "b"},
        ],
    }
    tjson = tmp_path / "04_translation.json"
    tjson.write_text(json.dumps(translation))
    out = tmp_path / "06_synth_aligned.wav"

    proc = subprocess.run(
        ["uv", "run", "--script", str(STAGES / "align_timing.py"),
         "--segments-dir", str(seg_dir), "--translation", str(tjson),
         "--output", str(out)],
        capture_output=True, text=True, timeout=300, cwd=ROOT,
    )
    assert proc.returncode == 0, proc.stderr
    summary = json.loads(proc.stdout.strip().splitlines()[-1])
    assert summary["stretched"] == 1 and summary["capped"] == 1

    audio, out_sr = sf.read(str(out))
    assert out_sr == sr
    # seg 2 empieza en 5.0s → el timeline dura ~6s + cola.
    assert 5.5 < len(audio) / sr < 7.0
    # Hay señal al inicio (seg 1) y en t=5.2s (seg 2); silencio en t=4.5s.
    def rms(t0, t1):
        return float(np.sqrt(np.mean(np.square(audio[int(t0 * sr):int(t1 * sr)]))))
    assert rms(0.0, 1.0) > 0.1
    assert rms(5.1, 5.8) > 0.1
    assert rms(4.0, 4.8) < 0.01


@needs_ffmpeg
@pytest.mark.skipif(
    not vram.is_available() or "GEMINI_API_KEY" not in os.environ
    or not TTS_MODEL.exists(),
    reason="requiere GPU + GEMINI_API_KEY + modelo Fish S2 Pro",
)
def test_full_pipeline_to_final_mp4(tmp_path):
    from videodub.core.orchestrator import Orchestrator

    orch = Orchestrator(workspace_root=tmp_path / "workspace")
    job_dir = orch.run(FIXTURE, until_stage="compose")
    final = job_dir / "07_final.mp4"
    assert final.exists() and final.stat().st_size > 50_000

    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries",
         "format=duration:stream=codec_type", "-of", "json", str(final)],
        capture_output=True, text=True, check=True,
    )
    info = json.loads(probe.stdout)
    types = {s["codec_type"] for s in info["streams"]}
    assert types == {"video", "audio"}
    assert 9.0 < float(info["format"]["duration"]) < 11.5

    # El audio final no debe ser silencio.
    wav = tmp_path / "check.wav"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(final),
                    "-vn", "-ac", "1", str(wav)], check=True)
    audio, sr = sf.read(str(wav))
    assert float(np.sqrt(np.mean(np.square(audio)))) > 0.01
