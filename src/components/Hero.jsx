import { useEffect, useRef, useState } from "react";
import C from "../../shared/config.js";
import { isOpen } from "../../shared/format.js";
import { Glass } from "./Glass.jsx";
import { LocPill } from "./LocPill.jsx";
import { PhoneIcon } from "./Icons.jsx";
import { useInterval, useInView, useInstallPrompt, usePageVisible, useReducedMotion } from "../lib/hooks.js";
import { minPrice } from "../lib/cart.js";
import { pickJuice } from "../lib/ui.js";
import { shareSite } from "../lib/share.js";
import { cx, onColor, rupee, scrollToId } from "../lib/utils.js";

export const AVAIL = (() => { const a = C.juices.filter((j) => j.available !== false); return a.length ? a : C.juices; })();
const phoneShow = C.contact.phone.replace(/^(\d{5})(\d+)$/, "$1 $2");

function OpenChip() {
  const [open, setOpen] = useState(() => isOpen(C));
  useInterval(() => setOpen(isOpen(C)), 60_000);
  if (!C.hours) return null;
  return (
    <span className={cx("pill", open && "ok")}>
      <i />{open ? `Abhi khule hain · ${C.hours.close} tak` : `Abhi band · ${C.hours.open} se khulenge`}
    </span>
  );
}

export default function Hero() {
  const heroRef = useRef(null);
  const [i, setI] = useState(0);
  const [sip, setSip] = useState(0);
  const [hover, setHover] = useState(false);
  const [go, setGo] = useState(false);
  const inView = useInView(heroRef, { rootMargin: "80px" });
  const visible = usePageVisible();
  const reduce = useReducedMotion();
  const install = useInstallPrompt();
  const j = AVAIL[i];
  const ink = onColor(j.color);

  useEffect(() => {                                   // fonts aane ke baad glass bharna
    const t = setTimeout(() => setGo(true), 150);
    return () => clearTimeout(t);
  }, []);
  useInterval(() => { setI((x) => (x + 1) % AVAIL.length); setSip((n) => n + 1); },
    !reduce && AVAIL.length > 1 && inView && visible && !hover ? 5200 : null);

  return (
    <header ref={heroRef} className={cx("hero", !inView && "off")} id="top" style={{ "--hbg": j.color, "--hfg": ink }}>
      <div className="hero-top">
        <a className="word" href="#top">
          {C.brand.logo && <img src={C.brand.logo} alt="" width="44" height="44" fetchPriority="high" />}
          <span>{C.brand.name}</span>
        </a>
        <LocPill />
        <div className="topR">
          {install && <button className="pill" type="button" onClick={install}>Install</button>}
          <a className="pill callpill" href={`tel:+91${C.contact.phone}`} aria-label={`Call ${phoneShow}`}><PhoneIcon /><span className="num">{phoneShow}</span></a>
        </div>
      </div>

      <div className="hero-main">
        <p className="hook">{C.brand.hook}</p>
        <h1 className="disp"><span>Fresh</span><span>in 20.</span></h1>
        <div className="hero-copy">
          <p>{C.brand.intro}</p>
          <div className="chips"><OpenChip /></div>
          <div className="hero-cta">
            <a className="btn solid" href="#menu">Juice order karo</a>
            <button className="btn" type="button" onClick={shareSite}>Dosto ko bhejo</button>
          </div>
        </div>

        <div className="glass-wrap" onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}>
          <svg className="splash" viewBox="0 0 400 300" aria-hidden="true">
            <path d="M40 292 C18 214 30 150 62 118 C74 150 92 156 108 146 C100 92 122 44 154 34 C168 72 190 84 206 72 C210 34 238 12 262 26 C268 72 290 92 312 84 C344 104 366 152 354 206 C350 244 342 272 332 292 Z" />
            <circle className="d" cx="22" cy="120" r="9" /><circle className="d" cx="374" cy="70" r="11" /><circle className="d" cx="332" cy="16" r="6" />
            <circle className="d" cx="84" cy="26" r="7" /><circle className="d" cx="392" cy="160" r="6" /><circle className="d" cx="8" cy="190" r="5" />
          </svg>
          <Glass color={j.color} ink={ink} active={go} sipKey={sip} zoneRef={heroRef} />
          <div className="fslice fs1"><svg><use href="#slice" /></svg></div>
          <div className="fslice fs2"><svg><use href="#slice" /></svg></div>
          <div className="fslice fs3"><svg><use href="#slice" /></svg></div>
          <svg className="badge" viewBox="0 0 200 200" aria-hidden="true">
            <circle cx="100" cy="100" r="98" fill="#C8F03C" />
            <path id="circ" d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0" fill="none" />
            <text><textPath href="#circ">100% fresh fruit • sealed glass •</textPath></text>
            <text className="big" x="100" y="118" textAnchor="middle">{C.delivery.minutes}</text>
            <text className="small" x="100" y="140" textAnchor="middle">minute</text>
          </svg>
        </div>

        <div className="pick">
          <button className="nm" type="button" onClick={() => { pickJuice(j.id); scrollToId("menu"); }}>
            {j.name}<small>se {rupee(minPrice(j))}</small>
          </button>
          <div className="dots" role="group" aria-label="Juice chuno">
            {AVAIL.map((x, k) => (
              <button key={x.id} type="button" aria-label={x.name} aria-pressed={k === i} onClick={() => { setI(k); setSip((n) => n + 1); }} />
            ))}
          </div>
        </div>
      </div>
      <svg className="wave" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0 70 C180 10 360 120 600 70 C840 20 1020 120 1240 60 C1330 36 1390 44 1440 62 V120 H0Z" /></svg>
    </header>
  );
}
