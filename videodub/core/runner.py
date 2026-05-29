"""StageRunner: lanza cada etapa como subproceso aislado y verifica VRAM.

Encarna el principio subprocess-per-stage (sección 3 de CLAUDE.md). Cada
etapa se ejecuta vía ``uv run python <script>``, escribe sus outputs a disco,
imprime un JSON resumen en stdout y muere. Al morir, el SO recupera el 100%
de la VRAM; este runner mide la VRAM antes/después y espera la liberación
real, matando el árbol de procesos si hay timeout.
"""

from __future__ import annotations

import json
import os
import signal
import subprocess
import time
from dataclasses import dataclass, field
from pathlib import Path

import psutil

from videodub.core import vram
from videodub.core.logger import get_logger

logger = get_logger(__name__)


class StageError(RuntimeError):
    """La etapa terminó con código distinto de cero o hizo timeout."""


@dataclass
class StageResult:
    """Resultado de ejecutar una etapa."""

    script: str
    args: list[str]
    returncode: int
    stdout: str
    stderr: str
    duration_s: float
    timed_out: bool = False
    vram_used_before_mib: int | None = None
    vram_used_after_mib: int | None = None

    @property
    def ok(self) -> bool:
        return self.returncode == 0 and not self.timed_out

    def summary(self) -> dict | None:
        """Parsea el JSON resumen que la etapa imprime en stdout.

        Devuelve None si stdout no contiene un objeto JSON válido (la etapa
        puede no haber emitido resumen, p.ej. el dummy de prueba).
        """
        text = self.stdout.strip()
        if not text:
            return None
        # La etapa puede imprimir varias líneas; tomamos la última que parsee.
        for line in reversed(text.splitlines()):
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue
            if isinstance(obj, dict):
                return obj
        return None


@dataclass
class StageRunner:
    """Ejecuta scripts de etapa como subprocesos aislados.

    Parámetros:
        gpu_index: GPU a monitorear.
        uv_command: comando base; por default ``["uv", "run", "python"]``.
        check_vram: si True, mide VRAM antes/después y espera liberación.
        vram_tolerance_mib: margen aceptable de VRAM residual tras la etapa.
        vram_release_timeout_s: cuánto esperar la liberación de VRAM.
        cwd: directorio de trabajo para el subproceso.
    """

    gpu_index: int = 0
    uv_command: list[str] = field(default_factory=lambda: ["uv", "run", "python"])
    check_vram: bool = True
    vram_tolerance_mib: int = 500
    vram_release_timeout_s: float = 60.0
    cwd: Path | None = None

    def run(
        self,
        script: str | Path,
        args: list[str] | None = None,
        *,
        timeout_s: float = 600.0,
        extra_env: dict[str, str] | None = None,
    ) -> StageResult:
        """Ejecuta una etapa y devuelve su resultado.

        Lanza la etapa, captura stdout/stderr, aplica timeout (matando el
        árbol de procesos si expira), y luego espera la liberación de VRAM.
        """
        args = list(args or [])
        cmd = [*self.uv_command, str(script), *args]

        vram_active = self.check_vram and vram.is_available()
        used_before: int | None = None
        if vram_active:
            used_before = vram.get_vram_used(self.gpu_index)
            logger.info(
                "[bold]→ etapa[/bold] %s | VRAM usada antes: %d MiB",
                Path(str(script)).name,
                used_before,
            )
        else:
            logger.info("[bold]→ etapa[/bold] %s", Path(str(script)).name)

        env = {**os.environ, **(extra_env or {})}

        start = time.monotonic()
        # start_new_session=True crea un grupo de procesos para poder matar
        # el árbol completo (incl. hijos que uv pueda generar) ante timeout.
        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            cwd=str(self.cwd) if self.cwd else None,
            env=env,
            start_new_session=True,
        )

        timed_out = False
        try:
            stdout, stderr = proc.communicate(timeout=timeout_s)
        except subprocess.TimeoutExpired:
            timed_out = True
            logger.error(
                "Etapa %s excedió timeout de %.0fs — matando árbol de procesos",
                script,
                timeout_s,
            )
            self._kill_process_tree(proc.pid)
            stdout, stderr = proc.communicate()

        duration = time.monotonic() - start
        returncode = proc.returncode

        used_after: int | None = None
        if vram_active:
            assert used_before is not None
            used_after = vram.wait_for_vram_release(
                used_before,
                gpu_index=self.gpu_index,
                tolerance_mib=self.vram_tolerance_mib,
                timeout_s=self.vram_release_timeout_s,
            )
            logger.info(
                "← etapa %s | rc=%s | %.1fs | VRAM usada después: %d MiB (Δ=%+d)",
                Path(str(script)).name,
                returncode,
                duration,
                used_after,
                used_after - used_before,
            )
        else:
            logger.info(
                "← etapa %s | rc=%s | %.1fs",
                Path(str(script)).name,
                returncode,
                duration,
            )

        if stderr.strip():
            logger.debug("stderr[%s]:\n%s", Path(str(script)).name, stderr.rstrip())

        return StageResult(
            script=str(script),
            args=args,
            returncode=returncode if returncode is not None else -1,
            stdout=stdout,
            stderr=stderr,
            duration_s=duration,
            timed_out=timed_out,
            vram_used_before_mib=used_before,
            vram_used_after_mib=used_after,
        )

    def run_checked(self, *a, **kw) -> StageResult:
        """Como ``run`` pero lanza StageError si la etapa no terminó ok."""
        result = self.run(*a, **kw)
        if not result.ok:
            raise StageError(
                f"Etapa {result.script} falló "
                f"(rc={result.returncode}, timeout={result.timed_out}).\n"
                f"stderr:\n{result.stderr}"
            )
        return result

    @staticmethod
    def _kill_process_tree(pid: int, sig: int = signal.SIGTERM) -> None:
        """Mata el proceso y todos sus descendientes con psutil.

        Envía SIGTERM, espera brevemente, y aplica SIGKILL a los rezagados.
        Así evitamos zombies que retengan VRAM (ver sección 9 de CLAUDE.md).
        """
        try:
            parent = psutil.Process(pid)
        except psutil.NoSuchProcess:
            return

        procs = parent.children(recursive=True)
        procs.append(parent)

        for p in procs:
            try:
                p.send_signal(sig)
            except psutil.NoSuchProcess:
                pass

        gone, alive = psutil.wait_procs(procs, timeout=5)
        for p in alive:
            try:
                p.kill()
            except psutil.NoSuchProcess:
                pass
        psutil.wait_procs(alive, timeout=5)


__all__ = ["StageRunner", "StageResult", "StageError"]
