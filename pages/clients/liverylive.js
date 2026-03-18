import { useState, useEffect, useRef } from 'react';

export default function LiveryLive() {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [calendlyOpen, setCalendlyOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(false);
  const canvasRef = useRef(null);

  const [horses, setHorses] = useState(20);
  const [adminHours, setAdminHours] = useState(10);
  const [hourlyWage, setHourlyWage] = useState(12);
  const [missedCharges, setMissedCharges] = useState(5);
  const [avgCharge, setAvgCharge] = useState(15);

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

    let mouse = { x: null, y: null };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY + window.scrollY;
    };
    const handleScroll = () => setNavVisible(window.scrollY > 300);

    const pageH = canvas.height;
    const pageW = canvas.width;
    for (let i = 0; i < 180; i++) {
      particles.push({
        x: Math.random() * pageW,
        y: Math.random() * pageH,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        size: Math.random() * 1.8 + 0.5,
        color: Math.random() > 0.85 ? '#FF6B35' : (Math.random() > 0.5 ? '#0e9090' : '#ffffff'),
        opacity: Math.random() * 0.3 + 0.12,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (mouse.x != null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const force = (120 - dist) / 120;
            p.x += (dx / dist) * force * 3;
            p.y += (dy / dist) * force * 3;
          }
        }
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      animFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', resizeCanvas);
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animFrameId);
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

  const sliderBg = (val, min, max) => {
    const pct = ((val - min) / (max - min)) * 100;
    return `linear-gradient(to right, #0e9090 0%, #0e9090 ${pct}%, rgba(255,255,255,0.12) ${pct}%, rgba(255,255,255,0.12) 100%)`;
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const hoursSavedMonthly = Math.round(adminHours * 0.6 * 4.3);
  const revRecovered = missedCharges * avgCharge * 12;
  const appCost = horses * 2 * 12;
  const timeSavingsValue = hoursSavedMonthly * hourlyWage * 12;
  const totalAnnualBenefit = (revRecovered - appCost) + timeSavingsValue;
  const perMonth = Math.round(totalAnnualBenefit / 12);
  const roi = appCost > 0 ? Math.round((totalAnnualBenefit / appCost) * 100) : 0;

  const roiEmbedCode = `<!-- LiveryLive ROI Calculator — built by LearnLab Studio -->
<div id="ll-roi-calc"></div>
<script>
(function(){
  var h=20,a=10,w=12,m=5,c=15;
  function calc(){
    var hm=Math.round(a*0.6*4.3),rev=m*c*12,cost=h*2*12,tsv=hm*w*12,tot=(rev-cost)+tsv,pm=Math.round(tot/12),roi=Math.round((tot/cost)*100);
    document.getElementById('ll-cost').textContent='£'+cost+'/yr';
    document.getElementById('ll-rev').textContent='+£'+rev+'/yr';
    document.getElementById('ll-hm').textContent=hm+' hrs/month';
    document.getElementById('ll-tsv').textContent='+£'+tsv+'/yr';
    document.getElementById('ll-tot').textContent='£'+tot.toLocaleString();
    document.getElementById('ll-pm').textContent="That's £"+pm.toLocaleString()+" per month back in your pocket";
    document.getElementById('ll-roi').textContent=roi+'%';
  }
  function sl(id,v,min,max,step,label,pre,suf,desc){
    var pct=((v-min)/(max-min)*100);
    return '<div style="margin-bottom:24px"><div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px"><label style="font-size:14px;color:#4A6274;font-weight:500">'+label+'</label><span style="font-size:20px;font-weight:700;color:#1A2B3C">'+(pre==='£'?'£'+v:v)+(suf?' '+suf:'')+'</span></div>'+(desc?'<p style="font-size:12px;color:#8A9DAD;margin:0 0 8px;line-height:1.4">'+desc+'</p>':'')+'<input type="range" min="'+min+'" max="'+max+'" step="'+step+'" value="'+v+'" data-id="'+id+'" style="width:100%;height:6px;-webkit-appearance:none;appearance:none;background:linear-gradient(to right,#1A9FC7 0%,#1A9FC7 '+pct+'%,#E2EBF0 '+pct+'%,#E2EBF0 100%);border-radius:3px;outline:none;cursor:pointer"></div>';
  }
  document.getElementById('ll-roi-calc').innerHTML='<div style="font-family:system-ui,sans-serif;max-width:860px;margin:0 auto;background:#fff;border:1px solid #E2EBF0;border-radius:20px;overflow:hidden;box-shadow:0 4px 40px rgba(0,0,0,0.04)"><div style="padding:32px 32px 0"><div style="display:inline-block;background:rgba(26,159,199,0.08);border-radius:20px;padding:6px 14px;font-size:11px;color:#1A9FC7;letter-spacing:0.08em;text-transform:uppercase;font-weight:600;margin-bottom:16px;border:1px solid rgba(26,159,199,0.15)">Interactive Tool</div><h3 style="font-size:28px;font-weight:400;color:#1A2B3C;margin:0 0 4px">Livery Live ROI Calculator</h3><p style="font-size:14px;color:#8A9DAD;margin:0 0 32px;line-height:1.6">See how much time and money your yard could save.</p></div><div style="display:flex;flex-wrap:wrap"><div style="flex:1 1 340px;padding:0 32px 32px">'+sl('h','20','5','100','5','Horses on your yard','','horses','')+sl('a','10','1','40','1','Weekly admin hours','','hrs','Time spent on invoicing, records, feed charts, staff coordination')+sl('w','12','8','30','1','Hourly wage for admin','£','','Average hourly rate for the person doing the admin work')+sl('m','5','0','30','1','Missed charges per month','','','Extra services, arena bookings, or feed charges that slip through')+sl('c','15','5','50','5','Average charge value','£','','')+'</div><div style="flex:1 1 300px;padding:0 32px 32px;display:flex;flex-direction:column;gap:12px"><div style="background:#F0F6F9;border:1px solid #E2EBF0;border-radius:14px;padding:20px"><p style="font-size:11px;color:#8A9DAD;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px">Your yard at a glance</p><div style="display:flex;justify-content:space-between;margin-bottom:10px"><span style="font-size:13px;color:#4A6274">LiveryLive cost</span><span id="ll-cost" style="font-size:13px;color:#1A2B3C;font-weight:600"></span></div><div style="display:flex;justify-content:space-between;margin-bottom:10px"><span style="font-size:13px;color:#4A6274">Revenue recovered</span><span id="ll-rev" style="font-size:13px;color:#34B87A;font-weight:600"></span></div><div style="display:flex;justify-content:space-between;margin-bottom:10px"><span style="font-size:13px;color:#4A6274">Admin hours saved</span><span id="ll-hm" style="font-size:13px;color:#34B87A;font-weight:600"></span></div><div style="display:flex;justify-content:space-between;margin-bottom:10px"><span style="font-size:13px;color:#4A6274">Admin rate</span><span style="font-size:13px;color:#1A2B3C">£12/hr</span></div><div style="border-top:1px solid #E2EBF0;margin-top:12px;padding-top:12px;display:flex;justify-content:space-between"><span style="font-size:13px;color:#4A6274">Time savings value</span><span id="ll-tsv" style="font-size:13px;color:#34B87A;font-weight:600"></span></div></div><div style="background:linear-gradient(135deg,#EAF7FC,#F0FAFF);border:1px solid #1A9FC7;border-radius:14px;padding:20px 24px;text-align:center"><p style="font-size:12px;color:#8A9DAD;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px">Total Annual Benefit</p><p id="ll-tot" style="font-size:36px;font-weight:700;color:#1A9FC7;margin:0 0 6px"></p><p id="ll-pm" style="font-size:12px;color:#8A9DAD;margin:0"></p></div><div style="background:#fff;border:1px solid #E2EBF0;border-radius:14px;padding:20px 24px;text-align:center"><p style="font-size:12px;color:#8A9DAD;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px">Return on Investment</p><p id="ll-roi" style="font-size:28px;font-weight:700;color:#1A2B3C;margin:0 0 6px"></p><p style="font-size:12px;color:#8A9DAD;margin:0">For every £1 spent on LiveryLive</p></div></div></div></div>';
  calc();
  document.querySelectorAll('[data-id]').forEach(function(el){
    el.addEventListener('input',function(){
      var id=this.getAttribute('data-id'),v=parseInt(this.value);
      if(id==='h')h=v; if(id==='a')a=v; if(id==='w')w=v; if(id==='m')m=v; if(id==='c')c=v;
      var pct=((v-parseInt(this.min))/(parseInt(this.max)-parseInt(this.min))*100);
      this.style.background='linear-gradient(to right,#1A9FC7 0%,#1A9FC7 '+pct+'%,#E2EBF0 '+pct+'%,#E2EBF0 100%)';
      calc();
    });
  });
})();
<\/script>`;

  const slides = [
    { label: 'Horses', desc: 'Every horse on the yard in one place — photo, owner, stable number, feed chart. The whole team always has the full picture.', icon: '🐴', color: '#0e9090', screenDesc: 'Horses screen — King, Jenny, Stable 1' },
    { label: 'To Do', desc: 'Daily task lists with date navigation. Staff see exactly what needs doing — no missed jobs, no confusion.', icon: '✅', color: '#1a7a4a', screenDesc: 'To Do — Wednesday 18 March' },
    { label: 'Messages', desc: '"Hi everyone, see your tasks for tomorrow?" — yard-wide communication in one thread. No WhatsApp chaos.', icon: '💬', color: '#2563eb', screenDesc: 'Messages — Jenny, a few seconds ago' },
    { label: 'Yard Calendar', desc: 'Every yard event in one view. Pending events, upcoming bookings, staff schedules — all visible at a glance.', icon: '📅', color: '#7c3aed', screenDesc: 'Yard Calendar — March 2026' },
  ];

  const additionalContent = [
    { icon: '📱', title: 'Weekly App Tips', desc: 'Short screen-recorded walkthroughs of one feature per week. Low effort to produce, high value for trial converts.' },
    { icon: '🎯', title: 'Feature Highlights', desc: 'Every time something new ships — arena booking, updated profiles — it gets its own content moment.' },
    { icon: '📊', title: 'Data-Led Posts', desc: "Stats from real yard use — hours saved, charges recovered. Turns the product's own data into social proof." },
    { icon: '🌿', title: 'Seasonal Content', desc: 'Spring turnout, winter feeding, competition season. The equestrian calendar is a ready-made content calendar.' },
    { icon: '💬', title: 'User Stories', desc: 'Written testimonials turned into visual quote cards. High trust content that costs nothing extra to produce.' },
    { icon: '🎬', title: 'Behind the Scenes', desc: 'Content from the filming days — arriving at a yard, setting up, candid moments. Makes the brand feel human.' },
    { icon: '❓', title: 'Polls & Questions', desc: '"Still managing your yard on a whiteboard?" Engagement-first content that grows reach and surfaces new leads.' },
    { icon: '🏆', title: 'Yard Spotlights', desc: 'A post series profiling yards using Livery Live. Gives users something to share and grows the brand organically.' },
  ];

  const navItems = [
    { label: 'The Proposal', id: 'sec-proposal' },
    { label: 'The Package', id: 'sec-package' },
    { label: 'ROI Tool', id: 'sec-roi' },
    { label: 'Advisory', id: 'sec-advisory' },
    { label: 'Book a Call', id: null, cta: true },
  ];

  if (!mounted) return null;

  return (
    <div className="proposal-wrap">
      <canvas ref={canvasRef} className="bg-canvas" />

      <div className={`jump-nav ${navVisible ? 'jump-nav-visible' : ''}`}>
        {navItems.map((item, i) => (
          <button key={i} className={`jump-item ${item.cta ? 'jump-cta' : ''}`} onClick={() => item.cta ? setCalendlyOpen(true) : scrollTo(item.id)}>
            {item.label}
          </button>
        ))}
      </div>

      {calendlyOpen && (
        <div className="cal-overlay" onClick={e => { if (e.target.classList.contains('cal-overlay')) setCalendlyOpen(false); }}>
          <div className="cal-modal">
            <button className="cal-close" onClick={() => setCalendlyOpen(false)}>✕</button>
            <div className="calendly-inline-widget" data-url="https://calendly.com/tom-learnlabmedia/30min" style={{minWidth:'320px', height:'650px'}} />
          </div>
        </div>
      )}

      <div className="proposal">

        <section id="sec-proposal" className="hero">
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

        <section className="section">
          <div className="inner">
            <div className="eyebrow teal">// THE_SITUATION</div>
            <h2>The product is there.<br /><span className="hl-teal">Now it needs an audience.</span></h2>
            <p className="lead">Livery Live is already solving real problems for real yards — the testimonials on your site make that clear. The opportunity is getting that story in front of the thousands of yard owners who haven't heard of you yet.</p>
            <div className="three-grid equal-cards">
              <div className="card"><div className="card-icon">📵</div><h4>Building from a low base</h4><p>No consistent content engine yet — no video, no regular social presence. That's not a criticism, it's an opportunity. Starting fresh means we get to do it properly from day one.</p></div>
              <div className="card"><div className="card-icon">🔁</div><h4>Rebrand timing is perfect</h4><p>A new brand identity without content to carry it is a missed moment. Build the infrastructure now and the rebrand lands with real momentum behind it.</p></div>
              <div className="card"><div className="card-icon">⏱️</div><h4>The market is moving</h4><p>Arena booking is live. The product is expanding. This is exactly the right time to start telling that story loudly — before someone else fills that space.</p></div>
            </div>
          </div>
        </section>

        <section className="section section-dark">
          <div className="inner">
            <div className="eyebrow teal">// THE_STRATEGY</div>
            <h2>One filming day.<br /><span className="hl-teal">Eight weeks of content.</span></h2>
            <p className="lead">Every yard visit extracts maximum value. One serious day of filming produces enough material to keep Livery Live's channels active for two months.</p>
            <div className="flywheel">
              {[
                { n: '01', label: 'Full Production Day', desc: 'On-site at a real yard with professional kit. Testimonials, founder content, app in use on real phones, cinematic b-roll.' },
                { n: '02', label: 'Hero Edits', desc: 'Polished finished films — starting with yard owner testimonials and a founder message to kick off the marketing.' },
                { n: '03', label: '16x Short-Form', desc: 'Platform-native cuts for Instagram, TikTok and Facebook. Hook-led, built to stop the scroll and drive sign-ups.' },
                { n: '04', label: 'Static & Ad Creative', desc: 'Carousel posts, feature spotlights, social proof tiles and ad creative — all from the same day of footage.' },
                { n: '05', label: 'New Sign-Ups', desc: 'Real yards, real stories, real results. Content that builds trust and turns cold audiences into paying customers.', accent: true },
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

        <section id="sec-package" className="section">
          <div className="inner">
            <div className="eyebrow teal">// THE_PACKAGE</div>
            <h2>The Field.<br /><span className="hl-orange">£2,499<span style={{fontSize:'22px',fontWeight:400}}>/mo</span></span></h2>
            <p className="lead">One full production day per month, on-site at a real yard. Professional equipment, proper editing, a complete content system. I cover my own travel expenses across the UK.</p>
            <div className="pkg-grid">
              <div className="pkg-main">
                <div className="pkg-tag">// MONTHLY_DELIVERABLES</div>
                <div className="pkg-items">
                  {[
                    { title: 'Monthly Production Day', desc: 'I come to you. One full day on-site with professional camera, audio and lighting. Multiple subjects and locations in a single visit.' },
                    { title: 'Hero Video Edits', desc: 'High-quality finished films each month — starting with yard owner testimonials and a founder message to properly launch the content.' },
                    { title: '16 Growth Clips', desc: 'Short-form cuts for Instagram, TikTok and Facebook. Built to perform on each platform, not just repurposed from the same file.' },
                    { title: 'Static & Ad Creative', desc: 'Carousel posts, feature spotlights and ad creative variations delivered every month.' },
                    { title: 'Days Roll Over', desc: "If a month doesn't work logistically, the day banks and we double up the following month. Nothing is wasted." },
                    { title: 'Monthly Analytics Review', desc: "Every month we look at what's working — reach, conversions, what to double down on. You always know where things stand." },
                    { title: 'Growth Strategy Session', desc: 'A monthly call to plan the next filming day — which yards to visit, which stories to tell, which features to push.' },
                    { title: 'Travel Covered', desc: "I cover my own travel expenses across the UK. Wherever the best stories are, I'll be there." },
                  ].map((item, i) => (
                    <div key={i} className="pkg-item">
                      <div className="pkg-dot" />
                      <div><strong>{item.title}</strong><span>{item.desc}</span></div>
                    </div>
                  ))}
                </div>
                <button className="btn-orange" onClick={() => setCalendlyOpen(true)}>Book a Call — I'll Send Over a Proposed Time</button>
              </div>

              <div className="pkg-side">
                <div className="side-card hoverable">
                  <div className="eyebrow teal" style={{marginBottom:'10px'}}>// WHAT_WE_FILM</div>
                  <ul className="film-list">
                    {['Yard owner testimonials','Founder and team interviews','The app being used on real phones','Cinematic b-roll of yard life','Feature walkthroughs and demos','Seasonal content and timely hooks','Problem-led narrative pieces'].map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
                <div className="side-card side-orange hoverable">
                  <div className="eyebrow orange" style={{marginBottom:'10px'}}>// LOGISTICS_&_INSURANCE</div>
                  <ul className="film-list">
                    {[
                      'UK public liability insurance — up to £1 million',
                      'Professional indemnity insurance in place',
                      'CAA-approved drone licence — aerial footage available',
                      'All travel expenses covered across the UK',
                      'Flexible scheduling — days roll over if unused',
                      'Backup equipment carried on every shoot',
                      'Contracts and delivery schedules provided upfront',
                    ].map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              </div>
            </div>

            <div className="additional-content">
              <div className="additional-divider">
                <div className="additional-divider-line" />
                <div className="additional-divider-label">// ALSO_INCLUDED · CONTENT_THAT_NEVER_STOPS</div>
                <div className="additional-divider-line" />
              </div>
              <p className="additional-intro">The filming day feeds the big pieces. But there's a whole layer of content that doesn't need a camera crew — and it keeps the channels active every single week between shoots.</p>
              <div className="content-grid">
                {additionalContent.map((item, i) => (
                  <div key={i} className="content-card">
                    <div className="content-icon">{item.icon}</div>
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

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
                  <ul className="rm-list">{m.items.map((item, j) => <li key={j}>{item}</li>)}</ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="inner">
            <div className="eyebrow teal">// CONTENT_EXAMPLE</div>
            <h2>What the social<br /><span className="hl-teal">content looks like.</span></h2>
            <p className="lead">Feature spotlight carousels pull directly from real app screens — showing yard owners exactly what they're getting before they sign up.</p>
            <div className="carousel-demo">
              <div className="phone-frame">
                <div className="phone-notch" />
                <div className="phone-screen">
                  <div className="insta-header">
                    <div className="insta-av">LL</div>
                    <div><div className="insta-name">liverylive</div><div className="insta-sub">Sponsored</div></div>
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
                    {slides.map((_, i) => <div key={i} className={`dot ${i === activeSlide ? 'dot-a' : ''}`} onClick={() => setActiveSlide(i)} />)}
                  </div>
                </div>
              </div>
              <div className="carousel-info">
                <div className="eyebrow teal">// REAL_APP_SCREENS</div>
                <h3>Feature Spotlight Posts</h3>
                <p>Each slide uses real screenshots from the Livery Live app — horses, tasks, messages, calendar. No mockups. Shows exactly what yard owners get when they sign up.</p>
                <div className="slide-btns">
                  {slides.map((s, i) => <button key={i} className={`slide-btn ${i === activeSlide ? 'slide-btn-a' : ''}`} onClick={() => setActiveSlide(i)}>{s.label}</button>)}
                </div>
                <p className="disclaimer">Real carousels will be designed using the rebrand visual identity once that's ready.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="sec-roi" className="section section-dark roi-section">
          <div className="inner">
            <div className="eyebrow teal">// GROWTH_TOOL</div>
            <h2>The ROI<br /><span className="hl-teal">Calculator.</span></h2>
            <p className="lead">Built this specifically for Livery Live. Drop it on your pricing page and every prospective yard owner gets an instant, personalised reason to switch.</p>
            <div className="roi-widget">
              <div className="roi-inputs">
                {[
                  { label: 'Horses on your yard', val: horses, set: setHorses, min: 5, max: 100, step: 5, pre: '', suf: '', desc: '' },
                  { label: 'Weekly admin hours', val: adminHours, set: setAdminHours, min: 1, max: 40, step: 1, pre: '', suf: ' hrs', desc: 'Time spent on invoicing, records, feed charts, staff coordination' },
                  { label: 'Hourly wage for admin', val: hourlyWage, set: setHourlyWage, min: 8, max: 30, step: 1, pre: '£', suf: '', desc: 'Average hourly rate for the person doing the admin work' },
                  { label: 'Missed charges per month', val: missedCharges, set: setMissedCharges, min: 0, max: 30, step: 1, pre: '', suf: '', desc: 'Extra services, arena bookings, or feed charges that slip through' },
                  { label: 'Average charge value', val: avgCharge, set: setAvgCharge, min: 5, max: 50, step: 5, pre: '£', suf: '', desc: '' },
                ].map((f, i) => (
                  <div key={i} className="roi-field">
                    <div className="roi-fh"><span>{f.label}</span><strong>{f.pre}{f.val}{f.suf}</strong></div>
                    {f.desc && <p className="roi-desc">{f.desc}</p>}
                    <input type="range" min={f.min} max={f.max} step={f.step} value={f.val} onChange={e => f.set(Number(e.target.value))} className="roi-slider" style={{ background: sliderBg(f.val, f.min, f.max) }} />
                  </div>
                ))}
              </div>
              <div className="roi-results">
                <div className="roi-glance">
                  <div className="roi-glance-label">// YOUR_YARD_AT_A_GLANCE</div>
                  <div className="roi-row"><span>LiveryLive cost</span><span>£{appCost}/yr</span></div>
                  <div className="roi-row"><span>Revenue recovered</span><span className="green">+£{revRecovered}/yr</span></div>
                  <div className="roi-row"><span>Admin hours saved</span><span className="green">{hoursSavedMonthly} hrs/month</span></div>
                  <div className="roi-row"><span>Admin rate</span><span>£{hourlyWage}/hr</span></div>
                  <div className="roi-row noborder"><span>Time savings value</span><span className="green">+£{timeSavingsValue}/yr</span></div>
                </div>
                <div className="roi-total">
                  <div className="roi-total-label">TOTAL ANNUAL BENEFIT</div>
                  <div className="roi-total-num">£{totalAnnualBenefit.toLocaleString()}</div>
                  <div className="roi-total-pm">That's £{perMonth.toLocaleString()} per month back in your pocket</div>
                </div>
                <div className="roi-roi">
                  <div className="roi-roi-label">RETURN ON INVESTMENT</div>
                  <div className="roi-roi-num">{roi}%</div>
                  <div className="roi-roi-sub">For every £1 spent on LiveryLive</div>
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

        <section id="sec-advisory" className="section">
          <div className="inner">
            <div className="eyebrow teal">// BUSINESS_ADVISORY</div>
            <h2>Six things worth<br /><span className="hl-teal">looking at.</span></h2>
            <p className="lead">Separate from the content work, a few commercial and product moves that could meaningfully improve conversion and retention without a huge amount of effort.</p>
            <div className="adv-grid equal-cards">
              {[
                { n: '01', title: 'Shorten the trial to two weeks', body: "Six weeks gives people too much room to drift. They sign up, get busy, forget about it, and quietly disappear. Two weeks keeps the momentum — and if the product is good, which it clearly is, two weeks is more than enough to feel the value.", tag: 'High Impact', feat: true },
                { n: '02', title: 'Take card details upfront', body: "No charge until the trial ends, but capture the card at sign-up. It filters out the people who were never going to convert anyway, and for the ones who do convert there's no friction — it just happens. Every SaaS that grows past a certain point does this.", tag: 'High Impact', feat: true },
                { n: '03', title: 'Build a referral programme', body: "Yard owners are a tight-knit community. They talk at shows, in WhatsApp groups, on forums. A simple referral mechanic — refer a yard, get a free month — would tap into that network properly. It doesn't exist yet and it should.", tag: 'Quick Win', feat: false },
                { n: '04', title: 'Give arena booking its own launch moment', body: "This is more than a feature update — it's a new use case. It deserves its own content push, its own announcement, its own ad campaign. Right now it's a line on the nav. It could be a reason someone switches.", tag: 'Quick Win', feat: false },
                { n: '05', title: 'Put the price front and centre in ads', body: "£2 per horse per month is an extraordinary deal. A yard with 30 horses pays £60 a month. That number should be in the headline of every ad you run, not buried three clicks deep. Price transparency at this level is a conversion tool.", tag: 'Ad Strategy', feat: false },
                { n: '06', title: 'A short onboarding video series', body: "New yards that can't figure out the basics in week one quietly cancel and never come back. Three short videos — getting set up, adding your team, sending your first invoice — would cut early churn and reduce the support load.", tag: 'Retention', feat: false },
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

        <section id="sec-cta" className="section cta-section">
          <div className="cta-inner">
            <div className="eyebrow teal">// NEXT_STEPS</div>
            <h2>Ready when<br /><span className="hl-orange">you are.</span></h2>
            <p>I'll be in touch shortly with a proposed time to run through this together. If you want to get something in the diary sooner, book directly below.</p>
            <button className="btn-orange-lg" onClick={() => setCalendlyOpen(true)}>Book a Call →</button>
          </div>
        </section>

        <div className="footer-note">LearnLab Studio · learnlabmedia.com · Prepared for Livery Live · March 2026 · Confidential</div>
      </div>

      <style jsx global>{`
        body { margin: 0; background: #0a1628; }
        .roi-section * { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='80'%3E🐴%3C/text%3E%3C/svg%3E") 16 16, auto !important; }
        .cal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px); }
        .cal-modal { background: #fff; border-radius: 20px; width: 100%; max-width: 700px; position: relative; overflow: hidden; animation: slideUp 0.3s ease-out; }
        .cal-close { position: absolute; top: 16px; right: 16px; background: rgba(0,0,0,0.1); border: none; border-radius: 50%; width: 32px; height: 32px; font-size: 14px; cursor: pointer !important; z-index: 10; display: flex; align-items: center; justify-content: center; }
        .cal-close:hover { background: rgba(0,0,0,0.2); }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <style jsx>{`
        .proposal-wrap { position: relative; min-height: 100vh; background: linear-gradient(160deg, #0a1628 0%, #0d1f35 40%, #0a1e1e 100%); }
        .bg-canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; }
        .proposal { position: relative; z-index: 1; overflow-x: hidden; }

        .jump-nav { position: fixed; top: 24px; left: 50%; transform: translateX(-50%) translateY(-80px); z-index: 200; display: flex; align-items: center; gap: 4px; background: rgba(10,22,40,0.9); backdrop-filter: blur(20px); border: 1px solid rgba(14,144,144,0.25); border-radius: 999px; padding: 6px 8px; transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease; opacity: 0; pointer-events: none; }
        .jump-nav-visible { transform: translateX(-50%) translateY(0); opacity: 1; pointer-events: all; }
        .jump-item { padding: 8px 16px; background: transparent; border: none; color: rgba(255,255,255,0.45); font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; border-radius: 999px; transition: all 0.2s; white-space: nowrap; }
        .jump-item:hover { color: #0e9090; background: rgba(14,144,144,0.1); }
        .jump-cta { background: #f97316 !important; color: #fff !important; font-weight: 700; }
        .jump-cta:hover { box-shadow: 0 0 16px rgba(249,115,22,0.5); background: #ea6c10 !important; }

        .eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.2em; margin-bottom: 16px; display: block; text-transform: uppercase; }
        .teal { color: #0e9090; }
        .orange { color: #f97316; }
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
        .card:hover { transform: translateY(-6px); border-color: rgba(14,144,144,0.5); background: rgba(14,144,144,0.06); box-shadow: 0 12px 32px rgba(0,0,0,0.3); }
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

        .pkg-grid { display: grid; grid-template-columns: 1fr 360px; gap: 26px; align-items: start; }
        .pkg-main { background: rgba(255,255,255,0.04); border: 1px solid rgba(249,115,22,0.35); border-radius: 24px; padding: 46px; }
        .pkg-tag { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #f97316; letter-spacing: 0.2em; margin-bottom: 30px; display: block; }
        .pkg-items { display: flex; flex-direction: column; gap: 20px; margin-bottom: 36px; }
        .pkg-item { display: flex; gap: 14px; align-items: flex-start; }
        .pkg-dot { width: 6px; height: 6px; border-radius: 50%; background: #f97316; flex-shrink: 0; margin-top: 7px; }
        .pkg-item strong { display: block; color: #fff; font-size: 15px; margin-bottom: 4px; }
        .pkg-item span { color: rgba(255,255,255,0.5); font-size: 14px; line-height: 1.5; }
        .btn-orange { display: block; width: 100%; padding: 16px; background: #f97316; color: #fff; border: none; border-radius: 12px; font-weight: 800; cursor: pointer !important; text-transform: uppercase; letter-spacing: 0.06em; font-size: 12px; transition: 0.3s; text-align: center; box-sizing: border-box; }
        .btn-orange:hover { box-shadow: 0 0 28px rgba(249,115,22,0.5); transform: scale(1.02); }
        .pkg-side { display: flex; flex-direction: column; gap: 16px; }
        .side-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(14,144,144,0.2); border-radius: 18px; padding: 24px; transition: 0.4s cubic-bezier(0.22,1,0.36,1); }
        .hoverable:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.3); }
        .side-orange { border-color: rgba(249,115,22,0.25); background: rgba(249,115,22,0.03); }
        .side-orange.hoverable:hover { border-color: rgba(249,115,22,0.5); }
        .film-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 9px; }
        .film-list li { color: rgba(255,255,255,0.5); font-size: 13px; padding-left: 14px; position: relative; line-height: 1.5; }
        .film-list li::before { content: '·'; color: #0e9090; position: absolute; left: 0; font-size: 16px; line-height: 1.2; }
        .side-orange .film-list li::before { color: #f97316; }

        .additional-content { margin-top: 60px; }
        .additional-divider { display: flex; align-items: center; gap: 20px; margin-bottom: 28px; }
        .additional-divider-line { flex: 1; height: 1px; background: rgba(14,144,144,0.2); }
        .additional-divider-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #0e9090; letter-spacing: 0.18em; white-space: nowrap; }
        .additional-intro { color: rgba(255,255,255,0.45); font-size: 15px; line-height: 1.7; max-width: 700px; margin-bottom: 32px; }
        .content-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .content-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(14,144,144,0.15); border-radius: 16px; padding: 24px 20px; transition: 0.4s cubic-bezier(0.22,1,0.36,1); }
        .content-card:hover { transform: translateY(-4px); border-color: rgba(14,144,144,0.4); background: rgba(14,144,144,0.05); box-shadow: 0 10px 28px rgba(0,0,0,0.3); }
        .content-icon { font-size: 24px; margin-bottom: 10px; }
        .content-card h4 { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 6px; }
        .content-card p { color: rgba(255,255,255,0.4); font-size: 12px; line-height: 1.5; margin: 0; }

        .carousel-demo { display: grid; grid-template-columns: auto 1fr; gap: 56px; align-items: center; }
        .phone-frame { width: 228px; height: 456px; background: #111827; border-radius: 34px; border: 2px solid rgba(255,255,255,0.1); overflow: hidden; box-shadow: 0 28px 56px rgba(0,0,0,0.7); flex-shrink: 0; }
        .phone-notch { width: 54px; height: 7px; background: rgba(255,255,255,0.08); border-radius: 4px; margin: 10px auto 0; }
        .phone-screen { padding: 10px; height: calc(100% - 28px); display: flex; flex-direction: column; }
        .insta-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .insta-av { width: 26px; height: 26px; border-radius: 50%; background: linear-gradient(135deg, #0e9090, #f97316); display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 700; color: #fff; flex-shrink: 0; }
        .insta-name { font-size: 11px; font-weight: 700; color: #fff; }
        .insta-sub { font-size: 9px; color: rgba(255,255,255,0.35); }
        .slide-card { flex: 1; background: rgba(255,255,255,0.05); border-radius: 10px; padding: 14px; display: flex; flex-direction: column; }
        .slide-icon { font-size: 24px; margin-bottom: 6px; }
        .slide-tag { font-family: 'JetBrains Mono', monospace; font-size: 7px; letter-spacing: 0.1em; margin-bottom: 4px; }
        .slide-title { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 4px; }
        .slide-screen-desc { font-family: 'JetBrains Mono', monospace; font-size: 8px; color: rgba(255,255,255,0.3); margin-bottom: 6px; }
        .slide-desc { font-size: 10px; color: rgba(255,255,255,0.5); line-height: 1.4; flex: 1; }
        .slide-brand { font-family: 'JetBrains Mono', monospace; font-size: 7px; color: rgba(255,255,255,0.2); margin-top: 8px; }
        .dots { display: flex; gap: 5px; justify-content: center; padding: 8px 0 4px; }
        .dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,0.2); cursor: pointer; transition: 0.2s; }
        .dot-a { background: #0e9090; width: 14px; border-radius: 3px; }
        .carousel-info p { color: rgba(255,255,255,0.5); font-size: 15px; line-height: 1.6; margin-bottom: 22px; }
        .slide-btns { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
        .slide-btn { padding: 7px 15px; background: rgba(255,255,255,0.04); border: 1px solid rgba(14,144,144,0.25); color: rgba(255,255,255,0.4); border-radius: 8px; font-size: 13px; cursor: pointer; transition: 0.2s; font-family: inherit; }
        .slide-btn:hover, .slide-btn-a { border-color: #0e9090; color: #0e9090; }
        .disclaimer { font-family: 'JetBrains Mono', monospace; font-size: 11px !important; color: rgba(255,255,255,0.18) !important; }

        .roi-widget { display: grid; grid-template-columns: 1fr 310px; gap: 28px; background: rgba(255,255,255,0.04); border: 1px solid rgba(14,144,144,0.2); border-radius: 24px; padding: 42px; margin-bottom: 32px; }
        .roi-field { margin-bottom: 24px; }
        .roi-fh { display: flex; justify-content: space-between; margin-bottom: 6px; }
        .roi-fh span { color: rgba(255,255,255,0.5); font-size: 14px; font-weight: 500; }
        .roi-fh strong { color: #fff; font-size: 20px; font-weight: 700; }
        .roi-desc { color: rgba(255,255,255,0.3); font-size: 12px; margin: 0 0 8px; line-height: 1.4; }
        .roi-slider { width: 100%; height: 6px; -webkit-appearance: none; appearance: none; border-radius: 3px; outline: none; cursor: pointer; }
        .roi-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%; background: #0e9090; cursor: pointer; border: 3px solid #0a1628; box-shadow: 0 2px 8px rgba(14,144,144,0.5); transition: transform 0.2s; }
        .roi-slider::-webkit-slider-thumb:hover { transform: scale(1.2); }
        .roi-slider::-moz-range-thumb { width: 22px; height: 22px; border-radius: 50%; background: #0e9090; cursor: pointer; border: 3px solid #0a1628; }
        .roi-glance { margin-bottom: 16px; }
        .roi-glance-label { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: rgba(255,255,255,0.28); letter-spacing: 0.15em; margin-bottom: 14px; }
        .roi-row { display: flex; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 13px; }
        .roi-row.noborder { border-bottom: none; }
        .roi-row span:first-child { color: rgba(255,255,255,0.45); }
        .roi-row span:last-child { color: #fff; font-weight: 600; }
        .green { color: #34d399 !important; }
        .roi-total { background: linear-gradient(135deg, rgba(14,144,144,0.15), rgba(14,144,144,0.06)); border: 1px solid rgba(14,144,144,0.4); border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 12px; }
        .roi-total-label { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.15em; color: rgba(255,255,255,0.5); margin-bottom: 10px; }
        .roi-total-num { font-size: 44px; font-weight: 800; color: #0e9090; line-height: 1; margin-bottom: 8px; }
        .roi-total-pm { font-size: 12px; color: rgba(255,255,255,0.4); line-height: 1.4; }
        .roi-roi { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px 24px; text-align: center; }
        .roi-roi-label { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.15em; color: rgba(255,255,255,0.35); margin-bottom: 8px; }
        .roi-roi-num { font-size: 32px; font-weight: 700; color: #fff; line-height: 1; margin-bottom: 6px; }
        .roi-roi-sub { font-size: 12px; color: rgba(255,255,255,0.3); }
        .embed-box { background: rgba(0,0,0,0.3); border: 1px solid rgba(14,144,144,0.18); border-radius: 18px; overflow: hidden; }
        .embed-head { display: flex; justify-content: space-between; align-items: flex-start; padding: 26px 30px 18px; border-bottom: 1px solid rgba(255,255,255,0.05); gap: 20px; }
        .embed-head p { color: rgba(255,255,255,0.4); font-size: 14px; line-height: 1.5; margin: 10px 0 0; }
        .copy-btn { padding: 8px 18px; background: #0e9090; color: #fff; border: none; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer !important; transition: 0.2s; letter-spacing: 0.05em; white-space: nowrap; flex-shrink: 0; }
        .copy-btn:hover { box-shadow: 0 0 14px rgba(14,144,144,0.5); }
        .code-pre { margin: 0; padding: 22px 30px; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: rgba(14,144,144,0.65); line-height: 1.6; white-space: pre-wrap; word-break: break-all; overflow-x: auto; }

        .adv-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .adv-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(14,144,144,0.18); border-radius: 20px; padding: 32px 28px; transition: 0.3s; display: flex; flex-direction: column; }
        .adv-card:hover { transform: translateY(-4px); border-color: rgba(14,144,144,0.4); box-shadow: 0 12px 32px rgba(0,0,0,0.3); }
        .adv-feat { border-color: rgba(249,115,22,0.35); background: rgba(249,115,22,0.04); }
        .adv-feat:hover { border-color: rgba(249,115,22,0.6); }
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
        .btn-orange-lg { display: inline-block; padding: 20px 52px; background: #f97316; color: #fff; border: none; border-radius: 14px; font-weight: 800; text-decoration: none; text-transform: uppercase; letter-spacing: 0.08em; font-size: 15px; transition: 0.3s; cursor: pointer !important; }
        .btn-orange-lg:hover { box-shadow: 0 0 32px rgba(249,115,22,0.55); transform: scale(1.03); }
        .footer-note { text-align: center; padding: 34px; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: rgba(255,255,255,0.1); letter-spacing: 0.1em; border-top: 1px solid rgba(14,144,144,0.1); }

        @media (max-width: 900px) {
          h1 { font-size: 50px; } h2 { font-size: 32px; }
          .three-grid { grid-template-columns: 1fr; }
          .flywheel { flex-direction: column; }
          .fw-arrow { transform: rotate(90deg); align-self: center; padding: 8px 0; }
          .pkg-grid, .carousel-demo, .roi-widget, .adv-grid, .creds-inner { grid-template-columns: 1fr; }
          .content-grid { grid-template-columns: repeat(2, 1fr); }
          .section { padding: 60px 24px; }
          .hero { padding: 80px 24px 60px; }
          .cta-inner h2 { font-size: 36px; }
          .jump-nav { display: none; }
        }
      `}</style>
    </div>
  );
}