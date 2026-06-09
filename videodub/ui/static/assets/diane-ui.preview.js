/* AUTO-GENERATED preview runtime for Diane DS.
 * NOT the compiler bundle (_ds_bundle.js). Built from the canonical
 * components/*.jsx sources with import/export stripped and each wrapped in an
 * IIFE, assigned to window.DianeDesignSystem_fdee8c. Lets the @dsCard cards and
 * the UI kit render in preview where the compiled bundle isn't served.
 * Regenerate with the run_script that created it after editing any component. */
window.DianeDesignSystem_fdee8c = window.DianeDesignSystem_fdee8c || {};

;(function(){

/* Inject component styles once. */
const STYLE_ID = 'dn-button-styles';
function useStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .dn-btn {
    --_bg: var(--surface-2);
    --_fg: var(--text-primary);
    --_bd: var(--border-default);
    display: inline-flex; align-items: center; justify-content: center;
    gap: var(--space-2);
    font-family: var(--font-ui);
    font-weight: var(--weight-medium);
    line-height: 1;
    white-space: nowrap;
    border: var(--border-hairline) solid var(--_bd);
    background: var(--_bg);
    color: var(--_fg);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: background var(--dur-fast) var(--ease-out),
                border-color var(--dur-fast) var(--ease-out),
                box-shadow var(--dur-fast) var(--ease-out),
                transform var(--dur-fast) var(--ease-out);
    -webkit-font-smoothing: antialiased;
    user-select: none;
  }
  .dn-btn:focus-visible { outline: none; box-shadow: var(--ring); }
  .dn-btn:active:not(:disabled) { transform: translateY(1px); }
  .dn-btn:disabled { opacity: 0.42; cursor: not-allowed; }
  .dn-btn--block { width: 100%; }

  /* sizes */
  .dn-btn--sm { font-size: var(--text-xs); padding: 6px 10px; }
  .dn-btn--md { font-size: var(--text-sm); padding: 9px 14px; }
  .dn-btn--lg { font-size: var(--text-base); padding: 12px 20px; }

  /* primary — phosphor green fill, glow on hover */
  .dn-btn--primary {
    --_bg: var(--green); --_fg: var(--text-on-accent); --_bd: var(--green);
    font-weight: var(--weight-semibold);
  }
  .dn-btn--primary:hover:not(:disabled) {
    --_bg: var(--green-bright); --_bd: var(--green-bright);
    box-shadow: var(--glow-green);
  }

  /* secondary — bordered, fills on hover */
  .dn-btn--secondary { --_bg: var(--surface-2); --_fg: var(--text-primary); --_bd: var(--border-strong); }
  .dn-btn--secondary:hover:not(:disabled) { --_bg: var(--surface-3); --_bd: var(--green-dim); --_fg: var(--green-bright); }

  /* ghost — no chrome until hover */
  .dn-btn--ghost { --_bg: transparent; --_fg: var(--text-secondary); --_bd: transparent; }
  .dn-btn--ghost:hover:not(:disabled) { --_bg: var(--surface-2); --_fg: var(--text-primary); }

  /* danger */
  .dn-btn--danger { --_bg: transparent; --_fg: var(--red); --_bd: var(--red-dim); }
  .dn-btn--danger:hover:not(:disabled) { --_bg: var(--red-deep); --_fg: var(--red-bright); --_bd: var(--red); }

  .dn-btn__spinner {
    width: 1em; height: 1em; border-radius: 50%;
    border: 2px solid currentColor; border-top-color: transparent;
    animation: diane-spin 0.7s linear infinite;
  }
  .dn-btn__icon { display: inline-flex; font-size: 1.05em; }
  `;
  document.head.appendChild(el);
}

function Button({
  children,
  variant = 'secondary',
  size = 'md',
  block = false,
  loading = false,
  disabled = false,
  leadingIcon = null,
  trailingIcon = null,
  type = 'button',
  className = '',
  ...rest
}) {
  useStyles();
  const cls = [
    'dn-btn',
    `dn-btn--${variant}`,
    `dn-btn--${size}`,
    block ? 'dn-btn--block' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button type={type} className={cls} disabled={disabled || loading} {...rest}>
      {loading && <span className="dn-btn__spinner" aria-hidden="true" />}
      {!loading && leadingIcon && <span className="dn-btn__icon">{leadingIcon}</span>}
      {children}
      {!loading && trailingIcon && <span className="dn-btn__icon">{trailingIcon}</span>}
    </button>
  );
}

window.DianeDesignSystem_fdee8c.Button = Button;
})();

;(function(){

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

function Badge({
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

window.DianeDesignSystem_fdee8c.Badge = Badge;
})();

;(function(){

const STYLE_ID = 'dn-card-styles';
function useStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .dn-card {
    background: var(--surface-1);
    border: var(--border-hairline) solid var(--border-subtle);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-panel);
    overflow: hidden;
  }
  .dn-card--flush { box-shadow: none; }
  .dn-card__bar {
    display: flex; align-items: center; gap: var(--space-3);
    padding: 10px var(--space-4);
    border-bottom: var(--border-hairline) solid var(--border-subtle);
    background: linear-gradient(var(--surface-2), var(--surface-1));
  }
  .dn-card__dots { display: inline-flex; gap: 6px; }
  .dn-card__dot { width: 9px; height: 9px; border-radius: 50%; background: var(--border-strong); }
  .dn-card__title {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--text-secondary);
    letter-spacing: var(--tracking-wide);
    margin: 0;
    flex: 1; min-width: 0;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .dn-card__title b { color: var(--text-primary); font-weight: var(--weight-semibold); }
  .dn-card__actions { display: inline-flex; align-items: center; gap: var(--space-2); }
  .dn-card__body { padding: var(--space-5); }
  .dn-card__body--flush { padding: 0; }
  `;
  document.head.appendChild(el);
}

function Card({
  children,
  title = null,
  terminalDots = false,
  actions = null,
  flushBody = false,
  shadow = true,
  className = '',
  bodyClassName = '',
  ...rest
}) {
  useStyles();
  const cls = ['dn-card', shadow ? '' : 'dn-card--flush', className].filter(Boolean).join(' ');
  const hasBar = title != null || terminalDots || actions != null;
  return (
    <section className={cls} {...rest}>
      {hasBar && (
        <header className="dn-card__bar">
          {terminalDots && (
            <span className="dn-card__dots" aria-hidden="true">
              <span className="dn-card__dot" /><span className="dn-card__dot" /><span className="dn-card__dot" />
            </span>
          )}
          {title != null && <p className="dn-card__title">{title}</p>}
          {actions != null && <span className="dn-card__actions">{actions}</span>}
        </header>
      )}
      <div className={`dn-card__body${flushBody ? ' dn-card__body--flush' : ''} ${bodyClassName}`.trim()}>
        {children}
      </div>
    </section>
  );
}

window.DianeDesignSystem_fdee8c.Card = Card;
})();

