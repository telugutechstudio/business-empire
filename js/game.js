'use strict';
/* =====================================================================
   BUSINESS EMPIRE — idle business game
   ===================================================================== */

const SAVE_KEY = 'tycoonEmpire.save.v1';
let S = null; // game state, initialised below
const SUF = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'UDc', 'DDc', 'TDc', 'QaDc', 'QiDc', 'SxDc', 'SpDc', 'OcDc', 'NoDc', 'Vg', 'UVg', 'DVg', 'TVg', 'QaVg', 'QiVg', 'SxVg', 'SpVg', 'OcVg', 'NoVg', 'Tg'];

/* ---------------------------- DATA ---------------------------------- */
const BUSINESSES = [
  { id: 'tea',     name: 'Tea Stall',      icon: '🍵', baseCost: 4,           costMult: 1.07, time: 0.6,   revenue: 1,           managerCost: 1e3,    manager: 'Chai Charlie' },
  { id: 'truck',   name: 'Food Truck',     icon: '🚚', baseCost: 60,          costMult: 1.15, time: 3,     revenue: 60,          managerCost: 15e3,   manager: 'Taco Tina' },
  { id: 'coffee',  name: 'Coffee Shop',    icon: '☕', baseCost: 720,         costMult: 1.14, time: 6,     revenue: 540,         managerCost: 1e5,    manager: 'Barista Bob' },
  { id: 'bakery',  name: 'Bakery',         icon: '🥐', baseCost: 8640,        costMult: 1.13, time: 12,    revenue: 4320,        managerCost: 5e5,    manager: 'Baker Bella' },
  { id: 'gym',     name: 'Fitness Gym',    icon: '🏋️', baseCost: 103680,      costMult: 1.12, time: 24,    revenue: 51840,       managerCost: 1.2e6,  manager: 'Coach Max' },
  { id: 'hotel',   name: 'Hotel Chain',    icon: '🏨', baseCost: 1244160,     costMult: 1.11, time: 96,    revenue: 622080,      managerCost: 1e7,    manager: 'Concierge Clara' },
  { id: 'tech',    name: 'Tech Startup',   icon: '💻', baseCost: 14929920,    costMult: 1.10, time: 384,   revenue: 7464960,     managerCost: 1.11e8, manager: 'Hacker Hiro' },
  { id: 'studio',  name: 'Film Studio',    icon: '🎬', baseCost: 179159040,   costMult: 1.09, time: 1536,  revenue: 89579520,    managerCost: 5.55e8, manager: 'Director Dev' },
  { id: 'airline', name: 'Airline',        icon: '✈️', baseCost: 2149908480,  costMult: 1.08, time: 6144,  revenue: 1074954240,  managerCost: 1e10,   manager: 'Captain Ava' },
  { id: 'space',   name: 'Space Agency',   icon: '🚀', baseCost: 25798901760, costMult: 1.07, time: 36864, revenue: 29668737024, managerCost: 1e11,   manager: 'Commander Zed' },
];

// Per-business level milestones
const MILESTONES = [
  { lvl: 10,   type: 'profit', mult: 2 },
  { lvl: 25,   type: 'speed',  mult: 2 },
  { lvl: 50,   type: 'speed',  mult: 2 },
  { lvl: 100,  type: 'speed',  mult: 2 },
  { lvl: 150,  type: 'profit', mult: 3 },
  { lvl: 200,  type: 'speed',  mult: 2 },
  { lvl: 250,  type: 'profit', mult: 3 },
  { lvl: 300,  type: 'speed',  mult: 2 },
  { lvl: 350,  type: 'profit', mult: 3 },
  { lvl: 400,  type: 'speed',  mult: 2 },
  { lvl: 500,  type: 'profit', mult: 4 },
  { lvl: 600,  type: 'profit', mult: 4 },
  { lvl: 750,  type: 'profit', mult: 5 },
  { lvl: 1000, type: 'profit', mult: 10 },
];
// When EVERY business reaches this level, all profits x2
const GLOBAL_MILESTONES = [10, 25, 50, 100, 200, 300, 400, 500, 750, 1000];

const UPGRADE_TIERS = ['Marketing Blitz', 'Premium Supplies', 'Franchise Deal', 'Celebrity Endorsement', 'Global Expansion', 'AI Automation', 'Total Monopoly'];
const UPGRADES = (() => {
  const list = [];
  UPGRADE_TIERS.forEach((tier, t) => {
    BUSINESSES.forEach((b, i) => list.push({
      id: `u${t}_${b.id}`, name: `${b.name}: ${tier}`, target: i, mult: 3,
      cost: 2.5e5 * Math.pow(12, i) * Math.pow(1e8, t), icon: b.icon,
    }));
    list.push({ id: `u${t}_all`, name: `Empire-wide ${tier}`, target: -1, mult: 3,
      cost: 2.5e5 * Math.pow(12, 10) * Math.pow(1e8, t), icon: '🌐' });
  });
  return list.sort((a, b) => a.cost - b.cost);
})();

const INVESTOR_UPGRADES = [
  { id: 'seed',   name: 'Seed Capital',        desc: 'Start every new run with 25K cash',          cost: 50,    type: 'start', value: 25e3, icon: '🌱' },
  { id: 'angel',  name: 'Angel Round',         desc: 'All profits x3',                         cost: 150,   type: 'profit', mult: 3, icon: '😇' },
  { id: 'logi',   name: 'Faster Logistics',    desc: 'All businesses run 2x faster',           cost: 600,   type: 'speed', mult: 2, icon: '📦' },
  { id: 'seriesA',name: 'Series A',            desc: 'All profits x3',                         cost: 3000,  type: 'profit', mult: 3, icon: '📈' },
  { id: 'rel',    name: 'Investor Relations',  desc: 'Each investor gives +3% (was +2%)',      cost: 12000, type: 'rate', value: 0.03, icon: '🤝' },
  { id: 'seriesB',name: 'Series B',            desc: 'All profits x5',                         cost: 6e4,   type: 'profit', mult: 5, icon: '🏦' },
  { id: 'express',name: 'Express Everything',  desc: 'All businesses run 2x faster',           cost: 3e5,   type: 'speed', mult: 2, icon: '🚄' },
  { id: 'board',  name: 'Visionary Board',     desc: 'Each investor gives +5%',                cost: 2e6,   type: 'rate', value: 0.05, icon: '🧠' },
  { id: 'ipo',    name: 'IPO',                 desc: 'All profits x10',                        cost: 1e7,   type: 'profit', mult: 10, icon: '🔔' },
  { id: 'empire', name: 'Global Conglomerate', desc: 'All profits x25',                        cost: 1e9,   type: 'profit', mult: 25, icon: '🌍' },
];

const GEM_SHOP = [
  { id: 'rush',    icon: '⚡', name: 'Profit Rush',      desc: 'x2 all profits for 15 minutes (stacks time)', cost: 10 },
  { id: 'warp1',   icon: '⏩', name: 'Time Warp: 1 Hour', desc: 'Instantly earn 1 hour of income',            cost: 20 },
  { id: 'warp24',  icon: '🕰️', name: 'Time Warp: 1 Day',  desc: 'Instantly earn 24 hours of income',          cost: 200 },
  { id: 'golden',  icon: '👑', name: 'Golden Touch',     desc: 'PERMANENT x2 all profits (max 3)',           cost: [100, 300, 900] },
  { id: 'offline', icon: '🌙', name: 'Night Shift',      desc: 'Offline earnings cap: 2h → 8h → 24h',        cost: [40, 120] },
];
const OFFLINE_CAPS = [2 * 3600, 8 * 3600, 24 * 3600];

