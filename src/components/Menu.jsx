import { memo, useEffect, useMemo, useRef, useState } from "react";
import C from "../../shared/config.js";
import { Glass } from "./Glass.jsx";
import { AVAIL } from "./Hero.jsx";
import { cart, juiceById, minPrice, sizesOf } from "../lib/cart.js";
import { ui, toast } from "../lib/ui.js";
import { useStore } from "../lib/store.js";
import { useInView } from "../lib/hooks.js";
import { onColor, rupee } from "../lib/utils.js";

const defaultSize = (j) => (sizesOf(j)[1] ?? sizesOf(j)[0])?.id;

const JuiceList = memo(function JuiceList({ cur, onSelect }) {
  return (
    <ul className="jlist">
      {C.juices.map((j) => {
        const out = j.available === false;
        return (
          <li key={j.id}>
            <button type="button" className={out ? "jrow out" : "jrow"} aria-pressed={j.id === cur} onClick={() => onSelect(j.id)}>
              <span><span className="n">{j.name}</span><span className="e">{j.english}</span></span>
              <span className="p">{out ? "Abhi khatam" : `se ${rupee(minPrice(j))}`}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
});

export default function Menu() {
  const sectionRef = useRef(null);
  const near = useInView(sectionRef, { rootMargin: "500px 0px", once: true });
  const inView = useInView(sectionRef, { rootMargin: "80px" });
  const [cur, setCur] = useState(AVAIL[0].id);
  const [size, setSize] = useState(() => defaultSize(AVAIL[0]));
  const [qty, setQty] = useState(1);
  const [sip, setSip] = useState(0);
  const picked = useStore(ui, (s) => s.picked);
  const pickN = useStore(ui, (s) => s.pickN);

  const j = juiceById(cur);
  const ink = onColor(j.color);
  const sizes = useMemo(() => sizesOf(j), [j]);
  const sz = sizes.some((s) => s.id === size) ? size : defaultSize(j);
  const out = j.available === false || !sizes.length;

  const select = (id) => { setCur(id); setQty(1); setSip((n) => n + 1); };
  useEffect(() => { if (picked) select(picked); }, [pickN]); // eslint-disable-line react-hooks/exhaustive-deps

  const add = () => {
    cart.dispatch({ type: "add", j: cur, s: sz, q: qty });
    toast(`${j.name} order mein jud gaya`);
    setQty(1);
  };

  return (
    <section ref={sectionRef} className={inView ? "menu" : "menu off"} id="menu" aria-labelledby="menuH" style={{ "--bg": j.color, "--fg": ink }}>
      <svg className="drip" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true"><path d={DRIP} /></svg>
      <h2 className="disp" id="menuH">Apna juice chuno.</h2>
      <p className="lead">Naam pe tap karo. Glass ka rang, daam aur size badal jayenge.</p>
      <div className="menu-grid">
        <JuiceList cur={cur} onSelect={select} />
        <div className="stage">
          <div className="glass-box">{near && <Glass color={j.color} ink={ink} active sipKey={sip} zoneRef={sectionRef} />}</div>
          <div className="detail">
            <h3>{j.name}{j.tag && <span className="tag">{j.tag}</span>}</h3>
            <p>{j.desc}{j.ingredients && <em> ({j.ingredients})</em>}</p>
            <div className="for">{(j.for || []).map((f) => <span key={f}>{f === "gym" ? "Gym ke liye" : "Hospital ke liye"}</span>)}</div>
            <fieldset className="sizes">
              <legend className="sr">Size chuno</legend>
              {sizes.map((s) => (
                <label className="size" key={s.id}>
                  <input type="radio" name="size" value={s.id} checked={s.id === sz} onChange={() => setSize(s.id)} />
                  <span><b>{s.ml} ml</b><i>{rupee(j.prices[s.id])}</i></span>
                </label>
              ))}
            </fieldset>
            <div className="buyrow">
              <div className="stepper">
                <button type="button" aria-label="Kam karo" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <output aria-live="polite">{qty}</output>
                <button type="button" aria-label="Badhao" onClick={() => setQty((q) => Math.min(20, q + 1))}>+</button>
              </div>
              <button className="btn solid" type="button" disabled={out} onClick={add}>
                {out ? "Abhi khatam" : `Order mein jodo · ${rupee(j.prices[sz] * qty)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// juice ki boondon wala kinara (SVG path)
const DRIP = (() => {
  const drips = [[1330, 40], [1130, 66], [930, 30], [700, 56], [480, 36], [260, 70], [90, 44]];
  const y = 24; let p = `M0 0 H1440 V${y}`;
  for (const [x, L] of drips) {
    const w = 11, e = y + L;
    p += ` L${x + w + 16} ${y} C${x + w + 4} ${y} ${x + w} ${y + 8} ${x + w} ${e - w} A${w} ${w} 0 0 1 ${x - w} ${e - w} C${x - w} ${y + 8} ${x - w - 4} ${y} ${x - w - 16} ${y}`;
  }
  return p + ` L0 ${y} Z`;
})();
