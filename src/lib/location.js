import C from "../../shared/config.js";
import { postJSON, getJSON } from "./api.js";
import { FixFilter, haversineM, decideInside } from "./geoMath.js";
import { safeJSON, safeSet } from "./utils.js";

/*  LOCATION ENGINE — user kahin se bhi site khole, uski location + area + pincode nikalna, sab background mein.

    Darje (ek ke fail hone par agla):
      1) Jaldi wala GPS (network/wifi)   2-7 sec  -> header turant bhar jata hai
      2) Sahi GPS (high accuracy)        piche chalta hai, har nayi reading Kalman filter mein jaati hai
      3) Internet (IP) se shehar         GPS band/allow nahi ho tab bhi "Bareilly (approx)"

    Sahi karne ke tareeke:
      - FixFilter: galat reading (achanak 5 km uchhal / bahut kamzor) hata deta hai
      - Kalman filter: kai readings ko milakar ek pakka point + accuracy banata hai
      - Hysteresis: area ki seema par baar-baar andar/bahar flicker nahi
      - Reverse geocode sirf tab jab 60 m se zyada hile (server ko aaram, cache ka fayda)
      - Privacy: phone mein sirf ~100 m tak ki rounded location rakhte hain (poori sahi nahi)         */

const KEY = "fr-loc-v4";
const GEO = { goodAccuracyM: 25, maxWaitMs: 15000, ipFallback: true, refreshMinutes: 10, maxJumpMps: 60, hysteresisM: 120, ...(C.geo || {}) };
const AREA = C.area || {};
const zones = AREA.zones || [];
const zonesOn = AREA.enabled !== false && zones.length > 0;
const FRESH_MS = 30 * 60_000;
const round3 = (n) => Math.round(n * 1000) / 1000;

export const ERR_TEXT = {
  0: "Is browser mein location available nahi hai",
  1: "Location ki permission band hai",
  2: "Phone ki Location (GPS) service band hai ya signal nahi hai",
  3: "GPS ne jawab dene mein bahut der lagayi"
};

const initial = { status: "idle", fix: null, place: null, ip: null, zone: null, perm: "unknown", error: null, updatedAt: 0, refining: false, samples: 0, rejected: 0 };

class LocationEngine {
  #s = { ...initial };
  #subs = new Set();
  #run = 0;                              // naya locate() chalte hi purana ruk jata hai
  #watch = null;
  #stopTimer = 0;
  #geoAbort = null;
  #geoFrom = null;
  #inited = false;
  #filter = new FixFilter({ maxJumpMps: GEO.maxJumpMps });
  #wasInside = false;

