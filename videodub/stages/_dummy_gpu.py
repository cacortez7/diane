# /// script
# requires-python = ">=3.12,<3.13"
# dependencies = ["torch>=2.2"]
# ///
"""Etapa dummy de prueba: reserva VRAM, duerme y muere.

Sirve para validar el principio subprocess-per-stage del StageRunner: al
morir este proceso, el SO debe recuperar el 100% de la VRAM reservada.

Usa metadata inline PEP 723 para que ``uv run --script`` instale torch en un
entorno EFÍMERO y aislado, sin contaminar las dependencias del orquestador
(que nunca debe importar torch ni crear contexto CUDA).

El JSON resumen va a stdout; cualquier log va a stderr (convención sección 6).
"""

from __future__ import annotations

import argparse
import json
import sys
import time


def log(msg: str) -> None:
    print(msg, file=sys.stderr, flush=True)


def main() -> int:
    parser = argparse.ArgumentParser(description="Dummy GPU stage (reserva VRAM)")
    parser.add_argument("--gb", type=float, default=5.0, help="GiB a reservar en GPU")
    parser.add_argument("--sleep", type=float, default=3.0, help="segundos a dormir")
    parser.add_argument("--device", type=int, default=0, help="índice de GPU")
    args = parser.parse_args()

    import torch  # import tardío: solo dentro del subproceso aislado

    if not torch.cuda.is_available():
        log("[dummy_gpu] CUDA no disponible; saliendo sin reservar VRAM.")
        print(json.dumps({"stage": "dummy_gpu", "gpu": False, "reserved_gb": 0}))
        return 0

    device = torch.device(f"cuda:{args.device}")
    n_elements = int(args.gb * (1024**3) / 4)  # float32 = 4 bytes
    log(f"[dummy_gpu] reservando ~{args.gb} GiB en {device} ...")

    tensor = torch.empty(n_elements, dtype=torch.float32, device=device)
    tensor.fill_(1.0)
    torch.cuda.synchronize(device)

    allocated_gb = torch.cuda.memory_allocated(device) / (1024**3)
    log(f"[dummy_gpu] reservado {allocated_gb:.2f} GiB; durmiendo {args.sleep}s")

    time.sleep(args.sleep)

    # No hace falta liberar explícitamente: al salir el proceso, el SO
    # recupera toda la VRAM. Lo hacemos por claridad de intención.
    del tensor
    log("[dummy_gpu] terminando — el SO recuperará la VRAM al morir el proceso")

    print(
        json.dumps(
            {
                "stage": "dummy_gpu",
                "gpu": True,
                "device": args.device,
                "reserved_gb": round(allocated_gb, 3),
            }
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
