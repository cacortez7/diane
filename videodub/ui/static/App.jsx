/* Diane app — vista principal conectada a la API real de FastAPI.
 * Adaptado de ui_kits/diane-app/App.jsx del design system: misma estructura
 * visual, pero el runner simulado se reemplaza por POST /api/jobs + SSE. */
const { Button, Badge, Card, SegmentedControl, RadioCards, Select, TextField, StageStep, Terminal } = window.DianeDesignSystem_fdee8c;
const { SectionLabel, TopBar, UploadDropzone, ReferenceAudio } = window;
const { IconPlay, IconDownload, IconKey, IconTerminal, IconRefresh, IconFilm, IconLanguages } = window;

const VRAM_TOTAL_FALLBACK = 16384;

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
    "4) Adapt idioms and expressions, don't translate literally.",
  'Documental':
    'Documentary content. Rules: 1) Neutral, formal Latin American Spanish. ' +
    '2) Preserve technical terms when no good Spanish equivalent exists. ' +
    '3) Maintain the authoritative tone of the narrator. 4) Accuracy over style.',
  'Personalizado': '',
};

const STAGE_META = {
  revisar_traduccion: { device: null, detail: 'revisión humana · editar líneas' },
  extract_audio:   { device: 'CPU', detail: 'FFmpeg · 16 kHz mono WAV' },
  separate_vocals: { device: 'GPU', detail: 'Demucs htdemucs_ft · vocals + instrumental' },
  transcribe:      { device: 'GPU', detail: 'WhisperX large-v3 · word-level · VAD' },
  translate:       { device: null,  detail: 'Gemini / Qwen 35B local' },
  synthesize:      { device: 'GPU', detail: 'Fish S2 Pro · BF16 · voz clonada' },
  align_timing:    { device: 'CPU', detail: 'rubberband · cap 1.25x · sin cambiar pitch' },
  compose:         { device: 'CPU', detail: 'voz 100% + instrumental 70% · -c:v copy' },
  lipdub:          { device: 'GPU', detail: 'LTX-2.3 IC-LoRA · por chunks' },
};

