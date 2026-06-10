# /// script
# requires-python = ">=3.12,<3.13"
# dependencies = ["soundfile>=0.12", "numpy"]
# ///
"""Etapa 06: alinea temporalmente los segmentos sintetizados (CPU).

Estrategia de velocidad UNIFORME: se calcula un ratio global (duración
total del audio ES / duración total de los slots EN) y esa velocidad se
aplica a TODOS los segmentos, en vez de ajustar cada uno por separado —
elimina variaciones bruscas de ritmo entre segmentos. La velocidad
uniforme se acota a [1.0, --max-speed].

Corrección por segmento solo como excepción: el presupuesto de un
segmento llega hasta el inicio del SIGUIENTE (slot + silencio entre
subtítulos). Si con la velocidad uniforme el audio aún desborda su
presupuesto, ese segmento se acelera lo necesario (tope duro 2x) porque
solapar dos voces es peor que hablar rápido.

Si es más corto que el slot: el silencio lo aporta el timeline.

Higiene de audio:
- Al cargar cada WAV se recorta la cola de silencio/residuo de Fish
  (umbral -40 dB, margen 150 ms) ANTES de medir duraciones.
- En el ensamblado, ningún segmento pasa del inicio del siguiente
  (-30 ms): el desborde se trunca con fade-out lineal de 80 ms en vez
  de sumarse como dos voces simultáneas.

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


def trim_trailing_silence(audio, sr: int, threshold_db: float = -40.0,
                          min_keep_s: float = 0.15):
    """Recorta el silencio/cola residual al final de un WAV de Fish.

    Busca la última muestra cuyo |valor| supera el umbral y corta ahí,
    conservando ``min_keep_s`` de margen. Sin esto, las colas inflan las
    duraciones de la pasada 1 → sube la velocidad uniforme global y se
    disparan excepciones de presupuesto que no corresponden.
    """
    import numpy as np

    if len(audio) == 0:
        return audio
    threshold = 10.0 ** (threshold_db / 20.0)
    above = np.flatnonzero(np.abs(audio) > threshold)
    if len(above) == 0:
        return audio[: max(1, int(min_keep_s * sr))]
    end = min(len(audio), int(above[-1]) + 1 + int(min_keep_s * sr))
    return audio[:end]


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
    placed, stretched, capped, truncated = [], 0, 0, 0

    # Pasada 1: cargar + recortar cola de silencio UNA vez por WAV; las
    # duraciones para la velocidad uniforme deben ser las recortadas.
    trimmed, durations, slot_total, trimmed_total_s = [], [], 0.0, 0.0
    for i, seg in enumerate(segments, start=1):
        wav_path = seg_dir / f"{i:04d}.wav"
        audio, seg_sr = sf.read(str(wav_path))
        if audio.ndim > 1:
            audio = audio.mean(axis=1)
        sr = sr or seg_sr
        assert seg_sr == sr, f"samplerate inconsistente en {wav_path}"
        raw_len = len(audio)
        audio = trim_trailing_silence(audio, sr)
        trimmed_total_s += (raw_len - len(audio)) / sr
        trimmed.append(audio)
        durations.append(len(audio) / sr)
        slot_total += seg["end"] - seg["start"]
    log(f"colas de silencio recortadas: {trimmed_total_s:.1f}s en total")

    uniform = sum(durations) / slot_total if slot_total > 0 else 1.0
    uniform = min(max(uniform, 1.0), args.max_speed)
    log(f"velocidad uniforme global: {uniform:.3f}x "
        f"(audio ES {sum(durations):.1f}s / slots EN {slot_total:.1f}s, "
        f"cap {args.max_speed}x)")

    # Pasada 2: aplicar la velocidad uniforme; acelerar más SOLO si el
    # segmento aún desborda su presupuesto (hasta el inicio del siguiente).
    # Banda de excepción suavizada: entre la uniforme y este techo no hay
    # saltos bruscos de ritmo; 2x queda solo como tope absoluto.
    exception_cap = max(uniform * 1.15, args.max_speed)

    with tempfile.TemporaryDirectory() as tmp:
        for i, seg in enumerate(segments, start=1):
            audio = trimmed[i - 1]
            actual_s = durations[i - 1]

            target_s = seg["end"] - seg["start"]
            if i < len(segments):
                budget_s = segments[i]["start"] - seg["start"] - 0.05
            else:
                budget_s = target_s + 1.0
            budget_s = max(budget_s, target_s)

            speed = uniform
            if actual_s / speed > budget_s + 0.02:
                needed = actual_s / budget_s
                speed = min(needed, exception_cap, 2.0)
                if needed > speed:
                    capped += 1
                    log(f"seg {i}: requiere {needed:.2f}x > cap {speed:.2f}x "
                        "— traducción demasiado larga, el desborde se trunca "
                        "con fade en el ensamblado")

            if speed > 1.005:
                in_wav = Path(tmp) / f"in_{i:04d}.wav"
                out = Path(tmp) / f"{i:04d}.wav"
                sf.write(str(in_wav), audio, sr)
                stretch(in_wav, out, speed)
                audio, seg_sr = sf.read(str(out))
                if audio.ndim > 1:
                    audio = audio.mean(axis=1)
                assert seg_sr == sr
                stretched += 1
                if speed > uniform:
                    log(f"seg {i}: {actual_s:.2f}s → {len(audio) / sr:.2f}s "
                        f"(slot {target_s:.2f}s, presupuesto {budget_s:.2f}s, "
                        f"{speed:.2f}x > uniforme)")
            # Si es más corto, el silencio lo aporta el timeline (no se
            # rellena el WAV: el ensamblado coloca por timestamp).

            placed.append((seg["start"], audio))

    total_s = max(s + len(a) / sr for s, a in placed) + 0.25
    timeline = np.zeros(int(total_s * sr), dtype=np.float64)
    for k, (start_s, audio) in enumerate(placed):
        # Truncado duro anti-solapamiento: el audio nunca pasa del inicio
        # del siguiente segmento (-30 ms); la cola se apaga con fade-out
        # lineal de 80 ms. Dos voces sumadas es lo peor perceptualmente.
        if k + 1 < len(placed):
            hard_end_s = placed[k + 1][0] - 0.03
            max_len = int((hard_end_s - start_s) * sr)
            if 0 < max_len < len(audio):
                audio = audio[:max_len].copy()
                fade = min(int(0.080 * sr), len(audio))
                if fade > 0:
                    audio[-fade:] *= np.linspace(1.0, 0.0, fade)
                truncated += 1
                log(f"seg {k + 1}: truncado a {max_len / sr:.2f}s con fade "
                    "(desbordaba el inicio del siguiente segmento)")
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
        "uniform_speed": round(uniform, 3),
        "stretched": stretched,
        "capped": capped,
        "truncated": truncated,
        "trimmed_silence_s": round(trimmed_total_s, 2),
        "duration_s": round(total_s, 2),
        "samplerate": sr,
    }))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
