"""Monitor de VRAM vía ``nvidia-smi`` (subprocess).

IMPORTANTE (sección 3 + anti-patterns de CLAUDE.md): este módulo se importa
desde el orquestador, que NUNCA debe crear un contexto CUDA. Por eso
consultamos la VRAM lanzando ``nvidia-smi`` como subprocess y parseando su
salida CSV, en lugar de usar ``nvidia-ml-py`` (NVML mantiene estado/contexto
en el proceso). Cada consulta es un proceso efímero que muere de inmediato.
"""

from __future__ import annotations

import shutil
import subprocess
import time
from dataclasses import dataclass

from videodub.core.logger import get_logger

logger = get_logger(__name__)


class NvidiaSmiUnavailable(RuntimeError):
    """nvidia-smi no está instalado o no se puede ejecutar."""


@dataclass(frozen=True)
class VramSnapshot:
    """Estado de memoria de una GPU, en MiB."""

    index: int
    used_mib: int
    free_mib: int
    total_mib: int


def _nvidia_smi_path() -> str:
    path = shutil.which("nvidia-smi")
    if path is None:
        raise NvidiaSmiUnavailable(
            "nvidia-smi no encontrado en PATH. ¿Driver NVIDIA instalado?"
        )
    return path


def _query(fields: str) -> list[list[str]]:
    """Ejecuta nvidia-smi --query-gpu y devuelve filas de campos."""
    cmd = [
        _nvidia_smi_path(),
        f"--query-gpu={fields}",
        "--format=csv,noheader,nounits",
    ]
    try:
        out = subprocess.run(
            cmd,
            check=True,
            capture_output=True,
            text=True,
            timeout=15,
        ).stdout
    except subprocess.CalledProcessError as exc:  # pragma: no cover - hw dependiente
        raise NvidiaSmiUnavailable(f"nvidia-smi falló: {exc.stderr}") from exc
    except subprocess.TimeoutExpired as exc:  # pragma: no cover - hw dependiente
        raise NvidiaSmiUnavailable("nvidia-smi excedió el timeout") from exc

    rows: list[list[str]] = []
    for line in out.strip().splitlines():
        if not line.strip():
            continue
        rows.append([c.strip() for c in line.split(",")])
    return rows


def snapshot(gpu_index: int = 0) -> VramSnapshot:
    """Snapshot de memoria de una GPU específica."""
    rows = _query("memory.used,memory.free,memory.total")
    if gpu_index >= len(rows):
        raise NvidiaSmiUnavailable(
            f"GPU index {gpu_index} fuera de rango ({len(rows)} GPU(s) detectada(s))"
        )
    used, free, total = (int(v) for v in rows[gpu_index])
    return VramSnapshot(index=gpu_index, used_mib=used, free_mib=free, total_mib=total)


def get_vram_used(gpu_index: int = 0) -> int:
    """VRAM usada en MiB."""
    return snapshot(gpu_index).used_mib


def get_vram_free(gpu_index: int = 0) -> int:
    """VRAM libre en MiB."""
    return snapshot(gpu_index).free_mib


def is_available() -> bool:
    """True si nvidia-smi se puede consultar (hay GPU NVIDIA usable)."""
    try:
        snapshot(0)
        return True
    except NvidiaSmiUnavailable:
        return False


@dataclass(frozen=True)
class GpuProcess:
    """Un proceso de cómputo activo en la GPU."""

    pid: int
    name: str
    used_mib: int


def get_compute_apps() -> list[GpuProcess]:
    """Procesos de cómputo en GPU vía nvidia-smi --query-compute-apps."""
    cmd = [
        _nvidia_smi_path(),
        "--query-compute-apps=pid,process_name,used_memory",
        "--format=csv,noheader,nounits",
    ]
    try:
        out = subprocess.run(
            cmd, check=True, capture_output=True, text=True, timeout=15
        ).stdout
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired) as exc:
        raise NvidiaSmiUnavailable(f"nvidia-smi falló: {exc}") from exc

    procs: list[GpuProcess] = []
    for line in out.strip().splitlines():
        if not line.strip():
            continue
        # process_name puede contener comas en teoría; pid y memoria no.
        pid_s, rest = line.split(",", 1)
        name, used_s = rest.rsplit(",", 1)
        try:
            procs.append(GpuProcess(int(pid_s), name.strip(), int(used_s)))
        except ValueError:
            continue
    return procs


def wait_for_vram_release(
    baseline_used_mib: int,
    *,
    gpu_index: int = 0,
    tolerance_mib: int = 500,
    timeout_s: float = 60.0,
    poll_interval_s: float = 0.5,
) -> int:
    """Bloquea hasta que la VRAM usada vuelva cerca del baseline.

    Tras matar un subproceso de GPU el SO recupera la VRAM, pero puede tardar
    unos ms/segundos. Esta función espera (polling) hasta que
    ``used <= baseline_used_mib + tolerance_mib`` o se agote ``timeout_s``.

    Devuelve la VRAM usada final (MiB). Loguea una advertencia si no se
    liberó dentro de la tolerancia al expirar el timeout.
    """
    deadline = time.monotonic() + timeout_s
    used = get_vram_used(gpu_index)
    target = baseline_used_mib + tolerance_mib

    while used > target and time.monotonic() < deadline:
        time.sleep(poll_interval_s)
        used = get_vram_used(gpu_index)

    if used > target:
        logger.warning(
            "VRAM no volvió al baseline: usada=%d MiB, objetivo<=%d MiB "
            "(baseline=%d + tolerancia=%d) tras %.1fs",
            used,
            target,
            baseline_used_mib,
            tolerance_mib,
            timeout_s,
        )
    else:
        logger.debug(
            "VRAM liberada: usada=%d MiB (<=%d MiB objetivo)", used, target
        )
    return used


__all__ = [
    "NvidiaSmiUnavailable",
    "VramSnapshot",
    "GpuProcess",
    "get_compute_apps",
    "snapshot",
    "get_vram_used",
    "get_vram_free",
    "is_available",
    "wait_for_vram_release",
]
