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

  // ── Header ──────────────────────────────
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 20px 10px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 22,
    fontWeight: 700,
    color: C.white,
  },
  headerRight: { display: "flex", alignItems: "center", gap: 10 },
  langBtn: {
    background: C.surfaceAlt,
    border: `1px solid ${C.border}`,
    color: C.text,
    borderRadius: 10,
    padding: "6px 14px",
    fontSize: 13,
    cursor: "pointer",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "linear-gradient(135deg,#f59e0b,#ef4444)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
  },

  // ── Hero ────────────────────────────────
  hero: { padding: "10px 20px 18px" },
  heroSub: { fontSize: 11, letterSpacing: 1.5, color: C.muted, fontWeight: 600, textTransform: "uppercase" },
  heroRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 4 },
  heroTitle: { fontSize: 32, fontWeight: 800, color: C.white, lineHeight: 1.1 },
  cropChip: {
    background: C.surfaceAlt,
    border: `1px solid ${C.border}`,
    borderRadius: 14,
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    flexShrink: 0,
  },
  cropDot: { width: 8, height: 8, borderRadius: "50%", background: C.green },

  // ── Comparison Table ────────────────────
  tableWrap: {
    margin: "0 16px 14px",
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.28)",
    backdropFilter: "blur(8px)",
  },
  tableHeader: {
    display: "grid",
    gridTemplateColumns: "2fr 1.5fr 1fr",
    padding: "12px 18px",
    background: C.surfaceAlt,
    borderBottom: `1px solid ${C.border}`,
    gap: 8,
  },
  thCell: { fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: "uppercase" },
  tableRow: (last) => ({
    display: "grid",
    gridTemplateColumns: "2fr 1.5fr 1fr",
    padding: "18px 18px",
    borderBottom: last ? "none" : `1px solid ${C.border}`,
    alignItems: "center",
    gap: 8,
  }),
  mandiName: { fontSize: 15, fontWeight: 700, color: C.white },
  mandiMeta: { fontSize: 11, color: C.muted, marginTop: 2 },
  bestBadge: {
    display: "inline-block",
    background: C.greenDim,
    color: C.green,
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 0.5,
    borderRadius: 6,
    padding: "2px 7px",
    marginTop: 4,
    textTransform: "uppercase",
  },
  priceText: (best) => ({
    fontSize: 17,
    fontWeight: 800,
    color: best ? C.green : C.white,
  }),
  trendUp: { fontSize: 12, fontWeight: 600, color: C.green },
  trendFlat: { fontSize: 12, fontWeight: 600, color: C.muted },
  trendDown: { fontSize: 12, fontWeight: 600, color: C.red },
  greenBar: {
    width: 3,
    background: C.green,
    borderRadius: 2,
    alignSelf: "stretch",
    marginRight: 10,
    flexShrink: 0,
  },

  // ── Alert Cards ─────────────────────────
  alertCard: (border) => ({
    margin: "0 16px 12px",
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderLeft: `4px solid ${border}`,
    borderRadius: 16,
    padding: "16px",
    display: "flex",
    gap: 14,
    alignItems: "flex-start",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.28)",
    backdropFilter: "blur(8px)",
  }),
  alertIcon: (bg) => ({
    width: 42,
    height: 42,
    borderRadius: 12,
    background: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    flexShrink: 0,
  }),
  alertTitle: { fontSize: 15, fontWeight: 700, color: C.white, marginBottom: 4 },
  alertBody: { fontSize: 13, color: C.muted, lineHeight: 1.55 },
  hl: (color) => ({ color, fontWeight: 700 }),

  // ── Profit Calculator ───────────────────
  calcCard: {
    margin: "0 16px 14px",
    background: "linear-gradient(160deg, #112d1a 0%, #0d1f2d 100%)",
    border: `1px solid ${C.border}`,
    borderRadius: 20,
    padding: "22px 20px",
  },
  calcTitle: { fontSize: 22, fontWeight: 800, color: C.white, marginBottom: 18 },
  calcLabel: { fontSize: 12, color: C.muted, fontWeight: 600, marginBottom: 6 },
  calcInput: {
    background: "#0d1a12",
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    padding: "13px 16px",
    color: C.white,
    fontSize: 16,
    fontWeight: 600,
    width: "100%",
    outline: "none",
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  inputRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  coolingBadge: {
    background: "#1a3a28",
    color: C.green,
    fontSize: 11,
    fontWeight: 600,
    borderRadius: 8,
    padding: "3px 10px",
  },
  divider: { border: "none", borderTop: `1px solid ${C.border}`, margin: "18px 0" },
  profitLabel: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  profitLabelText: { fontSize: 13, color: C.muted, fontWeight: 600 },
  profitBadge: {
    background: C.greenDim,
    color: C.green,
    fontSize: 12,
    fontWeight: 700,
    borderRadius: 8,
    padding: "3px 10px",
  },
  profitAmount: { fontSize: 44, fontWeight: 800, color: C.white, letterSpacing: -1, marginBottom: 6 },
  profitNote: { fontSize: 11, color: C.muted, fontStyle: "italic", marginBottom: 20 },
  ctaBtn: {
    background: C.green,
    color: "#000",
    border: "none",
    borderRadius: 14,
    padding: "16px",
    width: "100%",
    fontSize: 16,
    fontWeight: 800,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    letterSpacing: 0.3,
  },

  // ── Strategy Card ───────────────────────
  strategyCard: {
    margin: "0 16px 14px",
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 18,
    padding: "18px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.28)",
    backdropFilter: "blur(8px)",
  },
  strategyHeader: { display: "flex", gap: 12, alignItems: "center", marginBottom: 12 },
  strategyThumb: {
    width: 46,
    height: 46,
    borderRadius: 12,
    background: "linear-gradient(135deg,#dc2626,#f59e0b)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    flexShrink: 0,
  },
  strategyTitle: { fontSize: 16, fontWeight: 700, color: C.white },
  strategySubtitle: { fontSize: 11, color: C.muted, marginTop: 2 },
  strategyBody: { fontSize: 13, color: C.muted, lineHeight: 1.6 },

  // ── Bottom Nav ──────────────────────────
  bottomNav: {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: 430,
    background: "rgba(10, 18, 32, 0.86)",
    borderTop: `1px solid rgba(148, 163, 184, 0.25)`,
    display: "flex",
    justifyContent: "space-around",
    padding: "10px 0 14px",
    backdropFilter: "blur(12px)",
  },
  navItem: (active) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: 0.5,
    color: active ? C.green : C.muted,
    cursor: "pointer",
    textTransform: "uppercase",
  }),
};

