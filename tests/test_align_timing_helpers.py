"""Tests de la lógica cursor/drift de align_timing (CPU puro, sin GPU).

El stage es un script PEP 723 pero sus imports a nivel de módulo son solo
stdlib, así que se importa directo por ruta. ``plan_and_place`` recibe el
compresor como callable: aquí una lambda exacta (duración/velocidad) en
vez de rubberband.
"""

import importlib.util
from pathlib import Path

_SPEC = importlib.util.spec_from_file_location(
    "align_timing",
    Path(__file__).parent.parent / "videodub" / "stages" / "align_timing.py",
)
align_timing = importlib.util.module_from_spec(_SPEC)
_SPEC.loader.exec_module(align_timing)

LEAD = align_timing.LEAD_IN_S


def _plan(units, durations, max_compression=1.2):
    return align_timing.plan_and_place(
        units, durations,
        compress=lambda i, speed: durations[i] / speed,
        max_compression=max_compression,
    )


def test_audio_that_fits_is_never_stretched_or_compressed():
    units = [{"start": 0.0, "end": 2.0}, {"start": 5.0, "end": 7.0}]
    placements, summary = _plan(units, [3.0, 1.0])  # 3s > slot pero < hueco
    assert [p["speed"] for p in placements] == [1.0, 1.0]
    assert placements[0]["placement"] == 0.0
    assert placements[1]["placement"] == 5.0
    assert summary["compressed"] == 0 and summary["max_drift_s"] == 0.0


def test_compression_only_what_is_needed_capped():
    # Hueco 0→3s (avail 2.9 con lead-in); audio 3.2s → comprime 3.2/2.9≈1.10x.
    units = [{"start": 0.0, "end": 2.0}, {"start": 3.0, "end": 5.0}]
    placements, summary = _plan(units, [3.2, 1.0])
    assert abs(placements[0]["speed"] - 3.2 / 2.9) < 0.01
    assert summary["compressed"] == 1 and summary["max_drift_s"] == 0.0
    # Audio 5s no cabe ni a 1.2x → cap y drift desplaza la siguiente.
    placements, summary = _plan(units, [5.0, 1.0])
    assert placements[0]["speed"] == 1.2
    cursor = 0.0 + LEAD + 5.0 / 1.2
    assert abs(placements[0]["drift"] - (cursor - 3.0)) < 0.01
    assert placements[1]["placement"] > 3.0  # desplazada por el cursor


def test_drift_valve_raises_cap_and_reabsorbs_in_gaps():
    # Unidad 1 genera drift > 500 ms → la 2 puede comprimirse hasta 1.5x;
    # el gap grande antes de la 3 reabsorbe el drift.
    units = [
        {"start": 0.0, "end": 2.0},
        {"start": 2.0, "end": 4.0},
        {"start": 4.0, "end": 6.0},
        {"start": 20.0, "end": 22.0},
    ]
    placements, summary = _plan(units, [3.5, 2.6, 1.0, 1.0])
    assert placements[0]["drift"] > 0.5          # válvula activada
    assert 1.2 < placements[1]["speed"] <= 1.5   # cap elevado a 1.5x
    assert placements[3]["placement"] == 20.0    # drift reabsorbido en el gap
    assert summary["final_drift_s"] == 0.0
    assert summary["max_drift_s"] > 0.5


def test_last_unit_never_compressed():
    units = [{"start": 0.0, "end": 1.0}]
    placements, summary = _plan(units, [30.0])
    assert placements[0]["speed"] == 1.0
    assert summary["compressed"] == 0