;(function(){

const STYLE_ID = 'dn-seg-styles';
function useStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .dn-seg {
    display: inline-flex;
    padding: 3px;
    gap: 2px;
    background: var(--surface-inset);
    border: var(--border-hairline) solid var(--border-subtle);
    border-radius: var(--radius-md);
  }
  .dn-seg--block { display: flex; width: 100%; }
  .dn-seg__opt {
    flex: 1;
    appearance: none; border: none; background: transparent;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    color: var(--text-secondary);
    padding: 7px 14px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    white-space: nowrap;
    display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2);
    transition: color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out);
  }
  .dn-seg__opt:hover:not(.dn-seg__opt--on) { color: var(--text-primary); }
  .dn-seg__opt--on {
    background: var(--surface-3);
    color: var(--green-bright);
    box-shadow: inset 0 0 0 1px rgba(70,224,143,0.30);
  }
  .dn-seg__opt:focus-visible { outline: none; box-shadow: var(--ring); }
  .dn-seg__opt:disabled { opacity: 0.4; cursor: not-allowed; }
  `;
  document.head.appendChild(el);
}

function SegmentedControl({
  options = [],
  value,
  onChange = () => {},
  block = false,
  name,
  className = '',
}) {
  useStyles();
  const norm = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  return (
    <div className={['dn-seg', block ? 'dn-seg--block' : '', className].filter(Boolean).join(' ')} role="tablist">
      {norm.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={on}
            name={name}
            disabled={o.disabled}
            className={`dn-seg__opt${on ? ' dn-seg__opt--on' : ''}`}
            onClick={() => onChange(o.value)}
          >
            {o.icon && <span aria-hidden="true">{o.icon}</span>}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

window.DianeDesignSystem_fdee8c.SegmentedControl = SegmentedControl;
})();

;(function(){

const STYLE_ID = 'dn-radiocards-styles';
function useStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .dn-rc { display: flex; flex-direction: column; gap: var(--space-2); }
  .dn-rc--row { flex-direction: row; }
  .dn-rc--row .dn-rc__opt { flex: 1; }
  .dn-rc__opt {
    display: flex; align-items: flex-start; gap: var(--space-3);
    text-align: left;
    padding: var(--space-3) var(--space-4);
    background: var(--surface-2);
    border: var(--border-hairline) solid var(--border-default);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: border-color var(--dur-fast) var(--ease-out),
                background var(--dur-fast) var(--ease-out),
                box-shadow var(--dur-fast) var(--ease-out);
  }
  .dn-rc__opt:hover:not(.dn-rc__opt--on) { border-color: var(--border-strong); background: var(--surface-3); }
  .dn-rc__opt--on {
    border-color: var(--green-dim);
    background: var(--green-deep);
    box-shadow: var(--glow-green);
  }
  .dn-rc__opt:focus-visible { outline: none; box-shadow: var(--ring); }
  .dn-rc__opt:disabled { opacity: 0.45; cursor: not-allowed; }
  .dn-rc__radio {
    width: 16px; height: 16px; margin-top: 1px; flex: none;
    border-radius: 50%;
    border: 2px solid var(--border-strong);
    display: grid; place-items: center;
    transition: border-color var(--dur-fast) var(--ease-out);
  }
  .dn-rc__opt--on .dn-rc__radio { border-color: var(--green); }
  .dn-rc__radio::after {
    content: ''; width: 7px; height: 7px; border-radius: 50%;
    background: var(--green); transform: scale(0);
    transition: transform var(--dur-fast) var(--ease-out);
    box-shadow: var(--glow-text-green);
  }
  .dn-rc__opt--on .dn-rc__radio::after { transform: scale(1); }
  .dn-rc__text { min-width: 0; }
  .dn-rc__label {
    font-family: var(--font-mono); font-size: var(--text-sm);
    font-weight: var(--weight-medium); color: var(--text-primary);
    display: flex; align-items: center; gap: var(--space-2);
  }
  .dn-rc__opt--on .dn-rc__label { color: var(--green-bright); }
  .dn-rc__desc {
    font-family: var(--font-sans); font-size: var(--text-xs);
    color: var(--text-secondary); margin-top: 3px; line-height: var(--leading-snug);
  }
  `;
  document.head.appendChild(el);
}

