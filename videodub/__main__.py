"""CLI de videodub (Diane). Milestone 1: utilidades de diagnóstico.

Los comandos del pipeline (run, ui) se agregan en milestones posteriores.
"""

from __future__ import annotations

from pathlib import Path

import typer

from videodub.core import vram
from videodub.core.logger import get_logger, setup_logging
from videodub.core.runner import StageRunner

app = typer.Typer(
    add_completion=False,
    help="Diane — pipeline local de doblaje EN→ES (subprocess-per-stage).",
)

logger = get_logger("videodub")


@app.command()
def vram_info() -> None:
    """Muestra el estado de VRAM vía nvidia-smi."""
    setup_logging()
    if not vram.is_available():
        logger.warning("nvidia-smi no disponible (¿sin GPU NVIDIA en esta máquina?)")
        raise typer.Exit(code=1)
    snap = vram.snapshot(0)
    logger.info(
        "GPU %d: usada=%d MiB | libre=%d MiB | total=%d MiB",
        snap.index,
        snap.used_mib,
        snap.free_mib,
        snap.total_mib,
    )


@app.command()
def dummy(
    gb: float = typer.Option(5.0, help="GiB a reservar en GPU"),
    sleep: float = typer.Option(3.0, help="segundos a dormir"),
) -> None:
    """Ejecuta la etapa dummy de GPU vía StageRunner (smoke test)."""
    setup_logging()
    script = Path(__file__).parent / "stages" / "_dummy_gpu.py"
    runner = StageRunner(uv_command=["uv", "run", "--script"])
    result = runner.run(script, ["--gb", str(gb), "--sleep", str(sleep)])
    if not result.ok:
        logger.error("dummy falló: %s", result.stderr)
        raise typer.Exit(code=1)
    logger.info("resumen: %s", result.summary())


@app.command()
def run(
    input: Path = typer.Option(..., "--input", help="video MP4 de entrada"),
    stage: str = typer.Option(
        "transcribe", "--stage", help="última etapa a ejecutar (extract_audio|separate_vocals|transcribe)"
    ),
    workspace: Path = typer.Option(Path("workspace"), help="raíz del workspace"),
) -> None:
    """Corre el pipeline hasta la etapa indicada (Milestone 2)."""
    setup_logging()
    from videodub.core.orchestrator import Orchestrator

    orch = Orchestrator(workspace_root=workspace)
    job_dir = orch.run(input, until_stage=stage)
    logger.info("[bold green]listo[/bold green] — outputs en %s", job_dir)


if __name__ == "__main__":
    app()
