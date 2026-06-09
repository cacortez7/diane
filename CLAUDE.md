# Diane — Pipeline de Doblaje EN→ES

> Documento de especificación viva. Claude Code lee este archivo automáticamente
> al iniciar sesión en el directorio del proyecto. Manténlo actualizado conforme
> el proyecto evolucione.

## 1. Objetivo

Construir una herramienta local que dobla videos del inglés al español neutro
latinoamericano. Pipeline end-to-end: video MP4 → transcripción → traducción
contextual → síntesis de voz clonada de la original → composición final con
música de fondo preservada → sincronización labial. Todo offline, ejecutándose
en GPU local.

Caso de uso primario: doblar videos técnicos y de creación de contenido para
publicar en YouTube en español, con sincronización labial de calidad.

## 2. Hardware y entorno objetivo

- **GPU:** NVIDIA RTX 4070 Ti SUPER (16 GB VRAM, arquitectura Ada Lovelace,
  compute capability 8.9, soporta FP8 nativo en Tensor Cores 4ta gen).
- **CPU:** Intel i7-13700K (8 P-cores + 8 E-cores).
- **RAM:** 64 GB DDR5.
- **OS:** Ubuntu 26.04 LTS "Resolute Raccoon" (CUDA nativo en repos).
- **Almacenamiento:** SSD dedicado para modelos y workspace.

Esto define las decisiones de tamaño de modelo, cuantización y offloading a
lo largo del proyecto.

## 3. Filosofía arquitectónica (LEER ANTES DE CODIFICAR)

### El principio único más importante: subprocess-per-stage

**PyTorch nunca libera completamente el contexto CUDA dentro de un proceso.**
Aunque se llame a `torch.cuda.empty_cache()`, quedan residuos (típicamente
250-600 MB) que solo se liberan cuando el proceso de Python muere. Esta es
una limitación fundamental de PyTorch, no un bug de las librerías que cargan
modelos.

**Consecuencia arquitectónica:** cada etapa que usa GPU debe ejecutarse como
un **subproceso aislado de Python** que se lanza, completa su trabajo,
escribe su output a disco y muere. El OS recupera el 100% de la VRAM al
morir el proceso.

**El orquestador maestro NO carga modelos.** Solo coordina:
- Lee configuración YAML.
- Lanza subprocesos secuencialmente.
- Verifica VRAM libre antes de cada etapa.
- Espera liberación real de VRAM después de cada etapa.
- Maneja caché por hash de input + config.
- Expone UI (Gradio).

### Diagrama mental

```
┌─────────────────────────────────────────────────────────────┐
│  ORQUESTADOR MAESTRO (Python puro, sin GPU)                 │
└────────────────┬────────────────────────────────────────────┘
                 │ subprocess.run() bloqueante
                 ▼
   ┌───────┬───────┬───────┬───────┬───────┬───────┬────────┐
   │ ETAPA │ ETAPA │ ETAPA │ ETAPA │ ETAPA │ ETAPA │ ETAPA  │
   │FFmpeg │Demucs │WhprX  │llama  │FishS2 │FFmpeg │LTX-Dub │
   │ CPU   │  GPU  │  GPU  │GPU+CPU│  GPU  │ CPU   │  GPU   │
   └───────┴───────┴───────┴───────┴───────┴───────┴────────┘
   Cada uno muere → libera 100% VRAM → siguiente arranca
```

## 4. Stack tecnológico (versiones fijas)

| Capa | Herramienta | Nota |
|---|---|---|
| Gestor Python | `uv` (latest) | Maneja Python versions + lockfile |
| Python | 3.12 (vía `uv python install`) | Evitar 3.14 del sistema (paquetes ML aún no soportan) |
| CUDA | 12.x (desde repos Ubuntu 26.04) | `apt install nvidia-cuda-toolkit` |
| Audio extract | FFmpeg (apt) | CPU |
| Source separation | `demucs` v4 (htdemucs_ft) | ~3 GB VRAM |
| ASR | `whisperx` con `large-v3` | ~6 GB VRAM, word-level timestamps |
| Traducción (cloud) | `gemini-srt-translator` (PyPI) | Backend Gemini API; usa API key gratuita de Google AI Studio |
| LLM serving | `llama.cpp` (server CUDA build) | Flash Attention + offload GPU+CPU; backend local de traducción |
| LLM modelo | **Qwen3.6 35B A3B GGUF IQ4_XS** (bartowski) | MoE: 35B total, ~3.6B activos; 18.35 GB; `-ngl 24` (13.5 GB VRAM + resto en RAM) |
| TTS | Fish Speech S2 Pro | BF16 por default (~10 GB VRAM); NF4 como fallback |
| Time-stretch | `rubberband-cli` (apt) | Ajuste de tempo sin cambiar pitch |
| Composición | FFmpeg | CPU |
| Lip sync | **LTX-2.3-22b-IC-LoRA-LipDub** (Lightricks) | Video-to-video, 22B params, diffusers + ltx-video |
| UI | `gradio` | Web local en :7860 |
| Orquestación | Python `subprocess` + `psutil` | Sin Celery, Redis ni Docker |
| Logging | `rich` + Python `logging` | Output legible en terminal |
| Validación | `pydantic` v2 | Schemas para config y mensajes inter-etapa |

