"""Health checks HTTP para servicios locales (llama.cpp server)."""

from __future__ import annotations

import time

import requests

from videodub.core.logger import get_logger

logger = get_logger(__name__)


def wait_for_http(
    url: str,
    *,
    timeout_s: float = 60.0,
    poll_interval_s: float = 1.0,
    ok_status: int = 200,
) -> bool:
    """Espera (polling) a que ``url`` responda con ``ok_status``.

    Devuelve True si el servicio respondió dentro del timeout.
    """
    deadline = time.monotonic() + timeout_s
    while time.monotonic() < deadline:
        try:
            if requests.get(url, timeout=5).status_code == ok_status:
                return True
        except requests.RequestException:
            pass
        time.sleep(poll_interval_s)
    return False


__all__ = ["wait_for_http"]
