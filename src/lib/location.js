import C from "../../shared/config.js";
import { zoneFor, haversine } from "../../shared/format.js";
import { postJSON, getJSON } from "./api.js";
import { safeJSON, safeSet } from "./utils.js";

/*  LOCATION ENGINE
    Kaam: user kahin se bhi site khole, uski location + area + pincode nikal ke header mein dikhana.
    Tareeka (3 darje):
      1) GPS (jaldi wala, network se)  ->  2 se 7 second mein pehla andaaza, header turant bhar jata hai
      2) GPS (high accuracy)           ->  piche chalta rehta hai, aur sahi hone par location sudhar deta hai
      3) IP (internet) se shehar       ->  GPS na mile ya allow na ho tab bhi shehar ka naam dikhta hai ("approx")
    Sab kuch background mein hota hai, user ko kuch dabana nahi padta (permission milne ke baad).        */

const KEY = "fr-loc-v3";
const GEO = { goodAccuracyM: 25, maxWaitMs: 15000, ipFallback: true, refreshMinutes: 10, ...(C.geo || {}) };
const AREA = C.area || {};
const zonesOn = AREA.enabled !== false && (AREA.zones || []).length > 0;
const FRESH_MS = 30 * 60_000;

const ERR_TEXT = {
  1: "Location ki permission band hai",
  2: "Phone ki Location (GPS) service band hai ya signal nahi hai",
  3: "GPS ne jawab dene mein bahut der lagayi",
  0: "Is browser mein location available nahi hai"
};

const initial = { status: "idle", fix: null, place: null, ip: null, zone: null, perm: "unknown", error: null, updatedAt: 0, refining: false };

class LocationEngine {
  #s = { ...initial };
  #subs = new Set();
  #run = 0;                // naya locate() chalte hi purane ko ruk jana chahiye
  #watch = null;
  #stopTimer = 0;
  #geoAbort = null;
  #geoFrom = null;         // jahan ka address nikala tha
  #inited = false;

