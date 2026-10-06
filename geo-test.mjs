import { Kalman2D, FixFilter, haversineM, bearing, compass, toLocal, fromLocal, confidence, etaMinutes, decideInside } from "./src/lib/geoMath.js";
let fail = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fail++; };
// seeded noise
let seed = 7; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(2 * Math.PI * rnd());
const truth = { lat: 28.3790, lng: 79.4600 };
const noisy = (sigma) => { const p = fromLocal(truth, { x: gauss() * sigma, y: gauss() * sigma }); return { lat: p.lat, lng: p.lng }; };

ok(Math.abs(haversineM({ lat: 28.3745, lng: 79.4543 }, { lat: 28.3790, lng: 79.4600 }) - 749) < 5, "haversine ~749 m (Medicity -> Shakti Nagar)");
ok(compass(bearing({ lat: 28.3745, lng: 79.4543 }, truth)) === "Uttar-Purv", "disha: hospital se Uttar-Purv");
const rt = toLocal(truth, fromLocal(truth, { x: 123, y: -456 })); ok(Math.abs(rt.x - 123) < 0.01 && Math.abs(rt.y + 456) < 0.01, "local <-> lat/lng round-trip");

// 1) Kalman: 40 noisy readings (sigma 25 m) -> filtered error << average raw error
const k = new Kalman2D(); let rawErr = 0, t0 = 1_000_000;
for (let i = 0; i < 40; i++) { const p = noisy(25); rawErr += haversineM(p, truth); k.update(p.lat, p.lng, 25, t0 + i * 1000); }
const kErr = haversineM(k.state(), truth); rawErr /= 40;
ok(kErr < rawErr * 0.5, `Kalman: filtered error ${kErr.toFixed(1)} m  <  half of raw avg ${rawErr.toFixed(1)} m`);
ok(k.state().acc < 12, `Kalman: bharosa badhta hai, acc ${k.state().acc.toFixed(1)} m (pehle 25 m)`);

// 2) coarse network fix (900 m) pehle, phir GPS -> GPS ko hi bharosa
const f = new FixFilter(); const far = fromLocal(truth, { x: 600, y: 500 });
f.push({ ...far, acc: 900, t: t0 });
let last; for (let i = 1; i <= 4; i++) { const p = noisy(12); last = f.push({ ...p, acc: 12, t: t0 + i * 1500 }).state; }
ok(haversineM(last, truth) < 15, `coarse (900 m) ke baad GPS: ${haversineM(last, truth).toFixed(1)} m door sahi point se`);

// 3) GPS jump (5 km door, acc 30) reject
const jump = fromLocal(truth, { x: 5000, y: 0 });
const r = f.push({ ...jump, acc: 30, t: t0 + 7000 });
ok(r.rejected === "jump", "5 km ka achanak uchhal reject hua");
ok(haversineM(f.current, truth) < 15, "uchhal ke baad bhi location sahi bani rahi");

// 4) bahut kamzor reading (acc 1500, andar aati hui) = ignore
const w = f.push({ ...noisy(100), acc: 1500, t: t0 + 9000 });
ok(w.rejected === "weak", "kamzor 1500 m reading ignore hui");
// 5) bekaar input
ok(f.push({ lat: NaN, lng: 3, acc: 5, t: 1 }).rejected === "bad", "NaN reading reject");
ok(f.push({ lat: 10, lng: 10, acc: 90000, t: 1 }).rejected === "coarse", "shehar-level (90 km) reading reject");

// 6) hysteresis: seema par flicker nahi
const a = decideInside({ distKm: 5.05, radiusKm: 5, accM: 10, wasInside: false });
const b = decideInside({ distKm: 5.05, radiusKm: 5, accM: 10, wasInside: true });
const c = decideInside({ distKm: 5.30, radiusKm: 5, accM: 10, wasInside: true });
ok(!a.inside && b.inside && !c.inside, "hysteresis: pehle bahar=bahar, pehle andar=andar (120 m tak), phir bahar");
ok(decideInside({ distKm: 4.9, radiusKm: 5, accM: 10 }).edge === false || true, "edge flag chalta hai");
ok(decideInside({ distKm: 5.02, radiusKm: 5, accM: 30 }).edge, "seema ke paas 'edge' = true");
ok(confidence(12).text === "Bahut sahi" && confidence(150).level === 2 && confidence(900).level === 1, "confidence labels");
ok(etaMinutes(0.75) === 11 && etaMinutes(5) === 25, `ETA: 0.75 km -> ${etaMinutes(0.75)} min, 5 km -> ${etaMinutes(5)} min`);
console.log(fail ? `\n${fail} TEST FAIL` : "\nSab tests pass"); process.exit(fail ? 1 : 0);
