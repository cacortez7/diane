import React from 'react';

const STYLE_ID = 'dn-term-styles';
function useStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .dn-term {
    background: var(--surface-inset);
    border-radius: var(--radius-md);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    line-height: var(--leading-code);
    color: var(--text-secondary);
    padding: var(--space-3) var(--space-4);
    overflow-y: auto;
    -webkit-font-smoothing: antialiased;
    font-variant-numeric: tabular-nums;
  }
  .dn-term__line { display: flex; gap: var(--space-3); white-space: pre-wrap; word-break: break-word; padding: 1px 0; }
  .dn-term__ts { color: var(--text-faint); flex: none; }
  .dn-term__lvl { flex: none; width: 5ch; text-transform: uppercase; letter-spacing: 0.04em; }
  .dn-term__msg { flex: 1; min-width: 0; }
  .dn-term__msg b { color: var(--text-primary); font-weight: var(--weight-semibold); }

  .dn-term__line--info    .dn-term__lvl { color: var(--cyan); }
  .dn-term__line--info    .dn-term__msg { color: var(--text-secondary); }
  .dn-term__line--success .dn-term__lvl,
  .dn-term__line--success .dn-term__msg { color: var(--green-bright); }
  .dn-term__line--warn    .dn-term__lvl,
  .dn-term__line--warn    .dn-term__msg { color: var(--amber); }
  .dn-term__line--error   .dn-term__lvl,
  .dn-term__line--error   .dn-term__msg { color: var(--red-bright); }
  .dn-term__line--debug   .dn-term__lvl { color: var(--text-faint); }
  .dn-term__line--debug   .dn-term__msg { color: var(--text-muted); }
  .dn-term__line--stage   .dn-term__lvl { color: var(--violet); }
  .dn-term__line--stage   .dn-term__msg { color: var(--violet); }

  .dn-term__cursor {
    display: inline-block; width: 8px; height: 1.05em; vertical-align: text-bottom;
    background: var(--green); margin-left: 2px;
    animation: diane-blink var(--blink) step-end infinite;
    box-shadow: var(--glow-text-green);
  }
  `;
  document.head.appendChild(el);
}

const LEVEL_TAG = { info: 'INFO', success: 'OK', warn: 'WARN', error: 'ERR', debug: 'DBG', stage: '»' };

function renderMsg(msg) {
  if (typeof msg !== 'string') return msg;
  // lightweight **bold** support
  const parts = msg.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**') ? <b key={i}>{p.slice(2, -2)}</b> : <React.Fragment key={i}>{p}</React.Fragment>
  );
}

export function Terminal({
  lines = [],
  showCursor = false,
  showLevel = true,
  height = 260,
  className = '',
}) {
  useStyles();
  const norm = lines.map((l) => (typeof l === 'string' ? { msg: l, level: 'info' } : l));
  return (
    <div className={['dn-term', className].filter(Boolean).join(' ')} style={{ maxHeight: height }}>
      {norm.map((l, i) => (
        <div key={i} className={`dn-term__line dn-term__line--${l.level || 'info'}`}>
          {l.ts && <span className="dn-term__ts">[{l.ts}]</span>}
          {showLevel && <span className="dn-term__lvl">{LEVEL_TAG[l.level || 'info'] || ''}</span>}
          <span className="dn-term__msg">
            {renderMsg(l.msg)}
            {showCursor && i === norm.length - 1 && <span className="dn-term__cursor" aria-hidden="true" />}
          </span>
        </div>
      ))}
      {showCursor && norm.length === 0 && (
        <div className="dn-term__line dn-term__line--info">
          <span className="dn-term__msg"><span className="dn-term__cursor" aria-hidden="true" /></span>
        </div>
      )}
    </div>
  );
}