### Nota sobre el modelo LLM (Qwen3.6 35B A3B)

Este modelo es **Mixture of Experts (MoE)**. Aunque tiene 35B parámetros totales,
solo activa ~3.6B por inferencia, lo que lo hace significativamente más rápido
que un dense 32B. Probado en este hardware con LM Studio antes de migrar a
llama.cpp: traducciones EN→ES de alta calidad confirmadas.

Configuración de offloading probada:
- **24 capas en GPU** → ~13.5 GB VRAM
- **Capas restantes en CPU/RAM** → sin problema con 64 GB DDR5
- Cuantización: IQ4_XS (importance matrix, ~4 bits)
- Contexto soportado: hasta 262,144 tokens (usar 16,384 en producción)

## 5. Estructura del proyecto

```
videodub/
├── CLAUDE.md                  # este archivo
├── README.md
├── pyproject.toml             # uv project
├── .python-version            # 3.12
├── install.sh                 # bootstrap Ubuntu 26.04
├── .gitignore
│
├── videodub/                  # paquete principal
│   ├── __init__.py
│   ├── __main__.py            # python -m videodub
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── orchestrator.py    # cerebro del pipeline
│   │   ├── runner.py          # StageRunner: lanza/mata subprocesos
│   │   ├── vram.py            # monitor nvidia-smi
│   │   ├── cache.py           # caché por hash
│   │   ├── config.py          # carga + valida pipeline.yaml
│   │   └── logger.py          # rich logging
│   │
│   ├── stages/                # cada etapa es un script ejecutable INDEPENDIENTE
│   │   ├── __init__.py
│   │   ├── extract_audio.py   # FFmpeg
│   │   ├── separate_vocals.py # Demucs
│   │   ├── transcribe.py      # WhisperX
│   │   ├── translate.py       # cliente HTTP a llama.cpp
│   │   ├── synthesize.py      # Fish S2 Pro
│   │   ├── align_timing.py    # rubberband
│   │   ├── compose.py         # FFmpeg composición sin lip sync
│   │   └── lipdub.py          # LTX-2.3-22b-IC-LoRA-LipDub (etapa final opcional)
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── llamacpp_server.py # arranca/mata server llama.cpp
│   │   └── health.py
│   │
│   ├── schemas/               # pydantic models para mensajes inter-etapa
│   │   ├── __init__.py
│   │   ├── segment.py         # un segmento de audio con timestamps
│   │   ├── transcript.py
│   │   └── job.py
│   │
│   └── ui/
│       └── gradio_app.py
│
├── config/
│   ├── pipeline.yaml          # configuración default
│   └── presets/
│       ├── fast.yaml          # sin lip sync
│       ├── quality.yaml       # con lip sync (LTX)
│       └── balanced.yaml
│
├── tests/
│   ├── test_runner.py
│   ├── test_vram.py
│   ├── test_cache.py
│   └── fixtures/
│       └── sample_10s.mp4     # video corto de prueba
│
├── scripts/
│   ├── download_models.sh     # descarga pesos a models/
│   └── benchmark_translate.py # compara LLMs de traducción
│
├── models/                    # gitignored, pesos de modelos
└── workspace/                 # gitignored, archivos intermedios por job
```

## 6. Convenciones

### Mensajes entre etapas

Las etapas se comunican **vía archivos en disco**, no vía pipes o memoria
compartida. Cada etapa:

1. Recibe rutas de input por argumentos CLI.
2. Lee inputs.
3. Hace su trabajo.
4. Escribe outputs a rutas especificadas.
5. Imprime un JSON resumen en stdout (no usar stdout para logs).
6. Sale con código 0 si éxito, no-cero si error.

Logs van a stderr usando `rich`. El orquestador captura ambos.

### Schemas pydantic para mensajes

Todo intercambio estructurado entre etapas pasa por modelos pydantic
serializados a JSON. Ej. el SRT después de transcripción se guarda como
`.srt` (formato estándar) **y** como `.json` con metadata adicional
(confidence scores, speaker IDs, etc.) usando un schema definido en
`videodub/schemas/`.

### Naming de archivos en workspace

```
workspace/<job_id>/
├── 00_source.mp4
├── 01_audio.wav
├── 02_vocals.wav
├── 02_instrumental.wav
├── 03_transcript.srt
├── 03_transcript.json
├── 04_translation.srt
├── 04_translation.json
├── 05_segments/
│   ├── 0001.wav
│   ├── 0002.wav
│   └── ...
├── 06_synth_aligned.wav
├── 07_final.mp4            # video final sin lip sync
└── 08_lipdub.mp4           # video final con lip sync (si se ejecuta M7)
```

El prefijo numérico identifica la etapa. Útil para caché y debugging.

### Cuando una etapa NO debe correr

