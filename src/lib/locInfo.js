import { bearing, compass, confidence, etaMinutes } from "./geoMath.js";
import C from "../../shared/config.js";
import { km } from "./utils.js";

const SRC = { gps: "GPS (satellite)", net: "Network / Wi-Fi", cache: "Pichhli baar ki location", ip: "Internet se andaaza" };

/** location state se customer ko dikhane layak saari jaankari ek jagah */
export function describe(L) {
  if (!L.fix) return null;
  const z = L.zone, hub = z?.zone;
  const dirText = hub ? compass(bearing(hub, L.fix)) : "";
  return {
    hub,
    inside: z ? z.inside : true,
    edge: !!z?.edge,
    distText: z ? km(z.dist) : "",
    dirText,
    etaMin: z ? etaMinutes(z.dist, C.eta) : null,
    conf: confidence(L.fix.acc),
    accText: Number.isFinite(L.fix.acc) ? `±${Math.round(L.fix.acc)} m` : "",
    srcText: SRC[L.fix.src] || SRC.gps
  };
}
