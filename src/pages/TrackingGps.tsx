// ─── Module Tracking GPS ──────────────────────────────────────────────────────
// Supervision temps réel : liste synchronisée avec la carte Leaflet (même flux
// `useGpsFeed`), fonds commutables, suivi véhicule, pause/reprise, rejeu, CSV.
import { useMemo, useRef, useState } from "react";
import type L from "leaflet";
import {
  CarFront, Satellite, History, Clock3, Pause, Play, Crosshair, Plus, Minus,
  Maximize2, LocateFixed, Download, RotateCcw, Navigation,
} from "lucide-react";
import { C, statusConfig, va } from "@/theme";
import type { Vehicle } from "@/data/mock";
import { PageHeader, Btn, BlinkDot, LiveClock, Tabs, Th, Td, StatusPill } from "@/ui";
import LiveMap, { type MapLayerName } from "@/components/LiveMap";
import { useGpsFeed, useAlertsFeed, formatFixAge, formatStopAge, type LiveVehicle } from "@/data/gpsFeed";
import { ABIDJAN_CENTER, ABIDJAN_ZOOM, formatCoords } from "@/data/geo";
import TripHistory from "@/pages/TripHistory";

const FILTERS = [
  { key: "all", label: "Tous" },
  { key: "moving", label: "En déplacement" },
  { key: "alert", label: "En alerte" },
  { key: "stopped", label: "À l'arrêt" },
  { key: "offline", label: "Hors ligne" },
] as const;

const LAYERS: { key: MapLayerName; label: string }[] = [
  { key: "standard", label: "🗺 Standard" },
  { key: "satellite", label: "🛰 Satellite" },
  { key: "dark", label: "🌙 Nuit" },
];

