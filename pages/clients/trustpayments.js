import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const ACCESS_CODE = 'TRUST2026';

export default function TrustPaymentsPortal() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('tp_auth');
      if (stored === 'true') setAuthed(true);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.trim().toUpperCase() === ACCESS_CODE) {
      sessionStorage.setItem('tp_auth', 'true');
      setAuthed(true);
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => { setError(false); setShake(false); }, 600);
    }
  };

  if (!mounted) return null;

  if (authed) return <Proposal />;

  return (
    <>
      <Head>
        <title>LearnLab Studio — Client Portal</title>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>
      <div style={styles.gateWrap}>
        <div style={styles.gateCard}>
          <div style={styles.gateLogo}>LearnLab <span style={styles.gateLogoAccent}>Studio</span></div>
          <p style={styles.gateLabel}>PRIVATE CLIENT PORTAL</p>
          <h2 style={styles.gateTitle}>Enter your access code to continue</h2>
          <form onSubmit={handleSubmit} autoComplete="off">
            <input
              style={{
                ...styles.gateInput,
                ...(error ? styles.gateInputError : {}),
                animation: shake ? 'shake 0.5s ease' : 'none'
              }}
              type="text"
              placeholder="XXXX0000"
              value={code}
              onChange={e => setCode(e.target.value)}
              autoComplete="off"
              spellCheck="false"
            />
            {error && <p style={styles.gateError}>Invalid access code. Please try again.</p>}
            <button type="submit" style={styles.gateBtn}>Access Portal</button>
          </form>
          <p style={styles.gateFooter}>Don't have a code? <a href="https://learnlab.studio/deployment" style={styles.gateLink}>Get in touch →</a></p>
        </div>
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-6px); }
            80% { transform: translateX(6px); }
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #04100A; }
        `}</style>
      </div>
    </>
  );
}

function Proposal() {
  const [activeSection, setActiveSection] = useState(null);

  return (
    <>
      <Head>
        <title>LearnLab Studio × Trust Payments</title>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>
      <div style={styles.wrap}>

        {/* NAV */}
        <nav style={styles.nav}>
          <div style={styles.navInner}>
            <span style={styles.navLogo}>LearnLab <span style={styles.navAccent}>Studio</span></span>
            <div style={styles.navLinks}>
              <a href="#proposal" style={styles.navLink}>Proposal</a>
              <a href="#deliverables" style={styles.navLink}>Deliverables</a>
              <a href="#addons" style={styles.navLink}>Add-ons</a>
              <a href="#tool" style={styles.navLink}>AI Tool</a>
              <a href="#next" style={styles.navLinkCta}>Next Steps →</a>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <section style={styles.hero}>
          <div style={styles.heroInner}>
            <div style={styles.heroBadge}>
              <span style={styles.heroDot}></span>
              PRIVATE PROPOSAL — MARCH 2026
            </div>
            <h1 style={styles.heroTitle}>
              Building <span style={styles.green}>Balvinder Helate</span> into the Defining Voice of UK Payments.
            </h1>
            <p style={styles.heroSub}>
              A done-for-you content system that positions Bal as a genuine thought leader in payments and crypto — generating authority for her personal brand and qualified pipeline for Trust Payments.
            </p>
            <div style={styles.heroStats}>
              <div style={styles.stat}>
                <span style={styles.statNum}>£2,500</span>
                <span style={styles.statLabel}>Per Month</span>
              </div>
              <div style={styles.statDivider}></div>
              <div style={styles.stat}>
                <span style={styles.statNum}>Field</span>
                <span style={styles.statLabel}>Package</span>
              </div>
              <div style={styles.statDivider}></div>
              <div style={styles.stat}>
                <span style={styles.statNum}>Monthly</span>
                <span style={styles.statLabel}>Filming Day</span>
              </div>
              <div style={styles.statDivider}></div>
              <div style={styles.stat}>
                <span style={styles.statNum}>12+</span>
                <span style={styles.statLabel}>Assets / Month</span>
              </div>
            </div>
          </div>
        </section>

        {/* THE OPPORTUNITY */}
        <section style={styles.section} id="proposal">
          <div style={styles.sectionInner}>
            <div style={styles.sectionLabel}>// THE OPPORTUNITY</div>
            <h2 style={styles.sectionTitle}>The payments space lacks credible, compelling voices.</h2>
            <div style={styles.twoCol}>
              <div style={styles.colBlock}>
                <p style={styles.bodyText}>
                  Trust Payments processes over £5bn annually across 20,000+ businesses. That scale, expertise, and market position is a story that is not being told. The industry is full of companies talking at merchants — very few are leading with education, insight, and genuine authority.
                </p>
                <p style={styles.bodyText}>
                  Balvinder has 18+ years in payments, a deep understanding of the merchant acquisition landscape, and a growing interest in where crypto and blockchain intersect with commerce infrastructure. That combination — experience, credibility, forward-thinking — is exactly what modern B2B content audiences respond to.
                </p>
              </div>
              <div style={styles.colBlock}>
                <p style={styles.bodyText}>
                  The goal is not to produce content for content's sake. Every video, clip and post is a precision asset — designed to establish Bal as the go-to voice in UK payments, while creating a natural, non-salesy pipeline back into Trust Payments' commercial offering.
                </p>
                <p style={styles.bodyText}>
                  We looked at the creators Bal referenced — Grant Evans, Justin Hanna, Dwayne Gefferie, Simon Kemp. They are winning on LinkedIn not because they have big budgets, but because they show up consistently with confident, clear points of view. We will build that, but with better production.
                </p>
              </div>
            </div>

            {/* DUAL OBJECTIVE CARDS */}
            <div style={styles.dualCards}>
              <div style={styles.dualCard}>
                <div style={styles.dualCardIcon}>👤</div>
                <h3 style={styles.dualCardTitle}>Bal's Personal Brand</h3>
                <p style={styles.dualCardText}>Establish her as a LinkedIn Top Voice in payments and crypto. Build a following of decision-makers, merchants, and fintech operators who trust her perspective.</p>
                <ul style={styles.dualList}>
                  <li>Thought leadership positioning</li>
                  <li>Consistent, high-quality presence</li>
                  <li>Speaking opportunities & inbound</li>
                  <li>Long-term career equity</li>
                </ul>
              </div>
              <div style={styles.dualCard}>
                <div style={styles.dualCardIcon}>🏢</div>
                <h3 style={styles.dualCardTitle}>Trust Payments Pipeline</h3>
                <p style={styles.dualCardText}>Every piece of content is engineered to educate merchants on payment infrastructure — creating awareness and trust in Trust Payments' Converged Commerce™ offering.</p>
                <ul style={styles.dualList}>
                  <li>Merchant education content</li>
                  <li>Soft lead generation</li>
                  <li>Brand visibility at scale</li>
                  <li>Corporate approval aligned</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* THE APPROACH */}
        <section style={styles.sectionDark}>
          <div style={styles.sectionInner}>
            <div style={styles.sectionLabel}>// CONTENT APPROACH</div>
            <h2 style={styles.sectionTitle}>Professional. Data-led. Built for LinkedIn.</h2>
            <p style={styles.bodyTextCentre}>
              Based on the content styles Bal shared with us, the format is clear — studio talking head, podcast-style conversation, on-screen dynamic captions, graphic overlays and data visualisations. Authoritative but watchable. Not corporate fluff.
            </p>

            <div style={styles.threeGrid}>
              <div style={styles.featureCard}>
                <div style={styles.featureNum}>01</div>
                <h4 style={styles.featureTitle}>Studio Talking Head</h4>
                <p style={styles.featureText}>Bal to camera — confident, direct, expert. Shot in a clean professional studio setup with deliberate framing and lighting. The anchor format of the entire content system.</p>
              </div>
              <div style={styles.featureCard}>
                <div style={styles.featureNum}>02</div>
                <h4 style={styles.featureTitle}>Dynamic Overlays & Graphics</h4>
                <p style={styles.featureText}>On-screen captions, animated data callouts, payment stat overlays, industry figures. Every video is visually rich — designed to retain attention and communicate authority simultaneously.</p>
              </div>
              <div style={styles.featureCard}>
                <div style={styles.featureNum}>03</div>
                <h4 style={styles.featureTitle}>Topic-Led Expertise</h4>
                <p style={styles.featureText}>Content topics drawn from real industry movements — crypto in payments, POS evolution, merchant switching costs, open banking, fraud infrastructure. Bal's POV, not generic takes.</p>
              </div>
            </div>

            <div style={styles.topicsWrap}>
              <div style={styles.topicsLabel}>EXAMPLE CONTENT TOPICS</div>
              <div style={styles.topicsTags}>
                {[
                  'Why merchants are still overpaying for card processing',
                  'What stablecoins actually mean for UK merchants',
                  'The Converged Commerce™ shift nobody is talking about',
                  'Open banking: opportunity or overhype?',
                  'Why SMEs get the worst payment deals',
                  'Crypto settlement is coming — are businesses ready?',
                  'The hidden cost of switching payment providers',
                  'What a £1bn payments processor has learned about merchant trust',
                ].map((t, i) => (
                  <span key={i} style={styles.topicTag}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* DELIVERABLES */}
        <section style={styles.section} id="deliverables">
          <div style={styles.sectionInner}>
            <div style={styles.sectionLabel}>// THE FIELD PACKAGE — £2,500/MO</div>
            <h2 style={styles.sectionTitle}>What's included, every single month.</h2>

            <div style={styles.deliverablesGrid}>
              <div style={styles.deliverableCard}>
                <div style={styles.deliverableIcon}>🎬</div>
                <h4 style={styles.deliverableTitle}>1 Full Filming Day</h4>
                <p style={styles.deliverableText}>Monthly on-site studio filming session. Professional setup, lighting, direction. We come to you or use a professional London studio location. Full day with Bal to batch content efficiently.</p>
              </div>
              <div style={styles.deliverableCard}>
                <div style={styles.deliverableIcon}>✂️</div>
                <h4 style={styles.deliverableTitle}>4 Long-Form Edits</h4>
                <p style={styles.deliverableText}>Full edited pieces per month — each 3–8 minutes. Captions, overlays, graphics, colour grade. Formatted for LinkedIn video and YouTube. These are the authority-building anchor pieces.</p>
              </div>
              <div style={styles.deliverableCard}>
                <div style={styles.deliverableIcon}>📱</div>
                <h4 style={styles.deliverableTitle}>8 Short-Form Clips</h4>
                <p style={styles.deliverableText}>Punchy 30–90 second cuts pulled from the long-form. Dynamic captions, formatted for LinkedIn, Instagram Reels, TikTok. High-frequency distribution touchpoints.</p>
              </div>
              <div style={styles.deliverableCard}>
                <div style={styles.deliverableIcon}>📋</div>
                <h4 style={styles.deliverableTitle}>Content Strategy & Planning</h4>
                <p style={styles.deliverableText}>Monthly content planning session. Topics aligned to payments news cycle, Trust Payments product calendar, and Bal's business development goals. Nothing is random.</p>
              </div>
              <div style={styles.deliverableCard}>
                <div style={styles.deliverableIcon}>🚀</div>
                <h4 style={styles.deliverableTitle}>Posting & Distribution</h4>
                <p style={styles.deliverableText}>We handle all posting across LinkedIn, Instagram, and TikTok. Optimised captions, hashtags, posting times. Bal reviews and approves everything — we execute.</p>
              </div>
              <div style={styles.deliverableCard}>
                <div style={styles.deliverableIcon}>📊</div>
                <h4 style={styles.deliverableTitle}>Monthly Performance Report</h4>
                <p style={styles.deliverableText}>Clear monthly reporting — reach, engagement, follower growth, top performing content. Shared with both Bal and the Trust Payments team. Full transparency, always.</p>
              </div>
            </div>

            <div style={styles.notIncluded}>
              <div style={styles.niTitle}>What's not included in Field</div>
              <div style={styles.niItems}>
                {[
                  'Paid media / sponsored content',
                  'Additional filming days',
                  'Podcast guest coordination',
                  'Motion graphics from scratch (templates only)',
                  'Website or landing page builds',
                ].map((item, i) => (
                  <span key={i} style={styles.niItem}>✕ {item}</span>
                ))}
              </div>
              <p style={styles.niNote}>These are available as add-ons — see below.</p>
            </div>
          </div>
        </section>

        {/* ADD-ONS */}
        <section style={styles.sectionDark} id="addons">
          <div style={styles.sectionInner}>
            <div style={styles.sectionLabel}>// ADD-ONS & UPGRADES</div>
            <h2 style={styles.sectionTitle}>Expand the engagement as you scale.</h2>
            <p style={styles.bodyTextCentre}>The Field package is the foundation. These add-ons can be bolted on at any point — no need to upgrade the whole package.</p>

            <div style={styles.addonsGrid}>

              <div style={styles.addonCard}>
                <div style={styles.addonHeader}>
                  <h4 style={styles.addonTitle}>Additional Filming Day</h4>
                  <span style={styles.addonPrice}>£750/day</span>
                </div>
                <p style={styles.addonText}>A second monthly filming day — ideal for event coverage, guest interviews, or batching a higher volume of content when there's a product launch or industry moment to capitalise on.</p>
              </div>

              <div style={styles.addonCard}>
                <div style={styles.addonHeader}>
                  <h4 style={styles.addonTitle}>Guest & Podcast Format</h4>
                  <span style={styles.addonPrice}>£500/ep</span>
                </div>
                <p style={styles.addonText}>Bring in a guest — a merchant, an industry peer, a fintech founder — for a structured conversation. We handle pre-production, filming, editing, and distribution as a standalone episode asset.</p>
              </div>

              <div style={styles.addonCard}>
                <div style={styles.addonHeader}>
                  <h4 style={styles.addonTitle}>Event Videography</h4>
                  <span style={styles.addonPrice}>POA</span>
                </div>
                <p style={styles.addonText}>Conference appearances, Trust Payments events, industry panels — captured and cut into compelling content. Speaker highlights, behind-the-scenes, social moments. Quoted per event.</p>
              </div>

              <div style={styles.addonCard}>
                <div style={styles.addonHeader}>
                  <h4 style={styles.addonTitle}>Custom Motion Graphics</h4>
                  <span style={styles.addonPrice}>£350/set</span>
                </div>
                <p style={styles.addonText}>Bespoke animated graphics — branded data visualisations, animated stat cards, intro/outro sequences. Aligned to Trust Payments brand guidelines for corporate approval.</p>
              </div>

              <div style={styles.addonCard}>
                <div style={styles.addonHeader}>
                  <h4 style={styles.addonTitle}>LinkedIn Profile Optimisation</h4>
                  <span style={styles.addonPrice}>£400 one-off</span>
                </div>
                <p style={styles.addonText}>Full audit and rewrite of Bal's LinkedIn profile — headline, about section, featured section, banner. Optimised for search visibility and positioned for thought leadership from day one.</p>
              </div>

              <div style={styles.addonCard}>
                <div style={styles.addonHeader}>
                  <h4 style={styles.addonTitle}>Upgrade to Dominance</h4>
                  <span style={styles.addonPrice}>£4,999/mo</span>
                </div>
                <p style={styles.addonText}>Two filming days, 20+ assets per month, full podcast production, paid media strategy, dedicated account manager and priority turnaround. The full authority engine, fully operated.</p>
              </div>

            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section style={styles.section}>
          <div style={styles.sectionInner}>
            <div style={styles.sectionLabel}>// WHAT CLIENTS SAY</div>
            <h2 style={styles.sectionTitle}>We've done this before.</h2>
            <div style={styles.testimonialsGrid}>
              <div style={styles.testimonialCard}>
                <p style={styles.testimonialText}>"The quality of the content immediately stood out. Within weeks of posting I had people reaching out who said they'd seen my videos — people I'd been trying to get in front of for months."</p>
                <div style={styles.testimonialAuthor}>
                  <div style={styles.testimonialAvatar}>DH</div>
                  <div>
                    <div style={styles.testimonialName}>Client Name</div>
                    <div style={styles.testimonialRole}>Founder, Industry</div>
                  </div>
                </div>
              </div>
              <div style={styles.testimonialCard}>
                <p style={styles.testimonialText}>"Tom understood the dual brief immediately — content that builds my brand but also serves the business. That balance is hard to find. The system they've built just works."</p>
                <div style={styles.testimonialAuthor}>
                  <div style={styles.testimonialAvatar}>SL</div>
                  <div>
                    <div style={styles.testimonialName}>Client Name</div>
                    <div style={styles.testimonialRole}>Director, Sector</div>
                  </div>
                </div>
              </div>
              <div style={styles.testimonialCard}>
                <p style={styles.testimonialText}>"The turn around is fast, the quality is high, and they actually understand our industry. It doesn't feel like working with an agency — it feels like an extension of the team."</p>
                <div style={styles.testimonialAuthor}>
                  <div style={styles.testimonialAvatar}>RK</div>
                  <div>
                    <div style={styles.testimonialName}>Client Name</div>
                    <div style={styles.testimonialRole}>CEO, Company</div>
                  </div>
                </div>
              </div>
            </div>
            <p style={styles.testimonialNote}>* Testimonials to be populated with real client quotes before portal is shared.</p>
          </div>
        </section>

        {/* AI TOOL PLACEHOLDER */}
        <section style={styles.sectionDark} id="tool">
          <div style={styles.sectionInner}>
            <div style={styles.sectionLabel}>// INTELLIGENCE TOOL</div>
            <h2 style={styles.sectionTitle}>Built specifically for Trust Payments.</h2>
            <p style={styles.bodyTextCentre}>
              We've built a custom AI tool exclusively for this proposal — a live demonstration of how LearnLab's technical capability extends beyond content production into genuine business intelligence.
            </p>
            <div style={styles.toolPlaceholder}>
              <div style={styles.toolPlaceholderInner}>
                <div style={styles.toolIcon}>⚡</div>
                <h3 style={styles.toolPlaceholderTitle}>Tool Coming Soon</h3>
                <p style={styles.toolPlaceholderText}>This section will house a custom AI tool built specifically for Bal and Trust Payments. Launching shortly.</p>
              </div>
            </div>
          </div>
        </section>

        {/* INVESTMENT & NEXT STEPS */}
        <section style={styles.section} id="next">
          <div style={styles.sectionInner}>
            <div style={styles.sectionLabel}>// INVESTMENT</div>
            <h2 style={styles.sectionTitle}>Simple, predictable, retainer-based.</h2>

            <div style={styles.pricingCard}>
              <div style={styles.pricingLeft}>
                <div style={styles.pricingPackage}>Field Package</div>
                <div style={styles.pricingPrice}>£2,500<span style={styles.pricingPer}>/month</span></div>
                <div style={styles.pricingCommit}>Rolling monthly commitment · 30 days notice to pause or cancel</div>
              </div>
              <div style={styles.pricingRight}>
                <div style={styles.pricingIncludes}>Includes every month:</div>
                <ul style={styles.pricingList}>
                  <li>✓ 1 full filming day</li>
                  <li>✓ 4 long-form edits with overlays & captions</li>
                  <li>✓ 8 short-form clips</li>
                  <li>✓ Monthly content strategy session</li>
                  <li>✓ Full posting & distribution management</li>
                  <li>✓ Monthly performance report</li>
                </ul>
              </div>
            </div>

            <div style={styles.nextSteps}>
              <div style={styles.sectionLabel}>// NEXT STEPS</div>
              <div style={styles.stepsGrid}>
                <div style={styles.stepCard}>
                  <div style={styles.stepNum}>01</div>
                  <h4 style={styles.stepTitle}>Confirm the Brief</h4>
                  <p style={styles.stepText}>A 30-minute call with Bal and the Trust Payments stakeholder to align on goals, brand guidelines, and approval workflows.</p>
                </div>
                <div style={styles.stepCard}>
                  <div style={styles.stepNum}>02</div>
                  <h4 style={styles.stepTitle}>Sign & Onboard</h4>
                  <p style={styles.stepText}>Simple one-page agreement. First month's retainer. We'll send a detailed onboarding doc covering everything we need to get started.</p>
                </div>
                <div style={styles.stepCard}>
                  <div style={styles.stepNum}>03</div>
                  <h4 style={styles.stepTitle}>First Filming Day</h4>
                  <p style={styles.stepText}>Scheduled within two weeks of signing. We handle logistics, location if needed, and arrive with a content plan already built around Bal's schedule and topics.</p>
                </div>
                <div style={styles.stepCard}>
                  <div style={styles.stepNum}>04</div>
                  <h4 style={styles.stepTitle}>First Content Live</h4>
                  <p style={styles.stepText}>First assets delivered within 5 working days of filming. Reviewed, approved, and posted. Month one underway within 3 weeks of signing.</p>
                </div>
              </div>
            </div>

            <div style={styles.ctaBlock}>
              <h3 style={styles.ctaTitle}>Ready to build the UK's most credible payments voice?</h3>
              <p style={styles.ctaText}>Reach out directly to Tom Wallace to discuss next steps.</p>
              <div style={styles.ctaBtns}>
                <a href="mailto:tom@learnlab.studio" style={styles.ctaBtnPrimary}>Email Tom →</a>
                <a href="https://learnlab.studio/deployment" style={styles.ctaBtnSecondary}>Book a Call</a>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={styles.footer}>
          <div style={styles.footerInner}>
            <span style={styles.footerLogo}>LearnLab <span style={styles.green}>Studio</span></span>
            <span style={styles.footerText}>Private & Confidential · Prepared for Balvinder Helate & Trust Payments · March 2026</span>
            <a href="https://learnlab.studio" style={styles.footerLink}>learnlab.studio</a>
          </div>
        </footer>

      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #04100A; }
        html { scroll-behavior: smooth; }
        @media (max-width: 768px) {
          .two-col { grid-template-columns: 1fr !important; }
          .three-grid { grid-template-columns: 1fr !important; }
          .deliverables-grid { grid-template-columns: 1fr !important; }
          .addons-grid { grid-template-columns: 1fr !important; }
          .dual-cards { grid-template-columns: 1fr !important; }
          .pricing-card { flex-direction: column !important; }
          .steps-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </>
  );
}

const GREEN = '#3DDC84';
const DARK = '#04100A';
const DARK2 = '#081410';
const DARK3 = '#0D1C14';
const DARK4 = '#112018';
const TEXT = '#E2EFE6';
const TEXT_MID = '#8AAF96';
const TEXT_DIM = '#4A6E54';
const GREEN_DIM = 'rgba(61,220,132,0.10)';
const GREEN_BORDER = 'rgba(61,220,132,0.20)';

const styles = {
  // GATE
  gateWrap: { minHeight: '100vh', background: DARK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", padding: '20px' },
  gateCard: { background: DARK3, border: `1px solid ${GREEN_BORDER}`, borderRadius: '16px', padding: '48px 40px', maxWidth: '440px', width: '100%', textAlign: 'center' },
  gateLogo: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '20px', color: TEXT, letterSpacing: '-0.02em', marginBottom: '8px' },
  gateLogoAccent: { color: GREEN },
  gateLabel: { fontFamily: "'DM Sans', sans-serif", fontSize: '10px', letterSpacing: '0.15em', color: TEXT_DIM, marginBottom: '24px' },
  gateTitle: { fontFamily: "'Syne', sans-serif", fontSize: '22px', fontWeight: 700, color: TEXT, marginBottom: '28px', lineHeight: 1.3 },
  gateInput: { width: '100%', padding: '14px 18px', background: DARK4, border: `1px solid ${GREEN_BORDER}`, borderRadius: '8px', color: TEXT, fontFamily: "'DM Sans', sans-serif", fontSize: '16px', letterSpacing: '0.1em', textAlign: 'center', outline: 'none', marginBottom: '8px', transition: 'border-color 0.2s' },
  gateInputError: { borderColor: '#FF4444' },
  gateError: { color: '#FF4444', fontSize: '12px', marginBottom: '12px', fontFamily: "'DM Sans', sans-serif" },
  gateBtn: { width: '100%', padding: '14px', background: GREEN, color: DARK, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '14px', letterSpacing: '0.05em', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '8px', marginBottom: '24px' },
  gateFooter: { fontSize: '13px', color: TEXT_DIM, fontFamily: "'DM Sans', sans-serif" },
  gateLink: { color: GREEN, textDecoration: 'none' },

  // MAIN WRAP
  wrap: { minHeight: '100vh', background: DARK, fontFamily: "'DM Sans', sans-serif", color: TEXT },

  // NAV
  nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(4,16,10,0.92)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${GREEN_BORDER}` },
  navInner: { maxWidth: '1200px', margin: '0 auto', padding: '0 40px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  navLogo: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '16px', color: TEXT, letterSpacing: '-0.02em' },
  navAccent: { color: GREEN },
  navLinks: { display: 'flex', alignItems: 'center', gap: '28px' },
  navLink: { color: TEXT_MID, textDecoration: 'none', fontSize: '13px', fontWeight: 400, transition: 'color 0.2s', letterSpacing: '0.01em' },
  navLinkCta: { color: GREEN, textDecoration: 'none', fontSize: '13px', fontWeight: 600, letterSpacing: '0.01em' },

  // HERO
  hero: { paddingTop: '120px', paddingBottom: '80px', background: `linear-gradient(180deg, ${DARK2} 0%, ${DARK} 100%)`, borderBottom: `1px solid ${GREEN_BORDER}` },
  heroInner: { maxWidth: '900px', margin: '0 auto', padding: '0 40px', textAlign: 'center' },
  heroBadge: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: GREEN_DIM, border: `1px solid ${GREEN_BORDER}`, borderRadius: '20px', fontFamily: "'DM Sans', sans-serif", fontSize: '11px', letterSpacing: '0.12em', color: GREEN, marginBottom: '32px' },
  heroDot: { width: '6px', height: '6px', borderRadius: '50%', background: GREEN, display: 'inline-block', boxShadow: `0 0 8px ${GREEN}` },
  heroTitle: { fontFamily: "'Syne', sans-serif", fontSize: 'clamp(32px, 5vw, 58px)', fontWeight: 800, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '24px' },
  heroSub: { fontSize: '18px', color: TEXT_MID, lineHeight: 1.7, maxWidth: '700px', margin: '0 auto 48px', fontWeight: 300 },
  heroStats: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', background: DARK3, border: `1px solid ${GREEN_BORDER}`, borderRadius: '12px', overflow: 'hidden' },
  stat: { flex: 1, padding: '24px 20px', textAlign: 'center' },
  statNum: { display: 'block', fontFamily: "'Syne', sans-serif", fontSize: '24px', fontWeight: 800, color: GREEN, marginBottom: '4px' },
  statLabel: { display: 'block', fontSize: '11px', letterSpacing: '0.1em', color: TEXT_DIM, textTransform: 'uppercase' },
  statDivider: { width: '1px', height: '48px', background: GREEN_BORDER },

  // SECTIONS
  section: { padding: '80px 0', background: DARK },
  sectionDark: { padding: '80px 0', background: DARK2 },
  sectionInner: { maxWidth: '1200px', margin: '0 auto', padding: '0 40px' },
  sectionLabel: { fontFamily: "'DM Sans', sans-serif", fontSize: '11px', letterSpacing: '0.15em', color: GREEN, marginBottom: '16px', fontWeight: 500 },
  sectionTitle: { fontFamily: "'Syne', sans-serif", fontSize: 'clamp(26px, 3.5vw, 42px)', fontWeight: 800, color: TEXT, letterSpacing: '-0.02em', marginBottom: '24px', lineHeight: 1.15 },

  // BODY TEXT
  bodyText: { fontSize: '16px', color: TEXT_MID, lineHeight: 1.75, marginBottom: '20px', fontWeight: 300 },
  bodyTextCentre: { fontSize: '16px', color: TEXT_MID, lineHeight: 1.75, marginBottom: '48px', fontWeight: 300, textAlign: 'center', maxWidth: '700px', margin: '0 auto 48px' },

  // TWO COL
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginBottom: '56px' },
  colBlock: {},

  // DUAL CARDS
  dualCards: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
  dualCard: { background: DARK3, border: `1px solid ${GREEN_BORDER}`, borderRadius: '12px', padding: '32px' },
  dualCardIcon: { fontSize: '28px', marginBottom: '16px' },
  dualCardTitle: { fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: 700, color: TEXT, marginBottom: '12px' },
  dualCardText: { fontSize: '14px', color: TEXT_MID, lineHeight: 1.7, marginBottom: '20px', fontWeight: 300 },
  dualList: { listStyle: 'none', padding: 0 },

  // FEATURE CARDS
  threeGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '48px' },
  featureCard: { background: DARK3, border: `1px solid ${GREEN_BORDER}`, borderRadius: '12px', padding: '28px' },
  featureNum: { fontFamily: "'Syne', sans-serif", fontSize: '36px', fontWeight: 800, color: GREEN_BORDER, marginBottom: '16px', lineHeight: 1 },
  featureTitle: { fontFamily: "'Syne', sans-serif", fontSize: '17px', fontWeight: 700, color: TEXT, marginBottom: '10px' },
  featureText: { fontSize: '14px', color: TEXT_MID, lineHeight: 1.7, fontWeight: 300 },

  // TOPICS
  topicsWrap: { background: DARK3, border: `1px solid ${GREEN_BORDER}`, borderRadius: '12px', padding: '28px 32px' },
  topicsLabel: { fontSize: '10px', letterSpacing: '0.15em', color: TEXT_DIM, marginBottom: '16px', fontFamily: "'DM Sans', sans-serif" },
  topicsTags: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  topicTag: { padding: '6px 14px', background: GREEN_DIM, border: `1px solid ${GREEN_BORDER}`, borderRadius: '20px', fontSize: '13px', color: GREEN, fontFamily: "'DM Sans', sans-serif" },

  // DELIVERABLES
  deliverablesGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '32px' },
  deliverableCard: { background: DARK3, border: `1px solid ${GREEN_BORDER}`, borderRadius: '12px', padding: '28px' },
  deliverableIcon: { fontSize: '24px', marginBottom: '12px' },
  deliverableTitle: { fontFamily: "'Syne', sans-serif", fontSize: '16px', fontWeight: 700, color: TEXT, marginBottom: '10px' },
  deliverableText: { fontSize: '13px', color: TEXT_MID, lineHeight: 1.7, fontWeight: 300 },

  // NOT INCLUDED
  notIncluded: { background: DARK3, border: `1px solid rgba(255,68,68,0.15)`, borderRadius: '12px', padding: '24px 28px' },
  niTitle: { fontSize: '12px', letterSpacing: '0.1em', color: TEXT_DIM, marginBottom: '14px', fontFamily: "'DM Sans', sans-serif" },
  niItems: { display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' },
  niItem: { fontSize: '13px', color: '#8A6A6A', padding: '4px 12px', background: 'rgba(255,68,68,0.06)', border: '1px solid rgba(255,68,68,0.12)', borderRadius: '20px' },
  niNote: { fontSize: '12px', color: TEXT_DIM, fontStyle: 'italic' },

  // ADD-ONS
  addonsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' },
  addonCard: { background: DARK3, border: `1px solid ${GREEN_BORDER}`, borderRadius: '12px', padding: '28px' },
  addonHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '12px' },
  addonTitle: { fontFamily: "'Syne', sans-serif", fontSize: '16px', fontWeight: 700, color: TEXT, lineHeight: 1.2 },
  addonPrice: { fontFamily: "'Syne', sans-serif", fontSize: '14px', fontWeight: 700, color: GREEN, whiteSpace: 'nowrap' },
  addonText: { fontSize: '13px', color: TEXT_MID, lineHeight: 1.7, fontWeight: 300 },

  // TESTIMONIALS
  testimonialsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '16px' },
  testimonialCard: { background: DARK3, border: `1px solid ${GREEN_BORDER}`, borderRadius: '12px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' },
  testimonialText: { fontSize: '14px', color: TEXT_MID, lineHeight: 1.75, fontStyle: 'italic', fontWeight: 300, flex: 1 },
  testimonialAuthor: { display: 'flex', alignItems: 'center', gap: '12px' },
  testimonialAvatar: { width: '36px', height: '36px', borderRadius: '50%', background: GREEN_DIM, border: `1px solid ${GREEN_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: GREEN, fontFamily: "'Syne', sans-serif", flexShrink: 0 },
  testimonialName: { fontSize: '13px', fontWeight: 600, color: TEXT, fontFamily: "'Syne', sans-serif" },
  testimonialRole: { fontSize: '12px', color: TEXT_DIM },
  testimonialNote: { fontSize: '12px', color: TEXT_DIM, fontStyle: 'italic' },

  // TOOL PLACEHOLDER
  toolPlaceholder: { background: DARK3, border: `2px dashed ${GREEN_BORDER}`, borderRadius: '16px', padding: '80px 40px', textAlign: 'center' },
  toolPlaceholderInner: {},
  toolIcon: { fontSize: '48px', marginBottom: '20px' },
  toolPlaceholderTitle: { fontFamily: "'Syne', sans-serif", fontSize: '24px', fontWeight: 700, color: TEXT_MID, marginBottom: '12px' },
  toolPlaceholderText: { fontSize: '15px', color: TEXT_DIM, maxWidth: '400px', margin: '0 auto', lineHeight: 1.6 },

  // PRICING
  pricingCard: { display: 'flex', background: DARK3, border: `1px solid ${GREEN}`, borderRadius: '16px', overflow: 'hidden', marginBottom: '56px' },
  pricingLeft: { padding: '40px', borderRight: `1px solid ${GREEN_BORDER}`, minWidth: '260px' },
  pricingPackage: { fontSize: '11px', letterSpacing: '0.15em', color: GREEN, marginBottom: '12px', fontFamily: "'DM Sans', sans-serif" },
  pricingPrice: { fontFamily: "'Syne', sans-serif", fontSize: '48px', fontWeight: 800, color: TEXT, lineHeight: 1, marginBottom: '12px' },
  pricingPer: { fontSize: '20px', fontWeight: 400, color: TEXT_MID },
  pricingCommit: { fontSize: '12px', color: TEXT_DIM, lineHeight: 1.5 },
  pricingRight: { padding: '40px', flex: 1 },
  pricingIncludes: { fontSize: '11px', letterSpacing: '0.12em', color: TEXT_DIM, marginBottom: '16px' },
  pricingList: { listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' },

  // NEXT STEPS
  nextSteps: { marginBottom: '56px' },
  stepsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginTop: '24px' },
  stepCard: { background: DARK3, border: `1px solid ${GREEN_BORDER}`, borderRadius: '12px', padding: '24px' },
  stepNum: { fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: 800, color: GREEN_BORDER, marginBottom: '12px', lineHeight: 1 },
  stepTitle: { fontFamily: "'Syne', sans-serif", fontSize: '15px', fontWeight: 700, color: TEXT, marginBottom: '8px' },
  stepText: { fontSize: '13px', color: TEXT_MID, lineHeight: 1.65, fontWeight: 300 },

  // CTA
  ctaBlock: { background: `linear-gradient(135deg, ${DARK3} 0%, ${DARK4} 100%)`, border: `1px solid ${GREEN}`, borderRadius: '16px', padding: '48px', textAlign: 'center' },
  ctaTitle: { fontFamily: "'Syne', sans-serif", fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, color: TEXT, marginBottom: '12px', letterSpacing: '-0.02em' },
  ctaText: { fontSize: '16px', color: TEXT_MID, marginBottom: '28px', fontWeight: 300 },
  ctaBtns: { display: 'flex', gap: '16px', justifyContent: 'center' },
  ctaBtnPrimary: { padding: '14px 32px', background: GREEN, color: DARK, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '14px', borderRadius: '8px', textDecoration: 'none', letterSpacing: '0.02em' },
  ctaBtnSecondary: { padding: '14px 32px', background: 'transparent', color: GREEN, fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: '14px', borderRadius: '8px', textDecoration: 'none', border: `1px solid ${GREEN_BORDER}`, letterSpacing: '0.02em' },

  // FOOTER
  footer: { borderTop: `1px solid ${GREEN_BORDER}`, padding: '24px 0', background: DARK2 },
  footerInner: { maxWidth: '1200px', margin: '0 auto', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' },
  footerLogo: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '14px', color: TEXT },
  footerText: { fontSize: '12px', color: TEXT_DIM, textAlign: 'center' },
  footerLink: { fontSize: '12px', color: GREEN, textDecoration: 'none' },

  green: { color: GREEN },
};