function RadioCards({
  options = [],
  value,
  onChange = () => {},
  row = false,
  className = '',
}) {
  useStyles();
  return (
    <div className={['dn-rc', row ? 'dn-rc--row' : '', className].filter(Boolean).join(' ')} role="radiogroup">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={o.disabled}
            className={`dn-rc__opt${on ? ' dn-rc__opt--on' : ''}`}
            onClick={() => onChange(o.value)}
          >
            <span className="dn-rc__radio" aria-hidden="true" />
            <span className="dn-rc__text">
              <span className="dn-rc__label">{o.label}{o.badge}</span>
              {o.description && <span className="dn-rc__desc">{o.description}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

window.DianeDesignSystem_fdee8c.RadioCards = RadioCards;
})();

;(function(){

const STYLE_ID = 'dn-select-styles';
function useStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .dn-select { display: flex; flex-direction: column; gap: 6px; position: relative; }
  .dn-select__label {
    font-family: var(--font-mono); font-size: var(--text-2xs);
    text-transform: uppercase; letter-spacing: var(--tracking-caps);
    color: var(--text-secondary);
  }
  .dn-select__trigger {
    display: flex; align-items: center; gap: var(--space-3);
    width: 100%; text-align: left;
    background: var(--surface-inset);
    border: var(--border-hairline) solid var(--border-default);
    border-radius: var(--radius-md);
    color: var(--text-primary);
    font-family: var(--font-mono); font-size: var(--text-sm);
    padding: 10px 12px; cursor: pointer;
    transition: border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out);
  }
  .dn-select__trigger:hover { border-color: var(--border-strong); }
  .dn-select__trigger:focus-visible { outline: none; border-color: var(--green-dim); box-shadow: var(--glow-green); }
  .dn-select__trigger[aria-expanded="true"] { border-color: var(--green-dim); box-shadow: var(--glow-green); }
  .dn-select__value { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .dn-select__value--ph { color: var(--text-faint); }
  .dn-select__chev { color: var(--text-muted); transition: transform var(--dur-fast) var(--ease-out); flex: none; }
  .dn-select__trigger[aria-expanded="true"] .dn-select__chev { transform: rotate(180deg); color: var(--green); }
  .dn-select__menu {
    position: absolute; top: calc(100% + 6px); left: 0; right: 0; z-index: 40;
    background: var(--surface-2);
    border: var(--border-hairline) solid var(--border-strong);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-pop);
    padding: 4px; max-height: 280px; overflow-y: auto;
  }
  .dn-select__opt {
    display: flex; align-items: center; gap: var(--space-2);
    width: 100%; text-align: left;
    background: transparent; border: none; cursor: pointer;
    color: var(--text-secondary);
    font-family: var(--font-mono); font-size: var(--text-sm);
    padding: 8px 10px; border-radius: var(--radius-sm);
  }
  .dn-select__opt:hover { background: var(--surface-3); color: var(--text-primary); }
  .dn-select__opt--on { color: var(--green-bright); }
  .dn-select__check { margin-left: auto; color: var(--green); opacity: 0; }
  .dn-select__opt--on .dn-select__check { opacity: 1; }
  `;
  document.head.appendChild(el);
}

function Select({
  label,
  options = [],
  value,
  onChange = () => {},
  placeholder = 'Seleccionar…',
  id,
  className = '',
}) {
  useStyles();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const norm = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  const current = norm.find((o) => o.value === value);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div className={['dn-select', className].filter(Boolean).join(' ')} ref={ref}>
      {label && <span className="dn-select__label">{label}</span>}
      <button
        type="button" id={id}
        className="dn-select__trigger"
        aria-haspopup="listbox" aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`dn-select__value${current ? '' : ' dn-select__value--ph'}`}>
          {current ? current.label : placeholder}
        </span>
        <svg className="dn-select__chev" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="dn-select__menu" role="listbox">
          {norm.map((o) => (
            <button
              key={o.value}
              type="button" role="option" aria-selected={o.value === value}
              className={`dn-select__opt${o.value === value ? ' dn-select__opt--on' : ''}`}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              {o.label}
              <svg className="dn-select__check" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2.5 6.5 5 9l4.5-5.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

window.DianeDesignSystem_fdee8c.Select = Select;
})();

;(function(){

const STYLE_ID = 'dn-field-styles';
function useStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .dn-field { display: flex; flex-direction: column; gap: 6px; }
  .dn-field__label {
    font-family: var(--font-mono); font-size: var(--text-2xs);
    text-transform: uppercase; letter-spacing: var(--tracking-caps);
    color: var(--text-secondary);
    display: flex; align-items: center; gap: var(--space-2);
  }
  .dn-field__req { color: var(--green); }
  .dn-field__wrap {
    display: flex; align-items: stretch;
    background: var(--surface-inset);
    border: var(--border-hairline) solid var(--border-default);
    border-radius: var(--radius-md);
    transition: border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out);
    overflow: hidden;
  }
  .dn-field__wrap:focus-within { border-color: var(--green-dim); box-shadow: var(--glow-green); }
  .dn-field__wrap--error { border-color: var(--red-dim); }
  .dn-field__wrap--error:focus-within { box-shadow: var(--glow-red); }
  .dn-field__prefix {
    display: flex; align-items: center; padding: 0 0 0 12px;
    font-family: var(--font-mono); font-size: var(--text-sm); color: var(--text-muted);
    user-select: none;
  }
  .dn-field__input, .dn-field__textarea {
    flex: 1; width: 100%;
    appearance: none; background: transparent; border: none; outline: none;
    color: var(--text-primary);
    font-family: var(--font-mono); font-size: var(--text-sm);
    padding: 10px 12px;
  }
  .dn-field__textarea { font-family: var(--font-sans); line-height: var(--leading-relaxed); resize: vertical; min-height: 92px; }
  .dn-field__input::placeholder, .dn-field__textarea::placeholder { color: var(--text-faint); }
  .dn-field__input:disabled, .dn-field__textarea:disabled { color: var(--text-muted); cursor: not-allowed; }
  .dn-field__help { font-family: var(--font-sans); font-size: var(--text-xs); color: var(--text-muted); }
  .dn-field__help--error { color: var(--red-bright); font-family: var(--font-mono); }
  `;
  document.head.appendChild(el);
}

function TextField({
  label,
  value,
  onChange = () => {},
  placeholder = '',
  multiline = false,
  rows = 4,
  prefix = null,
  type = 'text',
  required = false,
  disabled = false,
  error = '',
  help = '',
  id,
  className = '',
  ...rest
}) {
  useStyles();
  const handle = (e) => onChange(e.target.value, e);
  return (
    <label className={['dn-field', className].filter(Boolean).join(' ')} htmlFor={id}>
      {label && (
        <span className="dn-field__label">
          {label}{required && <span className="dn-field__req">*</span>}
        </span>
      )}
      <span className={`dn-field__wrap${error ? ' dn-field__wrap--error' : ''}`}>
        {prefix && <span className="dn-field__prefix">{prefix}</span>}
        {multiline ? (
          <textarea
            id={id} className="dn-field__textarea" value={value} placeholder={placeholder}
            rows={rows} disabled={disabled} onChange={handle} {...rest}
          />
        ) : (
          <input
            id={id} className="dn-field__input" type={type} value={value} placeholder={placeholder}
            disabled={disabled} onChange={handle} {...rest}
          />
        )}
      </span>
      {(error || help) && (
        <span className={`dn-field__help${error ? ' dn-field__help--error' : ''}`}>{error || help}</span>
      )}
    </label>
  );
}

window.DianeDesignSystem_fdee8c.TextField = TextField;
})();

