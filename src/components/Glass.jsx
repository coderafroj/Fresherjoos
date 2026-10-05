import { memo, useEffect, useMemo, useRef } from "react";
import { glassSVG } from "../lib/glass.js";
import { useTilt } from "../lib/hooks.js";
import { prefersReducedMotion } from "../lib/utils.js";

const setFill = (svg, px, instant) => {
  const j = svg?.querySelector(".juice");
  if (!j) return;
  if (instant || prefersReducedMotion()) j.style.transition = "none";
  j.style.setProperty("--fill", px + "px");
  if (instant) { void j.getBoundingClientRect(); j.style.transition = ""; }
};

/** Juice ka glass. color/ink badalte hi rang badalta hai, sipKey badalte hi hilta hai, active=true hote hi bharta hai. */
export const Glass = memo(function Glass({ color, ink, active = true, sipKey = 0, zoneRef, className }) {
  const host = useRef(null);
  const markup = useMemo(() => ({ __html: glassSVG() }), []);
  const svg = () => host.current?.firstElementChild;
  useTilt(zoneRef ?? host, host);

  useEffect(() => { const s = svg(); s?.style.setProperty("--j", color); s?.style.setProperty("--gink", ink); }, [color, ink]);

  useEffect(() => { setFill(svg(), 330, true); }, []);   // shuru mein khaali glass

  useEffect(() => {                                    // pehli baar glass bharna
    if (!active) return;
    const s = svg(); setFill(s, 330, true);
    let r2; const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => setFill(s, 0)); });
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
  }, [active]);

  useEffect(() => {                                    // juice badalne par hilna
    if (!sipKey || prefersReducedMotion()) return;
    const s = svg(); if (!s) return;
    setFill(s, 46, true);
    let r2; const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => setFill(s, 0)); });
    s.classList.remove("slosh"); void s.getBoundingClientRect(); s.classList.add("slosh");
    const t = setTimeout(() => s.classList.remove("slosh"), 1600);
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); clearTimeout(t); };
  }, [sipKey]);

  return <div ref={host} className={className} style={{ width: "100%", height: "100%" }} dangerouslySetInnerHTML={markup} />;
});
