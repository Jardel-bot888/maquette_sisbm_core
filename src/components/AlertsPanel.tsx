// ─── Panneaux latéraux du dashboard (alertes, incidents, rapports) ────────────
import { AlertTriangle, RadioTower, Map, BatteryCharging, KeyRound, Activity, CircleDashed } from "lucide-react";
import { C, alertLevelConfig } from "@/theme";
import { alerts, incidents, reports } from "@/data/mock";

const iconMap: Record<string, typeof AlertTriangle> = {
  AlertTriangle, RadioTower, Map, BatteryCharging, KeyRound, Activity, CircleDashed,
};

export default function AlertsPanel({ onNavigate }: { onNavigate: (label: string) => void }) {
  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      {/* Alerts */}
      <div className="rounded-xl border p-4" style={{ background: C.cardBg, borderColor: C.border }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm" style={{ color: C.text }}>Alertes récentes</span>
            <span className="text-xs rounded-full px-2 py-0.5 font-bold" style={{ background: C.red, color: "white" }}>{alerts.length}</span>
          </div>
          <button onClick={() => onNavigate("Centre d'alertes SMS")} className="text-xs font-semibold" style={{ color: C.primary }}>Voir tout</button>
        </div>
        <div className="space-y-2.5">
          {alerts.map((a, i) => {
            const lvl = alertLevelConfig[a.level as keyof typeof alertLevelConfig];
            const Icon = iconMap[a.icon] ?? AlertTriangle;
            return (
              <div key={i} className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl border" style={{ background: lvl.bg, borderColor: lvl.border + "44" }}>
                <span className="flex-shrink-0 mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-white/5">
                  <Icon className="h-3.5 w-3.5" style={{ color: C.text }} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-black rounded px-1.5 py-0.5" style={{ background: lvl.badge, color: "white", fontSize: 9 }}>{lvl.label}</span>
                    <span className="text-xs font-mono" style={{ color: C.primary }}>{a.plate}</span>
                  </div>
                  <p className="text-xs font-semibold truncate" style={{ color: C.text }}>{a.title}</p>
                  <p className="text-xs truncate" style={{ color: C.textMuted }}>{a.desc}</p>
                </div>
                <span className="text-xs flex-shrink-0 font-mono" style={{ color: C.textMuted }}>{a.time}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Incidents */}
      <div className="rounded-xl border p-4" style={{ background: C.cardBg, borderColor: C.border }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm" style={{ color: C.text }}>Incidents en cours</span>
            <span className="text-xs rounded-full px-2 py-0.5 font-bold" style={{ background: C.orange, color: "white" }}>{incidents.length}</span>
          </div>
          <button onClick={() => onNavigate("Gestion des incidents")} className="text-xs font-semibold" style={{ color: C.primary }}>Voir tout</button>
        </div>
        <div className="space-y-2.5">
          {incidents.map((inc, i) => {
            const Icon = iconMap[inc.icon] ?? Activity;
            return (
              <div key={i} className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl border" style={{ background: inc.color + "11", borderColor: inc.color + "33" }}>
                <span className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg bg-white/5">
                  <Icon className="h-3.5 w-3.5" style={{ color: C.text }} />
                </span>
                <div className="flex-1">
                  <p className="text-xs font-semibold" style={{ color: C.text }}>{inc.title}</p>
                  <p className="text-xs" style={{ color: C.textMuted }}>{inc.desc}</p>
                </div>
                <span className="text-xs font-mono" style={{ color: C.textMuted }}>{inc.time}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reports */}
      <div className="rounded-xl border p-4" style={{ background: C.cardBg, borderColor: C.border }}>
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-sm" style={{ color: C.text }}>Rapports populaires</span>
          <button onClick={() => onNavigate("Rapports & Exports")} className="text-xs font-semibold" style={{ color: C.primary }}>Voir tout</button>
        </div>
        <div className="space-y-2">
          {reports.map((r, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: r.type === "PDF" ? "#450A0A" : "#052E16" }}>
                <span className="text-xs font-bold" style={{ color: r.type === "PDF" ? C.red : C.green }}>{r.type === "PDF" ? "P" : "X"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: C.text }}>{r.name}</p>
                <p className="text-xs" style={{ color: C.textMuted }}>{r.type} – {r.size}</p>
              </div>
              <button className="text-xs px-2 py-1 rounded-lg font-medium flex-shrink-0 border" style={{ borderColor: C.border, color: C.textDim, background: C.navy }}>
                ⬇
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}