// Runs every 30 minutes and sends at most one reminder per player:
// tournament ending soon, free spin ready, daily reward ready, or hungry pets.
// No reminders between 22:00 and 08:00 player-local time, and at least 3 hours between reminders.
import { getStore } from '@netlify/blobs';
import webpush from 'web-push';
import { getVapid, SITE } from '../lib/vapid.mjs';

const H = 3600000;
const DAY = 24 * H;
const MIN_GAP = 3 * H;

const TEXT = {
  tour: { en: ['🏆 Tournament ends soon!', 'The weekly tournament closes tonight. Earn more to climb the ranks!'],
          te: ['🏆 టోర్నమెంట్ త్వరలో ముగుస్తుంది!', 'వారపు టోర్నమెంట్ ఈ రాత్రి ముగుస్తుంది. ర్యాంక్ పెంచుకోండి!'] },
  spin:  { en: ['🎡 Free spin ready!', 'Your Lucky Wheel spin is waiting. Come win gems!'],
          te: ['🎡 ఫ్రీ స్పిన్ రెడీ!', 'మీ లక్కీ వీల్ స్పిన్ ఎదురుచూస్తోంది. జెమ్స్ గెలవండి!'] },
  daily: { en: ['🎁 Daily reward ready!', 'Claim today\'s reward and keep your streak going.'],
          te: ['🎁 డైలీ రివార్డ్ రెడీ!', 'ఈ రోజు రివార్డ్ తీసుకుని మీ స్ట్రీక్ కొనసాగించండి.'] },
  pets:  { en: ['🐶 Your pets are hungry!', 'Feed them to keep their full bonus.'],
          te: ['🐶 మీ పెట్స్‌కు ఆకలిగా ఉంది!', 'పూర్తి బోనస్ కోసం వాటికి తినిపించండి.'] },
};

function local(now, tz) {
  const d = new Date(now + tz * 60000);
  return { hour: d.getUTCHours(), day: `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}` };
}
function weekStart(now) {
  const d = new Date(now);
  const midnight = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return midnight - ((new Date(midnight).getUTCDay() + 6) % 7) * DAY;
}

// Which reminder (if any) is due for this player right now
function dueReminder(rec, now) {
  const st = rec.state, last = rec.last || {};
  const { hour, day } = local(now, st.tz);
  if (hour < 8 || hour >= 22) return null;
  if (now - (last.any || 0) < MIN_GAP) return null;
  const ws = weekStart(now), weekEnd = ws + 7 * DAY;
  if (st.tourPlaying && now >= weekEnd - 12 * H && (last.tour || 0) < ws) return 'tour';
  if (st.spinAt && now >= st.spinAt && (last.spin || 0) < st.spinAt) return 'spin';
  if (st.dailyLast !== day && last.dailyDay !== day && hour >= 9) return 'daily';
  if (st.pets > 0 && now - st.fedAt > 20 * H && now - (last.pets || 0) > 12 * H) return 'pets';
  return null;
}

export default async () => {
  const vapid = await getVapid();
  webpush.setVapidDetails(SITE, vapid.publicKey, vapid.privateKey);
  const subs = getStore('push-subs');
  const { blobs } = await subs.list();
  const now = Date.now();
  let sent = 0, removed = 0;

  for (let k = 0; k < blobs.length; k += 20) {
    await Promise.allSettled(blobs.slice(k, k + 20).map(async ({ key }) => {
      const rec = await subs.get(key, { type: 'json' });
      if (!rec) return;
      const type = dueReminder(rec, now);
      if (!type) return;
      const [title, body] = TEXT[type][rec.state.lang] || TEXT[type].en;
      try {
        await webpush.sendNotification(rec.sub, JSON.stringify({ title, body, url: SITE, tag: type }), { TTL: 3 * 3600 });
        rec.last = Object.assign({}, rec.last, { any: now, [type]: now });
        if (type === 'daily') rec.last.dailyDay = local(now, rec.state.tz).day;
        await subs.setJSON(key, rec);
        sent++;
      } catch (e) {
        // The phone unsubscribed or the app was removed
        if (e.statusCode === 404 || e.statusCode === 410) { await subs.delete(key); removed++; }
      }
    }));
  }
  console.log(`push-cron: ${blobs.length} subscribers, ${sent} sent, ${removed} removed`);
};

export const config = { schedule: '*/30 * * * *' };
