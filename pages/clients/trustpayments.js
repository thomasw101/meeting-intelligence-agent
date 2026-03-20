import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

export default function TrustPayments() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const canvasRef = useRef(null);

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

    for (let i = 0; i < 160; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 1.6 + 0.3,
        opacity: Math.random() * 0.12 + 0.03,
        green: Math.random() > 0.5,
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
        ctx.fillStyle = p.green
          ? `rgba(45, 180, 100, ${p.opacity})`
          : `rgba(200, 230, 210, ${p.opacity})`;
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
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
      }),
      { threshold: 0.06, rootMargin: '0px 0px -20px 0px' }
    );
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [mounted, expandedSection]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!mounted) return null;

  const deliverables = [
    { icon: '🎬', title: '1 Full Filming Day', desc: 'Monthly on-site studio filming session. Professional setup, lighting, direction. We come to you or arrange a professional London studio. Full day with Bal to batch content efficiently.' },
    { icon: '✂️', title: '4 Long-Form Edits', desc: 'Fully edited pieces each month — 3 to 8 minutes each. Dynamic captions, graphic overlays, data callouts, colour grade. Formatted for LinkedIn video and YouTube. The anchor authority pieces.' },
    { icon: '📱', title: '8 Short-Form Clips', desc: 'Punchy 30 to 90 second cuts pulled from long-form. Bold on-screen captions, formatted for LinkedIn, Instagram Reels and TikTok. High-frequency distribution touchpoints.' },
    { icon: '📋', title: 'Content Strategy & Planning', desc: 'Monthly content planning session. Topics aligned to the payments news cycle, Trust Payments product calendar, and Bal\'s business development goals. Nothing is random or generic.' },
    { icon: '🚀', title: 'Posting & Distribution', desc: 'We handle all posting across LinkedIn, Instagram and TikTok. Optimised captions, hashtags and posting times. Bal reviews and approves everything — we execute.' },
    { icon: '📊', title: 'Monthly Performance Report', desc: 'Clear monthly reporting — reach, engagement, follower growth, top performing content. Shared with both Bal and the Trust Payments team. Full transparency, always.' },
  ];

  const addons = [
    { title: 'Additional Filming Day', price: '£750/day', desc: 'A second monthly filming day — ideal for event coverage, guest interviews, or batching higher volume content around a product launch or key industry moment.' },
    { title: 'Guest & Podcast Format', price: '£500/ep', desc: 'Bring in a guest — a merchant, an industry peer, a fintech founder — for a structured conversation. We handle pre-production, filming, editing and distribution as a standalone episode.' },
    { title: 'Event Videography', price: 'POA', desc: 'Conference appearances, Trust Payments events, industry panels — captured and cut into compelling content. Speaker highlights, behind-the-scenes, social moments. Quoted per event.' },
    { title: 'Custom Motion Graphics', price: '£350/set', desc: 'Bespoke animated graphics — branded data visualisations, animated stat cards, intro/outro sequences. Aligned to Trust Payments brand guidelines for corporate approval.' },
    { title: 'LinkedIn Profile Optimisation', price: '£400 one-off', desc: 'Full audit and rewrite of Bal\'s LinkedIn profile — headline, about section, featured section, banner. Optimised for search visibility and positioned for thought leadership from day one.' },
    { title: 'Upgrade to Dominance', price: '£4,999/mo', desc: 'Two filming days, 20+ assets per month, full podcast production, paid media strategy and priority turnaround. The full authority engine, fully operated.' },
  ];

  const topics = [
    'Why merchants are still overpaying for card processing',
    'What stablecoins actually mean for UK businesses',
    'The Converged Commerce™ shift nobody is talking about',
    'Open banking: opportunity or overhype?',
    'Why SMEs get the worst payment deals',
    'Crypto settlement is coming — are businesses ready?',
    'The hidden cost of switching payment providers',
    'What 18 years in payments has taught me about merchant trust',
  ];

  const steps = [
    { n: '01', title: 'Confirm the Brief', desc: 'A 30-minute call with Bal and the relevant Trust Payments stakeholder to align on goals, brand guidelines and approval workflows.' },
    { n: '02', title: 'Sign & Onboard', desc: 'Simple one-page agreement. First month\'s retainer. We send a detailed onboarding doc covering everything needed to get started.' },
    { n: '03', title: 'First Filming Day', desc: 'Scheduled within two weeks of signing. We handle logistics and arrive with a content plan already built around Bal\'s schedule and topics.' },
    { n: '04', title: 'First Content Live', desc: 'First assets delivered within 5 working days of filming. Reviewed, approved and posted. Month one underway within 3 weeks of signing.' },
  ];

  return (
    <div className="wrap">
      <canvas ref={canvasRef} className="bg-canvas" />

      {/* NAV */}
      <nav className="top-nav">
        <button className="back-btn" onClick={() => router.push('/')}>← Back</button>
        <div className="nav-pills">
          <button className="nav-item" onClick={() => scrollTo('proposal')}>Proposal</button>
          <button className="nav-item" onClick={() => scrollTo('deliverables')}>Deliverables</button>
          <button className="nav-item" onClick={() => scrollTo('addons')}>Add-ons</button>
          <button className="nav-item" onClick={() => scrollTo('tool')}>AI Tool</button>
          <button className="nav-cta" onClick={() => scrollTo('next')}>Next Steps →</button>
        </div>
      </nav>

      <div className="page">

        {/* HERO */}
        <section className="hero">
          <div className="inner">
            <div className="eyebrow fade-up">// PRIVATE PROPOSAL · PREPARED FOR BALVINDER HELATE · MARCH 2026</div>
            <h1 className="fade-up">Building <span className="hl">Balvinder Helate</span> into the Defining Voice of UK Payments.</h1>
            <p className="hero-sub fade-up">A done-for-you content system that positions Bal as a genuine thought leader in payments and crypto — generating authority for her personal brand and qualified pipeline for Trust Payments.</p>
            <div className="hero-stats fade-up">
              <div className="stat-item">
                <span className="stat-num">£2,500</span>
                <span className="stat-label">Per Month</span>
              </div>
              <div className="stat-div" />
              <div className="stat-item">
                <span className="stat-num">Field</span>
                <span className="stat-label">Package</span>
              </div>
              <div className="stat-div" />
              <div className="stat-item">
                <span className="stat-num">Monthly</span>
                <span className="stat-label">Filming Day</span>
              </div>
              <div className="stat-div" />
              <div className="stat-item">
                <span className="stat-num">12+</span>
                <span className="stat-label">Assets / Month</span>
              </div>
            </div>
          </div>
        </section>

        {/* THE OPPORTUNITY */}
        <section id="proposal" className="section section-dark">
          <div className="inner">
            <div className="eyebrow fade-up">// THE OPPORTUNITY</div>
            <h2 className="fade-up">The payments space lacks credible, compelling voices.</h2>
            <div className="two-col fade-up">
              <div>
                <p>Trust Payments processes over £5bn annually across 20,000+ businesses. That scale, expertise and market position is a story that is not being told. The industry is full of companies talking at merchants — very few are leading with genuine education and authority.</p>
                <p>Balvinder has 18+ years in payments, deep expertise in merchant acquisition, and a growing interest in where crypto and blockchain intersect with commerce infrastructure. That combination — experience, credibility, forward-thinking — is exactly what B2B content audiences respond to.</p>
              </div>
              <div>
                <p>Every video, clip and post is a precision asset — designed to establish Bal as the go-to voice in UK payments, while creating a natural, non-salesy pipeline back into Trust Payments' commercial offering.</p>
                <p>We looked at the creators Bal referenced — Grant Evans, Justin Hanna, Dwayne Gefferie, Simon Kemp. They are winning on LinkedIn not because they have big budgets, but because they show up consistently with confident, clear points of view. We will build that, with better production.</p>
              </div>
            </div>

            <div className="dual-cards fade-up">
              <div className="dual-card">
                <div className="dual-icon">👤</div>
                <h4>Bal's Personal Brand</h4>
                <p>Establish her as a LinkedIn Top Voice in payments and crypto. Build a following of decision-makers, merchants and fintech operators who trust her perspective.</p>
                <ul>
                  <li>Thought leadership positioning</li>
                  <li>Consistent, high-quality presence</li>
                  <li>Speaking opportunities & inbound</li>
                  <li>Long-term career equity</li>
                </ul>
              </div>
              <div className="dual-card">
                <div className="dual-icon">🏢</div>
                <h4>Trust Payments Pipeline</h4>
                <p>Every piece of content is engineered to educate merchants on payment infrastructure — creating awareness and trust in Trust Payments' Converged Commerce™ offering.</p>
                <ul>
                  <li>Merchant education content</li>
                  <li>Soft lead generation</li>
                  <li>Brand visibility at scale</li>
                  <li>Corporate approval aligned</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENT APPROACH */}
        <section className="section">
          <div className="inner">
            <div className="eyebrow fade-up">// CONTENT APPROACH</div>
            <h2 className="fade-up">Professional. Data-led. Built for LinkedIn.</h2>
            <p className="lead fade-up">Based on the content styles Bal shared — studio talking head, podcast format, bold on-screen captions, dynamic graphic overlays, light B-roll. Authoritative but watchable. Not corporate fluff.</p>

            <div className="three-grid fade-up">
              <div className="card">
                <div className="card-num">01</div>
                <h4>Studio Talking Head</h4>
                <p>Bal to camera — confident, direct, expert. Clean professional studio setup with deliberate framing and lighting. The anchor format of the entire content system.</p>
              </div>
              <div className="card">
                <div className="card-num">02</div>
                <h4>Dynamic Overlays & Graphics</h4>
                <p>On-screen captions, animated data callouts, payment stat overlays, industry figures. Every video is visually rich — designed to retain attention and communicate authority simultaneously.</p>
              </div>
              <div className="card">
                <div className="card-num">03</div>
                <h4>Topic-Led Expertise</h4>
                <p>Content drawn from real industry movements — crypto in payments, POS evolution, merchant switching costs, open banking, fraud infrastructure. Bal's POV, not generic takes.</p>
              </div>
            </div>

            <div className="topics-block fade-up">
              <div className="topics-label">// EXAMPLE CONTENT TOPICS</div>
              <div className="topics-tags">
                {topics.map((t, i) => (
                  <span key={i} className="topic-tag">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* DELIVERABLES */}
        <section id="deliverables" className="section section-dark">
          <div className="inner">
            <div className="eyebrow fade-up">// THE FIELD PACKAGE · £2,500/MO</div>
            <h2 className="fade-up">What's included, every single month.</h2>

            <div className="del-grid fade-up">
              {deliverables.map((d, i) => (
                <div key={i} className="del-card">
                  <div className="del-icon">{d.icon}</div>
                  <h4>{d.title}</h4>
                  <p>{d.desc}</p>
                </div>
              ))}
            </div>

            <div className="not-included fade-up">
              <div className="ni-title">// NOT INCLUDED IN FIELD</div>
              <div className="ni-items">
                {['Paid media / sponsored content', 'Additional filming days', 'Podcast guest coordination', 'Motion graphics from scratch (templates only)', 'Website or landing page builds'].map((item, i) => (
                  <span key={i} className="ni-item">✕ {item}</span>
                ))}
              </div>
              <p className="ni-note">These are available as add-ons — see below.</p>
            </div>
          </div>
        </section>

        {/* ADD-ONS */}
        <section id="addons" className="section">
          <div className="inner">
            <div className="eyebrow fade-up">// ADD-ONS & UPGRADES</div>
            <h2 className="fade-up">Expand the engagement as you scale.</h2>
            <p className="lead fade-up">The Field package is the foundation. These add-ons can be bolted on at any point — no need to upgrade the whole package.</p>

            <div className="addons-grid fade-up">
              {addons.map((a, i) => (
                <div key={i} className="addon-card">
                  <div className="addon-header">
                    <h4>{a.title}</h4>
                    <span className="addon-price">{a.price}</span>
                  </div>
                  <p>{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="section section-dark">
          <div className="inner">
            <div className="eyebrow fade-up">// WHAT CLIENTS SAY</div>
            <h2 className="fade-up">We've done this before.</h2>
            <div className="test-grid fade-up">
              {[
                { initials: 'DH', quote: 'The quality of the content immediately stood out. Within weeks of posting I had people reaching out who said they\'d seen my videos — people I\'d been trying to get in front of for months.', name: 'Client Name', role: 'Founder, Industry' },
                { initials: 'SL', quote: 'Tom understood the dual brief immediately — content that builds my brand but also serves the business. That balance is hard to find. The system they\'ve built just works.', name: 'Client Name', role: 'Director, Sector' },
                { initials: 'RK', quote: 'The turnaround is fast, the quality is high, and they actually understand our industry. It doesn\'t feel like working with an agency — it feels like an extension of the team.', name: 'Client Name', role: 'CEO, Company' },
              ].map((t, i) => (
                <div key={i} className="test-card">
                  <p className="test-quote">"{t.quote}"</p>
                  <div className="test-author">
                    <div className="test-avatar">{t.initials}</div>
                    <div>
                      <div className="test-name">{t.name}</div>
                      <div className="test-role">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="test-note">* Testimonials to be populated with real client quotes before portal is shared.</p>
          </div>
        </section>

        {/* AI TOOL PLACEHOLDER */}
        <section id="tool" className="section">
          <div className="inner">
            <div className="eyebrow fade-up">// INTELLIGENCE TOOL</div>
            <h2 className="fade-up">Built specifically for Trust Payments.</h2>
            <p className="lead fade-up">A custom AI tool built exclusively for this proposal — a live demonstration of how LearnLab's technical capability extends beyond content production into genuine business intelligence.</p>
            <div className="tool-placeholder fade-up">
              <div className="tool-inner">
                <div className="tool-icon">⚡</div>
                <h3>Coming Shortly</h3>
                <p>This section will house a custom AI tool built specifically for Bal and Trust Payments. Launching shortly.</p>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING + NEXT STEPS */}
        <section id="next" className="section section-dark">
          <div className="inner">
            <div className="eyebrow fade-up">// INVESTMENT</div>
            <h2 className="fade-up">Simple, predictable, retainer-based.</h2>

            <div className="pricing-card fade-up">
              <div className="pricing-left">
                <div className="pricing-label">FIELD PACKAGE</div>
                <div className="pricing-price">£2,500<span className="pricing-per">/month</span></div>
                <div className="pricing-commit">Rolling monthly · 30 days notice to pause or cancel</div>
              </div>
              <div className="pricing-right">
                <div className="pricing-includes">Includes every month:</div>
                <ul className="pricing-list">
                  <li>✓ 1 full filming day</li>
                  <li>✓ 4 long-form edits with overlays & captions</li>
                  <li>✓ 8 short-form clips</li>
                  <li>✓ Monthly content strategy session</li>
                  <li>✓ Full posting & distribution management</li>
                  <li>✓ Monthly performance report</li>
                </ul>
              </div>
            </div>

            <div className="eyebrow fade-up" style={{marginTop:'56px'}}>// NEXT STEPS</div>
            <div className="steps-grid fade-up">
              {steps.map((s, i) => (
                <div key={i} className="step-card">
                  <div className="step-num">{s.n}</div>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>

            <div className="cta-block fade-up">
              <h3>Ready to build the UK's most credible payments voice?</h3>
              <p>Reach out directly to Tom Wallace to discuss next steps.</p>
              <div className="cta-btns">
                <a href="mailto:tom@learnlab.studio" className="cta-primary">Email Tom →</a>
                <a href="https://learnlab.studio/deployment" className="cta-secondary">Book a Call</a>
              </div>
            </div>
          </div>
        </section>

        <div className="footer">
          LearnLab Studio · learnlab.studio · Private & Confidential · Prepared for Balvinder Helate & Trust Payments · March 2026
        </div>

      </div>

      <style jsx global>{`
        body { margin: 0; background: #0A1F0F; }
        .fade-up { opacity: 0; transform: translateY(18px); transition: opacity 0.55s ease, transform 0.55s ease; will-change: opacity, transform; }
        .fade-up.visible { opacity: 1 !important; transform: translateY(0) !important; }
      `}</style>

      <style jsx>{`
        .wrap {
          position: relative;
          min-height: 100vh;
          background: #0A1F0F;
          font-family: 'JetBrains Mono', 'Courier New', monospace;
          color: #E0F0E5;
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

        /* NAV */
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
          background: rgba(10,31,15,0.92);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(45,180,100,0.2);
          border-radius: 999px;
          color: rgba(200,230,210,0.5);
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .back-btn:hover { color: #2DB464; border-color: rgba(45,180,100,0.5); }
        .nav-pills {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(10,31,15,0.92);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(45,180,100,0.25);
          border-radius: 999px;
          padding: 6px 8px;
        }
        .nav-item {
          padding: 8px 14px;
          background: transparent;
          border: none;
          color: rgba(200,230,210,0.4);
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 999px;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .nav-item:hover { color: #2DB464; background: rgba(45,180,100,0.08); }
        .nav-cta {
          padding: 8px 18px;
          background: #2DB464;
          border: none;
          color: #0A1F0F;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 700;
          cursor: pointer;
          border-radius: 999px;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .nav-cta:hover { background: #25A058; box-shadow: 0 0 16px rgba(45,180,100,0.4); }

        /* SECTIONS */
        .section { padding: 100px 48px; }
        .section-dark {
          background: rgba(0,0,0,0.25);
          border-top: 1px solid rgba(45,180,100,0.1);
          border-bottom: 1px solid rgba(45,180,100,0.1);
        }
        .inner { max-width: 1100px; margin: 0 auto; }

        /* TYPOGRAPHY */
        .eyebrow {
          font-size: 10px;
          letter-spacing: 0.2em;
          color: #2DB464;
          margin-bottom: 16px;
          display: block;
          text-transform: uppercase;
        }
        h1 {
          font-size: clamp(36px, 5vw, 62px);
          font-weight: 800;
          color: #fff;
          line-height: 1.08;
          margin-bottom: 24px;
          letter-spacing: -0.02em;
        }
        h2 {
          font-size: clamp(26px, 3.5vw, 42px);
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          margin-bottom: 20px;
          letter-spacing: -0.02em;
        }
        h3 {
          font-size: 22px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 12px;
        }
        h4 {
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 8px;
        }
        .hl { color: #2DB464; }
        .lead {
          color: rgba(200,230,210,0.55);
          font-size: 14px;
          line-height: 1.75;
          max-width: 680px;
          margin-bottom: 48px;
        }

        /* HERO */
        .hero { padding: 80px 48px 100px; }
        .hero-sub {
          color: rgba(200,230,210,0.55);
          font-size: 15px;
          line-height: 1.75;
          max-width: 680px;
          margin-bottom: 48px;
        }
        .hero-stats {
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(45,180,100,0.2);
          border-radius: 14px;
          overflow: hidden;
          max-width: 700px;
        }
        .stat-item {
          flex: 1;
          padding: 24px 20px;
          text-align: center;
        }
        .stat-num {
          display: block;
          font-size: 22px;
          font-weight: 800;
          color: #2DB464;
          margin-bottom: 4px;
        }
        .stat-label {
          display: block;
          font-size: 9px;
          letter-spacing: 0.12em;
          color: rgba(200,230,210,0.35);
          text-transform: uppercase;
        }
        .stat-div {
          width: 1px;
          height: 40px;
          background: rgba(45,180,100,0.15);
        }

        /* TWO COL */
        .two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          margin-bottom: 48px;
        }
        .two-col p {
          color: rgba(200,230,210,0.55);
          font-size: 13px;
          line-height: 1.8;
          margin-bottom: 16px;
        }

        /* DUAL CARDS */
        .dual-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .dual-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(45,180,100,0.18);
          border-radius: 16px;
          padding: 28px;
          transition: 0.3s;
        }
        .dual-card:hover {
          border-color: rgba(45,180,100,0.4);
          background: rgba(45,180,100,0.04);
          transform: translateY(-4px);
        }
        .dual-icon { font-size: 24px; margin-bottom: 12px; }
        .dual-card p {
          color: rgba(200,230,210,0.5);
          font-size: 13px;
          line-height: 1.7;
          margin-bottom: 16px;
        }
        .dual-card ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .dual-card ul li {
          font-size: 12px;
          color: rgba(200,230,210,0.45);
          padding-left: 14px;
          position: relative;
          line-height: 1.5;
        }
        .dual-card ul li::before {
          content: '·';
          color: #2DB464;
          position: absolute;
          left: 0;
          font-size: 16px;
          line-height: 1.2;
        }

        /* THREE GRID */
        .three-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }
        .card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(45,180,100,0.15);
          border-radius: 16px;
          padding: 28px;
          transition: 0.35s cubic-bezier(0.22,1,0.36,1);
        }
        .card:hover {
          border-color: rgba(45,180,100,0.4);
          background: rgba(45,180,100,0.05);
          transform: translateY(-5px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.3);
        }
        .card-num {
          font-size: 32px;
          font-weight: 800;
          color: rgba(45,180,100,0.15);
          margin-bottom: 14px;
          line-height: 1;
        }
        .card h4 { margin-bottom: 10px; }
        .card p {
          color: rgba(200,230,210,0.45);
          font-size: 12px;
          line-height: 1.7;
          margin: 0;
        }

        /* TOPICS */
        .topics-block {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(45,180,100,0.15);
          border-radius: 14px;
          padding: 24px 28px;
        }
        .topics-label {
          font-size: 9px;
          letter-spacing: 0.18em;
          color: rgba(200,230,210,0.3);
          margin-bottom: 16px;
        }
        .topics-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .topic-tag {
          padding: 6px 14px;
          background: rgba(45,180,100,0.08);
          border: 1px solid rgba(45,180,100,0.2);
          border-radius: 20px;
          font-size: 11px;
          color: #2DB464;
        }

        /* DELIVERABLES */
        .del-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-bottom: 28px;
        }
        .del-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(45,180,100,0.15);
          border-radius: 14px;
          padding: 24px;
          transition: 0.3s;
        }
        .del-card:hover {
          border-color: rgba(45,180,100,0.35);
          transform: translateY(-3px);
        }
        .del-icon { font-size: 22px; margin-bottom: 10px; }
        .del-card h4 { margin-bottom: 8px; }
        .del-card p {
          color: rgba(200,230,210,0.45);
          font-size: 12px;
          line-height: 1.7;
          margin: 0;
        }

        /* NOT INCLUDED */
        .not-included {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,80,80,0.12);
          border-radius: 12px;
          padding: 22px 26px;
        }
        .ni-title {
          font-size: 9px;
          letter-spacing: 0.15em;
          color: rgba(200,230,210,0.25);
          margin-bottom: 14px;
        }
        .ni-items {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 12px;
        }
        .ni-item {
          font-size: 11px;
          color: rgba(180,120,120,0.8);
          padding: 4px 12px;
          background: rgba(255,80,80,0.05);
          border: 1px solid rgba(255,80,80,0.1);
          border-radius: 20px;
        }
        .ni-note {
          font-size: 11px;
          color: rgba(200,230,210,0.25);
          margin: 0;
          font-style: italic;
        }

        /* ADD-ONS */
        .addons-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }
        .addon-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(45,180,100,0.15);
          border-radius: 14px;
          padding: 24px;
          transition: 0.3s;
        }
        .addon-card:hover {
          border-color: rgba(45,180,100,0.35);
          transform: translateY(-3px);
        }
        .addon-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 10px;
        }
        .addon-header h4 { margin: 0; line-height: 1.3; }
        .addon-price {
          font-size: 12px;
          font-weight: 700;
          color: #2DB464;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .addon-card p {
          color: rgba(200,230,210,0.45);
          font-size: 12px;
          line-height: 1.7;
          margin: 0;
        }

        /* TESTIMONIALS */
        .test-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-bottom: 14px;
        }
        .test-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(45,180,100,0.15);
          border-radius: 14px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .test-quote {
          font-size: 13px;
          color: rgba(200,230,210,0.55);
          line-height: 1.75;
          font-style: italic;
          margin: 0;
          flex: 1;
        }
        .test-author {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .test-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(45,180,100,0.1);
          border: 1px solid rgba(45,180,100,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          color: #2DB464;
          flex-shrink: 0;
        }
        .test-name {
          font-size: 12px;
          font-weight: 700;
          color: #fff;
        }
        .test-role {
          font-size: 11px;
          color: rgba(200,230,210,0.3);
        }
        .test-note {
          font-size: 11px;
          color: rgba(200,230,210,0.2);
          font-style: italic;
          margin: 0;
        }

        /* TOOL PLACEHOLDER */
        .tool-placeholder {
          border: 2px dashed rgba(45,180,100,0.2);
          border-radius: 16px;
          padding: 80px 40px;
          text-align: center;
        }
        .tool-inner {}
        .tool-icon { font-size: 44px; margin-bottom: 18px; }
        .tool-placeholder h3 { color: rgba(200,230,210,0.4); margin-bottom: 10px; }
        .tool-placeholder p {
          color: rgba(200,230,210,0.25);
          font-size: 13px;
          max-width: 380px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* PRICING */
        .pricing-card {
          display: flex;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(45,180,100,0.35);
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 16px;
        }
        .pricing-left {
          padding: 36px;
          border-right: 1px solid rgba(45,180,100,0.15);
          min-width: 240px;
        }
        .pricing-label {
          font-size: 9px;
          letter-spacing: 0.18em;
          color: #2DB464;
          margin-bottom: 10px;
        }
        .pricing-price {
          font-size: 44px;
          font-weight: 800;
          color: #fff;
          line-height: 1;
          margin-bottom: 10px;
        }
        .pricing-per {
          font-size: 18px;
          font-weight: 400;
          color: rgba(200,230,210,0.4);
        }
        .pricing-commit {
          font-size: 11px;
          color: rgba(200,230,210,0.3);
          line-height: 1.5;
        }
        .pricing-right { padding: 36px; flex: 1; }
        .pricing-includes {
          font-size: 9px;
          letter-spacing: 0.14em;
          color: rgba(200,230,210,0.25);
          margin-bottom: 14px;
        }
        .pricing-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .pricing-list li {
          font-size: 13px;
          color: rgba(200,230,210,0.6);
          line-height: 1.4;
        }

        /* STEPS */
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 48px;
        }
        .step-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(45,180,100,0.12);
          border-radius: 14px;
          padding: 22px;
        }
        .step-num {
          font-size: 26px;
          font-weight: 800;
          color: rgba(45,180,100,0.15);
          margin-bottom: 10px;
          line-height: 1;
        }
        .step-card h4 { margin-bottom: 8px; }
        .step-card p {
          color: rgba(200,230,210,0.4);
          font-size: 12px;
          line-height: 1.65;
          margin: 0;
        }

        /* CTA */
        .cta-block {
          background: rgba(45,180,100,0.05);
          border: 1px solid rgba(45,180,100,0.25);
          border-radius: 16px;
          padding: 44px;
          text-align: center;
        }
        .cta-block h3 {
          font-size: clamp(20px, 2.5vw, 28px);
          margin-bottom: 10px;
        }
        .cta-block p {
          color: rgba(200,230,210,0.45);
          font-size: 14px;
          margin-bottom: 26px;
        }
        .cta-btns {
          display: flex;
          gap: 14px;
          justify-content: center;
        }
        .cta-primary {
          padding: 14px 30px;
          background: #2DB464;
          color: #0A1F0F;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 0.06em;
          border-radius: 8px;
          text-decoration: none;
          transition: 0.2s;
        }
        .cta-primary:hover { background: #25A058; box-shadow: 0 0 20px rgba(45,180,100,0.4); }
        .cta-secondary {
          padding: 14px 30px;
          background: transparent;
          color: #2DB464;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 600;
          font-size: 12px;
          letter-spacing: 0.06em;
          border-radius: 8px;
          text-decoration: none;
          border: 1px solid rgba(45,180,100,0.25);
          transition: 0.2s;
        }
        .cta-secondary:hover { border-color: #2DB464; background: rgba(45,180,100,0.06); }

        /* FOOTER */
        .footer {
          text-align: center;
          padding: 32px;
          font-size: 10px;
          letter-spacing: 0.1em;
          color: rgba(200,230,210,0.12);
          border-top: 1px solid rgba(45,180,100,0.08);
        }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          h1 { font-size: 36px; }
          h2 { font-size: 28px; }
          .top-nav { display: none; }
          .page { padding-top: 24px; }
          .section { padding: 60px 24px; }
          .hero { padding: 60px 24px 80px; }
          .two-col, .dual-cards, .three-grid, .del-grid, .addons-grid, .test-grid { grid-template-columns: 1fr; }
          .steps-grid { grid-template-columns: 1fr 1fr; }
          .pricing-card { flex-direction: column; }
          .pricing-left { border-right: none; border-bottom: 1px solid rgba(45,180,100,0.15); }
          .hero-stats { max-width: 100%; }
        }
      `}</style>
    </div>
  );
}