/* POST /api/order
   Order aate hi Telegram pe sundar message + map pin + buttons bhejta hai.
   TELEGRAM_BOT_TOKEN aur TELEGRAM_CHAT_ID sirf Vercel ke Environment Variables mein rakho, kabhi code ya GitHub mein nahi. */
import base from "../shared/config.js";
import priv from "./_private.js";
import { normalize, html, mapUrl } from "../shared/format.js";
import { guard, readBody, clientIp, rateLimiter } from "./_lib.js";

const C = { ...base, ...priv };
const limited = rateLimiter(6, 10 * 60_000);

async function tg(method, payload) {
  const r = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify(payload), signal: AbortSignal.timeout(9000)
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.ok) throw new Error(`telegram ${method} ${r.status} ${d.description || ""}`);
  return d.result;
}

async function sendTelegram(order) {
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!process.env.TELEGRAM_BOT_TOKEN || !chat) return { ok: false, why: "TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID set nahi hain" };
  const rows = [[{ text: "🗺️ Map kholo", url: mapUrl(order) }, { text: "💬 WhatsApp chat", url: "https://wa.me/91" + order.customer.phone }]];
  if (process.env.TELEGRAM_WEBHOOK_SECRET) rows.push([{ text: "✅ Accept", callback_data: "s|a|" + order.id }, { text: "❌ Reject", callback_data: "s|r|" + order.id }]);
  const msg = await tg("sendMessage", { chat_id: chat, text: html(C, order), parse_mode: "HTML", disable_web_page_preview: true, reply_markup: { inline_keyboard: rows } });
  if (order.loc) {
    try { await tg("sendLocation", { chat_id: chat, latitude: order.loc.lat, longitude: order.loc.lng, reply_to_message_id: msg.message_id }); }
    catch (e) { console.error(e.message); }
  }
  return { ok: true };
}

export default async function handler(req, res) {
  if (!guard(req, res)) return;
  const body = readBody(req);
  if (body.website) return res.status(200).json({ ok: true, delivered: false });         // honeypot
  if (limited(clientIp(req))) return res.status(429).json({ ok: false, error: "Bahut zyada order, thodi der baad try karein" });

  let order;
  try { order = normalize(C, body); }
  catch (e) { return res.status(400).json({ ok: false, error: e.message }); }

  let delivered = false, why = "";
  try { const r = await sendTelegram(order); delivered = r.ok; why = r.why || ""; }
  catch (e) { why = e.message; }
  if (!delivered) console.error(`Order #${order.id} Telegram tak nahi pahunch paya: ${why}`);
  return res.status(200).json({ ok: true, delivered, id: order.id });
}
