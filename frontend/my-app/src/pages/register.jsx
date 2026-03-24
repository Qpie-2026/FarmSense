import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import { CROP_OPTIONS, getCropLabel, useAuthLanguage } from "../lib/authI18n.js";

export default function MandAIRegister() {
  const { language, setLanguage, languages, copy } = useAuthLanguage();
  const registerCopy = copy.register;
  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    crop: "",
    location: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = registerCopy.validation.fullName;
    if (!/^\d{10}$/.test(form.mobile)) nextErrors.mobile = registerCopy.validation.mobile;
    if (!form.crop) nextErrors.crop = registerCopy.validation.crop;
    if (!form.location.trim()) nextErrors.location = registerCopy.validation.location;
    if (form.password.length < 6) nextErrors.password = registerCopy.validation.password;
    if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = registerCopy.validation.confirmPassword;
    }
    return nextErrors;
  };

  const handleSubmit = () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    window.alert(registerCopy.success);
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
      heroEyebrow={registerCopy.heroEyebrow}
      heroTitle={registerCopy.heroTitle}
      heroBody={registerCopy.heroBody}
      heroPoints={registerCopy.heroPoints}
      panelTitle={registerCopy.title}
      panelSubtitle={registerCopy.subtitle}
      footer={
        <div className="auth-footer">
          <div className="auth-note">{copy.common.security}</div>
          <div className="auth-footer__row">
            {registerCopy.switchPrompt}{" "}
            <Link className="auth-link" to="/login">
              {registerCopy.switchLink}
            </Link>
          </div>
          <div className="auth-footer__links">
            <a className="auth-link" href="#">
              {registerCopy.privacy}
            </a>
            <a className="auth-link" href="#">
              {registerCopy.terms}
            </a>
            <a className="auth-link" href="#">
              {registerCopy.support}
            </a>
          </div>
        </div>
      }
    >
      <div className="auth-form">
        <div className="auth-grid">
          <div className="auth-field">
            <label htmlFor="register-name">{registerCopy.fullNameLabel}</label>
            <input
              id="register-name"
              className="auth-input"
              type="text"
              placeholder={registerCopy.fullNamePlaceholder}
              value={form.fullName}
              onChange={(event) => update("fullName", event.target.value)}
            />
            {errors.fullName ? <p className="auth-error">{errors.fullName}</p> : null}
          </div>

          <div className="auth-field">
            <label htmlFor="register-mobile">{registerCopy.mobileLabel}</label>
            <div className="auth-input-wrap">
              <span className="auth-prefix">+91</span>
              <input
                id="register-mobile"
                className="auth-input auth-input--with-prefix"
                type="tel"
                placeholder={registerCopy.mobilePlaceholder}
                value={form.mobile}
                onChange={(event) => update("mobile", event.target.value.replace(/\D/g, "").slice(0, 10))}
                maxLength={10}
              />
            </div>
            {errors.mobile ? <p className="auth-error">{errors.mobile}</p> : null}
          </div>
        </div>

        <div className="auth-grid">
          <div className="auth-field">
            <label htmlFor="register-crop">{registerCopy.cropLabel}</label>
            <select
              id="register-crop"
              className="auth-select"
              value={form.crop}
              onChange={(event) => update("crop", event.target.value)}
            >
              <option value="" disabled>
                {registerCopy.cropPlaceholder}
              </option>
              {CROP_OPTIONS.map((crop) => (
                <option key={crop.value} value={crop.value}>
                  {getCropLabel(crop.value, language)}
                </option>
              ))}
            </select>
            {errors.crop ? <p className="auth-error">{errors.crop}</p> : null}
          </div>

          <div className="auth-field">
            <label htmlFor="register-location">{registerCopy.locationLabel}</label>
            <input
              id="register-location"
              className="auth-input"
              type="text"
              placeholder={registerCopy.locationPlaceholder}
              value={form.location}
              onChange={(event) => update("location", event.target.value)}
            />
            {errors.location ? <p className="auth-error">{errors.location}</p> : null}
          </div>
        </div>

        <div className="auth-grid">
          <div className="auth-field">
            <label htmlFor="register-password">{registerCopy.passwordLabel}</label>
            <input
              id="register-password"
              className="auth-input"
              type="password"
              placeholder={registerCopy.passwordPlaceholder}
              value={form.password}
              onChange={(event) => update("password", event.target.value)}
            />
            {errors.password ? <p className="auth-error">{errors.password}</p> : null}
          </div>

          <div className="auth-field">
            <label htmlFor="register-confirm">{registerCopy.confirmPasswordLabel}</label>
            <input
              id="register-confirm"
              className="auth-input"
              type="password"
              placeholder={registerCopy.confirmPasswordPlaceholder}
              value={form.confirmPassword}
              onChange={(event) => update("confirmPassword", event.target.value)}
            />
            {errors.confirmPassword ? <p className="auth-error">{errors.confirmPassword}</p> : null}
          </div>
        </div>

        <button type="button" className="auth-primary" onClick={handleSubmit}>
          {registerCopy.submit}
        </button>
      </div>
    </AuthLayout>
  );
}
