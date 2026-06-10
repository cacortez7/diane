/* Diane app — layout parts: TopBar, UploadDropzone, SectionLabel. Exported to window. */
const { Badge, VramMeter } = window.DianeDesignSystem_fdee8c;
const { IconUpload, IconFilm, IconWaveform } = window;

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
        <img src="../../assets/diane-mark.svg" width="30" height="30" alt="" />
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
  return (
    <button
      type="button"
      onClick={() => onPick(file ? null : { name: 'jobs_keynote_2024.mp4', size: '184 MB', dur: '12:48', res: '1920×1080', source: 'upload' })}
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
      {filled ? (
        <span style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--green-bright)' }}>{file.name}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
            {file.res} · {file.dur} · {file.size} — clic para quitar
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

function Waveform({ bars = 60, height = 34 }) {
  const hs = [];
  for (let i = 0; i < bars; i++) {
    const v = Math.abs(Math.sin(i * 0.5) * Math.cos(i * 0.13) + 0.16 * Math.sin(i * 1.9));
    hs.push(0.16 + 0.84 * Math.min(1, v));
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, height }}>
      {hs.map((h, i) => (
        <span key={i} style={{ flex: 1, height: `${Math.round(h * 100)}%`, background: 'var(--green)', opacity: 0.45 + 0.55 * h, borderRadius: 1 }} />
      ))}
    </div>
  );
}

function ReferenceAudio({ audio, onLoad, onClear }) {
  if (audio) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SectionLabel hint={`${audio.dur} · zero-shot`}>Audio de referencia</SectionLabel>
        <div style={{ background: 'var(--green-deep)', border: '1px solid var(--green-dim)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ color: 'var(--green)', display: 'grid', placeItems: 'center' }}><IconWaveform size={18} /></span>
            <span style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--green-bright)' }}>{audio.name}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{audio.dur}</span>
            <button type="button" onClick={onClear} aria-label="Quitar" style={{ cursor: 'pointer', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 14, lineHeight: 1, padding: 2 }}>✕</button>
          </div>
          <Waveform />
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <SectionLabel hint="WAV/MP3 · 15–25 s">Audio de referencia</SectionLabel>
      <button type="button" onClick={onLoad} style={{
        width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
        padding: '12px 14px', background: 'var(--surface-inset)', border: '1px dashed var(--border-strong)',
        borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)',
        transition: 'border-color var(--dur-fast), background var(--dur-fast)' }}>
        <span style={{ color: 'var(--text-muted)', display: 'grid', placeItems: 'center' }}><IconWaveform size={22} /></span>
        <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-primary)' }}>Voz de referencia (opcional)</span>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.45 }}>si no se carga, se usa el audio original del video</span>
        </span>
      </button>
    </div>
  );
}

Object.assign(window, { SectionLabel, TopBar, UploadDropzone, ReferenceAudio, Waveform });
