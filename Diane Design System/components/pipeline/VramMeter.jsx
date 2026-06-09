import React from 'react';

const STYLE_ID = 'dn-vram-styles';
function useStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .dn-vram { display: flex; flex-direction: column; gap: 6px; font-family: var(--font-mono); }
  .dn-vram__head { display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-3); }
  .dn-vram__label {
    font-size: var(--text-2xs); text-transform: uppercase; letter-spacing: var(--tracking-caps);
    color: var(--text-secondary); display: flex; align-items: center; gap: var(--space-2);
  }
  .dn-vram__nums { font-size: var(--text-xs); color: var(--text-secondary); font-variant-numeric: tabular-nums; }
  .dn-vram__nums b { color: var(--_c); font-weight: var(--weight-semibold); }
  .dn-vram__track {
    position: relative; height: 10px; border-radius: var(--radius-pill);
    background: var(--surface-inset);
    border: var(--border-hairline) solid var(--border-subtle);
    overflow: hidden;
  }
  .dn-vram__fill {
    position: absolute; inset: 0 auto 0 0; height: 100%;
    background: var(--_c);
    border-radius: var(--radius-pill);
    box-shadow: 0 0 12px -1px var(--_c);
    transition: width var(--dur-slow) var(--ease-out), background var(--dur-base) var(--ease-out);
  }
  .dn-vram__fill::after {
    content: ''; position: absolute; inset: 0;
    background-image: repeating-linear-gradient(90deg, rgba(0,0,0,0.18) 0 2px, transparent 2px 6px);
    opacity: 0.5;
  }
  .dn-vram__cap { display: flex; justify-content: space-between; font-size: var(--text-2xs); color: var(--text-faint); }
  `;
  document.head.appendChild(el);
}

function fmt(mib) {
  return (mib / 1024).toFixed(1);
}

export function VramMeter({
  used = 0,        // MiB
  total = 16384,   // MiB (16 GB)
  label = 'VRAM',
  unit = 'GB',
  className = '',
}) {
  useStyles();
  const pct = Math.max(0, Math.min(100, (used / total) * 100));
  const color = pct >= 90 ? 'var(--red)' : pct >= 72 ? 'var(--amber)' : 'var(--green)';
  return (
    <div className={['dn-vram', className].filter(Boolean).join(' ')} style={{ '--_c': color }}>
      <div className="dn-vram__head">
        <span className="dn-vram__label">{label}</span>
        <span className="dn-vram__nums"><b>{fmt(used)}</b> / {fmt(total)} {unit} · {pct.toFixed(0)}%</span>
      </div>
      <div className="dn-vram__track" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <div className="dn-vram__fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="dn-vram__cap">
        <span>RTX 4070 Ti SUPER</span>
        <span>{fmt(total - used)} {unit} libre</span>
      </div>
    </div>
  );
}
