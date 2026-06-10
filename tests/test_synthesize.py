"""Tests del Milestone 4 (síntesis con Fish S2 Pro).

Requieren GPU + modelo descargado en models/tts/fish-s2-pro/ (repo gated:
aceptar la Fish Audio Research License). Skip automático si faltan.
"""

from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path

import numpy as np
import pytest

from videodub.core import vram

ROOT = Path(__file__).resolve().parents[1]
STAGE = ROOT / "videodub" / "stages" / "synthesize.py"
MODEL_DIR = ROOT / "models" / "tts" / "fish-s2-pro"
FIXTURE = ROOT / "tests" / "fixtures" / "sample_10s.mp4"

TRANSLATION = {
    "source_language": "en",
    "target_language": "es",
    "backend_used": "gemini",
    "model_name": "test",
    "segments": [
        {"start": 0.0, "end": 2.0,
         "source_text": "Hello and welcome to the channel.",
         "text": "Hola y bienvenidos al canal."},
        {"start": 2.5, "end": 5.0,
         "source_text": "Today we are testing the pipeline.",
         "text": "Hoy estamos probando el pipeline."},
        {"start": 5.5, "end": 8.0,
         "source_text": "Thanks for watching this video.",
         "text": "Gracias por ver este video."},
    ],
}


@pytest.mark.skipif(
    not vram.is_available() or not (MODEL_DIR / "codec.pth").exists(),
    reason="sin GPU o sin modelo Fish S2 Pro descargado",
)
def test_synthesize_segments(tmp_path):
    # Voz de referencia: el audio del fixture (extraído con ffmpeg).
    vocals = tmp_path / "vocals.wav"
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-i", str(FIXTURE),
         "-vn", "-ac", "1", "-ar", "44100", str(vocals)],
        check=True,
    )
    translation_json = tmp_path / "04_translation.json"
    translation_json.write_text(json.dumps(TRANSLATION))
    outdir = tmp_path / "05_segments"

    proc = subprocess.run(
        ["uv", "run", "--script", str(STAGE),
         "--translation", str(translation_json),
         "--vocals", str(vocals),
         "--outdir", str(outdir),
         "--model-dir", str(MODEL_DIR)],
        capture_output=True, text=True, timeout=1800, cwd=ROOT,
    )
    assert proc.returncode == 0, proc.stderr[-3000:]

    summary = json.loads(proc.stdout.strip().splitlines()[-1])
    assert summary["batch_done"] == 3
    assert summary["complete"] is True and summary["remaining"] == 0

    manifest = json.loads((outdir / "manifest.json").read_text())
    assert manifest["n_segments"] == 3

    import soundfile as sf

    for entry in manifest["segments"]:
        audio, sr = sf.read(str(outdir / entry["file"]))
        duration = len(audio) / sr
        assert duration > 0.3, f"{entry['file']} demasiado corto ({duration:.2f}s)"
        rms = float(np.sqrt(np.mean(np.square(audio))))
        assert rms > 0.005, f"{entry['file']} parece silencio (rms={rms:.4f})"
