import { useState } from "react";
import { useNavigate } from "react-router-dom";

const C = {
  bg: "#050a14",
  surface: "rgba(16, 24, 42, 0.78)",
  surfaceAlt: "rgba(30, 41, 59, 0.7)",
  border: "rgba(148, 163, 184, 0.22)",
  green: "#34d399",
  greenDim: "rgba(16, 185, 129, 0.22)",
  greenBg: "#0f2d1a",
  greenVibrant: "#16a34a",
  orange: "#f59e0b",
  orangeDim: "#78350f",
  red: "#ef4444",
  text: "#e5edf9",
  muted: "#8ca3bf",
  white: "#ffffff",
};

const s = {
  app: {
    background: "linear-gradient(180deg, #050a14 0%, #071526 46%, #081023 100%)",
    minHeight: "100vh",
    color: C.text,
    fontFamily: "'DM Sans', sans-serif",
    maxWidth: 430,
    margin: "0 auto",
    paddingBottom: 80,
    position: "relative",
    overflow: "hidden",
  },
  glowTop: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(52,211,153,0.24) 0%, rgba(52,211,153,0) 72%)",
    top: -120,
    left: -80,
    pointerEvents: "none",
    filter: "blur(6px)",
  },

  // Header
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 20px 10px",
  },
  logo: { display: "flex", alignItems: "center", gap: 8, fontSize: 22, fontWeight: 700, color: C.white },
  langBtn: {
    background: C.surfaceAlt, border: `1px solid ${C.border}`,
    color: C.text, borderRadius: 10, padding: "6px 14px", fontSize: 13, cursor: "pointer",
  },

  // Hero
  hero: { padding: "6px 20px 16px" },
  heroSub: { fontSize: 11, letterSpacing: 1.5, color: C.muted, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 },
  heroTitle: { fontSize: 30, fontWeight: 800, color: C.white, lineHeight: 1.15 },
  heroMeta: { display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 12, color: C.muted },

  // Action row
  actionRow: { display: "flex", gap: 10, padding: "0 20px 20px" },
  actionBtn: (primary) => ({
    flex: 1,
    background: primary ? C.green : C.surfaceAlt,
    border: `1px solid ${primary ? C.green : C.border}`,
    borderRadius: 12,
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: primary ? "#000" : C.text,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  }),

  // Trend toggle card
  trendCard: {
    margin: "0 16px 14px",
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 18,
    padding: "18px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.28)",
    backdropFilter: "blur(8px)",
  },
  trendToggleRow: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 },
  trendTitle: { fontSize: 16, fontWeight: 800, color: C.white },
  trendSubtitle: { fontSize: 11, color: C.muted, marginTop: 2 },
  toggleRow: { display: "flex", gap: 6 },
  toggleBtn: (active) => ({
    background: active ? C.greenDim : C.surfaceAlt,
    border: `1px solid ${active ? C.green : C.border}`,
    borderRadius: 8,
    padding: "4px 10px",
    fontSize: 11,
    fontWeight: 600,
    color: active ? C.green : C.muted,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 4,
  }),

  // Price hero
  priceCard: {
    margin: "0 16px 14px",
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 18,
    padding: "18px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.28)",
    backdropFilter: "blur(8px)",
  },
  priceLabel: { fontSize: 11, letterSpacing: 1.5, color: C.muted, fontWeight: 600, textTransform: "uppercase", marginBottom: 8 },
  priceHero: { fontSize: 46, fontWeight: 900, color: C.white, letterSpacing: -2, lineHeight: 1 },
  priceUnit: { fontSize: 15, fontWeight: 600, color: C.muted, marginLeft: 4 },

  // SVG chart area
  chartArea: { margin: "12px 0 0", position: "relative" },
  chartTooltip: {
    position: "absolute",
    top: 6,
    right: 30,
    background: C.surfaceAlt,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: "6px 10px",
    fontSize: 11,
    color: C.white,
    fontWeight: 600,
  },
  chartDot: { fontSize: 10, color: C.muted },
  xLabels: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 9,
    color: C.muted,
    padding: "4px 2px 0",
    letterSpacing: 0.3,
  },

  // Recommendation card
  recCard: {
    margin: "0 16px 14px",
    background: "linear-gradient(160deg,#14532d 0%,#166534 100%)",
    borderRadius: 20,
    padding: "20px",
    position: "relative",
    overflow: "hidden",
  },
  recLabel: { fontSize: 10, letterSpacing: 1.5, color: "rgba(255,255,255,0.6)", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 },
  recTitle: { fontSize: 24, fontWeight: 800, color: C.white },
  recSub: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 14 },
  recRange: { fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 4, fontWeight: 600 },
  recDates: { fontSize: 32, fontWeight: 900, color: C.white, lineHeight: 1.1 },
  warningBanner: {
    background: "rgba(0,0,0,0.25)",
    borderRadius: 10,
    padding: "10px 12px",
    display: "flex",
    gap: 8,
    alignItems: "flex-start",
    marginTop: 16,
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
  },

  // Impact section
  impactSection: { margin: "0 16px 14px" },
  sectionTitle: { fontSize: 18, fontWeight: 800, color: C.white, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 },
  impactCard: (accent) => ({
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderLeft: `4px solid ${accent}`,
    borderRadius: 14,
    padding: "14px 16px",
    marginBottom: 10,
  }),
  impactLabel: { fontSize: 10, letterSpacing: 1, color: C.muted, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 },
  impactTitle: { fontSize: 15, fontWeight: 700, color: C.white },
  impactBody: { fontSize: 12, color: C.muted, marginTop: 4, lineHeight: 1.5 },

  // AI Model section
  aiSection: { margin: "0 16px 14px" },
  modelCard: {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 14,
    padding: "16px",
    marginBottom: 10,
  },
  modelRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  modelName: { fontSize: 11, letterSpacing: 1, color: C.muted, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 },
  modelValue: { fontSize: 26, fontWeight: 800, color: C.white },
  modelBadge: {
    background: C.greenDim, color: C.green, fontSize: 9, fontWeight: 700,
    letterSpacing: 0.5, borderRadius: 6, padding: "2px 8px", textTransform: "uppercase", marginTop: 4, display: "inline-block",
  },
  donutSmall: { width: 50, height: 50 },
  sentimentRow: {
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: 14, padding: "16px", marginBottom: 10,
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  sentimentLabel: { fontSize: 11, letterSpacing: 1, color: C.muted, textTransform: "uppercase", fontWeight: 600, marginBottom: 6 },
  sentimentValue: { fontSize: 26, fontWeight: 800, color: C.white },
  arrivalRow: {
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: 14, padding: "16px", marginBottom: 10,
  },
  arrivalValue: { fontSize: 26, fontWeight: 800, color: C.red },
  arrivalSub: { fontSize: 11, color: C.muted, marginTop: 2 },

  // Quality insight
  qualityCard: {
    margin: "0 16px 14px",
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
    height: 180,
  },
  qualityOverlay: {
    position: "absolute", inset: 0,
    background: "linear-gradient(to top, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0.2) 100%)",
    padding: "16px",
    display: "flex", flexDirection: "column", justifyContent: "flex-end",
  },
  qualityLabel: { fontSize: 10, letterSpacing: 1.5, color: C.green, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 },
  qualityTitle: { fontSize: 22, fontWeight: 800, color: C.white },

  // Why card
  whyCard: {
    margin: "0 16px 14px",
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: 18, padding: "20px",
  },
  whyTitle: { fontSize: 18, fontWeight: 800, color: C.white, marginBottom: 14 },
  whyItem: { display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 },
  whyDot: {
    width: 22, height: 22, borderRadius: "50%",
    background: C.greenDim, display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: 13, flexShrink: 0, marginTop: 1,
  },
  whyLabel: { fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 3 },
  whyBody: { fontSize: 13, color: C.muted, lineHeight: 1.55 },

  // Bottom nav
  bottomNav: {
    position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
    width: "100%", maxWidth: 430, background: "rgba(10, 18, 32, 0.86)",
    borderTop: `1px solid rgba(148, 163, 184, 0.25)`,
    display: "flex", justifyContent: "space-around", padding: "10px 0 14px",
    backdropFilter: "blur(12px)",
  },
  navItem: (active) => ({
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: 4, fontSize: 10, fontWeight: 600, letterSpacing: 0.5,
    color: active ? C.green : C.muted, cursor: "pointer", textTransform: "uppercase",
  }),
};