El orquestador verifica `hash(input_files + config_subset)` para cada etapa
y si existe un output previo con el mismo hash, salta la etapa. Esto
permite iterar rápido (ej. cambiar solo la voz de Fish S2 sin re-transcribir).

### Commits

Usar conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`,
`chore:`. Un milestone = una rama feature + PR a main (aunque sea proyecto
de un solo dev, mantiene historial limpio).

## 7. Milestones

Cada milestone está diseñado para ser un prompt independiente a Claude Code.
Completar uno antes de pasar al siguiente. Tests deben pasar al final de
cada uno.

---

### MILESTONE 1 — Andamiaje y subprocess runner

**Objetivo:** infraestructura mínima que demuestre que la VRAM se libera
correctamente entre subprocesos.

**Prompt para Claude Code:**

> Lee CLAUDE.md completo. Implementa el Milestone 1:
>
> 1. Crea la estructura de directorios definida en sección 5 (solo carpetas
>    + `__init__.py` vacíos donde corresponda).
> 2. `pyproject.toml` con `uv`, Python 3.12, dependencias mínimas:
>    `rich`, `pydantic>=2`, `psutil`, `pyyaml`, `typer`, `nvidia-ml-py`.
> 3. `videodub/core/logger.py` con setup de rich logging que escribe a stderr.
> 4. `videodub/core/vram.py` con funciones `get_vram_used()`, `get_vram_free()`,
>    `wait_for_vram_release()`. Usa `nvidia-smi` vía subprocess (no
>    `nvidia-ml-py` para evitar contexto CUDA persistente en el orquestador).
> 5. `videodub/core/runner.py` con clase `StageRunner` que lanza subprocesos
>    `uv run python <script>`, mide VRAM antes/después, mata árbol de
>    procesos si hay timeout, espera liberación real de VRAM post-ejecución.
> 6. Script dummy `videodub/stages/_dummy_gpu.py` que carga un tensor grande
>    en GPU con PyTorch (~5 GB), duerme 3 segundos, y sale. Sirve como test.
> 7. Tests en `tests/test_runner.py` que ejecutan el dummy 3 veces seguidas
>    y verifican que VRAM se libera entre cada ejecución (margen <500 MB).
> 8. `install.sh` que instala uv, crea venv con Python 3.12, instala deps,
>    verifica que `nvidia-smi` funcione.
> 9. README mínimo con cómo ejecutar tests.
> 10. `config/pipeline.yaml` con metadata inicial del proyecto:
>     ```yaml
>     project_codename: "Diane"
>     version: "1.0.0"
>     hardware_target: "RTX 4070 Ti SUPER"
>     vram_gb: 16
>     source_language: "en"
>     target_language: "es"
>     default_preset: "balanced"
>     translation_backend: "gemini"  # "gemini" o "local"
>     translation_description: "YouTube tech/AI speech. Rules: 1) Informal Latin American Spanish, never Spain Spanish. 2) Convert ALL numbers to words (17=diecisiete, 2005=dos mil cinco). 3) Write English proper nouns phonetically in Spanish (Apple=Ápol, Stanford=Stánford, Steve=Stív, Jobs=Yobs, iOS=ai-o-és). 4) Keep each subtitle SHORT and CONCISE, Spanish must not exceed original English duration. 5) Never translate proper names, write them phonetically instead."
>     ```
>
> NO instales aún PyTorch ni librerías pesadas globalmente. El dummy
> instalará torch en su propio entorno si hace falta, o usa otra estrategia
> para reservar VRAM (cupy, numba.cuda, o un binario externo).
>
> Criterios de aceptación:
> - `bash install.sh` corre limpio en Ubuntu 26.04.
> - `uv run pytest tests/test_runner.py -v` pasa.
> - Logs en terminal son legibles con rich.
> - Después del test, `nvidia-smi` muestra VRAM idle (cerca de 0 si no
>   hay escritorio gráfico).

---

### MILESTONE 2 — Pipeline de audio (extracción + separación + transcripción)

**Objetivo:** convertir un video MP4 corto en un SRT en inglés correcto.

**Prompt para Claude Code:**

> Lee CLAUDE.md. Implementa el Milestone 2 sobre el código de Milestone 1.
>
> 1. `videodub/schemas/segment.py` con modelo pydantic `Segment` (start,
>    end, text, confidence, speaker_id opcional). Modelo `Transcript` que
>    contiene `list[Segment]` + metadata.
> 2. `videodub/stages/extract_audio.py`: extrae pista de audio mono 16kHz
>    WAV desde un video MP4 usando ffmpeg-python o subprocess de ffmpeg.
> 3. `videodub/stages/separate_vocals.py`: usa Demucs (htdemucs_ft) para
>    separar `vocals.wav` e `instrumental.wav`. Subprocess-friendly: carga
>    modelo, procesa, escribe outputs, sale.
> 4. `videodub/stages/transcribe.py`: usa WhisperX large-v3 para transcribir
>    `vocals.wav`. Output: SRT + JSON con schema Transcript. Word-level
>    timestamps activados. VAD filter activado.
> 5. `videodub/core/orchestrator.py`: orquestador básico que toma un MP4
>    de input y ejecuta etapas 1-3 secuencialmente vía StageRunner.
>    Implementa caché por hash (sec. 6).
> 6. CLI vía typer: `python -m videodub run --input video.mp4 --stage transcribe`.
> 7. Tests con un MP4 de prueba en `tests/fixtures/sample_10s.mp4`. Si no
>    existe, generar uno con ffmpeg desde un tono + voz TTS sintética.
>
> NOTAS TÉCNICAS:
> - Demucs y WhisperX deben instalarse en sus PROPIOS entornos uv para
>    aislar dependencias de torch (pueden requerir versiones distintas).
>    Investigar si `uv run --with` o entornos separados por etapa.
> - El orquestador lanza `uv run --project <stage_env> python stage.py`.
> - Configurar WhisperX para usar FP16 en GPU.
>
> Criterios de aceptación:
> - Procesar sample_10s.mp4 produce SRT legible con timestamps correctos.
> - Cada etapa libera VRAM al terminar (verificable en logs).
> - Re-ejecutar el mismo input usa caché y NO re-corre etapas.

**Estado: COMPLETADO.** Decisiones tomadas durante la implementación:

- Aislamiento de entornos por etapa: metadata inline **PEP 723** en cada
  script de stage + `uv run --script` (mismo patrón que el dummy de M1).
  uv cachea el entorno por hash de dependencias, así que solo la primera
  ejecución descarga torch/whisperx.
- `separate_vocals.py` fija **torch/torchaudio <2.9**: torchaudio 2.9
  eliminó los backends de I/O (sox/ffmpeg) y exige torchcodec.
- `transcribe.py` depende de `nvidia-cudnn-cu12` y precarga las `.so` de
  cuDNN vía ctypes antes de importar whisperx (ctranslate2 las necesita y
  el wheel pip no está en LD_LIBRARY_PATH). Ojo: `nvidia.cudnn` es
  namespace package — usar `__path__`, no `__file__`.
- Las etapas NO importan el paquete `videodub` (corren en entornos
  efímeros): emiten JSON plano y el **orquestador** valida contra el
  schema pydantic (`Transcript`).
- Fixture `tests/fixtures/sample_10s.mp4` generado con gTTS + ffmpeg
  (tono 220 Hz de fondo); regenerable con `scripts/make_fixture.sh`.
- `job_id` = sha256 del contenido del video (16 hex chars).

---

### MILESTONE 3 — Traducción dual: Gemini API + local Qwen

**Objetivo:** traducir SRT en inglés a español con dos backends
intercambiables: Gemini API (gratis, online) y Qwen local (offline).
El backend se configura en `pipeline.yaml` y se selecciona desde la UI.

**Prompt para Claude Code:**

> Lee CLAUDE.md. Implementa el Milestone 3.
>
> ### Backend Gemini (translation_backend: "gemini")
>
> 1. Instalar `gemini-srt-translator` como dependencia en `pyproject.toml`.
> 2. `videodub/stages/translate.py` — rama Gemini:
>    - Lee `translation_backend` y `translation_description` de `pipeline.yaml`.
>    - Si backend es "gemini", usa la Python API de gemini-srt-translator:
>      ```python
>      import gemini_srt_translator as gst
>      gst.gemini_api_key = os.environ["GEMINI_API_KEY"]
>      gst.input_file = "03_transcript.srt"
>      gst.output_file = "04_translation.srt"
>      gst.target_language = "Latin American Spanish"
>      gst.model_name = "gemini-2.5-flash"
>      gst.description = config.translation_description
>      gst.free_quota = True   # respetar límites del tier gratuito
>      gst.thinking = True
>      gst.progress_log = True
>      gst.translate()
>      ```
>    - Después de traducir, parsear el SRT output y generar también
>      `04_translation.json` con el schema `Translation` pydantic.
>    - Si `GEMINI_API_KEY` no está en el entorno, lanzar error claro:
>      "GEMINI_API_KEY no configurada. Agrega tu clave en ~/.bashrc o
>       usa translation_backend: local en pipeline.yaml"
>
> ### Backend local (translation_backend: "local")
>
> 3. `scripts/download_models.sh`: descarga Qwen3.6 35B A3B IQ4_XS de
>    bartowski desde HuggingFace a `models/llm/`.
>    Repo: `bartowski/Qwen3.6-35B-A3B-GGUF`, archivo IQ4_XS (~18.35 GB).
> 4. `videodub/services/llamacpp_server.py`: clase `LlamaCppServer` que:
>    - Arranca llama-server como subprocess con args optimizados para
>      4070 Ti SUPER con offloading GPU+CPU.
>    - Flags clave: `-fa on`, `-ctk q8_0 -ctv q8_0`, `-ngl 24`
>      (24 capas en GPU ≈ 13.5 GB VRAM, resto en CPU/RAM),
>      `--threads 8` (solo P-cores), `--mlock`, `-c 16384`.
>    - Espera health check en `http://127.0.0.1:8080/health`.
>    - Timeout de arranque: mínimo 45s (modelo MoE + offload inicial).
>    - Método `stop()` mata el proceso y verifica liberación de VRAM.
>    - Context manager: `with LlamaCppServer(...) as srv: ...`.
> 5. `videodub/stages/translate.py` — rama local:
>    - Si backend es "local", arranca LlamaCppServer.
>    - Implementa **ventana deslizante de contexto**: para cada segmento
>      incluye los N segmentos previos (default 8) como contexto.
>    - System prompt base + `translation_description` de pipeline.yaml
>      se combinan para guiar la traducción.
>    - Output: SRT + JSON con schema `Translation`.
>    - Mata el server al terminar.
>
> ### Común a ambos backends
>
> 6. `videodub/schemas/translation.py`: schema pydantic `Translation`
>    (lista de segmentos traducidos + metadata + backend_used).
> 7. `scripts/benchmark_translate.py`: traduce un SRT de prueba con
>    ambos backends y guarda resultados para comparación manual.
> 8. Tests: traducir un SRT pequeño con cada backend y verificar
>    que el output JSON es válido con el schema correcto.
>    El test de backend local puede skip si no hay GPU/modelo descargado.
>
> NOTAS TÉCNICAS:
> - gemini-srt-translator con `free_quota=True` añade delays automáticos
>   para no superar los límites del tier gratuito. NO desactivar esto.
> - llama.cpp debe compilarse con CUDA: `cmake -B build -DGGML_CUDA=ON`.
> - Qwen3 MoE puede requerir flags adicionales; revisar model card de
>   bartowski para argumentos específicos de Qwen3.
> - **NUNCA** hacer requests concurrentes al llama-server: `--parallel 1`.
>
> Criterios de aceptación:
> - Backend Gemini: SRT de 1 min traducido correctamente usando API key.
> - Backend local: SRT de 1 min traducido con Qwen, VRAM libera al terminar.
> - Cambiar `translation_backend` en pipeline.yaml cambia el backend sin
>   modificar código.
> - Caché funciona: mismo input + misma config no re-traduce.

