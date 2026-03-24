import { useState } from "react";

const C = {
  bg: "#0d1117",
  surface: "#151c27",
  surfaceAlt: "#1a2333",
  border: "#1f2d3d",
  green: "#22c55e",
  greenDim: "#166534",
  greenBg: "#0f2d1a",
  orange: "#f59e0b",
  red: "#ef4444",
  text: "#e2e8f0",
  muted: "#64748b",
  white: "#ffffff",
};

const s = {
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
    padding: "18px 20px 10px",
  },
  logo: { display: "flex", alignItems: "center", gap: 8, fontSize: 22, fontWeight: 700, color: C.white },
  langBtn: {
    background: C.surfaceAlt, border: `1px solid ${C.border}`,
    color: C.text, borderRadius: 10, padding: "6px 14px", fontSize: 13, cursor: "pointer",
  },

  // Hero
  hero: { padding: "10px 20px 20px" },
  heroTitle: { fontSize: 34, fontWeight: 900, color: C.white, lineHeight: 1.1, marginBottom: 10 },
  heroSub: { fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 18 },
  heroActions: { display: "flex", gap: 10 },

  reportBtn: {
    background: C.greenDim, border: `1px solid ${C.green}`,
    borderRadius: 10, padding: "9px 16px", fontSize: 13, fontWeight: 700,
    color: C.green, display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
  },

  // Card base
  card: {
    margin: "0 16px 16px",
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: 20, padding: "20px",
  },
  cardTitle: { fontSize: 20, fontWeight: 800, color: C.white, lineHeight: 1.2 },
  cardSub: { fontSize: 12, color: C.muted, marginTop: 3, marginBottom: 16 },

  // Bar chart
  barArea: { display: "flex", alignItems: "flex-end", gap: 14, height: 160, marginBottom: 8 },
  barWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", flex: 1 },
  barLabel: { fontSize: 11, fontWeight: 700, color: C.white, marginBottom: 5 },
  bar: (color, h) => ({
    width: "100%",
    height: h,
    background: color,
    borderRadius: "6px 6px 0 0",
  }),
  barXLabel: { fontSize: 10, color: C.muted, marginTop: 6, textAlign: "center", lineHeight: 1.3 },
  vsAvgBadge: {
    background: C.greenDim, color: C.green, fontSize: 11, fontWeight: 700,
    borderRadius: 8, padding: "4px 10px", display: "flex", alignItems: "center", gap: 4,
  },
  barTopRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },

  // Donut chart
  donutWrap: { display: "flex", justifyContent: "center", margin: "10px 0 18px", position: "relative" },
  donutCenter: {
    position: "absolute", top: "50%", left: "50%",
    transform: "translate(-50%,-50%)",
    textAlign: "center",
  },
  donutValue: { fontSize: 22, fontWeight: 900, color: C.white, lineHeight: 1 },
  donutSub: { fontSize: 10, color: C.muted, marginTop: 2, letterSpacing: 0.5, textTransform: "uppercase" },
  legendItem: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "8px 0", borderBottom: `1px solid ${C.border}`,
  },
  legendLeft: { display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600, color: C.white },
  legendDot: (color) => ({ width: 10, height: 10, borderRadius: "50%", background: color }),
  legendPct: { fontSize: 14, fontWeight: 700, color: C.white },

  // Price trajectory
  toggleRow: { display: "flex", gap: 6, marginBottom: 14 },
  toggleBtn: (active) => ({
    background: active ? C.greenDim : "transparent",
    border: `1px solid ${active ? C.green : C.border}`,
    borderRadius: 8, padding: "4px 12px", fontSize: 11, fontWeight: 600,
    color: active ? C.green : C.muted, cursor: "pointer",
  }),
  peakTag: {
    background: C.greenDim, color: C.green, fontSize: 10, fontWeight: 700,
    borderRadius: 6, padding: "2px 8px", display: "inline-block",
  },

  // Profit margins
  marginItem: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "14px 16px", marginBottom: 10,
    background: C.surfaceAlt, border: `1px solid ${C.border}`,
    borderRadius: 14,
  },
  marginLeft: { display: "flex", alignItems: "center", gap: 12 },
  marginIcon: (bg) => ({
    width: 40, height: 40, borderRadius: 12,
    background: bg, display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: 18, flexShrink: 0,
  }),
  marginName: { fontSize: 15, fontWeight: 700, color: C.white },
  marginCategory: { fontSize: 11, color: C.muted, marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 },
  marginValue: (pos) => ({
    fontSize: 17, fontWeight: 800, color: pos ? C.green : C.red, textAlign: "right",
  }),
  marginLabel: { fontSize: 10, color: C.muted, textAlign: "right", marginTop: 2 },
  viewAll: {
    textAlign: "center", color: C.green, fontWeight: 700, fontSize: 13,
    padding: "10px 0 4px", cursor: "pointer", letterSpacing: 0.5,
  },

  // Volatility
  volatilityCard: {
    margin: "0 16px 16px",
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: 20, padding: "20px", position: "relative", overflow: "hidden",
  },
  liveBadge: {
    display: "inline-flex", alignItems: "center", gap: 6,
    background: C.greenBg, border: `1px solid ${C.greenDim}`,
    borderRadius: 8, padding: "4px 10px", fontSize: 10, fontWeight: 700,
    color: C.green, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10,
  },
  liveDot: {
    width: 7, height: 7, borderRadius: "50%", background: C.green,
    animation: "pulse 1.5s infinite",
  },
  volatilityTitle: { fontSize: 30, fontWeight: 900, color: C.white, lineHeight: 1.1, marginBottom: 8 },
  volatilityBody: { fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 20 },
  scoreRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  scoreTrack: {
    height: 10, borderRadius: 10, background: C.border,
    overflow: "hidden", flex: 1, marginRight: 14,
  },
  scoreFill: {
    height: "100%", width: "68%",
    background: `linear-gradient(90deg, ${C.green}, #84cc16)`,
    borderRadius: 10,
  },
  scoreValue: { fontSize: 22, fontWeight: 900, color: C.white, whiteSpace: "nowrap" },

  // Dropdowns
  dropdown: {
    width: "100%",
    background: C.surfaceAlt,
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    padding: "10px 30px 10px 32px",
    fontSize: 13,
    fontWeight: 600,
    color: C.text,
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    outline: "none",
  },
  dropdownIcon: {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 15,
    pointerEvents: "none",
  },
  dropdownArrow: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 11,
    color: C.muted,
    pointerEvents: "none",
  },

  dropdownLabel: {
    fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 0.8,
    textTransform: "uppercase", marginBottom: 6,
  },
  checkBtn: {
    width: "100%",
    background: C.green,
    border: "none",
    borderRadius: 12,
    padding: "13px",
    fontSize: 15,
    fontWeight: 800,
    color: "#000",
    cursor: "pointer",
    letterSpacing: 0.3,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transition: "opacity 0.2s",
  },
  filterTag: {
    background: C.greenDim,
    color: C.green,
    fontSize: 12,
    fontWeight: 700,
    borderRadius: 8,
    padding: "4px 12px",
  },

  // Bottom nav
  bottomNav: {
    position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
    width: "100%", maxWidth: 430, background: C.surface,
    borderTop: `1px solid ${C.border}`,
    display: "flex", justifyContent: "space-around", padding: "10px 0 14px",
  },
  navItem: (active) => ({
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: 4, fontSize: 10, fontWeight: 600, letterSpacing: 0.5,
    color: active ? C.green : C.muted, cursor: "pointer", textTransform: "uppercase",
  }),
};

