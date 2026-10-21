'use strict';
/* =====================================================================
   BUSINESS EMPIRE — idle business game (English + తెలుగు)
   ===================================================================== */

const SAVE_KEY = 'tycoonEmpire.save.v1';
const GAME_VERSION = '3.8';
const LB_URL = '/api/leaderboard';
const CLOUD_URL = '/api/cloud';
let S = null; // game state, initialised below
const SUF = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'UDc', 'DDc', 'TDc', 'QaDc', 'QiDc', 'SxDc', 'SpDc', 'OcDc', 'NoDc', 'Vg', 'UVg', 'DVg', 'TVg', 'QaVg', 'QiVg', 'SxVg', 'SpVg', 'OcVg', 'NoVg', 'Tg'];
const REDUCED_MOTION = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
// Decorative effects (stars, confetti, flying coins...) are skipped in battery saver mode
function fxOff() { return REDUCED_MOTION || !!(S && S.settings && S.settings.lowfx); }
function applyLowFx() { document.body.classList.toggle('lowfx', fxOff()); Stars.clear(); }

/* ---------------------------- LANGUAGE ------------------------------ */
function isTe() { return !!(S && S.settings && S.settings.lang === 'te'); }
// Pick the English or Telugu version of a piece of text
function tr(en, te) { return isTe() ? te : en; }
// Data objects carry an optional `te` name next to `name`
function nm(obj) { return isTe() && obj.te ? obj.te : obj.name; }
function applyStaticText() {
  document.documentElement.lang = isTe() ? 'te' : 'en';
  document.querySelectorAll('[data-t]').forEach(el => {
    const [en, te] = el.dataset.t.split('|');
    el.textContent = isTe() ? te : en;
  });
}

