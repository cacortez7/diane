"""Tests del StageRunner y del monitor de VRAM.

Dos grupos:

1. Mecánica del runner (timeout, parseo de resumen, códigos de salida): corren
   en CUALQUIER máquina usando el intérprete actual (``sys.executable``), sin
   GPU ni ``uv``.
2. Liberación real de VRAM con el dummy de GPU: requiere una GPU NVIDIA +
   ``nvidia-smi`` + ``uv``. Se SALTA automáticamente si no hay GPU.
"""

from __future__ import annotations

import sys
import textwrap
from pathlib import Path

import pytest

from videodub.core import vram
from videodub.core.runner import StageResult, StageRunner

REPO_ROOT = Path(__file__).resolve().parents[1]
DUMMY = REPO_ROOT / "videodub" / "stages" / "_dummy_gpu.py"


# --------------------------------------------------------------------------- #
# Grupo 1: mecánica del runner (sin GPU)
# --------------------------------------------------------------------------- #
def _local_runner() -> StageRunner:
    """Runner que ejecuta con el intérprete actual; sin uv ni VRAM."""
    return StageRunner(uv_command=[sys.executable], check_vram=False)


def test_stage_result_summary_parses_last_json_line():
    res = StageResult(
        script="x.py",
        args=[],
        returncode=0,
        stdout="log ruido\n{\"stage\": \"x\", \"n\": 3}\n",
        stderr="",
        duration_s=0.1,
    )
    assert res.ok
    assert res.summary() == {"stage": "x", "n": 3}


def test_stage_result_summary_none_when_no_json():
    res = StageResult("x.py", [], 0, "no hay json aqui", "", 0.1)
    assert res.summary() is None


def test_runner_runs_script_and_captures_summary(tmp_path: Path):
    script = tmp_path / "ok.py"
    script.write_text(
        textwrap.dedent(
            """
            import json, sys
            print("esto va a stderr", file=sys.stderr)
            print(json.dumps({"stage": "ok", "value": 42}))
            """
        )
    )
    result = _local_runner().run(script, timeout_s=30)
    assert result.ok
    assert result.returncode == 0
    assert result.summary() == {"stage": "ok", "value": 42}
    # check_vram=False ⇒ no se midió VRAM.
    assert result.vram_used_before_mib is None


def test_runner_nonzero_exit_marks_not_ok(tmp_path: Path):
    script = tmp_path / "boom.py"
    script.write_text("import sys; sys.exit(7)")
    result = _local_runner().run(script, timeout_s=30)
    assert not result.ok
    assert result.returncode == 7


def test_runner_timeout_kills_process_tree(tmp_path: Path):
    script = tmp_path / "slow.py"
    script.write_text("import time; time.sleep(60)")
    result = _local_runner().run(script, timeout_s=2)
    assert result.timed_out
    assert not result.ok


# --------------------------------------------------------------------------- #
# Grupo 2: liberación real de VRAM (requiere GPU NVIDIA + uv)
# --------------------------------------------------------------------------- #
requires_gpu = pytest.mark.skipif(
    not vram.is_available(),
    reason="requiere GPU NVIDIA con nvidia-smi (hardware objetivo: RTX 4070 Ti SUPER)",
)


@requires_gpu
def test_dummy_releases_vram_across_three_runs():
    """Ejecuta el dummy 3 veces; la VRAM debe volver al baseline cada vez.

    Margen <500 MiB respecto al baseline previo a cada corrida, confirmando
    que el SO recupera la VRAM al morir cada subproceso.
    """
    runner = StageRunner(
        uv_command=["uv", "run", "--script"],
        check_vram=True,
        vram_tolerance_mib=500,
        vram_release_timeout_s=60,
    )

    for i in range(3):
        baseline = vram.get_vram_used()
        result = runner.run(DUMMY, ["--gb", "5", "--sleep", "3"], timeout_s=300)

        assert result.ok, f"corrida {i} falló: {result.stderr}"
        summary = result.summary()
        assert summary is not None and summary.get("gpu") is True

        # Tras morir el subproceso, la VRAM usada vuelve cerca del baseline.
        used_after = vram.get_vram_used()
        assert used_after - baseline < 500, (
            f"corrida {i}: VRAM no liberada "
            f"(baseline={baseline} MiB, después={used_after} MiB)"
        )
