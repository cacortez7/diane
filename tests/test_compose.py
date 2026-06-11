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
def test_align_timing_places_units_with_cursor(tmp_path):
    sr = 44100
    seg_dir = tmp_path / "05_segments"
    seg_dir.mkdir()

    # unidad 1: 3.0s de audio para un slot de 2.0s, pero el hueco llega
    # hasta el start de la unidad 2 (5.0s) → cabe sin comprimirse.
    # unidad 2: 1.0s de audio para un hueco de 2.0s → tal cual.
    t1 = np.sin(2 * np.pi * 440 * np.arange(int(3.0 * sr)) / sr) * 0.5
    t2 = np.sin(2 * np.pi * 330 * np.arange(int(1.0 * sr)) / sr) * 0.5
    sf.write(str(seg_dir / "0001.wav"), t1, sr)
    sf.write(str(seg_dir / "0002.wav"), t2, sr)

    manifest = {
        "n_segments": 2, "samplerate": sr, "total_audio_s": 4.0,
        "segments": [
            {"index": 1, "file": "0001.wav", "start": 0.0, "end": 2.0,
             "text": "a.", "duration_s": 3.0, "target_duration_s": 2.0,
             "source_segments": [0]},
            {"index": 2, "file": "0002.wav", "start": 5.0, "end": 7.0,
             "text": "b.", "duration_s": 1.0, "target_duration_s": 2.0,
             "source_segments": [1]},
        ],
    }
    (seg_dir / "manifest.json").write_text(json.dumps(manifest))
    tjson = tmp_path / "04_translation.json"
    tjson.write_text("{}")  # aceptado por compat, sin uso
    out = tmp_path / "06_synth_aligned.wav"

    proc = subprocess.run(
        ["uv", "run", "--script", str(STAGES / "align_timing.py"),
         "--segments-dir", str(seg_dir), "--translation", str(tjson),
         "--output", str(out)],
        capture_output=True, text=True, timeout=300, cwd=ROOT,
    )
    assert proc.returncode == 0, proc.stderr
    summary = json.loads(proc.stdout.strip().splitlines()[-1])
    assert summary["compressed"] == 0
    assert summary["max_drift_s"] == 0.0

    audio, out_sr = sf.read(str(out))
    assert out_sr == sr
    # unidad 2 en 5.0s + 100 ms de lead-in → el timeline dura ~6.35s.
    assert 5.5 < len(audio) / sr < 7.0
    # Señal al inicio (unidad 1: 0.1-3.1s) y en t=5.2s (unidad 2);
    # silencio en el gap (3.5-4.8s).
    def rms(t0, t1):
        return float(np.sqrt(np.mean(np.square(audio[int(t0 * sr):int(t1 * sr)]))))
    assert rms(0.2, 1.0) > 0.1
    assert rms(5.2, 5.9) > 0.1
    assert rms(3.5, 4.8) < 0.01


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