**Estado: COMPLETADO** — ambos backends validados con tests reales en el
hardware objetivo. Decisiones tomadas:

- `stages/translate.py` corre en el **entorno del proyecto** (`uv run
  python`), no PEP 723: sus deps son livianas (sin torch) y necesita
  importar `videodub` (schemas + `LlamaCppServer`). El orquestador tiene
  un `project_runner` para estas etapas (`StageSpec.project_env=True`).
- La etapa acepta `--backend gemini|local` como override del YAML (lo usa
  `scripts/benchmark_translate.py` y la UI en M6).
- Rama Gemini: gemini-srt-translator escribe el SRT; los timestamps del
  JSON `Translation` se toman del transcript original (la traducción
  conserva 1:1 los segmentos).
- Rama local: ventana deslizante = pares user/assistant previos (default
  8, `translation_context_window` en YAML) en el chat template;
  `temperature=0.3`. Modelo: primer `*.gguf` en `models/llm/` o
  `local_llm_path` del YAML.
- Repo HF correcto del modelo: **`bartowski/Qwen_Qwen3.6-35B-A3B-GGUF`**
  (bartowski prefija la org; `bartowski/Qwen3.6-35B-A3B-GGUF` no existe).
- Qwen3.6 es **modelo razonador**: sin
  `"chat_template_kwargs": {"enable_thinking": false}` en el request, la
  respuesta se va al canal de thinking y `content` llega vacío. Se
  desactiva el thinking y además se limpia cualquier resto `<think>…</think>`.
