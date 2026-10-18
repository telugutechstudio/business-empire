// Online leaderboard for Business Empire.
// GET  /api/leaderboard?id=<playerId>          -> top players + your rank
// POST /api/leaderboard {id, name, score, world} -> save your best score, then same as GET
import { getStore } from '@netlify/blobs';

const KEEP = 500;   // players stored
const SHOW = 50;    // players returned

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});

const cleanName = s => String(s || '').replace(/[<>&"'`\\\u0000-\u001f]/g, '').trim().slice(0, 16);
const validId = id => /^[a-z0-9]{12,40}$/i.test(id);

function ranked(board, myId) {
  const sorted = Object.entries(board).sort((a, b) => b[1].score - a[1].score);
  const top = sorted.slice(0, SHOW).map(([id, e], k) => ({
    rank: k + 1, name: e.name, score: e.score, world: e.world || 'earth', me: id === myId,
  }));
  const idx = sorted.findIndex(([id]) => id === myId);
  return { top, players: sorted.length, myRank: idx >= 0 ? idx + 1 : null, myScore: idx >= 0 ? sorted[idx][1].score : null };
}

export default async (req) => {
  const store = getStore('leaderboard');
  let board = (await store.get('board', { type: 'json' })) || {};
  const url = new URL(req.url);

  if (req.method === 'GET') return json(ranked(board, url.searchParams.get('id') || ''));
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  let body;
  try { body = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
  const id = String(body.id || '');
  const name = cleanName(body.name);
  const score = Number(body.score);
  const world = ['earth', 'moon', 'mars', 'galaxy'].includes(body.world) ? body.world : 'earth';
  if (!validId(id) || !name || !Number.isFinite(score) || score < 0 || score > 1e300) {
    return json({ error: 'invalid entry' }, 400);
  }

  const prev = board[id];
  board[id] = { name, score: Math.max(score, prev ? prev.score : 0), world, ts: Date.now() };
  board = Object.fromEntries(Object.entries(board).sort((a, b) => b[1].score - a[1].score).slice(0, KEEP));
  await store.setJSON('board', board);
  return json(ranked(board, id));
};

export const config = { path: '/api/leaderboard' };
