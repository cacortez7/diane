# Diane — Pipeline de Doblaje EN→ES

Herramienta local que dobla videos del inglés al español neutro latinoamericano,
ejecutándose 100% offline en GPU local. Ver [`CLAUDE.md`](CLAUDE.md) para la
especificación completa, la arquitectura y los milestones.

> **Principio rector:** subprocess-per-stage. Cada etapa que usa GPU corre como
> un subproceso aislado que carga su modelo, hace su trabajo, escribe a disco y
> muere — para que el SO recupere el 100% de la VRAM entre etapas.

## Estado

**Milestone 1 — Andamiaje y subprocess runner.** Infraestructura base:
logging con rich, monitor de VRAM vía `nvidia-smi`, y el `StageRunner` que
lanza etapas como subprocesos aislados verificando la liberación de VRAM.

## Requisitos

- Ubuntu 26.04 LTS (objetivo) — funciona el código puro en cualquier Linux.
- [`uv`](https://docs.astral.sh/uv/) (el instalador lo instala si falta).
- Python 3.12 (gestionado por `uv`; **no** usar el 3.14 del sistema).
- Para etapas de GPU: driver NVIDIA + `nvidia-smi` en PATH (RTX 4070 Ti SUPER).

## Instalación

```bash
bash install.sh
```

Instala `uv`, Python 3.12, las dependencias del proyecto, y verifica
`nvidia-smi`. No instala PyTorch globalmente: el dummy de GPU lo declara vía
metadata inline PEP 723 y `uv` lo instala en un entorno efímero.

## Tests

```bash
uv run pytest tests/ -v
```

- Los tests de **mecánica del runner** (timeouts, parseo de resumen, códigos de
  salida) corren en cualquier máquina, sin GPU.
- El test de **liberación de VRAM** (`test_dummy_releases_vram_across_three_runs`)
  requiere una GPU NVIDIA con `nvidia-smi`; se **salta** automáticamente si no
  hay GPU.

Para correr solo el runner:

```bash
uv run pytest tests/test_runner.py -v
```

## CLI de diagnóstico

```bash
uv run python -m videodub vram-info     # estado de VRAM vía nvidia-smi
uv run python -m videodub dummy          # corre la etapa dummy de GPU
```

## Estructura

Ver sección 5 de [`CLAUDE.md`](CLAUDE.md). En resumen:

```
videodub/core/      orquestación: logger, vram, runner (sin GPU)
videodub/stages/    etapas ejecutables independientes (subprocesos)
config/pipeline.yaml metadata del proyecto
tests/              pytest
```
