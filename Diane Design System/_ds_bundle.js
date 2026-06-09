/* @ds-bundle: {"format":3,"namespace":"DianeDesignSystem_fdee8c","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"RadioCards","sourcePath":"components/forms/RadioCards.jsx"},{"name":"SegmentedControl","sourcePath":"components/forms/SegmentedControl.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"TextField","sourcePath":"components/forms/TextField.jsx"},{"name":"Toggle","sourcePath":"components/forms/Toggle.jsx"},{"name":"StageStep","sourcePath":"components/pipeline/StageStep.jsx"},{"name":"Terminal","sourcePath":"components/pipeline/Terminal.jsx"},{"name":"VramMeter","sourcePath":"components/pipeline/VramMeter.jsx"}],"sourceHashes":{"assets/diane-ui.preview.js":"31187e26f74e","components/core/Badge.jsx":"0b2efd2fcaee","components/core/Button.jsx":"773aacb681b7","components/core/Card.jsx":"c201fb487615","components/forms/RadioCards.jsx":"7b998c6d469c","components/forms/SegmentedControl.jsx":"7ed59bd2ba96","components/forms/Select.jsx":"7022a4707cd2","components/forms/TextField.jsx":"28e6c2ef100f","components/forms/Toggle.jsx":"f677b4b8e081","components/pipeline/StageStep.jsx":"6e62f06682e1","components/pipeline/Terminal.jsx":"8cbd80b7c20e","components/pipeline/VramMeter.jsx":"33dcc79d97a8","ui_kits/diane-app/App.jsx":"75cfb25d98a9","ui_kits/diane-app/icons.jsx":"383ab3884358","ui_kits/diane-app/parts.jsx":"f0dafe9211fb"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.DianeDesignSystem_fdee8c = window.DianeDesignSystem_fdee8c || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// assets/diane-ui.preview.js
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* AUTO-GENERATED preview runtime for Diane DS.
 * NOT the compiler bundle (_ds_bundle.js). Built from the canonical
 * components/*.jsx sources with import/export stripped and each wrapped in an
 * IIFE, assigned to window.DianeDesignSystem_fdee8c. Lets the @dsCard cards and
 * the UI kit render in preview where the compiled bundle isn't served.
 * Regenerate with the run_script that created it after editing any component. */
