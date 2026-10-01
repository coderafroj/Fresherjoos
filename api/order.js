/* Vercel serverless function: POST /api/order
   Order aate hi owner ke WhatsApp (CallMeBot) aur/ya Telegram pe message bhej deta hai.
   Keys Vercel ke Environment Variables mein rakhni hain, code mein nahi (README.txt dekho). */
const C = require("../config.js");
const F = require("../format.js");

const hits = new Map(); // simple rate limit (har server instance ke liye)
function limited(ip) {
  const now = Date.now(), win = 10 * 60 * 1000;
  const arr = (hits.get(ip) || []).filter((t) => now - t < win);
  arr.push(now); hits.set(ip, arr);
  return arr.length > 6;
}

async function viaCallMeBot(text) {
  const phone = process.env.CALLMEBOT_PHONE, key = process.env.CALLMEBOT_APIKEY;
  if (!phone || !key) return false;
  const url = "https://api.callmebot.com/whatsapp.php?phone=" + encodeURIComponent(phone) +
    "&apikey=" + encodeURIComponent(key) + "&text=" + encodeURIComponent(text);
  const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
  return r.ok;
}

async function viaTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN, chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return false;
  const plain = text.replace(/[*_]/g, "");
  const r = await fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chat, text: plain, disable_web_page_preview: true }),
    signal: AbortSignal.timeout(8000)
  });
  return r.ok;
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST only" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = null; } }
  if (!body || body.website) return res.status(200).json({ ok: true, delivered: false }); // honeypot

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "x";
  if (limited(ip)) return res.status(429).json({ ok: false, error: "Bahut zyada order, thodi der baad try karein" });

  let order;
  try { order = F.normalize(C, body); }
  catch (e) { return res.status(400).json({ ok: false, error: e.message }); }

  const text = F.message(C, order);
  const out = await Promise.allSettled([viaCallMeBot(text), viaTelegram(text)]);
  const delivered = out.some((r) => r.status === "fulfilled" && r.value === true);
  return res.status(200).json({ ok: true, delivered, id: order.id });
};
