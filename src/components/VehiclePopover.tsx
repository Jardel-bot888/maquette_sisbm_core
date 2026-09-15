// ─── Popover détail véhicule ──────────────────────────────────────────────────
import { C, statusConfig } from "@/theme";
import type { Vehicle } from "@/data/mock";

export default function VehiclePopover({ vehicle, onClose, onImmobilize }: {
  vehicle: Vehicle; onClose: () => void; onImmobilize: () => void;
}) {
  const sc = statusConfig[vehicle.status as keyof typeof statusConfig];
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div
        className="rounded-2xl border shadow-2xl p-5 w-80"
        style={{ background: C.navyMid, borderColor: C.navyLight }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg" style={{ color: C.text }}>{vehicle.plate}</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: sc.color + "22", color: sc.color, border: `1px solid ${sc.color}` }}>
                {sc.label}
              </span>
            </div>
            <p className="text-sm mt-0.5" style={{ color: C.textMuted }}>{vehicle.model} · {vehicle.driver}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: C.navy, color: C.textMuted }}>✕</button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: "Vitesse", value: `${vehicle.speed} km/h`, icon: "⚡", warn: vehicle.speed > 80 },
            { label: "Contact", value: vehicle.speed > 0 ? "Ignition ON" : "Ignition OFF", icon: "🔑", warn: false },
            { label: "Batterie", value: `${vehicle.battery}V`, icon: "🔋", warn: vehicle.battery < 11 },
            { label: "Signal GSM", value: `${vehicle.gsm}/4`, icon: "📶", warn: vehicle.gsm < 2 },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl p-3" style={{ background: C.navy, border: `1px solid ${stat.warn ? C.red + "44" : C.border}` }}>
              <div className="text-sm mb-0.5">{stat.icon}</div>
              <div className="text-xs" style={{ color: C.textMuted }}>{stat.label}</div>
              <div className="font-bold text-sm" style={{ color: stat.warn ? C.red : C.text }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Position */}
        <div className="rounded-xl px-3 py-2 mb-4 flex items-center gap-2" style={{ background: C.navy, border: `1px solid ${C.border}` }}>
          <span className="text-sm">📍</span>
          <div>
            <p className="text-xs" style={{ color: C.textMuted }}>Dernière position</p>
            <p className="text-sm font-semibold" style={{ color: C.text }}>{vehicle.pos}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onImmobilize}
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl font-semibold text-xs border transition-all hover:opacity-90"
            style={{ background: "#7F1D1D", color: "#FCA5A5", border: `1px solid ${C.red}44` }}
          >
            🔌 Couper moteur
          </button>
          <button className="flex items-center justify-center gap-1.5 py-2 rounded-xl font-semibold text-xs border" style={{ background: C.navy, color: C.textDim, border: `1px solid ${C.border}` }}>
            🎬 Rejouer trajet
          </button>
          <button className="flex items-center justify-center gap-1.5 py-2 rounded-xl font-semibold text-xs border" style={{ background: C.navy, color: C.textDim, border: `1px solid ${C.border}` }}>
            📋 Historique
          </button>
          <button className="flex items-center justify-center gap-1.5 py-2 rounded-xl font-semibold text-xs border" style={{ background: C.navy, color: C.textDim, border: `1px solid ${C.border}` }}>
            🔔 Créer alerte
          </button>
        </div>
      </div>
    </div>
  );
}