import { useState } from "react";
import { useNavigate } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0f14;
    --surface: #111820;
    --surface2: #161e28;
    --border: #1e2a36;
    --green: #3fd95f;
    --green-dim: rgba(63,217,95,0.12);
    --teal: #39d0c8;
    --amber: #f0b429;
    --amber-dim: rgba(240,180,41,0.12);
    --red: #f05a4a;
    --red-dim: rgba(240,90,74,0.12);
    --text: #e8f0f8;
    --muted: #6b7d8f;
    --card-glow: rgba(63,217,95,0.06);
  }

  body { background: var(--bg); font-family: 'Sora', sans-serif; color: var(--text); }

  .app {
    max-width: 420px; margin: 0 auto; min-height: 100vh;
    background: var(--bg); display: flex; flex-direction: column;
    position: relative;
  }

  .scroll-area {
    flex: 1; overflow-y: auto; padding-bottom: 80px; scrollbar-width: none;
  }
  .scroll-area::-webkit-scrollbar { display: none; }

  /* ── TOPBAR ── */
  .topbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 18px 12px;
    position: sticky; top: 0; z-index: 20;
    background: rgba(10,15,20,0.9); backdrop-filter: blur(18px);
    border-bottom: 1px solid var(--border);
  }
  .top-left { display: flex; align-items: center; gap: 6px; }
  .top-loc { font-size: 15px; font-weight: 700; color: var(--text); }
  .top-brand { font-size: 16px; font-weight: 800; color: var(--green); letter-spacing: -0.3px; }
  .top-globe { color: var(--muted); cursor: pointer; }
  .top-globe svg { width: 20px; height: 20px; }
  .pin-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green); box-shadow: 0 0 8px var(--green); flex-shrink: 0; }

  /* ── 7-DAY FORECAST CARD ── */
  .forecast-card {
    margin: 14px 14px 0;
    background: linear-gradient(135deg, #0f1e2e 0%, #0a1520 100%);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 18px 18px 16px;
    position: relative;
    overflow: hidden;
  }
  .forecast-card::before {
    content: '';
    position: absolute; top: -40px; right: -40px;
    width: 160px; height: 160px;
    background: radial-gradient(circle, rgba(63,217,95,0.08) 0%, transparent 70%);
    pointer-events: none;
  }
  .fc-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 4px; }
  .fc-title { font-size: 26px; font-weight: 800; color: var(--text); line-height: 1.15; letter-spacing: -0.5px; }
  .fc-temp { display: flex; align-items: center; gap: 6px; font-size: 22px; font-weight: 700; color: var(--text); }
  .fc-temp svg { width: 22px; height: 22px; color: var(--amber); }
  .fc-sub { font-size: 12px; color: var(--muted); margin-bottom: 16px; }

  .days-row { display: flex; gap: 8px; }
  .day-chip {
    flex: 1; background: rgba(30,42,54,0.7); border: 1px solid var(--border);
    border-radius: 14px; padding: 10px 6px; text-align: center;
    transition: border-color 0.2s;
  }
  .day-chip.today { border-color: rgba(63,217,95,0.4); background: rgba(63,217,95,0.08); }
  .day-chip:hover { border-color: rgba(63,217,95,0.3); }
  .day-label { font-size: 10px; font-weight: 600; color: var(--muted); letter-spacing: 0.6px; text-transform: uppercase; margin-bottom: 6px; }
  .day-chip.today .day-label { color: var(--green); }
  .day-icon { font-size: 20px; margin-bottom: 6px; }
  .day-temp { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 3px; }
  .day-range { font-size: 10px; color: var(--muted); }

  /* ── MARKET RISK ── */
  .section-title { font-size: 18px; font-weight: 700; color: var(--text); letter-spacing: -0.3px; padding: 20px 16px 10px; }

  .risk-card {
    margin: 0 14px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 18px;
    overflow: hidden;
  }

  .risk-banner {
    background: linear-gradient(135deg, #1a1400, #221a00);
    border-bottom: 1px solid var(--border);
    padding: 20px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .risk-banner::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(240,180,41,0.08), transparent);
  }
  .risk-top-bar {
    width: 60%; height: 3px; margin: 0 auto 14px;
    background: linear-gradient(90deg, transparent, var(--amber), transparent);
    border-radius: 2px;
  }
  .risk-level { font-size: 32px; font-weight: 800; color: var(--amber); letter-spacing: 2px; }
  .risk-sub { font-size: 11px; font-weight: 600; color: var(--muted); letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }

  .risk-rows { padding: 4px 0; }
  .risk-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 13px 18px;
    border-top: 1px solid var(--border);
  }
  .risk-row-label { font-size: 14px; font-weight: 500; color: var(--text); }
  .badge {
    font-size: 11px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase;
    padding: 4px 10px; border-radius: 6px;
  }
  .badge-low { background: var(--green-dim); color: var(--green); border: 1px solid rgba(63,217,95,0.3); }
  .badge-high { background: var(--red-dim); color: var(--red); border: 1px solid rgba(240,90,74,0.3); }
  .badge-med { background: var(--amber-dim); color: var(--amber); border: 1px solid rgba(240,180,41,0.3); }

  /* ── MARKET SUPPLY IMPACT ── */
  .impact-card {
    margin: 10px 14px 0;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 18px;
  }
  .impact-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
  .impact-icon {
    width: 42px; height: 42px; border-radius: 12px;
    background: var(--green-dim); border: 1px solid rgba(63,217,95,0.2);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .impact-icon svg { width: 20px; height: 20px; color: var(--green); }
  .impact-title { font-size: 20px; font-weight: 800; color: var(--text); line-height: 1.2; letter-spacing: -0.4px; }
  .impact-body { font-size: 13.5px; line-height: 1.65; color: #a0b4c5; margin-bottom: 14px; }
  .impact-body strong { color: var(--text); font-weight: 600; }
  .impact-body .highlight { color: var(--green); font-weight: 700; }

  .alert-box {
    background: rgba(240,180,41,0.06);
    border: 1px solid rgba(240,180,41,0.25);
    border-radius: 12px;
    padding: 12px 14px;
    display: flex; gap: 10px;
  }
  .alert-box svg { width: 18px; height: 18px; color: var(--amber); flex-shrink: 0; margin-top: 1px; }
  .alert-text { }
  .alert-title { font-size: 13px; font-weight: 700; color: var(--amber); margin-bottom: 3px; }
  .alert-body { font-size: 12px; color: #8a9aaa; line-height: 1.5; }

  /* ── BEST SELLING WINDOW ── */
  .bsw-card {
    margin: 10px 14px 0;
    background: linear-gradient(135deg, #0e2214 0%, #071a0d 100%);
    border: 1px solid rgba(63,217,95,0.25);
    border-radius: 20px;
    padding: 20px;
    position: relative; overflow: hidden;
  }
  .bsw-card::before {
    content: '';
    position: absolute; bottom: -60px; right: -60px;
    width: 200px; height: 200px;
    background: radial-gradient(circle, rgba(63,217,95,0.12) 0%, transparent 70%);
    pointer-events: none;
  }
  .bsw-tag {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 10px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase;
    color: var(--green); background: rgba(63,217,95,0.1); border: 1px solid rgba(63,217,95,0.25);
    padding: 4px 10px; border-radius: 6px; margin-bottom: 10px;
  }
  .bsw-tag svg { width: 12px; height: 12px; }
  .bsw-label { font-size: 22px; font-weight: 800; color: var(--text); letter-spacing: -0.4px; margin-bottom: 2px; }
  .bsw-dates { font-size: 40px; font-weight: 800; color: var(--green); letter-spacing: -1px; line-height: 1.1; margin-bottom: 10px; }
  .bsw-desc { font-size: 12px; color: #6b8f7a; line-height: 1.5; margin-bottom: 16px; }

  .bsw-stats { display: flex; gap: 10px; }
  .bsw-stat {
    flex: 1; background: rgba(0,0,0,0.3); border: 1px solid rgba(63,217,95,0.15);
    border-radius: 12px; padding: 10px 12px;
  }
  .bsw-stat-label { font-size: 10px; font-weight: 600; color: #4a7058; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 4px; }
  .bsw-stat-val { font-size: 16px; font-weight: 800; color: var(--green); letter-spacing: -0.3px; }

  /* ── HARVEST STRATEGY ── */
  .strategy-card {
    margin: 10px 14px 0;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 18px;
    overflow: hidden;
  }
  .strategy-item {
    padding: 16px 18px;
    border-bottom: 1px solid var(--border);
    display: flex; gap: 14px; align-items: flex-start;
  }
  .strategy-item:last-child { border-bottom: none; }
  .strategy-icon {
    width: 38px; height: 38px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; font-size: 18px;
  }
  .si-blue { background: rgba(57,208,200,0.1); }
  .si-green { background: rgba(63,217,95,0.1); }
  .si-amber { background: rgba(240,180,41,0.1); }
  .strategy-content { flex: 1; }
  .strategy-name { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 5px; }
  .strategy-desc { font-size: 12.5px; color: #7a909f; line-height: 1.6; }

  /* ── BOTTOM NAV ── */
  .bottom-nav {
    position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
    width: 100%; max-width: 420px;
    background: rgba(10,15,20,0.96); backdrop-filter: blur(20px);
    border-top: 1px solid var(--border);
    display: flex; padding: 8px 0 12px; z-index: 30;
  }
  .nav-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; padding: 4px 0; transition: all 0.2s; }
  .nav-item svg { width: 22px; height: 22px; }
  .nav-label { font-size: 9px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; }
  .nav-item.inactive { color: var(--muted); }
  .nav-item.inactive:hover { color: var(--text); }
  .nav-item.active { color: var(--green); }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fade-up { animation: fadeUp 0.5s ease both; }
  .d1 { animation-delay: 0.05s; }
  .d2 { animation-delay: 0.12s; }
  .d3 { animation-delay: 0.19s; }
  .d4 { animation-delay: 0.26s; }
  .d5 { animation-delay: 0.33s; }
  .d6 { animation-delay: 0.4s; }
`;

// ── ICONS ─────────────────────────────────────────────────────────────────
const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);
const CloudIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
  </svg>
);
const BarChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);
const TriangleWarnIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const TagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const TrendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);
const SignalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M5 12.55a11 11 0 0 1 14.08 0"/>
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>
  </svg>
);
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#39d0c8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:20,height:20}}>
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const LeafIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#3fd95f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:20,height:20}}>
    <path d="M17 8C8 10 5.9 16.17 3.82 19.63c-.4.64.56 1.21 1.07.67l.21-.21C7.63 17.33 9.32 16 12 16c4 0 7-2 7-7 0-1-.27-2-.27-2l-1.73 1z"/>
  </svg>
);
const TruckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#f0b429" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:20,height:20}}>
    <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

// ── COMPONENT ─────────────────────────────────────────────────────────────
export default function MandAIForecast() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("FORECAST");

  const days = [
    { label: "TODAY", icon: "☀️", temp: "28°", range: "H:32° L:24°", today: true },
    { label: "MON",   icon: "🌦️", temp: "26°", range: "H:30° L:23°" },
    { label: "TUE",   icon: "🌧️", temp: "24°", range: "H:28° L:22°" },
  ];

  const navItems = [
    { id: "HOME", icon: <HomeIcon /> },
    { id: "MANDI", icon: <TrendIcon /> },
    { id: "FORECAST", icon: <SignalIcon /> },
    { id: "STATS", icon: <BarChartIcon /> },
    { id: "PROFILE", icon: <UserIcon /> },
  ];

  const handleNavClick = (id) => {
    setActiveNav(id);
    if (id === "HOME") {
      navigate("/dashboard");
      return;
    }
    if (id === "MANDI") {
      navigate("/comparison");
      return;
    }
    if (id === "FORECAST") {
      navigate("/forecast");
      return;
    }
    if (id === "STATS") {
      navigate("/stats");
      return;
    }
    if (id === "PROFILE") {
      navigate("/profile");
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="scroll-area">

          {/* TOPBAR */}
          <div className="topbar">
            <div className="top-left">
              <div className="pin-dot" />
              <span className="top-loc">Nagpur, MH</span>
              <span style={{color:"var(--muted)",margin:"0 4px"}}>·</span>
              <span className="top-brand">MandAI</span>
            </div>
            <div className="top-globe"><GlobeIcon /></div>
          </div>

          {/* 7-DAY FORECAST */}
          <div className="forecast-card fade-up d1">
            <div className="fc-top">
              <div className="fc-title">7-Day<br/>Forecast</div>
              <div className="fc-temp">
                <CloudIcon />
                28°C
              </div>
            </div>
            <div className="fc-sub">Detailed outlook for Soybean &amp; Cotton hubs</div>
            <div className="days-row">
              {days.map(d => (
                <div key={d.label} className={`day-chip ${d.today ? "today" : ""}`}>
                  <div className="day-label">{d.label}</div>
                  <div className="day-icon">{d.icon}</div>
                  <div className="day-temp">{d.temp}</div>
                  <div className="day-range">{d.range}</div>
                </div>
              ))}
            </div>
          </div>

          {/* MARKET RISK LEVEL */}
          <div className="section-title fade-up d2">Market Risk Level</div>
          <div className="risk-card fade-up d2">
            <div className="risk-banner">
              <div className="risk-top-bar" />
              <div className="risk-level">MEDIUM</div>
              <div className="risk-sub">Volatility Risk</div>
            </div>
            <div className="risk-rows">
              <div className="risk-row">
                <span className="risk-row-label">Crop Health Risk</span>
                <span className="badge badge-low">LOW</span>
              </div>
              <div className="risk-row">
                <span className="risk-row-label">Arrival Delay Risk</span>
                <span className="badge badge-high">HIGH</span>
              </div>
            </div>
          </div>

          {/* MARKET SUPPLY IMPACT */}
          <div className="impact-card fade-up d3">
            <div className="impact-header">
              <div className="impact-icon"><BarChartIcon /></div>
              <div className="impact-title">Market Supply<br/>Impact</div>
            </div>
            <p className="impact-body">
              Heavy unseasonal rainfall in <strong>Madhya Pradesh</strong> hubs is predicted
              to delay harvest cycles by 7–10 days. Expect a tightening of spot
              supply in Nagpur Mandi, likely driving Soybean prices up by{" "}
              <span className="highlight">approx. 5.2%</span> within the next fortnight.
            </p>
            <div className="alert-box">
              <TriangleWarnIcon />
              <div className="alert-text">
                <div className="alert-title">Price Prediction Alert</div>
                <div className="alert-body">Supply constraints will peak on Wednesday. Local inventory is currently at 40% capacity.</div>
              </div>
            </div>
          </div>

          {/* BEST SELLING WINDOW */}
          <div className="bsw-card fade-up d4">
            <div className="bsw-tag">
              <TagIcon />
              AI Recommendation
            </div>
            <div className="bsw-label">Best Selling<br/>Window</div>
            <div className="bsw-dates">Nov 14 – 16</div>
            <div className="bsw-desc">Optimal 3-day window identified using price trend analysis + rain-free forecast.</div>
            <div className="bsw-stats">
              <div className="bsw-stat">
                <div className="bsw-stat-label">Expected Price</div>
                <div className="bsw-stat-val">₹5,420/q</div>
              </div>
              <div className="bsw-stat">
                <div className="bsw-stat-label">Trend Strength</div>
                <div className="bsw-stat-val">STRONG</div>
              </div>
            </div>
          </div>

          {/* HARVEST STRATEGY */}
          <div className="section-title fade-up d5">Harvest Strategy &amp; Risk Mitigation</div>
          <div className="strategy-card fade-up d5">
            <div className="strategy-item">
              <div className="strategy-icon si-blue"><ClockIcon /></div>
              <div className="strategy-content">
                <div className="strategy-name">Timing Adjustment</div>
                <div className="strategy-desc">Avoid harvesting during the Tue–Wed rain window. Shift activities to Monday morning to minimize moisture content.</div>
              </div>
            </div>
            <div className="strategy-item">
              <div className="strategy-icon si-green"><LeafIcon /></div>
              <div className="strategy-content">
                <div className="strategy-name">Post-Harvest Care</div>
                <div className="strategy-desc">If harvested during humidity &gt;70%, ensure 48-hour mechanical drying to maintain 'Grade A' market certification.</div>
              </div>
            </div>
            <div className="strategy-item">
              <div className="strategy-icon si-amber"><TruckIcon /></div>
              <div className="strategy-content">
                <div className="strategy-name">Logistics Planning</div>
                <div className="strategy-desc">Book transport for Thursday. Market gates expected to be congested on Monday due to panic selling.</div>
              </div>
            </div>
          </div>

          <div style={{ height: 20 }} />
        </div>

        {/* BOTTOM NAV */}
        <nav className="bottom-nav">
          {navItems.map(item => (
            <div
              key={item.id}
              className={`nav-item ${activeNav === item.id ? "active" : "inactive"}`}
              onClick={() => handleNavClick(item.id)}
            >
              {item.icon}
              <span className="nav-label">{item.id}</span>
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}