window.DianeDesignSystem_fdee8c = window.DianeDesignSystem_fdee8c || {};
;
(function () {
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
    const cls = ['dn-btn', `dn-btn--${variant}`, `dn-btn--${size}`, block ? 'dn-btn--block' : '', className].filter(Boolean).join(' ');
    return /*#__PURE__*/React.createElement("button", _extends({
      type: type,
      className: cls,
      disabled: disabled || loading
    }, rest), loading && /*#__PURE__*/React.createElement("span", {
      className: "dn-btn__spinner",
      "aria-hidden": "true"
    }), !loading && leadingIcon && /*#__PURE__*/React.createElement("span", {
      className: "dn-btn__icon"
    }, leadingIcon), children, !loading && trailingIcon && /*#__PURE__*/React.createElement("span", {
      className: "dn-btn__icon"
    }, trailingIcon));
  }
  window.DianeDesignSystem_fdee8c.Button = Button;
})();
;
(function () {
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
    const cls = ['dn-badge', `dn-badge--${tone}`, outline ? 'dn-badge--outline' : '', uppercase ? 'dn-badge--uppercase' : '', className].filter(Boolean).join(' ');
    return /*#__PURE__*/React.createElement("span", _extends({
      className: cls
    }, rest), dot && /*#__PURE__*/React.createElement("span", {
      className: `dn-badge__dot${pulse ? ' dn-badge__dot--pulse' : ''}`,
      "aria-hidden": "true"
    }), children);
  }
  window.DianeDesignSystem_fdee8c.Badge = Badge;
})();
;
(function () {
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
    return /*#__PURE__*/React.createElement("section", _extends({
      className: cls
    }, rest), hasBar && /*#__PURE__*/React.createElement("header", {
      className: "dn-card__bar"
    }, terminalDots && /*#__PURE__*/React.createElement("span", {
      className: "dn-card__dots",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("span", {
      className: "dn-card__dot"
    }), /*#__PURE__*/React.createElement("span", {
      className: "dn-card__dot"
    }), /*#__PURE__*/React.createElement("span", {
      className: "dn-card__dot"
    })), title != null && /*#__PURE__*/React.createElement("p", {
      className: "dn-card__title"
    }, title), actions != null && /*#__PURE__*/React.createElement("span", {
      className: "dn-card__actions"
    }, actions)), /*#__PURE__*/React.createElement("div", {
      className: `dn-card__body${flushBody ? ' dn-card__body--flush' : ''} ${bodyClassName}`.trim()
    }, children));
  }
  window.DianeDesignSystem_fdee8c.Card = Card;
})();
;
(function () {
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
    className = ''
  }) {
    useStyles();
    const norm = options.map(o => typeof o === 'string' ? {
      value: o,
      label: o
    } : o);
    return /*#__PURE__*/React.createElement("div", {
      className: ['dn-seg', block ? 'dn-seg--block' : '', className].filter(Boolean).join(' '),
      role: "tablist"
    }, norm.map(o => {
      const on = o.value === value;
      return /*#__PURE__*/React.createElement("button", {
        key: o.value,
        type: "button",
        role: "tab",
        "aria-selected": on,
        name: name,
        disabled: o.disabled,
        className: `dn-seg__opt${on ? ' dn-seg__opt--on' : ''}`,
        onClick: () => onChange(o.value)
      }, o.icon && /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, o.icon), o.label);
    }));
  }
  window.DianeDesignSystem_fdee8c.SegmentedControl = SegmentedControl;
})();
;
(function () {
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
    className = ''
  }) {
    useStyles();
    return /*#__PURE__*/React.createElement("div", {
      className: ['dn-rc', row ? 'dn-rc--row' : '', className].filter(Boolean).join(' '),
      role: "radiogroup"
    }, options.map(o => {
      const on = o.value === value;
      return /*#__PURE__*/React.createElement("button", {
        key: o.value,
        type: "button",
        role: "radio",
        "aria-checked": on,
        disabled: o.disabled,
        className: `dn-rc__opt${on ? ' dn-rc__opt--on' : ''}`,
        onClick: () => onChange(o.value)
      }, /*#__PURE__*/React.createElement("span", {
        className: "dn-rc__radio",
        "aria-hidden": "true"
      }), /*#__PURE__*/React.createElement("span", {
        className: "dn-rc__text"
      }, /*#__PURE__*/React.createElement("span", {
        className: "dn-rc__label"
      }, o.label, o.badge), o.description && /*#__PURE__*/React.createElement("span", {
        className: "dn-rc__desc"
      }, o.description)));
    }));
  }
  window.DianeDesignSystem_fdee8c.RadioCards = RadioCards;
})();
;
(function () {
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
    className = ''
  }) {
    useStyles();
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef(null);
    const norm = options.map(o => typeof o === 'string' ? {
      value: o,
      label: o
    } : o);
    const current = norm.find(o => o.value === value);
    React.useEffect(() => {
      if (!open) return;
      const onDoc = e => {
        if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      };
      document.addEventListener('mousedown', onDoc);
      return () => document.removeEventListener('mousedown', onDoc);
    }, [open]);
    return /*#__PURE__*/React.createElement("div", {
      className: ['dn-select', className].filter(Boolean).join(' '),
      ref: ref
    }, label && /*#__PURE__*/React.createElement("span", {
      className: "dn-select__label"
    }, label), /*#__PURE__*/React.createElement("button", {
      type: "button",
      id: id,
      className: "dn-select__trigger",
      "aria-haspopup": "listbox",
      "aria-expanded": open,
      onClick: () => setOpen(v => !v)
    }, /*#__PURE__*/React.createElement("span", {
      className: `dn-select__value${current ? '' : ' dn-select__value--ph'}`
    }, current ? current.label : placeholder), /*#__PURE__*/React.createElement("svg", {
      className: "dn-select__chev",
      width: "12",
      height: "12",
      viewBox: "0 0 12 12",
      fill: "none",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M3 4.5 6 7.5 9 4.5",
      stroke: "currentColor",
      "stroke-width": "1.5",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    }))), open && /*#__PURE__*/React.createElement("div", {
      className: "dn-select__menu",
      role: "listbox"
    }, norm.map(o => /*#__PURE__*/React.createElement("button", {
      key: o.value,
      type: "button",
      role: "option",
      "aria-selected": o.value === value,
      className: `dn-select__opt${o.value === value ? ' dn-select__opt--on' : ''}`,
      onClick: () => {
        onChange(o.value);
        setOpen(false);
      }
    }, o.label, /*#__PURE__*/React.createElement("svg", {
      className: "dn-select__check",
      width: "12",
      height: "12",
      viewBox: "0 0 12 12",
      fill: "none",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M2.5 6.5 5 9l4.5-5.5",
      stroke: "currentColor",
      "stroke-width": "1.6",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    }))))));
  }
  window.DianeDesignSystem_fdee8c.Select = Select;
})();
;
(function () {
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
    const handle = e => onChange(e.target.value, e);
    return /*#__PURE__*/React.createElement("label", {
      className: ['dn-field', className].filter(Boolean).join(' '),
      htmlFor: id
    }, label && /*#__PURE__*/React.createElement("span", {
      className: "dn-field__label"
    }, label, required && /*#__PURE__*/React.createElement("span", {
      className: "dn-field__req"
    }, "*")), /*#__PURE__*/React.createElement("span", {
      className: `dn-field__wrap${error ? ' dn-field__wrap--error' : ''}`
    }, prefix && /*#__PURE__*/React.createElement("span", {
      className: "dn-field__prefix"
    }, prefix), multiline ? /*#__PURE__*/React.createElement("textarea", _extends({
      id: id,
      className: "dn-field__textarea",
      value: value,
      placeholder: placeholder,
      rows: rows,
      disabled: disabled,
      onChange: handle
    }, rest)) : /*#__PURE__*/React.createElement("input", _extends({
      id: id,
      className: "dn-field__input",
      type: type,
      value: value,
      placeholder: placeholder,
      disabled: disabled,
      onChange: handle
    }, rest))), (error || help) && /*#__PURE__*/React.createElement("span", {
      className: `dn-field__help${error ? ' dn-field__help--error' : ''}`
    }, error || help));
  }
  window.DianeDesignSystem_fdee8c.TextField = TextField;
})();
;
(function () {
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
    className = ''
  }) {
    useStyles();
    return /*#__PURE__*/React.createElement("label", {
      className: ['dn-toggle', disabled ? 'dn-toggle--disabled' : '', className].filter(Boolean).join(' '),
      htmlFor: id
    }, /*#__PURE__*/React.createElement("input", {
      id: id,
      type: "checkbox",
      checked: checked,
      disabled: disabled,
      onChange: e => onChange(e.target.checked),
      style: {
        position: 'absolute',
        opacity: 0,
        width: 0,
        height: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: `dn-toggle__track${checked ? ' dn-toggle__track--on' : ''}`,
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("span", {
      className: "dn-toggle__knob"
    })), label != null && /*#__PURE__*/React.createElement("span", {
      className: "dn-toggle__label"
    }, label));
  }
  window.DianeDesignSystem_fdee8c.Toggle = Toggle;
})();
;
(function () {
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
  function StatusIcon({
    status
  }) {
    if (status === 'running') return /*#__PURE__*/React.createElement("span", {
      className: "dn-stage__spin"
    });
    if (status === 'done') return /*#__PURE__*/React.createElement("svg", {
      width: "15",
      height: "15",
      viewBox: "0 0 15 15",
      fill: "none"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M3 8l3 3 6-7",
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }));
    if (status === 'error') return /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 14 14",
      fill: "none"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M4 4l6 6M10 4l-6 6",
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinecap: "round"
    }));
    if (status === 'cached') return /*#__PURE__*/React.createElement("svg", {
      width: "15",
      height: "15",
      viewBox: "0 0 15 15",
      fill: "none"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M2.5 7.5a5 5 0 1 0 1.3-3.4M3 1.5v3h3",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }));
    return /*#__PURE__*/React.createElement("span", {
      className: "dn-stage__dot"
    });
  }
  function StageStep({
    name,
    status = 'pending',
    device = null,
    // 'GPU' | 'CPU'
    index = null,
    detail = null,
    // e.g. "Δ VRAM +0 MiB" or model name
    duration = null,
    // e.g. "1.2s"
    className = ''
  }) {
    useStyles();
    return /*#__PURE__*/React.createElement("div", {
      className: ['dn-stage', `dn-stage--${status}`, className].filter(Boolean).join(' ')
    }, index != null && /*#__PURE__*/React.createElement("span", {
      className: "dn-stage__idx"
    }, String(index).padStart(2, '0')), /*#__PURE__*/React.createElement("span", {
      className: "dn-stage__icon"
    }, /*#__PURE__*/React.createElement(StatusIcon, {
      status: status
    })), /*#__PURE__*/React.createElement("span", {
      className: "dn-stage__main"
    }, /*#__PURE__*/React.createElement("span", {
      className: "dn-stage__name"
    }, name), detail && /*#__PURE__*/React.createElement("span", {
      className: "dn-stage__sub"
    }, detail)), /*#__PURE__*/React.createElement("span", {
      className: "dn-stage__meta"
    }, device && /*#__PURE__*/React.createElement("span", {
      className: `dn-stage__device dn-stage__device--${device.toLowerCase()}`
    }, device), duration && /*#__PURE__*/React.createElement("span", {
      className: "dn-stage__time"
    }, duration)));
  }
  window.DianeDesignSystem_fdee8c.StageStep = StageStep;
})();
;
(function () {
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
    used = 0,
    // MiB
    total = 16384,
    // MiB (16 GB)
    label = 'VRAM',
    unit = 'GB',
    className = ''
  }) {
    useStyles();
    const pct = Math.max(0, Math.min(100, used / total * 100));
    const color = pct >= 90 ? 'var(--red)' : pct >= 72 ? 'var(--amber)' : 'var(--green)';
    return /*#__PURE__*/React.createElement("div", {
      className: ['dn-vram', className].filter(Boolean).join(' '),
      style: {
        '--_c': color
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "dn-vram__head"
    }, /*#__PURE__*/React.createElement("span", {
      className: "dn-vram__label"
    }, label), /*#__PURE__*/React.createElement("span", {
      className: "dn-vram__nums"
    }, /*#__PURE__*/React.createElement("b", null, fmt(used)), " / ", fmt(total), " ", unit, " \xB7 ", pct.toFixed(0), "%")), /*#__PURE__*/React.createElement("div", {
      className: "dn-vram__track",
      role: "progressbar",
      "aria-valuenow": Math.round(pct),
      "aria-valuemin": 0,
      "aria-valuemax": 100
    }, /*#__PURE__*/React.createElement("div", {
      className: "dn-vram__fill",
      style: {
        width: `${pct}%`
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "dn-vram__cap"
    }, /*#__PURE__*/React.createElement("span", null, "RTX 4070 Ti SUPER"), /*#__PURE__*/React.createElement("span", null, fmt(total - used), " ", unit, " libre")));
  }
  window.DianeDesignSystem_fdee8c.VramMeter = VramMeter;
})();
;
(function () {
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
  const LEVEL_TAG = {
    info: 'INFO',
    success: 'OK',
    warn: 'WARN',
    error: 'ERR',
    debug: 'DBG',
    stage: '»'
  };
  function renderMsg(msg) {
    if (typeof msg !== 'string') return msg;
    // lightweight **bold** support
    const parts = msg.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) => p.startsWith('**') && p.endsWith('**') ? /*#__PURE__*/React.createElement("b", {
      key: i
    }, p.slice(2, -2)) : /*#__PURE__*/React.createElement(React.Fragment, {
      key: i
    }, p));
  }
  function Terminal({
    lines = [],
    showCursor = false,
    showLevel = true,
    height = 260,
    className = ''
  }) {
    useStyles();
    const norm = lines.map(l => typeof l === 'string' ? {
      msg: l,
      level: 'info'
    } : l);
    return /*#__PURE__*/React.createElement("div", {
      className: ['dn-term', className].filter(Boolean).join(' '),
      style: {
        maxHeight: height
      }
    }, norm.map((l, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      className: `dn-term__line dn-term__line--${l.level || 'info'}`
    }, l.ts && /*#__PURE__*/React.createElement("span", {
      className: "dn-term__ts"
    }, "[", l.ts, "]"), showLevel && /*#__PURE__*/React.createElement("span", {
      className: "dn-term__lvl"
    }, LEVEL_TAG[l.level || 'info'] || ''), /*#__PURE__*/React.createElement("span", {
      className: "dn-term__msg"
    }, renderMsg(l.msg), showCursor && i === norm.length - 1 && /*#__PURE__*/React.createElement("span", {
      className: "dn-term__cursor",
      "aria-hidden": "true"
    })))), showCursor && norm.length === 0 && /*#__PURE__*/React.createElement("div", {
      className: "dn-term__line dn-term__line--info"
    }, /*#__PURE__*/React.createElement("span", {
      className: "dn-term__msg"
    }, /*#__PURE__*/React.createElement("span", {
      className: "dn-term__cursor",
      "aria-hidden": "true"
    }))));
  }
  window.DianeDesignSystem_fdee8c.Terminal = Terminal;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "assets/diane-ui.preview.js", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  const cls = ['dn-badge', `dn-badge--${tone}`, outline ? 'dn-badge--outline' : '', uppercase ? 'dn-badge--uppercase' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    className: `dn-badge__dot${pulse ? ' dn-badge__dot--pulse' : ''}`,
    "aria-hidden": "true"
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  const cls = ['dn-btn', `dn-btn--${variant}`, `dn-btn--${size}`, block ? 'dn-btn--block' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    className: cls,
    disabled: disabled || loading
  }, rest), loading && /*#__PURE__*/React.createElement("span", {
    className: "dn-btn__spinner",
    "aria-hidden": "true"
  }), !loading && leadingIcon && /*#__PURE__*/React.createElement("span", {
    className: "dn-btn__icon"
  }, leadingIcon), children, !loading && trailingIcon && /*#__PURE__*/React.createElement("span", {
    className: "dn-btn__icon"
  }, trailingIcon));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  return /*#__PURE__*/React.createElement("section", _extends({
    className: cls
  }, rest), hasBar && /*#__PURE__*/React.createElement("header", {
    className: "dn-card__bar"
  }, terminalDots && /*#__PURE__*/React.createElement("span", {
    className: "dn-card__dots",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dn-card__dot"
  }), /*#__PURE__*/React.createElement("span", {
    className: "dn-card__dot"
  }), /*#__PURE__*/React.createElement("span", {
    className: "dn-card__dot"
  })), title != null && /*#__PURE__*/React.createElement("p", {
    className: "dn-card__title"
  }, title), actions != null && /*#__PURE__*/React.createElement("span", {
    className: "dn-card__actions"
  }, actions)), /*#__PURE__*/React.createElement("div", {
    className: `dn-card__body${flushBody ? ' dn-card__body--flush' : ''} ${bodyClassName}`.trim()
  }, children));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/forms/RadioCards.jsx
