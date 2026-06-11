# /// script
# requires-python = ">=3.12,<3.13"
# dependencies = ["soundfile>=0.12", "numpy"]
# ///
"""Etapa 06: ensambla las unidades-oración sintetizadas (CPU).

Estrategia cursor/drift (rediseño 2026-06): el timing se adapta al audio,
no al revés. El audio se sintetizó como oraciones completas (ver
synthesize.py); aquí NUNCA se estira y se comprime lo mínimo:

1. Cada unidad se coloca en max(start_original, cursor): respeta su
   timestamp salvo que la unidad anterior aún esté sonando (drift).
2. El hueco disponible llega hasta el start ORIGINAL de la siguiente
   unidad. Si el audio cabe, va tal cual (el sobrante queda en silencio).
3. Si no cabe: rubberband comprime solo lo necesario, cap 1.2x. Si ni a
   1.2x cabe, se coloca completo y el cursor desplaza la siguiente unidad
   (drift acotado, preferible a hablar a lo loco o cortar palabras).
4. El drift se reabsorbe solo en los gaps naturales del original (paso 1).
5. Válvula de escape: si el drift acumulado supera 500 ms, el cap sube a
   1.5x hasta que el drift baje de 100 ms (protege el sync visual).
6. +100 ms de silencio de lead-in al inicio de cada unidad colocada.

Lee las unidades (start/end por oración) del manifest.json que escribe
synthesize — NO de 04_translation.json, cuyos segmentos de subtítulo ya no
se corresponden 1:1 con los WAVs.

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

LEAD_IN_S = 0.100        # silencio antes de cada unidad colocada
DRIFT_WARN_S = 0.100     # por encima: warning (y umbral para bajar la válvula)
DRIFT_RELIEF_S = 0.500   # por encima: se eleva el cap de compresión
RELIEF_CAP = 1.5         # cap de compresión con la válvula activa


def log(msg: str) -> None:
    print(f"[align_timing] {msg}", file=sys.stderr, flush=True)


def stretch(in_wav: Path, out_wav: Path, speed: float) -> None:
    """Comprime el audio ``speed``x sin cambiar el pitch."""
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


def plan_and_place(units, durations, compress, max_compression: float = 1.2):
    """Planifica la colocación de cada unidad con cursor y drift acotado.

    ``units``: [{"start": s, "end": e}, ...] (timestamps originales).
    ``durations``: duración del audio de cada unidad (s).
    ``compress(i, speed) -> float``: comprime la unidad i y devuelve su
    duración real resultante (los tests pasan una lambda; main usa
    rubberband). Devuelve (placements, summary): placements[i] =
    {"placement": s, "speed": x, "final_s": d, "drift": d_s}.
    """
    placements, cursor, cap = [], 0.0, max_compression
    compressed = max_drift = drift = 0.0
    n_compressed = 0
    for i, unit in enumerate(units):
        placement = max(unit["start"], cursor)
        next_start = units[i + 1]["start"] if i + 1 < len(units) else None

        speed, final_s = 1.0, durations[i]
        if next_start is not None:
            gap = next_start - placement
            avail = gap - LEAD_IN_S
            if durations[i] > avail:
                speed = min(durations[i] / avail, cap) if avail > 0 else cap
                speed = max(speed, 1.0)
        if speed > 1.005:
            final_s = compress(i, speed)
            n_compressed += 1
            compressed += durations[i] - final_s

        cursor = placement + LEAD_IN_S + final_s
        drift = max(0.0, cursor - next_start) if next_start is not None else 0.0
        max_drift = max(max_drift, drift)
        if drift > DRIFT_WARN_S:
            log(f"unidad {i + 1}: drift {drift * 1000:.0f} ms "
                f"(cursor {cursor:.2f}s > start original {next_start:.2f}s)")
        # Válvula de escape con histéresis: cap alto mientras no baje el drift.
        if drift > DRIFT_RELIEF_S and cap != RELIEF_CAP:
            cap = RELIEF_CAP
            log(f"unidad {i + 1}: drift > {DRIFT_RELIEF_S * 1000:.0f} ms — "
                f"cap de compresión elevado a {RELIEF_CAP}x")
        elif drift <= DRIFT_WARN_S and cap != max_compression:
            cap = max_compression
            log(f"unidad {i + 1}: drift reabsorbido — cap de vuelta a "
                f"{max_compression}x")

        placements.append({
            "placement": round(placement, 3), "speed": round(speed, 3),
            "final_s": round(final_s, 3), "drift": round(drift, 3),
        })
        log(f"unidad {i + 1}: colocada en {placement:.2f}s"
            + (f", comprimida {speed:.2f}x" if speed > 1.005 else "")
            + (f", drift {drift * 1000:.0f} ms" if drift > 0 else ""))

    summary = {
        "compressed": n_compressed,
        "max_drift_s": round(max_drift, 3),
        "final_drift_s": round(drift, 3),
    }
    return placements, summary


def main() -> int:
    parser = argparse.ArgumentParser(description="Ensamblado cursor/drift")
    parser.add_argument("--segments-dir", required=True, help="05_segments/")
    parser.add_argument("--translation", required=True,
                        help="04_translation.json (sin uso: las unidades "
                             "salen del manifest; se acepta por compat)")
    parser.add_argument("--output", required=True, help="06_synth_aligned.wav")
    parser.add_argument("--max-compression", type=float, default=1.2,
                        help="compresión máxima de rubberband (nunca estirar)")
    args = parser.parse_args()

    import numpy as np
    import soundfile as sf

    seg_dir = Path(args.segments_dir)
    manifest = json.loads((seg_dir / "manifest.json").read_text())
    units = manifest["segments"]

    sr, audios, durations = None, [], []
    for unit in units:
        audio, seg_sr = sf.read(str(seg_dir / unit["file"]))
        if audio.ndim > 1:
            audio = audio.mean(axis=1)
        sr = sr or seg_sr
        assert seg_sr == sr, f"samplerate inconsistente en {unit['file']}"
        audios.append(audio)
        durations.append(len(audio) / sr)

    final_audios = list(audios)

    with tempfile.TemporaryDirectory() as tmp:
        def compress(i: int, speed: float) -> float:
            in_wav = Path(tmp) / f"in_{i:04d}.wav"
            out_wav = Path(tmp) / f"out_{i:04d}.wav"
            sf.write(str(in_wav), audios[i], sr)
            stretch(in_wav, out_wav, speed)
            audio, out_sr = sf.read(str(out_wav))
            if audio.ndim > 1:
                audio = audio.mean(axis=1)
            assert out_sr == sr
            final_audios[i] = audio
            return len(audio) / sr

        placements, plan_summary = plan_and_place(
            units, durations, compress, max_compression=args.max_compression
        )

    total_s = max(
        p["placement"] + LEAD_IN_S + len(a) / sr
        for p, a in zip(placements, final_audios)
    ) + 0.25
    timeline = np.zeros(int(total_s * sr), dtype=np.float64)
    for p, audio in zip(placements, final_audios):
        i0 = int((p["placement"] + LEAD_IN_S) * sr)
        timeline[i0 : i0 + len(audio)] += audio
    peak = np.abs(timeline).max()
    if peak > 1.0:
        timeline /= peak

    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    sf.write(str(out), timeline, sr)
    log(f"escrito {out}: {total_s:.1f}s @ {sr}Hz | "
        f"{plan_summary['compressed']} unidades comprimidas, "
        f"drift máx {plan_summary['max_drift_s'] * 1000:.0f} ms, "
        f"drift final {plan_summary['final_drift_s'] * 1000:.0f} ms")

    print(json.dumps({
        "stage": "align_timing",
        "output": str(out),
        "n_units": len(units),
        "max_compression": args.max_compression,
        **plan_summary,
        "duration_s": round(total_s, 2),
        "samplerate": sr,
    }))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
