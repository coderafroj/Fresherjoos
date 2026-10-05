import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { location } from "./location.js";
import { prefersReducedMotion } from "./utils.js";

/** Location engine ki taaza state (React 18/19 ke useSyncExternalStore se) */
export const useLocation = () => useSyncExternalStore(location.subscribe, location.getSnapshot, location.getSnapshot);

/** setInterval jo hamesha taaza callback chalata hai; delay null ho to ruk jata hai */
export function useInterval(cb, delay) {
  const saved = useRef(cb);
  useEffect(() => { saved.current = cb; });
  useEffect(() => {
    if (delay == null) return;
    const id = setInterval(() => saved.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

/** element screen ke andar (ya paas) hai ya nahi */
export function useInView(ref, { rootMargin = "0px", threshold = 0, once = false } = {}) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) { setInView(true); return; }
    const io = new IntersectionObserver(([e]) => {
      setInView(e.isIntersecting);
      if (e.isIntersecting && once) io.disconnect();
    }, { rootMargin, threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, threshold, once]);
  return inView;
}

export const useReducedMotion = () => useSyncExternalStore(
  (cb) => { const m = matchMedia("(prefers-reduced-motion: reduce)"); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); },
  prefersReducedMotion, () => false
);

export const useMedia = (q) => useSyncExternalStore(
  (cb) => { const m = matchMedia(q); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); },
  () => matchMedia(q).matches, () => false
);

export const usePageVisible = () => useSyncExternalStore(
  (cb) => { document.addEventListener("visibilitychange", cb); return () => document.removeEventListener("visibilitychange", cb); },
  () => document.visibilityState === "visible", () => true
);

/** "kitne second bache" ki ginti (20:00 se ulti) */
export function useCountdown(totalSec, running) {
  const [end] = useState(() => Date.now() + totalSec * 1000);
  const [left, setLeft] = useState(totalSec);
  useInterval(() => setLeft(Math.max(0, Math.round((end - Date.now()) / 1000))), running ? 1000 : null);
  return left;
}

/** Mouse ke saath glass thoda ghoomta hai (sirf mouse wale device par) */
export function useTilt(zoneRef, targetRef) {
  useEffect(() => {
    const zone = zoneRef.current, host = targetRef.current;
    if (!zone || !host || prefersReducedMotion() || !matchMedia("(pointer:fine)").matches) return;
    let raf = 0, nx = 0, ny = 0;
    const apply = () => {
      raf = 0;
      const svg = host.firstElementChild;
      if (!svg) return;
      svg.style.setProperty("--ry", (nx * 16).toFixed(2));
      svg.style.setProperty("--rx", (-ny * 8).toFixed(2));
    };
    const move = (e) => {
      const r = host.getBoundingClientRect();
      nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (innerWidth / 2)));
      ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (innerHeight / 2)));
      raf ||= requestAnimationFrame(apply);
    };
    const leave = () => { nx = ny = 0; raf ||= requestAnimationFrame(apply); };
    zone.addEventListener("pointermove", move, { passive: true });
    zone.addEventListener("pointerleave", leave);
    return () => { zone.removeEventListener("pointermove", move); zone.removeEventListener("pointerleave", leave); cancelAnimationFrame(raf); };
  }, [zoneRef, targetRef]);
}

/** App install karne ka prompt (Android/Chrome) */
export function useInstallPrompt() {
  const [evt, setEvt] = useState(null);
  useEffect(() => {
    const on = (e) => { e.preventDefault(); setEvt(e); };
    const done = () => setEvt(null);
    addEventListener("beforeinstallprompt", on);
    addEventListener("appinstalled", done);
    return () => { removeEventListener("beforeinstallprompt", on); removeEventListener("appinstalled", done); };
  }, []);
  const install = useCallback(async () => { if (!evt) return; evt.prompt(); try { await evt.userChoice; } finally { setEvt(null); } }, [evt]);
  return evt ? install : null;
}

/** kaun sa section abhi screen ke beech mein hai (dock ko highlight karne ke liye) */
export function useActiveSection(ids) {
  const [active, setActive] = useState("");
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((en) => en.forEach((x) => x.isIntersecting && setActive(x.target.id)), { rootMargin: "-45% 0px -50% 0px" });
    ids.map((id) => document.getElementById(id)).filter(Boolean).forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  return active;
}

/** id wale element ke screen mein hone ki khabar */
export function useInViewId(id, opts) {
  const ref = useRef(null);
  const [el, setEl] = useState(false);
  useEffect(() => { ref.current = document.getElementById(id); setEl(true); }, [id]);
  const v = useInView(ref, opts);
  return el ? v : true;
}
