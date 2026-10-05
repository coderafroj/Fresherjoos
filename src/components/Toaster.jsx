import { useEffect } from "react";
import { ui } from "../lib/ui.js";
import { useStore } from "../lib/store.js";

export default function Toaster() {
  const t = useStore(ui, (s) => s.toast);
  useEffect(() => {
    if (!t.text) return;
    const id = setTimeout(() => ui.dispatch({ type: "toastOff" }), t.ms);
    return () => clearTimeout(id);
  }, [t.n, t.text, t.ms]);
  return <div className="toast" hidden={!t.text} role="status">{t.text}</div>;
}
