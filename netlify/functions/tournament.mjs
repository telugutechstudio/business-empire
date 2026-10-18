// Weekly tournament for Business Empire. Weeks run Monday 00:00 to Sunday 24:00 UTC.
// Score = money earned during the week (the game sends it).
// GET  /api/tournament?id=<playerId>[&week=YYYY-MM-DD] -> ranking for that week (default: this week)
// POST /api/tournament {id, name, score, world}         -> saves your best score for this week, then the ranking
import { getStore } from '@netlify/blobs';

const KEEP = 300;
const SHOW = 50;
const DAY = 86400000;

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});
const cleanName = s => String(s || '').replace(/[<>&"'`\\\u0000-\u001f]/g, '').trim().slice(0, 16);
const validId = id => /^[a-z0-9]{12,40}$/i.test(id);

function weekStart(now = Date.now()) {
  const d = new Date(now);
  const midnight = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const dow = (new Date(midnight).getUTCDay() + 6) % 7; // Monday = 0
  return midnight - dow * DAY;
}
const weekKey = start => new Date(start).toISOString().slice(0, 10);

function ranked(board, myId, week, start) {
  const sorted = Object.entries(board).sort((a, b) => b[1].score - a[1].score);
  const top = sorted.slice(0, SHOW).map(([id, e], k) => ({ rank: k + 1, name: e.name, score: e.score, world: e.world || 'earth', me: id === myId }));
  const idx = sorted.findIndex(([id]) => id === myId);
  return { week, endsAt: start + 7 * DAY, top, players: sorted.length, myRank: idx >= 0 ? idx + 1 : null, myScore: idx >= 0 ? sorted[idx][1].score : null };
}

export default async (req) => {
  const store = getStore('tournament');
  const url = new URL(req.url);
  const start = weekStart();
  const current = weekKey(start);

  if (req.method === 'GET') {
    const asked = url.searchParams.get('week');
    const week = /^\d{4}-\d{2}-\d{2}$/.test(asked || '') ? asked : current;
    const board = (await store.get(`week-${week}`, { type: 'json' })) || {};
    return json(ranked(board, url.searchParams.get('id') || '', week, Date.parse(week + 'T00:00:00Z')));
  }
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  let body;
  try { body = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
  const id = String(body.id || '');
  const name = cleanName(body.name);
  const score = Number(body.score);
  const world = ['earth', 'moon', 'mars'].includes(body.world) ? body.world : 'earth';
  if (!validId(id) || !name || !Number.isFinite(score) || score < 0 || score > 1e300) return json({ error: 'invalid entry' }, 400);

  const key = `week-${current}`;
  let board = (await store.get(key, { type: 'json' })) || {};
  const prev = board[id];
  board[id] = { name, score: Math.max(score, prev ? prev.score : 0), world, ts: Date.now() };
  board = Object.fromEntries(Object.entries(board).sort((a, b) => b[1].score - a[1].score).slice(0, KEEP));
  await store.setJSON(key, board);
  return json(ranked(board, id, current, start));
};

export const config = { path: '/api/tournament' };
