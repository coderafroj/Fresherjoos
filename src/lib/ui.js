import { createStore } from "./store.js";

/** Poori site ki chhoti UI state: order sheet khula hai? kaun sa juice chuna gaya? toast? */
export const ui = createStore(
  (s, a) => {
    switch (a.type) {
      case "sheet": return s.sheet === a.open ? s : { ...s, sheet: a.open };
      case "pick": return { ...s, picked: a.id, pickN: s.pickN + 1 };
      case "toast": return { ...s, toast: { text: a.text, n: s.toast.n + 1, ms: a.ms ?? 2800 } };
      case "toastOff": return { ...s, toast: { ...s.toast, text: "" } };
      case "locSheet": return s.locSheet === a.open ? s : { ...s, locSheet: a.open };
      case "bannerOff": return s.bannerOff ? s : { ...s, bannerOff: true };
      default: return s;
    }
  },
  { sheet: false, locSheet: false, picked: null, pickN: 0, toast: { text: "", n: 0, ms: 0 }, bannerOff: false }
);

export const toast = (text, ms) => ui.dispatch({ type: "toast", text, ms });
export const openSheet = () => ui.dispatch({ type: "sheet", open: true });
export const closeSheet = () => ui.dispatch({ type: "sheet", open: false });
export const pickJuice = (id) => ui.dispatch({ type: "pick", id });
export const openLocSheet = () => ui.dispatch({ type: "locSheet", open: true });
export const closeLocSheet = () => ui.dispatch({ type: "locSheet", open: false });
