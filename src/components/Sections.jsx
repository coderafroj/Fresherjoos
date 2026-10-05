import { memo, useRef } from "react";
import C from "../../shared/config.js";
import { Slice } from "./Icons.jsx";
import { useInView, useLocation } from "../lib/hooks.js";
import { location, placeLabel } from "../lib/location.js";
import { areaName, areaOn, areaState, mainZone, outMessage, zones } from "../lib/area.js";
import { juiceById } from "../lib/cart.js";
import { openSheet, pickJuice, toast } from "../lib/ui.js";
import { cart } from "../lib/cart.js";
import { cx, km, rupee, scrollToId } from "../lib/utils.js";
import { useStore } from "../lib/store.js";

const phoneShow = C.contact.phone.replace(/^(\d{5})(\d+)$/, "$1 $2");

/* ---------- patti ---------- */
export function Marquee() {
  const ref = useRef(null);
  const inView = useInView(ref, { rootMargin: "80px" });
  const items = [...C.marquee, ...C.marquee];
  return (
    <div ref={ref} className={cx("marquee", !inView && "off")} aria-hidden="true">
      <div className="marquee-track">{items.map((t, k) => <span key={k}>{t}<Slice /></span>)}</div>
    </div>
  );
}

/* ---------- 20 minute ka safar ---------- */
export function Race() {
  const ref = useRef(null);
  const go = useInView(ref, { threshold: 0.35, once: true });
  return (
    <section ref={ref} className={cx("race", go && "go")} id="race" aria-labelledby="raceH">
      <h2 className="disp" id="raceH">{C.delivery.minutes} minute. Ginti shuru.</h2>
      <p className="lead">Order se lekar aapke darwaze tak ka poora safar.</p>
      <ol className="track" style={{ "--n": C.steps.length }}>
        <li className="bar" aria-hidden="true" />
        {C.steps.map((s, i) => (
          <li className="step" key={s.title} style={{ "--i": i }}>
            <div className="m">{s.min}<small>min</small></div><h3>{s.title}</h3><p>{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------- Hospital / Gym ---------- */
const Place = memo(function Place({ k }) {
  const P = C.places[k];
  const js = C.juices.filter((j) => j.available !== false && (j.for || []).includes(k));
  return (
    <article className={"place " + k}>
      <h2 className="disp">{P.title}</h2>
      <p>{P.text}</p>
      {js.length > 0 && (
        <div className="pchips">
          {js.map((j) => (
            <button key={j.id} type="button" className="chip" style={{ "--c": j.color }} onClick={() => { pickJuice(j.id); scrollToId("menu"); }}><i />{j.name}</button>
          ))}
        </div>
      )}
      {(P.plans || []).map((p) => (
        <div className="plan" key={p.name}>
          <div><h3>{p.name}</h3><span>{p.detail}</span></div>
          <div><div className="price">{rupee(p.price)}</div><a href={`tel:+91${C.contact.phone}`}>Plan ke liye call karo</a></div>
        </div>
      ))}
      {P.note && <p className="note">{P.note}</p>}
    </article>
  );
});
export const Places = () => (<section className="places" id="places"><Place k="hospital" /><Place k="gym" /></section>);

/* ---------- Delivery area + naksha ---------- */
function Radar({ L }) {
  const z = L.zone?.zone || mainZone;
  if (!z) return null;
  const R = 170, k = R / z.radiusKm;
  let you = null;
  if (L.fix) {
    const lat0 = (z.lat * Math.PI) / 180;
    let px = (L.fix.lng - z.lng) * Math.cos(lat0) * 111.32 * k, py = -(L.fix.lat - z.lat) * 110.57 * k;
    const d = Math.hypot(px, py), cap = R * 1.22;
    if (d > cap) { px *= cap / d; py *= cap / d; }
    const inside = L.zone?.inside, col = inside ? "#17703d" : "#B3123A", ar = Math.max(9, Math.min(60, ((L.fix.acc || 0) / 1000) * k));
    you = (
      <g className="you" style={{ transform: `translate(${px.toFixed(1)}px,${py.toFixed(1)}px)` }}>
        <circle r={ar} fill={col} fillOpacity=".18" /><circle r="9" fill={col} stroke="#fff" strokeWidth="3" /><text y="-17" textAnchor="middle">Aap</text>
      </g>
    );
  }
  const name = z.name.length > 26 ? z.name.slice(0, 24) + "…" : z.name;
  return (
    <svg viewBox="-215 -215 430 430" aria-hidden="true">
      <circle className="zone" r={R} /><circle className="ring" r={R / 2} /><circle className="pulse" r={R} />
      <text x="0" y={-R - 8} textAnchor="middle">{z.radiusKm} km</text><text x="0" y={-R / 2 - 6} textAnchor="middle">{+(z.radiusKm / 2).toFixed(1)} km</text>
      <circle r="17" fill="#0E3B2A" /><path d="M-8 0H8M0 -8V8" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      <text y="36" textAnchor="middle">{name}</text>{you}
    </svg>
  );
}

function AreaCard({ L }) {
  const st = areaState(L), z = L.zone?.zone || mainZone, line = placeLabel(L.place);
  const items = useStore(cart, (s) => s.items);
  const act = (e) => { e.preventDefault(); location.locate({ force: true }); };
  if (L.fix) {
    const low = L.fix.acc > 150 ? <p className="muted">GPS thoda kam sahi hai (±{Math.round(L.fix.acc)} m). Pata zaroor likhna.</p> : null;
    return (
      <div className="acard">
        <b className="big">{st === "out" ? `Aap abhi area ke bahar ho (${km(L.zone.dist)}).` : L.zone?.zone ? `Haan! Aap ${km(L.zone.dist)} door ho.` : "Location mil gayi."}</b>
        {line && <p className="here"><b>Aapka area:</b> {line}</p>}
        <p>{st === "out" ? outMessage(L) + " Aur jagah jaldi jodenge." : L.zone?.zone ? `Delivery available hai. Aap ${L.zone.zone.name} ke ${L.zone.zone.radiusKm} km ke andar ho.` : ""}{L.fix.acc ? ` Sahi hone ka andaaza ±${Math.round(L.fix.acc)} m.` : ""}</p>
        {low}
        <div className="row">
          {st === "out" ? <a className="btn solid" href={`tel:+91${C.contact.phone}`}>Call karke poochho</a> : <button className="btn solid" type="button" onClick={() => (items.length ? openSheet() : scrollToId("menu"))}>Juice order karo</button>}
          <button className="btn" type="button" onClick={act}>Dobara check karo</button>
        </div>
      </div>
    );
  }
  if (L.status === "locating") return <div className="acard"><b className="big">Location dhoondh rahe hain…</b><p>GPS ko 5 se 10 second lag sakte hain. Khule mein jaldi milti hai.</p></div>;
  if (L.status === "denied") return (
    <div className="acard"><b className="big">Location band hai.</b>
      <p>{L.ip?.city ? `Internet se lagta hai aap ${L.ip.city} mein ho. ` : ""}Sahi area aur pincode ke liye phone/browser settings mein is site ka <b>Location → Allow</b> kar do.</p>
      <div className="row"><button className="btn solid" type="button" onClick={act}>Dobara try karo</button></div></div>
  );
  return (
    <div className="acard"><b className="big">{L.status === "error" ? "Location nahi mili." : "Kya aap hamare area mein ho?"}</b>
      <p>{L.status === "error" ? (L.error?.text || "") + ". Bahar khule mein ya GPS on karke dobara try karo." : "Ek tap mein aapka area, pincode aur doori pata chal jayegi. Location sirf aapke order ke liye use hoti hai."}</p>
      <div className="row"><button className="btn solid" type="button" onClick={act}>Meri location check karo</button></div></div>
  );
}

export function Area() {
  const L = useLocation();
  const title = !areaOn ? "Hum aapke paas aate hain." : zones.length === 1 ? `Hum ${mainZone.name} se ${mainZone.radiusKm} km tak.` : `Hum ${C.area.city || "shehar"} mein ${zones.length} jagah se.`;
  return (
    <section className="area" id="area" aria-labelledby="areaH">
      <div>
        <h2 className="disp" id="areaH">{title}</h2>
        <p className="lead">Location bhejo, site turant aapka area, pincode aur doori bata degi.</p>
        <AreaCard L={L} />
      </div>
      <div className="radar" role="img" aria-label="Delivery area ka naksha"><Radar L={L} /></div>
    </section>
  );
}

/* ---------- safai ---------- */
export const Hygiene = () => (
  <section className="hygiene" id="hygiene" aria-labelledby="hyH">
    <h2 className="disp" id="hyH">Saaf fruit. Saaf hath. Band seal.</h2>
    <ul className="hy">
      {C.hygiene.map((h) => (
        <li key={h.title}>
          <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="23" fill="#0E3B2A" /><path d="M13 25l7 7 15-16" fill="none" stroke="#C8F03C" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <div><h3>{h.title}</h3><p>{h.text}</p></div>
        </li>
      ))}
    </ul>
  </section>
);

/* ---------- sawal-jawab ---------- */
export const Faq = () => (
  <section className="faq" id="faq" aria-labelledby="faqH">
    <h2 className="disp" id="faqH">Kuch poochna hai?</h2>
    <div>
      {(C.faq || []).map((f) => (
        <details key={f.q}>
          <summary>{f.q}</summary>
          <p>{f.a.replaceAll("{area}", areaName).replaceAll("{radius}", mainZone?.radiusKm ?? "").replaceAll("{minutes}", C.delivery.minutes)}</p>
        </details>
      ))}
    </div>
  </section>
);

/* ---------- aakhri order wala hissa ---------- */
export function OrderCta() {
  const items = useStore(cart, (s) => s.items);
  return (
    <section className="order" id="order" aria-labelledby="orH">
      <h2 className="disp" id="orH">Order karo.</h2>
      <a className="tel" href={`tel:+91${C.contact.phone}`}>{phoneShow}</a>
      <div className="row">
        <button className="btn solid" type="button" onClick={() => (items.length ? openSheet() : (scrollToId("menu"), toast("Pehle juice chuno, phir order karo")))}>Juice order karo</button>
        <a className="btn" href={`tel:+91${C.contact.phone}`}>Seedha call karo</a>
      </div>
      <div className="mega" aria-hidden="true">{C.brand.name}</div>
      <p className="fine">© {new Date().getFullYear()} {C.brand.name}. Sealed glass mein taaza juice. · <a href={`https://wa.me/${C.contact.whatsapp}?text=${encodeURIComponent("Namaste " + C.brand.name + "! Mujhe ek sawal poochhna hai.")}`} target="_blank" rel="noopener noreferrer">Sawal hai? WhatsApp pe poochho</a> · Address data © OpenStreetMap contributors</p>
    </section>
  );
}
