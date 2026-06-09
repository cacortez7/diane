import React from 'react';

const STYLE_ID = 'dn-stage-styles';
function useStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .dn-stage {
    --_c: var(--stage-pending);
    display: flex; align-items: center; gap: var(--space-3);
    padding: 10px var(--space-3);
    background: var(--surface-2);
    border: var(--border-hairline) solid var(--border-subtle);
    border-left: 2px solid var(--_c);
    border-radius: var(--radius-sm);
    transition: background var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out);
  }
  .dn-stage--running { --_c: var(--stage-running); background: var(--surface-3); box-shadow: inset 2px 0 12px -6px var(--cyan); }
  .dn-stage--done    { --_c: var(--stage-done); }
  .dn-stage--error   { --_c: var(--stage-error); background: var(--red-deep); }
  .dn-stage--cached  { --_c: var(--stage-cached); }
  .dn-stage--pending { opacity: 0.62; }

  .dn-stage__idx {
    font-family: var(--font-mono); font-size: var(--text-2xs);
    color: var(--text-faint); width: 18px; text-align: right; flex: none;
  }
  .dn-stage__icon { width: 16px; height: 16px; flex: none; display: grid; place-items: center; color: var(--_c); }
  .dn-stage__icon svg { display: block; }
  .dn-stage__spin {
    width: 13px; height: 13px; border-radius: 50%;
    border: 2px solid currentColor; border-top-color: transparent;
    animation: diane-spin 0.7s linear infinite;
  }
  .dn-stage__dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
  .dn-stage__main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
  .dn-stage__name {
    font-family: var(--font-mono); font-size: var(--text-sm); font-weight: var(--weight-medium);
    color: var(--text-primary);
  }
  .dn-stage--pending .dn-stage__name { color: var(--text-secondary); }
  .dn-stage--done .dn-stage__name { color: var(--green-bright); }
  .dn-stage--running .dn-stage__name { color: var(--cyan-bright); }
  .dn-stage--error .dn-stage__name { color: var(--red-bright); }
  .dn-stage__sub {
    font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--text-muted);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .dn-stage__meta { display: flex; align-items: center; gap: var(--space-3); flex: none; }
  .dn-stage__device {
    font-family: var(--font-mono); font-size: var(--text-2xs);
    letter-spacing: var(--tracking-wide);
    padding: 2px 6px; border-radius: var(--radius-xs);
    border: var(--border-hairline) solid var(--border-default);
    color: var(--text-secondary);
  }
  .dn-stage__device--gpu { color: var(--green-bright); border-color: rgba(70,224,143,0.3); }
  .dn-stage__device--cpu { color: var(--amber); border-color: rgba(243,177,61,0.3); }
  .dn-stage__time { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--text-muted); min-width: 44px; text-align: right; }
  `;
  document.head.appendChild(el);
}

function StatusIcon({ status }) {
  if (status === 'running') return <span className="dn-stage__spin" />;
  if (status === 'done') return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 8l3 3 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
  );
  if (status === 'error') return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M4 4l6 6M10 4l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
  );
  if (status === 'cached') return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2.5 7.5a5 5 0 1 0 1.3-3.4M3 1.5v3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  );
  return <span className="dn-stage__dot" />;
}

export function StageStep({
  name,
  status = 'pending',
  device = null,        // 'GPU' | 'CPU'
  index = null,
  detail = null,        // e.g. "Δ VRAM +0 MiB" or model name
  duration = null,      // e.g. "1.2s"
  className = '',
}) {
  useStyles();
  return (
    <div className={['dn-stage', `dn-stage--${status}`, className].filter(Boolean).join(' ')}>
      {index != null && <span className="dn-stage__idx">{String(index).padStart(2, '0')}</span>}
      <span className="dn-stage__icon"><StatusIcon status={status} /></span>
      <span className="dn-stage__main">
        <span className="dn-stage__name">{name}</span>
        {detail && <span className="dn-stage__sub">{detail}</span>}
      </span>
      <span className="dn-stage__meta">
        {device && (
          <span className={`dn-stage__device dn-stage__device--${device.toLowerCase()}`}>{device}</span>
        )}
        {duration && <span className="dn-stage__time">{duration}</span>}
      </span>
    </div>
  );
}
