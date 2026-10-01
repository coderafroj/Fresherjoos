/* Order ko check karta hai aur WhatsApp message banata hai.
   Ye file browser aur server (api/order.js) dono use karte hain, isliye message hamesha ek jaisa hota hai. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.FRFormat = factory();
})(typeof self !== "undefined" ? self : this, function () {
  var KEYCAP = ["0️⃣","1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣"];
  var PLACE_ICON = { Hospital: "🏥", Gym: "💪", Ghar: "🏠", Office: "🏢" };
  var LINE = "━━━━━━━━━━━━━━";

  function clean(s, max) {
    return String(s == null ? "" : s).replace(/[\u0000-\u001f\u007f*_~`]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
  }
  function money(n) { return "₹" + Number(n).toLocaleString("en-IN"); }
  function tenDigits(v) {
    var d = String(v || "").replace(/\D/g, "");
    if (d.length === 12 && d.indexOf("91") === 0) d = d.slice(2);
    if (d.length === 11 && d.charAt(0) === "0") d = d.slice(1);
    return d;
  }

  function normalize(C, raw) {
    if (!raw || typeof raw !== "object") throw new Error("Order ka data nahi mila");
    var list = Array.isArray(raw.items) ? raw.items.slice(0, 30) : [];
    var items = [], sub = 0;
    list.forEach(function (it) {
      var j = C.juices.filter(function (x) { return x.id === it.j; })[0];
      var s = C.sizes.filter(function (x) { return x.id === it.s; })[0];
      var q = Math.floor(Number(it.q));
      if (!j || !s || j.available === false || !j.prices || j.prices[s.id] == null || !(q >= 1 && q <= 50)) return;
      var unit = j.prices[s.id];
      items.push({ name: j.name, ml: s.ml, q: q, unit: unit, line: unit * q });
      sub += unit * q;
    });
    if (!items.length) throw new Error("Cart khaali hai");

    var c = raw.customer || {};
    var name = clean(c.name, 60);
    var phone = tenDigits(c.phone);
    if (name.length < 2) throw new Error("Apna naam likhein");
    if (!/^[6-9]\d{9}$/.test(phone)) throw new Error("Sahi 10 digit mobile number likhein");

    var d = C.delivery || {};
    var fee = (d.freeAbove > 0 && sub >= d.freeAbove) ? 0 : (d.fee || 0);
    if (d.minOrder > 0 && sub < d.minOrder) throw new Error("Kam se kam order " + money(d.minOrder) + " ka hona chahiye");

    var loc = null;
    if (raw.loc && isFinite(raw.loc.lat) && isFinite(raw.loc.lng) &&
        Math.abs(raw.loc.lat) <= 90 && Math.abs(raw.loc.lng) <= 180) {
      loc = { lat: +Number(raw.loc.lat).toFixed(6), lng: +Number(raw.loc.lng).toFixed(6),
              acc: isFinite(raw.loc.acc) ? Math.round(raw.loc.acc) : null };
    }
    var id = /^FR-[0-9A-Z]{4,8}$/.test(String(raw.id)) ? raw.id : "FR-" + String(Date.now() % 100000).padStart(5, "0");
    var place = clean(c.place, 20), addr = clean(c.addr, 200);
    if (!addr && !loc) throw new Error("Pata likhein ya apni location bhejein");

    return {
      id: id, ts: Date.now(), items: items, sub: sub, fee: fee, total: sub + fee,
      customer: { name: name, phone: phone, place: place, addr: addr, note: clean(c.note, 160), pay: clean(c.pay, 30) },
      loc: loc
    };
  }

  function when(ts) {
    try {
      return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true }).format(new Date(ts));
    } catch (e) { return new Date(ts).toISOString(); }
  }

  function message(C, o) {
    var c = o.customer, L = [];
    L.push("🍹 *NAYA ORDER • " + C.brand.name + "*");
    L.push("🧾 *#" + o.id + "*   ⏰ " + when(o.ts));
    L.push(LINE);
    L.push("👤 *Naam:* " + c.name);
    L.push("📞 *Phone:* " + c.phone);
    L.push("💬 *Chat:* https://wa.me/91" + c.phone);
    if (c.place) L.push((PLACE_ICON[c.place] || "📌") + " *Jagah:* " + c.place);
    if (c.addr) L.push("🏷️ *Pata:* " + c.addr);
    if (o.loc) {
      L.push("🗺️ *Location:* https://www.google.com/maps?q=" + o.loc.lat + "," + o.loc.lng);
      if (o.loc.acc) L.push("      _(±" + o.loc.acc + " meter tak sahi)_");
    }
    L.push(LINE);
    L.push("🥤 *ORDER*");
    o.items.forEach(function (it, i) {
      var n = i + 1;
      var k = n < 10 ? KEYCAP[n] : n + ".";
      L.push(k + " " + it.name + " " + it.ml + " ml × " + it.q + " = " + money(it.line));
    });
    L.push(LINE);
    L.push("Juice: " + money(o.sub));
    L.push("Delivery: " + (o.fee ? money(o.fee) : "Free"));
    L.push("💰 *TOTAL: " + money(o.total) + "*");
    if (c.pay) L.push("💳 *Payment:* " + c.pay);
    if (c.note) L.push("📝 *Note:* " + c.note);
    L.push(LINE);
    L.push("⚡ _" + (C.delivery && C.delivery.minutes || 20) + " minute mein deliver karna hai!_");
    return L.join("\n");
  }

  return { normalize: normalize, message: message, money: money, tenDigits: tenDigits };
});
