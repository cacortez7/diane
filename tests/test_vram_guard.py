"""Tests del guard de VRAM pre-etapa (fix OOM en synthesize)."""

from __future__ import annotations

import pytest

from videodub.core import vram
from videodub.core.orchestrator import Orchestrator, _pipeline_stages
from videodub.core.runner import StageError


@pytest.fixture()
def orch(tmp_path):
    return Orchestrator(workspace_root=tmp_path)


def test_passes_when_vram_free(orch, monkeypatch):
    monkeypatch.setattr(vram, "get_vram_free", lambda gpu_index=0: 15000)
    orch._ensure_free_vram("synthesize", 11264, retries=3, wait_s=0)


def test_retries_then_succeeds(orch, monkeypatch):
    values = iter([2000, 2000, 15000])
    monkeypatch.setattr(vram, "get_vram_free", lambda gpu_index=0: next(values))
    monkeypatch.setattr(vram, "get_compute_apps", lambda: [])
    orch._ensure_free_vram("synthesize", 11264, retries=3, wait_s=0)


def test_raises_after_exhausted_retries(orch, monkeypatch):
    monkeypatch.setattr(vram, "get_vram_free", lambda gpu_index=0: 1500)
    monkeypatch.setattr(vram, "get_compute_apps", lambda: [])
    events = []
    orch.on_event = events.append
    with pytest.raises(StageError, match="VRAM insuficiente"):
        orch._ensure_free_vram("synthesize", 11264, retries=3, wait_s=0)
    assert events and events[-1]["type"] == "error"


def test_kills_only_pipeline_strays(orch, monkeypatch):
    apps = [
        vram.GpuProcess(101, "/usr/bin/gnome-shell", 500),
        vram.GpuProcess(102, "/home/x/.local/bin/llama-server", 13500),
        vram.GpuProcess(103, "/home/x/.cache/uv/environments-v2/foo/bin/python3", 5000),
    ]
    monkeypatch.setattr(vram, "get_compute_apps", lambda: apps)

    killed = []

    class FakeProc:
        def __init__(self, pid):
            self.pid = pid
        def terminate(self):
            killed.append(self.pid)
        def wait(self, timeout=None):
            return 0

    import videodub.core.orchestrator as orch_mod
    monkeypatch.setattr(orch_mod.psutil, "Process", FakeProc)

    orch._kill_stray_gpu_processes()
    assert killed == [102, 103]  # nunca el 101 (proceso ajeno al pipeline)


def test_synthesize_spec_has_guard_and_alloc_conf():
    spec = next(s for s in _pipeline_stages() if s.name == "synthesize")
    # Pico real medido del proceso de synthesize: ~13.9 GiB.
    assert spec.min_free_vram_mib == 14336
    assert spec.extra_env["PYTORCH_CUDA_ALLOC_CONF"] == "expandable_segments:True"
