import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';

const STEPS = {
  INPUT: 'input',
  EXTRACTING: 'extracting',
  GENERATING: 'generating',
  OUTPUT: 'output',
};

const TONES = ['professional', 'conversational', 'bold', 'educational', 'witty'];
const LENGTHS = ['short', 'medium', 'long'];

const PLATFORMS = [
  {
    id: 'linkedin', label: 'LinkedIn', icon: 'LI', color: '#0A66C2',
    formats: ['Post', 'Article Intro', 'Carousel Script'],
    defaultFormat: 'Post',
    limits: { 'Post': 3000, 'Article Intro': 1500, 'Carousel Script': 2000 },
  },
  {
    id: 'twitter', label: 'Twitter / X', icon: 'X', color: '#1DA1F2',
    formats: ['Single Post', 'Thread'],
    defaultFormat: 'Thread',
    limits: { 'Single Post': 280, 'Thread': 2800 },
  },
  {
    id: 'instagram', label: 'Instagram', icon: 'IG', color: '#E1306C',
    formats: ['Caption', 'Carousel Script'],
    defaultFormat: 'Caption',
    limits: { 'Caption': 2200, 'Carousel Script': 2000 },
  },
  {
    id: 'email', label: 'Email', icon: '✉', color: '#34D399',
    formats: ['Newsletter', 'Cold Outreach', 'Follow-up'],
    defaultFormat: 'Newsletter',
    limits: { 'Newsletter': 1500, 'Cold Outreach': 600, 'Follow-up': 500 },
  },
  {
    id: 'youtube', label: 'YouTube', icon: '▶', color: '#FF0000',
    formats: ['Description', 'Video Script'],
    defaultFormat: 'Description',
    limits: { 'Description': 1000, 'Video Script': 3000 },
  },
  {
    id: 'tiktok', label: 'TikTok', icon: '♪', color: '#7DF9FF',
    formats: ['Caption', 'Video Script'],
    defaultFormat: 'Caption',
    limits: { 'Caption': 300, 'Video Script': 1500 },
  },
];

const EXTRACTION_LINES = [
  '// INITIALISING CONTENT PARSER...',
  '// FETCHING SOURCE URL...',
  '// BYPASSING PAYWALLS...',
  '// STRIPPING HTML SCAFFOLDING...',
  '// EXTRACTING RAW TEXT CORPUS...',
  '// IDENTIFYING SEMANTIC STRUCTURE...',
  '// MAPPING KEY THEMES...',
  '// DETECTING NARRATIVE ARC...',
  '// ISOLATING CORE ARGUMENTS...',
  '// SCORING HOOK POTENTIAL...',
  '// FLAGGING QUOTABLE MOMENTS...',
  '// ANALYSING SENTIMENT VECTORS...',
  '// CROSS-REFERENCING PLATFORM LIMITS...',
  '// CALIBRATING TONE PROFILES...',
  '// PRIMING GENERATION ENGINE...',
];

const GENERATION_LINES = [
  '// CONTENT CORPUS LOADED...',
  '// MAPPING FORMAT REQUIREMENTS...',
  '// GENERATING OUTPUTS...',
  '// OPTIMISING FOR EACH PLATFORM...',
  '// CALIBRATING TONE PROFILES...',
  '// APPLYING LENGTH CONSTRAINTS...',
  '// CHECKING CHARACTER LIMITS...',
  '// FINALISING OUTPUTS...',
];