const ACHIEVEMENTS = (() => {
  const list = [];
  const titles = ['Owner', 'Mogul', 'Baron', 'Magnate', 'Legend'];
  BUSINESSES.forEach((b, i) => [25, 100, 250, 500, 1000].forEach((n, k) => list.push({
    id: `own_${b.id}_${n}`, icon: b.icon, name: `${b.name} ${titles[k]}`, desc: `Own ${n} ${b.name}s`,
    gems: [2, 3, 5, 8, 15][k], test: () => S.biz[i].owned >= n,
  })));
  [[1e3, 'First Grand'], [1e6, 'Millionaire'], [1e9, 'Billionaire'], [1e12, 'Trillionaire'], [1e15, 'Quadrillionaire'],
   [1e18, 'Quintillionaire'], [1e24, 'Septillionaire'], [1e30, 'Nonillionaire'], [1e40, 'Off the Charts'], [1e60, 'Infinite Wealth']]
    .forEach(([n, name], k) => list.push({ id: `earn_${k}`, icon: '💰', name, desc: `Earn ${money(n)} lifetime`, gems: 3 + k * 2, test: () => S.lifetime >= n }));
  [1, 5, 10].forEach(n => list.push({ id: `mgr_${n}`, icon: '🤵', name: `Hiring Spree ${n}`, desc: `Have ${n} managers`, gems: n === 10 ? 10 : 3, test: () => S.biz.filter(b => b.manager).length >= n }));
  [1, 3, 10, 25].forEach(n => list.push({ id: `pre_${n}`, icon: '👔', name: `Fresh Start x${n}`, desc: `Restart with investors ${n} time(s)`, gems: 5 + n, test: () => S.stats.prestiges >= n }));
  [1, 10, 50].forEach(n => list.push({ id: `case_${n}`, icon: '💼', name: `Briefcase Hunter ${n}`, desc: `Open ${n} golden briefcases`, gems: n === 1 ? 2 : 5, test: () => S.stats.briefcases >= n }));
  [100, 1000, 5000].forEach(n => list.push({ id: `click_${n}`, icon: '👆', name: `Hands-On ${n}`, desc: `Run businesses by hand ${n} times`, gems: 3, test: () => S.stats.clicks >= n }));
  [5, 25, 100].forEach(n => list.push({ id: `mis_${n}`, icon: '📋', name: `Go-Getter ${n}`, desc: `Complete ${n} missions`, gems: n === 100 ? 20 : 5, test: () => S.stats.missionsDone >= n }));
  [7, 30].forEach(n => list.push({ id: `daily_${n}`, icon: '🎁', name: `Loyal Boss ${n}`, desc: `Claim ${n} daily rewards`, gems: n === 30 ? 20 : 7, test: () => (S.stats.dailyClaims || 0) >= n }));
  [10, 25, 50].forEach(n => list.push({ id: `upg_${n}`, icon: '⬆️', name: `Upgrader ${n}`, desc: `Buy ${n} upgrades`, gems: 5, test: () => S.stats.upgradesBought >= n }));
  return list;
})();

const HEADLINES = [
  'Local tea stall owner refuses to share secret masala recipe.',
  'Economists baffled as one mogul buys every coffee shop in town.',
  'Breaking: Food trucks now outnumber parking spots 3 to 1.',
  'Gym membership surge linked to aggressive marketing. And protein croissants.',
  'Hotel guests report "suspiciously efficient" concierge service.',
  'Tech startup pivots to blockchain-powered AI-driven tea delivery.',
  'Film studio announces sequel to a movie nobody has seen yet.',
  'Airline introduces premium seats with extra legroom… for your bag.',
  'Space Agency confirms Moon is "a great location for a tea stall".',
  'Rumor: golden briefcases spotted around the city. Keep your eyes open!',
  'Investors say: "Restarting with more capital is a power move."',
  'Managers union demands more coffee. Request approved instantly.',
];

/* ---------------------------- STATE --------------------------------- */
function newRun(startCash = 0) {
  return {
    cash: startCash,
    runEarnings: 0,
    biz: BUSINESSES.map((b, i) => ({ owned: i === 0 ? 1 : 0, progress: 0, running: false, manager: false })),
    upgrades: {},
  };
}
function defaultState() {
  return Object.assign(newRun(), {
    version: 1,
    lifetime: 0,
    investors: 0,
    investorsTotal: 0,
    investorUpgrades: {},
    gems: 0,
    gemGolden: 0,
    offlineLvl: 0,
    achievements: {},
    daily: { last: '', streak: 0 },
    missions: [],
    stats: { clicks: 0, briefcases: 0, prestiges: 0, upgradesBought: 0, playTime: 0, bestRun: 0, missionsDone: 0 },
    boosts: { hype: 0, hypeCd: 0, rush: 0, golden: 0 },
    settings: { sound: true, notation: 'suffix', buyMode: '1' },
    lastSave: Date.now(),
    created: Date.now(),
  });
}

S = defaultState();
let marketEvent = null; // { biz, remaining }
let nextEventIn = rand(150, 300);
let nextCaseIn = rand(40, 100);
let caseLife = 0;
let activeTab = 'business';
let pendingOffline = 0;

function load() {
  let raw = null;
  try { raw = localStorage.getItem(SAVE_KEY); } catch (e) { /* storage blocked */ }
  if (!raw) return false;
  try { S = mergeState(JSON.parse(raw)); return true; } catch (e) { console.warn('Bad save', e); return false; }
}
function mergeState(saved) {
  const d = defaultState();
  const out = Object.assign(d, saved);
  out.stats = Object.assign(defaultState().stats, saved.stats || {});
  out.boosts = Object.assign(defaultState().boosts, saved.boosts || {});
  out.settings = Object.assign(defaultState().settings, saved.settings || {});
  out.biz = BUSINESSES.map((b, i) => Object.assign({ owned: i === 0 ? 1 : 0, progress: 0, running: false, manager: false }, (saved.biz || [])[i] || {}));
  out.upgrades = saved.upgrades || {};
  out.investorUpgrades = saved.investorUpgrades || {};
  out.achievements = saved.achievements || {};
  out.daily = Object.assign({ last: '', streak: 0 }, saved.daily || {});
  out.missions = Array.isArray(saved.missions) ? saved.missions : [];
  return out;
}
function save() {
  S.lastSave = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* storage blocked */ }
}

/* ---------------------------- HELPERS ------------------------------- */
function rand(a, b) { return a + Math.random() * (b - a); }

function fmt(n) {
  if (!isFinite(n)) return '∞';
  if (n < 0) return '-' + fmt(-n);
  if (n < 1000) return Number.isInteger(n) ? String(n) : (n < 100 ? n.toFixed(2) : n.toFixed(1));
  if (S && S.settings && S.settings.notation === 'sci') return n.toExponential(2).replace('e+', 'e');
  let e = Math.floor(Math.log10(n) / 3);
  if (e >= SUF.length) return n.toExponential(2).replace('e+', 'e');
  let v = n / Math.pow(1000, e);
  if (v >= 999.995) { e++; v /= 1000; if (e >= SUF.length) return n.toExponential(2).replace('e+', 'e'); }
  return v.toFixed(v < 100 ? 2 : 1) + ' ' + SUF[e];
}
function money(n) { return fmt(n); }
function fmtInt(n) { return n < 1e6 ? Math.floor(n).toLocaleString('en-US') : fmt(n); }
function fmtClock(s) {
  if (!isFinite(s)) return '--';
  if (s < 1) return s.toFixed(2) + 's';
  s = Math.ceil(s);
  const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
  const pad = x => String(x).padStart(2, '0');
  return (d ? d + 'd ' : '') + pad(h) + ':' + pad(m) + ':' + pad(sec);
}
function fmtDur(s) {
  s = Math.floor(s);
  if (s < 60) return s + 's';
  if (s < 3600) return Math.floor(s / 60) + 'm ' + (s % 60) + 's';
  if (s < 86400) return Math.floor(s / 3600) + 'h ' + Math.floor(s % 3600 / 60) + 'm';
  return Math.floor(s / 86400) + 'd ' + Math.floor(s % 86400 / 3600) + 'h';
}
const $ = id => document.getElementById(id);
function setHTML(el, html) { if (el._html !== html) { el._html = html; el.innerHTML = html; } }

