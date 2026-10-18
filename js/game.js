'use strict';
/* =====================================================================
   BUSINESS EMPIRE — idle business game
   ===================================================================== */

const SAVE_KEY = 'tycoonEmpire.save.v1';
const GAME_VERSION = '2.0';
const LB_URL = '/api/leaderboard';
let S = null; // game state, initialised below
const SUF = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'UDc', 'DDc', 'TDc', 'QaDc', 'QiDc', 'SxDc', 'SpDc', 'OcDc', 'NoDc', 'Vg', 'UVg', 'DVg', 'TVg', 'QaVg', 'QiVg', 'SxVg', 'SpVg', 'OcVg', 'NoVg', 'Tg'];
const REDUCED_MOTION = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------- 3D ICONS ------------------------------ */
// Microsoft Fluent 3D emoji (MIT), pinned to one commit. Falls back to the plain emoji if an image fails.
const FLUENT = 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@1ffb34c752ecf5d402f04cfb4b392c77f57c54bc/assets/';
const ICONS = {
  tea: ['Teacup without handle', '🍵'], truck: ['Delivery truck', '🚚'], coffee: ['Hot beverage', '☕'], bakery: ['Croissant', '🥐'],
  gym: ['Person lifting weights', '🏋️', 1], hotel: ['Hotel', '🏨'], tech: ['Laptop', '💻'], studio: ['Clapper board', '🎬'],
  airline: ['Airplane', '✈️'], space: ['Rocket', '🚀'],
  cheese: ['Cheese wedge', '🧀'], ufo: ['Flying saucer', '🛸'], hut: ['Hut', '🛖'], rock: ['Rock', '🪨'], balloon: ['Balloon', '🎈'],
  seedling: ['Seedling', '🌱'], sun: ['Sun', '☀️'], robot: ['Robot', '🤖'], telescope: ['Telescope', '🔭'], satellite: ['Satellite', '🛰️'],
  desert: ['Desert', '🏜️'], tractor: ['Tractor', '🚜'], bubbles: ['Bubbles', '🫧'], ice: ['Ice', '🧊'], volcano: ['Volcano', '🌋'],
  alien: ['Alien', '👽'], gem: ['Gem stone', '💎'], tree: ['Deciduous tree', '🌳'], comet: ['Comet', '☄️'], galaxy: ['Milky way', '🌌'],
  coin: ['Coin', '🪙'], briefcase: ['Briefcase', '💼'], gift: ['Wrapped gift', '🎁'], trophy: ['Trophy', '🏆'], crown: ['Crown', '👑'],
  megaphone: ['Megaphone', '📣'], bolt: ['High voltage', '⚡'], sparkles: ['Sparkles', '✨'], clipboard: ['Clipboard', '📋'],
  manager: ['Man office worker', '🤵', 1], necktie: ['Necktie', '👔'], chart: ['Chart increasing', '📈'], gear: ['Gear', '⚙️'],
  bars: ['Bar chart', '📊'], office: ['Office building', '🏢'], earth: ['Globe with meridians', '🌐'], moon: ['Full moon', '🌕'],
  mars: ['Ringed planet', '🪐'], party: ['Party popper', '🎉'], phone: ['Mobile phone', '📲'], city: ['Cityscape', '🏙️'],
  medal: ['Sports medal', '🏅'], gold: ['1st place medal', '🥇'], silver: ['2nd place medal', '🥈'], bronze: ['3rd place medal', '🥉'],
  wheel: ['Ferris wheel', '🎡'], up: ['Upwards button', '⬆️'], bell: ['Bell', '🔔'], disk: ['Floppy disk', '💾'],
  speaker: ['Speaker high volume', '🔊'], numbers: ['Input numbers', '🔢'], lock: ['Locked', '🔒'], check: ['Check mark button', '✅'],
  stopwatch: ['Stopwatch', '⏱️'], hourglass: ['Hourglass not done', '⏳'], person: ['Bust in silhouette', '👤'], pencil: ['Pencil', '✏️'],
  refresh: ['Counterclockwise arrows button', '🔄'], star: ['Glowing star', '🌟'], fire: ['Fire', '🔥'], bulb: ['Light bulb', '💡'],
  flag: ['Chequered flag', '🏁'], runner: ['Person running', '🏃', 1], trash: ['Wastebasket', '🗑️'], crescent: ['Crescent moon', '🌙'],
};
function iconUrl(key) {
  const d = ICONS[key];
  if (!d) return '';
  const snake = d[0].toLowerCase().replace(/ /g, '_');
  const dir = encodeURIComponent(d[0]);
  return d[2] ? `${FLUENT}${dir}/Default/3D/${snake}_3d_default.png` : `${FLUENT}${dir}/3D/${snake}_3d.png`;
}
function emo(key) { return (ICONS[key] || [])[1] || '❔'; }
function ico(key, cls = '') {
  return `<span class="i3d ${cls}" data-e="${emo(key)}"><img src="${iconUrl(key)}" alt="" draggable="false" onerror="this.parentNode.classList.add('fail')"></span>`;
}
function hydrateIcons(root = document) {
  root.querySelectorAll('[data-ico]').forEach(el => { el.outerHTML = ico(el.dataset.ico, el.className); });
}

/* ---------------------------- WORLDS & BUSINESSES ------------------- */
// [baseCost, costMult, cycle seconds, revenue, managerCost] — same curve on every world
const BIZ_CURVE = [
  [4, 1.07, 0.6, 1, 1e3], [60, 1.15, 3, 60, 15e3], [720, 1.14, 6, 540, 1e5], [8640, 1.13, 12, 4320, 5e5],
  [103680, 1.12, 24, 51840, 1.2e6], [1244160, 1.11, 96, 622080, 1e7], [14929920, 1.10, 384, 7464960, 1.11e8],
  [179159040, 1.09, 1536, 89579520, 5.55e8], [2149908480, 1.08, 6144, 1074954240, 1e10], [25798901760, 1.07, 36864, 29668737024, 1e11],
];
const WORLDS = [
  { id: 'earth', name: 'Earth', icon: 'earth', mult: 1, unlockAt: 0, desc: 'Where every empire begins.', biz: [
    ['tea', 'Tea Stall', 'tea', 'Chai Charlie'], ['truck', 'Food Truck', 'truck', 'Taco Tina'], ['coffee', 'Coffee Shop', 'coffee', 'Barista Bob'],
    ['bakery', 'Bakery', 'bakery', 'Baker Bella'], ['gym', 'Fitness Gym', 'gym', 'Coach Max'], ['hotel', 'Hotel Chain', 'hotel', 'Concierge Clara'],
    ['tech', 'Tech Startup', 'tech', 'Hacker Hiro'], ['studio', 'Film Studio', 'studio', 'Director Dev'], ['airline', 'Airline', 'airline', 'Captain Ava'],
    ['space', 'Space Agency', 'space', 'Commander Zed']] },
  { id: 'moon', name: 'Moon', icon: 'moon', mult: 3, unlockAt: 1e12, desc: 'Low gravity, high profits. Everything earns x3.', biz: [
    ['cheese', 'Moon Cheese Mine', 'cheese', 'Cheddar Chen'], ['taxi', 'UFO Taxi', 'ufo', 'Zippy Zoe'], ['huts', 'Crater Huts', 'hut', 'Dusty Dan'],
    ['rock', 'Moon Rock Shop', 'rock', 'Rocky Raj'], ['helium', 'Helium Balloons', 'balloon', 'Floaty Fay'], ['farm', 'Dome Farm', 'seedling', 'Sprout Sam'],
    ['solar', 'Solar Array', 'sun', 'Sunny Sol'], ['robot', 'Robot Factory', 'robot', 'Bolt-9'], ['scope', 'Star Observatory', 'telescope', 'Stella Vega'],
    ['sat', 'Satellite Network', 'satellite', 'Orbit Omar']] },
  { id: 'mars', name: 'Mars', icon: 'mars', mult: 10, unlockAt: 1e18, desc: 'The red frontier. Everything earns x10.', biz: [
    ['sand', 'Red Sand Shop', 'desert', 'Sandy Sara'], ['rover', 'Rover Rentals', 'tractor', 'Rusty Rex'], ['oxygen', 'Oxygen Bar', 'bubbles', 'Airy Ana'],
    ['ice', 'Polar Ice Mine', 'ice', 'Frosty Finn'], ['volcano', 'Olympus Tours', 'volcano', 'Lava Leo'], ['zoo', 'Alien Zoo', 'alien', 'Zorg'],
    ['crystal', 'Crystal Mine', 'gem', 'Gemma Ray'], ['terra', 'Terraformer', 'tree', 'Forest Fang'], ['comet', 'Comet Catchers', 'comet', 'Halley Hu'],
    ['bank', 'Galaxy Bank', 'galaxy', 'Cosmo Cruz']] },
].map(w => Object.assign(w, {
  biz: w.biz.map(([id, name, icon, manager], i) => {
    const [baseCost, costMult, time, revenue, managerCost] = BIZ_CURVE[i];
    return { id, name, icon, manager, baseCost, costMult, time, revenue, managerCost };
  }),
}));
let WORLD = WORLDS[0];
let BUSINESSES = WORLD.biz;

