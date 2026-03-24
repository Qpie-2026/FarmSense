import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: #0d1620;
    min-height: 100vh;
  }

  .page {
    width: 100%;
    min-height: 100vh;
    background: #0d1620;
    display: flex;
    flex-direction: column;
  }

  .navbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 20px;
    font-weight: 700;
    color: #3ddc84;
  }

  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 36px 20px 20px;
    max-width: 480px;
    margin: 0 auto;
    width: 100%;
  }

  .page-title {
    font-size: 36px;
    font-weight: 700;
    color: #ffffff;
    text-align: center;
    line-height: 1.1;
    margin-bottom: 12px;
  }

  .page-sub {
    font-size: 16px;
    color: #7a9a95;
    text-align: center;
    line-height: 1.5;
    margin-bottom: 36px;
  }

  .field-group {
    margin-bottom: 20px;
  }

  .field-label {
    font-size: 14px;
    font-weight: 500;
    color: #c0d8d4;
    margin-bottom: 8px;
    display: block;
  }

  .input-wrap {
    display: flex;
    align-items: center;
    background: #1a2535;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    overflow: hidden;
    transition: border-color 0.2s;
  }

  .input-wrap:focus-within {
    border-color: #3ddc84;
  }

  .input-icon {
    padding: 0 14px;
    display: flex;
    align-items: center;
    color: #3ddc84;
    opacity: 0.5;
  }

  .input-icon svg {
    width: 18px;
    height: 18px;
  }

  .prefix {
    padding: 0 14px;
    font-size: 15px;
    font-weight: 600;
    color: #c0d8d4;
    border-right: 1px solid rgba(255,255,255,0.08);
    height: 52px;
    display: flex;
    align-items: center;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .input-wrap input,
  .input-wrap select {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: #e0e0e0;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    padding: 0 14px;
    height: 52px;
    width: 100%;
  }

  .input-wrap input::placeholder {
    color: #3a5a55;
  }

  .input-wrap select {
    color: #e0e0e0;
    appearance: none;
    cursor: pointer;
  }

  .input-wrap select option {
    background: #1a2535;
    color: #e0e0e0;
  }

  .select-wrap {
    position: relative;
  }

  .select-arrow {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: #3ddc84;
    opacity: 0.7;
  }

  .select-arrow svg {
    width: 16px;
    height: 16px;
  }

  .cta-btn {
    width: 100%;
    height: 58px;
    background: #3ddc84;
    border: none;
    border-radius: 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 17px;
    font-weight: 700;
    color: #0a1a10;
    cursor: pointer;
    margin-top: 8px;
    margin-bottom: 22px;
    transition: background 0.2s, transform 0.1s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    letter-spacing: 0.01em;
  }

  .cta-btn:hover { background: #33cc78; }
  .cta-btn:active { transform: scale(0.985); }

  .signin-row {
    text-align: center;
    font-size: 15px;
    color: #6a8a85;
    margin-bottom: 40px;
  }

  .signin-link {
    color: #3ddc84;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    margin-left: 4px;
  }

  .signin-link:hover { text-decoration: underline; }

  .footer {
    margin-top: auto;
    padding: 0 20px 28px;
    max-width: 480px;
    margin-left: auto;
    margin-right: auto;
    width: 100%;
  }

  .security-badge {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    padding: 12px 16px;
    margin-bottom: 20px;
  }

  .security-badge svg {
    color: #3ddc84;
    flex-shrink: 0;
    width: 16px;
    height: 16px;
  }

  .security-text {
    font-size: 13px;
    color: #3ddc84;
    font-weight: 500;
  }

  .footer-links {
    display: flex;
    justify-content: center;
    gap: 24px;
    margin-bottom: 10px;
  }

  .footer-link {
    font-size: 13px;
    color: #4a6a65;
    text-decoration: none;
    cursor: pointer;
    transition: color 0.2s;
  }

  .footer-link:hover { color: #8aada8; }

  .support-link {
    text-align: center;
    font-size: 13px;
    color: #4a6a65;
    cursor: pointer;
    transition: color 0.2s;
  }

  .support-link:hover { color: #8aada8; }

  .error-msg {
    font-size: 12px;
    color: #ff6b6b;
    margin-top: 5px;
    padding-left: 4px;
  }
`;

const crops = [
  "Wheat", "Rice", "Maize", "Cotton", "Sugarcane",
  "Soybean", "Groundnut", "Onion", "Potato", "Tomato",
  "Chilli", "Turmeric", "Jowar", "Bajra", "Tur Dal",
];

export default function MandAIRegister() {
  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    crop: "",
    location: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const update = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!/^\d{10}$/.test(form.mobile)) e.mobile = "Enter a valid 10-digit mobile number";
    if (!form.crop) e.crop = "Please select your primary crop";
    if (!form.location.trim()) e.location = "Please enter your district or mandi location";
    if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    if (form.confirmPassword !== form.password) e.confirmPassword = "Passwords do not match";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    alert("Account created successfully!");
  };

  return (
    <>
      <style>{styles}</style>
      <div className="page">

        <nav className="navbar">
          <div className="logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 17c3-3 5-5 9-5s6 2 9 5"/>
              <path d="M3 11c3-4 5-6 9-6s6 2 9 6"/>
              <circle cx="12" cy="20" r="1" fill="currentColor"/>
            </svg>
            MandAI
          </div>
        </nav>

        <div className="main">
          <h1 className="page-title">Join MandAI</h1>
          <p className="page-sub">Start maximizing your crop profits today.</p>

          {/* Full Name */}
          <div className="field-group">
            <label className="field-label">Full Name</label>
            <div className="input-wrap">
              <span className="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Enter your full name"
                value={form.fullName}
                onChange={e => update("fullName", e.target.value)}
              />
            </div>
            {errors.fullName && <p className="error-msg">{errors.fullName}</p>}
          </div>

          {/* Mobile Number */}
          <div className="field-group">
            <label className="field-label">Mobile Number</label>
            <div className="input-wrap">
              <span className="prefix">+91</span>
              <input
                type="tel"
                placeholder="9876543210"
                value={form.mobile}
                onChange={e => update("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
              />
            </div>
            {errors.mobile && <p className="error-msg">{errors.mobile}</p>}
          </div>

          {/* Primary Crop */}
          <div className="field-group">
            <label className="field-label">Primary Crop</label>
            <div className="input-wrap select-wrap">
              <span className="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22V12"/>
                  <path d="M5 12C5 7 8 4 12 2c4 2 7 5 7 10"/>
                  <path d="M5 12c2-1 5-1 7 0"/>
                </svg>
              </span>
              <select value={form.crop} onChange={e => update("crop", e.target.value)}>
                <option value="" disabled>Select Crop</option>
                {crops.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <span className="select-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </span>
            </div>
            {errors.crop && <p className="error-msg">{errors.crop}</p>}
          </div>

          {/* District / Mandi Location */}
          <div className="field-group">
            <label className="field-label">District / Mandi Location</label>
            <div className="input-wrap">
              <span className="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search for your nearest market"
                value={form.location}
                onChange={e => update("location", e.target.value)}
              />
            </div>
            {errors.location && <p className="error-msg">{errors.location}</p>}
          </div>

          {/* Password */}
          <div className="field-group">
            <label className="field-label">Password</label>
            <div className="input-wrap">
              <span className="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => update("password", e.target.value)}
              />
            </div>
            {errors.password && <p className="error-msg">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="field-group">
            <label className="field-label">Confirm Password</label>
            <div className="input-wrap">
              <span className="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <polyline points="9 12 11 14 15 10"/>
                </svg>
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={e => update("confirmPassword", e.target.value)}
              />
            </div>
            {errors.confirmPassword && <p className="error-msg">{errors.confirmPassword}</p>}
          </div>

          <button className="cta-btn" onClick={handleSubmit}>
            Create Farmer Account
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>

          <p className="signin-row">
            Already have an account?
            <a className="signin-link" href="#">Sign In</a>
          </p>
        </div>

        <div className="footer">
          <div className="security-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
            <span className="security-text">Secure &amp; Encrypted – Farmer Data Protected</span>
          </div>

          <div className="footer-links">
            <a className="footer-link" href="#">Privacy Policy</a>
            <a className="footer-link" href="#">Terms of Service</a>
          </div>
          <p className="support-link">Support Center</p>
        </div>

      </div>
    </>
  );
}