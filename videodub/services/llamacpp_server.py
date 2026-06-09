"""Arranca y mata el servidor llama.cpp para el backend local de traducción.

Flags optimizados para RTX 4070 Ti SUPER con Qwen3.6 35B A3B IQ4_XS (MoE):
24 capas en GPU (~13.5 GB VRAM) + resto en RAM, Flash Attention, KV cache
q8_0, contexto 16384, ``--parallel 1`` (NUNCA requests concurrentes).

El binario ``llama-server`` debe estar en PATH o indicarse explícitamente.
Compilar con CUDA: ``cmake -B build -DGGML_CUDA=ON`` (ver sección 4 de
CLAUDE.md).
"""

from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

import psutil

from videodub.core import vram
from videodub.core.logger import get_logger
from videodub.services.health import wait_for_http

logger = get_logger(__name__)


class LlamaCppServerError(RuntimeError):
    pass


class LlamaCppServer:
    """Context manager del servidor llama.cpp.

    >>> with LlamaCppServer(model_path) as srv:
    ...     requests.post(f"{srv.base_url}/v1/chat/completions", ...)
    """

    def __init__(
        self,
        model_path: Path,
        *,
        binary: str | None = None,
        host: str = "127.0.0.1",
        port: int = 8080,
        ngl: int = 24,
        ctx: int = 16384,
        threads: int = 8,
        startup_timeout_s: float = 120.0,  # MoE + offload inicial tarda; mínimo 45s
    ):
        self.model_path = Path(model_path)
        self.binary = binary or shutil.which("llama-server")
        self.host = host
        self.port = port
        self.ngl = ngl
        self.ctx = ctx
        self.threads = threads
        self.startup_timeout_s = startup_timeout_s
        self.proc: subprocess.Popen | None = None
        self._vram_baseline: int | None = None

    @property
    def base_url(self) -> str:
        return f"http://{self.host}:{self.port}"

    def start(self) -> None:
        if self.binary is None:
            raise LlamaCppServerError(
                "llama-server no encontrado en PATH. Compilar llama.cpp con CUDA "
                "(cmake -B build -DGGML_CUDA=ON) e instalar el binario."
            )
        if not self.model_path.exists():
            raise LlamaCppServerError(
                f"Modelo GGUF no encontrado: {self.model_path}. "
                "Descargar con scripts/download_models.sh"
            )

        if vram.is_available():
            self._vram_baseline = vram.get_vram_used()

        cmd = [
            self.binary,
            "-m", str(self.model_path),
            "--host", self.host,
            "--port", str(self.port),
            "-ngl", str(self.ngl),
            "-c", str(self.ctx),
            "-fa", "on",
            "-ctk", "q8_0",
            "-ctv", "q8_0",
            "--threads", str(self.threads),
            "--mlock",
            "--parallel", "1",
        ]
        logger.info("arrancando llama-server: %s", " ".join(cmd))
        self.proc = subprocess.Popen(
            cmd,
            stdout=sys.stderr,
            stderr=sys.stderr,
            start_new_session=True,
        )

        if not wait_for_http(f"{self.base_url}/health", timeout_s=self.startup_timeout_s):
            self.stop()
            raise LlamaCppServerError(
                f"llama-server no respondió /health en {self.startup_timeout_s}s"
            )
        logger.info("llama-server listo en %s", self.base_url)

    def stop(self) -> None:
        """Mata el árbol de procesos del server y espera liberación de VRAM."""
        if self.proc is None:
            return
        try:
            parent = psutil.Process(self.proc.pid)
            procs = parent.children(recursive=True) + [parent]
            for p in procs:
                try:
                    p.terminate()
                except psutil.NoSuchProcess:
                    pass
            _, alive = psutil.wait_procs(procs, timeout=10)
            for p in alive:
                try:
                    p.kill()
                except psutil.NoSuchProcess:
                    pass
        except psutil.NoSuchProcess:
            pass
        self.proc = None
        logger.info("llama-server detenido")

        if self._vram_baseline is not None and vram.is_available():
            vram.wait_for_vram_release(self._vram_baseline, timeout_s=60.0)

    def __enter__(self) -> "LlamaCppServer":
        self.start()
        return self

    def __exit__(self, *exc) -> None:
        self.stop()


__all__ = ["LlamaCppServer", "LlamaCppServerError"]
