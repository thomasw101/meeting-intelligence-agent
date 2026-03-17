import { useState, useEffect, useRef } from 'react';

export default function LiveryLive() {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [calendlyOpen, setCalendlyOpen] = useState(false);
  const canvasRef = useRef(null);

  // ROI state
  const [horses, setHorses] = useState(20);
  const [adminHours, setAdminHours] = useState(10);
  const [hourlyWage, setHourlyWage] = useState(12);
  const [missedCharges, setMissedCharges] = useState(5);
  const [avgCharge, setAvgCharge] = useState(15);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Particles in useEffect so they always fire
  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const particles = [];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 2 + 0.4,
        dx: (Math.random() - 0.5) * 0.35,
        dy: (Math.random() - 0.5) * 0.35,
        o: Math.random() * 0.4 + 0.08,
        c: Math.random() > 0.5 ? '14,144,144' : '255,255,255',
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.c},${p.o})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [mounted]);

  useEffect(() => {
    if (calendlyOpen) {
      const existing = document.getElementById('calendly-script');
      if (!existing) {
        const script = document.createElement('script');
        script.id = 'calendly-script';
        script.src = 'https://assets.calendly.com/assets/external/widget.js';
        script.async = true;
        document.head.appendChild(script);
      }
    }
  }, [calendlyOpen]);

  // Correct ROI formula matching the original tool
  const hoursSavedMonthly = Math.round(adminHours * 0.6 * 4.3);
  const revRecovered = missedCharges * avgCharge * 12;
  const appCost = horses * 2 * 12;
  const netBenefit = revRecovered - appCost;
  const timeSavingsValue = hoursSavedMonthly * hourlyWage * 12;
  const totalAnnualBenefit = netBenefit + timeSavingsValue;
  const roi = appCost > 0 ? Math.round((totalAnnualBenefit / appCost) * 100) : 0;

  const roiEmbedCode = `<!-- LiveryLive ROI Calculator — built by LearnLab Studio -->
<div id="ll-roi-calc"></div>
<script>
(function(){
  var h=20,a=10,w=12,m=5,c=15;
  function calc(){
    var hm=Math.round(a*0.6*4.3),rev=m*c*12,cost=h*2*12,net=rev-cost,tsv=hm*w*12,tot=net+tsv,roi=Math.round((tot/cost)*100);
    document.getElementById('ll-cost').textContent='£'+cost+'/yr';
    document.getElementById('ll-rev').textContent='+£'+rev+'/yr';
    document.getElementById('ll-adm').textContent='+£'+tsv+'/yr';
    document.getElementById('ll-tot').textContent='£'+tot.toLocaleString();
    document.getElementById('ll-roi').textContent=roi+'%';
  }
  function sl(id,v,min,max,step,label,pre,suf){
    return '<div style="margin-bottom:22px"><div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="font-size:14px;color:#444">'+label+'</span><strong style="color:#0e9090">'+pre+v+suf+'</strong></div><input type="range" min="'+min+'" max="'+max+'" step="'+step+'" value="'+v+'" data-id="'+id+'" style="width:100%;accent-color:#0e9090;cursor:pointer"></div>';
  }
  document.getElementById('ll-roi-calc').innerHTML='<div style="font-family:system-ui,sans-serif;max-width:800px;margin:0 auto;background:#f8fafa;border-radius:20px;padding:44px;border:1px solid #d0e8e8"><h2 style="margin:0 0 6px;font-size:26px;color:#0a2a2a">What could your yard save?</h2><p style="margin:0 0 32px;color:#666;font-size:15px">Adjust the sliders to see your estimated annual benefit from LiveryLive.</p><div style="display:grid;grid-template-columns:1fr 300px;gap:40px;align-items:start"><div>'+sl('h','20','5','100','5','Horses on your yard','','')+sl('a','10','2','40','1','Weekly admin hours','','hrs')+sl('w','12','8','30','1','Hourly admin wage','£','')+sl('m','5','0','20','1','Missed charges per month','','')+sl('c','15','5','50','5','Average charge value','£','')+'</div><div><div style="background:#fff;border-radius:14px;padding:24px;border:1px solid #d0e8e8;margin-bottom:16px"><div style="font-size:11px;letter-spacing:0.12em;color:#999;margin-bottom:14px;text-transform:uppercase">Your yard at a glance</div><div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid #f0f0f0;font-size:14px"><span style="color:#666">LiveryLive cost</span><span id="ll-cost" style="font-weight:600;color:#333"></span></div><div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid #f0f0f0;font-size:14px"><span style="color:#666">Revenue recovered</span><span id="ll-rev" style="font-weight:600;color:#0e9090"></span></div><div style="display:flex;justify-content:space-between;padding:9px 0;font-size:14px"><span style="color:#666">Admin time value</span><span id="ll-adm" style="font-weight:600;color:#0e9090"></span></div></div><div style="background:#0e9090;border-radius:14px;padding:24px;text-align:center"><div style="font-size:10px;letter-spacing:0.15em;color:rgba(255,255,255,0.65);margin-bottom:8px;text-transform:uppercase">Total Annual Benefit</div><div id="ll-tot" style="font-size:44px;font-weight:800;color:#fff;line-height:1"></div><div style="font-size:12px;color:rgba(255,255,255,0.7);margin-top:8px">ROI: <span id="ll-roi" style="font-weight:700"></span></div></div></div></div></div>';
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

  // Carousel slides using real app screenshots
  const slides = [
    {
      label: 'Horses',
      desc: 'Every horse on the yard in one place — photo, owner, stable number, feed chart, groups. The whole team always knows the full picture.',
      screenshot: '/app-screenshots/horses.png',
      color: '#0e9090',
      icon: '🐴',
      screenDesc: 'Horses screen — King, Jenny, Stable 1',
    },
    {
      label: 'To Do',
      desc: 'Daily task lists with date navigation. Staff see exactly what needs doing — Bring in, hay, feeding — no missed jobs.',
      screenshot: '/app-screenshots/todo.png',
      color: '#1a7a4a',
      icon: '✅',
      screenDesc: 'To Do — Wednesday 18 March',
    },
    {
      label: 'Messages',
      desc: '"Hi everyone, see your tasks for tomorrow?" — yard-wide communication in one thread. No WhatsApp chaos.',
      screenshot: '/app-screenshots/messages.png',
      color: '#2563eb',
      icon: '💬',
      screenDesc: 'Messages — Jenny, a few seconds ago',
    },
    {
      label: 'Yard Calendar',
      desc: 'Every yard event in one view. Pending events, upcoming bookings, staff schedules — all visible at a glance.',
      screenshot: '/app-screenshots/calendar.png',
      color: '#7c3aed',
      icon: '📅',
      screenDesc: 'Yard Calendar — March 2026',
    },
  ];

  if (!mounted) return null;

  return (
    <div className="proposal-wrap">
      <canvas ref={canvasRef} className="bg-canvas" />

      {/* CALENDLY MODAL */}
      {calendlyOpen && (
        <div className="cal-overlay" onClick={e => { if (e.target.classList.contains('cal-overlay')) setCalendlyOpen(false); }}>
          <div className="cal-modal">
            <button className="cal-close" onClick={() => setCalendlyOpen(false)}>✕</button>
            <div className="calendly-inline-widget" data-url="https://calendly.com/tom-learnlabmedia/30min" style={{minWidth:'320px', height:'650px'}} />
          </div>
        </div>
      )}

      <div className="proposal">

        {/* HERO */}
        <section className="hero">
          <div className="inner">
            <div className="eyebrow teal">// PREPARED_EXCLUSIVELY_FOR · MARCH 2026</div>
            <h1>Livery <span className="hl-teal">Live.</span></h1>
            <p className="hero-sub">A content and growth strategy to get Livery Live in front of yard owners across the UK and beyond.</p>
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
            <h2>The product is there.<br /><span className="hl-teal">Now it needs an audience.</span></h2>
            <p className="lead">Livery Live is already solving real problems for real yards — the testimonials on your site make that clear. The opportunity now is getting that story in front of the thousands of yard owners who haven't heard of you yet. That's where we come in.</p>
            <div className="three-grid equal-cards">
              <div className="card">
                <div className="card-icon">📵</div>
                <h4>Building from a low base</h4>
                <p>There's no consistent content engine yet — no video, no regular social presence. That's not a criticism, it's an opportunity. Starting fresh means we get to do it properly from day one.</p>
              </div>
              <div className="card">
                <div className="card-icon">🔁</div>
                <h4>Rebrand timing is perfect</h4>
                <p>A new brand identity without content to carry it is a missed moment. Build the content infrastructure now and the rebrand lands with real momentum behind it.</p>
              </div>
              <div className="card">
                <div className="card-icon">⏱️</div>
                <h4>The market is moving</h4>
                <p>Arena booking is live. The product is expanding. This is exactly the right time to start telling that story loudly — before someone else fills that space.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FLYWHEEL */}
        <section className="section section-dark">
          <div className="inner">
            <div className="eyebrow teal">// THE_STRATEGY</div>
            <h2>One filming day.<br /><span className="hl-teal">Eight weeks of content.</span></h2>
            <p className="lead">Every yard visit extracts maximum value. One serious day of filming produces enough material to keep Livery Live's channels active for two months.</p>
            <div className="flywheel">
              {[
                { n: '01', label: 'Full Production Day', desc: 'On-site at a real yard with professional kit. Testimonials, founder content, app being used on real phones, cinematic b-roll.' },
                { n: '02', label: 'Hero Edits', desc: 'Polished finished films — starting with yard owner testimonials and a founder message to kick off the marketing properly.' },
                { n: '03', label: '16x Short-Form', desc: 'Platform-native cuts for Instagram, TikTok and Facebook. Hook-led, built to stop the scroll and drive trial sign-ups.' },
                { n: '04', label: 'Static & Ad Creative', desc: 'Carousel posts, feature spotlights, social proof tiles and ad creative — all from the same day of footage.' },
                { n: '05', label: 'New Sign-Ups', desc: 'Real yards, real stories, real results. Content that builds trust and turns a cold audience into paying customers.', accent: true },
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
            <p className="lead">One full production day per month, on-site at a real yard. Professional equipment, proper editing, a complete content system. I cover my own travel expenses across the UK — you just need to open the gate.</p>
            <div className="pkg-grid">
              <div className="pkg-main">
                <div className="pkg-tag">// MONTHLY_AUTHORITY</div>
                <div className="pkg-items">
                  {[
                    { title: 'Monthly Production Day', desc: 'I come to you. One full day on-site with professional camera, audio and lighting. Multiple subjects and locations in a single visit.' },
                    { title: 'Hero Video Edits', desc: 'High-quality finished films each month — starting with yard owner testimonials and a founder message to properly launch the content.' },
                    { title: '16 Growth Clips', desc: 'Short-form cuts for Instagram, TikTok and Facebook. Built to perform on each platform, not just repurposed from the same file.' },
                    { title: 'Static & Ad Creative', desc: 'Carousel posts, feature spotlights and ad creative variations delivered alongside the video content each month.' },
                    { title: 'Days Roll Over', desc: "If a month doesn't work logistically, the day banks and we double up the following month. Nothing is wasted." },
                    { title: 'Monthly Analytics Review', desc: "Every month we look at what's working — what's getting reach, what's converting, what to double down on. You always know where things stand." },
                    { title: 'Growth Strategy Session', desc: 'A monthly call to plan the next filming day — which yards to visit, which stories to tell, which features to push.' },
                    { title: 'Travel Covered', desc: 'I cover my own travel expenses across the UK. Willing to go wherever the best stories are.' },
                  ].map((item, i) => (
                    <div key={i} className="pkg-item">
                      <div className="pkg-dot" />
                      <div>
                        <strong>{item.title}</strong>
                        <span>{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn-orange" onClick={() => setCalendlyOpen(true)}>
                  Book a Call — I'll Send Over a Proposed Time
                </button>
              </div>
              <div className="pkg-side">
                <div className="side-card">
                  <div className="eyebrow teal" style={{marginBottom:'10px'}}>// WHY_ONCE_A_MONTH</div>
                  <p>Weekly content without a monthly filming day is impossible to sustain at any real quality. A filming day without a content plan wastes half the footage. The Field connects both ends of that problem.</p>
                </div>
                <div className="side-card side-teal">
                  <div className="eyebrow teal" style={{marginBottom:'10px'}}>// WHAT_WE_FILM</div>
                  <ul className="film-list">
                    {['Yard owner testimonials','Founder and team interviews','The app being used on real phones','Cinematic b-roll of yard life','Feature walkthroughs and demos','Seasonal content and timely hooks','Problem-led narrative pieces'].map((item, i) => <li key={i}>{item}</li>)}
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
            <p className="lead">Here's exactly what the first three months look like so there's no ambiguity about where we start or where we're heading.</p>
            <div className="three-grid equal-cards">
              {[
                { month: 'Month 01', title: 'Foundation', items: ['Strategy session — strongest yards, stories and features to lead with','First filming day — founder message, yard testimonials, app walkthrough','Testimonial hero edits and founder film delivered','16 short-form clips scheduled across all channels','Ad creative built for trial conversion','Social channels refreshed for the rebrand direction','First monthly analytics review'] },
                { month: 'Month 02', title: 'Momentum', items: ['Second filming day at a new yard in the UK','Dedicated content push around arena booking','Retargeting ads live — testimonial clips targeting site visitors','Carousel series: one feature per post','Monthly analytics review — what\'s landing, what to adjust'] },
                { month: 'Month 03', title: 'Compounding', items: ['Third filming day — content library growing','40+ assets in the library','Paid social scaling — budget behind what\'s proven to convert','Referral programme content if launched','Full quarterly review and strategy refresh'] },
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
            <p className="lead">Feature spotlight carousels pull directly from real app screens — showing yard owners exactly what they're getting before they sign up. Tap through the slides.</p>
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
                    <div className="slide-screen-desc">{slides[activeSlide].screenDesc}</div>
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
                <div className="eyebrow teal">// REAL_APP_SCREENS</div>
                <h3>Feature Spotlight Posts</h3>
                <p>Each slide uses real screenshots from the Livery Live app — horses, tasks, messages, calendar. No mockups, no fake screens. The content shows exactly what yard owners get when they sign up.</p>
                <div className="slide-btns">
                  {slides.map((s, i) => (
                    <button key={i} className={`slide-btn ${i === activeSlide ? 'slide-btn-a' : ''}`} onClick={() => setActiveSlide(i)}>{s.label}</button>
                  ))}
                </div>
                <p className="disclaimer">Real carousels will be designed using the rebrand visual identity once that's ready.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ROI CALCULATOR */}
        <section className="section section-dark roi-section">
          <div className="inner">
            <div className="eyebrow teal">// GROWTH_TOOL</div>
            <h2>The ROI<br /><span className="hl-teal">Calculator.</span></h2>
            <p className="lead">Built this specifically for Livery Live. Drop it on your pricing page and every prospective yard owner gets an instant, personalised reason to switch.</p>
            <div className="roi-widget">
              <div className="roi-inputs">
                {[
                  { label: 'Horses on your yard', val: horses, set: setHorses, min: 5, max: 100, step: 5, pre: '', suf: '' },
                  { label: 'Weekly admin hours', val: adminHours, set: setAdminHours, min: 1, max: 40, step: 1, pre: '', suf: ' hrs' },
                  { label: 'Hourly admin wage', val: hourlyWage, set: setHourlyWage, min: 8, max: 30, step: 1, pre: '£', suf: '' },
                  { label: 'Missed charges per month', val: missedCharges, set: setMissedCharges, min: 0, max: 30, step: 1, pre: '', suf: '' },
                  { label: 'Average charge value', val: avgCharge, set: setAvgCharge, min: 5, max: 50, step: 5, pre: '£', suf: '' },
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
                  <div className="roi-row"><span>LiveryLive cost</span><span>£{appCost}/yr</span></div>
                  <div className="roi-row"><span>Revenue recovered</span><span className="green">+£{revRecovered}/yr</span></div>
                  <div className="roi-row"><span>Admin time value</span><span className="green">+£{timeSavingsValue}/yr</span></div>
                  <div className="roi-row"><span>Admin hrs saved</span><span className="green">{hoursSavedMonthly} hrs/mo</span></div>
                </div>
                <div className="roi-total">
                  <div className="roi-total-label">TOTAL ANNUAL BENEFIT</div>
                  <div className="roi-total-num">£{totalAnnualBenefit.toLocaleString()}</div>
                  <div className="roi-total-sub">ROI: {roi}%</div>
                </div>
              </div>
            </div>
            <div className="embed-box">
              <div className="embed-head">
                <div>
                  <div className="eyebrow teal" style={{margin:0}}>// FREE_TO_USE — THIS_IS_YOURS</div>
                  <p>Copy the snippet below and paste it anywhere on the Livery Live site. No dependencies, no third-party accounts needed.</p>
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
            <h2>Six things worth<br /><span className="hl-teal">looking at.</span></h2>
            <p className="lead">Separate from the content work, there are a few commercial and product moves that could meaningfully improve conversion and retention without a huge amount of effort.</p>
            <div className="adv-grid equal-cards">
              {[
                { n: '01', title: 'Shorten the trial to two weeks', body: "Six weeks gives people too much room to drift. They sign up, get busy, forget about it, and quietly disappear. Two weeks keeps the momentum from the sign-up decision — and if the product is good, which it clearly is, two weeks is more than enough to feel the value.", tag: 'High Impact', feat: true },
                { n: '02', title: 'Take card details upfront', body: "No charge until the trial ends, but capture the card at sign-up. It filters out the people who were never going to convert anyway, and for the ones who do convert, there's no friction — it just happens. Every SaaS that grows past a certain point does this.", tag: 'High Impact', feat: true },
                { n: '03', title: 'Build a referral programme', body: "Yard owners are a tight-knit community. They talk at shows, in WhatsApp groups, on forums. A simple referral mechanic — refer a yard, get a free month — would tap into that network properly. It doesn't exist yet and it should.", tag: 'Quick Win', feat: false },
                { n: '04', title: 'Give arena booking its own launch moment', body: "This is more than a feature update — it's a new use case. It deserves its own content push, its own announcement, its own ad campaign. Right now it's a line on the nav. It could be a reason someone switches.", tag: 'Quick Win', feat: false },
                { n: '05', title: 'Put the price front and centre in ads', body: "£2 per horse per month is an extraordinary deal. A yard with 30 horses pays £60 a month. That number should be in the headline of every ad you run, not buried three clicks deep. Transparency at that price level is a conversion tool, not a liability.", tag: 'Ad Strategy', feat: false },
                { n: '06', title: 'A short onboarding video series', body: "New yards that can't figure out the basics in week one quietly cancel and never come back. Three short videos — getting set up, adding your team, sending your first invoice — would cut early churn and reduce the support load at the same time.", tag: 'Retention', feat: false },
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
              <h2>We know this<br /><span className="hl-teal">world.</span></h2>
              <p>The content that works for rural and agricultural businesses isn't the same as what works for a tech startup. It needs to feel real — real people, real places, real problems being solved.</p>
              <p>The film below was shot on-farm for another agritech company in the UK. Same audience, same approach — go to where the story is, film it properly, let the people speak for themselves.</p>
              <p>That's exactly what we'd bring to Livery Live, wherever the best yards are.</p>
            </div>
            <div>
              <div className="video-container">
                <iframe src="https://player.vimeo.com/video/1164173070?badge=0&autopause=0&player_id=0&app_id=58479" frameBorder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" title="UK Farm Testimonial" style={{position:'absolute',top:0,left:0,width:'100%',height:'100%'}} />
              </div>
              <div className="video-label">Filmed on-farm, UK. Agritech testimonial.</div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section cta-section">
          <div className="cta-inner">
            <div className="eyebrow teal">// NEXT_STEPS</div>
            <h2>Ready when<br /><span className="hl-orange">you are.</span></h2>
            <p>I'll be in touch shortly with a proposed time to run through this together. If you want to get something in the diary sooner, book directly below.</p>
            <button className="btn-orange-lg" onClick={() => setCalendlyOpen(true)}>Book a Call →</button>
          </div>
        </section>

        <div className="footer-note">
          LearnLab Studio · learnlabmedia.com · Prepared for Livery Live · March 2026 · Confidential
        </div>
      </div>

      <style jsx global>{`
        body { margin: 0; background: #0a1628; }
        .roi-section * { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='80'%3E🐴%3C/text%3E%3C/svg%3E") 16 16, auto !important; }
        .cal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px); }
        .cal-modal { background: #fff; border-radius: 20px; width: 100%; max-width: 700px; position: relative; overflow: hidden; animation: slideUp 0.3s ease-out; }
        .cal-close { position: absolute; top: 16px; right: 16px; background: rgba(0,0,0,0.1); border: none; border-radius: 50%; width: 32px; height: 32px; font-size: 14px; cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .cal-close:hover { background: rgba(0,0,0,0.2); }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

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
        .lead { color: rgba(255,255,255,0.55); font-size: 16px; line-height: 1.7; max-width: 680px; margin-bottom: 56px; }
        .section { padding: 100px 48px; }
        .section-dark { background: rgba(0,0,0,0.25); border-top: 1px solid rgba(14,144,144,0.12); border-bottom: 1px solid rgba(14,144,144,0.12); }
        .inner { max-width: 1100px; margin: 0 auto; }

        .hero { padding: 130px 48px 100px; animation: fadeUp 0.8s ease-out; }
        h1 { font-size: 80px; font-weight: 800; color: #fff; line-height: 1.0; margin-bottom: 24px; }
        .hero-sub { color: rgba(255,255,255,0.55); font-size: 20px; line-height: 1.6; max-width: 580px; margin-bottom: 36px; }
        .hero-tags { display: flex; gap: 10px; flex-wrap: wrap; }
        .htag { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.12em; padding: 6px 14px; border: 1px solid rgba(14,144,144,0.3); border-radius: 6px; color: rgba(255,255,255,0.35); }

        .three-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
        .equal-cards { align-items: stretch; }
        .equal-cards .card, .equal-cards .adv-card { display: flex; flex-direction: column; }
        .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(14,144,144,0.2); border-radius: 20px; padding: 34px 28px; transition: 0.4s cubic-bezier(0.22,1,0.36,1); }
        .card:hover { transform: translateY(-6px); border-color: rgba(14,144,144,0.5); background: rgba(14,144,144,0.06); }
        .card-icon { font-size: 28px; margin-bottom: 16px; }
        .card p { color: rgba(255,255,255,0.5); font-size: 14px; line-height: 1.6; margin: 0; flex: 1; }
        .rm-mo { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #0e9090; letter-spacing: 0.2em; margin-bottom: 8px; }
        .rm-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 9px; flex: 1; }
        .rm-list li { color: rgba(255,255,255,0.5); font-size: 13px; line-height: 1.5; padding-left: 14px; position: relative; }
        .rm-list li::before { content: '·'; color: #0e9090; position: absolute; left: 0; font-size: 16px; line-height: 1.2; }

        .flywheel { display: flex; align-items: stretch; overflow-x: auto; padding-bottom: 8px; }
        .fw-wrap { display: flex; align-items: stretch; flex-shrink: 0; }
        .fw-step { background: rgba(255,255,255,0.04); border: 1px solid rgba(14,144,144,0.2); border-radius: 18px; padding: 26px 22px; width: 175px; transition: 0.3s; flex-shrink: 0; display: flex; flex-direction: column; }
        .fw-step:hover { border-color: rgba(14,144,144,0.5); transform: translateY(-4px); }
        .fw-accent { border-color: rgba(249,115,22,0.4); background: rgba(249,115,22,0.06); }
        .fw-arrow { color: rgba(255,255,255,0.2); font-size: 18px; padding: 0 8px; flex-shrink: 0; display: flex; align-items: center; }
        .fw-n { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #0e9090; letter-spacing: 0.2em; margin-bottom: 10px; }
        .fw-label { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 8px; }
        .fw-desc { font-size: 12px; color: rgba(255,255,255,0.45); line-height: 1.5; flex: 1; }

        .pkg-grid { display: grid; grid-template-columns: 1fr 350px; gap: 26px; }
        .pkg-main { background: rgba(255,255,255,0.04); border: 1px solid rgba(249,115,22,0.35); border-radius: 24px; padding: 46px; }
        .pkg-tag { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #f97316; letter-spacing: 0.2em; margin-bottom: 30px; display: block; }
        .pkg-items { display: flex; flex-direction: column; gap: 20px; margin-bottom: 36px; }
        .pkg-item { display: flex; gap: 14px; align-items: flex-start; }
        .pkg-dot { width: 6px; height: 6px; border-radius: 50%; background: #f97316; flex-shrink: 0; margin-top: 7px; }
        .pkg-item strong { display: block; color: #fff; font-size: 15px; margin-bottom: 4px; }
        .pkg-item span { color: rgba(255,255,255,0.5); font-size: 14px; line-height: 1.5; }
        .btn-orange { display: block; width: 100%; padding: 16px; background: #f97316; color: #fff; border: none; border-radius: 12px; font-weight: 800; cursor: pointer; text-transform: uppercase; letter-spacing: 0.06em; font-size: 12px; transition: 0.3s; text-align: center; box-sizing: border-box; }
        .btn-orange:hover { box-shadow: 0 0 28px rgba(249,115,22,0.5); transform: scale(1.02); }
        .pkg-side { display: flex; flex-direction: column; gap: 16px; }
        .side-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(14,144,144,0.2); border-radius: 18px; padding: 24px; }
        .side-card p { color: rgba(255,255,255,0.5); font-size: 14px; line-height: 1.6; margin: 0; }
        .side-teal { border-color: rgba(14,144,144,0.3); }
        .film-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 9px; }
        .film-list li { color: rgba(255,255,255,0.5); font-size: 14px; padding-left: 14px; position: relative; }
        .film-list li::before { content: '·'; color: #0e9090; position: absolute; left: 0; font-size: 16px; line-height: 1.2; }

        .carousel-demo { display: grid; grid-template-columns: auto 1fr; gap: 56px; align-items: center; }
        .phone-frame { width: 228px; height: 456px; background: #111827; border-radius: 34px; border: 2px solid rgba(255,255,255,0.1); overflow: hidden; box-shadow: 0 28px 56px rgba(0,0,0,0.7); flex-shrink: 0; }
        .phone-notch { width: 54px; height: 7px; background: rgba(255,255,255,0.08); border-radius: 4px; margin: 10px auto 0; }
        .phone-screen { padding: 10px; height: calc(100% - 28px); display: flex; flex-direction: column; }
        .insta-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .insta-av { width: 26px; height: 26px; border-radius: 50%; background: linear-gradient(135deg, #0e9090, #f97316); display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 700; color: #fff; flex-shrink: 0; }
        .insta-name { font-size: 11px; font-weight: 700; color: #fff; }
        .insta-sub { font-size: 9px; color: rgba(255,255,255,0.35); }
        .slide-card { flex: 1; background: rgba(255,255,255,0.05); border-radius: 10px; padding: 14px; display: flex; flex-direction: column; transition: 0.3s; }
        .slide-icon { font-size: 24px; margin-bottom: 6px; }
        .slide-tag { font-family: 'JetBrains Mono', monospace; font-size: 7px; letter-spacing: 0.1em; margin-bottom: 4px; }
        .slide-title { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 4px; }
        .slide-screen-desc { font-family: 'JetBrains Mono', monospace; font-size: 8px; color: rgba(255,255,255,0.3); margin-bottom: 6px; letter-spacing: 0.05em; }
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
        .roi-slider { width: 100%; accent-color: #0e9090; }
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
        .adv-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(14,144,144,0.18); border-radius: 20px; padding: 32px 28px; transition: 0.3s; display: flex; flex-direction: column; }
        .adv-card:hover { transform: translateY(-4px); border-color: rgba(14,144,144,0.4); }
        .adv-feat { border-color: rgba(249,115,22,0.35); background: rgba(249,115,22,0.04); }
        .adv-n { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #0e9090; letter-spacing: 0.2em; margin-bottom: 10px; }
        .adv-card p { color: rgba(255,255,255,0.5); font-size: 14px; line-height: 1.6; margin: 0 0 16px; flex: 1; }
        .adv-tag { display: inline-block; padding: 4px 12px; background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.3); color: #f97316; font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.1em; border-radius: 6px; align-self: flex-start; }

        .creds-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; }
        .creds-inner p { color: rgba(255,255,255,0.5); font-size: 15px; line-height: 1.7; margin-bottom: 14px; }
        .video-container { position: relative; padding-top: 56.25%; border-radius: 16px; overflow: hidden; border: 1px solid rgba(14,144,144,0.2); }
        .video-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: rgba(255,255,255,0.18); letter-spacing: 0.12em; text-align: center; margin-top: 12px; }

        .cta-section { text-align: center; background: linear-gradient(135deg, rgba(14,144,144,0.08), rgba(249,115,22,0.06)); border-top: 1px solid rgba(14,144,144,0.15); }
        .cta-inner { max-width: 580px; margin: 0 auto; }
        .cta-inner h2 { font-size: 50px; }
        .cta-inner p { color: rgba(255,255,255,0.5); font-size: 16px; line-height: 1.7; margin-bottom: 38px; }
        .btn-orange-lg { display: inline-block; padding: 20px 52px; background: #f97316; color: #fff; border: none; border-radius: 14px; font-weight: 800; text-decoration: none; text-transform: uppercase; letter-spacing: 0.08em; font-size: 15px; transition: 0.3s; cursor: pointer; }
        .btn-orange-lg:hover { box-shadow: 0 0 32px rgba(249,115,22,0.55); transform: scale(1.03); }

        .footer-note { text-align: center; padding: 34px; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: rgba(255,255,255,0.1); letter-spacing: 0.1em; border-top: 1px solid rgba(14,144,144,0.1); }

        @media (max-width: 900px) {
          h1 { font-size: 50px; }
          h2 { font-size: 32px; }
          .three-grid { grid-template-columns: 1fr; }
          .flywheel { flex-direction: column; }
          .fw-arrow { transform: rotate(90deg); align-self: center; padding: 8px 0; }
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