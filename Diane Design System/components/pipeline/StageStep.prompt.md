**StageStep** — one row of the dubbing pipeline; stages turn green as they finish. Stack several for the full run.

```jsx
<StageStep index={2} name="separate_vocals" device="GPU" status="done"  duration="8.4s" detail="Demucs htdemucs_ft · Δ VRAM +0" />
<StageStep index={3} name="transcribe"      device="GPU" status="running" detail="WhisperX large-v3 · word-level" />
<StageStep index={4} name="translate"       device="GPU" status="pending" detail="Qwen 35B · -ngl 24" />
<StageStep index={5} name="synthesize"      device="GPU" status="cached"  duration="—" detail="hash hit · sin re-ejecutar" />
```

Statuses: `pending | running | done | error | cached`. `device` renders a GPU (green) or CPU (amber) tag. `cached` = a hash-cache skip.
