import { useState } from "react";

// ── Colour tokens ──────────────────────────────────────────────
const C = {
  bg: "#0d1117",
  surface: "#151c27",
  surfaceAlt: "#1a2333",
  border: "#1f2d3d",
  green: "#22c55e",
  greenDim: "#166534",
  orange: "#f59e0b",
  orangeDim: "#78350f",
  text: "#e2e8f0",
  muted: "#64748b",
  white: "#ffffff",
};

// ── Tiny helpers ───────────────────────────────────────────────
const styles = {
  app: {
    background: C.bg,
    minHeight: "100vh",
    color: C.text,
    fontFamily: "'DM Sans', sans-serif",
    maxWidth: 430,
    margin: "0 auto",
    paddingBottom: 80,
  },
  // Header
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 20px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 22,
    fontWeight: 700,
    color: C.white,
  },
  langBtn: {
    background: C.surfaceAlt,
    border: `1px solid ${C.border}`,
    color: C.text,
    borderRadius: 10,
    padding: "6px 14px",
    fontSize: 13,
    cursor: "pointer",
  },
  // Crop / Mandi chips
  chipRow: {
    display: "flex",
    gap: 10,
    padding: "0 20px 16px",
    overflowX: "auto",
  },
  chip: {
    background: C.surfaceAlt,
    border: `1px solid ${C.border}`,
    borderRadius: 22,
    padding: "8px 16px",
    fontSize: 14,
    color: C.text,
    display: "flex",
    alignItems: "center",
    gap: 6,
    whiteSpace: "nowrap",
    cursor: "pointer",
  },
  // Cards
  card: {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 18,
    padding: "20px",
    margin: "0 16px 14px",
  },
  // Live price card
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: C.green,
    display: "inline-block",
    marginRight: 6,
    animation: "pulse 1.5s infinite",
  },
  liveLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: C.green,
    letterSpacing: 1,
    textTransform: "uppercase",
    display: "flex",
    alignItems: "center",
  },
  priceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  price: {
    fontSize: 44,
    fontWeight: 800,
    color: C.white,
    letterSpacing: -1,
  },
  perQuintal: { fontSize: 12, color: C.muted, marginTop: 4 },
  changeBadge: {
    fontSize: 13,
    color: C.green,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 4,
    marginBottom: 16,
  },
  // Bar chart
  barChart: {
    display: "flex",
    alignItems: "flex-end",
    gap: 6,
    height: 70,
  },
  bar: (highlight) => ({
    flex: 1,
    background: highlight ? C.green : C.greenDim,
    borderRadius: "4px 4px 0 0",
    transition: "all 0.3s",
  }),
  chartLabels: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 10,
    color: C.muted,
    marginTop: 6,
  },
  // AI Recommendation card
  aiCard: {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderLeft: `4px solid ${C.orange}`,
    borderRadius: 18,
    padding: "20px",
    margin: "0 16px 14px",
    display: "flex",
    gap: 14,
    alignItems: "flex-start",
  },
  aiIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: C.orangeDim,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    flexShrink: 0,
  },
  aiTitle: { fontSize: 18, fontWeight: 700, color: C.orange },
  aiConfidence: {
    fontSize: 11,
    color: C.muted,
    fontWeight: 600,
    letterSpacing: 1,
    textAlign: "right",
  },
  aiConfidenceNum: { fontSize: 18, fontWeight: 700, color: C.white },
  aiBody: { fontSize: 14, color: C.text, lineHeight: 1.6, marginTop: 6 },
  highlight: { color: C.orange, fontWeight: 700 },
  // Feature grid
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    padding: "0 16px 14px",
  },
  featureCard: {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    padding: "18px 16px",
    cursor: "pointer",
  },
  featureIcon: (bg) => ({
    width: 38,
    height: 38,
    borderRadius: 10,
    background: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    marginBottom: 12,
  }),
  featureTitle: { fontSize: 15, fontWeight: 700, color: C.white },
  featureSubtitle: {
    fontSize: 11,
    color: C.muted,
    marginTop: 3,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  // Market saturation
  satCard: {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 18,
    padding: "20px",
    margin: "0 16px 14px",
  },
  satLabel: {
    fontSize: 11,
    letterSpacing: 1.5,
    color: C.muted,
    textTransform: "uppercase",
    fontWeight: 600,
    marginBottom: 16,
  },
  satRow: { display: "flex", alignItems: "center", gap: 16 },
  donut: { position: "relative", width: 70, height: 70, flexShrink: 0 },
  donutText: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 800,
    color: C.white,
  },
  satTitle: { fontSize: 16, fontWeight: 700, color: C.white },
  satBody: { fontSize: 13, color: C.muted, marginTop: 4, lineHeight: 1.5 },
  // Bottom nav
  bottomNav: {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: 430,
    background: C.surface,
    borderTop: `1px solid ${C.border}`,
    display: "flex",
    justifyContent: "space-around",
    padding: "10px 0 14px",
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
  navIcon: { fontSize: 20 },
};