// Per-business level milestones
const MILESTONES = [
  { lvl: 10, type: 'profit', mult: 2 }, { lvl: 25, type: 'speed', mult: 2 }, { lvl: 50, type: 'speed', mult: 2 },
  { lvl: 100, type: 'speed', mult: 2 }, { lvl: 150, type: 'profit', mult: 3 }, { lvl: 200, type: 'speed', mult: 2 },
  { lvl: 250, type: 'profit', mult: 3 }, { lvl: 300, type: 'speed', mult: 2 }, { lvl: 350, type: 'profit', mult: 3 },
  { lvl: 400, type: 'speed', mult: 2 }, { lvl: 500, type: 'profit', mult: 4 }, { lvl: 600, type: 'profit', mult: 4 },
  { lvl: 750, type: 'profit', mult: 5 }, { lvl: 1000, type: 'profit', mult: 10 },
];
// When EVERY business reaches this level, all profits x2
const GLOBAL_MILESTONES = [10, 25, 50, 100, 200, 300, 400, 500, 750, 1000];

const UPGRADE_TIERS = ['Marketing Blitz', 'Premium Supplies', 'Franchise Deal', 'Celebrity Endorsement', 'Global Expansion', 'AI Automation', 'Total Monopoly'];
function makeUpgrades(bizList) {
  const list = [];
  UPGRADE_TIERS.forEach((tier, t) => {
    bizList.forEach((b, i) => list.push({
      id: `u${t}_${b.id}`, name: `${b.name}: ${tier}`, target: i, mult: 3,
      cost: 2.5e5 * Math.pow(12, i) * Math.pow(1e8, t), icon: b.icon,
    }));
    list.push({ id: `u${t}_all`, name: `Empire-wide ${tier}`, target: -1, mult: 3,
      cost: 2.5e5 * Math.pow(12, 10) * Math.pow(1e8, t), icon: 'earth' });
  });
  return list.sort((a, b) => a.cost - b.cost);
}
let UPGRADES = makeUpgrades(BUSINESSES);

const INVESTOR_UPGRADES = [
  { id: 'seed',    name: 'Seed Capital',        desc: 'Start every new run with 25K cash',   cost: 50,    type: 'start', value: 25e3, icon: 'seedling' },
  { id: 'angel',   name: 'Angel Round',         desc: 'All profits x3',                      cost: 150,   type: 'profit', mult: 3, icon: 'star' },
  { id: 'logi',    name: 'Faster Logistics',    desc: 'All businesses run 2x faster',        cost: 600,   type: 'speed', mult: 2, icon: 'truck' },
  { id: 'seriesA', name: 'Series A',            desc: 'All profits x3',                      cost: 3000,  type: 'profit', mult: 3, icon: 'chart' },
  { id: 'rel',     name: 'Investor Relations',  desc: 'Each investor gives +3% (was +2%)',   cost: 12000, type: 'rate', value: 0.03, icon: 'necktie' },
  { id: 'seriesB', name: 'Series B',            desc: 'All profits x5',                      cost: 6e4,   type: 'profit', mult: 5, icon: 'office' },
  { id: 'express', name: 'Express Everything',  desc: 'All businesses run 2x faster',        cost: 3e5,   type: 'speed', mult: 2, icon: 'bolt' },
  { id: 'board',   name: 'Visionary Board',     desc: 'Each investor gives +5%',             cost: 2e6,   type: 'rate', value: 0.05, icon: 'bulb' },
  { id: 'ipo',     name: 'IPO',                 desc: 'All profits x10',                     cost: 1e7,   type: 'profit', mult: 10, icon: 'bell' },
  { id: 'empire',  name: 'Global Conglomerate', desc: 'All profits x25',                     cost: 1e9,   type: 'profit', mult: 25, icon: 'earth' },
];

const GEM_SHOP = [
  { id: 'rush',    icon: 'bolt',      name: 'Profit Rush',       desc: 'x2 all profits for 15 minutes (stacks time)', cost: 10 },
  { id: 'warp1',   icon: 'hourglass', name: 'Time Warp: 1 Hour', desc: 'Instantly earn 1 hour of income',            cost: 20 },
  { id: 'warp24',  icon: 'stopwatch', name: 'Time Warp: 1 Day',  desc: 'Instantly earn 24 hours of income',          cost: 200 },
  { id: 'golden',  icon: 'crown',     name: 'Golden Touch',      desc: 'PERMANENT x2 all profits (max 3)',           cost: [100, 300, 900] },
  { id: 'offline', icon: 'crescent',  name: 'Night Shift',       desc: 'Offline earnings cap: 2h → 8h → 24h',        cost: [40, 120] },
];
const OFFLINE_CAPS = [2 * 3600, 8 * 3600, 24 * 3600];

const SPIN_PRIZES = [
  { icon: 'coin',      label: '5 min income',   w: 22, color: '#22b86a', give: () => { const a = bonusCash(300); earn(a); return `+${money(a)} cash`; } },
  { icon: 'gem',       label: '3 Gems',         w: 18, color: '#2f7fe0', give: () => { S.gems += 3; return '+3 gems'; } },
  { icon: 'bolt',      label: 'x2 for 5m',      w: 16, color: '#e8920f', give: () => { S.boosts.rush += 300; return 'x2 profits for 5 minutes'; } },
  { icon: 'coin',      label: '30 min income',  w: 12, color: '#159052', give: () => { const a = bonusCash(1800); earn(a); return `+${money(a)} cash`; } },
  { icon: 'gem',       label: '10 Gems',        w: 10, color: '#1d5fc0', give: () => { S.gems += 10; return '+10 gems'; } },
  { icon: 'sparkles',  label: 'x5 for 30s',     w: 12, color: '#8a4fe6', give: () => { S.boosts.golden += 30; return 'x5 profits for 30 seconds'; } },
  { icon: 'hourglass', label: '1 hour income',  w: 7,  color: '#d9417a', give: () => { const a = bonusCash(3600); earn(a); return `+${money(a)} cash`; } },
  { icon: 'crown',     label: 'JACKPOT 50 Gems', w: 3, color: '#d93445', big: true, give: () => { S.gems += 50; return 'JACKPOT! +50 gems'; } },
];
const SPIN_COOLDOWN = 4 * 3600 * 1000;
const SPIN_GEM_COST = 5;

function worldDef(id) { return WORLDS.find(w => w.id === id) || WORLDS[0]; }
function worldBiz(id) {
  if (id === S.world) return S.biz;
  return S.worldRuns[id] ? S.worldRuns[id].biz : null;
}

const ACHIEVEMENTS = (() => {
  const list = [];
  const titles = ['Owner', 'Mogul', 'Baron', 'Magnate', 'Legend'];
  WORLDS[0].biz.forEach((b, i) => [25, 100, 250, 500, 1000].forEach((n, k) => list.push({
    id: `own_${b.id}_${n}`, icon: b.icon, name: `${b.name} ${titles[k]}`, desc: `Own ${n} ${b.name}s on Earth`,
    gems: [2, 3, 5, 8, 15][k], test: () => { const bz = worldBiz('earth'); return !!bz && bz[i].owned >= n; },
  })));
  [[1e3, 'First Grand'], [1e6, 'Millionaire'], [1e9, 'Billionaire'], [1e12, 'Trillionaire'], [1e15, 'Quadrillionaire'],
   [1e18, 'Quintillionaire'], [1e24, 'Septillionaire'], [1e30, 'Nonillionaire'], [1e40, 'Off the Charts'], [1e60, 'Infinite Wealth']]
    .forEach(([n, name], k) => list.push({ id: `earn_${k}`, icon: 'coin', name, desc: `Earn ${money(n)} lifetime`, gems: 3 + k * 2, test: () => S.lifetime >= n }));
  list.push({ id: 'world_moon', icon: 'moon', name: 'Moonwalker', desc: 'Unlock the Moon', gems: 15, test: () => !!S.worldsUnlocked.moon });
  list.push({ id: 'world_mars', icon: 'mars', name: 'Red Planet Boss', desc: 'Unlock Mars', gems: 30, test: () => !!S.worldsUnlocked.mars });
  [1, 5, 10].forEach(n => list.push({ id: `mgr_${n}`, icon: 'manager', name: `Hiring Spree ${n}`, desc: `Have ${n} managers in one world`, gems: n === 10 ? 10 : 3, test: () => S.biz.filter(b => b.manager).length >= n }));
  [1, 3, 10, 25].forEach(n => list.push({ id: `pre_${n}`, icon: 'necktie', name: `Fresh Start x${n}`, desc: `Restart with investors ${n} time(s)`, gems: 5 + n, test: () => S.stats.prestiges >= n }));
  [1, 10, 50].forEach(n => list.push({ id: `case_${n}`, icon: 'briefcase', name: `Briefcase Hunter ${n}`, desc: `Open ${n} golden briefcases`, gems: n === 1 ? 2 : 5, test: () => S.stats.briefcases >= n }));
  [100, 1000, 5000].forEach(n => list.push({ id: `click_${n}`, icon: 'runner', name: `Hands-On ${n}`, desc: `Run businesses by hand ${n} times`, gems: 3, test: () => S.stats.clicks >= n }));
  [5, 25, 100].forEach(n => list.push({ id: `mis_${n}`, icon: 'clipboard', name: `Go-Getter ${n}`, desc: `Complete ${n} missions`, gems: n === 100 ? 20 : 5, test: () => S.stats.missionsDone >= n }));
  [7, 30].forEach(n => list.push({ id: `daily_${n}`, icon: 'gift', name: `Loyal Boss ${n}`, desc: `Claim ${n} daily rewards`, gems: n === 30 ? 20 : 7, test: () => (S.stats.dailyClaims || 0) >= n }));
  [1, 10, 50].forEach(n => list.push({ id: `spin_${n}`, icon: 'wheel', name: `Lucky Spinner ${n}`, desc: `Spin the Lucky Wheel ${n} time(s)`, gems: n === 50 ? 15 : 3, test: () => (S.stats.spins || 0) >= n }));
  list.push({ id: 'lb_join', icon: 'trophy', name: 'On the Board', desc: 'Join the online leaderboard', gems: 5, test: () => !!S.player.name });
  [10, 25, 50].forEach(n => list.push({ id: `upg_${n}`, icon: 'up', name: `Upgrader ${n}`, desc: `Buy ${n} upgrades`, gems: 5, test: () => S.stats.upgradesBought >= n }));
  return list;
})();