/* ---------------------------- SOUND --------------------------------- */
let actx = null;
function sfx(kind) {
  if (!S.settings.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const notes = { click: [520, .05], buy: [740, .07], err: [180, .12], cash: [880, .06], big: [660, .25], case: [990, .2] }[kind] || [440, .05];
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = kind === 'err' ? 'sawtooth' : 'triangle';
    o.frequency.setValueAtTime(notes[0], actx.currentTime);
    if (kind === 'big' || kind === 'case') o.frequency.exponentialRampToValueAtTime(notes[0] * 2, actx.currentTime + notes[1]);
    g.gain.setValueAtTime(0.08, actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + notes[1]);
    o.connect(g).connect(actx.destination);
    o.start(); o.stop(actx.currentTime + notes[1]);
  } catch (e) { /* audio unavailable */ }
}

/* ---------------------------- ECONOMY ------------------------------- */
function investorRate() {
  let r = 0.02;
  for (const u of INVESTOR_UPGRADES) if (u.type === 'rate' && S.investorUpgrades[u.id]) r = Math.max(r, u.value);
  return r;
}
function minOwned() { return Math.min(...S.biz.map(b => b.owned)); }

function globalMult(temp = true) {
  let m = 1 + S.investors * investorRate();
  for (const u of UPGRADES) if (u.target === -1 && S.upgrades[u.id]) m *= u.mult;
  for (const u of INVESTOR_UPGRADES) if (u.type === 'profit' && S.investorUpgrades[u.id]) m *= u.mult;
  m *= Math.pow(2, S.gemGolden);
  const lo = minOwned();
  for (const g of GLOBAL_MILESTONES) if (lo >= g) m *= 2;
  if (temp) {
    if (S.boosts.hype > 0) m *= 2;
    if (S.boosts.rush > 0) m *= 2;
    if (S.boosts.golden > 0) m *= 5;
  }
  return m;
}
function bizMult(i, temp = true) {
  let m = 1;
  const lvl = S.biz[i].owned;
  for (const ms of MILESTONES) if (ms.type === 'profit' && lvl >= ms.lvl) m *= ms.mult;
  for (const u of UPGRADES) if (u.target === i && S.upgrades[u.id]) m *= u.mult;
  if (temp && marketEvent && marketEvent.biz === i) m *= 3;
  return m;
}
function speedMult(i) {
  let m = 1;
  const lvl = S.biz[i].owned;
  for (const ms of MILESTONES) if (ms.type === 'speed' && lvl >= ms.lvl) m *= ms.mult;
  for (const u of INVESTOR_UPGRADES) if (u.type === 'speed' && S.investorUpgrades[u.id]) m *= u.mult;
  return m;
}
function cycleTime(i) { return BUSINESSES[i].time / speedMult(i); }
function cycleRevenue(i, temp = true) { return BUSINESSES[i].revenue * S.biz[i].owned * bizMult(i, temp) * globalMult(temp); }
function incomePerSec(managedOnly = true, temp = true) {
  let t = 0;
  S.biz.forEach((b, i) => { if (b.owned > 0 && (b.manager || !managedOnly)) t += cycleRevenue(i, temp) / cycleTime(i); });
  return t;
}
function earn(x) { S.cash += x; S.runEarnings += x; S.lifetime += x; }

function costFor(i, n) {
  const d = BUSINESSES[i], r = d.costMult;
  return d.baseCost * Math.pow(r, S.biz[i].owned) * (Math.pow(r, n) - 1) / (r - 1);
}
function maxAffordable(i) {
  const d = BUSINESSES[i], r = d.costMult;
  const c0 = d.baseCost * Math.pow(r, S.biz[i].owned);
  if (S.cash < c0) return 0;
  let n = Math.floor(Math.log(S.cash * (r - 1) / c0 + 1) / Math.log(r));
  while (n > 0 && costFor(i, n) > S.cash) n--;
  return n;
}
function nextMilestone(lvl) { return MILESTONES.find(m => m.lvl > lvl) || null; }
function buyAmount(i) {
  const owned = S.biz[i].owned;
  if (owned === 0) return 1;
  switch (S.settings.buyMode) {
    case '10': return 10;
    case '100': return 100;
    case 'next': { const m = nextMilestone(owned); return m ? m.lvl - owned : 1; }
    case 'max': return Math.max(1, maxAffordable(i));
    default: return 1;
  }
}

function investorsAvailable() {
  const total = Math.floor(150 * Math.sqrt(S.lifetime / 1e13));
  return Math.max(0, total - S.investorsTotal);
}

/* ---------------------------- ACTIONS ------------------------------- */
function runBiz(i) {
  const b = S.biz[i];
  if (b.owned === 0 || b.running) return;
  b.running = true;
  S.stats.clicks++;
  sfx('click');
}
function buyBiz(i) {
  const n = buyAmount(i), c = costFor(i, n);
  if (S.cash < c) { sfx('err'); return; }
  const before = S.biz[i].owned, minBefore = minOwned();
  S.cash -= c;
  S.biz[i].owned += n;
  sfx('buy');
  for (const m of MILESTONES) {
    if (before < m.lvl && S.biz[i].owned >= m.lvl) {
      toast(`${BUSINESSES[i].icon} ${BUSINESSES[i].name} hit ${m.lvl}! ${m.type === 'speed' ? '⚡ Speed' : '💰 Profit'} x${m.mult}`, 'good');
      sfx('big');
    }
  }
  const minAfter = minOwned();
  for (const g of GLOBAL_MILESTONES) if (minBefore < g && minAfter >= g) toast(`🌐 All businesses reached ${g}! All profits x2`, 'good');
  if (before === 0) toast(`🎉 Unlocked ${BUSINESSES[i].icon} ${BUSINESSES[i].name}! Click it to earn.`, 'good');
}
function hireManager(i) {
  const d = BUSINESSES[i], b = S.biz[i];
  if (b.manager || b.owned === 0 || S.cash < d.managerCost) { sfx('err'); return; }
  S.cash -= d.managerCost;
  b.manager = true; b.running = true;
  sfx('big');
  toast(`🤵 ${d.manager} now runs your ${d.name}!`, 'good');
}
function buyUpgrade(id, quiet) {
  const u = UPGRADES.find(x => x.id === id);
  if (!u || S.upgrades[id] || S.cash < u.cost) { if (!quiet) sfx('err'); return false; }
  S.cash -= u.cost;
  S.upgrades[id] = true;
  S.stats.upgradesBought++;
  if (!quiet) { sfx('buy'); toast(`${u.icon} ${u.name} — x${u.mult} profit!`, 'good'); }
  return true;
}
function buyAllUpgrades() {
  let n = 0;
  for (const u of UPGRADES) if (!S.upgrades[u.id] && S.cash >= u.cost) { if (buyUpgrade(u.id, true)) n++; }
  if (n) { sfx('big'); toast(`⬆️ Bought ${n} upgrade${n > 1 ? 's' : ''}!`, 'good'); } else sfx('err');
}
function buyInvestorUpgrade(id) {
  const u = INVESTOR_UPGRADES.find(x => x.id === id);
  if (!u || S.investorUpgrades[id] || S.investors < u.cost) { sfx('err'); return; }
  modal(`<div class="big-ico">${u.icon}</div><h3>${u.name}</h3>
    <p>${u.desc}.<br>This spends <b>${fmtInt(u.cost)}</b> investors, lowering your investor bonus by <b>${fmt(u.cost * investorRate() * 100)}%</b>. Upgrades are permanent.</p>
    <div class="modal-actions"><button class="btn ghost" data-act="close">Cancel</button><button class="btn purple" data-act="invup-ok" data-id="${id}">Buy it</button></div>`);
}
function confirmInvestorUpgrade(id) {
  const u = INVESTOR_UPGRADES.find(x => x.id === id);
  if (!u || S.investors < u.cost) return;
  S.investors -= u.cost;
  S.investorUpgrades[id] = true;
  sfx('big');
  toast(`${u.icon} ${u.name} acquired!`, 'good');
}
function prestigeAsk() {
  const n = investorsAvailable();
  if (n < 1) { sfx('err'); toast('Earn more to attract investors.', 'bad'); return; }
  const newBonus = (S.investors + n) * investorRate() * 100;
  modal(`<div class="big-ico">👔</div><h3>Sell your empire?</h3>
    <p>You will gain <b>${fmtInt(n)}</b> investors, bringing your profit bonus to <b>+${fmt(newBonus)}%</b>.</p>
    <p>Your cash, businesses, managers and cash upgrades reset. Investors, investor upgrades, gems and awards are kept.</p>
    <div class="modal-actions"><button class="btn ghost" data-act="close">Not yet</button><button class="btn gold" data-act="prestige-ok">Restart with investors</button></div>`);
}
function prestige() {
  const n = investorsAvailable();
  if (n < 1) return;
  S.stats.bestRun = Math.max(S.stats.bestRun, S.runEarnings);
  S.investors += n;
  S.investorsTotal += n;
  S.stats.prestiges++;
  let start = 0;
  for (const u of INVESTOR_UPGRADES) if (u.type === 'start' && S.investorUpgrades[u.id]) start += u.value;
  Object.assign(S, newRun(start));
  marketEvent = null;
  sfx('big');
  toast(`👔 ${fmtInt(n)} investors joined your empire!`, 'good');
  buildBizCards();
  switchTab('business');
  save();
}
function hype() {
  if (S.boosts.hypeCd > 0) return;
  S.boosts.hype = 120;
  S.boosts.hypeCd = 600;
  sfx('big');
  toast('📣 Hype campaign launched! x2 profits for 2 minutes.', 'good');
}
function buyGem(id) {
  const item = GEM_SHOP.find(g => g.id === id);
  const cost = gemCost(item);
  if (cost == null || S.gems < cost) { sfx('err'); return; }
  S.gems -= cost;
  switch (id) {
    case 'rush': S.boosts.rush += 900; toast('⚡ Profit Rush! x2 for 15 minutes.', 'gem'); break;
    case 'warp1': case 'warp24': {
      const secs = id === 'warp1' ? 3600 : 86400;
      const amt = incomePerSec(false, false) * secs;
      earn(amt); toast(`⏩ Time warped! +${money(amt)}`, 'gem'); break;
    }
    case 'golden': S.gemGolden++; toast('👑 Golden Touch! Permanent x2 profits.', 'gem'); break;
    case 'offline': S.offlineLvl++; toast(`🌙 Offline cap is now ${fmtDur(OFFLINE_CAPS[S.offlineLvl])}.`, 'gem'); break;
  }
  sfx('big');
}
function gemCost(item) {
  if (item.id === 'golden') return S.gemGolden < 3 ? item.cost[S.gemGolden] : null;
  if (item.id === 'offline') return S.offlineLvl < 2 ? item.cost[S.offlineLvl] : null;
  return item.cost;
}