function now() { return new Date().toTimeString().slice(0, 8); }
function fmtElapsed(ms) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function App() {
  const [file, setFile] = React.useState(null);
  const [preset, setPreset] = React.useState('balanced');
  const [backend, setBackend] = React.useState('gemini');
  const [apiKey, setApiKey] = React.useState('');
  const [hasEnvKey, setHasEnvKey] = React.useState(true);
  const [template, setTemplate] = React.useState('YouTube Tech/AI');
  const [instructions, setInstructions] = React.useState(TEMPLATES['YouTube Tech/AI']);
  const [inputTab, setInputTab] = React.useState('file');   // file | url
  const [url, setUrl] = React.useState('');
  const [fetching, setFetching] = React.useState(false);
  const [stages, setStages] = React.useState([]);
  const [logs, setLogs] = React.useState([]);
  const [vramUsed, setVramUsed] = React.useState(0);
  const [vramTotal, setVramTotal] = React.useState(VRAM_TOTAL_FALLBACK);
  const [phase, setPhase] = React.useState('idle');   // idle | running | review | done | failed
  const [elapsed, setElapsed] = React.useState(0);
  const [job, setJob] = React.useState('');
  const [refAudio, setRefAudio] = React.useState(null);
  const [lines, setLines] = React.useState([]);       // panel de revisión
  const tick = React.useRef(null);
  const sse = React.useRef(null);
  const termWrap = React.useRef(null);

  const onTemplate = (t) => { setTemplate(t); if (t !== 'Personalizado') setInstructions(TEMPLATES[t]); };
  const push = (level, msg) => setLogs((prev) => [...prev, { ts: now(), level, msg }]);

  // ¿Hay GEMINI_API_KEY en el entorno del server? (muestra/oculta el campo)
  React.useEffect(() => {
    fetch('/api/health').then((r) => r.json())
      .then((d) => setHasEnvKey(!!d.gemini_key)).catch(() => setHasEnvKey(false));
  }, []);

  // VRAM real: polling (rápido si corre, lento si no).
  React.useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const r = await fetch('/api/vram');
        const d = await r.json();
        if (alive && d.available) { setVramUsed(d.used_mib); setVramTotal(d.total_mib); }
      } catch (e) { /* server reiniciando */ }
    };
    poll();
    const id = setInterval(poll, phase === 'running' ? 2000 : 10000);
    return () => { alive = false; clearInterval(id); };
  }, [phase]);

  React.useEffect(() => {
    const el = termWrap.current && termWrap.current.querySelector('.dn-term');
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs]);

  React.useEffect(() => () => { if (sse.current) sse.current.close(); clearInterval(tick.current); }, []);

  const reset = () => {
    if (sse.current) sse.current.close();
    clearInterval(tick.current);
    setPhase('idle'); setStages([]); setLogs([]); setLines([]); setElapsed(0); setJob('');
  };

  const apiJobId = React.useRef('');

  const enterReview = async () => {
    setPhase('review');
    setStages((prev) => prev.map((s) => s.name === 'revisar_traduccion'
      ? { ...s, status: 'running', detail: 'esperando aprobación · editá las líneas' } : s));
    try {
      const r = await fetch(`/api/jobs/${apiJobId.current}/translation`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.detail || r.statusText);
      setLines(d.segments.map((s) => ({ ...s, original: s.text })));
      push('warn', `traducción lista — ${d.segments.length} líneas · esperando revisión humana`);
    } catch (e) {
      push('error', `✗ no se pudo cargar la traducción: ${e.message || e}`);
    }
  };

  const approve = async () => {
    const edits = lines.filter((l) => l.text !== l.original)
      .map((l) => ({ index: l.index, text: l.text }));
    try {
      if (edits.length) {
        const r = await fetch(`/api/jobs/${apiJobId.current}/translation`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ segments: edits }),
        });
        if (!r.ok) throw new Error((await r.json()).detail || r.statusText);
      }
      const r2 = await fetch(`/api/jobs/${apiJobId.current}/resume`, { method: 'POST' });
      if (!r2.ok) throw new Error((await r2.json()).detail || r2.statusText);
      push('success', `traducción aprobada — ${edits.length} línea(s) editada(s) · reanudando synthesize`);
      setStages((prev) => prev.map((s) => s.name === 'revisar_traduccion'
        ? { ...s, status: 'done', detail: `${lines.length} líneas aprobadas` } : s));
      setPhase('running');
    } catch (e) {
      push('error', `✗ no se pudo reanudar: ${e.message || e}`);
    }
  };

  const fetchUrl = async () => {
    if (!url.trim() || fetching) return;
    setFetching(true);
    push('info', `descargando ${url.trim()} con yt-dlp…`);
    try {
      const r = await fetch('/api/download-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.detail || r.statusText);
      setFile({ source: 'url', file_id: d.file_id, name: d.name,
        size: d.size_bytes, res: d.resolution, duration_s: d.duration_s });
      push('success', `✓ descargado ${d.name} (${(d.size_bytes / 1048576).toFixed(1)} MB)`);
      if (phase === 'done') reset();
    } catch (e) {
      push('error', `✗ descarga falló — ${e.message || e}`);
    } finally {
      setFetching(false);
    }
  };

  const onEvent = (ev) => {
    if (ev.type === 'job_start') {
      setJob(ev.job_id);
      // Etapa virtual de revisión humana entre translate y synthesize.
      const names = ev.stages.flatMap((n) => n === 'translate' ? ['translate', 'revisar_traduccion'] : [n]);
      setStages(names.map((name) => ({ name, ...(STAGE_META[name] || {}), status: 'pending' })));
      push('info', `job ${ev.job_id} → workspace/${ev.job_id}`);
    } else if (ev.type === 'review_wait') {
      enterReview();
    } else if (ev.type === 'review_done') {
      setStages((prev) => prev.map((s) => s.name === 'revisar_traduccion' && s.status !== 'done'
        ? { ...s, status: 'done' } : s));
      setPhase('running');
    } else if (ev.type === 'stage_start') {
      setStages((prev) => prev.map((s) => s.name === ev.stage ? { ...s, status: 'running' } : s));
      push('stage', `→ etapa ${ev.stage}`);
    } else if (ev.type === 'stage_cached') {
      setStages((prev) => prev.map((s) => s.name === ev.stage ? { ...s, status: 'done', cached: true } : s));
      push('debug', `${ev.stage} · cached (hash hit) — se salta`);
    } else if (ev.type === 'stage_done') {
      setStages((prev) => prev.map((s) => s.name === ev.stage
        ? { ...s, status: 'done', dur: `${ev.duration_s}s` } : s));
      const dv = (ev.vram_after_mib != null && ev.vram_before_mib != null)
        ? ` | Δ VRAM ${ev.vram_after_mib - ev.vram_before_mib >= 0 ? '+' : ''}${ev.vram_after_mib - ev.vram_before_mib}` : '';
      push('success', `← ${ev.stage} | rc=0 | ${ev.duration_s}s${dv}`);
    } else if (ev.type === 'error') {
      push('error', `✗ ${ev.stage ? `etapa ${ev.stage} falló` : 'job falló'}${ev.message ? ` — ${ev.message}` : ''}`);
      if (ev.stderr_tail) push('error', ev.stderr_tail.split('\n').slice(-3).join(' · '));
      setStages((prev) => prev.map((s) => s.status === 'running' ? { ...s, status: 'error' } : s));
    } else if (ev.type === 'job_done') {
      push('success', 'listo — outputs en 07_final.mp4');
    } else if (ev.type === 'eof') {
      clearInterval(tick.current);
      setPhase(ev.status === 'done' ? 'done' : 'failed');
    }
  };

  const start = async () => {
    reset();
    setPhase('running');
    const t0 = Date.now();
    tick.current = setInterval(() => setElapsed(Date.now() - t0), 200);
    push('debug', `preset=${preset} · backend=${backend} · target=es-419`);

    const form = new FormData();
    if (file.source === 'url') form.append('file_id', file.file_id);
    else form.append('file', file);
    form.append('preset', preset);
    form.append('backend', backend);
    form.append('instructions', instructions);
    form.append('review', '1');
    if (refAudio && refAudio.file) form.append('ref_audio', refAudio.file);
    if (apiKey.trim()) form.append('api_key', apiKey.trim());

    let resp;
    try {
      resp = await fetch('/api/jobs', { method: 'POST', body: form });
    } catch (e) {
      push('error', `✗ no se pudo contactar al server: ${e}`);
      setPhase('failed'); clearInterval(tick.current); return;
    }
    if (!resp.ok) {
      const detail = (await resp.json().catch(() => ({}))).detail || resp.statusText;
      push('error', `✗ ${detail}`);
      if (/GEMINI_API_KEY/.test(detail)) setHasEnvKey(false);
      setPhase('idle'); clearInterval(tick.current); return;
    }
    const { job_id } = await resp.json();
    apiJobId.current = job_id;
    const es = new EventSource(`/api/jobs/${job_id}/events`);
    sse.current = es;
    es.onmessage = (m) => onEvent(JSON.parse(m.data));
    es.onerror = () => es.close();
  };

  const needsKey = backend === 'gemini' && !hasEnvKey && !apiKey.trim();
  const busy = phase === 'running' || phase === 'review';
  const canStart = !!file && !busy && !needsKey;
  const running = phase === 'running';

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-canvas)', display: 'flex', flexDirection: 'column' }}>
      <TopBar vramUsed={vramUsed} vramTotal={vramTotal} />
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
                <YoutubeInput file={file} url={url} setUrl={setUrl}
                  fetching={fetching} onFetch={fetchUrl} onClear={() => setFile(null)} />
              )}
            </div>
            <div style={{ marginTop: 'var(--space-5)', paddingTop: 'var(--space-5)', borderTop: '1px solid var(--border-subtle)' }}>
              <ReferenceAudio audio={refAudio}
                onLoad={(a) => { setRefAudio(a); if (phase === 'done') reset(); }}
                onClear={() => setRefAudio(null)} />
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
                ? 'Pipeline completo: incluirá lip sync con LTX-2.3 cuando llegue M7.'
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
            {backend === 'gemini' && !hasEnvKey && (
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
            <Button variant="primary" size="lg" block loading={busy}
              disabled={!canStart} onClick={start}
              leadingIcon={busy ? null : <IconPlay size={16} />}>
              {phase === 'review' ? 'En revisión…' : running ? 'Doblando…' : phase === 'done' ? 'Volver a doblar' : 'Iniciar doblaje'}
            </Button>
            {(phase === 'done' || phase === 'failed') && (
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
              {(busy || phase === 'done') && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                  {fmtElapsed(elapsed)}
                </span>
              )}
              <Badge tone={phase === 'done' ? 'green' : phase === 'failed' ? 'red' : phase === 'review' ? 'amber' : running ? 'cyan' : 'neutral'} dot pulse={running} uppercase>
                {phase === 'done' ? 'completado' : phase === 'failed' ? 'falló' : phase === 'review' ? 'revisión' : running ? 'corriendo' : 'en espera'}
              </Badge>
            </span>
          }>
            {stages.length === 0 ? (
              <EmptyRun file={file} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {stages.map((s, i) => (
                  <StageStep key={s.name} index={i + 1} name={s.name} device={s.device}
                    status={s.status} detail={s.cached ? 'cached · hash hit' : s.detail}
                    duration={s.status === 'done' ? s.dur : null} />
                ))}
              </div>
            )}
          </Card>

          {phase === 'review' && <ReviewPanel lines={lines} setLines={setLines} onApprove={approve} backend={backend} />}
          {phase === 'done' && <PreviewCard job={job} backend={backend} />}

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

function YoutubeInput({ file, url, setUrl, fetching, onFetch, onClear }) {
  const fetched = file && file.source === 'url';
  if (fetched) {
    const dur = file.duration_s
      ? `${Math.floor(file.duration_s / 60)}:${String(Math.floor(file.duration_s % 60)).padStart(2, '0')}` : '';
    return (
      <button type="button" onClick={onClear} style={{
        width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
        padding: '14px 16px', background: 'var(--green-deep)', border: '1px solid var(--green-dim)', borderRadius: 'var(--radius-md)' }}>
        <span style={{ color: 'var(--green)', display: 'grid', placeItems: 'center' }}><IconFilm size={26} /></span>
        <span style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--green-bright)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
            YouTube · {file.res}{dur ? ` · ${dur}` : ''} — clic para quitar
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
      <Button variant="primary" size="md" disabled={!url.trim() || fetching} loading={fetching} onClick={onFetch}
        aria-label="Obtener video" leadingIcon={fetching ? null : <IconDownload size={16} />} />
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

function PreviewCard({ job, backend }) {
  const [artifacts, setArtifacts] = React.useState([]);
  const finalName = '07_final.mp4';
  const url = (name) => `/api/jobs/${job}/artifacts/${name}`;
  const dlUrl = (name) => `${url(name)}?download=1`;

  React.useEffect(() => {
    fetch(`/api/jobs/${job}/artifacts`).then((r) => r.json())
      .then((d) => setArtifacts(d.artifacts || [])).catch(() => {});
  }, [job]);

  const finalMeta = artifacts.find((a) => a.name === finalName);
  const secondary = artifacts.filter((a) => a.name !== finalName);
  const TAGS = { '03_transcript.srt': 'EN', '03_transcript.json': 'EN', '04_translation.srt': 'ES-419',
    '04_translation.json': 'ES-419', '06_synth_aligned.wav': 'audio' };

  return (
    <Card title={<>~/workspace/<b>{job}</b>/{finalName}</>} flushBody terminalDots
      actions={<Badge tone="green" dot uppercase>listo</Badge>}>
      <div style={{ position: 'relative', aspectRatio: '16 / 9', background: '#060a0b' }}>
        <video controls src={url(finalName)} style={{ width: '100%', height: '100%', display: 'block' }} />
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 8, pointerEvents: 'none' }}>
          <Badge tone="green" dot>voz clonada</Badge>
          <Badge tone="neutral" outline>instrumental 70%</Badge>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4)',
        borderTop: '1px solid var(--border-subtle)' }}>
        <span style={{ color: 'var(--green)', display: 'grid', placeItems: 'center' }}><IconFilm size={22} /></span>
        <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-primary)' }}>{finalName}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
            {finalMeta ? `${(finalMeta.size_bytes / 1048576).toFixed(1)} MB · ` : ''}es-419 · {backend === 'local' ? 'Qwen 35B' : 'Gemini'}
          </span>
        </span>
        <a href={dlUrl(finalName)} download style={{ textDecoration: 'none' }}>
          <Button size="md" variant="primary" leadingIcon={<IconDownload size={15} />}>Descargar video</Button>
        </a>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', padding: '0 var(--space-4) var(--space-4)' }}>
        {secondary.map((a) => (
          <a key={a.name} href={dlUrl(a.name)} download style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', textDecoration: 'none',
            background: 'var(--surface-2)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)',
            padding: '6px 10px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 11, whiteSpace: 'nowrap',
          }}>
            <IconLanguages size={13} />
            <span style={{ color: 'var(--text-primary)' }}>{a.name}</span>
            <span style={{ color: 'var(--text-faint)' }}>· {TAGS[a.name] || 'file'}</span>
            <IconDownload size={13} />
          </a>
        ))}
      </div>
    </Card>
  );
}

