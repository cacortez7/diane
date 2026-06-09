**Badge** — a compact monospace status token for tags, exit codes, precision flags, device labels.

```jsx
<Badge tone="green" dot>rc=0</Badge>
<Badge tone="cyan" dot pulse uppercase>running</Badge>
<Badge tone="amber" uppercase>GPU · 6 GB</Badge>
<Badge tone="violet">Qwen 35B</Badge>
<Badge tone="neutral" outline>BF16</Badge>
```

Tones follow the ANSI accent set: `green` (ok/done), `cyan` (active), `amber` (warn/CPU), `red` (error), `violet` (LLM), `blue` (info), `neutral`. Add `dot` for a status dot and `pulse` to animate it while running.
