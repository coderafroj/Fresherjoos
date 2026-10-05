/* api ke helper (underscore se shuru hone ki wajah se ye Vercel pe public link nahi banta) */

/** Sirf apni hi site se aaye request allow karo (dusri site se spam block). */
export function sameOrigin(req) {
  const o = req.headers.origin;
  if (!o) return true;
  try { return new URL(o).host === req.headers.host; } catch { return false; }
}

export function clientIp(req) {
  return String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "x";
}

/** Chhota rate limiter (har server instance ke liye). */
export function rateLimiter(max, windowMs) {
  const hits = new Map();
  return (ip) => {
    const now = Date.now();
    const arr = (hits.get(ip) || []).filter((t) => now - t < windowMs);
    arr.push(now);
    hits.set(ip, arr);
    if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
    return arr.length > max;
  };
}

export function readBody(req) {
  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch { b = null; } }
  return b && typeof b === "object" ? b : {};
}

export function guard(req, res, { method = "POST" } = {}) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== method) { res.status(405).json({ ok: false, error: method + " only" }); return false; }
  if (!sameOrigin(req)) { res.status(403).json({ ok: false, error: "Not allowed" }); return false; }
  return true;
}