  subscribe = (fn) => { this.#subs.add(fn); return () => this.#subs.delete(fn); };
  getSnapshot = () => this.#s;
  #emit(patch) { this.#s = { ...this.#s, ...patch }; this.#subs.forEach((f) => f()); }

  /** page khulte hi ek baar */
  async init() {
    if (this.#inited) return;
    this.#inited = true;
    const saved = safeJSON(KEY, null);
    if (saved?.fix && Date.now() - saved.t < FRESH_MS) {
      const fix = { ...saved.fix, src: "cache" };
      this.#emit({ status: "ready", fix, place: saved.place || null, zone: this.#zone(fix), updatedAt: saved.t });
    }
    let perm = "unknown";
    try {
      const p = await navigator.permissions?.query({ name: "geolocation" });
      if (p) {
        perm = p.state;
        p.addEventListener("change", () => {
          this.#emit({ perm: p.state });
          if (p.state === "granted") this.locate({ force: true });
          if (p.state === "denied") this.#denied(1);
        });
      }
    } catch { /* iOS Safari mein Permissions API nahi hoti */ }
    this.#emit({ perm });

    if (perm === "denied") this.#denied(1);
    else if (perm === "granted") this.locate();
    else if (!this.#s.fix) this.#ipFallback();       // abhi permission nahi: tab bhi shehar dikha do

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && this.#s.perm === "granted" &&
          Date.now() - this.#s.updatedAt > GEO.refreshMinutes * 60_000) this.locate();
    });
    addEventListener("online", () => { if (this.#s.fix && !this.#s.place) this.#reverse(this.#s.fix); if (!this.#s.fix && !this.#s.ip) this.#ipFallback(); });
  }

  /* ---------- area ke andar/bahar (hysteresis ke saath) ---------- */
  #zone(fix) {
    if (!zonesOn) return null;
    let best = null;
    for (const z of zones) {
      const distKm = haversineM(fix, z) / 1000;
      if (!best || distKm < best.dist) best = { zone: z, dist: distKm };
    }
    const d = decideInside({ distKm: best.dist, radiusKm: best.zone.radiusKm, accM: fix.acc ?? 0, wasInside: this.#wasInside, hysteresisM: GEO.hysteresisM });
    this.#wasInside = d.inside;
    return { ...best, inside: d.inside, edge: d.edge };
  }

  #getPos(opts) { return new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, opts)); }

  /** Location lo: pehle jaldi wali, phir sahi wali. Return: aakhri state. */
  async locate({ force = false } = {}) {
    const run = ++this.#run;
    this.#stopWatch();
    this.#filter.reset();
    if (!("geolocation" in navigator)) {
      this.#emit({ error: { code: 0, text: ERR_TEXT[0] }, status: this.#s.fix ? "ready" : "error" });
      this.#ipFallback();
      return this.#s;
    }
    this.#emit({ status: this.#s.fix ? "ready" : "locating", refining: true, error: null, samples: 0, rejected: 0 });
    if (!this.#s.fix) this.#ipFallback();            // GPS ke intezaar mein bhi shehar turant dikha do

    // 1) jaldi wala
    try {
      const pos = await this.#getPos({ enableHighAccuracy: false, timeout: 7000, maximumAge: force ? 0 : 120_000 });
      if (run !== this.#run) return this.#s;
      this.#apply(pos, "net");
    } catch (e) {
      if (run !== this.#run) return this.#s;
      if (e?.code === 1) { this.#denied(1); return this.#s; }
    }

    // 2) sahi wala (background mein sudharta rehta hai)
    await this.#refine(run);
    if (run !== this.#run) return this.#s;
    this.#emit({ refining: false });

    if (!this.#s.fix) {                              // dono fail
      this.#emit({ status: "error", error: { code: 2, text: ERR_TEXT[2] } });
      this.#ipFallback();
    }
    return this.#s;
  }

  #refine(run) {
    return new Promise((resolve) => {
      let done = false;
      const finish = () => { if (done) return; done = true; this.#stopWatch(); resolve(); };
      this.#watch = navigator.geolocation.watchPosition(
        (pos) => {
          if (run !== this.#run) return finish();
          this.#apply(pos, "gps");
          const s = this.#s;
          if (s.fix && s.fix.acc <= GEO.goodAccuracyM && s.samples >= 3) finish();   // kai achhi readings milkar pakka
        },
        (err) => {
          if (run !== this.#run) return finish();
          if (err.code === 1) { this.#denied(1); finish(); }
          else if (!this.#s.fix) {
            this.#emit({ error: { code: err.code, text: ERR_TEXT[err.code] || ERR_TEXT[2] } });
            if (err.code === 2) finish();            // GPS hai hi nahi: 15 second mat ruko
          }
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: GEO.maxWaitMs }
      );
      this.#stopTimer = setTimeout(finish, GEO.maxWaitMs);
    });
  }

  #stopWatch() {
    if (this.#watch != null) navigator.geolocation.clearWatch(this.#watch);
    this.#watch = null;
    clearTimeout(this.#stopTimer);
  }

  /** ek reading ko filter se guzaro, theek ho to location update karo */
  #apply(pos, src) {
    const c = pos.coords;
    const r = this.#filter.push({ lat: c.latitude, lng: c.longitude, acc: c.accuracy, t: pos.timestamp || Date.now(), speed: c.speed });
    if (r.rejected) { this.#emit({ rejected: this.#filter.rejected }); return; }
    const st = r.state;
    const fix = { lat: st.lat, lng: st.lng, acc: st.acc, src, t: Date.now() };
    this.#emit({ status: "ready", fix, zone: this.#zone(fix), error: null, updatedAt: fix.t, samples: st.n });
    this.#persist();
    if (!this.#geoFrom || haversineM(this.#geoFrom, fix) > 60 || !this.#s.place) this.#reverse(fix);
  }

  #persist() {
    const f = this.#s.fix;
    if (f) safeSet(KEY, { fix: { lat: round3(f.lat), lng: round3(f.lng), acc: Math.max(f.acc, 120) }, place: this.#s.place, t: this.#s.updatedAt });
  }

  /** lat/lng -> area, shehar, pincode (server ke through) */
  async #reverse(fix) {
    this.#geoAbort?.abort();
    const ctrl = (this.#geoAbort = new AbortController());
    this.#geoFrom = { lat: fix.lat, lng: fix.lng };
    const call = () => postJSON("/api/geocode", { lat: fix.lat, lng: fix.lng }, { signal: ctrl.signal, timeout: 8000 });
    let r = await call();
    if (r.aborted) return;
    if (!r.data?.place) {
      await new Promise((ok) => setTimeout(ok, 1500));
      if (ctrl.signal.aborted) return;
      r = await call();
      if (r.aborted) return;
    }
    if (r.data?.place) { this.#emit({ place: r.data.place }); this.#persist(); }
    else this.#geoFrom = null;                       // agli reading par dobara koshish
  }

  async #ipFallback() {
    if (!GEO.ipFallback || this.#s.ip) return;
    const r = await getJSON("/api/geocode", { timeout: 6000 });
    if (r.data?.ip) this.#emit({ ip: r.data.ip });
  }

  #denied(code) {
    this.#run++;
    this.#stopWatch();
    this.#emit({ status: "denied", refining: false, error: { code, text: ERR_TEXT[code] } });
    this.#ipFallback();
  }

  /** order bhejte waqt: sahi location aane tak (zyada se zyada ms) ruko */
  async waitForFix(ms = 9000) {
    if (this.#s.fix && this.#s.fix.src !== "cache") return this.#s.fix;
    if (!this.#s.refining) this.locate({ force: true });
    return new Promise((resolve) => {
      const t = setTimeout(() => { off(); resolve(this.#s.fix); }, ms);
      const off = this.subscribe(() => {
        const s = this.#s;
        if ((s.fix && s.fix.src !== "cache") || s.status === "denied") { clearTimeout(t); off(); resolve(s.fix); }
      });
    });
  }
}

export const location = new LocationEngine();

/** header ke liye chhota text: "Shakti Nagar, Bareilly · 243006" */
export function placeLabel(place) {
  if (!place) return "";
  const parts = [place.area, place.city].filter(Boolean);
  const uniq = parts.filter((p, i) => parts.findIndex((q) => q.toLowerCase() === p.toLowerCase()) === i);
  return uniq.join(", ") + (place.pin ? " · " + place.pin : "");
}