const HEADLINES = [
  'Local tea stall owner refuses to share secret masala recipe.',
  'Economists baffled as one mogul buys every coffee shop in town.',
  'Breaking: Food trucks now outnumber parking spots 3 to 1.',
  'Gym membership surge linked to aggressive marketing. And protein croissants.',
  'Tech startup pivots to blockchain-powered AI-driven tea delivery.',
  'Film studio announces sequel to a movie nobody has seen yet.',
  'Space Agency confirms Moon is "a great location for a cheese mine".',
  'Scientists confirm: Mars sand sells better with a gift wrap.',
  'Rumor: golden briefcases spotted around the city. Keep your eyes open!',
  'Lucky Wheel jackpot hit by a tea stall owner. Again.',
  'Investors say: "Restarting with more capital is a power move."',
  'Leaderboard wars heat up as bosses race for the top spot.',
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
    version: 2,
    world: 'earth',
    worldRuns: {},
    worldsUnlocked: { earth: true },
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
    spin: { freeAt: 0 },
    player: { id: '', name: '' },
    stats: { clicks: 0, briefcases: 0, prestiges: 0, upgradesBought: 0, playTime: 0, bestRun: 0, missionsDone: 0, spins: 0, dailyClaims: 0 },
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
function cleanBiz(list) {
  return BIZ_CURVE.map((c, i) => Object.assign({ owned: i === 0 ? 1 : 0, progress: 0, running: false, manager: false }, (list || [])[i] || {}));
}
function mergeState(saved) {
  const d = defaultState();
  const out = Object.assign(d, saved);
  out.stats = Object.assign(defaultState().stats, saved.stats || {});
  out.boosts = Object.assign(defaultState().boosts, saved.boosts || {});
  out.settings = Object.assign(defaultState().settings, saved.settings || {});
  out.biz = cleanBiz(saved.biz);
  out.upgrades = saved.upgrades || {};
  out.investorUpgrades = saved.investorUpgrades || {};
  out.achievements = saved.achievements || {};
  out.daily = Object.assign({ last: '', streak: 0 }, saved.daily || {});
  out.missions = Array.isArray(saved.missions) ? saved.missions : [];
  out.spin = Object.assign({ freeAt: 0 }, saved.spin || {});
  out.player = Object.assign({ id: '', name: '' }, saved.player || {});
  out.world = WORLDS.some(w => w.id === saved.world) ? saved.world : 'earth';
  out.worldsUnlocked = Object.assign({ earth: true }, saved.worldsUnlocked || {});
  out.worldRuns = {};
  for (const [id, r] of Object.entries(saved.worldRuns || {})) {
    if (WORLDS.some(w => w.id === id) && id !== out.world) {
      out.worldRuns[id] = { cash: +r.cash || 0, runEarnings: +r.runEarnings || 0, biz: cleanBiz(r.biz), upgrades: r.upgrades || {} };
    }
  }
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
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
const $ = id => document.getElementById(id);
function setHTML(el, html) { if (el._html !== html) { el._html = html; el.innerHTML = html; } }

/* ---------------------------- SOUND --------------------------------- */
let actx = null;
function sfx(kind) {
  if (!S.settings.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const notes = { click: [520, .05], buy: [740, .07], err: [180, .12], cash: [880, .06], big: [660, .25], case: [990, .2], tick: [1200, .02], win: [523, .5] }[kind] || [440, .05];
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = kind === 'err' ? 'sawtooth' : kind === 'tick' ? 'square' : 'triangle';
    o.frequency.setValueAtTime(notes[0], actx.currentTime);
    if (kind === 'big' || kind === 'case') o.frequency.exponentialRampToValueAtTime(notes[0] * 2, actx.currentTime + notes[1]);
    if (kind === 'win') o.frequency.exponentialRampToValueAtTime(notes[0] * 4, actx.currentTime + notes[1]);
    g.gain.setValueAtTime(kind === 'tick' ? 0.03 : 0.08, actx.currentTime);
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
  let m = (1 + S.investors * investorRate()) * WORLD.mult;
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
function bonusCash(secs) { return Math.max(500, incomePerSec(false, false) * secs); }

/* ---------------------------- ACTIONS ------------------------------- */
function runBiz(i) {
  const b = S.biz[i];
  if (b.owned === 0 || b.running) return;
  b.running = true;
  S.stats.clicks++;
  sfx('click');
  const c = cards[i];
  if (c) restartAnim(c.iconWrap, 'tap');
}
function buyBiz(i) {
  const n = buyAmount(i), c = costFor(i, n);
  if (S.cash < c) { sfx('err'); shake(cards[i] && cards[i].buyBtn); return; }
  const before = S.biz[i].owned, minBefore = minOwned();
  S.cash -= c;
  S.biz[i].owned += n;
  sfx('buy');
  const d = BUSINESSES[i];
  if (cards[i]) { restartAnim(cards[i].iconWrap, 'levelup'); sparkBurst(cards[i].iconWrap, 10); }
  for (const m of MILESTONES) {
    if (before < m.lvl && S.biz[i].owned >= m.lvl) {
      toast(`${emo(d.icon)} ${d.name} hit ${m.lvl}! ${m.type === 'speed' ? '⚡ Speed' : '💰 Profit'} x${m.mult}`, 'good');
      sfx('big');
      confetti(cards[i] && cards[i].iconWrap, 60);
    }
  }
  const minAfter = minOwned();
  for (const g of GLOBAL_MILESTONES) if (minBefore < g && minAfter >= g) { toast(`🌐 All businesses reached ${g}! All profits x2`, 'good'); confetti(null, 140); }
  if (before === 0) { toast(`🎉 Unlocked ${emo(d.icon)} ${d.name}! Tap it to earn.`, 'good'); confetti(cards[i] && cards[i].iconWrap, 80); }
}
function hireManager(i) {
  const d = BUSINESSES[i], b = S.biz[i];
  if (b.manager || b.owned === 0 || S.cash < d.managerCost) { sfx('err'); return; }
  S.cash -= d.managerCost;
  b.manager = true; b.running = true;
  sfx('big');
  toast(`🤵 ${d.manager} now runs your ${d.name}!`, 'good');
  confetti(null, 50);
}
function buyUpgrade(id, quiet) {
  const u = UPGRADES.find(x => x.id === id);
  if (!u || S.upgrades[id] || S.cash < u.cost) { if (!quiet) sfx('err'); return false; }
  S.cash -= u.cost;
  S.upgrades[id] = true;
  S.stats.upgradesBought++;
  if (!quiet) { sfx('buy'); toast(`${emo(u.icon)} ${u.name} — x${u.mult} profit!`, 'good'); }
  return true;
}
function buyAllUpgrades() {
  let n = 0;
  for (const u of UPGRADES) if (!S.upgrades[u.id] && S.cash >= u.cost) { if (buyUpgrade(u.id, true)) n++; }
  if (n) { sfx('big'); toast(`⬆️ Bought ${n} upgrade${n > 1 ? 's' : ''}!`, 'good'); confetti(null, 40); } else sfx('err');
}
function buyInvestorUpgrade(id) {
  const u = INVESTOR_UPGRADES.find(x => x.id === id);
  if (!u || S.investorUpgrades[id] || S.investors < u.cost) { sfx('err'); return; }
  modal(`${ico(u.icon, 'big-ico')}<h3>${u.name}</h3>
    <p>${u.desc}.<br>This spends <b>${fmtInt(u.cost)}</b> investors, lowering your investor bonus by <b>${fmt(u.cost * investorRate() * 100)}%</b>. Upgrades are permanent.</p>
    <div class="modal-actions"><button class="btn ghost" data-act="close">Cancel</button><button class="btn purple" data-act="invup-ok" data-id="${id}">Buy it</button></div>`);
}
function confirmInvestorUpgrade(id) {
  const u = INVESTOR_UPGRADES.find(x => x.id === id);
  if (!u || S.investors < u.cost) return;
  S.investors -= u.cost;
  S.investorUpgrades[id] = true;
  sfx('big');
  toast(`${emo(u.icon)} ${u.name} acquired!`, 'good');
  confetti(null, 80);
}
function prestigeAsk() {
  const n = investorsAvailable();
  if (n < 1) { sfx('err'); toast('Earn more to attract investors.', 'bad'); return; }
  const newBonus = (S.investors + n) * investorRate() * 100;
  modal(`${ico('necktie', 'big-ico')}<h3>Sell your ${WORLD.name} empire?</h3>
    <p>You will gain <b>${fmtInt(n)}</b> investors, bringing your profit bonus to <b>+${fmt(newBonus)}%</b> in every world.</p>
    <p>Your ${WORLD.name} cash, businesses, managers and cash upgrades reset. Other worlds, investors, gems and awards are kept.</p>
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
  sfx('win');
  toast(`👔 ${fmtInt(n)} investors joined your empire!`, 'good');
  buildBizCards();
  switchTab('business');
  confetti(null, 200);
  save();
}
function hype() {
  if (S.boosts.hypeCd > 0) return;
  S.boosts.hype = 120;
  S.boosts.hypeCd = 600;
  sfx('big');
  toast('📣 Hype campaign launched! x2 profits for 2 minutes.', 'good');
  sparkBurst($('hypeBtn'), 16);
}
function buyGem(id) {
  const item = GEM_SHOP.find(g => g.id === id);
  const cost = gemCost(item);
  if (cost == null || S.gems < cost) { sfx('err'); return; }
  S.gems -= cost;
  switch (id) {
    case 'rush': S.boosts.rush += 900; toast('⚡ Profit Rush! x2 for 15 minutes.', 'gem'); break;
    case 'warp1': case 'warp24': {
      const amt = bonusCash(id === 'warp1' ? 3600 : 86400);
      earn(amt); toast(`⏩ Time warped! +${money(amt)}`, 'gem'); coinShower(24); break;
    }
    case 'golden': S.gemGolden++; toast('👑 Golden Touch! Permanent x2 profits.', 'gem'); confetti(null, 120); break;
    case 'offline': S.offlineLvl++; toast(`🌙 Offline cap is now ${fmtDur(OFFLINE_CAPS[S.offlineLvl])}.`, 'gem'); break;
  }
  sfx('big');
}
function gemCost(item) {
  if (item.id === 'golden') return S.gemGolden < 3 ? item.cost[S.gemGolden] : null;
  if (item.id === 'offline') return S.offlineLvl < 2 ? item.cost[S.offlineLvl] : null;
  return item.cost;
}

/* ---------------------------- WORLDS ------------------------------- */
function applyWorld(id) {
  WORLD = worldDef(id);
  BUSINESSES = WORLD.biz;
  UPGRADES = makeUpgrades(BUSINESSES);
  document.body.dataset.world = WORLD.id;
  const wi = $('worldIco');
  if (wi) wi.innerHTML = ico(WORLD.icon);
  const wn = $('worldName');
  if (wn) wn.textContent = WORLD.name;
  Stars.setWorld(WORLD.id);
}
function unlockWorld(id) {
  const w = worldDef(id);
  if (S.worldsUnlocked[id]) return travelTo(id);
  if (S.lifetime < w.unlockAt) { sfx('err'); toast(`Earn ${money(w.unlockAt)} lifetime to unlock ${w.name}.`, 'bad'); return; }
  S.worldsUnlocked[id] = true;
  sfx('win');
  toast(`🚀 ${w.name} unlocked! Everything there earns x${w.mult}.`, 'good');
  travelTo(id);
}
function travelTo(id) {
  if (!S.worldsUnlocked[id]) return;
  if (id === S.world) { switchTab('business'); return; }
  S.worldRuns[S.world] = { cash: S.cash, runEarnings: S.runEarnings, biz: S.biz, upgrades: S.upgrades };
  const r = S.worldRuns[id] || newRun();
  delete S.worldRuns[id];
  Object.assign(S, { cash: r.cash, runEarnings: r.runEarnings, biz: r.biz, upgrades: r.upgrades });
  S.world = id;
  marketEvent = null;
  document.body.classList.add('warping');
  setTimeout(() => document.body.classList.remove('warping'), 1200);
  Stars.warp();
  applyWorld(id);
  buildBizCards();
  switchTab('business');
  confetti(null, 120);
  save();
}

/* ---------------------------- BRIEFCASE & EVENTS -------------------- */
function spawnBriefcase() {
  const el = $('briefcase');
  const w = window.innerWidth, h = window.innerHeight;
  el.style.left = rand(20, Math.max(30, w - 90)) + 'px';
  el.style.top = rand(120, Math.max(130, h - 220)) + 'px';
  el.classList.remove('hidden');
  caseLife = 12;
}
function openBriefcase() {
  const el = $('briefcase');
  sparkBurst(el, 20);
  el.classList.add('hidden');
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
    coinShower(14);
  }
}
function startMarketEvent() {
  const owned = S.biz.map((b, i) => b.owned > 0 ? i : -1).filter(i => i >= 0);
  if (!owned.length) return;
  const i = owned[Math.floor(Math.random() * owned.length)];
  marketEvent = { biz: i, remaining: 60 };
  toast(`📈 Market boom! ${emo(BUSINESSES[i].icon)} ${BUSINESSES[i].name} profits x3 for 60s`, 'good');
  setHeadline(`MARKET BOOM: Demand for ${BUSINESSES[i].name} skyrockets — profits tripled!`);
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
  { icon: 'gem',       label: '5 Gems',            give: () => { S.gems += 5; } },
  { icon: 'coin',      label: '10 min income',     give: () => earn(bonusCash(600)) },
  { icon: 'gem',       label: '10 Gems',           give: () => { S.gems += 10; } },
  { icon: 'bolt',      label: 'Profit Rush 15m',   give: () => { S.boosts.rush += 900; } },
  { icon: 'gem',       label: '15 Gems',           give: () => { S.gems += 15; } },
  { icon: 'coin',      label: '1 hour income',     give: () => earn(bonusCash(3600)) },
  { icon: 'crown',     label: '30 Gems + x5 Rush', give: () => { S.gems += 30; S.boosts.golden += 60; } },
];
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
    return `<div class="day ${cls}"><small>Day ${day}</small>${ico(r.icon)}<em>${r.label}</em></div>`;
  }).join('');
  return `${ico('gift', 'big-ico')}<h3>Daily Reward</h3>
    <p>${claimable ? `Day ${today} reward is ready! Come back every day — missing a day restarts from Day 1.`
      : `Already claimed today. Come back tomorrow for Day ${S.daily.streak % 7 + 1}!`}</p>
    <div class="daily-grid">${boxes}</div>
    <div class="modal-actions">${claimable ? '<button class="btn gold" data-act="daily-claim">Claim!</button>' : '<button class="btn ghost" data-act="close">Close</button>'}</div>`;
}
function claimDaily() {
  if (!canClaimDaily()) return;
  const day = dailyNextDay();
  DAILY_REWARDS[day - 1].give();
  S.daily = { last: dayKey(), streak: day };
  S.stats.dailyClaims = (S.stats.dailyClaims || 0) + 1;
  sfx('win');
  toast(`🎁 Day ${day} reward: ${DAILY_REWARDS[day - 1].label}!`, 'gem');
  confetti(null, 100);
  save();
}

/* ---------------------------- LUCKY SPIN ---------------------------- */
let spinning = false, wheelAngle = 0;
function spinReady() { return Date.now() >= S.spin.freeAt; }
function spinHtml() {
  const n = SPIN_PRIZES.length, seg = 360 / n;
  const grad = SPIN_PRIZES.map((p, k) => `${p.color} ${k * seg}deg ${(k + 1) * seg}deg`).join(',');
  const segs = SPIN_PRIZES.map((p, k) => `<div class="seg" style="transform:rotate(${k * seg + seg / 2}deg)"><div class="seg-in">${ico(p.icon)}<small>${p.label}</small></div></div>`).join('');
  return `<h3>Lucky Spin</h3>
    <p class="sub" id="spinInfo">${spinInfoText()}</p>
    <div class="wheel-wrap">
      <div class="wheel-pointer"></div>
      <div class="wheel-lights"></div>
      <div class="wheel" id="wheel" style="background:conic-gradient(${grad});transform:rotate(${wheelAngle}deg)">${segs}</div>
      <div class="wheel-hub">${ico('coin')}</div>
    </div>
    <div class="modal-actions">
      <button class="btn gold" data-act="spin-go" id="spinFree" ${spinReady() ? '' : 'disabled'}>Free spin</button>
      <button class="btn blue" data-act="spin-paid" data-gems="${SPIN_GEM_COST}">Spin · 💎${SPIN_GEM_COST}</button>
      <button class="btn ghost" data-act="close">Close</button>
    </div>`;
}
function spinInfoText() {
  return spinReady() ? 'Your free spin is ready!' : `Next free spin in ${fmtClock((S.spin.freeAt - Date.now()) / 1000)}`;
}
function doSpin(paid) {
  if (spinning) return;
  if (!paid && !spinReady()) { sfx('err'); return; }
  if (paid && S.gems < SPIN_GEM_COST) { sfx('err'); toast('Not enough gems for a spin.', 'bad'); return; }
  if (paid) S.gems -= SPIN_GEM_COST; else S.spin.freeAt = Date.now() + SPIN_COOLDOWN;
  S.stats.spins = (S.stats.spins || 0) + 1;
  spinning = true;
  const total = SPIN_PRIZES.reduce((a, p) => a + p.w, 0);
  let roll = Math.random() * total, k = 0;
  while (roll >= SPIN_PRIZES[k].w) { roll -= SPIN_PRIZES[k].w; k++; }
  const seg = 360 / SPIN_PRIZES.length;
  const center = k * seg + seg / 2 + rand(-seg * 0.35, seg * 0.35);
  const base = wheelAngle - (wheelAngle % 360);
  wheelAngle = base + 360 * 7 + (360 - center);
  const wheel = $('wheel');
  if (wheel) { wheel.style.transition = 'transform 5s cubic-bezier(.12,.75,.12,1)'; wheel.style.transform = `rotate(${wheelAngle}deg)`; }
  document.querySelectorAll('[data-act=spin-go],[data-act=spin-paid]').forEach(b => { b.disabled = true; });
  // Ticking sound while the wheel slows down
  let t = 0;
  for (let d = 60; t < 4600; d *= 1.09) { t += d; setTimeout(() => sfx('tick'), t); }
  setTimeout(() => {
    spinning = false;
    const p = SPIN_PRIZES[k];
    const msg = p.give();
    sfx(p.big ? 'win' : 'big');
    toast(`🎡 ${msg}`, 'gem');
    confetti($('wheel'), p.big ? 260 : 90);
    if ($('wheel')) {
      const card = $('modalBody');
      card.innerHTML = spinHtml();
      const wl = $('wheel');
      wl.classList.add('won');
      wl.querySelectorAll('.seg')[k].classList.add('hit');
    }
    if (activeTab === 'shop') renderTab();
  }, 5100);
}

/* ---------------------------- MISSIONS ------------------------------ */
const MISSION_SLOTS = 3;
function niceNum(x) { const p = Math.pow(10, Math.floor(Math.log10(x))); return Math.ceil(x / p) * p; }
function missionValue(m) {
  const bz = worldBiz(m.world || 'earth');
  switch (m.type) {
    case 'own': return bz ? bz[m.biz].owned : 0;
    case 'unlock': return bz && bz[m.biz].owned > 0 ? 1 : 0;
    case 'hire': return bz && bz[m.biz].manager ? 1 : 0;
    case 'earn': return S.lifetime - m.base;
    case 'click': return S.stats.clicks - m.base;
    case 'case': return S.stats.briefcases - m.base;
    case 'upgrade': return S.stats.upgradesBought - m.base;
    case 'spin': return (S.stats.spins || 0) - m.base;
  }
  return 0;
}
function missionText(m) {
  const w = worldDef(m.world || 'earth');
  const d = w.biz[m.biz] || {};
  const where = w.id === 'earth' ? '' : ` on ${w.name}`;
  switch (m.type) {
    case 'own': return { icon: d.icon, text: `Own ${m.target} ${d.name}${where}` };
    case 'unlock': return { icon: d.icon, text: `Unlock the ${d.name}${where}` };
    case 'hire': return { icon: 'manager', text: `Hire ${d.manager} for your ${d.name}` };
    case 'earn': return { icon: 'coin', text: `Earn ${money(m.target)} cash` };
    case 'click': return { icon: 'runner', text: `Run businesses by hand ${m.target} times` };
    case 'case': return { icon: 'briefcase', text: 'Open a golden briefcase' };
    case 'upgrade': return { icon: 'up', text: `Buy ${m.target} upgrades` };
    case 'spin': return { icon: 'wheel', text: 'Spin the Lucky Wheel' };
  }
  return { icon: 'clipboard', text: 'Mission' };
}
function newMission() {
  const key = m => m.type + (m.world || '') + (m.biz ?? '');
  const taken = new Set(S.missions.map(key));
  const owned = S.biz.map((b, i) => b.owned > 0 ? i : -1).filter(i => i >= 0);
  const opts = owned.map(i => {
    const o = S.biz[i].owned;
    return { type: 'own', world: S.world, biz: i, target: Math.ceil((o + Math.max(5, o * 0.2)) / 5) * 5 };
  });
  const locked = S.biz.findIndex(b => b.owned === 0);
  if (locked >= 0) opts.push({ type: 'unlock', world: S.world, biz: locked, target: 1 });
  const unmanaged = owned.find(i => !S.biz[i].manager);
  if (unmanaged !== undefined) opts.push({ type: 'hire', world: S.world, biz: unmanaged, target: 1 });
  opts.push({ type: 'earn', target: niceNum(bonusCash(300)), base: S.lifetime });
  opts.push({ type: 'click', target: 25, base: S.stats.clicks });
  opts.push({ type: 'case', target: 1, base: S.stats.briefcases });
  opts.push({ type: 'spin', target: 1, base: S.stats.spins || 0 });
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
  sfx('win');
  toast(`📋 Mission complete! +${m.gems} 💎 +${money(cash)} cash`, 'gem');
  confetti(null, 70);
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

/* ---------------------------- LEADERBOARD --------------------------- */
let lbData = null, lbState = 'idle', lbLastSent = 0, lbLastScore = -1;
function ensurePlayerId() {
  if (S.player.id) return;
  const bytes = new Uint8Array(12);
  (window.crypto || {}).getRandomValues ? crypto.getRandomValues(bytes) : bytes.forEach((_, i) => { bytes[i] = Math.random() * 256; });
  S.player.id = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}
function cleanName(s) { return String(s || '').replace(/[<>&"'`\\]/g, '').trim().slice(0, 16); }
async function lbFetch(post) {
  ensurePlayerId();
  if (post) { lbLastSent = Date.now(); lbLastScore = S.lifetime; }
  if (!lbData) lbState = 'loading';
  try {
    const res = post
      ? await fetch(LB_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: S.player.id, name: S.player.name, score: Math.floor(S.lifetime), world: S.world }) })
      : await fetch(`${LB_URL}?id=${encodeURIComponent(S.player.id)}`);
    if (!res.ok || !(res.headers.get('content-type') || '').includes('json')) throw new Error('status ' + res.status);
    lbData = await res.json();
    lbState = 'ok';
  } catch (e) {
    lbState = 'offline';
  }
  if (activeTab === 'leaderboard') renderTab();
}
function joinLeaderboard() {
  const input = $('lbName');
  const name = cleanName(input && input.value);
  if (name.length < 2) { sfx('err'); toast('Please type a name (2–16 letters).', 'bad'); return; }
  S.player.name = name;
  sfx('big');
  toast(`🏆 Welcome to the leaderboard, ${name}!`, 'good');
  lbFetch(true);
  renderTab();
}

