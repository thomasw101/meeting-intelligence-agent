import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';

export default function LiveryLive() {
  const [code, setCode] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const [horses, setHorses] = useState(20);
  const [adminHours, setAdminHours] = useState(10);
  const [hourlyWage, setHourlyWage] = useState(12);
  const [missedCharges, setMissedCharges] = useState(5);
  const [chargeValue, setChargeValue] = useState(15);

  useEffect(() => {
    setMounted(true);
    const saved = sessionStorage.getItem('ll_client_livery');
    if (saved === 'true') setUnlocked(true);
  }, []);

  const handleUnlock = () => {
    const correctCode = process.env.NEXT_PUBLIC_LIVERY_CODE || 'LIVERY2026';
    if (code.trim().toUpperCase() === correctCode.toUpperCase()) {
      sessionStorage.setItem('ll_client_livery', 'true');
      setUnlocked(true);
      setError('');
    } else {
      setError('Invalid access code.');
    }
  };

  const liveryliveAnnual = horses * 2 * 12;
  const adminSavingsValue = Math.round(adminHours * 0.6 * 12) * hourlyWage;
  const revenueRecovered = missedCharges * chargeValue * 12;
  const totalBenefit = adminSavingsValue + revenueRecovered;
  const roi = Math.round(((totalBenefit - liveryliveAnnual) / liveryliveAnnual) * 100);

  const roiEmbedCode = `<!-- LiveryLive ROI Calculator — built by LearnLab Studio -->
<div id="ll-roi-calc"></div>
<script>
(function(){
  var h=20,a=10,w=12,m=5,c=15;
  function calc(){
    var cost=h*2*12,adm=Math.round(a*0.6*12)*w,rev=m*c*12,tot=adm+rev,roi=Math.round(((tot-cost)/cost)*100);
    document.getElementById('ll-cost').textContent='£'+cost+'/yr';
    document.getElementById('ll-rev').textContent='+£'+rev+'/yr';
    document.getElementById('ll-adm').textContent='+£'+adm+'/yr';
    document.getElementById('ll-tot').textContent='£'+tot.toLocaleString();
    document.getElementById('ll-roi').textContent=roi+'%';
  }
  function sl(id,v,min,max,step,label,pre,suf){
    return '<div style="margin-bottom:22px"><div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="font-size:14px;color:#444">'+label+'</span><strong style="color:#0e9090">'+pre+v+suf+'</strong></div><input type="range" min="'+min+'" max="'+max+'" step="'+step+'" value="'+v+'" data-id="'+id+'" style="width:100%;accent-color:#0e9090;cursor:pointer"></div>';
  }
  document.getElementById('ll-roi-calc').innerHTML='<div style="font-family:system-ui,sans-serif;max-width:800px;margin:0 auto;background:#f8fafa;border-radius:20px;padding:44px;border:1px solid #d0e8e8"><h2 style="margin:0 0 6px;font-size:26px;color:#0a2a2a">What could your yard save?</h2><p style="margin:0 0 32px;color:#666;font-size:15px">Adjust the sliders to see your estimated annual benefit from LiveryLive.</p><div style="display:grid;grid-template-columns:1fr 300px;gap:40px;align-items:start"><div>'+sl('h','20','5','100','5','Horses on your yard','','')+sl('a','10','2','40','1','Weekly admin hours','','hrs')+sl('w','12','8','30','1','Hourly admin wage','£','')+sl('m','5','0','20','1','Missed charges per month','','')+sl('c','15','5','100','5','Average charge value','£','')+'</div><div><div style="background:#fff;border-radius:14px;padding:24px;border:1px solid #d0e8e8;margin-bottom:16px"><div style="font-size:11px;letter-spacing:0.12em;color:#999;margin-bottom:14px;text-transform:uppercase">Your yard at a glance</div><div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid #f0f0f0;font-size:14px"><span style="color:#666">LiveryLive cost</span><span id="ll-cost" style="font-weight:600;color:#333"></span></div><div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid #f0f0f0;font-size:14px"><span style="color:#666">Revenue recovered</span><span id="ll-rev" style="font-weight:600;color:#0e9090"></span></div><div style="display:flex;justify-content:space-between;padding:9px 0;font-size:14px"><span style="color:#666">Admin time value</span><span id="ll-adm" style="font-weight:600;color:#0e9090"></span></div></div><div style="background:#0e9090;border-radius:14px;padding:24px;text-align:center"><div style="font-size:10px;letter-spacing:0.15em;color:rgba(255,255,255,0.65);margin-bottom:8px;text-transform:uppercase">Total Annual Benefit</div><div id="ll-tot" style="font-size:44px;font-weight:800;color:#fff;line-height:1"></div><div style="font-size:12px;color:rgba(255,255,255,0.7);margin-top:8px">ROI: <span id="ll-roi" style="font-weight:700"></span></div></div></div></div></div>';
  calc();
  document.querySelectorAll('[data-id]').forEach(function(el){
    el.addEventListener('input',function(){
      var id=this.getAttribute('data-id'),v=parseInt(this.value);
      if(id==='h')h=v; if(id==='a')a=v; if(id==='w')w=v; if(id==='m')m=v; if(id==='c')c=v;
      calc();
    });
  });
})();
<\/script>`;

  const slides = [
    { label: 'Horse Profiles', desc: 'Feed, rugging, exercise, emergency contacts — every detail for every horse, visible to the whole team instantly.', icon: '🐴', color: '#0e9090' },
    { label: 'To-Do Lists', desc: 'Staff see exactly what needs doing, updated in real time. No whiteboards, no missed tasks.', icon: '✅', color: '#1a7a4a' },
    { label: 'Invoicing', desc: 'Missed charges? Gone. Every extra service logged and billed automatically.', icon: '💷', color: '#0e9090' },
    { label: 'Arena Booking', desc: 'New: liveries book the arena directly from the app. No back-and-forth, no double bookings.', icon: '🏇', color: '#7c3aed' },
  ];

  const particleScript = `
    (function(){
      var canvas = document.getElementById('ll-bg-canvas');
      if (!canvas) return;
      var ctx = canvas.getContext('2d');
      var particles = [];
      function resize(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
      resize();
      window.addEventListener('resize', resize);
      for(var i=0;i<90;i++){
        particles.push({
          x: Math.random()*window.innerWidth,
          y: Math.random()*window.innerHeight,
          r: Math.random()*2+0.4,
          dx: (Math.random()-0.5)*0.35,
          dy: (Math.random()-0.5)*0.35,
          o: Math.random()*0.4+0.08,
          c: Math.random()>0.5 ? '14,144,144' : '255,255,255'
        });
      }
      function draw(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        particles.forEach(function(p){
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
          ctx.fillStyle='rgba('+p.c+','+p.o+')'; ctx.fill();
          p.x+=p.dx; p.y+=p.dy;
          if(p.x<0||p.x>canvas.width) p.dx*=-1;
          if(p.y<0||p.y>canvas.height) p.dy*=-1;
        });
        requestAnimationFrame(draw);
      }
      draw();
    })();
  `;

  if (!mounted) return null;

  if (!unlocked) {
    return (
      <div className="gate-wrap">
        <canvas id="ll-bg-canvas" className="bg-canvas" />
        <div className="gate-card">
          <div className="ll-brand">LIVERY<span className="ll-brand-accent">LIVE</span></div>
          <div className="eyebrow">// CLIENT_PORTAL</div>
          <h1>Your proposal<br /><span className="hl">is ready.</span></h1>
          <p>Prepared exclusively for Livery Live by LearnLab Studio. Enter your access code to view.</p>
          <div className="field">
            <label>Access Code</label>
            <input
              value={code}
              onChange={e => { setCode(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleUnlock()}
              placeholder="ENTER CODE"
              autoComplete="off"
            />
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button className="btn-teal" onClick={handleUnlock}>View Proposal →</button>
        </div>
        <script dangerouslySetInnerHTML={{ __html: particleScript }} />
        <style jsx global>{`body { margin: 0; background: #0a1628; }`}</style>
        <style jsx>{`
          .gate-wrap {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            position: relative;
            background: linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #0a2020 100%);
          }
          .bg-canvas { position: fixed; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; }
          .gate-card {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(14,144,144,0.3);
            border-radius: 28px;
            padding: 56px;
            width: 100%;
            max-width: 460px;
            backdrop-filter: blur(20px);
            position: relative;
            z-index: 2;
            animation: fadeUp 0.7s ease-out;
          }
          .ll-brand { font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; letter-spacing: 0.25em; color: rgba(255,255,255,0.3); margin-bottom: 28px; }
          .ll-brand-accent { color: #0e9090; }
          .eyebrow { font-family: 'JetBrains Mono', monospace; color: #0e9090; font-size: 10px; letter-spacing: 0.2em; margin-bottom: 16px; display: block; }
          h1 { font-size: 40px; font-weight: 800; color: #fff; line-height: 1.1; margin-bottom: 16px; }
          .hl { color: #0e9090; }
          p { color: rgba(255,255,255,0.5); font-size: 14px; line-height: 1.6; margin-bottom: 32px; }
          .field { display: flex; flex-direction: column; margin-bottom: 14px; }
          label { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.15em; color: rgba(255,255,255,0.35); margin-bottom: 8px; text-transform: uppercase; }
          input { padding: 15px 18px; background: rgba(0,0,0,0.3); border: 1px solid rgba(14,144,144,0.3); color: #fff; border-radius: 12px; font-size: 14px; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.15em; outline: none; transition: 0.3s; }
          input:focus { border-color: #0e9090; background: rgba(0,0,0,0.5); }
          .error-msg { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #f87171; margin-bottom: 12px; letter-spacing: 0.05em; }
          .btn-teal { width: 100%; padding: 17px; background: #0e9090; color: #fff; border: none; border-radius: 12px; font-weight: 800; cursor: pointer; text-transform: uppercase; letter-spacing: 0.08em; font-size: 13px; transition: 0.3s; margin-top: 8px; }
          .btn-teal:hover { background: #0bb8b8; box-shadow: 0 0 25px rgba(14,144,144,0.5); transform: scale(1.02); }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="proposal-wrap">
      <canvas id="ll-bg-canvas" className="bg-canvas" />
      <div className="proposal">

        {/* HERO */}
        <section className="hero">
          <div className="inner">
            <div className="eyebrow teal">// PREPARED_EXCLUSIVELY_FOR · MARCH 2026</div>
            <h1>Livery <span className="hl-teal">Live.</span></h1>
            <p className="hero-sub">A content and growth strategy to put Livery Live in front of every yard owner in the UK.</p>
            <div className="hero-tags">
              <span className="htag">LearnLab Studio</span>
              <span className="htag">Confidential</span>
              <span className="htag">The Field Package</span>
            </div>
          </div>
        </section>

        {/* SITUATION */}
        <section className="section">
          <div className="inner">
            <div className="eyebrow teal">// THE_SITUATION</div>
            <h2>Great product.<br /><span className="hl-teal">Nobody knows it yet.</span></h2>
            <p className="lead">You've built something genuinely useful — yard managers are calling it a game changer, something they wish they'd found sooner. The product works. The testimonials prove it. The problem is the equestrian world still hasn't heard about it at scale.</p>
            <div className="three-grid">
              {[
                { icon: '📵', title: 'No content presence', body: 'No regular video, no social content engine, no reason for a yard owner scrolling Facebook on a Tuesday evening to stop and pay attention.' },
                { icon: '🔁', title: 'Rebrand incoming', body: "You're about to refresh the brand. This is the exact right moment to build content infrastructure that carries the new identity from day one." },
                { icon: '⏱️', title: 'The window is now', body: 'Arena booking is live. New features shipping. Every week without content is a week your competitors could close the gap.' },
              ].map((c, i) => (
                <div key={i} className="card">
                  <div className="card-icon">{c.icon}</div>
                  <h4>{c.title}</h4>
                  <p>{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FLYWHEEL */}
        <section className="section section-dark">
          <div className="inner">
            <div className="eyebrow teal">// THE_STRATEGY</div>
            <h2>One filming day.<br /><span className="hl-teal">Eight weeks of content.</span></h2>
            <p className="lead">Every yard visit extracts maximum value. Here's how it compounds.</p>
            <div className="flywheel">
              {[
                { n: '01', label: 'Full Production Day', desc: 'On-site at a real yard. Pro kit. 2–3 testimonials, founders content, app in use on real phones, cinematic b-roll.' },
                { n: '02', label: 'Hero Edits', desc: '2–3 polished 3–5 min films. Testimonials, brand films, product demos — the anchor content everything else clips from.' },
                { n: '03', label: '16x Short-Form', desc: 'Reels, TikTok, Facebook. Hook-led, platform-native. Engineered for reach and trial conversion.' },
                { n: '04', label: 'Static & Ad Creative', desc: 'Carousels, feature spotlights, social proof tiles, retargeting ads — all from one day of footage.' },
                { n: '05', label: 'New Sign-Ups', desc: 'Real yards. Real stories. The content builds trust that converts cold audiences into trial starts.', accent: true },
              ].map((s, i, arr) => (
                <div key={i} className="fw-wrap">
                  <div className={`fw-step ${s.accent ? 'fw-accent' : ''}`}>
                    <div className="fw-n">{s.n}</div>
                    <div className="fw-label">{s.label}</div>
                    <div className="fw-desc">{s.desc}</div>
                  </div>
                  {i < arr.length - 1 && <div className="fw-arrow">→</div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PACKAGE */}
        <section className="section">
          <div className="inner">
            <div className="eyebrow teal">// THE_PACKAGE</div>
            <h2>The Field.<br /><span className="hl-orange">£2,499<span style={{fontSize:'22px',fontWeight:400}}>/mo</span></span></h2>
            <p className="lead">One full production day per month on-site. Top-tier equipment. Multiple outputs. Every day compounds into a growing content library that works for you 24/7.</p>
            <div className="pkg-grid">
              <div className="pkg-main">
                <div className="pkg-tag">// MONTHLY_AUTHORITY</div>
                {[
                  { title: 'Monthly Deployment', desc: '1 full production day on-site. Pro camera, audio, lighting. Multiple locations and subjects in a single day.' },
                  { title: 'Master Asset Production', desc: '2–3 high-fidelity hero edits per month — testimonials, founder sits, product demos, whatever the month calls for.' },
                  { title: '16x Growth Clips', desc: 'Platform-native short-form cuts for Instagram, TikTok, Facebook. Engineered for reach and conversion.' },
                  { title: 'Static & Ad Creative', desc: 'Carousel posts, feature spotlights, social proof tiles, and ad creative variants every month.' },
                  { title: 'Transferable Days', desc: "Unused filming days roll over. If a month doesn't suit, bank it and double up the next." },
                  { title: 'Growth Advisory', desc: 'Monthly strategy session — what to film, which stories to tell, which features to push, how to deploy the content.' },
                ].map((item, i) => (
                  <div key={i} className="pkg-item">
                    <span className="pkg-dash">—</span>
                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.desc}</span>
                    </div>
                  </div>
                ))}
                <a href="mailto:tom@learnlabmedia.com" className="btn-orange">Book Deployment Call →</a>
              </div>
              <div className="pkg-side">
                <div className="side-card">
                  <div className="eyebrow teal" style={{marginBottom:'10px'}}>// WHY_ONCE_A_MONTH</div>
                  <p>Weekly content without monthly filming is impossible to sustain at quality. Monthly filming without a weekly plan wastes the footage. The Field solves both.</p>
                </div>
                <div className="side-card side-teal">
                  <div className="eyebrow teal" style={{marginBottom:'10px'}}>// WHAT_WE_FILM</div>
                  <ul className="film-list">
                    {['Yard owner testimonials','Founder & team sit-downs','App in use on real phones','Cinematic yard b-roll','Feature walkthroughs','Seasonal content hooks','Problem/solution narratives'].map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 90 DAYS */}
        <section className="section section-dark">
          <div className="inner">
            <div className="eyebrow teal">// THE_ROADMAP</div>
            <h2>First <span className="hl-teal">90 days.</span></h2>
            <p className="lead">A concrete plan so there's no ambiguity about what happens when we start.</p>
            <div className="three-grid">
              {[
                { month: 'Month 01', title: 'Foundation', items: ['Strategy session — identify best yards, strongest stories, key features to push','First filming day — founder story, 2 yard testimonials, app walkthrough','Hero edit: brand film + 2 testimonial cuts','16 short-form clips delivered and scheduled','Ad creative for trial conversion campaign','Social channels refreshed for new brand direction'] },
                { month: 'Month 02', title: 'Momentum', items: ['Second filming day — new yard, different region, different angle','Arena booking feature content push','Retargeting ads live — testimonial clips targeting site visitors','Carousel series: feature-by-feature app explainers','Review what\'s landing, what to double down on'] },
                { month: 'Month 03', title: 'Compounding', items: ['Third filming day — growing yard network, more story variety','Content library now 40+ assets deep','Paid social scaling — what converts gets budget behind it','Referral programme content if launched','Full quarterly review and strategy refresh'] },
              ].map((m, i) => (
                <div key={i} className="card">
                  <div className="rm-mo">{m.month}</div>
                  <h4>{m.title}</h4>
                  <ul className="rm-list">
                    {m.items.map((item, j) => <li key={j}>{item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CAROUSEL MOCKUP */}
        <section className="section">
          <div className="inner">
            <div className="eyebrow teal">// CONTENT_EXAMPLE</div>
            <h2>What the social<br /><span className="hl-teal">content looks like.</span></h2>
            <p className="lead">Each filming day produces carousel posts like this — clean, feature-led, built for the equestrian audience on Instagram.</p>
            <div className="carousel-demo">
              <div className="phone-frame">
                <div className="phone-notch" />
                <div className="phone-screen">
                  <div className="insta-header">
                    <div className="insta-av">LL</div>
                    <div>
                      <div className="insta-name">liverylive</div>
                      <div className="insta-sub">Sponsored</div>
                    </div>
                  </div>
                  <div className="slide-card" style={{borderTop:`3px solid ${slides[activeSlide].color}`}}>
                    <div className="slide-icon">{slides[activeSlide].icon}</div>
                    <div className="slide-tag" style={{color:slides[activeSlide].color}}>// FEATURE SPOTLIGHT</div>
                    <div className="slide-title">{slides[activeSlide].label}</div>
                    <div className="slide-desc">{slides[activeSlide].desc}</div>
                    <div className="slide-brand">LiveryLive App</div>
                  </div>
                  <div className="dots">
                    {slides.map((_, i) => (
                      <div key={i} className={`dot ${i === activeSlide ? 'dot-a' : ''}`} onClick={() => setActiveSlide(i)} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="carousel-info">
                <div className="eyebrow teal">// CAROUSEL_FORMAT</div>
                <h3>Feature Spotlight Posts</h3>
                <p>One post per feature. Each slide introduces a different capability — keeping liveries engaged and showing yard owners exactly what they're getting. Tap through to preview.</p>
                <div className="slide-btns">
                  {slides.map((s, i) => (
                    <button key={i} className={`slide-btn ${i === activeSlide ? 'slide-btn-a' : ''}`} onClick={() => setActiveSlide(i)}>{s.label}</button>
                  ))}
                </div>
                <p className="disclaimer">Placeholder mockup — real posts will use actual app screenshots and rebrand colours.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ROI */}
        <section className="section section-dark">
          <div className="inner">
            <div className="eyebrow teal">// GROWTH_TOOL</div>
            <h2>The ROI<br /><span className="hl-teal">Calculator.</span></h2>
            <p className="lead">We built this for you. Drop it on your pricing page and every prospective yard owner gets an instant, personalised business case for switching to Livery Live.</p>
            <div className="roi-widget">
              <div className="roi-inputs">
                {[
                  { label: 'Horses on your yard', val: horses, set: setHorses, min: 5, max: 100, step: 5, pre: '', suf: '' },
                  { label: 'Weekly admin hours', val: adminHours, set: setAdminHours, min: 2, max: 40, step: 1, pre: '', suf: ' hrs' },
                  { label: 'Hourly admin wage', val: hourlyWage, set: setHourlyWage, min: 8, max: 30, step: 1, pre: '£', suf: '' },
                  { label: 'Missed charges / month', val: missedCharges, set: setMissedCharges, min: 0, max: 20, step: 1, pre: '', suf: '' },
                  { label: 'Average charge value', val: chargeValue, set: setChargeValue, min: 5, max: 100, step: 5, pre: '£', suf: '' },
                ].map((f, i) => (
                  <div key={i} className="roi-field">
                    <div className="roi-fh">
                      <span>{f.label}</span>
                      <strong>{f.pre}{f.val}{f.suf}</strong>
                    </div>
                    <input type="range" min={f.min} max={f.max} step={f.step} value={f.val} onChange={e => f.set(Number(e.target.value))} className="roi-slider" />
                  </div>
                ))}
              </div>
              <div className="roi-results">
                <div className="roi-glance">
                  <div className="roi-glance-label">// YOUR_YARD_AT_A_GLANCE</div>
                  <div className="roi-row"><span>LiveryLive cost</span><span>£{liveryliveAnnual}/yr</span></div>
                  <div className="roi-row"><span>Revenue recovered</span><span className="green">+£{revenueRecovered}/yr</span></div>
                  <div className="roi-row"><span>Admin time value</span><span className="green">+£{adminSavingsValue}/yr</span></div>
                </div>
                <div className="roi-total">
                  <div className="roi-total-label">TOTAL ANNUAL BENEFIT</div>
                  <div className="roi-total-num">£{totalBenefit.toLocaleString()}</div>
                  <div className="roi-total-sub">ROI: {roi}%</div>
                </div>
              </div>
            </div>
            <div className="embed-box">
              <div className="embed-head">
                <div>
                  <div className="eyebrow teal" style={{margin:0}}>// FREE_TO_USE — THIS_IS_YOURS</div>
                  <p>Copy the code below and paste it anywhere on the Livery Live site. No dependencies, no account needed.</p>
                </div>
                <button className="copy-btn" onClick={() => { navigator.clipboard.writeText(roiEmbedCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                  {copied ? '✓ Copied' : 'Copy Code'}
                </button>
              </div>
              <pre className="code-pre"><code>{roiEmbedCode.slice(0, 340)}...</code></pre>
            </div>
          </div>
        </section>

        {/* ADVISORY */}
        <section className="section">
          <div className="inner">
            <div className="eyebrow teal">// BUSINESS_ADVISORY</div>
            <h2>Six recommendations<br /><span className="hl-teal">worth acting on.</span></h2>
            <p className="lead">Outside of content, there are quick wins on the product and commercial side that could meaningfully move the needle.</p>
            <div className="adv-grid">
              {[
                { n: '01', title: 'Cut the trial from 6 weeks to 2', body: "Six weeks is too long. People drift, forget why they signed up, and never properly commit. Two weeks is enough to feel the value — and it creates urgency. If the product is good (it is), the decision should come quickly.", tag: 'High Impact', feat: true },
                { n: '02', title: 'Capture card details at sign-up', body: "No charge until the trial ends — but ask for the card upfront. It filters out people who were never going to convert, and when they do convert it's frictionless. Standard SaaS practice. You're leaving conversions on the table without it.", tag: 'High Impact', feat: true },
                { n: '03', title: 'Launch a referral programme', body: 'Yard owners talk constantly — at shows, on forums, in WhatsApp groups. "Refer a yard, get one month free" is your cheapest possible acquisition channel and it doesn\'t exist yet.', tag: 'Quick Win', feat: false },
                { n: '04', title: 'Make arena booking its own moment', body: "This is a product expansion, not just a feature update. It deserves a launch video, dedicated posts, ads targeted at yards with arenas. It's currently barely visible.", tag: 'Quick Win', feat: false },
                { n: '05', title: 'Lead with the price in ads', body: '£2/month per horse is extraordinary value. A 30-horse yard pays £60/month. That number needs to be in ad headlines, not buried on a pricing page. Price transparency at this level is a conversion driver, not a deterrent.', tag: 'Ad Strategy', feat: false },
                { n: '06', title: 'Build a short onboarding video series', body: 'New yards that struggle in week one quietly cancel. Three short setup videos — getting started, adding your team, your first invoice — would reduce early churn and cut your support load.', tag: 'Retention', feat: false },
              ].map((a, i) => (
                <div key={i} className={`adv-card ${a.feat ? 'adv-feat' : ''}`}>
                  <div className="adv-n">{a.n}</div>
                  <h4>{a.title}</h4>
                  <p>{a.body}</p>
                  <span className="adv-tag">{a.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CREDENTIALS */}
        <section className="section section-dark">
          <div className="inner creds-inner">
            <div>
              <div className="eyebrow teal">// WHY_LEARNLAB</div>
              <h2>Real yards.<br /><span className="hl-teal">Real experience.</span></h2>
              <p>We specialise in content for agritech and rural businesses — businesses where trust is everything and authentic storytelling is the only thing that converts.</p>
              <p>The testimonial here was filmed on-farm for another agritech business in the UK. Same audience, same environment — real people, real locations, no studio polish.</p>
              <p>This is exactly the kind of content we'd create for Livery Live.</p>
            </div>
            <div>
              <div className="video-container">
                <iframe
                  src="https://player.vimeo.com/video/1164173070?badge=0&autopause=0&player_id=0&app_id=58479"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                  title="UK Farm Testimonial"
                  style={{position:'absolute',top:0,left:0,width:'100%',height:'100%'}}
                />
              </div>
              <div className="video-label">Real yards. Real results.</div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section cta-section">
          <div className="cta-inner">
            <div className="eyebrow teal">// NEXT_STEPS</div>
            <h2>Let's build this<br /><span className="hl-orange">together.</span></h2>
            <p>Whether you want to start with a single filming day or go straight into The Field — let's get on a call and make it happen.</p>
            <a href="mailto:tom@learnlabmedia.com" className="btn-orange-lg">Get In Touch →</a>
          </div>
        </section>

        <div className="footer-note">
          LearnLab Studio · learnlabmedia.com · Prepared for Livery Live · March 2026 · Confidential
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: particleScript }} />

      <style jsx global>{`body { margin: 0; background: #0a1628; }`}</style>
      <style jsx>{`
        .proposal-wrap { position: relative; min-height: 100vh; background: linear-gradient(160deg, #0a1628 0%, #0d1f35 40%, #0a1e1e 100%); }
        .bg-canvas { position: fixed; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; }
        .proposal { position: relative; z-index: 1; max-width: 100%; overflow-x: hidden; }

        .eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.2em; margin-bottom: 16px; display: block; text-transform: uppercase; }
        .teal { color: #0e9090; }
        h2 { font-size: 44px; font-weight: 800; color: #fff; line-height: 1.1; margin-bottom: 20px; }
        h3 { font-size: 26px; font-weight: 700; color: #fff; margin-bottom: 14px; }
        h4 { font-size: 17px; font-weight: 700; color: #fff; margin-bottom: 10px; }
        .hl-teal { color: #0e9090; }
        .hl-orange { color: #f97316; }
        .lead { color: rgba(255,255,255,0.55); font-size: 16px; line-height: 1.7; max-width: 660px; margin-bottom: 56px; }
        .section { padding: 100px 48px; }
        .section-dark { background: rgba(0,0,0,0.25); border-top: 1px solid rgba(14,144,144,0.12); border-bottom: 1px solid rgba(14,144,144,0.12); }
        .inner { max-width: 1100px; margin: 0 auto; }

        .hero { padding: 130px 48px 100px; animation: fadeUp 0.8s ease-out; }
        h1 { font-size: 80px; font-weight: 800; color: #fff; line-height: 1.0; margin-bottom: 24px; }
        .hero-sub { color: rgba(255,255,255,0.55); font-size: 20px; line-height: 1.6; max-width: 580px; margin-bottom: 36px; }
        .hero-tags { display: flex; gap: 10px; flex-wrap: wrap; }
        .htag { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.12em; padding: 6px 14px; border: 1px solid rgba(14,144,144,0.3); border-radius: 6px; color: rgba(255,255,255,0.35); }

        .three-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
        .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(14,144,144,0.2); border-radius: 20px; padding: 34px 28px; transition: 0.4s cubic-bezier(0.22,1,0.36,1); }
        .card:hover { transform: translateY(-6px); border-color: rgba(14,144,144,0.5); background: rgba(14,144,144,0.06); }
        .card-icon { font-size: 28px; margin-bottom: 16px; }
        .card p { color: rgba(255,255,255,0.5); font-size: 14px; line-height: 1.6; margin: 0; }
        .rm-mo { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #0e9090; letter-spacing: 0.2em; margin-bottom: 8px; }
        .rm-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 9px; }
        .rm-list li { color: rgba(255,255,255,0.5); font-size: 13px; line-height: 1.5; padding-left: 14px; position: relative; }
        .rm-list li::before { content: '·'; color: #0e9090; position: absolute; left: 0; font-size: 16px; line-height: 1.2; }

        .flywheel { display: flex; align-items: flex-start; overflow-x: auto; padding-bottom: 8px; gap: 0; }
        .fw-wrap { display: flex; align-items: flex-start; flex-shrink: 0; }
        .fw-step { background: rgba(255,255,255,0.04); border: 1px solid rgba(14,144,144,0.2); border-radius: 18px; padding: 26px 22px; width: 175px; transition: 0.3s; flex-shrink: 0; }
        .fw-step:hover { border-color: rgba(14,144,144,0.5); transform: translateY(-4px); }
        .fw-accent { border-color: rgba(249,115,22,0.4); background: rgba(249,115,22,0.06); }
        .fw-arrow { color: rgba(255,255,255,0.2); font-size: 18px; padding: 26px 8px 0; flex-shrink: 0; }
        .fw-n { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #0e9090; letter-spacing: 0.2em; margin-bottom: 10px; }
        .fw-label { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 8px; }
        .fw-desc { font-size: 12px; color: rgba(255,255,255,0.45); line-height: 1.5; }

        .pkg-grid { display: grid; grid-template-columns: 1fr 350px; gap: 26px; }
        .pkg-main { background: rgba(255,255,255,0.04); border: 1px solid rgba(249,115,22,0.35); border-radius: 24px; padding: 46px; }
        .pkg-tag { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #f97316; letter-spacing: 0.2em; margin-bottom: 30px; display: block; }
        .pkg-item { display: flex; gap: 14px; margin-bottom: 20px; }
        .pkg-dash { color: #f97316; font-weight: 700; flex-shrink: 0; margin-top: 2px; }
        .pkg-item strong { display: block; color: #fff; font-size: 15px; margin-bottom: 4px; }
        .pkg-item span { color: rgba(255,255,255,0.5); font-size: 14px; line-height: 1.5; }
        .btn-orange { display: block; width: 100%; padding: 16px; background: #f97316; color: #fff; border: none; border-radius: 12px; font-weight: 800; cursor: pointer; text-transform: uppercase; letter-spacing: 0.08em; font-size: 13px; transition: 0.3s; margin-top: 30px; text-align: center; text-decoration: none; box-sizing: border-box; }
        .btn-orange:hover { box-shadow: 0 0 28px rgba(249,115,22,0.5); transform: scale(1.02); }
        .pkg-side { display: flex; flex-direction: column; gap: 16px; }
        .side-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(14,144,144,0.2); border-radius: 18px; padding: 24px; }
        .side-card p { color: rgba(255,255,255,0.5); font-size: 14px; line-height: 1.6; margin: 0; }
        .side-teal { border-color: rgba(14,144,144,0.3); }
        .film-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 9px; }
        .film-list li { color: rgba(255,255,255,0.5); font-size: 14px; padding-left: 16px; position: relative; }
        .film-list li::before { content: '—'; color: #0e9090; position: absolute; left: 0; }

        .carousel-demo { display: grid; grid-template-columns: auto 1fr; gap: 56px; align-items: center; }
        .phone-frame { width: 228px; height: 456px; background: #111827; border-radius: 34px; border: 2px solid rgba(255,255,255,0.1); overflow: hidden; box-shadow: 0 28px 56px rgba(0,0,0,0.7); flex-shrink: 0; }
        .phone-notch { width: 54px; height: 7px; background: rgba(255,255,255,0.08); border-radius: 4px; margin: 10px auto 0; }
        .phone-screen { padding: 10px; height: calc(100% - 28px); display: flex; flex-direction: column; }
        .insta-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .insta-av { width: 26px; height: 26px; border-radius: 50%; background: linear-gradient(135deg, #0e9090, #f97316); display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 700; color: #fff; flex-shrink: 0; }
        .insta-name { font-size: 11px; font-weight: 700; color: #fff; }
        .insta-sub { font-size: 9px; color: rgba(255,255,255,0.35); }
        .slide-card { flex: 1; background: rgba(255,255,255,0.05); border-radius: 10px; padding: 14px; display: flex; flex-direction: column; transition: 0.3s; }
        .slide-icon { font-size: 26px; margin-bottom: 8px; }
        .slide-tag { font-family: 'JetBrains Mono', monospace; font-size: 7px; letter-spacing: 0.1em; margin-bottom: 6px; }
        .slide-title { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 6px; }
        .slide-desc { font-size: 10px; color: rgba(255,255,255,0.5); line-height: 1.4; flex: 1; }
        .slide-brand { font-family: 'JetBrains Mono', monospace; font-size: 7px; color: rgba(255,255,255,0.2); margin-top: 8px; letter-spacing: 0.1em; }
        .dots { display: flex; gap: 5px; justify-content: center; padding: 8px 0 4px; }
        .dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,0.2); cursor: pointer; transition: 0.2s; }
        .dot-a { background: #0e9090; width: 14px; border-radius: 3px; }
        .carousel-info p { color: rgba(255,255,255,0.5); font-size: 15px; line-height: 1.6; margin-bottom: 22px; }
        .slide-btns { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
        .slide-btn { padding: 7px 15px; background: rgba(255,255,255,0.04); border: 1px solid rgba(14,144,144,0.25); color: rgba(255,255,255,0.4); border-radius: 8px; font-size: 13px; cursor: pointer; transition: 0.2s; font-family: inherit; }
        .slide-btn:hover, .slide-btn-a { border-color: #0e9090; color: #0e9090; }
        .disclaimer { font-family: 'JetBrains Mono', monospace; font-size: 11px !important; color: rgba(255,255,255,0.18) !important; letter-spacing: 0.05em; }

        .roi-widget { display: grid; grid-template-columns: 1fr 310px; gap: 28px; background: rgba(255,255,255,0.04); border: 1px solid rgba(14,144,144,0.2); border-radius: 24px; padding: 42px; margin-bottom: 32px; }
        .roi-field { margin-bottom: 24px; }
        .roi-fh { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .roi-fh span { color: rgba(255,255,255,0.5); font-size: 14px; }
        .roi-fh strong { color: #fff; font-size: 14px; }
        .roi-slider { width: 100%; accent-color: #0e9090; cursor: pointer; }
        .roi-glance { margin-bottom: 18px; }
        .roi-glance-label { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: rgba(255,255,255,0.28); letter-spacing: 0.15em; margin-bottom: 14px; }
        .roi-row { display: flex; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 14px; }
        .roi-row span:first-child { color: rgba(255,255,255,0.45); }
        .roi-row span:last-child { color: #fff; font-weight: 600; }
        .green { color: #34d399 !important; }
        .roi-total { background: #0e9090; border-radius: 16px; padding: 24px; text-align: center; }
        .roi-total-label { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.15em; color: rgba(255,255,255,0.6); margin-bottom: 10px; }
        .roi-total-num { font-size: 44px; font-weight: 800; color: #fff; line-height: 1; margin-bottom: 8px; }
        .roi-total-sub { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: rgba(255,255,255,0.65); }

        .embed-box { background: rgba(0,0,0,0.3); border: 1px solid rgba(14,144,144,0.18); border-radius: 18px; overflow: hidden; }
        .embed-head { display: flex; justify-content: space-between; align-items: flex-start; padding: 26px 30px 18px; border-bottom: 1px solid rgba(255,255,255,0.05); gap: 20px; }
        .embed-head p { color: rgba(255,255,255,0.4); font-size: 14px; line-height: 1.5; margin: 10px 0 0; }
        .copy-btn { padding: 8px 18px; background: #0e9090; color: #fff; border: none; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; letter-spacing: 0.05em; white-space: nowrap; flex-shrink: 0; }
        .copy-btn:hover { box-shadow: 0 0 14px rgba(14,144,144,0.5); }
        .code-pre { margin: 0; padding: 22px 30px; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: rgba(14,144,144,0.65); line-height: 1.6; white-space: pre-wrap; word-break: break-all; overflow-x: auto; }

        .adv-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .adv-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(14,144,144,0.18); border-radius: 20px; padding: 32px 28px; transition: 0.3s; }
        .adv-card:hover { transform: translateY(-4px); border-color: rgba(14,144,144,0.4); }
        .adv-feat { border-color: rgba(249,115,22,0.35); background: rgba(249,115,22,0.04); }
        .adv-n { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #0e9090; letter-spacing: 0.2em; margin-bottom: 10px; }
        .adv-card p { color: rgba(255,255,255,0.5); font-size: 14px; line-height: 1.6; margin: 0 0 16px; }
        .adv-tag { display: inline-block; padding: 4px 12px; background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.3); color: #f97316; font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.1em; border-radius: 6px; }

        .creds-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; }
        .creds-inner p { color: rgba(255,255,255,0.5); font-size: 15px; line-height: 1.7; margin-bottom: 14px; }
        .video-container { position: relative; padding-top: 56.25%; border-radius: 16px; overflow: hidden; border: 1px solid rgba(14,144,144,0.2); }
        .video-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: rgba(255,255,255,0.18); letter-spacing: 0.12em; text-align: center; margin-top: 12px; }

        .cta-section { text-align: center; background: linear-gradient(135deg, rgba(14,144,144,0.08), rgba(249,115,22,0.06)); border-top: 1px solid rgba(14,144,144,0.15); }
        .cta-inner { max-width: 580px; margin: 0 auto; }
        .cta-inner h2 { font-size: 50px; }
        .cta-inner p { color: rgba(255,255,255,0.5); font-size: 16px; line-height: 1.7; margin-bottom: 38px; }
        .btn-orange-lg { display: inline-block; padding: 20px 52px; background: #f97316; color: #fff; border-radius: 14px; font-weight: 800; text-decoration: none; text-transform: uppercase; letter-spacing: 0.08em; font-size: 15px; transition: 0.3s; }
        .btn-orange-lg:hover { box-shadow: 0 0 32px rgba(249,115,22,0.55); transform: scale(1.03); }

        .footer-note { text-align: center; padding: 34px; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: rgba(255,255,255,0.1); letter-spacing: 0.1em; border-top: 1px solid rgba(14,144,144,0.1); }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 900px) {
          h1 { font-size: 50px; }
          h2 { font-size: 32px; }
          .three-grid { grid-template-columns: 1fr; }
          .flywheel { flex-direction: column; }
          .fw-arrow { transform: rotate(90deg); align-self: center; padding: 0; }
          .pkg-grid { grid-template-columns: 1fr; }
          .carousel-demo { grid-template-columns: 1fr; }
          .roi-widget { grid-template-columns: 1fr; }
          .adv-grid { grid-template-columns: 1fr; }
          .creds-inner { grid-template-columns: 1fr; }
          .section { padding: 60px 24px; }
          .hero { padding: 80px 24px 60px; }
          .cta-inner h2 { font-size: 36px; }
        }
      `}</style>
    </div>
  );
}