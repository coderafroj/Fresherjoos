import { useEffect, useState } from "react";
import { useLocation, useInViewId } from "../lib/hooks.js";
import { location, placeLabel } from "../lib/location.js";
import { areaState } from "../lib/area.js";
import { km, cx, safeJSON } from "../lib/utils.js";
import { openLocSheet, ui } from "../lib/ui.js";
import { useStore } from "../lib/store.js";
import { PinIcon } from "./Icons.jsx";

/** location ki state -> pill mein kya likhna hai aur kaisa rang */
function view(L) {
  const st = areaState(L);
  if (L.fix) {
    const label = placeLabel(L.place);
    const dist = L.zone?.zone ? ` · ${km(L.zone.dist)}` : "";
    const text = label || (L.zone?.zone ? "Aapki location mil gayi" : "Aapki location mil gayi");
    return { cls: st === "out" ? "bad" : "ok", text, dist, live: L.refining, title: [L.place?.line, L.fix.acc ? `±${Math.round(L.fix.acc)} m` : ""].filter(Boolean).join(" · ") };
  }
  if (L.ip?.city) {
    const tail = L.status === "locating" ? " · sahi area dhoondh rahe…" : L.status === "denied" ? " · GPS allow karo" : "";
    return { cls: L.status === "locating" ? "live" : "", live: L.status === "locating", text: `${L.ip.city} (approx)${tail}`, title: "Internet se andaaza. Sahi area ke liye location allow karo." };
  }
  if (L.status === "locating") return { cls: "live", text: "Aapka area dhoondh rahe hain…", live: true };
  if (L.status === "denied") return { cls: "bad", text: "Location band · allow karo" };
  if (L.status === "error") return { cls: "", text: "Location nahi mili · dobara try" };
  return { cls: "", text: "Apna area dikhao" };
}

export function LocPill({ variant = "header" }) {
  const L = useLocation();
  const v = view(L);
  const onClick = () => { openLocSheet(); if (!L.fix && L.status !== "locating" && L.status !== "denied") location.locate({ force: true }); };
  return (
    <button type="button" className={cx("pill", "hdrLoc", v.cls, v.live && "live", variant === "float" && "mini")} onClick={onClick} title={v.title} aria-live="polite">
      <PinIcon /><span className="txt">{v.text}</span>{v.dist && <span className="dst">{v.dist}</span>}
    </button>
  );
}

/** hero se neeche scroll karne par bhi area upar dikhta rahe */
export function FloatLoc() {
  const heroVisible = useInViewId("top", { rootMargin: "-60px 0px 0px 0px" });
  const L = useLocation();
  const show = !heroVisible && (L.fix || L.ip);
  return show ? <div className="locFloat"><LocPill variant="float" /></div> : null;
}

/** app khulte hi location maangne wala halka card (kuch rokta nahi) */
export function LocBanner() {
  const L = useLocation();
  const off = useStore(ui, (s) => s.bannerOff);
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 1200); return () => clearTimeout(t); }, []);
  const skipped = safeJSON("fr-skip", false) || safeJSON("fr-skip-s", false);
  const need = L.perm !== "granted" && L.perm !== "denied" && !L.fix && L.status !== "locating" && L.status !== "denied";
  if (!ready || off || skipped || !need) return null;
  const allow = () => { ui.dispatch({ type: "bannerOff" }); location.locate({ force: true }); };
  const later = () => { ui.dispatch({ type: "bannerOff" }); try { sessionStorage.setItem("fr-skip-s", "true"); } catch { /* */ } };
  return (
    <aside className="locCard" role="dialog" aria-labelledby="locH">
      <h3 id="locH"><PinIcon />Aapki location chahiye</h3>
      <p>Isse aapka area aur pincode apne aap bhar jayega, aur hum dekh paayenge ki juice aap tak pahunch sakta hai. Location sirf order ke liye use hoti hai.</p>
      <div className="row"><button className="btn solid" type="button" onClick={allow}>Allow karo</button><button className="btn" type="button" onClick={later}>Baad mein</button></div>
    </aside>
  );
}
