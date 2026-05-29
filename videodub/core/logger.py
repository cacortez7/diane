"""Rich logging que SIEMPRE escribe a stderr.

stdout queda reservado para el JSON resumen que cada etapa emite (sección 6
de CLAUDE.md). Por eso la consola de rich y el handler de logging apuntan a
stderr; nunca contaminar stdout con logs.
"""

from __future__ import annotations

import logging
import sys

from rich.console import Console
from rich.logging import RichHandler

# Consola compartida apuntando a stderr.
console = Console(stderr=True)

_CONFIGURED = False


def setup_logging(level: int | str = logging.INFO) -> logging.Logger:
    """Configura el logging raíz con RichHandler hacia stderr.

    Idempotente: llamarlo varias veces no agrega handlers duplicados.
    """
    global _CONFIGURED

    if isinstance(level, str):
        level = logging.getLevelName(level.upper())

    root = logging.getLogger()

    if not _CONFIGURED:
        handler = RichHandler(
            console=console,
            rich_tracebacks=True,
            show_time=True,
            show_path=False,
            markup=True,
        )
        handler.setFormatter(logging.Formatter("%(message)s", datefmt="[%X]"))
        root.handlers.clear()
        root.addHandler(handler)
        _CONFIGURED = True

    root.setLevel(level)
    return root


def get_logger(name: str) -> logging.Logger:
    """Devuelve un logger con nombre, garantizando el setup base."""
    if not _CONFIGURED:
        setup_logging()
    return logging.getLogger(name)


__all__ = ["console", "setup_logging", "get_logger"]
