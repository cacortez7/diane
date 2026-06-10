"""Tests de los helpers de align_timing (CPU puro, sin GPU ni entornos PEP 723).

El stage es un script PEP 723 pero no importa nada fuera de stdlib+numpy a
nivel de módulo, así que se importa directo por ruta.
"""

import importlib.util
from pathlib import Path

import numpy as np

_SPEC = importlib.util.spec_from_file_location(
    "align_timing",
    Path(__file__).parent.parent / "videodub" / "stages" / "align_timing.py",
)
align_timing = importlib.util.module_from_spec(_SPEC)
_SPEC.loader.exec_module(align_timing)

SR = 44100


def _tone(seconds: float, amp: float = 0.5) -> np.ndarray:
    t = np.arange(int(seconds * SR)) / SR
    return (amp * np.sin(2 * np.pi * 220 * t)).astype(np.float64)


def test_trim_trailing_silence_removes_tail():
    audio = np.concatenate([_tone(1.0), np.zeros(SR)])  # 1s tono + 1s ceros
    trimmed = align_timing.trim_trailing_silence(audio, SR)
    # Conserva el tono completo + margen de 150 ms, recorta el resto.
    assert len(trimmed) >= SR                     # no se come el tono
    assert len(trimmed) <= SR + int(0.16 * SR)    # cola fuera (margen 150 ms)


def test_trim_trailing_silence_keeps_loud_audio():
    audio = _tone(0.8)
    trimmed = align_timing.trim_trailing_silence(audio, SR)
    assert len(trimmed) == len(audio)  # nada que recortar (cap en len original)


def test_trim_all_silence_returns_min_keep():
    audio = np.zeros(2 * SR)
    trimmed = align_timing.trim_trailing_silence(audio, SR, min_keep_s=0.15)
    assert 0 < len(trimmed) <= int(0.15 * SR)


def test_truncate_with_fade_never_exceeds_hard_end():
    # Reproduce la lógica del ensamblado: audio que desborda hard_end se
    # trunca con fade lineal de 80 ms y no pasa del límite.
    start_s, next_start_s = 0.0, 1.0
    audio = _tone(2.0)  # desborda 1s
    hard_end_s = next_start_s - 0.03
    max_len = int((hard_end_s - start_s) * SR)
    assert max_len < len(audio)

    audio = audio[:max_len].copy()
    fade = min(int(0.080 * SR), len(audio))
    audio[-fade:] *= np.linspace(1.0, 0.0, fade)

    assert len(audio) == max_len                  # nunca excede hard_end
    assert abs(audio[-1]) < 1e-9                  # fade termina en cero
    assert np.abs(audio[-fade]) <= 0.5            # fade decrece desde la señal
