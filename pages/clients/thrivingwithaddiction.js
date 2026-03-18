import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

export default function ThrivingWithAddiction() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [clips, setClips] = useState([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(null);
  const [expandedClip, setExpandedClip] = useState(null);
  const [expandedDeliverable, setExpandedDeliverable] = useState(null);
  const [expandedReason, setExpandedReason] = useState(null);
  const [fileName, setFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animFrameId;
    const particles = [];

    const resizeCanvas = () => {
      const wrapper = canvas.parentElement;
      canvas.width = wrapper ? wrapper.offsetWidth : window.innerWidth;
      canvas.height = wrapper ? wrapper.scrollHeight : document.body.scrollHeight;
    };

    resizeCanvas();

    const pageH = canvas.height;
    const pageW = canvas.width;

    for (let i = 0; i < 130; i++) {
      particles.push({
        x: Math.random() * pageW,
        y: Math.random() * pageH,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        size: Math.random() * 1.5 + 0.3,
        warm: Math.random() > 0.6,
        opacity: Math.random() * 0.10 + 0.02,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.warm
          ? `rgba(160, 100, 60, ${p.opacity})`
          : `rgba(74, 124, 126, ${p.opacity})`;
        ctx.globalAlpha = 1;
        ctx.fill();
      });
      animFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animFrameId);
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [mounted, clips, expandedClip, expandedDeliverable, expandedReason]);

  const parseFileContent = (text, name) => {
    if (name.endsWith('.csv')) {
      return text
        .split('\n')
        .map(row => {
          const cols = row.split(',');
          return cols.slice(3).join(' ').replace(/^"|"$/g, '').trim();
        })
        .filter(Boolean)
        .join(' ');
    }
    return text;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const raw = ev.target.result;
      const parsed = parseFileContent(raw, file.name);
      setTranscript(parsed);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (!transcript.trim() || transcript.trim().length < 100) {
      setError('Please paste or upload a transcript first.');
      return;
    }
    setError('');
    setClips([]);
    setExpandedClip(null);
    setLoading(true);
    try {
      const res = await fetch('/api/clip-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setClips(data.clips);
      setExpandedClip(0);
    } catch (err) {
      setError(err.message || 'Failed to generate suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!mounted) return null;

  const deliverables = [
    { title: 'Clip Schedule Per Episode', summary: '4 to 6 short-form clips per episode, timestamped and ready to post.', detail: 'Every episode gets a full clip schedule — the strongest emotional moments identified, cut to the right length for each platform, with a hook caption and title written and ready. You or anyone on your team can execute it without having to think about what to cut.' },
    { title: 'Guest Authority Trailers', summary: '60 to 90 second highlight reel for each guest before the episode drops.', detail: "Before the episode goes live, we put out a trailer built around the guest's world. UFC career highlights for Jared Gordon. ESPN clips and career moments for Lauren Sisler. It hooks your audience before they've heard a word of the conversation — and gets in front of the guest's existing fanbase." },
    { title: 'Platform-Native Edits', summary: 'Every clip formatted specifically for Instagram, YouTube Shorts and TikTok.', detail: "Not the same file repurposed across platforms. Each clip is edited for the platform it's going on — aspect ratio, pacing, captions, hook timing. What works on Reels doesn't always work on TikTok. We treat them differently." },
    { title: 'Caption and Title Writing', summary: 'Hook-led captions and titles written for every clip.', detail: "The caption is often what determines whether someone watches or scrolls. Every clip comes with a caption written to stop the scroll — leading with the most compelling line from the moment, not a description of what's in the video." },
    { title: 'Consistent Posting Schedule', summary: 'Content going out every week across all platforms.', detail: 'The algorithm rewards consistency above almost everything else. We build a posting schedule and stick to it — content going out multiple times a week without you having to think about it.' },
    { title: 'Monthly Strategy Review', summary: 'Monthly review of what performed and what to double down on.', detail: "Every month we look at the numbers — what got watched, what got shared, what drove listeners to the full episode. We adjust the approach based on what's actually working." },
    { title: 'Book Promotion Integration', summary: 'Every piece of content ties back to Thriving with Addiction.', detail: 'The podcast and the book are the same machine. Every clip drives someone to the full episode, and every full episode is an opportunity to drive them to the book. We build that thread into everything we produce.' },
  ];

  const reasons = [
    { title: "Your guests have audiences you aren't reaching", summary: 'Jared Gordon has fans who have never heard of the show.', detail: "A well-timed clip in front of Jared Gordon's audience is a direct pipeline to new listeners who already trust him. The same logic applies to every guest with an existing following — ESPN viewers for Lauren Sisler, policy circles for Patrick Kennedy. Each guest is a distribution channel you haven't activated yet." },
    { title: 'The content is already there', summary: "You don't need to change anything about how you record.", detail: "The raw material is already exceptional. The conversations are long-form, emotionally rich, and full of moments that would stop someone mid-scroll. Nothing about your format needs to change — it just needs to be extracted, packaged and distributed consistently." },
    { title: 'Mental health content performs', summary: 'Honest conversations about addiction and recovery travel on social media.', detail: 'People share content that makes them feel seen, or that they want someone they love to see. Recovery stories, raw honesty about mental health, moments of genuine human vulnerability — these travel. The Jared Gordon episode alone has five or six moments that could genuinely go wide.' },
    { title: 'The book needs a content engine', summary: 'A podcast without distribution is a book without a marketing plan.', detail: 'Building this content system now means the book has a growing, engaged audience waiting for it. Every clip is a discovery moment — someone finds the podcast through a 30-second video, listens to three episodes, and buys the book. That chain needs to start somewhere.' },
  ];

  return (
    <div className="wrap">
      <canvas ref={canvasRef} className="bg-canvas" />

      <nav className="top-nav">
        <button className="back-btn" onClick={() => router.push('/')}>Back</button>
        <div className="nav-pills">
          <button className="nav-item" onClick={() => scrollTo('sec-tool')}>Clip Tool</button>
          <button className="nav-item" onClick={() => scrollTo('sec-package')}>The Package</button>
          <button className="nav-item" onClick={() => scrollTo('sec-why')}>Why Now</button>
          <a className="nav-cta" href="mailto:tom@learnlab.studio">Get in Touch</a>
        </div>
      </nav>

      <div className="page">

        <section className="hero">
          <div className="inner">
            <div className="eyebrow fade-up">Prepared for Dr. Jonathan Avery · March 2026</div>
            <h1 className="fade-up">Thriving with Addiction<br /><span className="hl">deserves a bigger audience.</span></h1>
            <p className="hero-sub fade-up">You have the credibility, the story, and the guests. This is the content infrastructure to make sure the right people find it.</p>
            <div className="hero-tags fade-up">
              <span className="tag">LearnLab Studio</span>
              <span className="tag">Confidential</span>
              <span className="tag">March 2026</span>
            </div>
          </div>
        </section>

        <section id="sec-tool" className="section section-tool">
          <div className="inner">
            <div className="eyebrow fade-up">Clip Suggestion Tool</div>
            <h2 className="fade-up">Paste a transcript.<br /><span className="hl">Get your best clips instantly.</span></h2>
            <p className="lead fade-up">Drop in any episode transcript and the tool identifies the five most powerful moments to cut as short-form content — exact timestamps, the actual words said, a suggested title and a caption hook ready to use.</p>

            <div
              className={`tool-card fade-up ${dragOver ? 'tool-card-drag' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files[0];
                if (file) {
                  setFileName(file.name);
                  const reader = new FileReader();
                  reader.onload = ev => {
                    const raw = ev.target.result;
                    setTranscript(parseFileContent(raw, file.name));
                  };
                  reader.readAsText(file);
                }
              }}
            >
              <div className="tool-top-row">
                <div className="tool-label">Episode Transcript</div>
                <div className="upload-area">
                  {fileName && <span className="file-name">{fileName}</span>}
                  <button className="upload-btn" onClick={() => fileInputRef.current?.click()}>
                    {fileName ? 'Change File' : 'Upload File'}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.csv,.srt,.vtt,.doc,.docx,text/*"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
              <textarea
                className="transcript-input"
                placeholder="Paste your full episode transcript here, drag and drop a file, or use the upload button. Works with .txt, .csv, .srt and most text formats..."
                value={transcript}
                onChange={e => { setTranscript(e.target.value); setFileName(''); }}
                rows={12}
              />
              <div className="tool-footer">
                <span className="char-count">
                  {transcript.length > 0 ? `${transcript.length.toLocaleString()} characters` : 'No transcript yet'}
                </span>
                <button className={`run-btn ${loading ? 'loading' : ''}`} onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Analysing...' : 'Find Best Clips'}
                </button>
              </div>
              {error && <div className="error-msg">{error}</div>}
            </div>

            {loading && (
              <div className="loading-state">
                <div className="loading-dots"><span /><span /><span /></div>
                <p>Reading through your transcript and finding the moments worth clipping...</p>
              </div>
            )}

            {clips.length > 0 && (
              <div className="clips-list">
                {clips.map((clip, i) => (
                  <div
                    key={i}
                    className={`clip-card ${expandedClip === i ? 'clip-expanded' : ''}`}
                    onClick={() => setExpandedClip(expandedClip === i ? null : i)}
                  >
                    <div className="clip-header">
                      <div className="clip-left">
                        <div className="clip-num">0{i + 1}</div>
                        <div className="clip-times">
                          <span className="time-badge">{clip.start_time}</span>
                          <span className="time-sep">to</span>
                          <span className="time-badge">{clip.end_time}</span>
                        </div>
                        <h4 className="clip-title">{clip.title}</h4>
                      </div>
                      <div className="clip-chevron">{expandedClip === i ? '−' : '+'}</div>
                    </div>
                    {expandedClip === i && (
                      <div className="clip-body" onClick={e => e.stopPropagation()}>
                        {clip.transcript_excerpt && (
                          <div className="clip-section clip-section-transcript">
                            <div className="clip-section-label">What's Said in This Clip</div>
                            <p className="clip-excerpt">"{clip.transcript_excerpt}"</p>
                          </div>
                        )}
                        <div className="clip-section">
                          <div className="clip-section-label">Caption Hook</div>
                          <p className="clip-hook">{clip.hook}</p>
                          <button className="copy-btn" onClick={() => copy(clip.hook, `hook-${i}`)}>
                            {copied === `hook-${i}` ? '✓ Copied' : 'Copy Hook'}
                          </button>
                        </div>
                        <div className="clip-section clip-section-muted">
                          <div className="clip-section-label">Why This Works</div>
                          <p className="clip-reason">{clip.reason}</p>
                        </div>
                        <button
                          className="copy-all-btn"
                          onClick={() => copy(`${clip.title}\n${clip.start_time} to ${clip.end_time}\n\nHook: ${clip.hook}\n\nTranscript:\n"${clip.transcript_excerpt}"`, `all-${i}`)}
                        >
                          {copied === `all-${i}` ? '✓ Copied' : 'Copy All Details'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="tool-note fade-up">
              <div className="tool-note-icon">💡</div>
              <div>
                <strong>How to use this</strong>
                <p>Take the timestamps, go into your video editor, cut the clip, and upload it with the suggested title and hook as the caption. The transcript excerpt shows exactly what's being said so you can jump to the right moment instantly. If we were working together these would be fully edited, captioned, platform-optimised cuts — but even doing it yourself, you are getting real content out consistently.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="sec-package" className="section section-warm">
          <div className="inner">
            <div className="eyebrow fade-up">The Cloud Package</div>
            <h2 className="fade-up">What it looks like<br /><span className="hl">when we do this properly.</span></h2>
            <p className="lead fade-up">The tool above is the floor. This is the ceiling — a full content infrastructure built around your podcast, running every week without you having to think about it. Click any item to expand.</p>

            <div className="pkg-grid">
              <div className="pkg-main fade-up">
                <div className="pkg-price-block">
                  <div className="pkg-price">£1,999<span className="pkg-per">/mo</span></div>
                  <div className="pkg-price-usd">approx. $2,670 USD at current rates</div>
                </div>
                <div className="pkg-divider" />
                <div className="pkg-items">
                  {deliverables.map((item, i) => (
                    <div
                      key={i}
                      className={`pkg-item ${expandedDeliverable === i ? 'pkg-item-expanded' : ''}`}
                      onClick={() => setExpandedDeliverable(expandedDeliverable === i ? null : i)}
                    >
                      <div className="pkg-item-header">
                        <div className="pkg-dot" />
                        <div className="pkg-item-text">
                          <strong>{item.title}</strong>
                          <span>{item.summary}</span>
                        </div>
                        <div className="pkg-chevron">{expandedDeliverable === i ? '−' : '+'}</div>
                      </div>
                      {expandedDeliverable === i && (
                        <div className="pkg-item-detail"><p>{item.detail}</p></div>
                      )}
                    </div>
                  ))}
                </div>
                <a href="mailto:tom@learnlab.studio" className="cta-btn">Get in Touch</a>
              </div>

              <div className="pkg-side">
                <div
                  className={`side-card fade-up ${expandedDeliverable === 'trailer' ? 'side-card-open' : ''}`}
                  onClick={() => setExpandedDeliverable(expandedDeliverable === 'trailer' ? null : 'trailer')}
                >
                  <div className="side-card-header">
                    <div className="side-card-label">The Guest Trailer Concept</div>
                    <div className="pkg-chevron">{expandedDeliverable === 'trailer' ? '−' : '+'}</div>
                  </div>
                  <p>Before each episode drops, we put out a 60 to 90 second cut built around your guest's world. UFC highlights for Jared Gordon. ESPN clips for Lauren Sisler.</p>
                  {expandedDeliverable === 'trailer' && (
                    <p className="side-card-detail">It introduces the guest to your audience and introduces your podcast to theirs. The episode hasn't even dropped yet and you already have content out that their fans will share. It also gives the guest something to repost — which doubles your reach before a single listener has tuned in.</p>
                  )}
                </div>
                <div
                  className={`side-card side-card-teal fade-up ${expandedDeliverable === 'book' ? 'side-card-open' : ''}`}
                  onClick={() => setExpandedDeliverable(expandedDeliverable === 'book' ? null : 'book')}
                >
                  <div className="side-card-header">
                    <div className="side-card-label">What This Does For the Book</div>
                    <div className="pkg-chevron">{expandedDeliverable === 'book' ? '−' : '+'}</div>
                  </div>
                  <p>Every clip drives people to the full episode. Every full episode drives people to Thriving with Addiction.</p>
                  {expandedDeliverable === 'book' && (
                    <p className="side-card-detail">Someone finds a 45 second clip on Instagram, watches it, follows the account, listens to three full episodes, and buys the book. That chain starts with a single well-cut clip. The content becomes a discovery engine — running continuously, compounding over time.</p>
                  )}
                </div>
                <div
                  className={`side-card side-card-flywheel fade-up ${expandedDeliverable === 'flywheel' ? 'side-card-open' : ''}`}
                  onClick={() => setExpandedDeliverable(expandedDeliverable === 'flywheel' ? null : 'flywheel')}
                >
                  <div className="side-card-header">
                    <div className="side-card-label side-card-label-orange">The Flywheel Effect</div>
                    <div className="pkg-chevron">{expandedDeliverable === 'flywheel' ? '−' : '+'}</div>
                  </div>
                  <p>More content means more eyeballs. More eyeballs means a bigger platform. A bigger platform attracts bigger guests — and bigger guests bring their audiences with them.</p>
                  {expandedDeliverable === 'flywheel' && (
                    <p className="side-card-detail">This is how shows go from a few thousand listeners to tens of thousands without running ads. The content does the work — it circulates, gets shared, surfaces in search, lands in front of people who have never heard of you. Each episode compounds on the last. The earlier the flywheel starts spinning, the harder it becomes to stop.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="sec-why" className="section">
          <div className="inner">
            <div className="eyebrow fade-up">Why Now</div>
            <h2 className="fade-up">The podcast is new.<br /><span className="hl">The window is open.</span></h2>
            <p className="lead fade-up">The hardest part of growing a podcast is the early stage — building the library, establishing the rhythm, getting the algorithm working in your favour. Starting that system now is the right time. Click any card to expand.</p>
            <div className="reasons-grid">
              {reasons.map((r, i) => (
                <div
                  key={i}
                  className={`reason-card fade-up ${expandedReason === i ? 'reason-expanded' : ''}`}
                  onClick={() => setExpandedReason(expandedReason === i ? null : i)}
                >
                  <div className="reason-header">
                    <div className="reason-num">0{i + 1}</div>
                    <div className="reason-chevron">{expandedReason === i ? '−' : '+'}</div>
                  </div>
                  <h4>{r.title}</h4>
                  <p className="reason-summary">{r.summary}</p>
                  {expandedReason === i && <p className="reason-detail">{r.detail}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-inner">
            <div className="eyebrow fade-up">Next Steps</div>
            <h2 className="fade-up">Ready when<br /><span className="hl">you are.</span></h2>
            <p className="fade-up">Even if the budget isn't there right now, use the tool above for every episode. Get clips out. Get content moving. And when you're ready to hand it over, I'm here.</p>
            <a href="mailto:tom@learnlab.studio" className="cta-btn-lg fade-up">Get in Touch</a>
          </div>
        </section>

        <div className="footer">LearnLab Studio · learnlab.studio · Prepared for Dr. Jonathan Avery · March 2026</div>
      </div>

      <style jsx global>{`
        body { margin: 0; background: #F7F4EF; }
        .fade-up {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.55s ease, transform 0.55s ease;
          will-change: opacity, transform;
        }
        .fade-up.visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>

      <style jsx>{`
        .wrap {
          position: relative;
          min-height: 100vh;
          background: #F7F4EF;
          font-family: 'JetBrains Mono', 'Courier New', monospace;
        }
        .bg-canvas {
          position: absolute; top: 0; left: 0;
          width: 100%; height: 100%;
          pointer-events: none; z-index: 0;
        }
        .page { position: relative; z-index: 1; padding-top: 80px; }

        .top-nav {
          position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
          z-index: 200; display: flex; align-items: center; gap: 8px;
        }
        .back-btn {
          padding: 9px 16px; background: rgba(247,244,239,0.92);
          backdrop-filter: blur(16px); border: 1px solid rgba(0,0,0,0.10);
          border-radius: 999px; color: rgba(0,0,0,0.4);
          font-family: 'JetBrains Mono', monospace; font-size: 10px;
          letter-spacing: 0.1em; cursor: pointer; transition: all 0.2s; white-space: nowrap;
        }
        .back-btn:hover { color: #4A7C7E; border-color: rgba(74,124,126,0.4); }
        .nav-pills {
          display: flex; align-items: center; gap: 4px;
          background: rgba(247,244,239,0.92); backdrop-filter: blur(16px);
          border: 1px solid rgba(0,0,0,0.10); border-radius: 999px; padding: 6px 8px;
        }
        .nav-item {
          padding: 8px 14px; background: transparent; border: none;
          color: rgba(0,0,0,0.35); font-family: 'JetBrains Mono', monospace;
          font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
          cursor: pointer; border-radius: 999px; transition: all 0.2s; white-space: nowrap;
        }
        .nav-item:hover { color: #4A7C7E; background: rgba(74,124,126,0.08); }
        .nav-cta {
          padding: 8px 18px; background: #2C4A52; border: none; color: #fff;
          font-family: 'JetBrains Mono', monospace; font-size: 10px;
          letter-spacing: 0.1em; text-transform: uppercase; font-weight: 700;
          cursor: pointer; border-radius: 999px; transition: all 0.2s;
          white-space: nowrap; text-decoration: none;
        }
        .nav-cta:hover { background: #3a6070; }

        .eyebrow {
          font-family: 'JetBrains Mono', monospace; font-size: 10px;
          letter-spacing: 0.2em; text-transform: uppercase; color: #4A7C7E;
          margin-bottom: 18px; display: block;
        }
        .section { padding: 100px 48px; }
        .section-tool {
          background: rgba(74,124,126,0.04);
          border-top: 1px solid rgba(74,124,126,0.1);
          border-bottom: 1px solid rgba(74,124,126,0.1);
        }
        .section-warm {
          background: rgba(0,0,0,0.03);
          border-top: 1px solid rgba(0,0,0,0.07);
          border-bottom: 1px solid rgba(0,0,0,0.07);
        }
        .inner { max-width: 1100px; margin: 0 auto; }
        .hero { padding: 80px 48px 100px; }
        h1 { font-size: 56px; font-weight: 800; color: #1A2A2E; line-height: 1.08; margin-bottom: 24px; letter-spacing: -0.02em; }
        h2 { font-size: 42px; font-weight: 800; color: #1A2A2E; line-height: 1.1; margin-bottom: 20px; letter-spacing: -0.01em; }
        h4 { font-size: 15px; font-weight: 700; color: #1A2A2E; margin-bottom: 8px; }
        .hl { color: #4A7C7E; }
        .hero-sub { color: rgba(26,42,46,0.55); font-size: 17px; line-height: 1.7; max-width: 620px; margin-bottom: 36px; }
        .lead { color: rgba(26,42,46,0.55); font-size: 15px; line-height: 1.7; max-width: 680px; margin-bottom: 48px; }
        .hero-tags { display: flex; gap: 10px; flex-wrap: wrap; }
        .tag {
          font-family: 'JetBrains Mono', monospace; font-size: 10px;
          letter-spacing: 0.12em; padding: 6px 14px;
          border: 1px solid rgba(0,0,0,0.12); border-radius: 6px; color: rgba(0,0,0,0.3);
        }

        .tool-card {
          background: #fff; border: 1px solid rgba(74,124,126,0.15);
          border-radius: 20px; padding: 32px; margin-bottom: 28px;
          box-shadow: 0 2px 20px rgba(0,0,0,0.04);
        }
        .tool-top-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
        .tool-label {
          font-family: 'JetBrains Mono', monospace; font-size: 10px;
          letter-spacing: 0.18em; text-transform: uppercase; color: rgba(0,0,0,0.3);
        }
        .upload-area { display: flex; align-items: center; gap: 12px; }
        .file-name {
          font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #4A7C7E;
          max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .upload-btn {
          padding: 8px 16px; background: rgba(74,124,126,0.08);
          border: 1px solid rgba(74,124,126,0.3); border-radius: 8px; color: #4A7C7E;
          font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700;
          letter-spacing: 0.06em; cursor: pointer; transition: all 0.2s; white-space: nowrap;
        }
        .upload-btn:hover { background: rgba(74,124,126,0.15); border-color: #4A7C7E; }
        .transcript-input {
          width: 100%; padding: 18px; background: #F7F4EF;
          border: 1px solid rgba(0,0,0,0.10); border-radius: 12px;
          font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #1A2A2E;
          line-height: 1.6; resize: vertical; outline: none;
          transition: border-color 0.2s; box-sizing: border-box;
        }
        .transcript-input:focus { border-color: #4A7C7E; }
        .transcript-input::placeholder { color: rgba(0,0,0,0.22); }
        .tool-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; gap: 16px; }
        .char-count { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: rgba(0,0,0,0.28); letter-spacing: 0.06em; }
        .run-btn {
          padding: 14px 32px; background: #2C4A52; color: #fff; border: none;
          border-radius: 10px; font-family: 'JetBrains Mono', monospace; font-size: 12px;
          font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
          cursor: pointer; transition: all 0.2s; white-space: nowrap; flex-shrink: 0;
        }
        .run-btn:hover:not(:disabled) { background: #3a6070; box-shadow: 0 4px 16px rgba(44,74,82,0.3); }
        .run-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .error-msg {
          margin-top: 14px; padding: 12px 16px; background: rgba(180,60,60,0.06);
          border: 1px solid rgba(180,60,60,0.18); border-radius: 8px; color: #a03030; font-size: 13px;
        }
        .loading-state { text-align: center; padding: 48px 0; }
        .loading-dots { display: flex; justify-content: center; gap: 8px; margin-bottom: 20px; }
        .loading-dots span {
          width: 8px; height: 8px; border-radius: 50%; background: #4A7C7E;
          animation: pulse 1.2s ease-in-out infinite;
        }
        .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
        .loading-state p { color: rgba(0,0,0,0.35); font-size: 13px; }

        .clips-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 32px; }
        .clip-card {
          background: #fff; border: 1px solid rgba(0,0,0,0.08); border-radius: 14px;
          cursor: pointer; transition: all 0.25s cubic-bezier(0.22,1,0.36,1);
          box-shadow: 0 1px 6px rgba(0,0,0,0.04); overflow: hidden;
        }
        .clip-card:hover { border-color: rgba(74,124,126,0.35); box-shadow: 0 6px 20px rgba(0,0,0,0.07); transform: translateY(-1px); }
        .clip-expanded { border-color: rgba(255,107,53,0.35); box-shadow: 0 8px 24px rgba(255,107,53,0.08); background: rgba(255,107,53,0.02); }
        .clip-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 22px; gap: 16px; }
        .clip-left { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0; }
        .clip-num { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #4A7C7E; letter-spacing: 0.2em; flex-shrink: 0; }
        .clip-times { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
        .time-badge {
          font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700;
          color: #2C4A52; background: #F0F5F5; padding: 4px 10px; border-radius: 5px;
          border: 1px solid rgba(74,124,126,0.2);
        }
        .time-sep { font-size: 10px; color: rgba(0,0,0,0.25); }
        .clip-title { font-size: 14px; font-weight: 700; color: #1A2A2E; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .clip-chevron { font-size: 16px; color: rgba(0,0,0,0.25); flex-shrink: 0; font-family: 'JetBrains Mono', monospace; }
        .clip-body { padding: 0 22px 22px; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 18px; }
        .clip-section { background: #F7F4EF; border-radius: 10px; padding: 14px 16px; margin-bottom: 10px; }
        .clip-section-transcript {
          background: rgba(44,74,82,0.05);
          border: 1px solid rgba(44,74,82,0.12);
        }
        .clip-section-muted { background: rgba(0,0,0,0.02); }
        .clip-section-label {
          font-family: 'JetBrains Mono', monospace; font-size: 9px;
          letter-spacing: 0.18em; text-transform: uppercase; color: rgba(0,0,0,0.28); margin-bottom: 8px;
        }
        .clip-excerpt {
          font-size: 13px; color: #2C4A52; line-height: 1.65; margin: 0;
          font-style: italic; white-space: pre-wrap;
        }
        .clip-hook { font-size: 14px; color: #1A2A2E; line-height: 1.5; margin: 0 0 12px; }
        .clip-reason { font-size: 13px; color: rgba(26,42,46,0.6); line-height: 1.5; margin: 0; }
        .copy-btn {
          padding: 6px 14px; background: #2C4A52; color: #fff; border: none;
          border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 10px;
          font-weight: 700; letter-spacing: 0.06em; cursor: pointer; transition: all 0.2s;
        }
        .copy-btn:hover { background: #3a6070; }
        .copy-all-btn {
          margin-top: 4px; padding: 10px 20px; background: transparent;
          border: 1px solid rgba(74,124,126,0.28); border-radius: 8px; color: #4A7C7E;
          font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700;
          letter-spacing: 0.06em; cursor: pointer; transition: all 0.2s; width: 100%;
        }
        .copy-all-btn:hover { background: rgba(74,124,126,0.06); border-color: #4A7C7E; }

        .tool-note {
          display: flex; gap: 18px; background: rgba(74,124,126,0.05);
          border: 1px solid rgba(74,124,126,0.16); border-radius: 14px;
          padding: 22px; align-items: flex-start;
        }
        .tool-note-icon { font-size: 20px; flex-shrink: 0; margin-top: 2px; }
        .tool-note strong { display: block; color: #1A2A2E; font-size: 14px; margin-bottom: 6px; }
        .tool-note p { color: rgba(26,42,46,0.55); font-size: 13px; line-height: 1.65; margin: 0; }

        .pkg-grid { display: grid; grid-template-columns: 1fr 360px; gap: 22px; align-items: start; }
        .pkg-main {
          background: #fff; border: 1px solid rgba(0,0,0,0.10);
          border-radius: 22px; padding: 42px; box-shadow: 0 2px 20px rgba(0,0,0,0.04);
        }
        .pkg-price-block { margin-bottom: 28px; }
        .pkg-price { font-size: 54px; font-weight: 800; color: #1A2A2E; line-height: 1; letter-spacing: -0.02em; }
        .pkg-per { font-size: 20px; font-weight: 400; color: rgba(26,42,46,0.35); }
        .pkg-price-usd { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: rgba(26,42,46,0.3); margin-top: 6px; letter-spacing: 0.04em; }
        .pkg-divider { height: 1px; background: rgba(0,0,0,0.07); margin-bottom: 22px; }
        .pkg-items { display: flex; flex-direction: column; gap: 2px; margin-bottom: 30px; }
        .pkg-item {
          border: 1px solid transparent; border-radius: 10px;
          padding: 12px 14px; cursor: pointer; transition: all 0.2s;
        }
        .pkg-item:hover { background: rgba(74,124,126,0.04); border-color: rgba(74,124,126,0.18); }
        .pkg-item-expanded { background: rgba(255,107,53,0.04); border-color: rgba(255,107,53,0.3); }
        .pkg-item-header { display: flex; gap: 12px; align-items: flex-start; }
        .pkg-dot { width: 6px; height: 6px; border-radius: 50%; background: #4A7C7E; flex-shrink: 0; margin-top: 7px; }
        .pkg-item-text { flex: 1; }
        .pkg-item strong { display: block; color: #1A2A2E; font-size: 14px; margin-bottom: 2px; }
        .pkg-item span { color: rgba(26,42,46,0.45); font-size: 12px; line-height: 1.4; }
        .pkg-chevron { font-size: 16px; color: rgba(0,0,0,0.2); flex-shrink: 0; font-family: 'JetBrains Mono', monospace; margin-top: 2px; }
        .pkg-item-detail { margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(0,0,0,0.06); padding-left: 18px; }
        .pkg-item-detail p { color: rgba(26,42,46,0.6); font-size: 13px; line-height: 1.65; margin: 0; }
        .cta-btn {
          display: block; width: 100%; padding: 16px; background: #2C4A52; color: #fff; border: none;
          border-radius: 12px; font-family: 'JetBrains Mono', monospace; font-weight: 800;
          font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer;
          transition: 0.2s; text-align: center; text-decoration: none; box-sizing: border-box;
        }
        .cta-btn:hover { background: #3a6070; box-shadow: 0 6px 20px rgba(44,74,82,0.25); }

        .pkg-side { display: flex; flex-direction: column; gap: 14px; }
        .side-card {
          background: #fff; border: 1px solid rgba(0,0,0,0.08); border-radius: 16px;
          padding: 22px; cursor: pointer; transition: all 0.25s cubic-bezier(0.22,1,0.36,1);
          box-shadow: 0 1px 8px rgba(0,0,0,0.03);
        }
        .side-card:hover { border-color: rgba(74,124,126,0.3); box-shadow: 0 6px 20px rgba(0,0,0,0.07); transform: translateY(-2px); }
        .side-card-open { border-color: rgba(255,107,53,0.4); background: rgba(255,107,53,0.04); box-shadow: 0 6px 20px rgba(255,107,53,0.08); }
        .side-card-teal { border-color: rgba(74,124,126,0.18); }
        .side-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .side-card-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: #4A7C7E; }
        .side-card p { color: rgba(26,42,46,0.55); font-size: 13px; line-height: 1.65; margin: 0 0 10px; }
        .side-card p:last-child { margin-bottom: 0; }
        .side-card-detail { padding-top: 10px; border-top: 1px solid rgba(0,0,0,0.06); margin-top: 4px; }
        .side-card-flywheel { border-color: rgba(255,107,53,0.2); background: rgba(255,107,53,0.02); }
        .side-card-flywheel:hover { border-color: rgba(255,107,53,0.4); box-shadow: 0 6px 20px rgba(255,107,53,0.1); }
        .side-card-label-orange { color: #C05020; }
        .tool-card-drag { border-color: rgba(74,124,126,0.5) !important; background: rgba(74,124,126,0.03); box-shadow: 0 4px 24px rgba(74,124,126,0.15) !important; }

        .reasons-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
        .reason-card {
          background: #fff; border: 1px solid rgba(0,0,0,0.08); border-radius: 16px;
          padding: 26px; cursor: pointer; transition: all 0.25s cubic-bezier(0.22,1,0.36,1);
          box-shadow: 0 1px 8px rgba(0,0,0,0.03);
        }
        .reason-card:hover { border-color: rgba(74,124,126,0.3); box-shadow: 0 8px 24px rgba(0,0,0,0.07); transform: translateY(-2px); }
        .reason-expanded { border-color: rgba(74,124,126,0.4); background: rgba(74,124,126,0.02); }
        .reason-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .reason-num { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #4A7C7E; letter-spacing: 0.2em; }
        .reason-chevron { font-size: 16px; color: rgba(0,0,0,0.2); font-family: 'JetBrains Mono', monospace; }
        .reason-card h4 { font-size: 15px; font-weight: 700; color: #1A2A2E; margin-bottom: 8px; line-height: 1.35; }
        .reason-summary { color: rgba(26,42,46,0.5); font-size: 13px; line-height: 1.6; margin: 0; }
        .reason-detail { color: rgba(26,42,46,0.6); font-size: 13px; line-height: 1.65; margin: 14px 0 0; padding-top: 14px; border-top: 1px solid rgba(0,0,0,0.06); }

        .cta-section {
          text-align: center; padding: 100px 48px;
          background: rgba(44,74,82,0.04); border-top: 1px solid rgba(0,0,0,0.07);
        }
        .cta-inner { max-width: 520px; margin: 0 auto; }
        .cta-inner h2 { font-size: 46px; }
        .cta-inner p { color: rgba(26,42,46,0.5); font-size: 15px; line-height: 1.7; margin-bottom: 36px; }
        .cta-btn-lg {
          display: inline-block; padding: 18px 50px; background: #2C4A52; color: #fff;
          border: none; border-radius: 14px; font-family: 'JetBrains Mono', monospace;
          font-weight: 800; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase;
          cursor: pointer; transition: 0.2s; text-decoration: none;
        }
        .cta-btn-lg:hover { background: #3a6070; box-shadow: 0 8px 28px rgba(44,74,82,0.3); }
        .footer {
          text-align: center; padding: 32px; font-family: 'JetBrains Mono', monospace;
          font-size: 10px; color: rgba(0,0,0,0.16); letter-spacing: 0.1em;
          border-top: 1px solid rgba(0,0,0,0.07);
        }

        @media (max-width: 900px) {
          h1 { font-size: 36px; } h2 { font-size: 28px; }
          .top-nav { display: none; }
          .page { padding-top: 24px; }
          .section { padding: 60px 24px; }
          .hero { padding: 60px 24px 80px; }
          .pkg-grid, .reasons-grid { grid-template-columns: 1fr; }
          .clip-left { flex-wrap: wrap; }
          .clip-title { white-space: normal; }
          .cta-inner h2 { font-size: 32px; }
        }
      `}</style>
    </div>
  );
}