/* ---------------------------- BRIEFCASE & EVENTS -------------------- */
function spawnBriefcase() {
  const el = $('briefcase');
  const w = window.innerWidth, h = window.innerHeight;
  el.style.left = rand(20, Math.max(30, w - 80)) + 'px';
  el.style.top = rand(120, Math.max(130, h - 200)) + 'px';
  el.classList.remove('hidden');
  caseLife = 12;
}
function openBriefcase() {
  $('briefcase').classList.add('hidden');
  caseLife = 0;
  S.stats.briefcases++;
  sfx('case');
  const r = Math.random();
  if (r < 0.12) { S.gems += 3; toast('💼 The briefcase held 💎 3 gems!', 'gem'); }
  else if (r < 0.45) { S.boosts.golden = 30; toast('💼 Golden Rush! x5 profits for 30 seconds!', 'gem'); }
  else {
    const amt = Math.max(50, incomePerSec(false) * 120, S.cash * 0.15);
    earn(amt);
    toast(`💼 Found ${money(amt)} inside!`, 'gem');
  }
}
function startMarketEvent() {
  const owned = S.biz.map((b, i) => b.owned > 0 ? i : -1).filter(i => i >= 0);
  if (!owned.length) return;
  const i = owned[Math.floor(Math.random() * owned.length)];
  marketEvent = { biz: i, remaining: 60 };
  toast(`📈 Market boom! ${BUSINESSES[i].icon} ${BUSINESSES[i].name} profits x3 for 60s`, 'good');
  setHeadline(`MARKET BOOM: Demand for ${BUSINESSES[i].name}s skyrockets — profits tripled!`);
}

/* ---------------------------- ACHIEVEMENTS -------------------------- */
function checkAchievements() {
  for (const a of ACHIEVEMENTS) {
    if (!S.achievements[a.id] && a.test()) {
      S.achievements[a.id] = Date.now();
      S.gems += a.gems;
      toast(`🏆 ${a.name} unlocked! +${a.gems} 💎`, 'gem');
      sfx('cash');
      if (activeTab === 'awards') renderTab();
    }
  }
}

