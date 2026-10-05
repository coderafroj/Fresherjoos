/* Telegram button webhook: Accept / Delivery pe nikla / Deliver ho gaya.
   Sirf tab chalta hai jab TELEGRAM_WEBHOOK_SECRET set ho aur webhook jodi ho (README dekho). */
async function tg(method, payload) {
  const r = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload), signal: AbortSignal.timeout(9000)
  });
  return r.json().catch(() => ({}));
}

const STEP = {
  a: { label: "🟢 Accept ho gaya",  next: (id) => [[{ text: "🛵 Delivery pe nikla", callback_data: `s|o|${id}` }, { text: "❌ Cancel", callback_data: `s|r|${id}` }]] },
  o: { label: "🛵 Raaste mein hai", next: (id) => [[{ text: "✅ Deliver ho gaya", callback_data: `s|d|${id}` }]] },
  d: { label: "✅ Deliver ho gaya", next: () => [] },
  r: { label: "❌ Cancel / Reject", next: () => [] }
};

export default async function handler(req, res) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (req.method !== "POST" || !secret || req.headers["x-telegram-bot-api-secret-token"] !== secret) return res.status(401).end();
  let u = req.body; if (typeof u === "string") { try { u = JSON.parse(u); } catch { u = null; } }
  const cq = u?.callback_query;
  if (!cq?.message || String(cq.message.chat.id) !== String(process.env.TELEGRAM_CHAT_ID)) return res.status(200).json({ ok: true });

  const [tag, code, id] = String(cq.data || "").split("|");
  const st = STEP[code];
  if (tag !== "s" || !st) { await tg("answerCallbackQuery", { callback_query_id: cq.id }); return res.status(200).json({ ok: true }); }
  const who = cq.from?.first_name ? " · " + cq.from.first_name : "";
  const linkRows = (cq.message.reply_markup?.inline_keyboard || []).filter((row) => row.length && row.every((b) => b.url));
  const kb = [[{ text: st.label + who, callback_data: "noop" }], ...linkRows, ...st.next(id)];
  await tg("editMessageReplyMarkup", { chat_id: cq.message.chat.id, message_id: cq.message.message_id, reply_markup: { inline_keyboard: kb } });
  await tg("answerCallbackQuery", { callback_query_id: cq.id, text: st.label });
  return res.status(200).json({ ok: true });
}
