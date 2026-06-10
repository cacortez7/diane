# /// script
# requires-python = ">=3.12,<3.13"
# dependencies = ["soundfile>=0.12", "numpy"]
# ///
"""Etapa 06: alinea temporalmente los segmentos sintetizados (CPU).

Para cada WAV de ``05_segments/``:
- El presupuesto de un segmento es hasta el inicio del SIGUIENTE segmento
  (slot del subtítulo + silencio entre subtítulos), no solo su slot.
- Si el español excede el presupuesto: acelera con rubberband (sin cambiar
  pitch). ``--max-speed`` (default 1.15x) es el umbral de naturalidad; si
  hace falta más, se excede (tope duro 2x) porque solapar dos voces es
  peor que hablar rápido.
- Si es más corto: se rellena con silencio al final.

Luego ensambla todos los segmentos en ``06_synth_aligned.wav`` colocando
cada uno en su timestamp original.

Time-stretch: usa el binario ``rubberband`` (apt: rubberband-cli) si está
en PATH; si no, cae al filtro ``rubberband`` del ffmpeg estático (misma
librería, mismo resultado).
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


def log(msg: str) -> None:
    print(f"[align_timing] {msg}", file=sys.stderr, flush=True)


def stretch(in_wav: Path, out_wav: Path, speed: float) -> None:
    """Acelera el audio ``speed``x sin cambiar el pitch."""
    rb = shutil.which("rubberband")
    if rb:
        # --tempo N = factor de velocidad (2.0 = doble de rápido)
        cmd = [rb, "--tempo", f"{speed:.4f}", str(in_wav), str(out_wav)]
    else:
        cmd = [
            shutil.which("ffmpeg"), "-y", "-v", "error", "-i", str(in_wav),
            "-af", f"rubberband=tempo={speed:.4f}", str(out_wav),
        ]
    subprocess.run(cmd, check=True, capture_output=True, text=True)


def main() -> int:
    parser = argparse.ArgumentParser(description="Alineación temporal con rubberband")
    parser.add_argument("--segments-dir", required=True, help="05_segments/")
    parser.add_argument("--translation", required=True, help="04_translation.json")
    parser.add_argument("--output", required=True, help="06_synth_aligned.wav")
    parser.add_argument("--max-speed", type=float, default=1.15,
                        help="aceleración máxima antes de sonar poco natural")
    args = parser.parse_args()

    import numpy as np
    import soundfile as sf

    translation = json.loads(Path(args.translation).read_text())
    segments = translation["segments"]
    seg_dir = Path(args.segments_dir)

    sr = None
    placed, stretched, capped = [], 0, 0

    with tempfile.TemporaryDirectory() as tmp:
        for i, seg in enumerate(segments, start=1):
            wav_path = seg_dir / f"{i:04d}.wav"
            audio, seg_sr = sf.read(str(wav_path))
            if audio.ndim > 1:
                audio = audio.mean(axis=1)
            sr = sr or seg_sr
            assert seg_sr == sr, f"samplerate inconsistente en {wav_path}"

            target_s = seg["end"] - seg["start"]
            # Presupuesto real: hasta el inicio del siguiente segmento (el
            # silencio entre subtítulos también es utilizable). El último
            # segmento puede extenderse un poco más allá de su slot.
            if i < len(segments):
                budget_s = segments[i]["start"] - seg["start"] - 0.05
            else:
                budget_s = target_s + 1.0
            budget_s = max(budget_s, target_s)
            actual_s = len(audio) / sr

            if actual_s > budget_s + 0.02:
                speed = actual_s / budget_s
                if speed > args.max_speed:
                    capped += 1
                    # Exceder el cap es preferible a solapar dos voces: se
                    # acelera lo necesario para caber antes del siguiente
                    # segmento (con tope duro de 2x).
                    log(f"seg {i}: requiere {speed:.2f}x > cap {args.max_speed}x "
                        "— traducción demasiado larga, se excede el cap para "
                        "no solapar el siguiente segmento")
                    speed = min(speed, 2.0)
                out = Path(tmp) / f"{i:04d}.wav"
                stretch(wav_path, out, speed)
                audio, _ = sf.read(str(out))
                if audio.ndim > 1:
                    audio = audio.mean(axis=1)
                stretched += 1
                log(f"seg {i}: {actual_s:.2f}s → {len(audio) / sr:.2f}s "
                    f"(slot {target_s:.2f}s, presupuesto {budget_s:.2f}s, {speed:.2f}x)")
            elif actual_s > target_s + 0.02:
                # Cabe en el presupuesto gracias al hueco — no se acelera.
                log(f"seg {i}: {actual_s:.2f}s excede el slot ({target_s:.2f}s) "
                    f"pero cabe en el hueco hasta el siguiente segmento")
            # Si es más corto, el silencio lo aporta el timeline (no se
            # rellena el WAV: el ensamblado coloca por timestamp).

            placed.append((seg["start"], audio))

    total_s = max(s + len(a) / sr for s, a in placed) + 0.25
    timeline = np.zeros(int(total_s * sr), dtype=np.float64)
    for start_s, audio in placed:
        i0 = int(start_s * sr)
        timeline[i0 : i0 + len(audio)] += audio
    peak = np.abs(timeline).max()
    if peak > 1.0:  # evitar clipping si hubo solapamientos
        timeline /= peak

    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    sf.write(str(out), timeline, sr)
    log(f"escrito {out}: {total_s:.1f}s @ {sr}Hz")

    print(json.dumps({
        "stage": "align_timing",
        "output": str(out),
        "n_segments": len(placed),
        "stretched": stretched,
        "capped": capped,
        "duration_s": round(total_s, 2),
        "samplerate": sr,
    }))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
