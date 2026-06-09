/* Diane app — layout parts: TopBar, UploadDropzone, SectionLabel. Exported to window. */
const { Badge, VramMeter } = window.DianeDesignSystem_fdee8c;
const { IconUpload, IconFilm } = window;

function SectionLabel({ children, hint }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', textTransform: 'uppercase',
        letterSpacing: 'var(--tracking-caps)', color: 'var(--text-secondary)' }}>{children}</span>
      {hint && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--text-faint)' }}>{hint}</span>}
    </div>
  );
}

function TopBar({ vramUsed, vramTotal }) {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 'var(--space-5)',
      padding: '12px 22px', borderBottom: '1px solid var(--border-subtle)',
      background: 'linear-gradient(var(--surface-1), var(--bg-canvas))',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src="assets/diane-mark.svg" width="30" height="30" alt="" />
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 22, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>diane</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: 'var(--tracking-wide)' }}>EN&nbsp;→&nbsp;ES-419</span>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ width: 230 }}>
        <VramMeter used={vramUsed} total={vramTotal} />
      </div>
      <Badge tone="neutral" outline>localhost:7860</Badge>
    </header>
  );
}

function UploadDropzone({ file, onPick }) {
  const filled = !!file;
  const inputRef = React.useRef(null);
  const pick = () => {
    if (filled) { onPick(null); return; }
    if (inputRef.current) inputRef.current.click();
  };
  const onFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) onPick(f);
    e.target.value = '';
  };
  return (
    <button
      type="button"
      onClick={pick}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const f = e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) onPick(f);
      }}
      style={{
        width: '100%', textAlign: 'left', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
        padding: filled ? '14px 16px' : '26px 18px',
        background: filled ? 'var(--green-deep)' : 'var(--surface-inset)',
        border: `1px ${filled ? 'solid' : 'dashed'} ${filled ? 'var(--green-dim)' : 'var(--border-strong)'}`,
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-secondary)',
        transition: 'border-color var(--dur-fast), background var(--dur-fast)',
      }}>
      <span style={{ color: filled ? 'var(--green)' : 'var(--text-muted)', display: 'grid', placeItems: 'center' }}>
        {filled ? <IconFilm size={26} /> : <IconUpload size={26} />}
      </span>
      <input ref={inputRef} type="file" accept="video/mp4,video/*" style={{ display: 'none' }} onChange={onFile} />
      {filled ? (
        <span style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--green-bright)' }}>{file.name}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
            {file.size ? `${(file.size / 1048576).toFixed(1)} MB · ` : ''}clic para quitar
          </span>
        </span>
      ) : (
        <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-primary)' }}>Arrastra un video MP4 aquí</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>o clic para seleccionar · H.264 recomendado</span>
        </span>
      )}
    </button>
  );
}

Object.assign(window, { SectionLabel, TopBar, UploadDropzone });