// ── Mini SVG Sparkline ──────────────────────────────────────────
function Sparkline() {
  // Historical then forecast points
  const historical = [
    { x: 0, y: 70 }, { x: 40, y: 65 }, { x: 80, y: 60 },
    { x: 120, y: 55 }, { x: 160, y: 58 },
  ];
  const forecast = [
    { x: 160, y: 58 }, { x: 200, y: 48 }, { x: 240, y: 38 },
    { x: 280, y: 30 }, { x: 320, y: 20 },
  ];

  const toPath = (pts) => pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  return (
    <div style={s.chartArea}>
      <svg width="100%" viewBox="0 0 330 90" preserveAspectRatio="none" style={{ display: "block" }}>
        {/* Grid lines */}
        {[20, 45, 70].map((y) => (
          <line key={y} x1="0" y1={y} x2="330" y2={y} stroke={C.border} strokeWidth="1" />
        ))}
        {/* Forecast fill */}
        <path
          d={`${toPath(forecast)} L320,90 L160,90 Z`}
          fill="rgba(34,197,94,0.08)"
        />
        {/* Historical line */}
        <path d={toPath(historical)} fill="none" stroke={C.muted} strokeWidth="2" strokeDasharray="5,3" />
        {/* Forecast line */}
        <path d={toPath(forecast)} fill="none" stroke={C.green} strokeWidth="2.5" />
        {/* Peak dot */}
        <circle cx="280" cy="30" r="5" fill={C.green} />
        <circle cx="280" cy="30" r="9" fill="rgba(34,197,94,0.2)" />
      </svg>

      {/* Tooltip */}
      <div style={{ ...s.chartTooltip, top: 10, right: 10 }}>
        <div style={{ color: C.muted, fontSize: 10 }}>DEC 14 (EST.)</div>
        <div>₹6,120</div>
      </div>

      {/* X axis */}
      <div style={s.xLabels}>
        {["NOV 15", "NOV 30", "TODAY", "DEC 15", "DEC 30"].map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </div>
  );
}

// ── Donut (AI Model) ────────────────────────────────────────────
function DonutProgress({ pct, color }) {
  const r = 20, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width="50" height="50" viewBox="0 0 50 50">
      <circle cx="25" cy="25" r={r} fill="none" stroke={C.border} strokeWidth="5" />
      <circle
        cx="25" cy="25" r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform="rotate(-90 25 25)"
      />
    </svg>
  );
}

