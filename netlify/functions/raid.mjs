// Raids and help between players for the Spin Game.
// POST /api/raid {action: 'sync',    id, name, coins, shields, lm} -> { inbox }   (stores your village, hands over news since last time)
// POST /api/raid {action: 'targets', id}                          -> { targets } (a few other recent players)
// POST /api/raid {action: 'raid',    id, target}                  -> { blocked } or { amt }
// POST /api/raid {action: 'help',    id, target}                  -> { ok }
import { getStore } from '@netlify/blobs';

const INDEX_KEEP = 800;            // players kept in the index
const ACTIVE_MS = 14 * 86400000;   // only raid players seen in the last two weeks
const RAID_SHARE = 0.15, RAID_MIN = 2000, RAID_MAX = 5e6;
const RAIDS_PER_HOUR = 12, HELPS_PER_DAY = 5;

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});
const cleanName = s => String(s || '').replace(/[<>&"'`\\\u0000-\u001f]/g, '').trim().slice(0, 16);
const validId = id => /^[a-z0-9]{12,40}$/i.test(id);
const num = (x, max) => { const n = Math.floor(Number(x)); return Number.isFinite(n) ? Math.max(0, Math.min(max, n)) : 0; };
const today = () => new Date().toISOString().slice(0, 10);
const pushInbox = (rec, item) => { rec.inbox = [...(rec.inbox || []), { ...item, ts: Date.now() }].slice(-20); };

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);
  let body;
  try { body = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
  const id = String(body.id || '');
  if (!validId(id)) return json({ error: 'bad id' }, 400);
  const store = getStore({ name: 'raid', consistency: 'strong' });
  const get = key => store.get('p:' + key, { type: 'json' });
  const put = (key, rec) => store.setJSON('p:' + key, rec);

  if (body.action === 'sync') {
    const name = cleanName(body.name) || 'Boss';
    const rec = (await get(id)) || { inbox: [] };
    const inbox = rec.inbox || [];
    Object.assign(rec, { name, coins: num(body.coins, 1e15), shields: num(body.shields, 3), lm: num(body.lm, 99), ts: Date.now(), inbox: [] });
    await put(id, rec);
    const index = (await store.get('index', { type: 'json' })) || {};
    index[id] = { name, ts: rec.ts };
    const trimmed = Object.fromEntries(Object.entries(index).sort((a, b) => b[1].ts - a[1].ts).slice(0, INDEX_KEEP));
    await store.setJSON('index', trimmed);
    return json({ inbox });
  }

  if (body.action === 'targets') {
    const index = (await store.get('index', { type: 'json' })) || {};
    const now = Date.now();
    const ids = Object.keys(index).filter(k => k !== id && now - index[k].ts < ACTIVE_MS);
    for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
    const targets = [];
    for (const k of ids.slice(0, 4)) {
      const r = await get(k);
      if (r) targets.push({ id: k, name: r.name, coins: r.coins, lm: r.lm, shield: r.shields > 0 });
    }
    return json({ targets });
  }

  const tid = String(body.target || '');
  if (!validId(tid) || tid === id) return json({ error: 'bad target' }, 400);
  const me = await get(id), them = await get(tid);
  if (!me || !them) return json({ error: 'unknown player' }, 404);

  if (body.action === 'raid') {
    const hour = Math.floor(Date.now() / 3600000);
    if (me.raidHour !== hour) { me.raidHour = hour; me.raids = 0; }
    if (me.raids >= RAIDS_PER_HOUR) return json({ error: 'too many raids, try later' }, 429);
    me.raids++;
    await put(id, me);
    if (them.shields > 0) {
      them.shields--;
      pushInbox(them, { type: 'blocked', from: me.name });
      await put(tid, them);
      return json({ blocked: true, name: them.name });
    }
    const amt = Math.min(RAID_MAX, Math.max(RAID_MIN, Math.floor(them.coins * RAID_SHARE)));
    them.coins = Math.max(0, them.coins - amt);
    pushInbox(them, { type: 'raid', from: me.name, amt });
    await put(tid, them);
    return json({ amt, name: them.name });
  }

  if (body.action === 'help') {
    const d = today();
    if (me.helpDay !== d) { me.helpDay = d; me.helped = []; }
    if (me.helped.includes(tid)) return json({ error: 'already helped today' }, 409);
    if (me.helped.length >= HELPS_PER_DAY) return json({ error: 'no more help today' }, 429);
    me.helped.push(tid);
    await put(id, me);
    pushInbox(them, { type: 'help', from: me.name, energy: 5 });
    await put(tid, them);
    return json({ ok: true, name: them.name });
  }

  return json({ error: 'unknown action' }, 400);
};

export const config = { path: '/api/raid' };