function fmtTc(s) {
  const ms = Math.round(s * 1000);
  const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60,
    sec = Math.floor(ms / 1000) % 60, mm = ms % 1000;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(mm).padStart(3, '0')}`;
}

function ReviewPanel({ lines, setLines, onApprove, backend }) {
  const edit = (i, v) => setLines((prev) => prev.map((l, j) => j === i ? { ...l, text: v } : l));
  const edited = lines.filter((l) => l.text !== l.original).length;
  const hdr = { fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', textTransform: 'uppercase',
    letterSpacing: 'var(--tracking-caps)', color: 'var(--text-secondary)' };
  return (
    <Card title="REVISAR TRADUCCIÓN" flushBody terminalDots
      actions={<Badge tone="amber" dot uppercase>{lines.length} líneas</Badge>}>
      <div style={{ padding: '14px 16px 12px' }}>
        <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Revisión humana entre <b style={{ color: 'var(--text-secondary)' }}>translate</b> y <b style={{ color: 'var(--text-secondary)' }}>synthesize</b>.
          Editá el español antes de clonar la voz — el pipeline está en pausa.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--surface-2)' }}>
        <div style={{ ...hdr, padding: '6px 14px', borderRight: '1px solid var(--border-subtle)', borderTop: '1px solid var(--border-subtle)' }}>EN · original</div>
        <div style={{ ...hdr, padding: '6px 14px', borderTop: '1px solid var(--border-subtle)', color: 'var(--green-bright)' }}>ES-419 · editable</div>
      </div>
      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
        {lines.map((l, i) => <ReviewRow key={l.index} line={l} onEdit={(v) => edit(i, v)} />)}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)' }}>
        <span style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
          {edited > 0 ? `${edited} línea${edited > 1 ? 's' : ''} editada${edited > 1 ? 's' : ''}` : 'sin cambios'} · {backend === 'local' ? 'Qwen 35B' : 'Gemini'}
        </span>
        <Button variant="primary" size="md" onClick={onApprove} trailingIcon={<span style={{ fontSize: '1.1em' }}>→</span>}>
          Aprobar y continuar
        </Button>
      </div>
    </Card>
  );
}

function ReviewRow({ line, onEdit }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid var(--border-subtle)' }}>
      <div style={{ padding: '10px 14px', borderRight: '1px solid var(--border-subtle)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)', marginBottom: 4 }}>{fmtTc(line.start)}</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.45 }}>{line.source_text}</div>
      </div>
      <div style={{ background: 'var(--surface-inset)' }}>
        <textarea value={line.text} onChange={(e) => onEdit(e.target.value)} rows={2} spellCheck={false}
          style={{ width: '100%', height: '100%', minHeight: 54, resize: 'none', boxSizing: 'border-box',
            background: 'transparent', border: 'none', outline: 'none', caretColor: 'var(--green)',
            color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.45, padding: '10px 14px' }} />
      </div>
    </div>
  );
}

window.DianeApp = App;