// ── Components ──────────────────────────────────────────────────
const NAV = [
  { icon: "🏠", label: "Home" },
  { icon: "⇆", label: "Mandi" },
  { icon: "📡", label: "Forecast", active: true },
  { icon: "📊", label: "Stats" },
  { icon: "👤", label: "Profile" },
];

function BottomNav() {
  const navigate = useNavigate();
  const [active, setActive] = useState("Forecast");

  const handleClick = (label) => {
    setActive(label);
    if (label === "Mandi") {
      navigate("/comparison");
      return;
    }
    if (label === "Home") {
      navigate("/dashboard");
      return;
    }
    if (label === "Forecast") {
      navigate("/forecast");
      return;
    }
    if (label === "Stats") {
      navigate("/stats");
      return;
    }
    if (label === "Profile") {
      navigate("/profile");
    }
  };

  return (
    <nav style={s.bottomNav}>
      {NAV.map((n) => (
        <div key={n.label} style={s.navItem(active === n.label)} onClick={() => handleClick(n.label)}>
          <span style={{ fontSize: 20 }}>{n.icon}</span>
          {n.label}
        </div>
      ))}
    </nav>
  );
}

export default function ForecastPage() {
  const [trendTab, setTrendTab] = useState("historical");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.bg}; }
      `}</style>

      <div style={s.app}>
        <div style={s.glowTop} />

        {/* ── Header ── */}
        <header style={s.header}>
          <div style={s.logo}><span>📍</span> MandAI</div>
        </header>

        {/* ── Hero ── */}
        <div style={s.hero}>
          <div style={s.heroSub}>Market Intelligence</div>
          <div style={s.heroTitle}>Soybean Price<br />Forecast</div>
          <div style={s.heroMeta}>
            <span>🕐</span>
            <span>Last updated: Today, 08:30 AM</span>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div style={s.actionRow}>
          <button style={s.actionBtn(false)}>
            <span>📤</span> Export<br />Report
          </button>
          <button style={s.actionBtn(true)}>
            <span>💬</span> Send to<br />WhatsApp
          </button>
        </div>

        {/* ── 30-Day Trend Card ── */}
        <div style={s.trendCard}>
          <div style={s.trendToggleRow}>
            <div>
              <div style={s.trendTitle}>30-Day Predicted Trend</div>
              <div style={s.trendSubtitle}>Historical average vs. AI ML projection</div>
            </div>
            <div style={s.toggleRow}>
              <button style={s.toggleBtn(trendTab === "historical")} onClick={() => setTrendTab("historical")}>
                ▪ Historical
              </button>
              <button style={s.toggleBtn(trendTab === "forecast")} onClick={() => setTrendTab("forecast")}>
                — Forecast
              </button>
            </div>
          </div>
          <Sparkline />
        </div>

        {/* ── Current Target Price ── */}
        <div style={s.priceCard}>
          <div style={s.priceLabel}>Current Target Price</div>
          <div>
            <span style={s.priceHero}>₹5,840</span>
            <span style={s.priceUnit}>/quintal</span>
          </div>
        </div>

        {/* ── Recommendation Card ── */}
        <div style={s.recCard}>
          {/* Background decoration */}
          <div style={{
            position: "absolute", right: -20, top: -20, width: 120, height: 120,
            borderRadius: "50%", background: "rgba(255,255,255,0.05)",
          }} />
          <div style={s.recLabel}>Recommendation</div>
          <div style={s.recTitle}>Best Time to Sell</div>
          <div style={s.recSub}>Maximum profit window identified.</div>
          <div style={s.recRange}>OPTIMAL RANGE</div>
          <div style={s.recDates}>13 – 14<br />December</div>
          <div style={s.warningBanner}>
            <span>⚠️</span>
            <div>
              <strong style={{ color: C.orange }}>Critical Warning</strong><br />
              Arrival timing on <strong>Monday</strong>, high volatility and arrival arrivals expected.
            </div>
          </div>
        </div>

        {/* ── Impact Analysis ── */}
        <div style={s.impactSection}>
          <div style={s.sectionTitle}>Impact Analysis <span>💧</span></div>

          <div style={s.impactCard(C.muted)}>
            <div style={s.impactLabel}>🌧 Weather Forecast</div>
            <div style={s.impactTitle}>Heavy Rainfall Expected</div>
          </div>

          <div style={s.impactCard(C.green)}>
            <div style={s.impactLabel}>📈 Market Impact</div>
            <div style={s.impactBody}>
              Price will increase by <strong style={{ color: C.white }}>4–6%</strong> due to supply disruption in central Mandis.
            </div>
          </div>
        </div>

        {/* ── AI Model Intelligence ── */}
        <div style={s.aiSection}>
          <div style={s.sectionTitle}>AI Model Intelligence</div>

          {/* Random Forest */}
          <div style={s.modelCard}>
            <div style={s.modelRow}>
              <div>
                <div style={s.modelName}>Random Forest</div>
                <div style={s.modelValue}>94.2%</div>
                <div style={s.modelBadge}>Most Accurate</div>
              </div>
              <DonutProgress pct={94.2} color={C.green} />
            </div>
          </div>

          {/* Linear Regression */}
          <div style={s.modelCard}>
            <div style={s.modelRow}>
              <div>
                <div style={s.modelName}>Linear Regression</div>
                <div style={s.modelValue}>88.5%</div>
                <div style={{ ...s.modelBadge, background: C.surfaceAlt, color: C.muted }}>Baseline Model</div>
              </div>
              <DonutProgress pct={88.5} color={C.muted} />
            </div>
          </div>

          {/* Market Sentiment */}
          <div style={s.sentimentRow}>
            <div>
              <div style={s.sentimentLabel}>Market Sentiment</div>
              <div style={{ ...s.sentimentValue, color: C.green }}>Bullish 📈</div>
            </div>
          </div>

          {/* Arrival Volume */}
          <div style={s.arrivalRow}>
            <div style={s.modelName}>Arrival Volume</div>
            <div style={s.arrivalValue}>-12%</div>
            <div style={s.arrivalSub}>Arrivals dropping below average</div>
          </div>
        </div>

        {/* ── Quality Insight ── */}
        <div style={s.qualityCard}>
          {/* Background image simulated with gradient */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg,#14532d 0%,#1a3a10 40%,#2d4a0f 100%)",
          }} />
          {/* Soybean texture dots */}
          {[...Array(12)].map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              width: 18 + (i % 3) * 8,
              height: 18 + (i % 3) * 8,
              borderRadius: "50%",
              background: `rgba(34,197,94,${0.05 + (i % 4) * 0.03})`,
              left: `${(i * 31) % 90}%`,
              top: `${(i * 17) % 70}%`,
            }} />
          ))}
          <div style={s.qualityOverlay}>
            <div style={s.qualityLabel}>Quality Insight</div>
            <div style={s.qualityTitle}>Soybean (Yellow)</div>
          </div>
        </div>

        {/* ── Why is Price Increasing ── */}
        <div style={s.whyCard}>
          <div style={s.whyTitle}>Why is price increasing?</div>

          <div style={s.whyItem}>
            <div style={s.whyDot}>✓</div>
            <div>
              <div style={s.whyLabel}>Unseasonal Rains</div>
              <div style={s.whyBody}>
                Harvesting in Maharashtra and MP delayed, creating immediate supply gap.
              </div>
            </div>
          </div>

          <div style={{ ...s.whyItem, marginBottom: 0 }}>
            <div style={s.whyDot}>✓</div>
            <div>
              <div style={s.whyLabel}>Import Duty</div>
              <div style={s.whyBody}>
                Government speculations on increasing crude oil import duty favouring domestic oilseed prices.
              </div>
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
    </>
  );
}