// ── Data ────────────────────────────────────────────────────────
const MANDIS = [
  {
    name: "Mumbai APMC",
    meta: "142 km away • Vashi",
    price: "₹24.50",
    best: true,
    trend: "up",
    trendVal: "+12%",
  },
  {
    name: "Pune (Gultekdi)",
    meta: "12 km away • Central",
    price: "₹21.20",
    best: false,
    trend: "flat",
    trendVal: "— Stable",
  },
  {
    name: "Nashik",
    meta: "210 km away • Pimpalgaon",
    price: "₹19.80",
    best: false,
    trend: "down",
    trendVal: "↘ -4%",
  },
];

const NAV = [
  { icon: "🏠", label: "Home" },
  { icon: "⇆", label: "Mandi", active: true },
  { icon: "📡", label: "Forecast" },
  { icon: "📊", label: "Stats" },
  { icon: "👤", label: "Profile" },
];

// ── Components ──────────────────────────────────────────────────

function Header() {
  return (
    <header style={s.header}>
      <div style={s.logo}><span>📍</span> MandAI</div>
      <div style={s.headerRight}>
        <button style={s.langBtn}>मराठी</button>
        <div style={s.avatar}>🧑</div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <div style={s.hero}>
      <div style={s.heroSub}>Live Marketplace</div>
      <div style={s.heroRow}>
        <div style={s.heroTitle}>Mandi<br />Comparison</div>
        <div style={s.cropChip}>
          <div style={s.cropDot} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>Tomato</div>
            <div style={{ fontSize: 10, color: C.muted }}>(Hybrid)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendCell({ trend, val }) {
  if (trend === "up") return <span style={s.trendUp}>↗ {val}</span>;
  if (trend === "down") return <span style={s.trendDown}>{val}</span>;
  return <span style={s.trendFlat}>{val}</span>;
}

function ComparisonTable() {
  return (
    <div style={s.tableWrap}>
      {/* Table header */}
      <div style={s.tableHeader}>
        <div style={s.thCell}>Mandi Location</div>
        <div style={s.thCell}>Current Price</div>
        <div style={s.thCell}>Trend</div>
      </div>

      {/* Rows */}
      {MANDIS.map((m, i) => (
        <div key={m.name} style={s.tableRow(i === MANDIS.length - 1)}>
          {/* Location cell */}
          <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
            {m.best && <div style={s.greenBar} />}
            <div style={{ paddingLeft: m.best ? 8 : 11 }}>
              <div style={s.mandiName}>{m.name}</div>
              <div style={s.mandiMeta}>{m.meta}</div>
              {m.best && <div style={s.bestBadge}>Best Price</div>}
            </div>
          </div>

          {/* Price cell */}
          <div style={s.priceText(m.best)}>{m.price}</div>

          {/* Trend cell */}
          <TrendCell trend={m.trend} val={m.trendVal} />
        </div>
      ))}
    </div>
  );
}

function PriceAlertCard() {
  return (
    <div style={s.alertCard(C.orange)}>
      <div style={s.alertIcon("#2d200a")}>🔔</div>
      <div>
        <div style={s.alertTitle}>Price Alert</div>
        <div style={s.alertBody}>
          Your target price{" "}
          <span style={s.hl(C.orange)}>₹22.00</span> is likely to be reached in{" "}
          <span style={s.hl(C.orange)}>3 days</span>.
        </div>
      </div>
    </div>
  );
}

function TransportAlertCard() {
  return (
    <div style={s.alertCard(C.red)}>
      <div style={s.alertIcon("#2d0f0f")}>🚚</div>
      <div>
        <div style={s.alertTitle}>Transport Alert</div>
        <div style={s.alertBody}>
          Pune market has a{" "}
          <span style={s.hl(C.orange)}>2-day delivery delay</span> due to heavy
          logistics traffic.
        </div>
      </div>
    </div>
  );
}

function ProfitCalculator() {
  const [cost, setCost] = useState(18);
  const [days, setDays] = useState(5);

  // Simple mock calculation
  const profit = Math.round((24.5 - cost) * 100 * (1 + days * 0.01) * 10);

  return (
    <div style={s.calcCard}>
      <div style={s.calcTitle}>Profit Calculator</div>

      {/* Cost Price */}
      <div style={s.calcLabel}>Cost Price (per kg)</div>
      <div style={s.calcInput}>
        <span style={{ color: C.muted }}>₹</span>
        <input
          type="number"
          value={cost}
          onChange={(e) => setCost(Number(e.target.value))}
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            color: C.white,
            fontSize: 16,
            fontWeight: 600,
            width: "100%",
          }}
        />
      </div>

      {/* Storage Days */}
      <div style={s.inputRow}>
        <div style={s.calcLabel}>Storage Days</div>
        <div style={s.coolingBadge}>Cooling applied</div>
      </div>
      <div style={{ ...s.calcInput, justifyContent: "space-between" }}>
        <input
          type="number"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            color: C.white,
            fontSize: 16,
            fontWeight: 600,
            width: "100%",
          }}
        />
        <span>📅</span>
      </div>

      <hr style={s.divider} />

      {/* Expected Profit */}
      <div style={s.profitLabel}>
        <div style={s.profitLabelText}>Expected Profit</div>
        <div style={s.profitBadge}>+₹6.50 /kg</div>
      </div>
      <div style={s.profitAmount}>₹{profit.toLocaleString("en-IN")}</div>
      <div style={s.profitNote}>
        *Based on current Mumbai APMC trends and storage overheads.
      </div>

      <button style={s.ctaBtn}>⊞ Secure Current Price</button>
    </div>
  );
}

