// netlify/functions/lib/ratelimit.mjs
import { getStore } from '@netlify/blobs';

const WINDOW_MS = 60 * 60 * 1000; // 1 uur
const MAX_PER_WINDOW = 40; // max verzoeken per IP per uur

// now wordt geïnjecteerd zodat dit testbaar blijft.
export async function checkRateLimit(ip, now = Date.now()) {
  if (!ip) return { ok: true };
  try {
    const store = getStore('chat-ratelimit');
    const raw = await store.get(ip, { type: 'json' });
    const hits = Array.isArray(raw) ? raw.filter((t) => now - t < WINDOW_MS) : [];
    if (hits.length >= MAX_PER_WINDOW) return { ok: false };
    hits.push(now);
    await store.setJSON(ip, hits);
    return { ok: true };
  } catch (e) {
    // Netlify Blobs is alleen beschikbaar binnen een Netlify runtime (deploy of
    // `netlify dev`). Buiten die context (of bij een storingsprobleem) falen we
    // open zodat de chat blijft werken; de per-request caps blijven dan de
    // enige verdediging.
    console.warn('ratelimit unavailable', e?.message);
    return { ok: true };
  }
}
