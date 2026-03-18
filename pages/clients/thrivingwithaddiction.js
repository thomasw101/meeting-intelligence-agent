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
  const canvasRef = useRef(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animFrameId;

    const resize = () => {
      canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.scrollHeight || document.body.scrollHeight;
    };
    resize();

    const particles = [];
    for (let i = 0; i < 55; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        size: Math.random() * 1.4 + 0.3,
        opacity: Math.random() * 0.10 + 0.03,
        warm: Math.random() > 0.6,
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
          : `rgba(80, 120, 140, ${p.opacity})`;
        ctx.fill();
      });
      animFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    animate();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameId);
    };
  }, [mounted]);

  const handleSubmit = async () => {
    if (!transcript.trim() || transcript.trim().length < 100) {
      setError('Please paste a full transcript before running.');
      return;
    }
    setError('');
    setClips([]);
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
    { title: 'Clip Schedule Per Episode', desc: '4 to 6 short-form clips pulled from every episode, built around the emotional hooks that stop scrolling. Timestamped, titled and ready to post.' },
    { title: 'Guest Authority Trailers', desc: 'A 60 to 90 second highlight reel for each guest before the episode drops — UFC highlights for Jared Gordon, career moments for media figures. Hooks the audience twice.' },
    { title: 'Platform-Native Edits', desc: 'Every clip formatted and optimised for Instagram Reels, YouTube Shorts and TikTok. Not the same file repurposed — edited specifically for each platform.' },
    { title: 'Caption and Title Writing', desc: 'Hook-led captions and titles written for each clip. The kind that make someone stop, watch, and share.' },
    { title: 'Consistent Posting Schedule', desc: 'Content going out every week across all platforms without you having to think about it.' },
    { title: 'Monthly Strategy Review', desc: 'Every month we look at what performed, what to double down on, and which upcoming guests have the most content potential.' },
    { title: 'Book Promotion Integration', desc: 'Every piece of content ties back to Thriving with Addiction. Clips drive listeners to the full episode, the full episode drives readers to the book.' },
  ];

  return (
    <div className="wrap">
      <canvas ref={canvasRef} className="bg-canvas" />

      <nav className="top-nav">
        <button className="back-btn" onClick={() => router.push('/')}>Back</button>
        <div className="nav-pills">
          <button className="nav-item" onClick={() => scrollTo('sec-tool')}>Clip Tool</button>
          <button className="nav-item" onClick={() => scrollTo('sec-package')}>The Package</button>
          <button className="nav-item" onClick={() => scrollTo('sec-advisory')}>Why Now</button>
          <a className="nav-cta" href="mailto:tom@learnlab.studio">Get in Touch</a>
        </div>
      </nav>

      <div className="page">

        <section className="hero">
          <div className="inner">
            <div className="eyebrow">Prepared for Dr. Jonathan Avery</div>
            <h1>Thriving with Addiction<br /><span className="hl">deserves a bigger audience.</span></h1>
            <p className="hero-sub">You have the credibility, the story, and the guests. This is the content infrastructure to make sure the right people find it.</p>
            <div className="hero-tags">
              <span className="tag">LearnLab Studio</span>
              <span className="tag">Confidential</span>
              <span className="tag">March 2026</span>
            </div>
          </div>
        </section>

        <section id="sec-tool" className="section">
          <div className="inner">
            <div className="eyebrow">Clip Suggestion Tool</div>
            <h2>Paste a transcript.<br /><span className="hl">Get your best clips instantly.</span></h2>
            <p className="lead">Drop in any episode transcript below and the tool will identify the five most powerful moments to cut as short-form content — with exact timestamps, a suggested title and a caption hook ready to use.</p>

            <div className="tool-card">
              <div className="tool-label">Episode Transcript</div>
              <textarea
                className="transcript-input"
                placeholder="Paste your full episode transcript here. Works best with timestamped transcripts exported from YouTube, Descript, or similar tools..."
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
                rows={12}
              />
              <div className="tool-footer">
                <span className="char-count">{transcript.length > 0 ? `${transcript.length.toLocaleString()} characters` : 'No transcript yet'}</span>
                <button
                  className={`run-btn ${loading ? 'loading' : ''}`}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Analysing transcript...' : 'Find Best Clips'}
                </button>
              </div>
              {error && <div className="error-msg">{error}</div>}
            </div>

            {loading && (
              <div className="loading-state">
                <div className="loading-dots">
                  <span /><span /><span />
                </div>
                <p>Reading through your transcript and finding the moments worth clipping...</p>
              </div>
            )}

            {clips.length > 0 && (
              <div className="clips-grid">
                {clips.map((clip, i) => (
                  <div key={i} className="clip-card">
                    <div className="clip-num">0{i + 1}</div>
                    <div className="clip-times">
                      <span className="time-badge">{clip.start_time}</span>
                      <span className="time-arrow">to</span>
                      <span className="time-badge">{clip.end_time}</span>
                    </div>
                    <h4 className="clip-title">{clip.title}</h4>
                    <div className="clip-section">
                      <div className="clip-section-label">Caption Hook</div>
                      <p className="clip-hook">{clip.hook}</p>
                      <button className="copy-btn" onClick={() => copy(clip.hook, `hook-${i}`)}>
                        {copied === `hook-${i}` ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="clip-section">
                      <div className="clip-section-label">Why This Works</div>
                      <p className="clip-reason">{clip.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="tool-note">
              <div className="tool-note-icon">💡</div>
              <div>
                <strong>How to use this</strong>
                <p>Take the timestamps, go into your video editor, cut the clip, and upload it with the suggested title. That is your minimum viable content strategy. If we were working together these would be fully edited, captioned, platform-optimised cuts — but even at this level, you are getting content out consistently.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="sec-package" className="section section-warm">
          <div className="inner">
            <div className="eyebrow">The Cloud Package</div>
            <h2>What it looks like<br /><span className="hl">when we do this properly.</span></h2>
            <p className="lead">The tool above is the floor. This is the ceiling — a full content infrastructure built around your podcast, running every week without you having to think about it.</p>

            <div className="pkg-grid">
              <div className="pkg-main">
                <div className="pkg-price-block">
                  <div className="pkg-price">£1,999<span className="pkg-per">/mo</span></div>
                  <div className="pkg-price-usd">approx. $2,670 USD at current rates</div>
                </div>
                <div className="pkg-divider" />
                <div className="pkg-items">
                  {deliverables.map((item, i) => (
                    <div key={i} className="pkg-item">
                      <div className="pkg-dot" />
                      <div>
                        <strong>{item.title}</strong>
                        <span>{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <a href="mailto:tom@learnlab.studio" className="cta-btn">
                  Get in Touch
                </a>
              </div>

              <div className="pkg-side">
                <div className="side-card">
                  <div className="side-card-label">The Guest Trailer Concept</div>
                  <p>Before each episode drops, we put out a 60 to 90 second cut built around your guest's world. UFC highlights for Jared Gordon. Career moments for a journalist or author. ESPN clips for Lauren Sisler.</p>
                  <p>It introduces the guest to your audience and introduces your podcast to theirs. The episode hasn't even dropped yet and you already have content out that their fans will share.</p>
                </div>
                <div className="side-card side-card-teal">
                  <div className="side-card-label">What This Does For the Book</div>
                  <p>Every clip drives people to the full episode. Every full episode drives people to Thriving with Addiction. The content becomes a discovery engine — new readers finding the book through a 60 second clip they saw on Instagram.</p>
                  <p>That is what a proper content strategy looks like for an author with a podcast.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="sec-advisory" className="section">
          <div className="inner">
            <div className="eyebrow">Why Now</div>
            <h2>The podcast is new.<br /><span className="hl">The window is open.</span></h2>
            <p className="lead">The hardest part of growing a podcast is the early stage — building the library, establishing the content rhythm, getting the algorithm working in your favour. Starting that system now, while the show is still finding its feet, is the right time.</p>

            <div className="reasons-grid">
              {[
                {
                  title: 'Your guests have audiences you aren\'t reaching',
                  body: 'Jared Gordon has fans who have never heard of Thriving with Addiction. A well-timed clip in front of his audience is a direct pipeline to new listeners. The same is true for every guest you book.',
                },
                {
                  title: 'The content is already there',
                  body: 'You don\'t need to change anything about how you record or who you talk to. The raw material is already exceptional. It just needs to be extracted, packaged and distributed consistently.',
                },
                {
                  title: 'Mental health content performs',
                  body: 'Honest, human conversations about addiction and recovery travel on social media. People share them because they see themselves or someone they love in the stories. That is organic reach you can\'t buy.',
                },
                {
                  title: 'The book needs a content engine',
                  body: 'A podcast without distribution is a book without a marketing plan. Building this system now means the book has a growing, engaged audience waiting for it by the time it lands.',
                },
              ].map((r, i) => (
                <div key={i} className="reason-card">
                  <div className="reason-num">0{i + 1}</div>
                  <h4>{r.title}</h4>
                  <p>{r.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-inner">
            <div className="eyebrow">Next Steps</div>
            <h2>Ready when<br /><span className="hl">you are.</span></h2>
            <p>Even if the budget isn't there right now, use the tool above for every episode. Get clips out. Get content moving. And when you're ready to hand it over, I'm here.</p>
            <a href="mailto:tom@learnlab.studio" className="cta-btn-lg">Get in Touch</a>
          </div>
        </section>

        <div className="footer">LearnLab Studio · learnlab.studio · Prepared for Dr. Jonathan Avery · March 2026</div>
      </div>

      <style jsx global>{`
        body { margin: 0; background: #F7F4EF; }
      `}</style>

      <style jsx>{`
        .wrap {
          position: relative;
          min-height: 100vh;
          background: #F7F4EF;
          font-family: 'JetBrains Mono', 'Courier New', monospace;
        }
        .bg-canvas {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          pointer-events: none;
          z-index: 0;
        }
        .page {
          position: relative;
          z-index: 1;
          padding-top: 80px;
        }

        .top-nav {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 200;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .back-btn {
          padding: 9px 16px;
          background: rgba(247, 244, 239, 0.92);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(0,0,0,0.10);
          border-radius: 999px;
          color: rgba(0,0,0,0.4);
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .back-btn:hover { color: #4A7C7E; border-color: rgba(74,124,126,0.4); }
        .nav-pills {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(247, 244, 239, 0.92);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(0,0,0,0.10);
          border-radius: 999px;
          padding: 6px 8px;
        }
        .nav-item {
          padding: 8px 14px;
          background: transparent;
          border: none;
          color: rgba(0,0,0,0.35);
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 999px;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .nav-item:hover { color: #4A7C7E; background: rgba(74,124,126,0.08); }
        .nav-cta {
          padding: 8px 18px;
          background: #2C4A52;
          border: none;
          color: #fff;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 700;
          cursor: pointer;
          border-radius: 999px;
          transition: all 0.2s;
          white-space: nowrap;
          text-decoration: none;
        }
        .nav-cta:hover { background: #3a6070; }

        .eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #4A7C7E;
          margin-bottom: 18px;
          display: block;
        }
        .section { padding: 100px 48px; }
        .section-warm {
          background: rgba(0,0,0,0.03);
          border-top: 1px solid rgba(0,0,0,0.07);
          border-bottom: 1px solid rgba(0,0,0,0.07);
        }
        .inner { max-width: 1100px; margin: 0 auto; }

        .hero { padding: 80px 48px 100px; }
        h1 {
          font-size: 58px;
          font-weight: 800;
          color: #1A2A2E;
          line-height: 1.08;
          margin-bottom: 24px;
          letter-spacing: -0.02em;
        }
        h2 {
          font-size: 42px;
          font-weight: 800;
          color: #1A2A2E;
          line-height: 1.1;
          margin-bottom: 20px;
          letter-spacing: -0.01em;
        }
        h4 {
          font-size: 16px;
          font-weight: 700;
          color: #1A2A2E;
          margin-bottom: 10px;
        }
        .hl { color: #4A7C7E; }
        .hero-sub {
          color: rgba(26,42,46,0.55);
          font-size: 17px;
          line-height: 1.7;
          max-width: 620px;
          margin-bottom: 36px;
        }
        .lead {
          color: rgba(26,42,46,0.55);
          font-size: 16px;
          line-height: 1.7;
          max-width: 680px;
          margin-bottom: 52px;
        }
        .hero-tags { display: flex; gap: 10px; flex-wrap: wrap; }
        .tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.12em;
          padding: 6px 14px;
          border: 1px solid rgba(0,0,0,0.12);
          border-radius: 6px;
          color: rgba(0,0,0,0.3);
        }

        .tool-card {
          background: #fff;
          border: 1px solid rgba(0,0,0,0.10);
          border-radius: 20px;
          padding: 32px;
          margin-bottom: 32px;
          box-shadow: 0 2px 20px rgba(0,0,0,0.05);
        }
        .tool-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.3);
          margin-bottom: 14px;
        }
        .transcript-input {
          width: 100%;
          padding: 18px;
          background: #F7F4EF;
          border: 1px solid rgba(0,0,0,0.10);
          border-radius: 12px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          color: #1A2A2E;
          line-height: 1.6;
          resize: vertical;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .transcript-input:focus { border-color: #4A7C7E; }
        .transcript-input::placeholder { color: rgba(0,0,0,0.25); }
        .tool-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
          gap: 16px;
        }
        .char-count {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: rgba(0,0,0,0.3);
          letter-spacing: 0.08em;
        }
        .run-btn {
          padding: 14px 32px;
          background: #2C4A52;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .run-btn:hover:not(:disabled) { background: #3a6070; box-shadow: 0 4px 16px rgba(44,74,82,0.3); }
        .run-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .run-btn.loading { opacity: 0.7; }
        .error-msg {
          margin-top: 14px;
          padding: 12px 16px;
          background: rgba(180,60,60,0.08);
          border: 1px solid rgba(180,60,60,0.2);
          border-radius: 8px;
          color: #a03030;
          font-size: 13px;
        }

        .loading-state {
          text-align: center;
          padding: 48px 0;
        }
        .loading-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 20px;
        }
        .loading-dots span {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #4A7C7E;
          animation: pulse 1.2s ease-in-out infinite;
        }
        .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
        .loading-state p {
          color: rgba(0,0,0,0.35);
          font-size: 13px;
          font-family: 'JetBrains Mono', monospace;
        }

        .clips-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 40px;
        }
        .clip-card {
          background: #fff;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 18px;
          padding: 32px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.04);
          transition: all 0.3s;
        }
        .clip-card:hover {
          border-color: rgba(74,124,126,0.3);
          box-shadow: 0 8px 28px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }
        .clip-num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: #4A7C7E;
          letter-spacing: 0.2em;
          margin-bottom: 12px;
        }
        .clip-times {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }
        .time-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 700;
          color: #2C4A52;
          background: #F0F5F5;
          padding: 5px 12px;
          border-radius: 6px;
          border: 1px solid rgba(74,124,126,0.2);
        }
        .time-arrow {
          font-size: 11px;
          color: rgba(0,0,0,0.25);
          font-family: 'JetBrains Mono', monospace;
        }
        .clip-title {
          font-size: 18px;
          font-weight: 700;
          color: #1A2A2E;
          margin-bottom: 20px;
          line-height: 1.3;
        }
        .clip-section {
          background: #F7F4EF;
          border-radius: 10px;
          padding: 16px 18px;
          margin-bottom: 12px;
          position: relative;
        }
        .clip-section:last-child { margin-bottom: 0; }
        .clip-section-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.3);
          margin-bottom: 8px;
        }
        .clip-hook {
          font-size: 15px;
          color: #1A2A2E;
          line-height: 1.5;
          margin: 0;
          padding-right: 60px;
        }
        .clip-reason {
          font-size: 13px;
          color: rgba(26,42,46,0.6);
          line-height: 1.5;
          margin: 0;
        }
        .copy-btn {
          position: absolute;
          top: 14px;
          right: 14px;
          padding: 5px 12px;
          background: #2C4A52;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: all 0.2s;
        }
        .copy-btn:hover { background: #3a6070; }

        .tool-note {
          display: flex;
          gap: 20px;
          background: rgba(74,124,126,0.06);
          border: 1px solid rgba(74,124,126,0.2);
          border-radius: 16px;
          padding: 28px;
          align-items: flex-start;
        }
        .tool-note-icon { font-size: 22px; flex-shrink: 0; margin-top: 2px; }
        .tool-note strong { display: block; color: #1A2A2E; font-size: 15px; margin-bottom: 8px; }
        .tool-note p { color: rgba(26,42,46,0.6); font-size: 14px; line-height: 1.6; margin: 0; }

        .pkg-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 28px;
          align-items: start;
        }
        .pkg-main {
          background: #fff;
          border: 1px solid rgba(0,0,0,0.10);
          border-radius: 24px;
          padding: 46px;
          box-shadow: 0 2px 20px rgba(0,0,0,0.04);
        }
        .pkg-price-block { margin-bottom: 28px; }
        .pkg-price {
          font-size: 58px;
          font-weight: 800;
          color: #1A2A2E;
          line-height: 1;
          letter-spacing: -0.02em;
        }
        .pkg-per {
          font-size: 22px;
          font-weight: 400;
          color: rgba(26,42,46,0.4);
        }
        .pkg-price-usd {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: rgba(26,42,46,0.35);
          margin-top: 6px;
          letter-spacing: 0.04em;
        }
        .pkg-divider {
          height: 1px;
          background: rgba(0,0,0,0.08);
          margin-bottom: 28px;
        }
        .pkg-items { display: flex; flex-direction: column; gap: 22px; margin-bottom: 36px; }
        .pkg-item { display: flex; gap: 14px; align-items: flex-start; }
        .pkg-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #4A7C7E;
          flex-shrink: 0;
          margin-top: 8px;
        }
        .pkg-item strong { display: block; color: #1A2A2E; font-size: 15px; margin-bottom: 4px; }
        .pkg-item span { color: rgba(26,42,46,0.5); font-size: 14px; line-height: 1.5; }
        .cta-btn {
          display: block;
          width: 100%;
          padding: 18px;
          background: #2C4A52;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 800;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: 0.2s;
          text-align: center;
          text-decoration: none;
          box-sizing: border-box;
        }
        .cta-btn:hover { background: #3a6070; box-shadow: 0 8px 24px rgba(44,74,82,0.3); }

        .pkg-side { display: flex; flex-direction: column; gap: 18px; }
        .side-card {
          background: #fff;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 18px;
          padding: 28px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.03);
        }
        .side-card-teal {
          border-color: rgba(74,124,126,0.25);
          background: rgba(74,124,126,0.04);
        }
        .side-card-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #4A7C7E;
          margin-bottom: 14px;
        }
        .side-card p {
          color: rgba(26,42,46,0.55);
          font-size: 14px;
          line-height: 1.65;
          margin: 0 0 12px;
        }
        .side-card p:last-child { margin-bottom: 0; }

        .reasons-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 22px;
        }
        .reason-card {
          background: #fff;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 18px;
          padding: 32px 28px;
          transition: 0.3s;
        }
        .reason-card:hover {
          border-color: rgba(74,124,126,0.3);
          transform: translateY(-4px);
          box-shadow: 0 10px 28px rgba(0,0,0,0.07);
        }
        .reason-num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: #4A7C7E;
          letter-spacing: 0.2em;
          margin-bottom: 12px;
        }
        .reason-card h4 { font-size: 16px; font-weight: 700; color: #1A2A2E; margin-bottom: 10px; }
        .reason-card p { color: rgba(26,42,46,0.55); font-size: 14px; line-height: 1.6; margin: 0; }

        .cta-section {
          text-align: center;
          padding: 100px 48px;
          background: rgba(44,74,82,0.04);
          border-top: 1px solid rgba(0,0,0,0.07);
        }
        .cta-inner { max-width: 520px; margin: 0 auto; }
        .cta-inner h2 { font-size: 48px; }
        .cta-inner p {
          color: rgba(26,42,46,0.5);
          font-size: 16px;
          line-height: 1.7;
          margin-bottom: 36px;
        }
        .cta-btn-lg {
          display: inline-block;
          padding: 20px 52px;
          background: #2C4A52;
          color: #fff;
          border: none;
          border-radius: 14px;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 800;
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: 0.2s;
          text-decoration: none;
        }
        .cta-btn-lg:hover { background: #3a6070; box-shadow: 0 8px 28px rgba(44,74,82,0.35); }

        .footer {
          text-align: center;
          padding: 32px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: rgba(0,0,0,0.18);
          letter-spacing: 0.1em;
          border-top: 1px solid rgba(0,0,0,0.07);
        }

        @media (max-width: 900px) {
          h1 { font-size: 38px; }
          h2 { font-size: 30px; }
          .top-nav { display: none; }
          .page { padding-top: 24px; }
          .section { padding: 60px 24px; }
          .hero { padding: 60px 24px 80px; }
          .pkg-grid, .reasons-grid { grid-template-columns: 1fr; }
          .cta-inner h2 { font-size: 34px; }
        }
      `}</style>
    </div>
  );
}