/* ---------------------------- 3D ICONS ------------------------------ */
// Microsoft Fluent 3D emoji (MIT), resized to 160px WebP and served from icons/3d/<key>.webp.
// The names below are the Fluent asset names they came from. Falls back to the plain emoji if an image fails.
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
  speech: ['Speech balloon', '💬'], cloud: ['Cloud', '☁️'], link: ['Link', '🔗'], outbox: ['Outbox tray', '📤'], inbox: ['Inbox tray', '📥'],
  key: ['Key', '🔑'], letter: ['Love letter', '💌'],
  kite: ['Kite', '🪁'], diya: ['Diya lamp', '🪔'], xmas: ['Christmas tree', '🎄'], fireworks: ['Fireworks', '🎆'], sparkler: ['Sparkler', '🎇'],
  elephant: ['Elephant', '🐘'], bow: ['Bow and arrow', '🏹'], mango: ['Mango', '🥭'], lotus: ['Lotus', '🪷'], hibiscus: ['Hibiscus', '🌺'],
  note: ['Musical note', '🎵'], notes: ['Musical notes', '🎶'], hand: ['Backhand index pointing down', '👇', 1], people: ['Busts in silhouette', '👥'],
  calendar: ['Spiral calendar', '🗓️'], grad: ['Graduation cap', '🎓'],
  swords: ['Crossed swords', '⚔️'], dog: ['Dog face', '🐶'], cat: ['Cat face', '🐱'], rabbit: ['Rabbit face', '🐰'], panda: ['Panda', '🐼'],
  fox: ['Fox', '🦊'], owl: ['Owl', '🦉'], unicorn: ['Unicorn', '🦄'], dragon: ['Dragon', '🐉'], lion: ['Lion', '🦁'], tiger: ['Tiger face', '🐯'],
  peacock: ['Peacock', '🦚'], turtle: ['Turtle', '🐢'], heart: ['Red heart', '❤️'], sparkheart: ['Sparkling heart', '💖'], bone: ['Bone', '🦴'],
  paws: ['Paw prints', '🐾'], bowl: ['Bowl with spoon', '🥣'],
  dizzy: ['Dizzy', '💫'], alienm: ['Alien monster', '👾'], crystal: ['Crystal ball', '🔮'], atom: ['Atom symbol', '⚛️'], magnet: ['Magnet', '🧲'],
  starplain: ['Star', '⭐'], hole: ['Hole', '🕳️'], dna: ['Dna', '🧬'], wand: ['Magic wand', '🪄'], shooting: ['Shooting star', '🌠'],
  sunface: ['Sun with face', '🌞'], nightstars: ['Night with stars', '🌃'],
  ticket: ['Ticket', '🎫'], slot: ['Slot machine', '🎰'], mosque: ['Mosque', '🕌'], castle: ['Castle', '🏰'], htemple: ['Hindu temple', '🛕'], classical: ['Classical building', '🏛️'], construction: ['Building construction', '🏗️'], worldmap: ['World map', '🗺️'], island: ['Desert island', '🏝️'], cow: ['Cow', '🐄'], rooster: ['Rooster', '🐓'], sheaf: ['Sheaf of rice', '🌾'], ox: ['Ox', '🐂'], goat: ['Goat', '🐐'], coconut: ['Coconut', '🥥'], curry: ['Curry rice', '🍛'], ricebowl: ['Cooked rice', '🍚'], flatbread: ['Flatbread', '🫓'], pancakes: ['Pancakes', '🥞'], riceball: ['Rice ball', '🍙'], doughnut: ['Doughnut', '🍩'], custard: ['Custard', '🍮'], candy: ['Candy', '🍬'], pepper: ['Hot pepper', '🌶️'], firecracker: ['Firecracker', '🧨'], monkey: ['Monkey', '🐒'], parrot: ['Parrot', '🦜'], snake: ['Snake', '🐍'], deer: ['Deer', '🦌'], mountain: ['Snow-capped mountain', '🏔️'], beach: ['Beach with umbrella', '🏖️'], train: ['Locomotive', '🚂'], stadium: ['Stadium', '🏟️'], album: ['Notebook with decorative cover', '📔'], pack: ['Package', '📦'], battery: ['Battery', '🔋'], pig: ['Pig face', '🐷'], moneybag: ['Money bag', '💰'], hammer: ['Hammer', '🔨'], cherry: ['Cherries', '🍒'], chartdown: ['Chart decreasing', '📉'], tv: ['Television', '📺'], shield: ['Shield', '🛡️'], page: ['Page with curl', '📃'],
};
function iconUrl(key) { return ICONS[key] ? `icons/3d/${key}.webp` : ''; }
function emo(key) { return (ICONS[key] || [])[1] || '❔'; }
function ico(key, cls = '') {
  return `<span class="i3d ${cls}" data-e="${emo(key)}"><img src="${iconUrl(key)}" alt="" draggable="false" decoding="async" onerror="this.parentNode.classList.add('fail')"></span>`;
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
  { id: 'earth', name: 'Earth', te: 'భూమి', icon: 'earth', mult: 1, unlockAt: 0,
    desc: ['Where every empire begins.', 'ప్రతి సామ్రాజ్యం ఇక్కడే మొదలవుతుంది.'], biz: [
    ['tea', 'Tea Stall', 'టీ స్టాల్', 'tea', 'Chai Charlie'], ['truck', 'Food Truck', 'ఫుడ్ ట్రక్', 'truck', 'Taco Tina'],
    ['coffee', 'Coffee Shop', 'కాఫీ షాప్', 'coffee', 'Barista Bob'], ['bakery', 'Bakery', 'బేకరీ', 'bakery', 'Baker Bella'],
    ['gym', 'Fitness Gym', 'ఫిట్‌నెస్ జిమ్', 'gym', 'Coach Max'], ['hotel', 'Hotel Chain', 'హోటల్ చైన్', 'hotel', 'Concierge Clara'],
    ['tech', 'Tech Startup', 'టెక్ స్టార్టప్', 'tech', 'Hacker Hiro'], ['studio', 'Film Studio', 'ఫిల్మ్ స్టూడియో', 'studio', 'Director Dev'],
    ['airline', 'Airline', 'ఎయిర్‌లైన్', 'airline', 'Captain Ava'], ['space', 'Space Agency', 'స్పేస్ ఏజెన్సీ', 'space', 'Commander Zed']] },
  { id: 'moon', name: 'Moon', te: 'చంద్రుడు', icon: 'moon', mult: 3, unlockAt: 1e12,
    desc: ['Low gravity, high profits. Everything earns x3.', 'తక్కువ గురుత్వం, ఎక్కువ లాభం. ఇక్కడ అన్నీ x3 సంపాదిస్తాయి.'], biz: [
    ['cheese', 'Moon Cheese Mine', 'చంద్ర చీజ్ గని', 'cheese', 'Cheddar Chen'], ['taxi', 'UFO Taxi', 'UFO టాక్సీ', 'ufo', 'Zippy Zoe'],
    ['huts', 'Crater Huts', 'క్రేటర్ గుడిసెలు', 'hut', 'Dusty Dan'], ['rock', 'Moon Rock Shop', 'చంద్ర రాళ్ల షాప్', 'rock', 'Rocky Raj'],
    ['helium', 'Helium Balloons', 'హీలియం బెలూన్లు', 'balloon', 'Floaty Fay'], ['farm', 'Dome Farm', 'డోమ్ వ్యవసాయం', 'seedling', 'Sprout Sam'],
    ['solar', 'Solar Array', 'సోలార్ ప్లాంట్', 'sun', 'Sunny Sol'], ['robot', 'Robot Factory', 'రోబో ఫ్యాక్టరీ', 'robot', 'Bolt-9'],
    ['scope', 'Star Observatory', 'నక్షత్ర వేధశాల', 'telescope', 'Stella Vega'], ['sat', 'Satellite Network', 'శాటిలైట్ నెట్‌వర్క్', 'satellite', 'Orbit Omar']] },
  { id: 'mars', name: 'Mars', te: 'అంగారకుడు', icon: 'mars', mult: 10, unlockAt: 1e18,
    desc: ['The red frontier. Everything earns x10.', 'ఎర్ర గ్రహం. ఇక్కడ అన్నీ x10 సంపాదిస్తాయి.'], biz: [
    ['sand', 'Red Sand Shop', 'ఎర్ర ఇసుక షాప్', 'desert', 'Sandy Sara'], ['rover', 'Rover Rentals', 'రోవర్ రెంటల్స్', 'tractor', 'Rusty Rex'],
    ['oxygen', 'Oxygen Bar', 'ఆక్సిజన్ బార్', 'bubbles', 'Airy Ana'], ['ice', 'Polar Ice Mine', 'ధ్రువ మంచు గని', 'ice', 'Frosty Finn'],
    ['volcano', 'Olympus Tours', 'ఒలింపస్ టూర్స్', 'volcano', 'Lava Leo'], ['zoo', 'Alien Zoo', 'ఏలియన్ జూ', 'alien', 'Zorg'],
    ['crystal', 'Crystal Mine', 'స్ఫటిక గని', 'gem', 'Gemma Ray'], ['terra', 'Terraformer', 'టెర్రాఫార్మర్', 'tree', 'Forest Fang'],
    ['comet', 'Comet Catchers', 'తోకచుక్క వేటగాళ్లు', 'comet', 'Halley Hu'], ['bank', 'Galaxy Bank', 'గెలాక్సీ బ్యాంక్', 'galaxy', 'Cosmo Cruz']] },
  { id: 'galaxy', name: 'Galaxy', te: 'గెలాక్సీ', icon: 'shooting', mult: 50, unlockAt: 1e24,
    desc: ['The final frontier. Everything earns x50.', 'చివరి సరిహద్దు. ఇక్కడ అన్నీ x50 సంపాదిస్తాయి.'], biz: [
    ['dust', 'Stardust Shop', 'నక్షత్ర ధూళి షాప్', 'dizzy', 'Nova Nia'], ['food', 'Alien Food Court', 'ఏలియన్ ఫుడ్ కోర్ట్', 'alienm', 'Gloop'],
    ['orb', 'Crystal Ball Readers', 'క్రిస్టల్ బాల్ జ్యోతిష్యం', 'crystal', 'Madame Orb'], ['atom', 'Atom Reactor', 'అణు రియాక్టర్', 'atom', 'Proton Pat'],
    ['grav', 'Gravity Gym', 'గ్రావిటీ జిమ్', 'magnet', 'Newton Ned'], ['starf', 'Star Factory', 'నక్షత్రాల ఫ్యాక్టరీ', 'starplain', 'Stella Star'],
    ['worm', 'Wormhole Travel', 'వార్మ్‌హోల్ ట్రావెల్', 'hole', 'Warp Wu'], ['dna', 'DNA Labs', 'DNA ల్యాబ్స్', 'dna', 'Helix Hana'],
    ['magic', 'Magic Academy', 'మ్యాజిక్ అకాడమీ', 'wand', 'Merlin Moe'], ['ubank', 'Universe Bank', 'విశ్వ బ్యాంక్', 'sunface', 'Cosmo King']] },
].map(w => Object.assign(w, {
  biz: w.biz.map(([id, name, te, icon, manager], i) => {
    const [baseCost, costMult, time, revenue, managerCost] = BIZ_CURVE[i];
    return { id, name, te, icon, manager, baseCost, costMult, time, revenue, managerCost };
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

const UPGRADE_TIERS = [
  ['Marketing Blitz', 'మార్కెటింగ్ బ్లిట్జ్'], ['Premium Supplies', 'ప్రీమియం సరుకులు'], ['Franchise Deal', 'ఫ్రాంచైజ్ డీల్'],
  ['Celebrity Endorsement', 'సెలబ్రిటీ ప్రచారం'], ['Global Expansion', 'ప్రపంచ విస్తరణ'], ['AI Automation', 'AI ఆటోమేషన్'], ['Total Monopoly', 'పూర్తి ఆధిపత్యం'],
];
function makeUpgrades(bizList) {
  const list = [];
  UPGRADE_TIERS.forEach((tier, t) => {
    bizList.forEach((b, i) => list.push({ id: `u${t}_${b.id}`, tier: t, target: i, mult: 3,
      cost: 2.5e5 * Math.pow(12, i) * Math.pow(1e8, t), icon: b.icon }));
    list.push({ id: `u${t}_all`, tier: t, target: -1, mult: 3, cost: 2.5e5 * Math.pow(12, 10) * Math.pow(1e8, t), icon: 'earth' });
  });
  return list.sort((a, b) => a.cost - b.cost);
}
function upgName(u) {
  const tier = tr(...UPGRADE_TIERS[u.tier]);
  return u.target === -1 ? tr(`Empire-wide ${tier}`, `సామ్రాజ్యమంతా ${tier}`) : `${nm(BUSINESSES[u.target])}: ${tier}`;
}
let UPGRADES = makeUpgrades(BUSINESSES);

const INVESTOR_UPGRADES = [
  { id: 'seed',    cost: 50,    type: 'start', value: 25e3, icon: 'seedling', t: ['Seed Capital', 'Start every new run with 25K cash', 'సీడ్ క్యాపిటల్', 'ప్రతి కొత్త రన్ 25K క్యాష్‌తో మొదలవుతుంది'] },
  { id: 'angel',   cost: 150,   type: 'profit', mult: 3, icon: 'star',   t: ['Angel Round', 'All profits x3', 'ఏంజెల్ రౌండ్', 'అన్ని లాభాలు x3'] },
  { id: 'logi',    cost: 600,   type: 'speed', mult: 2, icon: 'truck',   t: ['Faster Logistics', 'All businesses run 2x faster', 'వేగవంతమైన రవాణా', 'అన్ని వ్యాపారాలు 2x వేగంగా'] },
  { id: 'seriesA', cost: 3000,  type: 'profit', mult: 3, icon: 'chart',  t: ['Series A', 'All profits x3', 'సిరీస్ A', 'అన్ని లాభాలు x3'] },
  { id: 'rel',     cost: 12000, type: 'rate', value: 0.03, icon: 'necktie', t: ['Investor Relations', 'Each investor gives +3% (was +2%)', 'ఇన్వెస్టర్ రిలేషన్స్', 'ప్రతి ఇన్వెస్టర్ +3% (ఇంతకు ముందు +2%)'] },
  { id: 'seriesB', cost: 6e4,   type: 'profit', mult: 5, icon: 'office', t: ['Series B', 'All profits x5', 'సిరీస్ B', 'అన్ని లాభాలు x5'] },
  { id: 'express', cost: 3e5,   type: 'speed', mult: 2, icon: 'bolt',    t: ['Express Everything', 'All businesses run 2x faster', 'అంతా ఎక్స్‌ప్రెస్', 'అన్ని వ్యాపారాలు 2x వేగంగా'] },
  { id: 'board',   cost: 2e6,   type: 'rate', value: 0.05, icon: 'bulb', t: ['Visionary Board', 'Each investor gives +5%', 'దూరదృష్టి బోర్డు', 'ప్రతి ఇన్వెస్టర్ +5%'] },
  { id: 'ipo',     cost: 1e7,   type: 'profit', mult: 10, icon: 'bell',  t: ['IPO', 'All profits x10', 'IPO', 'అన్ని లాభాలు x10'] },
  { id: 'empire',  cost: 1e9,   type: 'profit', mult: 25, icon: 'earth', t: ['Global Conglomerate', 'All profits x25', 'గ్లోబల్ కాంగ్లోమరేట్', 'అన్ని లాభాలు x25'] },
];
function invText(u) { return isTe() ? [u.t[2], u.t[3]] : [u.t[0], u.t[1]]; }

const GEM_SHOP = [
  { id: 'rush',    icon: 'bolt',      cost: 10,            t: ['Profit Rush', 'x2 all profits for 15 minutes (stacks time)', 'ప్రాఫిట్ రష్', '15 నిమిషాలు అన్ని లాభాలు x2'] },
  { id: 'warp1',   icon: 'hourglass', cost: 20,            t: ['Time Warp: 1 Hour', 'Instantly earn 1 hour of income', 'టైమ్ వార్ప్: 1 గంట', '1 గంట ఆదాయం వెంటనే పొందండి'] },
  { id: 'warp24',  icon: 'stopwatch', cost: 200,           t: ['Time Warp: 1 Day', 'Instantly earn 24 hours of income', 'టైమ్ వార్ప్: 1 రోజు', '24 గంటల ఆదాయం వెంటనే పొందండి'] },
  { id: 'golden',  icon: 'crown',     cost: [100, 300, 900], t: ['Golden Touch', 'PERMANENT x2 all profits (max 3)', 'గోల్డెన్ టచ్', 'శాశ్వతంగా అన్ని లాభాలు x2 (గరిష్టం 3)'] },
  { id: 'offline', icon: 'crescent',  cost: [40, 120],     t: ['Night Shift', 'Offline earnings cap: 2h → 8h → 24h', 'నైట్ షిఫ్ట్', 'ఆఫ్‌లైన్ సంపాదన పరిమితి: 2గం → 8గం → 24గం'] },
];
const OFFLINE_CAPS = [2 * 3600, 8 * 3600, 24 * 3600];

const SPIN_PRIZES = [
  { icon: 'coin',      t: ['5 min income', '5 నిమి ఆదాయం'],    w: 22, color: '#22b86a', give: () => cashPrize(300) },
  { icon: 'gem',       t: ['3 Gems', '3 జెమ్స్'],               w: 18, color: '#2f7fe0', give: () => { S.gems += 3; return tr('+3 gems', '+3 జెమ్స్'); } },
  { icon: 'bolt',      t: ['x2 for 5m', '5 నిమి x2'],            w: 16, color: '#e8920f', give: () => { S.boosts.rush += 300; return tr('x2 profits for 5 minutes', '5 నిమిషాలు x2 లాభాలు'); } },
  { icon: 'coin',      t: ['30 min income', '30 నిమి ఆదాయం'],  w: 12, color: '#159052', give: () => cashPrize(1800) },
  { icon: 'gem',       t: ['10 Gems', '10 జెమ్స్'],             w: 10, color: '#1d5fc0', give: () => { S.gems += 10; return tr('+10 gems', '+10 జెమ్స్'); } },
  { icon: 'sparkles',  t: ['x5 for 30s', '30 సె x5'],            w: 12, color: '#8a4fe6', give: () => { S.boosts.golden += 30; return tr('x5 profits for 30 seconds', '30 సెకన్లు x5 లాభాలు'); } },
  { icon: 'hourglass', t: ['1 hour income', '1 గంట ఆదాయం'],    w: 7,  color: '#d9417a', give: () => cashPrize(3600) },
  { icon: 'crown',     t: ['JACKPOT 50 Gems', 'జాక్‌పాట్ 50 జెమ్స్'], w: 3, color: '#d93445', big: true, give: () => { S.gems += 50; return tr('JACKPOT! +50 gems', 'జాక్‌పాట్! +50 జెమ్స్'); } },
];
function cashPrize(secs) { const a = bonusCash(secs); earn(a); return tr(`+${money(a)} cash`, `+${money(a)} క్యాష్`); }
const SPIN_COOLDOWN = 4 * 3600 * 1000;
const SPIN_GEM_COST = 5;

function worldDef(id) { return WORLDS.find(w => w.id === id) || WORLDS[0]; }
function worldBiz(id) {
  if (id === S.world) return S.biz;
  return S.worldRuns[id] ? S.worldRuns[id].biz : null;
}

const ACHIEVEMENTS = (() => {
  const list = [];
  const add = (id, icon, gems, name, desc, test) => list.push({ id, icon, gems, name, desc, test });
  const titles = [['Owner', 'ఓనర్'], ['Mogul', 'మొగల్'], ['Baron', 'బారన్'], ['Magnate', 'మాగ్నెట్'], ['Legend', 'లెజెండ్']];
  WORLDS[0].biz.forEach((b, i) => [25, 100, 250, 500, 1000].forEach((n, k) => add(
    `own_${b.id}_${n}`, b.icon, [2, 3, 5, 8, 15][k],
    () => `${nm(b)} ${tr(...titles[k])}`,
    () => tr(`Own ${n} ${b.name}s on Earth`, `భూమిపై ${n} ${b.te} కొనండి`),
    () => { const bz = worldBiz('earth'); return !!bz && bz[i].owned >= n; })));
  [[1e3, 'First Grand', 'మొదటి వెయ్యి'], [1e6, 'Millionaire', 'మిలియనీర్'], [1e9, 'Billionaire', 'బిలియనీర్'], [1e12, 'Trillionaire', 'ట్రిలియనీర్'],
   [1e15, 'Quadrillionaire', 'క్వాడ్రిలియనీర్'], [1e18, 'Quintillionaire', 'క్విన్టిలియనీర్'], [1e24, 'Septillionaire', 'సెప్టిలియనీర్'],
   [1e30, 'Nonillionaire', 'నానిలియనీర్'], [1e40, 'Off the Charts', 'లెక్కలకు అందని'], [1e60, 'Infinite Wealth', 'అనంత సంపద']]
    .forEach(([n, en, te], k) => add(`earn_${k}`, 'coin', 3 + k * 2, () => tr(en, te),
      () => tr(`Earn ${money(n)} lifetime`, `మొత్తం ${money(n)} సంపాదించండి`), () => S.lifetime >= n));
  add('world_moon', 'moon', 15, () => tr('Moonwalker', 'మూన్‌వాకర్'), () => tr('Unlock the Moon', 'చంద్రుడిని అన్‌లాక్ చేయండి'), () => !!S.worldsUnlocked.moon);
  add('world_galaxy', 'shooting', 60, () => tr('Galaxy Ruler', 'గెలాక్సీ పాలకుడు'), () => tr('Unlock the Galaxy', 'గెలాక్సీని అన్‌లాక్ చేయండి'), () => !!S.worldsUnlocked.galaxy);
  add('world_mars', 'mars', 30, () => tr('Red Planet Boss', 'అంగారక బాస్'), () => tr('Unlock Mars', 'అంగారకుడిని అన్‌లాక్ చేయండి'), () => !!S.worldsUnlocked.mars);
  [1, 5, 10].forEach(n => add(`mgr_${n}`, 'manager', n === 10 ? 10 : 3, () => tr(`Hiring Spree ${n}`, `నియామకాలు ${n}`),
    () => tr(`Have ${n} managers in one world`, `ఒకే ప్రపంచంలో ${n} మేనేజర్లు`), () => S.biz.filter(b => b.manager).length >= n));
  [1, 3, 10, 25].forEach(n => add(`pre_${n}`, 'necktie', 5 + n, () => tr(`Fresh Start x${n}`, `కొత్త ప్రారంభం x${n}`),
    () => tr(`Restart with investors ${n} time(s)`, `ఇన్వెస్టర్లతో ${n} సార్లు రీస్టార్ట్ చేయండి`), () => S.stats.prestiges >= n));
  [1, 10, 50].forEach(n => add(`case_${n}`, 'briefcase', n === 1 ? 2 : 5, () => tr(`Briefcase Hunter ${n}`, `బ్రీఫ్‌కేస్ వేటగాడు ${n}`),
    () => tr(`Open ${n} golden briefcases`, `${n} బంగారు బ్రీఫ్‌కేసులు తెరవండి`), () => S.stats.briefcases >= n));
  [100, 1000, 5000].forEach(n => add(`click_${n}`, 'runner', 3, () => tr(`Hands-On ${n}`, `స్వయంగా ${n}`),
    () => tr(`Run businesses by hand ${n} times`, `వ్యాపారాలను ${n} సార్లు చేతితో నడపండి`), () => S.stats.clicks >= n));
  [5, 25, 100].forEach(n => add(`mis_${n}`, 'clipboard', n === 100 ? 20 : 5, () => tr(`Go-Getter ${n}`, `పట్టుదల ${n}`),
    () => tr(`Complete ${n} missions`, `${n} మిషన్లు పూర్తి చేయండి`), () => S.stats.missionsDone >= n));
  [7, 30].forEach(n => add(`daily_${n}`, 'gift', n === 30 ? 20 : 7, () => tr(`Loyal Boss ${n}`, `నమ్మకమైన బాస్ ${n}`),
    () => tr(`Claim ${n} daily rewards`, `${n} డైలీ రివార్డులు తీసుకోండి`), () => (S.stats.dailyClaims || 0) >= n));
  [1, 10, 50].forEach(n => add(`spin_${n}`, 'wheel', n === 50 ? 15 : 3, () => tr(`Lucky Spinner ${n}`, `అదృష్ట స్పిన్నర్ ${n}`),
    () => tr(`Spin the Lucky Wheel ${n} time(s)`, `లక్కీ వీల్‌ను ${n} సార్లు తిప్పండి`), () => (S.stats.spins || 0) >= n));
  add('lb_join', 'trophy', 5, () => tr('On the Board', 'బోర్డు మీద'), () => tr('Join the online leaderboard', 'ఆన్‌లైన్ లీడర్‌బోర్డ్‌లో చేరండి'), () => !!S.player.name);
  add('cloud_on', 'cloud', 5, () => tr('Head in the Clouds', 'క్లౌడ్‌లో సేఫ్'), () => tr('Turn on cloud save', 'క్లౌడ్ సేవ్ ఆన్ చేయండి'), () => !!S.cloud.code);
  [[1, 'Pet Parent', 'పెట్ పేరెంట్'], [5, 'Pet Lover', 'పెట్ ప్రేమికుడు'], [9, 'Zoo Keeper', 'జూ కీపర్']].forEach(([n, en, te]) => add(`pet_${n}`, 'paws', n === 9 ? 25 : 5,
    () => tr(en, te), () => tr(`Adopt ${n} pet(s)`, `${n} పెట్(లు) తీసుకోండి`), () => Object.keys(S.pets.owned).length >= n));
  add('pet_max', 'dragon', 15, () => tr('Best Friends', 'బెస్ట్ ఫ్రెండ్స్'), () => tr('Get a pet to level 10', 'ఒక పెట్‌ను లెవెల్ 10 చేయండి'), () => Object.values(S.pets.owned).some(l => l >= 10));
  add('tour_top3', 'medal', 15, () => tr('Podium Finish', 'పోడియం'), () => tr('Finish top 3 in a weekly tournament', 'వారపు టోర్నమెంట్‌లో టాప్ 3'), () => (S.stats.tourTop3 || 0) >= 1);
  add('tour_win', 'trophy', 30, () => tr('Tournament Champion', 'టోర్నమెంట్ ఛాంపియన్'), () => tr('Win a weekly tournament', 'వారపు టోర్నమెంట్ గెలవండి'), () => (S.stats.tourWins || 0) >= 1);
  [[1, 'Scratcher', 'స్క్రాచర్'], [25, 'Scratch Master', 'స్క్రాచ్ మాస్టర్']].forEach(([n, en, te]) => add(`scratch_${n}`, 'ticket', n === 25 ? 15 : 3,
    () => tr(en, te), () => tr(`Scratch ${n} card(s)`, `${n} కార్డు(లు) స్క్రాచ్ చేయండి`), () => (S.stats.scratches || 0) >= n));
  add('trade_1', 'chart', 3, () => tr('First Trade', 'మొదటి ట్రేడ్'), () => tr('Buy shares on the stock market', 'స్టాక్ మార్కెట్‌లో షేర్లు కొనండి'), () => (S.stats.trades || 0) >= 1);
  add('trade_win', 'chart', 10, () => tr('Market Wizard', 'మార్కెట్ మాంత్రికుడు'), () => tr('Sell shares for a 25% profit', '25% లాభానికి షేర్లు అమ్మండి'), () => (S.stats.bestTrade || 0) >= 0.25);
  add('chal_win', 'swords', 10, () => tr('Challenge Champion', 'ఛాలెంజ్ ఛాంపియన్'), () => tr('Beat a friend\'s challenge', 'స్నేహితుడి ఛాలెంజ్ గెలవండి'), () => !!(S.challenge && S.challenge.won));
  add('share_1', 'letter', 5, () => tr('Spread the Word', 'అందరికీ చెప్పండి'), () => tr('Share the game with a friend', 'గేమ్‌ను స్నేహితుడితో షేర్ చేయండి'), () => (S.stats.shares || 0) >= 1);
  [10, 25, 50].forEach(n => add(`upg_${n}`, 'up', 5, () => tr(`Upgrader ${n}`, `అప్‌గ్రేడర్ ${n}`),
    () => tr(`Buy ${n} upgrades`, `${n} అప్‌గ్రేడ్‌లు కొనండి`), () => S.stats.upgradesBought >= n));
  return list;
})();

const HEADLINES = [
  ['Local tea stall owner refuses to share secret masala recipe.', 'స్థానిక టీ స్టాల్ ఓనర్ రహస్య మసాలా రెసిపీ చెప్పడానికి నిరాకరణ.'],
  ['Economists baffled as one boss buys every coffee shop in town.', 'ఊరిలో అన్ని కాఫీ షాపులు ఒక్కరే కొనడంతో ఆర్థికవేత్తలు ఆశ్చర్యం.'],
  ['Breaking: Food trucks now outnumber parking spots 3 to 1.', 'బ్రేకింగ్: పార్కింగ్ స్థలాల కంటే ఫుడ్ ట్రక్కులే ఎక్కువ!'],
  ['Tech startup pivots to AI-powered tea delivery.', 'టెక్ స్టార్టప్ ఇప్పుడు AI టీ డెలివరీ మొదలుపెట్టింది.'],
  ['Film studio announces sequel to a movie nobody has seen yet.', 'ఇంకా ఎవరూ చూడని సినిమాకు సీక్వెల్ ప్రకటించిన ఫిల్మ్ స్టూడియో.'],
  ['Space Agency confirms Moon is "a great location for a cheese mine".', 'చంద్రుడు చీజ్ గనికి సరైన చోటు అని స్పేస్ ఏజెన్సీ ప్రకటన.'],
  ['Scientists confirm: Mars sand sells better with gift wrap.', 'గిఫ్ట్ ప్యాక్ చేస్తే అంగారక ఇసుక బాగా అమ్ముడవుతుందట!'],
  ['Galaxy news: wormhole traffic jam delays 3 billion tourists.', 'గెలాక్సీ వార్తలు: వార్మ్‌హోల్ ట్రాఫిక్ జామ్‌లో 300 కోట్ల టూరిస్టులు!'],
  ['Rumor: golden briefcases spotted around the city. Keep your eyes open!', 'పుకారు: నగరంలో బంగారు బ్రీఫ్‌కేసులు కనిపిస్తున్నాయి. జాగ్రత్తగా చూడండి!'],
  ['Lucky Wheel jackpot hit by a tea stall owner. Again.', 'లక్కీ వీల్ జాక్‌పాట్ మళ్ళీ టీ స్టాల్ ఓనర్‌కే!'],
  ['Investors say: "Restarting with more capital is a power move."', 'ఇన్వెస్టర్లు: "ఎక్కువ పెట్టుబడితో మళ్ళీ మొదలుపెట్టడం తెలివైన పని."'],
  ['Leaderboard wars heat up as bosses race for the top spot.', 'టాప్ స్థానం కోసం బాస్‌ల మధ్య లీడర్‌బోర్డ్ యుద్ధం!'],
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
function defaultLang() {
  const l = (navigator.languages || [navigator.language || 'en']).join(',').toLowerCase();
  return /(^|,)te/.test(l) ? 'te' : 'en';
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
    cloud: { code: '', lastSync: 0 },
    tutorial: { step: 0, done: false },
    festivals: {},
    challenge: null,
    pets: { owned: {}, fedAt: 0 },
    tour: { week: '', base: 0, posted: false, pending: '', rewarded: {} },
    stocks: {},
    scratch: { day: '', card: null },
    slot: { energy: 30, at: 0, bet: 1, coins: 0, piggy: 0, gift: { at: 0, chest: 0 }, cal: { last: '', streak: 0 }, boss: { lvl: 1, hp: 300 }, col: { week: '', n: 0, got: 0, item: 0 } },
    build: { done: 0, stage: 0, view: null },
    album: { have: {}, packs: { basic: 2, gold: 0 }, stars: 0, sets: {} },
    raid: { shields: 1, tokens: 0, helpDay: '', log: [], online: false },
    stats: { clicks: 0, briefcases: 0, prestiges: 0, upgradesBought: 0, playTime: 0, bestRun: 0, missionsDone: 0, spins: 0, dailyClaims: 0, shares: 0 },
    boosts: { hype: 0, hypeCd: 0, rush: 0, golden: 0 },
    settings: { sound: true, music: true, lowfx: !!(navigator.connection && navigator.connection.saveData), notify: false, notifyAsked: false, notation: 'suffix', buyMode: '1', lang: defaultLang() },
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
  out.cloud = Object.assign({ code: '', lastSync: 0 }, saved.cloud || {});
  out.festivals = saved.festivals || {};
  out.tour = Object.assign({ week: '', base: 0, posted: false, pending: '', rewarded: {} }, saved.tour || {});
  out.scratch = Object.assign({ day: '', card: null }, saved.scratch || {});
  out.raid = Object.assign({ shields: 1, tokens: 0, helpDay: '', log: [], online: false }, saved.raid || {});
  out.album = Object.assign({ have: {}, stars: 0, sets: {} }, saved.album || {});
  out.album.packs = Object.assign({ basic: saved.album ? 0 : 2, gold: 0 }, out.album.packs || {});
  out.build = Object.assign({ done: 0, stage: 0, view: null }, saved.build || {});
  out.slot = Object.assign({ energy: 30, at: 0, bet: 1, coins: 0, piggy: 0 }, saved.slot || {});
  out.slot.gift = Object.assign({ at: 0, chest: 0 }, out.slot.gift || {});
  out.slot.cal = Object.assign({ last: '', streak: 0 }, out.slot.cal || {});
  out.slot.boss = Object.assign({ lvl: 1, hp: 300 }, out.slot.boss || {});
  out.slot.col = Object.assign({ week: '', n: 0, got: 0, item: 0 }, out.slot.col || {});
  out.stocks = saved.stocks && typeof saved.stocks === 'object' ? saved.stocks : {};
  out.pets = Object.assign({ owned: {}, fedAt: 0 }, saved.pets || {});
  out.challenge = saved.challenge && typeof saved.challenge === 'object' ? saved.challenge : null;
  // Players from before the tutorial existed don't need it
  out.tutorial = saved.tutorial ? Object.assign({ step: 0, done: false }, saved.tutorial) : { step: 0, done: (+saved.lifetime || 0) > 5000 };
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
  const [sx, mx, hx, dx] = isTe() ? ['సె', 'ని', 'గం', 'రో'] : ['s', 'm', 'h', 'd'];
  if (s < 60) return s + sx;
  if (s < 3600) return Math.floor(s / 60) + mx + ' ' + (s % 60) + sx;
  if (s < 86400) return Math.floor(s / 3600) + hx + ' ' + Math.floor(s % 3600 / 60) + mx;
  return Math.floor(s / 86400) + dx + ' ' + Math.floor(s % 86400 / 3600) + hx;
}
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function randomCode(len, alphabet) {
  const bytes = new Uint8Array(len);
  if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else bytes.forEach((_, i) => { bytes[i] = Math.random() * 256; });
  return Array.from(bytes, b => alphabet[b % alphabet.length]).join('');
}
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
  if (activeFestival()) m *= 2;
  m *= petBonus('profit');
  m *= landmarkBonus();
  m *= albumBonus();
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
      const kind = m.type === 'speed' ? tr('⚡ Speed', '⚡ వేగం') : tr('💰 Profit', '💰 లాభం');
      toast(tr(`${emo(d.icon)} ${nm(d)} hit ${m.lvl}! ${kind} x${m.mult}`, `${emo(d.icon)} ${nm(d)} ${m.lvl} చేరింది! ${kind} x${m.mult}`), 'good');
      sfx('big');
      confetti(cards[i] && cards[i].iconWrap, 60);
    }
  }
  const minAfter = minOwned();
  for (const g of GLOBAL_MILESTONES) if (minBefore < g && minAfter >= g) {
    toast(tr(`🌐 All businesses reached ${g}! All profits x2`, `🌐 అన్ని వ్యాపారాలు ${g} చేరాయి! అన్ని లాభాలు x2`), 'good');
    confetti(null, 140);
  }
  if (before === 0) {
    toast(tr(`🎉 Unlocked ${emo(d.icon)} ${nm(d)}! Tap it to earn.`, `🎉 ${emo(d.icon)} ${nm(d)} అన్‌లాక్! సంపాదించడానికి ట్యాప్ చేయండి.`), 'good');
    confetti(cards[i] && cards[i].iconWrap, 80);
  }
}
function hireManager(i) {
  const d = BUSINESSES[i], b = S.biz[i];
  if (b.manager || b.owned === 0 || S.cash < d.managerCost) { sfx('err'); return; }
  S.cash -= d.managerCost;
  b.manager = true; b.running = true;
  sfx('big');
  toast(tr(`🤵 ${d.manager} now runs your ${nm(d)}!`, `🤵 ఇప్పుడు ${d.manager} మీ ${nm(d)} నడుపుతారు!`), 'good');
  confetti(null, 50);
}
function buyUpgrade(id, quiet) {
  const u = UPGRADES.find(x => x.id === id);
  if (!u || S.upgrades[id] || S.cash < u.cost) { if (!quiet) sfx('err'); return false; }
  S.cash -= u.cost;
  S.upgrades[id] = true;
  S.stats.upgradesBought++;
  if (!quiet) { sfx('buy'); toast(`${emo(u.icon)} ${upgName(u)} — x${u.mult} ${tr('profit!', 'లాభం!')}`, 'good'); }
  return true;
}
function buyAllUpgrades() {
  let n = 0;
  for (const u of UPGRADES) if (!S.upgrades[u.id] && S.cash >= u.cost) { if (buyUpgrade(u.id, true)) n++; }
  if (n) { sfx('big'); toast(tr(`⬆️ Bought ${n} upgrade${n > 1 ? 's' : ''}!`, `⬆️ ${n} అప్‌గ్రేడ్‌లు కొన్నారు!`), 'good'); confetti(null, 40); } else sfx('err');
}
function buyInvestorUpgrade(id) {
  const u = INVESTOR_UPGRADES.find(x => x.id === id);
  if (!u || S.investorUpgrades[id] || S.investors < u.cost) { sfx('err'); return; }
  const [name, desc] = invText(u);
  modal(`${ico(u.icon, 'big-ico')}<h3>${name}</h3>
    <p>${desc}.<br>${tr(`This spends <b>${fmtInt(u.cost)}</b> investors, lowering your investor bonus by <b>${fmt(u.cost * investorRate() * 100)}%</b>. Upgrades are permanent.`,
      `దీనికి <b>${fmtInt(u.cost)}</b> ఇన్వెస్టర్లు ఖర్చవుతారు, మీ బోనస్ <b>${fmt(u.cost * investorRate() * 100)}%</b> తగ్గుతుంది. అప్‌గ్రేడ్ శాశ్వతం.`)}</p>
    <div class="modal-actions"><button class="btn ghost" data-act="close">${tr('Cancel', 'రద్దు')}</button><button class="btn purple" data-act="invup-ok" data-id="${id}">${tr('Buy it', 'కొనండి')}</button></div>`);
}
function confirmInvestorUpgrade(id) {
  const u = INVESTOR_UPGRADES.find(x => x.id === id);
  if (!u || S.investors < u.cost) return;
  S.investors -= u.cost;
  S.investorUpgrades[id] = true;
  sfx('big');
  toast(`${emo(u.icon)} ${invText(u)[0]} ${tr('acquired!', 'పొందారు!')}`, 'good');
  confetti(null, 80);
}
function prestigeAsk() {
  const n = investorsAvailable();
  if (n < 1) { sfx('err'); toast(tr('Earn more to attract investors.', 'ఇన్వెస్టర్లు రావాలంటే ఇంకా సంపాదించండి.'), 'bad'); return; }
  const newBonus = fmt((S.investors + n) * investorRate() * 100);
  const w = nm(WORLD);
  modal(`${ico('necktie', 'big-ico')}<h3>${tr(`Sell your ${w} empire?`, `మీ ${w} సామ్రాజ్యాన్ని అమ్మేయాలా?`)}</h3>
    <p>${tr(`You will gain <b>${fmtInt(n)}</b> investors, bringing your profit bonus to <b>+${newBonus}%</b> in every world.`,
      `మీకు <b>${fmtInt(n)}</b> ఇన్వెస్టర్లు వస్తారు, ప్రతి ప్రపంచంలో లాభం బోనస్ <b>+${newBonus}%</b> అవుతుంది.`)}</p>
    <p>${tr(`Your ${w} cash, businesses, managers and cash upgrades reset. Other worlds, investors, gems and awards are kept.`,
      `${w} లో క్యాష్, వ్యాపారాలు, మేనేజర్లు, అప్‌గ్రేడ్‌లు రీసెట్ అవుతాయి. ఇతర ప్రపంచాలు, ఇన్వెస్టర్లు, జెమ్స్, అవార్డులు ఉంటాయి.`)}</p>
    <div class="modal-actions"><button class="btn ghost" data-act="close">${tr('Not yet', 'ఇప్పుడు వద్దు')}</button><button class="btn gold" data-act="prestige-ok">${tr('Restart with investors', 'ఇన్వెస్టర్లతో రీస్టార్ట్')}</button></div>`);
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
  S.stocks[S.world] = {};
  marketEvent = null;
  sfx('win');
  toast(tr(`👔 ${fmtInt(n)} investors joined your empire!`, `👔 ${fmtInt(n)} ఇన్వెస్టర్లు మీ సామ్రాజ్యంలో చేరారు!`), 'good');
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
  toast(tr('📣 Hype campaign launched! x2 profits for 2 minutes.', '📣 హైప్ ప్రచారం మొదలైంది! 2 నిమిషాలు x2 లాభాలు.'), 'good');
  sparkBurst($('hypeBtn'), 16);
}
function buyGem(id) {
  const item = GEM_SHOP.find(g => g.id === id);
  const cost = gemCost(item);
  if (cost == null || S.gems < cost) { sfx('err'); return; }
  S.gems -= cost;
  switch (id) {
    case 'rush': S.boosts.rush += 900; toast(tr('⚡ Profit Rush! x2 for 15 minutes.', '⚡ ప్రాఫిట్ రష్! 15 నిమిషాలు x2.'), 'gem'); break;
    case 'warp1': case 'warp24': {
      const amt = bonusCash(id === 'warp1' ? 3600 : 86400);
      earn(amt); toast(tr(`⏩ Time warped! +${money(amt)}`, `⏩ టైమ్ వార్ప్! +${money(amt)}`), 'gem'); coinShower(24); break;
    }
    case 'golden': S.gemGolden++; toast(tr('👑 Golden Touch! Permanent x2 profits.', '👑 గోల్డెన్ టచ్! శాశ్వతంగా x2 లాభాలు.'), 'gem'); confetti(null, 120); break;
    case 'offline': S.offlineLvl++; toast(tr(`🌙 Offline cap is now ${fmtDur(OFFLINE_CAPS[S.offlineLvl])}.`, `🌙 ఆఫ్‌లైన్ పరిమితి ఇప్పుడు ${fmtDur(OFFLINE_CAPS[S.offlineLvl])}.`), 'gem'); break;
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
  if (wn) wn.textContent = nm(WORLD);
  Stars.setWorld(WORLD.id);
  Music.setWorld(WORLD.id);
}
function unlockWorld(id) {
  const w = worldDef(id);
  if (S.worldsUnlocked[id]) return travelTo(id);
  if (S.lifetime < w.unlockAt) { sfx('err'); toast(tr(`Earn ${money(w.unlockAt)} lifetime to unlock ${w.name}.`, `${w.te} అన్‌లాక్ చేయడానికి మొత్తం ${money(w.unlockAt)} సంపాదించండి.`), 'bad'); return; }
  S.worldsUnlocked[id] = true;
  sfx('win');
  toast(tr(`🚀 ${w.name} unlocked! Everything there earns x${w.mult}.`, `🚀 ${w.te} అన్‌లాక్! అక్కడ అన్నీ x${w.mult} సంపాదిస్తాయి.`), 'good');
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
  if (r < 0.12) { S.gems += 3; toast(tr('💼 The briefcase held 💎 3 gems!', '💼 బ్రీఫ్‌కేసులో 💎 3 జెమ్స్!'), 'gem'); }
  else if (r < 0.45) { S.boosts.golden = 30; toast(tr('💼 Golden Rush! x5 profits for 30 seconds!', '💼 గోల్డెన్ రష్! 30 సెకన్లు x5 లాభాలు!'), 'gem'); }
  else {
    const amt = Math.max(50, incomePerSec(false) * 120, S.cash * 0.15);
    earn(amt);
    toast(tr(`💼 Found ${money(amt)} inside!`, `💼 లోపల ${money(amt)} దొరికింది!`), 'gem');
    coinShower(14);
  }
}
function startMarketEvent() {
  const owned = S.biz.map((b, i) => b.owned > 0 ? i : -1).filter(i => i >= 0);
  if (!owned.length) return;
  const i = owned[Math.floor(Math.random() * owned.length)];
  const d = BUSINESSES[i];
  marketEvent = { biz: i, remaining: 60 };
  toast(tr(`📈 Market boom! ${emo(d.icon)} ${nm(d)} profits x3 for 60s`, `📈 మార్కెట్ బూమ్! ${emo(d.icon)} ${nm(d)} లాభాలు 60 సెకన్లు x3`), 'good');
  setHeadline(tr(`MARKET BOOM: Demand for ${d.name} skyrockets — profits tripled!`, `మార్కెట్ బూమ్: ${d.te} కి భారీ డిమాండ్ — లాభాలు మూడింతలు!`));
}

/* ---------------------------- ACHIEVEMENTS -------------------------- */
function checkAchievements() {
  for (const a of ACHIEVEMENTS) {
    if (!S.achievements[a.id] && a.test()) {
      S.achievements[a.id] = Date.now();
      S.gems += a.gems;
      toast(tr(`🏆 ${a.name()} unlocked! +${a.gems} 💎`, `🏆 ${a.name()} అవార్డు! +${a.gems} 💎`), 'gem');
      sfx('cash');
      if (activeTab === 'awards') renderTab();
    }
  }
}

/* ---------------------------- DAILY REWARD -------------------------- */
const DAILY_REWARDS = [
  { icon: 'gem',   t: ['5 Gems', '5 జెమ్స్'],                        give: () => { S.gems += 5; } },
  { icon: 'coin',  t: ['10 min income', '10 నిమి ఆదాయం'],           give: () => earn(bonusCash(600)) },
  { icon: 'gem',   t: ['10 Gems', '10 జెమ్స్'],                      give: () => { S.gems += 10; } },
  { icon: 'bolt',  t: ['Profit Rush 15m', 'ప్రాఫిట్ రష్ 15ని'],       give: () => { S.boosts.rush += 900; } },
  { icon: 'gem',   t: ['15 Gems', '15 జెమ్స్'],                      give: () => { S.gems += 15; } },
  { icon: 'coin',  t: ['1 hour income', '1 గంట ఆదాయం'],             give: () => earn(bonusCash(3600)) },
  { icon: 'crown', t: ['30 Gems + x5 Rush', '30 జెమ్స్ + x5 రష్'],   give: () => { S.gems += 30; S.boosts.golden += 60; } },
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
    return `<div class="day ${cls}"><small>${tr('Day', 'రోజు')} ${day}</small>${ico(r.icon)}<em>${tr(...r.t)}</em></div>`;
  }).join('');
  const next = S.daily.streak % 7 + 1;
  return `${ico('gift', 'big-ico')}<h3>${tr('Daily Reward', 'డైలీ రివార్డ్')}</h3>
    <p>${claimable ? tr(`Day ${today} reward is ready! Come back every day — missing a day restarts from Day 1.`, `రోజు ${today} రివార్డ్ రెడీ! ప్రతి రోజు రండి — ఒక రోజు మిస్ అయితే మళ్ళీ రోజు 1 నుంచి.`)
      : tr(`Already claimed today. Come back tomorrow for Day ${next}!`, `ఈ రోజు తీసుకున్నారు. రేపు రోజు ${next} కోసం రండి!`)}</p>
    <div class="daily-grid">${boxes}</div>
    <div class="modal-actions">${claimable ? `<button class="btn gold" data-act="daily-claim">${tr('Claim!', 'తీసుకోండి!')}</button>` : `<button class="btn ghost" data-act="close">${tr('Close', 'మూసివేయి')}</button>`}</div>`;
}
function claimDaily() {
  if (!canClaimDaily()) return;
  const day = dailyNextDay();
  DAILY_REWARDS[day - 1].give();
  S.daily = { last: dayKey(), streak: day };
  S.stats.dailyClaims = (S.stats.dailyClaims || 0) + 1;
  sfx('win');
  toast(tr(`🎁 Day ${day} reward: ${DAILY_REWARDS[day - 1].t[0]}!`, `🎁 రోజు ${day} రివార్డ్: ${DAILY_REWARDS[day - 1].t[1]}!`), 'gem');
  confetti(null, 100);
  save();
}

/* ---------------------------- LUCKY SPIN ---------------------------- */
let spinning = false, wheelAngle = 0;
function spinReady() { return Date.now() >= S.spin.freeAt; }
function spinHtml() {
  const n = SPIN_PRIZES.length, seg = 360 / n;
  const grad = SPIN_PRIZES.map((p, k) => `${p.color} ${k * seg}deg ${(k + 1) * seg}deg`).join(',');
  const segs = SPIN_PRIZES.map((p, k) => `<div class="seg" style="transform:rotate(${k * seg + seg / 2}deg)"><div class="seg-in">${ico(p.icon)}<small>${tr(...p.t)}</small></div></div>`).join('');
  return `<h3>${tr('Lucky Spin', 'లక్కీ స్పిన్')}</h3>
    <p class="sub" id="spinInfo">${spinInfoText()}</p>
    <div class="wheel-wrap">
      <div class="wheel-pointer"></div>
      <div class="wheel-lights"></div>
      <div class="wheel" id="wheel" style="background:conic-gradient(${grad});transform:rotate(${wheelAngle}deg)">${segs}</div>
      <div class="wheel-hub">${ico('coin')}</div>
    </div>
    <div class="modal-actions">
      <button class="btn gold" data-act="spin-go" id="spinFree" ${spinReady() ? '' : 'disabled'}>${tr('Free spin', 'ఫ్రీ స్పిన్')}</button>
      <button class="btn blue" data-act="spin-paid" data-gems="${SPIN_GEM_COST}">${tr('Spin', 'స్పిన్')} · 💎${SPIN_GEM_COST}</button>
      <button class="btn ghost" data-act="close">${tr('Close', 'మూసివేయి')}</button>
    </div>`;
}
function spinInfoText() {
  return spinReady() ? tr('Your free spin is ready!', 'మీ ఫ్రీ స్పిన్ రెడీ!')
    : tr(`Next free spin in ${fmtClock((S.spin.freeAt - Date.now()) / 1000)}`, `తదుపరి ఫ్రీ స్పిన్ ${fmtClock((S.spin.freeAt - Date.now()) / 1000)} లో`);
}
function doSpin(paid) {
  if (spinning) return;
  if (!paid && !spinReady()) { sfx('err'); return; }
  if (paid && S.gems < SPIN_GEM_COST) { sfx('err'); toast(tr('Not enough gems for a spin.', 'స్పిన్‌కు సరిపడా జెమ్స్ లేవు.'), 'bad'); return; }
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
  const prize = SPIN_PRIZES[k], msg = prize.give();
  save();
  // Ticking sound while the wheel slows down
  let t = 0;
  for (let d = 60; t < 4600; d *= 1.09) { t += d; setTimeout(() => sfx('tick'), t); }
  setTimeout(() => {
    spinning = false;
    const p = prize;
    sfx(p.big ? 'win' : 'big');
    toast(`🎡 ${msg}`, 'gem');
    confetti($('wheel'), p.big ? 260 : 90);
    if ($('wheel')) {
      $('modalBody').innerHTML = spinHtml();
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
  const where = w.id === 'earth' ? '' : tr(` on ${w.name}`, ` (${w.te})`);
  switch (m.type) {
    case 'own': return { icon: d.icon, text: tr(`Own ${m.target} ${d.name}${where}`, `${m.target} ${d.te} కొనండి${where}`) };
    case 'unlock': return { icon: d.icon, text: tr(`Unlock the ${d.name}${where}`, `${d.te} అన్‌లాక్ చేయండి${where}`) };
    case 'hire': return { icon: 'manager', text: tr(`Hire ${d.manager} for your ${d.name}`, `${d.te} కోసం ${d.manager} ని నియమించండి`) };
    case 'earn': return { icon: 'coin', text: tr(`Earn ${money(m.target)} cash`, `${money(m.target)} క్యాష్ సంపాదించండి`) };
    case 'click': return { icon: 'runner', text: tr(`Run businesses by hand ${m.target} times`, `వ్యాపారాలను ${m.target} సార్లు చేతితో నడపండి`) };
    case 'case': return { icon: 'briefcase', text: tr('Open a golden briefcase', 'ఒక బంగారు బ్రీఫ్‌కేస్ తెరవండి') };
    case 'upgrade': return { icon: 'up', text: tr(`Buy ${m.target} upgrades`, `${m.target} అప్‌గ్రేడ్‌లు కొనండి`) };
    case 'spin': return { icon: 'wheel', text: tr('Spin the Lucky Wheel', 'లక్కీ వీల్ తిప్పండి') };
  }
  return { icon: 'clipboard', text: tr('Mission', 'మిషన్') };
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
  toast(tr(`📋 Mission complete! +${m.gems} 💎 +${money(cash)} cash`, `📋 మిషన్ పూర్తి! +${m.gems} 💎 +${money(cash)} క్యాష్`), 'gem');
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
      toast(tr(`📋 Mission done: ${missionText(m).text}. Claim your reward!`, `📋 మిషన్ పూర్తి: ${missionText(m).text}. రివార్డ్ తీసుకోండి!`), 'good');
      sfx('cash');
      if (activeTab === 'missions') renderTab();
    }
  }
}
function missionVal(m, v) { return m.type === 'earn' ? `${money(v)} / ${money(m.target)}` : `${fmtInt(v)} / ${fmtInt(m.target)}`; }
function updateMissionProgress() {
  const c = S.challenge, cb = $('chalBar');
  if (c && cb && !c.won) { cb.style.width = (challengeProgress(c) * 100).toFixed(1) + '%'; $('chalVal').textContent = `${money(S.lifetime)} / ${money(c.score)}`; }
  for (const m of S.missions) {
    const row = document.querySelector(`[data-mrow="${m.id}"]`);
    if (!row) continue;
    const v = Math.min(missionValue(m), m.target);
    if ((v >= m.target) !== (row.dataset.done === '1')) { renderTab(); return; }
    row.querySelector('.mbar div').style.width = (v / m.target * 100) + '%';
    row.querySelector('.mval').textContent = missionVal(m, v);
  }
}

/* ---------------------------- LEADERBOARD --------------------------- */
let lbData = null, lbState = 'idle', lbLastSent = 0, lbLastScore = -1;
function ensurePlayerId() { if (!S.player.id) S.player.id = randomCode(24, '0123456789abcdef'); }
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
  if (name.length < 2) { sfx('err'); toast(tr('Please type a name (2–16 letters).', 'దయచేసి పేరు టైప్ చేయండి (2–16 అక్షరాలు).'), 'bad'); return; }
  S.player.name = name;
  sfx('big');
  toast(tr(`🏆 Welcome to the leaderboard, ${name}!`, `🏆 లీడర్‌బోర్డ్‌కు స్వాగతం, ${name}!`), 'good');
  lbFetch(true);
  tourFetch(true);
  renderTab();
}

/* ---------------------------- WEEKLY TOURNAMENT -------------------- */
// Weeks run Monday to Sunday (UTC), matching the server. Score = lifetime earnings gained this week.
const TOUR_URL = '/api/tournament';
const TOUR_PRIZES = [100, 60, 40], TOUR_TOP10 = 20, TOUR_PLAYED = 5;
let lbView = 'week', tourData = null, tourState = 'idle', tourLastSent = 0, tourLastScore = -1;
function tourWeekStart(now = Date.now()) {
  const d = new Date(now);
  const midnight = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return midnight - ((new Date(midnight).getUTCDay() + 6) % 7) * 86400000;
}
function tourWeekKey() { return new Date(tourWeekStart()).toISOString().slice(0, 10); }
function tourEndsIn() { return (tourWeekStart() + 7 * 86400000 - Date.now()) / 1000; }
function tourScore() { return Math.max(0, Math.floor(S.lifetime - S.tour.base)); }
function tourPrize(rank) { return !rank ? 0 : rank <= 3 ? TOUR_PRIZES[rank - 1] : rank <= 10 ? TOUR_TOP10 : TOUR_PLAYED; }
// When a new week starts, remember last week so its prize can be claimed, then count from zero again
function checkTourWeek() {
  const wk = tourWeekKey();
  if (S.tour.week === wk) return;
  if (S.tour.week && S.tour.posted) S.tour.pending = S.tour.week;
  S.tour.week = wk;
  S.tour.base = S.lifetime;
  S.tour.posted = false;
  tourData = null; tourLastScore = -1;
  if (S.tour.pending) claimTourReward();
}
async function claimTourReward() {
  const week = S.tour.pending;
  if (!week || S.tour.rewarded[week]) { S.tour.pending = ''; return; }
  try {
    const res = await fetch(`${TOUR_URL}?week=${week}&id=${encodeURIComponent(S.player.id)}`);
    if (!res.ok || !(res.headers.get('content-type') || '').includes('json')) return;
    const d = await res.json();
    if (S.tour.rewarded[week]) return;
    S.tour.rewarded[week] = true;
    S.tour.pending = '';
    const gems = tourPrize(d.myRank);
    if (gems) {
      S.gems += gems;
      if (d.myRank === 1) S.stats.tourWins = (S.stats.tourWins || 0) + 1;
      if (d.myRank <= 3) S.stats.tourTop3 = (S.stats.tourTop3 || 0) + 1;
      const medal = d.myRank === 1 ? 'gold' : d.myRank === 2 ? 'silver' : d.myRank === 3 ? 'bronze' : 'medal';
      queueModal(() => `${ico(medal, 'big-ico')}<h3>${tr('Tournament results!', 'టోర్నమెంట్ ఫలితాలు!')}</h3>
        <p>${tr(`Last week you finished <b>#${d.myRank}</b> of ${fmtInt(d.players)} players.`, `గత వారం ${fmtInt(d.players)} మందిలో మీరు <b>#${d.myRank}</b> స్థానంలో నిలిచారు.`)}</p>
        <div class="stat-big">+💎${gems}</div>
        <div class="modal-actions"><button class="btn gold" data-act="close">${tr('Awesome!', 'సూపర్!')}</button></div>`);
      confetti(null, d.myRank <= 3 ? 260 : 100);
      sfx('win');
    }
    save();
  } catch (e) { /* try again next time */ }
}
async function tourFetch(post) {
  ensurePlayerId();
  checkTourWeek();
  if (post) { tourLastSent = Date.now(); tourLastScore = tourScore(); }
  if (!tourData) tourState = 'loading';
  try {
    const res = post
      ? await fetch(TOUR_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: S.player.id, name: S.player.name, score: tourScore(), world: S.world }) })
      : await fetch(`${TOUR_URL}?id=${encodeURIComponent(S.player.id)}`);
    if (!res.ok || !(res.headers.get('content-type') || '').includes('json')) throw new Error('status ' + res.status);
    tourData = await res.json();
    tourState = 'ok';
    if (post) S.tour.posted = true;
  } catch (e) {
    tourState = 'offline';
  }
  if (activeTab === 'leaderboard') renderTab();
}
function updateTourLive() {
  const e = $('tourEnds'); if (e) e.textContent = fmtDur(tourEndsIn());
  const m = $('tourMine'); if (m) m.textContent = money(tourScore());
}

/* ---------------------------- PHONE NOTIFICATIONS ------------------ */
// Real push reminders: the phone subscribes once, then the game tells the server its timers
// (free spin, daily reward, pets) and a scheduled function sends at most one reminder at a time.
const PUSH_URL = '/api/push';
let pushLastKey = '', pushLastSync = 0;
function pushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && location.protocol === 'https:';
}
function isIOS() { return /iphone|ipad|ipod/i.test(navigator.userAgent); }
function notifyStatus() {
  if (!pushSupported()) return 'unsupported';
  if (Notification.permission === 'denied') return 'blocked';
  return S.settings.notify && Notification.permission === 'granted' ? 'on' : 'off';
}
function pushState() {
  return { lang: S.settings.lang, tz: -new Date().getTimezoneOffset(), spinAt: S.spin.freeAt, fedAt: S.pets.fedAt,
    pets: Object.keys(S.pets.owned).length, dailyLast: S.daily.last, tourPlaying: !!S.player.name };
}
function b64ToBytes(b64) {
  const raw = atob((b64 + '='.repeat((4 - b64.length % 4) % 4)).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, ch => ch.charCodeAt(0));
}
function notifyHelpHtml() {
  const ios = isIOS();
  return `${ico('bell', 'big-ico')}<h3>${tr('Notifications', 'నోటిఫికేషన్లు')}</h3>
    <p>${ios ? tr('On iPhone, first add the game to your Home Screen (Share ⬆️ → Add to Home Screen), open it from there, then turn on notifications.',
                   'iPhone లో ముందు గేమ్‌ను హోమ్ స్క్రీన్‌కు యాడ్ చేయండి (Share ⬆️ → Add to Home Screen), అక్కడ నుంచి తెరిచి నోటిఫికేషన్లు ఆన్ చేయండి.')
              : notifyStatus() === 'blocked'
                ? tr('Notifications are blocked for this site. Allow them in your browser\'s site settings (🔒 next to the address), then try again.',
                     'ఈ సైట్‌కు నోటిఫికేషన్లు బ్లాక్ అయ్యాయి. బ్రౌజర్ సైట్ సెట్టింగ్స్‌లో (అడ్రస్ పక్కన 🔒) అనుమతించి మళ్ళీ ప్రయత్నించండి.')
                : tr('This browser can\'t show notifications. Try Chrome on Android or PC.', 'ఈ బ్రౌజర్‌లో నోటిఫికేషన్లు రావు. Android లేదా PC లో Chrome వాడండి.')}</p>
    <div class="modal-actions"><button class="btn gold" data-act="close">${tr('Got it', 'సరే')}</button></div>`;
}
async function enableNotifications() {
  S.settings.notifyAsked = true;
  if (!pushSupported() || Notification.permission === 'denied') { modal(notifyHelpHtml()); return; }
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') { toast(tr('Notifications not allowed.', 'నోటిఫికేషన్లకు అనుమతి ఇవ్వలేదు.'), 'bad'); if (activeTab === 'settings') renderTab(); return; }
  try {
    ensurePlayerId();
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      const { publicKey } = await (await fetch(PUSH_URL)).json();
      sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(publicKey) });
    }
    const res = await fetch(PUSH_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: S.player.id, sub: sub.toJSON(), state: pushState() }) });
    if (!res.ok) throw new Error('status ' + res.status);
    S.settings.notify = true;
    pushLastKey = JSON.stringify(pushState());
    sfx('big');
    toast(tr('🔔 Notifications on! We\'ll remind you about spins, rewards and pets.', '🔔 నోటిఫికేషన్లు ఆన్! స్పిన్, రివార్డ్స్, పెట్స్ గురించి గుర్తు చేస్తాం.'), 'good');
  } catch (e) {
    toast(tr('Could not turn on notifications. Check your internet and try again.', 'నోటిఫికేషన్లు ఆన్ కాలేదు. ఇంటర్నెట్ చూసి మళ్ళీ ప్రయత్నించండి.'), 'bad');
  }
  save();
  if (activeTab === 'settings') renderTab();
}
async function disableNotifications() {
  S.settings.notify = false;
  save();
  if (activeTab === 'settings') renderTab();
  toast(tr('🔕 Notifications off.', '🔕 నోటిఫికేషన్లు ఆఫ్.'), 'good');
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) await sub.unsubscribe();
    await fetch(PUSH_URL, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: S.player.id }) });
  } catch (e) { /* already off on the server */ }
}
// Tell the server about changed timers (at most every 30 seconds)
function pushSync(force) {
  if (notifyStatus() !== 'on') return;
  const st = pushState(), key = JSON.stringify(st);
  if (!force && (key === pushLastKey || Date.now() - pushLastSync < 30000)) return;
  pushLastKey = key; pushLastSync = Date.now();
  navigator.serviceWorker.ready.then(reg => reg.pushManager.getSubscription()).then(sub => {
    if (!sub) return;
    return fetch(PUSH_URL, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: S.player.id, sub: sub.toJSON(), state: st }) });
  }).catch(() => { /* try again later */ });
}
function notifyAskHtml() {
  return `${ico('bell', 'big-ico')}<h3>${tr('Get reminders?', 'రిమైండర్లు కావాలా?')}</h3>
    <p>${tr('We can tell you when your free spin and daily reward are ready, and when your pets are hungry. Never at night.',
      'ఫ్రీ స్పిన్, డైలీ రివార్డ్ రెడీ అయినప్పుడు, పెట్స్‌కు ఆకలి వేసినప్పుడు మీకు చెప్తాం. రాత్రి పూట ఎప్పుడూ రాదు.')}</p>
    <div class="modal-actions"><button class="btn ghost" data-act="notify-later">${tr('Not now', 'ఇప్పుడు వద్దు')}</button>
    <button class="btn gold" data-act="notify-on">${tr('Yes, remind me', 'అవును, గుర్తు చేయండి')}</button></div>`;
}
function maybeAskNotify() {
  if (S.settings.notifyAsked || !pushSupported() || Notification.permission !== 'default' || !S.tutorial.done) return;
  S.settings.notifyAsked = true;
  queueModal(notifyAskHtml);
}

/* ---------------------------- CLOUD SAVE ---------------------------- */
const CLOUD_ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
let cloudBusy = false, cloudLastAuto = 0;
function fmtCode(c) { return String(c || '').replace(/[^A-Z0-9]/gi, '').toUpperCase().replace(/(.{4})(?=.)/g, '$1-'); }
function normCode(c) { return String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
async function cloudSave(manual) {
  if (cloudBusy) return;
  if (!S.cloud.code) S.cloud.code = randomCode(12, CLOUD_ALPHA);
  cloudBusy = true;
  cloudLastAuto = Date.now();
  save();
  try {
    const res = await fetch(CLOUD_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: S.cloud.code, data: S }), keepalive: !manual });
    if (!res.ok) throw new Error('status ' + res.status);
    const out = await res.json();
    S.cloud.lastSync = out.savedAt || Date.now();
    save();
    if (manual) { sfx('big'); toast(tr('☁️ Saved to cloud!', '☁️ క్లౌడ్‌లో సేవ్ అయింది!'), 'good'); }
  } catch (e) {
    if (manual) { sfx('err'); toast(tr('Cloud save works on the online game. Check your internet.', 'క్లౌడ్ సేవ్ ఆన్‌లైన్ గేమ్‌లోనే పనిచేస్తుంది. ఇంటర్నెట్ చూడండి.'), 'bad'); }
  }
  cloudBusy = false;
  if (activeTab === 'settings') renderTab();
}
function cloudLoadAsk() {
  modal(`${ico('inbox', 'big-ico')}<h3>${tr('Load from cloud', 'క్లౌడ్ నుంచి లోడ్')}</h3>
    <p>${tr('Type the cloud code from your other device.', 'మీ మరో డివైస్‌లోని క్లౌడ్ కోడ్ టైప్ చేయండి.')}</p>
    <input id="cloudCodeIn" class="code-in" maxlength="14" placeholder="XXXX-XXXX-XXXX" autocomplete="off" autocapitalize="characters">
    <div class="modal-actions"><button class="btn ghost" data-act="close">${tr('Cancel', 'రద్దు')}</button><button class="btn" data-act="cloud-fetch">${tr('Find save', 'సేవ్ వెతకండి')}</button></div>`);
  setTimeout(() => { const i = $('cloudCodeIn'); if (i) i.focus(); }, 50);
}
let cloudPending = null;
async function cloudFetch() {
  const code = normCode($('cloudCodeIn') && $('cloudCodeIn').value);
  if (code.length !== 12) { sfx('err'); toast(tr('A cloud code has 12 letters and numbers.', 'క్లౌడ్ కోడ్‌లో 12 అక్షరాలు/అంకెలు ఉంటాయి.'), 'bad'); return; }
  try {
    const res = await fetch(`${CLOUD_URL}?code=${code}`);
    if (res.status === 404) { sfx('err'); toast(tr('No save found for that code.', 'ఆ కోడ్‌కు సేవ్ దొరకలేదు.'), 'bad'); return; }
    if (!res.ok) throw new Error('status ' + res.status);
    const rec = await res.json();
    cloudPending = { code, data: rec.data };
    const d = rec.data || {};
    const when = new Date(rec.savedAt).toLocaleString();
    modal(`${ico('cloud', 'big-ico')}<h3>${tr('Save found!', 'సేవ్ దొరికింది!')}</h3>
      <p>${tr('Saved', 'సేవ్ చేసిన సమయం')}: <b>${esc(when)}</b><br>${tr('Lifetime earnings', 'మొత్తం సంపాదన')}: <b>${money(+d.lifetime || 0)}</b><br>${tr('Gems', 'జెమ్స్')}: <b>${fmtInt(+d.gems || 0)}</b></p>
      <p class="warn">${tr('This replaces the progress on this device.', 'ఇది ఈ డివైస్‌లోని ప్రోగ్రెస్‌ను మార్చేస్తుంది.')}</p>
      <div class="modal-actions"><button class="btn ghost" data-act="close">${tr('Cancel', 'రద్దు')}</button><button class="btn gold" data-act="cloud-apply">${tr('Load this save', 'ఈ సేవ్ లోడ్ చేయండి')}</button></div>`);
  } catch (e) {
    sfx('err');
    toast(tr('Cloud save works on the online game. Check your internet.', 'క్లౌడ్ సేవ్ ఆన్‌లైన్ గేమ్‌లోనే పనిచేస్తుంది. ఇంటర్నెట్ చూడండి.'), 'bad');
  }
}
function cloudApply() {
  if (!cloudPending) return;
  S = mergeState(cloudPending.data);
  S.cloud.code = cloudPending.code;
  S.cloud.lastSync = Date.now();
  S.lastSave = Date.now();
  cloudPending = null;
  marketEvent = null;
  lbData = null;
  afterStateReplaced();
  sfx('win');
  toast(tr('☁️ Progress loaded from the cloud!', '☁️ క్లౌడ్ నుంచి ప్రోగ్రెస్ లోడ్ అయింది!'), 'good');
  confetti(null, 120);
}
function afterStateReplaced() {
  applyStaticText();
  applyWorld(S.world);
  ensureMissions();
  ensurePlayerId();
  save();
  closeModal();
  buildBizCards();
  switchTab('business');
}

/* ---------------------------- FRIENDS CHALLENGE --------------------- */
// A shared link carries the sender's name and score: /?c=<base64url JSON>. The friend wins by earning more.
const CHALLENGE_GEMS = 20;
let pendingChallenge = null;
function b64urlEncode(str) { return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function b64urlDecode(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return decodeURIComponent(escape(atob(s))); }
function challengeUrl() {
  return `${location.origin}/?c=${b64urlEncode(JSON.stringify({ n: S.player.name || '', s: Math.floor(S.lifetime), w: S.world }))}`;
}
function readChallengeParam() {
  const params = new URLSearchParams(location.search);
  const c = params.get('c');
  if (!c) return null;
  history.replaceState(null, '', location.pathname);
  try {
    const p = JSON.parse(b64urlDecode(c));
    const score = Number(p.s);
    if (!isFinite(score) || score < 0 || score > 1e300) return null;
    return { name: cleanName(p.n), score: Math.max(1000, Math.floor(score)), world: WORLDS.some(w => w.id === p.w) ? p.w : 'earth' };
  } catch (e) { return null; }
}
function challengerName(c) { return c.name || tr('A friend', 'ఒక స్నేహితుడు'); }
function challengeInviteHtml() {
  const c = pendingChallenge;
  if (!c) return '';
  const name = esc(challengerName(c));
  return `${ico('swords', 'big-ico')}<h3>${tr(`${name} challenges you!`, `${name} మీకు ఛాలెంజ్ విసిరారు!`)}</h3>
    <p>${tr(`Their empire is worth <b>${money(c.score)}</b>. Earn more than that to win <b>💎${CHALLENGE_GEMS}</b>!`,
      `వారి సామ్రాజ్యం విలువ <b>${money(c.score)}</b>. దానికంటే ఎక్కువ సంపాదించి <b>💎${CHALLENGE_GEMS}</b> గెలవండి!`)}</p>
    <div class="modal-actions"><button class="btn ghost" data-act="close">${tr('Not now', 'ఇప్పుడు వద్దు')}</button>
    <button class="btn gold" data-act="chal-accept">${tr('Accept challenge', 'ఛాలెంజ్ స్వీకరించు')}</button></div>`;
}
function acceptChallenge() {
  if (!pendingChallenge) return;
  S.challenge = Object.assign({}, pendingChallenge, { at: Date.now(), won: false });
  pendingChallenge = null;
  sfx('big');
  toast(tr(`⚔️ Challenge accepted! Beat ${money(S.challenge.score)}.`, `⚔️ ఛాలెంజ్ స్వీకరించారు! ${money(S.challenge.score)} దాటండి.`), 'good');
  save();
}
function challengeProgress(c) { return Math.min(1, Math.log10(S.lifetime + 1) / Math.log10(c.score + 1)); }
function checkChallenge() {
  const c = S.challenge;
  if (!c || c.won || S.lifetime <= c.score) return;
  c.won = true;
  S.gems += CHALLENGE_GEMS;
  sfx('win');
  confetti(null, 260);
  const name = esc(challengerName(c));
  queueModal(() => `${ico('trophy', 'big-ico')}<h3>${tr(`You beat ${name}!`, `మీరు ${name} ని ఓడించారు!`)}</h3>
    <p>${tr(`Your empire passed <b>${money(c.score)}</b>. +💎${CHALLENGE_GEMS}! Now challenge them back.`, `మీ సామ్రాజ్యం <b>${money(c.score)}</b> దాటింది. +💎${CHALLENGE_GEMS}! ఇప్పుడు మీరు తిరిగి ఛాలెంజ్ చేయండి.`)}</p>
    <div class="modal-actions"><button class="btn ghost" data-act="close">${tr('Close', 'మూసివేయి')}</button><button class="btn gold" data-act="share">${tr('Challenge back', 'తిరిగి ఛాలెంజ్')}</button></div>`);
  if (activeTab === 'missions') renderTab();
}
function challengeCardHtml() {
  const c = S.challenge;
  if (!c) {
    return `<div class="chal-card">${ico('swords', 'chal-ico')}<div class="info"><div class="title">${tr('Challenge a friend', 'స్నేహితుడిని ఛాలెంజ్ చేయండి')}</div>
      <div class="desc">${tr('Send your score. If they beat it, they win gems — then they challenge you back!', 'మీ స్కోర్ పంపండి. వారు దాటితే జెమ్స్ గెలుస్తారు — తర్వాత వారు మిమ్మల్ని ఛాలెంజ్ చేస్తారు!')}</div></div>
      <button class="btn gold" data-act="share">${tr('Challenge', 'ఛాలెంజ్')}</button></div>`;
  }
  const name = esc(challengerName(c));
  const pct = (challengeProgress(c) * 100).toFixed(1);
  return `<div class="chal-card ${c.won ? 'won' : ''}">${ico(c.won ? 'trophy' : 'swords', 'chal-ico')}<div class="info">
      <div class="title">${c.won ? tr(`You beat ${name}!`, `${name} పై గెలిచారు!`) : tr(`Beat ${name}'s empire`, `${name} సామ్రాజ్యాన్ని దాటండి`)}</div>
      <div class="mbar"><div id="chalBar" style="width:${c.won ? 100 : pct}%"></div></div>
      <div class="desc"><span id="chalVal">${money(S.lifetime)} / ${money(c.score)}</span> · ${tr('Reward', 'రివార్డ్')}: 💎${CHALLENGE_GEMS}</div></div>
      <button class="btn ${c.won ? 'gold' : 'ghost'}" data-act="share">${c.won ? tr('Challenge back', 'తిరిగి ఛాలెంజ్') : tr('Invite more', 'ఇంకా పంపండి')}</button></div>`;
}

/* ---------------------------- SHARE --------------------------------- */
function shareText() {
  return tr(`⚔️ I challenge you! My business empire is worth ${money(S.lifetime)}. Can you beat me? Play Business Empire:`,
    `⚔️ నా ఛాలెంజ్! నా బిజినెస్ సామ్రాజ్యం విలువ ${money(S.lifetime)}. నన్ను దాటగలరా? Business Empire ఆడండి:`);
}
async function shareGame() {
  const url = challengeUrl();
  const text = shareText();
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Business Empire', text, url });
      shareDone();
      return;
    } catch (e) {
      if (e && e.name === 'AbortError') return;
    }
  }
  const wa = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
  modal(`${ico('letter', 'big-ico')}<h3>${tr('Share with friends', 'స్నేహితులతో షేర్ చేయండి')}</h3>
    <p>${esc(text)}<br><b>${esc(url)}</b></p>
    <div class="modal-actions">
      <a class="btn" href="${wa}" target="_blank" rel="noopener" data-act="share-done">WhatsApp</a>
      <button class="btn blue" data-act="share-copy">${tr('Copy link', 'లింక్ కాపీ')}</button>
      <button class="btn ghost" data-act="close">${tr('Close', 'మూసివేయి')}</button>
    </div>`);
}
function shareDone() {
  S.stats.shares = (S.stats.shares || 0) + 1;
  toast(tr('💌 Thanks for sharing!', '💌 షేర్ చేసినందుకు ధన్యవాదాలు!'), 'good');
}
function copyText(text) {
  const done = () => toast(tr('📋 Copied!', '📋 కాపీ అయింది!'), 'good');
  if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done);
  else done();
}

/* ---------------------------- MUSIC --------------------------------- */
// Background music made live with WebAudio (no audio files): a 4-bar loop per world.
const Music = (() => {
  const _ = null;
  const SONGS = {
    earth: { bpm: 108, wave: 'triangle', echo: 0.18,
      chords: [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]],
      lead: [72, _, 76, _, 79, _, 76, 74, 72, _, 69, _, 72, _, 76, _, 77, _, 76, _, 74, _, 72, _, 74, _, 71, _, 67, _, _, _] },
    moon: { bpm: 78, wave: 'sine', echo: 0.38,
      chords: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]],
      lead: [76, _, _, _, 72, _, _, _, 77, _, _, _, 76, _, _, _, 79, _, _, _, 76, _, _, _, 74, _, _, _, _, _, _, _] },
    mars: { bpm: 122, wave: 'square', echo: 0.22,
      chords: [[62, 65, 69], [58, 62, 65], [60, 64, 67], [57, 61, 64]],
      lead: [74, _, 74, 77, _, 74, 72, _, 70, _, 70, 74, _, 72, 70, _, 72, _, 72, 76, _, 74, 72, _, 73, _, _, 69, _, _, _, _] },
    galaxy: { bpm: 92, wave: 'triangle', echo: 0.32,
      chords: [[64, 67, 71], [60, 64, 67], [55, 59, 62], [62, 66, 69]],
      lead: [79, _, 76, _, 83, _, _, 79, 76, _, 72, _, 76, _, _, _, 74, _, 79, _, 83, _, 81, 79, 78, _, _, 74, _, _, _, _] },
  };
  let ctx = null, master = null, echo = null, noise = null, timer = null, step = 0, nextTime = 0, song = SONGS.earth;
  const freq = m => 440 * Math.pow(2, (m - 69) / 12);
  function setup() {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    ctx = actx;
    master = ctx.createGain();
    master.gain.value = 0.11;
    master.connect(ctx.destination);
    echo = ctx.createDelay(1);
    const fb = ctx.createGain();
    fb.gain.value = 0.3;
    echo.connect(fb).connect(echo);
    echo.connect(master);
    noise = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let k = 0; k < data.length; k++) data[k] = Math.random() * 2 - 1;
  }
  function tone(t, midi, dur, type, vol, toEcho) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq(midi), t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    if (type === 'square') {
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 1400;
      g.connect(lp); lp.connect(master); if (toEcho) lp.connect(echo);
    } else { g.connect(master); if (toEcho) g.connect(echo); }
    o.start(t); o.stop(t + dur + 0.05);
  }
  function kick(t) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(130, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.15);
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    o.connect(g).connect(master);
    o.start(t); o.stop(t + 0.22);
  }
  function hat(t, vol) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noise; f.type = 'highpass'; f.frequency.value = 7000;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    s.connect(f).connect(g).connect(master);
    s.start(t); s.stop(t + 0.06);
  }
  function playStep(t) {
    const eighth = 60 / song.bpm / 2;
    const bar = Math.floor(step / 8) % 4, pos = step % 8;
    const chord = song.chords[bar];
    if (pos === 0) chord.forEach(n => tone(t, n, eighth * 8, 'sine', 0.05, false));       // pad
    if (pos === 0 || pos === 4) tone(t, chord[0] - 24, eighth * 3, 'triangle', 0.18, false); // bass
    tone(t, chord[pos % 3] + 12, eighth * 0.9, song.wave, 0.025, false);                  // arpeggio
    const ln = song.lead[step % 32];
    if (ln) tone(t, ln, eighth * 1.8, song.wave, 0.07, true);                              // melody
    if (song !== SONGS.moon) { if (pos === 0 || pos === 4) kick(t); if (pos % 2 === 1) hat(t, 0.05); }
    else if (pos === 0) hat(t, 0.03);
  }
  function schedule() {
    while (nextTime < ctx.currentTime + 0.25) {
      playStep(nextTime);
      nextTime += 60 / song.bpm / 2;
      step = (step + 1) % 32;
    }
  }
  return {
    start() {
      if (!S.settings.music || document.hidden) return;
      try {
        if (!ctx) setup();
        ctx.resume();
        if (timer) return;
        echo.delayTime.value = song.echo;
        nextTime = ctx.currentTime + 0.1;
        timer = setInterval(schedule, 60);
      } catch (e) { /* audio unavailable */ }
    },
    stop() { clearInterval(timer); timer = null; },
    setWorld(id) { song = SONGS[id] || SONGS.earth; if (echo) echo.delayTime.value = song.echo; },
    get playing() { return !!timer; },
  };
})();
function toggleMusic() {
  S.settings.music = !S.settings.music;
  if (S.settings.music) Music.start(); else Music.stop();
  updateMusicBtn();
  if (activeTab === 'settings') renderTab();
  save();
}
function updateMusicBtn() {
  const b = $('musicBtn');
  if (b) { b.classList.toggle('off', !S.settings.music); b.title = S.settings.music ? tr('Music on', 'మ్యూజిక్ ఆన్') : tr('Music off', 'మ్యూజిక్ ఆఫ్'); }
}

/* ---------------------------- FESTIVALS ----------------------------- */
// Lunar festival dates are listed per year; fixed ones use MM-DD. Each runs for a few days around the date.
const FESTIVALS = [
  { id: 'newyear',   icon: 'fireworks', name: ['New Year', 'నూతన సంవత్సరం'], dates: ['01-01'], before: 1, after: 1,
    greet: ['Happy New Year!', 'నూతన సంవత్సర శుభాకాంక్షలు!'] },
  { id: 'sankranti', icon: 'kite',      name: ['Sankranti', 'సంక్రాంతి'], dates: ['01-14'], before: 1, after: 2,
    greet: ['Happy Sankranti!', 'సంక్రాంతి శుభాకాంక్షలు!'] },
  { id: 'ugadi',     icon: 'mango',     name: ['Ugadi', 'ఉగాది'], dates: ['2026-03-19', '2027-04-07', '2028-03-27'], before: 2, after: 2,
    greet: ['Happy Ugadi!', 'ఉగాది శుభాకాంక్షలు!'] },
  { id: 'ganesh',    icon: 'elephant',  name: ['Vinayaka Chavithi', 'వినాయక చవితి'], dates: ['2026-09-14', '2027-09-04', '2028-08-23'], before: 2, after: 3,
    greet: ['Happy Vinayaka Chavithi!', 'వినాయక చవితి శుభాకాంక్షలు!'] },
  { id: 'dasara',    icon: 'bow',       name: ['Dasara', 'దసరా'], dates: ['2026-10-20', '2027-10-09', '2028-09-27'], before: 3, after: 3,
    greet: ['Happy Dasara!', 'దసరా శుభాకాంక్షలు!'] },
  { id: 'diwali',    icon: 'diya',      name: ['Diwali', 'దీపావళి'], dates: ['2026-11-08', '2027-10-29', '2028-10-17'], before: 3, after: 2,
    greet: ['Happy Diwali!', 'దీపావళి శుభాకాంక్షలు!'] },
  { id: 'christmas', icon: 'xmas',      name: ['Christmas', 'క్రిస్మస్'], dates: ['12-25'], before: 2, after: 2,
    greet: ['Merry Christmas!', 'క్రిస్మస్ శుభాకాంక్షలు!'] },
];
const FEST_FLOATERS = { newyear: ['fireworks', 'sparkler', 'party'], sankranti: ['kite', 'kite', 'sun'], ugadi: ['mango', 'hibiscus', 'seedling'],
  ganesh: ['elephant', 'lotus', 'hibiscus'], dasara: ['bow', 'hibiscus', 'diya'], diwali: ['diya', 'sparkler', 'fireworks'], christmas: ['xmas', 'gift', 'star'] };
let festCache = { min: -1, value: null };
function activeFestival() {
  const min = Math.floor(Date.now() / 60000);
  if (festCache.min === min) return festCache.value;
  const now = new Date(), y = now.getFullYear();
  let found = null;
  for (const f of FESTIVALS) {
    for (const d of f.dates) {
      const list = d.length === 5 ? [y - 1, y, y + 1].map(yy => `${yy}-${d}`) : [d];
      for (const ds of list) {
        const [yy, mm, dd] = ds.split('-').map(Number);
        const start = new Date(yy, mm - 1, dd - f.before), end = new Date(yy, mm - 1, dd + f.after + 1);
        if (now >= start && now < end) { found = { fest: f, key: `${f.id}-${yy}`, end }; break; }
      }
      if (found) break;
    }
    if (found) break;
  }
  festCache = { min, value: found };
  return found;
}
function festivalHtml() {
  const a = activeFestival();
  if (!a) return '';
  const f = a.fest, claimed = !!S.festivals[a.key];
  const left = fmtDur((a.end - Date.now()) / 1000);
  return `${ico(f.icon, 'big-ico')}<h3>${tr(...f.greet)}</h3>
    <p>${tr(`The <b>${f.name[0]}</b> festival is on! <b>All profits x2</b> for ${left}.`, `<b>${f.name[1]}</b> పండుగ వచ్చింది! ${left} వరకు <b>అన్ని లాభాలు x2</b>.`)}</p>
    <div class="fest-gift">${ico('gift')}<div><b>${tr('Festival gift', 'పండుగ కానుక')}</b><br>💎 25 + ${tr('30 min income', '30 నిమి ఆదాయం')}</div></div>
    <div class="modal-actions">${claimed ? `<button class="btn ghost" data-act="close">${tr('Close', 'మూసివేయి')}</button>`
      : `<button class="btn gold" data-act="fest-claim">${tr('Claim gift!', 'కానుక తీసుకోండి!')}</button>`}</div>`;
}
function claimFestival() {
  const a = activeFestival();
  if (!a || S.festivals[a.key]) return;
  S.festivals[a.key] = Date.now();
  S.gems += 25;
  earn(bonusCash(1800));
  sfx('win');
  toast(`${emo(a.fest.icon)} ${tr(...a.fest.greet)} +25 💎`, 'gem');
  confetti(null, 220);
  save();
}
let floaterAcc = 0;
function festivalFloaters(dt) {
  const a = activeFestival();
  const fid = a ? a.fest.id : '';
  if (document.body.dataset.fest !== fid) document.body.dataset.fest = fid;
  if (!a || fxOff() || document.hidden) return;
  if ((floaterAcc += dt) < 4) return;
  floaterAcc = 0;
  const icons = FEST_FLOATERS[a.fest.id] || [a.fest.icon];
  const el = document.createElement('div');
  el.className = 'fest-float';
  el.innerHTML = ico(icons[Math.floor(Math.random() * icons.length)]);
  el.style.left = rand(2, 92) + 'vw';
  el.style.setProperty('--drift', rand(-60, 60) + 'px');
  el.style.animationDuration = rand(9, 14) + 's';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 15000);
}

/* ---------------------------- REWARDED ADS -------------------------- */
// Google H5 Games Ads ("watch a video for a boost"). Off until ADS_CLIENT holds an approved
// AdSense publisher ID like 'ca-pub-1234567890123456'. Set ADS_TEST to false once ads are live.
const ADS_CLIENT = '';
const ADS_TEST = true;
const AD_REWARD_SECS = 1800;
let adsReady = false, pendingShowAd = null;
function initAds() {
  if (!ADS_CLIENT) return;
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
  s.setAttribute('data-ad-client', ADS_CLIENT);
  s.setAttribute('data-ad-frequency-hint', '60s');
  if (ADS_TEST) s.setAttribute('data-adbreak-test', 'on');
  document.head.appendChild(s);
  window.adsbygoogle = window.adsbygoogle || [];
  window.adBreak = window.adConfig = o => window.adsbygoogle.push(o);
  window.adConfig({ preloadAdBreaks: 'on', sound: 'on', onReady: () => { adsReady = true; $('adBtn').classList.remove('hidden'); } });
}
function watchAd() {
  if (!adsReady) { toast(tr('No video right now. Try again later.', 'ఇప్పుడు వీడియో లేదు. తర్వాత ప్రయత్నించండి.'), 'bad'); return; }
  let rewarded = false;
  window.adBreak({
    type: 'reward', name: 'x2-boost',
    beforeAd: () => Music.stop(),
    afterAd: () => Music.start(),
    beforeReward: showAdFn => {
      pendingShowAd = showAdFn;
      modal(`${ico('tv', 'big-ico')}<h3>${tr('Free x2 boost', 'ఫ్రీ x2 బూస్ట్')}</h3>
        <p>${tr('Watch a short video to get <b>x2 profits for 30 minutes</b>.', 'చిన్న వీడియో చూసి <b>30 నిమిషాలు x2 లాభాలు</b> పొందండి.')}</p>
        <div class="modal-actions"><button class="btn ghost" data-act="close">${tr('No thanks', 'వద్దు')}</button><button class="btn gold" data-act="ad-go">${tr('Watch video', 'వీడియో చూడు')}</button></div>`);
    },
    adDismissed: () => toast(tr('Watch the whole video to get the boost.', 'బూస్ట్ కోసం వీడియో మొత్తం చూడండి.'), 'bad'),
    adViewed: () => {
      rewarded = true;
      S.boosts.rush += AD_REWARD_SECS;
      S.stats.adsWatched = (S.stats.adsWatched || 0) + 1;
      sfx('win');
      toast(tr('📺 Thanks! x2 profits for 30 minutes.', '📺 ధన్యవాదాలు! 30 నిమిషాలు x2 లాభాలు.'), 'gem');
      confetti(null, 100);
      save();
    },
    adBreakDone: info => {
      pendingShowAd = null;
      if (!rewarded && info && info.breakStatus && !['viewed', 'dismissed', 'ignored'].includes(info.breakStatus)) {
        toast(tr('No video right now. Try again later.', 'ఇప్పుడు వీడియో లేదు. తర్వాత ప్రయత్నించండి.'), 'bad');
      }
    },
  });
}

/* ---------------------------- SCRATCH CARD ------------------------- */
// One free card a day (more for gems). The prize is picked when the card is made and saved,
// so closing the card or reloading never changes it. Three matching symbols show the prize.
const SCRATCH_GEMS = 3;
const SCRATCH_PRIZES = [
  { icon: 'coin',      t: ['10 min income', '10 నిమి ఆదాయం'], w: 30, give: () => cashPrize(600) },
  { icon: 'gem',       t: ['5 Gems', '5 జెమ్స్'],              w: 25, give: () => { S.gems += 5; return tr('+5 gems', '+5 జెమ్స్'); } },
  { icon: 'bolt',      t: ['x2 for 10m', '10 నిమి x2'],         w: 18, give: () => { S.boosts.rush += 600; return tr('x2 profits for 10 minutes', '10 నిమిషాలు x2 లాభాలు'); } },
  { icon: 'hourglass', t: ['1 hour income', '1 గంట ఆదాయం'],   w: 12, give: () => cashPrize(3600) },
  { icon: 'sparkles',  t: ['x5 for 30s', '30 సె x5'],           w: 10, give: () => { S.boosts.golden += 30; return tr('x5 profits for 30 seconds', '30 సెకన్లు x5 లాభాలు'); } },
  { icon: 'crown',     t: ['15 Gems', '15 జెమ్స్'],             w: 5,  big: true, give: () => { S.gems += 15; return tr('JACKPOT! +15 gems', 'జాక్‌పాట్! +15 జెమ్స్'); } },
];
function scratchFreeReady() { return S.scratch.day !== dayKey(); }
function newScratchCard(paid) {
  const total = SCRATCH_PRIZES.reduce((a, p) => a + p.w, 0);
  let roll = Math.random() * total, k = 0;
  while (roll >= SCRATCH_PRIZES[k].w) { roll -= SCRATCH_PRIZES[k].w; k++; }
  // 3 winning symbols + 3 different other symbols, shuffled
  const others = SCRATCH_PRIZES.map((p, j) => j).filter(j => j !== k).sort(() => Math.random() - 0.5).slice(0, 3);
  const cells = [k, k, k, ...others].sort(() => Math.random() - 0.5);
  return { prize: k, cells, paid, done: false };
}
function openScratch() {
  if (!S.scratch.card && scratchFreeReady()) { S.scratch.day = dayKey(); S.scratch.card = newScratchCard(false); save(); }
  modal(scratchHtml());
  if (S.scratch.card && !S.scratch.card.done) setTimeout(initScratchCanvas, 30);
}
function buyScratch() {
  if (S.scratch.card && !S.scratch.card.done) return;
  if (S.gems < SCRATCH_GEMS) { sfx('err'); toast(tr('Not enough gems.', 'జెమ్స్ సరిపోవు.'), 'bad'); return; }
  S.gems -= SCRATCH_GEMS;
  S.scratch.card = newScratchCard(true);
  save();
  modal(scratchHtml());
  setTimeout(initScratchCanvas, 30);
}
function scratchHtml() {
  const c = S.scratch.card;
  const sub = tr('Scratch the silver area. Match 3 symbols to win!', 'వెండి భాగాన్ని గీకండి. 3 ఒకేలా ఉంటే గెలుపు!');
  if (!c) {
    return `${ico('ticket', 'big-ico')}<h3>${tr('Scratch Card', 'స్క్రాచ్ కార్డ్')}</h3>
      <p>${tr('Your free card for today is used. A new free card comes tomorrow!', 'ఈ రోజు ఫ్రీ కార్డ్ అయిపోయింది. రేపు కొత్త ఫ్రీ కార్డ్ వస్తుంది!')}</p>
      <div class="modal-actions"><button class="btn ghost" data-act="close">${tr('Close', 'మూసివేయి')}</button>
      <button class="btn blue" data-act="scratch-buy" data-gems="${SCRATCH_GEMS}">${tr('New card', 'కొత్త కార్డ్')} · 💎${SCRATCH_GEMS}</button></div>`;
  }
  const cells = c.cells.map(j => `<div class="sc-cell ${c.done && j === c.prize ? 'win' : ''}">${ico(SCRATCH_PRIZES[j].icon)}<small>${tr(...SCRATCH_PRIZES[j].t)}</small></div>`).join('');
  const actions = c.done
    ? `<button class="btn ghost" data-act="close">${tr('Close', 'మూసివేయి')}</button>
       <button class="btn blue" data-act="scratch-buy" data-gems="${SCRATCH_GEMS}">${tr('New card', 'కొత్త కార్డ్')} · 💎${SCRATCH_GEMS}</button>`
    : `<button class="btn ghost" data-act="scratch-reveal">${tr('Reveal all', 'అన్నీ చూపించు')}</button>`;
  return `<h3>${tr('Scratch Card', 'స్క్రాచ్ కార్డ్')}</h3><p class="sub">${c.done ? tr(`You won: <b>${SCRATCH_PRIZES[c.prize].t[0]}</b>!`, `మీరు గెలిచింది: <b>${SCRATCH_PRIZES[c.prize].t[1]}</b>!`) : sub}</p>
    <div class="scratch-card ${c.done ? 'done' : ''}"><div class="sc-grid">${cells}</div>${c.done ? '' : '<canvas id="scratchCv"></canvas>'}</div>
    <div class="modal-actions">${actions}</div>`;
}
function initScratchCanvas() {
  const cv = $('scratchCv');
  if (!cv) return;
  const r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = r.width * dpr; cv.height = r.height * dpr;
  const ctx = cv.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, cv.width, cv.height);
  g.addColorStop(0, '#c9ced8'); g.addColorStop(0.5, '#eef1f6'); g.addColorStop(1, '#aab0bd');
  ctx.fillStyle = g; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.fillStyle = 'rgba(90, 96, 112, .45)';
  ctx.font = `700 ${16 * dpr}px Fredoka, sans-serif`;
  ctx.textAlign = 'center';
  for (let y = 30 * dpr; y < cv.height; y += 46 * dpr) {
    for (let x = 50 * dpr; x < cv.width; x += 110 * dpr) ctx.fillText(tr('SCRATCH', 'గీకండి'), x + (y / dpr % 92 ? 55 * dpr : 0), y);
  }
  ctx.globalCompositeOperation = 'destination-out';
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 46 * dpr;
  let down = false, lastPt = null, moves = 0;
  const pt = e => { const b = cv.getBoundingClientRect(); return [(e.clientX - b.left) * dpr, (e.clientY - b.top) * dpr]; };
  const scrape = p => {
    ctx.beginPath();
    if (lastPt) ctx.moveTo(...lastPt); else ctx.moveTo(p[0] - 0.1, p[1]);
    ctx.lineTo(...p); ctx.stroke();
    lastPt = p;
    if (++moves % 6 === 0) { sfx('tick'); if (clearedShare(ctx, cv) > 0.5) revealScratch(); }
  };
  cv.addEventListener('pointerdown', e => { down = true; lastPt = null; cv.setPointerCapture(e.pointerId); scrape(pt(e)); });
  cv.addEventListener('pointermove', e => { if (down) scrape(pt(e)); });
  const up = () => { down = false; lastPt = null; };
  cv.addEventListener('pointerup', up);
  cv.addEventListener('pointercancel', up);
}
function clearedShare(ctx, cv) {
  const data = ctx.getImageData(0, 0, cv.width, cv.height).data;
  let clear = 0, n = 0;
  for (let i = 3; i < data.length; i += 4 * 16) { n++; if (data[i] < 32) clear++; }
  return clear / n;
}
function revealScratch() {
  const c = S.scratch.card;
  if (!c || c.done) return;
  c.done = true;
  const p = SCRATCH_PRIZES[c.prize];
  const msg = p.give();
  S.stats.scratches = (S.stats.scratches || 0) + 1;
  save();
  sfx(p.big ? 'win' : 'big');
  toast(`🎫 ${msg}`, 'gem');
  modal(scratchHtml());
  confetti(document.querySelector('.scratch-card'), p.big ? 220 : 90);
  // The finished card stays visible until closed; the next open starts a new one
  S.scratch.card = null;
  save();
}

/* ---------------------------- STOCK MARKET -------------------------- */
// Every player sees the same prices: a slow wave, a faster wave and smooth noise, all worked out
// from the clock (one step per minute), so no server is needed. Shares are kept per world.
/* ---------------------------- SPIN GAME (slot machine) ------------- */
// Energy refills over time; each spin costs energy times the bet and pays coins, cash, gems or energy.
const SLOT_MAX = 50, SLOT_REGEN = 6 * 60 * 1000, SLOT_BETS = [1, 2, 3, 5, 10], PIGGY_GEMS = 10, PIGGY_CAP = 250000;
const SLOT_SYMS = [
  { k: 'coin', w: 30 }, { k: 'cherry', w: 22 }, { k: 'moneybag', w: 16 }, { k: 'bolt', w: 12 }, { k: 'pig', w: 8 }, { k: 'gem', w: 6 }, { k: 'swords', w: 14 }, { k: 'hammer', w: 9 }, { k: 'shield', w: 9 },
];
const SLOT_CELL = 88; // px height of one symbol on a reel
let slotBusy = false, slotAuto = false;
function slotRegen() {
  const sl = S.slot, now = Date.now();
  if (!sl.at) sl.at = now;
  if (sl.energy >= SLOT_MAX) { sl.at = now; return; }
  const n = Math.floor((now - sl.at) / SLOT_REGEN);
  if (n > 0) { sl.energy = Math.min(SLOT_MAX, sl.energy + n); sl.at = sl.energy >= SLOT_MAX ? now : sl.at + n * SLOT_REGEN; }
}
function slotNextIn() { return S.slot.energy >= SLOT_MAX ? 0 : Math.max(0, (S.slot.at + SLOT_REGEN - Date.now()) / 1000); }
function slotPick() {
  const total = SLOT_SYMS.reduce((t, x) => t + x.w, 0);
  let r = Math.random() * total;
  for (const x of SLOT_SYMS) { if ((r -= x.w) < 0) return x.k; }
  return 'coin';
}
// What a line pays: three of a kind is the big prize, two of a kind a small one
function slotPrize(line, bet) {
  const cnt = {}; line.forEach(k => { cnt[k] = (cnt[k] || 0) + 1; });
  const [top, n] = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0];
  const p = { coins: 0, cash: 0, gems: 0, energy: 0, piggy: false, big: n === 3, small: n < 2 };
  if (n === 3) {
    if (top === 'coin') p.coins = 20000 * bet;
    if (top === 'cherry') p.coins = 10000 * bet;
    if (top === 'moneybag') p.cash = bonusCash(900 * bet);
    if (top === 'bolt') p.energy = 10 * bet;
    if (top === 'pig') p.piggy = true;
    if (top === 'gem') p.gems = 3 * bet;
  } else if (n === 2) {
    if (top === 'coin') p.coins = 3000 * bet;
    if (top === 'cherry') p.coins = 1500 * bet;
    if (top === 'moneybag') p.cash = bonusCash(90 * bet);
    if (top === 'bolt') p.energy = bet;
    if (top === 'pig' || top === 'gem') p.coins = 1000 * bet;
    if (top === 'swords') p.small = false;
    if (top === 'hammer' || top === 'shield') p.coins = 1000 * bet;
  } else p.coins = 500 * bet; // a little something every spin
  return p;
}
function slotPaytableHtml() {
  const rows = [
    ['coin', tr('20,000 coins', '20,000 కాయిన్లు'), tr('3,000 coins', '3,000 కాయిన్లు')],
    ['cherry', tr('10,000 coins', '10,000 కాయిన్లు'), tr('1,500 coins', '1,500 కాయిన్లు')],
    ['moneybag', tr('15 min of income', '15 నిమిషాల ఆదాయం'), tr('1.5 min of income', '1.5 నిమిషాల ఆదాయం')],
    ['bolt', tr('+10 energy', '+10 ఎనర్జీ'), tr('energy back', 'ఎనర్జీ తిరిగి')],
    ['pig', tr('Piggy bank opens free!', 'పిగ్గీ బ్యాంక్ ఫ్రీగా తెరుచుకుంటుంది!'), tr('1,000 coins', '1,000 కాయిన్లు')],
    ['gem', tr('3 gems', '3 జెమ్స్'), tr('1,000 coins', '1,000 కాయిన్లు')],
    ['hammer', tr('Raid another village!', 'ఇంకో ఊరిపై దాడి!'), tr('1,000 coins', '1,000 కాయిన్లు')],
    ['shield', tr('+1 shield (max 3)', '+1 షీల్డ్ (3 వరకు)'), tr('1,000 coins', '1,000 కాయిన్లు')],
    ['swords', tr('Critical hit: 100 × bet damage', 'క్రిటికల్ హిట్: 100 × బెట్ దెబ్బ'), tr('Each ⚔️ hits the boss for 10 × bet', 'ప్రతి ⚔️ బాస్‌కి 10 × బెట్ దెబ్బ')],
  ];
  return `<div class="paytable"><div class="pt-head"><span>${tr('Symbol', 'గుర్తు')}</span><span>×3</span><span>×2</span></div>` +
    rows.map(([k, a, b]) => `<div class="pt-row"><span>${ico(k)}${ico(k)}${ico(k)}</span><span>${a}</span><span>${b}</span></div>`).join('') +
    `<p class="sub">${tr('Every prize is multiplied by your bet. Any other spin still pays 500 coins × bet.', 'ప్రతి బహుమతి మీ బెట్‌తో గుణించబడుతుంది. మిగతా ప్రతి స్పిన్‌కి 500 కాయిన్లు × బెట్.')}</p></div>`;
}
function reelHtml(k, i) {
  return `<div class="reel" id="reel${i}"><div class="strip" id="strip${i}">${[slotPick(), k, slotPick()].map(x => `<div class="sym">${ico(x)}</div>`).join('')}</div></div>`;
}
function spinBtnHtml() { return `${tr('SPIN', 'స్పిన్')}<small>${tr('uses', 'ఖర్చు')} ${S.slot.bet} ⚡</small>`; }
function betBtnHtml() { return `${tr('BET', 'బెట్')} ×${S.slot.bet} ${ico('bolt')}`; }
function renderSlots() {
  slotRegen();
  const sl = S.slot, last = sl.last || ['coin', 'cherry', 'moneybag'];
  const piggyPct = Math.min(100, sl.piggy / PIGGY_CAP * 100);
  return header('slot', tr('Spin Game', 'స్పిన్ గేమ్'), tr('Spend energy to spin. Coins build Landmarks, ⚔️ hits the boss, and cash and gems help your businesses.', 'ఎనర్జీతో స్పిన్ చేయండి. కాయిన్లతో ల్యాండ్‌మార్కులు కడతారు, ⚔️ బాస్‌ని కొడుతుంది, క్యాష్, జెమ్స్ మీ వ్యాపారాలకు.')) +
    `<div class="slot-top">
      <div class="slot-stat">${ico('battery')}<b id="slotEnergy">${sl.energy}</b><small>/ ${SLOT_MAX}</small><em id="slotTimer"></em></div>
      <div class="slot-stat coins">${ico('coin')}<b id="slotCoins">${fmtInt(sl.coins)}</b><small>${tr('coins', 'కాయిన్లు')}</small></div>
    </div>
    <div class="event-row">${bossCardHtml()}${colCardHtml()}</div>
    <div class="slot-machine">
      <div class="slot-lights"></div>
      <div class="reels">${last.map((k, i) => reelHtml(k, i)).join('')}<div class="payline"></div></div>
      <div class="slot-result" id="slotResult">${tr('Good luck, boss!', 'ఆల్ ది బెస్ట్, బాస్!')}</div>
      <div class="slot-controls">
        <button class="btn ghost bet-btn" data-act="slot-bet" id="slotBetBtn">${betBtnHtml()}</button>
        <button class="btn gold spin-big" data-act="slot-spin" id="slotSpinBtn">${spinBtnHtml()}</button>
        <button class="btn ghost auto-btn ${slotAuto ? 'on' : ''}" data-act="slot-auto" id="slotAutoBtn">${tr('AUTO', 'ఆటో')}</button>
      </div>
    </div>
    ${raidCardHtml()}
    <div class="gift-row">${giftCardHtml()}${calCardHtml()}</div>
    <div class="piggy-card">
      <div class="piggy-ico">${ico('pig')}</div>
      <div class="info"><div class="title">${tr('Piggy bank', 'పిగ్గీ బ్యాంక్')} · <span id="piggyVal">${fmtInt(sl.piggy)}</span> ${tr('coins', 'కాయిన్లు')}</div>
        <div class="mbar"><div id="piggyBar" style="width:${piggyPct}%"></div></div>
        <div class="desc">${tr('Every spin drops coins in. Break it with gems, or hit 🐷🐷🐷 to open it free.', 'ప్రతి స్పిన్‌కి కాయిన్లు పడతాయి. జెమ్స్‌తో పగలగొట్టండి, లేదా 🐷🐷🐷 వస్తే ఫ్రీ.')}</div></div>
      <button class="btn blue" data-act="piggy-break" data-gems="${PIGGY_GEMS}">💎 ${PIGGY_GEMS}</button>
    </div>
    <details class="pt-wrap"><summary>${ico('trophy')} ${tr('Prizes', 'బహుమతులు')}</summary>${slotPaytableHtml()}</details>`;
}
// ---- Free gift (energy every 20 minutes, 7 gifts fill a treasure chest) and the 7-day spin calendar ----
const GIFT_EVERY = 20 * 60 * 1000, GIFT_ENERGY = 5, CHEST_SIZE = 7;
const CAL_ENERGY = [10, 15, 20, 25, 30, 40, 60], CAL_GEMS_DAY7 = 15;
function giftReady() { return Date.now() >= S.slot.gift.at; }
function giftIn() { return Math.max(0, (S.slot.gift.at - Date.now()) / 1000); }
function calReady() { return S.slot.cal.last !== dayKey(); }
function calDay() { return S.slot.cal.last === dayKey(-1) ? S.slot.cal.streak % 7 + 1 : 1; } // day you'd claim next (1–7)
function giftCardHtml() {
  const g = S.slot.gift, ready = giftReady();
  const segs = Array.from({ length: CHEST_SIZE }, (_, k) => `<span class="${k < g.chest ? 'on' : ''}"></span>`).join('');
  return `<div class="gift-card ${ready ? 'ready' : ''}" id="giftCard">
    <div class="gc-head">${ico('gift')}<b>${tr('Free gift', 'ఫ్రీ గిఫ్ట్')}</b></div>
    <div class="gc-chest"><div class="gc-segs">${segs}</div>${ico('briefcase')}</div>
    <button class="btn ${ready ? 'gold' : 'ghost'} gc-btn" data-act="gift-claim" id="giftBtn" ${ready ? '' : 'disabled'}>${ready ? `${tr('Claim', 'తీసుకో')} +${GIFT_ENERGY} ⚡` : fmtClock(giftIn())}</button>
  </div>`;
}
function calCardHtml() {
  const ready = calReady(), next = calDay(), done = ready ? next - 1 : S.slot.cal.streak % 7 || 7;
  const cells = CAL_ENERGY.map((e, k) => {
    const d = k + 1, cls = d <= done ? 'got' : ready && d === next ? 'today' : '';
    return `<div class="cal-cell ${cls}"><small>${tr('Day', 'రోజు')} ${d}</small><b>${e}⚡</b>${d === 7 ? `<em>+${CAL_GEMS_DAY7}💎</em>` : ''}${d <= done ? '<i>✓</i>' : ''}</div>`;
  }).join('');
  return `<div class="cal-card" id="calCard">
    <div class="gc-head">${ico('calendar')}<b>${tr('Spin calendar', 'స్పిన్ క్యాలెండర్')}</b><small>${tr('Come back every day for more energy', 'రోజూ వస్తే ఇంకా ఎక్కువ ఎనర్జీ')}</small></div>
    <div class="cal-row">${cells}</div>
    ${ready ? `<button class="btn gold" data-act="cal-claim">${tr(`Claim day ${next}`, `రోజు ${next} తీసుకో`)}: +${CAL_ENERGY[next - 1]} ⚡</button>` : `<p class="sub">${tr('Claimed today. See you tomorrow!', 'ఈ రోజు తీసుకున్నారు. రేపు కలుద్దాం!')}</p>`}
  </div>`;
}
function claimGift() {
  if (!giftReady()) return;
  const g = S.slot.gift;
  g.at = Date.now() + GIFT_EVERY;
  S.slot.energy += GIFT_ENERGY; g.chest++;
  let msg = tr(`🎁 +${GIFT_ENERGY} energy!`, `🎁 +${GIFT_ENERGY} ఎనర్జీ!`);
  if (g.chest >= CHEST_SIZE) {
    g.chest = 0;
    const coins = 50000, gems = 10;
    S.slot.coins += coins; S.gems += gems; S.slot.energy += 20; giveAlbumPack('basic', 1, true);
    msg = tr(`🧰 Treasure chest! +${fmtInt(coins)} coins, +${gems} 💎, +20 ⚡, +1 📦`, `🧰 నిధి పెట్టె! +${fmtInt(coins)} కాయిన్లు, +${gems} 💎, +20 ⚡, +1 📦`);
    confetti($('giftCard'), 120); sfx('win');
  } else sfx('cash');
  toast(msg, 'good');
  save(); renderTab();
}
function claimCalendar() {
  if (!calReady()) return;
  const C = S.slot.cal, d = calDay(), e = CAL_ENERGY[d - 1];
  C.streak = d === 1 ? 1 : C.streak + 1; C.last = dayKey();
  S.slot.energy += e;
  let msg = tr(`🗓️ Day ${d}: +${e} energy!`, `🗓️ రోజు ${d}: +${e} ఎనర్జీ!`);
  if (d === 7) { S.gems += CAL_GEMS_DAY7; giveAlbumPack('gold', 1, true); msg += ` +${CAL_GEMS_DAY7} 💎 +1 📦`; confetti($('calCard'), 140); }
  sfx('win'); toast(msg, 'good');
  save(); renderTab();
}
// ---- Boss battle: ⚔️ on the reels hits the boss; beat it for coins, gems and energy ----
const BOSSES = [
  { icon: 'alienm', name: ['Space Pirate', 'స్పేస్ పైరేట్'] },
  { icon: 'robot', name: ['Robo Raider', 'రోబో రైడర్'] },
  { icon: 'lion', name: ['Jungle King', 'అడవి రాజు'] },
  { icon: 'ufo', name: ['UFO Boss', 'యూఎఫ్‌ఓ బాస్'] },
  { icon: 'dragon', name: ['Gold Dragon', 'బంగారు డ్రాగన్'] },
];
function bossMaxHp(lvl) { return Math.round(300 * Math.pow(1.6, lvl - 1) / 10) * 10; }
function bossOf(lvl) { return BOSSES[(lvl - 1) % BOSSES.length]; }
function bossReward(lvl) { return { coins: 30000 * lvl, gems: 4 + lvl, energy: 15 }; }
function bossCardHtml() {
  const b = S.slot.boss, B = bossOf(b.lvl), max = bossMaxHp(b.lvl), r = bossReward(b.lvl);
  return `<div class="boss-card" id="bossCard">
    <div class="boss-side you">${ico('manager')}<small>${tr('You', 'మీరు')}</small></div>
    <div class="boss-mid">
      <div class="boss-name">${ico('swords')} ${tr(...B.name)} <span>${tr('Lv', 'లెవల్')} ${b.lvl}</span></div>
      <div class="boss-hp"><div style="width:${Math.max(0, b.hp) / max * 100}%"></div><b>${fmtInt(Math.max(0, b.hp))} / ${fmtInt(max)}</b></div>
      <div class="boss-prize">${tr('Win', 'గెలిస్తే')}: ${ico('coin')} ${fmtInt(r.coins)} · 💎 ${r.gems} · ⚡ ${r.energy}</div>
    </div>
    <div class="boss-side foe" id="bossFoe">${ico(B.icon)}</div>
  </div>`;
}
// Each ⚔️ deals 10 × bet; three of them are a critical hit for 100 × bet
function slotBattle(line, bet) {
  const n = line.filter(k => k === 'swords').length;
  if (!n) return '';
  const b = S.slot.boss, dmg = (n === 3 ? 100 : 10 * n) * bet;
  b.hp -= dmg;
  const foe = $('bossFoe');
  if (foe) {
    restartAnim(foe, 'shake');
    const f = document.createElement('span'); f.className = 'dmg-float'; f.textContent = `-${fmtInt(dmg)}`;
    foe.appendChild(f); setTimeout(() => f.remove(), 1100);
  }
  sfx(n === 3 ? 'big' : 'err');
  let msg = n === 3 ? tr(`⚔️ Critical hit! -${fmtInt(dmg)}`, `⚔️ క్రిటికల్ హిట్! -${fmtInt(dmg)}`) : `⚔️ -${fmtInt(dmg)}`;
  if (b.hp <= 0) {
    const B = bossOf(b.lvl), r = bossReward(b.lvl);
    S.slot.coins += r.coins; S.gems += r.gems; S.slot.energy += r.energy;
    S.stats.bosses = (S.stats.bosses || 0) + 1;
    giveAlbumPack('gold', 1, true);
    msg = tr(`🏆 ${B.name[0]} defeated! +${fmtInt(r.coins)} coins, +${r.gems} 💎, +${r.energy} ⚡, +1 📦`, `🏆 ${B.name[1]} ఓడిపోయాడు! +${fmtInt(r.coins)} కాయిన్లు, +${r.gems} 💎, +${r.energy} ⚡, +1 📦`);
    b.lvl++; b.hp = bossMaxHp(b.lvl);
    setTimeout(() => { toast(msg, 'good'); sfx('win'); confetti($('bossCard'), 160); }, 300);
  }
  return msg;
}
// ---- Weekly collection: every spin collects the week's item; milestones pay out ----
const COL_ITEMS = [
  { icon: 'mango', name: ['Mango harvest', 'మామిడి పంట'] },
  { icon: 'lotus', name: ['Lotus pond', 'కమలాల కొలను'] },
  { icon: 'kite', name: ['Kite festival', 'గాలిపటాల పండుగ'] },
  { icon: 'diya', name: ['Festival of lights', 'దీపాల పండుగ'] },
];
const COL_STEPS = [
  { at: 100, energy: 10 }, { at: 300, coins: 25000 }, { at: 600, gems: 5 }, { at: 1000, energy: 30 }, { at: 1500, coins: 120000, gems: 15 },
];
function colWeek() {
  const C = S.slot.col, wk = tourWeekKey();
  if (C.week !== wk) { C.week = wk; C.n = 0; C.got = 0; C.item = (Math.floor(tourWeekStart() / (7 * 86400000)) % COL_ITEMS.length + COL_ITEMS.length) % COL_ITEMS.length; }
  return COL_ITEMS[C.item];
}
function colCardHtml() {
  const C = S.slot.col, it = colWeek(), max = COL_STEPS[COL_STEPS.length - 1].at;
  const marks = COL_STEPS.map((st, k) => `<i class="${k < C.got ? 'got' : ''}" style="left:${st.at / max * 100}%" title="${st.at}"></i>`).join('');
  const next = COL_STEPS[C.got];
  const prize = next ? [next.coins ? `${ico('coin')} ${fmtInt(next.coins)}` : '', next.gems ? `💎 ${next.gems}` : '', next.energy ? `⚡ ${next.energy}` : ''].filter(Boolean).join(' · ') : tr('All prizes won! New event next week.', 'అన్ని బహుమతులూ గెలిచారు! వచ్చే వారం కొత్త ఈవెంట్.');
  return `<div class="col-card" id="colCard">
    <div class="col-head">${ico(it.icon)}<b>${tr(...it.name)}</b><small>${tr('ends in', 'ముగింపు')} ${fmtDur(tourEndsIn())}</small></div>
    <div class="col-bar"><div style="width:${Math.min(100, C.n / max * 100)}%"></div>${marks}<b>${fmtInt(Math.min(C.n, max))} / ${fmtInt(next ? next.at : max)}</b></div>
    <div class="col-next">${next ? tr('Next prize', 'తర్వాతి బహుమతి') + ': ' : ''}${prize}</div>
  </div>`;
}
function slotCollect(line, bet, p) {
  const C = S.slot.col, it = colWeek();
  if (C.got >= COL_STEPS.length) return;
  C.n += bet * (1 + Math.floor(Math.random() * 3)) + (p.big ? 10 * bet : 0);
  while (C.got < COL_STEPS.length && C.n >= COL_STEPS[C.got].at) {
    const st = COL_STEPS[C.got]; C.got++;
    if (st.coins) S.slot.coins += st.coins;
    if (st.gems) S.gems += st.gems;
    if (st.energy) S.slot.energy += st.energy;
    if (C.got === 3) giveAlbumPack('basic', 1, true);
    if (C.got === COL_STEPS.length) giveAlbumPack('gold', 1, true);
    const what = [st.coins ? `+${fmtInt(st.coins)} ${tr('coins', 'కాయిన్లు')}` : '', st.gems ? `+${st.gems} 💎` : '', st.energy ? `+${st.energy} ⚡` : ''].filter(Boolean).join(', ');
    setTimeout(() => { toast(`${emo(it.icon)} ${tr(`${it.name[0]} prize: ${what}`, `${it.name[1]} బహుమతి: ${what}`)}`, 'good'); confetti($('colCard'), 80); }, 400);
  }
}
function refreshSlotEvents() {
  if ($('bossCard')) $('bossCard').outerHTML = bossCardHtml();
  if ($('colCard')) $('colCard').outerHTML = colCardHtml();
}
function updateBossHp() {
  const b = S.slot.boss, max = bossMaxHp(b.lvl), el = document.querySelector('#bossCard .boss-hp');
  if (!el) return;
  el.firstElementChild.style.width = Math.max(0, b.hp) / max * 100 + '%';
  el.querySelector('b').textContent = `${fmtInt(Math.max(0, b.hp))} / ${fmtInt(max)}`;
}
// ---- Raids, shields and helping other villages ----
// Three 🔨 give a raid: pick another player's village and take some coins (a 🛡️ blocks it). Three 🛡️ add a shield.
// Real players come from /api/raid; when it can't be reached, friendly bot villages stand in so it always works.
const RAID_URL = '/api/raid', SHIELD_MAX = 3, HELP_REWARD = 10000;
const BOT_NAMES = ['Raju', 'Sita', 'Venkat', 'Lakshmi', 'Ravi', 'Padma', 'Kiran', 'Anil', 'Swathi', 'Mahesh', 'Bhanu', 'Geetha'];
let raidLastSync = 0, raidTargets = null;
function raidName() { ensurePlayerId(); return S.player.name || `Boss ${S.player.id.slice(0, 4).toUpperCase()}`; }
async function raidPost(body) {
  ensurePlayerId();
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 6000);
  try {
    const r = await fetch(RAID_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: S.player.id, ...body }), signal: ctl.signal });
    const data = await r.json();
    if (!r.ok) throw Object.assign(new Error(data.error || 'server error'), { status: r.status });
    return data;
  } finally { clearTimeout(t); }
}
function raidLog(text) { S.raid.log = [{ text, ts: Date.now() }, ...S.raid.log].slice(0, 6); }
async function raidSync(force) {
  if (!force && Date.now() - raidLastSync < 120000) return;
  raidLastSync = Date.now();
  try {
    const { inbox } = await raidPost({ action: 'sync', name: raidName(), coins: Math.floor(S.slot.coins), shields: S.raid.shields, lm: S.build.done });
    S.raid.online = true;
    const news = [];
    for (const m of inbox || []) {
      if (m.type === 'raid') { S.slot.coins = Math.max(0, S.slot.coins - m.amt); raidLog(tr(`🔨 ${m.from} raided you: -${fmtInt(m.amt)} coins`, `🔨 ${m.from} దాడి చేశారు: -${fmtInt(m.amt)} కాయిన్లు`)); news.push('raid'); }
      if (m.type === 'blocked') { S.raid.shields = Math.max(0, S.raid.shields - 1); raidLog(tr(`🛡️ Your shield stopped ${m.from}`, `🛡️ మీ షీల్డ్ ${m.from} ని ఆపింది`)); news.push('blocked'); }
      if (m.type === 'help') { S.slot.energy += m.energy || 5; raidLog(tr(`🤝 ${m.from} helped you: +${m.energy || 5} ⚡`, `🤝 ${m.from} సాయం చేశారు: +${m.energy || 5} ⚡`)); news.push('help'); }
    }
    if (news.length) { toast(S.raid.log[0].text, news.includes('raid') ? 'bad' : 'good'); save(); if (activeTab === 'slots') renderTab(); }
  } catch (e) { S.raid.online = false; }
}
function botTargets() {
  const names = BOT_NAMES.slice().sort(() => Math.random() - 0.5).slice(0, 4);
  return names.map((n, k) => ({ id: 'bot-' + k, bot: true, name: tr(`${n}'s village`, `${n} గారి ఊరు`), lm: Math.max(0, S.build.done + Math.floor(rand(-1, 2))),
    coins: Math.floor(Math.max(20000, S.slot.coins * rand(0.4, 1.6)) + 20000 * S.build.done), shield: Math.random() < 0.25 }));
}
async function loadTargets() {
  raidTargets = null;
  try {
    await raidSync(true);
    const { targets } = await raidPost({ action: 'targets' });
    raidTargets = targets && targets.length >= 2 ? targets : [...(targets || []), ...botTargets()].slice(0, 4);
  } catch (e) { raidTargets = botTargets(); }
  return raidTargets;
}
function targetCardsHtml(mode) {
  if (!raidTargets) return `<div class="loader"></div>`;
  return `<div class="raid-targets">${raidTargets.map((t, i) => `<div class="raid-target">
    ${ico(t.bot ? 'hut' : 'person', 'rt-ico')}<b>${esc(t.name)}</b>
    <small>${ico('construction')} ${t.lm} · ${ico('coin')} ${fmtInt(t.coins)}</small>
    ${t.shield ? `<span class="rt-shield">${ico('shield')}</span>` : ''}
    <button class="btn ${mode === 'raid' ? 'red' : 'green'}" data-act="${mode === 'raid' ? 'raid-go' : 'help-go'}" data-id="${i}">${mode === 'raid' ? `${ico('hammer')} ${tr('Raid', 'దాడి')}` : `🤝 ${tr('Help', 'సాయం')}`}</button></div>`).join('')}</div>`;
}
async function openRaid() {
  if (S.raid.tokens <= 0) return;
  const head = `${ico('hammer', 'big-ico')}<h3>${tr('Raid a village!', 'ఒక ఊరి మీద దాడి!')}</h3><p class="sub">${tr('Pick a village. A 🛡️ shield will block you.', 'ఒక ఊరిని ఎంచుకోండి. 🛡️ షీల్డ్ ఉంటే ఆపుతుంది.')}</p>`;
  modal(head + targetCardsHtml('raid'));
  await loadTargets();
  if (!$('modal').classList.contains('hidden')) modal(head + targetCardsHtml('raid'));
}
async function raidGo(i) {
  const t = raidTargets && raidTargets[i];
  if (!t || S.raid.tokens <= 0) return;
  S.raid.tokens--;
  modal(`<div class="raid-anim">${ico('hammer', 'big-ico swing')}</div><p>${tr('Raiding', 'దాడి చేస్తున్నారు')} ${esc(t.name)}…</p>`);
  sfx('big');
  let res;
  if (t.bot) res = t.shield ? { blocked: true } : { amt: Math.max(2000, Math.floor(t.coins * 0.15)) };
  else {
    try { res = await raidPost({ action: 'raid', target: t.id }); }
    catch (e) { S.raid.tokens++; modal(`<p>${tr('Could not reach that village. Try again.', 'ఆ ఊరిని చేరలేకపోయాం. మళ్ళీ ప్రయత్నించండి.')}</p><div class="modal-actions"><button class="btn" data-act="close">OK</button></div>`); return; }
  }
  await new Promise(r => setTimeout(r, 900));
  S.stats.raids = (S.stats.raids || 0) + 1;
  let html;
  if (res.blocked) {
    const coins = 3000 * (1 + S.build.done); S.slot.coins += coins;
    raidLog(tr(`🛡️ ${t.name} blocked your raid (+${fmtInt(coins)} for trying)`, `🛡️ ${t.name} మీ దాడిని ఆపారు (ప్రయత్నానికి +${fmtInt(coins)})`));
    html = `${ico('shield', 'big-ico')}<h3>${tr('Blocked!', 'ఆపేశారు!')}</h3><p>${tr(`${esc(t.name)} had a shield. You still get ${fmtInt(coins)} coins for trying.`, `${esc(t.name)} దగ్గర షీల్డ్ ఉంది. ప్రయత్నానికి ${fmtInt(coins)} కాయిన్లు.`)}</p>`;
    sfx('err');
  } else {
    S.slot.coins += res.amt;
    raidLog(tr(`🔨 You raided ${t.name}: +${fmtInt(res.amt)} coins`, `🔨 ${t.name} మీద దాడి: +${fmtInt(res.amt)} కాయిన్లు`));
    html = `${ico('moneybag', 'big-ico')}<h3>${tr('Great raid!', 'భలే దాడి!')}</h3><div class="stat-big">+${fmtInt(res.amt)} ${ico('coin')}</div>`;
    sfx('win');
  }
  save();
  modal(html + `<div class="modal-actions">${S.raid.tokens > 0 ? `<button class="btn red" data-act="raid-open">${tr('Raid again', 'మళ్ళీ దాడి')} (${S.raid.tokens})</button>` : ''}<button class="btn gold" data-act="close">${tr('Nice!', 'సూపర్!')}</button></div>`);
  if (!res.blocked) confetti($('modalBody'), 120);
  if (activeTab === 'slots') renderTab();
}
function helpLeft() { return S.raid.helpDay !== dayKey(); }
async function openHelp() {
  if (!helpLeft()) return;
  const head = `<h3>🤝 ${tr('Help a village', 'ఒక ఊరికి సాయం')}</h3><p class="sub">${tr(`Send 5 energy to another player. You get ${fmtInt(HELP_REWARD)} coins and a sticker pack.`, `ఇంకో ప్లేయర్‌కి 5 ఎనర్జీ పంపండి. మీకు ${fmtInt(HELP_REWARD)} కాయిన్లు, ఒక స్టిక్కర్ ప్యాక్.`)}</p>`;
  modal(head + targetCardsHtml('help'));
  await loadTargets();
  if (!$('modal').classList.contains('hidden')) modal(head + targetCardsHtml('help'));
}
async function helpGo(i) {
  const t = raidTargets && raidTargets[i];
  if (!t || !helpLeft()) return;
  if (!t.bot) { try { await raidPost({ action: 'help', target: t.id }); } catch (e) { if (e.status !== 409) { toast(tr('Could not reach that village.', 'ఆ ఊరిని చేరలేకపోయాం.'), 'bad'); return; } } }
  S.raid.helpDay = dayKey(); S.slot.coins += HELP_REWARD; giveAlbumPack('basic', 1, true);
  raidLog(tr(`🤝 You helped ${t.name}`, `🤝 మీరు ${t.name} కి సాయం చేశారు`));
  sfx('win'); save(); closeModal();
  toast(tr(`🤝 Thank you! +${fmtInt(HELP_REWARD)} coins, +1 📦`, `🤝 ధన్యవాదాలు! +${fmtInt(HELP_REWARD)} కాయిన్లు, +1 📦`), 'good');
  if (activeTab === 'slots') renderTab();
}
function raidCardHtml() {
  const R = S.raid;
  const shields = Array.from({ length: SHIELD_MAX }, (_, k) => `<span class="${k < R.shields ? 'on' : ''}">${ico('shield')}</span>`).join('');
  const log = R.log.length ? R.log.slice(0, 4).map(l => `<li>${esc(l.text)}</li>`).join('') : `<li class="muted">${tr('No raids yet. Spin 🔨🔨🔨 to raid!', 'ఇంకా దాడులు లేవు. 🔨🔨🔨 వస్తే దాడి!')}</li>`;
  return `<div class="raid-card" id="raidCard">
    <div class="rc-top"><b>${ico('swords')} ${tr('Your village', 'మీ ఊరు')}</b><div class="rc-shields" title="${tr('Shields', 'షీల్డ్‌లు')}">${shields}</div>
      <small class="rc-net ${R.online ? 'on' : ''}">${R.online ? tr('● online', '● ఆన్‌లైన్') : tr('● practice villages', '● ప్రాక్టీస్ ఊళ్ళు')}</small></div>
    <ul class="rc-log">${log}</ul>
    <div class="rc-actions">
      ${R.tokens > 0 ? `<button class="btn red" data-act="raid-open">${ico('hammer')} ${tr('Raid ready!', 'దాడి సిద్ధం!')} (${R.tokens})</button>` : ''}
      <button class="btn ${helpLeft() ? 'green' : 'ghost'}" data-act="help-open" ${helpLeft() ? '' : 'disabled'}>🤝 ${tr('Help other players', 'ఇతరులకు సాయం')} (${helpLeft() ? 0 : 1}/1)</button>
    </div></div>`;
}
// Called from slotFinish: three hammers give a raid, three shields add a shield
function slotRaidSymbols(line) {
  const h = line.filter(k => k === 'hammer').length, sh = line.filter(k => k === 'shield').length;
  if (h === 3) { S.raid.tokens++; slotStopAuto(); setTimeout(openRaid, 700); return tr('🔨 RAID!', '🔨 దాడి!'); }
  if (sh === 3) {
    if (S.raid.shields < SHIELD_MAX) { S.raid.shields++; return tr('🛡️ +1 shield', '🛡️ +1 షీల్డ్'); }
    S.slot.coins += 5000; return tr('🛡️ Shields full: +5,000 coins', '🛡️ షీల్డ్‌లు నిండాయి: +5,000 కాయిన్లు');
  }
  return '';
}
function updateSlotLive() {
  if (activeTab !== 'slots' || !$('slotEnergy')) return;
  slotRegen();
  $('slotEnergy').textContent = S.slot.energy;
  $('slotCoins').textContent = fmtInt(S.slot.coins);
  $('slotTimer').textContent = S.slot.energy >= SLOT_MAX ? tr('Full', 'నిండింది') : `+1 ${tr('in', 'లో')} ${fmtClock(slotNextIn())}`;
  $('piggyVal').textContent = fmtInt(S.slot.piggy);
  $('piggyBar').style.width = Math.min(100, S.slot.piggy / PIGGY_CAP * 100) + '%';
  const gb = $('giftBtn');
  if (gb) { if (giftReady() === gb.disabled) $('giftCard').outerHTML = giftCardHtml(); else if (!giftReady()) gb.textContent = fmtClock(giftIn()); }
}
function slotSetBet() {
  if (slotBusy) return;
  const i = SLOT_BETS.indexOf(S.slot.bet);
  S.slot.bet = SLOT_BETS[(i + 1) % SLOT_BETS.length];
  sfx('click');
  $('slotBetBtn').innerHTML = betBtnHtml();
  $('slotSpinBtn').innerHTML = spinBtnHtml();
}
function slotStopAuto() { slotAuto = false; const b = $('slotAutoBtn'); if (b) b.classList.remove('on'); }
function slotSpin() {
  if (slotBusy || activeTab !== 'slots' || !$('strip0')) return;
  slotRegen();
  const sl = S.slot, bet = sl.bet;
  if (sl.energy < bet) {
    slotStopAuto();
    toast(tr(`⚡ Not enough energy. +1 in ${fmtClock(slotNextIn())}`, `⚡ ఎనర్జీ సరిపోదు. ${fmtClock(slotNextIn())} లో +1`), 'bad');
    shake($('slotSpinBtn')); return;
  }
  slotBusy = true;
  if (sl.energy >= SLOT_MAX) sl.at = Date.now(); // the refill clock starts when you drop below full
  sl.energy -= bet;
  sl.piggy = Math.min(PIGGY_CAP, sl.piggy + 300 * bet);
  S.stats.slotSpins = (S.stats.slotSpins || 0) + 1;
  const line = [slotPick(), slotPick(), slotPick()];
  if (Math.random() < 0.18) line[1] = line[0]; // two of a kind a little more often, so it feels lively
  sl.last = line;
  updateSlotLive();
  $('slotResult').textContent = tr('Spinning…', 'తిరుగుతోంది…');
  $('slotResult').className = 'slot-result';
  document.querySelectorAll('.reel').forEach(r => r.classList.remove('win'));
  sfx('click');
  const fast = fxOff();
  line.forEach((k, i) => {
    const strip = $('strip' + i), n = 16 + i * 6;
    const syms = [];
    for (let j = 0; j < n; j++) syms.push(slotPick());
    syms.push(k, slotPick());
    strip.style.transition = 'none';
    strip.innerHTML = [slotPick(), ...syms].map(x => `<div class="sym">${ico(x)}</div>`).join('');
    strip.style.transform = 'translateY(0)';
    void strip.offsetHeight;
    const dur = fast ? 0.25 + i * 0.1 : 0.9 + i * 0.35;
    strip.style.transition = `transform ${dur}s cubic-bezier(.15,.7,.25,1.04)`;
    strip.style.transform = `translateY(${-n * SLOT_CELL}px)`;
    setTimeout(() => sfx('tick'), dur * 1000);
  });
  setTimeout(() => slotFinish(line, bet), (fast ? 0.5 : 1.75) * 1000);
}
function slotFinish(line, bet) {
  const sl = S.slot, p = slotPrize(line, bet), parts = [];
  if (p.coins) { sl.coins += p.coins; parts.push(`+${fmtInt(p.coins)} ${ico('coin')}`); }
  if (p.cash) { earn(p.cash); parts.push(`+${money(p.cash)} ${tr('cash', 'క్యాష్')}`); }
  if (p.gems) { S.gems += p.gems; parts.push(`+${p.gems} 💎`); }
  if (p.energy) { sl.energy += p.energy; parts.push(`+${p.energy} ⚡`); }
  if (p.piggy) { const v = sl.piggy; sl.coins += v; sl.piggy = 0; parts.push(tr(`🐷 Piggy bank! +${fmtInt(v)}`, `🐷 పిగ్గీ బ్యాంక్! +${fmtInt(v)}`) + ' ' + ico('coin')); }
  const lvlBefore = sl.boss.lvl, hit = slotBattle(line, bet);
  if (hit) parts.push(hit);
  slotCollect(line, bet, p);
  const rs = slotRaidSymbols(line);
  if (rs) { parts.push(rs); if ($('raidCard')) $('raidCard').outerHTML = raidCardHtml(); }
  if (sl.boss.lvl !== lvlBefore) setTimeout(refreshSlotEvents, 900); else updateBossHp();
  if ($('colCard')) $('colCard').outerHTML = colCardHtml();
  const res = $('slotResult');
  if (res) {
    res.innerHTML = (p.big ? tr('JACKPOT! ', 'జాక్‌పాట్! ') : '') + parts.join('  ·  ');
    res.className = 'slot-result ' + (p.big ? 'big' : p.small ? '' : 'win');
    const cnt = {};
    line.forEach(k => { cnt[k] = (cnt[k] || 0) + 1; });
    line.forEach((k, i) => { if (cnt[k] >= 2 && $('reel' + i)) $('reel' + i).classList.add('win'); });
    if (p.big) { confetti(res, 140); sfx('win'); flyCoins(res, 8); }
    else if (!p.small) { sfx('cash'); flyCoins(res, 3); }
  }
  slotBusy = false;
  updateSlotLive(); updateHeader(); save();
  if (slotAuto) setTimeout(() => { if (slotAuto && activeTab === 'slots') slotSpin(); else slotStopAuto(); }, 650);
}
function breakPiggy() {
  if (S.slot.piggy < 1000) { toast(tr('The piggy bank is almost empty. Spin more!', 'పిగ్గీ బ్యాంక్ దాదాపు ఖాళీ. ఇంకా స్పిన్ చేయండి!'), 'bad'); return; }
  if (S.gems < PIGGY_GEMS) { toast(tr('Not enough gems.', 'జెమ్స్ సరిపోవు.'), 'bad'); return; }
  S.gems -= PIGGY_GEMS;
  const v = S.slot.piggy;
  S.slot.coins += v; S.slot.piggy = 0;
  toast(tr(`🐷 Crash! +${fmtInt(v)} coins`, `🐷 పగిలింది! +${fmtInt(v)} కాయిన్లు`), 'gem'); sfx('win');
  save(); renderTab();
}

/* ---------------------------- LANDMARKS (build with coins) --------- */
// Each landmark has five parts. Coins from the Spin Game pay for each part; a finished landmark adds +10% profits for good.
const LANDMARKS = [
  { id: 'charminar', icon: 'mosque', name: ['Charminar', 'చార్మినార్'], city: ['Hyderabad', 'హైదరాబాద్'],
    parts: [['Base and arches', 'పునాది, ఆర్చిలు'], ['Upper floor', 'పై అంతస్తు'], ['Four minarets', 'నాలుగు మినార్లు'], ['Minaret balconies', 'మినార్ బాల్కనీలు'], ['Domes', 'గుమ్మటాలు']] },
  { id: 'golconda', icon: 'castle', name: ['Golconda Fort', 'గోల్కొండ కోట'], city: ['Hyderabad', 'హైదరాబాద్'],
    parts: [['Rocky hill', 'రాతి కొండ'], ['Fort walls', 'కోట గోడలు'], ['Watch towers', 'బురుజులు'], ['Bala Hissar', 'బాలా హిస్సార్'], ['Royal flag', 'రాజ జెండా']] },
  { id: 'tirupati', icon: 'htemple', name: ['Temple Gopuram', 'ఆలయ గోపురం'], city: ['Tirupati', 'తిరుపతి'],
    parts: [['Temple base', 'ఆలయ పునాది'], ['Lower tiers', 'కింది అంతస్తులు'], ['Upper tiers', 'పై అంతస్తులు'], ['Vimana roof', 'విమాన గోపురం'], ['Golden kalasams', 'బంగారు కలశాలు']] },
  { id: 'buddha', icon: 'lotus', name: ['Buddha Statue', 'బుద్ధ విగ్రహం'], city: ['Hussain Sagar', 'హుస్సేన్ సాగర్'],
    parts: [['Rock in the lake', 'సరస్సులో రాయి'], ['Lotus base', 'కమల పీఠం'], ['Robe', 'వస్త్రం'], ['Head and shoulders', 'తల, భుజాలు'], ['Blessing hand and halo', 'అభయ హస్తం, ప్రభ']] },
  { id: 'taj', icon: 'mosque', name: ['Taj Mahal', 'తాజ్ మహల్'], city: ['Agra', 'ఆగ్రా'],
    parts: [['Marble platform', 'పాలరాతి వేదిక'], ['Main hall', 'ప్రధాన భవనం'], ['Great dome', 'పెద్ద గుమ్మటం'], ['Four minarets', 'నాలుగు మినార్లు'], ['Gardens and pool', 'తోటలు, కొలను']] },
  { id: 'indiagate', icon: 'classical', name: ['India Gate', 'ఇండియా గేట్'], city: ['New Delhi', 'న్యూఢిల్లీ'],
    parts: [['Stone base', 'రాతి పునాది'], ['Two pillars', 'రెండు స్తంభాలు'], ['Great arch', 'పెద్ద ఆర్చి'], ['Cornice', 'పై అంచు'], ['Eternal flame', 'అమర జ్యోతి']] },
];
const BUILD_BASE = 15000, LANDMARK_BONUS = 0.1;
function stageCost(li, st) { return Math.round(BUILD_BASE * Math.pow(1.5, st) * Math.pow(3, li) / 100) * 100; }
function landmarkBonus() { return 1 + LANDMARK_BONUS * (S.build ? S.build.done : 0); }
function buildCurrent() { return LANDMARKS[Math.min(S.build.done, LANDMARKS.length - 1)]; }
function allBuilt() { return S.build.done >= LANDMARKS.length; }

// ---- 3D island (three.js is loaded only when this tab is first opened) ----
const B3 = { T: null, loading: false, failed: false, renderer: null, scene: null, camera: null, holder: null, parts: [], ghost: null, shownKey: '', yaw: 0.7, drag: null, anims: [], raf: 0, lastT: 0, water: null };
function b3Mat(c, extra) { const T = B3.T; B3.mats = B3.mats || {}; const k = c + (extra ? JSON.stringify(extra) : ''); return B3.mats[k] || (B3.mats[k] = new T.MeshLambertMaterial(Object.assign({ color: c }, extra || {}))); }
function b3Mesh(geo, c, x, y, z, parent) { const m = new B3.T.Mesh(geo, typeof c === 'number' ? b3Mat(c) : c); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m; }
function bx(w, h, d, c, x, y, z, p) { return b3Mesh(new B3.T.BoxGeometry(w, h, d), c, x, y, z, p); }
function cy(rt, rb, h, c, x, y, z, p, seg = 14) { return b3Mesh(new B3.T.CylinderGeometry(rt, rb, h, seg), c, x, y, z, p); }
function sp(r, c, x, y, z, p, sy = 1) { const m = b3Mesh(new B3.T.SphereGeometry(r, 16, 12), c, x, y, z, p); m.scale.y = sy; return m; }
function co(r, h, c, x, y, z, p, seg = 10) { return b3Mesh(new B3.T.ConeGeometry(r, h, seg), c, x, y, z, p); }
const CORNERS = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
const FACES = [[0, 1, 0], [0, -1, Math.PI], [1, 0, Math.PI / 2], [-1, 0, -Math.PI / 2]];
// Each model returns five groups, one per part, all standing on y = 0
const MODELS = {
  charminar() {
    const P = [0, 1, 2, 3, 4].map(() => new B3.T.Group()), stone = 0xd9c39b, dark = 0x5a4632;
    bx(3.6, 0.25, 3.6, 0xcdb48a, 0, 0.125, 0, P[0]); bx(2.8, 1.6, 2.8, stone, 0, 1.05, 0, P[0]);
    for (const [fx, fz, r] of FACES) { const a = bx(1.0, 1.0, 0.06, dark, fx * 1.41, 0.75, fz * 1.41, P[0]); a.rotation.y = r; const t = cy(0.5, 0.5, 0.06, dark, fx * 1.41, 1.25, fz * 1.41, P[0], 16); if (fz) t.rotation.x = Math.PI / 2; else t.rotation.z = Math.PI / 2; }
    bx(2.95, 0.14, 2.95, 0xc8ae84, 0, 1.92, 0, P[1]); bx(2.5, 0.7, 2.5, stone, 0, 2.35, 0, P[1]);
    for (const [fx, fz, r] of FACES) for (const o of [-0.7, 0, 0.7]) { const a = bx(0.32, 0.4, 0.05, dark, fx * 1.26 + (fz ? o : 0), 2.32, fz * 1.26 + (fx ? o : 0), P[1]); a.rotation.y = r; }
    for (const [sx, sz] of CORNERS) cy(0.24, 0.27, 2.6, 0xd2bb92, sx * 1.42, 1.55, sz * 1.42, P[2]);
    for (const [sx, sz] of CORNERS) { cy(0.19, 0.22, 1.5, 0xd2bb92, sx * 1.42, 3.6, sz * 1.42, P[3]); cy(0.34, 0.34, 0.1, 0xb89a70, sx * 1.42, 2.9, sz * 1.42, P[3]); cy(0.3, 0.3, 0.1, 0xb89a70, sx * 1.42, 3.7, sz * 1.42, P[3]); }
    for (const [sx, sz] of CORNERS) { sp(0.25, 0xe6d2a8, sx * 1.42, 4.45, sz * 1.42, P[4], 1.2); co(0.05, 0.3, 0xd4a83a, sx * 1.42, 4.85, sz * 1.42, P[4]); }
    sp(0.55, 0xe6d2a8, 0, 2.75, 0, P[4], 0.75); co(0.06, 0.35, 0xd4a83a, 0, 3.3, 0, P[4]);
    return P;
  },
  golconda() {
    const P = [0, 1, 2, 3, 4].map(() => new B3.T.Group()), rock = 0x8a7a64, wall = 0xa08c70;
    const hill = co(3.2, 2.2, rock, 0, 1.1, 0, P[0], 7); hill.scale.set(1, 1, 0.9);
    for (const [x, z, r] of [[1.6, 1.2, 0.5], [-1.4, 1.5, 0.6], [0.4, -1.8, 0.55], [-2, -0.6, 0.45]]) b3Mesh(new B3.T.DodecahedronGeometry(r, 0), 0x9a8a74, x, r * 0.6, z, P[0]);
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, w = bx(1.62, 0.8, 0.3, wall, Math.cos(a) * 3.1, 0.4, Math.sin(a) * 3.1, P[1]); w.rotation.y = -a + Math.PI / 2; }
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.26, x = Math.cos(a) * 3.1, z = Math.sin(a) * 3.1; cy(0.38, 0.42, 1.5, 0x968268, x, 0.75, z, P[2]); for (let k = 0; k < 4; k++) bx(0.14, 0.18, 0.14, 0x968268, x + Math.cos(k * 1.57) * 0.3, 1.58, z + Math.sin(k * 1.57) * 0.3, P[2]); }
    bx(1.4, 1.0, 1.0, 0xb4a084, 0, 2.6, 0, P[3]); for (const o of [-0.4, 0, 0.4]) bx(0.22, 0.4, 0.05, 0x4a3a2a, o, 2.55, 0.52, P[3]); bx(1.55, 0.1, 1.15, 0x968268, 0, 3.12, 0, P[3]);
    cy(0.03, 0.03, 1.6, 0x5a3418, 0.5, 3.9, 0, P[4]); const f = b3Mesh(new B3.T.PlaneGeometry(0.8, 0.5), b3Mat(0xff8a1a, { side: 2 }), 0.92, 4.4, 0, P[4]); f.castShadow = false; sp(0.3, 0xd8c8a8, -0.3, 3.3, 0, P[4], 0.8);
    return P;
  },
  tirupati() {
    const P = [0, 1, 2, 3, 4].map(() => new B3.T.Group()), white = 0xf2ead8, gold = 0xe0b030;
    bx(2.8, 0.9, 1.8, white, 0, 0.45, 0, P[0]); bx(0.7, 0.75, 0.05, 0x5a3418, 0, 0.42, 0.92, P[0]);
    const tier = (w, d, y, p) => { bx(w, 0.62, d, white, 0, y, 0, p); bx(w + 0.12, 0.08, d + 0.12, 0xf4c86a, 0, y + 0.33, 0, p); for (let i = -2; i <= 2; i++) bx(0.12, 0.22, 0.04, [0xd84a3a, 0x3a7ad8, 0x3ccf6e][Math.abs(i) % 3], i * w / 5.5, y, d / 2 + 0.03, p); };
    tier(2.5, 1.6, 1.25, P[1]); tier(2.2, 1.45, 1.9, P[1]);
    tier(1.9, 1.3, 2.55, P[2]); tier(1.6, 1.15, 3.2, P[2]);
    const v = cy(0.42, 0.42, 1.5, gold, 0, 3.85, 0, P[3], 16); v.rotation.z = Math.PI / 2; bx(1.5, 0.2, 0.84, gold, 0, 3.55, 0, P[3]);
    for (const x of [-0.6, -0.3, 0, 0.3, 0.6]) { sp(0.09, gold, x, 4.32, 0, P[4]); co(0.05, 0.22, gold, x, 4.5, 0, P[4]); }
    return P;
  },
  buddha() {
    const P = [0, 1, 2, 3, 4].map(() => new B3.T.Group()), robe = 0xf4f0e6;
    const lake = b3Mesh(new B3.T.CylinderGeometry(2.6, 2.6, 0.08, 32), b3Mat(0x2f7ab8), 0, 0.05, 0, P[0]); lake.receiveShadow = true;
    b3Mesh(new B3.T.DodecahedronGeometry(1.2, 0), 0x8a857a, 0, 0.3, 0, P[0]).scale.set(1.2, 0.5, 1.2);
    cy(0.85, 0.7, 0.45, 0xffffff, 0, 0.85, 0, P[1], 20); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, pt = co(0.22, 0.5, 0xffa8c8, Math.cos(a) * 0.8, 0.85, Math.sin(a) * 0.8, P[1], 6); pt.rotation.z = -Math.cos(a) * 1.0; pt.rotation.x = Math.sin(a) * 1.0; }
    cy(0.42, 0.62, 2.0, robe, 0, 2.05, 0, P[2], 18);
    sp(0.5, robe, 0, 3.05, 0, P[3], 0.6); cy(0.13, 0.15, 0.25, robe, 0, 3.35, 0, P[3]); sp(0.32, robe, 0, 3.7, 0, P[3]); sp(0.16, robe, 0, 4.05, 0, P[3]);
    const hand = bx(0.16, 0.45, 0.1, robe, 0.48, 2.95, 0.25, P[4]); hand.rotation.z = -0.2;
    const halo = b3Mesh(new B3.T.TorusGeometry(0.55, 0.05, 8, 32), b3Mat(0xffd25a), 0, 3.7, -0.3, P[4]); halo.castShadow = false;
    return P;
  },
  taj() {
    const P = [0, 1, 2, 3, 4].map(() => new B3.T.Group()), marble = 0xf6f2ea, dark = 0x7a7066;
    bx(4.4, 0.35, 4.4, 0xece6da, 0, 0.175, 0, P[0]);
    bx(2.8, 1.7, 2.8, marble, 0, 1.2, 0, P[1]); for (const [fx, fz, r] of FACES) { const a = bx(0.9, 1.25, 0.06, dark, fx * 1.42, 1.05, fz * 1.42, P[1]); a.rotation.y = r; }
    cy(0.85, 0.9, 0.5, marble, 0, 2.3, 0, P[2], 24); sp(1.05, marble, 0, 3.0, 0, P[2], 1.15); co(0.06, 0.6, 0xd4a83a, 0, 4.3, 0, P[2]);
    for (const [sx, sz] of CORNERS) { cy(0.15, 0.18, 2.8, marble, sx * 1.95, 1.75, sz * 1.95, P[3]); cy(0.24, 0.24, 0.08, 0xe0dace, sx * 1.95, 2.3, sz * 1.95, P[3]); sp(0.2, marble, sx * 1.95, 3.2, sz * 1.95, P[3]); }
    for (const [sx, sz] of CORNERS) sp(0.26, marble, sx * 1.05, 2.25, sz * 1.05, P[4], 0.9);
    const pool = b3Mesh(new B3.T.BoxGeometry(0.5, 0.05, 2.0), b3Mat(0x3a8ad8), 0, 0.37, 3.3, P[4]); pool.castShadow = false;
    for (const x of [-0.65, 0.65]) for (const z of [2.6, 3.3, 4.0]) co(0.16, 0.7, 0x2f6a24, x, 0.7, z, P[4], 7);
    return P;
  },
  indiagate() {
    const P = [0, 1, 2, 3, 4].map(() => new B3.T.Group()), sand = 0xc89a6a;
    bx(3.8, 0.3, 1.8, 0xb88a5c, 0, 0.15, 0, P[0]);
    for (const x of [-1.15, 1.15]) bx(1.0, 2.6, 1.3, sand, x, 1.6, 0, P[1]);
    bx(3.3, 0.8, 1.3, sand, 0, 3.3, 0, P[2]); const arch = cy(0.65, 0.65, 1.3, sand, 0, 2.9, 0, P[2], 20); arch.rotation.x = Math.PI / 2;
    bx(3.5, 0.15, 1.42, 0xb88a5c, 0, 3.78, 0, P[3]); bx(2.6, 0.5, 1.0, sand, 0, 4.1, 0, P[3]);
    const bowl = b3Mesh(new B3.T.SphereGeometry(0.45, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), b3Mat(sand), 0, 4.35, 0, P[4]); bowl.scale.y = 0.6;
    bx(0.6, 0.4, 0.6, 0x333333, 0, 0.5, 1.6, P[4]); const fl = co(0.12, 0.4, new B3.T.MeshBasicMaterial({ color: 0xff8a1a }), 0, 0.9, 1.6, P[4], 8); fl.castShadow = false; P[4].userData.flame = fl;
    return P;
  },
};
function initBuild3D() {
  if (B3.T || B3.loading || B3.failed) return;
  B3.loading = true;
  import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js').then(T => {
    B3.T = T; B3.loading = false;
    const low = fxOff();
    const r = B3.renderer = new T.WebGLRenderer({ antialias: !low, alpha: true });
    r.setPixelRatio(Math.min(devicePixelRatio || 1, low ? 1 : 1.5));
    r.shadowMap.enabled = !low; r.shadowMap.type = T.PCFSoftShadowMap;
    r.domElement.className = 'build-canvas';
    const sc = B3.scene = new T.Scene();
    B3.camera = new T.PerspectiveCamera(38, 1, 0.1, 200);
    sc.add(new T.HemisphereLight(0xdff0ff, 0x6a8a4a, 1.0));
    const sun = new T.DirectionalLight(0xfff2d8, 1.5); sun.position.set(8, 14, 6); sun.castShadow = !low;
    sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9 }); sc.add(sun);
    // Sea, sand, grass: a hexagon island like a game board
    B3.water = b3Mesh(new T.CircleGeometry(40, 48), b3Mat(0x2a7ab8), 0, -0.55, 0, sc); B3.water.rotation.x = -Math.PI / 2;
    const sand = cy(7.3, 7.6, 0.7, 0xe8d29a, 0, -0.3, 0, sc, 6); sand.rotation.y = Math.PI / 6;
    const grass = cy(6.5, 6.7, 0.35, 0x6fbf4a, 0, 0.12, 0, sc, 6); grass.rotation.y = Math.PI / 6;
    const ring = b3Mesh(new T.RingGeometry(3.6, 4.0, 6), b3Mat(0xd8c08a), 0, 0.31, 0, sc); ring.rotation.x = -Math.PI / 2; ring.rotation.z = Math.PI / 6; ring.receiveShadow = true;
    for (const [x, z] of [[5, 1.5], [4.6, -2.4], [-5, 0.8], [-4.4, -2.8], [-2, 5], [2.3, 4.9], [-1, -5.2], [1.8, -5]]) {
      cy(0.12, 0.16, 0.8, 0x7a5232, x, 0.7, z, sc, 6); b3Mesh(new T.IcosahedronGeometry(0.62, 0), 0x3f9a3a, x, 1.4, z, sc);
    }
    for (const [x, z, c] of [[4.2, 3.6, 0x4da3ff], [-4.6, 3.2, 0xff8ad8]]) { bx(0.9, 0.7, 0.9, 0xf6efe0, x, 0.65, z, sc); const rf = co(0.8, 0.5, c, x, 1.25, z, sc, 4); rf.rotation.y = Math.PI / 4; }
    B3.holder = new T.Group(); B3.holder.position.y = 0.3; sc.add(B3.holder);
    // Drag to turn the island
    const cv = r.domElement;
    cv.addEventListener('pointerdown', e => { B3.drag = { x: e.clientX, yaw: B3.yaw }; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', e => { if (B3.drag) B3.yaw = B3.drag.yaw - (e.clientX - B3.drag.x) * 0.01; });
    const up = () => { B3.drag = null; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    mountBuildView();
  }).catch(() => { B3.loading = false; B3.failed = true; if (activeTab === 'build') renderTab(); });
}
// Show landmark i with `st` parts built; the next part shows as a yellow outline
function b3Show(i, st, animatePart = -1) {
  const T = B3.T, key = i + ':' + st;
  if (B3.shownKey === key && animatePart < 0) return;
  B3.shownKey = key;
  B3.holder.clear();
  const P = MODELS[LANDMARKS[i].id]();
  B3.parts = P;
  P.forEach((g, k) => { g.visible = k < st; B3.holder.add(g); });
  if (st < 5) {
    const box = new T.Box3().setFromObject(P[st]);
    const helper = new T.Box3Helper(box, 0xffd23d);
    helper.material.transparent = true; helper.material.opacity = 0.8;
    B3.holder.add(helper); B3.ghost = helper;
  } else B3.ghost = null;
  if (animatePart >= 0 && P[animatePart]) { P[animatePart].scale.set(1, 0.01, 1); B3.anims.push({ g: P[animatePart], t: 0 }); }
}
function mountBuildView() {
  const host = $('buildView');
  if (!host) return;
  if (!B3.T) { initBuild3D(); return; }
  if (B3.renderer.domElement.parentNode !== host) host.appendChild(B3.renderer.domElement);
  const w = host.clientWidth || 600, h = Math.round(Math.min(460, Math.max(300, w * 0.72)));
  B3.renderer.setSize(w, h); B3.camera.aspect = w / h; B3.camera.updateProjectionMatrix();
  const view = S.build.view != null && S.build.view < S.build.done ? S.build.view : null;
  if (view != null) b3Show(view, 5); else if (allBuilt()) b3Show(LANDMARKS.length - 1, 5); else b3Show(S.build.done, S.build.stage);
  if (!B3.raf) { B3.lastT = performance.now(); B3.raf = requestAnimationFrame(b3Loop); }
}
function b3Loop(now) {
  if (activeTab !== 'build' || document.hidden || !B3.renderer.domElement.isConnected) { B3.raf = 0; return; }
  B3.raf = requestAnimationFrame(b3Loop);
  if (now - B3.lastT < (fxOff() ? 64 : 31)) return;
  const dt = Math.min(0.1, (now - B3.lastT) / 1000); B3.lastT = now;
  if (!B3.drag) B3.yaw += dt * 0.12;
  const cam = B3.camera; const d = 15.5 * Math.min(1.6, Math.max(1, 1.7 / cam.aspect)); // pull back on narrow screens
  cam.position.set(Math.sin(B3.yaw) * d, 8.5, Math.cos(B3.yaw) * d); cam.lookAt(0, 1.8, 0);
  for (let k = B3.anims.length - 1; k >= 0; k--) {
    const a = B3.anims[k]; a.t += dt / 0.9;
    const t = Math.min(1, a.t), e = 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2); // ease out with a little bounce
    a.g.scale.y = Math.max(0.01, e);
    if (t >= 1) { a.g.scale.y = 1; B3.anims.splice(k, 1); }
  }
  if (B3.ghost) B3.ghost.material.opacity = 0.45 + Math.sin(now / 300) * 0.35;
  B3.parts.forEach(g => { if (g.userData.flame) g.userData.flame.scale.y = 0.8 + Math.random() * 0.4; });
  B3.water.position.y = -0.55 + Math.sin(now / 900) * 0.03;
  B3.renderer.render(B3.scene, cam);
}
// ---- Build tab ----
function renderBuild() {
  const B = S.build, coins = S.slot.coins;
  const head = header('construction', tr('Landmarks', 'ల్యాండ్‌మార్కులు'),
    tr(`Build famous landmarks with coins from the Spin Game. Each finished landmark adds <b>+${LANDMARK_BONUS * 100}% profits</b> for good.`, `స్పిన్ గేమ్ కాయిన్లతో ప్రసిద్ధ కట్టడాలు కట్టండి. పూర్తయిన ప్రతి కట్టడం శాశ్వతంగా <b>+${LANDMARK_BONUS * 100}% లాభాలు</b> ఇస్తుంది.`));
  const view = `<div class="build-view" id="buildView">${B3.failed ? `<div class="build-fallback">${ico(buildCurrent().icon, 'big-ico')}<p>${tr('3D view needs an internet connection.', '3D వ్యూ కోసం ఇంటర్నెట్ కావాలి.')}</p></div>` : B3.T ? '' : `<div class="build-fallback"><div class="loader"></div></div>`}</div>`;
  const viewing = B.view != null && B.view < B.done;
  let card;
  if (viewing || allBuilt()) {
    const L = LANDMARKS[viewing ? B.view : LANDMARKS.length - 1];
    card = `<div class="build-card done"><div class="bc-title">${ico(L.icon)}<div><b>${tr(...L.name)}</b><small>${tr(...L.city)} · ✅ ${tr('Built', 'పూర్తయింది')}</small></div></div>
      ${allBuilt() && !viewing ? `<p class="sub">${tr('You built every landmark! More cities are coming soon.', 'అన్ని కట్టడాలూ కట్టేశారు! మరిన్ని నగరాలు త్వరలో.')}</p>` : ''}
      ${viewing ? `<button class="btn gold" data-act="build-view" data-id="-1">${tr('Back to building', 'కట్టడానికి తిరిగి')}</button>` : ''}</div>`;
  } else {
    const L = buildCurrent(), st = B.stage, cost = stageCost(B.done, st);
    const dots = L.parts.map((p, k) => `<span class="bdot ${k < st ? 'on' : k === st ? 'next' : ''}" title="${esc(tr(...p))}"></span>`).join('');
    card = `<div class="build-card"><div class="bc-title">${ico(L.icon)}<div><b>${tr(...L.name)}</b><small>${tr(...L.city)} · ${tr('Landmark', 'కట్టడం')} ${B.done + 1}/${LANDMARKS.length}</small></div></div>
      <div class="bdots">${dots}<span class="bcount">${st}/5</span></div>
      <div class="bnext">${tr('Next', 'తర్వాత')}: <b>${tr(...L.parts[st])}</b></div>
      <div class="bactions">
        <button class="btn gold build-btn" data-act="build-part" ${coins < cost ? 'disabled' : ''}>${ico('construction')} ${tr('Build', 'కట్టు')} · ${ico('coin')} ${fmtInt(cost)}</button>
        <button class="btn ghost" data-act="tab" data-tab="slots">${ico('slot')} ${tr('Get coins', 'కాయిన్లు పొందు')}</button>
      </div>
      <div class="bhave">${tr('You have', 'మీ దగ్గర')} ${ico('coin')} <b>${fmtInt(coins)}</b> ${coins < cost ? `<span class="need">· ${tr('need', 'ఇంకా')} ${fmtInt(cost - coins)} ${tr('more', 'కావాలి')}</span>` : ''}</div></div>`;
  }
  const map = LANDMARKS.map((L, i) => {
    const state = i < B.done ? 'built' : i === B.done ? 'now' : 'locked';
    return `<button class="map-stop ${state}" data-act="build-view" data-id="${state === 'built' ? i : -1}" ${state === 'locked' ? 'disabled' : ''}>
      ${ico(state === 'locked' ? 'lock' : L.icon)}<span>${tr(...L.name)}</span><small>${state === 'built' ? '✅' : state === 'now' ? `${B.stage}/5` : tr('Locked', 'లాక్')}</small></button>`;
  }).join('');
  return head + view + card +
    `<div class="build-bonus">${ico('chart')} ${tr('Landmark bonus', 'కట్టడాల బోనస్')}: <b>+${Math.round((landmarkBonus() - 1) * 100)}%</b> ${tr('profits', 'లాభాలు')}</div>
    <h3 class="map-title">${ico('worldmap')} ${tr('Landmark map', 'కట్టడాల మ్యాప్')}</h3><div class="build-map">${map}</div>`;
}
function buildPart() {
  if (allBuilt()) return;
  const B = S.build, cost = stageCost(B.done, B.stage);
  if (S.slot.coins < cost) { toast(tr('Not enough coins. Spin to win more!', 'కాయిన్లు సరిపోవు. స్పిన్ చేసి గెలవండి!'), 'bad'); return; }
  S.slot.coins -= cost;
  const L = buildCurrent(), part = B.stage;
  B.stage++; B.view = null;
  const cash = bonusCash(300 * (B.done + 1)); earn(cash); S.slot.energy += 5; giveAlbumPack('basic', 1, true);
  sfx('buy');
  toast(tr(`🏗️ ${L.parts[part][0]} built! +${money(cash)} cash, +5 ⚡, +1 📦`, `🏗️ ${L.parts[part][1]} పూర్తి! +${money(cash)} క్యాష్, +5 ⚡, +1 📦`), 'good');
  let finished = false;
  if (B.stage >= 5) {
    finished = true;
    const gems = 20 * (B.done + 1);
    B.done++; B.stage = 0; S.gems += gems; S.slot.energy += 25; giveAlbumPack('gold', 1, true);
    B.view = B.done - 1; // keep the finished landmark on screen to enjoy it
    setTimeout(() => {
      sfx('win'); confetti($('buildView'), 220);
      modal(`${ico(L.icon, 'big-ico')}<h3>${tr(`${L.name[0]} is complete!`, `${L.name[1]} పూర్తయింది!`)}</h3>
        <p>${tr(`+${gems} 💎 · +25 ⚡ · <b>+${LANDMARK_BONUS * 100}% profits forever</b>`, `+${gems} 💎 · +25 ⚡ · <b>శాశ్వతంగా +${LANDMARK_BONUS * 100}% లాభాలు</b>`)}</p>
        ${allBuilt() ? '' : `<p class="sub">${tr(`Next: ${LANDMARKS[B.done].name[0]}`, `తర్వాత: ${LANDMARKS[B.done].name[1]}`)}</p>`}
        <div class="modal-actions"><button class="btn gold" data-act="close">${tr('Hooray!', 'హుర్రే!')}</button></div>`);
    }, 900);
  }
  save();
  const keep = B3.T;
  renderTab();
  if (keep) b3Show(finished ? B.done - 1 : B.done, finished ? 5 : B.stage, finished ? 4 : part);
  updateHeader();
}