// ── Dynamic Dataset ────────────────────────────────────────────
const CROP_DATA = {
  Soybean: {
    Kharif:  { "2023-24": [310,390,510], "2022-23": [280,350,460], "2021-22": [240,310,400], "2020-21": [200,270,360], "2019-20": [180,250,330] },
    Rabi:    { "2023-24": [120,160,210], "2022-23": [110,150,195], "2021-22": [100,140,180], "2020-21": [90,130,165],  "2019-20": [80,120,150] },
    Zaid:    { "2023-24": [60,90,130],   "2022-23": [55,85,120],   "2021-22": [50,80,110],   "2020-21": [45,75,100],  "2019-20": [40,70,95]  },
  },
  Rice: {
    Kharif:  { "2023-24": [420,510,640], "2022-23": [390,480,600], "2021-22": [350,440,560], "2020-21": [310,400,520], "2019-20": [280,370,490] },
    Rabi:    { "2023-24": [200,260,330], "2022-23": [185,245,315], "2021-22": [170,230,300], "2020-21": [155,215,285], "2019-20": [140,200,270] },
    Zaid:    { "2023-24": [90,130,175],  "2022-23": [85,125,165],  "2021-22": [80,120,155],  "2020-21": [75,115,145], "2019-20": [70,110,138] },
  },
  Wheat: {
    Kharif:  { "2023-24": [100,140,190], "2022-23": [90,130,175],  "2021-22": [85,125,165],  "2020-21": [80,120,155],  "2019-20": [75,115,148] },
    Rabi:    { "2023-24": [450,540,680], "2022-23": [420,510,640], "2021-22": [390,475,600], "2020-21": [360,445,565], "2019-20": [330,415,530] },
    Zaid:    { "2023-24": [70,100,140],  "2022-23": [65,95,132],   "2021-22": [60,90,125],   "2020-21": [55,85,118],  "2019-20": [50,80,112]  },
  },
  Cotton: {
    Kharif:  { "2023-24": [280,350,460], "2022-23": [260,330,435], "2021-22": [240,310,410], "2020-21": [220,290,385], "2019-20": [200,270,360] },
    Rabi:    { "2023-24": [80,110,150],  "2022-23": [75,105,142],  "2021-22": [70,100,135],  "2020-21": [65,95,128],  "2019-20": [60,90,120]  },
    Zaid:    { "2023-24": [50,75,105],   "2022-23": [48,72,100],   "2021-22": [45,68,95],    "2020-21": [42,65,90],   "2019-20": [40,62,85]   },
  },
  Maize: {
    Kharif:  { "2023-24": [360,440,570], "2022-23": [330,410,535], "2021-22": [300,380,500], "2020-21": [270,350,465], "2019-20": [245,325,435] },
    Rabi:    { "2023-24": [160,210,275], "2022-23": [150,198,260], "2021-22": [140,186,245], "2020-21": [130,175,230], "2019-20": [120,165,218] },
    Zaid:    { "2023-24": [75,110,150],  "2022-23": [70,105,142],  "2021-22": [66,100,135],  "2020-21": [62,95,128],  "2019-20": [58,90,120]  },
  },
  Onion: {
    Kharif:  { "2023-24": [190,250,330], "2022-23": [175,235,310], "2021-22": [160,220,295], "2020-21": [148,208,280], "2019-20": [135,195,265] },
    Rabi:    { "2023-24": [380,470,600], "2022-23": [355,445,570], "2021-22": [330,418,540], "2020-21": [305,392,510], "2019-20": [280,365,480] },
    Zaid:    { "2023-24": [120,165,220], "2022-23": [115,158,210], "2021-22": [110,150,200], "2020-21": [105,143,190], "2019-20": [100,136,180] },
  },
  Tomato: {
    Kharif:  { "2023-24": [220,290,385], "2022-23": [205,272,362], "2021-22": [190,255,340], "2020-21": [175,238,318], "2019-20": [160,222,296] },
    Rabi:    { "2023-24": [310,400,520], "2022-23": [290,378,492], "2021-22": [270,356,464], "2020-21": [250,334,438], "2019-20": [232,313,412] },
    Zaid:    { "2023-24": [140,188,250], "2022-23": [132,178,236], "2021-22": [125,168,224], "2020-21": [118,158,212], "2019-20": [111,149,200] },
  },
};