function StrategyCard() {
  return (
    <div style={s.strategyCard}>
      <div style={s.strategyHeader}>
        <div style={s.strategyThumb}>🍅</div>
        <div>
          <div style={s.strategyTitle}>MandAI Strategy</div>
          <div style={s.strategySubtitle}>AI Optimized Recommendation</div>
        </div>
      </div>
      <div style={s.strategyBody}>
        Based on your input, we recommend{" "}
        <span style={s.hl(C.green)}>Mumbai APMC</span>. Despite the higher
        transport cost, the predicted 3-day surge will net you{" "}
        <span style={s.hl(C.green)}>18% higher returns</span> compared to local
        sales.
      </div>
    </div>
  );
}

function BottomNav() {
  const navigate = useNavigate();
  const [active, setActive] = useState("Mandi");

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
        <div
          key={n.label}
          style={s.navItem(active === n.label)}
          onClick={() => handleClick(n.label)}
        >
          <span style={{ fontSize: 20 }}>{n.icon}</span>
          {n.label}
        </div>
      ))}
    </nav>
  );
}

// ── Page ────────────────────────────────────────────────────────
export default function MandiComparison() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,600;0,700;0,800;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.bg}; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
      `}</style>

      <div style={s.app}>
        <div style={s.glowTop} />
        <Header />
        <Hero />
        <ComparisonTable />
        <PriceAlertCard />
        <TransportAlertCard />
        <ProfitCalculator />
        <StrategyCard />
        <BottomNav />
      </div>
    </>
  );
}