/** Exporte la trace GPS du véhicule sélectionné (positions réellement parcourues). */
function exportCsv(plate: string, trail: { lat: number; lng: number }[]) {
  const rows = ["latitude,longitude", ...trail.map((p) => `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`)];
  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `positions-${plate.replace(/\s+/g, "_")}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function TrackingGps({ onVehicleClick }: { onVehicleClick: (v: Vehicle) => void }) {
  const { vehicles: live, paused, pause, resume, replay } = useGpsFeed();
  const { alerts: liveAlerts, dismiss } = useAlertsFeed();
  const [tab, setTab] = useState<"live" | "history">("live");
  const [selectedPlate, setSelectedPlate] = useState<string | null>(live[0]?.plate ?? null);
  const [filter, setFilter] = useState<string>("all");
  const [layer, setLayer] = useState<MapLayerName>("standard");
  const [showGeofences, setShowGeofences] = useState(true);
  const [follow, setFollow] = useState(false);
  const [zoom, setZoom] = useState(ABIDJAN_ZOOM);
  const mapRef = useRef<L.Map | null>(null);

  const list = useMemo(
    () => (filter === "all" ? live : live.filter((v) => v.status === filter)),
    [live, filter],
  );
  const selected = live.find((v) => v.plate === selectedPlate) ?? null;
  // La carte affiche le filtre + le véhicule sélectionné (épinglé) : l'itinéraire
  // et le mode suivi restent disponibles même hors filtre.
  const mapVehicles = useMemo(
    () => (selected && !list.some((v) => v.plate === selected.plate) ? [...list, selected] : list),
    [list, selected],
  );
  const counts = useMemo(() => {
    const c: Record<string, number> = { moving: 0, alert: 0, stopped: 0, offline: 0 };
    live.forEach((v) => { c[v.status] = (c[v.status] ?? 0) + 1; });
    return c;
  }, [live]);

  const pick = (plate: string) => { setSelectedPlate(plate); setFollow(false); };
  const zoomBy = (d: number) => mapRef.current?.zoomIn(d > 0 ? 1 : -1, { animate: true });
  const recenter = () => { setFollow(false); mapRef.current?.flyTo(ABIDJAN_CENTER, ABIDJAN_ZOOM, { duration: 0.8 }); };
  const centerOnSelected = () => {
    if (!selected || !mapRef.current) return;
    setFollow(true);
    mapRef.current.flyTo([selected.lat, selected.lng], Math.max(mapRef.current.getZoom(), 14), { duration: 0.8 });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Tracking GPS en temps réel"
        subtitle="Positions traceur, itinéraires parcourus et télémétrie GNSS."
        actions={
          <span className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border"
              style={{
                background: paused ? va(C.orange, "13%") : va(C.green, "13%"),
                color: paused ? C.orange : C.green,
                borderColor: paused ? va(C.orange, "40%") : va(C.green, "40%"),
              }}
            >
              <BlinkDot color={paused ? C.orange : C.green} />
              {paused ? "FLUX EN PAUSE" : "LIVE · 1 s"}
            </span>
            <LiveClock compact />
          </span>
        }
      />

      <Tabs
        tabs={[
          { key: "live", label: "Temps réel" },
          { key: "history", label: "Historique & relecture" },
        ]}
        active={tab}
        onChange={setTab}
        label="Vues du module Tracking GPS"
      />

      {tab === "history" ? (
        <TripHistory onVehicleClick={onVehicleClick} />
      ) : (
        <>
      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Liste véhicules — même flux que la carte */}
        <div className="w-full lg:w-72 rounded-2xl border p-3 flex-shrink-0" style={{ background: C.cardBg, borderColor: C.borderSoft }}>
          <div className="px-1 pb-3 flex items-center justify-between gap-2">
            <span className="text-xs font-bold" style={{ color: C.text }}>Véhicules ({list.length})</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Filtrer les véhicules par statut"
              className="text-xs px-2 py-1 rounded-lg border outline-none"
              style={{ background: C.navy, borderColor: C.border, color: C.text }}
            >
              {FILTERS.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
            </select>
          </div>
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1" role="listbox" aria-label="Véhicules suivis">
            {list.map((v) => {
              const sc = statusConfig[v.status];
              const active = selectedPlate === v.plate;
              return (
                <button
                  key={v.plate}
                  type="button"
                  onClick={() => pick(v.plate)}
                  aria-pressed={active}
                  aria-label={`Sélectionner le véhicule ${v.plate}`}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all text-left"
                  style={{ background: active ? va(C.primary, "13%") : C.navy, borderColor: active ? C.primary : C.border }}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: sc.color }} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold font-mono" style={{ color: C.text }}>{v.plate}</span>
                    <span className="block text-[10px] truncate" style={{ color: C.textMuted }}>{v.model} · {v.pos}</span>
                    {formatStopAge(v.stopSince) && (
                      <span className="block text-[10px] font-semibold truncate" style={{ color: C.orange }}>{formatStopAge(v.stopSince)}</span>
                    )}
                  </span>
                  <span className="text-[11px] font-mono font-bold flex-shrink-0 tabular-nums" style={{ color: v.speed > 0 ? C.green : C.textMuted }}>
                    {v.speed} km/h
                  </span>
                </button>
              );
            })}
            {list.length === 0 && (
              <p className="text-xs px-2 py-6 text-center" style={{ color: C.textMuted }}>Aucun véhicule dans ce statut.</p>
            )}
          </div>
          <div className="mt-3 pt-3 space-y-1.5" style={{ borderTop: `1px solid ${C.border}` }}>
            {Object.entries(statusConfig).map(([k, s]) => (
              <div key={k} className="flex items-center gap-2 text-xs px-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                <span style={{ color: C.textDim }}>{s.label}</span>
                <span className="ml-auto font-bold font-mono tabular-nums" style={{ color: C.text }}>{counts[k] ?? 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Carte Leaflet temps réel + barre d'outils */}
        <div className="flex-1 min-w-0 flex flex-col rounded-2xl border overflow-hidden transition-all duration-200 hover:shadow-lift" style={{ background: C.cardBg, borderColor: C.borderSoft }}>
          <div className="flex items-center gap-2 flex-wrap px-3 py-2 border-b" style={{ borderColor: C.border }}>
            <select
              value={layer}
              onChange={(e) => setLayer(e.target.value as MapLayerName)}
              aria-label="Fond de carte"
              className="text-xs px-2.5 py-1.5 rounded-lg border outline-none"
              style={{ background: C.navy, borderColor: C.border, color: C.text }}
            >
              {LAYERS.map((l) => <option key={l.key} value={l.key}>{l.label}</option>)}
            </select>
            <button
              type="button"
              onClick={() => setShowGeofences((s) => !s)}
              aria-pressed={showGeofences}
              className="text-xs px-2.5 py-1.5 rounded-lg border font-semibold"
              style={{ background: showGeofences ? va(C.primary, "13%") : C.navy, borderColor: showGeofences ? C.primary : C.border, color: showGeofences ? C.primaryLight : C.textMuted }}
            >
              ⬢ Zones {showGeofences ? "ON" : "OFF"}
            </button>
            <button
              type="button"
              onClick={() => setFollow((f) => !f)}
              aria-pressed={follow}
              disabled={!selected}
              title={selected ? `Suivre ${selected.plate}` : "Sélectionnez un véhicule"}
              className="text-xs px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 disabled:opacity-40"
              style={{ background: follow ? va(C.primary, "13%") : C.navy, borderColor: follow ? C.primary : C.border, color: follow ? C.primaryLight : C.textMuted }}
            >
              <LocateFixed className="h-3.5 w-3.5" /> Suivre
            </button>
            <button
              type="button"
              onClick={paused ? resume : pause}
              aria-pressed={paused}
              title={paused ? "Reprendre le flux GPS" : "Suspendre le flux GPS"}
              className="text-xs px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5"
              style={{ background: C.navy, borderColor: C.border, color: paused ? C.orange : C.textMuted }}
            >
              {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              {paused ? "Reprendre" : "Pause"}
            </button>
            <span className="text-[11px] font-mono tabular-nums ml-auto" style={{ color: C.textMuted }}>
              zoom {zoom} · {formatCoords(selected ? { lat: selected.lat, lng: selected.lng } : ABIDJAN_CENTER)}
            </span>
            <div className="flex items-center overflow-hidden rounded-lg border" style={{ borderColor: C.border }} role="toolbar" aria-label="Contrôles de zoom de la carte">
              <button type="button" aria-label="Zoom avant" onClick={() => zoomBy(1)} className="w-8 h-7 flex items-center justify-center border-r" style={{ borderColor: C.border, color: C.text, background: C.navy }}><Plus className="h-3.5 w-3.5" /></button>
              <button type="button" aria-label="Zoom arrière" onClick={() => zoomBy(-1)} className="w-8 h-7 flex items-center justify-center" style={{ color: C.text, background: C.navy }}><Minus className="h-3.5 w-3.5" /></button>
            </div>
            <button type="button" aria-label="Recentrer sur Abidjan" title="Recentrer sur Abidjan" onClick={recenter} className="w-8 h-7 rounded-lg border flex items-center justify-center" style={{ background: C.navy, borderColor: C.border, color: C.textMuted }}><Maximize2 className="h-3.5 w-3.5" /></button>
            <button type="button" aria-label="Centrer sur le véhicule sélectionné" title="Centrer sur le véhicule sélectionné" onClick={centerOnSelected} disabled={!selected} className="w-8 h-7 rounded-lg border flex items-center justify-center disabled:opacity-40" style={{ background: C.navy, borderColor: C.border, color: C.textMuted }}><Crosshair className="h-3.5 w-3.5" /></button>
          </div>

          <div className="relative" style={{ height: 460 }}>
            <LiveMap
              vehicles={mapVehicles}
              selectedPlate={selectedPlate}
              layer={layer}
              showGeofences={showGeofences}
              follow={follow}
              mapRef={mapRef}
              onZoomChange={setZoom}
              onUserInteract={() => setFollow(false)}
              onSelect={(v) => pick(v.plate)}
              onOpenDossier={(v) => { setSelectedPlate(v.plate); onVehicleClick(v); }}
            />
            {selected && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[600] rounded-xl border px-3 py-2 text-xs flex items-center gap-2 whitespace-nowrap" style={{ background: va(C.navyMid, "93%"), borderColor: C.primaryLight }}>
                <Navigation className="h-3.5 w-3.5" style={{ color: C.primaryLight }} />
                <span className="font-semibold font-mono" style={{ color: C.text }}>{selected.plate}</span>
                <span style={{ color: C.textMuted }}>· {selected.speed} km/h · cap {selected.bearing}° · {formatFixAge(selected.lastFix)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fiche synthèse véhicule sélectionné */}
      {selected && (
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}>
          {[
            { icon: CarFront, label: "Véhicule", value: `${selected.plate} · ${selected.model}` },
            { icon: Satellite, label: "Traceur", value: `${selected.tracker.model} · ${selected.satellites} sat · HDOP ${selected.hdop}` },
            { icon: History, label: "Kilométrage", value: (selected.mileage ?? 0).toLocaleString("fr-FR") + " km" },
            { icon: Clock3, label: "Dernière position", value: `${selected.pos} · ${formatFixAge(selected.lastFix)}` },
          ].map((s, i) => (
            <div key={i} className="group rounded-2xl border px-4 py-3 flex items-center gap-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-lift" style={{ background: C.cardBg, borderColor: C.borderSoft }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: C.navy }}>
                <s.icon className="h-4 w-4" style={{ color: C.primaryLight }} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px]" style={{ color: C.textMuted }}>{s.label}</p>
                <p className="text-xs font-bold truncate" style={{ color: C.text }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alertes levées par le flux lui-même (survitesse, brouillage GNSS).
          Rien de statique : c'est le heartbeat qui les produit, point par point. */}
      <div className="rounded-2xl border p-4" style={{ background: C.cardBg, borderColor: C.borderSoft }}>
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-sm" style={{ color: C.text }}>Alertes détectées sur le flux</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: va(liveAlerts.length ? C.red : C.green, "13%"), color: liveAlerts.length ? C.red : C.green }}>
            {liveAlerts.length ? `${liveAlerts.length} active(s)` : "aucune"}
          </span>
        </div>
        {liveAlerts.length === 0 ? (
          <p className="text-xs" style={{ color: C.textMuted }}>
            Aucun dépassement (seuil 80 km/h) ni perte de signal GNSS détectée depuis l'ouverture de l'écran.
          </p>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {liveAlerts.slice().reverse().map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-3 py-2 rounded-xl border" style={{ background: C.navy, borderColor: va(a.level === "critical" ? C.red : C.orange, "40%") }}>
                <BlinkDot color={a.level === "critical" ? C.red : C.orange} />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold" style={{ color: C.text }}>{a.title}</span>
                  <span className="block text-[10px] truncate" style={{ color: C.textMuted }}>{a.detail} · {formatFixAge(a.t)}</span>
                </span>
                <button type="button" onClick={() => pick(a.plate)} className="text-[11px] px-2 py-1 rounded-lg border" style={{ background: C.navyMid, borderColor: C.border, color: C.textMuted }}>Voir</button>
                <button type="button" onClick={() => dismiss(a.id)} aria-label={`Acquitter l'alerte ${a.id}`} className="w-6 h-6 rounded-lg border flex items-center justify-center" style={{ background: C.navyMid, borderColor: C.border, color: C.textMuted }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Btn variant="primary" onClick={() => selected && onVehicleClick(selected)}>📋 Fiche véhicule</Btn>
        <Btn variant="secondary" onClick={() => selected && replay(selected.plate)}><RotateCcw className="h-3.5 w-3.5" /> Rejouer le trajet</Btn>
        <Btn variant="secondary" onClick={() => selected && exportCsv(selected.plate, selected.trail)}><Download className="h-3.5 w-3.5" /> Exporter positions (CSV)</Btn>
      </div>
        </>
      )}
    </div>
  );
}