const PRICE_DATA = {
  Soybean: { Kharif: { peak: 7200, current: [[0,80],[40,72],[80,60],[120,65],[160,50],[200,38],[240,28],[280,20]], avg: [[0,90],[40,85],[80,80],[120,78],[160,75],[200,70],[240,68],[280,65]] } },
  Rice:    { Kharif: { peak: 4800, current: [[0,85],[40,75],[80,65],[120,55],[160,45],[200,35],[240,25],[280,18]], avg: [[0,88],[40,82],[80,76],[120,72],[160,68],[200,65],[240,62],[280,60]] } },
  Wheat:   { Rabi:   { peak: 3200, current: [[0,75],[40,68],[80,55],[120,60],[160,48],[200,40],[240,32],[280,22]], avg: [[0,85],[40,80],[80,75],[120,72],[160,70],[200,67],[240,64],[280,60]] } },
  Cotton:  { Kharif: { peak: 9500, current: [[0,90],[40,78],[80,65],[120,70],[160,55],[200,42],[240,30],[280,22]], avg: [[0,92],[40,86],[80,80],[120,77],[160,74],[200,71],[240,68],[280,64]] } },
  Maize:   { Kharif: { peak: 2800, current: [[0,82],[40,74],[80,62],[120,67],[160,52],[200,40],[240,30],[280,20]], avg: [[0,88],[40,83],[80,78],[120,75],[160,72],[200,69],[240,66],[280,62]] } },
  Onion:   { Rabi:   { peak: 5600, current: [[0,78],[40,70],[80,58],[120,63],[160,50],[200,40],[240,28],[280,18]], avg: [[0,86],[40,81],[80,76],[120,73],[160,70],[200,67],[240,63],[280,60]] } },
  Tomato:  { Kharif: { peak: 6800, current: [[0,88],[40,76],[80,63],[120,68],[160,52],[200,39],[240,27],[280,19]], avg: [[0,91],[40,85],[80,79],[120,76],[160,73],[200,70],[240,67],[280,63]] } },
};