/* ---------------------------- ALBUM (sticker collection) ----------- */
// Six sets of nine stickers. Packs come from bosses, gifts, landmarks and events; duplicates turn into stars.
const ALBUM_SETS = [
  { id: 'village', icon: 'hut', name: ['Village Life', 'పల్లె జీవితం'], items: [
    ['cow', 'Cow', 'ఆవు', 1], ['rooster', 'Rooster', 'కోడిపుంజు', 1], ['hut', 'Hut', 'గుడిసె', 1], ['sheaf', 'Paddy', 'వరి', 2], ['goat', 'Goat', 'మేక', 2],
    ['coconut', 'Coconut', 'కొబ్బరి', 2], ['ox', 'Bull', 'ఎద్దు', 3], ['tractor', 'Tractor', 'ట్రాక్టర్', 4], ['mango', 'Mango', 'మామిడి', 5]] },
  { id: 'food', icon: 'curry', name: ['Telugu Food', 'తెలుగు వంటలు'], items: [
    ['ricebowl', 'Rice', 'అన్నం', 1], ['riceball', 'Idli', 'ఇడ్లీ', 1], ['pancakes', 'Dosa', 'దోస', 1], ['doughnut', 'Vada', 'వడ', 2], ['pepper', 'Gongura chilli', 'గోంగూర మిర్చి', 2],
    ['flatbread', 'Pesarattu', 'పెసరట్టు', 2], ['custard', 'Payasam', 'పాయసం', 3], ['candy', 'Laddu', 'లడ్డూ', 4], ['curry', 'Biryani', 'బిర్యానీ', 5]] },
  { id: 'fest', icon: 'diya', name: ['Festivals', 'పండుగలు'], items: [
    ['balloon', 'Balloon', 'బెలూన్', 1], ['gift', 'Gift', 'కానుక', 1], ['party', 'Party', 'పార్టీ', 1], ['sparkler', 'Sparkler', 'చిచ్చుబుడ్డి', 2], ['firecracker', 'Cracker', 'టపాకాయ', 2],
    ['kite', 'Kite', 'గాలిపటం', 2], ['diya', 'Diya', 'దీపం', 3], ['xmas', 'Christmas tree', 'క్రిస్మస్ చెట్టు', 4], ['fireworks', 'Fireworks', 'బాణసంచా', 5]] },
  { id: 'animals', icon: 'tiger', name: ['Indian Animals', 'భారత జంతువులు'], items: [
    ['monkey', 'Monkey', 'కోతి', 1], ['parrot', 'Parrot', 'చిలుక', 1], ['turtle', 'Turtle', 'తాబేలు', 1], ['deer', 'Deer', 'జింక', 2], ['snake', 'Cobra', 'నాగుపాము', 2],
    ['elephant', 'Elephant', 'ఏనుగు', 2], ['peacock', 'Peacock', 'నెమలి', 3], ['lion', 'Lion', 'సింహం', 4], ['tiger', 'Tiger', 'పులి', 5]] },
  { id: 'places', icon: 'mosque', name: ['Famous Places', 'ప్రసిద్ధ ప్రదేశాలు'], items: [
    ['beach', 'Vizag beach', 'వైజాగ్ బీచ్', 1], ['train', 'Railway', 'రైల్వే', 1], ['wheel', 'Fair', 'జాతర', 1], ['stadium', 'Stadium', 'స్టేడియం', 2], ['mountain', 'Tirumala hills', 'తిరుమల కొండలు', 2],
    ['classical', 'India Gate', 'ఇండియా గేట్', 2], ['castle', 'Golconda', 'గోల్కొండ', 3], ['htemple', 'Temple', 'దేవాలయం', 4], ['mosque', 'Charminar', 'చార్మినార్', 5]] },
  { id: 'space', icon: 'space', name: ['Space Trip', 'అంతరిక్ష యాత్ర'], items: [
    ['moon', 'Moon', 'చంద్రుడు', 1], ['comet', 'Comet', 'తోకచుక్క', 1], ['telescope', 'Telescope', 'టెలిస్కోప్', 1], ['satellite', 'Satellite', 'ఉపగ్రహం', 2], ['mars', 'Saturn', 'శని గ్రహం', 2],
    ['space', 'Rocket', 'రాకెట్', 2], ['alien', 'Alien', 'ఏలియన్', 3], ['ufo', 'UFO', 'యూఎఫ్‌ఓ', 4], ['galaxy', 'Galaxy', 'పాలపుంత', 5]] },
];
const STICKER_W = { 1: 40, 2: 24, 3: 14, 4: 7, 5: 3 }; // how often each star level drops
const PACKS = { basic: { n: 3, gems: 5, name: ['Basic pack', 'బేసిక్ ప్యాక్'] }, gold: { n: 5, gems: 15, name: ['Gold pack', 'గోల్డ్ ప్యాక్'] } };
const STAR_TRADE = 30, SET_BONUS = 0.05;
const ALL_STICKERS = ALBUM_SETS.flatMap((set, si) => set.items.map(([icon, en, te, stars], k) => ({ id: `${set.id}-${k}`, set: si, icon, name: [en, te], stars })));
function albumBonus() { return 1 + SET_BONUS * Object.keys(S.album ? S.album.sets : {}).length; }
function stickerHave(id) { return S.album.have[id] || 0; }
function setCount(si) { return ALBUM_SETS[si].items.filter((_, k) => stickerHave(`${ALBUM_SETS[si].id}-${k}`)).length; }
function setReward(si) { return { coins: 100000 * (si + 1), gems: 15, energy: 30 }; }
function giveAlbumPack(kind, n = 1, quiet) {
  S.album.packs[kind] += n;
  if (!quiet) toast(tr(`📦 +${n} ${PACKS[kind].name[0]}! Open it in the Album.`, `📦 +${n} ${PACKS[kind].name[1]}! ఆల్బమ్‌లో తెరవండి.`), 'good');
}
function drawSticker(minStars = 1) {
  const pool = ALL_STICKERS.filter(s => s.stars >= minStars);
  const total = pool.reduce((t, s) => t + STICKER_W[s.stars], 0);
  let r = Math.random() * total;
  for (const s of pool) { if ((r -= STICKER_W[s.stars]) < 0) return s; }
  return pool[0];
}
function starsHtml(n) { return '★'.repeat(n) + '<span class="dim">' + '★'.repeat(5 - n) + '</span>'; }
function openPack(kind) {
  const A = S.album;
  if (A.packs[kind] <= 0) return;
  A.packs[kind]--;
  const P = PACKS[kind], got = [];
  for (let i = 0; i < P.n; i++) got.push(drawSticker(kind === 'gold' && i === P.n - 1 ? 4 : 1));
  const done = [];
  const cards = got.map((s, i) => {
    const isNew = !A.have[s.id];
    A.have[s.id] = (A.have[s.id] || 0) + 1;
    if (!isNew) A.stars += s.stars;
    return `<div class="pk-card s${s.stars} ${isNew ? 'new' : ''}" style="animation-delay:${i * 0.25}s">
      ${isNew ? `<em>${tr('NEW!', 'కొత్తది!')}</em>` : `<em class="dup">+${s.stars}⭐</em>`}${ico(s.icon)}<b>${tr(...s.name)}</b><small>${starsHtml(s.stars)}</small></div>`;
  }).join('');
  // Finished sets pay out once
  ALBUM_SETS.forEach((set, si) => {
    if (!A.sets[set.id] && setCount(si) === set.items.length) {
      A.sets[set.id] = true;
      const r = setReward(si);
      S.slot.coins += r.coins; S.gems += r.gems; S.slot.energy += r.energy;
      done.push(`${ico(set.icon)} ${tr(`${set.name[0]} complete! +${fmtInt(r.coins)} coins, +${r.gems} 💎, +${r.energy} ⚡, +5% profits`, `${set.name[1]} పూర్తి! +${fmtInt(r.coins)} కాయిన్లు, +${r.gems} 💎, +${r.energy} ⚡, +5% లాభాలు`)}`);
    }
  });
  S.stats.packs = (S.stats.packs || 0) + 1;
  save();
  sfx('case');
  modal(`<h3>${ico('pack')} ${tr(...P.name)}</h3><div class="pk-row">${cards}</div>
    ${done.map(d => `<p class="pk-done">${d}</p>`).join('')}
    <div class="modal-actions">${A.packs[kind] > 0 ? `<button class="btn gold" data-act="pack-open" data-id="${kind}">${tr('Open another', 'ఇంకోటి తెరువు')} (${A.packs[kind]})</button>` : ''}
    <button class="btn ghost" data-act="close">${tr('Done', 'సరే')}</button></div>`);
  if (done.length) setTimeout(() => { confetti($('modalBody'), 200); sfx('win'); }, 900);
  if (activeTab === 'album') renderTab();
}
function buyPack(kind) {
  const P = PACKS[kind];
  if (S.gems < P.gems) { toast(tr('Not enough gems.', 'జెమ్స్ సరిపోవు.'), 'bad'); return; }
  S.gems -= P.gems; S.album.packs[kind]++;
  openPack(kind);
}
function tradeStars() {
  if (S.album.stars < STAR_TRADE) return;
  S.album.stars -= STAR_TRADE; S.album.packs.basic++;
  openPack('basic');
}
function renderAlbum() {
  const A = S.album, owned = ALL_STICKERS.filter(s => stickerHave(s.id)).length;
  const packBtn = kind => `<div class="pack-box ${kind}">${ico('pack')}<div><b>${tr(...PACKS[kind].name)}</b><small>${PACKS[kind].n} ${tr('stickers', 'స్టిక్కర్లు')}${kind === 'gold' ? tr(', one 4★ or better', ', ఒకటి 4★ పైన') : ''}</small></div>
    ${A.packs[kind] > 0 ? `<button class="btn gold" data-act="pack-open" data-id="${kind}">${tr('Open', 'తెరువు')} (${A.packs[kind]})</button>` : `<button class="btn blue" data-act="pack-buy" data-id="${kind}" data-gems="${PACKS[kind].gems}">💎 ${PACKS[kind].gems}</button>`}</div>`;
  const sets = ALBUM_SETS.map((set, si) => {
    const n = setCount(si), r = setReward(si), complete = !!A.sets[set.id];
    const slots = set.items.map(([icon, en, te, stars], k) => {
      const c = stickerHave(`${set.id}-${k}`);
      return `<div class="stk ${c ? 's' + stars : 'missing'}">${ico(icon)}<b>${c ? tr(en, te) : '?'}</b><small>${starsHtml(stars)}</small>${c > 1 ? `<i>×${c}</i>` : ''}</div>`;
    }).join('');
    return `<div class="album-set ${complete ? 'complete' : ''}"><div class="as-head">${ico(set.icon)}<b>${tr(...set.name)}</b><span>${n}/9</span></div>
      <div class="as-grid">${slots}</div>
      <div class="as-prize">${complete ? '✅ ' + tr('Complete', 'పూర్తి') : `${tr('Prize', 'బహుమతి')}: ${ico('coin')} ${fmtInt(r.coins)} · 💎 ${r.gems} · ⚡ ${r.energy} · +5% ${tr('profits', 'లాభాలు')}`}</div></div>`;
  }).join('');
  return header('album', tr('Sticker Album', 'స్టిక్కర్ ఆల్బమ్'),
    tr(`Collect all ${ALL_STICKERS.length} stickers. Packs come from bosses, free-gift chests, landmarks and events. Each finished set gives <b>+5% profits</b>.`, `మొత్తం ${ALL_STICKERS.length} స్టిక్కర్లు సేకరించండి. బాస్‌లు, ఫ్రీ గిఫ్ట్ పెట్టెలు, ల్యాండ్‌మార్కులు, ఈవెంట్ల నుంచి ప్యాక్‌లు వస్తాయి. పూర్తయిన ప్రతి సెట్ <b>+5% లాభాలు</b>.`)) +
    `<div class="album-top"><div class="slot-stat">${ico('album')}<b>${owned}</b><small>/ ${ALL_STICKERS.length}</small></div>
      <div class="slot-stat stars">⭐<b>${A.stars}</b><small>${tr('stars from duplicates', 'డూప్లికేట్ల స్టార్లు')}</small>
        <button class="btn ghost" data-act="star-trade" ${A.stars < STAR_TRADE ? 'disabled' : ''}>${STAR_TRADE}⭐ → ${ico('pack')}</button></div></div>
    <div class="pack-row">${packBtn('basic')}${packBtn('gold')}</div>
    <div class="album-sets">${sets}</div>`;
}

