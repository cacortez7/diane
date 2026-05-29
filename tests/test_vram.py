"""Tests del monitor de VRAM que no requieren GPU."""

from __future__ import annotations

import pytest

from videodub.core import vram


def test_is_available_returns_bool():
    assert isinstance(vram.is_available(), bool)


def test_snapshot_raises_when_unavailable():
    """Sin GPU NVIDIA, las consultas deben fallar de forma explícita."""
    if vram.is_available():
        pytest.skip("hay GPU disponible; este caso valida la ausencia")
    with pytest.raises(vram.NvidiaSmiUnavailable):
        vram.snapshot(0)
