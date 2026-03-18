import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';

const CLIP_STYLES = [
  { id: 'viral',         label: 'Most Viral',             desc: 'Purely optimise for scroll-stopping performance' },
  { id: 'emotional',     label: 'Emotional Moments',       desc: 'Peak vulnerability, connection and feeling' },
  { id: 'actionable',    label: 'Actionable Advice',       desc: 'Concrete takeaways people can use immediately' },
  { id: 'controversial', label: 'Controversial Takes',     desc: 'Opinions that provoke reaction and debate' },
  { id: 'raw',           label: 'Raw Honesty',             desc: 'Unfiltered, candid moments of truth' },
  { id: 'surprising',    label: 'Surprising Revelations',  desc: 'Unexpected facts, turns and revelations' },
];

export default function PodcastClips() {
  const [mounted, setMounted]               = useState(false);
  const [context, setContext]               = useState('');
  const [clipStyle, setClipStyle]           = useState('viral');
  const [transcript, setTranscript]         = useState('');
  const [fileName, setFileName]             = useState('');
  const [dragOver, setDragOver]             = useState(false);
  const [loading, setLoading]               = useState(false);
  const [clips, setClips]                   = useState([]);
  const [previousTitles, setPreviousTitles] = useState([]);
  const [error, setError]                   = useState('');
  const [expandedClip, setExpandedClip]     = useState(null);
  const [copied, setCopied]                 = useState(null);

  const canvasRef    = useRef(null);
  const fileInputRef = useRef(null);
  const resultsRef   = useRef(null);

  useEffect(() => { setMounted(true); }, []);

  // ── Particle canvas ──
  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const particles = [];

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    for (let i = 0; i < 90; i++) {
      particles.push({
        x:       Math.random() * window.innerWidth,
        y:       Math.random() * window.innerHeight,
        vx:      (Math.random() - 0.5) * 0.2,
        vy:      (Math.random() - 0.5) * 0.2,
        size:    Math.random() * 1.4 + 0.3,
        warm:    Math.random() > 0.6,
        opacity: Math.random() * 0.12 + 0.02,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.warm
          ? `rgba(255,107,53,${p.opacity})`
          : `rgba(125,249,255,${p.opacity})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    animate();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animId); };
  }, [mounted]);

  // ── File parsing ──
  const parseFileContent = (text, name) => {
    if (name.endsWith('.csv')) {
      return text
        .split('\n')
        .map(row => {
          const cols = row.split(',');
          return cols.slice(3).join(' ').replace(/^"|"$/g, '').trim();
        })
        .filter(Boolean)
        .join('\n');
    }
    return text;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setTranscript(parseFileContent(ev.target.result, file.name));
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setTranscript(parseFileContent(ev.target.result, file.name));
    };
    reader.readAsText(file);
  };

  // ── Submit ──
  const handleSubmit = async (findMore = false) => {
    if (!transcript.trim() || transcript.trim().length < 100) {
      setError('Please paste or upload a transcript first.');
      return;
    }
    setError('');
    setLoading(true);
    if (!findMore) {
      setClips([]);
      setExpandedClip(null);
      setPreviousTitles([]);
    }

    try {
      const res = await fetch('/api/podcast-clips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          clipStyle,
          context: context.trim(),
          previousTitles: findMore ? previousTitles : [],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      const newClips = data.clips || [];
      setClips(newClips);
      setExpandedClip(0);
      setPreviousTitles(prev => [...prev, ...newClips.map(c => c.title)]);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      setError(err.message || 'Failed to generate clip suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const reset = () => {
    setTranscript(''); setFileName(''); setContext('');
    setClips([]); setError(''); setPreviousTitles([]);
    setExpandedClip(null); setClipStyle('viral');
  };

  if (!mounted) return null;

  const selectedStyle = CLIP_STYLES.find(s => s.id === clipStyle);

  return (
    <Layout>
      <canvas ref={canvasRef} className="bg-canvas" />
      <div className="page">

        {/* ── HEADER ── */}
        <div className="header" onClick={() => clips.length > 0 && reset()}>
          <div className="eyebrow">// PODCAST_CLIP_FINDER</div>
          <h1 className="header-title">Clip <span className="highlight">Intelligence.</span></h1>
          <p className="subtext">
            {clips.length > 0
              ? 'Results ready · click title to start over'
              : 'Drop a transcript. Get your five best clips instantly.'}
          </p>
        </div>

        {/* ── INPUT CARD ── */}
        {clips.length === 0 && !loading && (
          <div className="card">
            <div className="card-label">// CLIP_CONFIGURATION</div>
            <h2>What are we clipping?</h2>
            <p className="card-desc">
              Drop in any podcast transcript — the tool finds the best moments to cut for short-form.
              Add optional context if there is anything useful to know about the show or guest.
            </p>

            {/* Optional context */}
            <div className="field">
              <label>
                Additional Context
                <span className="optional">(optional — show name, guest background, anything useful)</span>
              </label>
              <textarea
                className="context-input"
                value={context}
                onChange={e => setContext(e.target.value)}
                rows={2}
                placeholder="e.g. Recovery podcast, guest is a UFC fighter who has been sober 3 years..."
              />
            </div>

            {/* Clip style */}
            <div className="field">
              <label>Clip Style</label>
              <div className="style-grid">
                {CLIP_STYLES.map(s => (
                  <button
                    key={s.id}
                    className={`style-btn ${clipStyle === s.id ? 'active' : ''}`}
                    onClick={() => setClipStyle(s.id)}
                  >
                    <span className="style-label">{s.label}</span>
                    {clipStyle === s.id && <span className="style-desc">{s.desc}</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Transcript */}
            <div className="field">
              <label>
                Episode Transcript
                <span className="required">*</span>
              </label>
              <div
                className={`transcript-card ${dragOver ? 'drag-over' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <div className="transcript-top">
                  <div className="transcript-label-row">
                    {fileName
                      ? <span className="file-badge">// {fileName}</span>
                      : <span className="drag-hint">// DRAG & DROP FILE HERE OR PASTE BELOW</span>
                    }
                  </div>
                  <div className="upload-row">
                    {transcript.length > 0 && (
                      <span className="char-count">{transcript.length.toLocaleString()} chars</span>
                    )}
                    <button className="upload-btn" onClick={() => fileInputRef.current?.click()}>
                      {fileName ? 'Change File' : 'Upload File'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.csv,.srt,.vtt,text/*"
                      style={{ display: 'none' }}
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>
                <textarea
                  className="transcript-input"
                  placeholder="Paste your full episode transcript here..."
                  value={transcript}
                  onChange={e => { setTranscript(e.target.value); setFileName(''); }}
                  rows={10}
                />
              </div>
              <div className="timestamp-note">
                // For accurate timestamps, upload a .csv or .txt file exported from YouTube or your transcription tool.
                Plain pasted text will still find the right moments but will not have exact timecodes.
              </div>
            </div>

            {error && <div className="error-msg">// ERROR: {error}</div>}

            <button
              className="btn-primary"
              onClick={() => handleSubmit(false)}
              disabled={!transcript.trim() || transcript.trim().length < 100}
            >
              FIND BEST CLIPS — {selectedStyle?.label.toUpperCase()}
            </button>
          </div>
        )}

        {/* ── LOADING ── */}
        {loading && (
          <div className="card loading-card">
            <div className="spinner">
              <div className="ring" />
              <div className="ring ring-2" />
            </div>
            <div className="loading-status">// SCANNING TRANSCRIPT FOR PEAK MOMENTS...</div>
            <div className="loading-bar"><div className="loading-fill" /></div>
            <div className="loading-note">
              Reading through your transcript and ranking moments by {selectedStyle?.label.toLowerCase()} potential...
            </div>
          </div>
        )}

        {/* ── RESULTS ── */}
        {clips.length > 0 && !loading && (
          <div ref={resultsRef}>

            {/* Recap bar */}
            <div className="recap-bar">
              <div className="recap-left">
                <span className="recap-style">{selectedStyle?.label}</span>
                <span className="recap-count">// {clips.length} clips found</span>
                {previousTitles.length > clips.length && (
                  <span className="recap-cycle">
                    · batch {Math.floor(previousTitles.length / clips.length)}
                  </span>
                )}
              </div>
              <button className="btn-restart" onClick={reset}>↺ New Transcript</button>
            </div>

            {/* Clip cards */}
            <div className="clips-list">
              {clips.map((clip, i) => (
                <div
                  key={`${i}-${clip.title}`}
                  className={`clip-card ${expandedClip === i ? 'expanded' : ''}`}
                  onClick={() => setExpandedClip(expandedClip === i ? null : i)}
                >
                  <div className="clip-header">
                    <div className="clip-left">
                      <div className="clip-num">0{i + 1}</div>
                      <div className="clip-times">
                        <span className="time-badge">{clip.start_time || '—'}</span>
                        <span className="time-sep">→</span>
                        <span className="time-badge">{clip.end_time || '—'}</span>
                      </div>
                      <h4 className="clip-title">{clip.title}</h4>
                    </div>
                    <div className="clip-chevron">{expandedClip === i ? '−' : '+'}</div>
                  </div>

                  {expandedClip === i && (
                    <div className="clip-body" onClick={e => e.stopPropagation()}>

                      {clip.transcript_excerpt && (
                        <div className="clip-section excerpt-section">
                          <div className="section-label">// TRANSCRIPT EXCERPT</div>
                          <p className="clip-excerpt">"{clip.transcript_excerpt}"</p>
                        </div>
                      )}

                      <div className="clip-section hook-section">
                        <div className="section-label">// CAPTION HOOK</div>
                        <p className="clip-hook">{clip.hook}</p>
                        <button
                          className="copy-btn"
                          onClick={() => copy(clip.hook, `hook-${i}`)}
                        >
                          {copied === `hook-${i}` ? '✓ Copied' : 'Copy Hook'}
                        </button>
                      </div>

                      <div className="clip-section reason-section">
                        <div className="section-label">// WHY THIS WORKS</div>
                        <p className="clip-reason">{clip.reason}</p>
                      </div>

                      <button
                        className="copy-all-btn"
                        onClick={() => copy(
                          [
                            clip.title,
                            `${clip.start_time || ''} → ${clip.end_time || ''}`,
                            '',
                            'Caption Hook:',
                            clip.hook,
                            '',
                            'Transcript Excerpt:',
                            `"${clip.transcript_excerpt}"`,
                            '',
                            'Why It Works:',
                            clip.reason,
                          ].join('\n'),
                          `all-${i}`
                        )}
                      >
                        {copied === `all-${i}` ? '✓ Copied All' : '⎘ Copy All Details'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Find More */}
            <div className="find-more-wrap">
              <button className="btn-find-more" onClick={() => handleSubmit(true)}>
                ↻ Find More Clips
              </button>
              <p className="find-more-note">
                // Reruns the search and finds 5 different moments — none of the ones above
              </p>
              {error && <div className="error-msg" style={{ marginTop: '16px' }}>// ERROR: {error}</div>}
            </div>

          </div>
        )}

      </div>

      <style jsx>{`
        .bg-canvas {
          position: fixed; top: 0; left: 0;
          width: 100%; height: 100%;
          pointer-events: none; z-index: 0;
        }

        .page {
          position: relative; z-index: 1;
          max-width: 860px; margin: 0 auto;
          padding: 100px 20px 140px;
        }

        /* ── Header ── */
        .header { text-align: center; margin-bottom: 60px; cursor: default; transition: all 0.3s; }
        .header:hover .eyebrow { letter-spacing: 0.3em; color: var(--warm); }
        .header:hover .highlight { text-shadow: 0 0 25px rgba(255,107,53,0.6); filter: brightness(1.2); }
        .eyebrow { font-family: 'JetBrains Mono'; color: var(--accent); font-size: 11px; letter-spacing: 0.2em; margin-bottom: 16px; transition: all 0.4s; }
        .header-title { font-size: 48px; font-weight: 800; color: #fff; margin-bottom: 12px; display: block; transition: all 0.4s; }
        .highlight { color: var(--warm); transition: all 0.4s; }
        .subtext { color: var(--text-2); font-size: 13px; font-family: 'JetBrains Mono'; }

        /* ── Card ── */
        .card { background: var(--surface); border: 1px solid var(--border); border-radius: 24px; padding: 50px; backdrop-filter: blur(10px); }
        .card-label { font-family: 'JetBrains Mono'; font-size: 10px; letter-spacing: 0.2em; color: var(--accent); margin-bottom: 16px; }
        h2 { font-size: 28px; font-weight: 800; color: #fff; margin-bottom: 8px; }
        .card-desc { color: var(--text-2); font-size: 14px; line-height: 1.6; margin-bottom: 36px; }

        /* ── Fields ── */
        .field { display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; }
        label { font-family: 'JetBrains Mono'; font-size: 10px; letter-spacing: 0.15em; color: var(--text-2); text-transform: uppercase; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .optional { color: rgba(255,255,255,0.2); font-size: 9px; text-transform: none; letter-spacing: 0; }
        .required { color: var(--warm); }

        .context-input {
          background: rgba(0,0,0,0.3); border: 1px solid var(--border);
          border-radius: 10px; padding: 14px 16px; color: #fff; font-size: 14px;
          outline: none; transition: border-color 0.2s; font-family: inherit;
          resize: vertical; width: 100%; box-sizing: border-box; line-height: 1.6;
        }
        .context-input:focus { border-color: var(--accent); background: rgba(0,0,0,0.5); }
        .context-input::placeholder { color: rgba(255,255,255,0.18); }

        /* ── Style selector ── */
        .style-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .style-btn {
          padding: 12px 14px; background: transparent;
          border: 1px solid var(--border); border-radius: 10px;
          color: var(--text-2); font-family: 'JetBrains Mono';
          cursor: pointer; text-align: left; transition: all 0.2s;
          display: flex; flex-direction: column; gap: 4px;
        }
        .style-btn:hover { border-color: var(--accent); color: #fff; }
        .style-btn.active { border-color: var(--accent); background: rgba(125,249,255,0.07); color: var(--accent); }
        .style-label { font-size: 11px; font-weight: 700; letter-spacing: 0.05em; }
        .style-desc { font-size: 10px; color: rgba(255,255,255,0.35); line-height: 1.4; letter-spacing: 0; font-weight: 400; }
        .style-btn.active .style-desc { color: rgba(125,249,255,0.5); }

        /* ── Transcript card ── */
        .transcript-card {
          background: rgba(0,0,0,0.25); border: 1px solid var(--border);
          border-radius: 14px; padding: 20px; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .transcript-card.drag-over {
          border-color: var(--accent); background: rgba(125,249,255,0.04);
          box-shadow: 0 0 24px rgba(125,249,255,0.1);
        }
        .transcript-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; gap: 12px; }
        .transcript-label-row { flex: 1; min-width: 0; }
        .drag-hint { font-family: 'JetBrains Mono'; font-size: 10px; letter-spacing: 0.12em; color: rgba(125,249,255,0.3); }
        .file-badge { font-family: 'JetBrains Mono'; font-size: 10px; letter-spacing: 0.1em; color: var(--accent); }
        .upload-row { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
        .char-count { font-family: 'JetBrains Mono'; font-size: 10px; color: rgba(255,255,255,0.25); }
        .upload-btn {
          padding: 7px 14px; background: rgba(125,249,255,0.07);
          border: 1px solid rgba(125,249,255,0.2); border-radius: 7px;
          color: var(--accent); font-family: 'JetBrains Mono'; font-size: 10px;
          font-weight: 700; letter-spacing: 0.08em; cursor: pointer; transition: all 0.2s; white-space: nowrap;
        }
        .upload-btn:hover { background: rgba(125,249,255,0.14); border-color: var(--accent); }
        .transcript-input {
          background: transparent; border: none; padding: 0; color: rgba(255,255,255,0.65);
          font-size: 13px; outline: none; font-family: 'JetBrains Mono'; line-height: 1.65;
          resize: vertical; width: 100%; box-sizing: border-box;
        }
        .transcript-input::placeholder { color: rgba(255,255,255,0.15); }

        .timestamp-note {
          font-family: 'JetBrains Mono'; font-size: 10px; letter-spacing: 0.07em;
          color: rgba(125,249,255,0.3); line-height: 1.65;
          background: rgba(125,249,255,0.03); border: 1px solid rgba(125,249,255,0.09);
          border-radius: 8px; padding: 10px 14px;
        }

        .error-msg {
          font-family: 'JetBrains Mono'; font-size: 11px; color: #ff4444;
          padding: 12px 14px; background: rgba(255,68,68,0.08);
          border: 1px solid rgba(255,68,68,0.2); border-radius: 8px; margin-bottom: 16px;
        }

        /* ── Primary button ── */
        .btn-primary {
          width: 100%; padding: 16px; background: var(--accent); color: #000;
          border: none; border-radius: 12px; font-weight: 800; font-size: 13px;
          cursor: pointer; text-transform: uppercase; letter-spacing: 0.08em;
          transition: all 0.2s; font-family: 'JetBrains Mono'; margin-top: 8px;
        }
        .btn-primary:hover:not(:disabled) { box-shadow: 0 0 20px rgba(125,249,255,0.4); transform: scale(1.01); }
        .btn-primary:disabled { opacity: 0.3; cursor: not-allowed; transform: none; }

        /* ── Loading card ── */
        .loading-card { display: flex; flex-direction: column; align-items: center; padding: 80px 50px; gap: 24px; }
        .spinner { position: relative; width: 60px; height: 60px; }
        .ring { position: absolute; inset: 0; border-radius: 50%; border: 2px solid transparent; border-top-color: var(--accent); animation: spin 1s linear infinite; }
        .ring-2 { inset: 8px; border-top-color: var(--warm); animation-duration: 1.5s; animation-direction: reverse; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-status { font-family: 'JetBrains Mono'; font-size: 11px; color: var(--accent); letter-spacing: 0.15em; }
        .loading-bar { width: 240px; height: 2px; background: rgba(255,255,255,0.1); border-radius: 999px; overflow: hidden; }
        .loading-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--warm)); animation: loadprog 8s ease-in-out forwards; }
        @keyframes loadprog { 0% { width: 0%; } 70% { width: 80%; } 100% { width: 92%; } }
        .loading-note { font-family: 'JetBrains Mono'; font-size: 10px; color: rgba(255,255,255,0.25); text-align: center; max-width: 360px; line-height: 1.6; }

        /* ── Results ── */
        .recap-bar {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 20px; background: rgba(125,249,255,0.05);
          border: 1px solid rgba(125,249,255,0.12); border-radius: 12px;
          margin-bottom: 16px; flex-wrap: wrap; gap: 12px;
        }
        .recap-left { display: flex; align-items: center; gap: 14px; }
        .recap-style { font-family: 'JetBrains Mono'; font-size: 11px; font-weight: 700; color: var(--accent); letter-spacing: 0.1em; }
        .recap-count { font-family: 'JetBrains Mono'; font-size: 10px; color: rgba(255,255,255,0.3); letter-spacing: 0.1em; }
        .recap-cycle { font-family: 'JetBrains Mono'; font-size: 10px; color: var(--warm); letter-spacing: 0.08em; }
        .btn-restart {
          padding: 8px 16px; background: transparent;
          border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;
          color: rgba(255,255,255,0.35); font-family: 'JetBrains Mono'; font-size: 11px;
          cursor: pointer; letter-spacing: 0.1em; transition: all 0.2s;
        }
        .btn-restart:hover { color: var(--warm); border-color: rgba(255,107,53,0.3); }

        /* ── Clip cards ── */
        .clips-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
        .clip-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 16px; cursor: pointer;
          transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1); overflow: hidden;
        }
        .clip-card:hover { border-color: rgba(125,249,255,0.25); transform: translateY(-1px); box-shadow: 0 6px 24px rgba(0,0,0,0.3); }
        .clip-card.expanded { border-color: rgba(255,107,53,0.35); background: rgba(255,107,53,0.025); }
        .clip-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; gap: 16px; }
        .clip-left { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0; }
        .clip-num { font-family: 'JetBrains Mono'; font-size: 10px; color: var(--accent); letter-spacing: 0.2em; flex-shrink: 0; }
        .clip-times { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
        .time-badge {
          font-family: 'JetBrains Mono'; font-size: 11px; font-weight: 700;
          color: rgba(255,255,255,0.75); background: rgba(255,255,255,0.06);
          padding: 4px 10px; border-radius: 5px; border: 1px solid rgba(255,255,255,0.1);
        }
        .time-sep { font-family: 'JetBrains Mono'; font-size: 10px; color: rgba(255,255,255,0.2); }
        h4.clip-title { font-size: 14px; font-weight: 700; color: #fff; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .clip-chevron { font-family: 'JetBrains Mono'; font-size: 16px; color: rgba(255,255,255,0.25); flex-shrink: 0; }

        .clip-body { padding: 0 24px 24px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px; }
        .clip-section { border-radius: 10px; padding: 16px; margin-bottom: 10px; }
        .excerpt-section { background: rgba(125,249,255,0.04); border: 1px solid rgba(125,249,255,0.1); }
        .hook-section { background: rgba(255,107,53,0.05); border: 1px solid rgba(255,107,53,0.12); }
        .reason-section { background: rgba(0,0,0,0.2); }
        .section-label { font-family: 'JetBrains Mono'; font-size: 9px; letter-spacing: 0.2em; color: rgba(255,255,255,0.25); margin-bottom: 10px; }
        .clip-excerpt { font-size: 13px; color: rgba(125,249,255,0.7); line-height: 1.65; margin: 0; font-style: italic; white-space: pre-wrap; }
        .clip-hook { font-size: 14px; color: rgba(255,255,255,0.85); line-height: 1.55; margin: 0 0 12px; }
        .clip-reason { font-size: 13px; color: rgba(255,255,255,0.45); line-height: 1.6; margin: 0; }

        .copy-btn {
          padding: 7px 14px; background: rgba(255,107,53,0.12);
          border: 1px solid rgba(255,107,53,0.28); border-radius: 7px;
          color: var(--warm); font-family: 'JetBrains Mono'; font-size: 10px;
          font-weight: 700; letter-spacing: 0.08em; cursor: pointer; transition: all 0.2s;
        }
        .copy-btn:hover { background: rgba(255,107,53,0.22); border-color: var(--warm); }
        .copy-all-btn {
          width: 100%; padding: 12px; background: transparent;
          border: 1px solid rgba(255,255,255,0.08); border-radius: 10px;
          color: rgba(255,255,255,0.35); font-family: 'JetBrains Mono'; font-size: 11px;
          font-weight: 700; letter-spacing: 0.1em; cursor: pointer; transition: all 0.2s;
          text-transform: uppercase; margin-top: 4px;
        }
        .copy-all-btn:hover { border-color: var(--accent); color: var(--accent); background: rgba(125,249,255,0.04); }

        /* ── Find More ── */
        .find-more-wrap { text-align: center; padding: 8px 0 0; }
        .btn-find-more {
          padding: 14px 40px; background: transparent;
          border: 1px solid var(--border); border-radius: 12px;
          color: rgba(255,255,255,0.55); font-family: 'JetBrains Mono'; font-size: 12px;
          font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          cursor: pointer; transition: all 0.2s;
        }
        .btn-find-more:hover { border-color: var(--accent); color: var(--accent); background: rgba(125,249,255,0.04); box-shadow: 0 0 20px rgba(125,249,255,0.08); }
        .find-more-note { font-family: 'JetBrains Mono'; font-size: 10px; color: rgba(255,255,255,0.2); letter-spacing: 0.08em; margin-top: 12px; }

        @media (max-width: 700px) {
          .page { padding: 80px 16px 100px; }
          .header-title { font-size: 32px; }
          .card { padding: 28px 20px; }
          .style-grid { grid-template-columns: repeat(2, 1fr); }
          .clip-left { flex-wrap: wrap; }
          h4.clip-title { white-space: normal; }
          .clip-times { display: none; }
        }
      `}</style>
    </Layout>
  );
}