const STOCKS = [
  { id: 'chai',   icon: 'tea',    name: ['Chai Corp', 'చాయ్ కార్ప్'],          amp: 0.18, p1: 540,  p2: 47,  noise: 0.05, ph: 0.3 },
  { id: 'rocket', icon: 'space',  name: ['Rocket Motors', 'రాకెట్ మోటార్స్'], amp: 0.26, p1: 900,  p2: 71,  noise: 0.08, ph: 1.7 },
  { id: 'moonm',  icon: 'moon',   name: ['Moon Mining', 'మూన్ మైనింగ్'],      amp: 0.28, p1: 1440, p2: 59,  noise: 0.07, ph: 2.9 },
  { id: 'robo',   icon: 'robot',  name: ['Robo Tech', 'రోబో టెక్'],           amp: 0.28, p1: 660,  p2: 37,  noise: 0.10, ph: 4.1 },
  { id: 'film',   icon: 'studio', name: ['Film Fun', 'ఫిల్మ్ ఫన్'],            amp: 0.22, p1: 1200, p2: 83,  noise: 0.06, ph: 5.2 },
  { id: 'gemb',   icon: 'gem',    name: ['Gem Bank', 'జెమ్ బ్యాంక్'],         amp: 0.12, p1: 2880, p2: 113, noise: 0.03, ph: 0.9 },
];
const STOCK_FEE = 0.01;
let stockShownMinute = -1;
function nowMinute() { return Math.floor(Date.now() / 60000); }
function hash01(a, b) {
  let h = Math.imul(a, 374761393) + Math.imul(b, 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function stockPrice(k, minute = nowMinute()) {
  const s = STOCKS[k], TAU = Math.PI * 2;
  const x = minute / 30, i = Math.floor(x), f = x - i, sm = (1 - Math.cos(f * Math.PI)) / 2;
  const n = hash01(k + 1, i) * (1 - sm) + hash01(k + 1, i + 1) * sm;
  const v = 1 + s.amp * Math.sin(TAU * minute / s.p1 + s.ph) + s.amp * 0.2 * Math.sin(TAU * minute / s.p2 + s.ph * 2) + s.noise * (n * 2 - 1);
  return Math.max(0.2, v) * 100;
}
function portfolio() { return S.stocks[S.world] || (S.stocks[S.world] = {}); }
function buyStock(k, frac) {
  const s = STOCKS[k];
  if (!s) return;
  const spend = S.cash * Math.min(1, Math.max(0, frac));
  if (spend < 10) { sfx('err'); toast(tr('Not enough cash to buy shares.', 'షేర్లు కొనడానికి క్యాష్ సరిపోదు.'), 'bad'); return; }
  const pos = portfolio()[s.id] || { units: 0, cost: 0 };
  pos.units += spend * (1 - STOCK_FEE) / stockPrice(k);
  pos.cost += spend;
  portfolio()[s.id] = pos;
  S.cash -= spend;
  S.stats.trades = (S.stats.trades || 0) + 1;
  sfx('buy');
  toast(tr(`📈 Bought ${s.name[0]} shares for ${money(spend)}`, `📈 ${money(spend)} తో ${s.name[1]} షేర్లు కొన్నారు`), 'good');
}
function stockValue(k) {
  const pos = portfolio()[STOCKS[k].id];
  return pos ? pos.units * stockPrice(k) * (1 - STOCK_FEE) : 0;
}
function sellStock(k) {
  const s = STOCKS[k], pos = s && portfolio()[s.id];
  if (!pos || pos.units <= 0) { sfx('err'); return; }
  const value = stockValue(k), gain = value - pos.cost;
  delete portfolio()[s.id];
  S.cash += value;
  // Only the profit counts as new earnings
  if (gain > 0) { S.runEarnings += gain; S.lifetime += gain; }
  S.stats.bestTrade = Math.max(S.stats.bestTrade || 0, gain / pos.cost);
  if (gain >= 0) { sfx('win'); coinShower(10); } else sfx('click');
  const pct = (gain / pos.cost * 100).toFixed(1);
  toast(gain >= 0 ? tr(`💰 Sold ${s.name[0]}: +${money(gain)} (+${pct}%)`, `💰 ${s.name[1]} అమ్మారు: +${money(gain)} (+${pct}%)`)
    : tr(`📉 Sold ${s.name[0]}: ${money(gain)} (${pct}%)`, `📉 ${s.name[1]} అమ్మారు: ${money(gain)} (${pct}%)`), gain >= 0 ? 'good' : 'bad');
}
function sparkline(k) {
  const now = nowMinute(), W = 120, H = 36;
  const pts = Array.from({ length: 60 }, (_, j) => stockPrice(k, now - 59 + j));
  const min = Math.min(...pts), max = Math.max(...pts), up = pts[59] >= pts[0];
  const d = pts.map((p, j) => `${(j / 59 * W).toFixed(1)},${(H - 2 - (p - min) / (max - min || 1) * (H - 4)).toFixed(1)}`).join(' ');
  const color = up ? '#2fd27a' : '#ff5c6c';
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
    <polyline points="0,${H} ${d} ${W},${H}" fill="${color}" opacity=".15"/><polyline points="${d}" fill="none" stroke="${color}" stroke-width="2"/></svg>`;
}
function renderStocks() {
  stockShownMinute = nowMinute();
  let total = 0, cost = 0;
  const rows = STOCKS.map((s, k) => {
    const price = stockPrice(k), hourAgo = stockPrice(k, nowMinute() - 60);
    const ch = (price / hourAgo - 1) * 100, pos = portfolio()[s.id];
    let holding = '';
    if (pos) {
      const v = stockValue(k), g = (v / pos.cost - 1) * 100;
      total += v; cost += pos.cost;
      holding = `<div class="stock-hold ${g >= 0 ? 'up' : 'down'}">${tr('You own', 'మీ షేర్లు')}: <b>${money(v)}</b> (${g >= 0 ? '+' : ''}${g.toFixed(1)}%)</div>`;
    }
    return `<div class="stock-row">
      <div class="ico">${ico(s.icon)}</div>
      <div class="stock-info"><div class="title">${tr(...s.name)}</div>
        <div class="stock-price">${price.toFixed(2)} <span class="${ch >= 0 ? 'up' : 'down'}">${ch >= 0 ? '▲' : '▼'} ${Math.abs(ch).toFixed(1)}%</span></div>${holding}</div>
      ${sparkline(k)}
      <div class="stock-btns">
        <button class="btn" data-act="stock-buy" data-k="${k}" data-f="0.1">${tr('Buy', 'కొను')} 10%</button>
        <button class="btn" data-act="stock-buy" data-k="${k}" data-f="0.5">50%</button>
        ${pos ? `<button class="btn gold" data-act="stock-sell" data-k="${k}">${tr('Sell', 'అమ్ము')}</button>` : ''}
      </div></div>`;
  }).join('');
  const g = cost ? (total / cost - 1) * 100 : 0;
  return header('chart', tr('Stock Market', 'స్టాక్ మార్కెట్'),
    tr('Prices change every minute and are the same for every player. Buy low, sell high! (1% fee)', 'ధరలు ప్రతి నిమిషం మారుతాయి, అందరికీ ఒకటే. తక్కువకు కొని ఎక్కువకు అమ్మండి! (1% ఫీజు)')) +
    `<div class="stock-summary"><div><div class="stat-big">${money(total)}</div><div class="stat-lbl">${tr('Your shares', 'మీ షేర్ల విలువ')} · ${nm(WORLD)}</div></div>
      <div><div class="stat-big ${g >= 0 ? 'up' : 'down'}">${g >= 0 ? '+' : ''}${g.toFixed(1)}%</div><div class="stat-lbl">${tr('Profit', 'లాభం')}</div></div>
      <div><div class="stat-big">${money(S.cash)}</div><div class="stat-lbl">${tr('Cash', 'క్యాష్')}</div></div></div>
    <div class="list">${rows}</div>`;
}

/* ---------------------------- PETS ---------------------------------- */
// Pets give lasting bonuses. Feed them at least once a day, or a hungry pet only gives half its bonus.
const PETS = [
  { id: 'dog',     icon: 'dog',     name: ['Puppy', 'కుక్కపిల్ల'],   kind: 'profit',  per: 0.10, cost: { cash: 1e4 } },
  { id: 'cat',     icon: 'cat',     name: ['Kitty', 'పిల్లి'],        kind: 'profit',  per: 0.15, cost: { cash: 1e7 } },
  { id: 'rabbit',  icon: 'rabbit',  name: ['Bunny', 'కుందేలు'],       kind: 'profit',  per: 0.20, cost: { gems: 30 } },
  { id: 'owl',     icon: 'owl',     name: ['Wise Owl', 'గుడ్లగూబ'],    kind: 'offline', per: 0.25, cost: { cash: 1e10 } },
  { id: 'panda',   icon: 'panda',   name: ['Panda', 'పాండా'],         kind: 'profit',  per: 0.30, cost: { cash: 1e13 } },
  { id: 'peacock', icon: 'peacock', name: ['Peacock', 'నెమలి'],       kind: 'gems',    per: 1,    cost: { gems: 80 } },
  { id: 'tiger',   icon: 'tiger',   name: ['Tiger', 'పులి'],          kind: 'profit',  per: 0.50, cost: { cash: 1e18 } },
  { id: 'unicorn', icon: 'unicorn', name: ['Unicorn', 'యూనికార్న్'],  kind: 'profit',  per: 0.75, cost: { gems: 200 } },
  { id: 'dragon',  icon: 'dragon',  name: ['Dragon', 'డ్రాగన్'],      kind: 'profit',  per: 1.50, cost: { gems: 500 } },
];
const PET_MAX_LVL = 10;
const PET_HUNGRY_AFTER = 24 * 3600 * 1000;
const PET_FEED_EVERY = 4 * 3600 * 1000;
function petLvl(id) { return S.pets.owned[id] || 0; }
function petsHungry() { return Date.now() - S.pets.fedAt > PET_HUNGRY_AFTER; }
function petFeedReady() { return Date.now() - S.pets.fedAt >= PET_FEED_EVERY; }
function petLevelCost(lvl) { return 5 * lvl; }
function petBonus(kind) {
  const happy = petsHungry() ? 0.5 : 1;
  let m = 1;
  for (const p of PETS) if (p.kind === kind && petLvl(p.id)) m *= 1 + p.per * petLvl(p.id) * happy;
  return m;
}
function petDesc(p, lvl = Math.max(1, petLvl(p.id))) {
  const pct = Math.round(p.per * lvl * 100);
  if (p.kind === 'offline') return tr(`Offline earnings +${pct}%`, `ఆఫ్‌లైన్ సంపాదన +${pct}%`);
  if (p.kind === 'gems') return tr(`+${lvl} gems every time you feed`, `తినిపించిన ప్రతిసారి +${lvl} జెమ్స్`);
  return tr(`All profits +${pct}%`, `అన్ని లాభాలు +${pct}%`);
}
function buyPet(id) {
  const p = PETS.find(x => x.id === id);
  if (!p || petLvl(id)) return;
  if (p.cost.cash ? S.cash < p.cost.cash : S.gems < p.cost.gems) { sfx('err'); return; }
  if (p.cost.cash) S.cash -= p.cost.cash; else S.gems -= p.cost.gems;
  if (!Object.keys(S.pets.owned).length) S.pets.fedAt = Date.now();
  S.pets.owned[id] = 1;
  sfx('win');
  toast(tr(`${emo(p.icon)} ${p.name[0]} joined your family!`, `${emo(p.icon)} ${p.name[1]} మీ కుటుంబంలో చేరింది!`), 'good');
  confetti(document.querySelector(`[data-pet="${id}"]`), 120);
}
function levelPet(id) {
  const lvl = petLvl(id), cost = petLevelCost(lvl);
  if (!lvl || lvl >= PET_MAX_LVL || S.gems < cost) { sfx('err'); return; }
  S.gems -= cost;
  S.pets.owned[id] = lvl + 1;
  const p = PETS.find(x => x.id === id);
  sfx('big');
  toast(tr(`${emo(p.icon)} ${p.name[0]} reached level ${lvl + 1}!`, `${emo(p.icon)} ${p.name[1]} లెవెల్ ${lvl + 1} చేరింది!`), 'good');
  sparkBurst(document.querySelector(`[data-pet="${id}"]`), 24);
}
function feedPets() {
  if (!Object.keys(S.pets.owned).length || !petFeedReady()) { sfx('err'); return; }
  S.pets.fedAt = Date.now();
  let gems = 0;
  for (const p of PETS) if (p.kind === 'gems' && petLvl(p.id)) gems += petLvl(p.id);
  S.gems += gems;
  S.stats.feeds = (S.stats.feeds || 0) + 1;
  sfx('win');
  toast(tr(`🦴 Your pets are happy!${gems ? ` +${gems} 💎` : ''}`, `🦴 మీ పెట్స్ సంతోషంగా ఉన్నాయి!${gems ? ` +${gems} 💎` : ''}`), 'good');
  document.querySelectorAll('.pet-card.owned').forEach(el => heartBurst(el));
}
function petFeedLabel() { return `${tr('Feed in', 'తినిపించడానికి')} ${fmtClock((PET_FEED_EVERY - (Date.now() - S.pets.fedAt)) / 1000)}`; }
function updatePetTimer() {
  const b = $('petFeedBtn');
  if (!b) return;
  if (petFeedReady()) renderTab(); else b.textContent = petFeedLabel();
}
function heartBurst(el) {
  if (fxOff() || !el) return;
  const c = centerOf(el);
  for (let k = 0; k < 4; k++) {
    const h = document.createElement('div');
    h.className = 'heart-fly';
    h.innerHTML = ico('heart');
    h.style.left = (c.x + rand(-30, 30)) + 'px';
    h.style.top = (c.y + rand(-10, 10)) + 'px';
    h.style.animationDelay = (k * 0.12) + 's';
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 1800);
  }
}
function renderPets() {
  const ownedCount = Object.keys(S.pets.owned).length;
  const hungry = petsHungry();
  const status = !ownedCount ? tr('Adopt your first pet below!', 'కింద మీ మొదటి పెట్‌ను తీసుకోండి!')
    : hungry ? tr('😢 Your pets are hungry — their bonus is halved. Feed them!', '😢 మీ పెట్స్‌కు ఆకలిగా ఉంది — బోనస్ సగం అయింది. తినిపించండి!')
    : tr('😊 Your pets are happy. Feed them every day to keep the full bonus.', '😊 మీ పెట్స్ సంతోషంగా ఉన్నాయి. పూర్తి బోనస్ కోసం రోజూ తినిపించండి.');
  const feedBtn = ownedCount ? (petFeedReady()
    ? `<button class="btn gold" data-act="pet-feed">${ico('bone')} ${tr('Feed pets', 'తినిపించు')}</button>`
    : `<button class="btn ghost" id="petFeedBtn" disabled>${petFeedLabel()}</button>`) : '';
  const cardsHtml = PETS.map(p => {
    const lvl = petLvl(p.id);
    let action;
    if (!lvl) {
      action = p.cost.cash
        ? `<button class="btn" data-act="pet-buy" data-id="${p.id}" data-cost="${p.cost.cash}">${tr('Adopt', 'తీసుకో')} ${money(p.cost.cash)}</button>`
        : `<button class="btn blue" data-act="pet-buy" data-id="${p.id}" data-gems="${p.cost.gems}">${tr('Adopt', 'తీసుకో')} 💎${p.cost.gems}</button>`;
    } else if (lvl < PET_MAX_LVL) {
      action = `<button class="btn purple" data-act="pet-lvl" data-id="${p.id}" data-gems="${petLevelCost(lvl)}">${tr('Level up', 'లెవెల్ అప్')} 💎${petLevelCost(lvl)}</button>`;
    } else action = `<span class="badge">⭐ ${tr('Max level', 'గరిష్ట లెవెల్')}</span>`;
    const stars = lvl ? `<div class="pet-lvl">${tr('Level', 'లెవెల్')} ${lvl}/${PET_MAX_LVL}<div class="mbar"><div style="width:${lvl / PET_MAX_LVL * 100}%"></div></div></div>` : '';
    return `<div class="pet-card ${lvl ? 'owned' : 'locked'} ${lvl && hungry ? 'hungry' : ''}" data-pet="${p.id}">
      <div class="pet-pic">${ico(p.icon)}</div>
      <div class="title">${tr(...p.name)}</div>
      <div class="desc">${petDesc(p)}</div>${stars}${action}</div>`;
  }).join('');
  const total = petBonus('profit');
  return header('paws', tr('Pets', 'పెట్స్'), tr(`Pets boost your empire in every world. Pet profit bonus: <b>x${fmt(total)}</b>`, `పెట్స్ అన్ని ప్రపంచాల్లో మీ సామ్రాజ్యాన్ని పెంచుతాయి. పెట్ లాభం బోనస్: <b>x${fmt(total)}</b>`)) +
    `<div class="pet-status ${hungry && ownedCount ? 'hungry' : ''}">${ico(hungry && ownedCount ? 'bowl' : 'sparkheart')}<div class="info">${status}</div>${feedBtn}</div>
    <div class="pet-grid">${cardsHtml}</div>`;
}

/* ---------------------------- TUTORIAL ------------------------------ */
// Short guided start. Each step points at one thing and moves on when the player has done it.
const TUTORIAL = [
  { target: () => cards[0] && cards[0].el.querySelector('.biz-icon'), done: () => S.stats.clicks >= 1,
    text: ['Tap your Tea Stall to make money!', 'డబ్బు సంపాదించడానికి మీ టీ స్టాల్ ట్యాప్ చేయండి!'] },
  { target: () => cards[0] && cards[0].buyBtn, done: () => S.biz[0].owned >= 3,
    text: ['Buy more Tea Stalls — more stalls, more money.', 'ఇంకా టీ స్టాల్స్ కొనండి — ఎక్కువ స్టాల్స్, ఎక్కువ డబ్బు.'] },
  { target: () => cards[1] && (S.cash >= costFor(1, 1) ? cards[1].buyBtn : cards[0].el.querySelector('.biz-icon')), done: () => S.biz[1].owned >= 1,
    text: ['Save 60 cash and unlock the Food Truck!', '60 క్యాష్ కూడబెట్టి ఫుడ్ ట్రక్ అన్‌లాక్ చేయండి!'] },
  { target: () => activeTab === 'managers' ? document.querySelector('#tab-managers [data-act=hire]') : document.querySelector('.tab-btn[data-tab=managers]'),
    done: () => S.biz.some(b => b.manager),
    text: ['Hire a manager (1K) — they run your business for you, even offline!', 'మేనేజర్‌ను నియమించండి (1K) — మీ బదులు వ్యాపారం నడుపుతారు, ఆఫ్‌లైన్‌లో కూడా!'] },
  { target: () => document.querySelector('.tab-btn[data-tab=missions]'), done: () => false, finish: true,
    text: ['Great job, boss! Do Missions, claim Daily rewards and spin the wheel for gems.', 'సూపర్ బాస్! మిషన్లు చేయండి, డైలీ రివార్డ్ తీసుకోండి, జెమ్స్ కోసం వీల్ తిప్పండి.'] },
];
let tutFocus = null;
function updateTutorial() {
  const box = $('tutor');
  const off = S.tutorial.done || S.world !== 'earth' || !$('modal').classList.contains('hidden');
  if (off) { box.classList.add('hidden'); setTutFocus(null); return; }
  let st = TUTORIAL[S.tutorial.step];
  while (st && st.done()) { S.tutorial.step++; st = TUTORIAL[S.tutorial.step]; sfx('cash'); }
  if (!st) { S.tutorial.done = true; box.classList.add('hidden'); setTutFocus(null); return; }
  // On the wrong tab, point back at Businesses first
  const onRightTab = st.finish || activeTab === 'business' || (S.tutorial.step === 3 && activeTab === 'managers');
  const target = onRightTab ? st.target() : document.querySelector('.tab-btn[data-tab=business]');
  setTutFocus(target);
  box.classList.remove('hidden');
  setHTML($('tutorText'), `<b>${tr('Step', 'స్టెప్')} ${S.tutorial.step + 1}/${TUTORIAL.length}</b> ${tr(...st.text)}`);
  $('tutorNext').classList.toggle('hidden', !st.finish);
  $('tutorNext').textContent = tr('Finish', 'పూర్తి');
  $('tutorSkip').textContent = tr('Skip', 'స్కిప్');
  placeHand(target);
}
function setTutFocus(el) {
  if (tutFocus === el) return;
  if (tutFocus) tutFocus.classList.remove('tut-focus');
  tutFocus = el;
  if (el) el.classList.add('tut-focus');
}
function placeHand(target) {
  const hand = $('tutHand');
  if (!target || !target.getBoundingClientRect().width) { hand.classList.add('hidden'); return; }
  const r = target.getBoundingClientRect();
  hand.classList.remove('hidden');
  hand.style.left = (r.left + r.width / 2 - 22) + 'px';
  hand.style.top = (r.top - 50) + 'px';
}
function endTutorial() {
  S.tutorial.done = true;
  maybeAskNotify();
  updateTutorial();
  $('tutHand').classList.add('hidden');
  save();
}

/* ---------------------------- PLAYER COUNT -------------------------- */
let playersToday = null;
async function pingPlayers() {
  try {
    const res = await fetch('/api/players', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: S.player.id }) });
    if (!res.ok || !(res.headers.get('content-type') || '').includes('json')) return;
    const out = await res.json();
    playersToday = out.today;
    if (activeTab === 'leaderboard') renderTab();
  } catch (e) { /* offline */ }
}

/* ---------------------------- FX: STARS, COINS, CONFETTI ------------ */
const Stars = (() => {
  const cv = document.getElementById('stars');
  const ctx = cv ? cv.getContext('2d') : null;
  const THEMES = {
    earth: ['#ffffff', '#b9c6ff', '#ffe9a8'],
    moon: ['#ffffff', '#d7dcef', '#a9b3d6'],
    mars: ['#ffe2c7', '#ffb08a', '#ff8a5c'],
    galaxy: ['#f0e0ff', '#9fd0ff', '#ff9ef0'],
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
    if (!ctx || fxOff()) return;
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
    draw,
    clear() { if (ctx) ctx.clearRect(0, 0, w, h); },
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
    if (!ctx || fxOff()) return;
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
  if (fxOff() || !fromEl || activeTab !== 'business') return;
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
      <button class="biz-icon" data-act="run" data-i="${i}" title="${esc(nm(d))}">
        <div class="ms"><div class="ms-fill"></div></div>
        <div class="orb-ring"></div>
        <div class="orb">${ico(d.icon, 'biz-img')}</div>
        <span class="lvl">0</span>
      </button>
      <div class="biz-body">
        <div class="biz-head"><span class="biz-name">${nm(d)}</span><span class="biz-tag"></span></div>
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
    const c = cards[i];
    if (!c) return;
    const locked = b.owned === 0;
    c.el.classList.toggle('locked', locked);
    c.el.classList.toggle('managed', b.manager);
    c.el.classList.toggle('running', b.running && !locked);
    c.el.classList.toggle('idle', !locked && !b.manager && !b.running);
    c.el.classList.toggle('hot', !!marketEvent && marketEvent.biz === i);
    c.lvl.textContent = fmtInt(b.owned);
    const nmx = nextMilestone(b.owned);
    const prevLvl = [...MILESTONES].reverse().find(m => m.lvl <= b.owned);
    const from = prevLvl ? prevLvl.lvl : 0;
    c.ms.style.width = nmx ? ((b.owned - from) / (nmx.lvl - from) * 100) + '%' : '100%';
    const n = buyAmount(i), cost = costFor(i, n);
    c.buyN.textContent = locked ? tr('Unlock', 'అన్‌లాక్') : tr(`Buy x${n}`, `కొను x${n}`);
    c.buyCost.textContent = money(cost);
    c.buyBtn.classList.toggle('cant', S.cash < cost);
    if (locked) { c.tag.textContent = tr('🔒 Locked', '🔒 లాక్'); return; }
    const ct = cycleTime(i), rev = cycleRevenue(i);
    c.tag.textContent = nmx ? `${tr('Next', 'తర్వాత')} @${nmx.lvl}: ${nmx.type === 'speed' ? '⚡' : '💰'}x${nmx.mult}` : tr('⭐ Maxed milestones', '⭐ అన్ని మైల్‌స్టోన్లు పూర్తి');
    c.text.textContent = (b.manager && ct < 0.15) ? money(rev / ct) + tr(' /s', ' /సె') : money(rev);
    c.timer.textContent = b.manager ? (ct < 0.15 ? tr('🤖 auto', '🤖 ఆటో') : fmtClock(ct * (1 - b.progress)))
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
    if (e.pointerType !== 'mouse' || fxOff()) return;
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
  if (tab === 'slots') raidSync(false);
  if (tab === 'leaderboard') { lbFetch(!!S.player.name && S.lifetime > lbLastScore); tourFetch(!!S.player.name && tourScore() > tourLastScore); }
  renderTab();
}
function renderTab() {
  const fn = { missions: renderMissions, managers: renderManagers, upgrades: renderUpgrades, investors: renderInvestors,
    worlds: renderWorlds, pets: renderPets, slots: renderSlots, build: renderBuild, album: renderAlbum, stocks: renderStocks, leaderboard: renderLeaderboard, shop: renderShop, awards: renderAwards, stats: renderStats, settings: renderSettings }[activeTab];
  if (fn) $('tab-' + activeTab).innerHTML = fn();
  if (activeTab === 'build') mountBuildView();
  refreshAffordability();
}
function header(icon, title, sub) {
  return `<div class="tab-head">${ico(icon, 'head-ico')}<div><h2>${title}</h2><p class="sub">${sub}</p></div></div>`;
}
function rowHtml(icon, title, desc, action, cls = '') {
  return `<div class="row ${cls}"><div class="ico">${ico(icon)}</div><div class="info"><div class="title">${title}</div>${desc ? `<div class="desc">${desc}</div>` : ''}</div>${action}</div>`;
}

function renderMissions() {
  const rows = S.missions.map(m => {
    const t = missionText(m), v = Math.min(missionValue(m), m.target), done = v >= m.target;
    return `<div class="row mission ${done ? 'ready' : ''}" data-mrow="${m.id}" data-done="${done ? 1 : 0}">
      <div class="ico">${ico(t.icon)}</div>
      <div class="info"><div class="title">${t.text}</div>
        <div class="mbar"><div style="width:${v / m.target * 100}%"></div></div>
        <div class="desc"><span class="mval">${missionVal(m, v)}</span> · ${tr('Reward', 'రివార్డ్')}: 💎${m.gems} + ${tr('2 min income', '2 నిమి ఆదాయం')}</div></div>
      ${done ? `<button class="btn gold" data-act="mclaim" data-id="${m.id}">${tr('Claim', 'తీసుకోండి')}</button>`
        : `<button class="btn ghost" data-act="mskip" data-id="${m.id}" data-gems="2">${tr('Skip', 'మార్చు')} 💎2</button>`}
    </div>`;
  }).join('');
  return header('clipboard', tr('Missions', 'మిషన్లు'),
    tr(`Finish missions to win gems and cash. Completed so far: <b>${fmtInt(S.stats.missionsDone)}</b>`, `మిషన్లు పూర్తి చేసి జెమ్స్, క్యాష్ గెలవండి. ఇప్పటివరకు: <b>${fmtInt(S.stats.missionsDone)}</b>`)) +
    challengeCardHtml() + `<div class="list">${rows}</div>`;
}
function renderManagers() {
  const rows = BUSINESSES.map((d, i) => {
    const b = S.biz[i];
    if (b.manager) return rowHtml(d.icon, d.manager, tr(`Running your ${d.name}`, `మీ ${d.te} నడుపుతున్నారు`), `<span class="badge">${tr('✔ Hired', '✔ నియమించారు')}</span>`, 'done');
    const note = b.owned === 0 ? tr(`Unlock ${d.name} first`, `ముందు ${d.te} అన్‌లాక్ చేయండి`)
      : tr(`Automatically runs ${d.name} forever — even while you're away`, `${d.te} ని ఎప్పటికీ ఆటోమేటిక్‌గా నడుపుతారు — మీరు లేనప్పుడు కూడా`);
    return rowHtml(d.icon, d.manager, note,
      `<button class="btn" data-act="hire" data-i="${i}" data-cost="${d.managerCost}" ${b.owned === 0 ? 'disabled' : ''}>${tr('Hire', 'నియమించు')} ${money(d.managerCost)}</button>`);
  }).join('');
  return header('manager', `${tr('Managers', 'మేనేజర్లు')} · ${nm(WORLD)}`,
    tr('Managers run a business automatically and keep earning while you\'re offline.', 'మేనేజర్లు వ్యాపారాన్ని ఆటోమేటిక్‌గా నడుపుతారు, మీరు ఆఫ్‌లైన్‌లో ఉన్నా సంపాదిస్తారు.')) + `<div class="list">${rows}</div>`;
}
function renderUpgrades() {
  const left = UPGRADES.filter(u => !S.upgrades[u.id]);
  const rows = left.slice(0, 25).map(u => rowHtml(u.icon, upgName(u),
    `${u.target === -1 ? tr('All businesses', 'అన్ని వ్యాపారాలు') : nm(BUSINESSES[u.target])} ${tr('profit', 'లాభం')} x${u.mult}`,
    `<button class="btn gold" data-act="upgrade" data-id="${u.id}" data-cost="${u.cost}">${money(u.cost)}</button>`)).join('');
  const owned = UPGRADES.length - left.length;
  return header('up', `${tr('Upgrades', 'అప్‌గ్రేడ్‌లు')} · ${nm(WORLD)}`,
    tr(`Owned ${owned} / ${UPGRADES.length}. Each upgrade multiplies profits.`, `${owned} / ${UPGRADES.length} కొన్నారు. ప్రతి అప్‌గ్రేడ్ లాభాన్ని పెంచుతుంది.`)) +
    `<div class="toolbar"><span></span><button class="btn" data-act="upgrade-all">${tr('Buy all affordable', 'కొనగలిగినవన్నీ కొను')}</button></div>
    <div class="list">${rows || `<p class="sub">${tr('You own every upgrade in this world. Legendary!', 'ఈ ప్రపంచంలో అన్ని అప్‌గ్రేడ్‌లు మీవే. లెజెండ్!')}</p>`}</div>`;
}
function renderInvestors() {
  const avail = investorsAvailable();
  const rate = investorRate();
  const rows = INVESTOR_UPGRADES.map(u => {
    const [name, desc] = invText(u);
    return S.investorUpgrades[u.id]
      ? rowHtml(u.icon, name, desc, `<span class="badge">${tr('✔ Owned', '✔ ఉంది')}</span>`, 'done')
      : rowHtml(u.icon, name, desc, `<button class="btn purple" data-act="invup" data-id="${u.id}" data-inv="${u.cost}">👔 ${fmtInt(u.cost)}</button>`);
  }).join('');
  const pct = Math.round(rate * 100);
  return header('necktie', tr('Investors', 'ఇన్వెస్టర్లు'),
    tr(`Investors join based on your lifetime earnings. Each one boosts ALL profits in every world by +${pct}%.`, `మీ మొత్తం సంపాదన బట్టి ఇన్వెస్టర్లు వస్తారు. ప్రతి ఒక్కరు అన్ని ప్రపంచాల్లో లాభాన్ని +${pct}% పెంచుతారు.`)) +
    `<div class="hero">
      <div><div class="stat-big">${fmtInt(S.investors)}</div><div class="stat-lbl">${tr('Current investors', 'ప్రస్తుత ఇన్వెస్టర్లు')} (+${fmt(S.investors * rate * 100)}%)</div></div>
      <div><div class="stat-big" id="invAvail">${fmtInt(avail)}</div><div class="stat-lbl">${tr(`Ready to join if you restart ${WORLD.name}`, `${WORLD.te} రీస్టార్ట్ చేస్తే చేరేవారు`)}</div></div>
      <button class="btn gold" data-act="prestige" ${avail < 1 ? 'disabled' : ''}>${tr('Restart &amp; Claim', 'రీస్టార్ట్ &amp; పొందండి')}</button>
    </div>
    <h3 class="sec">${tr('Investor Upgrades', 'ఇన్వెస్టర్ అప్‌గ్రేడ్‌లు')}</h3><p class="sub">${tr('Spend investors on powerful permanent upgrades.', 'ఇన్వెస్టర్లను శక్తివంతమైన శాశ్వత అప్‌గ్రేడ్‌లకు ఖర్చు చేయండి.')}</p>
    <div class="list">${rows}</div>`;
}
function renderWorlds() {
  const cardsHtml = WORLDS.map(w => {
    const unlocked = !!S.worldsUnlocked[w.id], here = S.world === w.id;
    const pct = Math.min(100, w.unlockAt ? S.lifetime / w.unlockAt * 100 : 100);
    let action;
    if (here) action = `<span class="badge">${tr('You are here', 'మీరు ఇక్కడ ఉన్నారు')}</span>`;
    else if (unlocked) action = `<button class="btn" data-act="travel" data-id="${w.id}">${tr('Travel', 'ప్రయాణం')}</button>`;
    else if (S.lifetime >= w.unlockAt) action = `<button class="btn gold" data-act="unlock-world" data-id="${w.id}">${tr('Unlock!', 'అన్‌లాక్!')}</button>`;
    else action = `<div class="world-lock"><div class="mbar"><div style="width:${pct}%"></div></div><small>${money(S.lifetime)} / ${money(w.unlockAt)} ${tr('lifetime', 'మొత్తం')}</small></div>`;
    const preview = w.biz.slice(0, 5).map(b => ico(b.icon)).join('');
    return `<div class="world-card w-${w.id} ${unlocked ? '' : 'locked'} ${here ? 'here' : ''}">
      <div class="planet">${ico(w.icon)}</div>
      <div class="info"><div class="title">${nm(w)} <span class="badge">x${w.mult} ${tr('profits', 'లాభాలు')}</span></div>
        <div class="desc">${tr(...w.desc)}</div><div class="preview">${preview}</div></div>
      <div class="world-act">${action}</div></div>`;
  }).join('');
  return header('earth', tr('Worlds', 'ప్రపంచాలు'),
    tr('Unlock new worlds with lifetime earnings. Each world has its own businesses. Only the world you are in earns money.',
      'మొత్తం సంపాదనతో కొత్త ప్రపంచాలు అన్‌లాక్ చేయండి. ప్రతి ప్రపంచానికి సొంత వ్యాపారాలు. మీరు ఉన్న ప్రపంచం మాత్రమే సంపాదిస్తుంది.')) +
    `<div class="worlds">${cardsHtml}</div>`;
}
function lbRowsHtml(top) {
  return top.map(p => {
    const medal = p.rank === 1 ? ico('gold') : p.rank === 2 ? ico('silver') : p.rank === 3 ? ico('bronze') : `<b class="rank-n">#${p.rank}</b>`;
    return `<div class="lb-row ${p.me ? 'me' : ''} ${p.rank <= 3 ? 'top' : ''}"><div class="lb-rank">${medal}</div>
      <div class="lb-name">${esc(p.name)}${p.me ? ` <span class="badge">${tr('You', 'మీరు')}</span>` : ''}</div>
      <div class="lb-world">${ico(worldDef(p.world).icon)}</div><div class="lb-score">${money(p.score)}</div></div>`;
  }).join('') || `<p class="sub">${tr('No players yet. Be the first!', 'ఇంకా ప్లేయర్లు లేరు. మీరే మొదటివారు అవ్వండి!')}</p>`;
}
function lbOfflineHtml() {
  return `<div class="join-card">${ico('earth', 'big-ico')}<h3>${tr('Leaderboard is offline', 'లీడర్‌బోర్డ్ ఆఫ్‌లైన్‌లో ఉంది')}</h3>
    <p class="sub">${tr('The leaderboard works on the online version of the game. Check your internet and try again.', 'లీడర్‌బోర్డ్ ఆన్‌లైన్ గేమ్‌లోనే పనిచేస్తుంది. ఇంటర్నెట్ చూసి మళ్ళీ ప్రయత్నించండి.')}</p>
    <button class="btn" data-act="lb-refresh">${tr('Try again', 'మళ్ళీ ప్రయత్నించు')}</button></div>`;
}
function lbLoadingHtml() { return `<div class="join-card"><div class="loader"></div><p class="sub">${tr('Loading players…', 'ప్లేయర్లు లోడ్ అవుతున్నారు…')}</p></div>`; }
function renderLeaderboard() {
  const sub = tr('Compete with players around the world: a new tournament every week, plus the all-time board.', 'ప్రపంచవ్యాప్తంగా ప్లేయర్లతో పోటీ: ప్రతి వారం కొత్త టోర్నమెంట్, ఇంకా ఆల్-టైమ్ బోర్డు.');
  if (!S.player.name) {
    return header('trophy', tr('Leaderboard', 'లీడర్‌బోర్డ్'), sub) +
      `<div class="join-card">${ico('person', 'big-ico')}
        <h3>${tr('Choose your boss name', 'మీ బాస్ పేరు ఎంచుకోండి')}</h3>
        <input id="lbName" maxlength="16" placeholder="${tr('Your name', 'మీ పేరు')}" autocomplete="nickname">
        <button class="btn gold" data-act="lb-join">${tr('Join leaderboard', 'లీడర్‌బోర్డ్‌లో చేరండి')}</button>
        <p class="sub">${tr('Only your name, score and current world are shared.', 'మీ పేరు, స్కోర్, ప్రస్తుత ప్రపంచం మాత్రమే షేర్ అవుతాయి.')}</p></div>`;
  }
  const tabs = `<div class="seg-toggle lb-tabs"><button class="${lbView === 'week' ? 'on' : ''}" data-act="lb-view" data-id="week">${ico('swords')} ${tr('Weekly', 'వారపు టోర్నమెంట్')}</button>
    <button class="${lbView === 'all' ? 'on' : ''}" data-act="lb-view" data-id="all">${ico('earth')} ${tr('All-time', 'ఆల్-టైమ్')}</button></div>`;
  const meBar = (rank, players, scoreLabel) => `<div class="lb-me">${ico('person')}<div><b>${esc(S.player.name)}</b><br><small>${tr(`Rank ${rank} of ${fmtInt(players)}`, `${fmtInt(players)} లో ర్యాంక్ ${rank}`)} · ${scoreLabel}</small></div>
    <div class="lb-actions"><button class="btn ghost" data-act="lb-rename">${tr('Rename', 'పేరు మార్చు')}</button><button class="btn" data-act="lb-refresh">${tr('Refresh', 'రిఫ్రెష్')}</button></div></div>`;
  let body;
  if (lbView === 'week') {
    const prizes = [['gold', TOUR_PRIZES[0]], ['silver', TOUR_PRIZES[1]], ['bronze', TOUR_PRIZES[2]]].map(([m, g]) => `<span class="prize">${ico(m)} 💎${g}</span>`).join('') +
      `<span class="prize">${tr('Top 10', 'టాప్ 10')} 💎${TOUR_TOP10}</span><span class="prize">${tr('Everyone', 'అందరికీ')} 💎${TOUR_PLAYED}</span>`;
    const banner = `<div class="tour-banner">${ico('trophy', 'tour-ico')}<div class="info"><div class="title">${tr('Weekly Tournament', 'వారపు టోర్నమెంట్')}</div>
      <div class="desc">${tr('Earn the most money this week to win. Ends in', 'ఈ వారం ఎక్కువ సంపాదించినవారు గెలుస్తారు. ముగింపు')} <b id="tourEnds">${fmtDur(tourEndsIn())}</b></div>
      <div class="prizes">${prizes}</div></div></div>`;
    if (tourState === 'offline') body = banner + lbOfflineHtml();
    else if (!tourData) body = banner + lbLoadingHtml();
    else body = banner + meBar(tourData.myRank ? '#' + tourData.myRank : '—', tourData.players, `${tr('This week', 'ఈ వారం')}: <b id="tourMine">${money(tourScore())}</b>`) + `<div class="lb-list">${lbRowsHtml(tourData.top)}</div>`;
  } else {
    if (lbState === 'offline') body = lbOfflineHtml();
    else if (!lbData) body = lbLoadingHtml();
    else body = meBar(lbData.myRank ? '#' + lbData.myRank : '—', lbData.players, `${tr('Lifetime', 'మొత్తం')}: <b>${money(S.lifetime)}</b>`) + `<div class="lb-list">${lbRowsHtml(lbData.top)}</div>`;
  }
  const online = playersToday ? `<div class="players-today">${ico('people')} ${tr(`<b>${fmtInt(playersToday)}</b> players today`, `ఈ రోజు <b>${fmtInt(playersToday)}</b> మంది ఆడారు`)}</div>` : '';
  return header('trophy', tr('Leaderboard', 'లీడర్‌బోర్డ్'), sub) + online + tabs + body;
}
function renderShop() {
  const rows = GEM_SHOP.map(g => {
    const c = gemCost(g);
    const [name, desc] = isTe() ? [g.t[2], g.t[3]] : [g.t[0], g.t[1]];
    let extra = '';
    if (g.id === 'golden') extra = ` <span class="badge">${S.gemGolden}/3</span>`;
    if (g.id === 'offline') extra = ` <span class="badge">${tr('now', 'ఇప్పుడు')} ${fmtDur(OFFLINE_CAPS[S.offlineLvl])}</span>`;
    if (g.id.startsWith('warp')) extra = ` <span class="badge">≈ ${money(bonusCash(g.id === 'warp1' ? 3600 : 86400))}</span>`;
    return rowHtml(g.icon, name + extra, desc,
      c == null ? `<span class="badge">${tr('✔ Maxed', '✔ పూర్తి')}</span>` : `<button class="btn blue" data-act="gem" data-id="${g.id}" data-gems="${c}">💎 ${c}</button>`);
  }).join('');
  return header('gem', tr('Gem Shop', 'జెమ్ షాప్'),
    tr(`Earn gems from awards, missions, daily rewards and the Lucky Spin. You have <b>${fmtInt(S.gems)}</b> 💎.`, `అవార్డులు, మిషన్లు, డైలీ రివార్డులు, లక్కీ స్పిన్ నుంచి జెమ్స్ పొందండి. మీ దగ్గర <b>${fmtInt(S.gems)}</b> 💎 ఉన్నాయి.`)) +
    rowHtml('wheel', tr('Lucky Spin', 'లక్కీ స్పిన్'), tr(`Free spin every 4 hours, or spin any time for 💎${SPIN_GEM_COST}.`, `ప్రతి 4 గంటలకు ఫ్రీ స్పిన్, లేదా ఎప్పుడైనా 💎${SPIN_GEM_COST} తో.`),
      `<button class="btn gold" data-act="spin">${tr('Open wheel', 'వీల్ తెరవండి')}</button>`, 'spin-row') +
    `<div class="list">${rows}</div>`;
}
function renderAwards() {
  const got = ACHIEVEMENTS.filter(a => S.achievements[a.id]).length;
  const cells = ACHIEVEMENTS.map(a => `<div class="award ${S.achievements[a.id] ? '' : 'locked'}">${ico(a.icon)}
    <div><div class="title">${a.name()}</div><div class="desc">${a.desc()} · 💎${a.gems}</div></div></div>`).join('');
  return header('medal', tr('Awards', 'అవార్డులు'), tr(`Unlocked ${got} / ${ACHIEVEMENTS.length}. Each award grants gems.`, `${got} / ${ACHIEVEMENTS.length} పొందారు. ప్రతి అవార్డుకు జెమ్స్ వస్తాయి.`)) +
    `<div class="grid-awards">${cells}</div>`;
}
function renderStats() {
  const owned = S.biz.reduce((a, b) => a + b.owned, 0);
  const rows = [
    [tr('World', 'ప్రపంచం'), `${nm(WORLD)} (x${WORLD.mult})`],
    [tr('Cash', 'క్యాష్'), money(S.cash)],
    [tr('Income (managed)', 'ఆదాయం (మేనేజర్లు)'), money(incomePerSec()) + tr(' /s', ' /సె')],
    [tr('Total profit multiplier', 'మొత్తం లాభం గుణకం'), 'x' + fmt(globalMult())],
    [tr('Earned this run', 'ఈ రన్‌లో సంపాదన'), money(S.runEarnings)],
    [tr('Best run', 'ఉత్తమ రన్'), money(Math.max(S.stats.bestRun, S.runEarnings))],
    [tr('Lifetime earnings', 'మొత్తం సంపాదన'), money(S.lifetime)],
    [tr('Businesses owned (this world)', 'వ్యాపారాలు (ఈ ప్రపంచం)'), fmtInt(owned)],
    [tr('Managers hired (this world)', 'మేనేజర్లు (ఈ ప్రపంచం)'), S.biz.filter(b => b.manager).length + ' / ' + BUSINESSES.length],
    [tr('Worlds unlocked', 'అన్‌లాక్ అయిన ప్రపంచాలు'), Object.keys(S.worldsUnlocked).length + ' / ' + WORLDS.length],
    [tr('Upgrades bought (all time)', 'కొన్న అప్‌గ్రేడ్‌లు'), fmtInt(S.stats.upgradesBought)],
    [tr('Restarts', 'రీస్టార్ట్‌లు'), fmtInt(S.stats.prestiges)],
    [tr('Lucky spins', 'లక్కీ స్పిన్‌లు'), fmtInt(S.stats.spins || 0)],
    [tr('Golden briefcases opened', 'తెరిచిన బ్రీఫ్‌కేసులు'), fmtInt(S.stats.briefcases)],
    [tr('Manual runs', 'చేతితో నడిపినవి'), fmtInt(S.stats.clicks)],
    [tr('Awards', 'అవార్డులు'), Object.keys(S.achievements).length + ' / ' + ACHIEVEMENTS.length],
    [tr('Play time', 'ఆడిన సమయం'), fmtDur(S.stats.playTime)],
  ];
  return header('bars', tr('Stats', 'గణాంకాలు'), tr('Your empire at a glance.', 'మీ సామ్రాజ్యం ఒక్క చూపులో.')) +
    `<table class="stats-table">${rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table>
    <div class="toolbar share-bar"><span></span><button class="btn gold" data-act="share">${ico('letter')} ${tr('Share my empire', 'నా సామ్రాజ్యం షేర్ చేయి')}</button></div>`;
}
function notifyRowHtml() {
  const st = notifyStatus();
  const desc = { on: tr('On — reminders for spins, rewards, pets and the tournament.', 'ఆన్ — స్పిన్, రివార్డ్స్, పెట్స్, టోర్నమెంట్ రిమైండర్లు.'),
    off: tr('Get a phone reminder when your free spin or daily reward is ready.', 'ఫ్రీ స్పిన్ లేదా డైలీ రివార్డ్ రెడీ అయినప్పుడు ఫోన్‌కు రిమైండర్.'),
    blocked: tr('Blocked in browser settings.', 'బ్రౌజర్ సెట్టింగ్స్‌లో బ్లాక్ అయింది.'),
    unsupported: isIOS() ? tr('On iPhone, install the game to the Home Screen first.', 'iPhone లో ముందు గేమ్‌ను హోమ్ స్క్రీన్‌కు ఇన్‌స్టాల్ చేయండి.') : tr('Not available in this browser.', 'ఈ బ్రౌజర్‌లో అందుబాటులో లేదు.') }[st];
  const btn = st === 'on' ? `<button class="btn ghost" data-act="notify-off">${tr('On', 'ఆన్')}</button>`
    : st === 'off' ? `<button class="btn gold" data-act="notify-on">${tr('Turn on', 'ఆన్ చేయి')}</button>`
    : `<button class="btn ghost" data-act="notify-help">${tr('How?', 'ఎలా?')}</button>`;
  return rowHtml('bell', tr('Notifications', 'నోటిఫికేషన్లు'), desc, btn, 'setting');
}
function renderSettings() {
  const cloudOn = !!S.cloud.code;
  const lastSync = S.cloud.lastSync ? new Date(S.cloud.lastSync).toLocaleString() : tr('never', 'ఇంకా లేదు');
  const cloudBox = cloudOn
    ? `<div class="cloud-box">
        <div class="cloud-head">${ico('cloud')}<div><div class="title">${tr('Cloud Save is ON', 'క్లౌడ్ సేవ్ ఆన్‌లో ఉంది')}</div>
          <div class="desc">${tr('Auto-saves every 2 minutes. Last save', 'ప్రతి 2 నిమిషాలకు ఆటో సేవ్. చివరి సేవ్')}: ${esc(lastSync)}</div></div></div>
        <div class="code-label">${tr('Your cloud code — keep it secret, use it on your other devices:', 'మీ క్లౌడ్ కోడ్ — ఎవరికీ చెప్పకండి, మీ మరో డివైస్‌లో వాడండి:')}</div>
        <div class="code-show">${fmtCode(S.cloud.code)}</div>
        <div class="btn-pair wrap">
          <button class="btn" data-act="cloud-save">${tr('Save now', 'ఇప్పుడు సేవ్')}</button>
          <button class="btn ghost" data-act="cloud-copy">${tr('Copy code', 'కోడ్ కాపీ')}</button>
          <button class="btn blue" data-act="cloud-load">${tr('Load from another device', 'మరో డివైస్ నుంచి లోడ్')}</button>
        </div></div>`
    : `<div class="cloud-box">
        <div class="cloud-head">${ico('cloud')}<div><div class="title">${tr('Cloud Save', 'క్లౌడ్ సేవ్')}</div>
          <div class="desc">${tr('Save your progress online and continue on any phone or computer.', 'మీ ప్రోగ్రెస్ ఆన్‌లైన్‌లో సేవ్ చేసి, ఏ ఫోన్/కంప్యూటర్‌లోనైనా కొనసాగించండి.')}</div></div></div>
        <div class="btn-pair wrap">
          <button class="btn gold" data-act="cloud-save">${tr('Turn on Cloud Save', 'క్లౌడ్ సేవ్ ఆన్ చేయండి')}</button>
          <button class="btn blue" data-act="cloud-load">${tr('I have a code', 'నా దగ్గర కోడ్ ఉంది')}</button>
        </div></div>`;
  return header('gear', tr('Settings', 'సెట్టింగ్‌లు'), `${tr('Progress saves automatically in this browser.', 'ప్రోగ్రెస్ ఈ బ్రౌజర్‌లో ఆటోమేటిక్‌గా సేవ్ అవుతుంది.')} · ${tr('Version', 'వెర్షన్')} ${GAME_VERSION}`) +
    `<div class="list">
      ${rowHtml('speech', tr('Language', 'భాష'), tr('Play in English or Telugu.', 'ఇంగ్లీష్ లేదా తెలుగులో ఆడండి.'),
        `<div class="seg-toggle"><button class="${isTe() ? '' : 'on'}" data-act="lang" data-id="en">English</button><button class="${isTe() ? 'on' : ''}" data-act="lang" data-id="te">తెలుగు</button></div>`, 'setting')}
      ${notifyRowHtml()}
      ${rowHtml('bolt', tr('Battery saver', 'బ్యాటరీ సేవర్'), tr('Fewer animations and effects. Saves battery on phones.', 'తక్కువ యానిమేషన్లు. ఫోన్ బ్యాటరీ ఆదా అవుతుంది.'), `<button class="btn ${S.settings.lowfx ? 'gold' : 'ghost'}" data-act="lowfx">${S.settings.lowfx ? tr('On', 'ఆన్') : tr('Off', 'ఆఫ్')}</button>`, 'setting')}
      ${rowHtml('notes', tr('Music', 'మ్యూజిక్'), tr('A different tune on every world.', 'ప్రతి ప్రపంచానికి వేరే పాట.'), `<button class="btn ghost" data-act="music">${S.settings.music ? tr('On', 'ఆన్') : tr('Off', 'ఆఫ్')}</button>`, 'setting')}
      ${rowHtml('grad', tr('Tutorial', 'ట్యుటోరియల్'), tr('Show the step-by-step guide again.', 'స్టెప్-బై-స్టెప్ గైడ్ మళ్ళీ చూపించు.'), `<button class="btn ghost" data-act="tut-replay">${tr('Replay', 'మళ్ళీ చూడు')}</button>`, 'setting')}
      ${cloudBox}
      ${rowHtml('letter', tr('Share the game', 'గేమ్ షేర్ చేయండి'), tr('Invite friends on WhatsApp and more.', 'WhatsApp లో స్నేహితులను ఆహ్వానించండి.'), `<button class="btn gold" data-act="share">${tr('Share', 'షేర్')}</button>`, 'setting')}
      ${rowHtml('phone', tr('Install as app', 'యాప్‌గా ఇన్‌స్టాల్'), tr('Add Business Empire to your phone or PC home screen. Works offline.', 'ఫోన్/PC హోమ్ స్క్రీన్‌కు యాడ్ చేయండి. ఆఫ్‌లైన్‌లో కూడా పనిచేస్తుంది.'), `<button class="btn gold" data-act="install">${tr('Install', 'ఇన్‌స్టాల్')}</button>`, 'setting')}
      ${rowHtml('speaker', tr('Sound effects', 'సౌండ్'), '', `<button class="btn ghost" data-act="sound">${S.settings.sound ? tr('On', 'ఆన్') : tr('Off', 'ఆఫ్')}</button>`, 'setting')}
      ${rowHtml('numbers', tr('Number format', 'సంఖ్యల రూపం'), S.settings.notation === 'sci' ? tr('Scientific (1.23e15)', 'సైంటిఫిక్ (1.23e15)') : tr('Suffixes (1.23 Qa)', 'సఫిక్స్ (1.23 Qa)'), `<button class="btn ghost" data-act="notation">${tr('Switch', 'మార్చు')}</button>`, 'setting')}
      ${rowHtml('disk', tr('Save now', 'ఇప్పుడు సేవ్'), '', `<button class="btn ghost" data-act="save">${tr('Save', 'సేవ్')}</button>`, 'setting')}
      ${rowHtml('refresh', tr('Export / Import save', 'సేవ్ ఎక్స్‌పోర్ట్ / ఇంపోర్ట్'), tr('Move your progress with a long text code.', 'పొడవాటి టెక్స్ట్ కోడ్‌తో ప్రోగ్రెస్ తరలించండి.'),
        `<div class="btn-pair"><button class="btn ghost" data-act="export">${tr('Export', 'ఎక్స్‌పోర్ట్')}</button><button class="btn ghost" data-act="import">${tr('Import', 'ఇంపోర్ట్')}</button></div>`, 'setting')}
      ${rowHtml('shield', tr('Privacy policy', 'గోప్యతా విధానం'), tr('What the game stores and why.', 'గేమ్ ఏమి సేవ్ చేస్తుంది, ఎందుకు.'), `<a class="btn ghost" href="privacy.html" target="_blank" rel="noopener">${tr('Open', 'తెరువు')}</a>`, 'setting')}
      ${rowHtml('trash', tr('Hard reset', 'పూర్తి రీసెట్'), tr('Wipes ALL progress including investors, worlds and gems.', 'ఇన్వెస్టర్లు, ప్రపంచాలు, జెమ్స్‌తో సహా అంతా తొలగిస్తుంది.'), `<button class="btn red" data-act="reset">${tr('Reset', 'రీసెట్')}</button>`, 'setting')}
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
  $('dot-scratch').classList.toggle('on', scratchFreeReady());
  slotRegen(); $('dot-slots').classList.toggle('on', S.slot.energy >= SLOT_MAX || giftReady() || calReady() || S.raid.tokens > 0 || helpLeft());
  $('dot-album').classList.toggle('on', S.album.packs.basic + S.album.packs.gold > 0);
  $('dot-build').classList.toggle('on', !allBuilt() && S.slot.coins >= stageCost(S.build.done, S.build.stage));
  const hasPets = Object.keys(S.pets.owned).length > 0;
  $('dot-pets').classList.toggle('on', hasPets ? (petsHungry() && petFeedReady()) : PETS.some(p => p.cost.cash ? S.cash >= p.cost.cash : false));
}

/* ---------------------------- UI: HEADER / BOOSTS ------------------- */
function updateHeader() {
  $('cash').textContent = money(S.cash);
  $('ips').textContent = money(incomePerSec()) + tr(' / sec', ' / సెకను');
  $('investors').textContent = fmtInt(S.investors);
  $('investorBonus').textContent = '+' + fmt(S.investors * investorRate() * 100) + '%';
  $('gems').textContent = fmtInt(S.gems);

  const hb = $('hypeBtn');
  hb.classList.toggle('cooldown', S.boosts.hypeCd > 0);
  setHTML(hb, ico('megaphone') + (S.boosts.hypeCd > 0 ? ` ${tr('Hype', 'హైప్')} <small>${fmtClock(S.boosts.hypeCd)}</small>` : ` ${tr('Hype!', 'హైప్!')} <small>x2 · 2${tr('m', 'ని')}</small>`));

  const chips = [];
  if (S.boosts.hype > 0) chips.push(`<span class="chip pink">📣 x2 · ${fmtClock(S.boosts.hype)}</span>`);
  if (S.boosts.rush > 0) chips.push(`<span class="chip blue">⚡ x2 · ${fmtClock(S.boosts.rush)}</span>`);
  if (S.boosts.golden > 0) chips.push(`<span class="chip gold">✨ x5 · ${fmtClock(S.boosts.golden)}</span>`);
  if (marketEvent) chips.push(`<span class="chip hot">📈 ${emo(BUSINESSES[marketEvent.biz].icon)} x3 · ${fmtClock(marketEvent.remaining)}</span>`);
  const fest = activeFestival();
  if (fest) chips.push(`<button class="chip fest" data-act="festival">${ico(fest.fest.icon)} ${tr(...fest.fest.name)} x2</button>`);
  chips.push(`<span class="chip total">${tr('Total', 'మొత్తం')} x${fmt(globalMult())}</span>`);
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
// Queued modals are built when shown, so they use the language chosen meanwhile
const modalQueue = [];
function queueModal(fn) { if ($('modal').classList.contains('hidden')) modal(fn()); else modalQueue.push(fn); }
function closeModal() {
  $('modal').classList.add('hidden');
  if (modalQueue.length) modal(modalQueue.shift()());
}
let headlineIdx = 0;
function setHeadline(txt) {
  const el = $('tickerText');
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  el.textContent = txt;
}
function rotateHeadline() {
  if (Math.random() < 0.3) setHeadline(tr(`Analysts value your ${WORLD.name} empire's income at ${money(incomePerSec())} per second.`, `మీ ${WORLD.te} సామ్రాజ్య ఆదాయం సెకనుకు ${money(incomePerSec())} అని నిపుణుల అంచనా.`));
  else setHeadline(tr(...HEADLINES[headlineIdx++ % HEADLINES.length]));
}
function welcomeHtml() {
  return `${ico('city', 'big-ico')}<h3>${tr('Welcome to Business Empire!', 'Business Empire కు స్వాగతం!')}</h3>
    <div class="seg-toggle big"><button class="${isTe() ? '' : 'on'}" data-act="lang" data-id="en">English</button><button class="${isTe() ? 'on' : ''}" data-act="lang" data-id="te">తెలుగు</button></div>
    <p>${tr('Tap your <b>Tea Stall</b> to earn cash. Buy more businesses, hire <b>managers</b>, grab <b>upgrades</b>, spin the <b>Lucky Wheel</b>, travel to the <b>Moon and Mars</b>, and climb the <b>leaderboard</b>!',
      'మీ <b>టీ స్టాల్</b> ట్యాప్ చేసి క్యాష్ సంపాదించండి. ఇంకా వ్యాపారాలు కొనండి, <b>మేనేజర్లను</b> నియమించండి, <b>అప్‌గ్రేడ్‌లు</b> కొనండి, <b>లక్కీ వీల్</b> తిప్పండి, <b>చంద్రుడు, అంగారకుడికి</b> వెళ్ళండి, <b>లీడర్‌బోర్డ్‌లో</b> టాప్‌కి చేరండి!')}</p>
    <div class="modal-actions"><button class="btn gold" data-act="close">${tr("Let's build!", 'మొదలుపెడదాం!')}</button></div>`;
}
function setLang(lang) {
  S.settings.lang = lang === 'te' ? 'te' : 'en';
  applyStaticText();
  applyWorld(S.world);
  buildBizCards();
  renderTab();
  updateHeader();
  rotateHeadline();
  // Re-draw the welcome screen if it is the open modal
  if (!$('modal').classList.contains('hidden') && $('modalBody').querySelector('.seg-toggle.big')) modal(welcomeHtml());
  save();
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
    case 'lb-refresh': lbFetch(S.lifetime > lbLastScore); tourFetch(tourScore() > tourLastScore); renderTab(); break;
    case 'lb-view': lbView = id === 'all' ? 'all' : 'week'; renderTab(); break;
    case 'lb-rename': S.player.name = ''; renderTab(); break;
    case 'mclaim': claimMission(id); renderTab(); break;
    case 'mskip': skipMission(id); renderTab(); break;
    case 'lang': setLang(id); break;
    case 'music': toggleMusic(); break;
    case 'lowfx': S.settings.lowfx = !S.settings.lowfx; applyLowFx(); renderTab(); save(); break;
    case 'notify-on': closeModal(); enableNotifications(); break;
    case 'notify-off': disableNotifications(); break;
    case 'notify-help': modal(notifyHelpHtml()); break;
    case 'notify-later': closeModal(); save(); break;
    case 'scratch': openScratch(); break;
    case 'slot-spin': slotSpin(); break;
    case 'slot-bet': slotSetBet(); break;
    case 'slot-auto': slotAuto = !slotAuto; el.classList.toggle('on', slotAuto); if (slotAuto && !slotBusy) slotSpin(); break;
    case 'piggy-break': breakPiggy(); break;
    case 'gift-claim': claimGift(); break;
    case 'raid-open': openRaid(); break;
    case 'raid-go': raidGo(+id); break;
    case 'help-open': openHelp(); break;
    case 'help-go': helpGo(+id); break;
    case 'pack-open': openPack(id); break;
    case 'pack-buy': buyPack(id); break;
    case 'star-trade': tradeStars(); break;
    case 'cal-claim': claimCalendar(); break;
    case 'build-part': buildPart(); break;
    case 'build-view': S.build.view = +id >= 0 ? +id : null; renderTab(); break;
    case 'ad': watchAd(); break;
    case 'ad-go': { const f = pendingShowAd; pendingShowAd = null; closeModal(); if (f) f(); break; }
    case 'scratch-buy': buyScratch(); break;
    case 'scratch-reveal': revealScratch(); break;
    case 'stock-buy': buyStock(+el.dataset.k, +el.dataset.f); renderTab(); break;
    case 'stock-sell': sellStock(+el.dataset.k); renderTab(); break;
    case 'pet-buy': buyPet(id); renderTab(); break;
    case 'pet-lvl': levelPet(id); renderTab(); break;
    case 'pet-feed': feedPets(); renderTab(); break;
    case 'festival': if (activeFestival()) modal(festivalHtml()); break;
    case 'fest-claim': claimFestival(); closeModal(); break;
    case 'tut-skip': case 'tut-next': endTutorial(); break;
    case 'tut-replay': S.tutorial = { step: 0, done: false }; switchTab('business'); toast(tr('📖 Tutorial restarted!', '📖 ట్యుటోరియల్ మళ్ళీ మొదలైంది!'), 'good'); break;
    case 'share': shareGame(); break;
    case 'share-done': shareDone(); closeModal(); break;
    case 'share-copy': copyText(challengeUrl()); shareDone(); break;
    case 'chal-accept': acceptChallenge(); closeModal(); if (activeTab === 'missions') renderTab(); break;
    case 'cloud-save': cloudSave(true); break;
    case 'cloud-copy': copyText(fmtCode(S.cloud.code)); break;
    case 'cloud-load': cloudLoadAsk(); break;
    case 'cloud-fetch': cloudFetch(); break;
    case 'cloud-apply': cloudApply(); break;
    case 'install':
      if (installPrompt) {
        installPrompt.prompt();
        installPrompt.userChoice.finally(() => { installPrompt = null; $('installBtn').classList.add('hidden'); });
      } else {
        modal(`${ico('phone', 'big-ico')}<h3>${tr('Install as an app', 'యాప్‌గా ఇన్‌స్టాల్ చేయండి')}</h3>
          <p>${tr('<b>Android (Chrome):</b> tap ⋮ menu → <b>Install app</b> / <b>Add to Home screen</b>.<br><b>iPhone (Safari):</b> tap Share ⬆️ → <b>Add to Home Screen</b>.<br><b>PC (Chrome / Edge):</b> click the install icon in the address bar.',
            '<b>Android (Chrome):</b> ⋮ మెనూ → <b>Install app</b> / <b>Add to Home screen</b>.<br><b>iPhone (Safari):</b> Share ⬆️ → <b>Add to Home Screen</b>.<br><b>PC (Chrome / Edge):</b> అడ్రస్ బార్‌లో install ఐకాన్ నొక్కండి.')}</p>
          <div class="modal-actions"><button class="btn gold" data-act="close">${tr('Got it', 'సరే')}</button></div>`);
      }
      break;
    case 'briefcase': openBriefcase(); break;
    case 'close': if (!spinning) closeModal(); break;
    case 'offline-ok': closeModal(); break;
    case 'offline-x2':
      if (S.gems >= 5 && pendingOffline > 0) { S.gems -= 5; earn(pendingOffline); toast(tr(`🌙 Doubled! +${money(pendingOffline)}`, `🌙 రెట్టింపు! +${money(pendingOffline)}`), 'gem'); sfx('big'); coinShower(16); }
      pendingOffline = 0; closeModal(); break;
    case 'sound': S.settings.sound = !S.settings.sound; renderTab(); break;
    case 'notation': S.settings.notation = S.settings.notation === 'sci' ? 'suffix' : 'sci'; renderTab(); updateBizText(); break;
    case 'save': save(); toast(tr('💾 Game saved.', '💾 గేమ్ సేవ్ అయింది.'), 'good'); break;
    case 'export': {
      save();
      const code = btoa(unescape(encodeURIComponent(JSON.stringify(S))));
      modal(`<h3>${tr('Export Save', 'సేవ్ ఎక్స్‌పోర్ట్')}</h3><p>${tr('Copy this code and keep it safe.', 'ఈ కోడ్ కాపీ చేసి జాగ్రత్తగా ఉంచండి.')}</p><textarea readonly id="exportBox">${code}</textarea>
        <div class="modal-actions"><button class="btn" data-act="copy">${tr('Copy', 'కాపీ')}</button><button class="btn ghost" data-act="close">${tr('Close', 'మూసివేయి')}</button></div>`);
      break;
    }
    case 'copy': copyText($('exportBox').value); break;
    case 'import':
      modal(`<h3>${tr('Import Save', 'సేవ్ ఇంపోర్ట్')}</h3><p>${tr('Paste a save code. This replaces your current progress.', 'సేవ్ కోడ్ పేస్ట్ చేయండి. ఇది ప్రస్తుత ప్రోగ్రెస్‌ను మార్చేస్తుంది.')}</p><textarea id="importBox"></textarea>
        <div class="modal-actions"><button class="btn ghost" data-act="close">${tr('Cancel', 'రద్దు')}</button><button class="btn" data-act="import-ok">${tr('Import', 'ఇంపోర్ట్')}</button></div>`);
      break;
    case 'import-ok':
      try {
        S = mergeState(JSON.parse(decodeURIComponent(escape(atob($('importBox').value.trim())))));
        afterStateReplaced();
        toast(tr('📥 Save imported!', '📥 సేవ్ ఇంపోర్ట్ అయింది!'), 'good');
      } catch (err) { toast(tr('That save code is not valid.', 'ఆ సేవ్ కోడ్ సరైనది కాదు.'), 'bad'); }
      break;
    case 'reset':
      modal(`${ico('trash', 'big-ico')}<h3>${tr('Erase everything?', 'అంతా తొలగించాలా?')}</h3><p>${tr('This permanently deletes all progress, worlds, investors, gems and awards.', 'ఇది ప్రోగ్రెస్, ప్రపంచాలు, ఇన్వెస్టర్లు, జెమ్స్, అవార్డులు అన్నీ శాశ్వతంగా తొలగిస్తుంది.')}</p>
        <div class="modal-actions"><button class="btn ghost" data-act="close">${tr('Cancel', 'రద్దు')}</button><button class="btn red" data-act="reset-ok">${tr('Erase', 'తొలగించు')}</button></div>`);
      break;
    case 'reset-ok': {
      const lang = S.settings.lang;
      S = defaultState(); S.settings.lang = lang; marketEvent = null;
      afterStateReplaced();
      toast(tr('Fresh start!', 'కొత్త ప్రారంభం!'), 'good');
      break;
    }
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !spinning) closeModal();
  if (e.key === 'Enter' && e.target.id === 'lbName') joinLeaderboard();
  if (e.key === 'Enter' && e.target.id === 'cloudCodeIn') cloudFetch();
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
  requestAnimationFrame(frame);
  if (now - last < (fxOff() ? 64 : 31)) return; // ~30 fps, ~15 fps in battery saver
  let dt = Math.min((now - last) / 1000, 86400);
  last = now;
  // Back from a long time in the background: pay it like offline time (same cap) instead of one giant tick
  if (dt > 60) { resumeAfterAway(dt); dt = 0.05; }
  tick(dt);
  updateBizBars();
  Stars.draw(Math.min(dt, 0.05));
  festivalFloaters(Math.min(dt, 1));
  textAcc += dt; slowAcc += dt; saveAcc += dt; newsAcc += dt;
  if (textAcc >= 0.1) { textAcc = 0; updateHeader(); if (activeTab === 'business') updateBizText(); updateTutorial(); }
  if (slowAcc >= 0.5) {
    slowAcc = 0;
    refreshAffordability();
    updateDots();
    checkAchievements();
    checkMissions();
    checkChallenge();
    if (activeTab === 'stats') renderTab();
    if (activeTab === 'pets') updatePetTimer();
    updateSlotLive();
    if (activeTab === 'slots') raidSync(false);
    if (activeTab === 'stocks' && Math.floor(Date.now() / 60000) !== stockShownMinute) renderTab();
    if (activeTab === 'missions') updateMissionProgress();
    checkTourWeek();
    if (activeTab === 'leaderboard') updateTourLive();
    const tourWait = tourState === 'offline' ? 300000 : 60000;
    if (S.player.name && Date.now() - tourLastSent > tourWait && tourScore() > tourLastScore) tourFetch(true);
    const lbWait = lbState === 'offline' ? 300000 : 60000;
    if (S.player.name && Date.now() - lbLastSent > lbWait && S.lifetime > lbLastScore) lbFetch(true);
    if (S.cloud.code && Date.now() - cloudLastAuto > 120000) cloudSave(false);
    pushSync(false);
  }
  if (newsAcc >= 14) { newsAcc = 0; rotateHeadline(); }
  if (saveAcc >= 10) { saveAcc = 0; save(); }
}

