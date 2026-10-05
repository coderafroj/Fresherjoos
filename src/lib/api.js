/** fetch ka safe wrapper: timeout, abort aur JSON ek jagah. Kabhi throw nahi karta (net band ho to ok:false). */
export async function request(url, { method = "GET", body, signal, timeout = 8000, keepalive = false } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(new DOMException("timeout", "TimeoutError")), timeout);
  const relay = () => ctrl.abort(signal.reason);
  if (signal) signal.aborted ? ctrl.abort(signal.reason) : signal.addEventListener("abort", relay, { once: true });
  try {
    const r = await fetch(url, {
      method, signal: ctrl.signal, keepalive,
      headers: body ? { "content-type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await r.json().catch(() => ({}));
    return { ok: r.ok, status: r.status, data };
  } catch (error) {
    return { ok: false, status: 0, data: {}, error, aborted: signal?.aborted === true };
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", relay);
  }
}
export const postJSON = (url, body, opts) => request(url, { ...opts, method: "POST", body });
export const getJSON = (url, opts) => request(url, opts);