// ── Sub-components ─────────────────────────────────────────────

function Header() {
  return (
    <header style={styles.header}>
      <div style={styles.logo}>
        <span>📍</span> MandAI
      </div>
      <button style={styles.langBtn}>मराठी</button>
    </header>
  );
}

function CropMandiSelector() {
  return (
    <div style={styles.chipRow}>
      <div style={styles.chip}>
        <span>🌱</span> Tomato (Tomato) <span>▾</span>
      </div>
      <div style={styles.chip}>
        <span>📍</span> Nagpur Mandi
      </div>
    </div>
  );
}

const BARS = [32, 48, 38, 52, 44, 40, 65]; // relative heights %

function LiveMarketPriceCard() {
  return (
    <div style={styles.card}>
      <div style={styles.priceRow}>
        <div style={styles.liveLabel}>
          <span style={styles.liveDot} />
          LIVE MARKET PRICE
        </div>
        <div style={styles.perQuintal}>Per Quintal (100kg)</div>
      </div>

      <div style={styles.price}>₹3,450</div>

      <div style={styles.changeBadge}>↑ +12.4% since yesterday</div>

      {/* Mini bar chart */}
      <div style={styles.barChart}>
        {BARS.map((h, i) => (
          <div
            key={i}
            style={{ ...styles.bar(i === BARS.length - 1), height: `${h}%` }}
          />
        ))}
      </div>
      <div style={styles.chartLabels}>
        <span>7 DAYS AGO</span>
        <span>TODAY</span>
      </div>
    </div>
  );
}

function AIRecommendationCard() {
  return (
    <div style={styles.aiCard}>
      <div style={styles.aiIcon}>💡</div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div style={styles.aiTitle}>AI Recommendation</div>
          <div style={styles.aiConfidence}>
            <div style={styles.aiConfidenceNum}>92%</div>
            <div>CONFIDENCE</div>
          </div>
        </div>
        <div style={styles.aiBody}>
          Wait <span style={styles.highlight}>3 more days</span> to sell for
          maximum profit! Market arrivals in Nagpur are expected to drop.
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    icon: "📡",
    bg: "#1a2d4a",
    title: "Price Forecast",
    sub: "Next 15 Days",
  },
  {
    icon: "🕐",
    bg: "#1a3329",
    title: "Best Sell Time",
    sub: "Profit Optimizer",
  },
  {
    icon: "🌤",
    bg: "#2d2010",
    title: "Weather Impact",
    sub: "Arrival Delay Risk",
  },
  {
    icon: "⇆",
    bg: "#1a2d2d",
    title: "Mandi Comparison",
    sub: "Nearby Prices",
  },
];

function FeatureGrid() {
  return (
    <div style={styles.featureGrid}>
      {FEATURES.map((f) => (
        <div key={f.title} style={styles.featureCard}>
          <div style={styles.featureIcon(f.bg)}>{f.icon}</div>
          <div style={styles.featureTitle}>{f.title}</div>
          <div style={styles.featureSubtitle}>{f.sub}</div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ pct = 65 }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={styles.donut}>
      <svg width="70" height="70" viewBox="0 0 70 70">
        <circle cx="35" cy="35" r={r} fill="none" stroke="#1f2d3d" strokeWidth="7" />
        <circle
          cx="35"
          cy="35"
          r={r}
          fill="none"
          stroke={C.green}
          strokeWidth="7"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          transform="rotate(-90 35 35)"
        />
      </svg>
      <div style={styles.donutText}>65%</div>
    </div>
  );
}

function MarketSaturationCard() {
  return (
    <div style={styles.satCard}>
      <div style={styles.satLabel}>Market Saturation</div>
      <div style={styles.satRow}>
        <DonutChart pct={65} />
        <div>
          <div style={styles.satTitle}>Moderate Inflow</div>
          <div style={styles.satBody}>
            Nagpur Mandi is seeing 12% lower arrivals compared to seasonal
            average.
          </div>
        </div>
      </div>
    </div>
  );
}

const NAV = [
  { icon: "🏠", label: "Home", active: true },
  { icon: "⇆", label: "Mandi" },
  { icon: "📡", label: "Forecast" },
  { icon: "📊", label: "Stats" },
  { icon: "👤", label: "Profile" },
];

function BottomNav() {
  const [active, setActive] = useState("Home");
  return (
    <nav style={styles.bottomNav}>
      {NAV.map((n) => (
        <div
          key={n.label}
          style={styles.navItem(active === n.label)}
          onClick={() => setActive(n.label)}
        >
          <span style={styles.navIcon}>{n.icon}</span>
          {n.label}
        </div>
      ))}
    </nav>
  );
}

// ── Page ───────────────────────────────────────────────────────
export default function MandAI() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.bg}; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      <div style={styles.app}>
        <Header />
        <CropMandiSelector />
        <LiveMarketPriceCard />
        <AIRecommendationCard />
        <FeatureGrid />
        <MarketSaturationCard />
        <BottomNav />
      </div>
    </>
  );
}
