import React from 'react';

const STYLE_ID = 'dn-badge-styles';
function useStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .dn-badge {
    --_fg: var(--text-secondary);
    --_bg: var(--surface-2);
    --_bd: var(--border-default);
    display: inline-flex; align-items: center; gap: var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--text-2xs);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-wide);
    line-height: 1;
    padding: 4px 8px;
    border-radius: var(--radius-sm);
    border: var(--border-hairline) solid var(--_bd);
    background: var(--_bg);
    color: var(--_fg);
    white-space: nowrap;
  }
  .dn-badge--uppercase { text-transform: uppercase; letter-spacing: var(--tracking-caps); }
  .dn-badge__dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex: none; }
  .dn-badge__dot--pulse { animation: diane-pulse var(--blink) var(--ease-in-out) infinite; }

  .dn-badge--neutral { --_fg: var(--text-secondary); --_bg: var(--surface-2); --_bd: var(--border-default); }
  .dn-badge--green  { --_fg: var(--green-bright);  --_bg: var(--green-deep);  --_bd: rgba(70,224,143,0.35); }
  .dn-badge--cyan   { --_fg: var(--cyan-bright);   --_bg: var(--cyan-deep);   --_bd: rgba(65,207,224,0.35); }
  .dn-badge--amber  { --_fg: var(--amber);         --_bg: var(--amber-deep);  --_bd: rgba(243,177,61,0.35); }
  .dn-badge--red    { --_fg: var(--red-bright);    --_bg: var(--red-deep);    --_bd: rgba(242,104,94,0.38); }
  .dn-badge--violet { --_fg: var(--violet);        --_bg: var(--violet-deep); --_bd: rgba(183,148,246,0.35); }
  .dn-badge--blue   { --_fg: var(--blue);          --_bg: var(--blue-deep);   --_bd: rgba(90,169,240,0.35); }

  /* outline variant: transparent bg */
  .dn-badge--outline { background: transparent; }
  `;
  document.head.appendChild(el);
}

export function Badge({
  children,
  tone = 'neutral',
  dot = false,
  pulse = false,
  outline = false,
  uppercase = false,
  className = '',
  ...rest
}) {
  useStyles();
  const cls = [
    'dn-badge',
    `dn-badge--${tone}`,
    outline ? 'dn-badge--outline' : '',
    uppercase ? 'dn-badge--uppercase' : '',
    className,
  ].filter(Boolean).join(' ');
  return (
    <span className={cls} {...rest}>
      {dot && <span className={`dn-badge__dot${pulse ? ' dn-badge__dot--pulse' : ''}`} aria-hidden="true" />}
      {children}
    </span>
  );
}
