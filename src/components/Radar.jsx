import { mainZone } from "../lib/area.js";

export default function Radar({ L }) {
  const z = L.zone?.zone || mainZone;
  if (!z) return null;
  const R = 170, k = R / z.radiusKm;
  let you = null;
  if (L.fix) {
    const lat0 = (z.lat * Math.PI) / 180;
    let px = (L.fix.lng - z.lng) * Math.cos(lat0) * 111.32 * k, py = -(L.fix.lat - z.lat) * 110.57 * k;
    const d = Math.hypot(px, py), cap = R * 1.22;
    if (d > cap) { px *= cap / d; py *= cap / d; }
    const inside = L.zone?.inside, col = inside ? "#17703d" : "#B3123A", ar = Math.max(9, Math.min(60, ((L.fix.acc || 0) / 1000) * k));
    you = (
      <g className="you" style={{ transform: `translate(${px.toFixed(1)}px,${py.toFixed(1)}px)` }}>
        <circle r={ar} fill={col} fillOpacity=".18" /><circle r="9" fill={col} stroke="#fff" strokeWidth="3" /><text y="-17" textAnchor="middle">Aap</text>
      </g>
    );
  }
  const name = z.name.length > 26 ? z.name.slice(0, 24) + "…" : z.name;
  return (
    <svg viewBox="-215 -215 430 430" aria-hidden="true">
      <circle className="zone" r={R} /><circle className="ring" r={R / 2} /><circle className="pulse" r={R} />
      <text x="0" y={-R - 8} textAnchor="middle">{z.radiusKm} km</text><text x="0" y={-R / 2 - 6} textAnchor="middle">{+(z.radiusKm / 2).toFixed(1)} km</text>
      <circle r="17" fill="#0E3B2A" /><path d="M-8 0H8M0 -8V8" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      <text y="36" textAnchor="middle">{name}</text>{you}
    </svg>
  );
}

