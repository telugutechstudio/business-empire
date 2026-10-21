'use strict';
/* =====================================================================
   BUSINESS EMPIRE — idle business game (English + తెలుగు)
   ===================================================================== */

const SAVE_KEY = 'tycoonEmpire.save.v1';
const GAME_VERSION = '5.0';
const BIZ_OFF = true; // businesses, managers, upgrades, investors, stocks and worlds are switched off
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
  ticket: ['Ticket', '🎫'], slot: ['Slot machine', '🎰'], mosque: ['Mosque', '🕌'], castle: ['Castle', '🏰'], htemple: ['Hindu temple', '🛕'], classical: ['Classical building', '🏛️'], construction: ['Building construction', '🏗️'], worldmap: ['World map', '🗺️'], island: ['Desert island', '🏝️'], cow: ['Cow', '🐄'], rooster: ['Rooster', '🐓'], sheaf: ['Sheaf of rice', '🌾'], ox: ['Ox', '🐂'], goat: ['Goat', '🐐'], coconut: ['Coconut', '🥥'], curry: ['Curry rice', '🍛'], ricebowl: ['Cooked rice', '🍚'], flatbread: ['Flatbread', '🫓'], pancakes: ['Pancakes', '🥞'], riceball: ['Rice ball', '🍙'], doughnut: ['Doughnut', '🍩'], custard: ['Custard', '🍮'], candy: ['Candy', '🍬'], pepper: ['Hot pepper', '🌶️'], firecracker: ['Firecracker', '🧨'], monkey: ['Monkey', '🐒'], parrot: ['Parrot', '🦜'], snake: ['Snake', '🐍'], deer: ['Deer', '🦌'], mountain: ['Snow-capped mountain', '🏔️'], beach: ['Beach with umbrella', '🏖️'], train: ['Locomotive', '🚂'], stadium: ['Stadium', '🏟️'], album: ['Notebook with decorative cover', '📔'], pack: ['Package', '📦'], battery: ['Battery', '🔋'], pig: ['Pig face', '🐷'], moneybag: ['Money bag', '💰'], hammer: ['Hammer', '🔨'], cherry: ['Cherries', '🍒'], chartdown: ['Chart decreasing', '📉'], tv: ['Television', '📺'], shield: ['Shield', '🛡️'], page: ['Page with curl', '📃'], church: ['Church', '⛪'], bridge: ['Bridge at night', '🌉'], sunrise: ['Sunrise', '🌅'], fountain: ['Fountain', '⛲'], lighttower: ['Tokyo tower', '🗼'], book: ['Open book', '📖'], question: ['Red question mark', '❓'], om: ['Om', '🕉️'], canoe: ['Canoe', '🛶'], camel: ['Camel', '🐫'], worship: ['Place of worship', '🛐'], khanda: ['Khanda', '🪯'],
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
  { id: 'energy30',  icon: 'battery',   cost: 10,            t: ['30 Energy', 'Instant energy for the Spin Game', '30 ఎనర్జీ', 'స్పిన్ గేమ్‌కి వెంటనే ఎనర్జీ'] },
  { id: 'energy100', icon: 'battery',   cost: 30,            t: ['100 Energy', 'A big energy refill', '100 ఎనర్జీ', 'పెద్ద ఎనర్జీ రీఫిల్'] },
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
    tutorial: { step: 0, done: false, v: 2 },
    bizOff: BIZ_OFF,
    festivals: {},
    challenge: null,
    pets: { owned: {}, fedAt: 0, active: '' },
    tour: { week: '', base: 0, posted: false, pending: '', rewarded: {} },
    stocks: {},
    scratch: { day: '', card: null },
    slot: { energy: 30, at: 0, bet: 1, coins: 0, piggy: 0, vip: 0, gift: { at: 0, chest: 0 }, cal: { last: '', streak: 0 }, boss: { lvl: 1, hp: 300 }, col: { week: '', n: 0, got: 0, item: 0 } },
    build: { done: 0, stage: 0, view: null },
    city: { i: 0, done: {}, view: null, migrated: false, quiz: {}, intro: -1, pv: 2 },
    album: { have: {}, packs: { basic: 2, gold: 0 }, stars: 0, sets: {} },
    league: { week: '', tier: 0, pts: 0, lastRank: 0 },
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
let activeTab = BIZ_OFF ? 'slots' : 'business';
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
  out.city = Object.assign({ i: 0, done: {}, view: null, migrated: !saved.build, quiz: {}, intro: -1, pv: saved.city ? 1 : 2 }, saved.city || {});
  out.slot = Object.assign({ energy: 30, at: 0, bet: 1, coins: 0, piggy: 0, vip: 0 }, saved.slot || {});
  out.league = Object.assign({ week: '', tier: 0, pts: 0, lastRank: 0 }, saved.league || {});
  out.slot.gift = Object.assign({ at: 0, chest: 0 }, out.slot.gift || {});
  out.slot.cal = Object.assign({ last: '', streak: 0 }, out.slot.cal || {});
  out.slot.boss = Object.assign({ lvl: 1, hp: 300 }, out.slot.boss || {});
  out.slot.col = Object.assign({ week: '', n: 0, got: 0, item: 0 }, out.slot.col || {});
  out.stocks = saved.stocks && typeof saved.stocks === 'object' ? saved.stocks : {};
  out.pets = Object.assign({ owned: {}, fedAt: 0, active: '' }, saved.pets || {});
  if (!out.pets.active) out.pets.active = Object.keys(out.pets.owned).sort((a, b) => out.pets.owned[b] - out.pets.owned[a])[0] || '';
  out.challenge = saved.challenge && typeof saved.challenge === 'object' ? saved.challenge : null;
  // Players from before the tutorial existed don't need it
  // Switching an old save over: business cash goes away, Spin Game coins become the cash
  if (BIZ_OFF && !saved.bizOff) { out.cash = Math.floor((saved.slot && saved.slot.coins) || 0); out.bizOff = true; }
  out.tutorial = BIZ_OFF ? (saved.tutorial && saved.tutorial.v === 2 ? Object.assign({ step: 0, done: false, v: 2 }, saved.tutorial) : { step: 0, done: false, v: 2 }) : saved.tutorial ? Object.assign({ step: 0, done: false }, saved.tutorial) : { step: 0, done: (+saved.lifetime || 0) > 5000 };
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
function fullNum(n) { return Math.floor(n).toLocaleString('en-IN'); }
function money(n) { return BIZ_OFF && Math.abs(n) < 1e18 ? (n < 0 ? '-' : '') + fullNum(Math.abs(n)) : fmt(n); }
function fmtInt(n) { return BIZ_OFF || n < 1e6 ? fullNum(n) : fmt(n); }
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
  if (BIZ_OFF) return coinMult();
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
  if (BIZ_OFF) return 0;
  let t = 0;
  S.biz.forEach((b, i) => { if (b.owned > 0 && (b.manager || !managedOnly)) t += cycleRevenue(i, temp) / cycleTime(i); });
  return t;
}
function earn(x) { S.cash += x; S.runEarnings += x; S.lifetime += x; }
// Prize multiplier now that there are no businesses: landmarks, album sets, pets, golden touch, festivals and rush
function coinMult() { return landmarkBonus() * albumBonus() * petBonus('profit') * Math.pow(2, S.gemGolden) * (activeFestival() ? 2 : 1) * (S.boosts.rush > 0 ? 2 : 1); }

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
function bonusCash(secs) { return BIZ_OFF ? Math.max(100, Math.round(secs * 1.5 * cityScale() * spinMult())) : Math.max(500, incomePerSec(false, false) * secs); }

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
  switchTab(BIZ_OFF ? 'slots' : 'business');
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
    case 'energy30': case 'energy100': { const n = id === 'energy30' ? 30 : 100; S.slot.energy += n; toast(tr(`⚡ +${n} energy!`, `⚡ +${n} ఎనర్జీ!`), 'gem'); break; }
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
  if (id === S.world) { switchTab(BIZ_OFF ? 'slots' : 'business'); return; }
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
  switchTab(BIZ_OFF ? 'slots' : 'business');
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
  if (BIZ_OFF) return; // the old awards were about businesses
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
    case 'slot': return (S.stats.slotSpins || 0) - m.base;
    case 'pack': return (S.stats.packs || 0) - m.base;
    case 'boss': return (S.stats.bosses || 0) - m.base;
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
    case 'earn': return { icon: 'coin', text: BIZ_OFF ? tr(`Win ${money(m.target)} coins`, `${money(m.target)} కాయిన్లు గెలవండి`) : tr(`Earn ${money(m.target)} cash`, `${money(m.target)} క్యాష్ సంపాదించండి`) };
    case 'click': return { icon: 'runner', text: tr(`Run businesses by hand ${m.target} times`, `వ్యాపారాలను ${m.target} సార్లు చేతితో నడపండి`) };
    case 'case': return { icon: 'briefcase', text: tr('Open a golden briefcase', 'ఒక బంగారు బ్రీఫ్‌కేస్ తెరవండి') };
    case 'upgrade': return { icon: 'up', text: tr(`Buy ${m.target} upgrades`, `${m.target} అప్‌గ్రేడ్‌లు కొనండి`) };
    case 'spin': return { icon: 'wheel', text: tr('Spin the Lucky Wheel', 'లక్కీ వీల్ తిప్పండి') };
    case 'slot': return { icon: 'slot', text: tr(`Spin the Spin Game ${m.target} times`, `స్పిన్ గేమ్ ${m.target} సార్లు తిప్పండి`) };
    case 'pack': return { icon: 'pack', text: tr('Open a sticker pack', 'ఒక స్టిక్కర్ ప్యాక్ తెరవండి') };
    case 'boss': return { icon: 'swords', text: tr('Beat a boss in the Spin Game', 'స్పిన్ గేమ్‌లో ఒక బాస్‌ని ఓడించండి') };
  }
  return { icon: 'clipboard', text: tr('Mission', 'మిషన్') };
}
function newMission() {
  if (BIZ_OFF) {
    const taken = new Set(S.missions.map(m => m.type));
    const opts = [
      { type: 'earn', target: niceNum(bonusCash(600)), base: S.lifetime },
      { type: 'slot', target: [10, 20, 30][Math.floor(Math.random() * 3)], base: S.stats.slotSpins || 0 },
      { type: 'pack', target: 1, base: S.stats.packs || 0 },
      { type: 'spin', target: 1, base: S.stats.spins || 0 },
      { type: 'boss', target: 1, base: S.stats.bosses || 0 },
    ];
    const fresh = opts.filter(o => !taken.has(o.type));
    const pick = (fresh.length ? fresh : opts)[Math.floor(Math.random() * (fresh.length || opts.length))];
    pick.gems = 2 + Math.floor(Math.random() * 3);
    pick.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    return pick;
  }
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
function ensureMissions() {
  if (BIZ_OFF) S.missions = S.missions.filter(m => ['earn', 'spin', 'slot', 'pack', 'boss'].includes(m.type)); while (S.missions.length < MISSION_SLOTS) S.missions.push(newMission()); }
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
  switchTab(BIZ_OFF ? 'slots' : 'business');
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
    spin: { bpm: 124, wave: 'square', echo: 0.2, clap: true,
      chords: [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]],
      lead: [72, _, 72, 74, 76, _, 74, 72, 71, _, 71, 72, 74, _, 79, _, 76, _, 76, 77, 79, _, 77, 76, 74, _, 72, _, 74, _, _, _] },
    build: { bpm: 96, wave: 'triangle', echo: 0.3,
      chords: [[60, 64, 67], [61, 65, 68], [60, 64, 67], [55, 59, 62]],
      lead: [72, _, 73, _, 76, _, 77, _, 79, _, _, 80, 79, _, 77, _, 76, _, 77, _, 76, _, 73, _, 72, _, _, _, 71, _, 72, _] },
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
  function clap(t) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noise; f.type = 'bandpass'; f.frequency.value = 1600;
    g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    s.connect(f).connect(g).connect(master); s.start(t); s.stop(t + 0.13);
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
    if (song !== SONGS.moon) { if (pos === 0 || pos === 4) kick(t); if (pos % 2 === 1) hat(t, 0.05); if (song.clap && (pos === 2 || pos === 6)) clap(t); }
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
const SLOT_MAX = 50, SLOT_REGEN = 6 * 60 * 1000, SLOT_BETS = [1, 2, 3, 4, 5, 10, 20, 30, 50, 100, 200, 400, 800], PIGGY_GEMS = 10;
const BET_NEED = 4; // a bet unlocks once you hold 4× its energy cost
function piggyCap() { return Math.round(40000 * cityScale() / 100) * 100; }
function availBets() { return SLOT_BETS.filter(b => b === 1 || S.slot.energy >= b * BET_NEED); }
function clampBet() { const a = availBets(); if (!a.includes(S.slot.bet)) S.slot.bet = a.filter(b => b <= S.slot.bet).pop() || 1; }
const PRIZE = { coin3: 8000, cherry3: 4000, bag3: 6000, coin2: 1000, cherry2: 600, bag2: 800, other2: 250, none: 150 };
function prizeUnit() { return cityScale() * spinMult(); }
function prizeOf(k, bet = 1) { return Math.round(PRIZE[k] * bet * prizeUnit() * (k.endsWith('3') ? 1 + petPower('jackpot') : 1) / 10) * 10; }
const SLOT_SYMS = [
  { k: 'coin', w: 30 }, { k: 'cherry', w: 22 }, { k: 'moneybag', w: 16 }, { k: 'bolt', w: 12 }, { k: 'pig', w: 8 }, { k: 'gem', w: 6 }, { k: 'swords', w: 14 }, { k: 'hammer', w: 9 }, { k: 'shield', w: 9 },
];
const SLOT_CELL = 88; // px height of one symbol on a reel
let slotBusy = false, slotAuto = false;
function slotRegen() {
  const sl = S.slot, now = Date.now();
  if (!sl.at) sl.at = now;
  if (sl.energy >= slotMax()) { sl.at = now; return; }
  const every = slotRegenMs(), n = Math.floor((now - sl.at) / every);
  if (n > 0) { sl.energy = Math.min(slotMax(), sl.energy + n); sl.at = sl.energy >= slotMax() ? now : sl.at + n * every; }
}
function slotRegenMs() { return SLOT_REGEN / (1 + petPower('regen')); }
function slotNextIn() { return S.slot.energy >= slotMax() ? 0 : Math.max(0, (S.slot.at + slotRegenMs() - Date.now()) / 1000); }
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
    if (top === 'coin') p.coins = prizeOf('coin3', bet);
    if (top === 'cherry') p.coins = prizeOf('cherry3', bet);
    if (top === 'moneybag') p.cash = prizeOf('bag3', bet);
    if (top === 'bolt') p.energy = 8 * bet;
    if (top === 'pig') p.piggy = true;
    if (top === 'gem') p.gems = 2 * bet;
  } else if (n === 2) {
    if (top === 'coin') p.coins = prizeOf('coin2', bet);
    if (top === 'cherry') p.coins = prizeOf('cherry2', bet);
    if (top === 'moneybag') p.cash = prizeOf('bag2', bet);
    if (top === 'bolt') p.energy = bet;
    if (top === 'pig' || top === 'gem') p.coins = prizeOf('other2', bet);
    if (top === 'swords') p.small = false;
    if (top === 'hammer' || top === 'shield') p.coins = prizeOf('other2', bet);
  } else p.coins = prizeOf('none', bet); // a little something every spin
  return p;
}
function slotPaytableHtml() {
  const rows = [
    ['coin', fmtInt(prizeOf('coin3')), fmtInt(prizeOf('coin2'))],
    ['cherry', fmtInt(prizeOf('cherry3')), fmtInt(prizeOf('cherry2'))],
    ['moneybag', fmtInt(prizeOf('bag3')), fmtInt(prizeOf('bag2'))],
    ['bolt', tr('+8 energy', '+8 ఎనర్జీ'), tr('energy back', 'ఎనర్జీ తిరిగి')],
    ['pig', tr('Piggy bank opens free!', 'పిగ్గీ బ్యాంక్ ఫ్రీగా తెరుచుకుంటుంది!'), fmtInt(prizeOf('other2'))],
    ['gem', tr('2 gems', '2 జెమ్స్'), fmtInt(prizeOf('other2'))],
    ['hammer', tr('Raid another village!', 'ఇంకో ఊరిపై దాడి!'), fmtInt(prizeOf('other2'))],
    ['shield', tr('+1 shield (max 3)', '+1 షీల్డ్ (3 వరకు)'), fmtInt(prizeOf('other2'))],
    ['swords', tr('Critical hit: 100 × bet damage', 'క్రిటికల్ హిట్: 100 × బెట్ దెబ్బ'), tr('Each ⚔️ hits the boss for 10 × bet', 'ప్రతి ⚔️ బాస్‌కి 10 × బెట్ దెబ్బ')],
  ];
  return `<div class="paytable"><div class="pt-head"><span>${tr('Symbol', 'గుర్తు')}</span><span>×3</span><span>×2</span></div>` +
    rows.map(([k, a, b]) => `<div class="pt-row"><span>${ico(k)}${ico(k)}${ico(k)}</span><span>${a}</span><span>${b}</span></div>`).join('') +
    `<p class="sub">${tr(`Coins for bet ×1 in ${CITIES[Math.min(S.city.i, CITIES.length - 1)].name[0]}. Every prize is multiplied by your bet, and prizes grow in each new city. Any other spin pays ${fmtInt(prizeOf('none'))} × bet.`, `${CITIES[Math.min(S.city.i, CITIES.length - 1)].name[1]} లో బెట్ ×1 కి కాయిన్లు. ప్రతి బహుమతి బెట్‌తో గుణించబడుతుంది, కొత్త నగరంలో బహుమతులు పెరుగుతాయి. మిగతా స్పిన్‌కి ${fmtInt(prizeOf('none'))} × బెట్.`)}</p></div>`;
}
function reelHtml(k, i) {
  return `<div class="reel" id="reel${i}"><div class="strip" id="strip${i}">${[slotPick(), k, slotPick()].map(x => `<div class="sym">${ico(x)}</div>`).join('')}</div></div>`;
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
    <button class="btn ${ready ? 'gold' : 'ghost'} gc-btn" data-act="gift-claim" id="giftBtn" ${ready ? '' : 'disabled'}>${ready ? `${tr('Claim', 'తీసుకో')} +${giftEnergy()} ⚡` : fmtClock(giftIn())}</button>
  </div>`;
}
function calCardHtml() {
  const ready = calReady(), next = calDay(), done = ready ? next - 1 : S.slot.cal.streak % 7 || 7;
  const cells = CAL_ENERGY.map((_, k) => {
    const e = calEnergy(k + 1);
    const d = k + 1, cls = d <= done ? 'got' : ready && d === next ? 'today' : '';
    return `<div class="cal-cell ${cls}"><small>${tr('Day', 'రోజు')} ${d}</small><b>${e}⚡</b>${d === 7 ? `<em>+${CAL_GEMS_DAY7}💎</em>` : ''}${d <= done ? '<i>✓</i>' : ''}</div>`;
  }).join('');
  return `<div class="cal-card" id="calCard">
    <div class="gc-head">${ico('calendar')}<b>${tr('Spin calendar', 'స్పిన్ క్యాలెండర్')}</b><small>${tr('Come back every day for more energy', 'రోజూ వస్తే ఇంకా ఎక్కువ ఎనర్జీ')}</small></div>
    <div class="cal-row">${cells}</div>
    ${ready ? `<button class="btn gold" data-act="cal-claim">${tr(`Claim day ${next}`, `రోజు ${next} తీసుకో`)}: +${calEnergy(next)} ⚡</button>` : `<p class="sub">${tr('Claimed today. See you tomorrow!', 'ఈ రోజు తీసుకున్నారు. రేపు కలుద్దాం!')}</p>`}
  </div>`;
}
function claimGift() {
  if (!giftReady()) return;
  const g = S.slot.gift;
  g.at = Date.now() + GIFT_EVERY;
  const ge = giftEnergy();
  S.slot.energy += ge; g.chest++;
  let msg = tr(`🎁 +${ge} energy!`, `🎁 +${ge} ఎనర్జీ!`);
  if (g.chest >= CHEST_SIZE) {
    g.chest = 0;
    const coins = Math.round(5000 * cityScale() / 100) * 100, gems = 5;
    earn(coins); S.gems += gems; S.slot.energy += 10; giveAlbumPack('basic', 1, true);
    msg = tr(`🧰 Treasure chest! +${fmtInt(coins)} coins, +${gems} 💎, +10 ⚡, +1 📦`, `🧰 నిధి పెట్టె! +${fmtInt(coins)} కాయిన్లు, +${gems} 💎, +10 ⚡, +1 📦`);
    confetti($('giftCard'), 120); sfx('win');
  } else sfx('cash');
  toast(msg, 'good');
  save(); if (!$('modal').classList.contains('hidden')) closeModal(); renderTab();
}
function claimCalendar() {
  if (!calReady()) return;
  const C = S.slot.cal, d = calDay(), e = calEnergy(d);
  C.streak = d === 1 ? 1 : C.streak + 1; C.last = dayKey();
  S.slot.energy += e;
  let msg = tr(`🗓️ Day ${d}: +${e} energy!`, `🗓️ రోజు ${d}: +${e} ఎనర్జీ!`);
  if (d === 7) { S.gems += CAL_GEMS_DAY7; giveAlbumPack('gold', 1, true); msg += ` +${CAL_GEMS_DAY7} 💎 +1 📦`; confetti($('calCard'), 140); }
  sfx('win'); toast(msg, 'good');
  save(); if (!$('modal').classList.contains('hidden')) closeModal(); renderTab();
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
function bossReward(lvl) { return { coins: Math.round(4000 * lvl * cityScale() / 100) * 100, gems: 2 + Math.ceil(lvl / 2), energy: 8 }; }
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
  const b = S.slot.boss, dmg = Math.round((n === 3 ? 100 : 10 * n) * bet * (1 + petPower('boss')));
  if (petPower('boss')) setTimeout(() => petPop(`+${Math.round(petPower('boss') * 100)}% ⚔️`), 200);
  b.hp -= dmg;
  const foe = $('bossCard') ? $('bossFoe') : $('dmgLayer');
  if (foe) {
    setTimeout(() => { const rb = $('railBoss'); if (rb) restartAnim(rb, 'shake'); }, 60);
    if (foe.id === 'bossFoe') restartAnim(foe, 'shake');
    const f = document.createElement('span'); f.className = 'dmg-float'; f.textContent = `-${fmtInt(dmg)}`;
    foe.appendChild(f); setTimeout(() => f.remove(), 1100);
  }
  let msg = n === 3 ? tr(`⚔️ Critical hit! -${fmtInt(dmg)}`, `⚔️ క్రిటికల్ హిట్! -${fmtInt(dmg)}`) : `⚔️ -${fmtInt(dmg)}`;
  if (b.hp <= 0) {
    const B = bossOf(b.lvl), r = bossReward(b.lvl);
    earn(r.coins); S.gems += r.gems; S.slot.energy += r.energy;
    S.stats.bosses = (S.stats.bosses || 0) + 1;
    addLeague(50);
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
  { at: 100, energy: 10 }, { at: 300, coins: 8000 }, { at: 600, gems: 5 }, { at: 1000, energy: 15 }, { at: 1500, coins: 40000, gems: 10 },
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
    if (st.coins) earn(st.coins);
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
    const { inbox } = await raidPost({ action: 'sync', name: raidName(), coins: Math.floor(S.cash), shields: S.raid.shields, lm: landmarksDone() });
    S.raid.online = true;
    const news = [];
    for (const m of inbox || []) {
      if (m.type === 'raid') { S.cash = Math.max(0, S.cash - m.amt); raidLog(tr(`🔨 ${m.from} raided you: -${fmtInt(m.amt)} coins`, `🔨 ${m.from} దాడి చేశారు: -${fmtInt(m.amt)} కాయిన్లు`)); news.push('raid'); }
      if (m.type === 'blocked') { S.raid.shields = Math.max(0, S.raid.shields - 1); raidLog(tr(`🛡️ Your shield stopped ${m.from}`, `🛡️ మీ షీల్డ్ ${m.from} ని ఆపింది`)); news.push('blocked'); }
      if (m.type === 'help') { S.slot.energy += m.energy || 5; raidLog(tr(`🤝 ${m.from} helped you: +${m.energy || 5} ⚡`, `🤝 ${m.from} సాయం చేశారు: +${m.energy || 5} ⚡`)); news.push('help'); }
    }
    if (news.length) { toast(S.raid.log[0].text, news.includes('raid') ? 'bad' : 'good'); save(); if (activeTab === 'slots') renderTab(); }
  } catch (e) { S.raid.online = false; }
}
function botTargets() {
  const names = BOT_NAMES.slice().sort(() => Math.random() - 0.5).slice(0, 4);
  return names.map((n, k) => ({ id: 'bot-' + k, bot: true, name: tr(`${n}'s village`, `${n} గారి ఊరు`), lm: Math.max(0, landmarksDone() + Math.floor(rand(-1, 2))),
    coins: Math.floor(rand(20000, 60000) * cityScale()), shield: Math.random() < 0.25 }));
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
  if (!res.blocked) addLeague(20);
  let html;
  if (res.blocked) {
    const coins = Math.round(1500 * cityScale() / 100) * 100; earn(coins);
    raidLog(tr(`🛡️ ${t.name} blocked your raid (+${fmtInt(coins)} for trying)`, `🛡️ ${t.name} మీ దాడిని ఆపారు (ప్రయత్నానికి +${fmtInt(coins)})`));
    html = `${ico('shield', 'big-ico')}<h3>${tr('Blocked!', 'ఆపేశారు!')}</h3><p>${tr(`${esc(t.name)} had a shield. You still get ${fmtInt(coins)} coins for trying.`, `${esc(t.name)} దగ్గర షీల్డ్ ఉంది. ప్రయత్నానికి ${fmtInt(coins)} కాయిన్లు.`)}</p>`;
    sfx('err');
  } else {
    res.amt = Math.round(Math.min(res.amt, 9000 * cityScale()) * (1 + petPower('raid'))); // capped, then the pet's share on top
    earn(res.amt);
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
  S.raid.helpDay = dayKey(); earn(HELP_REWARD); giveAlbumPack('basic', 1, true);
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
    earn(5000); return tr('🛡️ Shields full: +5,000 coins', '🛡️ షీల్డ్‌లు నిండాయి: +5,000 కాయిన్లు');
  }
  return '';
}
let leagueOpen = false;
// ---- VIP levels: every energy you spin earns VIP points; higher levels give lasting perks ----
const VIP_TIERS = [
  { name: ['Ordinary I', 'సాధారణ I'], at: 0, max: 0, gift: 0, cal: 0 },
  { name: ['Ordinary II', 'సాధారణ II'], at: 300, max: 5, gift: 1, cal: 0.1 },
  { name: ['Silver', 'సిల్వర్'], at: 1500, max: 10, gift: 2, cal: 0.2 },
  { name: ['Gold', 'గోల్డ్'], at: 5000, max: 15, gift: 3, cal: 0.3 },
  { name: ['Platinum', 'ప్లాటినం'], at: 12000, max: 20, gift: 4, cal: 0.4 },
  { name: ['Diamond', 'డైమండ్'], at: 30000, max: 30, gift: 5, cal: 0.5 },
];
function vipLevel() { let k = 0; VIP_TIERS.forEach((t, i) => { if (S.slot.vip >= t.at) k = i; }); return k; }
function vipTier() { return VIP_TIERS[vipLevel()]; }
function slotMax() { return SLOT_MAX + vipTier().max; }
function giftEnergy() { return GIFT_ENERGY + vipTier().gift; }
function calEnergy(d) { return Math.round(CAL_ENERGY[d - 1] * (1 + vipTier().cal)); }
function addVip(n) {
  const before = vipLevel();
  S.slot.vip += n;
  const now = vipLevel();
  if (now > before) {
    const T = VIP_TIERS[now];
    setTimeout(() => { toast(tr(`👑 VIP up: ${T.name[0]}! Energy max +${T.max}, gifts +${T.gift}, calendar +${T.cal * 100}%`, `👑 VIP పెరిగింది: ${T.name[1]}! ఎనర్జీ మాక్స్ +${T.max}, గిఫ్ట్ +${T.gift}, క్యాలెండర్ +${T.cal * 100}%`), 'gem'); sfx('win'); }, 600);
    const redraw = () => { if (activeTab !== 'slots') return; if (slotBusy) setTimeout(redraw, 400); else renderTab(); };
    setTimeout(redraw, 700); // new energy cap and gift amounts show once the reels stop
  }
}
function vipCardHtml() {
  const k = vipLevel(), T = VIP_TIERS[k], next = VIP_TIERS[k + 1], v = S.slot.vip;
  const pct = next ? (v - T.at) / (next.at - T.at) * 100 : 100;
  return `<div class="vip-card" id="vipCard">
    <div class="vip-badge"><span class="vb-shield">${ico('crown')}</span><b>${tr(...T.name)}</b></div>
    <div class="vip-info"><div class="vip-perks">
      <span>⚡ ${tr('max', 'మాక్స్')} +${T.max}</span><span>🎁 +${T.gift}</span><span>🗓️ +${Math.round(T.cal * 100)}%</span></div>
      <div class="vip-bar"><div style="width:${Math.min(100, pct)}%"></div><b>${next ? `${fmtInt(v)} / ${fmtInt(next.at)} → ${tr(...next.name)}` : tr('Top VIP level!', 'అత్యున్నత VIP!')}</b></div>
    </div></div>`;
}

