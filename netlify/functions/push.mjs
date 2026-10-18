// Push notification sign-up for Business Empire.
// GET    /api/push              -> { publicKey }  (VAPID keys are made once and kept server-side in Netlify Blobs)
// POST   /api/push {id, sub, state} -> saves the phone's push subscription and the game timers to remind about
// DELETE /api/push {id}         -> stops notifications for that player
import { getStore } from '@netlify/blobs';
import { getVapid } from '../lib/vapid.mjs';

const ID = /^[0-9a-f]{24}$/;
const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});

function cleanState(st) {
  const num = v => (Number.isFinite(Number(v)) ? Number(v) : 0);
  return {
    lang: st.lang === 'te' ? 'te' : 'en',
    tz: Math.max(-840, Math.min(840, num(st.tz))), // minutes to add to UTC for local time
    spinAt: num(st.spinAt),
    fedAt: num(st.fedAt),
    pets: Math.min(20, num(st.pets)),
    dailyLast: String(st.dailyLast || '').slice(0, 12),
    tourPlaying: !!st.tourPlaying,
  };
}

export default async (req) => {
  if (req.method === 'GET') {
    const { publicKey } = await getVapid();
    return json({ publicKey });
  }
  let body;
  try { body = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
  const id = String(body.id || '');
  if (!ID.test(id)) return json({ error: 'invalid id' }, 400);
  const subs = getStore('push-subs');

  if (req.method === 'DELETE') {
    await subs.delete(id);
    return json({ ok: true });
  }
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  const prev = await subs.get(id, { type: 'json' });
  const sub = body.sub || (prev && prev.sub);
  if (!sub || typeof sub.endpoint !== 'string' || !/^https:\/\//.test(sub.endpoint) || !sub.keys) {
    return json({ error: 'no subscription' }, 400);
  }
  const rec = {
    sub: { endpoint: sub.endpoint.slice(0, 1000), keys: { p256dh: String(sub.keys.p256dh || ''), auth: String(sub.keys.auth || '') } },
    state: cleanState(body.state || {}),
    last: (prev && prev.last) || {},
    updated: Date.now(),
  };
  await subs.setJSON(id, rec);
  return json({ ok: true });
};

export const config = { path: '/api/push' };
