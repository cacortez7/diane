/* Diane app — main view: config panel + live run panel + fake pipeline runner. */
const { Button, Badge, Card, SegmentedControl, RadioCards, Select, TextField, StageStep, Terminal, VramMeter } = window.DianeDesignSystem_fdee8c;
const { SectionLabel, TopBar, UploadDropzone } = window;
const { IconPlay, IconPause, IconDownload, IconKey, IconTerminal, IconRefresh, IconFilm, IconLanguages } = window;

const IDLE_VRAM = 412;
const VRAM_TOTAL = 16384;

const TEMPLATES = {
  'YouTube Tech/AI':
    'YouTube tech/AI speech. Rules: 1) Informal Latin American Spanish, never Spain Spanish. ' +
    '2) Convert ALL numbers to words (17=diecisiete, 2005=dos mil cinco). ' +
    '3) Write English proper nouns phonetically in Spanish (Apple=Ápol, Stanford=Stánford, Steve=Stív, Jobs=Yobs, iOS=ai-o-és). ' +
    '4) Keep each subtitle SHORT and CONCISE, Spanish must not exceed original English duration. ' +
    '5) Never translate proper names, write them phonetically instead.',
  'Entretenimiento':
    'Entertainment content. Rules: 1) Casual, natural Latin American Spanish. ' +
    '2) Preserve humor and tone of the original. 3) Keep subtitles concise and natural-sounding. ' +
    '4) Adapt idioms and expressions, don\'t translate literally.',
  'Documental':
    'Documentary content. Rules: 1) Neutral, formal Latin American Spanish. ' +
    '2) Preserve technical terms when no good Spanish equivalent exists. ' +
    '3) Maintain the authoritative tone of the narrator. 4) Accuracy over style.',
  'Personalizado': '',
};

