import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import C from "../../shared/config.js";
import { message, normalize } from "../../shared/format.js";
import { cart, juiceById, sizeById, totals } from "../lib/cart.js";
import { ui, closeSheet, toast } from "../lib/ui.js";
import { useStore } from "../lib/store.js";
import { useCountdown, useLocation } from "../lib/hooks.js";
import { location, placeLabel } from "../lib/location.js";
import { areaOn, areaState, outMessage } from "../lib/area.js";
import { postJSON } from "../lib/api.js";
import { shareSite, waLink } from "../lib/share.js";
import { km, rupee, safeJSON, safeSet, scrollToId } from "../lib/utils.js";
import { PinIcon } from "./Icons.jsx";

const PLACES = ["Hospital", "Gym", "Ghar", "Office", "Aur kahin"];
const SLOTS = C.orders?.slots ?? [];
const PAYS = C.orders?.payments ?? ["Cash on delivery"];
const NEED_LOC = areaOn && C.area?.requireLocation;
const telHref = `tel:+91${C.contact.phone}`;

const initForm = () => {
  const s = safeJSON("freshers-info", {});
  return {
    name: s.name || "", phone: s.phone || "", addr: s.addr || "", area: "", pin: "", note: "", code: cart.get().coupon.code || "",
    place: PLACES.includes(s.place) ? s.place : PLACES[0], when: SLOTS.includes(s.when) ? s.when : SLOTS[0] || "", pay: PAYS.includes(s.pay) ? s.pay : PAYS[0]
  };
};
const reduce = (s, a) => ({ ...s, [a.k]: a.v });

/* ---------- location ka dabba ---------- */
function LocBox({ L }) {
  const st = areaState(L), retry = () => location.locate({ force: true });
  const label = placeLabel(L.place);
  if (L.fix && st !== "out") return (
    <div className="locbox ok"><b>Location mil gayi{L.zone?.zone ? ` · ${km(L.zone.dist)} door` : ""}</b>
      {label && <span>{label}</span>}<span>{areaOn ? "Delivery area mein ho" : ""}{L.fix.acc ? ` · sahi hone ka andaaza ±${Math.round(L.fix.acc)} m` : ""}.</span>
      <button className="btn" type="button" onClick={retry}>{L.refining ? "Aur sahi kar rahe hain…" : "Dobara lo"}</button></div>
  );
  if (L.fix) return <div className="locbox bad"><b>Aap area ke bahar ho</b><span>{outMessage(L)}</span><button className="btn" type="button" onClick={retry}>Dobara check karo</button></div>;
  if (L.status === "locating") return <div className="locbox"><b>Location dhoondh rahe hain…</b><span>Thoda ruko, GPS ko 5-10 second lagte hain.</span></div>;
  if (L.status === "denied") return <div className="locbox bad"><b>Location ki permission band hai</b><span>Delivery ke liye location zaroori hai. Phone/browser settings mein is site ka Location → Allow karo.</span><button className="btn" type="button" onClick={retry}>Dobara try karo</button></div>;
  return <div className="locbox"><b>Apni location bhejo</b><span>Aapka area aur pincode apne aap bhar jayega, aur rider seedha aap tak pahunchega.</span><button className="btn" type="button" onClick={retry}><PinIcon />Meri location bhejo</button></div>;
}

