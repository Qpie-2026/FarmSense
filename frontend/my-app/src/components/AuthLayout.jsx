import "./auth-layout.css";

export default function AuthLayout({
  brand,
  brandTagline,
  language,
  setLanguage,
  languages,
  languageLabel,
  heroEyebrow,
  heroTitle,
  heroBody,
  heroPoints,
  panelTitle,
  panelSubtitle,
  children,
  footer,
}) {
  return (
    <div className="auth-page">
      <div className="auth-shell">
        <section className="auth-hero">
          <header className="auth-topbar">
            <div className="auth-brand">
              <div className="auth-brand__mark">{brand.slice(0, 2)}</div>
              <div>
                <p className="auth-brand__tagline">{brandTagline}</p>
                <h1>{brand}</h1>
              </div>
            </div>

            <div className="auth-language-block">
              <p className="auth-label">{languageLabel}</p>
              <div className="auth-language-switch" aria-label={languageLabel}>
              {languages.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  className={item.code === language ? "is-active" : ""}
                  onClick={() => setLanguage(item.code)}
                >
                  {item.label}
                </button>
              ))}
              </div>
            </div>
          </header>

          <div className="auth-hero__content">
            <p className="auth-label">{heroEyebrow}</p>
            <h2>{heroTitle}</h2>
            <p className="auth-hero__body">{heroBody}</p>

            <div className="auth-points">
              {heroPoints.map((point) => (
                <div key={point} className="auth-point">
                  <span className="auth-point__dot" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="auth-panel">
          <div className="auth-panel__header">
            <h3>{panelTitle}</h3>
            <p>{panelSubtitle}</p>
          </div>

          {children}
          {footer}
        </section>
      </div>
    </div>
  );
}