/* ---------------------------- BOOT ---------------------------------- */
function offlineHtml(away, counted, amt) {
  const cap = away > counted ? tr(` (capped at ${fmtDur(counted)})`, ` (పరిమితి ${fmtDur(counted)})`) : '';
  return `${ico('crescent', 'big-ico')}<h3>${tr('Welcome back, boss!', 'మళ్ళీ స్వాగతం, బాస్!')}</h3>
    <p>${tr(`You were away for <b>${fmtDur(away)}</b>${cap}.<br>Your ${WORLD.name} managers earned`, `మీరు <b>${fmtDur(away)}</b>${cap} దూరంగా ఉన్నారు.<br>మీ ${WORLD.te} మేనేజర్లు సంపాదించింది`)}</p>
    <div class="stat-big">${money(amt)}</div>
    <div class="modal-actions"><button class="btn" data-act="offline-ok">${tr('Collect', 'తీసుకోండి')}</button>
    <button class="btn blue ${S.gems < 5 ? 'cant' : ''}" data-act="offline-x2">${tr('Double it', 'రెట్టింపు')} · 💎5</button></div>`;
}
function resumeAfterAway(away) {
  const B = S.boosts;
  for (const k of ['hype', 'hypeCd', 'rush', 'golden']) B[k] = Math.max(0, B[k] - away);
  marketEvent = null;
  const counted = Math.min(away, OFFLINE_CAPS[S.offlineLvl]);
  const amt = incomePerSec(true, false) * counted * petBonus('offline');
  if (amt <= 0) return;
  earn(amt);
  pendingOffline = amt;
  queueModal(() => offlineHtml(away, counted, amt));
}
function offlineEarnings() {
  const away = (Date.now() - S.lastSave) / 1000;
  if (away < 30) return;
  const counted = Math.min(away, OFFLINE_CAPS[S.offlineLvl]);
  const amt = incomePerSec(true, false) * counted * petBonus('offline');
  if (amt <= 0) return;
  earn(amt);
  pendingOffline = amt;
  modal(offlineHtml(away, counted, amt));
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
  toast(tr('📲 Installed! Open Business Empire from your home screen.', '📲 ఇన్‌స్టాల్ అయింది! హోమ్ స్క్రీన్ నుంచి తెరవండి.'), 'good');
});
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => { /* offline support unavailable */ });
}

