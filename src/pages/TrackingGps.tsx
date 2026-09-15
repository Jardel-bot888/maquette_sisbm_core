// ─── Module Tracking GPS ──────────────────────────────────────────────────────
import { useState } from "react";
import { CarFront, Satellite, History, Clock3 } from "lucide-react";
import { C, statusConfig } from "@/theme";
import { vehicles, allVehicles, type Vehicle } from "@/data/mock";
import { PageHeader, Btn, StatusPill, LiveClock, BlinkDot } from "@/ui";
import AbidjanMap from "@/components/AbidjanMap";

export default function TrackingGps({ onVehicleClick }: { onVehicleClick: (v: Vehicle) => void }) {
  const [selected, setSelected] = useState<Vehicle | null>(vehicles[0]);
  const [filter, setFilter] = useState("all");
  const list = filter === "all" ? allVehicles : allVehicles.filter((v) => v.status === filter);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Tracking GPS en temps réel"
        subtitle="Position des véhicules, tracés d'itinéraire et historique."
        actions={<span className="flex items-center gap-2"><BlinkDot color={C.green} /><LiveClock compact /></span>}
      />

      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Liste véhicules */}
        <div className="w-full lg:w-72 rounded-2xl border p-3 flex-shrink-0" style={{ background: C.cardBg, borderColor: C.border }}>
          <div className="px-1 pb-3 flex items-center justify-between">
            <span className="text-xs font-bold" style={{ color: C.text }}>Véhicules ({list.length})</span>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="text-xs px-2 py-1 rounded-lg border outline-none" style={{ background: C.navy, borderColor: C.border, color: C.text }}>
              <option value="all">Tous</option>
              <option value="moving">En déplacement</option>
              <option value="alert">En alerte</option>
              <option value="stopped">À l'arrêt</option>
              <option value="offline">Hors ligne</option>
            </select>
          </div>
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {list.map((v) => {
              const sc = statusConfig[v.status as keyof typeof statusConfig];
              const active = selected?.plate === v.plate;
              return (
                <button
                  key={v.plate}
                  type="button"
                  onClick={() => setSelected(v)}
                  aria-pressed={active}
                  aria-label={`Sélectionner le véhicule ${v.plate}`}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all text-left"
                  style={{ background: active ? C.primary + "22" : C.navy, borderColor: active ? C.primary : C.border }}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: sc.color }} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold font-mono" style={{ color: C.text }}>{v.plate}</span>
                    <span className="block text-[10px] truncate" style={{ color: C.textMuted }}>{v.model} · {v.pos}</span>
                  </span>
                  <span className="text-[11px] font-mono font-bold flex-shrink-0" style={{ color: v.speed > 0 ? C.green : C.textMuted }}>{v.speed} km/h</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Carte */}
        <div className="flex-1 min-w-0 flex flex-col rounded-xl border overflow-hidden" style={{ background: C.cardBg, borderColor: C.border }}>
          <AbidjanMap onVehicleClick={(v) => { setSelected(v); onVehicleClick(v); }} selectedVehicle={selected} height={460} />
        </div>
      </div>

      {/* Fiche synthèse véhicule sélectionné */}
      {selected && (
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}>
          {[
            { icon: CarFront, label: "Véhicule", value: `${selected.plate} · ${selected.model}` },
            { icon: Satellite, label: "Traceur", value: "Micodus MV730 · gsm " + selected.gsm + "/4" },
            { icon: History, label: "Kilométrage", value: (selected.mileage ?? 0).toLocaleString("fr-FR") + " km" },
            { icon: Clock3, label: "Dernière position", value: `${selected.pos} · il y a <1 min` },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl border px-4 py-3 flex items-center gap-3" style={{ background: C.cardBg, borderColor: C.border }}>
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

      <div className="flex flex-wrap gap-2">
        <Btn variant="primary" onClick={() => onVehicleClick(selected!)}>📋 Fiche véhicule</Btn>
        <Btn variant="secondary">🎬 Rejouer le trajet</Btn>
        <Btn variant="secondary">⬇ Exporter positions (CSV)</Btn>
      </div>
    </div>
  );
}