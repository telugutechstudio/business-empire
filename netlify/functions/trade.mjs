// Sticker trading between friends for the Album.
// POST /api/trade {action: 'send',  id, name, sticker} -> { code }               (parks one sticker under a 6-letter code)
// POST /api/trade {action: 'claim', id, code}          -> { sticker, from }      (hands it over once, then the code is gone)
import { getStore } from '@netlify/blobs';

const SENDS_PER_DAY = 10;
const CODE_LIFE_MS = 7 * 86400000;
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O or 1/I/L to mix up

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});
const cleanName = s => String(s || '').replace(/[<>&"'`\\\u0000-\u001f]/g, '').trim().slice(0, 16);
const validId = id => /^[a-z0-9]{12,40}$/i.test(id);
const validSticker = s => /^(s\d{1,3}:)?[a-z]{2,12}-[0-8]$/.test(s);
const today = () => new Date().toISOString().slice(0, 10);
const newCode = () => Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);
  let body;
  try { body = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
  const id = String(body.id || '');
  if (!validId(id)) return json({ error: 'bad id' }, 400);
  const store = getStore({ name: 'trade', consistency: 'strong' }); // a code must be claimable right after it is made

  if (body.action === 'send') {
    const sticker = String(body.sticker || '');
    if (!validSticker(sticker)) return json({ error: 'bad sticker' }, 400);
    const me = (await store.get('p:' + id, { type: 'json' })) || {};
    if (me.day !== today()) { me.day = today(); me.sent = 0; }
    if (me.sent >= SENDS_PER_DAY) return json({ error: 'no more trades today' }, 429);
    let code = newCode();
    for (let tries = 0; tries < 5 && (await store.get('t:' + code)); tries++) code = newCode();
    me.sent++;
    await store.setJSON('p:' + id, me);
    await store.setJSON('t:' + code, { sticker, from: cleanName(body.name) || 'Friend', fromId: id, at: Date.now() });
    return json({ code });
  }

  if (body.action === 'claim') {
    const code = String(body.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (code.length !== 6) return json({ error: 'bad code' }, 400);
    const t = await store.get('t:' + code, { type: 'json' });
    if (!t || Date.now() - t.at > CODE_LIFE_MS) { if (t) await store.delete('t:' + code); return json({ error: 'code not found' }, 404); }
    if (t.fromId === id) return json({ error: 'that is your own code' }, 409);
    await store.delete('t:' + code);
    return json({ sticker: t.sticker, from: t.from });
  }

  return json({ error: 'unknown action' }, 400);
};

export const config = { path: '/api/trade' };
