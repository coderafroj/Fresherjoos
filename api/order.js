/* Vercel function: POST /api/order
   Order aate hi Telegram pe sundar message + map pin + buttons bhejta hai.
   Keys sirf Vercel ke Environment Variables mein rakho (README dekho), code ya GitHub mein kabhi nahi. */
const C = Object.assign({}, require("../config.js"), require("./_private.js"));
const F = require("../format.js");

const hits = new Map();
function limited(ip) {
  const now = Date.now(), win = 10 * 60 * 1000;
  const arr = (hits.get(ip) || []).filter((t) => now - t < win);
  arr.push(now); hits.set(ip, arr);
  return arr.length > 6;
}

async function tg(method, payload) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const r = await fetch("https://api.telegram.org/bot" + token + "/" + method, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify(payload), signal: AbortSignal.timeout(9000)
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.ok) throw new Error("telegram " + method + " " + r.status + " " + (d.description || ""));
  return d.result;
}

async function viaTelegram(order) {
  const token = process.env.TELEGRAM_BOT_TOKEN, chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return { ok: false, why: "telegram keys set nahi hain" };
  const rows = [];
  const links = [{ text: "🗺️ Map kholo", url: F.mapUrl(order) }, { text: "💬 WhatsApp chat", url: "https://wa.me/91" + order.customer.phone }];
  rows.push(links);
  if (process.env.TELEGRAM_WEBHOOK_SECRET) {
    rows.push([{ text: "✅ Accept", callback_data: "s|a|" + order.id }, { text: "❌ Reject", callback_data: "s|r|" + order.id }]);
  }
  const msg = await tg("sendMessage", {
    chat_id: chat, text: F.html(C, order), parse_mode: "HTML",
    disable_web_page_preview: true, reply_markup: { inline_keyboard: rows }
  });
  if (order.loc) {
    try { await tg("sendLocation", { chat_id: chat, latitude: order.loc.lat, longitude: order.loc.lng, reply_to_message_id: msg.message_id }); }
    catch (e) { console.error(e.message); }
  }
  return { ok: true };
}

async function viaCallMeBot(text) {
  const phone = process.env.CALLMEBOT_PHONE, key = process.env.CALLMEBOT_APIKEY;
  if (!phone || !key) return false;
  const url = "https://api.callmebot.com/whatsapp.php?phone=" + encodeURIComponent(phone) + "&apikey=" + encodeURIComponent(key) + "&text=" + encodeURIComponent(text);
  const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
  return r.ok;
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST only" });

  const origin = req.headers.origin;
  if (origin) { try { if (new URL(origin).host !== req.headers.host) return res.status(403).json({ ok: false, error: "Not allowed" }); } catch (e) { return res.status(403).json({ ok: false }); } }

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = null; } }
  if (!body || body.website) return res.status(200).json({ ok: true, delivered: false });

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "x";
  if (limited(ip)) return res.status(429).json({ ok: false, error: "Bahut zyada order, thodi der baad try karein" });

  let order;
  try { order = F.normalize(C, body); }
  catch (e) { return res.status(400).json({ ok: false, error: e.message }); }

  let delivered = false, why = "";
  try { const r = await viaTelegram(order); delivered = r.ok; why = r.why || ""; }
  catch (e) { console.error("Telegram error:", e.message); why = "telegram error"; }
  try { if (await viaCallMeBot(F.message(C, order))) delivered = true; }
  catch (e) { console.error("CallMeBot error:", e.message); }

  if (!delivered) console.error("Order #" + order.id + " Telegram tak nahi pahunch paya:", why);
  return res.status(200).json({ ok: true, delivered, id: order.id });
};