const hadSave = load();
hydrateIcons();
applyLowFx();
applyStaticText();
applyWorld(S.world);
ensureMissions();
ensurePlayerId();
buildBizCards();
initTilt();
updateHeader();
updateDots();
if (hadSave) offlineEarnings();
else modal(welcomeHtml());
if (canClaimDaily()) queueModal(dailyHtml);
{ const f = activeFestival(); if (f && !S.festivals[f.key]) queueModal(festivalHtml); }
checkTourWeek();
if (S.tour.pending) claimTourReward();
if (hadSave && S.lifetime > 1e4) maybeAskNotify();
pendingChallenge = readChallengeParam();
if (pendingChallenge && !(S.challenge && !S.challenge.won && S.challenge.score === pendingChallenge.score && S.challenge.name === pendingChallenge.name)) queueModal(challengeInviteHtml);
updateMusicBtn();
pingPlayers();
initAds();
// Browsers only allow sound after the player touches the page
document.addEventListener('pointerdown', () => Music.start(), { once: true });
window.addEventListener('beforeunload', save);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) { Music.start(); return; }
  Music.stop();
  save();
  pushSync(true);
  if (S.cloud.code && Date.now() - cloudLastAuto > 15000) cloudSave(false);
});
requestAnimationFrame(frame);

addEventListener('resize', () => { if (activeTab === 'build' && B3.T) mountBuildView(); });
