import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tools = [
    {
      id: 'meeting-intel',
      title: 'Meeting Intel Agent',
      status: 'ONLINE',
      desc: 'Autonomous intelligence node. Input target details to generate a strategic battlecard.',
      link: '/meeting-agent',
      github: 'https://github.com/thomasw101/meeting-intelligence-agent'
    },
    {
      id: 'tool-2',
      title: 'Coming Soon',
      status: 'OFFLINE',
      desc: 'Currently building. This module will be available in a future update.',
      link: '#',
      github: null
    },
    {
      id: 'tool-3',
      title: 'Coming Soon',
      status: 'OFFLINE',
      desc: 'Currently building. This module will be available in a future update.',
      link: '#',
      github: null
    },
    {
      id: 'tool-4',
      title: 'Coming Soon',
      status: 'OFFLINE',
      desc: 'Currently building. This module will be available in a future update.',
      link: '#',
      github: null
    }
  ];

  if (!mounted) return null;

  return (
    <Layout>
      <div className="dashboard-container">

        <div className="hero">
          <div className="eyebrow">// INTELLIGENCE_HUB</div>
          <h1>Select Active <span className="highlight">Module.</span></h1>
          <p className="subtext">Open-source AI tools, built in public. Free to use.</p>
        </div>

        <div className="grid">
          {tools.map((tool) => (
            <div key={tool.id} className={`card ${tool.status !== 'ONLINE' ? 'locked' : ''}`}>
              <div className={`status ${tool.status === 'ONLINE' ? 'online' : 'offline'}`}>
                // {tool.status}
              </div>

              <h3>{tool.title}</h3>
              <p>{tool.desc}</p>

              {tool.status === 'ONLINE' ? (
                <button onClick={() => router.push(tool.link)} className="btn-primary">
                  Initialise Tool
                </button>
              ) : (
                <button disabled className="btn-locked">
                  Coming Soon
                </button>
              )}

              {/* View Source */}
              {tool.github ? (
                <a href={tool.github} target="_blank" rel="noopener noreferrer" className="btn-source">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  View Source
                </a>
              ) : (
                <div className="btn-source-disabled">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  View Source
                </div>
              )}
            </div>
          ))}
        </div>

        <style jsx>{`
          .dashboard-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 80px 20px 100px;
          }

          .hero {
            text-align: center;
            margin-bottom: 80px;
            cursor: default;
          }

          .eyebrow {
            font-family: 'JetBrains Mono';
            color: var(--accent);
            font-size: 11px;
            letter-spacing: 0.2em;
            margin-bottom: 20px;
            display: inline-block;
            transition: all 0.4s ease;
          }

          .hero:hover .eyebrow {
            color: var(--warm);
            letter-spacing: 0.3em;
            text-shadow: 0 0 10px rgba(255, 107, 53, 0.5);
          }

          h1 {
            font-size: 48px;
            font-weight: 800;
            margin-bottom: 16px;
            color: #fff;
            transition: all 0.4s ease;
          }

          .highlight {
            color: var(--warm);
            transition: all 0.4s ease;
          }

          .hero:hover h1 {
            transform: translateY(-2px) scale(1.01);
            text-shadow: 0 10px 30px rgba(0,0,0,0.5);
          }

          .hero:hover .highlight {
            text-shadow: 0 0 25px rgba(255, 107, 53, 0.6);
            filter: brightness(1.2);
          }

          .subtext {
            color: var(--text-2);
            font-size: 14px;
            margin: 0;
          }

          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 30px;
          }

          .card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 24px;
            padding: 40px;
            display: flex;
            flex-direction: column;
            backdrop-filter: blur(10px);
            transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
            cursor: default;
          }

          .card:hover {
            transform: translateY(-8px);
            border-color: rgba(125, 249, 255, 0.3);
            background: rgba(255, 255, 255, 0.06);
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          }

          .card.locked {
            opacity: 0.35;
            filter: grayscale(0.4);
          }

          .card.locked:hover {
            transform: none;
            border-color: var(--border);
            background: var(--surface);
            box-shadow: none;
          }

          .status {
            font-family: 'JetBrains Mono';
            font-size: 10px;
            margin-bottom: 15px;
            color: var(--text-2);
          }

          .status.online { color: #34D399; }
          .status.offline { color: var(--warm); }

          h3 {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #fff;
            transition: 0.3s;
          }

          .card:not(.locked):hover h3 {
            color: var(--accent);
            text-shadow: 0 0 15px rgba(125, 249, 255, 0.4);
          }

          p {
            color: var(--text-2);
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 30px;
            flex-grow: 1;
            transition: 0.3s;
          }

          .card:not(.locked):hover p {
            color: #fff;
            transform: translateX(4px);
          }

          .btn-primary {
            width: 100%;
            padding: 16px;
            background: var(--accent);
            color: #000;
            border: none;
            border-radius: 12px;
            font-weight: bold;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            transition: 0.3s;
            margin-bottom: 10px;
          }

          .btn-primary:hover {
            box-shadow: 0 0 15px rgba(125, 249, 255, 0.4);
            transform: scale(1.02);
          }

          .btn-locked {
            width: 100%;
            padding: 16px;
            background: transparent;
            border: 1px solid var(--border);
            color: var(--text-2);
            border-radius: 12px;
            cursor: not-allowed;
            font-family: 'JetBrains Mono';
            font-size: 11px;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            margin-bottom: 10px;
          }

          .btn-source {
            width: 100%;
            padding: 12px 16px;
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            color: rgba(255,255,255,0.35);
            border-radius: 12px;
            font-family: 'JetBrains Mono';
            font-size: 11px;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            text-decoration: none;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: 0.2s;
            box-sizing: border-box;
          }

          .btn-source:hover {
            background: rgba(255,255,255,0.08);
            color: rgba(255,255,255,0.7);
            border-color: rgba(255,255,255,0.15);
          }

          .btn-source-disabled {
            width: 100%;
            padding: 12px 16px;
            background: rgba(255,255,255,0.02);
            border: 1px solid rgba(255,255,255,0.05);
            color: rgba(255,255,255,0.15);
            border-radius: 12px;
            font-family: 'JetBrains Mono';
            font-size: 11px;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            box-sizing: border-box;
          }
        `}</style>
      </div>
    </Layout>
  );
}