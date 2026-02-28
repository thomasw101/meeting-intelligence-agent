import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const STEPS = {
  CALIBRATE:  'calibrate',
  TARGET:     'target',
  CONFIRMING: 'confirming',
  CONFIRM:    'confirm',
  LOADING:    'loading',
  REPORT:     'report',
};

export default function MeetingAgent() {
  const [step, setStep]           = useState(STEPS.CALIBRATE);
  const [firstName, setFirstName] = useState('');
  const [mounted, setMounted]     = useState(false);

  const [calibration, setCalibration] = useState({ role: '', company: '', meetingType: '', context: '' });
  const [targetName, setTargetName]       = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [linkedinUrl, setLinkedinUrl]     = useState('');
  const [companyUrl, setCompanyUrl]       = useState('');

  // Confirmation
  const [identification, setIdentification]   = useState(null);
  const [confirmedRole, setConfirmedRole]     = useState('');
  const [cachedIntel, setCachedIntel]         = useState(null);

  const [battlecard, setBattlecard]   = useState(null);
  const [error, setError]             = useState('');
  const [loadingStatus, setLoadingStatus] = useState('');
  const [copied, setCopied]           = useState(false);
  const [activeTab, setActiveTab]     = useState('overview');

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem('ll_user');
      if (stored) { const u = JSON.parse(stored); if (u.firstName) setFirstName(u.firstName); }
      const savedCal = localStorage.getItem('ll_calibration');
      if (savedCal) { setCalibration(JSON.parse(savedCal)); setStep(STEPS.TARGET); }
    } catch (e) {}
  }, []);

  const saveCalibration = () => {
    if (!calibration.role || !calibration.company || !calibration.meetingType) return;
    localStorage.setItem('ll_calibration', JSON.stringify(calibration));
    setStep(STEPS.TARGET);
  };

  const resetCalibration = () => {
    localStorage.removeItem('ll_calibration');
    setCalibration({ role: '', company: '', meetingType: '', context: '' });
    setStep(STEPS.CALIBRATE);
  };

  // ── Initial submit ──
  const handleSubmit = async () => {
    if (!targetName.trim() || !targetCompany.trim()) return;
    setError('');

    if (linkedinUrl.trim()) {
      // LinkedIn provided — skip confirmation
      await runFullResearch();
      return;
    }

    // No LinkedIn — quick ID first
    setStep(STEPS.CONFIRMING);
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetName: targetName.trim(),
          targetCompany: targetCompany.trim(),
          linkedinUrl: '',
          companyUrl: companyUrl.trim(),
          calibration,
          confirmed: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Search failed');

      if (data.needsConfirmation) {
        setIdentification(data.identification);
        setConfirmedRole(data.identification?.role || '');
        setCachedIntel(data.intel);
        setStep(STEPS.CONFIRM);
      } else {
        setBattlecard(data.battlecard);
        setStep(STEPS.REPORT);
      }
    } catch (err) {
      setError(err.message);
      setStep(STEPS.TARGET);
    }
  };

  // ── Full research after confirmation (or direct with LinkedIn) ──
  const runFullResearch = async () => {
    setStep(STEPS.LOADING);
    setError('');
    setBattlecard(null);
    setActiveTab('overview');

    const statuses = linkedinUrl
      ? ['// FETCHING LINKEDIN PROFILE...', '// FETCHING RECENT POSTS...', '// ANALYSING INTELLIGENCE...', '// SYNTHESISING BATTLECARD...']
      : ['// IDENTITY CONFIRMED...', '// CROSS-REFERENCING SOURCES...', '// ANALYSING INTELLIGENCE...', '// SYNTHESISING BATTLECARD...'];

    let i = 0;
    setLoadingStatus(statuses[0]);
    const interval = setInterval(() => {
      i = Math.min(i + 1, statuses.length - 1);
      setLoadingStatus(statuses[i]);
    }, 4000);

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetName: targetName.trim(),
          targetCompany: targetCompany.trim(),
          linkedinUrl: linkedinUrl.trim(),
          companyUrl: companyUrl.trim(),
          calibration: {
            ...calibration,
            // Pass confirmed role override if set from confirmation card
            confirmedRole: confirmedRole || undefined,
          },
          confirmed: true,
          cachedIntel,
        }),
      });
      const data = await res.json();
      clearInterval(interval);
      if (!res.ok) throw new Error(data.error || 'Research failed');
      setBattlecard(data.battlecard);
      setStep(STEPS.REPORT);
    } catch (err) {
      clearInterval(interval);
      setError(err.message);
      setStep(STEPS.TARGET);
    }
  };

  const copyReport = () => {
    if (!battlecard) return;
    navigator.clipboard.writeText(generatePlainText(battlecard));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPDF = () => {
    if (!battlecard) return;
    const win = window.open('', '_blank');
    win.document.write(generatePrintHTML(battlecard, targetName, targetCompany));
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const newReport = () => {
    setTargetName(''); setTargetCompany('');
    setLinkedinUrl(''); setCompanyUrl('');
    setBattlecard(null); setError('');
    setIdentification(null); setConfirmedRole(''); setCachedIntel(null);
    setStep(STEPS.TARGET);
  };

  const confidenceColor = s => s >= 70 ? '#34D399' : s >= 45 ? 'var(--warm)' : '#ff4444';

  if (!mounted) return null;

  return (
    <Layout>
      <div className="page">

        {/* ── HEADER ── */}
        <div className="header" onClick={() => step === STEPS.REPORT && newReport()}>
          <div className="eyebrow">// MEETING_INTEL_AGENT</div>
          <h1 className="header-title">Intelligence <span className="highlight">Briefing.</span></h1>
          <p className="subtext">
            {step === STEPS.CALIBRATE  && `${firstName ? `Hi ${firstName}. ` : ''}Calibrate your agent before your first run.`}
            {step === STEPS.TARGET     && `Agent calibrated · ${calibration.role} at ${calibration.company}`}
            {step === STEPS.CONFIRMING && 'Scanning the web — identifying target...'}
            {step === STEPS.CONFIRM    && 'Confirm the target before generating report.'}
            {step === STEPS.LOADING    && 'Running deep reconnaissance...'}
            {step === STEPS.REPORT     && 'Battlecard ready · click title to run new report'}
          </p>
        </div>

        {/* ── CALIBRATE ── */}
        {step === STEPS.CALIBRATE && (
          <div className="card">
            <div className="card-label">// AGENT_CALIBRATION</div>
            <h2>Set your profile</h2>
            <p className="card-desc">Saved locally. Used to personalise every report. One-time setup.</p>

            <div className="form-grid">
              <div className="field">
                <label>Your Role / Title</label>
                <input type="text" value={calibration.role}
                  onChange={e => setCalibration(p => ({ ...p, role: e.target.value }))} />
              </div>
              <div className="field">
                <label>Your Company</label>
                <input type="text" value={calibration.company}
                  onChange={e => setCalibration(p => ({ ...p, company: e.target.value }))} />
              </div>
              <div className="field full">
                <label>Meeting Type</label>
                <div className="pill-group">
                  {['Sales Pitch', 'Partnership', 'Discovery Call', 'Job Interview', 'General Intel'].map(t => (
                    <button key={t} className={`pill ${calibration.meetingType === t ? 'active' : ''}`}
                      onClick={() => setCalibration(p => ({ ...p, meetingType: t }))}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="field full">
                <label>Your Context <span className="optional">(optional — more detail = sharper report)</span></label>
                <textarea
                  value={calibration.context}
                  onChange={e => setCalibration(p => ({ ...p, context: e.target.value }))}
                  rows={3} />
              </div>
            </div>

            <button className="btn-primary" onClick={saveCalibration}
              disabled={!calibration.role || !calibration.company || !calibration.meetingType}>
              SAVE & CONTINUE
            </button>
          </div>
        )}

        {/* ── TARGET INPUT ── */}
        {step === STEPS.TARGET && (
          <div className="card">
            <div className="card-label">// TARGET_ACQUISITION</div>
            <h2>Who are you meeting?</h2>
            <p className="card-desc">
              Add their LinkedIn URL for the highest confidence report. Without it we'll search the web and ask you to confirm the match first.
            </p>

            <div className="form-grid">
              <div className="field">
                <label>Person's Full Name <span className="required">*</span></label>
                <input type="text" value={targetName}
                  onChange={e => setTargetName(e.target.value)} autoFocus />
              </div>
              <div className="field">
                <label>Their Company <span className="required">*</span></label>
                <input type="text" value={targetCompany}
                  onChange={e => setTargetCompany(e.target.value)} />
              </div>
              <div className="field">
                <label>LinkedIn URL <span className="badge-high">BEST RESULTS</span></label>
                <input type="url" value={linkedinUrl}
                  onChange={e => setLinkedinUrl(e.target.value)} />
              </div>
              <div className="field">
                <label>Company Website <span className="badge-med">RECOMMENDED</span></label>
                <input type="url" value={companyUrl}
                  onChange={e => setCompanyUrl(e.target.value)} />
              </div>
            </div>

            {!linkedinUrl && (
              <div className="info-bar">
                // No LinkedIn URL — we'll search the web and ask you to confirm the match first.
              </div>
            )}

            {error && <div className="error-msg">// ERROR: {error}</div>}

            <button className="btn-primary" onClick={handleSubmit}
              disabled={!targetName.trim() || !targetCompany.trim()}>
              {linkedinUrl ? 'GENERATE INTEL REPORT' : 'FIND & CONFIRM TARGET →'}
            </button>
            <button className="btn-recalibrate" onClick={resetCalibration}>↺ Re-calibrate agent</button>
          </div>
        )}

        {/* ── CONFIRMING ── */}
        {step === STEPS.CONFIRMING && (
          <div className="card loading-card">
            <div className="spinner"><div className="ring" /><div className="ring ring-2" /></div>
            <div className="loading-target">{targetName} · {targetCompany}</div>
            <div className="loading-status">// SCANNING WEB — IDENTIFYING TARGET...</div>
            <div className="loading-bar"><div className="loading-fill-short" /></div>
          </div>
        )}

        {/* ── CONFIRMATION CARD ── */}
        {step === STEPS.CONFIRM && identification && (
          <div className="card">
            <div className="card-label">// TARGET_IDENTIFIED — CONFIRM BEFORE PROCEEDING</div>
            <h2>Is this the right person?</h2>
            <p className="card-desc">
              We found this match. Confirm their role is correct, then generate the full report.
            </p>

            <div className="confirm-card">
              <div className="confirm-top">
                <div>
                  <div className="confirm-name">{identification.name}</div>
                  <div className="confirm-company">{identification.company}</div>
                </div>
                <span className={`conf-badge ${identification.confidence === 'HIGH' ? 'high' : identification.confidence === 'MEDIUM' ? 'med' : 'low'}`}>
                  {identification.confidence} CONFIDENCE
                </span>
              </div>

              {identification.summary && (
                <p className="confirm-summary">{identification.summary}</p>
              )}

              {/* Editable role */}
              <div className="role-edit">
                <label className="role-label">// THEIR ROLE — correct if needed before generating</label>
                <input
                  type="text"
                  className="role-input"
                  value={confirmedRole}
                  onChange={e => setConfirmedRole(e.target.value)}
                  placeholder="e.g. Director of Sales, Founder, Head of Marketing"
                />
              </div>
            </div>

            <div className="confirm-actions">
              <button className="btn-primary confirm-yes" onClick={runFullResearch}>
                ✓ YES, GENERATE REPORT
              </button>
              <button className="btn-no" onClick={() => {
                setIdentification(null); setCachedIntel(null); setConfirmedRole('');
                setStep(STEPS.TARGET);
              }}>
                ✕ NOT THEM — GO BACK
              </button>
            </div>
          </div>
        )}

        {/* ── LOADING ── */}
        {step === STEPS.LOADING && (
          <div className="card loading-card">
            <div className="spinner"><div className="ring" /><div className="ring ring-2" /></div>
            <div className="loading-target">{targetName} · {targetCompany}</div>
            <div className="loading-status">{loadingStatus}</div>
            <div className="loading-bar"><div className="loading-fill" /></div>
            <div className="loading-note">
              {linkedinUrl ? 'Fetching LinkedIn profile + posts via Bright Data...' : 'Web data confirmed — generating your battlecard.'}
            </div>
          </div>
        )}

        {/* ── REPORT ── */}
        {step === STEPS.REPORT && battlecard && (
          <div className="report">
            <div className="report-header">
              <div>
                <div className="card-label">// INTEL_REPORT COMPLETE</div>
                <h2 className="report-title">{battlecard.person?.name || targetName}</h2>
                <div className="report-meta">{battlecard.person?.role} · {battlecard.company?.name}</div>
                {battlecard.data_quality && <div className="data-quality">{battlecard.data_quality}</div>}
              </div>
              <div className="confidence">
                <div className="confidence-score" style={{ color: confidenceColor(battlecard.confidence_score) }}>
                  {battlecard.confidence_score}<span>%</span>
                </div>
                <div className="confidence-label">CONFIDENCE</div>
              </div>
            </div>

            <div className="tabs">
              {['overview', 'pain points', 'talking points', 'approach', 'questions', 'risks'].map(tab => (
                <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}>{tab.toUpperCase()}</button>
              ))}
            </div>

            <div className="tab-content">
              {activeTab === 'overview' && (
                <div className="section-grid">
                  <div className="info-block">
                    <div className="block-label">// PERSON</div>
                    <p className="block-text">{battlecard.person?.background}</p>
                    {battlecard.person?.personality_signals?.length > 0 && (
                      <div className="tags">
                        {battlecard.person.personality_signals.map((s, i) => <span key={i} className="tag">{s}</span>)}
                      </div>
                    )}
                  </div>
                  <div className="info-block">
                    <div className="block-label">// COMPANY</div>
                    <div className="block-meta">{battlecard.company?.size_stage}</div>
                    <p className="block-text">{battlecard.company?.summary}</p>
                    {battlecard.company?.recent_news?.length > 0 && (
                      <div>
                        <div className="sub-label">RECENT NEWS</div>
                        {battlecard.company.recent_news.map((n, i) => <div key={i} className="list-item">→ {n}</div>)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'pain points' && (
                <div className="items-list">
                  {battlecard.pain_points?.map((p, i) => (
                    <div key={i} className="item-card pain">
                      <div className="item-number">0{i + 1}</div>
                      <div className="item-content">
                        <div className="item-title">{p.pain}</div>
                        <div className="item-sub">// EVIDENCE: {p.evidence}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'talking points' && (
                <div className="items-list">
                  {battlecard.talking_points?.map((t, i) => (
                    <div key={i} className="item-card talk">
                      <div className="item-number">0{i + 1}</div>
                      <div className="item-content">
                        <div className="item-title">{t.point}</div>
                        <div className="item-sub">// WHY IT LANDS: {t.why}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'approach' && battlecard.suggested_approach && (
                <div className="approach-grid">
                  <div className="approach-block">
                    <div className="block-label">// OPENING — FIRST 60 SECONDS</div>
                    <p className="block-text large">{battlecard.suggested_approach.opening}</p>
                  </div>
                  <div className="approach-row">
                    <div className="approach-block">
                      <div className="block-label">// STRATEGIC ANGLE</div>
                      <p className="block-text">{battlecard.suggested_approach.angle}</p>
                    </div>
                    <div className="approach-block">
                      <div className="block-label">// TONE</div>
                      <p className="block-text accent-text">{battlecard.suggested_approach.tone}</p>
                    </div>
                  </div>
                  {battlecard.suggested_approach.avoid?.length > 0 && (
                    <div className="approach-block">
                      <div className="block-label">// AVOID</div>
                      {battlecard.suggested_approach.avoid.map((a, i) => <div key={i} className="avoid-item">✕ {a}</div>)}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'questions' && (
                <div className="items-list">
                  {battlecard.questions_to_ask?.map((q, i) => (
                    <div key={i} className="item-card question">
                      <div className="item-number">Q{i + 1}</div>
                      <div className="item-content"><div className="item-title">{q}</div></div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'risks' && (
                <div className="items-list">
                  {battlecard.risk_flags?.map((r, i) => (
                    <div key={i} className="item-card risk">
                      <div className="item-number">!</div>
                      <div className="item-content">
                        <div className="item-title">{r.flag}</div>
                        <div className="item-sub">// MITIGATION: {r.mitigation}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {battlecard.sources_used?.length > 0 && (
              <div className="sources-bar">// SOURCES: {battlecard.sources_used.join(' · ')}</div>
            )}

            <div className="report-actions">
              <button className="btn-action" onClick={copyReport}>{copied ? '✓ COPIED' : '⎘ COPY REPORT'}</button>
              <button className="btn-action" onClick={downloadPDF}>↓ DOWNLOAD PDF</button>
              <button className="btn-new" onClick={newReport}>+ NEW REPORT</button>
            </div>
          </div>
        )}

        <style jsx>{`
          .page { max-width: 900px; margin: 0 auto; padding: 100px 20px 120px; }

          .header { text-align: center; margin-bottom: 60px; transition: all 0.3s; }
          .header:hover .header-title { transform: translateY(-2px); }
          .header:hover .eyebrow { letter-spacing: 0.3em; color: var(--warm); }
          .header:hover .highlight { text-shadow: 0 0 25px rgba(255,107,53,0.6); filter: brightness(1.2); }
          .eyebrow { font-family: 'JetBrains Mono'; color: var(--accent); font-size: 11px; letter-spacing: 0.2em; margin-bottom: 16px; transition: all 0.4s; }
          .header-title { font-size: 48px; font-weight: 800; color: #fff; margin-bottom: 12px; transition: all 0.4s; display: block; }
          .highlight { color: var(--warm); transition: all 0.4s; }
          .subtext { color: var(--text-2); font-size: 13px; font-family: 'JetBrains Mono'; }

          .card { background: var(--surface); border: 1px solid var(--border); border-radius: 24px; padding: 50px; backdrop-filter: blur(10px); }
          .card-label { font-family: 'JetBrains Mono'; font-size: 10px; letter-spacing: 0.2em; color: var(--accent); margin-bottom: 16px; }
          h2 { font-size: 28px; font-weight: 800; color: #fff; margin-bottom: 8px; }
          .card-desc { color: var(--text-2); font-size: 14px; line-height: 1.6; margin-bottom: 36px; }

          .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
          .field { display: flex; flex-direction: column; gap: 8px; }
          .field.full { grid-column: 1 / -1; }
          label { font-family: 'JetBrains Mono'; font-size: 10px; letter-spacing: 0.15em; color: var(--text-2); text-transform: uppercase; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
          .optional { color: rgba(255,255,255,0.2); font-size: 9px; text-transform: none; }
          .required { color: var(--warm); }
          .badge-high { font-size: 8px; padding: 2px 7px; background: rgba(125,249,255,0.1); border: 1px solid rgba(125,249,255,0.25); color: var(--accent); border-radius: 4px; }
          .badge-med { font-size: 8px; padding: 2px 7px; background: rgba(255,107,53,0.1); border: 1px solid rgba(255,107,53,0.2); color: var(--warm); border-radius: 4px; }

          input, textarea { background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; color: #fff; font-size: 14px; outline: none; transition: border-color 0.2s; font-family: inherit; resize: vertical; width: 100%; box-sizing: border-box; }
          input:focus, textarea:focus { border-color: var(--accent); background: rgba(0,0,0,0.5); }

          .pill-group { display: flex; flex-wrap: wrap; gap: 8px; }
          .pill { padding: 8px 16px; border-radius: 999px; border: 1px solid var(--border); background: transparent; color: var(--text-2); font-size: 13px; cursor: pointer; transition: all 0.2s; font-family: inherit; }
          .pill:hover { border-color: var(--accent); color: var(--accent); }
          .pill.active { background: rgba(125,249,255,0.1); border-color: var(--accent); color: var(--accent); }

          .info-bar { font-family: 'JetBrains Mono'; font-size: 10px; letter-spacing: 0.1em; color: rgba(125,249,255,0.5); background: rgba(125,249,255,0.05); border: 1px solid rgba(125,249,255,0.1); border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; }
          .error-msg { font-family: 'JetBrains Mono'; font-size: 11px; color: #ff4444; margin-bottom: 16px; padding: 12px; background: rgba(255,68,68,0.1); border-radius: 8px; border: 1px solid rgba(255,68,68,0.2); }

          .btn-primary { width: 100%; padding: 16px; background: var(--accent); color: #000; border: none; border-radius: 12px; font-weight: 800; font-size: 13px; cursor: pointer; text-transform: uppercase; letter-spacing: 0.08em; transition: all 0.2s; font-family: 'JetBrains Mono'; }
          .btn-primary:hover:not(:disabled) { box-shadow: 0 0 20px rgba(125,249,255,0.4); transform: scale(1.01); }
          .btn-primary:disabled { opacity: 0.3; cursor: not-allowed; }
          .btn-recalibrate { width: 100%; margin-top: 10px; padding: 12px; background: transparent; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; color: rgba(255,255,255,0.3); font-family: 'JetBrains Mono'; font-size: 11px; cursor: pointer; letter-spacing: 0.1em; transition: all 0.2s; }
          .btn-recalibrate:hover { color: var(--warm); border-color: rgba(255,107,53,0.3); }

          /* Confirmation card */
          .confirm-card { background: rgba(0,0,0,0.3); border: 1px solid rgba(125,249,255,0.15); border-radius: 16px; padding: 32px; margin-bottom: 28px; }
          .confirm-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
          .confirm-name { font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 4px; }
          .confirm-company { font-family: 'JetBrains Mono'; font-size: 11px; color: var(--text-2); letter-spacing: 0.1em; }
          .conf-badge { font-family: 'JetBrains Mono'; font-size: 9px; letter-spacing: 0.15em; padding: 4px 10px; border-radius: 4px; white-space: nowrap; }
          .conf-badge.high { background: rgba(52,211,153,0.15); color: #34D399; border: 1px solid rgba(52,211,153,0.3); }
          .conf-badge.med { background: rgba(255,107,53,0.15); color: var(--warm); border: 1px solid rgba(255,107,53,0.3); }
          .conf-badge.low { background: rgba(255,68,68,0.15); color: #ff4444; border: 1px solid rgba(255,68,68,0.3); }
          .confirm-summary { color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
          .role-edit { margin-top: 20px; display: flex; flex-direction: column; gap: 8px; }
          .role-label { font-family: 'JetBrains Mono'; font-size: 9px; letter-spacing: 0.15em; color: var(--accent); }
          .role-input { background: rgba(0,0,0,0.4); border: 1px solid rgba(125,249,255,0.3); border-radius: 10px; padding: 12px 16px; color: #fff; font-size: 15px; font-weight: 600; outline: none; transition: border-color 0.2s; font-family: inherit; width: 100%; box-sizing: border-box; }
          .role-input:focus { border-color: var(--accent); }
          .confirm-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          .confirm-yes { margin: 0; }
          .btn-no { padding: 16px; background: transparent; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: rgba(255,255,255,0.4); font-family: 'JetBrains Mono'; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; cursor: pointer; transition: all 0.2s; text-transform: uppercase; }
          .btn-no:hover { border-color: #ff4444; color: #ff4444; background: rgba(255,68,68,0.08); }

          /* Loading */
          .loading-card { display: flex; flex-direction: column; align-items: center; padding: 80px 50px; gap: 24px; }
          .spinner { position: relative; width: 60px; height: 60px; }
          .ring { position: absolute; inset: 0; border-radius: 50%; border: 2px solid transparent; border-top-color: var(--accent); animation: spin 1s linear infinite; }
          .ring-2 { inset: 8px; border-top-color: var(--warm); animation-duration: 1.5s; animation-direction: reverse; }
          @keyframes spin { to { transform: rotate(360deg); } }
          .loading-target { font-size: 16px; font-weight: 700; color: #fff; }
          .loading-status { font-family: 'JetBrains Mono'; font-size: 11px; color: var(--accent); letter-spacing: 0.15em; min-height: 20px; }
          .loading-bar { width: 240px; height: 2px; background: rgba(255,255,255,0.1); border-radius: 999px; overflow: hidden; }
          .loading-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--warm)); animation: loading 5s ease-in-out infinite; }
          .loading-fill-short { height: 100%; background: linear-gradient(90deg, var(--accent), var(--warm)); animation: loading-short 2s ease-in-out forwards; }
          @keyframes loading { 0% { width: 0%; } 70% { width: 85%; } 100% { width: 95%; } }
          @keyframes loading-short { 0% { width: 0%; } 100% { width: 60%; } }
          .loading-note { font-family: 'JetBrains Mono'; font-size: 10px; color: rgba(255,255,255,0.25); letter-spacing: 0.1em; text-align: center; max-width: 340px; }

          /* Report */
          .report { background: var(--surface); border: 1px solid var(--border); border-radius: 24px; overflow: hidden; }
          .report-header { padding: 40px 50px 30px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: flex-start; }
          .report-title { font-size: 32px; font-weight: 800; color: #fff; margin: 8px 0 6px; }
          .report-meta { font-family: 'JetBrains Mono'; font-size: 11px; color: var(--text-2); letter-spacing: 0.1em; margin-bottom: 6px; }
          .data-quality { font-family: 'JetBrains Mono'; font-size: 9px; letter-spacing: 0.12em; color: rgba(255,255,255,0.25); }
          .confidence { text-align: center; }
          .confidence-score { font-size: 36px; font-weight: 800; font-family: 'JetBrains Mono'; line-height: 1; }
          .confidence-score span { font-size: 18px; }
          .confidence-label { font-family: 'JetBrains Mono'; font-size: 9px; letter-spacing: 0.2em; color: var(--text-2); margin-top: 4px; }

          .tabs { display: flex; border-bottom: 1px solid var(--border); overflow-x: auto; scrollbar-width: none; }
          .tabs::-webkit-scrollbar { display: none; }
          .tab { padding: 16px 24px; background: transparent; border: none; color: var(--text-2); font-family: 'JetBrains Mono'; font-size: 10px; letter-spacing: 0.12em; cursor: pointer; white-space: nowrap; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all 0.2s; }
          .tab:hover { color: #fff; }
          .tab.active { color: var(--accent); border-bottom-color: var(--accent); }
          .tab-content { padding: 40px 50px; min-height: 300px; }

          .section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
          .info-block { background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 16px; padding: 28px; }
          .block-label { font-family: 'JetBrains Mono'; font-size: 9px; letter-spacing: 0.2em; color: var(--accent); margin-bottom: 12px; }
          .block-meta { font-family: 'JetBrains Mono'; font-size: 11px; color: var(--warm); margin-bottom: 10px; }
          .block-text { color: rgba(255,255,255,0.75); font-size: 14px; line-height: 1.7; margin-bottom: 16px; }
          .block-text.large { font-size: 15px; }
          .accent-text { color: var(--accent) !important; font-weight: 700; font-family: 'JetBrains Mono'; font-size: 13px; }
          .tags { display: flex; flex-wrap: wrap; gap: 6px; }
          .tag { padding: 4px 10px; background: rgba(125,249,255,0.08); border: 1px solid rgba(125,249,255,0.15); border-radius: 999px; font-size: 11px; color: var(--accent); font-family: 'JetBrains Mono'; }
          .sub-label { font-family: 'JetBrains Mono'; font-size: 9px; letter-spacing: 0.15em; color: var(--text-2); margin-bottom: 8px; }
          .list-item { font-size: 13px; color: rgba(255,255,255,0.6); padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05); line-height: 1.5; }

          .items-list { display: flex; flex-direction: column; gap: 14px; }
          .item-card { display: flex; gap: 20px; padding: 24px; background: rgba(0,0,0,0.2); border-radius: 14px; border-left: 3px solid transparent; align-items: flex-start; }
          .item-card.pain { border-left-color: var(--warm); }
          .item-card.talk { border-left-color: var(--accent); }
          .item-card.question { border-left-color: rgba(125,249,255,0.4); }
          .item-card.risk { border-left-color: #ff4444; }
          .item-number { font-family: 'JetBrains Mono'; font-size: 11px; color: var(--text-2); min-width: 28px; padding-top: 2px; }
          .item-title { font-size: 15px; color: #fff; font-weight: 600; margin-bottom: 6px; line-height: 1.5; }
          .item-sub { font-family: 'JetBrains Mono'; font-size: 11px; color: var(--text-2); line-height: 1.6; }

          .approach-grid { display: flex; flex-direction: column; gap: 20px; }
          .approach-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .approach-block { background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 16px; padding: 28px; }
          .avoid-item { font-size: 14px; color: rgba(255,107,53,0.8); padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }

          .sources-bar { padding: 14px 50px; border-top: 1px solid var(--border); font-family: 'JetBrains Mono'; font-size: 9px; letter-spacing: 0.1em; color: rgba(255,255,255,0.2); }
          .report-actions { padding: 24px 50px; border-top: 1px solid var(--border); display: flex; gap: 12px; align-items: center; }
          .btn-action { padding: 12px 24px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: rgba(255,255,255,0.6); font-family: 'JetBrains Mono'; font-size: 11px; letter-spacing: 0.1em; cursor: pointer; transition: all 0.2s; }
          .btn-action:hover { background: rgba(255,255,255,0.08); color: #fff; }
          .btn-new { margin-left: auto; padding: 12px 28px; background: var(--accent); border: none; border-radius: 10px; color: #000; font-family: 'JetBrains Mono'; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; cursor: pointer; transition: all 0.2s; }
          .btn-new:hover { box-shadow: 0 0 15px rgba(125,249,255,0.4); }

          @media (max-width: 700px) {
            .page { padding: 80px 16px 100px; }
            .header-title { font-size: 32px; }
            .card { padding: 30px 20px; }
            .form-grid { grid-template-columns: 1fr; }
            .section-grid { grid-template-columns: 1fr; }
            .report-header { flex-direction: column; gap: 20px; }
            .approach-row { grid-template-columns: 1fr; }
            .tab-content { padding: 28px 20px; }
            .report-actions { flex-wrap: wrap; padding: 20px; }
            .confirm-actions { grid-template-columns: 1fr; }
            .confirm-top { flex-direction: column; gap: 12px; }
          }
        `}</style>
      </div>
    </Layout>
  );
}

function generatePlainText(b) {
  const lines = [`MEETING INTELLIGENCE REPORT`, `Target: ${b.person?.name} — ${b.person?.role}`, `Company: ${b.company?.name} (${b.company?.size_stage})`, `Confidence: ${b.confidence_score}%`, ``];
  lines.push(`--- PERSON ---`, b.person?.background || '', ``);
  lines.push(`--- COMPANY ---`, b.company?.summary || '', ``);
  lines.push(`Recent News:`); (b.company?.recent_news || []).forEach(n => lines.push(`  • ${n}`));
  lines.push(`\n--- PAIN POINTS ---`); (b.pain_points || []).forEach((p, i) => lines.push(`${i+1}. ${p.pain}\n   Evidence: ${p.evidence}`));
  lines.push(`\n--- TALKING POINTS ---`); (b.talking_points || []).forEach((t, i) => lines.push(`${i+1}. ${t.point}\n   Why: ${t.why}`));
  lines.push(`\n--- APPROACH ---`, `Opening: ${b.suggested_approach?.opening}`, `Angle: ${b.suggested_approach?.angle}`, `Tone: ${b.suggested_approach?.tone}`);
  lines.push(`\n--- QUESTIONS ---`); (b.questions_to_ask || []).forEach((q, i) => lines.push(`${i+1}. ${q}`));
  lines.push(`\n--- RISKS ---`); (b.risk_flags || []).forEach(r => lines.push(`! ${r.flag}\n  Mitigation: ${r.mitigation}`));
  return lines.join('\n');
}

function generatePrintHTML(b, name, company) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Intel — ${name}</title>
  <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a;padding:40px;font-size:13px;line-height:1.6}h1{font-size:26px;margin-bottom:4px}.meta{color:#666;font-size:11px;margin-bottom:28px;padding-bottom:16px;border-bottom:2px solid #000}h2{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#999;margin:24px 0 10px;border-bottom:1px solid #eee;padding-bottom:6px}p{margin-bottom:10px}.item{margin-bottom:12px;padding:10px 14px;background:#f7f7f7;border-radius:4px;border-left:3px solid #000}.item-title{font-weight:700;margin-bottom:4px}.item-sub{color:#666;font-size:12px}.tag{display:inline-block;padding:2px 8px;background:#eee;border-radius:99px;font-size:10px;margin:2px}ul{padding-left:18px}li{margin-bottom:5px}.score{float:right;font-size:22px;font-weight:700}@media print{body{padding:20px}}</style>
  </head><body>
  <h1>${b.person?.name||name} <span class="score">${b.confidence_score}%</span></h1>
  <div class="meta">${b.person?.role||''} · ${b.company?.name||company}</div>
  <h2>Person</h2><p>${b.person?.background||''}</p>${(b.person?.personality_signals||[]).map(s=>`<span class="tag">${s}</span>`).join('')}
  <h2>Company</h2><p><strong>${b.company?.size_stage||''}</strong> — ${b.company?.summary||''}</p><ul>${(b.company?.recent_news||[]).map(n=>`<li>${n}</li>`).join('')}</ul>
  <h2>Pain Points</h2>${(b.pain_points||[]).map(p=>`<div class="item"><div class="item-title">${p.pain}</div><div class="item-sub">Evidence: ${p.evidence}</div></div>`).join('')}
  <h2>Talking Points</h2>${(b.talking_points||[]).map(t=>`<div class="item"><div class="item-title">${t.point}</div><div class="item-sub">Why: ${t.why}</div></div>`).join('')}
  <h2>Approach</h2><div class="item"><div class="item-title">Opening</div>${b.suggested_approach?.opening||''}</div><div class="item"><div class="item-title">Angle</div>${b.suggested_approach?.angle||''}</div>
  <h2>Questions</h2><ul>${(b.questions_to_ask||[]).map(q=>`<li>${q}</li>`).join('')}</ul>
  <h2>Risks</h2>${(b.risk_flags||[]).map(r=>`<div class="item"><div class="item-title">⚠ ${r.flag}</div><div class="item-sub">Mitigation: ${r.mitigation}</div></div>`).join('')}
  </body></html>`;
}