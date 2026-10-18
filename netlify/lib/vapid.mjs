// VAPID keys for web push. Made once on first use and kept in Netlify Blobs, so no secret lives in the repo.
import { getStore } from '@netlify/blobs';
import webpush from 'web-push';

export const SITE = 'https://ajo-business-empire.netlify.app/';

export async function getVapid() {
  const config = getStore('push-config');
  let keys = await config.get('vapid', { type: 'json' });
  if (!keys) {
    keys = webpush.generateVAPIDKeys();
    await config.setJSON('vapid', keys);
  }
  return keys;
}