const MARGIN_DATA = {
  Soybean: { Kharif: { margin: "+32.4%", pos: true, label: "Net Margin" }, Rabi: { margin: "+14.2%", pos: true, label: "Net Margin" }, Zaid: { margin: "+8.1%", pos: true, label: "Net Margin" } },
  Rice:    { Kharif: { margin: "+22.8%", pos: true, label: "Net Margin" }, Rabi: { margin: "+16.5%", pos: true, label: "Net Margin" }, Zaid: { margin: "+9.3%",  pos: true, label: "Net Margin" } },
  Wheat:   { Kharif: { margin: "+5.2%",  pos: true, label: "Net Margin" }, Rabi: { margin: "+28.6%", pos: true, label: "Net Margin" }, Zaid: { margin: "-2.1%",  pos: false, label: "Market Drop" } },
  Cotton:  { Kharif: { margin: "+18.7%", pos: true, label: "Net Margin" }, Rabi: { margin: "+6.4%",  pos: true, label: "Net Margin" }, Zaid: { margin: "-5.3%",  pos: false, label: "Market Drop" } },
  Maize:   { Kharif: { margin: "+15.3%", pos: true, label: "Net Margin" }, Rabi: { margin: "+11.8%", pos: true, label: "Net Margin" }, Zaid: { margin: "+4.7%",  pos: true, label: "Net Margin" } },
  Onion:   { Kharif: { margin: "-4.1%",  pos: false, label: "Market Drop" }, Rabi: { margin: "+21.4%", pos: true, label: "Net Margin" }, Zaid: { margin: "+7.9%", pos: true, label: "Net Margin" } },
  Tomato:  { Kharif: { margin: "+18.2%", pos: true, label: "Net Margin" }, Rabi: { margin: "+24.1%", pos: true, label: "Net Margin" }, Zaid: { margin: "+12.6%", pos: true, label: "Net Margin" } },
};

