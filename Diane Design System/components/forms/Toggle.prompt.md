**Toggle** — binary switch with a phosphor-green on-state, for boolean config flags.

```jsx
const [lipsync, setLipsync] = React.useState(false);
<Toggle checked={lipsync} onChange={setLipsync} label="Lip sync (LTX)" />
```
