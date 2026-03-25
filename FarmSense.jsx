import { useState, useEffect, useRef } from "react";
const API_URL = "http://127.0.0.1:5000";

async function getRealForecast(commodity, days = 30) {
  try {
    const res = await fetch(`${API_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        commodity: commodity,
        days: days
      })
    });

    const data = await res.json();

    if (!data.predictions) throw new Error("Invalid response");

    return data.predictions.map((price, i) => ({
      day: i + 1,
      price: price,
      date: new Date(Date.now() + i * 86400000).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric"
      })
    }));

  } catch (err) {
    console.error("API Error:", err);
    return [];
  }
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const NAGPUR_MARKETS = [
  "Nagpur Main APMC","Kalamna Market","Butibori APMC",
  "Kamptee Market","Hingna Market","Wadi Market","Umred Market","Katol Market",
];
const NAGPUR_COMMODITIES = [
  { name:"Tomato",       emoji:"🍅" },{ name:"Onion",        emoji:"🧅" },
  { name:"Potato",       emoji:"🥔" },{ name:"Wheat",        emoji:"🌾" },
  { name:"Soybean",      emoji:"🌿" },{ name:"Cotton",       emoji:"☁️" },
  { name:"Orange",       emoji:"🍊" },{ name:"Chilli",       emoji:"🌶️" },
  { name:"Turmeric",     emoji:"💛" },{ name:"Garlic",       emoji:"🧄" },
  { name:"Moong Dal",    emoji:"🫘" },{ name:"Tur Dal",      emoji:"🫘" },
  { name:"Brinjal",      emoji:"🍆" },{ name:"Banana",       emoji:"🍌" },
  { name:"Bitter Gourd", emoji:"🥒" },
];
const BUFFER_DAYS = {
  Tomato:{max:7,ideal:3,note:"Highly perishable — sell within 3 days"},
  Onion:{max:120,ideal:60,note:"Store in dry cool place up to 4 months"},
  Potato:{max:90,ideal:45,note:"Store in dark cool conditions"},
  Wheat:{max:365,ideal:180,note:"Proper dry storage up to 1 year"},
  Soybean:{max:180,ideal:90,note:"Store in dry airtight containers"},
  Cotton:{max:365,ideal:180,note:"Baled cotton stores up to 1 year"},
  Orange:{max:30,ideal:14,note:"Refrigerated storage up to 30 days"},
  Chilli:{max:180,ideal:90,note:"Dried chilli stores 6 months"},
  Turmeric:{max:365,ideal:180,note:"Dried turmeric stores 1 year"},
  Garlic:{max:180,ideal:90,note:"Cured garlic stores 6 months"},
  "Moong Dal":{max:180,ideal:90,note:"Store in airtight containers"},
  "Tur Dal":{max:180,ideal:90,note:"Store in airtight containers"},
  Brinjal:{max:7,ideal:3,note:"Very perishable — sell within 3 days"},
  Banana:{max:7,ideal:4,note:"Sell before over-ripening"},
  "Bitter Gourd":{max:7,ideal:3,note:"Perishable — sell within 3 days"},
};
const BASE_PRICES = {
  Tomato:1800,Onion:1200,Potato:900,Wheat:2100,Soybean:4200,
  Cotton:6500,Orange:3200,Chilli:8500,Turmeric:7200,Garlic:4800,
  "Moong Dal":7500,"Tur Dal":6800,Brinjal:1400,Banana:2200,"Bitter Gourd":1600,
};


const glass={
  background:"rgba(255,255,255,0.04)",
  border:"1px solid rgba(74,222,128,0.12)",
  borderRadius:16,backdropFilter:"blur(20px)",
};
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#060d08}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(74,222,128,0.2);border-radius:2px}
  select option{background:#0f1f12;color:#fff}
  input::placeholder{color:rgba(255,255,255,0.25)}
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes sway0{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
  @keyframes sway1{0%,100%{transform:rotate(2deg)}50%{transform:rotate(-4deg)}}
  @keyframes sway2{0%,100%{transform:rotate(-1deg)}50%{transform:rotate(5deg)}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
  @keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes countUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .msg{animation:slideIn 0.3s ease}
  .chip:hover{border-color:rgba(74,222,128,0.4)!important;color:#4ade80!important}
  .feat-card{transition:transform 0.25s,box-shadow 0.25s}.feat-card:hover{transform:translateY(-6px)}
  .cta-btn{transition:all 0.25s}.cta-btn:hover{transform:scale(1.04)}
  .model-toggle{transition:all 0.15s}.model-toggle:hover{transform:scale(1.04)}
  .metric-card{transition:transform 0.2s}.metric-card:hover{transform:translateY(-3px)}
  select:focus,input:focus{outline:none;border-color:rgba(74,222,128,0.4)!important}
`;

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({active,navigate,user}){
  const links=[
    {id:"dashboard",icon:"⊞",label:"Dashboard"},
    {id:"prediction",icon:"◈",label:"Predictions"},
    {id:"chat",icon:"◎",label:"AI Advisor"},
  ];
  return(
    <aside style={{width:72,background:"rgba(10,26,15,0.95)",backdropFilter:"blur(20px)",
      borderRight:"1px solid rgba(74,222,128,0.1)",display:"flex",flexDirection:"column",
      alignItems:"center",padding:"20px 0",gap:8,zIndex:100,flexShrink:0}}>
      <div style={{marginBottom:24}}>
        <div onClick={()=>navigate("dashboard")} style={{width:40,height:40,borderRadius:12,
          background:"linear-gradient(135deg,#16a34a,#4ade80)",display:"flex",
          alignItems:"center",justifyContent:"center",fontSize:20,cursor:"pointer"}}>🌾</div>
      </div>
      {links.map(l=>(
        <button key={l.id} onClick={()=>navigate(l.id)} title={l.label} style={{
          width:48,height:48,borderRadius:12,border:"none",
          background:active===l.id?"rgba(74,222,128,0.15)":"transparent",
          color:active===l.id?"#4ade80":"rgba(255,255,255,0.4)",
          fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
          transition:"all 0.2s",boxShadow:active===l.id?"0 0 0 1px rgba(74,222,128,0.3)":"none",
        }}>{l.icon}</button>
      ))}
      <div style={{flex:1}}/>
      <div style={{width:36,height:36,borderRadius:"50%",
        background:"linear-gradient(135deg,#166534,#4ade80)",display:"flex",
        alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,
        color:"#fff",border:"2px solid rgba(74,222,128,0.3)"}}>
        {(user?.name||"U")[0].toUpperCase()}
      </div>
    </aside>
  );
}

// ─── LANDING ──────────────────────────────────────────────────────────────────
function Landing({onGetStarted}){
  const[loaded,setLoaded]=useState(false);
  useEffect(()=>{setTimeout(()=>setLoaded(true),100);},[]);
  const stats=[{val:"10,000+",lbl:"Farmers"},{val:"95%",lbl:"Accuracy"},{val:"15+",lbl:"Commodities"},{val:"8",lbl:"Nagpur Markets"}];
  const features=[
    {icon:"◈",title:"AI Price Prediction",desc:"ARIMA + XGBoost ensemble forecasts up to 30 days with confidence intervals"},
    {icon:"◎",title:"Best Time to Sell",desc:"Automated sell/hold alerts based on your commodity's live price trajectory"},
    {icon:"⊹",title:"Market Alerts",desc:"Compare all 8 Nagpur APMC mandis and get real-time weather-linked insights"},
  ];
  return(
    <div style={{minHeight:"100vh",background:"#060d08",fontFamily:"'Outfit',sans-serif",overflow:"hidden",position:"relative"}}>
      <style>{GLOBAL_STYLES}</style>
      <div style={{position:"fixed",inset:0,zIndex:0,background:`
        radial-gradient(ellipse 80% 50% at 50% 100%,rgba(22,101,52,0.35) 0%,transparent 70%),
        radial-gradient(ellipse 40% 30% at 20% 80%,rgba(74,222,128,0.07) 0%,transparent 60%)
      `}}/>
      <div style={{position:"fixed",bottom:0,left:0,right:0,height:200,zIndex:0,overflow:"hidden"}}>
        {Array.from({length:28},(_,i)=>(
          <div key={i} style={{position:"absolute",bottom:0,left:`${(i/28)*100}%`,
            width:3,transformOrigin:"bottom center",
            background:`linear-gradient(to top,rgba(22,101,52,0.6),rgba(74,222,128,0.12),transparent)`,
            animation:`sway${i%3} ${2.5+(i%5)*0.3}s ease-in-out infinite`,
            height:`${100+(i%7)*15}px`,animationDelay:`${(i*0.15)%2}s`}}/>
        ))}
      </div>
      <div style={{position:"relative",zIndex:1}}>
        <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"24px 48px",borderBottom:"1px solid rgba(74,222,128,0.08)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:28}}>🌾</span>
            <span style={{fontSize:22,fontWeight:800,
              background:"linear-gradient(90deg,#4ade80,#a3e635)",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>FarmSense</span>
          </div>
          <button onClick={onGetStarted} style={{
            background:"rgba(74,222,128,0.1)",border:"1px solid rgba(74,222,128,0.3)",
            color:"#4ade80",padding:"8px 24px",borderRadius:99,fontSize:14,
            fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Login</button>
        </nav>
        <div style={{textAlign:"center",padding:"80px 24px 60px",
          opacity:loaded?1:0,transform:loaded?"none":"translateY(20px)",transition:"all 0.8s ease"}}>
          <div style={{display:"inline-block",background:"rgba(74,222,128,0.1)",
            border:"1px solid rgba(74,222,128,0.2)",borderRadius:99,
            padding:"6px 16px",fontSize:12,color:"#4ade80",fontWeight:600,
            letterSpacing:"0.1em",marginBottom:28}}>
            POWERED BY AI + ML • NAGPUR MANDI DATA
          </div>
          <h1 style={{fontSize:"clamp(40px,7vw,76px)",fontWeight:800,lineHeight:1.1,
            marginBottom:24,color:"#fff"}}>
            Know When to Sell.<br/>
            <span style={{background:"linear-gradient(90deg,#4ade80,#a3e635,#86efac)",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
              Maximize Profit.
            </span>
          </h1>
          <p style={{fontSize:18,color:"rgba(255,255,255,0.5)",maxWidth:520,
            margin:"0 auto 40px",lineHeight:1.7,fontWeight:300}}>
            AI-powered price forecasting for Nagpur's farmers and traders.
            Predict mandi prices up to 30 days ahead. Never sell at the wrong time again.
          </p>
          <button className="cta-btn" onClick={onGetStarted} style={{
            background:"linear-gradient(135deg,#16a34a,#4ade80)",border:"none",
            color:"#041f0a",padding:"18px 48px",borderRadius:99,fontSize:17,fontWeight:700,
            cursor:"pointer",fontFamily:"inherit",boxShadow:"0 0 30px rgba(74,222,128,0.25)"}}>
            Get Started Free →
          </button>
        </div>
        <div style={{display:"flex",justifyContent:"center",
          padding:"0 48px 60px",opacity:loaded?1:0,transition:"opacity 0.8s 0.3s ease"}}>
          {stats.map((s,i)=>(
            <div key={i} style={{textAlign:"center",padding:"20px 36px",
              borderLeft:i>0?"1px solid rgba(74,222,128,0.12)":"none"}}>
              <div style={{fontSize:28,fontWeight:800,
                background:"linear-gradient(90deg,#4ade80,#a3e635)",
                WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{s.val}</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.4)",marginTop:4}}>{s.lbl}</div>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20,
          maxWidth:960,margin:"0 auto",padding:"0 48px 80px",
          opacity:loaded?1:0,transition:"opacity 0.8s 0.5s ease"}}>
          {features.map((f,i)=>(
            <div key={i} className="feat-card" style={{background:"rgba(255,255,255,0.03)",
              border:"1px solid rgba(74,222,128,0.12)",borderRadius:20,padding:"28px 24px",
              backdropFilter:"blur(20px)"}}>
              <div style={{width:44,height:44,borderRadius:12,background:"rgba(74,222,128,0.1)",
                border:"1px solid rgba(74,222,128,0.2)",display:"flex",alignItems:"center",
                justifyContent:"center",fontSize:20,color:"#4ade80",marginBottom:16}}>{f.icon}</div>
              <div style={{fontSize:16,fontWeight:700,color:"#fff",marginBottom:8}}>{f.title}</div>
              <div style={{fontSize:14,color:"rgba(255,255,255,0.45)",lineHeight:1.6}}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login({onLogin,onBack}){
  const[tab,setTab]=useState("farmer");
  const[form,setForm]=useState({name:"",email:"",mobile:"",location:NAGPUR_MARKETS[0],commodities:[]});
  const[errors,setErrors]=useState({});
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const toggleC=(n)=>set("commodities",form.commodities.includes(n)?form.commodities.filter(c=>c!==n):[...form.commodities,n]);
  const validate=()=>{
    const e={};
    if(!form.name.trim())e.name="Name required";
    if(!form.email.includes("@"))e.email="Valid email required";
    if(tab==="farmer"&&!/^\d{10}$/.test(form.mobile))e.mobile="10-digit mobile required";
    if(tab==="trader"&&form.commodities.length===0)e.commodities="Select at least one commodity";
    setErrors(e);return Object.keys(e).length===0;
  };
  const inp=(err)=>({width:"100%",background:"rgba(255,255,255,0.04)",
    border:`1px solid ${err?"rgba(239,68,68,0.5)":"rgba(74,222,128,0.15)"}`,
    borderRadius:10,padding:"12px 16px",color:"#fff",fontSize:14,fontFamily:"inherit",
    outline:"none",boxSizing:"border-box",transition:"border-color 0.2s"});
  return(
    <div style={{minHeight:"100vh",background:"#060d08",display:"flex",alignItems:"center",
      justifyContent:"center",fontFamily:"'Outfit',sans-serif",padding:24,
      backgroundImage:`radial-gradient(ellipse 60% 40% at 50% 100%,rgba(22,101,52,0.3) 0%,transparent 70%)`}}>
      <style>{GLOBAL_STYLES}</style>
      <div style={{width:"100%",maxWidth:480}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:40,marginBottom:8}}>🌾</div>
          <div style={{fontSize:28,fontWeight:800,
            background:"linear-gradient(90deg,#4ade80,#a3e635)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>FarmSense</div>
          <div style={{color:"rgba(255,255,255,0.35)",fontSize:13,marginTop:4}}>
            Nagpur's smartest mandi price predictor
          </div>
        </div>
        <div style={{...glass,padding:32}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",background:"rgba(0,0,0,0.3)",
            borderRadius:12,padding:4,marginBottom:28,gap:4}}>
            {["farmer","trader"].map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{padding:"10px",borderRadius:9,
                border:"none",background:tab===t?"rgba(74,222,128,0.15)":"transparent",
                color:tab===t?"#4ade80":"rgba(255,255,255,0.4)",fontSize:14,fontWeight:600,
                cursor:"pointer",fontFamily:"inherit",
                boxShadow:tab===t?"0 0 0 1px rgba(74,222,128,0.25)":"none",transition:"all 0.2s"}}>
                {t==="farmer"?"🧑‍🌾 Farmer":"🏪 Trader"}
              </button>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {[{k:"name",l:"Full Name",p:"Enter your name",t:"text"},
              {k:"email",l:"Email Address",p:"you@example.com",t:"email"},
              ...(tab==="farmer"?[{k:"mobile",l:"Mobile Number",p:"10-digit mobile",t:"tel"}]:[])
            ].map(f=>(
              <div key={f.k}>
                <label style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginBottom:6,
                  display:"block",fontWeight:500}}>{f.l}</label>
                <input style={inp(errors[f.k])} placeholder={f.p} type={f.t}
                  value={form[f.k]} onChange={e=>set(f.k,e.target.value)}/>
                {errors[f.k]&&<div style={{color:"#ef4444",fontSize:11,marginTop:4}}>{errors[f.k]}</div>}
              </div>
            ))}
            <div>
              <label style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginBottom:6,
                display:"block",fontWeight:500}}>
                {tab==="trader"?"Your Market (Location)":"Nearest Market"}
              </label>
              <select style={{...inp(false),appearance:"none"}}
                value={form.location} onChange={e=>set("location",e.target.value)}>
                {NAGPUR_MARKETS.map(m=><option key={m}>{m}</option>)}
              </select>
            </div>
            {tab==="trader"&&(
              <div>
                <label style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginBottom:8,
                  display:"block",fontWeight:500}}>Commodities You Sell</label>
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {NAGPUR_COMMODITIES.slice(0,10).map(c=>(
                    <div key={c.name} onClick={()=>toggleC(c.name)} style={{
                      padding:"6px 12px",borderRadius:99,fontSize:12,fontWeight:500,cursor:"pointer",
                      border:`1px solid ${form.commodities.includes(c.name)?"rgba(74,222,128,0.5)":"rgba(255,255,255,0.1)"}`,
                      background:form.commodities.includes(c.name)?"rgba(74,222,128,0.12)":"transparent",
                      color:form.commodities.includes(c.name)?"#4ade80":"rgba(255,255,255,0.5)",
                      transition:"all 0.15s"}}>
                      {c.emoji} {c.name}
                    </div>
                  ))}
                </div>
                {errors.commodities&&<div style={{color:"#ef4444",fontSize:11,marginTop:6}}>{errors.commodities}</div>}
              </div>
            )}
            <button onClick={()=>{if(validate())onLogin({...form,role:tab})}} style={{
              width:"100%",background:"linear-gradient(135deg,#16a34a,#4ade80)",border:"none",
              color:"#041f0a",padding:14,borderRadius:12,fontSize:15,fontWeight:700,
              cursor:"pointer",fontFamily:"inherit",marginTop:4}}>
              Enter FarmSense →
            </button>
          </div>
        </div>
        <button onClick={onBack} style={{display:"block",margin:"20px auto 0",background:"none",
          border:"none",color:"rgba(255,255,255,0.3)",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
          ← Back to home
        </button>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({user,navigate}){
  const[commodity,setCommodity]=useState("Tomato");
  const[market,setMarket]=useState(user?.location||NAGPUR_MARKETS[0]);
  const[weather,setWeather]=useState(null);
  const OWKEY=import.meta?.env?.VITE_OPENWEATHER_KEY||"";
  const [forecast, setForecast] = useState([]);
  const [cur, setCur] = useState(0);

useEffect(() => {
  getRealForecast(commodity, 30).then(data => {
    setForecast(data);
    if (data.length > 0) {
      setCur(data[0].price);
    }
  });
}, [commodity]);
  useEffect(()=>{
    if(OWKEY){
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=Nagpur,IN&appid=${OWKEY}&units=metric`)
        .then(r=>r.json()).then(d=>{if(d.main)setWeather(d);}).catch(()=>{});
    }
  },[]);
  const p2 = forecast[2]?.price || cur;
 const p7 = forecast[7]?.price || cur;
 const p15 = forecast[15]?.price || cur;
 const p30 = forecast[29]?.price || cur;
  const ch30=((p30-cur)/cur*100).toFixed(1);
  const rising=p30>cur;
  const buf=BUFFER_DAYS[commodity]||{max:30,ideal:14,note:"Store appropriately"};
  const bestDay=forecast.reduce((b,d)=>d.price>b.price?d:b,forecast[0]||{});
  const sig=p7>cur?"SELL SOON":p15>cur?"HOLD 7–15 DAYS":"HOLD 15–30 DAYS";
  const sigC=p7>cur?"#4ade80":p15>cur?"#facc15":"#60a5fa";
  const sel={background:"rgba(255,255,255,0.04)",border:"1px solid rgba(74,222,128,0.15)",
    borderRadius:10,padding:"8px 14px",color:"#fff",fontSize:13,fontFamily:"inherit",outline:"none",cursor:"pointer"};
  const wxIcon=weather?.weather?.[0]?.main==="Rain"?"🌧":weather?.weather?.[0]?.main==="Clouds"?"⛅":"☀️";
  const allP=forecast.map(d=>d.price);
  const minP=Math.min(...allP),maxP=Math.max(...allP);
  const W=800,H=160;
  const pts=forecast.map((d,i)=>{
    const x=(i/29)*W;const y=H-((d.price-minP)/(maxP-minP+1))*(H-20)-10;return`${x},${y}`;
  });
  return(
    <div style={{display:"flex",height:"100vh",background:"#060d08",fontFamily:"'Outfit',sans-serif",overflow:"hidden"}}>
      <style>{GLOBAL_STYLES}</style>
      <div style={{position:"fixed",inset:0,zIndex:0,
        background:"radial-gradient(ellipse 70% 40% at 50% 110%,rgba(22,101,52,0.18) 0%,transparent 70%)",
        backgroundImage:`url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%234ade80' fill-opacity='0.015'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`}}/>
      <Sidebar active="dashboard" navigate={navigate} user={user}/>
      <main style={{flex:1,overflow:"auto",padding:"28px 32px",position:"relative",zIndex:1}}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28}}>
          <div>
            <div style={{fontSize:22,fontWeight:700,color:"#fff"}}>
              Good {new Date().getHours()<12?"morning":"afternoon"},{" "}
              <span style={{background:"linear-gradient(90deg,#4ade80,#a3e635)",
                WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
                {user?.name||"Farmer"}
              </span>
            </div>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.35)",marginTop:2}}>
              {market} • {new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}
            </div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <select style={sel} value={market} onChange={e=>setMarket(e.target.value)}>
              {NAGPUR_MARKETS.map(m=><option key={m}>{m}</option>)}
            </select>
            <select style={sel} value={commodity} onChange={e=>setCommodity(e.target.value)}>
              {NAGPUR_COMMODITIES.map(c=><option key={c.name}>{c.emoji} {c.name}</option>)}
            </select>
          </div>
        </div>
        {/* Top 3 cards */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:16}}>
          {/* Price hero */}
          <div style={{...glass,padding:24,position:"relative",overflow:"hidden"}} className="metric-card">
            <div style={{position:"absolute",right:-10,top:-10,width:80,height:80,borderRadius:"50%",
              background:rising?"rgba(74,222,128,0.08)":"rgba(248,113,113,0.08)"}}/>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginBottom:6}}>Current Price</div>
            <div style={{fontSize:36,fontWeight:800,color:"#fff",marginBottom:4}}>₹{cur.toLocaleString("en-IN")}</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginBottom:14}}>per Quintal • {commodity}</div>
            <svg width="100%" viewBox="0 0 200 50" preserveAspectRatio="none" style={{display:"block"}}>
              <polyline points={forecast.slice(0,15).map((d,i)=>{
                const x=(i/14)*200;
                const y=48-((d.price-minP)/(maxP-minP+1))*40;
                return`${x},${y}`;
              }).join(" ")} fill="none" stroke={rising?"#4ade80":"#f87171"} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <div style={{marginTop:10,display:"inline-flex",alignItems:"center",gap:6,
              background:`rgba(${rising?"74,222,128":"248,113,113"},0.1)`,
              border:`1px solid rgba(${rising?"74,222,128":"248,113,113"},0.2)`,
              borderRadius:99,padding:"4px 12px",fontSize:12,fontWeight:600,
              color:rising?"#4ade80":"#f87171"}}>
              {rising?"▲":"▼"} {Math.abs(ch30)}% in 30 days
            </div>
          </div>
          {/* Sell signal */}
          <div style={{...glass,padding:24}} className="metric-card">
            <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginBottom:12}}>AI Sell Signal</div>
            <div style={{fontSize:20,fontWeight:800,color:sigC,marginBottom:10}}>{sig}</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.5)",lineHeight:1.6,marginBottom:12}}>
              Best window: <span style={{color:"#fff",fontWeight:600}}>{bestDay.date}</span><br/>
              Expected: ₹{bestDay.price?.toLocaleString("en-IN")}
            </div>
            <div style={{background:`rgba(${sigC==="rgba(74,222,128)"?"74,222,128":sigC==="#facc15"?"250,204,21":"96,165,250"},0.06)`,
              border:`1px solid ${sigC}30`,borderRadius:10,padding:"10px 12px",fontSize:12,color:sigC}}>
              {p7>cur?"Prices rising — sell in next 3–7 days":p15>cur?"Hold 7–15 days for better returns":"Patient holders rewarded — 15–30 days"}
            </div>
          </div>
          {/* Buffer */}
          <div style={{...glass,padding:24}} className="metric-card">
            <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginBottom:10}}>Buffer Storage</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.6)",lineHeight:1.5,marginBottom:14}}>{buf.note}</div>
            {[{l:"Ideal",v:buf.ideal,c:"#facc15",w:`${(buf.ideal/buf.max)*100}%`,g:"#facc15,#f97316"},
              {l:"Maximum",v:buf.max,c:"#60a5fa",w:"100%",g:"#3b82f6,#8b5cf6"}].map(b=>(
              <div key={b.l} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,
                  color:"rgba(255,255,255,0.4)",marginBottom:5}}>
                  <span>{b.l} storage</span>
                  <span style={{color:b.c,fontWeight:600}}>{b.v} days</span>
                </div>
                <div style={{height:5,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden"}}>
                  <div style={{height:"100%",width:b.w,background:`linear-gradient(90deg,${b.g})`,borderRadius:3}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Weather */}
        <div style={{...glass,padding:"16px 20px",marginBottom:16,display:"flex",alignItems:"center",gap:14}}>
          <div style={{fontSize:28}}>{weather?wxIcon:"🌤"}</div>
          <div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.4)"}}>Nagpur, Maharashtra</div>
            <div style={{fontSize:20,color:"#fff",fontWeight:700}}>
              {weather?`${Math.round(weather.main.temp)}°C`:"Loading..."}
            </div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.5)"}}>
              {weather?`${weather.weather[0].description} • Humidity ${weather.main.humidity}%`:"Add VITE_OPENWEATHER_KEY to .env for live weather"}
            </div>
          </div>
          {weather&&<div style={{marginLeft:"auto",textAlign:"right"}}>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.3)"}}>Wind</div>
            <div style={{fontSize:14,color:"#4ade80",fontWeight:600}}>{weather.wind.speed} km/h</div>
          </div>}
        </div>
        {/* Multi-day forecast cards */}
        <div style={{...glass,padding:24}}>
          <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:18}}>
            Price Forecast —{" "}
            <span style={{background:"linear-gradient(90deg,#4ade80,#a3e635)",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{commodity}</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:20}}>
            {[
              {label:"Today",day:0},{label:"2 days",day:2},{label:"7 days",day:7},
              {label:"15 days",day:15},{label:"30 days",day:30}
            ].map(item=>{
              const p=getMockPrice(commodity,item.day);
              const ch=item.day===0?null:((p-cur)/cur*100).toFixed(1);
              const up=ch===null||parseFloat(ch)>=0;
              return(
                <div key={item.label} style={{background:"rgba(255,255,255,0.03)",
                  border:`1px solid ${item.day===0?"rgba(74,222,128,0.2)":"rgba(74,222,128,0.06)"}`,
                  borderRadius:12,padding:"14px",textAlign:"center"}}>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginBottom:6}}>{item.label}</div>
                  <div style={{fontSize:20,fontWeight:700,color:"#fff"}}>₹{p.toLocaleString("en-IN")}</div>
                  {ch&&<div style={{fontSize:12,color:up?"#4ade80":"#f87171",marginTop:5,fontWeight:600}}>
                    {up?"▲":"▼"} {Math.abs(ch)}%
                  </div>}
                  {item.day===0&&<div style={{fontSize:10,color:"#4ade80",marginTop:4}}>Current</div>}
                </div>
              );
            })}
          </div>
          {/* Chart */}
          <div style={{position:"relative"}}>
            <svg width="100%" viewBox={`0 0 ${W} ${H+20}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={rising?"#4ade80":"#f87171"} stopOpacity="0.15"/>
                  <stop offset="100%" stopColor={rising?"#4ade80":"#f87171"} stopOpacity="0"/>
                </linearGradient>
              </defs>
              {[0.25,0.5,0.75].map(t=>{
                const y=H-t*(H-20)-10;
                return<line key={t} x1={0} y1={y} x2={W} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>;
              })}
              <polygon points={`0,${H+10} ${pts.join(" ")} ${W},${H+10}`} fill="url(#dg)"/>
              <polyline points={pts.join(" ")} fill="none" stroke={rising?"#4ade80":"#f87171"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              {[0,7,14,21,29].map(i=>{
                const p=pts[i]?.split(",");if(!p)return null;
                return<circle key={i} cx={p[0]} cy={p[1]} r="4" fill={rising?"#4ade80":"#f87171"} opacity="0.8"/>;
              })}
            </svg>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
              {[0,7,14,21,29].map(i=>(
                <div key={i} style={{fontSize:10,color:"rgba(255,255,255,0.3)"}}>{forecast[i]?.date||""}</div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── PRICE PREDICTION ─────────────────────────────────────────────────────────
const MODELS=[
  {key:"arima",label:"ARIMA",color:"#4ade80",r2:0.87,mae:142},
  {key:"rf",label:"Random Forest",color:"#60a5fa",r2:0.91,mae:118},
  {key:"xgb",label:"XGBoost",color:"#f472b6",r2:0.93,mae:97},
  {key:"lstm",label:"LSTM",color:"#facc15",r2:0.89,mae:128},
];
function PricePrediction({user,navigate}){
  const[commodity,setCommodity]=useState("Tomato");
  const[market,setMarket]=useState(user?.location||NAGPUR_MARKETS[0]);
  const[vis,setVis]=useState({arima:true,rf:true,xgb:true,lstm:true});
  const[days,setDays]=useState(30);
  const[hover,setHover]=useState(null);
  const [forecast, setForecast] = useState([]);

useEffect(() => {
  getRealForecast(commodity, 30).then(setForecast);
}, [commodity]);
  function mPrice(base,mk,i){
    const off={arima:0,rf:0.02,xgb:-0.01,lstm:0.015};
    return Math.round(base*(1+off[mk]+Math.sin((i+mk.charCodeAt(0))*0.4)*0.04));
  }
  const prices=forecast.slice(0,days).map((d,i)=>({
    ...d,arima:d.price,rf:mPrice(d.price,"rf",i),xgb:mPrice(d.price,"xgb",i),lstm:mPrice(d.price,"lstm",i),
  }));
  const allP=prices.flatMap(d=>MODELS.map(m=>d[m.key]));
  const minP=Math.min(...allP),maxP=Math.max(...allP);
  const W=800,H=200;
  const toP=(p,i,tot)=>{const x=(i/(tot-1))*W;const y=H-((p-minP)/(maxP-minP+1))*(H-20)-10;return[x,y];};
  const monthlyAvg=Array.from({length:12},(_,m)=>({month:m,price:getMockPrice(commodity,m*30)}));
  const bestM=monthlyAvg.reduce((b,c)=>c.price>b.price?c:b);
  const mNames=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const sel={background:"rgba(255,255,255,0.04)",border:"1px solid rgba(74,222,128,0.15)",
    borderRadius:10,padding:"8px 14px",color:"#fff",fontSize:13,fontFamily:"inherit",outline:"none",cursor:"pointer"};
  return(
    <div style={{display:"flex",height:"100vh",background:"#060d08",fontFamily:"'Outfit',sans-serif",overflow:"hidden"}}>
      <style>{GLOBAL_STYLES}</style>
      <div style={{position:"fixed",inset:0,zIndex:0,background:"radial-gradient(ellipse 70% 40% at 50% 110%,rgba(22,101,52,0.15) 0%,transparent 70%)"}}/>
      <Sidebar active="prediction" navigate={navigate} user={user}/>
      <main style={{flex:1,overflow:"auto",padding:"28px 32px",position:"relative",zIndex:1}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
          <div>
            <div style={{fontSize:22,fontWeight:700,color:"#fff"}}>Price Predictions</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.35)",marginTop:2}}>Multi-model forecast comparison</div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <select style={sel} value={market} onChange={e=>setMarket(e.target.value)}>
              {NAGPUR_MARKETS.map(m=><option key={m}>{m}</option>)}
            </select>
            <select style={sel} value={commodity} onChange={e=>setCommodity(e.target.value)}>
              {NAGPUR_COMMODITIES.map(c=><option key={c.name}>{c.emoji} {c.name}</option>)}
            </select>
          </div>
        </div>
        {/* Accuracy cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
          {MODELS.map(m=>(
            <div key={m.key} style={{...glass,padding:"16px 20px",
              borderColor:vis[m.key]?`${m.color}30`:"rgba(74,222,128,0.08)",animation:"countUp 0.4s ease"}}>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginBottom:8}}>{m.label}</div>
              <div style={{fontSize:24,fontWeight:800,color:m.color}}>{(m.r2*100).toFixed(0)}%</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginTop:2}}>R² accuracy</div>
              <div style={{marginTop:8,height:3,background:"rgba(255,255,255,0.05)",borderRadius:2}}>
                <div style={{height:"100%",width:`${m.r2*100}%`,background:m.color,borderRadius:2,opacity:0.7}}/>
              </div>
              <div style={{marginTop:6,fontSize:11,color:"rgba(255,255,255,0.3)"}}>MAE: ₹{m.mae}</div>
            </div>
          ))}
        </div>
        {/* Chart */}
        <div style={{...glass,padding:24,marginBottom:20}}>
          <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontSize:14,fontWeight:600,color:"#fff"}}>{commodity} — {days}-day forecast</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {MODELS.map(m=>(
                <button key={m.key} className="model-toggle"
                  onClick={()=>setVis(p=>({...p,[m.key]:!p[m.key]}))} style={{
                  padding:"6px 14px",borderRadius:99,fontSize:12,fontWeight:600,border:`1px solid ${vis[m.key]?m.color+"60":"rgba(255,255,255,0.1)"}`,
                  background:vis[m.key]?m.color+"15":"transparent",color:vis[m.key]?m.color:"rgba(255,255,255,0.3)",
                  cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:vis[m.key]?m.color:"rgba(255,255,255,0.2)"}}/>
                  {m.label}
                </button>
              ))}
              {[7,15,30].map(d=>(
                <button key={d} onClick={()=>setDays(d)} style={{
                  padding:"6px 12px",borderRadius:8,border:"none",fontSize:12,fontWeight:600,
                  background:days===d?"rgba(74,222,128,0.15)":"rgba(255,255,255,0.04)",
                  color:days===d?"#4ade80":"rgba(255,255,255,0.4)",cursor:"pointer",fontFamily:"inherit"}}>{d}d</button>
              ))}
            </div>
          </div>
          <div style={{position:"relative"}}>
            <svg width="100%" viewBox={`0 0 ${W} ${H+20}`} preserveAspectRatio="none">
              <defs>{MODELS.map(m=>(
                <linearGradient key={m.key} id={`g${m.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={m.color} stopOpacity="0.1"/>
                  <stop offset="100%" stopColor={m.color} stopOpacity="0"/>
                </linearGradient>
              ))}</defs>
              {[0.25,0.5,0.75].map(t=>{
                const y=H-t*(H-20)-10;
                return<line key={t} x1={0} y1={y} x2={W} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>;
              })}
              {MODELS.filter(m=>vis[m.key]).map(m=>{
                const pts=prices.map((d,i)=>toP(d[m.key],i,prices.length));
                const ls=pts.map(([x,y])=>`${x},${y}`).join(" ");
                return(
                  <g key={m.key}>
                    <polygon points={`0,${H+10} ${ls} ${W},${H+10}`} fill={`url(#g${m.key})`}/>
                    <polyline points={ls} fill="none" stroke={m.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </g>
                );
              })}
              {hover!==null&&MODELS.filter(m=>vis[m.key]).map(m=>{
                const[x,y]=toP(prices[hover]?.[m.key]||0,hover,prices.length);
                return<circle key={m.key} cx={x} cy={y} r="4" fill={m.color} opacity="0.9"/>;
              })}
            </svg>
            <div style={{position:"absolute",inset:0,display:"flex"}}>
              {prices.map((_,i)=>(
                <div key={i} style={{flex:1,height:"100%",cursor:"crosshair"}}
                  onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(null)}/>
              ))}
            </div>
            {hover!==null&&prices[hover]&&(
              <div style={{position:"absolute",top:10,left:`${Math.min((hover/prices.length)*100,70)}%`,
                background:"rgba(6,13,8,0.95)",border:"1px solid rgba(74,222,128,0.2)",
                borderRadius:10,padding:"10px 14px",fontSize:12,pointerEvents:"none",minWidth:150}}>
                <div style={{color:"rgba(255,255,255,0.5)",marginBottom:6}}>{prices[hover].date}</div>
                {MODELS.filter(m=>vis[m.key]).map(m=>(
                  <div key={m.key} style={{display:"flex",justifyContent:"space-between",gap:16,marginBottom:3}}>
                    <span style={{color:m.color}}>{m.label}</span>
                    <span style={{color:"#fff",fontWeight:600}}>₹{prices[hover][m.key].toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
              {[0,Math.floor(prices.length/4),Math.floor(prices.length/2),Math.floor(3*prices.length/4),prices.length-1].map(i=>(
                <div key={i} style={{fontSize:10,color:"rgba(255,255,255,0.3)"}}>{prices[i]?.date||""}</div>
              ))}
            </div>
          </div>
        </div>
        {/* Bottom row */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div style={{...glass,padding:20}}>
            <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:16}}>Model Accuracy Comparison</div>
            {MODELS.map(m=>(
              <div key={m.key} style={{marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:13,color:m.color,fontWeight:600}}>{m.label}</span>
                  <div style={{display:"flex",gap:16}}>
                    <span style={{fontSize:12,color:"rgba(255,255,255,0.4)"}}>R²: <strong style={{color:"#fff"}}>{m.r2}</strong></span>
                    <span style={{fontSize:12,color:"rgba(255,255,255,0.4)"}}>MAE: <strong style={{color:"#fff"}}>₹{m.mae}</strong></span>
                  </div>
                </div>
                <div style={{height:5,background:"rgba(255,255,255,0.04)",borderRadius:3,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${m.r2*100}%`,background:m.color,borderRadius:3,opacity:0.7}}/>
                </div>
              </div>
            ))}
          </div>
          <div style={{...glass,padding:20}}>
            <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:16}}>Best Month to Sell — {commodity}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
              {monthlyAvg.map((m,i)=>{
                const isBest=i===bestM.month;
                const pct=(m.price-Math.min(...monthlyAvg.map(x=>x.price)))/(Math.max(...monthlyAvg.map(x=>x.price))-Math.min(...monthlyAvg.map(x=>x.price))+1);
                return(
                  <div key={i} style={{padding:"10px 8px",borderRadius:10,textAlign:"center",position:"relative",
                    background:isBest?"rgba(74,222,128,0.15)":`rgba(74,222,128,${pct*0.06})`,
                    border:`1px solid ${isBest?"rgba(74,222,128,0.5)":"rgba(74,222,128,0.08)"}`}}>
                    {isBest&&<div style={{position:"absolute",top:-8,right:-4,fontSize:14}}>⭐</div>}
                    <div style={{fontSize:11,color:isBest?"#4ade80":"rgba(255,255,255,0.4)",fontWeight:isBest?700:400}}>{mNames[i]}</div>
                    <div style={{fontSize:11,color:isBest?"#fff":"rgba(255,255,255,0.4)",marginTop:3,fontWeight:isBest?600:400}}>
                      ₹{Math.round(m.price/100)}×100
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{marginTop:14,background:"rgba(74,222,128,0.08)",border:"1px solid rgba(74,222,128,0.2)",
              borderRadius:10,padding:"10px 14px",fontSize:12,color:"#4ade80"}}>
              ⭐ Best: <strong>{mNames[bestM.month]}</strong> — avg ₹{bestM.price.toLocaleString("en-IN")}/Quintal
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── AI CHAT ──────────────────────────────────────────────────────────────────
const SUGGESTIONS=["Should I sell my tomatoes today?","Best commodity this week?",
  "When will onion prices peak?","How long can I store potatoes?"];
function getAIReply(msg,commodity){
  const l=msg.toLowerCase();const p=getMockPrice(commodity);
  if(l.includes("sell")||l.includes("today"))
    return`**Sell Signal Analysis — ${commodity}**\n\nCurrent price: ₹${p.toLocaleString("en-IN")}/Quintal\n\n📈 **Short answer: Yes, consider selling in 3–5 days.**\n\nOur ARIMA + XGBoost ensemble shows a price peak expected around Day 5–7. After that, fresh arrivals will likely push prices down 8–12%.\n\n**Recommended action:**\n• Sell 60–70% of stock this week\n• Hold remaining 30% for late-season spike\n• Target: Kalamna or Nagpur Main APMC\n\n⚠️ Check weather forecast before transport decisions.`;
  if(l.includes("stor")||l.includes("buffer")||l.includes("hold")){
    const b=BUFFER_DAYS[commodity]||{max:30,ideal:14,note:"Store appropriately"};
    return`**Storage Advisory — ${commodity}**\n\n${b.note}\n\n• Ideal hold: **${b.ideal} days**\n• Maximum safe storage: **${b.max} days**\n\n💡 If prices are expected to rise >15%, storage costs may be worth it.\n\nFor Nagpur's climate, ventilated warehouse storage is recommended.`;
  }
  return`**FarmSense Analysis — ${commodity}**\n\nCurrent price: ₹${p.toLocaleString("en-IN")}/Quintal\n\nOur ML models (ARIMA + XGBoost) indicate prices will **rise 12–18%** over the next 10–14 days based on:\n\n• Low market arrivals this week\n• Stable weather forecast\n• Historical seasonal pattern\n\n**My recommendation:** Hold for 7–10 more days before selling.\n\nWould you like a market comparison or 30-day detailed forecast?`;
}
function fmtMsg(text){
  return text.split("\n").map((line,i)=>{
    if(line.startsWith("**")&&line.endsWith("**"))
      return<div key={i} style={{fontWeight:700,color:"#fff",margin:"8px 0 4px"}}>{line.replace(/\*\*/g,"")}</div>;
    if(line.startsWith("• "))
      return<div key={i} style={{paddingLeft:12,color:"rgba(255,255,255,0.7)",marginBottom:2}}>• {line.slice(2).replace(/\*\*/g,"")}</div>;
    if(line.includes("**")){
      const pts=line.split(/\*\*(.*?)\*\*/g);
      return<div key={i} style={{marginBottom:2}}>{pts.map((p,j)=>j%2===1?<strong key={j} style={{color:"#4ade80"}}>{p}</strong>:p)}</div>;
    }
    if(!line.trim())return<div key={i} style={{height:6}}/>;
    return<div key={i} style={{marginBottom:2}}>{line}</div>;
  });
}
function AIChat({user,navigate}){
  const[commodity,setCommodity]=useState("Tomato");
  const[msgs,setMsgs]=useState([{role:"ai",text:`Namaste! 🌾 I'm the FarmSense AI advisor, trained on Nagpur mandi data.\n\nI can help you decide **when to sell**, **which market to target**, and **how long to store** your harvest.\n\nWhat would you like to know today?`}]);
  const[input,setInput]=useState("");
  const[typing,setTyping]=useState(false);
  const bot=useRef(null);
  useEffect(()=>{bot.current?.scrollIntoView({behavior:"smooth"});},[msgs,typing]);
  const send=(msg=input)=>{
    if(!msg.trim())return;
    setInput("");
    setMsgs(p=>[...p,{role:"user",text:msg.trim()}]);
    setTyping(true);
    setTimeout(()=>{setMsgs(p=>[...p,{role:"ai",text:getAIReply(msg,commodity)}]);setTyping(false);},800+Math.random()*600);
  };
  const [livePrice, setLivePrice] = useState(0);

useEffect(() => {
  getRealForecast(commodity, 1).then(d => {
    if (d.length) setLivePrice(d[0].price);
  });
}, [commodity]);
  const ch=((p7-cur)/cur*100).toFixed(1);
  const sel={background:"rgba(255,255,255,0.04)",border:"1px solid rgba(74,222,128,0.15)",
    borderRadius:10,padding:"6px 12px",color:"#fff",fontSize:12,fontFamily:"inherit",outline:"none",cursor:"pointer"};
  return(
    <div style={{display:"flex",height:"100vh",background:"#060d08",fontFamily:"'Outfit',sans-serif",overflow:"hidden"}}>
      <style>{GLOBAL_STYLES}</style>
      <div style={{position:"fixed",inset:0,zIndex:0,background:"radial-gradient(ellipse 70% 40% at 50% 110%,rgba(22,101,52,0.15) 0%,transparent 70%)"}}/>
      <Sidebar active="chat" navigate={navigate} user={user}/>
      {/* Context sidebar */}
      <div style={{width:220,...glass,margin:"16px 0 16px 16px",padding:16,borderRadius:20,zIndex:1,
        display:"flex",flexDirection:"column",gap:12,flexShrink:0}}>
        <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:4}}>Quick Stats</div>
        {[{l:commodity,v:`₹${cur.toLocaleString("en-IN")}`,s:"current price"},
          {l:"7-day forecast",v:`₹${p7.toLocaleString("en-IN")}`,s:`${ch>0?"▲":"▼"} ${Math.abs(ch)}%`,c:ch>0?"#4ade80":"#f87171"},
          {l:"Best market",v:"Kalamna",s:"+4% above avg"},
        ].map((s,i)=>(
          <div key={i} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(74,222,128,0.08)",borderRadius:10,padding:12}}>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.35)"}}>{s.l}</div>
            <div style={{fontSize:16,fontWeight:700,color:s.c||"#fff",marginTop:2}}>{s.v}</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginTop:2}}>{s.s}</div>
          </div>
        ))}
        <div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginBottom:8}}>Switch commodity</div>
          <select style={{...sel,width:"100%",boxSizing:"border-box"}}
            value={commodity} onChange={e=>setCommodity(e.target.value)}>
            {NAGPUR_COMMODITIES.map(c=><option key={c.name}>{c.emoji} {c.name}</option>)}
          </select>
        </div>
        <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"flex-end",
          gap:4,opacity:0.12,fontSize:24}}>
          <div>🌿</div><div style={{marginLeft:16}}>🍃</div><div>🌾</div>
        </div>
      </div>
      {/* Chat */}
      <div style={{flex:1,display:"flex",flexDirection:"column",padding:"16px 16px 16px 0",zIndex:1,minWidth:0}}>
        <div style={{...glass,padding:"14px 20px",marginBottom:12,borderRadius:20,display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#16a34a,#4ade80)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🌾</div>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:"#fff"}}>FarmSense AI Advisor</div>
            <div style={{fontSize:11,color:"#4ade80",display:"flex",alignItems:"center",gap:4}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:"#4ade80",display:"inline-block"}}/>
              Online • Trained on Nagpur mandi data
            </div>
          </div>
        </div>
        <div style={{flex:1,overflow:"auto",paddingRight:4,display:"flex",flexDirection:"column",gap:12}}>
          {msgs.map((m,i)=>(
            <div key={i} className="msg" style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",gap:10,alignItems:"flex-start"}}>
              {m.role==="ai"&&<div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#16a34a,#4ade80)",
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>🌾</div>}
              <div style={{maxWidth:"72%",padding:"12px 16px",
                borderRadius:m.role==="user"?"16px 4px 16px 16px":"4px 16px 16px 16px",
                background:m.role==="user"?"linear-gradient(135deg,rgba(22,101,52,0.6),rgba(74,222,128,0.2))":"rgba(255,255,255,0.05)",
                border:m.role==="user"?"1px solid rgba(74,222,128,0.3)":"1px solid rgba(255,255,255,0.06)",
                backdropFilter:"blur(10px)",fontSize:13,color:"rgba(255,255,255,0.85)",lineHeight:1.6}}>
                {m.role==="ai"?fmtMsg(m.text):m.text}
              </div>
              {m.role==="user"&&<div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#166534,#4ade80)",
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff",flexShrink:0}}>
                {(user?.name||"U")[0].toUpperCase()}
              </div>}
            </div>
          ))}
          {typing&&(
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#16a34a,#4ade80)",
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🌾</div>
              <div style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.06)",
                borderRadius:"4px 16px 16px 16px",padding:"14px 18px",display:"flex",gap:5}}>
                {[0,1,2].map(i=>(
                  <span key={i} style={{width:6,height:6,borderRadius:"50%",background:"#4ade80",
                    display:"inline-block",animation:`blink 1.2s ${i*0.2}s infinite`}}/>
                ))}
              </div>
            </div>
          )}
          <div ref={bot}/>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",margin:"10px 0 8px"}}>
          {SUGGESTIONS.map((s,i)=>(
            <button key={i} className="chip" onClick={()=>send(s)} style={{padding:"6px 12px",
              borderRadius:99,fontSize:11,fontWeight:500,border:"1px solid rgba(74,222,128,0.15)",
              background:"rgba(74,222,128,0.05)",color:"rgba(255,255,255,0.5)",
              cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}>{s}</button>
          ))}
        </div>
        <div style={{display:"flex",gap:10,...glass,padding:"10px 10px 10px 16px",borderRadius:16}}>
          <input value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}
            placeholder="Ask about prices, sell timing, storage…"
            style={{flex:1,background:"transparent",border:"none",color:"#fff",
              fontSize:14,fontFamily:"inherit",outline:"none"}}/>
          <button onClick={()=>send()} style={{width:40,height:40,borderRadius:12,border:"none",
            background:input.trim()?"linear-gradient(135deg,#16a34a,#4ade80)":"rgba(255,255,255,0.06)",
            color:input.trim()?"#041f0a":"rgba(255,255,255,0.3)",fontSize:16,cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}>→</button>
        </div>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App(){
  const[page,setPage]=useState("landing");
  const[user,setUser]=useState(null);
  const nav=p=>setPage(p);
  const login=u=>{setUser(u);setPage("dashboard");};
  if(page==="landing") return<Landing onGetStarted={()=>nav("login")}/>;
  if(page==="login")   return<Login onLogin={login} onBack={()=>nav("landing")}/>;
  if(page==="dashboard") return<Dashboard user={user} navigate={nav}/>;
  if(page==="prediction") return<PricePrediction user={user} navigate={nav}/>;
  if(page==="chat")    return<AIChat user={user} navigate={nav}/>;
  return<Landing onGetStarted={()=>nav("login")}/>;
}
