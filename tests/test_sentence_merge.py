"""Tests de la re-segmentación a oraciones de synthesize (CPU puro).

El stage es un script PEP 723 pero sus imports a nivel de módulo son solo
stdlib, así que se importa directo por ruta. El splitter de spaCy se
inyecta como lambda para no cargar es_core_news_lg en los tests.
"""

import importlib.util
import re
from pathlib import Path

_SPEC = importlib.util.spec_from_file_location(
    "synthesize",
    Path(__file__).parent.parent / "videodub" / "stages" / "synthesize.py",
)
synthesize = importlib.util.module_from_spec(_SPEC)
_SPEC.loader.exec_module(synthesize)


def _naive_split(text: str) -> list[str]:
    """Split trivial por puntuación final (reemplaza a spaCy en tests)."""
    return [s for s in re.split(r"(?<=[.!?…])\s+", text) if s.strip()]


def _seg(start, end, text):
    return {"start": start, "end": end, "text": text, "source_text": ""}


def test_merge_by_gap_fuses_consecutive_segments():
    segs = [
        _seg(0.0, 2.0, "Hola a todos"),       # gap 0.5s → fusiona
        _seg(2.5, 4.0, "bienvenidos."),
        _seg(6.0, 8.0, "Otro tema."),          # gap 2.0s → bloque nuevo
    ]
    units = synthesize.build_units(segs, split_sentences=_naive_split)
    assert len(units) == 2
    assert units[0]["text"] == "Hola a todos bienvenidos."
    assert units[0]["start"] == 0.0 and units[0]["end"] == 4.0
    assert units[0]["source_segments"] == [0, 1]
    assert units[1]["source_segments"] == [2]


def test_sentence_split_and_proportional_timestamps():
    # Un bloque de 0-10s con dos oraciones de 30 y 10 chars:
    # piso 1s cada una + excedente 8s repartido 75/25 → 7s y 3s.
    long_s = "a" * 29 + "."   # 30 chars
    short_s = "b" * 9 + "."   # 10 chars
    segs = [_seg(0.0, 10.0, f"{long_s} {short_s}")]
    units = synthesize.build_units(segs, split_sentences=_naive_split)
    assert len(units) == 2
    assert abs((units[0]["end"] - units[0]["start"]) - 7.0) < 0.01
    assert abs((units[1]["end"] - units[1]["start"]) - 3.0) < 0.01
    assert units[1]["end"] == 10.0  # cierra exacto contra el bloque
    assert units[0]["source_segments"] == units[1]["source_segments"] == [0]


def test_minimum_unit_duration():
    # Bloque de 1.5s con 2 oraciones: no alcanza el piso de 1s c/u →
    # partes iguales (0.75s); nunca duraciones negativas o cero.
    segs = [_seg(0.0, 1.5, "Sí. No.")]
    units = synthesize.build_units(segs, split_sentences=_naive_split)
    assert len(units) == 2
    for u in units:
        assert u["end"] - u["start"] > 0
    # Bloque holgado: toda unidad recibe al menos el piso de 1s.
    segs = [_seg(0.0, 12.0, "Sí. " + "x" * 99 + ".")]
    units = synthesize.build_units(segs, split_sentences=_naive_split)
    assert all(u["end"] - u["start"] >= 1.0 for u in units)


def test_incomplete_short_sentences_remerge_and_punctuate():
    # "Bueno" (sin puntuación, <=20 chars) se re-fusiona con la siguiente;
    # la última oración sin puntuación recibe punto.
    segs = [_seg(0.0, 6.0, "Bueno esto es importante. Veamos")]
    units = synthesize.build_units(
        segs,
        split_sentences=lambda t: ["Bueno", "esto es importante.", "Veamos"],
    )
    assert [u["text"] for u in units] == [
        "Bueno esto es importante.", "Veamos.",
    ]


def test_sync_units_state_invalidates_changed_wavs(tmp_path):
    units_v1 = [
        {"start": 0.0, "end": 2.0, "text": "Hola.", "source_segments": [0]},
        {"start": 2.0, "end": 4.0, "text": "Chau.", "source_segments": [1]},
        {"start": 4.0, "end": 6.0, "text": "Fin.", "source_segments": [2]},
    ]
    # WAVs sin units.json = job pre-rediseño: se descartan todos.
    (tmp_path / "0001.wav").write_bytes(b"x" * 2048)
    synthesize.sync_units_state(tmp_path, units_v1)
    assert not (tmp_path / "0001.wav").exists()

    # Con units.json vigente, los WAVs de unidades intactas se conservan.
    for i in range(1, 4):
        (tmp_path / f"{i:04d}.wav").write_bytes(b"x" * 2048)
    assert synthesize.sync_units_state(tmp_path, units_v1) == 0
    assert all((tmp_path / f"{i:04d}.wav").exists() for i in range(1, 4))

    # Editar la unidad 2 y eliminar la 3 → invalida 0002.wav y 0003.wav.
    units_v2 = [units_v1[0], dict(units_v1[1], text="Adiós.")]
    invalidated = synthesize.sync_units_state(tmp_path, units_v2)
    assert invalidated == 2
    assert (tmp_path / "0001.wav").exists()
    assert not (tmp_path / "0002.wav").exists()
    assert not (tmp_path / "0003.wav").exists()