// ---- Weekly league: league points from spins, bosses, raids and building; 19 rivals in your group ----
const LEAGUES = [
  { name: ['Bronze', 'బ్రాంజ్'], icon: 'bronze', rate: 1 }, { name: ['Silver', 'సిల్వర్'], icon: 'silver', rate: 1.8 },
  { name: ['Gold', 'గోల్డ్'], icon: 'gold', rate: 3 }, { name: ['Platinum', 'ప్లాటినం'], icon: 'gem', rate: 5 }, { name: ['Diamond', 'డైమండ్'], icon: 'crown', rate: 8 },
];
const LEAGUE_SIZE = 20, LEAGUE_UP = 5, LEAGUE_DOWN = 5;
const RIVAL_NAMES = ['Arjun', 'Divya', 'Srinu', 'Bhavya', 'Naveen', 'Keerthi', 'Pavan', 'Harika', 'Teja', 'Sravani', 'Vamsi', 'Pooja', 'Chaitu', 'Anusha', 'Rohit', 'Meghana', 'Sai', 'Lavanya', 'Gopi', 'Ramya', 'Kalyan', 'Sneha'];
function leaguePrize(rank) { return rank === 1 ? { gems: 50, pack: 'gold' } : rank <= 3 ? { gems: 30, pack: 'gold' } : rank <= 10 ? { gems: 15, pack: 'basic' } : { gems: 5 }; }
function seeded(n) { let x = Math.sin(n * 9301 + 49297) * 233280; return x - Math.floor(x); }
// Rival scores grow through the week at their own pace, so the table moves while you play
function leagueRivals(week, tier, frac) {
  let base = Math.floor(new Date(week).getTime() / 86400000);
  if (!Number.isFinite(base)) base = 0;
  const used = new Set();
  return Array.from({ length: LEAGUE_SIZE - 1 }, (_, i) => {
    let k = Math.floor(seeded(base + i * 7 + tier * 31) * RIVAL_NAMES.length);
    if (!Number.isFinite(k)) k = i;
    for (let guard = 0; used.has(k) && guard < RIVAL_NAMES.length; guard++) k = (k + 1) % RIVAL_NAMES.length;
    used.add(k);
    const pace = 120 + seeded(base * 3 + i * 13 + tier) * 1400; // points a full week brings
    const curve = Math.pow(frac, 0.8 + seeded(base + i) * 0.6);
    return { name: RIVAL_NAMES[k], pts: Math.floor(pace * LEAGUES[tier].rate * curve) };
  });
}
function weekFrac() { return Math.min(1, Math.max(0.02, 1 - tourEndsIn() / (7 * 86400))); }
function leagueTable(frac = weekFrac()) {
  const L = S.league;
  const rows = leagueRivals(L.week, L.tier, frac).concat([{ name: raidName(), pts: L.pts, me: true }]);
  rows.sort((a, b) => b.pts - a.pts || (a.me ? -1 : 1));
  return rows;
}
function myLeagueRank(rows = leagueTable()) { return rows.findIndex(r => r.me) + 1; }
function addLeague(n) { leagueWeek(); S.league.pts += n; }
// New week: pay the old week's rank, move up or down, start again
function leagueWeek() {
  const L = S.league, wk = tourWeekKey();
  if (L.week === wk) return;
  if (L.week && L.pts > 0) {
    const rank = myLeagueRank(leagueTable(1)), P = leaguePrize(rank), old = L.tier;
    S.gems += P.gems; if (P.pack) giveAlbumPack(P.pack, 1, true);
    if (rank <= LEAGUE_UP && L.tier < LEAGUES.length - 1) L.tier++;
    else if (rank > LEAGUE_SIZE - LEAGUE_DOWN && L.tier > 0) L.tier--;
    const moved = L.tier > old ? tr(` Promoted to ${LEAGUES[L.tier].name[0]}!`, ` ${LEAGUES[L.tier].name[1]} లీగ్‌కి ప్రమోషన్!`) : L.tier < old ? tr(` Moved down to ${LEAGUES[L.tier].name[0]}.`, ` ${LEAGUES[L.tier].name[1]} లీగ్‌కి దిగారు.`) : '';
    queueModal(() => `${ico(LEAGUES[old].icon, 'big-ico')}<h3>${tr('League week over!', 'లీగ్ వారం ముగిసింది!')}</h3>
      <p>${tr(`You finished <b>#${rank}</b> in ${LEAGUES[old].name[0]} league.`, `${LEAGUES[old].name[1]} లీగ్‌లో <b>#${rank}</b> స్థానం.`)} +${P.gems} 💎${P.pack ? ' +1 📦' : ''}.${moved}</p>
      <div class="modal-actions"><button class="btn gold" data-act="close">${tr('Great!', 'సూపర్!')}</button></div>`);
  }
  L.week = wk; L.pts = 0; L.lastRank = 0;
  save();
}
function leagueCardHtml() {
  leagueWeek();
  const L = S.league, rows = leagueTable(), rank = myLeagueRank(rows), Lg = LEAGUES[L.tier];
  const trend = L.lastRank && rank < L.lastRank ? '<i class="up">▲</i>' : L.lastRank && rank > L.lastRank ? '<i class="down">▼</i>' : '';
  L.lastRank = rank;
  const zone = r => r <= LEAGUE_UP ? 'up' : r > LEAGUE_SIZE - LEAGUE_DOWN ? 'down' : '';
  const list = rows.map((r, i) => `<li class="${r.me ? 'me' : ''} ${zone(i + 1)}"><span>${i + 1}</span><b>${esc(r.name)}</b><em>${fmtInt(r.pts)}</em></li>`).join('');
  const P = leaguePrize(rank);
  return `<details class="league-card" id="leagueCard" ${leagueOpen ? 'open' : ''} ontoggle="leagueOpen = this.open"><summary>
      ${ico(Lg.icon)}<b>${tr(...Lg.name)} ${tr('league', 'లీగ్')}</b>
      <span class="lg-rank">#${rank}${trend}</span><small>${fmtInt(L.pts)} ${tr('pts', 'పాయింట్లు')} · ${tr('ends in', 'ముగింపు')} ${fmtDur(tourEndsIn())}</small></summary>
    <p class="sub">${tr(`Top ${LEAGUE_UP} move up, bottom ${LEAGUE_DOWN} move down. Points: 1 per energy spun, boss 50, raid 20, landmark part 30, album set 100. Now: +${P.gems} 💎${P.pack ? ' +📦' : ''}.`, `టాప్ ${LEAGUE_UP} పైకి, చివరి ${LEAGUE_DOWN} కిందకి. పాయింట్లు: ప్రతి ఎనర్జీకి 1, బాస్ 50, దాడి 20, ల్యాండ్‌మార్క్ భాగం 30, ఆల్బమ్ సెట్ 100. ఇప్పుడు: +${P.gems} 💎${P.pack ? ' +📦' : ''}.`)}</p>
    <ol class="lg-list">${list}</ol></details>`;
}
// ---- Slot sounds: small synth effects made with WebAudio ----
const SlotFX = (() => {
  let tickTimer = 0;
  const ctx = () => { if (!S.settings.sound) return null; try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); return actx; } catch (e) { return null; } };
  function note(f, at, dur, type = 'triangle', vol = 0.08, slideTo = 0) {
    const c = ctx(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + at;
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(at, dur, vol = 0.1, from = 800, to = 3000, type = 'bandpass') {
    const c = ctx(); if (!c) return;
    const b = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime + at;
    src.buffer = b; f.type = type; f.frequency.setValueAtTime(from, t); f.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(c.destination); src.start(t);
  }
  return {
    press() { note(320, 0, 0.08, 'square', 0.05, 180); },
    start() { noise(0, 0.35, 0.08, 400, 2400); note(220, 0, 0.25, 'sawtooth', 0.03, 440); },
    ticks(on) { clearInterval(tickTimer); if (on && ctx()) tickTimer = setInterval(() => note(1400 + Math.random() * 300, 0, 0.025, 'square', 0.015), 70); },
    stop(i) { note(140 - i * 10, 0, 0.18, 'sine', 0.14, 70); noise(0, 0.06, 0.06, 2000, 600, 'lowpass'); },
    small() { [523, 659, 784].forEach((f, i) => note(f, i * 0.08, 0.22, 'triangle', 0.07)); },
    big() { [523, 659, 784, 1047].forEach((f, i) => note(f, i * 0.09, 0.3, 'triangle', 0.08)); [523, 659, 784].forEach(f => note(f, 0.4, 0.7, 'sine', 0.05)); },
    jackpot() {
      [392, 523, 659, 784, 1047, 1319].forEach((f, i) => note(f, i * 0.08, 0.35, 'square', 0.05));
      [523, 659, 784, 1047].forEach(f => note(f, 0.55, 1.1, 'triangle', 0.05));
      for (let i = 0; i < 14; i++) note(2000 + Math.random() * 2500, 0.5 + i * 0.07, 0.08, 'sine', 0.03);
    },
    count() { note(1800, 0, 0.03, 'sine', 0.02); },
    hit() { noise(0, 0.18, 0.18, 300, 120, 'lowpass'); note(90, 0, 0.2, 'sine', 0.12, 50); },
    clang() { note(1200, 0, 0.4, 'square', 0.04, 900); note(1800, 0, 0.3, 'sine', 0.03); },
    whoosh() { noise(0, 0.5, 0.1, 300, 4000); },
    land(kind, k = 0) {
      if (kind === 'coin') note(1700 + (k % 6) * 140, 0, 0.09, 'sine', 0.05, 2600);
      else if (kind === 'gem') { note(1568, 0, 0.18, 'triangle', 0.06); note(2093, 0.07, 0.25, 'triangle', 0.05); }
      else if (kind === 'zap') note(400, 0, 0.18, 'square', 0.04, 1600);
      else if (kind === 'hit') { noise(0, 0.12, 0.14, 400, 120, 'lowpass'); note(110, 0, 0.15, 'sine', 0.1, 60); }
      else if (kind === 'clang') { note(1200, 0, 0.35, 'square', 0.035, 900); note(1800, 0, 0.25, 'sine', 0.03); }
      else note(880, 0, 0.1, 'triangle', 0.05, 1320);
    },
  };
})();

// ---- Spin Game screen: machine in the middle, events on two side rails ----
function railBtn(kind, icon, label, badge = '', hot = false, id = '') {
  return `<button class="rail-btn ${hot ? 'hot' : ''}" data-act="sg-open" data-id="${kind}" ${id ? `id="${id}"` : ''}>${ico(icon)}<span>${label}</span>${badge ? `<em>${badge}</em>` : ''}${hot ? '<i class="rail-dot"></i>' : ''}</button>`;
}
function railsHtml() {
  leagueWeek();
  const b = S.slot.boss, max = bossMaxHp(b.lvl), C = S.slot.col, it = colWeek(), colMax = COL_STEPS[COL_STEPS.length - 1].at;
  const left = [
    railBtn('boss', bossOf(b.lvl).icon, tr('Boss', 'బాస్'), `${Math.round(Math.max(0, b.hp) / max * 100)}%`, false, 'railBoss'),
    railBtn('event', it.icon, tr('Event', 'ఈవెంట్'), `${Math.min(100, Math.round(C.n / colMax * 100))}%`, false, 'railEvent'),
    railBtn('village', 'shield', tr('Village', 'ఊరు'), `${S.raid.shields}/${SHIELD_MAX}`, S.raid.tokens > 0 || helpLeft(), 'railVillage'),
    railBtn('piggy', 'pig', tr('Piggy', 'పిగ్గీ'), `${Math.round(S.slot.piggy / piggyCap() * 100)}%`, S.slot.piggy >= piggyCap(), 'railPiggy'),
  ].join('');
  const right = [
    railBtn('gift', 'gift', tr('Gift', 'గిఫ్ట్'), giftReady() ? tr('Free!', 'ఫ్రీ!') : fmtClock(giftIn()).replace(/^00:/, ''), giftReady()),
    railBtn('cal', 'calendar', tr('Daily', 'రోజూ'), `${tr('Day', 'రోజు')} ${calReady() ? calDay() : Math.min(7, S.slot.cal.streak % 7 || 7)}`, calReady()),
    railBtn('league', LEAGUES[S.league.tier].icon, tr('League', 'లీగ్'), `#${myLeagueRank()}`),
    railBtn('prizes', 'trophy', tr('Prizes', 'బహుమతులు'), ''),
  ].join('');
  return { left, right };
}
function sgOpen(kind) {
  const wrap = h => `<div class="sg-modal">${h}</div>`;
  const piggy = () => `<div class="piggy-card">
      <div class="piggy-ico">${ico('pig')}</div>
      <div class="info"><div class="title">${tr('Piggy bank', 'పిగ్గీ బ్యాంక్')} · ${fmtInt(S.slot.piggy)} ${tr('coins', 'కాయిన్లు')}</div>
        <div class="mbar"><div style="width:${Math.min(100, S.slot.piggy / piggyCap() * 100)}%"></div></div>
        <div class="desc">${tr('Every spin drops coins in. Break it with gems, or hit 🐷🐷🐷 to open it free.', 'ప్రతి స్పిన్‌కి కాయిన్లు పడతాయి. జెమ్స్‌తో పగలగొట్టండి, లేదా 🐷🐷🐷 వస్తే ఫ్రీ.')}</div></div>
      <button class="btn blue" data-act="piggy-break" data-gems="${PIGGY_GEMS}">💎 ${PIGGY_GEMS}</button></div>`;
  const html = { boss: bossCardHtml, event: colCardHtml, village: raidCardHtml, piggy, gift: giftCardHtml, cal: calCardHtml,
    league: () => leagueCardHtml().replace('<details class="league-card"', '<details open class="league-card"'), vip: vipCardHtml,
    prizes: () => `<h3>${ico('trophy')} ${tr('Prizes', 'బహుమతులు')}</h3>${slotPaytableHtml()}` }[kind];
  if (!html) return;
  SlotFX.press();
  modal(wrap(html()) + `<div class="modal-actions"><button class="btn ghost" data-act="close">${tr('Close', 'మూసివేయి')}</button></div>`);
}
function spinBtnHtml() {
  if (slotAuto) return `<b>${tr('STOP', 'ఆపు')}</b><small>${tr('auto spinning', 'ఆటో స్పిన్')}</small>`;
  return `<b>${tr('SPIN', 'స్పిన్')}</b><small>${tr('hold for auto', 'ఆటో కోసం పట్టుకోండి')}</small>`;
}
function betBtnHtml() { return `<small>${tr('BET', 'బెట్')}</small><b>×${S.slot.bet}</b><i class="bet-max">${tr('max', 'గరిష్ఠం')} ×${availBets().slice(-1)[0]}</i>`; }
function renderSlots() {
  slotRegen(); clampBet();
  const sl = S.slot, last = sl.last || ['coin', 'cherry', 'moneybag'], R = railsHtml(), pct = Math.min(100, sl.energy / slotMax() * 100);
  return `<div class="sg">
    <div class="sg-top">
      <div class="sg-energy">${ico('battery')}<div class="sg-ebar"><div id="slotEbar" style="width:${pct}%"></div><b id="slotEnergy">${sl.energy} / ${slotMax()}</b></div><em id="slotTimer"></em></div>
      ${petBadgeHtml()}
      <button class="sg-vip" data-act="sg-open" data-id="vip">${ico('crown')}<b>${tr(...vipTier().name)}</b></button>
    </div>
    <div class="sg-stage"><div id="dmgLayer"></div>
      <div class="sg-rail" id="railLeft">${R.left}</div>
      <div class="sg-center">
        <div class="slot-machine pro">
          <div class="marquee"><div class="bulbs"></div><span>${tr('MEGA SPIN', 'మెగా స్పిన్')}</span></div>
          <div class="reels-frame"><div class="reels">${last.map((k, i) => reelHtml(k, i)).join('')}<div class="payline"></div><div class="reel-glass"></div></div></div>
          <div class="slot-result" id="slotResult">${tr('Good luck, boss!', 'ఆల్ ది బెస్ట్, బాస్!')}</div>
        </div>
        <div class="sg-controls">
          <button class="bet-pill" data-act="slot-bet" id="slotBetBtn">${betBtnHtml()}</button>
          <button class="spin-round ${slotAuto ? 'auto' : ''}" data-act="slot-spin" id="slotSpinBtn">${spinBtnHtml()}</button>
          <div class="sg-cost">${tr('uses', 'ఖర్చు')}<b id="slotCost">${sl.bet} ⚡</b></div>
        </div>
      </div>
      <div class="sg-rail" id="railRight">${R.right}</div>
    </div>
    <div class="bigwin hidden" id="bigWin"><div class="bw-rays"></div><div class="bw-text" id="bigWinText"></div></div>
  </div>`;
}
function updateSlotLive() {
  if (activeTab !== 'slots' || !$('slotEnergy')) return;
  slotRegen();
  $('slotEnergy').textContent = `${S.slot.energy} / ${slotMax()}`;
  $('slotEbar').style.width = Math.min(100, S.slot.energy / slotMax() * 100) + '%';
  $('slotTimer').textContent = S.slot.energy >= slotMax() ? tr('Full', 'నిండింది') : `+1 ${fmtClock(slotNextIn()).replace(/^00:/, '')}`;
  const R = railsHtml();
  setHTML($('railLeft'), R.left); setHTML($('railRight'), R.right);
  const gb = $('giftBtn');
  if (gb) { if (giftReady() === gb.disabled) $('giftCard').outerHTML = giftCardHtml(); else if (!giftReady()) gb.textContent = fmtClock(giftIn()); }
}
function slotSetBet() {
  if (slotBusy) return;
  S.tutorial.betTaps = (S.tutorial.betTaps || 0) + 1;
  const a = availBets(), i = a.indexOf(S.slot.bet);
  S.slot.bet = a[(i + 1) % a.length];
  const nextLock = SLOT_BETS.find(b => !a.includes(b));
  if (S.slot.bet === a[a.length - 1] && nextLock) toast(tr(`Bet ×${nextLock} unlocks at ${nextLock * BET_NEED} ⚡`, `బెట్ ×${nextLock} కి ${nextLock * BET_NEED} ⚡ కావాలి`), 'info');
  SlotFX.press();
  $('slotBetBtn').innerHTML = betBtnHtml();
  restartAnim($('slotBetBtn'), 'pop');
  $('slotCost').textContent = `${S.slot.bet} ⚡`;
}
function slotStopAuto() { slotAuto = false; const b = $('slotSpinBtn'); if (b) { b.classList.remove('auto'); b.innerHTML = spinBtnHtml(); } }
// Short tap spins once; holding the button turns auto spin on; tapping during auto stops it
let holdTimer = 0, holdFired = false;
document.addEventListener('pointerdown', e => {
  const b = e.target.closest && e.target.closest('#slotSpinBtn');
  if (!b || slotAuto) return;
  holdFired = false;
  holdTimer = setTimeout(() => { holdFired = true; slotAuto = true; b.classList.add('auto'); b.innerHTML = spinBtnHtml(); SlotFX.whoosh(); if (!slotBusy) slotSpin(); }, 650);
});
['pointerup', 'pointercancel', 'pointerleave'].forEach(t => document.addEventListener(t, () => clearTimeout(holdTimer)));
function slotTap() {
  if (holdFired) { holdFired = false; return; }
  if (slotAuto) { slotStopAuto(); return; }
  slotSpin();
}
function slotSpin() {
  if (slotBusy || activeTab !== 'slots' || !$('strip0')) return;
  slotRegen(); clampBet();
  if ($('slotBetBtn')) { $('slotBetBtn').innerHTML = betBtnHtml(); $('slotCost').textContent = `${S.slot.bet} ⚡`; }
  const sl = S.slot, bet = sl.bet;
  if (sl.energy < bet) {
    shake($('slotSpinBtn')); showOutOfEnergy(); return;
  }
  slotBusy = true;
  if (sl.energy >= slotMax()) sl.at = Date.now(); // the refill clock starts when you drop below full
  sl.energy -= bet;
  if (Math.random() < petPower('free')) { sl.energy += bet; setTimeout(() => petPop(tr('Free spin!', 'ఫ్రీ స్పిన్!')), 300); }
  sl.piggy = Math.min(piggyCap(), sl.piggy + Math.round(60 * bet * cityScale()));
  S.stats.slotSpins = (S.stats.slotSpins || 0) + 1;
  addVip(bet); addLeague(bet);
  const line = [slotPick(), slotPick(), slotPick()];
  if (Math.random() < 0.18) line[1] = line[0]; // two of a kind a little more often, so it feels lively
  sl.last = line;
  updateSlotLive();
  const res = $('slotResult');
  res.textContent = tr('Spinning…', 'తిరుగుతోంది…'); res.className = 'slot-result';
  document.querySelector('.slot-machine').classList.remove('won', 'jack');
  document.querySelectorAll('.reel').forEach(r => r.classList.remove('win', 'stopped'));
  restartAnim($('slotSpinBtn'), 'pressed');
  SlotFX.start(); SlotFX.ticks(true);
  const fast = fxOff(), cell = ($('reel0').clientHeight || SLOT_CELL * 3) / 3;
  let longest = 0;
  line.forEach((k, i) => {
    const reel = $('reel' + i), strip = $('strip' + i), n = 18 + i * 7;
    const syms = [];
    for (let j = 0; j < n; j++) syms.push(slotPick());
    syms.push(k, slotPick());
    strip.style.transition = 'none';
    strip.innerHTML = [slotPick(), ...syms].map(x => `<div class="sym">${ico(x)}</div>`).join('');
    strip.style.transform = 'translateY(0)';
    void strip.offsetHeight;
    reel.classList.add('spinning');
    const dur = fast ? 0.25 + i * 0.1 : 1.0 + i * 0.4;
    longest = Math.max(longest, dur);
    strip.style.transition = `transform ${dur}s cubic-bezier(.2,.65,.3,1.08)`;
    strip.style.transform = `translateY(${-n * cell}px)`;
    setTimeout(() => { reel.classList.remove('spinning'); reel.classList.add('stopped'); SlotFX.stop(i); if (i === 2) SlotFX.ticks(false); }, dur * 1000 - 60);
  });
  setTimeout(() => slotFinish(line, bet), longest * 1000 + 120);
}
// ---- Rewards fly from the reels into where they belong, with a sound when they land ----
const FLY_TARGETS = {
  coins: () => $('cash'), gems: () => document.querySelector('.pill.gem'), energy: () => document.querySelector('.sg-energy'),
  boss: () => $('railBoss'), event: () => $('railEvent'), village: () => $('railVillage'), piggy: () => $('railPiggy'),
  pack: () => document.querySelector('.tab-btn[data-tab="album"]'),
};
const LAND_SOUND = { coins: 'coin', gems: 'gem', energy: 'zap', boss: 'hit', event: 'pop', village: 'clang', piggy: 'coin', pack: 'pop' };
let flying = 0;
function visibleEl(el) { if (!el) return null; const r = el.getBoundingClientRect(); return r.width && r.height ? el : null; }
function flyTo(kind, fromEl, iconKey, n = 4, delay = 0) {
  const target = visibleEl(FLY_TARGETS[kind] && FLY_TARGETS[kind]());
  if (!target || !fromEl) return;
  if (fxOff()) { restartAnim(target, 'bump'); SlotFX.land(LAND_SOUND[kind]); return; }
  const from = centerOf(fromEl), to = centerOf(target);
  for (let k = 0; k < n && flying < 40; k++) {
    flying++;
    const c = document.createElement('img');
    c.className = 'reward-fly'; c.src = iconUrl(iconKey); c.alt = '';
    c.onerror = () => { c.remove(); };
    document.body.appendChild(c);
    const sx = from.x + rand(-26, 26), sy = from.y + rand(-18, 18);
    const mx = (sx + to.x) / 2 + rand(-90, 90), my = Math.min(sy, to.y) - rand(50, 140);
    const anim = c.animate([
      { transform: `translate(${sx}px,${sy}px) scale(.3)`, opacity: 0 },
      { transform: `translate(${sx}px,${sy - 34}px) scale(1.15)`, opacity: 1, offset: 0.18 },
      { transform: `translate(${mx}px,${my}px) scale(1)`, opacity: 1, offset: 0.6 },
      { transform: `translate(${to.x}px,${to.y}px) scale(.45)`, opacity: 0.9 },
    ], { duration: 820 + k * 85, delay: delay + k * 40, easing: 'cubic-bezier(.45,0,.55,1)', fill: 'backwards' });
    anim.onfinish = () => {
      c.remove(); flying--;
      const t = visibleEl(FLY_TARGETS[kind]());
      if (t) restartAnim(t, 'bump');
      if (k === 0 || k === n - 1 || kind === 'coins') SlotFX.land(LAND_SOUND[kind], k);
    };
  }
}
// Center symbol of a reel, used as the starting point of a flight
function reelCenter(i) { const r = $('reel' + i); return r ? r.querySelector('.strip .sym:nth-last-child(2)') || r : null; }
function flySpinRewards(line, p, extras) {
  const res = $('slotResult');
  const winReel = line.findIndex((k, i) => line.indexOf(k) !== i || line.lastIndexOf(k) !== i);
  const src = winReel >= 0 ? reelCenter(winReel) : res;
  if (extras.coins) flyTo('coins', src || res, 'coin', Math.min(12, 3 + Math.floor(Math.log10(extras.coins + 1) * 1.5)));
  if (p.gems) flyTo('gems', src || res, 'gem', Math.min(8, p.gems + 2), 150);
  if (p.energy) flyTo('energy', src || res, 'bolt', Math.min(8, 2 + p.energy), 150);
  line.forEach((k, i) => {
    if (k === 'swords') flyTo('boss', reelCenter(i), 'swords', 2, 80 * i);
    if (k === 'shield' && line.every(x => x === 'shield')) flyTo('village', reelCenter(i), 'shield', 1, 120 * i);
  });
  flyTo('event', reelCenter(1), colWeek().icon, 2, 250);
  flyTo('piggy', reelCenter(2), 'coin', 1, 350);
  if (extras.pack) flyTo('pack', res, 'pack', 2, 500);
}
// ---- Out of energy: one window that lists every place to get energy or coins, each with a Go button ----
const ENERGY_PACKS = [{ id: 'energy30', n: 30, gems: 10 }, { id: 'energy100', n: 100, gems: 30 }];
function outOfEnergyHtml() {
  const sl = S.slot, rows = [];
  const row = (icon, title, desc, btn, ready = false) => rows.push(`<div class="eo-row ${ready ? 'ready' : ''}">${ico(icon)}<div class="eo-info"><b>${title}</b><small>${desc}</small></div>${btn}</div>`);
  const go = (act, label, extra = '', disabled = false) => `<button class="btn ${disabled ? 'ghost' : 'gold'} eo-go" data-act="${act}" ${extra} ${disabled ? 'disabled' : ''}>${label}</button>`;
  if (sl.energy >= 1 && sl.bet > 1) row('bolt', tr('Lower your bet', 'బెట్ తగ్గించండి'), tr(`You still have ${sl.energy} energy. Spin at ×1.`, `ఇంకా ${sl.energy} ఎనర్జీ ఉంది. ×1 తో స్పిన్ చేయండి.`), go('eo-bet1', tr('Bet ×1', 'బెట్ ×1')), true);
  row('gift', tr('Free gift', 'ఫ్రీ గిఫ్ట్'), giftReady() ? tr(`+${giftEnergy()} energy now`, `ఇప్పుడే +${giftEnergy()} ఎనర్జీ`) : tr(`Next gift in ${fmtClock(giftIn())}`, `తర్వాతి గిఫ్ట్ ${fmtClock(giftIn())} లో`),
    go('gift-claim', giftReady() ? tr('Claim', 'తీసుకో') : tr('Wait', 'ఆగండి'), '', !giftReady()), giftReady());
  row('calendar', tr('Spin calendar', 'స్పిన్ క్యాలెండర్'), calReady() ? tr(`Day ${calDay()}: +${calEnergy(calDay())} energy`, `రోజు ${calDay()}: +${calEnergy(calDay())} ఎనర్జీ`) : tr('Claimed today. Back tomorrow', 'ఈ రోజు తీసుకున్నారు. రేపు'),
    go('cal-claim', calReady() ? tr('Claim', 'తీసుకో') : tr('Tomorrow', 'రేపు'), '', !calReady()), calReady());
  if (canClaimDaily()) row('gem', tr('Daily reward', 'డైలీ రివార్డ్'), tr('Gems and coins for coming back', 'తిరిగి వచ్చినందుకు జెమ్స్, కాయిన్లు'), go('eo-open', tr('Open', 'తెరువు'), 'data-id="daily"'), true);
  if (spinReady()) row('wheel', tr('Lucky Wheel', 'లక్కీ వీల్'), tr('A free spin is waiting', 'ఫ్రీ స్పిన్ సిద్ధం'), go('eo-open', tr('Spin', 'తిప్పు'), 'data-id="spin"'), true);
  if (scratchFreeReady()) row('ticket', tr('Scratch card', 'స్క్రాచ్ కార్డ్'), tr('Your free card for today', 'ఈ రోజు ఫ్రీ కార్డ్'), go('eo-open', tr('Scratch', 'స్క్రాచ్'), 'data-id="scratch"'), true);
  const doneMissions = S.missions.filter(m => missionValue(m) >= m.target).length;
  row('clipboard', tr('Missions', 'మిషన్లు'), doneMissions ? tr(`${doneMissions} reward(s) ready`, `${doneMissions} బహుమతి(లు) సిద్ధం`) : tr('Finish missions for gems', 'మిషన్లు పూర్తి చేసి జెమ్స్'), go('go-tab', tr('Go', 'వెళ్ళు'), 'data-tab="missions"'), doneMissions > 0);
  if (helpLeft()) row('people', tr('Help other players', 'ఇతరులకు సాయం'), tr(`+${fmtInt(HELP_REWARD)} coins and a sticker pack`, `+${fmtInt(HELP_REWARD)} కాయిన్లు, స్టిక్కర్ ప్యాక్`), go('help-open', tr('Help', 'సాయం')), true);
  if (sl.piggy >= 1000) row('pig', tr('Piggy bank', 'పిగ్గీ బ్యాంక్'), tr(`${fmtInt(sl.piggy)} coins inside`, `లోపల ${fmtInt(sl.piggy)} కాయిన్లు`), go('piggy-break', `💎 ${PIGGY_GEMS}`, `data-gems="${PIGGY_GEMS}"`, S.gems < PIGGY_GEMS));
  for (const p of ENERGY_PACKS) row('battery', tr(`${p.n} energy`, `${p.n} ఎనర్జీ`), tr('Instant refill with gems', 'జెమ్స్‌తో వెంటనే'), go('energy-buy', `💎 ${p.gems}`, `data-id="${p.id}" data-gems="${p.gems}"`, S.gems < p.gems));
  return `<div class="eo-head">${ico('battery', 'big-ico')}<h3>${tr('Out of energy!', 'ఎనర్జీ అయిపోయింది!')}</h3>
    <p class="sub">${tr(`+1 every 6 minutes · next in ${fmtClock(slotNextIn())}. Or get more here:`, `ప్రతి 6 నిమిషాలకు +1 · తర్వాతి ${fmtClock(slotNextIn())} లో. లేదా ఇక్కడ పొందండి:`)}</p></div>
    <div class="eo-list">${rows.join('')}</div>
    <div class="modal-actions"><button class="btn ghost" data-act="close">${tr('Close', 'మూసివేయి')}</button></div>`;
}
function showOutOfEnergy() {
  slotStopAuto();
  SlotFX.land('zap'); SlotFX.whoosh();
  modal(outOfEnergyHtml());
}
function buyEnergy(id) {
  const p = ENERGY_PACKS.find(x => x.id === id);
  if (!p || S.gems < p.gems) { sfx('err'); return; }
  S.gems -= p.gems; S.slot.energy += p.n;
  SlotFX.land('zap'); toast(tr(`⚡ +${p.n} energy!`, `⚡ +${p.n} ఎనర్జీ!`), 'gem');
  save(); closeModal();
  if (activeTab === 'slots') renderTab();
  updateHeader();
}
// Count a number up on screen with soft ticks
function rollUp(el, to, html) {
  const t0 = performance.now(), dur = Math.min(1200, 400 + Math.log10(to + 1) * 150);
  let lastTick = 0;
  const step = now => {
    const k = Math.min(1, (now - t0) / dur), v = Math.floor(to * (1 - Math.pow(1 - k, 3)));
    el.innerHTML = html(v);
    if (now - lastTick > 70 && k < 1) { lastTick = now; SlotFX.count(); }
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
function showBigWin(text, jackpot) {
  const bw = $('bigWin'); if (!bw) return;
  $('bigWinText').innerHTML = text;
  bw.classList.toggle('jack', !!jackpot);
  bw.classList.remove('hidden'); restartAnim(bw, 'show');
  clearTimeout(bw._t); bw._t = setTimeout(() => bw.classList.add('hidden'), jackpot ? 2600 : 1900);
}
function slotFinish(line, bet) {
  const sl = S.slot, p = slotPrize(line, bet), parts = [];
  let coinWin = 0;
  if (p.coins) { earn(p.coins); coinWin += p.coins; }
  if (p.cash) { earn(p.cash); coinWin += p.cash; }
  if (p.gems) { S.gems += p.gems; parts.push(`+${p.gems} 💎`); }
  if (p.energy) { sl.energy += p.energy; parts.push(`+${p.energy} ⚡`); }
  if (p.piggy) { const v = sl.piggy; earn(v); coinWin += v; sl.piggy = 0; parts.push(tr('🐷 Piggy bank!', '🐷 పిగ్గీ బ్యాంక్!')); }
  const swords = line.filter(k => k === 'swords').length, lvlBefore = sl.boss.lvl;
  const hit = slotBattle(line, bet);
  if (hit) { parts.push(hit); SlotFX.hit(); }
  slotCollect(line, bet, p);
  const rs = slotRaidSymbols(line);
  if (rs) { parts.push(rs); if (line.every(k => k === 'shield')) SlotFX.clang(); }
  const res = $('slotResult'), machine = document.querySelector('.slot-machine');
  if (res) {
    const extra = parts.length ? '  ·  ' + parts.join('  ·  ') : '';
    const cnt = {};
    line.forEach(k => { cnt[k] = (cnt[k] || 0) + 1; });
    line.forEach((k, i) => { if (cnt[k] >= 2 && $('reel' + i)) $('reel' + i).classList.add('win'); });
    res.className = 'slot-result ' + (p.big ? 'big' : p.small ? '' : 'win');
    if (coinWin && (petPower('profit') || (p.big && petPower('jackpot')))) setTimeout(() => petPop(`+${Math.round((petPower('profit') || petPower('jackpot')) * 100)}% ${emo('coin')}`), 500);
    if (coinWin) rollUp(res, coinWin, v => `+${fmtInt(v)} ${ico('coin')}${extra}`);
    else res.innerHTML = parts.join('  ·  ') || tr('So close!', 'కొద్దిలో పోయింది!');
    if (p.big) {
      machine.classList.add('jack'); confetti(res, 160); SlotFX.jackpot();
      showBigWin(`${tr('JACKPOT!', 'జాక్‌పాట్!')}<small>${coinWin ? `+${fmtInt(coinWin)} ${ico('coin')}` : parts.join(' · ')}</small>`, true);
    } else if (!p.small || swords) {
      machine.classList.add('won');
      if (coinWin >= prizeOf('cherry3', bet) * 0.9) { SlotFX.big(); showBigWin(`${tr('BIG WIN!', 'బిగ్ విన్!')}<small>+${fmtInt(coinWin)} ${ico('coin')}</small>`); } else SlotFX.small();
    }
  }
  flySpinRewards(line, p, { coins: coinWin, pack: sl.boss.lvl !== lvlBefore });
  if (sl.boss.lvl && $('bossCard')) updateBossHp();
  slotBusy = false;
  updateSlotLive(); updateHeader(); save();
  if (sl.energy < sl.bet && !rs.includes('RAID') && !rs.includes('దాడి')) { slotStopAuto(); setTimeout(() => { if (activeTab !== 'slots') return; if ($('modal').classList.contains('hidden')) showOutOfEnergy(); else queueModal(outOfEnergyHtml); }, p.big ? 2400 : 1300); }
  else if (slotAuto) setTimeout(() => { if (slotAuto && activeTab === 'slots') slotSpin(); else slotStopAuto(); }, p.big ? 2200 : 700);
}

function breakPiggy() {
  if (S.slot.piggy < 1000) { toast(tr('The piggy bank is almost empty. Spin more!', 'పిగ్గీ బ్యాంక్ దాదాపు ఖాళీ. ఇంకా స్పిన్ చేయండి!'), 'bad'); return; }
  if (S.gems < PIGGY_GEMS) { toast(tr('Not enough gems.', 'జెమ్స్ సరిపోవు.'), 'bad'); return; }
  S.gems -= PIGGY_GEMS;
  const v = S.slot.piggy;
  earn(v); S.slot.piggy = 0;
  toast(tr(`🐷 Crash! +${fmtInt(v)} coins`, `🐷 పగిలింది! +${fmtInt(v)} కాయిన్లు`), 'gem'); sfx('win');
  save(); if (!$('modal').classList.contains('hidden')) closeModal(); renderTab();
}

/* ---------------------------- CITIES & LANDMARKS (build with coins) --------- */
// An India map of cities. Each city is a hexagon island: tap a glowing + tile to build it with coins.
// Tiles are houses, trees and the five parts of each landmark; some tiles carry a gift of coins and energy.
// Finish every tile of a city to open the next one.
// Every landmark teaches something: a short fact, when it was built, and a three-choice quiz (the first answer is the right one).
// `type` picks a ready-made 3D building and its part names; landmarks with their own model list their own parts.
const BTYPE_PARTS = {
  nagara: [['Platform', 'వేదిక'], ['Prayer hall', 'మండపం'], ['Sanctum', 'గర్భగుడి'], ['Shikhara tower', 'శిఖరం'], ['Kalasham and flag', 'కలశం, జెండా']],
  gopuram: [['Stone base', 'రాతి పునాది'], ['Lower tiers', 'కింది అంతస్తులు'], ['Middle tiers', 'మధ్య అంతస్తులు'], ['Upper tiers', 'పై అంతస్తులు'], ['Roof and kalasams', 'పైకప్పు, కలశాలు']],
  tomb: [['Platform', 'వేదిక'], ['Main hall', 'ప్రధాన భవనం'], ['Great dome', 'పెద్ద గుమ్మటం'], ['Corner towers', 'మూల బురుజులు'], ['Garden', 'తోట']],
  gateway: [['Stone base', 'రాతి పునాది'], ['Side towers', 'పక్క బురుజులు'], ['Great arch', 'పెద్ద ఆర్చి'], ['Top and turrets', 'పైభాగం, బురుజులు'], ['Domes and flags', 'గుమ్మటాలు, జెండాలు']],
  palace: [['Ground floor', 'కింది అంతస్తు'], ['Upper floor', 'పై అంతస్తు'], ['Central tower', 'మధ్య గోపురం'], ['Side towers', 'పక్క బురుజులు'], ['Main dome', 'ప్రధాన గుమ్మటం']],
  hawa: [['Ground floor', 'కింది అంతస్తు'], ['Second floor', 'రెండో అంతస్తు'], ['Third floor', 'మూడో అంతస్తు'], ['Fourth floor', 'నాలుగో అంతస్తు'], ['Top floor', 'పై అంతస్తు']],
  jantar: [['Platform', 'వేదిక'], ['Giant sundial', 'పెద్ద సూర్య గడియారం'], ['Shadow arcs', 'నీడ వంపులు'], ['Top pavilion', 'పై మండపం'], ['Small instruments', 'చిన్న యంత్రాలు']],
  golden: [['Holy pool', 'పవిత్ర సరోవరం'], ['Causeway', 'వంతెన దారి'], ['Golden sanctum', 'బంగారు గర్భగుడి'], ['Golden dome', 'బంగారు గుమ్మటం'], ['Kalash and flag', 'కలశం, జెండా']],
  memorial: [['Garden', 'తోట'], ['Stone base', 'రాతి పునాది'], ['Memorial pillar', 'స్మారక స్తంభం'], ['Wall and well', 'గోడ, బావి'], ['Flame', 'జ్యోతి']],
  ghat: [['River steps', 'నది మెట్లు'], ['Riverside houses', 'ఒడ్డున ఇళ్లు'], ['Small temples', 'చిన్న గుడులు'], ['Umbrellas', 'గొడుగులు'], ['Boats and lamps', 'పడవలు, దీపాలు']],
  stupa: [['Round base', 'గుండ్రని పునాది'], ['Railing', 'కంచె'], ['Dome', 'గుమ్మటం'], ['Harmika', 'హర్మిక'], ['Umbrella top', 'ఛత్రం']],
  bridge: [['Pillars in the river', 'నదిలో స్తంభాలు'], ['Tall towers', 'ఎత్తైన టవర్లు'], ['Steel frame', 'ఇనుప చట్రం'], ['Road deck', 'రోడ్డు'], ['Traffic', 'వాహనాలు']],
  barrage: [['River', 'నది'], ['Piers', 'స్తంభాలు'], ['Gates', 'గేట్లు'], ['Road', 'రోడ్డు'], ['Lamps', 'దీపాలు']],
  konark: [['Platform', 'వేదిక'], ['Stone wheels', 'రాతి చక్రాలు'], ['Hall', 'మండపం'], ['Seven horses', 'ఏడు గుర్రాలు'], ['Top', 'శిఖరం']],
  lighthouse: [['Base', 'పునాది'], ['Lower tower', 'కింది భాగం'], ['Middle tower', 'మధ్య భాగం'], ['Upper tower', 'పై భాగం'], ['Lamp room', 'దీపపు గది']],
  church: [['Steps', 'మెట్లు'], ['Main hall', 'ప్రధాన భవనం'], ['Bell tower', 'గంట గోపురం'], ['Spire', 'శిఖరం'], ['Cross and windows', 'శిలువ, కిటికీలు']],
  garden: [['Terraces', 'మెట్ల తోటలు'], ['Dam wall', 'ఆనకట్ట గోడ'], ['Water channels', 'నీటి కాలువలు'], ['Fountains', 'ఫౌంటెన్లు'], ['Lights', 'దీపాలు']],
  thoranam: [['Stone base', 'రాతి పునాది'], ['Pillars', 'స్తంభాలు'], ['Stone beam', 'రాతి దూలం'], ['Carved top', 'చెక్కిన పైభాగం'], ['Swans', 'హంసలు']],
  mandapa: [['Star platform', 'నక్షత్ర వేదిక'], ['Pillars', 'స్తంభాలు'], ['Roof', 'పైకప్పు'], ['Shrines', 'గుడులు'], ['Nandi', 'నంది']],
};
const LANDMARKS = {
  // Hyderabad
  charminar: { icon: 'mosque', name: ['Charminar', 'చార్మినార్'], y: '1591', parts: [['Base and arches', 'పునాది, ఆర్చిలు'], ['Upper floor', 'పై అంతస్తు'], ['Four minarets', 'నాలుగు మినార్లు'], ['Minaret balconies', 'మినార్ బాల్కనీలు'], ['Domes', 'గుమ్మటాలు']],
    fact: ['Built in 1591 by Sultan Muhammad Quli Qutb Shah, the founder of Hyderabad. Its four minarets are about 56 metres tall.', '1591లో హైదరాబాద్ స్థాపకుడు సుల్తాన్ మహమ్మద్ కులీ కుతుబ్ షా కట్టించారు. దీని నాలుగు మినార్లు సుమారు 56 మీటర్ల ఎత్తు.'],
    quiz: [['Who built the Charminar?', 'చార్మినార్‌ను ఎవరు కట్టించారు?'], [['Muhammad Quli Qutb Shah', 'మహమ్మద్ కులీ కుతుబ్ షా'], ['Shah Jahan', 'షాజహాన్'], ['Tipu Sultan', 'టిప్పు సుల్తాన్']]] },
  golconda: { icon: 'castle', name: ['Golconda Fort', 'గోల్కొండ కోట'], y: ['16th century', '16వ శతాబ్దం'], parts: [['Rocky hill', 'రాతి కొండ'], ['Fort walls', 'కోట గోడలు'], ['Watch towers', 'బురుజులు'], ['Bala Hissar', 'బాలా హిస్సార్'], ['Royal flag', 'రాజ జెండా']],
    fact: ['Golconda was famous for its diamond trade. A hand clap at the Fateh Darwaza gate can be heard at the Bala Hissar on the hilltop!', 'గోల్కొండ వజ్రాల వ్యాపారానికి ప్రసిద్ధి. ఫతే దర్వాజా దగ్గర చప్పట్లు కొడితే కొండ పైన బాలా హిస్సార్ వరకు వినిపిస్తుంది!'],
    quiz: [['Golconda was famous for trading in?', 'గోల్కొండ దేని వ్యాపారానికి ప్రసిద్ధి?'], [['Diamonds', 'వజ్రాలు'], ['Silk', 'పట్టు'], ['Tea', 'టీ']]] },
  buddha: { icon: 'lotus', name: ['Buddha Statue', 'బుద్ధ విగ్రహం'], y: '1992', parts: [['Rock in the lake', 'సరస్సులో రాయి'], ['Lotus base', 'కమల పీఠం'], ['Robe', 'వస్త్రం'], ['Head and shoulders', 'తల, భుజాలు'], ['Blessing hand and halo', 'అభయ హస్తం, ప్రభ']],
    fact: ['This 18 metre Buddha is carved from a single block of granite and stands on the Gibraltar Rock in Hussain Sagar lake.', 'ఈ 18 మీటర్ల బుద్ధ విగ్రహం ఒకే గ్రానైట్ రాతితో చెక్కబడింది. ఇది హుస్సేన్ సాగర్ సరస్సులోని జిబ్రాల్టర్ రాక్ మీద ఉంది.'],
    quiz: [['In which lake does the Buddha statue stand?', 'బుద్ధ విగ్రహం ఏ సరస్సులో ఉంది?'], [['Hussain Sagar', 'హుస్సేన్ సాగర్'], ['Dal Lake', 'దాల్ సరస్సు'], ['Chilika', 'చిలికా']]] },
  birla: { icon: 'htemple', type: 'nagara', o: { c: 0xf6f4ee, a: 0xe8e2d4 }, name: ['Birla Mandir', 'బిర్లా మందిర్'], y: '1976',
    fact: ['Birla Mandir is built from 2,000 tonnes of white Rajasthani marble on Naubath Pahad hill. It is dedicated to Lord Venkateswara.', 'బిర్లా మందిర్ 2,000 టన్నుల తెల్లని రాజస్థానీ పాలరాతితో నౌబత్ పహాడ్ కొండ మీద కట్టారు. ఇది శ్రీ వేంకటేశ్వర స్వామి ఆలయం.'],
    quiz: [['Birla Mandir in Hyderabad is made of?', 'హైదరాబాద్ బిర్లా మందిర్ దేనితో కట్టారు?'], [['White marble', 'తెల్ల పాలరాయి'], ['Red sandstone', 'ఎర్ర ఇసుకరాయి'], ['Bricks', 'ఇటుకలు']]] },
  // New Delhi
  indiagate: { icon: 'classical', name: ['India Gate', 'ఇండియా గేట్'], y: '1931', parts: [['Stone base', 'రాతి పునాది'], ['Two pillars', 'రెండు స్తంభాలు'], ['Great arch', 'పెద్ద ఆర్చి'], ['Cornice', 'పై అంచు'], ['Eternal flame', 'అమర జ్యోతి']],
    fact: ['India Gate is a 42 metre war memorial for Indian soldiers who died in the First World War. Their names are carved on its walls.', 'ఇండియా గేట్ మొదటి ప్రపంచ యుద్ధంలో చనిపోయిన భారత సైనికుల 42 మీటర్ల స్మారకం. వారి పేర్లు దీని గోడల మీద చెక్కారు.'],
    quiz: [['India Gate remembers?', 'ఇండియా గేట్ ఎవరి స్మారకం?'], [['Soldiers', 'సైనికులు'], ['Kings', 'రాజులు'], ['Poets', 'కవులు']]] },
  qutub: { icon: 'lighttower', name: ['Qutub Minar', 'కుతుబ్ మినార్'], y: '1199', parts: [['First storey', 'మొదటి అంతస్తు'], ['Second storey', 'రెండో అంతస్తు'], ['Third storey', 'మూడో అంతస్తు'], ['Marble storeys', 'పాలరాతి అంతస్తులు'], ['Top cupola', 'పై గుమ్మటం']],
    fact: ['At 72.5 metres, Qutub Minar is the tallest brick minaret in the world. Qutb-ud-din Aibak started it in 1199.', '72.5 మీటర్ల కుతుబ్ మినార్ ప్రపంచంలోనే ఎత్తైన ఇటుక మినార్. 1199లో కుతుబుద్దీన్ ఐబక్ దీన్ని మొదలుపెట్టారు.'],
    quiz: [['Who started building Qutub Minar?', 'కుతుబ్ మినార్ కట్టడం ఎవరు మొదలుపెట్టారు?'], [['Qutb-ud-din Aibak', 'కుతుబుద్దీన్ ఐబక్'], ['Akbar', 'అక్బర్'], ['Ashoka', 'అశోకుడు']]] },
  lotus: { icon: 'lotus', name: ['Lotus Temple', 'లోటస్ టెంపుల్'], y: '1986', parts: [['Base and pools', 'పునాది, కొలనులు'], ['Outer petals', 'బయటి రేకులు'], ['Middle petals', 'మధ్య రేకులు'], ['Inner petals', 'లోపలి రేకులు'], ['Crown and steps', 'పైభాగం, మెట్లు']],
    fact: ['The Lotus Temple has 27 marble petals and nine doors. People of every religion can come inside to pray quietly.', 'లోటస్ టెంపుల్‌కు 27 పాలరాతి రేకులు, తొమ్మిది తలుపులు ఉన్నాయి. ఏ మతం వారైనా లోపలికి వెళ్ళి ప్రశాంతంగా ప్రార్థించవచ్చు.'],
    quiz: [['How many petals does the Lotus Temple have?', 'లోటస్ టెంపుల్‌కు ఎన్ని రేకులు?'], [['27', '27'], ['9', '9'], ['100', '100']]] },
  redfort: { icon: 'castle', name: ['Red Fort', 'ఎర్రకోట'], y: '1648', parts: [['Red walls', 'ఎర్ర గోడలు'], ['Lahori Gate', 'లాహోరీ గేట్'], ['Corner towers', 'మూల బురుజులు'], ['Chhatris', 'ఛత్రీలు'], ['National flag', 'జాతీయ జెండా']],
    fact: ['Shah Jahan built the Red Fort from red sandstone. Every Independence Day, the Prime Minister hoists the national flag here.', 'షాజహాన్ ఎర్రకోటను ఎర్ర ఇసుకరాయితో కట్టించారు. ప్రతి స్వాతంత్ర్య దినోత్సవం రోజు ప్రధానమంత్రి ఇక్కడ జాతీయ జెండా ఎగురవేస్తారు.'],
    quiz: [['On which day is the flag hoisted at the Red Fort?', 'ఎర్రకోటపై జెండా ఏ రోజు ఎగురవేస్తారు?'], [['Independence Day', 'స్వాతంత్ర్య దినోత్సవం'], ['Children’s Day', 'బాలల దినోత్సవం'], ['Teachers’ Day', 'ఉపాధ్యాయ దినోత్సవం']]] },
  // Agra
  taj: { icon: 'mosque', name: ['Taj Mahal', 'తాజ్ మహల్'], y: '1653', parts: [['Marble platform', 'పాలరాతి వేదిక'], ['Main hall', 'ప్రధాన భవనం'], ['Great dome', 'పెద్ద గుమ్మటం'], ['Four minarets', 'నాలుగు మినార్లు'], ['Gardens and pool', 'తోటలు, కొలను']],
    fact: ['Shah Jahan built the Taj Mahal in memory of his wife Mumtaz Mahal. About 20,000 workers took over 20 years. It is one of the New Seven Wonders of the World.', 'షాజహాన్ తన భార్య ముంతాజ్ మహల్ జ్ఞాపకార్థం తాజ్ మహల్ కట్టించారు. సుమారు 20,000 మంది 20 ఏళ్ళకు పైగా పనిచేశారు. ఇది ప్రపంచ ఏడు కొత్త అద్భుతాలలో ఒకటి.'],
    quiz: [['The Taj Mahal stands on the bank of which river?', 'తాజ్ మహల్ ఏ నది ఒడ్డున ఉంది?'], [['Yamuna', 'యమున'], ['Ganga', 'గంగ'], ['Godavari', 'గోదావరి']]] },
  agrafort: { icon: 'castle', name: ['Agra Fort', 'ఆగ్రా కోట'], y: '1573', parts: [['Sandstone walls', 'రాతి గోడలు'], ['Amar Singh Gate', 'అమర్ సింగ్ గేట్'], ['Bastions', 'బురుజులు'], ['Marble pavilions', 'పాలరాతి మండపాలు'], ['Flag', 'జెండా']],
    fact: ['Akbar rebuilt Agra Fort. Later Aurangzeb kept his father Shah Jahan here, and he spent his last years looking at the Taj Mahal.', 'అక్బర్ ఆగ్రా కోటను మళ్ళీ కట్టించారు. తర్వాత ఔరంగజేబు తన తండ్రి షాజహాన్‌ను ఇక్కడ బంధించారు. ఆయన చివరి రోజులు తాజ్ మహల్‌ను చూస్తూ గడిపారు.'],
    quiz: [['Who was kept in Agra Fort by his own son?', 'కొడుకు చేత ఆగ్రా కోటలో బంధించబడింది ఎవరు?'], [['Shah Jahan', 'షాజహాన్'], ['Babur', 'బాబర్'], ['Humayun', 'హుమాయూన్']]] },
  buland: { icon: 'classical', type: 'gateway', o: { c: 0xb8603a, dc: 0xf2ece0, chhatri: true }, name: ['Buland Darwaza', 'బులంద్ దర్వాజా'], y: '1575',
    fact: ['Buland Darwaza at Fatehpur Sikri is 54 metres high, one of the tallest gateways in the world. Akbar built it to celebrate a victory in Gujarat.', 'ఫతేపూర్ సిక్రీలోని బులంద్ దర్వాజా 54 మీటర్ల ఎత్తు, ప్రపంచంలోనే ఎత్తైన ద్వారాలలో ఒకటి. గుజరాత్ విజయానికి గుర్తుగా అక్బర్ కట్టించారు.'],
    quiz: [['Who built the Buland Darwaza?', 'బులంద్ దర్వాజాను ఎవరు కట్టించారు?'], [['Akbar', 'అక్బర్'], ['Aurangzeb', 'ఔరంగజేబు'], ['Babur', 'బాబర్']]] },
  itimad: { icon: 'mosque', type: 'tomb', o: { c: 0xf2e6d0, dc: 0xf2e6d0, small: true }, name: ['Baby Taj', 'బేబీ తాజ్'], y: '1628',
    fact: ['The tomb of Itimad-ud-Daulah is called the "Baby Taj". Empress Nur Jahan built it for her father, and its inlay work inspired the Taj Mahal.', 'ఇతిమాద్-ఉద్-దౌలా సమాధిని "బేబీ తాజ్" అంటారు. మహారాణి నూర్జహాన్ తన తండ్రి కోసం కట్టించారు. దీని పొదుగు పనితనం తాజ్ మహల్‌కు స్ఫూర్తి.'],
    quiz: [['Who built the Baby Taj?', 'బేబీ తాజ్ ఎవరు కట్టించారు?'], [['Nur Jahan', 'నూర్జహాన్'], ['Mumtaz Mahal', 'ముంతాజ్ మహల్'], ['Razia Sultan', 'రజియా సుల్తాన్']]] },
  // Jaipur
  hawa: { icon: 'classical', type: 'hawa', name: ['Hawa Mahal', 'హవా మహల్'], y: '1799',
    fact: ['Hawa Mahal, the "Palace of Winds", has 953 small windows. Royal ladies watched street festivals through them without being seen.', 'హవా మహల్ అంటే "గాలి మహల్". దీనికి 953 చిన్న కిటికీలు ఉన్నాయి. రాణులు బయటకు కనిపించకుండా వీధి ఉత్సవాలను వీటి నుంచి చూసేవారు.'],
    quiz: [['About how many windows does Hawa Mahal have?', 'హవా మహల్‌కు సుమారు ఎన్ని కిటికీలు?'], [['953', '953'], ['53', '53'], ['9', '9']]] },
  amber: { icon: 'castle', type: 'fort', o: { c: 0xd8b070 }, name: ['Amber Fort', 'ఆమెర్ కోట'], y: '1592',
    fact: ['Raja Man Singh started Amber Fort in 1592. Its Sheesh Mahal is covered in tiny mirrors, so one candle can light up the whole hall.', '1592లో రాజా మాన్ సింగ్ ఆమెర్ కోట మొదలుపెట్టారు. దీని శీష్ మహల్ నిండా చిన్న అద్దాలు, ఒక్క దీపం పెడితే హాలంతా వెలుగుతుంది.'],
    quiz: [['The mirror palace inside Amber Fort is called?', 'ఆమెర్ కోటలోని అద్దాల మహల్ పేరు?'], [['Sheesh Mahal', 'శీష్ మహల్'], ['Rang Mahal', 'రంగ్ మహల్'], ['Moti Mahal', 'మోతీ మహల్']]] },
  jantar: { icon: 'sun', type: 'jantar', name: ['Jantar Mantar', 'జంతర్ మంతర్'], y: '1734',
    fact: ['Maharaja Sawai Jai Singh II built Jantar Mantar to study the sky. Its Samrat Yantra is the largest stone sundial in the world and tells time to about 2 seconds.', 'ఆకాశాన్ని అధ్యయనం చేయడానికి మహారాజా సవాయ్ జై సింగ్ II జంతర్ మంతర్ కట్టించారు. దీని సమ్రాట్ యంత్రం ప్రపంచంలోనే పెద్ద రాతి సూర్య గడియారం, 2 సెకన్ల తేడాతో సమయం చెబుతుంది.'],
    quiz: [['The Samrat Yantra at Jantar Mantar is a giant?', 'జంతర్ మంతర్‌లోని సమ్రాట్ యంత్రం ఒక పెద్ద?'], [['Sundial', 'సూర్య గడియారం'], ['Telescope', 'టెలిస్కోప్'], ['Bell', 'గంట']]] },
  // Amritsar
  golden: { icon: 'khanda', type: 'golden', name: ['Golden Temple', 'స్వర్ణ దేవాలయం'], y: '1604',
    fact: ['Sri Harmandir Sahib stands in a holy pool. Its free kitchen, the langar, serves meals to about 1 lakh people every day.', 'శ్రీ హర్మందిర్ సాహిబ్ పవిత్ర సరోవరం మధ్యలో ఉంది. దీని ఉచిత వంటశాల "లంగర్" రోజూ సుమారు లక్ష మందికి భోజనం పెడుతుంది.'],
    quiz: [['The free kitchen at the Golden Temple is called?', 'స్వర్ణ దేవాలయంలోని ఉచిత వంటశాల పేరు?'], [['Langar', 'లంగర్'], ['Dhaba', 'ధాబా'], ['Canteen', 'క్యాంటీన్']]] },
  jallianwala: { icon: 'diya', type: 'memorial', name: ['Jallianwala Bagh', 'జలియన్‌వాలా బాగ్'], y: '1919',
    fact: ['On 13 April 1919, British troops fired on a peaceful crowd here. The bullet marks are still on the walls. It made the freedom struggle much stronger.', '1919 ఏప్రిల్ 13న ఇక్కడ శాంతియుత జనంపై బ్రిటిష్ సైన్యం కాల్పులు జరిపింది. బుల్లెట్ గుర్తులు ఇప్పటికీ గోడలపై ఉన్నాయి. ఇది స్వాతంత్ర్య పోరాటాన్ని మరింత బలపరిచింది.'],
    quiz: [['In which year did the Jallianwala Bagh tragedy happen?', 'జలియన్‌వాలా బాగ్ దుర్ఘటన ఏ సంవత్సరం?'], [['1919', '1919'], ['1947', '1947'], ['1857', '1857']]] },
  wagah: { icon: 'flag', type: 'gateway', o: { c: 0xf0ece4, dc: 0xf0ece4, flag: true }, name: ['Attari–Wagah Border', 'అటారీ–వాఘా సరిహద్దు'], y: '1959',
    fact: ['Every evening soldiers hold the Beating Retreat ceremony at the Attari–Wagah border, lowering the flags with loud marching.', 'ప్రతి సాయంత్రం అటారీ–వాఘా సరిహద్దులో సైనికులు "బీటింగ్ రిట్రీట్" వేడుక చేసి జెండాలు దించుతారు.'],
    quiz: [['The Attari–Wagah border is between India and?', 'అటారీ–వాఘా సరిహద్దు భారత్ మరియు ఏ దేశం మధ్య?'], [['Pakistan', 'పాకిస్తాన్'], ['Nepal', 'నేపాల్'], ['China', 'చైనా']]] },
  // Varanasi
  kashi: { icon: 'om', type: 'nagara', o: { c: 0xf2e6d0, sc: 0xe0b030, a: 0xd8a040 }, name: ['Kashi Vishwanath', 'కాశీ విశ్వనాథ్'], y: '1780',
    fact: ['Kashi Vishwanath is one of the 12 Jyotirlingas of Lord Shiva. Its spires are covered with gold given by Maharaja Ranjit Singh.', 'కాశీ విశ్వనాథ ఆలయం శివుని 12 జ్యోతిర్లింగాలలో ఒకటి. దీని శిఖరాలకు మహారాజా రంజిత్ సింగ్ ఇచ్చిన బంగారం తొడిగారు.'],
    quiz: [['Kashi Vishwanath is one of the 12?', 'కాశీ విశ్వనాథ్ 12 ___ లో ఒకటి?'], [['Jyotirlingas', 'జ్యోతిర్లింగాలు'], ['Forts', 'కోటలు'], ['Rivers', 'నదులు']]] },
  ghats: { icon: 'diya', type: 'ghat', name: ['Ganga Ghats', 'గంగా ఘాట్లు'], y: ['Ancient', 'ప్రాచీనం'],
    fact: ['Varanasi has over 80 ghats, steps that lead down to the Ganga. Every evening a grand Ganga Aarti with lamps is held at Dashashwamedh Ghat.', 'వారణాసిలో 80కి పైగా ఘాట్లు (గంగలోకి దిగే మెట్లు) ఉన్నాయి. ప్రతి సాయంత్రం దశాశ్వమేధ ఘాట్‌లో దీపాలతో గంగా హారతి జరుగుతుంది.'],
    quiz: [['The famous evening Ganga Aarti happens at?', 'ప్రసిద్ధ సాయంత్రపు గంగా హారతి ఎక్కడ?'], [['Dashashwamedh Ghat', 'దశాశ్వమేధ ఘాట్'], ['Marina Beach', 'మెరీనా బీచ్'], ['Hussain Sagar', 'హుస్సేన్ సాగర్']]] },
  sarnath: { icon: 'lotus', type: 'stupa', o: { tall: true }, name: ['Sarnath Stupa', 'సారనాథ్ స్తూపం'], y: ['500 CE', 'క్రీ.శ. 500'],
    fact: ['At Sarnath the Buddha gave his first teaching. The Lion Capital of Ashoka found here is now the National Emblem of India.', 'సారనాథ్‌లో బుద్ధుడు తన మొదటి బోధన చేశారు. ఇక్కడ దొరికిన అశోకుని సింహ స్తంభ శీర్షమే ఇప్పుడు భారత జాతీయ చిహ్నం.'],
    quiz: [['India’s National Emblem comes from the Lion Capital found at?', 'భారత జాతీయ చిహ్నం ఎక్కడ దొరికిన సింహ శీర్షం నుంచి వచ్చింది?'], [['Sarnath', 'సారనాథ్'], ['Hampi', 'హంపి'], ['Agra', 'ఆగ్రా']]] },
  // Kolkata
  victoria: { icon: 'classical', type: 'tomb', o: { c: 0xf6f4ee, dc: 0xf6f4ee, angel: true }, name: ['Victoria Memorial', 'విక్టోరియా మెమోరియల్'], y: '1921',
    fact: ['The Victoria Memorial is built of white Makrana marble, the same marble as the Taj Mahal. Today it is a big museum of history and art.', 'విక్టోరియా మెమోరియల్ తాజ్ మహల్ లాగే తెల్లని మక్రానా పాలరాతితో కట్టారు. ఇప్పుడు ఇది చరిత్ర, కళల పెద్ద మ్యూజియం.'],
    quiz: [['What is the Victoria Memorial today?', 'ఇప్పుడు విక్టోరియా మెమోరియల్ ఏమిటి?'], [['A museum', 'మ్యూజియం'], ['A railway station', 'రైల్వే స్టేషన్'], ['A school', 'బడి']]] },
  howrah: { icon: 'bridge', type: 'bridge', name: ['Howrah Bridge', 'హౌరా బ్రిడ్జ్'], y: '1943',
    fact: ['Howrah Bridge over the Hooghly river was built without a single nut or bolt; it is held together by rivets. Lakhs of people cross it every day.', 'హుగ్లీ నదిపై ఉన్న హౌరా బ్రిడ్జ్‌ను ఒక్క నట్టు, బోల్టు లేకుండా రివెట్లతో కట్టారు. రోజూ లక్షల మంది దీనిపై ప్రయాణిస్తారు.'],
    quiz: [['Howrah Bridge crosses which river?', 'హౌరా బ్రిడ్జ్ ఏ నదిపై ఉంది?'], [['Hooghly', 'హుగ్లీ'], ['Krishna', 'కృష్ణా'], ['Narmada', 'నర్మద']]] },
  dakshineswar: { icon: 'htemple', type: 'nagara', o: { c: 0xf6f0e6, a: 0xc84a3a, nine: true }, name: ['Dakshineswar Kali Temple', 'దక్షిణేశ్వర్ కాళీ ఆలయం'], y: '1855',
    fact: ['Rani Rashmoni built this Kali temple with nine spires on the Hooghly. The saint Sri Ramakrishna Paramahamsa served here as a priest.', 'రాణీ రాష్మోని హుగ్లీ ఒడ్డున తొమ్మిది శిఖరాల ఈ కాళీ ఆలయం కట్టించారు. శ్రీ రామకృష్ణ పరమహంస ఇక్కడ పూజారిగా ఉండేవారు.'],
    quiz: [['Which saint was a priest at Dakshineswar?', 'దక్షిణేశ్వర్‌లో పూజారిగా ఉన్న మహాత్ముడు ఎవరు?'], [['Sri Ramakrishna', 'శ్రీ రామకృష్ణ'], ['Kabir', 'కబీర్'], ['Tulsidas', 'తులసీదాస్']]] },
  // Puri
  jagannath: { icon: 'htemple', type: 'nagara', o: { c: 0xf4f0e8, a: 0xd85a3a, h: 1.35 }, name: ['Jagannath Temple', 'జగన్నాథ ఆలయం'], y: ['12th century', '12వ శతాబ్దం'],
    fact: ['Every year Lord Jagannath, Balabhadra and Subhadra ride huge wooden chariots in the Rath Yatra. The flag on top of the temple is changed every single day.', 'ప్రతి ఏటా రథయాత్రలో జగన్నాథుడు, బలభద్రుడు, సుభద్ర పెద్ద చెక్క రథాలపై ఊరేగుతారు. ఆలయ శిఖరంపై జెండాను ప్రతి రోజూ మారుస్తారు.'],
    quiz: [['Puri’s famous chariot festival is called?', 'పూరీలో జరిగే ప్రసిద్ధ రథోత్సవం పేరు?'], [['Rath Yatra', 'రథయాత్ర'], ['Kumbh Mela', 'కుంభమేళా'], ['Onam', 'ఓనం']]] },
  konark: { icon: 'sunrise', type: 'konark', name: ['Konark Sun Temple', 'కోణార్క్ సూర్య దేవాలయం'], y: '1250',
    fact: ['The Konark Sun Temple is shaped like the Sun God’s chariot with 24 stone wheels and 7 horses. The wheels work as sundials! It is on the back of the ₹10 note.', 'కోణార్క్ సూర్య దేవాలయం 24 రాతి చక్రాలు, 7 గుర్రాలతో సూర్యుని రథం ఆకారంలో ఉంటుంది. ఆ చక్రాలు సూర్య గడియారాలుగా పనిచేస్తాయి! ఇది ₹10 నోటు వెనుక ఉంటుంది.'],
    quiz: [['The Konark Sun Temple is shaped like a?', 'కోణార్క్ సూర్య దేవాలయం ఏ ఆకారంలో ఉంటుంది?'], [['Chariot', 'రథం'], ['Boat', 'పడవ'], ['Lotus', 'కమలం']]] },
  // Mumbai
  gatewayindia: { icon: 'classical', type: 'gateway', o: { c: 0xd8b880, dc: 0xd8b880, dome: true }, name: ['Gateway of India', 'గేట్‌వే ఆఫ్ ఇండియా'], y: '1924',
    fact: ['The Gateway of India faces the Arabian Sea. It was built for a royal visit in 1911, and in 1948 the last British troops left India through it.', 'గేట్‌వే ఆఫ్ ఇండియా అరేబియా సముద్రం వైపు ఉంటుంది. 1911 రాజ సందర్శన కోసం కట్టారు. 1948లో చివరి బ్రిటిష్ సైన్యం దీని గుండా భారతదేశం విడిచింది.'],
    quiz: [['The Gateway of India faces which sea?', 'గేట్‌వే ఆఫ్ ఇండియా ఏ సముద్రం వైపు ఉంటుంది?'], [['Arabian Sea', 'అరేబియా సముద్రం'], ['Bay of Bengal', 'బంగాళాఖాతం'], ['Red Sea', 'ఎర్ర సముద్రం']]] },
  cst: { icon: 'train', type: 'palace', o: { c: 0xc89a6a, dc: 0x8a6a4a, trim: 0xf2ece0, spires: true }, name: ['CST Station', 'సీఎస్‌టీ స్టేషన్'], y: '1888',
    fact: ['Chhatrapati Shivaji Maharaj Terminus is a railway station that looks like a palace. It is a UNESCO World Heritage Site and millions of passengers use it.', 'ఛత్రపతి శివాజీ మహారాజ్ టెర్మినస్ రాజభవనంలా కనిపించే రైల్వే స్టేషన్. ఇది యునెస్కో ప్రపంచ వారసత్వ ప్రదేశం.'],
    quiz: [['What is CST in Mumbai?', 'ముంబైలోని సీఎస్‌టీ ఏమిటి?'], [['A railway station', 'రైల్వే స్టేషన్'], ['A fort', 'కోట'], ['A beach', 'బీచ్']]] },
  hajiali: { icon: 'mosque', type: 'tomb', o: { c: 0xf6f4ee, dc: 0xf6f4ee, sea: true, small: true }, name: ['Haji Ali Dargah', 'హాజీ అలీ దర్గా'], y: '1431',
    fact: ['Haji Ali Dargah stands on a small island in the sea. You can walk to it on a narrow path only at low tide.', 'హాజీ అలీ దర్గా సముద్రంలో ఒక చిన్న దీవిపై ఉంది. ఆటుపోట్లలో నీరు తగ్గినప్పుడే సన్నని దారిలో నడిచి వెళ్ళగలం.'],
    quiz: [['When can you walk to Haji Ali Dargah?', 'హాజీ అలీ దర్గాకు ఎప్పుడు నడిచి వెళ్ళవచ్చు?'], [['At low tide', 'నీరు తగ్గినప్పుడు (ఆటు)'], ['Only at night', 'రాత్రి మాత్రమే'], ['Only when it rains', 'వర్షం వచ్చినప్పుడే']]] },
  // Mysuru
  mysorepalace: { icon: 'crown', type: 'palace', o: { c: 0xe8dcc0, dc: 0xd8606a, trim: 0xc8a46a }, name: ['Mysore Palace', 'మైసూరు ప్యాలెస్'], y: '1912',
    fact: ['Mysore Palace was the home of the Wadiyar kings. During Dasara it is lit with nearly one lakh bulbs and glows like gold.', 'మైసూరు ప్యాలెస్ వడయార్ రాజుల నివాసం. దసరా సమయంలో దాదాపు లక్ష బల్బులతో బంగారంలా మెరుస్తుంది.'],
    quiz: [['Mysore Palace glows with lights during which festival?', 'ఏ పండుగలో మైసూరు ప్యాలెస్ దీపాలతో వెలుగుతుంది?'], [['Dasara', 'దసరా'], ['Holi', 'హోలీ'], ['Pongal', 'పొంగల్']]] },
  chamundi: { icon: 'htemple', type: 'gopuram', o: { c: 0xe8dcc8, tiers: 7 }, name: ['Chamundeshwari Temple', 'చాముండేశ్వరి ఆలయం'], y: ['12th century', '12వ శతాబ్దం'],
    fact: ['This temple of Goddess Chamundeshwari sits on Chamundi Hills. On the way up there is a huge Nandi statue carved from one rock.', 'చాముండేశ్వరి దేవి ఆలయం చాముండి కొండలపై ఉంది. పైకి వెళ్ళే దారిలో ఒకే రాతితో చెక్కిన పెద్ద నంది విగ్రహం ఉంది.'],
    quiz: [['Chamundi Hills has a giant stone statue of?', 'చాముండి కొండలపై ఏ పెద్ద రాతి విగ్రహం ఉంది?'], [['Nandi', 'నంది'], ['Hanuman', 'హనుమాన్'], ['Elephant', 'ఏనుగు']]] },
  brindavan: { icon: 'fountain', type: 'garden', name: ['Brindavan Gardens', 'బృందావన్ గార్డెన్స్'], y: '1932',
    fact: ['Brindavan Gardens lie below the KRS dam on the Kaveri river. Its musical fountain dances to songs every evening.', 'బృందావన్ గార్డెన్స్ కావేరి నదిపై ఉన్న కేఆర్‌ఎస్ ఆనకట్ట కింద ఉన్నాయి. ప్రతి సాయంత్రం సంగీత ఫౌంటెన్ పాటలకు నాట్యం చేస్తుంది.'],
    quiz: [['Brindavan Gardens are next to a dam on which river?', 'బృందావన్ గార్డెన్స్ ఏ నదిపై ఆనకట్ట దగ్గర ఉన్నాయి?'], [['Kaveri', 'కావేరి'], ['Ganga', 'గంగ'], ['Yamuna', 'యమున']]] },
  // Chennai
  kapaleeshwarar: { icon: 'htemple', type: 'gopuram', o: { colorful: true, tiers: 8 }, name: ['Kapaleeshwarar Temple', 'కపాలీశ్వర ఆలయం'], y: ['16th century', '16వ శతాబ్దం'],
    fact: ['This Shiva temple in Mylapore has a colourful 37 metre gopuram covered with hundreds of painted figures from stories.', 'మైలాపూర్‌లోని ఈ శివాలయానికి 37 మీటర్ల రంగుల గోపురం ఉంది. దానిపై కథల నుండి వందల రంగు బొమ్మలు ఉన్నాయి.'],
    quiz: [['Kapaleeshwarar Temple is dedicated to?', 'కపాలీశ్వర ఆలయం ఏ దేవునిది?'], [['Lord Shiva', 'శివుడు'], ['Lord Rama', 'శ్రీరాముడు'], ['Lord Ganesha', 'వినాయకుడు']]] },
  lighthouse: { icon: 'lighttower', type: 'lighthouse', name: ['Chennai Lighthouse', 'చెన్నై లైట్‌హౌస్'], y: '1977',
    fact: ['Marina Beach is one of the longest city beaches in the world. Its lighthouse is one of the few in the world that stands inside a city.', 'మెరీనా బీచ్ ప్రపంచంలోనే పొడవైన నగర బీచ్‌లలో ఒకటి. దీని లైట్‌హౌస్ నగరం లోపల ఉన్న అరుదైన లైట్‌హౌస్‌లలో ఒకటి.'],
    quiz: [['Chennai Lighthouse stands on which beach?', 'చెన్నై లైట్‌హౌస్ ఏ బీచ్‌లో ఉంది?'], [['Marina Beach', 'మెరీనా బీచ్'], ['Juhu Beach', 'జుహూ బీచ్'], ['RK Beach', 'ఆర్కే బీచ్']]] },
  santhome: { icon: 'church', type: 'church', name: ['San Thome Basilica', 'శాంథోమ్ బాసిలికా'], y: '1896',
    fact: ['San Thome Basilica is built over the tomb of St. Thomas, one of Jesus’ twelve apostles. It is one of only three such churches in the world.', 'శాంథోమ్ బాసిలికా యేసు పన్నెండు మంది శిష్యులలో ఒకరైన సెయింట్ థామస్ సమాధిపై కట్టారు. ప్రపంచంలో ఇలాంటి చర్చిలు మూడే ఉన్నాయి.'],
    quiz: [['San Thome Basilica is built over the tomb of?', 'శాంథోమ్ బాసిలికా ఎవరి సమాధిపై కట్టారు?'], [['St. Thomas', 'సెయింట్ థామస్'], ['St. Peter', 'సెయింట్ పీటర్'], ['St. Francis', 'సెయింట్ ఫ్రాన్సిస్']]] },
  // Madurai
  meenakshi: { icon: 'htemple', type: 'gopuram', o: { colorful: true, tiers: 10 }, name: ['Meenakshi Temple', 'మీనాక్షి ఆలయం'], y: ['17th century', '17వ శతాబ్దం'],
    fact: ['Meenakshi Amman Temple has 14 gopurams. The tallest is about 52 metres and is covered with thousands of colourful sculptures.', 'మీనాక్షి అమ్మన్ ఆలయానికి 14 గోపురాలు. అత్యంత ఎత్తైనది సుమారు 52 మీటర్లు, దానిపై వేల రంగుల శిల్పాలు ఉన్నాయి.'],
    quiz: [['How many gopurams does the Meenakshi Temple have?', 'మీనాక్షి ఆలయానికి ఎన్ని గోపురాలు?'], [['14', '14'], ['4', '4'], ['40', '40']]] },
  nayak: { icon: 'crown', type: 'palace', o: { c: 0xf4eee2, dc: 0xf4eee2, trim: 0xd8c8a8 }, name: ['Thirumalai Nayak Palace', 'తిరుమలై నాయక్ ప్యాలెస్'], y: '1636',
    fact: ['King Thirumalai Nayak built this palace in 1636. Its giant pillars are about 20 metres tall—so wide that two people cannot hug one!', '1636లో రాజు తిరుమలై నాయక్ ఈ ప్యాలెస్ కట్టించారు. దీని స్తంభాలు సుమారు 20 మీటర్ల ఎత్తు, ఇద్దరు కలిసి కూడా చుట్టలేనంత లావు!'],
    quiz: [['Thirumalai Nayak Palace is famous for its giant?', 'తిరుమలై నాయక్ ప్యాలెస్ దేనికి ప్రసిద్ధి?'], [['Pillars', 'స్తంభాలు'], ['Gardens', 'తోటలు'], ['Lakes', 'సరస్సులు']]] },
  // Tirupati
  tirumala: { icon: 'htemple', model: 'tirupati', name: ['Tirumala Temple', 'తిరుమల ఆలయం'], y: ['300 CE', 'క్రీ.శ. 300'], parts: [['Temple base', 'ఆలయ పునాది'], ['Lower tiers', 'కింది అంతస్తులు'], ['Upper tiers', 'పై అంతస్తులు'], ['Ananda Nilayam', 'ఆనంద నిలయం'], ['Golden kalasams', 'బంగారు కలశాలు']],
    fact: ['Sri Venkateswara Temple stands on the seven hills of Tirumala. Its gold-covered tower is called Ananda Nilayam, and its laddu prasadam has a GI tag.', 'శ్రీ వేంకటేశ్వర ఆలయం తిరుమల ఏడు కొండలపై ఉంది. బంగారు గోపురాన్ని "ఆనంద నిలయం" అంటారు. ఇక్కడి లడ్డూ ప్రసాదానికి జీఐ ట్యాగ్ ఉంది.'],
    quiz: [['The golden tower of Tirumala temple is called?', 'తిరుమల ఆలయ బంగారు గోపురం పేరు?'], [['Ananda Nilayam', 'ఆనంద నిలయం'], ['Raj Bhavan', 'రాజ్ భవన్'], ['Hawa Mahal', 'హవా మహల్']]] },
  govindaraja: { icon: 'htemple', type: 'gopuram', o: { c: 0xf2ead8, tiers: 8 }, name: ['Govindaraja Temple', 'గోవిందరాజ స్వామి ఆలయం'], y: '1130',
    fact: ['Sri Ramanujacharya consecrated the Govindaraja Swamy Temple in Tirupati town in 1130. Its tall gopuram can be seen from far away.', '1130లో శ్రీ రామానుజాచార్యులు తిరుపతి పట్టణంలో గోవిందరాజ స్వామి ఆలయాన్ని ప్రతిష్ఠించారు. దీని ఎత్తైన గోపురం దూరం నుంచే కనిపిస్తుంది.'],
    quiz: [['Who consecrated the Govindaraja Temple?', 'గోవిందరాజ ఆలయాన్ని ఎవరు ప్రతిష్ఠించారు?'], [['Ramanujacharya', 'రామానుజాచార్యులు'], ['Adi Shankara', 'ఆది శంకరాచార్యులు'], ['Kabir', 'కబీర్']]] },
  kalahasti: { icon: 'htemple', type: 'gopuram', o: { c: 0xd8d0c0, tiers: 7 }, name: ['Srikalahasti Temple', 'శ్రీకాళహస్తి ఆలయం'], y: ['12th century', '12వ శతాబ్దం'],
    fact: ['Srikalahasti is the Vayu (air) temple among the five Pancha Bhoota Sthalas of Lord Shiva. The lamp near the lingam keeps flickering even with no wind inside.', 'శ్రీకాళహస్తి శివుని పంచభూత స్థలాలలో వాయు (గాలి) క్షేత్రం. లోపల గాలి లేకపోయినా లింగం దగ్గర దీపం కదులుతూ ఉంటుంది.'],
    quiz: [['Srikalahasti stands for which element?', 'శ్రీకాళహస్తి ఏ భూతానికి ప్రతీక?'], [['Air (Vayu)', 'వాయువు'], ['Fire (Agni)', 'అగ్ని'], ['Water (Jala)', 'జలం']]] },
  // Vijayawada
  kanakadurga: { icon: 'htemple', type: 'gopuram', o: { c: 0xf4e0b0, roof: 0xe0b030, tiers: 6 }, name: ['Kanaka Durga Temple', 'కనకదుర్గ ఆలయం'], y: ['Ancient', 'ప్రాచీనం'],
    fact: ['Goddess Kanaka Durga’s temple stands on Indrakeeladri hill beside the Krishna river. Lakhs of devotees come during the Dasara festival.', 'కనకదుర్గ అమ్మవారి ఆలయం కృష్ణా నది ఒడ్డున ఇంద్రకీలాద్రి కొండపై ఉంది. దసరా సమయంలో లక్షల మంది భక్తులు వస్తారు.'],
    quiz: [['Kanaka Durga Temple stands on which hill?', 'కనకదుర్గ ఆలయం ఏ కొండపై ఉంది?'], [['Indrakeeladri', 'ఇంద్రకీలాద్రి'], ['Tirumala', 'తిరుమల'], ['Chamundi', 'చాముండి']]] },
  prakasam: { icon: 'bridge', type: 'barrage', name: ['Prakasam Barrage', 'ప్రకాశం బ్యారేజ్'], y: '1957',
    fact: ['Prakasam Barrage stretches about 1.2 km across the Krishna river. Its water reaches farms through three big canals.', 'ప్రకాశం బ్యారేజ్ కృష్ణా నదిపై సుమారు 1.2 కి.మీ. పొడవు ఉంది. దీని నీరు మూడు పెద్ద కాలువల ద్వారా పొలాలకు చేరుతుంది.'],
    quiz: [['Prakasam Barrage is built across which river?', 'ప్రకాశం బ్యారేజ్ ఏ నదిపై ఉంది?'], [['Krishna', 'కృష్ణా'], ['Godavari', 'గోదావరి'], ['Kaveri', 'కావేరి']]] },
  amaravati: { icon: 'lotus', type: 'stupa', name: ['Amaravati Stupa', 'అమరావతి స్తూపం'], y: ['200 BCE', 'క్రీ.పూ. 200'],
    fact: ['The Amaravati Mahachaitya was a great Buddhist stupa built over 2,000 years ago. Its carved marble panels are kept in museums around the world.', 'అమరావతి మహాచైత్యం 2,000 ఏళ్ళ క్రితం కట్టిన గొప్ప బౌద్ధ స్తూపం. దీని చెక్కిన పాలరాతి ఫలకాలు ప్రపంచంలోని మ్యూజియాలలో ఉన్నాయి.'],
    quiz: [['The Amaravati Stupa belongs to which religion?', 'అమరావతి స్తూపం ఏ మతానికి చెందినది?'], [['Buddhism', 'బౌద్ధం'], ['Sikhism', 'సిక్కు మతం'], ['Christianity', 'క్రైస్తవం']]] },
  // Warangal
  thoranam: { icon: 'classical', type: 'thoranam', name: ['Kakatiya Kala Thoranam', 'కాకతీయ కళా తోరణం'], y: ['13th century', '13వ శతాబ్దం'],
    fact: ['This carved stone gateway of Warangal Fort was built by the Kakatiya kings. It is part of the official emblem of Telangana.', 'వరంగల్ కోటలోని ఈ చెక్కిన రాతి తోరణాన్ని కాకతీయ రాజులు కట్టించారు. ఇది తెలంగాణ రాష్ట్ర అధికారిక చిహ్నంలో ఉంది.'],
    quiz: [['The Kakatiya Kala Thoranam is on the emblem of?', 'కాకతీయ కళా తోరణం ఏ రాష్ట్ర చిహ్నంలో ఉంది?'], [['Telangana', 'తెలంగాణ'], ['Kerala', 'కేరళ'], ['Punjab', 'పంజాబ్']]] },
  thousandpillar: { icon: 'htemple', type: 'mandapa', name: ['Thousand Pillar Temple', 'వేయి స్తంభాల గుడి'], y: '1163',
    fact: ['Kakatiya king Rudra Deva built this star-shaped temple in 1163 for Shiva, Vishnu and Surya. A big Nandi carved from black stone sits in front.', '1163లో కాకతీయ రాజు రుద్రదేవుడు శివ, విష్ణు, సూర్యుల కోసం ఈ నక్షత్ర ఆకార ఆలయం కట్టించారు. ముందు నల్లరాతి పెద్ద నంది ఉంది.'],
    quiz: [['Who built the Thousand Pillar Temple?', 'వేయి స్తంభాల గుడి ఎవరు కట్టించారు?'], [['The Kakatiyas', 'కాకతీయులు'], ['The Mughals', 'మొఘలులు'], ['The British', 'బ్రిటిష్ వారు']]] },
  ramappa: { icon: 'htemple', type: 'nagara', o: { c: 0xb8806a, a: 0x9a6a58, band: true }, name: ['Ramappa Temple', 'రామప్ప ఆలయం'], y: '1213',
    fact: ['Ramappa Temple is named after its sculptor, Ramappa. Its tower is made of bricks so light they float on water! It became a UNESCO World Heritage Site in 2021.', 'రామప్ప ఆలయానికి దాని శిల్పి రామప్ప పేరు పెట్టారు. దీని గోపురం నీటిలో తేలే తేలికపాటి ఇటుకలతో కట్టారు! 2021లో యునెస్కో ప్రపంచ వారసత్వ ప్రదేశం అయ్యింది.'],
    quiz: [['Ramappa Temple is named after its?', 'రామప్ప ఆలయానికి ఎవరి పేరు పెట్టారు?'], [['Sculptor', 'శిల్పి'], ['King', 'రాజు'], ['River', 'నది']]] },
};
// ll = [latitude, longitude]; the India map places each pin from these
const CITIES = [
  { id: 'hyd', name: ['Hyderabad', 'హైదరాబాద్'], ll: [17.38, 78.48], lms: ['charminar', 'golconda', 'buddha', 'birla'],
    fact: ['Capital of Telangana, founded in 1591 by the Qutb Shahi kings. Famous for biryani, pearls and IT companies.', 'తెలంగాణ రాజధాని, 1591లో కుతుబ్ షాహీ రాజులు స్థాపించారు. బిర్యానీ, ముత్యాలు, ఐటీ కంపెనీలకు ప్రసిద్ధి.'] },
  { id: 'delhi', name: ['New Delhi', 'న్యూఢిల్లీ'], ll: [28.61, 77.21], lms: ['indiagate', 'qutub', 'lotus', 'redfort'],
    fact: ['The capital of India. Parliament, the President’s house (Rashtrapati Bhavan) and the Supreme Court are here.', 'భారతదేశ రాజధాని. పార్లమెంట్, రాష్ట్రపతి భవన్, సుప్రీం కోర్టు ఇక్కడే ఉన్నాయి.'] },
  { id: 'agra', name: ['Agra', 'ఆగ్రా'], ll: [27.18, 78.01], lms: ['taj', 'agrafort', 'buland', 'itimad'],
    fact: ['A Mughal capital on the Yamuna river in Uttar Pradesh, home to three UNESCO World Heritage Sites.', 'ఉత్తరప్రదేశ్‌లో యమునా నది ఒడ్డున ఉన్న మొఘల్ రాజధాని. ఇక్కడ మూడు యునెస్కో వారసత్వ ప్రదేశాలు ఉన్నాయి.'] },
  { id: 'jaipur', name: ['Jaipur', 'జైపూర్'], ll: [26.91, 75.79], lms: ['hawa', 'amber', 'jantar'],
    fact: ['The "Pink City", capital of Rajasthan. Its old town was painted pink in 1876 to welcome a royal guest.', '"పింక్ సిటీ", రాజస్థాన్ రాజధాని. 1876లో ఒక రాజ అతిథిని స్వాగతించడానికి పాత నగరానికి గులాబీ రంగు వేశారు.'] },
  { id: 'amritsar', name: ['Amritsar', 'అమృత్‌సర్'], ll: [31.63, 74.87], lms: ['golden', 'jallianwala', 'wagah'],
    fact: ['A holy city of the Sikhs in Punjab, founded by Guru Ram Das in 1577.', 'పంజాబ్‌లో సిక్కుల పవిత్ర నగరం, 1577లో గురు రామ్ దాస్ స్థాపించారు.'] },
  { id: 'varanasi', name: ['Varanasi', 'వారణాసి'], ll: [25.32, 82.97], lms: ['kashi', 'ghats', 'sarnath'],
    fact: ['Also called Kashi, it is one of the oldest living cities in the world, on the banks of the Ganga.', 'కాశీ అని కూడా పిలుస్తారు. గంగా తీరంలో ఉన్న ప్రపంచంలోని అతి పురాతన నగరాలలో ఒకటి.'] },
  { id: 'kolkata', name: ['Kolkata', 'కోల్‌కతా'], ll: [22.57, 88.36], lms: ['victoria', 'howrah', 'dakshineswar'],
    fact: ['Capital of West Bengal and of British India until 1911. Known as the City of Joy and home of Rabindranath Tagore.', 'పశ్చిమ బెంగాల్ రాజధాని, 1911 వరకు బ్రిటిష్ ఇండియా రాజధాని. "సిటీ ఆఫ్ జాయ్", రవీంద్రనాథ్ ఠాగూర్ పుట్టిన ఊరు.'] },
  { id: 'puri', name: ['Puri', 'పూరీ'], ll: [19.81, 85.83], lms: ['jagannath', 'konark'],
    fact: ['A holy beach town in Odisha and one of the four Char Dham pilgrimage places.', 'ఒడిశాలోని పవిత్ర సముద్రతీర పట్టణం, చార్ ధామ్ యాత్రా స్థలాలలో ఒకటి.'] },
  { id: 'mumbai', name: ['Mumbai', 'ముంబై'], ll: [19.08, 72.88], lms: ['gatewayindia', 'cst', 'hajiali'],
    fact: ['Capital of Maharashtra and the money capital of India. It was once seven islands, and Bollywood films are made here.', 'మహారాష్ట్ర రాజధాని, భారతదేశ ఆర్థిక రాజధాని. ఒకప్పుడు ఏడు దీవులు. బాలీవుడ్ సినిమాలు ఇక్కడే తయారవుతాయి.'] },
  { id: 'mysuru', name: ['Mysuru', 'మైసూరు'], ll: [12.3, 76.64], lms: ['mysorepalace', 'chamundi', 'brindavan'],
    fact: ['The City of Palaces in Karnataka, famous for its grand Dasara festival, silk and sandalwood.', 'కర్ణాటకలోని "ప్యాలెస్‌ల నగరం". గొప్ప దసరా ఉత్సవం, పట్టు, గంధానికి ప్రసిద్ధి.'] },
  { id: 'chennai', name: ['Chennai', 'చెన్నై'], ll: [13.08, 80.27], lms: ['kapaleeshwarar', 'lighthouse', 'santhome'],
    fact: ['Capital of Tamil Nadu on the Bay of Bengal, a big centre for cars, films and Carnatic music.', 'బంగాళాఖాతం ఒడ్డున తమిళనాడు రాజధాని. కార్లు, సినిమాలు, కర్ణాటక సంగీతానికి పెద్ద కేంద్రం.'] },
  { id: 'madurai', name: ['Madurai', 'మదురై'], ll: [9.93, 78.12], lms: ['meenakshi', 'nayak'],
    fact: ['One of the oldest cities in India, on the Vaigai river, called the "Temple City" of Tamil Nadu.', 'వైగై నది ఒడ్డున ఉన్న భారతదేశపు పురాతన నగరాలలో ఒకటి, తమిళనాడు "దేవాలయాల నగరం".'] },
  { id: 'tirupati', name: ['Tirupati', 'తిరుపతి'], ll: [13.63, 79.42], lms: ['tirumala', 'govindaraja', 'kalahasti'],
    fact: ['At the foot of the Tirumala hills in Andhra Pradesh. Tirumala is one of the most visited holy places in the world.', 'ఆంధ్రప్రదేశ్‌లో తిరుమల కొండల దిగువన ఉంది. ప్రపంచంలో అత్యధిక భక్తులు వచ్చే పుణ్యక్షేత్రాలలో తిరుమల ఒకటి.'] },
  { id: 'vijayawada', name: ['Vijayawada', 'విజయవాడ'], ll: [16.51, 80.65], lms: ['kanakadurga', 'prakasam', 'amaravati'],
    fact: ['A busy city on the Krishna river in Andhra Pradesh, near Amaravati, an ancient Buddhist centre.', 'ఆంధ్రప్రదేశ్‌లో కృష్ణా నది ఒడ్డున ఉన్న నగరం. ప్రాచీన బౌద్ధ కేంద్రం అమరావతి దగ్గరలో ఉంది.'] },
  { id: 'warangal', name: ['Warangal', 'వరంగల్'], ll: [17.97, 79.59], lms: ['thoranam', 'thousandpillar', 'ramappa'],
    fact: ['The capital of the great Kakatiya kings in Telangana, famous for its fort, temples and lakes.', 'తెలంగాణలో గొప్ప కాకతీయ రాజుల రాజధాని. కోట, ఆలయాలు, చెరువులకు ప్రసిద్ధి.'] },
];
// India's outline as [longitude, latitude] points, drawn on the map with the same projection as the pins
const INDIA_LL = [[74.4, 34.8], [75.5, 35.8], [77.5, 35.6], [78.6, 34.3], [79.0, 32.5], [78.8, 31.0], [80.2, 30.2], [81.1, 30.0], [82.5, 28.9], [84.1, 27.5], [85.9, 26.6], [88.1, 26.4],
  [88.2, 27.6], [88.9, 27.3], [89.0, 26.5], [89.8, 26.7], [92.0, 26.9], [92.6, 27.8], [94.5, 28.9], [96.1, 29.4], [97.4, 28.2], [96.5, 27.3], [95.2, 26.6], [94.6, 25.3], [94.2, 23.9], [93.3, 23.0],
  [93.2, 22.1], [92.6, 22.0], [92.2, 23.7], [91.6, 22.9], [91.2, 23.8], [91.9, 24.2], [92.4, 25.0], [90.0, 25.3], [89.8, 25.9], [88.6, 25.4], [88.0, 24.6], [88.7, 23.2], [89.0, 22.0],
  [88.2, 21.6], [87.0, 21.5], [86.8, 20.6], [85.2, 19.6], [84.2, 18.4], [82.3, 17.0], [81.3, 16.3], [80.2, 15.5], [80.1, 13.8], [80.3, 13.0], [79.9, 11.0], [79.3, 10.3], [78.2, 8.9], [77.5, 8.1],
  [76.6, 8.9], [76.0, 10.5], [75.3, 12.3], [74.6, 14.5], [73.7, 16.0], [73.0, 18.5], [72.8, 19.5], [72.7, 21.1], [72.2, 21.7], [72.5, 22.3], [70.9, 20.8], [69.0, 22.3], [70.0, 23.0], [68.4, 23.6],
  [68.8, 24.3], [71.0, 24.4], [70.6, 25.7], [70.0, 26.6], [70.5, 27.9], [72.5, 29.9], [73.9, 30.4], [74.5, 31.0], [74.6, 32.0], [75.0, 32.5], [74.2, 33.0], [73.7, 34.3]];
for (const k in LANDMARKS) LANDMARKS[k].id = k;
const LANDMARK_BONUS = 0.03, HEX_R = 1.15;
const LM_CENTERS = [[0, 0], [3, -1], [-2, 3], [-3, 0]];
const NB = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, -1], [-1, 1]];
const hexPos = (q, r) => ({ x: HEX_R * Math.sqrt(3) * (q + r / 2), z: HEX_R * 1.5 * r });
const hexDist = (a, b) => (Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[0] + a[1] - b[0] - b[1])) / 2;
const PLAN = {};
// The tiles of a city in build order: a ring of houses and trees around each landmark, with its five parts in between
function cityPlan(ci) {
  if (PLAN[ci]) return PLAN[ci];
  const C = CITIES[ci], centers = C.lms.map((_, i) => LM_CENTERS[i]);
  const flower = new Set();
  centers.forEach(([q, r]) => { flower.add(q + ',' + r); NB.forEach(([a, b]) => flower.add((q + a) + ',' + (r + b))); });
  const ring = centers.map(() => []);
  for (let q = -7; q <= 7; q++) for (let r = -7; r <= 7; r++) {
    if (flower.has(q + ',' + r)) continue;
    const ds = centers.map(c => hexDist([q, r], c)), dmin = Math.min(...ds);
    if (dmin === 2) ring[ds.indexOf(dmin)].push([q, r]);
  }
  const tasks = [];
  centers.forEach((c, li) => {
    const deco = ring[li].sort((a, b) => hexDist(a, [0, 0]) - hexDist(b, [0, 0]) || Math.atan2(a[1], a[0]) - Math.atan2(b[1], b[0]));
    let d = 0;
    const pushDeco = n => { for (let j = 0; j < n && d < deco.length; j++, d++) tasks.push({ type: 'deco', li, hex: deco[d], gift: d % 3 === 2, kind: hashKind(deco[d], ci) }); };
    pushDeco(2);
    for (let k = 0; k < 5; k++) { tasks.push({ type: 'part', li, k, hex: c }); pushDeco(2); }
    pushDeco(99);
  });
  tasks.forEach((t, i) => { t.i = i; });
  return (PLAN[ci] = { tasks, centers });
}
function hashKind([q, r], ci) { const h = Math.abs((q * 73856093) ^ (r * 19349663) ^ (ci * 83492791)) % 10; return h < 4 ? 'tree' : h < 7 ? 'house' : h < 8 ? 'rock' : h < 9 ? 'palm' : 'bush'; }
// Prices and prizes both scale by 1.8× per city
function cityScale(ci = S.city ? S.city.i : 0) { return Math.pow(1.8, Math.min(ci, CITIES.length - 1)); }
function spinMult() { return landmarkBonus() * albumBonus() * petBonus('profit'); }
function taskCost(ci, t) { return Math.round(3000 * Math.pow(1.8, ci + t.i / cityPlan(ci).tasks.length) / 100) * 100; }
function taskReward(ci, t) { return t.gift ? { coins: Math.round(taskCost(ci, t) * 0.6 / 100) * 100, energy: 3 } : null; }
function taskName(ci, t) {
  if (t.type === 'part') { const L = LANDMARKS[CITIES[ci].lms[t.li]]; return `${tr(...L.name)}: ${tr(...lmParts(L)[t.k])}`; }
  return { tree: tr('Trees', 'చెట్లు'), house: tr('House', 'ఇల్లు'), rock: tr('Rock garden', 'రాతి తోట'), palm: tr('Palm trees', 'కొబ్బరి చెట్లు'), bush: tr('Garden', 'తోట') }[t.kind];
}
function taskIcon(ci, t) { return t.type === 'part' ? LANDMARKS[CITIES[ci].lms[t.li]].icon : { tree: 'tree', house: 'hut', rock: 'rock', palm: 'tree', bush: 'seedling' }[t.kind]; }
function cityDone(ci) { return ci < S.city.i; }
function taskBuilt(ci, i) { return cityDone(ci) || (ci === S.city.i && !!S.city.done[i]); }
function lmPartsBuilt(ci, li) { return cityPlan(ci).tasks.filter(t => t.type === 'part' && t.li === li && taskBuilt(ci, t.i)).length; }
function landmarksDone() { let n = 0; CITIES.forEach((C, ci) => C.lms.forEach((_, li) => { if (lmPartsBuilt(ci, li) >= 5) n++; })); return n; }
function landmarkBonus() { return 1 + LANDMARK_BONUS * (S.city ? landmarksDone() : 0); }
function allCitiesDone() { return S.city.i >= CITIES.length; }
function availableTasks() { if (allCitiesDone()) return []; return cityPlan(S.city.i).tasks.filter(t => !S.city.done[t.i]).slice(0, 3); }
function cityProgress(ci) { const T = cityPlan(ci).tasks; return { done: T.filter(t => taskBuilt(ci, t.i)).length, total: T.length }; }
function selTask() { const a = availableTasks(); return a.find(t => t.i === B3.sel) || a[0] || null; }
function nextTaskCost() { const a = availableTasks(); return a.length ? Math.min(...a.map(t => taskCost(S.city.i, t))) : Infinity; }
// Old saves built single landmarks: carry Charminar, Golconda and the Buddha statue over to Hyderabad
const PLAN_V = 2; // bump when city layouts change; saves then keep the same number of built tiles
function migrateBuild() {
  if (S.city.pv !== PLAN_V) {
    const n = Object.keys(S.city.done).length; S.city.done = {}; S.city.pv = PLAN_V;
    if (!allCitiesDone()) cityPlan(S.city.i).tasks.slice(0, n).forEach(t => { S.city.done[t.i] = true; });
  }
  if (S.city.migrated) return;
  S.city.migrated = true;
  const old = S.build && S.build.done || 0;
  const map = { charminar: 1, golconda: 2, buddha: 4 };
  cityPlan(0).tasks.forEach(t => { if (old >= map[CITIES[0].lms[t.li]]) S.city.done[t.i] = true; });
}

