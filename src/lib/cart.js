import C from "../../shared/config.js";
import { couponInfo } from "../../shared/format.js";
import { createStore } from "./store.js";
import { safeJSON, safeSet } from "./utils.js";

const KEY = "freshers-cart";
const NO_COUPON = Object.freeze({ code: "", discount: 0, msg: "" });
export const juiceById = (id) => C.juices.find((j) => j.id === id);
export const sizeById = (id) => C.sizes.find((s) => s.id === id);
export const sizesOf = (j) => C.sizes.filter((s) => j.prices?.[s.id] != null);
export const minPrice = (j) => Math.min(...sizesOf(j).map((s) => j.prices[s.id]));
export const unitPrice = (i) => juiceById(i.j).prices[i.s];

const valid = (i) => {
  const j = juiceById(i?.j);
  return !!j && j.available !== false && !!sizeById(i.s) && j.prices[i.s] != null && i.q > 0 && i.q <= 50;
};

function reducer(s, a) {
  switch (a.type) {
    case "add": {
      const at = s.items.findIndex((i) => i.j === a.j && i.s === a.s);
      const items = at < 0
        ? [...s.items, { j: a.j, s: a.s, q: Math.min(50, a.q) }]
        : s.items.map((i, k) => (k === at ? { ...i, q: Math.min(50, i.q + a.q) } : i));
      return { ...s, items, bump: s.bump + 1 };
    }
    case "step": {
      const items = s.items.flatMap((i, k) => (k !== a.index ? [i] : i.q + a.d <= 0 ? [] : [{ ...i, q: Math.min(50, i.q + a.d) }]));
      return { ...s, items };
    }
    case "set": return { ...s, items: a.items.filter(valid) };
    case "clear": return { ...s, items: [], coupon: NO_COUPON };
    case "coupon": return { ...s, coupon: a.coupon ?? NO_COUPON };
    default: return s;
  }
}

export const cart = createStore(
  reducer,
  { items: safeJSON(KEY, []).filter(valid), coupon: NO_COUPON, bump: 0 },
  { onChange: (s, a) => { if (a.type !== "coupon") safeSet(KEY, s.items); } }
);

/** dusre tab mein cart badle to yahan bhi apne aap badal jaye */
addEventListener("storage", (e) => {
  if (e.key === KEY) cart.dispatch({ type: "set", items: safeJSON(KEY, []) });
});

/** bill ka hisaab (pure function) */
export function totals(items, coupon) {
  const sub = items.reduce((t, i) => t + unitPrice(i) * i.q, 0);
  const d = C.delivery || {};
  const disc = Math.min(coupon?.discount || 0, sub);
  const fee = !sub ? 0 : d.freeAbove > 0 && sub - disc >= d.freeAbove ? 0 : d.fee || 0;
  return { sub, disc, fee, total: sub - disc + fee, count: items.reduce((t, i) => t + i.q, 0) };
}
export { couponInfo };