/* ---------------------------- DAILY REWARD -------------------------- */
const DAILY_REWARDS = [
  { icon: '💎', label: '5 Gems',            give: () => { S.gems += 5; } },
  { icon: '💰', label: '10 min income',     give: () => earn(bonusCash(600)) },
  { icon: '💎', label: '10 Gems',           give: () => { S.gems += 10; } },
  { icon: '⚡', label: 'Profit Rush 15m',   give: () => { S.boosts.rush += 900; } },
  { icon: '💎', label: '15 Gems',           give: () => { S.gems += 15; } },
  { icon: '💰', label: '1 hour income',     give: () => earn(bonusCash(3600)) },
  { icon: '👑', label: '30 Gems + x5 Rush', give: () => { S.gems += 30; S.boosts.golden += 60; } },
];
function bonusCash(secs) { return Math.max(500, incomePerSec(false, false) * secs); }
function dayKey(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
function canClaimDaily() { return S.daily.last !== dayKey(); }
function dailyNextDay() { return S.daily.last === dayKey(-1) ? S.daily.streak % 7 + 1 : 1; }
function dailyHtml() {
  const claimable = canClaimDaily();
  const today = claimable ? dailyNextDay() : S.daily.streak;
  const boxes = DAILY_REWARDS.map((r, k) => {
    const day = k + 1;
    const cls = (day < today || (!claimable && day === today)) ? 'claimed' : day === today ? 'today' : '';
    return `<div class="day ${cls}"><small>Day ${day}</small><span>${r.icon}</span><em>${r.label}</em></div>`;
  }).join('');
  return `<div class="big-ico">🎁</div><h3>Daily Reward</h3>
    <p>${claimable ? `Day ${today} reward is ready! Come back every day — missing a day restarts from Day 1.`
      : `Already claimed today. Come back tomorrow for Day ${S.daily.streak % 7 + 1}!`}</p>
    <div class="daily-grid">${boxes}</div>
    <div class="modal-actions">${claimable ? '<button class="btn gold" data-act="daily-claim">🎁 Claim!</button>' : '<button class="btn ghost" data-act="close">Close</button>'}</div>`;
}
function claimDaily() {
  if (!canClaimDaily()) return;
  const day = dailyNextDay();
  DAILY_REWARDS[day - 1].give();
  S.daily = { last: dayKey(), streak: day };
  S.stats.dailyClaims = (S.stats.dailyClaims || 0) + 1;
  sfx('big');
  toast(`🎁 Day ${day} reward: ${DAILY_REWARDS[day - 1].label}!`, 'gem');
  save();
}

/* ---------------------------- MISSIONS ------------------------------ */
const MISSION_SLOTS = 3;
function niceNum(x) { const p = Math.pow(10, Math.floor(Math.log10(x))); return Math.ceil(x / p) * p; }
function missionValue(m) {
  switch (m.type) {
    case 'own': return S.biz[m.biz].owned;
    case 'unlock': return S.biz[m.biz].owned > 0 ? 1 : 0;
    case 'hire': return S.biz[m.biz].manager ? 1 : 0;
    case 'earn': return S.lifetime - m.base;
    case 'click': return S.stats.clicks - m.base;
    case 'case': return S.stats.briefcases - m.base;
    case 'upgrade': return S.stats.upgradesBought - m.base;
  }
  return 0;
}
function missionText(m) {
  const d = BUSINESSES[m.biz] || {};
  switch (m.type) {
    case 'own': return { icon: d.icon, text: `Own ${m.target} ${d.name}s` };
    case 'unlock': return { icon: d.icon, text: `Unlock the ${d.name}` };
    case 'hire': return { icon: '🤵', text: `Hire ${d.manager} for your ${d.name}` };
    case 'earn': return { icon: '💰', text: `Earn ${money(m.target)} cash` };
    case 'click': return { icon: '👆', text: `Run businesses by hand ${m.target} times` };
    case 'case': return { icon: '💼', text: 'Open a golden briefcase' };
    case 'upgrade': return { icon: '⬆️', text: `Buy ${m.target} upgrades` };
  }
  return { icon: '📋', text: 'Mission' };
}
function newMission() {
  const key = m => m.type + (m.biz ?? '');
  const taken = new Set(S.missions.map(key));
  const owned = S.biz.map((b, i) => b.owned > 0 ? i : -1).filter(i => i >= 0);
  const opts = owned.map(i => {
    const o = S.biz[i].owned;
    return { type: 'own', biz: i, target: Math.ceil((o + Math.max(5, o * 0.2)) / 5) * 5 };
  });
  const locked = S.biz.findIndex(b => b.owned === 0);
  if (locked >= 0) opts.push({ type: 'unlock', biz: locked, target: 1 });
  const unmanaged = owned.find(i => !S.biz[i].manager);
  if (unmanaged !== undefined) opts.push({ type: 'hire', biz: unmanaged, target: 1 });
  opts.push({ type: 'earn', target: niceNum(bonusCash(300)), base: S.lifetime });
  opts.push({ type: 'click', target: 25, base: S.stats.clicks });
  opts.push({ type: 'case', target: 1, base: S.stats.briefcases });
  if (S.runEarnings > 2e5) opts.push({ type: 'upgrade', target: 2, base: S.stats.upgradesBought });
  const fresh = opts.filter(o => !taken.has(key(o)));
  const pool = fresh.length ? fresh : opts;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  pick.gems = 2 + Math.floor(Math.random() * 3);
  pick.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  return pick;
}
function ensureMissions() { while (S.missions.length < MISSION_SLOTS) S.missions.push(newMission()); }
function replaceMission(k) { S.missions.splice(k, 1); S.missions.splice(k, 0, newMission()); }
function claimMission(id) {
  const k = S.missions.findIndex(m => m.id === id);
  if (k < 0) return;
  const m = S.missions[k];
  if (missionValue(m) < m.target) { sfx('err'); return; }
  const cash = bonusCash(120);
  S.gems += m.gems;
  earn(cash);
  S.stats.missionsDone++;
  replaceMission(k);
  sfx('big');
  toast(`📋 Mission complete! +${m.gems} 💎 +${money(cash)} cash`, 'gem');
}
function skipMission(id) {
  const k = S.missions.findIndex(m => m.id === id);
  if (k < 0 || S.gems < 2) { sfx('err'); return; }
  S.gems -= 2;
  replaceMission(k);
  sfx('click');
}
function checkMissions() {
  for (const m of S.missions) {
    if (!m.told && missionValue(m) >= m.target) {
      m.told = true;
      toast(`📋 Mission done: ${missionText(m).text}. Claim your reward!`, 'good');
      sfx('cash');
      if (activeTab === 'missions') renderTab();
    }
  }
}
function updateMissionProgress() {
  for (const m of S.missions) {
    const row = document.querySelector(`[data-mrow="${m.id}"]`);
    if (!row) continue;
    const v = Math.min(missionValue(m), m.target);
    if ((v >= m.target) !== (row.dataset.done === '1')) { renderTab(); return; }
    row.querySelector('.mbar div').style.width = (v / m.target * 100) + '%';
    row.querySelector('.mval').textContent = m.type === 'earn' ? `${money(v)} / ${money(m.target)}` : `${fmtInt(v)} / ${fmtInt(m.target)}`;
  }
}

/* ---------------------------- UI: BUSINESS CARDS -------------------- */
let cards = [];
function buildBizCards() {
  const list = $('bizList');
  list.innerHTML = BUSINESSES.map((d, i) => `
    <div class="biz" data-i="${i}">
      <button class="biz-icon" data-act="run" data-i="${i}" title="Run ${d.name}">
        <div class="ms"><div class="ms-fill"></div></div>
        <span class="emoji">${d.icon}</span><span class="lvl">0</span>
      </button>
      <div class="biz-body">
        <div class="biz-head"><span class="biz-name">${d.name}</span><span class="biz-tag"></span></div>
        <div class="bar" data-act="run" data-i="${i}"><div class="bar-fill"></div><span class="bar-text"></span></div>
        <div class="biz-actions">
          <button class="buy" data-act="buy" data-i="${i}"><span class="buy-n"></span><span class="buy-cost"></span></button>
          <div class="timer"></div>
        </div>
      </div>
    </div>`).join('');
  cards = [...list.children].map(el => ({
    el,
    fill: el.querySelector('.bar-fill'),
    bar: el.querySelector('.bar'),
    text: el.querySelector('.bar-text'),
    lvl: el.querySelector('.lvl'),
    ms: el.querySelector('.ms-fill'),
    tag: el.querySelector('.biz-tag'),
    buyBtn: el.querySelector('.buy'),
    buyN: el.querySelector('.buy-n'),
    buyCost: el.querySelector('.buy-cost'),
    timer: el.querySelector('.timer'),
  }));
  updateBizText();
}
function updateBizBars() {
  S.biz.forEach((b, i) => {
    const c = cards[i];
    const fast = b.owned > 0 && b.manager && cycleTime(i) < 0.15;
    c.bar.classList.toggle('fast', fast);
    if (!fast) c.fill.style.transform = `scaleX(${b.running ? Math.min(1, b.progress) : 0})`;
  });
}
function updateBizText() {
  S.biz.forEach((b, i) => {
    const c = cards[i], d = BUSINESSES[i];
    const locked = b.owned === 0;
    c.el.classList.toggle('locked', locked);
    c.el.classList.toggle('managed', b.manager);
    c.el.classList.toggle('idle', !locked && !b.manager && !b.running);
    c.el.classList.toggle('hot', !!marketEvent && marketEvent.biz === i);
    c.lvl.textContent = fmtInt(b.owned);
    const nm = nextMilestone(b.owned);
    const prevLvl = [...MILESTONES].reverse().find(m => m.lvl <= b.owned);
    const from = prevLvl ? prevLvl.lvl : 0;
    c.ms.style.width = nm ? ((b.owned - from) / (nm.lvl - from) * 100) + '%' : '100%';
    const n = buyAmount(i), cost = costFor(i, n);
    c.buyN.textContent = locked ? 'Unlock' : `Buy x${n}`;
    c.buyCost.textContent = money(cost);
    c.buyBtn.classList.toggle('cant', S.cash < cost);
    if (locked) { c.tag.textContent = '🔒 Locked'; return; }
    const ct = cycleTime(i), rev = cycleRevenue(i);
    c.tag.textContent = nm ? `Next @${nm.lvl}: ${nm.type === 'speed' ? '⚡' : '💰'}x${nm.mult}` : '⭐ Maxed milestones';
    c.text.textContent = (b.manager && ct < 0.15) ? money(rev / ct) + ' /s' : money(rev);
    c.timer.textContent = b.manager ? (ct < 0.15 ? '🤖 auto' : fmtClock(ct * (1 - b.progress)))
      : b.running ? fmtClock(ct * (1 - b.progress)) : fmtClock(ct);
  });
}
function floatText(i, txt) {
  const c = cards[i];
  if (!c || activeTab !== 'business') return;
  const f = document.createElement('span');
  f.className = 'float';
  f.textContent = '+' + txt;
  f.style.left = rand(45, 70) + '%';
  f.style.top = '34px';
  c.el.appendChild(f);
  setTimeout(() => f.remove(), 1000);
}

/* ---------------------------- UI: TABS ------------------------------ */
function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab').forEach(s => s.classList.toggle('active', s.id === 'tab-' + tab));
  $('main').scrollTop = 0;
  renderTab();
}
function renderTab() {
  const fn = { missions: renderMissions, managers: renderManagers, upgrades: renderUpgrades, investors: renderInvestors, shop: renderShop,
    awards: renderAwards, stats: renderStats, settings: renderSettings }[activeTab];
  if (fn) $('tab-' + activeTab).innerHTML = fn();
  refreshAffordability();
}

