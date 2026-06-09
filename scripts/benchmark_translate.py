"""Compara los dos backends de traducción sobre el mismo SRT.

Uso (desde la raíz del repo, requiere un 03_transcript.{srt,json} previo):

    uv run python scripts/benchmark_translate.py \
        --input-srt workspace/<job>/03_transcript.srt \
        --input-json workspace/<job>/03_transcript.json

Escribe los resultados en benchmark_results/{gemini,local}/ para comparación
manual. Cada backend corre como subproceso de la etapa translate.py.
"""

from __future__ import annotations

import argparse
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STAGE = ROOT / "videodub" / "stages" / "translate.py"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-srt", required=True)
    parser.add_argument("--input-json", required=True)
    parser.add_argument("--config", default=str(ROOT / "config" / "pipeline.yaml"))
    parser.add_argument("--outdir", default=str(ROOT / "benchmark_results"))
    args = parser.parse_args()

    for backend in ("gemini", "local"):
        outdir = Path(args.outdir) / backend
        outdir.mkdir(parents=True, exist_ok=True)
        cmd = [
            "uv", "run", "python", str(STAGE),
            "--input-srt", args.input_srt,
            "--input-json", args.input_json,
            "--output-srt", str(outdir / "translation.srt"),
            "--output-json", str(outdir / "translation.json"),
            "--config", args.config,
            "--backend", backend,
        ]
        print(f"\n=== backend: {backend} ===", file=sys.stderr)
        start = time.monotonic()
        proc = subprocess.run(cmd)
        elapsed = time.monotonic() - start
        status = "OK" if proc.returncode == 0 else f"FALLÓ (rc={proc.returncode})"
        print(f"=== {backend}: {status} en {elapsed:.1f}s ===", file=sys.stderr)

    print(f"\nResultados en {args.outdir}/ — comparar manualmente.", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