/* ---------------------------- FX: STARS, COINS, CONFETTI ------------ */
const Stars = (() => {
  const cv = document.getElementById('stars');
  const ctx = cv ? cv.getContext('2d') : null;
  const THEMES = {
    earth: ['#ffffff', '#b9c6ff', '#ffe9a8'],
    moon: ['#ffffff', '#d7dcef', '#a9b3d6'],
    mars: ['#ffe2c7', '#ffb08a', '#ff8a5c'],
  };
  let stars = [], colors = THEMES.earth, w = 0, h = 0, dpr = 1, warpUntil = 0, px = 0, py = 0, shoot = null;
  function resize() {
    if (!cv) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    w = cv.width = innerWidth * dpr; h = cv.height = innerHeight * dpr;
    cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px';
    const n = Math.round(Math.min(220, innerWidth * innerHeight / 7000));
    stars = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, z: rand(0.2, 1), t: rand(0, 6.28), c: Math.floor(rand(0, 3)) }));
  }
  function draw(dt) {
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    const warp = Math.max(0, (warpUntil - performance.now()) / 1200);
    for (const s of stars) {
      s.t += dt * (1 + s.z * 2);
      s.y += (8 + warp * 900) * s.z * dt * dpr;
      if (s.y > h) { s.y = 0; s.x = Math.random() * w; }
      const alpha = 0.35 + 0.65 * Math.abs(Math.sin(s.t)) * s.z;
      const x = s.x + px * s.z * 18 * dpr, y = s.y + py * s.z * 18 * dpr;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = colors[s.c];
      if (warp > 0) { ctx.fillRect(x, y - warp * 40 * s.z * dpr, 1.6 * dpr * s.z, warp * 40 * s.z * dpr + 2); }
      else { ctx.beginPath(); ctx.arc(x, y, (0.5 + s.z * 1.3) * dpr, 0, 6.283); ctx.fill(); }
    }
    if (!shoot && Math.random() < dt * 0.08) shoot = { x: rand(0, w), y: rand(0, h * 0.5), vx: rand(-900, -500) * dpr, vy: rand(250, 450) * dpr, life: 0.9 };
    if (shoot) {
      shoot.life -= dt;
      const tx = shoot.x - shoot.vx * 0.08, ty = shoot.y - shoot.vy * 0.08;
      const g = ctx.createLinearGradient(shoot.x, shoot.y, tx, ty);
      g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalAlpha = Math.max(0, shoot.life);
      ctx.strokeStyle = g; ctx.lineWidth = 2 * dpr;
      ctx.beginPath(); ctx.moveTo(shoot.x, shoot.y); ctx.lineTo(tx, ty); ctx.stroke();
      shoot.x += shoot.vx * dt; shoot.y += shoot.vy * dt;
      if (shoot.life <= 0) shoot = null;
    }
    ctx.globalAlpha = 1;
  }
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', e => { px = e.clientX / innerWidth - 0.5; py = e.clientY / innerHeight - 0.5; }, { passive: true });
  resize();
  return {
    draw: REDUCED_MOTION ? () => {} : draw,
    setWorld(id) { colors = THEMES[id] || THEMES.earth; },
    warp() { warpUntil = performance.now() + 1200; },
  };
})();