// ---- 3D city island (three.js is loaded only when this tab is first opened) ----
const B3 = { T: null, loading: false, failed: false, renderer: null, scene: null, camera: null, holder: null, shownKey: '', yaw: 0.6, drag: null, anims: [], raf: 0, lastT: 0, water: null, pick: [], floaters: [], focus: { x: 0, z: 0 }, sel: -1, tex: {} };
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
  qutub() {
    const P = [0, 1, 2, 3, 4].map(() => new B3.T.Group()), red = 0xb0583a, sand = 0xd8b890, marble = 0xe8dcc8;
    bx(2.4, 0.3, 2.4, sand, 0, 0.15, 0, P[0]); cy(0.75, 0.95, 2.0, red, 0, 1.3, 0, P[0], 24);
    for (const y of [0.8, 1.6]) cy(0.9, 0.9, 0.06, 0x7a3a22, 0, y, 0, P[0], 24);
    cy(1.0, 1.0, 0.14, sand, 0, 2.37, 0, P[1], 24); cy(0.62, 0.74, 1.5, red, 0, 3.15, 0, P[1], 24);
    cy(0.85, 0.85, 0.12, sand, 0, 3.95, 0, P[2], 24); cy(0.52, 0.6, 1.1, 0xc8784a, 0, 4.55, 0, P[2], 22);
    cy(0.72, 0.72, 0.1, sand, 0, 5.15, 0, P[3], 22); cy(0.42, 0.5, 0.9, marble, 0, 5.65, 0, P[3], 20); cy(0.36, 0.42, 0.55, red, 0, 6.38, 0, P[3], 20);
    cy(0.5, 0.5, 0.08, sand, 0, 6.68, 0, P[4], 18); sp(0.3, marble, 0, 6.9, 0, P[4], 1.1); co(0.05, 0.4, 0xd4a83a, 0, 7.35, 0, P[4]);
    return P;
  },
  lotus() {
    const P = [0, 1, 2, 3, 4].map(() => new B3.T.Group()), white = 0xf4f2ee;
    cy(2.5, 2.7, 0.3, 0xe8e4dc, 0, 0.15, 0, P[0], 9);
    const pool = b3Mesh(new B3.T.RingGeometry(1.9, 2.4, 9), b3Mat(0x3a8ad8), 0, 0.32, 0, P[0]); pool.rotation.x = -Math.PI / 2; pool.castShadow = false;
    const ring = (part, rad, y, sc, tilt, off) => {
      for (let i = 0; i < 9; i++) {
        const piv = new B3.T.Group(); piv.position.y = y; piv.rotation.y = i / 9 * Math.PI * 2 + off; part.add(piv);
        const pt = sp(0.9, white, rad, 0, 0, piv); pt.scale.set(sc[0], sc[1], sc[2]); pt.rotation.z = -tilt;
      }
    };
    ring(P[1], 1.35, 0.95, [0.25, 1.1, 0.5], 0.55, 0);
    ring(P[2], 0.9, 1.35, [0.22, 1.1, 0.42], 0.3, Math.PI / 9);
    ring(P[3], 0.45, 1.75, [0.2, 1.05, 0.34], 0.08, 0);
    sp(0.38, white, 0, 2.65, 0, P[4], 1.3); bx(0.8, 0.12, 0.6, 0xe8e4dc, 0, 0.36, 2.0, P[4]); bx(0.8, 0.12, 0.4, 0xe8e4dc, 0, 0.24, 2.4, P[4]);
    return P;
  },
  redfort() { return fortModel(0xb8452a); },
  agrafort() { return fortModel(0xa85a3a); },
};
function fortModel(red) {
  const P = [0, 1, 2, 3, 4].map(() => new B3.T.Group()), dark = 0x4a2418, marble = 0xf2ece0;
  bx(4.4, 1.0, 1.4, red, 0, 0.5, 0, P[0]);
  for (let x = -2.05; x <= 2.06; x += 0.41) bx(0.22, 0.24, 0.22, red, x, 1.12, 0.6, P[0]);
  bx(1.4, 1.7, 1.6, red, 0, 0.85, 0.1, P[1]); bx(0.6, 0.9, 0.06, dark, 0, 0.6, 0.92, P[1]);
  const top = cy(0.3, 0.3, 0.06, dark, 0, 1.05, 0.93, P[1], 16); top.rotation.x = Math.PI / 2;
  for (const x of [-2.1, 2.1]) { cy(0.42, 0.46, 1.9, red, x, 0.95, 0, P[2], 8); }
  for (const x of [-2.1, 2.1]) { for (const dx of [-0.18, 0.18]) cy(0.03, 0.03, 0.35, marble, x + dx, 2.07, 0, P[3], 6); sp(0.28, marble, x, 2.35, 0, P[3], 0.9); }
  for (const x of [-0.45, 0.45]) sp(0.22, marble, x, 1.95, 0.1, P[3], 0.9);
  cy(0.025, 0.025, 1.0, 0x5a3418, 0, 2.2, 0.1, P[4], 6);
  [[0xff9933, 2.6], [0xffffff, 2.48], [0x138808, 2.36]].forEach(([c, y]) => { const f = bx(0.55, 0.12, 0.02, c, 0.3, y, 0.1, P[4]); f.castShadow = false; });
  return P;
}
// Ready-made buildings shared by many landmarks; each takes colour options and returns five part groups
const G5 = () => [0, 1, 2, 3, 4].map(() => new B3.T.Group());
const GOLD = 0xe0b030;
const glow = c => new B3.T.MeshBasicMaterial({ color: c });
function noShadow(m) { m.castShadow = false; return m; }
function halfDome(r, c, x, y, z, p) { return b3Mesh(new B3.T.SphereGeometry(r, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), c, x, y, z, p); }
// A thin bar from (x1, y1) to (x2, y2) at depth z
function beam(x1, y1, x2, y2, z, t, c, p) {
  const L = Math.hypot(x2 - x1, y2 - y1), m = bx(L, t, t, c, (x1 + x2) / 2, (y1 + y2) / 2, z, p);
  m.rotation.z = Math.atan2(y2 - y1, x2 - x1); return m;
}
const BTYPES = {
  fort: o => fortModel(o.c),
  // North Indian temple with a curved shikhara
  nagara(o) {
    const P = G5(), c = o.c || 0xf4f0e8, a = o.a || 0xd85a3a, sc = o.sc || c, h = o.h || 1, zS = -0.6;
    bx(3.8, 0.4, 3.4, 0xd8ccb8, 0, 0.2, 0, P[0]); bx(1.2, 0.2, 0.5, 0xd8ccb8, 0, 0.1, 1.95, P[0]);
    bx(2.2, 0.9, 1.4, c, 0, 0.85, 0.85, P[1]);
    for (const x of [-0.9, -0.3, 0.3, 0.9]) cy(0.08, 0.08, 0.9, c, x, 0.85, 1.6, P[1], 8);
    const rf = co(1.4, 0.75, a, 0, 1.68, 0.85, P[1], 4); rf.rotation.y = Math.PI / 4;
    bx(1.7, 1.3, 1.7, c, 0, 1.05, zS, P[2]); bx(0.45, 0.7, 0.05, 0x4a3020, 0, 0.95, zS + 0.86, P[2]);
    const n = 7, sh = 0.42 * h, y0 = 1.7;
    for (let i = 0; i < n; i++) {
      const r0 = 0.88 * (1 - Math.pow(i / n, 1.7) * 0.8), r1 = 0.88 * (1 - Math.pow((i + 1) / n, 1.7) * 0.8);
      const s = cy(r1, r0, sh, o.band && i % 2 ? a : sc, 0, y0 + sh * (i + 0.5), zS, P[3], 8); s.rotation.y = Math.PI / 8;
    }
    for (const x of [-0.78, 0.78]) co(0.3, 1.3 * h, sc, x, y0 + 0.65 * h, zS, P[3], 8);
    if (o.nine) for (const [x, z] of [[-0.9, 0.3], [0.9, 0.3], [-0.9, 1.4], [0.9, 1.4], [-0.9, -1.3], [0.9, -1.3], [0, 1.5], [0, -1.4]]) co(0.22, 0.9, sc, x, 1.75, z, P[3], 8);
    const top = y0 + sh * n;
    cy(0.3, 0.3, 0.14, o.top || 0xe8dcc0, 0, top + 0.07, zS, P[4], 16); sp(0.14, GOLD, 0, top + 0.26, zS, P[4], 1.3); co(0.05, 0.32, GOLD, 0, top + 0.48, zS, P[4]);
    cy(0.015, 0.015, 0.9, 0x5a3418, 0.18, top + 0.55, zS, P[4], 6); noShadow(bx(0.42, 0.24, 0.02, 0xff8a1a, 0.4, top + 0.88, zS, P[4]));
    return P;
  },
  // South Indian temple tower
  gopuram(o) {
    const P = G5(), n = o.tiers || 7, c = o.c || 0xf0d8a8, cols = o.colorful ? [0xd84a3a, 0x3a7ad8, 0x3ccf6e, 0xffc83d, 0xff7ab8, 0x8a5ad8] : null;
    const tierH = Math.min(0.5, 4.2 / n), step = (3.0 - 0.7) / n;
    bx(3.2, 1.1, 1.8, 0x9a8a78, 0, 0.55, 0, P[0]); bx(0.7, 0.85, 0.05, 0x3a2818, 0, 0.45, 0.92, P[0]); bx(3.35, 0.12, 1.95, 0x8a7a68, 0, 1.16, 0, P[0]);
    const per = Math.ceil(n / 3);
    for (let i = 0; i < n; i++) {
      const p = P[1 + Math.min(2, Math.floor(i / per))], w = 3.0 - i * step, d = 1.6 - i * (0.9 / n), y = 1.22 + tierH * (i + 0.5);
      bx(w, tierH * 0.86, d, c, 0, y, 0, p); bx(w + 0.1, tierH * 0.14, d + 0.1, o.trim || 0xd8b070, 0, y + tierH * 0.43, 0, p);
      bx(0.2, tierH * 0.6, 0.06, 0x3a2818, 0, y, d / 2 + 0.02, p);
      const k = Math.max(1, Math.floor(w / 0.55));
      for (let j = -k; j <= k; j++) if (j) for (const sz of [1, -1]) bx(0.12, tierH * 0.55, 0.05, cols ? cols[(i * 3 + j + 9) % cols.length] : 0xe8dcc8, j * (w / (2 * k + 1)), y, sz * (d / 2 + 0.03), p);
    }
    const top = 1.22 + tierH * n, rc = o.roof || (o.colorful ? 0xd85a3a : 0xd8b070);
    bx(1.0, 0.2, 0.62, rc, 0, top + 0.1, 0, P[4]);
    const v = cy(0.3, 0.3, 1.0, rc, 0, top + 0.35, 0, P[4], 16); v.rotation.z = Math.PI / 2;
    for (const x of [-0.6, 0.6]) sp(0.16, rc, x, top + 0.35, 0, P[4]);
    for (const x of [-0.36, -0.18, 0, 0.18, 0.36]) { sp(0.07, GOLD, x, top + 0.7, 0, P[4]); co(0.04, 0.18, GOLD, x, top + 0.83, 0, P[4]); }
    return P;
  },
  // Mughal-style tomb or memorial with a big dome
  tomb(o) {
    const P = G5(), c = o.c || 0xf6f2ea, dc = o.dc || c, s = o.small ? 0.8 : 1;
    if (o.sea) { noShadow(cy(2.7, 2.7, 0.08, 0x3a8ad8, 0, 0.04, 0, P[0], 32)); bx(2.6, 0.35, 2.6, 0x9a958c, 0, 0.175, -0.3, P[0]); bx(0.5, 0.18, 1.8, 0x9a958c, 0, 0.12, 1.9, P[0]); }
    else bx(4.2, 0.35, 4.2, 0xece6da, 0, 0.175, 0, P[0]);
    bx(2.6 * s, 1.5 * s, 2.6 * s, c, 0, 0.35 + 0.75 * s, o.sea ? -0.3 : 0, P[1]);
    for (const [fx, fz, r] of FACES) { const a = bx(0.8 * s, 1.1 * s, 0.06, 0x7a7066, fx * 1.31 * s, 0.35 + 0.6 * s, fz * 1.31 * s + (o.sea ? -0.3 : 0), P[1]); a.rotation.y = r; }
    const z0 = o.sea ? -0.3 : 0, yR = 0.35 + 1.5 * s;
    cy(0.8 * s, 0.85 * s, 0.4, c, 0, yR + 0.2, z0, P[2], 24); sp(1.0 * s, dc, 0, yR + 0.75 * s, z0, P[2], 1.1); co(0.06, 0.55, GOLD, 0, yR + 1.95 * s, z0, P[2]);
    if (o.angel) { sp(0.14, GOLD, 0, yR + 2.3 * s, z0, P[2]); noShadow(bx(0.5, 0.06, 0.1, GOLD, 0, yR + 2.3 * s, z0, P[2])); }
    for (const [sx, sz] of CORNERS) {
      if (o.sea || o.small) { cy(0.17, 0.2, 0.6, c, sx * 1.15 * s, yR + 0.3, sz * 1.15 * s + z0, P[3]); sp(0.2, dc, sx * 1.15 * s, yR + 0.7, sz * 1.15 * s + z0, P[3], 1.2); }
      else { cy(0.15, 0.18, 2.6, c, sx * 1.85, 1.65, sz * 1.85, P[3]); sp(0.2, dc, sx * 1.85, 3.05, sz * 1.85, P[3]); }
    }
    if (o.sea) { for (const x of [-0.25, 0.25]) for (const z of [1.3, 1.9, 2.5]) cy(0.03, 0.03, 0.6, 0x5a3418, x, 0.5, z, P[4], 6); noShadow(bx(0.6, 0.04, 1.4, 0xf0e0a0, 0, 0.8, 1.9, P[4])); }
    else for (const x of [-0.65, 0.65]) for (const z of [2.4, 3.0, 3.6]) co(0.18, 0.7, 0x2f6a24, x, 0.7, z * 0.95, P[4], 7);
    if (!o.sea) { const pool = bx(0.45, 0.05, 1.6, 0x3a8ad8, 0, 0.37, 3.0, P[4]); pool.castShadow = false; }
    return P;
  },
  gateway(o) {
    const P = G5(), c = o.c, dc = o.dc || c;
    bx(4.2, 0.35, 1.8, 0xb8a88a, 0, 0.175, 0, P[0]);
    for (const x of [-1.45, 1.45]) { bx(1.2, 2.8, 1.5, c, x, 1.75, 0, P[1]); bx(0.4, 0.9, 0.05, 0x4a3020, x, 1.6, 0.76, P[1]); }
    bx(1.7, 0.9, 1.5, c, 0, 2.7, 0, P[2]); const ar = cy(0.85, 0.85, 1.5, c, 0, 2.25, 0, P[2], 20); ar.rotation.x = Math.PI / 2;
    bx(4.3, 0.25, 1.7, c, 0, 3.27, 0, P[3]);
    for (const [sx, sz] of CORNERS) cy(0.22, 0.22, 0.8, c, sx * 1.9, 3.8, sz * 0.6, P[3], 10);
    if (o.chhatri) for (const x of [-1.2, -0.6, 0, 0.6, 1.2]) for (const dx of [-0.12, 0.12]) cy(0.03, 0.03, 0.4, c, x + dx, 3.6, 0, P[3], 6);
    for (const [sx, sz] of CORNERS) sp(0.26, dc, sx * 1.9, 4.3, sz * 0.6, P[4], 1.1);
    if (o.dome) sp(0.75, dc, 0, 3.4, 0, P[4], 0.9);
    if (o.chhatri) for (const x of [-1.2, -0.6, 0, 0.6, 1.2]) sp(0.2, dc, x, 3.85, 0, P[4], 0.9);
    if (o.flag) { cy(0.03, 0.03, 2.4, 0xdddddd, 0, 4.6, 0, P[4], 6); [[0xff9933, 5.6], [0xffffff, 5.4], [0x138808, 5.2]].forEach(([fc, y]) => noShadow(bx(0.9, 0.2, 0.02, fc, 0.47, y, 0, P[4]))); }
    return P;
  },
  palace(o) {
    const P = G5(), c = o.c, dc = o.dc, trim = o.trim || 0xf2ece0;
    bx(4.4, 1.1, 1.6, c, 0, 0.55, 0, P[0]); for (let x = -1.8; x <= 1.81; x += 0.6) bx(0.32, 0.6, 0.05, 0x4a3020, x, 0.5, 0.81, P[0]);
    bx(4.6, 0.1, 1.75, trim, 0, 1.12, 0, P[1]); bx(4.0, 0.9, 1.4, c, 0, 1.6, 0, P[1]);
    for (let x = -1.6; x <= 1.61; x += 0.4) bx(0.18, 0.4, 0.05, 0x5a6a8a, x, 1.6, 0.71, P[1]); bx(4.1, 0.1, 1.5, trim, 0, 2.08, 0, P[1]);
    bx(1.2, 1.5, 1.2, c, 0, 2.85, 0.1, P[2]); for (const y of [2.6, 3.2]) bx(0.3, 0.35, 0.05, 0x5a6a8a, 0, y, 0.71, P[2]);
    for (const x of [-2.0, 2.0]) { bx(0.7, 1.1, 0.7, c, x, 2.6, 0, P[3]); sp(0.36, dc, x, 3.2, 0, P[3], 0.9); if (o.spires) co(0.05, 0.4, dc, x, 3.6, 0, P[3], 6); }
    for (const x of [-1.0, 1.0]) sp(0.25, dc, x, 2.2, 0.3, P[3], 1.0);
    sp(0.62, dc, 0, 3.75, 0.1, P[4], 1.25); co(0.05, 0.5, GOLD, 0, 4.7, 0.1, P[4]);
    if (o.spires) for (const [sx, sz] of CORNERS) co(0.06, 0.6, dc, sx * 0.55, 3.9, 0.1 + sz * 0.55, P[4], 6);
    cy(0.015, 0.015, 0.7, 0x5a3418, 0, 5.1, 0.1, P[4], 6); noShadow(bx(0.35, 0.2, 0.02, 0xff8a1a, 0.18, 5.35, 0.1, P[4]));
    return P;
  },
  // Hawa Mahal: five stepped pink storeys of little bay windows
  hawa() {
    const P = G5(), pink = 0xe8866a, cream = 0xf6e2c4;
    for (let i = 0; i < 5; i++) {
      const w = 4.2 - i * 0.65, y = 0.42 + 0.8 * i;
      bx(w, 0.8, 0.9, pink, 0, y, -i * 0.05, P[i]); bx(w + 0.08, 0.06, 1.0, cream, 0, y + 0.4, -i * 0.05, P[i]);
      const k = Math.max(1, Math.floor(w / 0.42));
      for (let j = 0; j < k; j++) {
        const x = -w / 2 + (j + 0.5) * (w / k);
        cy(0.15, 0.15, 0.5, pink, x, y - 0.05, 0.45 - i * 0.05, P[i], 8); bx(0.12, 0.22, 0.05, cream, x, y - 0.05, 0.6 - i * 0.05, P[i]);
        sp(0.15, i === 4 ? 0xd8605a : pink, x, y + 0.26, 0.45 - i * 0.05, P[i], 0.8);
      }
    }
    for (const x of [-0.45, 0, 0.45]) co(0.04, 0.3, GOLD, x, 4.55, -0.2, P[4]);
    return P;
  },
  // Jantar Mantar: a stepped sundial with arcs either side
  jantar() {
    const P = G5(), c = 0xe8c8a0, red = 0xc86a4a;
    bx(4.2, 0.25, 3.6, 0xe8d8b8, 0, 0.125, 0, P[0]);
    for (let k = 0; k < 8; k++) { const h = 0.35 * (k + 1); bx(0.6, h, 0.42, c, 0, 0.25 + h / 2, 1.5 - k * 0.42, P[1]); }
    for (const x of [-1.0, 1.0]) {
      const arc = b3Mesh(new B3.T.TorusGeometry(1.25, 0.12, 6, 20, Math.PI / 2), red, x, 0.25, -0.2, P[2]); arc.rotation.y = Math.PI / 2;
      bx(0.3, 0.12, 2.6, c, x, 0.31, -0.2, P[2]);
    }
    const ty = 0.25 + 0.35 * 8;
    for (const [sx, sz] of CORNERS) cy(0.04, 0.04, 0.5, c, sx * 0.24, ty + 0.25, -1.44 + sz * 0.16, P[3], 6);
    sp(0.36, red, 0, ty + 0.55, -1.44, P[3], 0.6);
    for (const x of [-1.5, 1.5]) { const b = halfDome(0.5, c, x, 0.75, 1.3, P[4]); b.rotation.x = Math.PI; cy(0.5, 0.5, 0.1, red, x, 0.75, 1.3, P[4], 20); }
    cy(0.3, 0.3, 0.6, c, 0, 0.55, 2.05, P[4], 12);
    return P;
  },
  // Golden Temple in its holy pool
  golden() {
    const P = G5(), marble = 0xf2ece0;
    bx(4.4, 0.2, 4.4, marble, 0, 0.1, 0, P[0]); noShadow(bx(3.8, 0.06, 3.8, 0x3a8ad8, 0, 0.22, 0, P[0]));
    bx(0.5, 0.2, 1.9, marble, 0, 0.3, 1.45, P[1]); bx(1.7, 0.25, 1.7, marble, 0, 0.33, 0, P[1]);
    bx(1.3, 0.6, 1.3, marble, 0, 0.75, 0, P[2]); bx(1.3, 0.6, 1.3, GOLD, 0, 1.35, 0, P[2]);
    for (const [fx, fz, r] of FACES) { const w = bx(0.3, 0.35, 0.05, 0x9a6a10, fx * 0.66, 1.35, fz * 0.66, P[2]); w.rotation.y = r; }
    cy(0.5, 0.55, 0.14, GOLD, 0, 1.72, 0, P[3], 16); sp(0.45, GOLD, 0, 1.95, 0, P[3], 0.95);
    for (const [sx, sz] of CORNERS) sp(0.13, GOLD, sx * 0.55, 1.78, sz * 0.55, P[3], 1.2);
    co(0.06, 0.35, GOLD, 0, 2.55, 0, P[4]);
    cy(0.03, 0.03, 3.2, 0xe8e8e8, 1.8, 1.8, 1.8, P[4], 6); noShadow(bx(0.5, 0.32, 0.02, 0xff8a1a, 2.06, 3.2, 1.8, P[4]));
    return P;
  },
  memorial() {
    const P = G5(), red = 0xb8452a;
    bx(3.8, 0.15, 3.4, 0x6fbf4a, 0, 0.075, 0, P[0]); bx(0.6, 0.16, 3.4, 0xd8c8a0, 0, 0.08, 0, P[0]);
    bx(1.6, 0.35, 1.6, 0xa85a3a, 0, 0.32, 0, P[1]); bx(1.2, 0.3, 1.2, 0xa85a3a, 0, 0.62, 0, P[1]);
    const pil = cy(0.22, 0.65, 2.8, red, 0, 2.17, 0, P[2], 4); pil.rotation.y = Math.PI / 4;
    bx(3.4, 1.0, 0.25, 0xa08060, 0, 0.65, -1.5, P[3]); for (let i = 0; i < 9; i++) bx(0.06, 0.06, 0.03, 0x3a2a1a, -1.2 + i * 0.3, 0.5 + (i % 3) * 0.2, -1.36, P[3]);
    cy(0.35, 0.35, 0.3, 0xf0f0f0, 1.3, 0.3, 0.9, P[3], 16); noShadow(cy(0.28, 0.28, 0.02, 0x2a4a6a, 1.3, 0.46, 0.9, P[3], 16));
    const fl = co(0.16, 0.45, glow(0xff8a1a), 0, 3.8, 0, P[4], 8); fl.castShadow = false; P[4].userData.flame = fl;
    for (const [x, z] of [[-1.4, 1.1], [-1.5, -0.6], [1.5, -0.7]]) { cy(0.06, 0.08, 0.5, 0x7a5232, x, 0.4, z, P[4], 6); b3Mesh(new B3.T.IcosahedronGeometry(0.35, 0), 0x3f9a3a, x, 0.85, z, P[4]); }
    return P;
  },
  // River ghats: steps down into the water, houses and temples behind
  ghat() {
    const P = G5(), stone = 0xd8b890, top = 0.22 * 6;
    noShadow(bx(4.6, 0.05, 1.2, 0x4a8ab8, 0, 0.03, 2.3, P[0]));
    for (let k = 0; k < 6; k++) bx(4.4, 0.22 * (k + 1), 0.45, stone, 0, 0.11 * (k + 1), 1.5 - k * 0.45, P[0]);
    [[0xf2e0c0, 1.4], [0xe8a060, 1.9], [0xf4f0e8, 1.2], [0xd8c0ff, 1.7], [0xf0c870, 1.5]].forEach(([c, h], i) => { bx(0.8, h, 0.9, c, -1.8 + i * 0.9, top + h / 2, -1.3, P[1]); bx(0.2, 0.3, 0.05, 0x4a3020, -1.8 + i * 0.9, top + 0.4, -0.84, P[1]); });
    for (const x of [-1.35, 0.45]) { bx(0.5, 0.5, 0.5, 0xf4e0c0, x, top + 0.25, -0.5, P[2]); const s = co(0.3, 1.1, 0xf0d0a0, x, top + 1.05, -0.5, P[2], 8); s.rotation.y = Math.PI / 8; sp(0.06, GOLD, x, top + 1.65, -0.5, P[2]); }
    for (const [x, z, y] of [[-1.2, 0.6, 0.66], [0.2, 0.15, 0.88], [1.3, 0.6, 0.66]]) { cy(0.02, 0.02, 0.6, 0x5a3418, x, y + 0.3, z, P[3], 6); co(0.42, 0.22, 0xd8b060, x, y + 0.65, z, P[3], 10); }
    for (const x of [-1.2, 0.9]) { bx(0.9, 0.15, 0.3, 0x8a5a2a, x, 0.1, 2.4, P[4]); bx(0.06, 0.4, 0.06, 0x8a5a2a, x, 0.35, 2.4, P[4]); }
    for (let i = 0; i < 6; i++) { const f = sp(0.05, glow(0xffb030), -1.6 + i * 0.65, 0.5, 1.3, P[4]); f.castShadow = false; }
    return P;
  },
  stupa(o) {
    const P = G5(), c = 0xe0d0b0, brick = 0xb06a4a;
    if (o.tall) {
      cy(1.6, 1.7, 0.5, 0xc8b898, 0, 0.25, 0, P[0], 24);
      cy(1.35, 1.4, 1.6, c, 0, 1.3, 0, P[1], 24); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, n = bx(0.35, 0.5, 0.05, 0x8a7a68, Math.sin(a) * 1.38, 1.4, Math.cos(a) * 1.38, P[1]); n.rotation.y = a; }
      cy(1.25, 1.33, 1.6, brick, 0, 2.9, 0, P[2], 24);
      sp(1.25, brick, 0, 3.7, 0, P[3], 0.45);
      cy(0.02, 0.02, 1.0, 0x5a3418, 0, 4.6, 0, P[4], 6); for (const [x, col] of [[-0.6, 0xff4a3a], [0.6, 0x3a8ad8]]) noShadow(beam(0, 4.9, x * 2.2, 0.8, 0, 0.02, col, P[4]));
      return P;
    }
    cy(2.0, 2.1, 0.6, c, 0, 0.3, 0, P[0], 32);
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; if (i % 6 === 0) continue; bx(0.1, 0.5, 0.1, 0xc8b898, Math.sin(a) * 2.35, 0.25, Math.cos(a) * 2.35, P[1]); }
    const rail = b3Mesh(new B3.T.TorusGeometry(2.35, 0.05, 6, 40), 0xc8b898, 0, 0.48, 0, P[1]); rail.rotation.x = Math.PI / 2;
    for (let i = 0; i < 4; i++) { const g = new B3.T.Group(); g.rotation.y = i * Math.PI / 2; P[1].add(g); for (const x of [-0.35, 0.35]) bx(0.12, 1.1, 0.12, 0xc8b898, x, 0.55, 2.4, g); for (const y of [0.95, 1.15]) bx(1.0, 0.08, 0.1, 0xc8b898, 0, y, 2.4, g); }
    halfDome(1.7, c, 0, 0.6, 0, P[2]);
    bx(0.6, 0.35, 0.6, 0xc8b898, 0, 2.45, 0, P[3]);
    cy(0.03, 0.03, 0.9, 0xc8b898, 0, 2.95, 0, P[4], 6); for (const [y, r] of [[2.85, 0.45], [3.1, 0.35], [3.35, 0.25]]) cy(r, r, 0.05, 0xc8b898, 0, y, 0, P[4], 16);
    return P;
  },
  // Howrah Bridge: two steel towers and a cantilever frame
  bridge() {
    const P = G5(), steel = 0x7a8a9a;
    noShadow(bx(5.2, 0.06, 1.8, 0x4a8ab8, 0, 0.03, 0, P[0])); for (const x of [-1.5, 1.5]) bx(0.7, 0.5, 1.4, 0x8a8a8a, x, 0.25, 0, P[0]);
    for (const x of [-1.5, 1.5]) { for (const dx of [-0.25, 0.25]) for (const z of [-0.55, 0.55]) bx(0.12, 3.4, 0.12, steel, x + dx, 2.2, z, P[1]); for (const y of [1.6, 2.6, 3.6]) for (const z of [-0.55, 0.55]) bx(0.62, 0.08, 0.08, steel, x, y, z, P[1]); bx(0.62, 0.1, 1.22, steel, x, 3.9, 0, P[1]); }
    for (const z of [-0.55, 0.55]) { beam(-1.5, 3.9, 0, 2.2, z, 0.1, steel, P[2]); beam(1.5, 3.9, 0, 2.2, z, 0.1, steel, P[2]); beam(-1.5, 3.9, -2.55, 1.6, z, 0.1, steel, P[2]); beam(1.5, 3.9, 2.55, 1.6, z, 0.1, steel, P[2]); beam(-2.55, 1.1, 2.55, 1.1, z, 0.1, steel, P[2]); for (const x of [-2.0, -0.75, 0.75, 2.0]) beam(x, 1.1, x, x < 0 ? 1.6 + (x + 2.55) * 0.9 : 1.6 + (2.55 - x) * 0.9, z, 0.07, steel, P[2]); }
    bx(5.2, 0.12, 1.0, 0x5a5a5a, 0, 1.0, 0, P[3]); noShadow(bx(5.2, 0.01, 0.06, 0xffffff, 0, 1.07, 0, P[3]));
    [[-1.8, 0.25, 0xffd23d], [-0.6, -0.25, 0xd84a3a], [0.7, 0.25, 0xffd23d], [1.9, -0.25, 0x3a7ad8]].forEach(([x, z, c]) => { bx(0.45, 0.2, 0.25, c, x, 1.16, z, P[4]); bx(0.25, 0.12, 0.22, 0x2a3a4a, x, 1.3, z, P[4]); });
    return P;
  },
  barrage() {
    const P = G5(), pier = 0xa8a29a;
    noShadow(bx(5.0, 0.06, 2.2, 0x4a8ab8, 0, 0.03, 0, P[0])); bx(5.0, 0.12, 0.3, 0x8a8478, 0, 0.06, 1.0, P[0]);
    for (let i = 0; i < 10; i++) bx(0.18, 0.9, 1.3, pier, -2.25 + i * 0.5, 0.45, 0, P[1]);
    for (let i = 0; i < 9; i++) bx(0.32, 0.55, 0.06, 0x3a6a8a, -2.0 + i * 0.5, 0.35, 0.25, P[2]);
    bx(5.0, 0.15, 1.4, 0x8a8a8a, 0, 0.98, 0, P[3]); for (const z of [-0.66, 0.66]) bx(5.0, 0.12, 0.04, 0xf0f0f0, 0, 1.12, z, P[3]);
    for (let i = 0; i < 5; i++) { const x = -2.0 + i; cy(0.02, 0.02, 0.6, 0x4a4a4a, x, 1.35, 0.6, P[4], 6); const l = sp(0.07, glow(0xffe08a), x, 1.67, 0.6, P[4]); l.castShadow = false; }
    return P;
  },
  // Konark: the Sun God's stone chariot
  konark() {
    const P = G5(), st = 0x9a7a62;
    bx(3.4, 0.6, 2.2, st, -0.2, 0.3, 0, P[0]); bx(3.6, 0.08, 2.4, 0x8a6a52, -0.2, 0.62, 0, P[0]);
    for (let k = 0; k < 6; k++) for (const z of [-1.13, 1.13]) {
      const x = -1.7 + k * 0.6; b3Mesh(new B3.T.TorusGeometry(0.25, 0.05, 6, 16), 0x7a5a42, x, 0.32, z, P[1]);
      for (const r of [0, Math.PI / 2]) { const s = bx(0.48, 0.04, 0.04, 0x7a5a42, x, 0.32, z, P[1]); s.rotation.z = r + Math.PI / 4; }
    }
    for (let i = 0; i < 6; i++) bx(2.2 - i * 0.32, 0.32, 1.9 - i * 0.28, st, -0.2, 0.82 + i * 0.34, 0, P[2]);
    for (let i = 0; i < 7; i++) { const z = -0.9 + i * 0.3; bx(0.5, 0.22, 0.14, st, 1.85, 0.75, z, P[3]); const nk = bx(0.12, 0.3, 0.12, st, 2.1, 0.95, z, P[3]); nk.rotation.z = -0.4; for (const dx of [1.68, 2.02]) bx(0.06, 0.35, 0.06, st, dx, 0.47, z, P[3]); }
    const ty = 0.82 + 6 * 0.34;
    cy(0.35, 0.35, 0.14, 0xb8987a, -0.2, ty, 0, P[4], 16); sp(0.14, GOLD, -0.2, ty + 0.2, 0, P[4], 1.2);
    return P;
  },
  lighthouse() {
    const P = G5(), w = 0xf0ece4, red = 0xd84a3a;
    bx(1.9, 0.6, 1.9, 0xd8d0c0, 0, 0.3, 0, P[0]); bx(0.4, 0.5, 0.05, 0x4a3020, 0, 0.3, 0.96, P[0]);
    cy(0.62, 0.72, 1.8, w, 0, 1.5, 0, P[1], 10);
    cy(0.53, 0.62, 1.8, red, 0, 3.3, 0, P[2], 10);
    cy(0.45, 0.53, 1.6, w, 0, 5.0, 0, P[3], 10);
    cy(0.65, 0.65, 0.1, 0x3a3a3a, 0, 5.85, 0, P[4], 16); const lamp = cy(0.32, 0.32, 0.5, glow(0xfff2a0), 0, 6.15, 0, P[4], 12); lamp.castShadow = false; co(0.4, 0.4, red, 0, 6.6, 0, P[4], 12);
    return P;
  },
  church() {
    const P = G5(), w = 0xf6f4ee, roof = 0x8a9aaa;
    bx(3.0, 0.25, 4.2, 0xe0dcd4, 0, 0.125, -0.1, P[0]);
    bx(1.8, 1.6, 3.0, w, 0, 1.05, -0.6, P[1]); const r = cy(1.1, 1.1, 3.0, roof, 0, 2.4, -0.6, P[1], 3); r.rotation.x = -Math.PI / 2;
    bx(1.0, 2.6, 1.0, w, 0, 1.55, 1.4, P[2]); bx(0.4, 0.8, 0.05, 0x4a3020, 0, 0.65, 1.91, P[2]);
    co(0.62, 2.3, w, 0, 4.0, 1.4, P[3], 8); for (const [sx, sz] of CORNERS) co(0.08, 0.5, w, sx * 0.45, 3.1, 1.4 + sz * 0.45, P[3], 6);
    bx(0.07, 0.55, 0.07, GOLD, 0, 5.4, 1.4, P[4]); bx(0.32, 0.07, 0.07, GOLD, 0, 5.5, 1.4, P[4]);
    noShadow(cy(0.25, 0.25, 0.04, 0x3a6ad8, 0, 2.3, 1.91, P[4], 16)).rotation.x = Math.PI / 2;
    for (const sx of [-0.91, 0.91]) for (const z of [-1.6, -0.6, 0.4]) bx(0.05, 0.6, 0.25, 0x3a6ad8, sx, 1.15, z, P[4]);
    return P;
  },
  // Brindavan Gardens below the KRS dam
  garden() {
    const P = G5(), green = 0x5fae3a, blue = 0x4ab0e8;
    for (let k = 0; k < 3; k++) bx(4.2, 0.2 * (k + 1), 1.0, green, 0, 0.1 * (k + 1), 1.4 - k * 1.0, P[0]);
    bx(4.4, 1.6, 0.5, 0xa8a090, 0, 0.8, -1.75, P[1]); for (let i = 0; i < 7; i++) bx(0.25, 0.3, 0.05, 0x5a6a7a, -1.8 + i * 0.6, 1.3, -1.49, P[1]);
    for (let k = 0; k < 3; k++) noShadow(bx(0.4, 0.04, 1.0, blue, 0, 0.2 * (k + 1) + 0.02, 1.4 - k * 1.0, P[2]));
    for (const [x, z, y] of [[0, 1.4, 0.2], [0, 0.4, 0.4], [0, -0.6, 0.6], [-1.3, 0.9, 0.3], [1.3, 0.9, 0.3]]) { const f = co(0.14, 0.9, glow(0xcfefff), x, y + 0.45, z, P[3], 8); f.castShadow = false; }
    [0xff6aa8, 0xffd23d, 0x7aff8a, 0x6ac8ff, 0xff8a3d].forEach((c, i) => { for (const x of [-1.9, 1.9]) { const l = sp(0.09, glow(c), x, 0.3 + (i % 3) * 0.2, 1.6 - i * 0.7, P[4]); l.castShadow = false; } });
    for (const x of [-1.3, 1.3]) for (const z of [0.4, -0.6]) b3Mesh(new B3.T.IcosahedronGeometry(0.22, 0), 0xff7ab8, x, z > 0 ? 0.55 : 0.75, z, P[4]);
    return P;
  },
  // Kakatiya Kala Thoranam: the carved stone gate of Warangal
  thoranam() {
    const P = G5(), c = 0xb0aaa0;
    bx(3.4, 0.3, 1.4, 0x9a958c, 0, 0.15, 0, P[0]);
    for (const x of [-1.1, 1.1]) { bx(0.45, 2.6, 0.45, c, x, 1.6, 0, P[1]); for (const y of [0.8, 1.6, 2.4]) bx(0.55, 0.12, 0.55, 0x9a958c, x, y, 0, P[1]); }
    bx(3.0, 0.35, 0.55, c, 0, 3.05, 0, P[2]); for (const x of [-0.75, 0.75]) beam(x * 1.25, 2.6, x, 2.88, 0, 0.12, c, P[2]);
    bx(2.4, 0.55, 0.35, c, 0, 3.5, 0, P[3]); const orn = cy(0.45, 0.45, 0.35, c, 0, 3.85, 0, P[3], 16); orn.rotation.x = Math.PI / 2;
    for (const x of [-0.6, 0.6]) sp(0.16, c, x, 3.85, 0, P[3]);
    for (const x of [-1.25, 1.25]) { sp(0.2, c, x, 3.42, 0, P[4], 0.8); const nk = cy(0.05, 0.07, 0.35, c, x * 0.92, 3.6, 0, P[4], 6); nk.rotation.z = x > 0 ? 0.4 : -0.4; sp(0.08, c, x * 0.85, 3.78, 0, P[4]); }
    sp(0.12, c, 0, 4.15, 0, P[4], 1.3);
    return P;
  },
  // Thousand Pillar Temple: a star-shaped hall of black stone pillars
  mandapa() {
    const P = G5(), basalt = 0x6a6660, st = 0x8a8478;
    bx(3.0, 0.45, 3.0, st, 0, 0.225, -0.3, P[0]); const b2 = bx(3.0, 0.45, 3.0, st, 0, 0.225, -0.3, P[0]); b2.rotation.y = Math.PI / 4;
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; cy(0.09, 0.1, 1.3, basalt, Math.sin(a) * 1.3, 1.1, -0.3 + Math.cos(a) * 1.3, P[1], 8); }
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.2; cy(0.09, 0.1, 1.3, basalt, Math.sin(a) * 0.65, 1.1, -0.3 + Math.cos(a) * 0.65, P[1], 8); }
    cy(1.6, 1.6, 0.2, 0x7a756c, 0, 1.85, -0.3, P[2], 8); cy(1.75, 1.75, 0.08, st, 0, 1.98, -0.3, P[2], 8);
    for (const a of [Math.PI / 2, Math.PI, -Math.PI / 2]) { const x = Math.sin(a) * 1.0, z = -0.3 + Math.cos(a) * 1.0; bx(0.7, 0.55, 0.7, 0x7a756c, x, 2.3, z, P[3]); const t = co(0.45, 0.7, 0x7a756c, x, 2.92, z, P[3], 4); t.rotation.y = Math.PI / 4; }
    bx(1.0, 0.3, 0.6, st, 0, 0.15, 2.1, P[4]);
    const body = sp(0.35, 0x2e2e2e, 0, 0.6, 2.1, P[4]); body.scale.set(1.5, 0.8, 0.9);
    sp(0.17, 0x2e2e2e, 0.48, 0.78, 2.1, P[4]); for (const z of [2.0, 2.2]) co(0.03, 0.12, 0x2e2e2e, 0.5, 0.97, z, P[4], 6);
    return P;
  },
};
BTYPE_PARTS.fort = [['Fort walls', 'కోట గోడలు'], ['Main gate', 'ప్రధాన ద్వారం'], ['Towers', 'బురుజులు'], ['Pavilions', 'మండపాలు'], ['Flag', 'జెండా']];
function lmModel(id) { const L = LANDMARKS[id]; return MODELS[L.model || id] ? MODELS[L.model || id]() : BTYPES[L.type](L.o || {}); }
function lmParts(L) { return L.parts || BTYPE_PARTS[L.type]; }
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
    B3.camera = new T.PerspectiveCamera(40, 1, 0.1, 300);
    sc.add(new T.HemisphereLight(0xdff0ff, 0x6a8a4a, 1.0));
    const sun = new T.DirectionalLight(0xfff2d8, 1.5); sun.position.set(10, 18, 8); sun.castShadow = !low;
    sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, far: 60 }); sc.add(sun);
    B3.water = b3Mesh(new T.CircleGeometry(80, 64), b3Mat(0x3a9ad8), 0, -0.45, 0, sc); B3.water.rotation.x = -Math.PI / 2;
    B3.holder = new T.Group(); sc.add(B3.holder);
    const loader = new T.TextureLoader();
    for (const k of ['gift', 'construction']) { B3.tex[k] = loader.load(iconUrl(k)); B3.tex[k].colorSpace = T.SRGBColorSpace; }
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(64, 64, 46, 0, 7); g.fill();
    g.fillStyle = '#3a8ad8'; g.fillRect(56, 34, 16, 60); g.fillRect(34, 56, 60, 16);
    B3.tex.plus = new T.CanvasTexture(c); B3.tex.plus.colorSpace = T.SRGBColorSpace;
    // Drag to turn the island, tap a + tile to pick it
    const cv = r.domElement, ray = new T.Raycaster(), v2 = new T.Vector2();
    cv.addEventListener('pointerdown', e => { B3.drag = { x: e.clientX, y: e.clientY, yaw: B3.yaw, moved: false }; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', e => { if (!B3.drag) return; if (Math.abs(e.clientX - B3.drag.x) > 6) B3.drag.moved = true; B3.yaw = B3.drag.yaw - (e.clientX - B3.drag.x) * 0.01; });
    cv.addEventListener('pointerup', e => {
      const d = B3.drag; B3.drag = null;
      if (!d || d.moved) return;
      const rect = cv.getBoundingClientRect();
      v2.set((e.clientX - rect.left) / rect.width * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      ray.setFromCamera(v2, B3.camera);
      const hits = ray.intersectObjects(B3.pick, true), hit = hits.find(h => !h.object.userData.big) || hits[0];
      if (!hit) return;
      let o = hit.object; while (o && o.userData.task == null) o = o.parent;
      if (o) { B3.sel = o.userData.task; SlotFX.press(); renderTab(); }
    });
    cv.addEventListener('pointercancel', () => { B3.drag = null; });
    mountBuildView();
  }).catch(() => { B3.loading = false; B3.failed = true; if (activeTab === 'build') renderTab(); });
}
function decoMesh(kind, g) {
  if (kind === 'tree') { cy(0.08, 0.12, 0.6, 0x7a5232, -0.25, 0.3, 0.1, g, 6); b3Mesh(new B3.T.IcosahedronGeometry(0.42, 0), 0x3f9a3a, -0.25, 0.85, 0.1, g); cy(0.07, 0.1, 0.45, 0x7a5232, 0.35, 0.22, -0.25, g, 6); b3Mesh(new B3.T.IcosahedronGeometry(0.32, 0), 0x4fae3a, 0.35, 0.62, -0.25, g); }
  else if (kind === 'house') { const col = [0xf6efe0, 0xffe0b0, 0xd8f0ff, 0xffd6e0][Math.floor(Math.abs(g.position.x * 7 + g.position.z * 3)) % 4]; bx(0.9, 0.7, 0.8, col, 0, 0.35, 0, g); const rf = co(0.78, 0.55, [0xd84a3a, 0x4da3ff, 0xff8a3d][Math.floor(Math.abs(g.position.z * 5)) % 3], 0, 0.97, 0, g, 4); rf.rotation.y = Math.PI / 4; bx(0.22, 0.4, 0.04, 0x5a3418, 0, 0.2, 0.41, g); }
  else if (kind === 'rock') { b3Mesh(new B3.T.DodecahedronGeometry(0.42, 0), 0x9a958c, -0.15, 0.25, 0, g); b3Mesh(new B3.T.DodecahedronGeometry(0.28, 0), 0xaaa59c, 0.35, 0.18, 0.2, g); }
  else if (kind === 'palm') { for (const [x, z] of [[-0.2, 0], [0.3, 0.2]]) { cy(0.06, 0.09, 1.1, 0x8a6a46, x, 0.55, z, g, 6); for (let i = 0; i < 5; i++) { const l = bx(0.12, 0.03, 0.7, 0x3f8f3a, x + Math.sin(i * 1.26) * 0.3, 1.1, z + Math.cos(i * 1.26) * 0.3, g); l.rotation.y = i * 1.26; l.rotation.x = 0.4; } } }
  else { for (const [x, z, s] of [[-0.3, 0.1, 0.3], [0.2, -0.2, 0.25], [0.3, 0.3, 0.22]]) b3Mesh(new B3.T.IcosahedronGeometry(s, 0), 0x4a9a30, x, s * 0.8, z, g); for (const [x, z] of [[0, 0.35], [-0.35, -0.3]]) sp(0.07, 0xff6a8a, x, 0.2, z, g); }
}
function hexTile(pos, top, side, parent, h = 0.5) {
  const g = new B3.T.Group(); g.position.set(pos.x, 0, pos.z); parent.add(g);
  cy(HEX_R * 0.985, HEX_R * 1.02, h, side, 0, -h / 2 + 0.05, 0, g, 6);
  cy(HEX_R * 0.97, HEX_R * 0.97, 0.12, top, 0, 0.06, 0, g, 6);
  return g;
}
// Draw city ci; `anim` names a task index that was just built, to make it rise
function drawCity(ci, anim = -1) {
  const T = B3.T, key = ci + ':' + JSON.stringify(S.city.done) + ':' + S.city.i + ':' + B3.sel;
  if (B3.shownKey === key && anim < 0) return;
  B3.shownKey = key;
  B3.holder.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.isSprite) o.material.dispose(); });
  B3.holder.clear(); B3.pick = []; B3.floaters = []; B3.flames = [];
  const plan = cityPlan(ci), live = ci === S.city.i, avail = new Set(live ? availableTasks().map(t => t.i) : []);
  if (live && !avail.has(B3.sel)) B3.sel = avail.size ? [...avail][0] : -1;
  // Landmark plazas: shown once the landmark's ring has started
  plan.centers.forEach((c, li) => {
    const started = plan.tasks.some(t => t.li === li && (taskBuilt(ci, t.i) || avail.has(t.i)));
    if (!started) { [c, ...NB.map(([a, b]) => [c[0] + a, c[1] + b])].forEach(h => hexTile(hexPos(...h), 0x9ccf6a, 0xc8a46a, B3.holder, 0.4)); return; }
    const built = lmPartsBuilt(ci, li), p0 = hexPos(...c);
    [c, ...NB.map(([a, b]) => [c[0] + a, c[1] + b])].forEach(h => hexTile(hexPos(...h), built ? 0xe8dcc0 : 0xd8c8a0, 0xc8a46a, B3.holder));
    const holder = new T.Group(); holder.position.set(p0.x, 0.12, p0.z); holder.scale.setScalar(0.8); B3.holder.add(holder);
    const P = lmModel(CITIES[ci].lms[li]);
    const box = built < 5 ? new T.Box3().setFromObject(P[built]) : null; // measured before the parts join the scaled holder
    const partTask = plan.tasks.find(t => t.type === 'part' && t.li === li && t.k === built);
    P.forEach((g, k) => { g.visible = k < built; holder.add(g); if (g.userData.flame) B3.flames.push(g.userData.flame); });
    if (anim >= 0 && plan.tasks[anim].type === 'part' && plan.tasks[anim].li === li) { const g = P[plan.tasks[anim].k]; g.scale.set(1, 0.01, 1); B3.anims.push({ g, t: 0 }); }
    if (partTask && avail.has(partTask.i)) {
      const helper = new T.Box3Helper(box, partTask.i === B3.sel ? 0xffd23d : 0xffffff); helper.material.transparent = true; holder.add(helper);
      const mk = new T.Sprite(new T.SpriteMaterial({ map: B3.tex.construction, depthTest: false }));
      mk.scale.set(1.3, 1.3, 1); const my = Math.max(2.4, box.max.y * 0.8 + 1); mk.position.set(p0.x, my, p0.z); mk.userData.task = partTask.i; mk.userData.big = true; B3.holder.add(mk); B3.pick.push(mk);
      B3.floaters.push({ o: mk, y: my, ph: li });
      // the whole plaza can be tapped too
      const hit = cy(HEX_R * 1.9, HEX_R * 1.9, 0.3, new T.MeshBasicMaterial({ visible: false }), p0.x, 0.3, p0.z, B3.holder, 6); hit.userData.task = partTask.i; hit.userData.big = true; B3.pick.push(hit);
    }
  });
  for (const t of plan.tasks) {
    if (t.type !== 'deco') continue;
    const pos = hexPos(...t.hex);
    if (taskBuilt(ci, t.i)) {
      const g = hexTile(pos, 0x6fbf4a, 0xd8b878, B3.holder);
      decoMesh(t.kind, g);
      if (t.i === anim) { g.scale.set(1, 0.01, 1); B3.anims.push({ g, t: 0 }); }
    } else if (!avail.has(t.i)) hexTile(pos, 0x9ccf6a, 0xc8a46a, B3.holder, 0.4);
    else {
      const sel = t.i === B3.sel;
      const g = new T.Group(); g.position.set(pos.x, 0, pos.z); B3.holder.add(g);
      const m = cy(HEX_R * 0.95, HEX_R * 0.95, 0.18, new T.MeshLambertMaterial({ color: sel ? 0xffd25a : 0x8fd0ff, transparent: true, opacity: sel ? 0.85 : 0.55 }), 0, 0, 0, g, 6);
      m.castShadow = false; m.userData.task = t.i; B3.pick.push(m);
      const plus = new T.Sprite(new T.SpriteMaterial({ map: B3.tex.plus, depthTest: false })); plus.scale.set(0.8, 0.8, 1); plus.position.set(pos.x, 0.7, pos.z); plus.userData.task = t.i; B3.holder.add(plus); B3.pick.push(plus);
      B3.floaters.push({ o: plus, y: 0.7, ph: t.i });
      if (t.gift) { const gs = new T.Sprite(new T.SpriteMaterial({ map: B3.tex.gift, depthTest: false })); gs.scale.set(0.9, 0.9, 1); gs.position.set(pos.x, 1.55, pos.z); gs.userData.task = t.i; B3.holder.add(gs); B3.pick.push(gs); B3.floaters.push({ o: gs, y: 1.55, ph: t.i + 1 }); }
    }
  }
  const land = new Set(), beach = new Map();
  plan.centers.forEach(c => [c, ...NB.map(([a, b]) => [c[0] + a, c[1] + b])].forEach(h => land.add(h + '')));
  plan.tasks.forEach(t => land.add(t.hex + ''));
  land.forEach(k => { const [q, r] = k.split(',').map(Number); NB.forEach(([a, b]) => { const h = [q + a, r + b]; if (!land.has(h + '')) beach.set(h + '', h); }); });
  beach.forEach(h => hexTile(hexPos(...h), 0xf0dca0, 0xd8b878, B3.holder, 0.3).position.y = -0.1);
  // Point the camera at whatever is being built now
  const target = live ? (plan.tasks[B3.sel] || plan.tasks.find(t => !S.city.done[t.i])) : null;
  const fp = target ? hexPos(...plan.centers[target.li]) : { x: 0, z: 0 };
  B3.focusTo = fp;
}
function mountBuildView() {
  const host = $('buildView');
  if (!host) return;
  if (!B3.T) { initBuild3D(); return; }
  host.querySelectorAll('.build-fallback').forEach(f => f.remove());
  if (B3.renderer.domElement.parentNode !== host) host.prepend(B3.renderer.domElement);
  const w = host.clientWidth || 600, h = Math.round(Math.min(640, Math.max(400, Math.min(w * (w < 640 ? 1.3 : 0.85), innerHeight - 220))));
  B3.renderer.setSize(w, h); B3.camera.aspect = w / h; B3.camera.updateProjectionMatrix();
  drawCity(viewCity());
  if (S.city.intro !== S.city.i && !allCitiesDone() && $('modal').classList.contains('hidden')) { S.city.intro = S.city.i; save(); setTimeout(() => cityIntro(S.city.i), 700); }
  if (!B3.raf) { B3.lastT = performance.now(); B3.raf = requestAnimationFrame(b3Loop); }
}
function viewCity() { return S.city.view != null && S.city.view < S.city.i ? S.city.view : Math.min(S.city.i, CITIES.length - 1); }
function b3Loop(now) {
  if (activeTab !== 'build' || document.hidden || !B3.renderer.domElement.isConnected) { B3.raf = 0; return; }
  B3.raf = requestAnimationFrame(b3Loop);
  if (now - B3.lastT < (fxOff() ? 64 : 31)) return;
  const dt = Math.min(0.1, (now - B3.lastT) / 1000); B3.lastT = now;
  if (!B3.drag) B3.yaw += dt * 0.06;
  const f = B3.focus, ft = B3.focusTo || f;
  f.x += (ft.x - f.x) * Math.min(1, dt * 2.5); f.z += (ft.z - f.z) * Math.min(1, dt * 2.5);
  const zk = B3.zoomFrom ? Math.min(1, (now - B3.zoomFrom) / 1400) : 1;
  if (zk >= 1) B3.zoomFrom = 0;
  const cam = B3.camera, d = 15 * Math.min(1.45, Math.max(1, 1.2 / cam.aspect)) * (1 + 1.4 * Math.pow(1 - zk, 3));
  if (zk < 1) B3.yaw += dt * 1.2 * (1 - zk);
  cam.position.set(f.x + Math.sin(B3.yaw) * d, d * 0.95 + (1 - zk) * 6, f.z + Math.cos(B3.yaw) * d); cam.lookAt(f.x, 0.8, f.z);
  for (let k = B3.anims.length - 1; k >= 0; k--) {
    const a = B3.anims[k]; a.t += dt / 0.9;
    const t = Math.min(1, a.t), e = 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);
    a.g.scale.y = Math.max(0.01, e);
    if (t >= 1) { a.g.scale.y = 1; B3.anims.splice(k, 1); }
  }
  B3.floaters.forEach(fl => { fl.o.position.y = fl.y + Math.sin(now / 400 + fl.ph) * 0.12; });
  (B3.flames || []).forEach(fl => { fl.scale.y = 0.8 + Math.random() * 0.4; });
  B3.water.position.y = -0.45 + Math.sin(now / 900) * 0.03;
  B3.renderer.render(B3.scene, cam);
}

