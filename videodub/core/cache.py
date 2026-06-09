"""Caché por hash de inputs + config (sección 6 de CLAUDE.md).

Para cada etapa se calcula ``sha256(contenido de inputs + config relevante +
nombre de etapa)``. Si existe un marcador previo con el mismo hash y todos
los outputs siguen en disco, la etapa se salta. Los marcadores viven en
``workspace/<job_id>/.cache/<stage>.json``.
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from videodub.core.logger import get_logger

logger = get_logger(__name__)


def hash_inputs(input_files: list[Path], config_subset: dict) -> str:
    """Hash determinista del contenido de los inputs + config de la etapa."""
    h = hashlib.sha256()
    for path in sorted(input_files, key=str):
        h.update(str(path.name).encode())
        h.update(path.read_bytes())
    h.update(json.dumps(config_subset, sort_keys=True, default=str).encode())
    return h.hexdigest()


class StageCache:
    """Marcadores de caché por etapa dentro del workspace de un job."""

    def __init__(self, job_dir: Path):
        self.cache_dir = job_dir / ".cache"
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def _marker(self, stage: str) -> Path:
        return self.cache_dir / f"{stage}.json"

    def is_fresh(self, stage: str, input_hash: str, outputs: list[Path]) -> bool:
        """True si la etapa ya corrió con este hash y sus outputs existen."""
        marker = self._marker(stage)
        if not marker.exists():
            return False
        try:
            data = json.loads(marker.read_text())
        except json.JSONDecodeError:
            return False
        if data.get("hash") != input_hash:
            return False
        if not all(p.exists() for p in outputs):
            return False
        logger.info("[cache] etapa %s al día (hash %s…) — se salta", stage, input_hash[:12])
        return True

    def store(self, stage: str, input_hash: str, outputs: list[Path]) -> None:
        self._marker(stage).write_text(json.dumps({
            "hash": input_hash,
            "outputs": [str(p) for p in outputs],
        }, indent=2))


__all__ = ["hash_inputs", "StageCache"]