- llama.cpp compilado con CUDA en `~/src/llama.cpp` (build `d73cd07`),
  binario en `~/.local/bin/llama-server`. Modelo (19 GB) en
  `models/llm/Qwen_Qwen3.6-35B-A3B-IQ4_XS.gguf`.
- Los tests de ambos backends hacen **skip** automático si faltan la API
  key, el binario o el modelo.

---

### MILESTONE 4 — Síntesis con Fish S2 Pro

**Objetivo:** generar audio en español usando voz clonada del original.

**Prompt para Claude Code:**

> Lee CLAUDE.md. Implementa el Milestone 4.
>
> 1. `scripts/download_models.sh`: agrega descarga de `fishaudio/s2-pro`
>    desde HuggingFace. Aceptar términos de la Fish Audio Research License.
> 2. `videodub/stages/synthesize.py`:
>    - Carga Fish S2 Pro con cuantización configurable (nf4 por default,
>      fp8 opcional, bf16 explícito).
>    - Toma `translation.json` + `vocals.wav` (la voz original limpia).
>    - Extrae muestra de 15-25 segundos de `vocals.wav` como referencia
>      de voz (clonación zero-shot).
>    - Para cada segmento traducido: genera WAV en español con la voz
>      clonada, guarda en `workspace/<job_id>/05_segments/NNNN.wav`.
>    - Implementa control inline de Fish S2 si el LLM detecta emociones
>      en el original (ej. agregar `[excited]`, `[laughing]` automático).
>    - Sale después de procesar todos los segmentos.
> 3. Investigar y documentar en código si Fish S2 puede mantenerse cargado
>    para procesar múltiples segmentos en una sola invocación del proceso
>    (probable, dado que el modelo se carga una vez al inicio del stage).
> 4. Tests: sintetizar 3-4 segmentos cortos y verificar que los WAVs
>    generados son audibles y coherentes con el texto.
>
> NOTAS TÉCNICAS:
> - Fish S2 Pro = 5B parámetros BF16 = ~10 GB en VRAM. Usar BF16 por default
>   ya que cabe cómodamente en los 16 GB y cada stage libera VRAM al terminar.
> - NF4 (~6 GB) solo como fallback si hay problemas de VRAM inesperados.
> - FP8 es optimización futura si se quiere reducir tiempo de inferencia.
> - Documentar tiempo de generación por segundo de audio (factor RTF).
>
> Criterios de aceptación:
> - Audio sintetizado es claramente español, suena natural, y la voz
>    se parece razonablemente al hablante original.
> - Memoria libera al terminar el stage.
> - Procesar 10 segmentos toma tiempo razonable (target: < 2 min en
>    4070 Ti SUPER).