// ---- Build tab UI: the island fills the screen; India map and landmark list open from buttons ----
function renderBuild() {
  const ci = viewCity(), C = CITIES[ci], live = ci === S.city.i, prog = cityProgress(ci);
  let bottom;
  if (!live) bottom = `<button class="btn gold bv-main" data-act="build-view" data-id="-1">${allCitiesDone() ? tr('All cities built!', 'అన్ని నగరాలూ పూర్తి!') : tr(`Back to ${CITIES[S.city.i].name[0]}`, `${CITIES[S.city.i].name[1]} కి తిరిగి`)}</button>`;
  else {
    const t = selTask();
    if (!t) bottom = `<button class="btn gold bv-main" data-act="city-next">${CITIES[ci + 1] ? tr(`Travel to ${CITIES[ci + 1].name[0]} ✈️`, `${CITIES[ci + 1].name[1]} కి వెళ్ళు ✈️`) : tr('City complete!', 'నగరం పూర్తి!')}</button>`;
    else {
      const cost = taskCost(ci, t), ok = S.cash >= cost, rw = taskReward(ci, t), lmId = C.lms[t.li];
      bottom = `<div class="task-card">
        <button class="tc-ico" data-act="lm-info" data-id="${lmId}" title="${esc(tr('About this place', 'ఈ ప్రదేశం గురించి'))}">${ico(taskIcon(ci, t))}<span class="tc-learn">${ico('book')}</span></button>
        <div class="tc-info"><small>${tr('Next task', 'తర్వాతి పని')}</small><b>${taskName(ci, t)}</b>
          ${rw ? `<span class="tc-gift">${ico('gift')} +${fmtInt(rw.coins)} ${ico('coin')} +${rw.energy} ⚡</span>` : t.type === 'part' ? `<span class="tc-gift">+2 ⚡ +1 ${ico('pack')}</span>` : ''}</div>
        <button class="btn ${ok ? 'gold' : 'ghost'} tc-build" data-act="build-part" ${ok ? '' : 'disabled'}><b>${tr('Build', 'కట్టు')}</b><small>${ico('coin')} ${fmtInt(cost)}</small></button>
        ${ok ? '' : `<button class="btn blue tc-get" data-act="tab" data-tab="slots">${ico('slot')}</button>`}
      </div>`;
    }
  }
  const fallback = B3.failed ? `<div class="build-fallback">${ico('worldmap', 'big-ico')}<p>${tr('3D view needs an internet connection.', '3D వ్యూ కోసం ఇంటర్నెట్ కావాలి.')}</p></div>`
    : B3.T ? '' : `<div class="build-fallback"><div class="loader"></div></div>`;
  return `<div class="build-view big" id="buildView">${fallback}
    <div class="bv-top">
      <button class="bv-btn map" data-act="build-map">${ico('worldmap')}<span>${tr('MAP', 'మ్యాప్')}</span></button>
      <button class="bv-title" data-act="city-intro" data-id="${ci}"><b>${tr(...C.name)} <span class="bv-num">${ci + 1}/${CITIES.length}</span></b><div class="city-bar"><div style="width:${prog.done / prog.total * 100}%"></div><span>${prog.done} / ${prog.total}</span></div>
        <small>${tr('Landmarks', 'కట్టడాలు')}: ${C.lms.filter((_, li) => lmPartsBuilt(ci, li) >= 5).length}/${C.lms.length}</small></button>
      <button class="bv-btn learn" data-act="build-parts">${ico('book')}<span>${tr('Learn', 'నేర్చుకో')}</span></button>
    </div>
    <div class="bv-bonus">${ico('chart')} +${Math.round((landmarkBonus() - 1) * 100)}%</div>
    <div class="bv-bottom">${bottom}</div>
  </div>`;
}
// India map: real latitude/longitude placed on a simple flat projection
const mapXY = (lat, lon) => [Math.round((14 + (lon - 68) * 9.6) * 10) / 10, Math.round((10 + (37 - lat) * 10.6) * 10) / 10];
const INDIA_PATH = 'M' + INDIA_LL.map(([lon, lat]) => mapXY(lat, lon).join(',')).join(' L') + ' Z';
function cityState(ci) { return ci < S.city.i ? 'done' : ci === S.city.i ? 'now' : 'locked'; }
function openBuildMap() {
  const pts = CITIES.map(C => mapXY(...C.ll));
  const pins = CITIES.map((C, ci) => {
    const st = cityState(ci), [x, y] = pts[ci];
    return `<g class="pin ${st}" ${st !== 'locked' ? `data-act="build-view" data-id="${st === 'now' ? -1 : ci}"` : ''}>
      ${st === 'now' ? `<circle cx="${x}" cy="${y}" r="11" class="pin-ring"/>` : ''}<circle cx="${x}" cy="${y}" r="7.5" class="pin-dot"/>
      <text x="${x}" y="${y + 3.2}" class="pin-n" text-anchor="middle">${st === 'done' ? '✓' : ci + 1}</text></g>`;
  }).join('');
  const now = Math.min(S.city.i, CITIES.length - 1), [nx, ny] = pts[now];
  const label = `<text x="${nx + (nx > 220 ? -14 : 14)}" y="${ny - 10}" class="pin-label" text-anchor="${nx > 220 ? 'end' : 'start'}">${esc(tr(...CITIES[now].name))}</text>`;
  const chips = CITIES.map((C, ci) => {
    const st = cityState(ci), p = cityProgress(ci);
    return `<button class="city-chip ${st}" ${st === 'locked' ? 'disabled' : `data-act="build-view" data-id="${st === 'now' ? -1 : ci}"`}>
      <span class="cc-n">${st === 'done' ? '✓' : st === 'locked' ? '🔒' : ci + 1}</span><b>${tr(...C.name)}</b>
      <small>${st === 'now' ? `${p.done}/${p.total}` : C.lms.length + ' ' + tr('places', 'ప్రదేశాలు')}</small></button>`;
  }).join('');
  SlotFX.press();
  modal(`<h3>${ico('worldmap')} ${tr('India map', 'భారత దేశ మ్యాప్')}</h3>
    <p class="sub">${tr('Finish every tile of a city to travel to the next one. Tap a finished city to visit it again.', 'ఒక నగరంలో అన్ని పనులు పూర్తి చేస్తే తర్వాతి నగరానికి వెళ్తాం. పూర్తయిన నగరాన్ని నొక్కితే మళ్ళీ చూడవచ్చు.')}</p>
    <svg class="india-map" viewBox="0 0 310 330"><defs><linearGradient id="indG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fe08a"/><stop offset="1" stop-color="#3f9a3a"/></linearGradient></defs>
      <path d="${INDIA_PATH}" fill="url(#indG)" stroke="#fff6c8" stroke-width="2.5" stroke-linejoin="round"/>
      <polyline points="${pts.slice(0, Math.min(CITIES.length, S.city.i + 2)).map(p => p.join(',')).join(' ')}" class="route"/>${pins}${label}</svg>
    <div class="city-chips">${chips}</div>
    <div class="modal-actions"><button class="btn ghost" data-act="close">${tr('Close', 'మూసివేయి')}</button></div>`);
}
// Landmark list of the shown city; each row opens its learning card
function openBuildParts() {
  const ci = viewCity(), C = CITIES[ci];
  const rows = C.lms.map((id, li) => {
    const L = LANDMARKS[id], n = lmPartsBuilt(ci, li), q = S.city.quiz[id];
    return `<button class="part-row learn-row ${n >= 5 ? 'done' : n > 0 ? 'next' : ''}" data-act="lm-info" data-id="${id}"><span class="pr-n">${n >= 5 ? '✓' : li + 1}</span>
      <b>${ico(L.icon)} ${tr(...L.name)}</b><small>${q === 1 ? '🧠 ' : ''}${n >= 5 ? tr('Built', 'పూర్తి') : `${n}/5`} ${ico('book')}</small></button>`;
  }).join('');
  SlotFX.press();
  modal(`<h3>${ico('book')} ${tr(`Learn about ${C.name[0]}`, `${C.name[1]} గురించి నేర్చుకో`)}</h3>
    <p class="sub city-fact">${tr(...C.fact)}</p>
    <div class="parts-list">${rows}</div>
    <p class="sub">${tr(`Each finished landmark gives coins, gems, energy, a gold pack and +${LANDMARK_BONUS * 100}% on all prizes. Answer its quiz for +10 gems!`, `పూర్తయిన ప్రతి కట్టడం: కాయిన్లు, జెమ్స్, ఎనర్జీ, గోల్డ్ ప్యాక్, అన్ని బహుమతులు +${LANDMARK_BONUS * 100}%. క్విజ్ సరిగ్గా చెబితే +10 జెమ్స్!`)}</p>
    <div class="modal-actions"><button class="btn ghost" data-act="close">${tr('Close', 'మూసివేయి')}</button></div>`);
}
const lmYear = L => Array.isArray(L.y) ? tr(...L.y) : L.y;
function lmCity(id) { return CITIES.find(C => C.lms.includes(id)); }
function factHtml(L) { return `<div class="fact-card"><b>${ico('book')} ${tr('Did you know?', 'మీకు తెలుసా?')}</b><p>${tr(...L.fact)}</p><small>${tr('Built', 'నిర్మాణం')}: ${lmYear(L)} · ${tr(...lmCity(L.id).name)}</small></div>`; }
// Three answers in a fixed shuffled order; the right one is quiz[1][0]
function quizHtml(id) {
  const L = LANDMARKS[id], [q, opts] = L.quiz, done = S.city.quiz[id];
  const rot = [...id].reduce((s, ch) => s + ch.charCodeAt(0), 0) % 3, order = [0, 1, 2].map(k => (k + rot) % 3);
  return `<div class="quiz" id="quiz-${id}"><b>${ico('question')} ${tr('Quiz', 'క్విజ్')}: ${tr(...q)}</b>
    <div class="quiz-opts">${order.map(k => `<button class="btn quiz-opt ${done != null ? (k === 0 ? 'right' : '') : ''}" data-act="quiz" data-id="${id}:${k}" ${done != null ? 'disabled' : ''}>${tr(...opts[k])}</button>`).join('')}</div>
    <small class="quiz-note">${done == null ? tr('Right answer: +10 gems', 'సరైన జవాబు: +10 జెమ్స్') : done ? tr('✓ You got this one right!', '✓ దీనికి సరైన జవాబు చెప్పారు!') : tr('Already answered', 'ఇప్పటికే జవాబు ఇచ్చారు')}</small></div>`;
}
function answerQuiz(el, arg) {
  const [id, k] = arg.split(':'), L = LANDMARKS[id];
  if (!L || S.city.quiz[id] != null) return;
  const right = +k === 0;
  S.city.quiz[id] = right ? 1 : 0;
  const box = $('quiz-' + id);
  if (box) {
    box.querySelectorAll('.quiz-opt').forEach(b => { b.disabled = true; const kk = +b.dataset.id.split(':')[1]; if (kk === 0) b.classList.add('right'); else if (kk === +k) b.classList.add('wrong'); });
    box.querySelector('.quiz-note').textContent = right ? tr('Correct! +10 gems', 'సరైన జవాబు! +10 జెమ్స్') : tr(`The answer is: ${L.quiz[1][0][0]}`, `సరైన జవాబు: ${L.quiz[1][0][1]}`);
  }
  if (right) { S.gems += 10; flyTo('gems', el, 'gem', 4); SlotFX.big(); updateHeader(); }
  else SlotFX.land('hit');
  save();
}
function lmInfo(id) {
  const L = LANDMARKS[id];
  if (!L) return;
  SlotFX.press();
  modal(`<div class="lm-info-head">${ico(L.icon, 'big-ico')}<div><h3>${tr(...L.name)}</h3><small>${tr(...lmCity(id).name)}</small></div></div>
    ${factHtml(L)}${quizHtml(id)}
    <div class="modal-actions"><button class="btn gold" data-act="close">${tr('OK', 'సరే')}</button></div>`);
}
// Shown when the player arrives in a city (or taps the city title)
function cityIntro(ci) {
  const C = CITIES[ci];
  if (!C) return;
  modal(`<div class="lm-done"><div class="lm-rays"></div>${ico('worldmap', 'big-ico')}</div>
    <h3>${tr(`Welcome to ${C.name[0]}!`, `${C.name[1]} కి స్వాగతం!`)}</h3>
    <p class="sub city-fact">${tr(...C.fact)}</p>
    <div class="intro-lms">${C.lms.map(id => `<button class="intro-lm" data-act="lm-info" data-id="${id}">${ico(LANDMARKS[id].icon)}<span>${tr(...LANDMARKS[id].name)}</span></button>`).join('')}</div>
    <p class="sub">${tr('Tap the glowing + tiles to build. Tap a place above to learn about it.', 'మెరిసే + టైల్స్ నొక్కి కట్టండి. పైన ఒక ప్రదేశాన్ని నొక్కి దాని గురించి తెలుసుకోండి.')}</p>
    <div class="modal-actions"><button class="btn gold" data-act="close">${tr('Let’s build!', 'కడదాం!')}</button></div>`);
}
function buildPart() {
  if (allCitiesDone()) return;
  const ci = S.city.i, plan = cityPlan(ci), t = selTask();
  if (!t || S.city.done[t.i] || !availableTasks().some(a => a.i === t.i)) return;
  const cost = taskCost(ci, t);
  if (S.cash < cost) { toast(tr('Not enough coins. Spin to win more!', 'కాయిన్లు సరిపోవు. స్పిన్ చేసి గెలవండి!'), 'bad'); return; }
  S.cash -= cost; S.city.done[t.i] = true; addLeague(t.type === 'part' ? 30 : 10);
  const from = document.querySelector('.tc-build') || $('buildView');
  const rw = taskReward(ci, t);
  if (rw) { earn(rw.coins); S.slot.energy += rw.energy; flyTo('coins', from, 'coin', 6); toast(tr(`🎁 Gift! +${fmtInt(rw.coins)} coins, +${rw.energy} ⚡`, `🎁 బహుమతి! +${fmtInt(rw.coins)} కాయిన్లు, +${rw.energy} ⚡`), 'good'); SlotFX.big(); }
  else SlotFX.land('pop');
  if (t.type === 'part') { S.slot.energy += 2; giveAlbumPack('basic', 1, true); flyTo('pack', from, 'pack', 1); }
  sfx('buy');
  const lmId = CITIES[ci].lms[t.li];
  const lmDone = t.type === 'part' && t.k === 4 ? lmId : null;
  const cityFinished = plan.tasks.every(x => S.city.done[x.i]);
  B3.sel = -1; save();
  const keep = B3.T;
  renderTab();
  if (keep) { B3.shownKey = ''; drawCity(ci, t.i); }
  updateHeader();
  if (lmDone) setTimeout(() => landmarkCelebration(lmDone, cityFinished), 1100);
  else if (cityFinished) setTimeout(cityCelebration, 900);
  // The first stone of a landmark: tell the player what they are building
  else if (t.type === 'part' && t.k === 0) setTimeout(() => { if ($('modal').classList.contains('hidden')) lmInfo(lmId); }, 1000);
}
function landmarkCelebration(id, thenCity) {
  const L = LANDMARKS[id], ci = CITIES.findIndex(C => C.lms.includes(id)), li = CITIES[ci].lms.indexOf(id);
  const last = cityPlan(ci).tasks.find(t => t.type === 'part' && t.li === li && t.k === 4), gems = 10, bonus = Math.round(taskCost(ci, last) * 2 / 100) * 100;
  S.gems += gems; S.slot.energy += 10; earn(bonus); giveAlbumPack('gold', 1, true); save();
  SlotFX.jackpot(); confetti($('buildView'), 240);
  const tile = (icon, big, small, k) => `<div class="lm-tile" style="animation-delay:${0.25 + k * 0.15}s">${ico(icon)}<b>${big}</b><small>${small}</small></div>`;
  modal(`<div class="lm-done"><div class="lm-rays"></div>${ico(L.icon, 'big-ico')}</div>
    <h3>${tr(`${L.name[0]} is complete!`, `${L.name[1]} పూర్తయింది!`)}</h3>
    <div class="lm-tiles">${tile('coin', fmtInt(bonus), tr('coins', 'కాయిన్లు'), 0)}${tile('gem', gems, tr('gems', 'జెమ్స్'), 1)}${tile('bolt', 10, tr('energy', 'ఎనర్జీ'), 2)}${tile('pack', 1, tr('gold pack', 'గోల్డ్ ప్యాక్'), 3)}${tile('chart', '+' + LANDMARK_BONUS * 100 + '%', tr('all prizes', 'అన్ని బహుమతులు'), 4)}</div>
    ${factHtml(L)}${quizHtml(id)}
    <div class="modal-actions"><button class="btn gold lm-next" data-act="lm-next" data-id="${thenCity ? 'city' : ''}">${tr('Collect!', 'తీసుకో!')}</button></div>`);
}
function cityCelebration() {
  const C = CITIES[S.city.i], next = CITIES[S.city.i + 1], gems = 25, energy = 20;
  S.gems += gems; S.slot.energy += energy; giveAlbumPack('gold', 1, true); save();
  SlotFX.jackpot(); confetti($('buildView'), 300);
  modal(`<div class="lm-done"><div class="lm-rays"></div>${ico('worldmap', 'big-ico')}</div>
    <h3>${tr(`${C.name[0]} is complete!`, `${C.name[1]} పూర్తయింది!`)}</h3>
    <div class="lm-tiles">${[['gem', gems, tr('gems', 'జెమ్స్')], ['bolt', energy, tr('energy', 'ఎనర్జీ')], ['pack', 1, tr('gold pack', 'గోల్డ్ ప్యాక్')]].map(([i, b, sm], k) => `<div class="lm-tile" style="animation-delay:${0.25 + k * 0.15}s">${ico(i)}<b>${b}</b><small>${sm}</small></div>`).join('')}</div>
    <p class="sub">${next ? tr(`Next stop: <b>${next.name[0]}</b>`, `తర్వాతి నగరం: <b>${next.name[1]}</b>`) : tr('You built every city! More coming soon.', 'అన్ని నగరాలూ కట్టేశారు! మరిన్ని త్వరలో.')}</p>
    <div class="modal-actions"><button class="btn gold lm-next" data-act="city-next">${next ? tr(`Travel to ${next.name[0]} ✈️`, `${next.name[1]} కి వెళ్ళు ✈️`) : tr('Great!', 'సూపర్!')}</button></div>`);
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
// A finished album starts a new season with fresh sticker sets
const ALBUM_SEASONS = [
  { name: ['Village to Space', 'పల్లె నుంచి అంతరిక్షం'], sets: ALBUM_SETS },
  { name: ['India Explorer', 'భారత యాత్ర'], sets: [
    { id: 'faith', icon: 'htemple', name: ['Temples & Faith', 'ఆలయాలు, విశ్వాసం'], items: [
      ['diya', 'Diya', 'దీపం', 1], ['bell', 'Temple bell', 'గుడి గంట', 1], ['lotus', 'Lotus', 'కమలం', 1], ['om', 'Om', 'ఓం', 2], ['worship', 'Prayer', 'ప్రార్థన', 2],
      ['church', 'Church', 'చర్చి', 2], ['khanda', 'Gurudwara', 'గురుద్వారా', 3], ['mosque', 'Mosque', 'మసీదు', 4], ['htemple', 'Gopuram', 'గోపురం', 5]] },
    { id: 'monuments', icon: 'classical', name: ['Monuments', 'కట్టడాలు'], items: [
      ['train', 'Railway', 'రైల్వే', 1], ['bridge', 'Bridge', 'వంతెన', 1], ['fountain', 'Fountain', 'ఫౌంటెన్', 1], ['city', 'City', 'నగరం', 2], ['stadium', 'Stadium', 'స్టేడియం', 2],
      ['lighttower', 'Tower', 'టవర్', 2], ['castle', 'Fort', 'కోట', 3], ['crown', 'Palace', 'ప్యాలెస్', 4], ['classical', 'Monument', 'స్మారకం', 5]] },
    { id: 'nature', icon: 'mountain', name: ['Nature', 'ప్రకృతి'], items: [
      ['seedling', 'Sprout', 'మొలక', 1], ['tree', 'Banyan tree', 'మర్రి చెట్టు', 1], ['hibiscus', 'Hibiscus', 'మందార', 1], ['beach', 'Beach', 'బీచ్', 2], ['sunrise', 'Sunrise', 'సూర్యోదయం', 2],
      ['island', 'Island', 'దీవి', 2], ['desert', 'Thar desert', 'థార్ ఎడారి', 3], ['volcano', 'Volcano', 'అగ్నిపర్వతం', 4], ['mountain', 'Himalayas', 'హిమాలయాలు', 5]] },
    { id: 'wild', icon: 'elephant', name: ['Wild India', 'అడవి జంతువులు'], items: [
      ['rabbit', 'Rabbit', 'కుందేలు', 1], ['owl', 'Owl', 'గుడ్లగూబ', 1], ['fox', 'Fox', 'నక్క', 1], ['camel', 'Camel', 'ఒంటె', 2], ['monkey', 'Langur', 'కొండముచ్చు', 2],
      ['panda', 'Red panda', 'రెడ్ పాండా', 2], ['turtle', 'Sea turtle', 'సముద్ర తాబేలు', 3], ['elephant', 'Tusker', 'దంతాల ఏనుగు', 4], ['tiger', 'Bengal tiger', 'బెంగాల్ పులి', 5]] },
    { id: 'games', icon: 'trophy', name: ['Fun & Games', 'ఆటలు, సరదాలు'], items: [
      ['kite', 'Kite', 'గాలిపటం', 1], ['balloon', 'Balloon', 'బెలూన్', 1], ['ticket', 'Ticket', 'టికెట్', 1], ['wheel', 'Giant wheel', 'జెయింట్ వీల్', 2], ['slot', 'Slot machine', 'స్లాట్ మెషిన్', 2],
      ['medal', 'Medal', 'పతకం', 2], ['party', 'Party', 'పార్టీ', 3], ['fireworks', 'Fireworks', 'బాణసంచా', 4], ['trophy', 'Trophy', 'ట్రోఫీ', 5]] },
    { id: 'sweets', icon: 'candy', name: ['Tea & Sweets', 'టీ, స్వీట్లు'], items: [
      ['tea', 'Chai', 'ఛాయ్', 1], ['coffee', 'Filter coffee', 'ఫిల్టర్ కాఫీ', 1], ['mango', 'Mango', 'మామిడి', 1], ['coconut', 'Coconut water', 'కొబ్బరి నీళ్ళు', 2], ['bakery', 'Bun', 'బన్', 2],
      ['doughnut', 'Jalebi', 'జిలేబీ', 2], ['custard', 'Kheer', 'పాయసం', 3], ['curry', 'Biryani', 'బిర్యానీ', 4], ['candy', 'Laddu', 'లడ్డూ', 5]] },
  ] },
];
const STICKER_W = { 1: 40, 2: 24, 3: 14, 4: 7, 5: 3 }; // how often each star level drops
const PACKS = { basic: { n: 3, gems: 5, name: ['Basic pack', 'బేసిక్ ప్యాక్'] }, gold: { n: 5, gems: 15, name: ['Gold pack', 'గోల్డ్ ప్యాక్'] } };
const STAR_TRADE = 30, SET_BONUS = 0.02;
function albumSeason() { return S.album.season || 0; }
function seasonInfo(n = albumSeason()) { return ALBUM_SEASONS[n % ALBUM_SEASONS.length]; }
// Season 1 keeps its old sticker ids so saves still match; later seasons get their own
function seasonSets(n = albumSeason()) { const pre = n ? `s${n}:` : ''; return seasonInfo(n).sets.map(set => Object.assign({}, set, { id: pre + set.id })); }
function allStickers() { return seasonSets().flatMap((set, si) => set.items.map(([icon, en, te, stars], k) => ({ id: `${set.id}-${k}`, set: si, icon, name: [en, te], stars }))); }
function albumBonus() { return 1 + SET_BONUS * Object.values(S.album ? S.album.sets : {}).filter(v => v === true).length; }
function stickerHave(id) { return S.album.have[id] || 0; }
function setCount(si) { const set = seasonSets()[si]; return set.items.filter((_, k) => stickerHave(`${set.id}-${k}`)).length; }
function setReward(si) { return { coins: Math.round(6000 * (si + 1) * cityScale() / 100) * 100, gems: 10, energy: 10 }; }
function seasonReward() { return { coins: Math.round(60000 * cityScale() / 100) * 100, gems: 50, energy: 25, packs: 2 }; }
function giveAlbumPack(kind, n = 1, quiet) {
  S.album.packs[kind] += n;
  if (!quiet) toast(tr(`📦 +${n} ${PACKS[kind].name[0]}! Open it in the Album.`, `📦 +${n} ${PACKS[kind].name[1]}! ఆల్బమ్‌లో తెరవండి.`), 'good');
}
function drawSticker(minStars = 1) {
  const pool = allStickers().filter(s => s.stars >= minStars);
  const total = pool.reduce((t, s) => t + STICKER_W[s.stars], 0);
  let r = Math.random() * total;
  for (const s of pool) { if ((r -= STICKER_W[s.stars]) < 0) return s; }
  return pool[0];
}
function starsHtml(n) { return '★'.repeat(n) + '<span class="dim">' + '★'.repeat(5 - n) + '</span>'; }
// Newly finished sets wait for the player to claim them
function markFinishedSets() {
  const fresh = [];
  seasonSets().forEach((set, si) => { if (!S.album.sets[set.id] && setCount(si) === set.items.length) { S.album.sets[set.id] = 'ready'; fresh.push(si); } });
  return fresh;
}
function setsReady() { return seasonSets().filter(set => S.album.sets[set.id] === 'ready').length; }
function seasonDone() { return seasonSets().every(set => S.album.sets[set.id] === true); }
function setClaimHtml(si) {
  const set = seasonSets()[si], r = setReward(si);
  return `<div class="set-claim">${ico(set.icon)}<div><b>${tr(`${set.name[0]} complete!`, `${set.name[1]} పూర్తి!`)}</b>
    <small>${ico('coin')} ${fmtInt(r.coins)} · 💎 ${r.gems} · ⚡ ${r.energy} · +${SET_BONUS * 100}% ${tr('prizes', 'బహుమతులు')}</small></div>
    <button class="btn gold" data-act="set-claim" data-id="${set.id}">${tr('Claim', 'తీసుకో')}</button></div>`;
}
function openPack(kind) {
  const A = S.album;
  if (A.packs[kind] <= 0) return;
  A.packs[kind]--;
  const P = PACKS[kind], got = [];
  for (let i = 0; i < P.n; i++) got.push(drawSticker(kind === 'gold' && i === P.n - 1 ? 4 : 1));
  if (Math.random() < petPower('sticker')) got.push(drawSticker(2)); // the unicorn slips in a bonus sticker
  const cards = got.map((s, i) => {
    const isNew = !A.have[s.id];
    A.have[s.id] = (A.have[s.id] || 0) + 1;
    if (!isNew) A.stars += s.stars;
    return `<div class="pk-card s${s.stars} ${isNew ? 'new' : ''}" style="animation-delay:${i * 0.25}s">
      ${isNew ? `<em>${tr('NEW!', 'కొత్తది!')}</em>` : `<em class="dup">+${s.stars}⭐</em>`}${ico(s.icon)}<b>${tr(...s.name)}</b><small>${starsHtml(s.stars)}</small></div>`;
  }).join('');
  const fresh = markFinishedSets();
  S.stats.packs = (S.stats.packs || 0) + 1;
  save();
  sfx('case');
  modal(`<h3>${ico('pack')} ${tr(...P.name)}</h3><div class="pk-row">${cards}</div>
    ${fresh.map(setClaimHtml).join('')}
    <div class="modal-actions">${A.packs[kind] > 0 && !fresh.length ? `<button class="btn gold" data-act="pack-open" data-id="${kind}">${tr('Open another', 'ఇంకోటి తెరువు')} (${A.packs[kind]})</button>` : ''}
    <button class="btn ghost" data-act="close">${tr('Done', 'సరే')}</button></div>`);
  if (fresh.length) setTimeout(() => { confetti($('modalBody'), 200); SlotFX.jackpot(); }, 900);
  if (activeTab === 'album') renderTab();
}
function claimSet(id, el) {
  const sets = seasonSets(), si = sets.findIndex(s => s.id === id);
  if (si < 0 || S.album.sets[id] !== 'ready') return;
  const r = setReward(si);
  S.album.sets[id] = true; addLeague(100);
  earn(r.coins); S.gems += r.gems; S.slot.energy += r.energy;
  const from = el && visibleEl(el) ? el : $('modalBody');
  flyTo('coins', from, 'coin', 8); flyTo('gems', from, 'gem', 4, 120); flyTo('energy', from, 'bolt', 3, 240);
  SlotFX.big(); confetti(from, 120);
  toast(tr(`🏆 ${sets[si].name[0]}: +${fmtInt(r.coins)} coins, +${r.gems} 💎, +${r.energy} ⚡`, `🏆 ${sets[si].name[1]}: +${fmtInt(r.coins)} కాయిన్లు, +${r.gems} 💎, +${r.energy} ⚡`), 'good');
  save(); updateHeader();
  const row = el && el.closest('.set-claim');
  if (row) row.outerHTML = `<p class="pk-done">✅ ${tr(`${sets[si].name[0]} prize collected!`, `${sets[si].name[1]} బహుమతి తీసుకున్నారు!`)}</p>`;
  if (activeTab === 'album') renderTab();
  if (seasonDone()) setTimeout(showSeasonDone, 900);
}
function showSeasonDone() {
  const r = seasonReward(), next = seasonInfo(albumSeason() + 1);
  SlotFX.jackpot(); confetti($('modalBody') || document.body, 260);
  const tile = (icon, big, small, k) => `<div class="lm-tile" style="animation-delay:${0.25 + k * 0.15}s">${ico(icon)}<b>${big}</b><small>${small}</small></div>`;
  modal(`<div class="lm-done"><div class="lm-rays"></div>${ico('album', 'big-ico')}</div>
    <h3>${tr(`Album "${seasonInfo().name[0]}" complete!`, `"${seasonInfo().name[1]}" ఆల్బమ్ పూర్తి!`)}</h3>
    <div class="lm-tiles">${tile('coin', fmtInt(r.coins), tr('coins', 'కాయిన్లు'), 0)}${tile('gem', r.gems, tr('gems', 'జెమ్స్'), 1)}${tile('bolt', r.energy, tr('energy', 'ఎనర్జీ'), 2)}${tile('pack', r.packs, tr('gold packs', 'గోల్డ్ ప్యాక్‌లు'), 3)}</div>
    <p class="sub">${tr(`A new album starts: <b>${next.name[0]}</b> with ${next.sets.length * 9} new stickers!`, `కొత్త ఆల్బమ్ మొదలు: <b>${next.name[1]}</b>, ${next.sets.length * 9} కొత్త స్టిక్కర్లు!`)}</p>
    <div class="modal-actions"><button class="btn gold lm-next" data-act="season-claim">${tr('Claim & start new album', 'తీసుకుని కొత్త ఆల్బమ్ మొదలుపెట్టు')}</button></div>`);
}
function claimSeason(el) {
  if (!seasonDone()) return;
  const r = seasonReward();
  earn(r.coins); S.gems += r.gems; S.slot.energy += r.energy; S.album.packs.gold += r.packs;
  const from = el && visibleEl(el) ? el : $('modalBody');
  flyTo('coins', from, 'coin', 10); flyTo('gems', from, 'gem', 5, 120); flyTo('pack', from, 'pack', 2, 240);
  S.album.season = albumSeason() + 1;
  save(); closeModal(); updateHeader(); SlotFX.whoosh();
  toast(tr(`📔 New album: ${seasonInfo().name[0]}!`, `📔 కొత్త ఆల్బమ్: ${seasonInfo().name[1]}!`), 'good');
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
  const A = S.album, all = allStickers(), owned = all.filter(s => stickerHave(s.id)).length;
  markFinishedSets();
  const packBtn = kind => `<div class="pack-box ${kind}">${ico('pack')}<div><b>${tr(...PACKS[kind].name)}</b><small>${PACKS[kind].n} ${tr('stickers', 'స్టిక్కర్లు')}${kind === 'gold' ? tr(', one 4★ or better', ', ఒకటి 4★ పైన') : ''}</small></div>
    ${A.packs[kind] > 0 ? `<button class="btn gold" data-act="pack-open" data-id="${kind}">${tr('Open', 'తెరువు')} (${A.packs[kind]})</button>` : `<button class="btn blue" data-act="pack-buy" data-id="${kind}" data-gems="${PACKS[kind].gems}">💎 ${PACKS[kind].gems}</button>`}</div>`;
  const sets = seasonSets().map((set, si) => {
    const n = setCount(si), r = setReward(si), st = A.sets[set.id];
    const slots = set.items.map(([icon, en, te, stars], k) => {
      const c = stickerHave(`${set.id}-${k}`);
      return `<div class="stk ${c ? 's' + stars : 'missing'}">${ico(icon)}<b>${c ? tr(en, te) : '?'}</b><small>${starsHtml(stars)}</small>${c > 1 ? `<i>×${c}</i>` : ''}</div>`;
    }).join('');
    const prize = st === true ? '✅ ' + tr('Prize collected', 'బహుమతి తీసుకున్నారు')
      : st === 'ready' ? `<button class="btn gold as-claim" data-act="set-claim" data-id="${set.id}">${ico('gift')} ${tr('Claim prize', 'బహుమతి తీసుకో')}: ${fmtInt(r.coins)} ${ico('coin')} · 💎 ${r.gems} · ⚡ ${r.energy}</button>`
      : `${tr('Prize', 'బహుమతి')}: ${ico('coin')} ${fmtInt(r.coins)} · 💎 ${r.gems} · ⚡ ${r.energy} · +${SET_BONUS * 100}%`;
    return `<div class="album-set ${st === true ? 'complete' : st === 'ready' ? 'ready' : ''}"><div class="as-head">${ico(set.icon)}<b>${tr(...set.name)}</b><span>${n}/9</span></div>
      <div class="as-grid">${slots}</div><div class="as-prize">${prize}</div></div>`;
  }).join('');
  const done = seasonDone();
  return header('album', tr(`Sticker Album · ${seasonInfo().name[0]}`, `స్టిక్కర్ ఆల్బమ్ · ${seasonInfo().name[1]}`),
    tr(`Album ${albumSeason() + 1}: collect all ${all.length} stickers. Finish a set, then tap <b>Claim</b> for its prize. Finish the album to unlock a brand new one!`, `ఆల్బమ్ ${albumSeason() + 1}: మొత్తం ${all.length} స్టిక్కర్లు సేకరించండి. సెట్ పూర్తయ్యాక <b>తీసుకో</b> నొక్కి బహుమతి పొందండి. ఆల్బమ్ పూర్తయితే కొత్తది వస్తుంది!`)) +
    (done ? `<div class="season-banner">${ico('trophy')}<b>${tr('Album complete!', 'ఆల్బమ్ పూర్తి!')}</b><button class="btn gold" data-act="season-open">${tr('Claim & start new album', 'తీసుకుని కొత్త ఆల్బమ్')}</button></div>` : '') +
    `<div class="album-top"><div class="slot-stat">${ico('album')}<b>${owned}</b><small>/ ${all.length}</small></div>
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
  earn(value);
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
// One pet at a time comes along to the Spin Game and helps in its own way. Feed it every day,
// or a hungry pet only helps half as much. Gems level it up.
const PETS = [
  { id: 'dog',     icon: 'dog',     name: ['Puppy', 'కుక్కపిల్ల'],   kind: 'raid',    per: 0.10, cost: { cash: 2e4 } },
  { id: 'cat',     icon: 'cat',     name: ['Kitty', 'పిల్లి'],        kind: 'free',    per: 0.025, cost: { cash: 6e4 } },
  { id: 'rabbit',  icon: 'rabbit',  name: ['Bunny', 'కుందేలు'],       kind: 'profit',  per: 0.05, cost: { gems: 30 } },
  { id: 'owl',     icon: 'owl',     name: ['Wise Owl', 'గుడ్లగూబ'],    kind: 'regen',   per: 0.06, cost: { cash: 2e5 } },
  { id: 'panda',   icon: 'panda',   name: ['Panda', 'పాండా'],         kind: 'boss',    per: 0.15, cost: { cash: 5e5 } },
  { id: 'peacock', icon: 'peacock', name: ['Peacock', 'నెమలి'],       kind: 'gems',    per: 1,    cost: { gems: 80 } },
  { id: 'tiger',   icon: 'tiger',   name: ['Tiger', 'పులి'],          kind: 'raid',    per: 0.18, cost: { cash: 1.5e6 } },
  { id: 'unicorn', icon: 'unicorn', name: ['Unicorn', 'యూనికార్న్'],  kind: 'sticker', per: 0.06, cost: { gems: 200 } },
  { id: 'dragon',  icon: 'dragon',  name: ['Dragon', 'డ్రాగన్'],      kind: 'jackpot', per: 0.12, cost: { gems: 500 } },
];
const PET_MAX_LVL = 10;
const PET_HUNGRY_AFTER = 24 * 3600 * 1000;
const PET_FEED_EVERY = 4 * 3600 * 1000;
function petLvl(id) { return S.pets.owned[id] || 0; }
function petsHungry() { return Date.now() - S.pets.fedAt > PET_HUNGRY_AFTER; }
function petFeedReady() { return Date.now() - S.pets.fedAt >= PET_FEED_EVERY; }
function petLevelCost(lvl) { return 5 * lvl; }
function activePet() { const id = S.pets.active; return id && petLvl(id) ? PETS.find(p => p.id === id) : null; }
// How strong the helping pet's power is right now (0 when no pet of that kind is along)
function petPower(kind) { const p = activePet(); return p && p.kind === kind ? p.per * petLvl(p.id) * (petsHungry() ? 0.5 : 1) : 0; }
function petBonus(kind) { return 1 + petPower(kind); }
function petPop(text) {
  const b = $('petBadge'); if (!b) return;
  restartAnim(b, 'bump'); SlotFX.land('pop');
  const d = document.createElement('div'); d.className = 'pet-pop'; d.textContent = text; b.appendChild(d); setTimeout(() => d.remove(), 1800);
}
function petBadgeHtml() {
  const p = activePet();
  if (!p) return `<button class="sg-pet empty" id="petBadge" data-act="tab" data-tab="pets">${ico('paws')}<b>${tr('Pet', 'పెట్')}</b></button>`;
  return `<button class="sg-pet ${petsHungry() ? 'hungry' : ''}" id="petBadge" data-act="tab" data-tab="pets" title="${esc(tr(...p.name) + ': ' + petDesc(p))}">${ico(p.icon)}<b>${tr('Lv', 'లె')} ${petLvl(p.id)}</b>${petsHungry() ? '<i>😢</i>' : ''}</button>`;
}
function petDesc(p, lvl = Math.max(1, petLvl(p.id))) {
  const pct = Math.round(p.per * lvl * 100);
  return {
    raid: tr(`Raids bring +${pct}% coins`, `దాడుల్లో +${pct}% కాయిన్లు`),
    free: tr(`${pct}% chance a spin is free`, `${pct}% అవకాశం స్పిన్ ఫ్రీ`),
    profit: tr(`All spin coins +${pct}%`, `అన్ని స్పిన్ కాయిన్లు +${pct}%`),
    regen: tr(`Energy refills ${pct}% faster`, `ఎనర్జీ ${pct}% వేగంగా నిండుతుంది`),
    boss: tr(`Boss damage +${pct}%`, `బాస్‌కి +${pct}% దెబ్బ`),
    gems: tr(`+${lvl} gems every time you feed`, `తినిపించిన ప్రతిసారి +${lvl} జెమ్స్`),
    sticker: tr(`${pct}% chance of a bonus sticker in each pack`, `ప్రతి ప్యాక్‌లో ${pct}% అవకాశం బోనస్ స్టిక్కర్`),
    jackpot: tr(`Three-of-a-kind coins +${pct}%`, `మూడు ఒకేలా వస్తే +${pct}% కాయిన్లు`),
  }[p.kind];
}
function usePet(id) {
  if (!petLvl(id)) return;
  S.pets.active = id; SlotFX.press();
  const p = PETS.find(x => x.id === id);
  toast(tr(`${emo(p.icon)} ${p.name[0]} comes along to help!`, `${emo(p.icon)} ${p.name[1]} మీతో వచ్చి సాయం చేస్తుంది!`), 'good');
}
function buyPet(id) {
  const p = PETS.find(x => x.id === id);
  if (!p || petLvl(id)) return;
  if (p.cost.cash ? S.cash < p.cost.cash : S.gems < p.cost.gems) { sfx('err'); return; }
  if (p.cost.cash) S.cash -= p.cost.cash; else S.gems -= p.cost.gems;
  if (!Object.keys(S.pets.owned).length) S.pets.fedAt = Date.now();
  S.pets.owned[id] = 1;
  if (!activePet()) S.pets.active = id;
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
  const ap = activePet(); if (ap && ap.kind === 'gems') gems += petLvl(ap.id);
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
    } else {
      const use = S.pets.active === p.id ? `<span class="badge pet-on">⭐ ${tr('Helping you', 'సాయం చేస్తోంది')}</span>` : `<button class="btn gold" data-act="pet-use" data-id="${p.id}">${tr('Take along', 'తీసుకెళ్ళు')}</button>`;
      action = use + (lvl < PET_MAX_LVL ? `<button class="btn purple" data-act="pet-lvl" data-id="${p.id}" data-gems="${petLevelCost(lvl)}">${tr('Level up', 'లెవెల్ అప్')} 💎${petLevelCost(lvl)}</button>` : `<span class="badge">${tr('Max level', 'గరిష్ట లెవెల్')}</span>`);
    }
    const stars = lvl ? `<div class="pet-lvl">${tr('Level', 'లెవెల్')} ${lvl}/${PET_MAX_LVL}<div class="mbar"><div style="width:${lvl / PET_MAX_LVL * 100}%"></div></div></div>` : '';
    return `<div class="pet-card ${lvl ? 'owned' : 'locked'} ${lvl && hungry ? 'hungry' : ''} ${S.pets.active === p.id ? 'active' : ''}" data-pet="${p.id}">
      <div class="pet-pic">${ico(p.icon)}</div>
      <div class="title">${tr(...p.name)}</div>
      <div class="desc">${petDesc(p)}</div>${stars}${action}</div>`;
  }).join('');
  const ap = activePet();
  return header('paws', tr('Pets', 'పెట్స్'), tr(`Take one pet along to the Spin Game. Each pet has its own power.${ap ? ` Helping now: <b>${ap.name[0]}</b> · ${petDesc(ap)}` : ''}`, `ఒక పెట్‌ను స్పిన్ గేమ్‌కి తీసుకెళ్ళండి. ప్రతి పెట్‌కి ఒక ప్రత్యేక శక్తి.${ap ? ` ఇప్పుడు సాయం: <b>${ap.name[1]}</b> · ${petDesc(ap)}` : ''}`)) +
    `<div class="pet-status ${hungry && ownedCount ? 'hungry' : ''}">${ico(hungry && ownedCount ? 'bowl' : 'sparkheart')}<div class="info">${status}</div>${feedBtn}</div>
    <div class="pet-grid">${cardsHtml}</div>`;
}

/* ---------------------------- TUTORIAL ------------------------------ */
// Short guided start through the Spin Game, Landmarks and Album.
const q = sel => document.querySelector(sel);
const tabBtn = tab => [...document.querySelectorAll(`.tab-btn[data-tab=${tab}]`)].find(b => b.getBoundingClientRect().width) || null;
// Each step lives on one tab, points at one thing, and moves on when the player has done it (or taps Next).
// `m` is a snapshot taken when the step starts, so a replayed tutorial still waits for a fresh action.
const TUTORIAL = [
  { tab: 'slots', target: () => q('#slotSpinBtn'), done: m => (S.stats.slotSpins || 0) > m.spins,
    text: ['Tap SPIN! Three coins in a row pay the most. Hold the button for auto spin.', 'స్పిన్ నొక్కండి! మూడు కాయిన్లు వరుసగా వస్తే పెద్ద బహుమతి. బటన్ పట్టుకుంటే ఆటో స్పిన్.'] },
  { tab: 'slots', target: () => q('#slotBetBtn'), done: m => S.tutorial.betTaps > m.betTaps,
    text: ['Tap BET to multiply every prize (it uses more energy too). Bigger bets up to ×800 unlock as your energy grows.', 'బెట్ నొక్కితే ప్రతి బహుమతి గుణించబడుతుంది (ఎనర్జీ కూడా ఎక్కువ ఖర్చు). ఎనర్జీ పెరిగే కొద్దీ ×800 వరకు బెట్లు తెరుచుకుంటాయి.'] },
  { tab: 'slots', target: () => q('#railLeft'), next: true,
    text: ['Side buttons: Boss fights, weekly Event, Village raids, Piggy bank, free Gifts and Daily energy. A red dot means something is ready!', 'పక్క బటన్లు: బాస్ ఫైట్, వారపు ఈవెంట్, ఊరి దాడులు, పిగ్గీ బ్యాంక్, ఫ్రీ గిఫ్ట్, రోజూ ఎనర్జీ. ఎర్ర చుక్క ఉంటే ఏదో సిద్ధంగా ఉంది!'] },
  { tab: 'build', target: () => q('.tc-build') || q('#buildView'), done: m => Object.keys(S.city.done).length > m.built || S.city.i > m.city,
    text: ['Spend coins to build your city! Tap a glowing + tile on the island, then tap Build.', 'కాయిన్లతో మీ నగరం కట్టండి! ద్వీపంపై మెరిసే + టైల్ నొక్కి, తర్వాత కట్టు నొక్కండి.'] },
  { tab: 'build', target: () => q('.bv-top'), next: true,
    text: ['MAP shows your trip across India. Learn 📖 has a fact and a quiz for every landmark—right answers win gems!', 'మ్యాప్‌లో భారతదేశ యాత్ర కనిపిస్తుంది. నేర్చుకో 📖 లో ప్రతి కట్టడానికి ఫ్యాక్ట్, క్విజ్—సరైన జవాబుకి జెమ్స్!'] },
  { tab: 'album', target: () => q('.pack-row'), next: true,
    text: ['Open sticker packs here. Finish a set of 9 and tap Claim for its prize. A full album unlocks a brand new one!', 'ఇక్కడ స్టిక్కర్ ప్యాక్‌లు తెరవండి. 9 స్టిక్కర్ల సెట్ పూర్తయితే తీసుకో నొక్కి బహుమతి పొందండి. ఆల్బమ్ పూర్తయితే కొత్తది వస్తుంది!'] },
  { tab: 'slots', target: () => tabBtn('missions'), finish: true,
    text: ['You are ready, boss! Do Missions for gems and come back daily—energy refills every 6 minutes.', 'మీరు రెడీ బాస్! జెమ్స్ కోసం మిషన్లు చేయండి, రోజూ రండి—ప్రతి 6 నిమిషాలకు ఎనర్జీ నిండుతుంది.'] },
];
const tutSnap = () => ({ spins: S.stats.slotSpins || 0, betTaps: S.tutorial.betTaps || 0, built: Object.keys(S.city.done).length, city: S.city.i });
let tutFocus = null;
function updateTutorial() {
  const box = $('tutor');
  const off = S.tutorial.done || !$('modal').classList.contains('hidden');
  if (off) { box.classList.add('hidden'); setTutFocus(null); $('tutHand').classList.add('hidden'); return; }
  S.tutorial.betTaps = S.tutorial.betTaps || 0;
  if (!S.tutorial.m) S.tutorial.m = tutSnap();
  let st = TUTORIAL[S.tutorial.step];
  while (st && st.done && st.done(S.tutorial.m)) { tutAdvance(); st = TUTORIAL[S.tutorial.step]; sfx('cash'); }
  if (!st) { endTutorial(); return; }
  // On the wrong tab, point at the tab button first
  const onTab = activeTab === st.tab;
  const target = onTab ? st.target() : tabBtn(st.tab);
  setTutFocus(target);
  box.classList.remove('hidden');
  setHTML($('tutorText'), `<b>${tr('Step', 'స్టెప్')} ${S.tutorial.step + 1}/${TUTORIAL.length}</b> ${onTab ? tr(...st.text) : tr(`Open ${{ slots: 'Spin Game', build: 'Landmarks', album: 'Album' }[st.tab]} first.`, `ముందు ${{ slots: 'స్పిన్ గేమ్', build: 'ల్యాండ్‌మార్కులు', album: 'ఆల్బమ్' }[st.tab]} తెరవండి.`)}`);
  const showNext = onTab && (st.next || st.finish);
  $('tutorNext').classList.toggle('hidden', !showNext);
  $('tutorNext').textContent = st.finish ? tr('Finish', 'పూర్తి') : tr('Next', 'తర్వాత');
  $('tutorSkip').textContent = tr('Skip', 'స్కిప్');
  // Keep the help box away from what it points at
  const r = target && target.getBoundingClientRect();
  box.classList.toggle('top', !!(r && r.width && r.top + r.height / 2 > innerHeight * 0.5));
  placeHand(target);
}
function tutAdvance() { S.tutorial.step++; S.tutorial.m = tutSnap(); save(); }
function tutNext() {
  const st = TUTORIAL[S.tutorial.step];
  if (st && st.finish) { endTutorial(); return; }
  tutAdvance(); SlotFX.press();
  const nx = TUTORIAL[S.tutorial.step];
  if (nx && nx.tab !== activeTab && (st.tab !== nx.tab)) switchTab(nx.tab);
  updateTutorial();
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
    party: ['#ffe066', '#ff8ad8', '#7ae8ff'],
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
      else if (colors === THEMES.party && s.c === 1 && s.z > 0.6) { ctx.globalAlpha = alpha * 0.25; ctx.beginPath(); ctx.arc(x, y, (4 + s.z * 9) * dpr, 0, 6.283); ctx.fill(); }
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
  if (BIZ_OFF) Music.setWorld(tab === 'build' ? 'build' : 'spin');
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
  const rows = GEM_SHOP.filter(g => !(BIZ_OFF && g.id === 'offline')).map(g => {
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
  if (BIZ_OFF) {
    const rows = [
      [tr('Coins', 'కాయిన్లు'), money(S.cash)],
      [tr('Prize multiplier', 'బహుమతి గుణకం'), 'x' + fmt(coinMult())],
      [tr('Coins earned (all time)', 'మొత్తం సంపాదించిన కాయిన్లు'), money(S.lifetime)],
      [tr('Spins', 'స్పిన్‌లు'), fmtInt(S.stats.slotSpins || 0)],
      [tr('Bosses beaten', 'ఓడించిన బాస్‌లు'), fmtInt(S.stats.bosses || 0)],
      [tr('Raids', 'దాడులు'), fmtInt(S.stats.raids || 0)],
      [tr('Landmarks built', 'కట్టిన ల్యాండ్‌మార్కులు'), landmarksDone() + ' / ' + Object.keys(LANDMARKS).length],
      [tr('Quiz answers right', 'సరైన క్విజ్ జవాబులు'), Object.values(S.city.quiz).filter(v => v === 1).length + ' / ' + Object.keys(LANDMARKS).length],
      [tr('Cities built', 'కట్టిన నగరాలు'), Math.min(S.city.i, CITIES.length) + ' / ' + CITIES.length],
      [tr('Stickers', 'స్టిక్కర్లు'), allStickers().filter(x => stickerHave(x.id)).length + ' / ' + allStickers().length],
      [tr('VIP', 'VIP'), tr(...vipTier().name)],
      [tr('Lucky spins', 'లక్కీ స్పిన్‌లు'), fmtInt(S.stats.spins || 0)],
      [tr('Awards', 'అవార్డులు'), Object.keys(S.achievements).length + ' / ' + ACHIEVEMENTS.length],
      [tr('Play time', 'ఆడిన సమయం'), fmtDur(S.stats.playTime)],
    ];
    return header('bars', tr('Stats', 'గణాంకాలు'), tr('Your empire at a glance.', 'మీ సామ్రాజ్యం ఒక్క చూపులో.')) +
      `<table class="stats-table">${rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table>
      <div class="toolbar share-bar"><span></span><button class="btn gold" data-act="share">${ico('letter')} ${tr('Share my empire', 'నా సామ్రాజ్యం షేర్ చేయి')}</button></div>`;
  }
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
  if (!BIZ_OFF) {
    $('dot-managers').classList.toggle('on', S.biz.some((b, i) => b.owned > 0 && !b.manager && S.cash >= BUSINESSES[i].managerCost));
    $('dot-upgrades').classList.toggle('on', UPGRADES.some(u => !S.upgrades[u.id] && S.cash >= u.cost));
    $('dot-investors').classList.toggle('on', investorsAvailable() >= Math.max(10, S.investors));
    $('dot-worlds').classList.toggle('on', WORLDS.some(w => !S.worldsUnlocked[w.id] && S.lifetime >= w.unlockAt));
  }
  $('dot-missions').classList.toggle('on', S.missions.some(m => missionValue(m) >= m.target));
  $('dot-daily').classList.toggle('on', canClaimDaily());
  $('dot-spin').classList.toggle('on', spinReady());
  $('dot-scratch').classList.toggle('on', scratchFreeReady());
  slotRegen(); $('dot-slots').classList.toggle('on', S.slot.energy >= slotMax() || giftReady() || calReady() || S.raid.tokens > 0 || helpLeft());
  $('dot-album').classList.toggle('on', S.album.packs.basic + S.album.packs.gold > 0 || setsReady() > 0 || seasonDone());
  $('dot-build').classList.toggle('on', !allCitiesDone() && S.cash >= nextTaskCost());
  const hasPets = Object.keys(S.pets.owned).length > 0;
  $('dot-pets').classList.toggle('on', hasPets ? (petsHungry() && petFeedReady()) : PETS.some(p => p.cost.cash ? S.cash >= p.cost.cash : false));
}

/* ---------------------------- UI: HEADER / BOOSTS ------------------- */
let cashShown = null;
function updateHeader() {
  if (cashShown == null || Math.abs(S.cash - cashShown) < 1 || !BIZ_OFF) cashShown = S.cash; else cashShown += (S.cash - cashShown) * 0.25;
  $('cash').textContent = money(Math.round(cashShown));
  if (BIZ_OFF) { slotRegen(); $('ips').textContent = `⚡ ${S.slot.energy} / ${slotMax()}` + (S.slot.energy < slotMax() ? ` · +1 ${fmtClock(slotNextIn())}` : ''); }
  else $('ips').textContent = money(incomePerSec()) + tr(' / sec', ' / సెకను');
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
    ${BIZ_OFF ? `<p>${tr('Spin to win <b>coins</b>, build famous <b>landmarks</b>, beat <b>bosses</b>, raid friends and collect <b>stickers</b>!', '<b>కాయిన్లు</b> గెలవడానికి స్పిన్ చేయండి, ప్రసిద్ధ <b>కట్టడాలు</b> కట్టండి, <b>బాస్‌లను</b> ఓడించండి, స్నేహితుల మీద దాడి చేయండి, <b>స్టిక్కర్లు</b> సేకరించండి!')}</p>` : ''}
    <p class="${BIZ_OFF ? 'hidden' : ''}">${tr('Tap your <b>Tea Stall</b> to earn cash. Buy more businesses, hire <b>managers</b>, grab <b>upgrades</b>, spin the <b>Lucky Wheel</b>, travel to the <b>Moon and Mars</b>, and climb the <b>leaderboard</b>!',
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
    case 'slot-spin': slotTap(); break;
    case 'sg-open': sgOpen(id); break;
    case 'slot-bet': slotSetBet(); break;
    case 'piggy-break': breakPiggy(); break;
    case 'gift-claim': claimGift(); break;
    case 'energy-buy': buyEnergy(id); break;
    case 'eo-bet1': S.slot.bet = 1; closeModal(); renderTab(); break;
    case 'eo-open': closeModal(); setTimeout(() => { if (id === 'daily') modal(dailyHtml()); if (id === 'spin') modal(spinHtml()); if (id === 'scratch') openScratch(); }, 50); break;
    case 'go-tab': closeModal(); switchTab(el.dataset.tab); break;
    case 'raid-open': openRaid(); break;
    case 'raid-go': raidGo(+id); break;
    case 'help-open': openHelp(); break;
    case 'help-go': helpGo(+id); break;
    case 'pack-open': openPack(id); break;
    case 'set-claim': claimSet(id, el); break;
    case 'season-open': showSeasonDone(); break;
    case 'season-claim': claimSeason(el); break;
    case 'pack-buy': buyPack(id); break;
    case 'star-trade': tradeStars(); break;
    case 'cal-claim': claimCalendar(); break;
    case 'build-part': buildPart(); break;
    case 'lm-next': {
      const from = el.getBoundingClientRect().width ? el : $('buildView');
      flyTo('coins', from, 'coin', 10); flyTo('gems', from, 'gem', 5, 120); flyTo('pack', from, 'pack', 2, 240);
      closeModal(); SlotFX.whoosh(); renderTab();
      if (id === 'city') setTimeout(cityCelebration, 900);
      break;
    }
    case 'city-next': {
      if (allCitiesDone()) { closeModal(); break; }
      const from = el.getBoundingClientRect().width ? el : $('buildView');
      if (!$('modal').classList.contains('hidden')) { flyTo('gems', from, 'gem', 6); flyTo('energy', from, 'bolt', 5, 120); flyTo('pack', from, 'pack', 2, 240); }
      S.city.i++; S.city.done = {}; S.city.view = null; B3.sel = -1; save();
      closeModal(); SlotFX.whoosh(); B3.zoomFrom = performance.now(); renderTab();
      if (!allCitiesDone()) toast(tr(`✈️ Welcome to ${CITIES[S.city.i].name[0]}!`, `✈️ ${CITIES[S.city.i].name[1]} కి స్వాగతం!`), 'good');
      break;
    }
    case 'build-map': openBuildMap(); break;
    case 'build-parts': openBuildParts(); break;
    case 'lm-info': lmInfo(id); break;
    case 'quiz': answerQuiz(el, id); break;
    case 'city-intro': SlotFX.press(); cityIntro(+id); break;
    case 'build-view': S.city.view = +id >= 0 ? +id : null; B3.zoomFrom = performance.now(); closeModal(); renderTab(); break;
    case 'ad': watchAd(); break;
    case 'ad-go': { const f = pendingShowAd; pendingShowAd = null; closeModal(); if (f) f(); break; }
    case 'scratch-buy': buyScratch(); break;
    case 'scratch-reveal': revealScratch(); break;
    case 'stock-buy': buyStock(+el.dataset.k, +el.dataset.f); renderTab(); break;
    case 'stock-sell': sellStock(+el.dataset.k); renderTab(); break;
    case 'pet-buy': buyPet(id); renderTab(); break;
    case 'pet-lvl': levelPet(id); renderTab(); break;
    case 'pet-use': usePet(id); renderTab(); break;
    case 'pet-feed': feedPets(); renderTab(); break;
    case 'festival': if (activeFestival()) modal(festivalHtml()); break;
    case 'fest-claim': claimFestival(); closeModal(); break;
    case 'tut-skip': endTutorial(); break;
    case 'tut-next': tutNext(); break;
    case 'tut-replay': S.tutorial = { step: 0, done: false, v: 2 }; switchTab(BIZ_OFF ? 'slots' : 'business'); toast(tr('📖 Tutorial restarted!', '📖 ట్యుటోరియల్ మళ్ళీ మొదలైంది!'), 'good'); break;
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
  if (!BIZ_OFF) S.biz.forEach((b, i) => {
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

  if (BIZ_OFF) { marketEvent = null; return; }
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
  if (!BIZ_OFF) updateBizBars();
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
    leagueWeek();
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
migrateBuild();
hydrateIcons();
applyLowFx();
applyStaticText();
applyWorld(S.world);
ensureMissions();
ensurePlayerId();
if (!BIZ_OFF) { buildBizCards(); initTilt(); }
document.body.classList.toggle('biz-off', BIZ_OFF);
if (BIZ_OFF) { Music.setWorld('spin'); Stars.setWorld('party'); }
if (BIZ_OFF) switchTab('slots');
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
