/* Order check, doori (distance), coupon aur message banane ka kaam.
   Ye file browser aur server (api/order.js) dono use karte hain, isliye hisaab hamesha ek jaisa rehta hai. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.FRFormat = factory();
})(typeof self !== "undefined" ? self : this, function () {
  var KEYCAP = ["0️⃣","1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣"];
  var PLACE_ICON = { Hospital: "🏥", Gym: "💪", Ghar: "🏠", Office: "🏢" };

  function clean(s, max) {
    return String(s == null ? "" : s).replace(/[\u0000-\u001f\u007f*_~`<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
  }
  function money(n) { return "₹" + Number(n).toLocaleString("en-IN"); }
  function tenDigits(v) {
    var d = String(v || "").replace(/\D/g, "");
    if (d.length === 12 && d.indexOf("91") === 0) d = d.slice(2);
    if (d.length === 11 && d.charAt(0) === "0") d = d.slice(1);
    return d;
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  /* ---------- doori ---------- */
  function haversine(a, b) {
    var R = 6371, rad = Math.PI / 180;
    var dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  /* sabse paas wali zone dhoondhta hai. inside = us zone ke radius ke andar (GPS galti ka thoda maaf) */
  function zoneFor(C, lat, lng, acc) {
    var zs = (C.area && C.area.zones) || [], best = null;
    zs.forEach(function (z) {
      var d = haversine({ lat: lat, lng: lng }, z);
      var inside = d - Math.min(acc || 0, 200) / 1000 <= z.radiusKm;
      if (!best || d < best.dist) best = { zone: z, dist: d, inside: inside };
    });
    if (!best) return { zone: null, dist: 0, inside: true };
    return best;
  }

  /* ---------- khulne ka time (IST) ---------- */
  function minutesIST(ts) {
    try {
      var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date(ts || Date.now()));
      var h = +p.filter(function (x) { return x.type === "hour"; })[0].value % 24;
      var m = +p.filter(function (x) { return x.type === "minute"; })[0].value;
      return h * 60 + m;
    } catch (e) { var d = new Date(ts || Date.now()); return d.getHours() * 60 + d.getMinutes(); }
  }
  function toMin(hhmm) { var a = String(hhmm).split(":"); return (+a[0]) * 60 + (+a[1] || 0); }
  function isOpen(C, ts) {
    var h = C.hours; if (!h) return true;
    var now = minutesIST(ts), o = toMin(h.open), c = toMin(h.close);
    return o <= c ? (now >= o && now < c) : (now >= o || now < c);
  }

  /* ---------- coupon ---------- */
  function couponInfo(C, code, sub) {
    code = String(code || "").trim().toUpperCase();
    if (!code) return { ok: true, discount: 0, code: "" };
    var c = (C.coupons || []).filter(function (x) { return String(x.code).toUpperCase() === code; })[0];
    if (!c) return { ok: false, discount: 0, code: code, msg: "Ye coupon sahi nahi hai" };
    if (c.minOrder && sub < c.minOrder) return { ok: false, discount: 0, code: code, msg: "Is coupon ke liye kam se kam " + money(c.minOrder) + " ka order chahiye" };
    var off = c.percent ? Math.round(sub * c.percent / 100) : (c.flat || 0);
    if (c.maxOff) off = Math.min(off, c.maxOff);
    off = Math.max(0, Math.min(off, sub));
    return { ok: true, discount: off, code: code, msg: "Coupon laga: " + money(off) + " ki chhoot" };
  }

  /* ---------- order ko check karke saaf banata hai ---------- */
  function normalize(C, raw, opts) {
    opts = opts || {};
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

    if (C.hours && C.hours.enforce && !isOpen(C)) throw new Error("Abhi hum band hain. Khulne ka time: " + C.hours.open + " se " + C.hours.close);

    var c = raw.customer || {};
    var name = clean(c.name, 60), phone = tenDigits(c.phone);
    if (name.length < 2) throw new Error("Apna naam likhein");
    if (!/^[6-9]\d{9}$/.test(phone)) throw new Error("Sahi 10 digit mobile number likhein");
    var addr = clean(c.addr, 200);
    if (addr.length < 3) throw new Error("Pata, ward ya room number likhein");

    var loc = null, A = C.area || {};
    if (raw.loc && isFinite(raw.loc.lat) && isFinite(raw.loc.lng) && Math.abs(raw.loc.lat) <= 90 && Math.abs(raw.loc.lng) <= 180) {
      loc = { lat: +Number(raw.loc.lat).toFixed(6), lng: +Number(raw.loc.lng).toFixed(6),
              acc: isFinite(raw.loc.acc) ? Math.round(raw.loc.acc) : null };
    }
    if (A.enabled !== false) {
      if (!loc && A.requireLocation) throw new Error("Delivery ke liye apni location bhejna zaroori hai");
      if (loc) {
        var zf = zoneFor(C, loc.lat, loc.lng, loc.acc);
        loc.dist = +zf.dist.toFixed(2); loc.zone = zf.zone ? zf.zone.name : "";
        if (!zf.inside && zf.zone) throw new Error("Aap hamare delivery area ke bahar hain (" + loc.dist + " km door). Abhi sirf " + zf.zone.name + " ke " + zf.zone.radiusKm + " km mein delivery hai.");
      }
    }

    var cp = opts.noCoupon ? { ok: true, discount: 0, code: "" } : couponInfo(C, raw.coupon, sub);
    if (!cp.ok) throw new Error(cp.msg);
    var d = C.delivery || {};
    var after = sub - cp.discount;
    var fee = (d.freeAbove > 0 && after >= d.freeAbove) ? 0 : (d.fee || 0);
    if (d.minOrder > 0 && after < d.minOrder) throw new Error("Kam se kam order " + money(d.minOrder) + " ka hona chahiye");

    var id = /^FR-[0-9A-Z]{4,8}$/.test(String(raw.id)) ? raw.id : "FR-" + String(Date.now() % 100000).padStart(5, "0");
    var slots = (C.orders && C.orders.slots) || [];
    var when = clean(c.when, 40); if (slots.length && slots.indexOf(when) < 0) when = slots[0];
    return {
      id: id, ts: Date.now(), items: items, sub: sub, discount: cp.discount, coupon: cp.code, fee: fee, total: after + fee,
      customer: { name: name, phone: phone, place: clean(c.place, 20), addr: addr, note: clean(c.note, 160), pay: clean(c.pay, 30), when: when },
      loc: loc
    };
  }

  function when(ts) {
    try { return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true }).format(new Date(ts)); }
    catch (e) { return new Date(ts).toISOString(); }
  }
  function mapUrl(o) {
    if (o.loc) return "https://www.google.com/maps?q=" + o.loc.lat + "," + o.loc.lng;
    return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(o.customer.addr);
  }

  /* ---------- WhatsApp message (backup ke liye) ---------- */
  function message(C, o) {
    var c = o.customer, L = [], LINE = "━━━━━━━━━━━━━━";
    L.push("🍹 *NAYA ORDER • " + C.brand.name + "*");
    L.push("🧾 *#" + o.id + "*   ⏰ " + when(o.ts));
    L.push(LINE);
    L.push("👤 *Naam:* " + c.name);
    L.push("📞 *Phone:* " + c.phone);
    if (c.place) L.push((PLACE_ICON[c.place] || "📌") + " *Jagah:* " + c.place);
    L.push("🏷️ *Pata:* " + c.addr);
    if (o.loc) {
      L.push("🗺️ *Location:* " + mapUrl(o));
      L.push("      _" + o.loc.dist + " km door" + (o.loc.acc ? ", ±" + o.loc.acc + " m" : "") + "_");
    }
    L.push(LINE);
    L.push("🥤 *ORDER*");
    o.items.forEach(function (it, i) { var n = i + 1; L.push((n < 10 ? KEYCAP[n] : n + ".") + " " + it.name + " " + it.ml + " ml × " + it.q + " = " + money(it.line)); });
    L.push(LINE);
    L.push("Juice: " + money(o.sub));
    if (o.discount) L.push("Coupon " + o.coupon + ": −" + money(o.discount));
    L.push("Delivery: " + (o.fee ? money(o.fee) : "Free"));
    L.push("💰 *TOTAL: " + money(o.total) + "*");
    if (c.pay) L.push("💳 *Payment:* " + c.pay);
    if (c.when) L.push("⏱️ *Kab:* " + c.when);
    if (c.note) L.push("📝 *Note:* " + c.note);
    return L.join("\n");
  }

  /* ---------- Telegram message (HTML) ---------- */
  function html(C, o) {
    var c = o.customer, L = [], LINE = "━━━━━━━━━━━━━━";
    L.push("🍹 <b>NAYA ORDER • " + esc(C.brand.name) + "</b>");
    L.push("🧾 <b>#" + esc(o.id) + "</b>  ⏰ " + esc(when(o.ts)));
    L.push(LINE);
    L.push("👤 <b>" + esc(c.name) + "</b>");
    L.push("📞 +91" + c.phone);
    if (c.place) L.push((PLACE_ICON[c.place] || "📌") + " " + esc(c.place) + " — " + esc(c.addr));
    else L.push("🏷️ " + esc(c.addr));
    if (o.loc) L.push("📍 <b>" + o.loc.dist + " km</b> door" + (o.loc.zone ? " (" + esc(o.loc.zone) + " se)" : "") + (o.loc.acc ? " · ±" + o.loc.acc + " m" : ""));
    else L.push("📍 Location nahi bheji");
    L.push(LINE);
    L.push("🥤 <b>ORDER</b>");
    o.items.forEach(function (it, i) { var n = i + 1; L.push((n < 10 ? KEYCAP[n] : n + ".") + " " + esc(it.name) + " " + it.ml + " ml × " + it.q + " = " + money(it.line)); });
    L.push(LINE);
    var sum = "Juice " + money(o.sub);
    if (o.discount) sum += "  |  " + esc(o.coupon) + " −" + money(o.discount);
    sum += "  |  Delivery " + (o.fee ? money(o.fee) : "Free");
    L.push(sum);
    L.push("💰 <b>TOTAL " + money(o.total) + "</b>" + (c.pay ? "  ·  💳 " + esc(c.pay) : ""));
    if (c.when) L.push("⏱️ " + esc(c.when));
    if (c.note) L.push("📝 " + esc(c.note));
    L.push("⚡ <i>" + ((C.delivery && C.delivery.minutes) || 20) + " minute ka target</i>");
    return L.join("\n");
  }

  function subtotal(C, list) {
    var sub = 0;
    (Array.isArray(list) ? list.slice(0, 30) : []).forEach(function (it) {
      var j = C.juices.filter(function (x) { return x.id === it.j; })[0];
      var s = C.sizes.filter(function (x) { return x.id === it.s; })[0];
      var q = Math.floor(Number(it.q));
      if (j && s && j.available !== false && j.prices && j.prices[s.id] != null && q >= 1 && q <= 50) sub += j.prices[s.id] * q;
    });
    return sub;
  }

  return { subtotal: subtotal, normalize: normalize, message: message, html: html, mapUrl: mapUrl, money: money, tenDigits: tenDigits,
           haversine: haversine, zoneFor: zoneFor, isOpen: isOpen, couponInfo: couponInfo };
});
