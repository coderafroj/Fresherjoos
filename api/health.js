/* Browser mein bug aaye to chhoti si khabar (sirf Vercel logs mein dikhti hai, kuch save nahi hota). */
export default async function handler(req, res) {
  if (req.method === "POST") console.error("client error:", String(typeof req.body === "string" ? req.body : JSON.stringify(req.body || {})).slice(0, 300));
  res.setHeader("Cache-Control", "no-store");
  return res.status(204).end();
}
