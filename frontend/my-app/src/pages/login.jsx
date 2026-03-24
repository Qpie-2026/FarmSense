import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import { useAuthLanguage } from "../lib/authI18n.js";

export default function MandAILogin() {
  const { language, setLanguage, languages, copy } = useAuthLanguage();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loginCopy = copy.login;

  const handleSignIn = () => {
    if (!phone.trim() || !password.trim()) {
      setError(loginCopy.missingFields);
      return;
    }

    setError("");
    navigate("/dashboard");
  };

  return (
    <AuthLayout
      brand={copy.common.brand}
      brandTagline={copy.common.brandTagline}
      language={language}
      setLanguage={setLanguage}
      languages={languages}
      languageLabel={copy.common.languageLabel}
      heroEyebrow={loginCopy.heroEyebrow}
      heroTitle={loginCopy.heroTitle}
      heroBody={loginCopy.heroBody}
      heroPoints={loginCopy.heroPoints}
      panelTitle={loginCopy.title}
      panelSubtitle={loginCopy.subtitle}
      footer={
        <div className="auth-footer">
          <div className="auth-note">{copy.common.security}</div>
          <div className="auth-footer__row">
            {loginCopy.switchPrompt}{" "}
            <Link className="auth-link" to="/register">
              {loginCopy.switchLink}
            </Link>
          </div>
        </div>
      }
    >
      <div className="auth-form">
        <div className="auth-field">
          <label htmlFor="login-phone">{loginCopy.mobileLabel}</label>
          <div className="auth-input-wrap">
            <span className="auth-prefix">+91</span>
            <input
              id="login-phone"
              className="auth-input auth-input--with-prefix"
              type="tel"
              placeholder={loginCopy.mobilePlaceholder}
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value.replace(/\D/g, "").slice(0, 10));
                setError("");
              }}
              maxLength={10}
            />
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="login-password">{loginCopy.passwordLabel}</label>
          <input
            id="login-password"
            className="auth-input"
            type="password"
            placeholder={loginCopy.passwordPlaceholder}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError("");
            }}
          />
        </div>

        <div className="auth-form__meta">
          <span className="auth-helper">{loginCopy.helper}</span>
          <a className="auth-link" href="#">
            {loginCopy.forgotPassword}
          </a>
        </div>

        {error ? <p className="auth-error">{error}</p> : null}

        <button type="button" className="auth-primary" onClick={handleSignIn}>
          {loginCopy.submit}
        </button>
      </div>
    </AuthLayout>
  );
}
