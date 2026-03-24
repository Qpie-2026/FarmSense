import { useState } from "react";
import { useNavigate } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0d1117;
    --surface: #161b22;
    --surface2: #1c2333;
    --border: #21262d;
    --green: #3fb950;
    --teal: #39d0c8;
    --amber: #e3b341;
    --text: #e6edf3;
    --muted: #7d8590;
    --danger: #f85149;
  }

  body { background: var(--bg); font-family: 'Sora', sans-serif; }

  .app {
    max-width: 420px; margin: 0 auto; min-height: 100vh;
    background: var(--bg); display: flex; flex-direction: column;
    position: relative; overflow: hidden;
  }
  .app::before {
    content: ''; position: fixed; top: -80px; left: 50%;
    transform: translateX(-50%); width: 340px; height: 340px;
    background: radial-gradient(circle, rgba(63,185,80,0.07) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }
  .scroll-area { flex: 1; overflow-y: auto; padding-bottom: 80px; scrollbar-width: none; }
  .scroll-area::-webkit-scrollbar { display: none; }

  .topbar {
    display: flex; justify-content: space-between; align-items: center;
    padding: 18px 20px 12px; position: sticky; top: 0;
    background: rgba(13,17,23,0.92); backdrop-filter: blur(16px);
    z-index: 10; border-bottom: 1px solid var(--border);
  }
  .logo { display: flex; align-items: center; gap: 7px; font-size: 20px; font-weight: 700; color: var(--green); letter-spacing: -0.3px; }
  .logo svg { width: 20px; height: 20px; }

  .hero { display: flex; flex-direction: column; align-items: center; padding: 28px 20px 20px; }
  .avatar-wrap { position: relative; width: 96px; height: 96px; margin-bottom: 14px; }
  .avatar-ring { position: absolute; inset: -3px; background: linear-gradient(135deg, var(--green), var(--teal)); border-radius: 24px; padding: 2px; }
  .avatar-inner { width: 100%; height: 100%; background: linear-gradient(135deg, #1a2332, #1c2b1e); border-radius: 22px; display: flex; align-items: center; justify-content: center; font-size: 38px; font-weight: 700; color: var(--green); }
  .avatar-edit { position: absolute; bottom: -5px; right: -5px; width: 26px; height: 26px; background: var(--green); border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 2px solid var(--bg); transition: transform 0.2s; }
  .avatar-edit:hover { transform: scale(1.1); }
  .avatar-edit svg { width: 13px; height: 13px; }
  .uname { font-size: 24px; font-weight: 700; color: var(--text); letter-spacing: -0.5px; margin-bottom: 4px; }
  .member-since { font-size: 11px; font-weight: 500; color: var(--muted); letter-spacing: 1.5px; text-transform: uppercase; }

  .section { padding: 0 16px 12px; }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 14px 16px; transition: border-color 0.2s; }
  .card:hover { border-color: rgba(63,185,80,0.3); }
  .location-card { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
  .loc-icon { width: 40px; height: 40px; border-radius: 10px; background: rgba(63,185,80,0.12); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .loc-icon svg { width: 18px; height: 18px; color: var(--green); }
  .loc-info { flex: 1; }
  .loc-label { font-size: 10px; color: var(--muted); font-weight: 500; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 2px; }
  .loc-value { font-size: 16px; font-weight: 600; color: var(--text); }
  .map-btn { color: var(--muted); cursor: pointer; transition: color 0.2s; }
  .map-btn:hover { color: var(--teal); }
  .map-btn svg { width: 20px; height: 20px; }
  .stats-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 14px 16px; }
  .stat-label { font-size: 10px; color: var(--muted); font-weight: 500; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 6px; }
  .stat-value { font-size: 22px; font-weight: 700; color: var(--green); letter-spacing: -0.5px; }
  .stat-unit { font-size: 14px; font-weight: 500; color: var(--text); margin-left: 3px; }
  .stat-text { font-size: 15px; font-weight: 600; color: var(--text); margin-top: 2px; }

  .sec-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 16px 10px; }
  .sec-title { font-size: 18px; font-weight: 700; color: var(--text); letter-spacing: -0.3px; }
  .view-all { font-size: 13px; font-weight: 600; color: var(--green); cursor: pointer; }
  .view-all:hover { text-decoration: underline; }

  .mandi-item { display: flex; align-items: center; gap: 12px; padding: 13px 16px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; margin: 0 16px 8px; transition: all 0.2s; cursor: pointer; }
  .mandi-item:hover { border-color: rgba(63,185,80,0.3); transform: translateX(2px); }
  .mandi-icon { width: 40px; height: 40px; border-radius: 10px; background: rgba(227,179,65,0.12); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .mandi-icon svg { width: 20px; height: 20px; color: var(--amber); }
  .mandi-info { flex: 1; }
  .mandi-name { font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 2px; }
  .mandi-sub { font-size: 12px; color: var(--muted); }
  .bell-btn { cursor: pointer; transition: color 0.2s; }
  .bell-active { color: var(--green); }
  .bell-inactive { color: var(--muted); }
  .bell-btn:hover { color: var(--green); }
  .bell-btn svg { width: 20px; height: 20px; }

  .settings-list { padding: 0 16px; display: flex; flex-direction: column; gap: 4px; }
  .setting-row { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; cursor: pointer; transition: all 0.2s; }
  .setting-row:hover { border-color: rgba(63,185,80,0.2); }
  .s-icon { color: var(--muted); flex-shrink: 0; }
  .setting-label { flex: 1; font-size: 15px; font-weight: 500; color: var(--text); }
  .setting-value { font-size: 14px; color: var(--green); font-weight: 500; display: flex; align-items: center; gap: 4px; }

  .toggle { width: 44px; height: 24px; border-radius: 12px; background: var(--surface2); border: 1px solid var(--border); position: relative; cursor: pointer; transition: all 0.25s; flex-shrink: 0; }
  .toggle.on { background: var(--green); border-color: var(--green); }
  .toggle::after { content: ''; position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 50%; background: white; transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1); box-shadow: 0 1px 4px rgba(0,0,0,0.3); }
  .toggle.on::after { transform: translateX(20px); }

  .account-list { padding: 0 16px; display: flex; flex-direction: column; gap: 4px; }
  .account-row { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; cursor: pointer; transition: all 0.2s; }
  .account-row:hover { border-color: rgba(63,185,80,0.25); background: var(--surface2); }
  .account-row.danger { margin-top: 4px; border-color: rgba(248,81,73,0.15); }
  .account-row.danger:hover { border-color: rgba(248,81,73,0.4); background: rgba(248,81,73,0.05); }
  .account-row.danger .acc-label { color: var(--danger); }
  .acc-icon { flex-shrink: 0; color: var(--muted); }
  .acc-label { flex: 1; font-size: 15px; font-weight: 500; color: var(--text); }

  .bottom-nav { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 420px; background: rgba(13,17,23,0.95); backdrop-filter: blur(20px); border-top: 1px solid var(--border); display: flex; padding: 8px 0 12px; z-index: 20; }
  .nav-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; padding: 4px 0; transition: all 0.2s; }
  .nav-item svg { width: 22px; height: 22px; }
  .nav-label { font-size: 9px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; }
  .nav-item.inactive { color: var(--muted); }
  .nav-item.inactive:hover { color: var(--text); }
  .nav-item.active { color: var(--green); }

  /* EDIT PROFILE PANEL */
  .panel-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 50; opacity: 0; pointer-events: none; transition: opacity 0.3s; }
  .panel-overlay.open { opacity: 1; pointer-events: all; }
  .panel { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%) translateY(100%); width: 100%; max-width: 420px; background: var(--surface); border-radius: 24px 24px 0 0; border: 1px solid var(--border); border-bottom: none; z-index: 51; transition: transform 0.4s cubic-bezier(0.32,0.72,0,1); max-height: 90vh; overflow-y: auto; scrollbar-width: none; }
  .panel::-webkit-scrollbar { display: none; }
  .panel.open { transform: translateX(-50%) translateY(0); }
  .panel-handle { width: 36px; height: 4px; background: var(--border); border-radius: 2px; margin: 12px auto 0; }
  .panel-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px 8px; }
  .panel-title { font-size: 20px; font-weight: 700; color: var(--text); letter-spacing: -0.4px; }
  .panel-close { width: 32px; height: 32px; border-radius: 8px; background: var(--surface2); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--muted); transition: all 0.2s; }
  .panel-close:hover { color: var(--text); border-color: var(--green); }
  .panel-close svg { width: 16px; height: 16px; }
  .panel-avatar-row { display: flex; flex-direction: column; align-items: center; padding: 12px 20px 20px; }
  .panel-avatar { width: 72px; height: 72px; border-radius: 18px; background: linear-gradient(135deg, #1a2332, #1c2b1e); display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; color: var(--green); border: 2px solid var(--green); margin-bottom: 10px; }
  .change-photo-btn { font-size: 13px; color: var(--green); font-weight: 600; cursor: pointer; background: none; border: none; font-family: 'Sora', sans-serif; }
  .change-photo-btn:hover { text-decoration: underline; }
  .field-group { padding: 0 20px; display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px; }
  .field { display: flex; flex-direction: column; gap: 6px; }
  .field-label { font-size: 11px; font-weight: 600; color: var(--muted); letter-spacing: 0.8px; text-transform: uppercase; }
  .field-input { background: var(--bg); border: 1px solid var(--border); border-radius: 10px; padding: 11px 14px; font-size: 15px; color: var(--text); font-family: 'Sora', sans-serif; outline: none; transition: border-color 0.2s; width: 100%; }
  .field-input:focus { border-color: var(--green); }
  .field-input::placeholder { color: var(--muted); }
  .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .save-btn { width: calc(100% - 40px); margin: 0 20px 32px; padding: 14px; background: var(--green); border: none; border-radius: 12px; font-size: 16px; font-weight: 700; color: #0d1117; cursor: pointer; font-family: 'Sora', sans-serif; letter-spacing: -0.2px; transition: all 0.2s; display: block; }
  .save-btn:hover { background: #4fd060; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(63,185,80,0.3); }
  .save-btn:active { transform: translateY(0); }
`;

// ── ICONS ─────────────────────────────────────────────────────────────────

const Ico = ({ d, fill = "none", children, ...p }) => (
  <svg viewBox="0 0 24 24" fill={fill} stroke={fill === "none" ? "currentColor" : "none"}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    {d ? <path d={d} /> : children}
  </svg>
);

const PinIcon = () => <Ico style={{width:20,height:20}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></Ico>;
const MapIcon = () => <Ico style={{width:20,height:20}}><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></Ico>;
const StoreIcon = () => <Ico style={{width:20,height:20}}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></Ico>;

const BellOnIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{width:20,height:20}}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const BellOffIcon = () => <Ico style={{width:20,height:20}}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></Ico>;

// Language — globe with meridians
const GlobeIcon = () => <Ico style={{width:20,height:20}} className="s-icon"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></Ico>;

// Price Alerts — rupee/tag
const PriceTagIcon = () => <Ico style={{width:20,height:20}} className="s-icon"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></Ico>;

// Dark Mode — crescent moon
const MoonIcon = () => <Ico style={{width:20,height:20}} className="s-icon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></Ico>;

// Edit Profile — user with pen
const UserEditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:20,height:20}} className="acc-icon">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L13 14l-4 1 1-4 8.5-8.5z"/>
  </svg>
);

// Support & Help — headphones
const HeadphonesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:20,height:20}} className="acc-icon">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
  </svg>
);

// Logout — door with arrow out
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:20,height:20}} className="acc-icon" >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const ChevRt = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14,color:"var(--muted)"}}><polyline points="9 18 15 12 9 6"/></svg>;
const CloseIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const PencilSmIcon = () => <svg viewBox="0 0 24 24" fill="white" stroke="none" style={{width:13,height:13}}><path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z"/></svg>;

const HomeIcon = () => <Ico><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></Ico>;
const TrendIcon = () => <Ico><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></Ico>;
const SignalIcon = () => <Ico><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></Ico>;
const BarIcon = () => <Ico><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></Ico>;
const UserIcon = () => <Ico><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Ico>;

// ── MAIN ──────────────────────────────────────────────────────────────────

export default function MandAIProfile() {
  const navigate = useNavigate();
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [activeNav, setActiveNav] = useState("PROFILE");
  const [editOpen, setEditOpen] = useState(false);

  const [profile, setProfile] = useState({
    firstName: "Ramesh", lastName: "Patil",
    phone: "+91 98765 43210", email: "ramesh.patil@email.com",
    location: "Nagpur, Maharashtra", acreage: "5", crops: "Soybean, Tomato",
  });
  const [draft, setDraft] = useState({ ...profile });

  const openEdit = () => { setDraft({ ...profile }); setEditOpen(true); };
  const closeEdit = () => setEditOpen(false);
  const saveEdit = () => { setProfile({ ...draft }); setEditOpen(false); };
  const set = (k) => (e) => setDraft(d => ({ ...d, [k]: e.target.value }));

  const navItems = [
    { id: "HOME", icon: <HomeIcon /> }, { id: "MANDI", icon: <TrendIcon /> },
    { id: "FORECAST", icon: <SignalIcon /> }, { id: "STATS", icon: <BarIcon /> },
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
  const initials = `${profile.firstName[0]}${profile.lastName[0]}`;

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="scroll-area">

          {/* TOP BAR */}
          <div className="topbar">
            <div className="logo"><PinIcon /> MandAI</div>
          </div>

          {/* HERO */}
          <div className="hero">
            <div className="avatar-wrap">
              <div className="avatar-ring"><div className="avatar-inner">{initials}</div></div>
              <div className="avatar-edit" onClick={openEdit}><PencilSmIcon /></div>
            </div>
            <div className="uname">{profile.firstName} {profile.lastName}</div>
            <div className="member-since">Member since Oct 2022</div>
          </div>

          {/* LOCATION + STATS */}
          <div className="section">
            <div className="card location-card">
              <div className="loc-icon"><PinIcon /></div>
              <div className="loc-info">
                <div className="loc-label">Primary Location</div>
                <div className="loc-value">{profile.location}</div>
              </div>
              <div className="map-btn"><MapIcon /></div>
            </div>
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-label">Total Acreage</div>
                <div><span className="stat-value">{profile.acreage}</span><span className="stat-unit"> Acres</span></div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Crops</div>
                <div className="stat-text">{profile.crops}</div>
              </div>
            </div>
          </div>

          {/* PREFERRED MANDIS */}
          <div className="sec-header">
            <span className="sec-title">Preferred Mandis</span>
            <span className="view-all">View All</span>
          </div>
          <div className="mandi-item">
            <div className="mandi-icon"><StoreIcon /></div>
            <div className="mandi-info">
              <div className="mandi-name">Nagpur Mandi</div>
              <div className="mandi-sub">Daily price alerts active</div>
            </div>
            <div className="bell-btn bell-active"><BellOnIcon /></div>
          </div>
          <div className="mandi-item">
            <div className="mandi-icon" style={{ background: "rgba(125,133,144,0.1)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:20,height:20}}>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div className="mandi-info">
              <div className="mandi-name">Amravati Market</div>
              <div className="mandi-sub">Weekly summaries only</div>
            </div>
            <div className="bell-btn bell-inactive"><BellOffIcon /></div>
          </div>

          {/* APP SETTINGS */}
          <div className="sec-header" style={{ paddingTop: 20 }}>
            <span className="sec-title">App Settings</span>
          </div>
          <div className="settings-list">
            <div className="setting-row">
              <GlobeIcon />
              <span className="setting-label">Language</span>
              <span className="setting-value">English <ChevRt /></span>
            </div>
            <div className="setting-row" onClick={() => setPriceAlerts(v => !v)}>
              <PriceTagIcon />
              <span className="setting-label">Price Alerts</span>
              <div className={`toggle ${priceAlerts ? "on" : ""}`} />
            </div>
            <div className="setting-row" onClick={() => setDarkMode(v => !v)}>
              <MoonIcon />
              <span className="setting-label">Dark Mode</span>
              <div className={`toggle ${darkMode ? "on" : ""}`} />
            </div>
          </div>

          {/* ACCOUNT */}
          <div className="sec-header" style={{ paddingTop: 20 }}>
            <span className="sec-title">Account</span>
          </div>
          <div className="account-list">
            <div className="account-row" onClick={openEdit}>
              <UserEditIcon />
              <span className="acc-label">Edit Profile</span>
              <ChevRt />
            </div>
            <div className="account-row">
              <HeadphonesIcon />
              <span className="acc-label">Support &amp; Help</span>
              <ChevRt />
            </div>
            <div className="account-row danger">
              <LogoutIcon />
              <span className="acc-label">Logout</span>
            </div>
          </div>
          <div style={{ height: 16 }} />
        </div>

        {/* BOTTOM NAV */}
        <nav className="bottom-nav">
          {navItems.map(item => (
            <div key={item.id} className={`nav-item ${activeNav === item.id ? "active" : "inactive"}`} onClick={() => handleNavClick(item.id)}>
              {item.icon}
              <span className="nav-label">{item.id}</span>
            </div>
          ))}
        </nav>

        {/* EDIT PROFILE PANEL */}
        <div className={`panel-overlay ${editOpen ? "open" : ""}`} onClick={closeEdit} />
        <div className={`panel ${editOpen ? "open" : ""}`}>
          <div className="panel-handle" />
          <div className="panel-header">
            <span className="panel-title">Edit Profile</span>
            <div className="panel-close" onClick={closeEdit}><CloseIcon /></div>
          </div>
          <div className="panel-avatar-row">
            <div className="panel-avatar">{initials}</div>
            <button className="change-photo-btn">Change Photo</button>
          </div>
          <div className="field-group">
            <div className="field-row">
              <div className="field">
                <label className="field-label">First Name</label>
                <input className="field-input" value={draft.firstName} onChange={set("firstName")} placeholder="First name" />
              </div>
              <div className="field">
                <label className="field-label">Last Name</label>
                <input className="field-input" value={draft.lastName} onChange={set("lastName")} placeholder="Last name" />
              </div>
            </div>
            <div className="field">
              <label className="field-label">Phone Number</label>
              <input className="field-input" value={draft.phone} onChange={set("phone")} placeholder="+91 XXXXX XXXXX" />
            </div>
            <div className="field">
              <label className="field-label">Email</label>
              <input className="field-input" type="email" value={draft.email} onChange={set("email")} placeholder="you@email.com" />
            </div>
            <div className="field">
              <label className="field-label">Location</label>
              <input className="field-input" value={draft.location} onChange={set("location")} placeholder="City, State" />
            </div>
            <div className="field-row">
              <div className="field">
                <label className="field-label">Acreage</label>
                <input className="field-input" value={draft.acreage} onChange={set("acreage")} placeholder="Acres" />
              </div>
              <div className="field">
                <label className="field-label">Crops</label>
                <input className="field-input" value={draft.crops} onChange={set("crops")} placeholder="e.g. Wheat, Rice" />
              </div>
            </div>
          </div>
          <button className="save-btn" onClick={saveEdit}>Save Changes</button>
        </div>
      </div>
    </>
  );
}