---

### MILESTONE 5 — Alineación temporal y composición final

**Objetivo:** producir el video final con audio doblado sincronizado.

**Prompt para Claude Code:**

> Lee CLAUDE.md. Implementa el Milestone 5.
>
> 1. `videodub/stages/align_timing.py`:
>    - Toma los segmentos en `05_segments/` y los timestamps del
>      `translation.json`.
>    - Para cada segmento: calcula duración objetivo (= duración del
>      segmento original en inglés).
>    - Si el español es más largo: aplica `rubberband` para acelerar el
>      audio sin cambiar el pitch, hasta un máximo configurable (default
>      1.25x; si requiere más, ya no es natural).
>    - Si el español es más corto: agrega silencio al final.
>    - Ensambla todos los segmentos en un único `06_synth_aligned.wav`
>      con los timestamps correctos.
> 2. `videodub/stages/compose.py`:
>    - Toma video original + `06_synth_aligned.wav` + `02_instrumental.wav`.
>    - Mezcla audio: instrumental al 70% volumen + voz sintetizada al 100%.
>    - Reemplaza la pista de audio del video con la mezcla.
>    - Output: `07_final.mp4`.
>    - Mantiene codec de video (no re-encode si es evitable: `-c:v copy`).
> 3. Test end-to-end: procesar `sample_10s.mp4` y obtener un `07_final.mp4`
>    válido.
>
> NOTAS:
> - rubberband-cli debe estar instalado en el sistema (apt).
> - Si la voz sintetizada se desincroniza notoriamente, hay problemas
>    aguas arriba en traducción (muy larga) o timestamps (incorrectos).
> - Este milestone produce un video completo SIN lip sync. El lip sync
>    se agrega en Milestone 7 como etapa separada.
>
> Criterios de aceptación:
> - Video final es reproducible.
> - Audio español alineado con la imagen (timing general correcto).
> - Música de fondo preservada.

---

### MILESTONE 6 — UI Gradio

**Objetivo:** interfaz web local con selector de backend de traducción
y plantillas de instrucciones personalizables.

**Prompt para Claude Code:**