const FX = (() => {
  const cv = document.getElementById('fx');
  const ctx = cv ? cv.getContext('2d') : null;
  let parts = [], dpr = 1, running = false;
  const COLORS = ['#ffc83d', '#ff9f1c', '#2fd27a', '#4da3ff', '#a874ff', '#ff6fa0', '#ffffff'];
  function resize() {
    if (!cv) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px';
  }
  function loop(last) {
    running = true;
    const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000);
    ctx.clearRect(0, 0, cv.width, cv.height);
    parts = parts.filter(p => (p.life -= dt) > 0);
    for (const p of parts) {
      p.vy += p.g * dt; p.vx *= 0.99; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
      ctx.save();
      ctx.globalAlpha = Math.min(1, p.life * 2);
      ctx.translate(p.x * dpr, p.y * dpr);
      ctx.rotate(p.r);
      ctx.fillStyle = p.c;
      if (p.kind === 'spark') { ctx.beginPath(); ctx.arc(0, 0, p.s * dpr, 0, 6.283); ctx.fill(); }
      else { ctx.scale(1, Math.abs(Math.sin(p.r * 2)) + 0.2); ctx.fillRect(-p.s * dpr, -p.s * 0.6 * dpr, p.s * 2 * dpr, p.s * 1.2 * dpr); }
      ctx.restore();
    }
    if (parts.length) requestAnimationFrame(() => loop(now));
    else { running = false; ctx.clearRect(0, 0, cv.width, cv.height); }
  }
  function add(list) {
    if (!ctx || REDUCED_MOTION) return;
    parts.push(...list);
    if (parts.length > 600) parts = parts.slice(-600);
    if (!running) loop(performance.now());
  }
  window.addEventListener('resize', resize);
  resize();
  return {
    confetti(x, y, n) {
      add(Array.from({ length: n }, () => {
        const a = rand(-Math.PI, 0), sp = rand(250, 700);
        return { kind: 'confetti', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 900, r: rand(0, 6), vr: rand(-12, 12), s: rand(3, 6), c: COLORS[Math.floor(rand(0, COLORS.length))], life: rand(1.4, 2.4) };
      }));
    },
    sparks(x, y, n) {
      add(Array.from({ length: n }, () => {
        const a = rand(0, 6.283), sp = rand(80, 260);
        return { kind: 'spark', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 200, r: 0, vr: 0, s: rand(1.5, 3), c: COLORS[Math.floor(rand(0, 3))], life: rand(0.4, 0.8) };
      }));
    },
  };
})();
function centerOf(el) {
  if (!el) return { x: innerWidth / 2, y: innerHeight * 0.35 };
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}
function confetti(el, n = 80) { const c = centerOf(el); FX.confetti(c.x, c.y, n); }
function sparkBurst(el, n = 12) { const c = centerOf(el); FX.sparks(c.x, c.y, n); }