try { (() => {
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
  className = ''
}) {
  useStyles();
  return /*#__PURE__*/React.createElement("div", {
    className: ['dn-rc', row ? 'dn-rc--row' : '', className].filter(Boolean).join(' '),
    role: "radiogroup"
  }, options.map(o => {
    const on = o.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: o.value,
      type: "button",
      role: "radio",
      "aria-checked": on,
      disabled: o.disabled,
      className: `dn-rc__opt${on ? ' dn-rc__opt--on' : ''}`,
      onClick: () => onChange(o.value)
    }, /*#__PURE__*/React.createElement("span", {
      className: "dn-rc__radio",
      "aria-hidden": "true"
    }), /*#__PURE__*/React.createElement("span", {
      className: "dn-rc__text"
    }, /*#__PURE__*/React.createElement("span", {
      className: "dn-rc__label"
    }, o.label, o.badge), o.description && /*#__PURE__*/React.createElement("span", {
      className: "dn-rc__desc"
    }, o.description)));
  }));
}
Object.assign(__ds_scope, { RadioCards });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/RadioCards.jsx", error: String((e && e.message) || e) }); }

// components/forms/SegmentedControl.jsx
try { (() => {
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
  className = ''
}) {
  useStyles();
  const norm = options.map(o => typeof o === 'string' ? {
    value: o,
    label: o
  } : o);
  return /*#__PURE__*/React.createElement("div", {
    className: ['dn-seg', block ? 'dn-seg--block' : '', className].filter(Boolean).join(' '),
    role: "tablist"
  }, norm.map(o => {
    const on = o.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: o.value,
      type: "button",
      role: "tab",
      "aria-selected": on,
      name: name,
      disabled: o.disabled,
      className: `dn-seg__opt${on ? ' dn-seg__opt--on' : ''}`,
      onClick: () => onChange(o.value)
    }, o.icon && /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, o.icon), o.label);
  }));
}
Object.assign(__ds_scope, { SegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SegmentedControl.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
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
  className = ''
}) {
  useStyles();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const norm = options.map(o => typeof o === 'string' ? {
    value: o,
    label: o
  } : o);
  const current = norm.find(o => o.value === value);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);
  return /*#__PURE__*/React.createElement("div", {
    className: ['dn-select', className].filter(Boolean).join(' '),
    ref: ref
  }, label && /*#__PURE__*/React.createElement("span", {
    className: "dn-select__label"
  }, label), /*#__PURE__*/React.createElement("button", {
    type: "button",
    id: id,
    className: "dn-select__trigger",
    "aria-haspopup": "listbox",
    "aria-expanded": open,
    onClick: () => setOpen(v => !v)
  }, /*#__PURE__*/React.createElement("span", {
    className: `dn-select__value${current ? '' : ' dn-select__value--ph'}`
  }, current ? current.label : placeholder), /*#__PURE__*/React.createElement("svg", {
    className: "dn-select__chev",
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    fill: "none",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 4.5 6 7.5 9 4.5",
    stroke: "currentColor",
    "stroke-width": "1.5",
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  }))), open && /*#__PURE__*/React.createElement("div", {
    className: "dn-select__menu",
    role: "listbox"
  }, norm.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.value,
    type: "button",
    role: "option",
    "aria-selected": o.value === value,
    className: `dn-select__opt${o.value === value ? ' dn-select__opt--on' : ''}`,
    onClick: () => {
      onChange(o.value);
      setOpen(false);
    }
  }, o.label, /*#__PURE__*/React.createElement("svg", {
    className: "dn-select__check",
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    fill: "none",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2.5 6.5 5 9l4.5-5.5",
    stroke: "currentColor",
    "stroke-width": "1.6",
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  }))))));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/TextField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  const handle = e => onChange(e.target.value, e);
  return /*#__PURE__*/React.createElement("label", {
    className: ['dn-field', className].filter(Boolean).join(' '),
    htmlFor: id
  }, label && /*#__PURE__*/React.createElement("span", {
    className: "dn-field__label"
  }, label, required && /*#__PURE__*/React.createElement("span", {
    className: "dn-field__req"
  }, "*")), /*#__PURE__*/React.createElement("span", {
    className: `dn-field__wrap${error ? ' dn-field__wrap--error' : ''}`
  }, prefix && /*#__PURE__*/React.createElement("span", {
    className: "dn-field__prefix"
  }, prefix), multiline ? /*#__PURE__*/React.createElement("textarea", _extends({
    id: id,
    className: "dn-field__textarea",
    value: value,
    placeholder: placeholder,
    rows: rows,
    disabled: disabled,
    onChange: handle
  }, rest)) : /*#__PURE__*/React.createElement("input", _extends({
    id: id,
    className: "dn-field__input",
    type: type,
    value: value,
    placeholder: placeholder,
    disabled: disabled,
    onChange: handle
  }, rest))), (error || help) && /*#__PURE__*/React.createElement("span", {
    className: `dn-field__help${error ? ' dn-field__help--error' : ''}`
  }, error || help));
}
Object.assign(__ds_scope, { TextField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/TextField.jsx", error: String((e && e.message) || e) }); }

// components/forms/Toggle.jsx
try { (() => {
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
  className = ''
}) {
  useStyles();
  return /*#__PURE__*/React.createElement("label", {
    className: ['dn-toggle', disabled ? 'dn-toggle--disabled' : '', className].filter(Boolean).join(' '),
    htmlFor: id
  }, /*#__PURE__*/React.createElement("input", {
    id: id,
    type: "checkbox",
    checked: checked,
    disabled: disabled,
    onChange: e => onChange(e.target.checked),
    style: {
      position: 'absolute',
      opacity: 0,
      width: 0,
      height: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: `dn-toggle__track${checked ? ' dn-toggle__track--on' : ''}`,
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dn-toggle__knob"
  })), label != null && /*#__PURE__*/React.createElement("span", {
    className: "dn-toggle__label"
  }, label));
}
Object.assign(__ds_scope, { Toggle });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Toggle.jsx", error: String((e && e.message) || e) }); }

// components/pipeline/StageStep.jsx
try { (() => {
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
function StatusIcon({
  status
}) {
  if (status === 'running') return /*#__PURE__*/React.createElement("span", {
    className: "dn-stage__spin"
  });
  if (status === 'done') return /*#__PURE__*/React.createElement("svg", {
    width: "15",
    height: "15",
    viewBox: "0 0 15 15",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 8l3 3 6-7",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }));
  if (status === 'error') return /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 4l6 6M10 4l-6 6",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round"
  }));
  if (status === 'cached') return /*#__PURE__*/React.createElement("svg", {
    width: "15",
    height: "15",
    viewBox: "0 0 15 15",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2.5 7.5a5 5 0 1 0 1.3-3.4M3 1.5v3h3",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }));
  return /*#__PURE__*/React.createElement("span", {
    className: "dn-stage__dot"
  });
}
function StageStep({
  name,
  status = 'pending',
  device = null,
  // 'GPU' | 'CPU'
  index = null,
  detail = null,
  // e.g. "Δ VRAM +0 MiB" or model name
  duration = null,
  // e.g. "1.2s"
  className = ''
}) {
  useStyles();
  return /*#__PURE__*/React.createElement("div", {
    className: ['dn-stage', `dn-stage--${status}`, className].filter(Boolean).join(' ')
  }, index != null && /*#__PURE__*/React.createElement("span", {
    className: "dn-stage__idx"
  }, String(index).padStart(2, '0')), /*#__PURE__*/React.createElement("span", {
    className: "dn-stage__icon"
  }, /*#__PURE__*/React.createElement(StatusIcon, {
    status: status
  })), /*#__PURE__*/React.createElement("span", {
    className: "dn-stage__main"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dn-stage__name"
  }, name), detail && /*#__PURE__*/React.createElement("span", {
    className: "dn-stage__sub"
  }, detail)), /*#__PURE__*/React.createElement("span", {
    className: "dn-stage__meta"
  }, device && /*#__PURE__*/React.createElement("span", {
    className: `dn-stage__device dn-stage__device--${device.toLowerCase()}`
  }, device), duration && /*#__PURE__*/React.createElement("span", {
    className: "dn-stage__time"
  }, duration)));
}
Object.assign(__ds_scope, { StageStep });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/pipeline/StageStep.jsx", error: String((e && e.message) || e) }); }

// components/pipeline/Terminal.jsx
try { (() => {
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
const LEVEL_TAG = {
  info: 'INFO',
  success: 'OK',
  warn: 'WARN',
  error: 'ERR',
  debug: 'DBG',
  stage: '»'
};
function renderMsg(msg) {
  if (typeof msg !== 'string') return msg;
  // lightweight **bold** support
  const parts = msg.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => p.startsWith('**') && p.endsWith('**') ? /*#__PURE__*/React.createElement("b", {
    key: i
  }, p.slice(2, -2)) : /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, p));
}
function Terminal({
  lines = [],
  showCursor = false,
  showLevel = true,
  height = 260,
  className = ''
}) {
  useStyles();
  const norm = lines.map(l => typeof l === 'string' ? {
    msg: l,
    level: 'info'
  } : l);
  return /*#__PURE__*/React.createElement("div", {
    className: ['dn-term', className].filter(Boolean).join(' '),
    style: {
      maxHeight: height
    }
  }, norm.map((l, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: `dn-term__line dn-term__line--${l.level || 'info'}`
  }, l.ts && /*#__PURE__*/React.createElement("span", {
    className: "dn-term__ts"
  }, "[", l.ts, "]"), showLevel && /*#__PURE__*/React.createElement("span", {
    className: "dn-term__lvl"
  }, LEVEL_TAG[l.level || 'info'] || ''), /*#__PURE__*/React.createElement("span", {
    className: "dn-term__msg"
  }, renderMsg(l.msg), showCursor && i === norm.length - 1 && /*#__PURE__*/React.createElement("span", {
    className: "dn-term__cursor",
    "aria-hidden": "true"
  })))), showCursor && norm.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "dn-term__line dn-term__line--info"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dn-term__msg"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dn-term__cursor",
    "aria-hidden": "true"
  }))));
}
Object.assign(__ds_scope, { Terminal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/pipeline/Terminal.jsx", error: String((e && e.message) || e) }); }

// components/pipeline/VramMeter.jsx
try { (() => {
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
  used = 0,
  // MiB
  total = 16384,
  // MiB (16 GB)
  label = 'VRAM',
  unit = 'GB',
  className = ''
}) {
  useStyles();
  const pct = Math.max(0, Math.min(100, used / total * 100));
  const color = pct >= 90 ? 'var(--red)' : pct >= 72 ? 'var(--amber)' : 'var(--green)';
  return /*#__PURE__*/React.createElement("div", {
    className: ['dn-vram', className].filter(Boolean).join(' '),
    style: {
      '--_c': color
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dn-vram__head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dn-vram__label"
  }, label), /*#__PURE__*/React.createElement("span", {
    className: "dn-vram__nums"
  }, /*#__PURE__*/React.createElement("b", null, fmt(used)), " / ", fmt(total), " ", unit, " \xB7 ", pct.toFixed(0), "%")), /*#__PURE__*/React.createElement("div", {
    className: "dn-vram__track",
    role: "progressbar",
    "aria-valuenow": Math.round(pct),
    "aria-valuemin": 0,
    "aria-valuemax": 100
  }, /*#__PURE__*/React.createElement("div", {
    className: "dn-vram__fill",
    style: {
      width: `${pct}%`
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "dn-vram__cap"
  }, /*#__PURE__*/React.createElement("span", null, "RTX 4070 Ti SUPER"), /*#__PURE__*/React.createElement("span", null, fmt(total - used), " ", unit, " libre")));
}
Object.assign(__ds_scope, { VramMeter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/pipeline/VramMeter.jsx", error: String((e && e.message) || e) }); }

// ui_kits/diane-app/App.jsx
try { (() => {
/* Diane app — main view: config panel + live run panel + fake pipeline runner. */
const {
  Button,
  Badge,
  Card,
  SegmentedControl,
  RadioCards,
  Select,
  TextField,
  StageStep,
  Terminal,
  VramMeter
} = window.DianeDesignSystem_fdee8c;
const {
  SectionLabel,
  TopBar,
  UploadDropzone
} = window;
const {
  IconPlay,
  IconPause,
  IconDownload,
  IconKey,
  IconTerminal,
  IconRefresh,
  IconFilm,
  IconLanguages
} = window;
const IDLE_VRAM = 412;
const VRAM_TOTAL = 16384;
const TEMPLATES = {
  'YouTube Tech/AI': 'YouTube tech/AI speech. Rules: 1) Informal Latin American Spanish, never Spain Spanish. ' + '2) Convert ALL numbers to words (17=diecisiete, 2005=dos mil cinco). ' + '3) Write English proper nouns phonetically in Spanish (Apple=Ápol, Stanford=Stánford, Steve=Stív, Jobs=Yobs, iOS=ai-o-és). ' + '4) Keep each subtitle SHORT and CONCISE, Spanish must not exceed original English duration. ' + '5) Never translate proper names, write them phonetically instead.',
  'Entretenimiento': 'Entertainment content. Rules: 1) Casual, natural Latin American Spanish. ' + '2) Preserve humor and tone of the original. 3) Keep subtitles concise and natural-sounding. ' + '4) Adapt idioms and expressions, don\'t translate literally.',
  'Documental': 'Documentary content. Rules: 1) Neutral, formal Latin American Spanish. ' + '2) Preserve technical terms when no good Spanish equivalent exists. ' + '3) Maintain the authoritative tone of the narrator. 4) Accuracy over style.',
  'Personalizado': ''
};
function stageDefs(preset, backend) {
  const defs = [{
    name: 'extract_audio',
    device: 'CPU',
    vram: IDLE_VRAM,
    sim: 700,
    dur: '1.1s',
    detail: 'FFmpeg · 16 kHz mono WAV'
  }, {
    name: 'separate_vocals',
    device: 'GPU',
    vram: 3100,
    sim: 1200,
    dur: '8.4s',
    detail: 'Demucs htdemucs_ft · vocals + instrumental'
  }, {
    name: 'transcribe',
    device: 'GPU',
    vram: 6200,
    sim: 1500,
    dur: '22.1s',
    detail: 'WhisperX large-v3 · word-level · VAD'
  }, backend === 'local' ? {
    name: 'translate',
    device: 'GPU',
    vram: 13800,
    sim: 1700,
    dur: '46.8s',
    detail: 'Qwen 35B · -ngl 24 · ventana 8'
  } : {
    name: 'translate',
    device: null,
    vram: IDLE_VRAM,
    sim: 1400,
    dur: '31.2s',
    detail: 'Gemini 2.5 Flash · online · free tier'
  }, {
    name: 'synthesize',
    device: 'GPU',
    vram: 10200,
    sim: 1600,
    dur: '1m 44s',
    detail: 'Fish S2 Pro · BF16 · voz clonada'
  }, {
    name: 'align_timing',
    device: 'CPU',
    vram: IDLE_VRAM,
    sim: 600,
    dur: '2.3s',
    detail: 'rubberband · cap 1.25x · sin cambiar pitch'
  }, {
    name: 'compose',
    device: 'CPU',
    vram: IDLE_VRAM,
    sim: 800,
    dur: '3.0s',
    detail: 'voz 100% + instrumental 70% · -c:v copy'
  }];
  if (preset === 'quality') {
    defs.push({
      name: 'lipdub',
      device: 'GPU',
      vram: 15200,
      sim: 2200,
      dur: '4m 12s',
      detail: 'LTX-2.3 IC-LoRA · por chunks'
    });
  }
  return defs;
}
function clock(base, addSec) {
  return new Date(base.getTime() + addSec * 1000).toTimeString().slice(0, 8);
}
function fmtElapsed(ms) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
function App() {
  const [file, setFile] = React.useState(null);
  const [preset, setPreset] = React.useState('balanced');
  const [backend, setBackend] = React.useState('local');
  const [apiKey, setApiKey] = React.useState('');
  const [template, setTemplate] = React.useState('YouTube Tech/AI');
  const [instructions, setInstructions] = React.useState(TEMPLATES['YouTube Tech/AI']);
  const [stages, setStages] = React.useState([]);
  const [logs, setLogs] = React.useState([]);
  const [vram, setVram] = React.useState(IDLE_VRAM);
  const [phase, setPhase] = React.useState('idle'); // idle | running | done
  const [elapsed, setElapsed] = React.useState(0);
  const [job, setJob] = React.useState('');
  const timers = React.useRef([]);
  const tick = React.useRef(null);
  const termWrap = React.useRef(null);
  const onTemplate = t => {
    setTemplate(t);
    if (t !== 'Personalizado') setInstructions(TEMPLATES[t]);
  };
  const clearAll = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    clearInterval(tick.current);
  };
  React.useEffect(() => () => clearAll(), []);

  // keep the live log scrolled to the newest line
  React.useEffect(() => {
    const el = termWrap.current && termWrap.current.querySelector('.dn-term');
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs]);
  const reset = () => {
    clearAll();
    setPhase('idle');
    setStages([]);
    setLogs([]);
    setVram(IDLE_VRAM);
    setElapsed(0);
  };
  const start = () => {
    clearAll();
    const defs = stageDefs(preset, backend);
    const base = new Date('2024-01-01T14:32:01');
    const jid = Math.random().toString(16).slice(2, 10);
    setJob(jid);
    setPhase('running');
    setElapsed(0);
    setStages(defs.map(d => ({
      ...d,
      status: 'pending'
    })));
    setLogs([{
      ts: clock(base, 0),
      level: 'info',
      msg: `job **${jid}** → workspace/${jid}`
    }, {
      ts: clock(base, 0),
      level: 'debug',
      msg: `preset=${preset} · backend=${backend} · target=es-419`
    }]);
    const t0 = Date.now();
    tick.current = setInterval(() => setElapsed(Date.now() - t0), 200);
    let t = 600,
      delay = 350;
    const push = line => setLogs(prev => [...prev, line]);
    defs.forEach((d, i) => {
      timers.current.push(setTimeout(() => {
        setStages(prev => prev.map((s, j) => j === i ? {
          ...s,
          status: 'running'
        } : s));
        setVram(d.vram);
        push({
          ts: clock(base, t),
          level: 'stage',
          msg: `→ etapa ${d.name} | ${d.device || 'API'} | VRAM antes: ${IDLE_VRAM} MiB`
        });
      }, delay));
      delay += d.sim;
      t += 4;
      timers.current.push(setTimeout(() => {
        setStages(prev => prev.map((s, j) => j === i ? {
          ...s,
          status: 'done'
        } : s));
        setVram(IDLE_VRAM);
        push({
          ts: clock(base, t),
          level: 'success',
          msg: `← ${d.name} | rc=0 | ${d.dur} | Δ VRAM +0`
        });
      }, delay));
      delay += 250;
      t += 6;
    });
    timers.current.push(setTimeout(() => {
      clearInterval(tick.current);
      push({
        ts: clock(base, t + 2),
        level: 'success',
        msg: 'listo — outputs en 07_final.mp4'
      });
      setPhase('done');
    }, delay));
  };
  const needsKey = backend === 'gemini' && !apiKey.trim();
  const canStart = !!file && phase !== 'running' && !needsKey;
  const running = phase === 'running';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100%',
      background: 'var(--bg-canvas)',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    vramUsed: vram,
    vramTotal: VRAM_TOTAL
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(380px, 440px) minmax(0, 1fr)',
      gap: 'var(--space-6)',
      padding: 'var(--space-6) 22px',
      alignItems: 'start',
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "01 \xB7 ENTRADA"
  }, /*#__PURE__*/React.createElement(UploadDropzone, {
    file: file,
    onPick: f => {
      setFile(f);
      if (phase === 'done') reset();
    }
  })), /*#__PURE__*/React.createElement(Card, {
    title: "02 \xB7 PRESET"
  }, /*#__PURE__*/React.createElement(SegmentedControl, {
    block: true,
    value: preset,
    onChange: setPreset,
    options: [{
      value: 'fast',
      label: 'fast'
    }, {
      value: 'balanced',
      label: 'balanced'
    }, {
      value: 'quality',
      label: 'quality'
    }]
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '10px 0 0',
      fontFamily: 'var(--font-sans)',
      fontSize: 12,
      color: 'var(--text-muted)',
      lineHeight: 1.5
    }
  }, preset === 'quality' ? 'Pipeline completo M1–M7: incluye lip sync con LTX-2.3 (más lento).' : preset === 'fast' ? 'Pipeline M1–M5 sin lip sync. La opción más rápida.' : 'Pipeline M1–M5 sin lip sync. Composición directa.')), /*#__PURE__*/React.createElement(Card, {
    title: "03 \xB7 TRADUCCI\xD3N"
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "Backend"), /*#__PURE__*/React.createElement(RadioCards, {
    value: backend,
    onChange: setBackend,
    options: [{
      value: 'gemini',
      label: 'Gemini API',
      badge: /*#__PURE__*/React.createElement("span", {
        style: {
          marginLeft: 8
        }
      }, /*#__PURE__*/React.createElement(Badge, {
        tone: "cyan"
      }, "online")),
      description: 'Gratis vía Google AI Studio. Requiere GEMINI_API_KEY.'
    }, {
      value: 'local',
      label: 'Local · Qwen 35B',
      badge: /*#__PURE__*/React.createElement("span", {
        style: {
          marginLeft: 8
        }
      }, /*#__PURE__*/React.createElement(Badge, {
        tone: "violet"
      }, "offline")),
      description: 'llama.cpp 100% offline · -ngl 24 · ~13.5 GB VRAM.'
    }]
  }), backend === 'gemini' && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(TextField, {
    label: "GEMINI_API_KEY",
    type: "password",
    prefix: /*#__PURE__*/React.createElement(IconKey, {
      size: 14
    }),
    value: apiKey,
    onChange: setApiKey,
    placeholder: "AIza\u2026",
    help: "Lo ideal es configurarla como variable de entorno."
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(Select, {
    label: "Plantilla de instrucciones",
    value: template,
    onChange: onTemplate,
    options: Object.keys(TEMPLATES)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(TextField, {
    label: "Instrucciones",
    multiline: true,
    rows: 6,
    value: instructions,
    onChange: v => {
      setInstructions(v);
      setTemplate('Personalizado');
    },
    help: "Editable en cualquier momento antes de iniciar."
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    block: true,
    loading: running,
    disabled: !canStart,
    onClick: start,
    leadingIcon: running ? null : /*#__PURE__*/React.createElement(IconPlay, {
      size: 16
    })
  }, running ? 'Doblando…' : phase === 'done' ? 'Volver a doblar' : 'Iniciar doblaje'), phase === 'done' && /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "lg",
    onClick: reset,
    leadingIcon: /*#__PURE__*/React.createElement(IconRefresh, {
      size: 15
    })
  }, "Nuevo")), needsKey && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '-6px 0 0',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--amber)'
    }
  }, "\u26A0 Ingresa la GEMINI_API_KEY o cambia a backend local.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-5)',
      position: 'sticky',
      top: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "PIPELINE",
    actions: /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, (running || phase === 'done') && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text-muted)',
        fontVariantNumeric: 'tabular-nums'
      }
    }, fmtElapsed(elapsed)), /*#__PURE__*/React.createElement(Badge, {
      tone: phase === 'done' ? 'green' : running ? 'cyan' : 'neutral',
      dot: true,
      pulse: running,
      uppercase: true
    }, phase === 'done' ? 'completado' : running ? 'corriendo' : 'en espera'))
  }, stages.length === 0 ? /*#__PURE__*/React.createElement(EmptyRun, {
    file: file
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, stages.map((s, i) => /*#__PURE__*/React.createElement(StageStep, {
    key: s.name,
    index: i + 1,
    name: s.name,
    device: s.device,
    status: s.status,
    detail: s.detail,
    duration: s.status === 'done' ? s.dur : null
  })))), phase === 'done' && /*#__PURE__*/React.createElement(PreviewCard, {
    job: job,
    preset: preset,
    backend: backend
  }), /*#__PURE__*/React.createElement(Card, {
    title: "REGISTRO EN VIVO \xB7 stderr",
    flushBody: true,
    terminalDots: true
  }, /*#__PURE__*/React.createElement("div", {
    ref: termWrap
  }, /*#__PURE__*/React.createElement(Terminal, {
    height: 232,
    showCursor: running,
    showLevel: true,
    lines: logs.length ? logs : [{
      level: 'debug',
      msg: 'esperando — el orquestador no carga modelos; cada etapa corre como subproceso aislado.'
    }]
  }))))));
}
function EmptyRun({
  file
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 12,
      padding: '34px 16px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-faint)'
    }
  }, /*#__PURE__*/React.createElement(IconTerminal, {
    size: 30
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-mono)',
      fontSize: 13,
      color: 'var(--text-secondary)'
    }
  }, file ? 'Listo para iniciar el doblaje' : 'Carga un video para empezar'), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-sans)',
      fontSize: 12,
      color: 'var(--text-muted)',
      maxWidth: 330,
      lineHeight: 1.5
    }
  }, "El pipeline corre etapa por etapa. La VRAM se libera al 100% entre cada subproceso aislado."));
}
const SUBS = ['— Hola, soy Stív Yobs, fundador de Ápol.', '— En dos mil cinco di una charla en Stánford.', '— Tu tiempo es limitado: no lo desperdicies.'];
function PreviewCard({
  job,
  preset,
  backend
}) {
  const [playing, setPlaying] = React.useState(false);
  const [sub, setSub] = React.useState(0);
  const finalName = preset === 'quality' ? '08_lipdub.mp4' : '07_final.mp4';
  React.useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setSub(s => (s + 1) % SUBS.length), 2200);
    return () => clearInterval(id);
  }, [playing]);
  return /*#__PURE__*/React.createElement(Card, {
    title: /*#__PURE__*/React.createElement(React.Fragment, null, "~/workspace/", /*#__PURE__*/React.createElement("b", null, job), "/", finalName),
    flushBody: true,
    terminalDots: true,
    actions: /*#__PURE__*/React.createElement(Badge, {
      tone: "green",
      dot: true,
      uppercase: true
    }, "listo")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      aspectRatio: '16 / 9',
      background: 'radial-gradient(120% 100% at 50% 0%, #16201f, #060a0b)',
      display: 'grid',
      placeItems: 'center',
      overflow: 'hidden',
      cursor: 'pointer'
    },
    onClick: () => setPlaying(p => !p)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 58,
      height: 58,
      borderRadius: '50%',
      display: 'grid',
      placeItems: 'center',
      background: 'var(--green)',
      color: 'var(--text-on-accent)',
      boxShadow: 'var(--glow-green)',
      opacity: playing ? 0 : 1,
      transition: 'opacity var(--dur-base)'
    }
  }, playing ? /*#__PURE__*/React.createElement(IconPause, {
    size: 24
  }) : /*#__PURE__*/React.createElement(IconPlay, {
    size: 24
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 12,
      left: 12,
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "green",
    dot: true
  }, "voz clonada"), /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral",
    outline: true
  }, "instrumental 70%"), preset === 'quality' && /*#__PURE__*/React.createElement(Badge, {
    tone: "violet",
    outline: true
  }, "lip sync")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: 3,
      background: 'rgba(255,255,255,0.10)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: playing ? `${(sub + 1) / SUBS.length * 100}%` : '0%',
      background: 'var(--green)',
      boxShadow: 'var(--glow-green)',
      transition: 'width 2.2s linear'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 16,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'center',
      padding: '0 16px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      background: 'rgba(6,10,11,0.84)',
      padding: '6px 14px',
      borderRadius: 'var(--radius-sm)',
      fontFamily: 'var(--font-sans)',
      fontSize: 15,
      color: '#fff',
      backdropFilter: 'blur(4px)',
      textAlign: 'center'
    }
  }, SUBS[sub]))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
      padding: 'var(--space-4)',
      borderTop: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--green)',
      display: 'grid',
      placeItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(IconFilm, {
    size: 22
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 13,
      color: 'var(--text-primary)'
    }
  }, finalName), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text-muted)'
    }
  }, "1920\xD71080 \xB7 12:48 \xB7 96 MB \xB7 H.264 \xB7 es-419 \xB7 ", backend === 'local' ? 'Qwen 35B' : 'Gemini')), /*#__PURE__*/React.createElement(Button, {
    size: "md",
    variant: "primary",
    leadingIcon: /*#__PURE__*/React.createElement(IconDownload, {
      size: 15
    })
  }, "Descargar video")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--space-2)',
      padding: '0 var(--space-4) var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(ArtifactChip, {
    name: "03_transcript.srt",
    tag: "EN"
  }), /*#__PURE__*/React.createElement(ArtifactChip, {
    name: "04_translation.srt",
    tag: "ES-419"
  }), /*#__PURE__*/React.createElement(ArtifactChip, {
    name: "06_synth_aligned.wav",
    tag: "audio"
  })));
}
function ArtifactChip({
  name,
  tag
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      cursor: 'pointer',
      background: 'var(--surface-2)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-sm)',
      padding: '6px 10px',
      color: 'var(--text-secondary)',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement(IconLanguages, {
    size: 13
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-primary)'
    }
  }, name), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-faint)'
    }
  }, "\xB7 ", tag), /*#__PURE__*/React.createElement(IconDownload, {
    size: 13
  }));
}
window.DianeApp = App;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/diane-app/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/diane-app/icons.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Diane GUI icons — Lucide-style line icons (24×24, stroke 2, round caps/joins).
 * Diane's CLI uses unicode glyphs in rich logs (✓ ✗ → » ▶ ●); the web GUI adopts
 * this small Lucide-style set. All inherit currentColor. Exported to window.
 * React is global (UMD); do NOT `import` it here — this file loads as a raw
 * <script type="text/babel">, where an import becomes a failing require(). */

