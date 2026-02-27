import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', company: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [welcome, setWelcome] = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem('ll_user');
    if (existing) router.replace('/dashboard');
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const validate = () => {
    if (form.firstName.trim().length < 2) return 'Please enter your first name.';
    if (form.lastName.trim().length < 2) return 'Please enter your last name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email address.';
    if (form.company.trim().length < 2) return 'Please enter your company name.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setLoading(true);

    try {
      await fetch('https://hook.eu1.make.com/gob2p86lwlj9td5whlc4wsvaorx4w0m4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim().toLowerCase(),
          company: form.company.trim(),
          timestamp: new Date().toISOString(),
          source: 'app.learnlab.studio'
        })
      });
    } catch (err) {
      console.error('Webhook error:', err);
    }

    localStorage.setItem('ll_user', JSON.stringify({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      company: form.company.trim()
    }));

    setLoading(false);
    setWelcome(true);
    setTimeout(() => router.push('/dashboard'), 2500);
  };

  if (welcome) {
    return (
      <Layout>
        <div className="welcome-screen">
          <div className="welcome-inner">
            <div className="eyebrow">// ACCESS_GRANTED</div>
            <h1>Welcome, <span className="highlight">{form.firstName}.</span></h1>
            <p>Initialising your intelligence hub...</p>
            <div className="loader">
              <div className="loader-bar" />
            </div>
          </div>
          <style jsx>{`
            .welcome-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; }
            .welcome-inner { animation: fadeIn 0.6s ease-out; }
            .eyebrow { font-family: 'JetBrains Mono'; color: #34D399; font-size: 11px; letter-spacing: 0.2em; margin-bottom: 20px; }
            h1 { font-size: 56px; font-weight: 800; color: #fff; margin-bottom: 16px; }
            .highlight { color: var(--warm); }
            p { color: var(--text-2); font-family: 'JetBrains Mono'; font-size: 12px; letter-spacing: 0.15em; margin-bottom: 40px; }
            .loader { width: 200px; height: 2px; background: var(--border); border-radius: 2px; margin: 0 auto; overflow: hidden; }
            .loader-bar { height: 100%; width: 0%; background: var(--accent); border-radius: 2px; animation: load 2.2s ease-out forwards; }
            @keyframes load { to { width: 100%; } }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          `}</style>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="register-container">
        <div className="register-card">
          <div className="eyebrow">// CALIBRATE_PROFILE</div>
          <h1>Access Intelligence<br /><span className="highlight">Hub.</span></h1>
          <p>Enter your details to unlock the tool suite. You'll only need to do this once.</p>

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="field">
                <label>First Name</label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  autoComplete="off"
                />
              </div>
              <div className="field">
                <label>Last Name</label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="field">
              <label>Email Address</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="off"
              />
            </div>

            <div className="field">
              <label>Company</label>
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                autoComplete="off"
              />
            </div>

            {error && <div className="error-msg">{error}</div>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Initialising...' : 'Unlock Tools →'}
            </button>
          </form>
        </div>

        <style jsx>{`
          .register-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .register-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 28px;
            padding: 60px;
            width: 100%;
            max-width: 560px;
            backdrop-filter: blur(20px);
            animation: fadeIn 0.6s ease-out;
          }
          .eyebrow { font-family: 'JetBrains Mono'; color: var(--accent); font-size: 11px; letter-spacing: 0.2em; margin-bottom: 20px; }
          h1 { font-size: 44px; font-weight: 800; color: #fff; line-height: 1.1; margin-bottom: 16px; }
          .highlight { color: var(--warm); }
          p { color: var(--text-2); font-size: 14px; line-height: 1.6; margin-bottom: 40px; }
          .row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          .field { margin-bottom: 20px; display: flex; flex-direction: column; }
          label { font-family: 'JetBrains Mono'; font-size: 10px; letter-spacing: 0.15em; color: var(--text-2); margin-bottom: 8px; text-transform: uppercase; }
          input { padding: 16px 18px; background: rgba(0,0,0,0.3); border: 1px solid var(--border); color: #fff; border-radius: 12px; font-size: 14px; outline: none; transition: 0.3s; font-family: inherit; }
          input:focus { border-color: var(--accent); background: rgba(0,0,0,0.5); }
          .error-msg { font-family: 'JetBrains Mono'; font-size: 11px; color: #FF6B6B; margin-bottom: 16px; letter-spacing: 0.05em; }
          .btn-primary { width: 100%; padding: 18px; background: var(--accent); color: #000; border: none; border-radius: 12px; font-weight: 800; cursor: pointer; text-transform: uppercase; letter-spacing: 0.08em; font-size: 14px; transition: 0.3s; margin-top: 8px; }
          .btn-primary:hover:not(:disabled) { box-shadow: 0 0 25px rgba(125, 249, 255, 0.4); transform: scale(1.02); }
          .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @media (max-width: 600px) {
            .register-card { padding: 40px 30px; }
            .row { grid-template-columns: 1fr; }
            h1 { font-size: 36px; }
          }
        `}</style>
      </div>
    </Layout>
  );
}