;(function(){

const STYLE_ID = 'dn-toggle-styles';
function useStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .dn-toggle { display: inline-flex; align-items: center; gap: var(--space-3); cursor: pointer; }
  .dn-toggle--disabled { opacity: 0.45; cursor: not-allowed; }
  .dn-toggle__track {
    position: relative; width: 38px; height: 22px; flex: none;
    background: var(--surface-inset);
    border: var(--border-hairline) solid var(--border-strong);
    border-radius: var(--radius-pill);
    transition: background var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out);
  }
  .dn-toggle__track--on { background: var(--green-deep); border-color: var(--green-dim); box-shadow: var(--glow-green); }
  .dn-toggle__knob {
    position: absolute; top: 2px; left: 2px;
    width: 16px; height: 16px; border-radius: 50%;
    background: var(--text-muted);
    transition: transform var(--dur-base) var(--ease-out), background var(--dur-base) var(--ease-out);
  }
  .dn-toggle__track--on .dn-toggle__knob { transform: translateX(16px); background: var(--green); }
  .dn-toggle input:focus-visible + .dn-toggle__track { box-shadow: var(--ring); }
  .dn-toggle__label { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--text-primary); }
  `;
  document.head.appendChild(el);
}

function Toggle({
  checked = false,
  onChange = () => {},
  label = null,
  disabled = false,
  id,
  className = '',
}) {
  useStyles();
  return (
    <label className={['dn-toggle', disabled ? 'dn-toggle--disabled' : '', className].filter(Boolean).join(' ')} htmlFor={id}>
      <input
        id={id} type="checkbox" checked={checked} disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
      />
      <span className={`dn-toggle__track${checked ? ' dn-toggle__track--on' : ''}`} aria-hidden="true">
        <span className="dn-toggle__knob" />
      </span>
      {label != null && <span className="dn-toggle__label">{label}</span>}
    </label>
  );
}

window.DianeDesignSystem_fdee8c.Toggle = Toggle;
})();

;(function(){

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

function StageStep({
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

window.DianeDesignSystem_fdee8c.StageStep = StageStep;
})();

;(function(){

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

function VramMeter({
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

window.DianeDesignSystem_fdee8c.VramMeter = VramMeter;
})();

;(function(){

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

function Terminal({
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

window.DianeDesignSystem_fdee8c.Terminal = Terminal;
})();