let flyingCoins = 0, lastBump = 0;
function flyCoins(fromEl, n = 3) {
  if (REDUCED_MOTION || !fromEl || activeTab !== 'business') return;
  const target = $('cash');
  const from = centerOf(fromEl), to = centerOf(target);
  for (let k = 0; k < n && flyingCoins < 24; k++) {
    flyingCoins++;
    const c = document.createElement('img');
    c.className = 'coin-fly';
    c.src = iconUrl('coin');
    c.alt = '';
    c.onerror = () => { c.remove(); };
    document.body.appendChild(c);
    const sx = from.x + rand(-20, 20), sy = from.y + rand(-14, 14);
    const mx = (sx + to.x) / 2 + rand(-80, 80), my = Math.min(sy, to.y) - rand(40, 120);
    const anim = c.animate([
      { transform: `translate(${sx}px,${sy}px) scale(.6) rotateY(0deg)`, opacity: 0 },
      { transform: `translate(${sx}px,${sy - 30}px) scale(1) rotateY(180deg)`, opacity: 1, offset: 0.15 },
      { transform: `translate(${mx}px,${my}px) scale(.9) rotateY(540deg)`, opacity: 1, offset: 0.6 },
      { transform: `translate(${to.x}px,${to.y}px) scale(.4) rotateY(900deg)`, opacity: 0.8 },
    ], { duration: 900 + k * 90, easing: 'cubic-bezier(.4,0,.6,1)' });
    anim.onfinish = () => {
      c.remove(); flyingCoins--;
      const now = performance.now();
      if (now - lastBump > 120) { lastBump = now; restartAnim($('cash'), 'bump'); }
    };
  }
}
function coinShower(n) { flyCoins($('briefcase').classList.contains('hidden') ? $('main') : $('briefcase'), n); }
function restartAnim(el, cls) {
  if (!el) return;
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}
function shake(el) { restartAnim(el, 'shake'); }

/* ---------------------------- UI: BUSINESS CARDS -------------------- */
let cards = [];
function buildBizCards() {
  const list = $('bizList');
  list.innerHTML = BUSINESSES.map((d, i) => `
    <div class="biz" data-i="${i}" style="--d:${i * 60}ms">
      <button class="biz-icon" data-act="run" data-i="${i}" title="Run ${d.name}">
        <div class="ms"><div class="ms-fill"></div></div>
        <div class="orb-ring"></div>
        <div class="orb">${ico(d.icon, 'biz-img')}</div>
        <span class="lvl">0</span>
      </button>
      <div class="biz-body">
        <div class="biz-head"><span class="biz-name">${d.name}</span><span class="biz-tag"></span></div>
        <div class="bar" data-act="run" data-i="${i}"><div class="bar-fill"></div><div class="bar-shine"></div><span class="bar-text"></span></div>
        <div class="biz-actions">
          <button class="buy" data-act="buy" data-i="${i}"><span class="buy-n"></span><span class="buy-cost"></span></button>
          <div class="timer"></div>
        </div>
      </div>
    </div>`).join('');
  cards = [...list.children].map(el => ({
    el,
    iconWrap: el.querySelector('.orb'),
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
    if (!c) return;
    const fast = b.owned > 0 && b.manager && cycleTime(i) < 0.15;
    c.bar.classList.toggle('fast', fast);
    if (!fast) c.fill.style.transform = `scaleX(${b.running ? Math.min(1, b.progress) : 0})`;
  });
}
function updateBizText() {
  S.biz.forEach((b, i) => {
    const c = cards[i], d = BUSINESSES[i];
    if (!c) return;
    const locked = b.owned === 0;
    c.el.classList.toggle('locked', locked);
    c.el.classList.toggle('managed', b.manager);
    c.el.classList.toggle('running', b.running && !locked);
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
function payoutFx(i, amt) {
  const c = cards[i];
  if (!c || activeTab !== 'business') return;
  const f = document.createElement('span');
  f.className = 'float';
  f.textContent = '+' + money(amt);
  f.style.left = rand(45, 70) + '%';
  f.style.top = '34px';
  c.el.appendChild(f);
  setTimeout(() => f.remove(), 1000);
  restartAnim(c.iconWrap, 'pop');
  flyCoins(c.iconWrap, 2);
}
// 3D tilt on mouse hover (desktop only)
function initTilt() {
  if (REDUCED_MOTION) return;
  const list = $('bizList');
  list.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const card = e.target.closest('.biz');
    if (!card) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    card.style.setProperty('--rx', `${(-y * 8).toFixed(2)}deg`);
    card.style.setProperty('--ry', `${(x * 10).toFixed(2)}deg`);
    card.style.setProperty('--gx', `${(x + 0.5) * 100}%`);
    card.style.setProperty('--gy', `${(y + 0.5) * 100}%`);
  });
  list.addEventListener('pointerout', e => {
    const card = e.target.closest('.biz');
    if (card && !card.contains(e.relatedTarget)) { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); }
  });
}

/* ---------------------------- UI: TABS ------------------------------ */
function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab').forEach(s => s.classList.toggle('active', s.id === 'tab-' + tab));
  $('main').scrollTop = 0;
  if (tab === 'leaderboard') lbFetch(!!S.player.name && S.lifetime > lbLastScore);
  renderTab();
}
function renderTab() {
  const fn = { missions: renderMissions, managers: renderManagers, upgrades: renderUpgrades, investors: renderInvestors,
    worlds: renderWorlds, leaderboard: renderLeaderboard, shop: renderShop, awards: renderAwards, stats: renderStats, settings: renderSettings }[activeTab];
  if (fn) $('tab-' + activeTab).innerHTML = fn();
  refreshAffordability();
}
function header(icon, title, sub) {
  return `<div class="tab-head">${ico(icon, 'head-ico')}<div><h2>${title}</h2><p class="sub">${sub}</p></div></div>`;
}

