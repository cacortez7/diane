# /// script
# requires-python = ">=3.12,<3.13"
# dependencies = []
# ///
"""Etapa 01: extrae la pista de audio de un video como WAV mono 16 kHz.

Corre en CPU vía ffmpeg (subprocess, sin shell=True). Convención sección 6:
logs a stderr, JSON resumen a stdout, exit code 0 si éxito.
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path


def log(msg: str) -> None:
    print(f"[extract_audio] {msg}", file=sys.stderr, flush=True)


def main() -> int:
    parser = argparse.ArgumentParser(description="Extrae audio WAV mono 16kHz")
    parser.add_argument("--input", required=True, help="video de entrada (MP4)")
    parser.add_argument("--output", required=True, help="ruta del WAV de salida")
    args = parser.parse_args()

    ffmpeg = shutil.which("ffmpeg")
    if ffmpeg is None:
        log("ERROR: ffmpeg no encontrado en PATH (instalar con apt).")
        return 1

    inp, out = Path(args.input), Path(args.output)
    if not inp.exists():
        log(f"ERROR: input no existe: {inp}")
        return 1
    out.parent.mkdir(parents=True, exist_ok=True)

    cmd = [
        ffmpeg,
        "-y",
        "-i", str(inp),
        "-vn",                # sin video
        "-ac", "1",           # mono
        "-ar", "16000",       # 16 kHz
        "-c:a", "pcm_s16le",  # WAV PCM 16-bit
        str(out),
    ]
    log(f"ejecutando: {' '.join(cmd)}")
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        log(f"ERROR ffmpeg:\n{proc.stderr}")
        return proc.returncode

    print(json.dumps({
        "stage": "extract_audio",
        "input": str(inp),
        "output": str(out),
        "size_bytes": out.stat().st_size,
    }))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