function renderMissions() {
  const rows = S.missions.map(m => {
    const t = missionText(m), v = Math.min(missionValue(m), m.target), done = v >= m.target;
    const val = m.type === 'earn' ? `${money(v)} / ${money(m.target)}` : `${fmtInt(v)} / ${fmtInt(m.target)}`;
    return `<div class="row mission ${done ? 'ready' : ''}" data-mrow="${m.id}" data-done="${done ? 1 : 0}">
      <div class="ico">${t.icon}</div>
      <div class="info"><div class="title">${t.text}</div>
        <div class="mbar"><div style="width:${v / m.target * 100}%"></div></div>
        <div class="desc"><span class="mval">${val}</span> · Reward: 💎${m.gems} + 2 min income</div></div>
      ${done ? `<button class="btn gold" data-act="mclaim" data-id="${m.id}">Claim</button>`
        : `<button class="btn ghost" data-act="mskip" data-id="${m.id}" data-gems="2" title="Swap for a new mission">Skip 💎2</button>`}
    </div>`;
  }).join('');
  return `<h2>📋 Missions</h2>
    <p class="sub">Finish missions to win gems and cash. A new mission appears as soon as you claim one. Completed so far: <b>${fmtInt(S.stats.missionsDone)}</b></p>
    <div class="list">${rows}</div>`;
}
function renderManagers() {
  const rows = BUSINESSES.map((d, i) => {
    const b = S.biz[i];
    if (b.manager) return `<div class="row done"><div class="ico">${d.icon}</div><div class="info"><div class="title">${d.manager}</div><div class="desc">Running your ${d.name}</div></div><span class="badge">✔ Hired</span></div>`;
    const lockedNote = b.owned === 0 ? `<div class="desc">Unlock ${d.name} first</div>` : `<div class="desc">Automatically runs ${d.name} forever — even while you're away</div>`;
    return `<div class="row"><div class="ico">${d.icon}</div><div class="info"><div class="title">${d.manager}</div>${lockedNote}</div>
      <button class="btn" data-act="hire" data-i="${i}" data-cost="${d.managerCost}" ${b.owned === 0 ? 'disabled' : ''}>Hire ${money(d.managerCost)}</button></div>`;
  }).join('');
  return `<h2>🤵 Managers</h2><p class="sub">Managers run a business automatically and keep earning while you're offline.</p><div class="list">${rows}</div>`;
}
function renderUpgrades() {
  const left = UPGRADES.filter(u => !S.upgrades[u.id]);
  const shown = left.slice(0, 25);
  const rows = shown.map(u => `<div class="row"><div class="ico">${u.icon}</div><div class="info"><div class="title">${u.name}</div>
      <div class="desc">${u.target === -1 ? 'All businesses' : BUSINESSES[u.target].name} profit x${u.mult}</div></div>
      <button class="btn gold" data-act="upgrade" data-id="${u.id}" data-cost="${u.cost}">${money(u.cost)}</button></div>`).join('');
  return `<h2>⬆️ Upgrades</h2>
    <div class="toolbar"><p class="sub" style="margin:0">Owned ${UPGRADES.length - left.length} / ${UPGRADES.length}. Each upgrade multiplies profits.</p>
    <button class="btn" data-act="upgrade-all">Buy all affordable</button></div>
    <div class="list">${rows || '<p class="sub">You own every upgrade. Legendary!</p>'}</div>`;
}
function renderInvestors() {
  const avail = investorsAvailable();
  const rate = investorRate();
  const rows = INVESTOR_UPGRADES.map(u => S.investorUpgrades[u.id]
    ? `<div class="row done"><div class="ico">${u.icon}</div><div class="info"><div class="title">${u.name}</div><div class="desc">${u.desc}</div></div><span class="badge">✔ Owned</span></div>`
    : `<div class="row"><div class="ico">${u.icon}</div><div class="info"><div class="title">${u.name}</div><div class="desc">${u.desc}</div></div>
       <button class="btn purple" data-act="invup" data-id="${u.id}" data-inv="${u.cost}">👔 ${fmtInt(u.cost)}</button></div>`).join('');
  return `<h2>👔 Investors</h2>
    <p class="sub">Investors join based on your lifetime earnings. Each one boosts ALL profits by +${Math.round(rate * 100)}%. Restart your empire to bring them on board.</p>
    <div class="hero">
      <div><div class="stat-big">${fmtInt(S.investors)}</div><div class="stat-lbl">Current investors (+${fmt(S.investors * rate * 100)}%)</div></div>
      <div><div class="stat-big" id="invAvail">${fmtInt(avail)}</div><div class="stat-lbl">Ready to join on restart</div></div>
      <button class="btn gold" data-act="prestige" ${avail < 1 ? 'disabled' : ''}>🔄 Restart &amp; Claim</button>
    </div>
    <h2 style="font-size:19px">Investor Upgrades</h2><p class="sub">Spend investors on powerful permanent upgrades.</p>
    <div class="list">${rows}</div>`;
}
function renderShop() {
  const rows = GEM_SHOP.map(g => {
    const c = gemCost(g);
    let extra = '';
    if (g.id === 'golden') extra = ` <span class="badge">${S.gemGolden}/3</span>`;
    if (g.id === 'offline') extra = ` <span class="badge">now ${fmtDur(OFFLINE_CAPS[S.offlineLvl])}</span>`;
    if (g.id.startsWith('warp')) extra = ` <span class="badge">≈ ${money(incomePerSec(false, false) * (g.id === 'warp1' ? 3600 : 86400))}</span>`;
    return `<div class="row"><div class="ico">${g.icon}</div><div class="info"><div class="title">${g.name}${extra}</div><div class="desc">${g.desc}</div></div>
      ${c == null ? '<span class="badge">✔ Maxed</span>' : `<button class="btn blue" data-act="gem" data-id="${g.id}" data-gems="${c}">💎 ${c}</button>`}</div>`;
  }).join('');
  return `<h2>💎 Gem Shop</h2><p class="sub">Earn gems from awards and golden briefcases. You have <b>${fmtInt(S.gems)}</b> 💎.</p><div class="list">${rows}</div>`;
}
function renderAwards() {
  const got = ACHIEVEMENTS.filter(a => S.achievements[a.id]).length;
  const cells = ACHIEVEMENTS.map(a => `<div class="award ${S.achievements[a.id] ? '' : 'locked'}"><div class="ico">${a.icon}</div>
    <div><div class="title">${a.name}</div><div class="desc">${a.desc} · 💎${a.gems}</div></div></div>`).join('');
  return `<h2>🏆 Awards</h2><p class="sub">Unlocked ${got} / ${ACHIEVEMENTS.length}. Each award grants gems.</p><div class="grid-awards">${cells}</div>`;
}
function renderStats() {
  const owned = S.biz.reduce((a, b) => a + b.owned, 0);
  const rows = [
    ['Cash', money(S.cash)],
    ['Income (managed)', money(incomePerSec()) + ' /s'],
    ['Total profit multiplier', 'x' + fmt(globalMult())],
    ['Earned this run', money(S.runEarnings)],
    ['Best run', money(Math.max(S.stats.bestRun, S.runEarnings))],
    ['Lifetime earnings', money(S.lifetime)],
    ['Businesses owned', fmtInt(owned)],
    ['Managers hired', S.biz.filter(b => b.manager).length + ' / ' + BUSINESSES.length],
    ['Upgrades bought (all time)', fmtInt(S.stats.upgradesBought)],
    ['Restarts', fmtInt(S.stats.prestiges)],
    ['Golden briefcases opened', fmtInt(S.stats.briefcases)],
    ['Manual runs', fmtInt(S.stats.clicks)],
    ['Awards', Object.keys(S.achievements).length + ' / ' + ACHIEVEMENTS.length],
    ['Play time', fmtDur(S.stats.playTime)],
  ];
  return `<h2>📊 Stats</h2><p class="sub">Your empire at a glance.</p>
    <table class="stats-table">${rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table>`;
}
function renderSettings() {
  return `<h2>⚙️ Settings</h2><p class="sub">Progress saves automatically in this browser every few seconds.</p>
    <div class="list">
      <div class="row setting"><div class="info"><div class="title">🔊 Sound effects</div></div><button class="btn ghost" data-act="sound">${S.settings.sound ? 'On' : 'Off'}</button></div>
      <div class="row setting"><div class="info"><div class="title">🔢 Number format</div><div class="desc">${S.settings.notation === 'sci' ? 'Scientific (1.23e15)' : 'Suffixes (1.23 Qa)'}</div></div><button class="btn ghost" data-act="notation">Switch</button></div>
      <div class="row setting"><div class="info"><div class="title">📲 Install as app</div><div class="desc">Add Business Empire to your phone or PC home screen. Works offline.</div></div><button class="btn gold" data-act="install">Install</button></div>
      <div class="row setting"><div class="info"><div class="title">💾 Save now</div></div><button class="btn ghost" data-act="save">Save</button></div>
      <div class="row setting"><div class="info"><div class="title">📤 Export / 📥 Import save</div><div class="desc">Move your progress to another browser.</div></div>
        <div style="display:flex;gap:8px"><button class="btn ghost" data-act="export">Export</button><button class="btn ghost" data-act="import">Import</button></div></div>
      <div class="row setting"><div class="info"><div class="title">🗑️ Hard reset</div><div class="desc">Wipes ALL progress including investors and gems.</div></div><button class="btn red" data-act="reset">Reset</button></div>
    </div>`;
}