> Lee CLAUDE.md. Implementa el Milestone 6.
>
> 1. `videodub/ui/gradio_app.py`:
>    - Upload de video MP4.
>    - Selector de preset (fast / balanced / quality):
>      - fast y balanced: pipeline sin lip sync (M1-M5).
>      - quality: pipeline completo incluyendo lip sync (M1-M7).
>    - **Selector de backend de traducción** (radio buttons):
>      - "Gemini API (gratis, online)" — usa gemini-srt-translator
>      - "Local (Qwen 35B, offline)" — usa llama.cpp
>    - **Selector de plantilla de instrucciones** (dropdown):
>      - "YouTube Tech/AI" (default) — instrucciones probadas para
>        contenido técnico con reglas de fonética y números
>      - "Entretenimiento" — tono más informal, menos reglas técnicas
>      - "Documental" — tono neutro, más formal
>      - "Personalizado" — campo libre editable
>    - **Campo de texto editable** para las instrucciones de traducción,
>      pre-llenado según la plantilla seleccionada. Editable en cualquier
>      momento antes de iniciar.
>    - Si backend es Gemini y `GEMINI_API_KEY` no está en el entorno:
>      mostrar campo para ingresar la API key manualmente en la UI.
>      Dejar claro que lo ideal es configurarla como variable de entorno.
>    - Botón "Iniciar doblaje".
>    - Logs en vivo (capturar stderr del orquestador y mostrar en UI).
>    - Progreso por etapa (cajitas que se ponen verdes, una por stage).
>    - Player de preview del resultado.
>    - Botón de descarga.
> 2. CLI: `python -m videodub ui` arranca Gradio en :7860.
> 3. La UI escribe los valores seleccionados al config del job antes de
>    lanzar el orquestador. NO modifica pipeline.yaml global.
>
> ### Plantillas de instrucciones predefinidas
>
> ```python
> TRANSLATION_TEMPLATES = {
>     "YouTube Tech/AI": (
>         "YouTube tech/AI speech. Rules: "
>         "1) Informal Latin American Spanish, never Spain Spanish. "
>         "2) Convert ALL numbers to words (17=diecisiete, 2005=dos mil cinco). "
>         "3) Write English proper nouns phonetically in Spanish "
>         "(Apple=Ápol, Stanford=Stánford, Steve=Stív, Jobs=Yobs, iOS=ai-o-és). "
>         "4) Keep each subtitle SHORT and CONCISE, Spanish must not exceed "
>         "original English duration. "
>         "5) Never translate proper names, write them phonetically instead."
>     ),
>     "Entretenimiento": (
>         "Entertainment content. Rules: "
>         "1) Casual, natural Latin American Spanish. "
>         "2) Preserve humor and tone of the original. "
>         "3) Keep subtitles concise and natural-sounding. "
>         "4) Adapt idioms and expressions, don't translate literally."
>     ),
>     "Documental": (
>         "Documentary content. Rules: "
>         "1) Neutral, formal Latin American Spanish. "
>         "2) Preserve technical terms when no good Spanish equivalent exists. "
>         "3) Maintain the authoritative tone of the narrator. "
>         "4) Accuracy over style."
>     ),
>     "Personalizado": "",
> }
> ```
>
> Criterios de aceptación:
> - Flujo completo desde upload hasta video final funciona en la UI.
> - Cambiar backend en la UI cambia qué stage de traducción se ejecuta.
> - Plantillas se cargan correctamente en el campo editable.
> - Campo de API key aparece solo cuando se selecciona Gemini y no hay
>   variable de entorno configurada.
> - Logs visibles en tiempo real.

---

### MILESTONE 7 — Lip Sync con LTX-2.3-22b-IC-LoRA-LipDub

**Objetivo:** sincronizar los movimientos labiales del hablante original
con el nuevo audio en español, produciendo un doblaje visualmente convincente.

**Prompt para Claude Code:**

> Lee CLAUDE.md. Implementa el Milestone 7.
>
> 1. `scripts/download_models.sh`: agrega descarga del modelo base LTX-2.3
>    y el LoRA IC-LipDub desde HuggingFace.
>    Repo: `Lightricks/LTX-2.3-22b-IC-LoRA-LipDub`.
>    Revisar la model card para instrucciones de descarga y licencia
>    (`ltx-2-community-license`).
> 2. `videodub/stages/lipdub.py`:
>    - Toma `07_final.mp4` (video con audio doblado) como input.
>    - Carga el modelo LTX base + aplica el LoRA IC-LipDub.
>    - Procesa el video frame por frame sincronizando labios con el
>      audio español ya presente en `07_final.mp4`.
>    - Output: `08_lipdub.mp4`.
>    - Implementar procesamiento por segmentos si el video es largo
>      (para no saturar VRAM con videos > 30s).
>    - Sale después de completar todo el video.
> 3. Investigar el pipeline de diffusers para LTX-video e IC-LoRA:
>    - ¿Cómo se carga el LoRA sobre el modelo base con diffusers?
>    - ¿Cuánta VRAM consume con los 16 GB disponibles?
>    - ¿Requiere cuantización adicional para caber junto con el modelo base?
>    - Documentar hallazgos en comentarios del código.
> 4. Tests: procesar `sample_10s.mp4` con audio doblado y verificar que
>    `08_lipdub.mp4` es reproducible y los labios se mueven coherentemente.
>
> NOTAS TÉCNICAS:
> - LTX-2.3 base + IC-LoRA = ~22B parámetros. Con 16 GB de VRAM será
>    necesario cuantización (probablemente int8 o float8) o procesamiento
>    por chunks de video.
> - Este es el milestone más complejo en términos de VRAM. Si no cabe
>    en 16 GB, explorar: (a) cuantización agresiva del modelo base,
>    (b) CPU offload parcial con `device_map="auto"` de Accelerate,
>    (c) procesar en resolución reducida y upscale posterior.
> - El principio subprocess-per-stage aplica igual: este stage carga,
>    procesa y muere. La VRAM debe quedar libre al terminar.
> - Arxiv papers de referencia: 2601.03233 y 2601.22143.
>
> Criterios de aceptación:
> - Video `08_lipdub.mp4` es reproducible.
> - Los movimientos labiales son coherentes con el audio español.
> - VRAM se libera completamente al terminar el stage.
> - El stage no crashea por OOM en videos de hasta 60 segundos.

---

## 8. Modelos a descargar

