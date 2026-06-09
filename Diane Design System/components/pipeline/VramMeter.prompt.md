**VramMeter** — GPU memory gauge in MiB; glows green/amber/red by pressure. Use it in the run header to show VRAM rising during a stage and falling back to idle after.

```jsx
<VramMeter used={13824} total={16384} />   {/* Qwen offload, ~13.5 GB → amber */}
<VramMeter used={420}   total={16384} />   {/* idle between stages → green */}
```

`used`/`total` are in MiB (16 GB = 16384). Thresholds: amber ≥72%, red ≥90%.