function renderMissions() {
  const rows = S.missions.map(m => {
    const t = missionText(m), v = Math.min(missionValue(m), m.target), done = v >= m.target;
    const val = m.type === 'earn' ? `${money(v)} / ${money(m.target)}` : `${fmtInt(v)} / ${fmtInt(m.target)}`;
    return `<div class="row mission ${done ? 'ready' : ''}" data-mrow="${m.id}" data-done="${done ? 1 : 0}">
      <div class="ico">${ico(t.icon)}</div>
      <div class="info"><div class="title">${t.text}</div>
        <div class="mbar"><div style="width:${v / m.target * 100}%"></div></div>
        <div class="desc"><span class="mval">${val}</span> · Reward: 💎${m.gems} + 2 min income</div></div>
      ${done ? `<button class="btn gold" data-act="mclaim" data-id="${m.id}">Claim</button>`
        : `<button class="btn ghost" data-act="mskip" data-id="${m.id}" data-gems="2" title="Swap for a new mission">Skip 💎2</button>`}
    </div>`;
  }).join('');
  return header('clipboard', 'Missions', `Finish missions to win gems and cash. Completed so far: <b>${fmtInt(S.stats.missionsDone)}</b>`) +
    `<div class="list">${rows}</div>`;
}
function renderManagers() {
  const rows = BUSINESSES.map((d, i) => {
    const b = S.biz[i];
    if (b.manager) return `<div class="row done"><div class="ico">${ico(d.icon)}</div><div class="info"><div class="title">${d.manager}</div><div class="desc">Running your ${d.name}</div></div><span class="badge">✔ Hired</span></div>`;
    const note = b.owned === 0 ? `Unlock ${d.name} first` : `Automatically runs ${d.name} forever — even while you're away`;
    return `<div class="row"><div class="ico">${ico(d.icon)}</div><div class="info"><div class="title">${d.manager}</div><div class="desc">${note}</div></div>
      <button class="btn" data-act="hire" data-i="${i}" data-cost="${d.managerCost}" ${b.owned === 0 ? 'disabled' : ''}>Hire ${money(d.managerCost)}</button></div>`;
  }).join('');
  return header('manager', `Managers · ${WORLD.name}`, 'Managers run a business automatically and keep earning while you\'re offline.') + `<div class="list">${rows}</div>`;
}
function renderUpgrades() {
  const left = UPGRADES.filter(u => !S.upgrades[u.id]);
  const rows = left.slice(0, 25).map(u => `<div class="row"><div class="ico">${ico(u.icon)}</div><div class="info"><div class="title">${u.name}</div>
      <div class="desc">${u.target === -1 ? 'All businesses' : BUSINESSES[u.target].name} profit x${u.mult}</div></div>
      <button class="btn gold" data-act="upgrade" data-id="${u.id}" data-cost="${u.cost}">${money(u.cost)}</button></div>`).join('');
  return header('up', `Upgrades · ${WORLD.name}`, `Owned ${UPGRADES.length - left.length} / ${UPGRADES.length}. Each upgrade multiplies profits.`) +
    `<div class="toolbar"><span></span><button class="btn" data-act="upgrade-all">Buy all affordable</button></div>
    <div class="list">${rows || '<p class="sub">You own every upgrade in this world. Legendary!</p>'}</div>`;
}
function renderInvestors() {
  const avail = investorsAvailable();
  const rate = investorRate();
  const rows = INVESTOR_UPGRADES.map(u => S.investorUpgrades[u.id]
    ? `<div class="row done"><div class="ico">${ico(u.icon)}</div><div class="info"><div class="title">${u.name}</div><div class="desc">${u.desc}</div></div><span class="badge">✔ Owned</span></div>`
    : `<div class="row"><div class="ico">${ico(u.icon)}</div><div class="info"><div class="title">${u.name}</div><div class="desc">${u.desc}</div></div>
       <button class="btn purple" data-act="invup" data-id="${u.id}" data-inv="${u.cost}">👔 ${fmtInt(u.cost)}</button></div>`).join('');
  return header('necktie', 'Investors', `Investors join based on your lifetime earnings. Each one boosts ALL profits in every world by +${Math.round(rate * 100)}%.`) +
    `<div class="hero">
      <div><div class="stat-big">${fmtInt(S.investors)}</div><div class="stat-lbl">Current investors (+${fmt(S.investors * rate * 100)}%)</div></div>
      <div><div class="stat-big" id="invAvail">${fmtInt(avail)}</div><div class="stat-lbl">Ready to join if you restart ${WORLD.name}</div></div>
      <button class="btn gold" data-act="prestige" ${avail < 1 ? 'disabled' : ''}>Restart &amp; Claim</button>
    </div>
    <h3 class="sec">Investor Upgrades</h3><p class="sub">Spend investors on powerful permanent upgrades.</p>
    <div class="list">${rows}</div>`;
}
function renderWorlds() {
  const cardsHtml = WORLDS.map(w => {
    const unlocked = !!S.worldsUnlocked[w.id], here = S.world === w.id;
    const pct = Math.min(100, w.unlockAt ? S.lifetime / w.unlockAt * 100 : 100);
    let action;
    if (here) action = '<span class="badge">You are here</span>';
    else if (unlocked) action = `<button class="btn" data-act="travel" data-id="${w.id}">Travel</button>`;
    else if (S.lifetime >= w.unlockAt) action = `<button class="btn gold" data-act="unlock-world" data-id="${w.id}">Unlock!</button>`;
    else action = `<div class="world-lock"><div class="mbar"><div style="width:${pct}%"></div></div><small>${money(S.lifetime)} / ${money(w.unlockAt)} lifetime</small></div>`;
    const preview = w.biz.slice(0, 5).map(b => ico(b.icon)).join('');
    return `<div class="world-card w-${w.id} ${unlocked ? '' : 'locked'} ${here ? 'here' : ''}">
      <div class="planet">${ico(w.icon)}</div>
      <div class="info"><div class="title">${w.name} <span class="badge">x${w.mult} profits</span></div>
        <div class="desc">${w.desc}</div><div class="preview">${preview}</div></div>
      <div class="world-act">${action}</div></div>`;
  }).join('');
  return header('earth', 'Worlds', 'Unlock new worlds with lifetime earnings. Each world has its own businesses. Only the world you are in earns money.') +
    `<div class="worlds">${cardsHtml}</div>`;
}
function renderLeaderboard() {
  if (!S.player.name) {
    return header('trophy', 'Leaderboard', 'Compete with players around the world. Your score is your lifetime earnings.') +
      `<div class="join-card">${ico('person', 'big-ico')}
        <h3>Choose your boss name</h3>
        <input id="lbName" maxlength="16" placeholder="Your name" autocomplete="nickname">
        <button class="btn gold" data-act="lb-join">Join leaderboard</button>
        <p class="sub">Only your name, score and current world are shared.</p></div>`;
  }
  let body;
  if (lbState === 'offline') {
    body = `<div class="join-card">${ico('earth', 'big-ico')}<h3>Leaderboard is offline</h3>
      <p class="sub">The leaderboard works on the online version of the game. Check your internet and try again.</p>
      <button class="btn" data-act="lb-refresh">Try again</button></div>`;
  } else if (!lbData) {
    body = `<div class="join-card"><div class="loader"></div><p class="sub">Loading players…</p></div>`;
  } else {
    const rows = lbData.top.map(p => {
      const medal = p.rank === 1 ? ico('gold') : p.rank === 2 ? ico('silver') : p.rank === 3 ? ico('bronze') : `<b class="rank-n">#${p.rank}</b>`;
      return `<div class="lb-row ${p.me ? 'me' : ''} ${p.rank <= 3 ? 'top' : ''}"><div class="lb-rank">${medal}</div>
        <div class="lb-name">${esc(p.name)}${p.me ? ' <span class="badge">You</span>' : ''}</div>
        <div class="lb-world">${ico(worldDef(p.world).icon)}</div><div class="lb-score">${money(p.score)}</div></div>`;
    }).join('') || '<p class="sub">No players yet. Be the first!</p>';
    body = `<div class="lb-me">${ico('person')}<div><b>${esc(S.player.name)}</b><br><small>Rank ${lbData.myRank ? '#' + lbData.myRank : '—'} of ${fmtInt(lbData.players)}</small></div>
      <div class="lb-actions"><button class="btn ghost" data-act="lb-rename">Rename</button><button class="btn" data-act="lb-refresh">Refresh</button></div></div>
      <div class="lb-list">${rows}</div>`;
  }
  return header('trophy', 'Leaderboard', 'Top bosses by lifetime earnings. Your score updates every minute.') + body;
}
function renderShop() {
  const rows = GEM_SHOP.map(g => {
    const c = gemCost(g);
    let extra = '';
    if (g.id === 'golden') extra = ` <span class="badge">${S.gemGolden}/3</span>`;
    if (g.id === 'offline') extra = ` <span class="badge">now ${fmtDur(OFFLINE_CAPS[S.offlineLvl])}</span>`;
    if (g.id.startsWith('warp')) extra = ` <span class="badge">≈ ${money(bonusCash(g.id === 'warp1' ? 3600 : 86400))}</span>`;
    return `<div class="row"><div class="ico">${ico(g.icon)}</div><div class="info"><div class="title">${g.name}${extra}</div><div class="desc">${g.desc}</div></div>
      ${c == null ? '<span class="badge">✔ Maxed</span>' : `<button class="btn blue" data-act="gem" data-id="${g.id}" data-gems="${c}">💎 ${c}</button>`}</div>`;
  }).join('');
  return header('gem', 'Gem Shop', `Earn gems from awards, missions, daily rewards and the Lucky Spin. You have <b>${fmtInt(S.gems)}</b> 💎.`) +
    `<div class="row spin-row"><div class="ico">${ico('wheel')}</div><div class="info"><div class="title">Lucky Spin</div><div class="desc">Free spin every 4 hours, or spin any time for 💎${SPIN_GEM_COST}.</div></div>
      <button class="btn gold" data-act="spin">Open wheel</button></div>
    <div class="list">${rows}</div>`;
}
function renderAwards() {
  const got = ACHIEVEMENTS.filter(a => S.achievements[a.id]).length;
  const cells = ACHIEVEMENTS.map(a => `<div class="award ${S.achievements[a.id] ? '' : 'locked'}">${ico(a.icon)}
    <div><div class="title">${a.name}</div><div class="desc">${a.desc} · 💎${a.gems}</div></div></div>`).join('');
  return header('medal', 'Awards', `Unlocked ${got} / ${ACHIEVEMENTS.length}. Each award grants gems.`) + `<div class="grid-awards">${cells}</div>`;
}
function renderStats() {
  const owned = S.biz.reduce((a, b) => a + b.owned, 0);
  const rows = [
    ['World', `${WORLD.name} (x${WORLD.mult})`],
    ['Cash', money(S.cash)],
    ['Income (managed)', money(incomePerSec()) + ' /s'],
    ['Total profit multiplier', 'x' + fmt(globalMult())],
    ['Earned this run', money(S.runEarnings)],
    ['Best run', money(Math.max(S.stats.bestRun, S.runEarnings))],
    ['Lifetime earnings', money(S.lifetime)],
    ['Businesses owned (this world)', fmtInt(owned)],
    ['Managers hired (this world)', S.biz.filter(b => b.manager).length + ' / ' + BUSINESSES.length],
    ['Worlds unlocked', Object.keys(S.worldsUnlocked).length + ' / ' + WORLDS.length],
    ['Upgrades bought (all time)', fmtInt(S.stats.upgradesBought)],
    ['Restarts', fmtInt(S.stats.prestiges)],
    ['Lucky spins', fmtInt(S.stats.spins || 0)],
    ['Golden briefcases opened', fmtInt(S.stats.briefcases)],
    ['Manual runs', fmtInt(S.stats.clicks)],
    ['Awards', Object.keys(S.achievements).length + ' / ' + ACHIEVEMENTS.length],
    ['Play time', fmtDur(S.stats.playTime)],
  ];
  return header('bars', 'Stats', 'Your empire at a glance.') +
    `<table class="stats-table">${rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table>`;
}
function renderSettings() {
  const row = (icon, title, desc, btn) => `<div class="row setting"><div class="ico">${ico(icon)}</div><div class="info"><div class="title">${title}</div>${desc ? `<div class="desc">${desc}</div>` : ''}</div>${btn}</div>`;
  return header('gear', 'Settings', `Progress saves automatically in this browser. · Version ${GAME_VERSION}`) +
    `<div class="list">
      ${row('phone', 'Install as app', 'Add Business Empire to your phone or PC home screen. Works offline.', '<button class="btn gold" data-act="install">Install</button>')}
      ${row('speaker', 'Sound effects', '', `<button class="btn ghost" data-act="sound">${S.settings.sound ? 'On' : 'Off'}</button>`)}
      ${row('numbers', 'Number format', S.settings.notation === 'sci' ? 'Scientific (1.23e15)' : 'Suffixes (1.23 Qa)', '<button class="btn ghost" data-act="notation">Switch</button>')}
      ${row('disk', 'Save now', '', '<button class="btn ghost" data-act="save">Save</button>')}
      ${row('refresh', 'Export / Import save', 'Move your progress to another browser.', '<div class="btn-pair"><button class="btn ghost" data-act="export">Export</button><button class="btn ghost" data-act="import">Import</button></div>')}
      ${row('trash', 'Hard reset', 'Wipes ALL progress including investors, worlds and gems.', '<button class="btn red" data-act="reset">Reset</button>')}
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
  $('dot-investors').classList.toggle('on', investorsAvailable() >= Math.max(10, S.investors));
  $('dot-missions').classList.toggle('on', S.missions.some(m => missionValue(m) >= m.target));
  $('dot-worlds').classList.toggle('on', WORLDS.some(w => !S.worldsUnlocked[w.id] && S.lifetime >= w.unlockAt));
  $('dot-daily').classList.toggle('on', canClaimDaily());
  $('dot-spin').classList.toggle('on', spinReady());
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
  setHTML(hb, ico('megaphone') + (S.boosts.hypeCd > 0 ? ` Hype <small>${fmtClock(S.boosts.hypeCd)}</small>` : ' Hype! <small>x2 · 2m</small>'));

  const chips = [];
  if (S.boosts.hype > 0) chips.push(`<span class="chip pink">📣 x2 · ${fmtClock(S.boosts.hype)}</span>`);
  if (S.boosts.rush > 0) chips.push(`<span class="chip blue">⚡ x2 · ${fmtClock(S.boosts.rush)}</span>`);
  if (S.boosts.golden > 0) chips.push(`<span class="chip gold">✨ x5 · ${fmtClock(S.boosts.golden)}</span>`);
  if (marketEvent) chips.push(`<span class="chip hot">📈 ${emo(BUSINESSES[marketEvent.biz].icon)} x3 · ${fmtClock(marketEvent.remaining)}</span>`);
  chips.push(`<span class="chip total">Total x${fmt(globalMult())}</span>`);
  setHTML($('chips'), chips.join(''));

  document.querySelectorAll('#buymode button').forEach(b => b.classList.toggle('active', b.dataset.mode === S.settings.buyMode));
  const si = $('spinInfo');
  if (si && !spinning) {
    si.textContent = spinInfoText();
    const free = $('spinFree');
    if (free) free.disabled = !spinReady();
  }
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
  if (Math.random() < 0.3) setHeadline(`Analysts value your ${WORLD.name} empire's income at ${money(incomePerSec())} per second.`);
  else setHeadline(HEADLINES[headlineIdx++ % HEADLINES.length]);
}

