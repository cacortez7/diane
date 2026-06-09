**Card** — surface panel with an optional terminal-style title bar (monospace title, optional window dots, right-aligned actions).

```jsx
<Card title={<>~/workspace/<b>a1f9…</b>/07_final.mp4</>} terminalDots
      actions={<Button size="sm" variant="ghost">Descargar</Button>}>
  …content…
</Card>

<Card title="REGISTRO EN VIVO" flushBody>
  <Terminal lines={lines} />
</Card>
```

Use `flushBody` for full-bleed content (logs, video, tables), `terminalDots` to lean into the window metaphor, `shadow={false}` for nested/flat panels.
