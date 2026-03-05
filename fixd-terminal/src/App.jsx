import { useState, useEffect, useCallback } from "react";
import {
  Line, AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, ComposedChart, PieChart, Pie, Legend
} from "recharts";

// ─────────────────────────────────────────────────────────────
// DESIGN
// ─────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink:      #05060a;
    --paper:    #080c14;
    --panel:    #0c1220;
    --panel2:   #111827;
    --panel3:   #1a2235;
    --rim:      #1e2d45;
    --rim2:     #263650;
    --muted:    #3d5070;
    --faint:    #2a3a52;

    --gold:     #c9a84c;
    --gold-lo:  rgba(201,168,76,0.12);
    --gold-glow:rgba(201,168,76,0.25);

    --ice:      #7eb8f7;
    --ice-lo:   rgba(126,184,247,0.1);

    --sage:     #4ade80;
    --sage-lo:  rgba(74,222,128,0.1);

    --coral:    #fb7185;
    --coral-lo: rgba(251,113,133,0.1);

    --amber:    #fbbf24;
    --amber-lo: rgba(251,191,36,0.1);

    --lav:      #a78bfa;
    --lav-lo:   rgba(167,139,250,0.1);

    --txt:      #e8eef8;
    --txt-dim:  #8899bb;
    --txt-faint:#3d5070;

    --font-display: 'Syne', sans-serif;
    --font-mono:    'JetBrains Mono', monospace;
  }

  html, body { height: 100%; }
  body {
    font-family: var(--font-mono);
    background: var(--paper);
    color: var(--txt);
    font-size: 12px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: var(--panel); }
  ::-webkit-scrollbar-thumb { background: var(--rim); border-radius: 2px; }

  .app { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

  .topbar {
    display: flex; align-items: center; gap: 0;
    height: 52px; background: var(--panel);
    border-bottom: 1px solid var(--rim); padding: 0 20px;
    flex-shrink: 0; position: relative; z-index: 50;
  }
  .topbar::after {
    content: ''; position: absolute; bottom: -1px; left: 0; right: 0;
    height: 1px; background: linear-gradient(90deg, transparent, var(--gold), transparent); opacity: 0.4;
  }

  .brand {
    font-family: var(--font-display); font-size: 18px; font-weight: 800;
    letter-spacing: -0.5px; color: var(--gold); margin-right: 40px;
    display: flex; align-items: center; gap: 10px; flex-shrink: 0;
  }
  .brand-icon {
    width: 28px; height: 28px; background: var(--gold-lo); border: 1px solid var(--gold);
    border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 14px;
  }

  .nav { display: flex; height: 100%; }
  .nav-item {
    padding: 0 18px; height: 100%; display: flex; align-items: center;
    cursor: pointer; font-family: var(--font-mono); font-size: 11px; font-weight: 500;
    letter-spacing: 0.05em; color: var(--txt-dim); border-bottom: 2px solid transparent;
    border-top: 2px solid transparent; transition: color 0.2s;
    background: none; border-left: none; border-right: none; white-space: nowrap;
  }
  .nav-item:hover { color: var(--txt); }
  .nav-item.active { color: var(--gold); border-bottom-color: var(--gold); }

  .topbar-right { margin-left: auto; display: flex; align-items: center; gap: 16px; }

  .live-badge {
    display: flex; align-items: center; gap: 6px; padding: 3px 10px;
    border: 1px solid var(--sage); border-radius: 20px; background: var(--sage-lo);
    font-size: 10px; color: var(--sage); letter-spacing: 0.08em;
  }
  .live-dot { width: 6px; height: 6px; background: var(--sage); border-radius: 50%; animation: blink 1.4s infinite; }

  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes scoreCount { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }

  .clock { font-family: var(--font-mono); font-size: 11px; color: var(--txt-faint); letter-spacing: 0.05em; }

  .workspace { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 20px; }

  .sh { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
  .sh-label { font-family: var(--font-mono); font-size: 9px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--txt-faint); white-space: nowrap; }
  .sh-line { flex: 1; height: 1px; background: var(--rim); }
  .sh-accent { color: var(--gold); }

  .card { background: var(--panel); border: 1px solid var(--rim); border-radius: 8px; padding: 18px; position: relative; overflow: hidden; }
  .card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--rim2), transparent); }
  .card-title { font-family: var(--font-mono); font-size: 9px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--txt-faint); margin-bottom: 14px; }
  .card-highlight { border-color: var(--gold); }
  .card-highlight::before { background: linear-gradient(90deg, transparent, var(--gold), transparent); opacity: 0.4; }

  .g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .g3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
  .g4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
  .g5 { display: grid; grid-template-columns: repeat(5,1fr); gap: 12px; }

  .kpi-val { font-family: var(--font-display); font-size: 30px; font-weight: 700; line-height: 1; letter-spacing: -1px; }
  .kpi-sub { font-size: 10px; color: var(--txt-dim); margin-top: 6px; }

  .badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 4px; font-family: var(--font-mono); font-size: 10px; font-weight: 600; }
  .b-gold  { background: var(--gold-lo);   color: var(--gold);  border: 1px solid rgba(201,168,76,.3); }
  .b-sage  { background: var(--sage-lo);   color: var(--sage);  border: 1px solid rgba(74,222,128,.3); }
  .b-coral { background: var(--coral-lo);  color: var(--coral); border: 1px solid rgba(251,113,133,.3); }
  .b-amber { background: var(--amber-lo);  color: var(--amber); border: 1px solid rgba(251,191,36,.3); }
  .b-ice   { background: var(--ice-lo);    color: var(--ice);   border: 1px solid rgba(126,184,247,.3); }
  .b-lav   { background: var(--lav-lo);    color: var(--lav);   border: 1px solid rgba(167,139,250,.3); }

  .tbl { width: 100%; border-collapse: collapse; }
  .tbl th { font-family: var(--font-mono); font-size: 9px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--txt-faint); padding: 8px 12px; text-align: left; border-bottom: 1px solid var(--rim); white-space: nowrap; }
  .tbl td { padding: 10px 12px; border-bottom: 1px solid var(--faint); font-family: var(--font-mono); font-size: 11px; color: var(--txt); }
  .tbl tr { transition: background 0.1s; }
  .tbl tr:hover td { background: var(--panel2); }
  .tbl tr.sel td { background: var(--panel3); }

  .c-gold { color: var(--gold); } .c-sage { color: var(--sage); } .c-coral { color: var(--coral); }
  .c-amber { color: var(--amber); } .c-ice { color: var(--ice); } .c-lav { color: var(--lav); }
  .c-dim { color: var(--txt-dim); } .c-faint { color: var(--txt-faint); }

  .inp { background: var(--panel2); border: 1px solid var(--rim); color: var(--txt); padding: 7px 12px; border-radius: 5px; font-family: var(--font-mono); font-size: 12px; outline: none; width: 100%; transition: border-color 0.2s; }
  .inp:focus { border-color: var(--gold); }
  .sel-inp { background: var(--panel2); border: 1px solid var(--rim); color: var(--txt); padding: 7px 12px; border-radius: 5px; font-family: var(--font-mono); font-size: 12px; outline: none; cursor: pointer; transition: border-color 0.2s; }
  .sel-inp:focus { border-color: var(--gold); }

  .btn { background: var(--gold-lo); border: 1px solid var(--gold); color: var(--gold); padding: 7px 18px; border-radius: 5px; font-family: var(--font-mono); font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
  .btn:hover { background: var(--gold); color: var(--ink); }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-sm { padding: 4px 12px; font-size: 10px; }
  .btn-ice { background: var(--ice-lo); border: 1px solid var(--ice); color: var(--ice); padding: 7px 18px; border-radius: 5px; font-family: var(--font-mono); font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; transition: all 0.15s; }
  .btn-ice:hover { background: var(--ice); color: var(--ink); }

  .slider { width: 100%; accent-color: var(--gold); cursor: pointer; height: 4px; }

  .itabs { display: flex; gap: 2px; background: var(--panel2); padding: 3px; border-radius: 7px; width: fit-content; margin-bottom: 16px; }
  .itab { padding: 5px 14px; border-radius: 5px; font-family: var(--font-mono); font-size: 11px; cursor: pointer; color: var(--txt-dim); transition: all 0.15s; background: none; border: none; }
  .itab.active { background: var(--panel3); color: var(--gold); }

  .mbar-track { width: 100%; height: 5px; background: var(--faint); border-radius: 3px; overflow: hidden; margin-top: 5px; }
  .mbar-fill { height: 100%; border-radius: 3px; transition: width 0.6s cubic-bezier(0.4,0,0.2,1); }

  .chart-tip { background: var(--panel3); border: 1px solid var(--rim2); border-radius: 6px; padding: 10px 14px; font-family: var(--font-mono); font-size: 11px; color: var(--txt); }
  .chart-tip-label { color: var(--txt-faint); font-size: 9px; margin-bottom: 4px; letter-spacing: 0.1em; text-transform: uppercase; }

  .spinner { width: 18px; height: 18px; border: 2px solid var(--rim); border-top-color: var(--gold); border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }

  .memo-body { font-family: 'Syne', sans-serif; font-size: 13px; line-height: 1.75; color: var(--txt); white-space: pre-wrap; }
  .memo-section-hdr { font-family: var(--font-mono); font-size: 9px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); margin: 16px 0 6px; padding-left: 8px; border-left: 2px solid var(--gold); }

  .fetch-banner { padding: 10px 16px; border-radius: 6px; font-size: 11px; font-family: var(--font-mono); display: flex; align-items: center; gap: 10px; }
  .fetch-ok   { background: var(--sage-lo);  border: 1px solid rgba(74,222,128,.3);  color: var(--sage); }
  .fetch-err  { background: var(--coral-lo); border: 1px solid rgba(251,113,133,.3); color: var(--coral); }
  .fetch-load { background: var(--gold-lo);  border: 1px solid rgba(201,168,76,.3);  color: var(--gold); }

  /* ── Explainability Score Panel ── */
  .score-ring-wrap { display: flex; align-items: center; justify-content: center; }
  .score-ring { position: relative; width: 120px; height: 120px; }
  .score-ring svg { transform: rotate(-90deg); }
  .score-ring-label { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .score-num { font-family: var(--font-display); font-size: 32px; font-weight: 800; letter-spacing: -2px; animation: scoreCount 0.5s ease; }
  .score-denom { font-size: 10px; color: var(--txt-faint); font-family: var(--font-mono); }
  .factor-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--faint); }
  .factor-name { font-family: var(--font-mono); font-size: 10px; color: var(--txt-dim); flex: 1; }
  .factor-val { font-family: var(--font-mono); font-size: 10px; color: var(--txt-faint); width: 90px; text-align: right; }
  .factor-pts { font-family: var(--font-mono); font-size: 11px; font-weight: 600; width: 44px; text-align: right; }
  .factor-bar { flex: 2; height: 6px; background: var(--faint); border-radius: 3px; overflow: hidden; }
  .factor-bar-fill { height: 100%; border-radius: 3px; transition: width 0.7s cubic-bezier(0.4,0,0.2,1); }

  .recharts-cartesian-grid-horizontal line,
  .recharts-cartesian-grid-vertical line { stroke: var(--faint); }
  .recharts-text { fill: var(--txt-faint) !important; font-family: var(--font-mono) !important; font-size: 10px !important; }

  .export-row { display: flex; gap: 8px; align-items: center; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--rim); }
  .z-gauge { font-family: var(--font-display); font-size: 48px; font-weight: 800; line-height: 1; letter-spacing: -2px; }
  .fade-up { animation: fadeUp 0.35s ease forwards; }

  @media (max-width: 1200px) { .g5 { grid-template-columns: repeat(3,1fr); } }
  @media (max-width: 900px) { .g4 { grid-template-columns: 1fr 1fr; } .g3 { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 700px) { .g2 { grid-template-columns: 1fr; } .g3 { grid-template-columns: 1fr; } .g4 { grid-template-columns: 1fr; } .workspace { padding: 12px; } .tbl { font-size: 10px; } .tbl th, .tbl td { padding: 7px 8px; } }
`;

// ─────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────
const CURRENT_YEAR = new Date().getFullYear();

const COMPANIES = {
  F:   { name:"Ford Motor Co.",      sector:"Auto",     rating:"BB+", watch:"Stable",   revenue:185000, ebitda:13200, ebit:8700,  netIncome:1800,  totalDebt:47500, cash:28000, assets:242000, equity:44000, intExp:2900, capex:8000, depr:4700, ocf:14500, coupon:6.100, maturity:2032, spread:260, isin:"US345370CU51" },
  GM:  { name:"General Motors Co.",  sector:"Auto",     rating:"BBB-",watch:"Positive",  revenue:187000, ebitda:16400, ebit:11000, netIncome:6000,  totalDebt:32000, cash:22000, assets:228000, equity:48000, intExp:2100, capex:8500, depr:4500, ocf:17000, coupon:5.400, maturity:2033, spread:175, isin:"US37045VAL55" },
  DAL: { name:"Delta Air Lines",     sector:"Airlines", rating:"BB",  watch:"Stable",   revenue:61600,  ebitda:9800,  ebit:6000,  netIncome:3000,  totalDebt:21500, cash:8000,  assets:74000,  equity:9500,  intExp:1200, capex:6000, depr:3800, ocf:8500,  coupon:7.000, maturity:2029, spread:310, isin:"US247361ZX75" },
  PFE: { name:"Pfizer Inc.",         sector:"Pharma",   rating:"A",   watch:"Negative",  revenue:63600,  ebitda:18000, ebit:13500, netIncome:8100,  totalDebt:30500, cash:10200, assets:170000, equity:90000, intExp:1500, capex:3400, depr:4200, ocf:13500, coupon:4.100, maturity:2034, spread:105, isin:"US717081EU66" },
  CCL: { name:"Carnival Corp.",      sector:"Leisure",  rating:"B+",  watch:"Positive",  revenue:25000,  ebitda:7000,  ebit:4800,  netIncome:2100,  totalDebt:27000, cash:6500,  assets:54000,  equity:11500, intExp:1600, capex:4500, depr:2300, ocf:6500,  coupon:9.875, maturity:2027, spread:450, isin:"US143658BQ29" },
};

const TREAS_CURVE = [
  { t:0.25, y:4.32 }, { t:0.5, y:4.28 }, { t:1, y:4.20 }, { t:2, y:4.15 },
  { t:3, y:4.18 }, { t:5, y:4.30 }, { t:7, y:4.42 }, { t:10, y:4.52 },
  { t:20, y:4.78 }, { t:30, y:4.68 },
];

const TREAS_HIST = [
  { t:0.25, y:5.25 }, { t:0.5, y:5.22 }, { t:1, y:5.05 }, { t:2, y:4.65 },
  { t:3, y:4.50 }, { t:5, y:4.38 }, { t:7, y:4.42 }, { t:10, y:4.50 },
  { t:20, y:4.75 }, { t:30, y:4.63 },
];

const SPREAD_HISTORY = (() => {
  const tickers = ["F","GM","DAL","PFE","CCL"];
  const base = {F:260, GM:175, DAL:310, PFE:105, CCL:450};
  let seed = 12345;
  const rand = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff; };
  return Array.from({length:52}, (_,i)=>({
    week: `W${i+1}`,
    ...Object.fromEntries(tickers.map(t=>[t, Math.max(50, Math.round(base[t] + (rand()-0.5)*60 - i*0.5))]))
  }));
})();

// ─────────────────────────────────────────────────────────────
// FINANCIAL ENGINE
// ─────────────────────────────────────────────────────────────
const interpYield = (t, pts = TREAS_CURVE) => {
  if (t <= pts[0].t) return pts[0].y;
  if (t >= pts[pts.length-1].t) return pts[pts.length-1].y;
  for (let i=0; i<pts.length-1; i++) {
    if (pts[i].t <= t && t <= pts[i+1].t) {
      const ratio = (t - pts[i].t)/(pts[i+1].t - pts[i].t);
      return pts[i].y + ratio*(pts[i+1].y - pts[i].y);
    }
  }
  return pts[pts.length-1].y;
};

const bondPrice = (face, coupon, ytm, n) => {
  const c = (coupon/100)*face, r = ytm/100;
  let p = 0;
  for (let t=1; t<=n; t++) p += c/Math.pow(1+r,t);
  return p + face/Math.pow(1+r,n);
};

const macDur = (face, coupon, ytm, n) => {
  const c=(coupon/100)*face, r=ytm/100, price=bondPrice(face,coupon,ytm,n);
  let num=0;
  for (let t=1;t<=n;t++) num += t*c/Math.pow(1+r,t);
  num += n*face/Math.pow(1+r,n);
  return num/price;
};

const modDur = (face, coupon, ytm, n) => macDur(face,coupon,ytm,n)/(1+ytm/100);

const convexity = (face, coupon, ytm, n) => {
  const c=(coupon/100)*face, r=ytm/100, price=bondPrice(face,coupon,ytm,n);
  let s=0;
  for(let t=1;t<=n;t++) s += t*(t+1)*c/Math.pow(1+r,t+2);
  s += n*(n+1)*face/Math.pow(1+r,n+2);
  return s/price;
};

const calcMetrics = (co) => {
  const netDebt = co.totalDebt - co.cash;
  const fcf = co.ocf - co.capex;
  const ev = co.totalDebt + co.equity - co.cash;
  return {
    netDebt, fcf,
    netLev:    netDebt / co.ebitda,
    grossLev:  co.totalDebt / co.ebitda,
    intCov:    co.ebit / co.intExp,
    dscr:      co.ocf / (co.intExp + Math.max(0, co.totalDebt*0.05)),
    fcfYield:  fcf/ev*100,
    ebitdaMgn: co.ebitda/co.revenue*100,
    netMgn:    co.netIncome/co.revenue*100,
    roe:       co.netIncome/co.equity*100,
    roa:       co.netIncome/co.assets*100,
    deRatio:   co.totalDebt/co.equity,
    altmanZ: (
      1.2*(co.ocf/co.assets) +
      1.4*(co.equity*0.35/co.assets) +
      3.3*(co.ebit/co.assets) +
      0.6*(co.equity/(co.totalDebt||1)) +
      1.0*(co.revenue/co.assets)
    ),
  };
};

// ─────────────────────────────────────────────────────────────
// EXPLAINABILITY SCORE ENGINE
// ─────────────────────────────────────────────────────────────
const calcCreditScore = (co, m) => {
  const factors = [];
  let total = 0;

  // ── Leverage (max 25 pts) ──
  const levPts = m.netLev < 1.5 ? 25 : m.netLev < 2.5 ? 20 : m.netLev < 3.5 ? 14 : m.netLev < 5 ? 6 : 0;
  const levDelta = levPts - 14; // relative to median expectation
  factors.push({
    name: "Net Leverage",
    value: `${m.netLev.toFixed(2)}x Net Debt/EBITDA`,
    pts: levPts,
    delta: levDelta,
    max: 25,
    color: levPts >= 20 ? "var(--sage)" : levPts >= 14 ? "var(--amber)" : "var(--coral)",
    benchmark: "IG threshold < 3.5x",
  });
  total += levPts;

  // ── Interest Coverage (max 20 pts) ──
  const covPts = m.intCov > 6 ? 20 : m.intCov > 4 ? 16 : m.intCov > 2.5 ? 11 : m.intCov > 1.5 ? 5 : 0;
  const covDelta = covPts - 11;
  factors.push({
    name: "Interest Coverage",
    value: `${m.intCov.toFixed(2)}x EBIT/Interest`,
    pts: covPts,
    delta: covDelta,
    max: 20,
    color: covPts >= 16 ? "var(--sage)" : covPts >= 11 ? "var(--amber)" : "var(--coral)",
    benchmark: "IG threshold > 3.0x",
  });
  total += covPts;

  // ── DSCR (max 15 pts) ──
  const dscrPts = m.dscr > 2 ? 15 : m.dscr > 1.5 ? 12 : m.dscr > 1.2 ? 8 : m.dscr > 1 ? 4 : 0;
  const dscrDelta = dscrPts - 8;
  factors.push({
    name: "Debt Service Coverage",
    value: `${m.dscr.toFixed(2)}x OCF/Debt Service`,
    pts: dscrPts,
    delta: dscrDelta,
    max: 15,
    color: dscrPts >= 12 ? "var(--sage)" : dscrPts >= 8 ? "var(--amber)" : "var(--coral)",
    benchmark: "Minimum acceptable: 1.2x",
  });
  total += dscrPts;

  // ── Altman Z-Score (max 20 pts) ──
  const zPts = m.altmanZ > 3.5 ? 20 : m.altmanZ > 2.99 ? 16 : m.altmanZ > 2.0 ? 10 : m.altmanZ > 1.81 ? 5 : 0;
  const zDelta = zPts - 10;
  factors.push({
    name: "Altman Z-Score",
    value: `${m.altmanZ.toFixed(2)} (${m.altmanZ > 2.99 ? "Safe" : m.altmanZ > 1.81 ? "Grey Zone" : "Distress"})`,
    pts: zPts,
    delta: zDelta,
    max: 20,
    color: zPts >= 16 ? "var(--sage)" : zPts >= 10 ? "var(--amber)" : "var(--coral)",
    benchmark: "Safe zone > 2.99",
  });
  total += zPts;

  // ── FCF Generation (max 10 pts) ──
  const fcfPts = m.fcf > 8000 ? 10 : m.fcf > 3000 ? 8 : m.fcf > 0 ? 5 : 0;
  const fcfDelta = fcfPts - 5;
  factors.push({
    name: "Free Cash Flow",
    value: `${m.fcf > 0 ? "+" : ""}$${(m.fcf/1000).toFixed(1)}B`,
    pts: fcfPts,
    delta: fcfDelta,
    max: 10,
    color: fcfPts >= 8 ? "var(--sage)" : fcfPts >= 5 ? "var(--amber)" : "var(--coral)",
    benchmark: "Positive FCF required",
  });
  total += fcfPts;

  // ── EBITDA Margin (max 10 pts) ──
  const mgnPts = m.ebitdaMgn > 30 ? 10 : m.ebitdaMgn > 20 ? 8 : m.ebitdaMgn > 12 ? 5 : m.ebitdaMgn > 6 ? 3 : 0;
  const mgnDelta = mgnPts - 5;
  factors.push({
    name: "EBITDA Margin",
    value: `${m.ebitdaMgn.toFixed(1)}%`,
    pts: mgnPts,
    delta: mgnDelta,
    max: 10,
    color: mgnPts >= 8 ? "var(--sage)" : mgnPts >= 5 ? "var(--amber)" : "var(--coral)",
    benchmark: "IG issuers typically > 20%",
  });
  total += mgnPts;

  // ── Derive verdict, implied rating, suggested spread ──
  const verdict = total >= 82 ? "STRONG LEND" : total >= 68 ? "LEND" : total >= 52 ? "WATCH" : total >= 38 ? "CONDITIONAL" : "AVOID";
  const verdictColor = total >= 68 ? "var(--sage)" : total >= 52 ? "var(--amber)" : "var(--coral)";
  const verdictBadge = total >= 68 ? "b-sage" : total >= 52 ? "b-amber" : "b-coral";

  const impliedRating = total >= 88 ? "A / A-" : total >= 78 ? "BBB+ / BBB" : total >= 66 ? "BBB- / BB+" : total >= 54 ? "BB / BB-" : total >= 40 ? "B+ / B" : "B- / CCC";

  const suggestedSpread = total >= 88 ? Math.round(co.spread * 0.9) :
                          total >= 78 ? Math.round(co.spread * 0.95) :
                          total >= 66 ? co.spread :
                          total >= 54 ? Math.round(co.spread * 1.05) :
                          Math.round(co.spread * 1.15);

  // Key risks — top 3 worst-performing factors
  const risks = [...factors]
    .sort((a,b) => a.pts/a.max - b.pts/b.max)
    .slice(0, 3)
    .filter(f => f.pts / f.max < 0.75)
    .map(f => `${f.name}: ${f.value} (${f.benchmark})`);

  return { total, factors, verdict, verdictColor, verdictBadge, impliedRating, suggestedSpread, risks };
};

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
const fmtB = (n) => {
  const abs = Math.abs(n), sign = n < 0 ? "-" : "";
  if (abs >= 1e6) return `${sign}$${(abs/1e6).toFixed(2)}T`;
  if (abs >= 1e3) return `${sign}$${(abs/1e3).toFixed(1)}B`;
  return `${sign}$${abs.toFixed(0)}M`;
};
const fmtP = (n, d=1) => `${n.toFixed(d)}%`;
const fmtX = (n, d=2) => `${n.toFixed(d)}x`;

const ratingBadge = (r) => {
  if (["AAA","AA+","AA","AA-","A+","A","A-"].includes(r)) return "b-sage";
  if (["BBB+","BBB","BBB-"].includes(r)) return "b-ice";
  if (["BB+","BB","BB-"].includes(r)) return "b-amber";
  return "b-coral";
};

const leverageColor = (v) => v < 2 ? "var(--sage)" : v < 4 ? "var(--amber)" : "var(--coral)";
const coverageColor = (v) => v > 4 ? "var(--sage)" : v > 2 ? "var(--amber)" : "var(--coral)";
const zColor = (z) => z > 2.99 ? "var(--sage)" : z > 1.81 ? "var(--amber)" : "var(--coral)";
const zLabel = (z) => z > 2.99 ? "SAFE" : z > 1.81 ? "GREY ZONE" : "DISTRESS";

const CustomTooltip = ({ active, payload, label, extra }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tip">
      <div className="chart-tip-label">{label}{extra}</div>
      {payload.map((p,i) => (
        <div key={i} style={{color:p.color||"var(--txt)", marginTop:2}}>
          {p.name}: <strong>{typeof p.value==='number'?p.value.toFixed(2):p.value}</strong>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// EXPLAINABILITY SCORE PANEL  
// ─────────────────────────────────────────────────────────────
const ScorePanel = ({ ticker }) => {
  const co = COMPANIES[ticker];
  const m  = calcMetrics(co);
  const score = calcCreditScore(co, m);
  const pct = score.total / 100;
  const r = 52, circ = 2 * Math.PI * r;
  const dash = pct * circ;

  const ringColor = score.total >= 68 ? "#4ade80" : score.total >= 52 ? "#fbbf24" : "#fb7185";

  return (
    <div style={{display:'flex', flexDirection:'column', gap:20}}>

      {/* Credit Decision Summary*/}
      <div style={{
        padding:'16px 20px', borderRadius:8,
        background: score.total >= 68 ? 'var(--sage-lo)' : score.total >= 52 ? 'var(--amber-lo)' : 'var(--coral-lo)',
        border: `1px solid ${score.total >= 68 ? 'rgba(74,222,128,.35)' : score.total >= 52 ? 'rgba(251,191,36,.35)' : 'rgba(251,113,133,.35)'}`,
        display:'grid', gridTemplateColumns:'auto 1fr 1fr 1fr', gap:'24px', alignItems:'center'
      }}>
        <div>
          <div style={{fontSize:9, color:'var(--txt-faint)', fontFamily:'var(--font-mono)', letterSpacing:'0.15em', marginBottom:4}}>RECOMMENDATION</div>
          <div style={{fontFamily:'var(--font-display)', fontSize:24, fontWeight:800, color:score.verdictColor, letterSpacing:-0.5}}>{score.verdict}</div>
        </div>
        <div>
          <div style={{fontSize:9, color:'var(--txt-faint)', fontFamily:'var(--font-mono)', letterSpacing:'0.15em', marginBottom:4}}>IMPLIED RATING</div>
          <div style={{fontFamily:'var(--font-mono)', fontSize:16, color:'var(--ice)'}}>{score.impliedRating}</div>
        </div>
        <div>
          <div style={{fontSize:9, color:'var(--txt-faint)', fontFamily:'var(--font-mono)', letterSpacing:'0.15em', marginBottom:4}}>SUGGESTED SPREAD</div>
          <div style={{fontFamily:'var(--font-mono)', fontSize:16, color:'var(--amber)'}}>+{score.suggestedSpread} bps</div>
        </div>
        <div>
          <div style={{fontSize:9, color:'var(--txt-faint)', fontFamily:'var(--font-mono)', letterSpacing:'0.15em', marginBottom:6}}>KEY RISKS</div>
          {score.risks.length === 0
            ? <div style={{fontSize:11, color:'var(--sage)', fontFamily:'var(--font-mono)'}}>No material concerns</div>
            : score.risks.map((r,i) => (
              <div key={i} style={{fontSize:10, color:'var(--txt-dim)', fontFamily:'var(--font-mono)', marginBottom:3, display:'flex', gap:6}}>
                <span style={{color:'var(--coral)'}}>▸</span><span>{r}</span>
              </div>
            ))
          }
        </div>
      </div>

      {/* Score ring + factor breakdown */}
      <div className="g2">
        <div className="card">
          <div className="card-title">CREDIT SCORE — COMPOSITE</div>
          <div style={{display:'flex', gap:28, alignItems:'center'}}>
            {/* SVG ring */}
            <div className="score-ring">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={r} fill="none" stroke="var(--faint)" strokeWidth="10"/>
                <circle cx="60" cy="60" r={r} fill="none" stroke={ringColor} strokeWidth="10"
                  strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                  style={{transition:'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)'}}/>
              </svg>
              <div className="score-ring-label">
                <div className="score-num" style={{color:ringColor}}>{score.total}</div>
                <div className="score-denom">/ 100</div>
              </div>
            </div>
            {/* Verdict breakdown */}
            <div style={{flex:1}}>
              {[
                ["≥ 82", "STRONG LEND", "var(--sage)"],
                ["≥ 68", "LEND",        "var(--sage)"],
                ["≥ 52", "WATCH",       "var(--amber)"],
                ["≥ 38", "CONDITIONAL", "var(--amber)"],
                ["< 38", "AVOID",       "var(--coral)"],
              ].map(([range, label, col]) => {
                const active =
                  (label === "STRONG LEND" && score.total >= 82) ||
                  (label === "LEND"        && score.total >= 68 && score.total < 82) ||
                  (label === "WATCH"       && score.total >= 52 && score.total < 68) ||
                  (label === "CONDITIONAL" && score.total >= 38 && score.total < 52) ||
                  (label === "AVOID"       && score.total < 38);
                return (
                  <div key={label} style={{
                    display:'flex', alignItems:'center', gap:10, marginBottom:5,
                    padding:'5px 10px', borderRadius:5,
                    background: active ? `${col}18` : 'transparent',
                    borderLeft: active ? `2px solid ${col}` : '2px solid transparent',
                    opacity: active ? 1 : 0.35,
                    transition:'all 0.3s'
                  }}>
                    <span style={{fontFamily:'var(--font-mono)', fontSize:9, color:'var(--txt-faint)', width:28}}>{range}</span>
                    <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:col, fontWeight:600}}>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Factor breakdown — the explainability panel */}
        <div className="card">
          <div className="card-title">SCORE BREAKDOWN — WHY THIS RATING</div>
          {score.factors.map(f => (
            <div key={f.name} className="factor-row">
              <div style={{flex:'0 0 140px'}}>
                <div className="factor-name">{f.name}</div>
                <div className="factor-val" style={{textAlign:'left', color:'var(--txt-faint)', fontSize:9}}>{f.value}</div>
              </div>
              <div className="factor-bar" style={{flex:1}}>
                <div className="factor-bar-fill" style={{
                  width: `${(f.pts / f.max) * 100}%`,
                  background: f.color,
                  opacity: 0.75
                }}/>
              </div>
              <div className="factor-pts" style={{color: f.delta > 0 ? 'var(--sage)' : f.delta < 0 ? 'var(--coral)' : 'var(--txt-dim)'}}>
                {f.delta > 0 ? '+' : ''}{f.delta !== 0 ? f.delta : '  0'}
              </div>
              <div style={{fontFamily:'var(--font-mono)', fontSize:9, color:'var(--txt-faint)', width:44, textAlign:'right'}}>
                {f.pts}/{f.max}
              </div>
            </div>
          ))}
          <div style={{
            marginTop:12, padding:'10px 12px', background:'var(--panel2)', borderRadius:6,
            display:'flex', justifyContent:'space-between', alignItems:'center',
            borderTop:'1px solid var(--rim)'
          }}>
            <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--txt-dim)'}}>
              Points are additive. Delta shown relative to sector median expectation.
            </span>
            <span style={{fontFamily:'var(--font-mono)', fontSize:14, color:ringColor, fontWeight:700}}>
              {score.total} / 100
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// LIVE DATA FETCHER
// ─────────────────────────────────────────────────────────────
const DataFetcher = ({ onData }) => {
  const [status, setStatus] = useState("idle");
  const [msg, setMsg] = useState("");

  const fetchData = async () => {
    setStatus("loading");
    setMsg("Connecting to US Treasury Fiscal Data API…");
    try {
      const res = await fetch(
        `https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/avg_interest_rates` +
        `?fields=record_date,security_desc,avg_interest_rate_amt` +
        `&filter=security_type_desc:eq:Marketable` +
        `&sort=-record_date&page[size]=6`,
        { mode: "cors" }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.data?.length) throw new Error("No data");

      const byDate = {};
      for (const row of json.data) {
        if (!byDate[row.record_date]) byDate[row.record_date] = {};
        byDate[row.record_date][row.security_desc] = parseFloat(row.avg_interest_rate_amt);
      }
      const latestDate = Object.keys(byDate).sort().at(-1);
      const r = byDate[latestDate];
      const bills = r["Treasury Bills"], notes = r["Treasury Notes"], bonds = r["Treasury Bonds"];
      if (!bills || !notes || !bonds) throw new Error("Incomplete data");

      const curve = [
        { t:0.25, y:parseFloat((bills*1.030).toFixed(3)) },
        { t:0.5,  y:parseFloat((bills*1.015).toFixed(3)) },
        { t:1,    y:parseFloat(bills.toFixed(3)) },
        { t:2,    y:parseFloat((bills*0.4+notes*0.6).toFixed(3)) },
        { t:3,    y:parseFloat((bills*0.2+notes*0.8).toFixed(3)) },
        { t:5,    y:parseFloat(notes.toFixed(3)) },
        { t:7,    y:parseFloat((notes*0.55+bonds*0.45).toFixed(3)) },
        { t:10,   y:parseFloat((notes*0.25+bonds*0.75).toFixed(3)) },
        { t:20,   y:parseFloat(bonds.toFixed(3)) },
        { t:30,   y:parseFloat((bonds*0.985).toFixed(3)) },
      ];
      onData({ curve, date: latestDate });
      setStatus("ok");
      setMsg(`Live — ${latestDate} · US Treasury`);
    } catch (err) {
      setStatus("error");
      setMsg(`API unavailable — using embedded Feb 2026 data`);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {status !== "idle" && (
        <div className={`fetch-banner ${status==="ok"?"fetch-ok":status==="error"?"fetch-err":"fetch-load"}`}>
          {status === "loading" && <div className="spinner" />}
          {status === "ok" && "✓"}
          {status === "error" && "⚠"}
          <span>{msg}</span>
        </div>
      )}
      <button className="btn btn-sm" onClick={fetchData} disabled={status==="loading"}>
        {status === "loading" ? "FETCHING…" : "↻ LIVE DATA"}
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// AI CREDIT MEMO
// In GitHub/Vercel deployment: calls /api/memo proxy endpoint
// ─────────────────────────────────────────────────────────────
const CreditMemoPanel = ({ ticker, liveYieldCurve }) => {
  const co = COMPANIES[ticker];
  const m  = calcMetrics(co);
  const [memo, setMemo]       = useState("");
  const [loading, setLoading] = useState(false);
  const [verdict, setVerdict] = useState(null);
  const [error, setError]     = useState("");

  const generate = async () => {
    setLoading(true); setMemo(""); setVerdict(null); setError("");
    const matYears = co.maturity - CURRENT_YEAR;
    const bench = interpYield(matYears, liveYieldCurve || TREAS_CURVE);
    const ytm = bench + co.spread/100;

    const prompt = `You are a Managing Director at a bulge-bracket investment bank's credit research desk. Write a professional credit memo for ${co.name} (${ticker}).

FINANCIAL DATA (FY2024 10-K):
Revenue: ${fmtB(co.revenue)} | EBITDA: ${fmtB(co.ebitda)} | EBITDA Margin: ${fmtP(m.ebitdaMgn)}
Net Leverage: ${fmtX(m.netLev)} | Interest Coverage: ${fmtX(m.intCov)} | DSCR: ${fmtX(m.dscr)}
FCF: ${fmtB(m.fcf)} | Total Debt: ${fmtB(co.totalDebt)} | Net Debt: ${fmtB(m.netDebt)}
Altman Z-Score: ${m.altmanZ.toFixed(2)} (${zLabel(m.altmanZ)})
Current Rating: ${co.rating} (${co.watch} Outlook) | Bond Maturity: ${co.maturity}
Benchmark Yield: ${bench.toFixed(3)}% | Current OAS: ${co.spread}bps | YTM: ${ytm.toFixed(3)}%

Write with these EXACT section headers (prefix each with ##):
## COMPANY OVERVIEW
## INDUSTRY DYNAMICS
## CREDIT STRENGTHS
## CREDIT RISKS & CONCERNS
## FINANCIAL RATIO ANALYSIS
## ALTMAN Z-SCORE COMMENTARY
## RATING OUTLOOK
## RECOMMENDATION

End with: VERDICT:{"lend":true/false,"suggestedSpread":NNN,"rationale":"one sentence"}`;

    try {
      const res = await fetch("/api/memo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1200,
          messages: [{ role: "user", content: prompt }]
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      let text = data.content?.[0]?.text || "";
      if (!text) throw new Error("Empty response");

      const vMatch = text.match(/VERDICT:(\{.*?\})/);
      if (vMatch) {
        try { setVerdict(JSON.parse(vMatch[1])); } catch(e) {}
        text = text.replace(/VERDICT:.*$/, '').trim();
      }
      setMemo(text);
    } catch(e) {
      setError(`Could not generate memo: ${e.message}. Ensure ANTHROPIC_API_KEY is set in your deployment environment.`);
    }
    setLoading(false);
  };

  const exportMemo = () => {
    const content = [
      "CREDIT MEMORANDUM", "=".repeat(60),
      `${co.name} (${ticker}) | ${co.rating}`,
      `Generated: ${new Date().toLocaleDateString()}`, "",
      memo,
      verdict ? `\n\nVERDICT: ${verdict.lend?"LEND":"DO NOT LEND"} | Spread: ${verdict.suggestedSpread}bps\n${verdict.rationale}` : ""
    ].join('\n');
    const blob = new Blob([content], {type:'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `credit_memo_${ticker}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  const renderMemo = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('## '))
        return <div key={i} className="memo-section-hdr">{trimmed.slice(3).toUpperCase()}</div>;
      return <div key={i} style={{fontFamily:"'Syne',sans-serif", fontSize:13, lineHeight:1.75, color:'var(--txt)'}}>{line || '\u00A0'}</div>;
    });
  };

  return (
    <div>
      {!memo && !loading && !error && (
        <div style={{textAlign:'center', padding:'40px 20px'}}>
          <div style={{fontFamily:'var(--font-display)', fontSize:32, fontWeight:800, color:'var(--gold)', marginBottom:8}}>
            AI Credit Analysis
          </div>
          <div style={{color:'var(--txt-dim)', fontSize:13, marginBottom:28, maxWidth:480, margin:'0 auto 28px'}}>
            Generate an institutional-grade credit memo with lending recommendation, Z-score analysis, and spread pricing.
          </div>
          <button className="btn" style={{fontSize:13, padding:'10px 28px'}} onClick={generate}>
            GENERATE CREDIT MEMO
          </button>
        </div>
      )}
      {error && (
        <div style={{padding:'20px', background:'var(--coral-lo)', border:'1px solid rgba(251,113,133,.3)', borderRadius:8, textAlign:'center'}}>
          <div style={{color:'var(--coral)', fontFamily:'var(--font-mono)', fontSize:12, marginBottom:12}}>⚠ {error}</div>
          <button className="btn btn-sm" onClick={generate}>RETRY</button>
        </div>
      )}
      {loading && (
        <div style={{textAlign:'center', padding:'48px 20px'}}>
          <div className="spinner" style={{width:32, height:32, margin:'0 auto 16px'}}/>
          <div style={{color:'var(--gold)', fontFamily:'var(--font-mono)', fontSize:12, letterSpacing:'0.1em'}}>ANALYZING CREDIT PROFILE…</div>
          <div style={{color:'var(--txt-faint)', fontSize:10, marginTop:8, fontFamily:'var(--font-mono)'}}>Claude is reviewing {co.name}</div>
        </div>
      )}
      {memo && (
        <div className="fade-up">
          {verdict && (
            <div style={{
              padding:'14px 20px', borderRadius:8, marginBottom:20,
              background: verdict.lend?'var(--sage-lo)':'var(--coral-lo)',
              border: `1px solid ${verdict.lend?'rgba(74,222,128,.4)':'rgba(251,113,133,.4)'}`,
              display:'flex', alignItems:'center', gap:16
            }}>
              <div style={{fontFamily:'var(--font-display)', fontSize:22, fontWeight:800, color:verdict.lend?'var(--sage)':'var(--coral)'}}>
                {verdict.lend ? '✓ LEND' : '✗ DO NOT LEND'}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:11, color:'var(--txt-dim)', marginBottom:2, fontFamily:'var(--font-mono)'}}>SUGGESTED SPREAD</div>
                <div style={{fontFamily:'var(--font-mono)', fontSize:16, color:verdict.lend?'var(--sage)':'var(--coral)'}}>+{verdict.suggestedSpread}bps</div>
              </div>
              <div style={{flex:3, fontSize:12, color:'var(--txt-dim)', fontStyle:'italic'}}>{verdict.rationale}</div>
            </div>
          )}
          <div className="memo-body">{renderMemo(memo)}</div>
          <div className="export-row">
            <button className="btn btn-sm" onClick={generate}>REGENERATE</button>
            <button className="btn-ice btn-sm" onClick={exportMemo}>↓ EXPORT TXT</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// CREDIT ANALYSIS TAB
// ─────────────────────────────────────────────────────────────
const CreditTab = ({ liveYieldCurve }) => {
  const tickers = Object.keys(COMPANIES);
  const [sel, setSel] = useState("F");
  const [view, setView] = useState("score");
  const co = COMPANIES[sel];
  const m  = calcMetrics(co);

  const radarData = [
    { axis:"Leverage",   val:Math.max(0,100-m.netLev*15),             full:100 },
    { axis:"Coverage",   val:Math.min(100,m.intCov*12),               full:100 },
    { axis:"DSCR",       val:Math.min(100,m.dscr*50),                 full:100 },
    { axis:"FCF Yield",  val:Math.min(100,Math.max(0,m.fcfYield*10)), full:100 },
    { axis:"EBITDA Mgn", val:Math.min(100,m.ebitdaMgn*3),             full:100 },
    { axis:"Z-Score",    val:Math.min(100,m.altmanZ*20),              full:100 },
  ];

  const metricCard = (label, val, sub, color, benchmark) => (
    <div className="card" style={{borderColor:color+'44'}}>
      <div className="card-title">{label}</div>
      <div className="kpi-val" style={{color, fontSize:28}}>{val}</div>
      <div className="kpi-sub">{sub}</div>
      {benchmark && <div style={{marginTop:8, fontSize:9, color:'var(--txt-faint)', fontFamily:'var(--font-mono)', letterSpacing:'0.08em'}}>{benchmark}</div>}
    </div>
  );

  return (
    <div style={{display:'flex', flexDirection:'column', gap:20}}>
      <div style={{display:'flex', alignItems:'center', gap:16, flexWrap:'wrap'}}>
        <div className="sh" style={{marginBottom:0, flex:1}}><div className="sh-label sh-accent">Credit Analysis</div><div className="sh-line"/></div>
        <select className="sel-inp" value={sel} onChange={e=>{setSel(e.target.value);setView("score");}}>
          {tickers.map(t=><option key={t} value={t}>{COMPANIES[t].name} ({t})</option>)}
        </select>
        <div className="itabs" style={{marginBottom:0}}>
          {["score","metrics","statements","altman","memo"].map(v=>(
            <button key={v} className={`itab${view===v?' active':''}`} onClick={()=>setView(v)}>
              {v==="altman"?"Z-SCORE":v==="score"?"DECISION":v.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Header card */}
      <div className="card card-highlight" style={{padding:'20px 24px'}}>
        <div style={{display:'flex', gap:32, alignItems:'center', flexWrap:'wrap'}}>
          <div>
            <div style={{fontFamily:'var(--font-display)', fontSize:42, fontWeight:800, color:'var(--ice)', letterSpacing:-2, lineHeight:1}}>{sel}</div>
            <div style={{color:'var(--txt-dim)', fontSize:12, marginTop:4}}>{co.name}</div>
            <div style={{fontSize:10, color:'var(--txt-faint)', marginTop:2, fontFamily:'var(--font-mono)'}}>{co.isin}</div>
          </div>
          {[
            ["Rating", <><span className={`badge ${ratingBadge(co.rating)}`} style={{fontSize:16,padding:'4px 12px'}}>{co.rating}</span><span style={{marginLeft:8,fontSize:10,color:'var(--txt-dim)'}}>{co.watch}</span></>],
            ["Sector", co.sector],
            ["Revenue", fmtB(co.revenue)],
            ["EBITDA", fmtB(co.ebitda)],
            ["EBITDA %", fmtP(m.ebitdaMgn)],
            ["OAS", <span style={{color:co.spread>400?'var(--coral)':co.spread>250?'var(--amber)':'var(--sage)',fontFamily:'var(--font-mono)',fontSize:18}}>{co.spread}<span style={{fontSize:12}}> bps</span></span>],
            ["Coupon", `${co.coupon.toFixed(3)}%`],
            ["Maturity", co.maturity],
          ].map(([lbl,val])=>(
            <div key={lbl}>
              <div style={{fontSize:9, color:'var(--txt-faint)', fontFamily:'var(--font-mono)', letterSpacing:'0.12em', marginBottom:4, textTransform:'uppercase'}}>{lbl}</div>
              <div style={{fontFamily:'var(--font-mono)', fontSize:14}}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* DECISION tab — explainability score panel (first tab, most prominent) */}
      {view==="score" && <ScorePanel ticker={sel} />}

      {view==="metrics" && (<>
        <div className="g4">
          {metricCard("Net Leverage", fmtX(m.netLev), "Net Debt / EBITDA", leverageColor(m.netLev), `IG threshold < 3.5x`)}
          {metricCard("Interest Coverage", fmtX(m.intCov), "EBIT / Interest Exp.", coverageColor(m.intCov), "IG threshold > 3.0x")}
          {metricCard("DSCR", fmtX(m.dscr), "Debt Service Coverage", m.dscr>1.5?"var(--sage)":m.dscr>1?"var(--amber)":"var(--coral)", "Minimum: 1.2x")}
          {metricCard("FCF Yield", fmtP(m.fcfYield), "Free Cash Flow / EV", m.fcfYield>5?"var(--sage)":m.fcfYield>2?"var(--amber)":"var(--coral)", `FCF: ${fmtB(m.fcf)}`)}
        </div>
        <div className="g2">
          <div className="card">
            <div className="card-title">CREDIT RADAR — MULTI-FACTOR SCORE</div>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={90}>
                <PolarGrid stroke="var(--faint)"/>
                <PolarAngleAxis dataKey="axis" tick={{fill:'var(--txt-dim)',fontSize:10,fontFamily:'var(--font-mono)'}}/>
                <Radar name={sel} dataKey="val" stroke="var(--gold)" fill="var(--gold)" fillOpacity={0.18} dot={{fill:'var(--gold)',r:3}}/>
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <div className="card-title">SECTOR COMPARABLES</div>
            <table className="tbl">
              <thead><tr><th>CO.</th><th>RATING</th><th>NET LEV.</th><th>INT.COV.</th><th>DSCR</th><th>FCF</th><th>OAS</th></tr></thead>
              <tbody>
                {tickers.map(t=>{
                  const c=COMPANIES[t], mt=calcMetrics(c);
                  return (
                    <tr key={t} className={t===sel?"sel":""} onClick={()=>setSel(t)} style={{cursor:'pointer'}}>
                      <td style={{color:t===sel?'var(--gold)':'var(--ice)',fontWeight:600}}>{t}</td>
                      <td><span className={`badge ${ratingBadge(c.rating)}`}>{c.rating}</span></td>
                      <td style={{color:leverageColor(mt.netLev)}}>{fmtX(mt.netLev)}</td>
                      <td style={{color:coverageColor(mt.intCov)}}>{fmtX(mt.intCov)}</td>
                      <td style={{color:mt.dscr>1.5?'var(--sage)':mt.dscr>1?'var(--amber)':'var(--coral)'}}>{fmtX(mt.dscr)}</td>
                      <td style={{color:mt.fcf>5000?'var(--sage)':'var(--txt-dim)'}}>{fmtB(mt.fcf)}</td>
                      <td style={{color:c.spread>400?'var(--coral)':c.spread>250?'var(--amber)':'var(--sage)'}}>{c.spread}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </>)}

      {view==="statements" && (
        <div className="g3">
          <div className="card">
            <div className="card-title">INCOME STATEMENT ($M)</div>
            {[["Revenue",co.revenue,"var(--txt)"],["EBITDA",co.ebitda,"var(--gold)"],["EBIT",co.ebit,"var(--txt-dim)"],["Interest Exp.",-co.intExp,"var(--coral)"],["Net Income",co.netIncome,"var(--sage)"]].map(([l,v,c])=>(
              <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid var(--faint)'}}>
                <span style={{color:'var(--txt-dim)',fontSize:11}}>{l}</span>
                <span style={{fontFamily:'var(--font-mono)',color:c,fontWeight:l==="Net Income"||l==="EBITDA"?600:400}}>{v<0?`(${fmtB(Math.abs(v)).slice(1)})`:fmtB(v)}</span>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-title">BALANCE SHEET ($M)</div>
            {[["Total Assets",co.assets,"var(--txt)"],["Cash & Equiv.",co.cash,"var(--sage)"],["Total Debt",co.totalDebt,"var(--coral)"],["Net Debt",m.netDebt,"var(--amber)"],["Total Equity",co.equity,"var(--ice)"]].map(([l,v,c])=>(
              <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid var(--faint)'}}>
                <span style={{color:'var(--txt-dim)',fontSize:11}}>{l}</span>
                <span style={{fontFamily:'var(--font-mono)',color:c}}>{fmtB(v)}</span>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-title">CASH FLOW ($M)</div>
            {[["Operating CF",co.ocf,"var(--sage)"],["D&A",co.depr,"var(--txt-dim)"],["Capex",-co.capex,"var(--coral)"],["Free Cash Flow",m.fcf,"var(--gold)"]].map(([l,v,c])=>(
              <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid var(--faint)'}}>
                <span style={{color:'var(--txt-dim)',fontSize:11}}>{l}</span>
                <span style={{fontFamily:'var(--font-mono)',color:c,fontWeight:l==="Free Cash Flow"?600:400}}>{v<0?`(${fmtB(Math.abs(v)).slice(1)})`:fmtB(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {view==="altman" && (
        <div className="g2">
          <div className="card" style={{textAlign:'center',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',padding:40}}>
            <div style={{fontSize:10,letterSpacing:'0.2em',color:'var(--txt-faint)',fontFamily:'var(--font-mono)',marginBottom:16,textTransform:'uppercase'}}>Altman Z-Score</div>
            <div className="z-gauge" style={{color:zColor(m.altmanZ)}}>{m.altmanZ.toFixed(2)}</div>
            <div style={{marginTop:12}}>
              <span className={`badge ${m.altmanZ>2.99?'b-sage':m.altmanZ>1.81?'b-amber':'b-coral'}`} style={{fontSize:14,padding:'6px 16px'}}>
                {zLabel(m.altmanZ)}
              </span>
            </div>
          </div>
          <div className="card">
            <div className="card-title">Z-SCORE DECOMPOSITION</div>
            {[
              ["X1 × 1.2","Working Capital / Assets",(1.2*(co.ocf/co.assets)).toFixed(4)],
              ["X2 × 1.4","Retained Earnings / Assets",(1.4*(co.equity*0.35/co.assets)).toFixed(4)],
              ["X3 × 3.3","EBIT / Assets",(3.3*(co.ebit/co.assets)).toFixed(4)],
              ["X4 × 0.6","Equity / Total Debt",(0.6*(co.equity/(co.totalDebt||1))).toFixed(4)],
              ["X5 × 1.0","Revenue / Assets",(1.0*(co.revenue/co.assets)).toFixed(4)],
            ].map(([factor,label,val])=>(
              <div key={factor} style={{padding:'10px 0',borderBottom:'1px solid var(--faint)'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <div>
                    <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--gold)',marginRight:8}}>{factor}</span>
                    <span style={{fontSize:11,color:'var(--txt-dim)'}}>{label}</span>
                  </div>
                  <span style={{fontFamily:'var(--font-mono)',fontSize:12,color:'var(--txt)'}}>{val}</span>
                </div>
                <div className="mbar-track"><div className="mbar-fill" style={{width:`${Math.min(100,parseFloat(val)*60)}%`,background:'var(--gold-glow)'}}/></div>
              </div>
            ))}
            <div style={{marginTop:14,padding:'12px 14px',background:'var(--gold-lo)',border:'1px solid rgba(201,168,76,.2)',borderRadius:6}}>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--gold)',fontWeight:600}}>Total Z-Score</span>
                <span style={{fontFamily:'var(--font-mono)',fontSize:16,color:'var(--gold)',fontWeight:700}}>{m.altmanZ.toFixed(4)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {view==="memo" && (
        <div className="card"><CreditMemoPanel ticker={sel} liveYieldCurve={liveYieldCurve}/></div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// BOND PRICING TAB
// ─────────────────────────────────────────────────────────────
const BondTab = ({ liveYieldCurve }) => {
  const curve = liveYieldCurve || TREAS_CURVE;
  const [face, setFace]     = useState(1000);
  const [coupon, setCoupon] = useState(5.0);
  const [ytm, setYtm]       = useState(5.5);
  const [years, setYears]   = useState(10);
  const [shock, setShock]   = useState(0);
  const [selCo, setSelCo]   = useState("F");

  const price  = bondPrice(face, coupon, ytm, years);
  const mdur   = modDur(face, coupon, ytm, years);
  const macdur = macDur(face, coupon, ytm, years);
  const conv   = convexity(face, coupon, ytm, years);
  const dv01   = mdur * price * 0.0001;

  const shockedCurve = curve.map(pt=>({...pt, shocked:pt.y+shock/100, label:pt.t<1?`${Math.round(pt.t*12)}M`:`${pt.t}Y`}));
  const histCurve    = TREAS_HIST.map(pt=>({...pt, label:pt.t<1?`${Math.round(pt.t*12)}M`:`${pt.t}Y`}));
  const allYVals = [...shockedCurve.map(p=>p.y), ...shockedCurve.map(p=>p.shocked), ...histCurve.map(p=>p.y)].filter(v=>!isNaN(v));
  const yMin = Math.floor((Math.min(...allYVals)-0.2)*4)/4;
  const yMax = Math.ceil((Math.max(...allYVals)+0.2)*4)/4;

  const co = COMPANIES[selCo];
  const matY = co.maturity - CURRENT_YEAR;
  const benchY = interpYield(matY, curve);
  const bondYtm  = benchY + co.spread/100;
  const bondP    = bondPrice(1000, co.coupon, bondYtm, matY);
  const bondMdur = modDur(1000, co.coupon, bondYtm, matY);
  const bondConv = convexity(1000, co.coupon, bondYtm, matY);
  const bondDv01 = bondMdur * bondP * 0.0001;

  const shockRows = [-200,-100,-50,0,50,100,200].map(bps => {
    const ny = ytm+bps/100, np = bondPrice(face,coupon,ny,years);
    const durEst = -mdur*(bps/100)*100, convAdj = 0.5*conv*(bps/100)*(bps/100)*100;
    return { bps, ny, np, chg:np-price, pct:(np-price)/price*100, durEst, convAdj };
  });

  const PY_HALF_RANGE=4.0, PY_STEP=0.1;
  const pyMin = Math.max(0.1,ytm-PY_HALF_RANGE), pyMax = ytm+PY_HALF_RANGE;
  const priceVsYtmData = Array.from({length:Math.round((pyMax-pyMin)/PY_STEP)+1},(_,i)=>{
    const y = parseFloat((pyMin+i*PY_STEP).toFixed(3));
    return { yld:y, price:bondPrice(face,coupon,y,years) };
  });

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      <div className="sh"><div className="sh-label sh-accent">Bond Pricing & Yield Curve</div><div className="sh-line"/></div>
      <div className="g2">
        <div className="card">
          <div className="card-title">US TREASURY YIELD CURVE — CURRENT vs. PRIOR YEAR</div>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
            <span style={{fontSize:10,color:'var(--txt-dim)',fontFamily:'var(--font-mono)'}}>SHOCK:</span>
            <input type="range" className="slider" min="-200" max="200" step="25" value={shock} onChange={e=>setShock(+e.target.value)}/>
            <span style={{fontFamily:'var(--font-mono)',fontSize:12,width:72,color:shock>0?'var(--coral)':shock<0?'var(--sage)':'var(--txt-dim)'}}>{shock>0?'+':''}{shock}bps</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={shockedCurve}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--faint)"/>
              <XAxis dataKey="label" tick={{fill:'var(--txt-faint)',fontSize:10}}/>
              <YAxis domain={[yMin,yMax]} tick={{fill:'var(--txt-faint)',fontSize:10}} tickFormatter={v=>`${v.toFixed(2)}%`}/>
              <Tooltip content={<CustomTooltip extra="%"/>}/>
              <Line data={histCurve} type="monotone" dataKey="y" stroke="var(--muted)" strokeWidth={1.5} strokeDasharray="4 3" dot={false} name="Prior Year"/>
              <Line type="monotone" dataKey="y" stroke="var(--sage)" strokeWidth={2} dot={false} name="Current"/>
              {shock!==0 && <Line type="monotone" dataKey="shocked" stroke="var(--coral)" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name={`+${shock}bps`}/>}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="card-title">CORPORATE BOND — OAS ANALYSIS</div>
          <select className="sel-inp" style={{width:'100%',marginBottom:14}} value={selCo} onChange={e=>setSelCo(e.target.value)}>
            {Object.keys(COMPANIES).map(t=><option key={t} value={t}>{COMPANIES[t].name} ({t}) — {COMPANIES[t].rating}</option>)}
          </select>
          <div style={{padding:'12px 16px',background:'var(--panel2)',border:'1px solid var(--rim)',borderRadius:6,marginBottom:14}}>
            <div style={{fontSize:9,color:'var(--txt-faint)',fontFamily:'var(--font-mono)',letterSpacing:'0.1em',marginBottom:8}}>OAS DECOMPOSITION</div>
            <div style={{display:'flex',alignItems:'center',gap:8,fontFamily:'var(--font-mono)',fontSize:12,flexWrap:'wrap'}}>
              <span style={{color:'var(--sage)'}}>{benchY.toFixed(3)}%</span>
              <span style={{color:'var(--txt-faint)'}}>benchmark +</span>
              <span style={{color:'var(--amber)'}}>{co.spread}bps</span>
              <span style={{color:'var(--txt-faint)'}}>OAS =</span>
              <span style={{color:'var(--gold)',fontWeight:700,fontSize:14}}>{bondYtm.toFixed(3)}% YTM</span>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {[["Coupon",`${co.coupon.toFixed(3)}%`],["Maturity",`${co.maturity} (${matY}Y)`],["Bond Price",`$${bondP.toFixed(4)}`],["vs. Par",`${((bondP/1000-1)*100).toFixed(3)}%`],["Mod. Duration",`${bondMdur.toFixed(3)}y`],["Convexity",bondConv.toFixed(3)],["DV01",`$${bondDv01.toFixed(4)}`],["Rating",co.rating]].map(([l,v])=>(
              <div key={l} style={{background:'var(--panel2)',padding:'8px 10px',borderRadius:5}}>
                <div style={{fontSize:9,color:'var(--txt-faint)',fontFamily:'var(--font-mono)',letterSpacing:'0.08em'}}>{l}</div>
                <div style={{fontFamily:'var(--font-mono)',fontSize:13,color:'var(--ice)',marginTop:2}}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="g2">
        <div className="card">
          <div className="card-title">BOND PRICING CALCULATOR</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
            {[["Face Value ($)",face,setFace,100,10000,100],["Coupon Rate (%)",coupon,setCoupon,0,20,0.1],["YTM (%)",ytm,setYtm,0.1,20,0.1],["Years to Maturity",years,setYears,1,30,1]].map(([l,v,s,mn,mx,st])=>(
              <div key={l}>
                <div style={{fontSize:9,color:'var(--txt-faint)',fontFamily:'var(--font-mono)',marginBottom:4,letterSpacing:'0.08em'}}>{l}</div>
                <input type="number" className="inp" value={v} min={mn} max={mx} step={st} onChange={e=>s(+e.target.value)}/>
              </div>
            ))}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
            {[["Clean Price",`$${price.toFixed(4)}`,"var(--gold)"],["% of Par",`${(price/face*100).toFixed(3)}%`,"var(--ice)"],["Status",price>face?"PREMIUM":price<face?"DISCOUNT":"AT PAR",price>face?"var(--sage)":price<face?"var(--amber)":"var(--txt-dim)"],["Macaulay Dur.",`${macdur.toFixed(4)}y`,"var(--txt)"],["Modified Dur.",`${mdur.toFixed(4)}y`,"var(--txt)"],["Convexity",conv.toFixed(4),"var(--txt)"],["DV01",`$${dv01.toFixed(4)}`,"var(--coral)"],["Yield Spread",`${((ytm-interpYield(years,curve))*100).toFixed(0)}bps`,"var(--amber)"]].map(([l,v,c])=>(
              <div key={l} style={{background:'var(--panel2)',padding:'8px 10px',borderRadius:5}}>
                <div style={{fontSize:9,color:'var(--txt-faint)',fontFamily:'var(--font-mono)',letterSpacing:'0.08em'}}>{l}</div>
                <div style={{fontFamily:'var(--font-mono)',fontSize:14,color:c,marginTop:2,fontWeight:500}}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-title">PRICE / YIELD CONVEXITY CURVE</div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={priceVsYtmData} margin={{top:10,right:16,left:10,bottom:0}}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.3}/>
                  <stop offset="100%" stopColor="var(--gold)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--faint)"/>
              <XAxis dataKey="yld" type="number" domain={[pyMin,pyMax]} tick={{fill:'var(--txt-faint)',fontSize:9}} tickFormatter={v=>`${v.toFixed(1)}%`} tickCount={9}/>
              <YAxis domain={['auto','auto']} tick={{fill:'var(--txt-faint)',fontSize:9}} tickFormatter={v=>`$${Math.round(v)}`} width={52}/>
              <Tooltip content={({active,payload})=>active&&payload?.length?<div className="chart-tip"><div className="chart-tip-label">YTM: {payload[0]?.payload?.yld?.toFixed(2)}%</div><div style={{color:'var(--gold)'}}>Price: <strong>${payload[0]?.value?.toFixed(2)}</strong></div></div>:null}/>
              <ReferenceLine x={ytm} stroke="var(--coral)" strokeDasharray="4 3" label={{value:`${ytm.toFixed(2)}%`,fill:'var(--coral)',fontSize:9,position:'top'}}/>
              <Area type="monotone" dataKey="price" stroke="var(--gold)" fill="url(#priceGrad)" strokeWidth={2} dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
          <div style={{marginTop:10,padding:'8px 12px',background:'var(--panel2)',borderRadius:5,fontSize:11,color:'var(--txt-dim)',fontFamily:'var(--font-mono)'}}>
            Convexity = {conv.toFixed(2)} yrs² — positive convexity: price gains exceed duration estimate on rallies; losses are less on sell-offs.
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-title">RATE SHOCK SENSITIVITY — DURATION + CONVEXITY ANALYSIS</div>
        <table className="tbl">
          <thead><tr><th>SCENARIO</th><th>NEW YTM</th><th>NEW PRICE</th><th>$ CHANGE</th><th>% CHANGE</th><th>DUR ESTIMATE</th><th>CONV ADJ</th><th>TOTAL APPROX</th></tr></thead>
          <tbody>
            {shockRows.map(r=>(
              <tr key={r.bps} style={r.bps===0?{background:'var(--panel2)'}:{}}>
                <td style={{color:r.bps>0?'var(--coral)':r.bps<0?'var(--sage)':'var(--txt-dim)',fontWeight:600}}>{r.bps===0?"BASE":r.bps>0?`+${r.bps}bps`:`${r.bps}bps`}</td>
                <td>{r.ny.toFixed(3)}%</td>
                <td>${r.np.toFixed(2)}</td>
                <td style={{color:r.chg>0?'var(--sage)':r.chg<0?'var(--coral)':'var(--txt-dim)'}}>{r.bps===0?"—":`${r.chg>0?'+':'-'}$${Math.abs(r.chg).toFixed(4)}`}</td>
                <td style={{color:r.pct>0?'var(--sage)':r.pct<0?'var(--coral)':'var(--txt-dim)'}}>{r.bps===0?"—":`${r.pct>0?'+':''}${r.pct.toFixed(3)}%`}</td>
                <td style={{color:'var(--txt-dim)',fontSize:10}}>{r.bps===0?"—":`~${r.durEst.toFixed(3)}%`}</td>
                <td style={{color:'var(--lav)',fontSize:10}}>{r.bps===0?"—":`+${r.convAdj.toFixed(3)}%`}</td>
                <td style={{fontWeight:600,fontSize:10,color:r.bps===0?'var(--txt-dim)':r.chg>0?'var(--sage)':'var(--coral)'}}>{r.bps===0?"—":`~${(r.durEst+r.convAdj).toFixed(3)}%`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// PORTFOLIO RISK TAB
// ─────────────────────────────────────────────────────────────
const PORT_POSITIONS = [
  { ticker:"F",   weight:20, notional:2e6 },
  { ticker:"GM",  weight:25, notional:2.5e6 },
  { ticker:"DAL", weight:15, notional:1.5e6 },
  { ticker:"PFE", weight:30, notional:3e6 },
  { ticker:"CCL", weight:10, notional:1e6 },
];

const SHOCKS = [
  { label:"-200bps", bps:-200, color:"#4ade80" },
  { label:"-100bps", bps:-100, color:"#86efac" },
  { label:"-50bps",  bps:-50,  color:"#a3e635" },
  { label:"BASE",    bps:0,    color:"#8899bb" },
  { label:"+50bps",  bps:50,   color:"#fbbf24" },
  { label:"+100bps", bps:100,  color:"#fb923c" },
  { label:"+200bps", bps:200,  color:"#fb7185" },
];

const SECTOR_COLORS = { Auto:"#7eb8f7", Airlines:"#fbbf24", Pharma:"#4ade80", Leisure:"#fb7185" };
const RATING_COLORS = { "A":"#4ade80", "BBB-":"#7eb8f7", "BB+":"#fbbf24", "BB":"#fbbf24", "B+":"#fb7185" };

const PortfolioTab = ({ liveYieldCurve }) => {
  const curve = liveYieldCurve || TREAS_CURVE;
  const positions = PORT_POSITIONS.map(pos => {
    const co=COMPANIES[pos.ticker], matY=co.maturity-CURRENT_YEAR;
    const bench=interpYield(matY,curve), ytm=bench+co.spread/100;
    const price=bondPrice(1000,co.coupon,ytm,matY), md=modDur(1000,co.coupon,ytm,matY);
    const cv=convexity(1000,co.coupon,ytm,matY), dv01bond=md*price*0.0001;
    return {...pos,co,matY,bench,ytm,price,md,cv,dv01bond,dv01port:dv01bond*(pos.notional/1000)};
  });

  const totalNotional = positions.reduce((s,p)=>s+p.notional,0);
  const totalDV01     = positions.reduce((s,p)=>s+p.dv01port,0);
  const avgDur        = positions.reduce((s,p)=>s+p.md*p.weight/100,0);
  const avgSpread     = positions.reduce((s,p)=>s+p.co.spread*p.weight/100,0);

  const scenarioResults = SHOCKS.map(({label,bps,color})=>{
    const pnls=positions.map(pos=>{
      const newYtm=pos.ytm+bps/100, newPrice=bondPrice(1000,pos.co.coupon,newYtm,pos.matY);
      return {ticker:pos.ticker, pnl:(newPrice-pos.price)*(pos.notional/1000), pct:(newPrice-pos.price)/pos.price*100};
    });
    const total=pnls.reduce((s,p)=>s+p.pnl,0);
    return {label,bps,color,pnls,total,totalPct:total/totalNotional*100};
  });

  const scenarioChartData=SHOCKS.map(({label,bps,color})=>({
    scenario:label, color,
    pnl:Math.round(positions.reduce((s,pos)=>{
      const newYtm=pos.ytm+bps/100, newPrice=bondPrice(1000,pos.co.coupon,newYtm,pos.matY);
      return s+(newPrice-pos.price)*(pos.notional/1000);
    },0))
  }));

  // ── Sector exposure ──
  const sectorMap = {};
  positions.forEach(p => {
    const s = p.co.sector;
    if (!sectorMap[s]) sectorMap[s] = 0;
    sectorMap[s] += p.weight;
  });
  const sectorData = Object.entries(sectorMap).map(([name, value]) => ({ name, value, color: SECTOR_COLORS[name] || 'var(--lav)' }));

  // ── Rating bucket exposure ──
  const ratingMap = {};
  positions.forEach(p => {
    const r = p.co.rating;
    if (!ratingMap[r]) ratingMap[r] = 0;
    ratingMap[r] += p.weight;
  });
  const ratingData = Object.entries(ratingMap)
    .sort((a,b) => {
      const order = ["AAA","AA+","AA","AA-","A+","A","A-","BBB+","BBB","BBB-","BB+","BB","BB-","B+","B","B-","CCC"];
      return order.indexOf(a[0]) - order.indexOf(b[0]);
    })
    .map(([name, value]) => ({ name, value, color: RATING_COLORS[name] || 'var(--txt-dim)' }));

  const allSpreadData=SPREAD_HISTORY.map((wk,i)=>({
    week:`W${i+1}`,
    wSpread:Math.round(Object.entries(wk).filter(([k])=>k!=='week').reduce((s,[t,v])=>{
      const pos=PORT_POSITIONS.find(p=>p.ticker===t);
      return pos?s+v*(pos.weight/100):s;
    },0))
  }));
  const spreadChartData=allSpreadData.slice(-26).map((d,i)=>({...d,week:`W${i+1}`}));
  const spread52wHigh=Math.max(...allSpreadData.map(d=>d.wSpread));
  const spread52wLow=Math.min(...allSpreadData.map(d=>d.wSpread));

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      <div className="sh"><div className="sh-label sh-accent">Portfolio Risk & Scenario Analysis</div><div className="sh-line"/></div>

      <div className="g5">
        {[
          ["Total Notional",`$${(totalNotional/1e6).toFixed(0)}M`,"var(--ice)"],
          ["Portfolio DV01",`$${totalDV01.toFixed(0)}`,"var(--coral)"],
          ["Avg. Duration",`${avgDur.toFixed(2)}y`,"var(--gold)"],
          ["Wtd Avg Spread",`${avgSpread.toFixed(0)}bps`,"var(--amber)"],
          ["+100bps P&L",`$${scenarioResults.find(s=>s.bps===100).total.toLocaleString('en',{maximumFractionDigits:0})}`,"var(--coral)"],
        ].map(([l,v,c])=>(
          <div className="card" key={l} style={{borderColor:c+'33'}}>
            <div className="card-title">{l}</div>
            <div className="kpi-val" style={{color:c,fontSize:22}}>{v}</div>
          </div>
        ))}
      </div>

      {/* Exposure by Sector + Rating — the portfolio manager view upgrade */}
      <div className="g2">
        <div className="card">
          <div className="card-title">EXPOSURE BY SECTOR — PORTFOLIO WEIGHT %</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={sectorData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--faint)" horizontal={false}/>
              <XAxis type="number" tick={{fill:'var(--txt-faint)',fontSize:9}} tickFormatter={v=>`${v}%`}/>
              <YAxis type="category" dataKey="name" tick={{fill:'var(--txt-dim)',fontSize:11,fontFamily:'var(--font-mono)'}} width={64}/>
              <Tooltip content={({active,payload,label})=>active&&payload?.length?<div className="chart-tip"><div className="chart-tip-label">{label}</div><div style={{color:'var(--ice)'}}>Weight: {payload[0]?.value}%</div></div>:null}/>
              <Bar dataKey="value" radius={[0,4,4,0]}>
                {sectorData.map((d,i)=><Cell key={i} fill={d.color}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{display:'flex', gap:12, marginTop:10, flexWrap:'wrap'}}>
            {sectorData.map(d=>(
              <div key={d.name} style={{display:'flex', alignItems:'center', gap:5, fontSize:10, fontFamily:'var(--font-mono)', color:'var(--txt-dim)'}}>
                <div style={{width:8, height:8, borderRadius:2, background:d.color}}/>
                {d.name} {d.value}%
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title">EXPOSURE BY RATING BUCKET</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={ratingData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--faint)" horizontal={false}/>
              <XAxis type="number" tick={{fill:'var(--txt-faint)',fontSize:9}} tickFormatter={v=>`${v}%`}/>
              <YAxis type="category" dataKey="name" tick={{fill:'var(--txt-dim)',fontSize:11,fontFamily:'var(--font-mono)'}} width={44}/>
              <Tooltip content={({active,payload,label})=>active&&payload?.length?<div className="chart-tip"><div className="chart-tip-label">{label}</div><div>Weight: {payload[0]?.value}%</div></div>:null}/>
              <Bar dataKey="value" radius={[0,4,4,0]}>
                {ratingData.map((d,i)=><Cell key={i} fill={d.color}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{display:'flex', gap:12, marginTop:10, flexWrap:'wrap'}}>
            {ratingData.map(d=>(
              <div key={d.name} style={{display:'flex', alignItems:'center', gap:5, fontSize:10, fontFamily:'var(--font-mono)', color:'var(--txt-dim)'}}>
                <div style={{width:8, height:8, borderRadius:2, background:d.color}}/>
                {d.name} {d.value}%
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="card-title">DV01 BY POSITION — TOP RISK CONTRIBUTORS</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={[...positions].sort((a,b)=>b.dv01port-a.dv01port).map(p=>({name:p.ticker,dv01:+p.dv01port.toFixed(0)}))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--faint)" horizontal={false}/>
              <XAxis type="number" tick={{fill:'var(--txt-faint)',fontSize:9}} tickFormatter={v=>`$${v}`}/>
              <YAxis type="category" dataKey="name" tick={{fill:'var(--txt-dim)',fontSize:11,fontFamily:'var(--font-mono)'}} width={36}/>
              <Tooltip content={({active,payload,label})=>active&&payload?.length?<div className="chart-tip"><div className="chart-tip-label">{label}</div><div style={{color:'var(--coral)'}}>DV01: ${payload[0]?.value?.toLocaleString()}</div></div>:null}/>
              <Bar dataKey="dv01" fill="var(--coral)" opacity={0.8} radius={[0,3,3,0]}/>
            </BarChart>
          </ResponsiveContainer>
          <div style={{marginTop:12}}>
            {[...positions].sort((a,b)=>b.dv01port-a.dv01port).map(p=>(
              <div key={p.ticker} style={{marginBottom:8}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--gold)',width:32}}>{p.ticker}</span>
                    <span className={`badge ${ratingBadge(p.co.rating)}`}>{p.co.rating}</span>
                  </div>
                  <div style={{display:'flex',gap:12,fontSize:10,fontFamily:'var(--font-mono)'}}>
                    <span style={{color:'var(--txt-dim)'}}>{p.weight}%</span>
                    <span style={{color:'var(--coral)'}}>DV01 ${p.dv01port.toFixed(0)}</span>
                    <span style={{color:'var(--txt-faint)'}}>{(p.dv01port/totalDV01*100).toFixed(1)}% risk</span>
                  </div>
                </div>
                <div className="mbar-track"><div className="mbar-fill" style={{width:`${p.dv01port/Math.max(...positions.map(q=>q.dv01port))*100}%`,background:'var(--coral)',opacity:0.7}}/></div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title">PORTFOLIO WEIGHTED SPREAD — 26W SIMULATED †</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={spreadChartData}>
              <defs>
                <linearGradient id="spreadGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--amber)" stopOpacity={0.3}/>
                  <stop offset="100%" stopColor="var(--amber)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--faint)"/>
              <XAxis dataKey="week" tick={{fill:'var(--txt-faint)',fontSize:9}} interval={4}/>
              <YAxis tick={{fill:'var(--txt-faint)',fontSize:9}} tickFormatter={v=>`${v}bps`}/>
              <Tooltip content={({active,payload,label})=>active&&payload?.length?<div className="chart-tip"><div className="chart-tip-label">{label}</div><div style={{color:'var(--amber)'}}>Spread: {payload[0]?.value}bps</div></div>:null}/>
              <Area type="monotone" dataKey="wSpread" stroke="var(--amber)" fill="url(#spreadGrad)" strokeWidth={2} dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
          <div style={{marginTop:10,display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
            {[["Current",`${avgSpread.toFixed(0)}bps`,"var(--amber)"],["52W High †",`${spread52wHigh}bps`,"var(--coral)"],["52W Low †",`${spread52wLow}bps`,"var(--sage)"]].map(([l,v,c])=>(
              <div key={l} style={{background:'var(--panel2)',padding:'8px 10px',borderRadius:5}}>
                <div style={{fontSize:9,color:'var(--txt-faint)',fontFamily:'var(--font-mono)'}}>{l}</div>
                <div style={{fontFamily:'var(--font-mono)',fontSize:14,color:c,marginTop:2}}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{fontSize:9,color:"var(--txt-faint)",fontFamily:"var(--font-mono)",marginTop:8}}>† Simulated — real data via FINRA TRACE or Bloomberg BVAL</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">SCENARIO ANALYSIS — PORTFOLIO P&L BY RATE SHOCK</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={scenarioChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--faint)" vertical={false}/>
            <XAxis dataKey="scenario" tick={{fill:'var(--txt-faint)',fontSize:10}}/>
            <YAxis tick={{fill:'var(--txt-faint)',fontSize:9}} tickFormatter={v=>`$${(v/1000).toFixed(0)}K`}/>
            <Tooltip content={({active,payload,label})=>active&&payload?.length?<div className="chart-tip"><div className="chart-tip-label">{label}</div><div style={{color:payload[0]?.value>0?'var(--sage)':'var(--coral)'}}>P&L: ${payload[0]?.value?.toLocaleString()}</div></div>:null}/>
            <ReferenceLine y={0} stroke="var(--rim2)"/>
            <Bar dataKey="pnl">{scenarioChartData.map((d,i)=><Cell key={i} fill={d.color}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <div className="card-title">RATE SHOCK SCENARIO MATRIX — POSITION-LEVEL P&L ($)</div>
        <div style={{overflowX:'auto'}}>
          <table className="tbl">
            <thead>
              <tr>
                <th>SCENARIO</th>
                {positions.map(p=><th key={p.ticker}>{p.ticker}</th>)}
                <th>TOTAL P&L</th><th>TOTAL %</th>
              </tr>
            </thead>
            <tbody>
              {scenarioResults.map(s=>(
                <tr key={s.label} style={s.bps===0?{background:'var(--panel2)'}:{}}>
                  <td style={{color:s.color,fontWeight:600,fontFamily:'var(--font-mono)'}}>{s.label}</td>
                  {s.pnls.map(p=>(
                    <td key={p.ticker} style={{fontFamily:'var(--font-mono)',fontSize:11,color:p.pnl>0?'var(--sage)':p.pnl<0?'var(--coral)':'var(--txt-dim)'}}>
                      {p.pnl===0?"—":p.pnl>0?`+$${p.pnl.toLocaleString('en',{maximumFractionDigits:0})}`:`-$${Math.abs(p.pnl).toLocaleString('en',{maximumFractionDigits:0})}`}
                    </td>
                  ))}
                  <td style={{fontFamily:'var(--font-mono)',fontWeight:700,color:s.total>0?'var(--sage)':s.total<0?'var(--coral)':'var(--txt-dim)'}}>
                    {s.total>=0?'+':'-'}${Math.abs(s.total).toLocaleString('en',{maximumFractionDigits:0})}
                  </td>
                  <td style={{fontFamily:'var(--font-mono)',fontWeight:600,color:s.totalPct>0?'var(--sage)':s.totalPct<0?'var(--coral)':'var(--txt-dim)'}}>
                    {s.totalPct>=0?'+':''}{s.totalPct.toFixed(3)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DASHBOARD TAB
// ─────────────────────────────────────────────────────────────
const DashboardTab = ({ liveYieldCurve, setLiveYieldCurve }) => {
  const tickers = Object.keys(COMPANIES);
  const allM = tickers.map(t=>({ticker:t,...COMPANIES[t],...calcMetrics(COMPANIES[t])}));
  const curve = liveYieldCurve || TREAS_CURVE;

  const portStats = PORT_POSITIONS.map(pos=>{
    const co=COMPANIES[pos.ticker], matY=co.maturity-CURRENT_YEAR;
    const bench=interpYield(matY,curve), ytm=bench+co.spread/100;
    const price=bondPrice(1000,co.coupon,ytm,matY), md=modDur(1000,co.coupon,ytm,matY);
    return {...pos,co,ytm,price,md,dv01:md*price*0.0001*(pos.notional/1000)};
  });
  const totalDV01   = portStats.reduce((s,p)=>s+p.dv01,0);
  const avgDur      = portStats.reduce((s,p)=>s+p.md*p.weight/100,0);
  const shock100PnL = portStats.reduce((s,p)=>{
    const co=COMPANIES[p.ticker],matY=co.maturity-CURRENT_YEAR;
    return s+(bondPrice(1000,co.coupon,p.ytm+1,matY)-p.price)*(p.notional/1000);
  },0);

  const curveData = curve.map(pt=>({...pt,label:pt.t<1?`${Math.round(pt.t*12)}M`:`${pt.t}Y`}));

  const verdict = (m) => {
    const score=(m.netLev<2?3:m.netLev<4?2:0)+(m.intCov>4?3:m.intCov>2?2:0)+(m.dscr>1.5?3:m.dscr>1?2:0)+(m.altmanZ>2.99?3:m.altmanZ>1.81?2:0);
    return score>=10?["STRONG LEND","b-sage"]:score>=7?["LEND","b-sage"]:score>=5?["CONDITIONAL","b-amber"]:["NO LEND","b-coral"];
  };

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}}>
        <div className="sh" style={{marginBottom:0,flex:1}}><div className="sh-label sh-accent">Executive Dashboard</div><div className="sh-line"/></div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <DataFetcher onData={d=>setLiveYieldCurve(d.curve)}/>
        </div>
      </div>

      <div className="g5">
        {[
          ["Coverage Universe","5 Companies","var(--ice)","Multi-sector HY/IG"],
          ["Avg OAS Spread",`${Math.round(tickers.reduce((s,t)=>s+COMPANIES[t].spread,0)/tickers.length)}bps`,"var(--amber)","Universe average"],
          ["Portfolio DV01",`$${totalDV01.toFixed(0)}`,"var(--coral)","Per basis point"],
          ["Avg Mod. Duration",`${avgDur.toFixed(2)}y`,"var(--gold)","Weighted"],
          ["+100bps P&L",`$${Math.round(shock100PnL).toLocaleString()}`,"var(--coral)","Rate shock impact"],
        ].map(([l,v,c,sub])=>(
          <div className="card" key={l} style={{borderColor:c+'33'}}>
            <div className="card-title">{l}</div>
            <div className="kpi-val" style={{color:c,fontSize:22}}>{v}</div>
            <div className="kpi-sub">{sub}</div>
          </div>
        ))}
      </div>

      <div className="g2">
        <div className="card">
          <div className="card-title">CREDIT HEATMAP — LENDING VERDICTS</div>
          <table className="tbl">
            <thead><tr><th>CO.</th><th>RATING</th><th>NET LEV.</th><th>INT.COV.</th><th>DSCR</th><th>Z-SCORE</th><th>OAS</th><th>VERDICT</th></tr></thead>
            <tbody>
              {allM.map(m=>{
                const [vlbl,vcls]=verdict(m);
                return (
                  <tr key={m.ticker}>
                    <td style={{color:'var(--ice)',fontWeight:700}}>{m.ticker}</td>
                    <td><span className={`badge ${ratingBadge(m.rating)}`}>{m.rating}</span></td>
                    <td style={{color:leverageColor(m.netLev)}}>{fmtX(m.netLev)}</td>
                    <td style={{color:coverageColor(m.intCov)}}>{fmtX(m.intCov)}</td>
                    <td style={{color:m.dscr>1.5?'var(--sage)':m.dscr>1?'var(--amber)':'var(--coral)'}}>{fmtX(m.dscr)}</td>
                    <td style={{color:zColor(m.altmanZ)}}>{m.altmanZ.toFixed(2)}</td>
                    <td style={{color:m.spread>400?'var(--coral)':m.spread>250?'var(--amber)':'var(--sage)'}}>{m.spread}</td>
                    <td><span className={`badge ${vcls}`}>{vlbl}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-title">OAS SPREAD BY ISSUER</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={tickers.map(t=>({name:t,spread:COMPANIES[t].spread}))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--faint)" horizontal={false}/>
              <XAxis type="number" tick={{fill:'var(--txt-faint)',fontSize:9}} tickFormatter={v=>`${v}bps`}/>
              <YAxis type="category" dataKey="name" tick={{fill:'var(--txt-dim)',fontSize:11,fontFamily:'var(--font-mono)'}} width={36}/>
              <Tooltip content={({active,payload,label})=>active&&payload?.length?<div className="chart-tip"><div className="chart-tip-label">{label}</div><div>Spread: {payload[0]?.value}bps</div></div>:null}/>
              <ReferenceLine x={150} stroke="var(--ice)" strokeDasharray="4 3" label={{value:'IG/HY',fill:'var(--ice)',fontSize:9}}/>
              <Bar dataKey="spread" radius={[0,4,4,0]} fill="var(--amber)"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="card-title">TREASURY YIELD CURVE</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={curveData}>
              <defs>
                <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--sage)" stopOpacity={0.2}/>
                  <stop offset="100%" stopColor="var(--sage)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--faint)"/>
              <XAxis dataKey="label" tick={{fill:'var(--txt-faint)',fontSize:9}}/>
              <YAxis domain={['auto','auto']} tick={{fill:'var(--txt-faint)',fontSize:9}} tickFormatter={v=>`${v}%`}/>
              <Tooltip content={({active,payload,label})=>active&&payload?.length?<div className="chart-tip"><div className="chart-tip-label">Maturity: {label}</div><div style={{color:'var(--sage)'}}>Yield: {payload[0]?.value?.toFixed(3)}%</div></div>:null}/>
              <Area type="monotone" dataKey="y" stroke="var(--sage)" fill="url(#curveGrad)" strokeWidth={2} dot={{fill:'var(--sage)',r:3}}/>
            </AreaChart>
          </ResponsiveContainer>
          <div style={{marginTop:10,padding:'8px 12px',background:'var(--panel2)',borderRadius:5,display:'flex',gap:16,fontSize:10,fontFamily:'var(--font-mono)',flexWrap:'wrap'}}>
            <span style={{color:'var(--txt-faint)'}}>2s10s Spread:</span>
            <span style={{color:(curve.find(p=>p.t===10)?.y||4.52)-(curve.find(p=>p.t===2)?.y||4.15)>0?'var(--sage)':'var(--coral)'}}>
              {(((curve.find(p=>p.t===10)?.y||4.52)-(curve.find(p=>p.t===2)?.y||4.15))*100).toFixed(0)}bps
            </span>
            <span style={{color:'var(--txt-faint)',marginLeft:8}}>Status:</span>
            <span style={{color:(curve.find(p=>p.t===10)?.y||4.52)>(curve.find(p=>p.t===2)?.y||4.15)?'var(--sage)':'var(--coral)'}}>
              {(curve.find(p=>p.t===10)?.y||4.52)>(curve.find(p=>p.t===2)?.y||4.15)?"NORMAL":"INVERTED"}
            </span>
          </div>
        </div>

        <div className="card">
          <div className="card-title">PORTFOLIO COMPOSITION & RISK ATTRIBUTION</div>
          {portStats.map(p=>(
            <div key={p.ticker} style={{marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <span style={{fontFamily:'var(--font-mono)',fontSize:12,color:'var(--gold)',fontWeight:700,width:36}}>{p.ticker}</span>
                  <span className={`badge ${ratingBadge(p.co.rating)}`}>{p.co.rating}</span>
                  <span style={{fontSize:10,color:'var(--txt-dim)'}}>{p.co.spread}bps</span>
                </div>
                <div style={{display:'flex',gap:12,fontSize:10,fontFamily:'var(--font-mono)'}}>
                  <span style={{color:'var(--txt-dim)'}}>{p.weight}%</span>
                  <span style={{color:'var(--coral)'}}>DV01 ${p.dv01.toFixed(0)}</span>
                  <span style={{color:'var(--txt-faint)'}}>{(p.dv01/totalDV01*100).toFixed(1)}% risk</span>
                </div>
              </div>
              <div style={{height:6,background:'var(--faint)',borderRadius:3,overflow:'hidden'}}>
                <div style={{width:`${p.weight}%`,height:'100%',background:p.co.spread>400?'var(--coral)':p.co.spread>250?'var(--amber)':'var(--sage)',borderRadius:3}}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab]               = useState("dashboard");
  const [time, setTime]             = useState(new Date());
  const [liveYieldCurve, setLiveYieldCurve] = useState(null);
  const [dataStatus, setDataStatus] = useState("static");

  const handleLiveData = useCallback((curve) => {
    setLiveYieldCurve(curve);
    setDataStatus("live");
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const TABS = [
    { id:"dashboard", label:"Dashboard" },
    { id:"credit",    label:"Credit Analysis" },
    { id:"bonds",     label:"Bond Pricing" },
    { id:"portfolio", label:"Portfolio Risk" },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <div className="topbar">
          <div className="brand">
            <div className="brand-icon">◈</div>
            FIXD
          </div>
          <nav className="nav">
            {TABS.map(t=>(
              <button key={t.id} className={`nav-item${tab===t.id?' active':''}`} onClick={()=>setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </nav>
          <div className="topbar-right">
            <div className="live-badge" style={{
              borderColor: dataStatus==="live"?"var(--sage)":"var(--muted)",
              background:  dataStatus==="live"?"var(--sage-lo)":"var(--faint)",
              color:       dataStatus==="live"?"var(--sage)":"var(--txt-dim)"
            }}>
              <div className="live-dot" style={{background:dataStatus==="live"?"var(--sage)":"var(--txt-dim)", animation:dataStatus==="live"?"blink 1.4s infinite":"none"}}/>
              {dataStatus==="live"?"LIVE":"STATIC"}
            </div>
            {dataStatus==="static" && (
              <div style={{fontSize:9,color:'var(--txt-faint)',fontFamily:'var(--font-mono)',letterSpacing:'0.05em'}}>DATA: FEB 2026</div>
            )}
            <div className="clock">{time.toUTCString().slice(0,25)}</div>
          </div>
        </div>

        <div className="workspace">
          {tab==="dashboard" && <DashboardTab liveYieldCurve={liveYieldCurve} setLiveYieldCurve={handleLiveData}/>}
          {tab==="credit"    && <CreditTab liveYieldCurve={liveYieldCurve}/>}
          {tab==="bonds"     && <BondTab liveYieldCurve={liveYieldCurve}/>}
          {tab==="portfolio" && <PortfolioTab liveYieldCurve={liveYieldCurve}/>}
        </div>
      </div>
    </>
  );
}
