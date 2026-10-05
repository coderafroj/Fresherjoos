/* /api/geocode
   POST {lat,lng}  -> us jagah ka area, sadak, shehar, PINCODE (OpenStreetMap Nominatim ya LocationIQ se)
   GET  (kuch nahi) -> internet (IP) se shehar ka andaaza, Vercel ke headers se (GPS na mile tab kaam aata hai)
   Customer ki location kahin save nahi hoti. Sirf chhota in-memory cache hai. */
import { guard, readBody, clientIp, rateLimiter } from "./_lib.js";

const limited = rateLimiter(60, 10 * 60_000);
const UA = process.env.GEOCODE_UA || "FreshersJuice/3.0 (juice delivery; geocode)";
const cache = new Map();                 // "28.3745,79.4543" -> {t, place}
const TTL = 24 * 3600_000;
let chain = Promise.resolve(), lastCall = 0, pending = 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Nominatim ke liye 1 request/second ka niyam: sab calls line se jaati hain. */
function throttled(fn) {
  if (pending >= 6) return Promise.reject(new Error("busy"));
  pending++;
  const run = chain.then(async () => {
    const wait = Math.max(0, 1100 - (Date.now() - lastCall));
    if (wait) await sleep(wait);
    lastCall = Date.now();
    return fn();
  }).finally(() => { pending--; });
  chain = run.catch(() => {});
  return run;
}

const first = (...v) => v.find((x) => x && String(x).trim()) || "";

export function parseAddress(a = {}) {
  const pinMatch = String(a.postcode || "").match(/\d{6}/);
  const city = first(a.city, a.town, a.village, a.municipality, a.state_district, a.county);
  const area = first(a.neighbourhood, a.suburb, a.quarter, a.residential, a.city_district, a.hamlet, a.road, city);
  const road = first(a.road, a.pedestrian, a.footway);
  const line = [...new Set([road, first(a.neighbourhood, a.suburb, a.quarter, a.city_district), city].filter(Boolean))].join(", ");
  return { area, road, city, state: a.state || "", country: (a.country_code || "").toUpperCase(), pin: pinMatch ? pinMatch[0] : String(a.postcode || ""), line };
}

async function upstream(lat, lng) {
  const key = process.env.LOCATIONIQ_KEY;
  const url = key
    ? `https://us1.locationiq.com/v1/reverse?key=${encodeURIComponent(key)}&lat=${lat}&lon=${lng}&format=json&addressdetails=1&normalizeaddress=1`
    : `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=en`;
  const r = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "en" }, signal: AbortSignal.timeout(6000) });
  if (!r.ok) throw new Error("geocoder " + r.status);
  const d = await r.json();
  return parseAddress(d.address || {});
}

function fromIp(req) {
  const h = req.headers, dec = (v) => { try { return decodeURIComponent(String(v || "")); } catch { return String(v || ""); } };
  const lat = parseFloat(h["x-vercel-ip-latitude"]), lng = parseFloat(h["x-vercel-ip-longitude"]);
  const city = dec(h["x-vercel-ip-city"]);
  if (!city && !isFinite(lat)) return null;
  return { city, region: dec(h["x-vercel-ip-country-region"]), country: dec(h["x-vercel-ip-country"]), lat: isFinite(lat) ? lat : null, lng: isFinite(lng) ? lng : null };
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST" && req.method !== "GET") return res.status(405).json({ ok: false });
  if (!guard(req, res, { method: req.method })) return;
  if (limited(clientIp(req))) return res.status(429).json({ ok: false, error: "slow" });

  if (req.method === "GET") return res.status(200).json({ ok: true, ip: fromIp(req) });

  const { lat, lng } = readBody(req);
  if (!(Math.abs(lat) <= 90 && Math.abs(lng) <= 180) || typeof lat !== "number" || typeof lng !== "number")
    return res.status(400).json({ ok: false, error: "bad coords" });
  const la = +lat.toFixed(4), ln = +lng.toFixed(4), key = la + "," + ln;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.t < TTL) return res.status(200).json({ ok: true, place: hit.place, cached: true });
  try {
    const place = await throttled(() => upstream(la, ln));
    cache.set(key, { t: Date.now(), place });
    if (cache.size > 2000) cache.delete(cache.keys().next().value);
    return res.status(200).json({ ok: true, place });
  } catch (e) {
    console.error("geocode fail:", e.message);
    return res.status(200).json({ ok: true, place: null });   // coordinates to mil gaye, bas address nahi
  }
}