/* ---------------------------- INPUT --------------------------------- */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el) { if (e.target.id === 'modal' && !spinning) closeModal(); return; }
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
    case 'spin': if (!spinning) modal(spinHtml()); break;
    case 'spin-go': doSpin(false); break;
    case 'spin-paid': doSpin(true); break;
    case 'travel': travelTo(id); break;
    case 'unlock-world': unlockWorld(id); break;
    case 'lb-join': joinLeaderboard(); break;
    case 'lb-refresh': lbFetch(S.lifetime > lbLastScore); renderTab(); break;
    case 'lb-rename': S.player.name = ''; renderTab(); break;
    case 'mclaim': claimMission(id); renderTab(); break;
    case 'mskip': skipMission(id); renderTab(); break;
    case 'install':
      if (installPrompt) {
        installPrompt.prompt();
        installPrompt.userChoice.finally(() => { installPrompt = null; $('installBtn').classList.add('hidden'); });
      } else {
        modal(`${ico('phone', 'big-ico')}<h3>Install as an app</h3>
          <p><b>Android (Chrome):</b> tap ⋮ menu → <b>Install app</b> / <b>Add to Home screen</b>.<br>
          <b>iPhone (Safari):</b> tap Share ⬆️ → <b>Add to Home Screen</b>.<br>
          <b>PC (Chrome / Edge):</b> click the install icon in the address bar.</p>
          <div class="modal-actions"><button class="btn gold" data-act="close">Got it</button></div>`);
      }
      break;
    case 'briefcase': openBriefcase(); break;
    case 'close': if (!spinning) closeModal(); break;
    case 'offline-ok': closeModal(); break;
    case 'offline-x2':
      if (S.gems >= 5 && pendingOffline > 0) { S.gems -= 5; earn(pendingOffline); toast(`🌙 Doubled! +${money(pendingOffline)}`, 'gem'); sfx('big'); coinShower(16); }
      pendingOffline = 0; closeModal(); break;
    case 'sound': S.settings.sound = !S.settings.sound; renderTab(); break;
    case 'notation': S.settings.notation = S.settings.notation === 'sci' ? 'suffix' : 'sci'; renderTab(); updateBizText(); break;
    case 'save': save(); toast('💾 Game saved.', 'good'); break;
    case 'export': {
      save();
      const code = btoa(unescape(encodeURIComponent(JSON.stringify(S))));
      modal(`<h3>Export Save</h3><p>Copy this code and keep it safe.</p><textarea readonly id="exportBox">${code}</textarea>
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
      modal(`<h3>Import Save</h3><p>Paste a save code. This replaces your current progress.</p><textarea id="importBox"></textarea>
        <div class="modal-actions"><button class="btn ghost" data-act="close">Cancel</button><button class="btn" data-act="import-ok">Import</button></div>`);
      break;
    case 'import-ok':
      try {
        S = mergeState(JSON.parse(decodeURIComponent(escape(atob($('importBox').value.trim())))));
        applyWorld(S.world); ensureMissions();
        save(); closeModal(); buildBizCards(); switchTab('business'); toast('📥 Save imported!', 'good');
      } catch (err) { toast('That save code is not valid.', 'bad'); }
      break;
    case 'reset':
      modal(`${ico('trash', 'big-ico')}<h3>Erase everything?</h3><p>This permanently deletes all progress, worlds, investors, gems and awards.</p>
        <div class="modal-actions"><button class="btn ghost" data-act="close">Cancel</button><button class="btn red" data-act="reset-ok">Erase</button></div>`);
      break;
    case 'reset-ok':
      S = defaultState(); applyWorld('earth'); ensureMissions(); marketEvent = null; save(); closeModal(); buildBizCards(); switchTab('business'); toast('Fresh start!', 'good');
      break;
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !spinning) closeModal();
  if (e.key === 'Enter' && e.target.id === 'lbName') joinLeaderboard();
});

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
      if (ct >= 0.8 && dt < 1) payoutFx(i, amt);
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
  Stars.draw(Math.min(dt, 0.05));
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
    const lbWait = lbState === 'offline' ? 300000 : 60000;
    if (S.player.name && Date.now() - lbLastSent > lbWait && S.lifetime > lbLastScore) lbFetch(true);
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
  modal(`${ico('crescent', 'big-ico')}<h3>Welcome back, boss!</h3>
    <p>You were away for <b>${fmtDur(away)}</b>${away > counted ? ` (capped at ${fmtDur(counted)})` : ''}.<br>Your ${WORLD.name} managers earned</p>
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
hydrateIcons();
applyWorld(S.world);
ensureMissions();
ensurePlayerId();
buildBizCards();
initTilt();
updateHeader();
updateDots();
if (hadSave) offlineEarnings();
else modal(`${ico('city', 'big-ico')}<h3>Welcome to Business Empire!</h3>
  <p>Tap your <b>Tea Stall</b> to earn cash. Buy more businesses, hire <b>managers</b>, grab <b>upgrades</b>, spin the <b>Lucky Wheel</b>, travel to the <b>Moon and Mars</b>, and climb the <b>leaderboard</b>!</p>
  <div class="modal-actions"><button class="btn gold" data-act="close">Let's build!</button></div>`);
if (canClaimDaily()) queueModal(dailyHtml());
window.addEventListener('beforeunload', save);
document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
requestAnimationFrame(frame);
