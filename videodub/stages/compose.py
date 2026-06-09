# /// script
# requires-python = ">=3.12,<3.13"
# dependencies = []
# ///
"""Etapa 07: compone el video final con el audio doblado (CPU, ffmpeg).

Mezcla: voz sintetizada al 100% + instrumental de Demucs al 70%, y
reemplaza la pista de audio del video original SIN re-encodear el video
(``-c:v copy``). Output: ``07_final.mp4``.
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path


def log(msg: str) -> None:
    print(f"[compose] {msg}", file=sys.stderr, flush=True)


def main() -> int:
    parser = argparse.ArgumentParser(description="Composición final con ffmpeg")
    parser.add_argument("--video", required=True, help="00_source.mp4")
    parser.add_argument("--voice", required=True, help="06_synth_aligned.wav")
    parser.add_argument("--instrumental", required=True, help="02_instrumental.wav")
    parser.add_argument("--output", required=True, help="07_final.mp4")
    parser.add_argument("--instrumental-volume", type=float, default=0.7)
    args = parser.parse_args()

    ffmpeg = shutil.which("ffmpeg")
    if ffmpeg is None:
        log("ERROR: ffmpeg no encontrado en PATH")
        return 1

    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)

    # normalize=0 en amix: conserva los volúmenes indicados en vez de
    # atenuar cada input a 1/N.
    # duration=longest: la voz suele terminar antes que el video; el
    # instrumental (que dura lo mismo que el original) completa la pista.
    filter_complex = (
        f"[2:a]volume={args.instrumental_volume}[bg];"
        "[1:a][bg]amix=inputs=2:duration=longest:normalize=0[a]"
    )
    cmd = [
        ffmpeg, "-y", "-v", "error",
        "-i", args.video,
        "-i", args.voice,
        "-i", args.instrumental,
        "-filter_complex", filter_complex,
        "-map", "0:v", "-map", "[a]",
        "-c:v", "copy",          # no re-encodear video
        "-c:a", "aac", "-b:a", "192k",
        "-shortest",
        str(out),
    ]
    log(f"ejecutando: {' '.join(cmd)}")
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        log(f"ERROR ffmpeg:\n{proc.stderr}")
        return proc.returncode

    print(json.dumps({
        "stage": "compose",
        "output": str(out),
        "size_bytes": out.stat().st_size,
        "instrumental_volume": args.instrumental_volume,
    }))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
