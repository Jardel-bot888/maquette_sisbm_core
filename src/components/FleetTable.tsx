// ─── Tableau « Flux des véhicules » (dernières 24h) ───────────────────────────
import { useState } from "react";
import { C, statusConfig } from "@/theme";
import { vehicles, type Vehicle } from "@/data/mock";

type Props = {
  onImmobilize: (v: Vehicle) => void;
  onSelect: (v: Vehicle) => void;
  onNavigate: (label: string) => void;
};

const FILTERS = [
  { key: "all", label: "Tous" },
  { key: "moving", label: "En déplacement" },
  { key: "stopped", label: "À l'arrêt" },
  { key: "alert", label: "En alerte" },
];

export default function FleetTable({ onImmobilize, onSelect, onNavigate }: Props) {
  const [filter, setFilter] = useState("all");
  const rows = filter === "all" ? vehicles : vehicles.filter((v) => v.status === filter);

  return (
    <div className="rounded-2xl border p-4" style={{ background: "#16273d", borderColor: "#24364f" }}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-[16px]" style={{ color: C.text }}>Flux des véhicules en direct</span>
          <span className="text-xs" style={{ color: C.textMuted }}>(dernières 24h)</span>
        </div>
        <div className="flex items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all"
              style={{
                background: filter === f.key ? "#1f2d3d" : "transparent",
                color: filter === f.key ? C.text : C.textMuted,
                border: `1px solid ${filter === f.key ? "#3a4c63" : C.border}`,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Véhicule", "Conducteur", "Dernière position", "Statut", "Vitesse", "Batterie", "Actions"].map((h) => (
                <th key={h} className="text-left pb-2.5 pr-3 font-semibold" style={{ color: C.textMuted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((v, i) => {
              const sc = statusConfig[v.status as keyof typeof statusConfig];
              return (
                <tr
                  key={i}
                  className="cursor-pointer transition-colors hover:bg-white/5"
                  style={{ borderBottom: `1px solid ${C.border + "55"}` }}
                  onClick={() => onSelect(v)}
                >
                  <td className="py-3 pr-3 align-middle">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: sc.color }} />
                      <div>
                        <span className="font-mono font-bold" style={{ color: C.text }}>{v.plate}</span>
                        <p className="text-xs" style={{ color: C.textMuted }}>{v.model}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3 align-middle" style={{ color: C.textDim }}>{v.driver}</td>
                  <td className="py-3 pr-3 align-middle" style={{ color: C.textMuted }}>{v.pos}</td>
                  <td className="py-3 pr-3 align-middle">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] font-semibold leading-none" style={{ background: sc.color + "22", color: sc.color, border: `1px solid ${sc.color}44` }}>
                      {sc.label}
                    </span>
                  </td>
                  <td className="py-3 pr-3 align-middle">
                    <span className="inline-flex items-center leading-none font-mono font-bold" style={{ color: v.speed > 80 ? C.red : v.speed > 0 ? C.green : C.textMuted }}>
                      {v.speed} km/h
                    </span>
                  </td>
                  <td className="py-3 pr-3 align-middle">
                    <span className="font-mono" style={{ color: v.battery < 11 ? C.red : v.battery < 12 ? C.orange : C.green }}>
                      {v.battery > 0 ? `${v.battery}V` : "N/A"}
                    </span>
                  </td>
                  <td className="py-3 align-middle">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); onImmobilize(v); }}
                        className="px-2 py-1 rounded-lg text-xs font-semibold border leading-none"
                        style={{ background: "#7F1D1D", color: "#FCA5A5", borderColor: C.red + "44" }}
                      >
                        🔌 Couper
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onSelect(v); }}
                        className="px-2 py-1 rounded-lg text-xs border leading-none"
                        style={{ background: C.navy, color: C.textMuted, borderColor: C.border }}
                      >
                        📋
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button onClick={() => onNavigate("Tracking GPS")} className="mt-4 text-xs font-semibold flex items-center gap-1" style={{ color: C.primary }}>
        Voir tous les véhicules →
      </button>
    </div>
  );
}