export default function ContentRepurposer() {
  const [step, setStep] = useState(STEPS.INPUT);
  const [inputMode, setInputMode] = useState('paste');
  const [pasteContent, setPasteContent] = useState('');
  const [urlInput, setUrlInput] = useState('');

  const [platformSettings, setPlatformSettings] = useState(() => {
    const defaults = {};
    PLATFORMS.forEach(p => {
      defaults[p.id] = {
        selected: ['linkedin', 'twitter'].includes(p.id),
        format: p.defaultFormat,
        tone: 'professional',
        length: 'medium',
      };
    });
    return defaults;
  });

  const [globalTone, setGlobalTone] = useState('professional');
  const [context, setContext] = useState('');
  const [error, setError] = useState('');

  const [terminalLines, setTerminalLines] = useState([]);
  const [terminalIndex, setTerminalIndex] = useState(0);
  const [contentFragments, setContentFragments] = useState([]);
  const [fragmentIndex, setFragmentIndex] = useState(0);

  const [result, setResult] = useState(null);
  const [editedOutputs, setEditedOutputs] = useState({});
  const [copiedPlatform, setCopiedPlatform] = useState(null);
  const [regenPlatform, setRegenPlatform] = useState(null);
  const [regenPrompt, setRegenPrompt] = useState('');
  const [regenLoading, setRegenLoading] = useState(false);
  const [activeOutputPlatform, setActiveOutputPlatform] = useState(null);
  const [mounted, setMounted] = useState(false);

  const terminalRef = useRef(null);
  const selectedPlatforms = PLATFORMS.filter(p => platformSettings[p.id]?.selected);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    setPlatformSettings(prev => {
      const updated = { ...prev };
      PLATFORMS.forEach(p => {
        updated[p.id] = { ...updated[p.id], tone: globalTone };
      });
      return updated;
    });
  }, [globalTone]);

  useEffect(() => {
    if (step !== STEPS.EXTRACTING && step !== STEPS.GENERATING) return;
    const lines = step === STEPS.EXTRACTING ? EXTRACTION_LINES : GENERATION_LINES;
    if (terminalIndex >= lines.length) return;
    const delay = step === STEPS.EXTRACTING ? 280 : 700;
    const timer = setTimeout(() => {
      setTerminalLines(prev => [...prev, lines[terminalIndex]]);
      setTerminalIndex(prev => prev + 1);
      if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }, delay);
    return () => clearTimeout(timer);
  }, [step, terminalIndex]);

  useEffect(() => {
    if (step !== STEPS.GENERATING || contentFragments.length === 0) return;
    if (fragmentIndex >= contentFragments.length) return;
    const timer = setTimeout(() => setFragmentIndex(prev => prev + 1), 80);
    return () => clearTimeout(timer);
  }, [step, contentFragments, fragmentIndex]);

  const togglePlatform = (id) => {
    setPlatformSettings(prev => ({ ...prev, [id]: { ...prev[id], selected: !prev[id].selected } }));
  };

  const updatePlatformSetting = (id, key, value) => {
    setPlatformSettings(prev => ({ ...prev, [id]: { ...prev[id], [key]: value } }));
  };

  const getFragments = (text) => {
    const words = text.split(/\s+/).filter(Boolean);
    const frags = [];
    for (let i = 0; i < Math.min(words.length, 60); i += 3) frags.push(words.slice(i, i + 3).join(' '));
    return frags;
  };

  const handleGenerate = async () => {
    if (selectedPlatforms.length === 0) return;
    if (inputMode === 'paste' && !pasteContent.trim()) return;
    if (inputMode === 'url' && !urlInput.trim()) return;

    setError('');
    setTerminalLines([]);
    setTerminalIndex(0);
    setContentFragments([]);
    setFragmentIndex(0);

    if (inputMode === 'url') {
      setStep(STEPS.EXTRACTING);
      await new Promise(r => setTimeout(r, 4000));
    }

    setTerminalLines([]);
    setTerminalIndex(0);
    setStep(STEPS.GENERATING);

    if (pasteContent.trim()) {
      setContentFragments(getFragments(pasteContent));
      setFragmentIndex(0);
    }

    const platformConfigs = selectedPlatforms.map(p => ({
      id: p.id,
      label: p.label,
      format: platformSettings[p.id].format,
      tone: platformSettings[p.id].tone,
      length: platformSettings[p.id].length,
      limit: p.limits[platformSettings[p.id].format] || 1000,
    }));

    try {
      const res = await fetch('/api/repurpose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: inputMode === 'paste' ? pasteContent : null,
          url: inputMode === 'url' ? urlInput : null,
          platformConfigs,
          context,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');

      setResult(data);
      setEditedOutputs({});
      setActiveOutputPlatform(selectedPlatforms[0].id);
      setStep(STEPS.OUTPUT);
    } catch (err) {
      setError(err.message);
      setStep(STEPS.INPUT);
    }
  };

  const copyOutput = (platformId) => {
    const text = editedOutputs[platformId] ?? result?.outputs?.[platformId]?.content ?? '';
    navigator.clipboard.writeText(text);
    setCopiedPlatform(platformId);
    setTimeout(() => setCopiedPlatform(null), 2000);
  };

  const downloadAll = () => {
    if (!result) return;
    const lines = [`CONTENT REPURPOSER EXPORT\n${'='.repeat(50)}\n${result.title || ''}\n`];
    selectedPlatforms.forEach(p => {
      const content = editedOutputs[p.id] ?? result.outputs?.[p.id]?.content ?? '';
      const format = platformSettings[p.id]?.format || '';
      lines.push(`\n${'─'.repeat(40)}\n${p.label.toUpperCase()} — ${format}\n${'─'.repeat(40)}\n${content}\n`);
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `repurposed-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRegen = async (platformId) => {
    if (!regenPrompt.trim()) return;
    setRegenLoading(true);
    setError('');
    try {
      const currentContent = editedOutputs[platformId] ?? result?.outputs?.[platformId]?.content ?? '';
      const platform = PLATFORMS.find(p => p.id === platformId);
      const settings = platformSettings[platformId];
      const res = await fetch('/api/regen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: platformId,
          format: settings.format,
          currentContent,
          instruction: regenPrompt,
          tone: settings.tone,
          length: settings.length,
          limit: platform?.limits[settings.format] || 1000,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.content) setEditedOutputs(prev => ({ ...prev, [platformId]: data.content }));
      setRegenPrompt('');
      setRegenPlatform(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setRegenLoading(false);
    }
  };

  const resetAll = () => {
    setStep(STEPS.INPUT);
    setResult(null);
    setEditedOutputs({});
    setError('');
    setRegenPlatform(null);
    setRegenPrompt('');
  };

  const getCharInfo = (platformId) => {
    const platform = PLATFORMS.find(p => p.id === platformId);
    const settings = platformSettings[platformId];
    const content = editedOutputs[platformId] ?? result?.outputs?.[platformId]?.content ?? '';
    const count = content.length;
    const limit = platform?.limits[settings?.format] || 9999;
    const pct = Math.min(count / limit, 1);
    const color = pct > 1 ? '#ff4444' : pct > 0.85 ? 'var(--warm)' : '#34D399';
    return { count, limit, pct, color };
  };

  if (!mounted) return null;

  return (
    <Layout>
      <div className="page">

        <div className="header" onClick={() => step === STEPS.OUTPUT && resetAll()}>
          <div className="eyebrow">// CONTENT_REPURPOSER</div>
          <h1 className="header-title">One Source. <span className="highlight">Six Platforms.</span></h1>
          <p className="subtext">
            {step === STEPS.INPUT      && 'Paste content or drop a URL. Configure platforms. Generate.'}
            {step === STEPS.EXTRACTING && '// Extracting content from source URL...'}
            {step === STEPS.GENERATING && '// Generating platform outputs...'}
            {step === STEPS.OUTPUT     && `${result?.title || 'Content ready'} · click title to start over`}
          </p>
        </div>

        {/* INPUT */}
        {step === STEPS.INPUT && (
          <div className="card">
            <div className="card-label">// SOURCE_CONTENT</div>

            <div className="mode-toggle">
              <button className={`mode-btn ${inputMode === 'paste' ? 'active' : ''}`} onClick={() => setInputMode('paste')}>⌨ Paste Text</button>
              <button className={`mode-btn ${inputMode === 'url' ? 'active' : ''}`} onClick={() => setInputMode('url')}>🔗 URL</button>
            </div>

            {inputMode === 'paste' ? (
              <textarea className="content-input" placeholder="Paste your article, blog post, transcript, notes, or any long-form content here..." value={pasteContent} onChange={e => setPasteContent(e.target.value)} rows={7} autoFocus />
            ) : (
              <div className="url-input-wrap">
                <div className="url-prefix">https://</div>
                <input className="url-input" type="url" placeholder="yourwebsite.com/article" value={urlInput} onChange={e => setUrlInput(e.target.value)} autoFocus />
              </div>
            )}

            {inputMode === 'paste' && pasteContent && (
              <div className="char-hint">{pasteContent.split(/\s+/).filter(Boolean).length} words · {pasteContent.length} chars</div>
            )}

            <div className="section-label" style={{ marginTop: '28px' }}>// CONTEXT <span className="optional">(optional — improves output quality)</span></div>
            <input className="audience-input" type="text" placeholder="e.g. Personal brand for a B2B founder · Agency content for fitness clients · Tech startup targeting developers" value={context} onChange={e => setContext(e.target.value)} />

            <div className="section-label" style={{ marginTop: '28px' }}>// GLOBAL TONE <span className="optional">(can override per platform below)</span></div>
            <div className="pill-group">
              {TONES.map(t => (
                <button key={t} className={`pill ${globalTone === t ? 'active' : ''}`} onClick={() => setGlobalTone(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            <div className="section-label" style={{ marginTop: '28px' }}>// SELECT PLATFORMS & CONFIGURE</div>
            <div className="platform-list">
              {PLATFORMS.map(p => {
                const settings = platformSettings[p.id];
                const isSelected = settings.selected;
                return (
                  <div key={p.id} className={`platform-row ${isSelected ? 'selected' : ''}`} style={{ '--p-color': p.color }}>
                    <button className="platform-toggle" onClick={() => togglePlatform(p.id)}>
                      <span className={`toggle-box ${isSelected ? 'checked' : ''}`}>{isSelected ? '✓' : ''}</span>
                      <span className="p-icon">{p.icon}</span>
                      <span className="p-label">{p.label}</span>
                    </button>

                    {isSelected && (
                      <div className="platform-options">
                        <div className="option-group">
                          <span className="option-label">FORMAT</span>
                          <div className="mini-pills">
                            {p.formats.map(f => (
                              <button key={f} className={`mini-pill ${settings.format === f ? 'active' : ''}`} onClick={() => updatePlatformSetting(p.id, 'format', f)}>{f}</button>
                            ))}
                          </div>
                        </div>
                        <div className="option-group">
                          <span className="option-label">LENGTH</span>
                          <div className="mini-pills">
                            {LENGTHS.map(l => (
                              <button key={l} className={`mini-pill ${settings.length === l ? 'active' : ''}`} onClick={() => updatePlatformSetting(p.id, 'length', l)}>{l.charAt(0).toUpperCase() + l.slice(1)}</button>
                            ))}
                          </div>
                        </div>
                        <div className="option-group">
                          <span className="option-label">TONE OVERRIDE</span>
                          <div className="mini-pills">
                            {TONES.map(t => (
                              <button key={t} className={`mini-pill ${settings.tone === t ? 'active' : ''}`} onClick={() => updatePlatformSetting(p.id, 'tone', t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
                            ))}
                          </div>
                        </div>
                        <div className="char-limit-badge">{(p.limits[settings.format] || 0).toLocaleString()} chars max</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {error && <div className="error-msg">// ERROR: {error}</div>}

            <button className="btn-primary" onClick={handleGenerate} disabled={selectedPlatforms.length === 0 || (inputMode === 'paste' && !pasteContent.trim()) || (inputMode === 'url' && !urlInput.trim())}>
              REPURPOSE CONTENT → ({selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''})
            </button>
          </div>
        )}

        {/* TERMINAL */}
        {(step === STEPS.EXTRACTING || step === STEPS.GENERATING) && (
          <div className="card terminal-card">
            <div className="terminal-layout">
              <div className="terminal-left">
                <div className="terminal-domain">
                  {inputMode === 'url' && step === STEPS.EXTRACTING ? urlInput.replace(/^https?:\/\//, '').slice(0, 40) : '// PROCESSING CONTENT'}
                </div>
                <div className="fragment-stream">
                  {step === STEPS.EXTRACTING && inputMode === 'url' && (
                    <div className="url-scan">
                      <div className="scan-line" />
                      <div className="scan-domain">{urlInput.replace(/^https?:\/\//, '').split('/')[0]}</div>
                      <div className="scan-label">// ACCESSING REMOTE RESOURCE</div>
                    </div>
                  )}
                  {step === STEPS.GENERATING && contentFragments.slice(0, fragmentIndex).map((frag, i) => (
                    <span key={i} className="fragment" style={{ animationDelay: `${i * 0.04}s` }}>{frag}</span>
                  ))}
                </div>
              </div>
              <div className="terminal-right" ref={terminalRef}>
                <div className="terminal-header">
                  <span className="dot red" /><span className="dot yellow" /><span className="dot green" />
                  <span className="terminal-title">learnlab · repurposer</span>
                </div>
                <div className="terminal-body">
                  {terminalLines.map((line, i) => (
                    <div key={i} className="terminal-line">
                      <span className="t-prompt">❯</span>
                      <span className="t-text">{line}</span>
                    </div>
                  ))}
                  <div className="terminal-cursor">_</div>
                </div>
              </div>
            </div>
            <div className="progress-wrap">
              <div className="progress-bar">
                <div className={`progress-fill ${step === STEPS.GENERATING ? 'slow' : 'fast'}`} />
              </div>
              <div className="progress-label">
                {step === STEPS.EXTRACTING ? 'Extracting source...' : `Generating ${selectedPlatforms.length} platform outputs...`}
              </div>
            </div>
          </div>
        )}

        {/* OUTPUT */}
        {step === STEPS.OUTPUT && result && (
          <div className="output-section">
            <div className="output-meta-bar">
              <div className="meta-themes">
                {result.keyThemes?.map((theme, i) => <span key={i} className="theme-tag">{theme}</span>)}
              </div>
              {result.sourceDomain && <div className="meta-source">// SOURCE: {result.sourceDomain}</div>}
            </div>

            <div className="output-tabs">
              {selectedPlatforms.map(p => {
                const charInfo = result.outputs?.[p.id] ? getCharInfo(p.id) : null;
                const settings = platformSettings[p.id];
                return (
                  <button key={p.id} className={`output-tab ${activeOutputPlatform === p.id ? 'active' : ''}`} onClick={() => setActiveOutputPlatform(p.id)} style={{ '--p-color': p.color }}>
                    <span className="tab-icon">{p.icon}</span>
                    <span>{p.label}</span>
                    <span className="tab-format">{settings.format}</span>
                    {charInfo && <span className="tab-dot" style={{ background: charInfo.color }} />}
                  </button>
                );
              })}
            </div>

            {activeOutputPlatform && result.outputs?.[activeOutputPlatform] && (() => {
              const platform = PLATFORMS.find(p => p.id === activeOutputPlatform);
              const settings = platformSettings[activeOutputPlatform];
              const content = editedOutputs[activeOutputPlatform] ?? result.outputs[activeOutputPlatform].content;
              const { count, limit, pct, color } = getCharInfo(activeOutputPlatform);

              return (
                <div className="output-card" style={{ '--p-color': platform?.color }}>
                  <div className="output-card-header">
                    <div className="output-card-title">
                      <span className="output-icon">{platform?.icon}</span>
                      <span>{platform?.label}</span>
                      <span className="output-format-badge">{settings.format}</span>
                      <span className="output-meta-badges">
                        <span className="meta-badge">{settings.tone}</span>
                        <span className="meta-badge">{settings.length}</span>
                      </span>
                    </div>
                    <div className="output-card-actions">
                      <button className="btn-regen-toggle" onClick={() => setRegenPlatform(regenPlatform === activeOutputPlatform ? null : activeOutputPlatform)}>↺ Refine</button>
                      <button className={`btn-copy ${copiedPlatform === activeOutputPlatform ? 'copied' : ''}`} onClick={() => copyOutput(activeOutputPlatform)}>
                        {copiedPlatform === activeOutputPlatform ? '✓ Copied' : '⎘ Copy'}
                      </button>
                    </div>
                  </div>

                  {result.outputs[activeOutputPlatform].hookLine && (
                    <div className="hook-line">// HOOK: {result.outputs[activeOutputPlatform].hookLine}</div>
                  )}

                  {regenLoading && regenPlatform === activeOutputPlatform ? (
                    <div className="regen-loading">
                      <div className="regen-spinner">
                        <div className="regen-ring" /><div className="regen-ring regen-ring-2" />
                      </div>
                      <div className="regen-status-lines">
                        <div className="regen-line" style={{ animationDelay: '0s' }}>// ANALYSING CURRENT VERSION...</div>
                        <div className="regen-line" style={{ animationDelay: '0.8s' }}>// APPLYING INSTRUCTION...</div>
                        <div className="regen-line" style={{ animationDelay: '1.6s' }}>// REGENERATING OUTPUT...</div>
                      </div>
                    </div>
                  ) : (
                    <textarea className="output-textarea" value={content} onChange={e => setEditedOutputs(prev => ({ ...prev, [activeOutputPlatform]: e.target.value }))} rows={Math.max(8, content.split('\n').length + 2)} />
                  )}

                  <div className="char-bar-wrap">
                    <div className="char-bar"><div className="char-bar-fill" style={{ width: `${pct * 100}%`, background: color }} /></div>
                    <div className="char-count" style={{ color }}>{count.toLocaleString()} / {limit.toLocaleString()}</div>
                  </div>

                  {regenPlatform === activeOutputPlatform && (
                    <div className="regen-bar">
                      <input className="regen-input" type="text" placeholder='e.g. "make it shorter", "add a hook", "more controversial"' value={regenPrompt} onChange={e => setRegenPrompt(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleRegen(activeOutputPlatform)} autoFocus />
                      <button className="btn-regen-go" onClick={() => handleRegen(activeOutputPlatform)} disabled={regenLoading || !regenPrompt.trim()}>{regenLoading ? '...' : '→'}</button>
                    </div>
                  )}
                </div>
              );
            })()}

            {error && <div className="error-msg">// ERROR: {error}</div>}

            <div className="output-footer">
              <button className="btn-download" onClick={downloadAll}>↓ Download All (.txt)</button>
              <button className="btn-new" onClick={resetAll}>+ Repurpose New Content</button>
            </div>
          </div>
        )}

        <style jsx>{`
          .page { max-width: 900px; margin: 0 auto; padding: 100px 20px 120px; }

          .header { text-align: center; margin-bottom: 60px; cursor: default; transition: all 0.3s; }
          .header:hover .header-title { transform: translateY(-2px); }
          .header:hover .eyebrow { letter-spacing: 0.3em; color: var(--warm); }
          .header:hover .highlight { text-shadow: 0 0 25px rgba(255,107,53,0.6); filter: brightness(1.2); }
          .eyebrow { font-family: 'JetBrains Mono'; color: var(--accent); font-size: 11px; letter-spacing: 0.2em; margin-bottom: 16px; transition: all 0.4s; }
          .header-title { font-size: 48px; font-weight: 800; color: #fff; margin-bottom: 12px; transition: all 0.4s; display: block; }
          .highlight { color: var(--warm); transition: all 0.4s; }
          .subtext { color: var(--text-2); font-size: 13px; font-family: 'JetBrains Mono'; }

          .card { background: var(--surface); border: 1px solid var(--border); border-radius: 24px; padding: 50px; backdrop-filter: blur(10px); }
          .card-label { font-family: 'JetBrains Mono'; font-size: 10px; letter-spacing: 0.2em; color: var(--accent); margin-bottom: 24px; }
          .section-label { font-family: 'JetBrains Mono'; font-size: 10px; letter-spacing: 0.15em; color: var(--text-2); margin-bottom: 12px; text-transform: uppercase; }
          .optional { color: rgba(255,255,255,0.2); font-size: 9px; }

          .mode-toggle { display: flex; gap: 8px; margin-bottom: 20px; }
          .mode-btn { padding: 10px 20px; border-radius: 10px; border: 1px solid var(--border); background: transparent; color: var(--text-2); font-family: 'JetBrains Mono'; font-size: 11px; letter-spacing: 0.08em; cursor: pointer; transition: all 0.2s; }
          .mode-btn.active { background: rgba(125,249,255,0.1); border-color: rgba(125,249,255,0.3); color: var(--accent); }
          .mode-btn:hover:not(.active) { border-color: rgba(255,255,255,0.2); color: #fff; }

          .content-input { width: 100%; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 14px; padding: 20px; color: #fff; font-size: 14px; line-height: 1.7; outline: none; transition: border-color 0.2s; font-family: inherit; resize: vertical; box-sizing: border-box; }
          .content-input:focus { border-color: var(--accent); }
          .content-input::placeholder { color: rgba(255,255,255,0.2); }
          .char-hint { font-family: 'JetBrains Mono'; font-size: 10px; color: rgba(255,255,255,0.25); margin-top: 8px; }

          .url-input-wrap { display: flex; align-items: center; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; transition: border-color 0.2s; }
          .url-input-wrap:focus-within { border-color: var(--accent); }
          .url-prefix { padding: 18px 0 18px 20px; font-family: 'JetBrains Mono'; font-size: 12px; color: var(--accent); white-space: nowrap; }
          .url-input { flex: 1; background: transparent; border: none; padding: 18px 20px 18px 4px; color: #fff; font-size: 14px; outline: none; font-family: inherit; }

          .audience-input { width: 100%; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; color: #fff; font-size: 14px; outline: none; transition: border-color 0.2s; font-family: inherit; box-sizing: border-box; }
          .audience-input:focus { border-color: var(--accent); }
          .audience-input::placeholder { color: rgba(255,255,255,0.2); }

          .pill-group { display: flex; flex-wrap: wrap; gap: 8px; }
          .pill { padding: 8px 18px; border-radius: 999px; border: 1px solid var(--border); background: transparent; color: var(--text-2); font-size: 13px; cursor: pointer; transition: all 0.2s; font-family: inherit; }
          .pill:hover { border-color: var(--accent); color: var(--accent); }
          .pill.active { background: rgba(125,249,255,0.1); border-color: var(--accent); color: var(--accent); }

          .platform-list { display: flex; flex-direction: column; gap: 8px; }
          .platform-row { border: 1px solid var(--border); border-radius: 14px; overflow: hidden; transition: all 0.2s; background: rgba(0,0,0,0.15); }
          .platform-row.selected { border-color: var(--p-color); background: rgba(0,0,0,0.3); box-shadow: 0 0 0 1px var(--p-color) inset; }
          .platform-toggle { width: 100%; display: flex; align-items: center; gap: 12px; padding: 14px 18px; background: transparent; border: none; cursor: pointer; text-align: left; }
          .toggle-box { width: 18px; height: 18px; border-radius: 5px; border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: var(--p-color); transition: all 0.2s; flex-shrink: 0; background: transparent; }
          .toggle-box.checked { border-color: var(--p-color); background: rgba(255,255,255,0.05); }
          .p-icon { font-size: 16px; font-weight: 900; color: var(--p-color); font-family: 'JetBrains Mono'; min-width: 24px; }
          .p-label { font-size: 14px; font-weight: 600; color: #fff; }

          .platform-options { padding: 0 18px 16px 54px; display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-start; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 14px; }
          .option-group { display: flex; flex-direction: column; gap: 6px; }
          .option-label { font-family: 'JetBrains Mono'; font-size: 8px; letter-spacing: 0.15em; color: rgba(255,255,255,0.3); }
          .mini-pills { display: flex; flex-wrap: wrap; gap: 5px; }
          .mini-pill { padding: 5px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: rgba(255,255,255,0.35); font-size: 11px; cursor: pointer; transition: all 0.15s; font-family: inherit; white-space: nowrap; }
          .mini-pill:hover { border-color: var(--p-color); color: var(--p-color); }
          .mini-pill.active { background: rgba(255,255,255,0.06); border-color: var(--p-color); color: var(--p-color); font-weight: 600; }
          .char-limit-badge { font-family: 'JetBrains Mono'; font-size: 9px; color: rgba(255,255,255,0.2); align-self: flex-end; padding-bottom: 4px; }

          .error-msg { font-family: 'JetBrains Mono'; font-size: 11px; color: #ff4444; padding: 12px; background: rgba(255,68,68,0.1); border-radius: 8px; border: 1px solid rgba(255,68,68,0.2); margin-top: 16px; }

          .btn-primary { width: 100%; margin-top: 28px; padding: 18px; background: var(--accent); color: #000; border: none; border-radius: 12px; font-weight: 800; font-size: 13px; cursor: pointer; text-transform: uppercase; letter-spacing: 0.1em; transition: all 0.2s; font-family: 'JetBrains Mono'; }
          .btn-primary:hover:not(:disabled) { box-shadow: 0 0 25px rgba(125,249,255,0.4); transform: scale(1.01); }
          .btn-primary:disabled { opacity: 0.3; cursor: not-allowed; }

          .terminal-card { padding: 0; overflow: hidden; }
          .terminal-layout { display: grid; grid-template-columns: 1fr 1fr; min-height: 360px; }
          .terminal-left { padding: 40px 36px; border-right: 1px solid var(--border); display: flex; flex-direction: column; gap: 20px; overflow: hidden; }
          .terminal-domain { font-family: 'JetBrains Mono'; font-size: 11px; color: var(--accent); letter-spacing: 0.1em; opacity: 0.6; }
          .fragment-stream { flex: 1; display: flex; flex-wrap: wrap; gap: 6px; align-content: flex-start; overflow: hidden; max-height: 280px; }
          .fragment { font-family: 'JetBrains Mono'; font-size: 11px; color: rgba(255,255,255,0.4); padding: 3px 8px; background: rgba(255,255,255,0.04); border-radius: 4px; animation: fadeInUp 0.3s ease forwards; opacity: 0; }
          @keyframes fadeInUp { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
          .url-scan { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; gap: 16px; }
          .scan-line { width: 100%; height: 1px; background: linear-gradient(90deg,transparent,var(--accent),transparent); animation: scanMove 1.5s ease-in-out infinite; }
          @keyframes scanMove { 0%,100%{opacity:0.3;transform:scaleX(0.3)} 50%{opacity:1;transform:scaleX(1)} }
          .scan-domain { font-family: 'JetBrains Mono'; font-size: 14px; color: #fff; }
          .scan-label { font-family: 'JetBrains Mono'; font-size: 9px; color: var(--accent); letter-spacing: 0.2em; opacity: 0.6; }
          .terminal-right { display: flex; flex-direction: column; max-height: 400px; overflow-y: auto; scrollbar-width: none; }
          .terminal-right::-webkit-scrollbar { display: none; }
          .terminal-header { display: flex; align-items: center; gap: 6px; padding: 12px 16px; border-bottom: 1px solid var(--border); background: rgba(0,0,0,0.3); }
          .dot { width: 10px; height: 10px; border-radius: 50%; }
          .dot.red{background:#ff5f57} .dot.yellow{background:#febc2e} .dot.green{background:#28c840}
          .terminal-title { font-family: 'JetBrains Mono'; font-size: 10px; color: rgba(255,255,255,0.3); margin-left: 6px; }
          .terminal-body { flex: 1; padding: 20px 16px; display: flex; flex-direction: column; gap: 10px; }
          .terminal-line { display: flex; gap: 10px; align-items: flex-start; animation: termAppear 0.2s ease; }
          @keyframes termAppear { from{opacity:0;transform:translateX(-4px)} to{opacity:1;transform:translateX(0)} }
          .t-prompt { color: var(--accent); font-family: 'JetBrains Mono'; font-size: 10px; padding-top: 1px; flex-shrink: 0; }
          .t-text { font-family: 'JetBrains Mono'; font-size: 10px; color: rgba(255,255,255,0.5); letter-spacing: 0.1em; line-height: 1.5; }
          .terminal-cursor { font-family: 'JetBrains Mono'; font-size: 12px; color: var(--accent); animation: blink 1s step-end infinite; }
          @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
          .progress-wrap { padding: 24px 40px; border-top: 1px solid var(--border); display: flex; align-items: center; gap: 20px; }
          .progress-bar { flex: 1; height: 2px; background: rgba(255,255,255,0.08); border-radius: 999px; overflow: hidden; }
          .progress-fill { height: 100%; background: linear-gradient(90deg,var(--accent),var(--warm)); border-radius: 999px; }
          .progress-fill.fast { animation: progressFast 3s ease-in-out forwards; }
          .progress-fill.slow { animation: progressSlow 20s ease-out forwards; }
          @keyframes progressFast { 0%{width:0} 100%{width:80%} }
          @keyframes progressSlow { 0%{width:0} 60%{width:70%} 90%{width:88%} 100%{width:92%} }
          .progress-label { font-family: 'JetBrains Mono'; font-size: 10px; color: rgba(255,255,255,0.3); white-space: nowrap; }

          .output-section { display: flex; flex-direction: column; }
          .output-meta-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
          .meta-themes { display: flex; flex-wrap: wrap; gap: 6px; }
          .theme-tag { padding: 4px 12px; background: rgba(125,249,255,0.08); border: 1px solid rgba(125,249,255,0.15); border-radius: 999px; font-family: 'JetBrains Mono'; font-size: 10px; color: var(--accent); }
          .meta-source { font-family: 'JetBrains Mono'; font-size: 10px; color: rgba(255,255,255,0.25); }

          .output-tabs { display: flex; gap: 2px; border-bottom: 1px solid var(--border); overflow-x: auto; scrollbar-width: none; }
          .output-tabs::-webkit-scrollbar { display: none; }
          .output-tab { display: flex; align-items: center; gap: 6px; padding: 14px 16px; background: transparent; border: none; border-bottom: 2px solid transparent; margin-bottom: -1px; color: var(--text-2); font-family: 'JetBrains Mono'; font-size: 10px; cursor: pointer; white-space: nowrap; transition: all 0.2s; text-transform: uppercase; }
          .output-tab:hover { color: #fff; }
          .output-tab.active { color: var(--p-color); border-bottom-color: var(--p-color); }
          .tab-icon { font-size: 13px; }
          .tab-format { font-size: 8px; opacity: 0.5; padding: 2px 5px; background: rgba(255,255,255,0.06); border-radius: 3px; }
          .tab-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

          .output-card { background: var(--surface); border: 1px solid var(--border); border-top: none; border-radius: 0 0 20px 20px; padding: 32px 40px; }
          .output-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
          .output-card-title { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 16px; color: #fff; flex-wrap: wrap; }
          .output-icon { font-size: 18px; color: var(--p-color); }
          .output-format-badge { font-family: 'JetBrains Mono'; font-size: 10px; padding: 3px 8px; background: rgba(255,255,255,0.07); border-radius: 5px; color: var(--p-color); font-weight: 400; }
          .output-meta-badges { display: flex; gap: 5px; }
          .meta-badge { font-family: 'JetBrains Mono'; font-size: 9px; padding: 2px 7px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 4px; color: rgba(255,255,255,0.3); }
          .output-card-actions { display: flex; gap: 8px; }
          .btn-regen-toggle { padding: 8px 16px; background: transparent; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: rgba(255,255,255,0.4); font-family: 'JetBrains Mono'; font-size: 10px; cursor: pointer; transition: all 0.2s; }
          .btn-regen-toggle:hover { border-color: var(--warm); color: var(--warm); }
          .btn-copy { padding: 8px 18px; background: rgba(125,249,255,0.08); border: 1px solid rgba(125,249,255,0.2); border-radius: 8px; color: var(--accent); font-family: 'JetBrains Mono'; font-size: 10px; cursor: pointer; transition: all 0.2s; }
          .btn-copy.copied { background: rgba(52,211,153,0.1); border-color: rgba(52,211,153,0.3); color: #34D399; }

          .hook-line { font-family: 'JetBrains Mono'; font-size: 10px; color: rgba(125,249,255,0.5); background: rgba(125,249,255,0.05); border: 1px solid rgba(125,249,255,0.1); border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; }
          .output-textarea { width: 100%; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 20px; color: rgba(255,255,255,0.85); font-size: 14px; line-height: 1.8; outline: none; transition: border-color 0.2s; font-family: inherit; resize: vertical; box-sizing: border-box; }
          .output-textarea:focus { border-color: var(--p-color, var(--accent)); }

          .char-bar-wrap { display: flex; align-items: center; gap: 12px; margin-top: 12px; }
          .char-bar { flex: 1; height: 2px; background: rgba(255,255,255,0.08); border-radius: 999px; overflow: hidden; }
          .char-bar-fill { height: 100%; border-radius: 999px; transition: width 0.3s, background 0.3s; }
          .char-count { font-family: 'JetBrains Mono'; font-size: 10px; white-space: nowrap; }

          .regen-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; min-height: 200px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 40px; }
          .regen-spinner { position: relative; width: 44px; height: 44px; }
          .regen-ring { position: absolute; inset: 0; border-radius: 50%; border: 2px solid transparent; border-top-color: var(--accent); animation: spin 1s linear infinite; }
          .regen-ring-2 { inset: 7px; border-top-color: var(--warm); animation-duration: 1.5s; animation-direction: reverse; }
          .regen-status-lines { display: flex; flex-direction: column; gap: 8px; align-items: center; }
          .regen-line { font-family: 'JetBrains Mono'; font-size: 10px; letter-spacing: 0.12em; color: rgba(125,249,255,0.5); opacity: 0; animation: termAppear 0.4s ease forwards; }
          @keyframes spin { to{transform:rotate(360deg)} }

          .regen-bar { display: flex; gap: 8px; margin-top: 16px; width: 100%; }
          .regen-input { flex: 1; min-width: 0; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,107,53,0.3); border-radius: 10px; padding: 12px 16px; color: #fff; font-size: 13px; outline: none; font-family: inherit; transition: border-color 0.2s; box-sizing: border-box; }
          .regen-input:focus { border-color: var(--warm); }
          .regen-input::placeholder { color: rgba(255,255,255,0.2); }
          .btn-regen-go { padding: 12px 20px; background: var(--warm); border: none; border-radius: 10px; color: #000; font-family: 'JetBrains Mono'; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
          .btn-regen-go:hover:not(:disabled) { box-shadow: 0 0 15px rgba(255,107,53,0.4); }
          .btn-regen-go:disabled { opacity: 0.4; cursor: not-allowed; }

          .output-footer { margin-top: 28px; display: flex; justify-content: flex-end; gap: 12px; }
          .btn-download { padding: 14px 24px; background: transparent; border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; color: rgba(255,255,255,0.5); font-family: 'JetBrains Mono'; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; cursor: pointer; transition: all 0.2s; }
          .btn-download:hover { border-color: rgba(255,255,255,0.25); color: #fff; }
          .btn-new { padding: 14px 28px; background: var(--accent); border: none; border-radius: 12px; color: #000; font-family: 'JetBrains Mono'; font-size: 12px; font-weight: 800; letter-spacing: 0.1em; cursor: pointer; transition: all 0.2s; }
          .btn-new:hover { box-shadow: 0 0 20px rgba(125,249,255,0.4); transform: scale(1.02); }

          @media (max-width: 700px) {
            .page { padding: 80px 16px 100px; }
            .header-title { font-size: 32px; }
            .card { padding: 28px 20px; }
            .terminal-layout { grid-template-columns: 1fr; }
            .terminal-left { display: none; }
            .output-card { padding: 24px 20px; }
            .platform-options { padding-left: 18px; }
          }
        `}</style>
      </div>
    </Layout>
  );
}