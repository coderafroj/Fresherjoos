import { useEffect, useRef, useState } from "react";
import Radar from "./Radar.jsx";
import { PinIcon } from "./Icons.jsx";
import { useLocation } from "../lib/hooks.js";
import { location, placeLabel } from "../lib/location.js";
import { describe } from "../lib/locInfo.js";
import { areaOn } from "../lib/area.js";
import { cart } from "../lib/cart.js";
import { ui, closeLocSheet, openSheet, toast } from "../lib/ui.js";
import { useStore } from "../lib/store.js";
import { cx, scrollToId } from "../lib/utils.js";

const Tile = ({ k, v, sub, wide }) => (<div className={cx("tile", wide && "wide")}><span className="k">{k}</span><b className="v">{v}</b>{sub && <span className="s">{sub}</span>}</div>);

function Body({ L }) {
  const info = describe(L);
  const items = useStore(cart, (s) => s.items);
  const mapUrl = L.fix ? `https://www.google.com/maps?q=${L.fix.lat},${L.fix.lng}` : "";
  const full = [L.place?.line, L.place?.pin, L.place?.state].filter(Boolean).join(", ");
  const copy = async () => { try { await navigator.clipboard.writeText(full || `${L.fix.lat.toFixed(5)}, ${L.fix.lng.toFixed(5)}`); toast("Address copy ho gaya"); } catch { toast(full); } };
  const refresh = () => location.locate({ force: true });

  if (!L.fix) {
    return (
      <div className="lbody">
        <div className={cx("lbanner", L.status === "denied" && "bad")}>
          <b>{L.status === "locating" ? "Location dhoondh rahe hain…" : L.status === "denied" ? "Location band hai" : L.status === "error" ? "Location nahi mili" : "Location abhi nahi li"}</b>
          <span>{L.status === "denied" ? "Phone/browser settings mein is site ke liye Location → Allow karo, phir neeche dabao." : L.error?.text || "Ek tap mein aapka area, pincode aur doori pata chal jayegi."}</span>
        </div>
        {L.ip?.city && <Tile wide k="Internet se andaaza" v={`${L.ip.city}${L.ip.region ? ", " + L.ip.region : ""}`} sub="Sahi area ke liye GPS location allow karo" />}
        <div className="lrow"><button className="btn solid" type="button" onClick={refresh} disabled={L.status === "locating"}><PinIcon />Meri location lo</button><a className="btn" href={`tel:+91${C_PHONE}`}>Call karo</a></div>
      </div>
    );
  }
  return (
    <div className="lbody">
      <div className="lhead">
        <h3>{L.place?.area || L.place?.city || "Aapki location"}</h3>
        <p>{full || "Address dhoondh rahe hain…"}</p>
      </div>
      {areaOn && (
        <div className={cx("lbanner", info.inside ? "ok" : "bad")}>
          <b>{info.inside ? (info.edge ? "Delivery area ki seema par ho" : "Delivery available ✓") : "Abhi aap area ke bahar ho"}</b>
          <span>{info.hub ? `${info.hub.name} se ${info.distText}${info.dirText ? " · " + info.dirText : ""}${info.inside ? "" : `. Abhi sirf ${info.hub.radiusKm} km mein delivery hai.`}` : ""}{info.edge && info.inside ? " Thoda aur paas aao to pakka." : ""}</span>
        </div>
      )}
      <div className="tiles">
        <Tile k="Pincode" v={L.place?.pin || "—"} sub={L.place?.pin ? "" : "Order mein khud likh sakte ho"} />
        <Tile k="Shehar" v={L.place?.city || "—"} sub={L.place?.state} />
        {info.hub && <Tile k="Doori" v={info.distText} sub={info.dirText ? `${info.dirText} disha mein` : ""} />}
        {info.etaMin != null && info.inside && <Tile k="Juice pahunchega" v={`~${info.etaMin} min`} sub="Taiyari + raasta (andaaza)" />}
      </div>
      <div className="acc">
        <div className="accTop"><span>Sahi hone ka andaaza</span><b>{info.accText} · {info.conf.text}</b></div>
        <div className="bar"><i style={{ width: info.conf.pct + "%" }} className={"lv" + info.conf.level} /></div>
        <span className="s">Source: {info.srcText}{L.samples > 1 ? ` · ${L.samples} readings milakar` : ""}{L.refining ? " · aur sahi kar rahe hain…" : ""}</span>
      </div>
      <div className="radar small" aria-hidden="true"><Radar L={L} /></div>
      <div className="lrow">
        {info.inside && <button className="btn solid" type="button" onClick={() => { closeLocSheet(); items.length ? openSheet() : scrollToId("menu"); }}>{items.length ? "Order karo" : "Juice chuno"}</button>}
        <button className="btn" type="button" onClick={refresh}>{L.refining ? "Ho raha hai…" : "Dobara lo"}</button>
        <a className="btn" href={mapUrl} target="_blank" rel="noopener noreferrer">Map pe dekho</a>
        <button className="btn" type="button" onClick={copy}>Address copy</button>
      </div>
    </div>
  );
}
import C from "../../shared/config.js";
const C_PHONE = C.contact.phone;

export default function LocSheet() {
  const open = useStore(ui, (s) => s.locSheet);
  const L = useLocation();
  const ref = useRef(null);
  useEffect(() => { const d = ref.current; if (open && !d.open) d.showModal(); if (!open && d.open) d.close(); }, [open]);
  return (
    <dialog ref={ref} className="sheet lsheet" aria-labelledby="lsH" onClose={closeLocSheet} onClick={(e) => e.target === e.currentTarget && closeLocSheet()}>
      <div className="sheet-in">
        <div className="sheet-head"><h2 id="lsH">Aapki location</h2><button className="x" type="button" aria-label="Band karo" onClick={closeLocSheet}>×</button></div>
        <div className="sheet-body">{open && <Body L={L} />}</div>
      </div>
    </dialog>
  );
}

/** location milte hi ek baar sundar card: area, pincode, doori, time */
export function LocReveal() {
  const L = useLocation();
  const [show, setShow] = useState(false);
  const seen = useRef(false);
  const info = describe(L);
  useEffect(() => {
    if (seen.current || !L.fix || !L.place || L.fix.src === "cache") return;
    let done = false; try { done = sessionStorage.getItem("fr-reveal") === "1"; } catch { /* */ }
    seen.current = true; if (done) return;
    try { sessionStorage.setItem("fr-reveal", "1"); } catch { /* */ }
    setShow(true);
    const t = setTimeout(() => setShow(false), 9000);
    return () => clearTimeout(t);
  }, [L.fix, L.place]);
  if (!show || !info) return null;
  return (
    <aside className="reveal" role="status">
      <button className="rx" type="button" aria-label="Band karo" onClick={() => setShow(false)}>×</button>
      <span className="ok"><PinIcon /> Location mil gayi</span>
      <b>{placeLabel(L.place) || "Aapki location"}</b>
      <span className="rs">{info.hub ? `${info.distText} door` : ""}{info.etaMin != null && info.inside ? ` · ~${info.etaMin} min mein juice` : ""} · {info.accText}</span>
      <span className={cx("rbadge", info.inside ? "ok" : "bad")}>{areaOn ? (info.inside ? "Delivery available ✓" : "Area ke bahar") : "Location mil gayi"}</span>
      <button className="rlink" type="button" onClick={() => { setShow(false); ui.dispatch({ type: "locSheet", open: true }); }}>Poori detail dekho</button>
    </aside>
  );
}
