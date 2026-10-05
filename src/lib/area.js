import C from "../../shared/config.js";
import { km } from "./utils.js";

export const AREA = C.area || {};
export const zones = AREA.zones || [];
export const areaOn = AREA.enabled !== false && zones.length > 0;
export const mainZone = zones[0] || null;
export const areaName = mainZone ? mainZone.name : AREA.city || "hamare area";

/** location ki state se: "in" (area ke andar), "out" (bahar), "none" (abhi pata nahi) */
export const areaState = (L) => (!areaOn ? "na" : !L.fix ? "none" : L.zone?.inside ? "in" : "out");

export const outMessage = (L) => {
  const z = L.zone?.zone;
  return z ? `Aap ${km(L.zone.dist)} door ho. Abhi sirf ${z.name} ke ${z.radiusKm} km mein delivery hai.` : "Aap hamare delivery area ke bahar ho.";
};