function refreshAffordability() {
  const sec = $('tab-' + activeTab);
  if (!sec) return;
  sec.querySelectorAll('[data-cost]').forEach(b => b.classList.toggle('cant', S.cash < +b.dataset.cost));
  sec.querySelectorAll('[data-gems]').forEach(b => b.classList.toggle('cant', S.gems < +b.dataset.gems));
  sec.querySelectorAll('[data-inv]').forEach(b => b.classList.toggle('cant', S.investors < +b.dataset.inv));
  const ia = $('invAvail');
  if (ia) ia.textContent = fmtInt(investorsAvailable());
}
function updateDots() {
  $('dot-managers').classList.toggle('on', S.biz.some((b, i) => b.owned > 0 && !b.manager && S.cash >= BUSINESSES[i].managerCost));
  $('dot-upgrades').classList.toggle('on', UPGRADES.some(u => !S.upgrades[u.id] && S.cash >= u.cost));
  const avail = investorsAvailable();
  $('dot-investors').classList.toggle('on', avail >= Math.max(10, S.investors));
  $('dot-missions').classList.toggle('on', S.missions.some(m => missionValue(m) >= m.target));
  $('dot-daily').classList.toggle('on', canClaimDaily());
}

/* ---------------------------- UI: HEADER / BOOSTS ------------------- */
function updateHeader() {
  $('cash').textContent = money(S.cash);
  $('ips').textContent = money(incomePerSec()) + ' / sec';
  $('investors').textContent = fmtInt(S.investors);
  $('investorBonus').textContent = '+' + fmt(S.investors * investorRate() * 100) + '%';
  $('gems').textContent = fmtInt(S.gems);

  const hb = $('hypeBtn');
  hb.classList.toggle('cooldown', S.boosts.hypeCd > 0);
  setHTML(hb, S.boosts.hypeCd > 0 ? `📣 Hype <small>ready in ${fmtClock(S.boosts.hypeCd)}</small>` : '📣 Hype! <small>x2 for 2m</small>');

  const chips = [];
  if (S.boosts.hype > 0) chips.push(`<span class="chip pink">📣 x2 · ${fmtClock(S.boosts.hype)}</span>`);
  if (S.boosts.rush > 0) chips.push(`<span class="chip blue">⚡ x2 · ${fmtClock(S.boosts.rush)}</span>`);
  if (S.boosts.golden > 0) chips.push(`<span class="chip gold">✨ x5 · ${fmtClock(S.boosts.golden)}</span>`);
  if (marketEvent) chips.push(`<span class="chip hot">📈 ${BUSINESSES[marketEvent.biz].icon} x3 · ${fmtClock(marketEvent.remaining)}</span>`);
  chips.push(`<span class="chip total">Total profit x${fmt(globalMult())}</span>`);
  setHTML($('chips'), chips.join(''));

  document.querySelectorAll('#buymode button').forEach(b => b.classList.toggle('active', b.dataset.mode === S.settings.buyMode));
}

/* ---------------------------- TOAST / MODAL / TICKER ---------------- */
function toast(msg, type = '') {
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.textContent = msg;
  const box = $('toasts');
  box.appendChild(t);
  while (box.children.length > 4) box.firstChild.remove();
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, 3200);
}
function modal(html) { $('modalBody').innerHTML = html; $('modal').classList.remove('hidden'); }
const modalQueue = [];
function queueModal(html) { if ($('modal').classList.contains('hidden')) modal(html); else modalQueue.push(html); }
function closeModal() {
  $('modal').classList.add('hidden');
  if (modalQueue.length) modal(modalQueue.shift());
}
let headlineIdx = 0;
function setHeadline(txt) {
  const el = $('tickerText');
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  el.textContent = txt;
}
function rotateHeadline() {
  if (Math.random() < 0.3) {
    setHeadline(`Analysts value your empire's income at ${money(incomePerSec())} per second.`);
  } else {
    setHeadline(HEADLINES[headlineIdx++ % HEADLINES.length]);
  }
}

