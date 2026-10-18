// Player counter for Business Empire (no personal data — only the game's random player id).
// POST /api/players {id} -> marks the player active today; returns { today, total }
// GET  /api/players      -> { total, today, newToday, days: [{ day, active, new }] } for the last 30 days
import { getStore } from '@netlify/blobs';

const ID = /^[0-9a-f]{24}$/;
const DAYS = 30;

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});
const dayKey = d => d.toISOString().slice(0, 10); // UTC day

export default async (req) => {
  const store = getStore('players');

  if (req.method === 'POST') {
    let body;
    try { body = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
    const id = String(body.id || '');
    if (!ID.test(id)) return json({ error: 'invalid id' }, 400);

    const today = dayKey(new Date());
    const all = (await store.get('all', { type: 'json' })) || {};
    const isNew = !all[id];
    if (isNew) {
      all[id] = today;
      await store.setJSON('all', all);
    }
    const d = (await store.get(`day-${today}`, { type: 'json' })) || { active: {}, new: 0 };
    if (!d.active[id]) {
      d.active[id] = 1;
      if (isNew) d.new++;
      await store.setJSON(`day-${today}`, d);
    }
    return json({ ok: true, today: Object.keys(d.active).length, total: Object.keys(all).length });
  }

  if (req.method === 'GET') {
    const keys = Array.from({ length: DAYS }, (_, k) => dayKey(new Date(Date.now() - (DAYS - 1 - k) * 86400000)));
    const [all, ...dayData] = await Promise.all([
      store.get('all', { type: 'json' }),
      ...keys.map(k => store.get(`day-${k}`, { type: 'json' })),
    ]);
    const days = keys.map((day, k) => ({
      day,
      active: dayData[k] ? Object.keys(dayData[k].active).length : 0,
      new: dayData[k] ? dayData[k].new : 0,
    }));
    const last = days[days.length - 1];
    return json({ total: all ? Object.keys(all).length : 0, today: last.active, newToday: last.new, days });
  }

  return json({ error: 'method not allowed' }, 405);
};

export const config = { path: '/api/players' };
