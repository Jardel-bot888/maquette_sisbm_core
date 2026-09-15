// ─── Carte de supervision Abidjan enrichie ───────────────────────────────────
// Iframe Google Maps (sans clé API) + marqueurs par statut animés, filtre,
// légende avec compteurs, tracé d'itinéraire (SVG simulé), zoom, couches, échelle.

import { useMemo, useState } from "react";
import { CarFront, Minus, Plus, Maximize2 } from "lucide-react";
import { C, statusConfig } from "@/theme";
import { vehicles, routes, type Vehicle } from "@/data/mock";

const MAP_W = 650;
const MAP_H = 420;

type Props = {
  onVehicleClick: (v: Vehicle) => void;
  selectedVehicle?: Vehicle | null;
  /** Hauteur de la carte : nombre en px, ou "100%" (défaut) pour remplir son conteneur parent. */
  height?: number | string;
};

export default function AbidjanMap({ onVehicleClick, selectedVehicle, height = "100%" }: Props) {
  const [filterStatus, setFilterStatus] = useState("all");
  const [zoom, setZoom] = useState(1);
  const [layer, setLayer] = useState<"standard" | "satellite" | "dark">("standard");

  const filtered = filterStatus === "all" ? vehicles : vehicles.filter((v) => v.status === filterStatus);
  const routePoints = useMemo(() => (selectedVehicle ? routes[selectedVehicle.plate] ?? null : null), [selectedVehicle]);
  const layerStyle = layer === "satellite" ? { filter: "saturate(1.35) contrast(1.08) brightness(0.95)" } : layer === "dark" ? { filter: "brightness(0.5) contrast(1.15)" } : {};
  const routeSvgPoints = routePoints ? routePoints.map((p) => `${p.x},${p.y}`).join(" ") : null;

  return (
    <div className="relative w-full overflow-hidden rounded-xl border min-h-[320px]" style={{ background: C.navyMid, borderColor: C.border, height }}>
      <iframe
        title="Google Maps Abidjan"
        src="https://www.google.com/maps?q=Abidjan%2C%20C%C3%B4te%20d'Ivoire&z=11&output=embed"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute inset-0 h-full w-full border-0 transition-all duration-300"
        style={layerStyle}
      />
      <div className="absolute inset-0 bg-slate-950/10" />
      {layer === "dark" && <div className="absolute inset-0" style={{ background: "#071B2D66" }} />}

      {/* Overlay mappé sur le référentiel 650×420 */}
      <div className="absolute inset-0 z-10 transition-transform duration-300" style={{ transform: `scale(${zoom})`, transformOrigin: "50% 50%" }}>
        {/* Tracé d'itinéraire du véhicule sélectionné */}
        {selectedVehicle && routeSvgPoints && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${MAP_W} ${MAP_H}`} preserveAspectRatio="none">
            <polyline
              points={routeSvgPoints}
              fill="none"
              stroke={C.primaryLight}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="8 6"
              opacity={0.9}
              style={{ animation: "routeDash 1.2s linear infinite" }}
            />
            <circle r="5" fill={C.primaryLight} stroke="white" strokeWidth={1.5}>
              <animateMotion dur="5s" repeatCount="indefinite" path={`M${routeSvgPoints.split(",").join(" ")}`} />
            </circle>
          </svg>
        )}

        {/* Marqueurs véhicules */}
        {filtered.map((v) => {
          const sc = statusConfig[v.status as keyof typeof statusConfig];
          const left = `${(v.x / MAP_W) * 100}%`;
          const top = `${(v.y / MAP_H) * 100}%`;
          const isMoving = v.status === "moving" || v.status === "alert";
          const animationStyle = isMoving ? { animation: "vehicleTravel 2.2s ease-in-out infinite alternate", transformOrigin: "center" } : {};
          const isSelected = selectedVehicle?.plate === v.plate;

          return (
            <div key={v.plate} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left, top }}>
              {isMoving && (
                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: 44, height: 24 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        left: `${8 + i * 7}px`,
                        top: `${12 + (i % 2 === 0 ? 2 : -2)}px`,
                        width: i === 4 ? 5 : 4,
                        height: i === 4 ? 5 : 4,
                        background: i === 4 ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.35)",
                        opacity: 0.2 + i * 0.16,
                        animation: `vehicleTrail 1.5s ease-in-out ${i * 0.12}s infinite`,
                        transform: "translateX(-12px)",
                      }}
                    />
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => onVehicleClick(v)}
                className="relative flex items-center gap-2 rounded-full border shadow-lg"
                style={{
                  background: "#0F172A",
                  borderColor: isSelected ? C.primaryLight : "rgba(255,255,255,0.7)",
                  boxShadow: isSelected ? `0 0 0 4px ${C.primary}66` : "0 0 0 3px rgba(15, 23, 42, 0.25)",
                  padding: "5px 9px 5px 6px",
                  ...animationStyle,
                }}
                title={`${v.plate} · ${v.pos}`}
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border" style={{ background: sc.color, borderColor: "rgba(255,255,255,0.5)" }}>
                  <CarFront className="h-3.5 w-3.5 text-white" />
                </span>
                <span className="text-[9px] font-bold text-white tracking-wide whitespace-nowrap">{v.plate}</span>
              </button>
            </div>
          );
        })}
      </div>
{/* Outils carte : zoom, couches, plein écran */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-lg border outline-none"
          style={{ background: C.navyMid, borderColor: C.border, color: C.text }}
        >
          <option value="all">Toutes les catégories</option>
          <option value="moving">En déplacement</option>
          <option value="alert">En alerte</option>
          <option value="stopped">À l'arrêt</option>
          <option value="offline">Hors ligne</option>
        </select>

        <select
          value={layer}
          onChange={(e) => setLayer(e.target.value as typeof layer)}
          className="text-xs px-3 py-1.5 rounded-lg border outline-none"
          style={{ background: C.navyMid, borderColor: C.border, color: C.text }}
        >
          <option value="standard">🛰 Standard</option>
          <option value="satellite">🛑 Satellite</option>
          <option value="dark">🌙 Nuit</option>
        </select>

        <div className="flex flex-col overflow-hidden rounded-lg border" style={{ background: C.navyMid, borderColor: C.border }}>
          <button onClick={() => setZoom((z) => Math.min(z + 0.2, 1.6))} className="w-8 h-7 flex items-center justify-center border-b" style={{ borderColor: C.border, color: C.text }}><Plus className="h-3.5 w-3.5" /></button>
          <button onClick={() => setZoom((z) => Math.max(z - 0.2, 0.7))} className="w-8 h-7 flex items-center justify-center" style={{ color: C.text }}><Minus className="h-3.5 w-3.5" /></button>
        </div>

        <button className="w-8 h-7 rounded-lg border flex items-center justify-center" style={{ background: C.navyMid, borderColor: C.border, color: C.textMuted }}><Maximize2 className="h-3.5 w-3.5" /></button>
      </div>

      {/* Légende statuts avec compteurs */}
      <div className="absolute bottom-3 right-3 z-20 rounded-xl border shadow-lg px-3 py-2 text-xs space-y-1.5" style={{ background: C.navyMid + "ee", borderColor: C.border }}>
        {Object.entries(statusConfig).map(([k, v]) => (
          <div key={k} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: v.color }} />
            <span style={{ color: C.textDim }}>{v.label}</span>
            <span className="ml-auto font-bold" style={{ color: C.text }}>{vehicles.filter((veh) => veh.status === k).length}</span>
          </div>
        ))}
      </div>

      {/* Échelle cartographique */}
      <div className="absolute bottom-3 left-3 z-20">
        <div className="rounded-lg border px-2.5 py-1.5" style={{ background: C.navyMid + "ee", borderColor: C.border }}>
          <div className="w-10 h-1.5 border-y border-l" style={{ borderColor: C.textMuted }} />
          <span className="text-[10px]" style={{ color: C.textMuted }}>2 km</span>
        </div>
      </div>

      {/* Infobulle véhicule sélectionné */}
      {selectedVehicle && routePoints && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 rounded-xl border px-3 py-2 text-xs flex items-center gap-2" style={{ background: C.navyMid + "ee", borderColor: C.primaryLight }}>
          <span>🛣</span>
          <span className="font-semibold" style={{ color: C.text }}>{selectedVehicle.plate}</span>
          <span style={{ color: C.textMuted }}>— itinéraire simulé · {routePoints.length} points</span>
        </div>
      )}
    </div>
  );
}