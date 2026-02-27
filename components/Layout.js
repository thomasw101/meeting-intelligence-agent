import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const canvasRef = useRef(null);
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem('ll_user');
      if (stored) {
        const user = JSON.parse(stored);
        if (user.firstName) setFirstName(user.firstName);
      }
    } catch (e) {}
  }, []);

  const showNav = router.pathname !== '/';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height, particles = [], animFrameId;
    let mouse = { x: null, y: null };

    const handleMouseMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };

    const init = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      particles = [];
      for (let i = 0; i < 140; i++) {
        particles.push({
          x: Math.random() * width, y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 2.5 + 1,
          color: Math.random() > 0.8 ? '#FF6B35' : (Math.random() > 0.5 ? '#7DF9FF' : '#ffffff'),
          opacity: Math.random() * 0.4 + 0.2
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (mouse.x != null) {
          let dx = p.x - mouse.x, dy = p.y - mouse.y;
          let dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            let force = (150 - dist) / 150;
            p.x += (dx / dist) * force * 5;
            p.y += (dy / dist) * force * 5;
          }
        }
        if (p.x < 0) p.x = width; if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height; if (p.y > height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      });
      animFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', init);
    window.addEventListener('mousemove', handleMouseMove);
    init(); animate();

    return () => {
      window.removeEventListener('resize', init);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden' }}>

      <canvas ref={canvasRef} style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        zIndex: 0, pointerEvents: 'none'
      }} />

      {showNav && (
        <div style={{
          position: 'fixed', top: '24px', left: 0, right: 0,
          zIndex: 100, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 32px',
          pointerEvents: 'none',
        }}>

          {/* LEFT — L logo pill + back button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'all' }}>
            <a
              href="https://learnlab.studio/"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                textDecoration: 'none',
                background: 'rgba(10,10,10,0.75)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: '999px',
                width: '44px', height: '44px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,107,53,0.4)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'}
            >
              <img src="/LLS_L_Only_Colour.png" alt="LearnLab" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
            </a>

            <button
              onClick={() => router.back()}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(10,10,10,0.75)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: '999px',
                padding: '10px 18px',
                color: 'rgba(255,255,255,0.55)',
                fontFamily: 'JetBrains Mono',
                fontSize: '10px',
                letterSpacing: '0.12em',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(125,249,255,0.1)';
                e.currentTarget.style.borderColor = 'rgba(125,249,255,0.35)';
                e.currentTarget.style.color = '#7DF9FF';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(10,10,10,0.75)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
              }}
            >
              ← BACK
            </button>
          </div>

          {/* RIGHT — welcome message pill */}
          {mounted && firstName && (
            <div style={{
              pointerEvents: 'all',
              background: 'rgba(10,10,10,0.75)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '999px',
              padding: '10px 18px',
              fontFamily: 'JetBrains Mono',
              fontSize: '10px',
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.35)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              whiteSpace: 'nowrap',
            }}>
              // WELCOME,{' '}
              <span style={{ color: 'var(--accent)' }}>
                {firstName.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>

      <footer style={{
        position: 'fixed', bottom: 20, width: '100%', textAlign: 'center',
        fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--text-2)',
        zIndex: 0, pointerEvents: 'none', letterSpacing: '0.1em'
      }}>
        POWERED BY LEARNLAB STUDIO
      </footer>
    </div>
  );
}