/* ---------- order form ---------- */
function FormView({ onDone, onFail }) {
  const items = useStore(cart, (s) => s.items);
  const coupon = useStore(cart, (s) => s.coupon);
  const L = useLocation();
  const [f, set] = useReducer(reduce, undefined, initForm);
  const [err, setErr] = useState({});
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState("");
  const [cp, setCp] = useState({ t: coupon.code ? coupon.msg : "", ok: !!coupon.code });
  const touched = useRef({ area: false, pin: false });
  const tot = useMemo(() => totals(items, coupon), [items, coupon]);
  const low = C.delivery.minOrder > 0 && tot.sub - tot.disc < C.delivery.minOrder;
  const payload = useMemo(() => items.map((i) => ({ j: i.j, s: i.s, q: i.q })), [items]);

  // location se area aur pincode apne aap bharo (jab tak user ne khud na badla ho)
  useEffect(() => {
    const p = L.place; if (!p) return;
    if (!touched.current.area && (p.line || p.area)) set({ k: "area", v: p.line || p.area });
    if (!touched.current.pin && p.pin) set({ k: "pin", v: p.pin });
  }, [L.place]);

  // cart badle to coupon dobara check
  useEffect(() => {
    if (!coupon.code) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      const r = await postJSON("/api/coupon", { code: coupon.code, items: payload }, { signal: ctrl.signal });
      if (r.aborted) return;
      cart.dispatch({ type: "coupon", coupon: r.data?.ok ? { code: r.data.code, discount: r.data.discount, msg: r.data.msg || "Coupon laga" } : null });
    }, 350);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [payload]); // eslint-disable-line react-hooks/exhaustive-deps

  const on = (k) => (e) => { if (k === "area" || k === "pin") touched.current[k] = true; set({ k, v: e.target.value }); };

  async function applyCoupon() {
    const code = f.code.trim();
    if (!code) { cart.dispatch({ type: "coupon", coupon: null }); return setCp({ t: "" }); }
    setCp({ t: "Check kar rahe hain…" });
    const r = await postJSON("/api/coupon", { code, items: payload });
    if (r.data?.ok) { cart.dispatch({ type: "coupon", coupon: { code: r.data.code, discount: r.data.discount, msg: r.data.msg } }); setCp({ t: r.data.msg, ok: true }); }
    else { cart.dispatch({ type: "coupon", coupon: null }); setCp({ t: r.data?.msg || "Abhi coupon check nahi ho paya", bad: true }); }
  }

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setMsg(""); setErr({});
    const phone = f.phone.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
    const bad = (k, m) => { setErr({ [k]: true }); setMsg(m); document.getElementById("f-" + k)?.focus(); };
    if (f.name.trim().length < 2) return bad("name", "Apna naam likhein");
    if (!/^[6-9]\d{9}$/.test(phone)) return bad("phone", "Sahi 10 digit mobile number likhein");
    if (f.addr.trim().length < 3) return bad("addr", "Ward, room ya landmark likhein");
    if (f.pin.trim() && !/^\d{6}$/.test(f.pin.trim())) return bad("pin", "Sahi 6 digit pincode likhein (ya khaali chhod do)");

    setBusy("Ek minute…");
    if (NEED_LOC) {
      if (!location.getSnapshot().fix) { setBusy("Location le rahe hain…"); await location.waitForFix(10000); }
      const s = location.getSnapshot();
      if (!s.fix) { setBusy(""); return setMsg(s.status === "denied" ? "Delivery ke liye location zaroori hai. Phone ya browser settings mein Location allow karo, phir dobara dabao." : "Location nahi mil paayi. Bahar khule mein ya GPS on karke dobara try karo."); }
      if (s.zone && !s.zone.inside) { setBusy(""); return setMsg(outMessage(s)); }
    }
    const s = location.getSnapshot();
    const raw = {
      id: "FR-" + String(Date.now() % 100000).padStart(5, "0"), website: "", coupon: coupon.code, items: payload,
      customer: { name: f.name, phone, place: f.place, addr: f.addr, area: f.area, pin: f.pin, note: f.note, pay: f.pay, when: f.when },
      loc: s.fix ? { lat: s.fix.lat, lng: s.fix.lng, acc: s.fix.acc } : null,
      geo: s.place ? { city: s.place.city, state: s.place.state } : null
    };
    let order;
    try {
      order = normalize(C, raw, { noCoupon: true });
      if (coupon.code) { order.coupon = coupon.code; order.discount = Math.min(coupon.discount, order.sub); order.total = order.sub - order.discount + order.fee; }
    } catch (x) { setBusy(""); return setMsg(x.message); }
    safeSet("freshers-info", { name: f.name, phone, place: f.place, addr: f.addr, pay: f.pay, when: f.when });

    setBusy("Order bhej rahe hain…");
    const r = await postJSON("/api/order", raw, { keepalive: true, timeout: 15000 });
    if (r.status === 400 || r.status === 429) { setBusy(""); return setMsg(r.data?.error || "Order nahi gaya, dobara try karein."); }
    if (r.ok && r.data?.delivered) {
      safeSet("fr-last", { items: payload });
      cart.dispatch({ type: "clear" });
      onDone(order);
    } else onFail(order);
  }

  if (!items.length) {
    const last = safeJSON("fr-last", null);
    const reorder = () => cart.dispatch({ type: "set", items: last.items });
    return (
      <div className="empty"><p>Abhi kuch nahi chuna. Menu se juice jodo.</p>
        <button className="btn solid" type="button" onClick={() => { closeSheet(); scrollToId("menu"); }}>Menu dekho</button>
        {last?.items?.length > 0 && <button className="btn" type="button" onClick={reorder}>Pichhla order dobara</button>}
      </div>
    );
  }

  const fld = (k, label, el) => <label className={"fld" + (err[k] ? " err" : "")}>{label}{el}</label>;
  return (
    <>
      <div>
        {items.map((i, ix) => {
          const j = juiceById(i.j), sz = sizeById(i.s);
          return (
            <div className="line" key={i.j + i.s} style={{ "--c": j.color }}>
              <span className="dot" /><div><b>{j.name}</b><small>{sz.ml} ml · {rupee(j.prices[i.s])}</small></div>
              <div className="stepper">
                <button type="button" aria-label="Kam karo" onClick={() => cart.dispatch({ type: "step", index: ix, d: -1 })}>−</button>
                <output>{i.q}</output>
                <button type="button" aria-label="Badhao" onClick={() => cart.dispatch({ type: "step", index: ix, d: 1 })}>+</button>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={submit} noValidate style={{ display: "grid", gap: "1rem" }}>
        <div>
          <div className="cp">
            <input className="cpin" value={f.code} onChange={on("code")} placeholder="Coupon code (agar hai)" autoCapitalize="characters" aria-label="Coupon code" />
            <button className="btn" type="button" onClick={applyCoupon}>Lagao</button>
          </div>
          <p className={"cpmsg" + (cp.ok ? " ok" : cp.bad ? " bad" : "")}>{cp.t}</p>
        </div>
        <div className="sum">
          <div><span>Juice</span><span>{rupee(tot.sub)}</span></div>
          {tot.disc > 0 && <div className="off"><span>Coupon {coupon.code}</span><span>−{rupee(tot.disc)}</span></div>}
          <div><span>Delivery</span><span>{tot.fee ? rupee(tot.fee) : "Free"}</span></div>
          <div className="tot"><span>Total</span><span>{rupee(tot.total)}</span></div>
        </div>

        <LocBox L={L} />

        <div className="two">
          {fld("name", "Aapka naam", <input id="f-name" autoComplete="name" value={f.name} onChange={on("name")} />)}
          {fld("phone", "Mobile number", <input id="f-phone" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={14} placeholder="10 digit" value={f.phone} onChange={on("phone")} />)}
        </div>
        <div className="two">
          {fld("place", "Delivery kahan?", <select value={f.place} onChange={on("place")}>{PLACES.map((p) => <option key={p}>{p}</option>)}</select>)}
          {fld("when", "Kab chahiye?", <select value={f.when} onChange={on("when")}>{SLOTS.map((p) => <option key={p}>{p}</option>)}</select>)}
        </div>
        <div className="two">
          {fld("area", L.place ? "Area (location se mila)" : "Area / mohalla", <input id="f-area" autoComplete="address-level3" value={f.area} onChange={on("area")} placeholder="Jaise: Shakti Nagar" />)}
          {fld("pin", "Pincode", <input id="f-pin" inputMode="numeric" autoComplete="postal-code" maxLength={6} value={f.pin} onChange={on("pin")} placeholder="6 digit" />)}
        </div>
        {fld("addr", "Ward, room, floor ya landmark", <textarea id="f-addr" rows="2" autoComplete="street-address" placeholder="Jaise: Ward 3, Bed 12, 2nd floor" value={f.addr} onChange={on("addr")} />)}
        <div className="two">
          {fld("pay", "Payment", <select value={f.pay} onChange={on("pay")}>{PAYS.map((p) => <option key={p}>{p}</option>)}</select>)}
          {fld("note", "Koi khaas baat?", <input value={f.note} onChange={on("note")} placeholder="bina cheeni, kam baraf…" />)}
        </div>
        {low && <p className="msg">Kam se kam order {rupee(C.delivery.minOrder)} ka hona chahiye.</p>}
        <p className="msg" role="alert">{msg}</p>
        <div className="sheet-foot">
          <button className="btn solid" type="submit" disabled={!!busy || low}>
            {busy ? <><span className="sp" /> {busy}</> : `Order bhejo · ${rupee(tot.total)}`}
          </button>
          <a className="btn" href={telHref}>Call karke order do</a>
        </div>
      </form>
    </>
  );
}

/* ---------- order ho gaya ---------- */
function DoneView({ order }) {
  const mins = C.delivery?.minutes ?? 20;
  const left = useCountdown(mins * 60, true);
  return (
    <div className="done">
      <div className="tick"><svg viewBox="0 0 48 48" fill="none" stroke="#0E3B2A" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 25l9 9 18-20" /></svg></div>
      <h3>Order mil gaya!</h3><span className="oid">#{order.id}</span>
      <p>Hum juice bana rahe hain. Ye time ghoomta rahega:</p>
      <div className="clock">{Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}</div>
      <div className="recap">
        {order.items.map((i) => <div key={i.name + i.ml}><span>{i.name} {i.ml} ml × {i.q}</span><b>{rupee(i.line)}</b></div>)}
        {order.discount > 0 && <div><span>Coupon {order.coupon}</span><b>−{rupee(order.discount)}</b></div>}
        <div><span>Total ({order.customer.pay})</span><b>{rupee(order.total)}</b></div>
      </div>
      <a className="btn" href={telHref}>Call karo</a>
      <button className="btn lime" type="button" onClick={shareSite}>Dost ko bhi bata do</button>
      <button className="btn" type="button" onClick={() => { closeSheet(); scrollToId("menu"); }}>Naya order</button>
    </div>
  );
}

function FailView({ order, onRetry }) {
  return (
    <div className="done">
      <div className="tick bad"><svg viewBox="0 0 48 48" fill="none" stroke="#B3123A" strokeWidth="5.5" strokeLinecap="round" aria-hidden="true"><path d="M14 14l20 20M34 14L14 34" /></svg></div>
      <h3>Order nahi ja paya</h3>
      <p>Net ya server mein dikkat aayi. Aapka cart safe hai. Dobara try karo ya seedha call karo.</p>
      <button className="btn solid" type="button" onClick={onRetry}>Dobara try karo</button>
      <a className="btn" href={telHref}>Call karke order do</a>
      {C.orders?.showWhatsAppBackup && <a className="btn wa" href={waLink(message(C, order))} target="_blank" rel="noopener noreferrer">WhatsApp se bhejo (backup)</a>}
    </div>
  );
}

function SheetBody() {
  const [view, setView] = useState({ name: "form" });
  return view.name === "done" ? <DoneView order={view.order} />
    : view.name === "fail" ? <FailView order={view.order} onRetry={() => setView({ name: "form" })} />
    : <FormView onDone={(order) => setView({ name: "done", order })} onFail={(order) => setView({ name: "fail", order })} />;
}

export default function OrderSheet() {
  const open = useStore(ui, (s) => s.sheet);
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} className="sheet" aria-labelledby="sheetH" onClose={closeSheet} onClick={(e) => e.target === e.currentTarget && closeSheet()}>
      <div className="sheet-in">
        <div className="sheet-head"><h2 id="sheetH">Aapka order</h2><button className="x" type="button" aria-label="Band karo" onClick={closeSheet}>×</button></div>
        <div className="sheet-body">{open && <SheetBody />}</div>
      </div>
    </dialog>
  );
}
