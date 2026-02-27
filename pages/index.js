import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState(false);

  const handleAccessTools = () => {
    // If already registered, skip straight to dashboard
    const existing = localStorage.getItem('ll_user');
    if (existing) {
      router.push('/dashboard');
    } else {
      router.push('/register');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const code = accessCode.trim().toUpperCase();
    const clientMap = {
      'NIKE': '/clients/nike',
      'ADIDAS': '/clients/adidas'
    };
    if (clientMap[code]) {
      router.push(clientMap[code]);
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <Layout>
      <div className="landing-container">
        
        {/* --- LOGO SECTION --- */}
        <div className="logo-section">
          <a href="https://learnlab.studio/" style={{ display: 'inline-block', lineHeight: 0 }}>
            <img src="/logo.png" alt="LearnLab Studio" className="interactive-logo" />
          </a>
        </div>

        <div className="cards-wrapper">
          {/* --- LEFT CARD: PUBLIC --- */}
          <div className="split-card">
            <div className="content">
              <div className="status-tag">// PUBLIC_ACCESS</div>
              <h2>Public Intelligence.</h2>
              <p>Access our open-source agent repository. Calibrate your profile to begin using the tools.</p>
              <button onClick={handleAccessTools} className="btn-primary">
                Access Tools
              </button>
            </div>
          </div>

          {/* --- RIGHT CARD: CLIENT --- */}
          <div className="split-card">
            <div className="content">
              <div className="status-tag warm">// CLIENT_PORTAL</div>
              <h2>Active Operations.</h2>
              <p>Secure encrypted access for active operations. Initiate uplink with your provided code.</p>
              
              <form onSubmit={handleLogin} style={{ width: '100%' }}>
                <input 
                  type="text" 
                  placeholder="ENTER ACCESS CODE" 
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className={`input-field ${error ? 'error' : ''}`}
                />
                <button type="submit" className="btn-outline">
                  INITIATE UPLINK
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* --- STYLES --- */}
        <style jsx>{`
          .landing-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px;
          }

          .logo-section {
            margin-bottom: 50px;
            animation: fadeIn 1s ease-out;
          }

          .interactive-logo {
            height: 80px;
            width: auto;
            transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
            filter: brightness(0.9);
            cursor: pointer;
          }

          .interactive-logo:hover {
            transform: scale(1.05);
            filter: brightness(1.2) drop-shadow(0 0 20px rgba(125, 249, 255, 0.3));
          }

          .cards-wrapper {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            width: 100%;
            max-width: 1200px;
          }

          .split-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 28px;
            height: 480px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 50px;
            backdrop-filter: blur(20px);
            transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
            position: relative;
            overflow: hidden;
          }

          .split-card:hover {
            transform: translateY(-8px);
            border-color: rgba(125, 249, 255, 0.2);
            background: rgba(255, 255, 255, 0.05);
            box-shadow: 0 30px 60px rgba(0,0,0,0.5);
          }

          .content {
            width: 100%;
            max-width: 420px;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
          }

          .status-tag {
            font-family: 'JetBrains Mono';
            color: var(--accent);
            font-size: 11px;
            letter-spacing: 0.2em;
            margin-bottom: 20px;
            opacity: 0.8;
          }
          .status-tag.warm { color: var(--warm); }

          h2 {
            font-size: 42px;
            font-weight: 800;
            margin-bottom: 16px;
            color: #fff;
            line-height: 1.1;
            transition: 0.3s;
          }

          .split-card:hover h2 {
            text-shadow: 0 0 30px rgba(255, 255, 255, 0.2);
          }

          p {
            color: var(--text-2);
            font-size: 15px;
            line-height: 1.6;
            margin-bottom: 35px;
            transition: 0.3s;
          }

          .split-card:hover p {
            color: #fff;
          }

          .input-field {
            width: 100%;
            padding: 18px;
            background: rgba(0,0,0,0.3);
            border: 1px solid var(--border);
            color: #fff;
            border-radius: 12px;
            margin-bottom: 12px;
            font-family: 'JetBrains Mono';
            outline: none;
            font-size: 13px;
            transition: 0.3s;
            box-sizing: border-box;
          }
          .input-field:focus { border-color: var(--warm); background: rgba(0,0,0,0.5); }
          .input-field.error { border-color: red; animation: shake 0.4s; }

          .btn-primary {
            width: 100%;
            padding: 18px;
            background: var(--accent);
            color: #000;
            border: none;
            border-radius: 12px;
            font-weight: 800;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            transition: 0.3s;
          }
          .btn-primary:hover {
            box-shadow: 0 0 25px rgba(125, 249, 255, 0.4);
            transform: scale(1.02);
          }

          .btn-outline {
            width: 100%;
            padding: 18px;
            background: transparent;
            border: 1px solid var(--border);
            color: #fff;
            border-radius: 12px;
            font-weight: 800;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            transition: 0.3s;
          }
          .btn-outline:hover {
            border-color: var(--warm);
            color: var(--warm);
            background: rgba(255, 107, 53, 0.1);
          }

          @keyframes fadeIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }

          @media (max-width: 900px) {
            .cards-wrapper { grid-template-columns: 1fr; }
            .split-card { height: auto; padding: 40px; }
          }
        `}</style>
      </div>
    </Layout>
  );
}