/* ---------------------------- INPUT --------------------------------- */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el) { if (e.target.id === 'modal') closeModal(); return; }
  if (el.disabled) return;
  const i = +el.dataset.i, id = el.dataset.id;
  switch (el.dataset.act) {
    case 'tab': switchTab(el.dataset.tab); break;
    case 'run': runBiz(i); break;
    case 'buy': buyBiz(i); updateBizText(); break;
    case 'buymode': S.settings.buyMode = el.dataset.mode; updateHeader(); updateBizText(); break;
    case 'hire': hireManager(i); renderTab(); break;
    case 'upgrade': buyUpgrade(id); renderTab(); break;
    case 'upgrade-all': buyAllUpgrades(); renderTab(); break;
    case 'invup': buyInvestorUpgrade(id); break;
    case 'invup-ok': confirmInvestorUpgrade(id); closeModal(); renderTab(); break;
    case 'prestige': prestigeAsk(); break;
    case 'prestige-ok': closeModal(); prestige(); break;
    case 'gem': buyGem(id); renderTab(); break;
    case 'hype': hype(); break;
    case 'daily': modal(dailyHtml()); break;
    case 'daily-claim': claimDaily(); closeModal(); break;
    case 'mclaim': claimMission(id); renderTab(); break;
    case 'mskip': skipMission(id); renderTab(); break;
    case 'install':
      if (installPrompt) {
        installPrompt.prompt();
        installPrompt.userChoice.finally(() => { installPrompt = null; $('installBtn').classList.add('hidden'); });
      } else {
        modal(`<div class="big-ico">📲</div><h3>Install as an app</h3>
          <p><b>Android (Chrome):</b> tap ⋮ menu → <b>Install app</b> / <b>Add to Home screen</b>.<br>
          <b>iPhone (Safari):</b> tap Share ⬆️ → <b>Add to Home Screen</b>.<br>
          <b>PC (Chrome / Edge):</b> click the install icon in the address bar.</p>
          <p class="sub">The game must be opened from a website (http/https) to install — not from a file on your computer.</p>
          <div class="modal-actions"><button class="btn gold" data-act="close">Got it</button></div>`);
      }
      break;
    case 'briefcase': openBriefcase(); break;
    case 'close': closeModal(); break;
    case 'offline-ok': closeModal(); break;
    case 'offline-x2':
      if (S.gems >= 5 && pendingOffline > 0) { S.gems -= 5; earn(pendingOffline); toast(`🌙 Doubled! +${money(pendingOffline)}`, 'gem'); sfx('big'); }
      pendingOffline = 0; closeModal(); break;
    case 'sound': S.settings.sound = !S.settings.sound; renderTab(); break;
    case 'notation': S.settings.notation = S.settings.notation === 'sci' ? 'suffix' : 'sci'; renderTab(); updateBizText(); break;
    case 'save': save(); toast('💾 Game saved.', 'good'); break;
    case 'export': {
      save();
      const code = btoa(JSON.stringify(S));
      modal(`<h3>📤 Export Save</h3><p>Copy this code and keep it safe.</p><textarea readonly id="exportBox">${code}</textarea>
        <div class="modal-actions"><button class="btn" data-act="copy">Copy</button><button class="btn ghost" data-act="close">Close</button></div>`);
      break;
    }
    case 'copy': {
      const box = $('exportBox'); box.select();
      (navigator.clipboard ? navigator.clipboard.writeText(box.value) : Promise.reject()).then(
        () => toast('📋 Copied!', 'good'), () => { document.execCommand && document.execCommand('copy'); toast('📋 Copied!', 'good'); });
      break;
    }
    case 'import':
      modal(`<h3>📥 Import Save</h3><p>Paste a save code. This replaces your current progress.</p><textarea id="importBox"></textarea>
        <div class="modal-actions"><button class="btn ghost" data-act="close">Cancel</button><button class="btn" data-act="import-ok">Import</button></div>`);
      break;
    case 'import-ok':
      try {
        S = mergeState(JSON.parse(atob($('importBox').value.trim()))); ensureMissions();
        save(); closeModal(); buildBizCards(); switchTab('business'); toast('📥 Save imported!', 'good');
      } catch (err) { toast('That save code is not valid.', 'bad'); }
      break;
    case 'reset':
      modal(`<div class="big-ico">⚠️</div><h3>Erase everything?</h3><p>This permanently deletes all progress, investors, gems and awards.</p>
        <div class="modal-actions"><button class="btn ghost" data-act="close">Cancel</button><button class="btn red" data-act="reset-ok">Erase</button></div>`);
      break;
    case 'reset-ok':
      S = defaultState(); ensureMissions(); marketEvent = null; save(); closeModal(); buildBizCards(); switchTab('business'); toast('Fresh start!', 'good');
      break;
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ---------------------------- GAME LOOP ----------------------------- */
function tick(dt) {
  S.stats.playTime += dt;
  S.biz.forEach((b, i) => {
    if (b.owned === 0) return;
    if (b.manager) b.running = true;
    if (!b.running) return;
    const ct = cycleTime(i);
    b.progress += dt / ct;
    if (b.progress >= 1) {
      let cycles = Math.floor(b.progress);
      if (b.manager) b.progress -= cycles;
      else { cycles = 1; b.progress = 0; b.running = false; }
      const amt = cycleRevenue(i) * cycles;
      earn(amt);
      if (ct >= 0.8 && dt < 1) floatText(i, money(amt));
    }
  });

  const B = S.boosts;
  B.hype = Math.max(0, B.hype - dt);
  B.hypeCd = Math.max(0, B.hypeCd - dt);
  B.rush = Math.max(0, B.rush - dt);
  B.golden = Math.max(0, B.golden - dt);

  if (marketEvent) {
    marketEvent.remaining -= dt;
    if (marketEvent.remaining <= 0) marketEvent = null;
  } else if ((nextEventIn -= dt) <= 0) {
    nextEventIn = rand(150, 300);
    startMarketEvent();
  }

  if (caseLife > 0) {
    caseLife -= dt;
    if (caseLife <= 0) $('briefcase').classList.add('hidden');
  } else if ((nextCaseIn -= dt) <= 0) {
    nextCaseIn = rand(60, 150);
    spawnBriefcase();
  }
}

let last = performance.now(), textAcc = 0, slowAcc = 0, saveAcc = 0, newsAcc = 0;
function frame(now) {
  const dt = Math.min((now - last) / 1000, 86400);
  last = now;
  tick(dt);
  updateBizBars();
  textAcc += dt; slowAcc += dt; saveAcc += dt; newsAcc += dt;
  if (textAcc >= 0.1) { textAcc = 0; updateHeader(); if (activeTab === 'business') updateBizText(); }
  if (slowAcc >= 0.5) {
    slowAcc = 0;
    refreshAffordability();
    updateDots();
    checkAchievements();
    checkMissions();
    if (activeTab === 'stats') renderTab();
    if (activeTab === 'missions') updateMissionProgress();
  }
  if (newsAcc >= 14) { newsAcc = 0; rotateHeadline(); }
  if (saveAcc >= 10) { saveAcc = 0; save(); }
  requestAnimationFrame(frame);
}

/* ---------------------------- BOOT ---------------------------------- */
function offlineEarnings() {
  const away = (Date.now() - S.lastSave) / 1000;
  if (away < 30) return;
  const counted = Math.min(away, OFFLINE_CAPS[S.offlineLvl]);
  const amt = incomePerSec(true, false) * counted;
  if (amt <= 0) return;
  earn(amt);
  pendingOffline = amt;
  modal(`<div class="big-ico">🌙</div><h3>Welcome back, boss!</h3>
    <p>You were away for <b>${fmtDur(away)}</b>${away > counted ? ` (capped at ${fmtDur(counted)})` : ''}.<br>Your managers earned</p>
    <div class="stat-big">${money(amt)}</div>
    <div class="modal-actions"><button class="btn" data-act="offline-ok">Collect</button>
    <button class="btn blue ${S.gems < 5 ? 'cant' : ''}" data-act="offline-x2">Double it · 💎5</button></div>`);
}

let installPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  installPrompt = e;
  $('installBtn').classList.remove('hidden');
});
window.addEventListener('appinstalled', () => {
  installPrompt = null;
  $('installBtn').classList.add('hidden');
  toast('📲 Installed! Open Business Empire from your home screen.', 'good');
});
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => { /* offline support unavailable */ });
}

const hadSave = load();
ensureMissions();
buildBizCards();
updateHeader();
updateDots();
if (hadSave) offlineEarnings();
else modal(`<div class="big-ico">🏙️</div><h3>Welcome to Business Empire!</h3>
  <p>Tap your <b>🍵 Tea Stall</b> to earn cash. Buy more businesses, hire <b>managers</b> to automate them, grab <b>upgrades</b>, catch golden <b>💼 briefcases</b>, and restart with <b>investors</b> to grow even faster.</p>
  <div class="modal-actions"><button class="btn gold" data-act="close">Let's build!</button></div>`);
if (canClaimDaily()) queueModal(dailyHtml());
window.addEventListener('beforeunload', save);
document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
requestAnimationFrame(frame);
