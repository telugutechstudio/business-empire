// Cloud save for Business Empire.
// A save is stored under a random 12-character code (no accounts). Anyone with the code can load it,
// so the code is the secret: ~60 bits from a 32-letter alphabet.
// GET  /api/cloud?code=XXXX-XXXX-XXXX -> { data, savedAt }
// POST /api/cloud { code, data }       -> { ok, savedAt }
import { getStore } from '@netlify/blobs';

const CODE = /^[A-HJ-NP-Z2-9]{12}$/; // no I, O, 0, 1
const MAX_BYTES = 300000;

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});
const normalize = c => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

export default async (req) => {
  const store = getStore('saves');

  if (req.method === 'GET') {
    const code = normalize(new URL(req.url).searchParams.get('code'));
    if (!CODE.test(code)) return json({ error: 'invalid code' }, 400);
    const rec = await store.get(code, { type: 'json' });
    return rec ? json(rec) : json({ error: 'not found' }, 404);
  }

  if (req.method === 'POST') {
    const text = await req.text();
    if (text.length > MAX_BYTES) return json({ error: 'save too big' }, 413);
    let body;
    try { body = JSON.parse(text); } catch { return json({ error: 'bad json' }, 400); }
    const code = normalize(body.code);
    if (!CODE.test(code) || !body.data || typeof body.data !== 'object' || Array.isArray(body.data)) {
      return json({ error: 'invalid save' }, 400);
    }
    const rec = { data: body.data, savedAt: Date.now() };
    await store.setJSON(code, rec);
    return json({ ok: true, savedAt: rec.savedAt });
  }

  return json({ error: 'method not allowed' }, 405);
};

export const config = { path: '/api/cloud' };