function stageDefs(preset, backend) {
  const defs = [
    { name: 'extract_audio',   device: 'CPU', vram: IDLE_VRAM, sim: 700,  dur: '1.1s',   detail: 'FFmpeg · 16 kHz mono WAV' },
    { name: 'separate_vocals', device: 'GPU', vram: 3100,      sim: 1200, dur: '8.4s',   detail: 'Demucs htdemucs_ft · vocals + instrumental' },
    { name: 'transcribe',      device: 'GPU', vram: 6200,      sim: 1500, dur: '22.1s',  detail: 'WhisperX large-v3 · word-level · VAD' },
    backend === 'local'
      ? { name: 'translate',   device: 'GPU', vram: 13800,     sim: 1700, dur: '46.8s',  detail: 'Qwen 35B · -ngl 24 · ventana 8' }
      : { name: 'translate',   device: null,  vram: IDLE_VRAM, sim: 1400, dur: '31.2s',  detail: 'Gemini 2.5 Flash · online · free tier' },
    { name: 'synthesize',      device: 'GPU', vram: 10200,     sim: 1600, dur: '1m 44s', detail: 'Fish S2 Pro · BF16 · voz clonada' },
    { name: 'align_timing',    device: 'CPU', vram: IDLE_VRAM, sim: 600,  dur: '2.3s',   detail: 'rubberband · cap 1.25x · sin cambiar pitch' },
    { name: 'compose',         device: 'CPU', vram: IDLE_VRAM, sim: 800,  dur: '3.0s',   detail: 'voz 100% + instrumental 70% · -c:v copy' },
  ];
  if (preset === 'quality') {
    defs.push({ name: 'lipdub', device: 'GPU', vram: 15200, sim: 2200, dur: '4m 12s', detail: 'LTX-2.3 IC-LoRA · por chunks' });
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
  const [inputTab, setInputTab] = React.useState('file');   // file | url
  const [url, setUrl] = React.useState('');
  const [stages, setStages] = React.useState([]);
  const [logs, setLogs] = React.useState([]);
  const [vram, setVram] = React.useState(IDLE_VRAM);
  const [phase, setPhase] = React.useState('idle');   // idle | running | done
  const [elapsed, setElapsed] = React.useState(0);
  const [job, setJob] = React.useState('');
  const timers = React.useRef([]);
  const tick = React.useRef(null);
  const termWrap = React.useRef(null);

  const onTemplate = (t) => { setTemplate(t); if (t !== 'Personalizado') setInstructions(TEMPLATES[t]); };

  const clearAll = () => { timers.current.forEach(clearTimeout); timers.current = []; clearInterval(tick.current); };
  React.useEffect(() => () => clearAll(), []);

  // keep the live log scrolled to the newest line
  React.useEffect(() => {
    const el = termWrap.current && termWrap.current.querySelector('.dn-term');
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs]);

  const reset = () => { clearAll(); setPhase('idle'); setStages([]); setLogs([]); setVram(IDLE_VRAM); setElapsed(0); };

  const fetchUrl = () => {
    if (!url.trim()) return;
    const m = url.match(/(?:v=|youtu\.be\/|shorts\/)([\w-]{4,})/);
    setFile({ name: `youtube_${m ? m[1] : 'video'}.mp4`, res: '1080p', dur: '12:48', size: '~', source: 'url' });
    if (phase === 'done') reset();
  };

  const start = () => {
    clearAll();
    const defs = stageDefs(preset, backend);
    const base = new Date('2024-01-01T14:32:01');
    const jid = Math.random().toString(16).slice(2, 10);
    setJob(jid); setPhase('running'); setElapsed(0);
    setStages(defs.map((d) => ({ ...d, status: 'pending' })));
    setLogs([
      { ts: clock(base, 0), level: 'info', msg: `job **${jid}** → workspace/${jid}` },
      { ts: clock(base, 0), level: 'debug', msg: `preset=${preset} · backend=${backend} · target=es-419` },
    ]);

    const t0 = Date.now();
    tick.current = setInterval(() => setElapsed(Date.now() - t0), 200);

    let t = 600, delay = 350;
    const push = (line) => setLogs((prev) => [...prev, line]);
    defs.forEach((d, i) => {
      timers.current.push(setTimeout(() => {
        setStages((prev) => prev.map((s, j) => j === i ? { ...s, status: 'running' } : s));
        setVram(d.vram);
        push({ ts: clock(base, t), level: 'stage', msg: `→ etapa ${d.name} | ${d.device || 'API'} | VRAM antes: ${IDLE_VRAM} MiB` });
      }, delay));
      delay += d.sim; t += 4;
      timers.current.push(setTimeout(() => {
        setStages((prev) => prev.map((s, j) => j === i ? { ...s, status: 'done' } : s));
        setVram(IDLE_VRAM);
        push({ ts: clock(base, t), level: 'success', msg: `← ${d.name} | rc=0 | ${d.dur} | Δ VRAM +0` });
      }, delay));
      delay += 250; t += 6;
    });
    timers.current.push(setTimeout(() => {
      clearInterval(tick.current);
      push({ ts: clock(base, t + 2), level: 'success', msg: 'listo — outputs en 07_final.mp4' });
      setPhase('done');
    }, delay));
  };

  const needsKey = backend === 'gemini' && !apiKey.trim();
  const canStart = !!file && phase !== 'running' && !needsKey;
  const running = phase === 'running';

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-canvas)', display: 'flex', flexDirection: 'column' }}>
      <TopBar vramUsed={vram} vramTotal={VRAM_TOTAL} />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(380px, 440px) minmax(0, 1fr)', gap: 'var(--space-6)',
        padding: 'var(--space-6) 22px', alignItems: 'start', flex: 1 }}>

        {/* ---------- CONFIG ---------- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <Card title="01 · ENTRADA">
            <SegmentedControl block value={inputTab} onChange={setInputTab}
              options={[
                { value: 'file', label: 'Subir archivo' },
                { value: 'url', label: 'URL de YouTube' },
              ]} />
            <div style={{ marginTop: 'var(--space-4)' }}>
              {inputTab === 'file' ? (
                <UploadDropzone file={file && file.source !== 'url' ? file : null}
                  onPick={(f) => { setFile(f); if (phase === 'done') reset(); }} />
              ) : (
                <YoutubeInput file={file} url={url} setUrl={setUrl} onFetch={fetchUrl} onClear={() => setFile(null)} />
              )}
            </div>
          </Card>

          <Card title="02 · PRESET">
            <SegmentedControl block value={preset} onChange={setPreset}
              options={[
                { value: 'fast', label: 'fast' },
                { value: 'balanced', label: 'balanced' },
                { value: 'quality', label: 'quality' },
              ]} />
            <p style={{ margin: '10px 0 0', fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {preset === 'quality'
                ? 'Pipeline completo M1–M7: incluye lip sync con LTX-2.3 (más lento).'
                : preset === 'fast'
                  ? 'Pipeline M1–M5 sin lip sync. La opción más rápida.'
                  : 'Pipeline M1–M5 sin lip sync. Composición directa.'}
            </p>
          </Card>

          <Card title="03 · TRADUCCIÓN">
            <SectionLabel>Backend</SectionLabel>
            <RadioCards value={backend} onChange={setBackend} options={[
              { value: 'gemini', label: 'Gemini API', badge: <span style={{ marginLeft: 8 }}><Badge tone="cyan">online</Badge></span>,
                description: 'Gratis vía Google AI Studio. Requiere GEMINI_API_KEY.' },
              { value: 'local', label: 'Local · Qwen 35B', badge: <span style={{ marginLeft: 8 }}><Badge tone="violet">offline</Badge></span>,
                description: 'llama.cpp 100% offline · -ngl 24 · ~13.5 GB VRAM.' },
            ]} />
            {backend === 'gemini' && (
              <div style={{ marginTop: 'var(--space-4)' }}>
                <TextField label="GEMINI_API_KEY" type="password" prefix={<IconKey size={14} />}
                  value={apiKey} onChange={setApiKey} placeholder="AIza…"
                  help="Lo ideal es configurarla como variable de entorno." />
              </div>
            )}
            <div style={{ marginTop: 'var(--space-4)' }}>
              <Select label="Plantilla de instrucciones" value={template} onChange={onTemplate}
                options={Object.keys(TEMPLATES)} />
            </div>
            <div style={{ marginTop: 'var(--space-4)' }}>
              <TextField label="Instrucciones" multiline rows={6} value={instructions}
                onChange={(v) => { setInstructions(v); setTemplate('Personalizado'); }}
                help="Editable en cualquier momento antes de iniciar." />
            </div>
          </Card>

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Button variant="primary" size="lg" block loading={running}
              disabled={!canStart} onClick={start}
              leadingIcon={running ? null : <IconPlay size={16} />}>
              {running ? 'Doblando…' : phase === 'done' ? 'Volver a doblar' : 'Iniciar doblaje'}
            </Button>
            {phase === 'done' && (
              <Button variant="secondary" size="lg" onClick={reset} leadingIcon={<IconRefresh size={15} />}>Nuevo</Button>
            )}
          </div>
          {needsKey && (
            <p style={{ margin: '-6px 0 0', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--amber)' }}>
              ⚠ Ingresa la GEMINI_API_KEY o cambia a backend local.
            </p>
          )}
        </div>

        {/* ---------- RUN ---------- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', position: 'sticky', top: 'var(--space-6)' }}>
          <Card title="PIPELINE" actions={
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {(running || phase === 'done') && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                  {fmtElapsed(elapsed)}
                </span>
              )}
              <Badge tone={phase === 'done' ? 'green' : running ? 'cyan' : 'neutral'} dot pulse={running} uppercase>
                {phase === 'done' ? 'completado' : running ? 'corriendo' : 'en espera'}
              </Badge>
            </span>
          }>
            {stages.length === 0 ? (
              <EmptyRun file={file} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {stages.map((s, i) => (
                  <StageStep key={s.name} index={i + 1} name={s.name} device={s.device}
                    status={s.status} detail={s.detail} duration={s.status === 'done' ? s.dur : null} />
                ))}
              </div>
            )}
          </Card>

          {phase === 'done' && <PreviewCard job={job} preset={preset} backend={backend} />}

          <Card title="REGISTRO EN VIVO · stderr" flushBody terminalDots>
            <div ref={termWrap}>
              <Terminal height={232} showCursor={running} showLevel
                lines={logs.length ? logs : [{ level: 'debug', msg: 'esperando — el orquestador no carga modelos; cada etapa corre como subproceso aislado.' }]} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function YoutubeInput({ file, url, setUrl, onFetch, onClear }) {
  const fetched = file && file.source === 'url';
  if (fetched) {
    return (
      <button type="button" onClick={onClear} style={{
        width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
        padding: '14px 16px', background: 'var(--green-deep)', border: '1px solid var(--green-dim)', borderRadius: 'var(--radius-md)' }}>
        <span style={{ color: 'var(--green)', display: 'grid', placeItems: 'center' }}><IconFilm size={26} /></span>
        <span style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--green-bright)' }}>{file.name}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
            YouTube · {file.res} · {file.dur} — clic para quitar
          </span>
        </span>
      </button>
    );
  }
  return (
    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'stretch' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <TextField value={url} onChange={setUrl} placeholder="https://www.youtube.com/watch?v=…"
          prefix={<span style={{ display: 'grid', placeItems: 'center', width: 19, height: 14, borderRadius: 3, background: 'var(--red)', color: '#0c1213' }}><IconPlay size={9} /></span>} />
      </div>
      <Button variant="primary" size="md" disabled={!url.trim()} onClick={onFetch}
        aria-label="Obtener video" leadingIcon={<IconDownload size={16} />} />
    </div>
  );
}

function EmptyRun({ file }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '34px 16px', textAlign: 'center' }}>
      <span style={{ color: 'var(--text-faint)' }}><IconTerminal size={30} /></span>
      <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-secondary)' }}>
        {file ? 'Listo para iniciar el doblaje' : 'Carga un video para empezar'}
      </p>
      <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-muted)', maxWidth: 330, lineHeight: 1.5 }}>
        El pipeline corre etapa por etapa. La VRAM se libera al 100% entre cada subproceso aislado.
      </p>
    </div>
  );
}

const SUBS = [
  '— Hola, soy Stív Yobs, fundador de Ápol.',
  '— En dos mil cinco di una charla en Stánford.',
  '— Tu tiempo es limitado: no lo desperdicies.',
];

function PreviewCard({ job, preset, backend }) {
  const [playing, setPlaying] = React.useState(false);
  const [sub, setSub] = React.useState(0);
  const finalName = preset === 'quality' ? '08_lipdub.mp4' : '07_final.mp4';
  React.useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setSub((s) => (s + 1) % SUBS.length), 2200);
    return () => clearInterval(id);
  }, [playing]);

  return (
    <Card title={<>~/workspace/<b>{job}</b>/{finalName}</>} flushBody terminalDots
      actions={<Badge tone="green" dot uppercase>listo</Badge>}>
      {/* video frame */}
      <div style={{ position: 'relative', aspectRatio: '16 / 9',
        background: 'radial-gradient(120% 100% at 50% 0%, #16201f, #060a0b)',
        display: 'grid', placeItems: 'center', overflow: 'hidden', cursor: 'pointer' }}
        onClick={() => setPlaying((p) => !p)}>
        <div style={{ width: 58, height: 58, borderRadius: '50%', display: 'grid', placeItems: 'center',
          background: 'var(--green)', color: 'var(--text-on-accent)', boxShadow: 'var(--glow-green)',
          opacity: playing ? 0 : 1, transition: 'opacity var(--dur-base)' }}>
          {playing ? <IconPause size={24} /> : <IconPlay size={24} />}
        </div>
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 8 }}>
          <Badge tone="green" dot>voz clonada</Badge>
          <Badge tone="neutral" outline>instrumental 70%</Badge>
          {preset === 'quality' && <Badge tone="violet" outline>lip sync</Badge>}
        </div>
        {/* progress scrubber */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, background: 'rgba(255,255,255,0.10)' }}>
          <div style={{ height: '100%', width: playing ? `${((sub + 1) / SUBS.length) * 100}%` : '0%',
            background: 'var(--green)', boxShadow: 'var(--glow-green)', transition: 'width 2.2s linear' }} />
        </div>
        {/* dubbed ES subtitle */}
        <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center', padding: '0 16px' }}>
          <span style={{ background: 'rgba(6,10,11,0.84)', padding: '6px 14px', borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-sans)', fontSize: 15, color: '#fff', backdropFilter: 'blur(4px)', textAlign: 'center' }}>
            {SUBS[sub]}
          </span>
        </div>
      </div>

      {/* file meta + primary download */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4)',
        borderTop: '1px solid var(--border-subtle)' }}>
        <span style={{ color: 'var(--green)', display: 'grid', placeItems: 'center' }}><IconFilm size={22} /></span>
        <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-primary)' }}>{finalName}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
            1920×1080 · 12:48 · 96 MB · H.264 · es-419 · {backend === 'local' ? 'Qwen 35B' : 'Gemini'}
          </span>
        </span>
        <Button size="md" variant="primary" leadingIcon={<IconDownload size={15} />}>Descargar video</Button>
      </div>

      {/* secondary artifacts */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', padding: '0 var(--space-4) var(--space-4)' }}>
        <ArtifactChip name="03_transcript.srt" tag="EN" />
        <ArtifactChip name="04_translation.srt" tag="ES-419" />
        <ArtifactChip name="06_synth_aligned.wav" tag="audio" />
      </div>
    </Card>
  );
}

function ArtifactChip({ name, tag }) {
  return (
    <button type="button" style={{
      display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer',
      background: 'var(--surface-2)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)',
      padding: '6px 10px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 11, whiteSpace: 'nowrap',
    }}>
      <IconLanguages size={13} />
      <span style={{ color: 'var(--text-primary)' }}>{name}</span>
      <span style={{ color: 'var(--text-faint)' }}>· {tag}</span>
      <IconDownload size={13} />
    </button>
  );
}

window.DianeApp = App;
