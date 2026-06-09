**Terminal** — live log pane mirroring Diane's `rich` stderr output (dim timestamps, level tag, ANSI-colored messages). Drop it in a `Card` with `flushBody`.

```jsx
<Terminal showCursor lines={[
  { ts: '14:32:01', level: 'info',    msg: 'job **a1f9c2…** → workspace/a1f9c2…' },
  { ts: '14:32:01', level: 'stage',   msg: '→ etapa separate_vocals | VRAM antes: 412 MiB' },
  { ts: '14:32:09', level: 'success', msg: '← separate_vocals | rc=0 | 8.4s | Δ VRAM +0' },
  { ts: '14:32:09', level: 'warn',    msg: 'VRAM no volvió al baseline: 690 MiB' },
  { ts: '14:33:40', level: 'error',   msg: 'Etapa translate falló (rc=1)' },
]} />
```

Levels: `info` (cyan), `success` (green), `warn` (amber), `error` (red), `debug` (faint), `stage` (violet). `**bold**` is supported inside `msg`.