  subscribe = (fn) => { this.#subs.add(fn); return () => this.#subs.delete(fn); };
  getSnapshot = () => this.#s;

  #emit(patch) { this.#s = { ...this.#s, ...patch }; this.#subs.forEach((f) => f()); }

  /** page khulte hi ek baar */
  async init() {
    if (this.#inited) return; this.#inited = true;
    const saved = safeJSON(KEY, null);
    if (saved?.fix && Date.now() - saved.t < FRESH_MS) {
      this.#emit({ status: "ready", fix: saved.fix, place: saved.place || null, zone: this.#zone(saved.fix), updatedAt: saved.t });
    }
    let perm = "unknown";
    try {
      const p = await navigator.permissions?.query({ name: "geolocation" });
      if (p) {
        perm = p.state;
        p.addEventListener("change", () => {
          this.#emit({ perm: p.state });
          if (p.state === "granted") this.locate();
          if (p.state === "denied") this.#denied(1);
        });
      }
    } catch { /* kuch browsers (iOS) mein nahi hota */ }
    this.#emit({ perm });

    if (perm === "denied") this.#denied(1);
    else if (perm === "granted") this.locate();
    else if (!this.#s.fix) this.#ipFallback();      // permission abhi nahi di: tab bhi shehar dikha do

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && this.#s.perm === "granted" &&
          Date.now() - this.#s.updatedAt > GEO.refreshMinutes * 60_000) this.locate();
    });
    addEventListener("online", () => { if (!this.#s.place && this.#s.fix) this.#reverse(this.#s.fix); });
  }

  #zone(fix) { return zonesOn ? zoneFor(C, fix.lat, fix.lng, fix.acc) : null; }

  #getPos(opts) {
    return new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, opts));
  }

  /** Location lo. Pehle jaldi wali, phir sahi wali. Return: aakhri state. */
  async locate({ force = false } = {}) {
    const run = ++this.#run;
    this.#stopWatch();
    if (!("geolocation" in navigator)) { this.#emit({ error: { code: 0, text: ERR_TEXT[0] }, status: this.#s.fix ? "ready" : "error" }); this.#ipFallback(); return this.#s; }
    this.#emit({ status: this.#s.fix ? "ready" : "locating", refining: true, error: null });
    if (!this.#s.fix) this.#ipFallback();                  // GPS ke intezaar mein bhi shehar turant dikha do

    // 1) jaldi wala
    try {
      const pos = await this.#getPos({ enableHighAccuracy: false, timeout: 7000, maximumAge: force ? 0 : 120_000 });
      if (run !== this.#run) return this.#s;
      this.#apply(pos.coords, "net");
    } catch (e) {
      if (run !== this.#run) return this.#s;
      if (e?.code === 1) { this.#denied(1); return this.#s; }
    }

    // 2) sahi wala (background mein sudharta rehta hai)
    await this.#refine(run);
    if (run !== this.#run) return this.#s;
    this.#emit({ refining: false });

    if (!this.#s.fix) {                                    // dono fail
      this.#emit({ status: "error", error: { code: 2, text: ERR_TEXT[2] } });
      this.#ipFallback();
    }
    return this.#s;
  }

  #refine(run) {
    return new Promise((resolve) => {
      let best = this.#s.fix?.acc ?? Infinity, done = false;
      const finish = () => { if (done) return; done = true; this.#stopWatch(); resolve(); };
      this.#watch = navigator.geolocation.watchPosition(
        (pos) => {
          if (run !== this.#run) return finish();
          const acc = pos.coords.accuracy;
          if (acc < best * 0.85 || !this.#s.fix) { best = acc; this.#apply(pos.coords, "gps"); }
          if (acc <= GEO.goodAccuracyM) finish();
        },
        (err) => {
          if (run !== this.#run) return finish();
          if (err.code === 1) { this.#denied(1); finish(); }
          else if (!this.#s.fix) {
            this.#emit({ error: { code: err.code, text: ERR_TEXT[err.code] || ERR_TEXT[2] } });
            if (err.code === 2) finish();                  // GPS hai hi nahi: 15 second mat ruko
          }
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: GEO.maxWaitMs }
      );
      this.#stopTimer = setTimeout(finish, GEO.maxWaitMs);
    });
  }

  #stopWatch() {
    if (this.#watch != null) navigator.geolocation.clearWatch(this.#watch);
    this.#watch = null; clearTimeout(this.#stopTimer);
  }

  #apply(c, src) {
    const fix = { lat: c.latitude, lng: c.longitude, acc: c.accuracy ?? null, src, t: Date.now() };
    this.#emit({ status: "ready", fix, zone: this.#zone(fix), error: null, updatedAt: fix.t });
    this.#persist();
    if (!this.#geoFrom || haversine(this.#geoFrom, fix) * 1000 > 60 || !this.#s.place) this.#reverse(fix);
  }

  #persist() { safeSet(KEY, { fix: this.#s.fix, place: this.#s.place, t: this.#s.updatedAt }); }

  /** lat/lng -> area, shehar, pincode (server ke through) */
  async #reverse(fix) {
    this.#geoAbort?.abort();
    const ctrl = (this.#geoAbort = new AbortController());
    this.#geoFrom = { lat: fix.lat, lng: fix.lng };
    let r = await postJSON("/api/geocode", { lat: fix.lat, lng: fix.lng }, { signal: ctrl.signal, timeout: 8000 });
    if (r.aborted) return;
    if (!r.ok || !r.data?.place) {                         // ek baar dobara
      await new Promise((ok) => setTimeout(ok, 1500));
      if (ctrl.signal.aborted) return;
      r = await postJSON("/api/geocode", { lat: fix.lat, lng: fix.lng }, { signal: ctrl.signal, timeout: 8000 });
      if (r.aborted) return;
    }
    if (r.data?.place) { this.#emit({ place: r.data.place }); this.#persist(); }
    else this.#geoFrom = null;
  }

  async #ipFallback() {
    if (!GEO.ipFallback || this.#s.ip) return;
    const r = await getJSON("/api/geocode", { timeout: 6000 });
    if (r.data?.ip) this.#emit({ ip: r.data.ip });
  }

  #denied(code) {
    this.#run++; this.#stopWatch();
    this.#emit({ status: "denied", refining: false, error: { code, text: ERR_TEXT[code] } });
    this.#ipFallback();
  }

  /** order bhejte waqt: sahi location aane tak (zyada se zyada ms) ruko */
  async waitForFix(ms = 9000) {
    if (this.#s.fix) return this.#s.fix;
    if (!this.#s.refining) this.locate();
    return new Promise((resolve) => {
      const t = setTimeout(() => { off(); resolve(this.#s.fix); }, ms);
      const off = this.subscribe(() => { if (this.#s.fix || this.#s.status === "denied") { clearTimeout(t); off(); resolve(this.#s.fix); } });
    });
  }
}

export const location = new LocationEngine();

/** header mein dikhane ke liye chhota text: "Shakti Nagar, Bareilly · 243006" */
export function placeLabel(place) {
  if (!place) return "";
  const parts = [place.area, place.city].filter(Boolean);
  const uniq = parts.filter((p, i) => parts.findIndex((q) => q.toLowerCase() === p.toLowerCase()) === i);
  return uniq.join(", ") + (place.pin ? " · " + place.pin : "");
}