function Svg({
  children,
  size = 18,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, rest), children);
}
const IconUpload = p => /*#__PURE__*/React.createElement(Svg, p, /*#__PURE__*/React.createElement("path", {
  d: "M12 15V3M8 7l4-4 4 4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
}));
const IconFilm = p => /*#__PURE__*/React.createElement(Svg, p, /*#__PURE__*/React.createElement("rect", {
  x: "3",
  y: "4",
  width: "18",
  height: "16",
  rx: "2"
}), /*#__PURE__*/React.createElement("path", {
  d: "M3 9h18M3 15h18M9 4v16M15 4v16"
}));
const IconWaveform = p => /*#__PURE__*/React.createElement(Svg, p, /*#__PURE__*/React.createElement("path", {
  d: "M3 12h2M7 7v10M11 4v16M15 8v8M19 11v2M21 12h0"
}));
const IconLanguages = p => /*#__PURE__*/React.createElement(Svg, p, /*#__PURE__*/React.createElement("path", {
  d: "M4 5h7M9 3v2c0 4-2 7-6 9"
}), /*#__PURE__*/React.createElement("path", {
  d: "M5 9c0 3 3 5 7 6"
}), /*#__PURE__*/React.createElement("path", {
  d: "M13 21l4-9 4 9M14.5 17h5"
}));
const IconCpu = p => /*#__PURE__*/React.createElement(Svg, p, /*#__PURE__*/React.createElement("rect", {
  x: "6",
  y: "6",
  width: "12",
  height: "12",
  rx: "1.5"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"
}), /*#__PURE__*/React.createElement("rect", {
  x: "9.5",
  y: "9.5",
  width: "5",
  height: "5",
  rx: "0.5"
}));
const IconDownload = p => /*#__PURE__*/React.createElement(Svg, p, /*#__PURE__*/React.createElement("path", {
  d: "M12 3v12M8 11l4 4 4-4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
}));
const IconPlay = p => /*#__PURE__*/React.createElement(Svg, p, /*#__PURE__*/React.createElement("path", {
  d: "M7 4v16l13-8z"
}));
const IconPause = p => /*#__PURE__*/React.createElement(Svg, p, /*#__PURE__*/React.createElement("path", {
  d: "M8 5v14M16 5v14"
}));
const IconTerminal = p => /*#__PURE__*/React.createElement(Svg, p, /*#__PURE__*/React.createElement("path", {
  d: "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M7 9l3 3-3 3M13 15h4"
}));
const IconSparkles = p => /*#__PURE__*/React.createElement(Svg, p, /*#__PURE__*/React.createElement("path", {
  d: "M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3Z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M19 14l.7 1.8 1.8.7-1.8.7L19 19l-.7-1.8-1.8-.7 1.8-.7L19 14Z"
}));
const IconChip = p => /*#__PURE__*/React.createElement(Svg, p, /*#__PURE__*/React.createElement("rect", {
  x: "4",
  y: "4",
  width: "16",
  height: "16",
  rx: "2"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 9h6v6H9z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M2 10h2M2 14h2M20 10h2M20 14h2M10 2v2M14 2v2M10 20v2M14 20v2"
}));
const IconRefresh = p => /*#__PURE__*/React.createElement(Svg, p, /*#__PURE__*/React.createElement("path", {
  d: "M21 12a9 9 0 1 1-2.6-6.4M21 3v5h-5"
}));
const IconKey = p => /*#__PURE__*/React.createElement(Svg, p, /*#__PURE__*/React.createElement("circle", {
  cx: "7.5",
  cy: "15.5",
  r: "3.5"
}), /*#__PURE__*/React.createElement("path", {
  d: "M10 13l9-9M16 7l2 2M14 9l2 2"
}));
Object.assign(window, {
  IconUpload,
  IconFilm,
  IconWaveform,
  IconLanguages,
  IconCpu,
  IconDownload,
  IconPlay,
  IconPause,
  IconTerminal,
  IconSparkles,
  IconChip,
  IconRefresh,
  IconKey
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/diane-app/icons.jsx", error: String((e && e.message) || e) }); }

// ui_kits/diane-app/parts.jsx
try { (() => {
/* Diane app — layout parts: TopBar, UploadDropzone, SectionLabel. Exported to window. */
const {
  Badge,
  VramMeter
} = window.DianeDesignSystem_fdee8c;
const {
  IconUpload,
  IconFilm
} = window;
function SectionLabel({
  children,
  hint
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-2xs)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-caps)',
      color: 'var(--text-secondary)'
    }
  }, children), hint && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-2xs)',
      color: 'var(--text-faint)'
    }
  }, hint));
}
function TopBar({
  vramUsed,
  vramTotal
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-5)',
      padding: '12px 22px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'linear-gradient(var(--surface-1), var(--bg-canvas))'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/diane-mark.svg",
    width: "30",
    height: "30",
    alt: ""
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontWeight: 700,
      fontSize: 22,
      color: 'var(--text-primary)',
      letterSpacing: '-0.02em'
    }
  }, "diane"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text-muted)',
      letterSpacing: 'var(--tracking-wide)'
    }
  }, "EN\xA0\u2192\xA0ES-419")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 230
    }
  }, /*#__PURE__*/React.createElement(VramMeter, {
    used: vramUsed,
    total: vramTotal
  })), /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral",
    outline: true
  }, "localhost:7860"));
}
function UploadDropzone({
  file,
  onPick
}) {
  const filled = !!file;
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onPick(file ? null : {
      name: 'jobs_keynote_2024.mp4',
      size: '184 MB',
      dur: '12:48',
      res: '1920×1080'
    }),
    style: {
      width: '100%',
      textAlign: 'left',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
      padding: filled ? '14px 16px' : '26px 18px',
      background: filled ? 'var(--green-deep)' : 'var(--surface-inset)',
      border: `1px ${filled ? 'solid' : 'dashed'} ${filled ? 'var(--green-dim)' : 'var(--border-strong)'}`,
      borderRadius: 'var(--radius-md)',
      color: 'var(--text-secondary)',
      transition: 'border-color var(--dur-fast), background var(--dur-fast)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: filled ? 'var(--green)' : 'var(--text-muted)',
      display: 'grid',
      placeItems: 'center'
    }
  }, filled ? /*#__PURE__*/React.createElement(IconFilm, {
    size: 26
  }) : /*#__PURE__*/React.createElement(IconUpload, {
    size: 26
  })), filled ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 13,
      color: 'var(--green-bright)'
    }
  }, file.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text-muted)'
    }
  }, file.res, " \xB7 ", file.dur, " \xB7 ", file.size, " \u2014 clic para quitar")) : /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 13,
      color: 'var(--text-primary)'
    }
  }, "Arrastra un video MP4 aqu\xED"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text-muted)'
    }
  }, "o clic para seleccionar \xB7 H.264 recomendado")));
}
Object.assign(window, {
  SectionLabel,
  TopBar,
  UploadDropzone
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/diane-app/parts.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.RadioCards = __ds_scope.RadioCards;

__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.TextField = __ds_scope.TextField;

__ds_ns.Toggle = __ds_scope.Toggle;

__ds_ns.StageStep = __ds_scope.StageStep;

__ds_ns.Terminal = __ds_scope.Terminal;

__ds_ns.VramMeter = __ds_scope.VramMeter;

})();
