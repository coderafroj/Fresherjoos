/* POST /api/coupon -> coupon sahi hai ya nahi aur kitni chhoot milegi (coupon ki list browser ko kabhi nahi jaati) */
import base from "../shared/config.js";
import priv from "./_private.js";
import { couponInfo, subtotal } from "../shared/format.js";
import { guard, readBody, clientIp, rateLimiter } from "./_lib.js";

const C = { ...base, ...priv };
const limited = rateLimiter(15, 60_000);

export default async function handler(req, res) {
  if (!guard(req, res)) return;
  if (limited(clientIp(req))) return res.status(429).json({ ok: false, msg: "Thodi der baad try karein" });
  const b = readBody(req);
  const r = couponInfo(C, String(b.code || "").slice(0, 20), subtotal(C, b.items));
  return res.status(200).json({ ok: r.ok, discount: r.discount, code: r.code, msg: r.msg || "" });
}
