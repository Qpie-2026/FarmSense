import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: #0d1f1e;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .page {
    width: 100%;
    min-height: 100vh;
    background: radial-gradient(ellipse at 50% 0%, #1a3530 0%, #0d1f1e 60%);
    display: flex;
    flex-direction: column;
  }

  .navbar {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 18px 24px;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 22px;
    font-weight: 700;
    color: #3ddc84;
    margin-right: auto;
  }

  .logo svg {
    color: #3ddc84;
  }

  .lang-btn {
    background: none;
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    padding: 6px 14px;
    border-radius: 20px;
    transition: all 0.2s;
  }

  .lang-btn.active {
    background: #2a2a2a;
    color: #fff;
  }

  .lang-btn.inactive {
    color: #8aada8;
  }

  .lang-btn.inactive:hover {
    color: #fff;
  }

  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 20px 24px 40px;
    max-width: 480px;
    margin: 0 auto;
    width: 100%;
  }

  .card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: 32px 28px;
    backdrop-filter: blur(10px);
  }

  .heading {
    font-size: 32px;
    font-weight: 700;
    color: #ffffff;
    line-height: 1.2;
    margin-bottom: 8px;
  }

  .subheading {
    font-size: 15px;
    color: #8aada8;
    margin-bottom: 28px;
  }

  .social-row {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
  }

  .social-btn {
    flex: 1;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
    color: #ccc;
  }

  .social-btn:hover {
    background: rgba(255,255,255,0.1);
    border-color: rgba(255,255,255,0.15);
  }

  .social-btn svg {
    width: 22px;
    height: 22px;
    color: #aaa;
  }

  .divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
  }

  .divider-line {
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,0.08);
  }

  .divider-text {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: #4a6a65;
    white-space: nowrap;
  }

  .field-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: #8aada8;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .forgot {
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0;
    color: #3ddc84;
    text-transform: none;
    cursor: pointer;
    text-decoration: none;
  }

  .forgot:hover { text-decoration: underline; }

  .field-group {
    margin-bottom: 18px;
  }

  .input-wrap {
    display: flex;
    align-items: center;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    overflow: hidden;
    transition: border-color 0.2s;
  }

  .input-wrap:focus-within {
    border-color: #3ddc84;
  }

  .prefix {
    padding: 0 14px;
    font-size: 15px;
    font-weight: 600;
    color: #aaa;
    border-right: 1px solid rgba(255,255,255,0.08);
    height: 52px;
    display: flex;
    align-items: center;
    white-space: nowrap;
  }

  .input-wrap input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: #e0e0e0;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    padding: 0 16px;
    height: 52px;
  }

  .input-wrap input::placeholder {
    color: #3a5a55;
  }

  .sign-btn {
    width: 100%;
    height: 56px;
    background: #f5a623;
    border: none;
    border-radius: 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 17px;
    font-weight: 700;
    color: #1a1000;
    cursor: pointer;
    margin-top: 8px;
    margin-bottom: 20px;
    transition: background 0.2s, transform 0.1s;
    letter-spacing: 0.01em;
  }

  .sign-btn:hover { background: #e89c18; }
  .sign-btn:active { transform: scale(0.985); }

  .security-badge {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    background: rgba(61,220,132,0.07);
    border: 1px solid rgba(61,220,132,0.12);
    border-radius: 12px;
    padding: 12px 16px;
    margin-bottom: 24px;
  }

  .security-badge svg {
    color: #3ddc84;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .security-text {
    font-size: 14px;
    color: #3ddc84;
    font-weight: 500;
    line-height: 1.4;
  }

  .register-row {
    text-align: center;
    font-size: 14px;
    color: #6a8a85;
  }

  .register-link {
    color: #3ddc84;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
  }

  .register-link:hover { text-decoration: underline; }
`;

export default function MandAILogin() {
  const [lang, setLang] = useState("English");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const langs = ["English", "Hindi", "Marathi"];

  return (
    <>
      <style>{styles}</style>
      <div className="page">
        <nav className="navbar">
          <div className="logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            MandAI
          </div>
          {langs.map(l => (
            <button
              key={l}
              className={`lang-btn ${l === lang ? "active" : "inactive"}`}
              onClick={() => setLang(l)}
            >
              {l}
            </button>
          ))}
        </nav>

        <div className="main">
          <div className="card">
            <h1 className="heading">Welcome Back</h1>
            <p className="subheading">Sign in to get your crop price predictions</p>

            <div className="social-row">
              {/* Document / ID icon */}
              <button className="social-btn" title="Sign in with ID">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="3" width="16" height="18" rx="2"/>
                  <line x1="8" y1="8" x2="16" y2="8"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                  <line x1="8" y1="16" x2="12" y2="16"/>
                </svg>
              </button>
              {/* Phone icon */}
              <button className="social-btn" title="Sign in with Phone">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="7" y="2" width="10" height="20" rx="2"/>
                  <circle cx="12" cy="18" r="1"/>
                </svg>
              </button>
              {/* Chat / OTP icon */}
              <button className="social-btn" title="Sign in with OTP">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </button>
            </div>

            <div className="divider">
              <div className="divider-line"/>
              <span className="divider-text">OR USE MOBILE</span>
              <div className="divider-line"/>
            </div>

            <div className="field-group">
              <div className="field-label">MOBILE NUMBER</div>
              <div className="input-wrap">
                <span className="prefix">+91</span>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  maxLength={10}
                />
              </div>
            </div>

            <div className="field-group">
              <div className="field-label">
                PASSWORD
                <a className="forgot" href="#">Forgot password?</a>
              </div>
              <div className="input-wrap">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button className="sign-btn">Sign In to Dashboard</button>

            <div className="security-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9 12 11 14 15 10"/>
              </svg>
              <span className="security-text">Secure &amp; Encrypted – Farmer Data Protected</span>
            </div>

            <p className="register-row">
              Don't have an account?{" "}
              <a className="register-link" href="#">Register as Farmer</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}