```bash
# En scripts/download_models.sh

# WhisperX large-v3 (se descarga automático en primer uso)
# Demucs htdemucs_ft (auto-descarga)

# Qwen3.6 35B A3B IQ4_XS (~18.35 GB) — modelo MoE para traducción
# Offload: 24 capas GPU (~13.5 GB VRAM) + resto en RAM
huggingface-cli download bartowski/Qwen3.6-35B-A3B-GGUF \
  --include "*IQ4_XS*" \
  --local-dir models/llm/

# Fish Audio S2 Pro (~11 GB)
# Aceptar Fish Audio Research License manualmente primero
huggingface-cli download fishaudio/s2-pro --local-dir models/tts/fish-s2-pro/

# LTX-2.3-22b-IC-LoRA-LipDub (Milestone 7)
# Revisar licencia ltx-2-community-license antes de descargar
huggingface-cli download Lightricks/LTX-2.3-22b-IC-LoRA-LipDub \
  --local-dir models/lipdub/ltx-lipdub/
```

## 9. Resolución de problemas comunes

### "CUDA out of memory" al arrancar una etapa

- Verifica con `nvidia-smi` que no hay procesos zombie.
- Mata el escritorio gráfico si haces sesión intensiva:
  `sudo systemctl stop gdm` (libera ~500 MB).
- Para llama.cpp: reduce `-ngl` (actualmente 24) para poner menos capas en GPU.
- Para Fish S2: cambia a NF4 si no está ya activo.
- Para LTX LipDub: procesar en chunks más pequeños o reducir resolución.

### llama.cpp server no arranca

- ¿Compilado con CUDA? Verifica logs de cmake.
- ¿Suficiente VRAM? Con `-ngl 24` el modelo ocupa ~13.5 GB de VRAM.
  Si hay otros procesos, bajar a `-ngl 20` o menos.
- ¿Health check llega? `curl http://127.0.0.1:8080/health`.
- Qwen3 MoE puede requerir flags específicos; revisar model card de bartowski.
- Timeout de arranque es mayor que en modelos dense: esperar hasta 45s.

### VRAM no se libera entre etapas

- Confirma que el subprocess realmente murió: `ps aux | grep python`.
- Si queda un zombie, el `StageRunner` debe matar el árbol con `psutil`.
- Verifica que no haya un `llama-server` quedó corriendo en background.

### GEMINI_API_KEY no encontrada

- Obtener clave en https://aistudio.google.com/apikey (gratuito con cuenta Google).
- Agregar a `~/.bashrc`: `export GEMINI_API_KEY="tu_clave_aqui"` y hacer `source ~/.bashrc`.
- Verificar: `echo $GEMINI_API_KEY`.
- Alternativamente ingresarla en el campo de la UI al seleccionar backend Gemini.
- Si el error persiste con `free_quota=True`, esperar 1 minuto (límite de RPM del tier gratuito).

### WhisperX falla con audio corto

- Mínimo ~3 segundos. Para tests más cortos, usar Whisper directo
  sin alineamiento.

### LTX LipDub OOM en videos largos

- Verificar que el stage procesa por segmentos, no el video completo.
- Reducir resolución de input temporalmente para pruebas.
- Revisar si `device_map="auto"` de Accelerate resuelve el offload.

## 10. Anti-patterns (qué NUNCA hacer)

- ❌ Cargar dos modelos en GPU desde el mismo proceso Python.
- ❌ Usar `nvidia-ml-py` en el orquestador (crea contexto CUDA persistente).
- ❌ Confiar en `torch.cuda.empty_cache()` para liberar VRAM (no funciona
  completamente, ver sección 3).
- ❌ Pasar tensores entre etapas en memoria. Siempre disco.
- ❌ Usar `subprocess.run(..., shell=True)`. Riesgo de inyección y dificulta
  el manejo de árboles de procesos.
- ❌ Hacer "una mejora más" al modelfile esperando que un modelo más pequeño
  produzca traducciones naturales. El Qwen3.6 35B A3B ya está probado y
  funciona; no reemplazarlo sin benchmarks comparativos.
- ❌ Editar este CLAUDE.md sin actualizar el milestone correspondiente
  cuando algo cambia. El documento es la verdad viva del proyecto.

## 11. Para Claude Code: cómo iterar

1. Lee este archivo completo antes de cualquier acción.
2. Identifica el milestone actual del usuario.
3. Antes de implementar, lista los archivos que vas a crear/modificar y
   pide confirmación si hay decisiones de diseño no triviales.
4. Para cada cambio: implementa → corre tests → reporta.
5. Si encuentras un problema arquitectónico, detente y discútelo antes de
   workarounds. Este proyecto tiene principios (sección 3) que deben
   respetarse.
6. Actualiza este CLAUDE.md cuando agreguen decisiones nuevas (ej. versiones
   exactas, comandos que funcionaron, etc.).

---

*Última actualización: modelo LLM actualizado a Qwen3.6 35B A3B IQ4_XS (MoE,
bartowski GGUF, offload -ngl 24, probado en hardware). Milestone 7 agregado:
lip sync con LTX-2.3-22b-IC-LoRA-LipDub (Lightricks). Milestone 3 y 6
actualizados: traducción dual (Gemini API + Qwen local), plantillas de
instrucciones personalizables en UI. Hardware Ada Lovelace, Ubuntu 26.04.*