const VOLATILITY_DATA = {
  Soybean: { score: 68, text: "Low volatility in Oilseeds. Stable supply chain with minor disruptions expected in Western Maharashtra." },
  Rice:    { score: 54, text: "Moderate volatility. Water availability in Kharif regions may cause 10-15% price fluctuation." },
  Wheat:   { score: 42, text: "Low volatility in Rabi season. Government MSP support keeps prices stable across major mandis." },
  Cotton:  { score: 78, text: "High volatility due to export policy uncertainty and pest pressure in central India regions." },
  Maize:   { score: 61, text: "Moderate volatility. Feed industry demand is strong but transport delays causing regional gaps." },
  Onion:   { score: 85, text: "Very high volatility. Perishable nature and seasonal rainfall causing sharp price swings." },
  Tomato:  { score: 80, text: "High volatility. Cold-chain gaps and unseasonal rain predictions in Western Maharashtra." },
};

// ── Bar Chart ───────────────────────────────────────────────────
function HistoricalYieldChart({ crop = "Soybean", season = "Kharif", year = "2023-24" }) {
  const cropSeasonData = CROP_DATA[crop]?.[season]?.[year] || [200, 300, 420];
  const prevYear = year.split("-")[0];
  const years = [+prevYear - 2, +prevYear - 1, +prevYear].map(y => `${y}`);
  const max = Math.max(...cropSeasonData);
  const vsAvg = Math.round(((cropSeasonData[2] - cropSeasonData[0]) / cropSeasonData[0]) * 100);
  const barColors = [C.greenDim, "#1d6b3f", C.green];

  return (
    <div style={s.card}>
      <div style={s.barTopRow}>
        <div>
          <div style={s.cardTitle}>Historical Yield<br/>Analysis</div>
          <div style={{ fontSize: 12, color: C.green, fontWeight: 700, marginTop: 2, marginBottom: 0 }}>
            {crop} · {season} · {year}
          </div>
          <div style={s.cardSub}>Total production volume in Quintals</div>
        </div>
        <div style={s.vsAvgBadge}>{vsAvg >= 0 ? "↑" : "↓"} {vsAvg >= 0 ? "+" : ""}{vsAvg}% VS AVG</div>
      </div>
      <div style={s.barArea}>
        {cropSeasonData.map((val, i) => {
          const barH = Math.round((val / max) * 120);
          return (
            <div key={i} style={s.barWrap}>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.white, marginBottom: 6, visibility: i === 2 ? "visible" : "hidden" }}>
                {val}
              </div>
              <div style={s.bar(barColors[i], barH)} />
              <div style={s.barXLabel}>
                <div style={{ textTransform: "uppercase" }}>{season}</div>
                <div>{years[i]}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Donut Chart ─────────────────────────────────────────────────
const SEGMENTS = [
  { label: "Mumbai Mandi", pct: 60, color: C.green },
  { label: "Pune APMC", pct: 25, color: C.muted },
  { label: "Nagpur Hub", pct: 15, color: C.orange },
];

function DonutChart() {
  const r = 70, cx = 85, cy = 85, stroke = 22;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  const slices = SEGMENTS.map((seg) => {
    const dash = (seg.pct / 100) * circ;
    const slice = { ...seg, dash, offset };
    offset += dash;
    return slice;
  });

  return (
    <div style={s.card}>
      <div style={s.cardTitle}>Market Spread</div>
      <div style={s.cardSub}>Sales distribution across Mandis</div>

      <div style={s.donutWrap}>
        <svg width="170" height="170" viewBox="0 0 170 170">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth={stroke} />
          {slices.map((sl) => (
            <circle
              key={sl.label} cx={cx} cy={cy} r={r}
              fill="none" stroke={sl.color} strokeWidth={stroke}
              strokeDasharray={`${sl.dash} ${circ - sl.dash}`}
              strokeDashoffset={-sl.offset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          ))}
        </svg>
        <div style={s.donutCenter}>
          <div style={s.donutValue}>1.2k</div>
          <div style={s.donutSub}>Sold Quintals</div>
        </div>
      </div>

      {SEGMENTS.map((seg, i) => (
        <div key={seg.label} style={{ ...s.legendItem, borderBottom: i === SEGMENTS.length - 1 ? "none" : undefined }}>
          <div style={s.legendLeft}>
            <div style={s.legendDot(seg.color)} />
            {seg.label}
          </div>
          <div style={s.legendPct}>{seg.pct}%</div>
        </div>
      ))}
    </div>
  );
}

// ── Price Trajectory ────────────────────────────────────────────
function PriceTrajectory({ crop = "Soybean", season = "Kharif", year = "2023-24" }) {
  const [tab, setTab] = useState("current");
  const cropSeasons = PRICE_DATA[crop] || {};
  const seasonData = cropSeasons[season] || Object.values(cropSeasons)[0] || {};
  const currentPts = seasonData.current || [[0,80],[40,72],[80,60],[120,65],[160,50],[200,38],[240,28],[280,20]];
  const avgPts = seasonData.avg || [[0,90],[40,85],[80,80],[120,78],[160,75],[200,70],[240,68],[280,65]];
  const peak = seasonData.peak || 7200;
  const toPath = (pts) => pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const xLabels = ["JAN", "MAR", "MAY", "JUL", "SEP", "NOV"];
  const activePts = tab === "current" ? currentPts : avgPts;

  return (
    <div style={s.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={s.cardTitle}>Price Trajectory</div>
          <div style={s.cardSub}>{crop} · {season} · {year}</div>
        </div>
        <div style={s.toggleRow}>
          <button style={s.toggleBtn(tab === "current")} onClick={() => setTab("current")}>— Current</button>
          <button style={s.toggleBtn(tab === "avg")} onClick={() => setTab("avg")}>5-Yr Avg</button>
        </div>
      </div>
      <div style={{ position: "relative" }}>
        <svg width="100%" viewBox="0 0 290 110" preserveAspectRatio="none" style={{ display: "block", height: 130 }}>
          {[25, 55, 85].map((y) => (
            <line key={y} x1="0" y1={y} x2="290" y2={y} stroke={C.border} strokeWidth="1" />
          ))}
          <path d={`${toPath(activePts)} L280,110 L0,110 Z`} fill="rgba(34,197,94,0.07)" />
          <path d={toPath(avgPts)} fill="none" stroke={C.muted} strokeWidth="1.5" strokeDasharray="5,3" />
          <path d={toPath(currentPts)} fill="none" stroke={C.green} strokeWidth="2.5" />
          <circle cx={currentPts[6][0]} cy={currentPts[6][1]} r="5" fill={C.green} />
          <circle cx={currentPts[6][0]} cy={currentPts[6][1]} r="9" fill="rgba(34,197,94,0.2)" />
        </svg>
        <div style={{ position: "absolute", top: 10, right: 20 }}>
          <span style={s.peakTag}>₹{peak.toLocaleString("en-IN")} (PEAK)</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.muted, marginTop: 6 }}>
          {xLabels.map((l) => <span key={l}>{l}</span>)}
        </div>
      </div>
    </div>
  );
}

// ── Crop icon/bg map ────────────────────────────────────────────
const CROP_META = {
  Soybean: { icon: "🫘", bg: "#1a2d1a" },
  Rice:    { icon: "🌾", bg: "#1d2a10" },
  Wheat:   { icon: "🌿", bg: "#1a2d20" },
  Cotton:  { icon: "☁️", bg: "#1a1f2d" },
  Maize:   { icon: "🌽", bg: "#2d2a10" },
  Onion:   { icon: "🧅", bg: "#1a1a2d" },
  Tomato:  { icon: "🍅", bg: "#2d1a0f" },
};

// ── Top Profit Margins ──────────────────────────────────────────
function TopProfitMargins({ crop = "Soybean", season = "Kharif", year = "2023-24" }) {
  const selected = MARGIN_DATA[crop]?.[season] || { margin: "+0.0%", pos: true, label: "Net Margin" };
  const meta = CROP_META[crop] || { icon: "🌱", bg: "#1a2d1a" };

  // Show selected crop + two nearby crops for context
  const allCrops = Object.keys(MARGIN_DATA);
  const others = allCrops.filter(c => c !== crop).slice(0, 2);
  const rows = [
    { name: crop, season, ...selected, ...meta, highlight: true },
    ...others.map(c => ({
      name: c, season,
      ...(MARGIN_DATA[c]?.[season] || { margin: "+0.0%", pos: true, label: "Net Margin" }),
      ...CROP_META[c],
      highlight: false,
    })),
  ];

  return (
    <div style={s.card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 18 }}>📈</span>
        <div style={s.cardTitle}>Top Profit Margins</div>
      </div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>{season} Season · {year}</div>

      {rows.map((m) => (
        <div key={m.name} style={{
          ...s.marginItem,
          border: m.highlight ? `1px solid ${C.green}` : `1px solid ${C.border}`,
          background: m.highlight ? C.greenBg : C.surfaceAlt,
        }}>
          <div style={s.marginLeft}>
            <div style={s.marginIcon(m.bg)}>{m.icon}</div>
            <div>
              <div style={s.marginName}>{m.name}</div>
              <div style={s.marginCategory}>{m.season}</div>
            </div>
          </div>
          <div>
            <div style={s.marginValue(m.pos)}>{m.margin}</div>
            <div style={s.marginLabel}>{m.label}</div>
          </div>
        </div>
      ))}

      <div style={s.viewAll}>VIEW ALL COMMODITIES →</div>
    </div>
  );
}

// ── Market Volatility Index ─────────────────────────────────────
function MarketVolatilityIndex({ crop = "Soybean" }) {
  const data = VOLATILITY_DATA[crop] || { score: 65, text: "Moderate market conditions expected." };
  const scoreColor = data.score >= 75 ? C.red : data.score >= 55 ? C.orange : C.green;
  const fillGradient = data.score >= 75
    ? `linear-gradient(90deg, ${C.orange}, ${C.red})`
    : data.score >= 55
    ? `linear-gradient(90deg, ${C.green}, ${C.orange})`
    : `linear-gradient(90deg, ${C.green}, #84cc16)`;

  return (
    <div style={s.volatilityCard}>
      <div style={{
        position: "absolute", bottom: -30, right: -30, width: 160, height: 160,
        borderRadius: "50%", background: "rgba(34,197,94,0.04)",
      }} />
      <div style={s.liveBadge}>
        <div style={s.liveDot} /> Live Risk Assessment
      </div>
      <div style={s.volatilityTitle}>Market Volatility<br />Index</div>
      <div style={{ fontSize: 12, color: C.green, fontWeight: 700, marginBottom: 10 }}>{crop}</div>
      <div style={s.volatilityBody}>{data.text}</div>
      <div style={s.scoreRow}>
        <div style={s.scoreTrack}>
          <div style={{ ...s.scoreFill, width: `${data.score}%`, background: fillGradient }} />
        </div>
        <div style={{ ...s.scoreValue, color: scoreColor }}>
          {data.score}<span style={{ fontSize: 14, color: C.muted }}>/100</span>
        </div>
      </div>
    </div>
  );
}


// ── Bottom Nav ──────────────────────────────────────────────────
const NAV = [
  { icon: "🏠", label: "Home" },
  { icon: "⇆", label: "Mandi" },
  { icon: "📡", label: "Forecast" },
  { icon: "📊", label: "Stats", active: true },
  { icon: "👤", label: "Profile" },
];

function BottomNav() {
  const [active, setActive] = useState("Stats");
  return (
    <nav style={s.bottomNav}>
      {NAV.map((n) => (
        <div key={n.label} style={s.navItem(active === n.label)} onClick={() => setActive(n.label)}>
          <span style={{ fontSize: 20 }}>{n.icon}</span>
          {n.label}
        </div>
      ))}
    </nav>
  );
}

// ── Page ────────────────────────────────────────────────────────
export default function StatsPage() {
  const [selectedCrop, setSelectedCrop] = useState("Soybean");
  const [selectedSeason, setSelectedSeason] = useState("Kharif");
  const [selectedYear, setSelectedYear] = useState("2023-24");
  const [applied, setApplied] = useState({ crop: "Soybean", season: "Kharif", year: "2023-24" });
  const [showAnalysis, setShowAnalysis] = useState(true);

  const handleCheck = () => {
    setApplied({ crop: selectedCrop, season: selectedSeason, year: selectedYear });
    setShowAnalysis(true);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.bg}; }
        select option { background: #1a2333; color: #e2e8f0; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      <div style={s.app}>

        {/* Header */}
        <header style={s.header}>
          <div style={s.logo}><span>📍</span> MandAI</div>
        </header>

        {/* Hero */}
        <div style={s.hero}>
          <div style={s.heroTitle}>Market Intelligence</div>
          <div style={s.heroSub}>
            Visualizing your farm's performance and regional market volatility to optimize your next harvest cycle.
          </div>
          <div style={s.heroActions}>
            <button style={s.reportBtn}>⬇ Report</button>
          </div>
        </div>

        {/* Filter Row */}
        <div style={{ padding: "0 16px 20px" }}>
          {/* Row 1: Crop + Season + Year */}
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            {/* Crop */}
            <div style={{ flex: 1.2, position: "relative" }}>
              <div style={s.dropdownLabel}>Crop</div>
              <div style={{ position: "relative" }}>
                <select value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)} style={s.dropdown}>
                  {["Rice","Wheat","Cotton","Soybean","Maize","Onion","Tomato"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <span style={s.dropdownIcon}>🌱</span>
                <span style={s.dropdownArrow}>▾</span>
              </div>
            </div>
            {/* Season */}
            <div style={{ flex: 1, position: "relative" }}>
              <div style={s.dropdownLabel}>Season</div>
              <div style={{ position: "relative" }}>
                <select value={selectedSeason} onChange={(e) => setSelectedSeason(e.target.value)} style={s.dropdown}>
                  {["Kharif","Rabi","Zaid"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <span style={s.dropdownIcon}>🌦</span>
                <span style={s.dropdownArrow}>▾</span>
              </div>
            </div>
            {/* Year */}
            <div style={{ flex: 1, position: "relative" }}>
              <div style={s.dropdownLabel}>Yr</div>
              <div style={{ position: "relative" }}>
                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={s.dropdown}>
                  {["2023-24","2022-23","2021-22","2020-21","2019-20"].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <span style={s.dropdownArrow}>▾</span>
              </div>
            </div>
          </div>

          {/* Check Button */}
          <button onClick={handleCheck} style={s.checkBtn}>
            ✓ Check Analysis
          </button>
        </div>

        {/* Applied filter tag */}
        {showAnalysis && (
          <div style={{ padding: "0 16px 14px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {[applied.crop, applied.season, applied.year].map((tag) => (
              <span key={tag} style={s.filterTag}>{tag}</span>
            ))}
          </div>
        )}

        {showAnalysis && (
          <>
            <HistoricalYieldChart crop={applied.crop} season={applied.season} year={applied.year} />
            <DonutChart />
            <PriceTrajectory crop={applied.crop} season={applied.season} year={applied.year} />
            <TopProfitMargins crop={applied.crop} season={applied.season} year={applied.year} />
            <MarketVolatilityIndex crop={applied.crop} />
          </>
        )}
        <BottomNav />
      </div>
    </>
  );
}
