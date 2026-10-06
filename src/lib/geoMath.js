/*  GEO MATH — location ka poora hisaab-kitaab (koi React nahi, isliye aasani se test hota hai)

    1. haversine / bearing / local x-y (meter) mein badalna
    2. Kalman2D     : GPS ki hilti-dulti readings ko ek pakke, sahi point mein badalta hai
                      (jis reading ki accuracy achhi ho use zyada bharosa, kharab ko kam)
    3. FixFilter    : galat readings (achanak 5 km door uchhalna, bahut kamzor reading) ko hata deta hai
    4. confidence / compass / eta : customer ko dikhane layak bhasha                                    */

const R = 6371008.8;                         // dharti ka radius (meter)
export const rad = (d) => (d * Math.PI) / 180;
export const deg = (r) => (r * 180) / Math.PI;

/** do points ke beech doori (meter) */
export function haversineM(a, b) {
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** a se b ki disha (0 = uttar, 90 = purv ...) */
export function bearing(a, b) {
  const y = Math.sin(rad(b.lng - a.lng)) * Math.cos(rad(b.lat));
  const x = Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) - Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lng - a.lng));
  return (deg(Math.atan2(y, x)) + 360) % 360;
}
const DIRS = ["Uttar", "Uttar-Purv", "Purv", "Dakshin-Purv", "Dakshin", "Dakshin-Pashchim", "Pashchim", "Uttar-Pashchim"];
export const compass = (b) => DIRS[Math.round((((b % 360) + 360) % 360) / 45) % 8];

/** chhote ilaake ke liye lat/lng <-> meter (x = purv, y = uttar) */
export function toLocal(o, p) {
  return { x: rad(p.lng - o.lng) * Math.cos(rad(o.lat)) * R, y: rad(p.lat - o.lat) * R };
}
export function fromLocal(o, xy) {
  return { lat: o.lat + deg(xy.y / R), lng: o.lng + deg(xy.x / (R * Math.cos(rad(o.lat)))) };
}

/* ------------------------------------------------------------------ *
 *  Kalman filter (2D, "insaan ek jagah khada hai" model)
 *  state  : (x, y) meter mein, P = anishchitata (variance, m²)
 *  predict: P += q² · dt          (waqt ke saath thodi anishchitata badhti hai)
 *  update : K = P / (P + R)       (R = reading ki accuracy²)
 *           x += K · (z − x),  P = (1 − K) · P
 * ------------------------------------------------------------------ */
export class Kalman2D {
  constructor({ q = 0.4 } = {}) { this.q = q; this.reset(); }
  reset() { this.o = null; this.x = 0; this.y = 0; this.P = 0; this.t = 0; this.n = 0; }

  update(lat, lng, acc, t, speed) {
    const Rm = Math.max(acc, 3) ** 2;
    if (!this.o) { this.o = { lat, lng }; this.x = this.y = 0; this.P = Rm; this.t = t; this.n = 1; return this.state(); }
    const dt = Math.max(0, (t - this.t) / 1000); this.t = t;
    const qv = Number.isFinite(speed) && speed > 1.5 ? speed : this.q;   // chalte hue ho to zyada anishchitata
    this.P += qv * qv * dt;
    const z = toLocal(this.o, { lat, lng });
    const K = this.P / (this.P + Rm);
    this.x += K * (z.x - this.x); this.y += K * (z.y - this.y);
    this.P *= 1 - K; this.n++;
    return this.state();
  }
  state() {
    const p = fromLocal(this.o, { x: this.x, y: this.y });
    return { lat: p.lat, lng: p.lng, acc: Math.max(3, Math.sqrt(this.P)), n: this.n };
  }
}

/** Reading ko Kalman mein daalne se pehle jaanch: galat/kamzor reading rok do. */
export class FixFilter {
  constructor({ maxJumpMps = 60 } = {}) { this.maxJumpMps = maxJumpMps; this.k = new Kalman2D(); this.rejected = 0; }
  reset() { this.k.reset(); this.rejected = 0; }
  get current() { return this.k.o ? this.k.state() : null; }

  /** s = { lat, lng, acc, t(ms), speed? }  ->  { state } ya { rejected: "kaaran", state } */
  push(s) {
    if (!Number.isFinite(s.lat) || !Number.isFinite(s.lng) || Math.abs(s.lat) > 90 || Math.abs(s.lng) > 180) return { rejected: "bad" };
    const acc = Number.isFinite(s.acc) && s.acc > 0 ? s.acc : 5000;
    if (acc > 25000) return { rejected: "coarse" };                      // shehar-level andaaza, kaam ka nahi
    const cur = this.current;
    if (cur) {
      const d = haversineM(cur, s), dt = Math.max(1, (s.t - this.k.t) / 1000);
      // 1) achanak impossible tez "uchhal" + reading bhi achhi nahi -> GPS glitch
      if (d / dt > this.maxJumpMps && acc > cur.acc * 0.6) { this.rejected++; return { rejected: "jump", state: cur }; }
      // 2) jo pehle se pata hai usse bahut kamzor aur usi ke andar aati reading -> nayi jaankari nahi, bas shor
      if (acc > Math.max(300, cur.acc * 6) && d < acc) { this.rejected++; return { rejected: "weak", state: cur }; }
    }
    return { state: this.k.update(s.lat, s.lng, acc, s.t, s.speed) };
  }
}

/* ------------------------------------------------------------------ *
 *  Customer ko dikhane layak bhasha
 * ------------------------------------------------------------------ */
export function confidence(acc) {
  if (!Number.isFinite(acc)) return { level: 0, text: "Pata nahi", pct: 0 };
  if (acc <= 20) return { level: 4, text: "Bahut sahi", pct: 100 };
  if (acc <= 60) return { level: 3, text: "Sahi", pct: 78 };
  if (acc <= 200) return { level: 2, text: "Thoda kam sahi", pct: 50 };
  return { level: 1, text: "Sirf andaaza", pct: 24 };
}

/** pahunchne ka andaaza (minute): taiyari + doori / gaadi ki raftaar */
export function etaMinutes(distKm, { prepMin = 8, speedKmh = 18 } = {}) {
  return Math.max(1, Math.round(prepMin + (distKm / speedKmh) * 60));
}

/** area ke andar/bahar ka faisla, seema par flicker na ho (hysteresis) */
export function decideInside({ distKm, radiusKm, accM = 0, wasInside = false, hysteresisM = 120 }) {
  const benefit = Math.min(accM, 200) / 1000;                            // GPS ki galti ka thoda fayda (server bhi yahi karta hai)
  let inside = distKm - benefit <= radiusKm;
  if (!inside && wasInside && distKm <= radiusKm + hysteresisM / 1000) inside = true;
  const edge = Math.abs(distKm - radiusKm) * 1000 <= Math.max(accM, 40);
  return { inside, edge };
}
