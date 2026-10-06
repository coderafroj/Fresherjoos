/*  Production mein: console saaf rakho, React DevTools band, sirf "Ruko!" chetavni.
    (Network tab / View Source har browser mein hota hi hai — isliye browser ko koi secret bheji hi nahi jaati.) */
if (import.meta.env.PROD) {
  try {
    const log = console.log.bind(console);
    log("%cRuko!", "font:800 44px system-ui;color:#B3123A");
    log("%cYahan koi bhi text paste mat karna. Koi aapko yahan kuch daalne ko kahe to wo aapka phone number, address ya account chura sakta hai.", "font:600 15px system-ui");
    for (const k of ["log", "info", "debug", "warn", "table", "dir", "dirxml", "trace", "group", "groupEnd", "time", "timeEnd"]) console[k] = () => {};
  } catch { /* */ }
  try {
    Object.defineProperty(window, "__REACT_DEVTOOLS_GLOBAL_HOOK__", {
      value: { isDisabled: true, supportsFiber: true, renderers: new Map(), inject() {}, onCommitFiberRoot() {}, onCommitFiberUnmount() {}, onPostCommitFiberRoot() {} },
      configurable: false, writable: false
    });
  } catch { /* */ }
}
