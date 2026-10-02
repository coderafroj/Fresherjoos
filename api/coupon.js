/* POST /api/coupon  -> coupon sahi hai ya nahi, aur kitni chhoot milegi (coupon ki list browser ko kabhi nahi bhejte) */
const C = Object.assign({}, require("../config.js"), require("./_private.js"));
const F = require("../format.js");
const hits = new Map();

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  const origin = req.headers.origin;
  if (origin) { try { if (new URL(origin).host !== req.headers.host) return res.status(403).json({ ok: false }); } catch (e) { return res.status(403).json({ ok: false }); } }
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "x";
  const now = Date.now(), arr = (hits.get(ip) || []).filter((t) => now - t < 60000); arr.push(now); hits.set(ip, arr);
  if (arr.length > 12) return res.status(429).json({ ok: false, msg: "Thodi der baad try karein" });
  let b = req.body; if (typeof b === "string") { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  b = b || {};
  const sub = F.subtotal(C, b.items);
  const r = F.couponInfo(C, String(b.code || "").slice(0, 20), sub);
  return res.status(200).json({ ok: r.ok, discount: r.discount, code: r.code, msg: r.msg || "" });
};
