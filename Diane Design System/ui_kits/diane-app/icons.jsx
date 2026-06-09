/* Diane GUI icons — Lucide-style line icons (24×24, stroke 2, round caps/joins).
 * Diane's CLI uses unicode glyphs in rich logs (✓ ✗ → » ▶ ●); the web GUI adopts
 * this small Lucide-style set. All inherit currentColor. Exported to window.
 * React is global (UMD); do NOT `import` it here — this file loads as a raw
 * <script type="text/babel">, where an import becomes a failing require(). */

function Svg({ children, size = 18, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>
      {children}
    </svg>
  );
}

const IconUpload = (p) => <Svg {...p}><path d="M12 15V3M8 7l4-4 4 4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></Svg>;
const IconFilm = (p) => <Svg {...p}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M3 15h18M9 4v16M15 4v16"/></Svg>;
const IconWaveform = (p) => <Svg {...p}><path d="M3 12h2M7 7v10M11 4v16M15 8v8M19 11v2M21 12h0"/></Svg>;
const IconLanguages = (p) => <Svg {...p}><path d="M4 5h7M9 3v2c0 4-2 7-6 9"/><path d="M5 9c0 3 3 5 7 6"/><path d="M13 21l4-9 4 9M14.5 17h5"/></Svg>;
const IconCpu = (p) => <Svg {...p}><rect x="6" y="6" width="12" height="12" rx="1.5"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/><rect x="9.5" y="9.5" width="5" height="5" rx="0.5"/></Svg>;
const IconDownload = (p) => <Svg {...p}><path d="M12 3v12M8 11l4 4 4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></Svg>;
const IconPlay = (p) => <Svg {...p}><path d="M7 4v16l13-8z"/></Svg>;
const IconPause = (p) => <Svg {...p}><path d="M8 5v14M16 5v14"/></Svg>;
const IconTerminal = (p) => <Svg {...p}><path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/><path d="M7 9l3 3-3 3M13 15h4"/></Svg>;
const IconSparkles = (p) => <Svg {...p}><path d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3Z"/><path d="M19 14l.7 1.8 1.8.7-1.8.7L19 19l-.7-1.8-1.8-.7 1.8-.7L19 14Z"/></Svg>;
const IconChip = (p) => <Svg {...p}><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9z"/><path d="M2 10h2M2 14h2M20 10h2M20 14h2M10 2v2M14 2v2M10 20v2M14 20v2"/></Svg>;
const IconRefresh = (p) => <Svg {...p}><path d="M21 12a9 9 0 1 1-2.6-6.4M21 3v5h-5"/></Svg>;
const IconKey = (p) => <Svg {...p}><circle cx="7.5" cy="15.5" r="3.5"/><path d="M10 13l9-9M16 7l2 2M14 9l2 2"/></Svg>;

Object.assign(window, {
  IconUpload, IconFilm, IconWaveform, IconLanguages, IconCpu,
  IconDownload, IconPlay, IconPause, IconTerminal, IconSparkles, IconChip, IconRefresh, IconKey,
});
