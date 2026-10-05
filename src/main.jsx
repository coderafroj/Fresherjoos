import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(<StrictMode><App /></StrictMode>);

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
}
try {
  console.log("%cRuko!", "font:800 42px system-ui;color:#B3123A");
  console.log("%cYahan koi bhi text paste mat karna. Koi aapko yahan kuch daalne ko kahe to wo aapka phone number, address ya account chura sakta hai.", "font:600 15px system-ui");
} catch { /* */ }
