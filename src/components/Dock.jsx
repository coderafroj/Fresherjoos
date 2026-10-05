import { useEffect, useRef } from "react";
import { cart, totals } from "../lib/cart.js";
import { openSheet } from "../lib/ui.js";
import { useStore } from "../lib/store.js";
import { useActiveSection } from "../lib/hooks.js";
import { rupee, cx } from "../lib/utils.js";

const SECTIONS = ["menu", "race", "places", "area", "order"];
const LINKS = [["menu", "Menu"], ["race", "20 min", true], ["places", "Hospital & Gym", true], ["area", "Area"]];

export default function Dock() {
  const items = useStore(cart, (s) => s.items);
  const coupon = useStore(cart, (s) => s.coupon);
  const bump = useStore(cart, (s) => s.bump);
  const active = useActiveSection(SECTIONS);
  const btn = useRef(null);
  const t = totals(items, coupon);

  useEffect(() => {                                      // jodte hi button uchhalta hai
    if (bump) btn.current?.animate([{ transform: "scale(1)" }, { transform: "scale(1.18)" }, { transform: "scale(1)" }], { duration: 320 });
  }, [bump]);

  return (
    <nav className="dock" aria-label="Page menu">
      {LINKS.map(([id, label, hide]) => <a key={id} href={"#" + id} className={cx(active === id && "on", hide && "hide-s")}>{label}</a>)}
      <button ref={btn} className="cartbtn" type="button" aria-haspopup="dialog" onClick={openSheet}>
        {t.count ? `Order · ${t.count} · ${rupee(t.total)}` : "Order"}
      </button>
    </nav>
  );
}
