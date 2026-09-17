// ─── Module Zones géographiques (géofencing) ──────────────────────────────────
import { useState } from "react";
import { Map, Plus, ShieldCheck, AlertTriangle } from "lucide-react";
import { C, va } from "@/theme";import { zones } from "@/data/mock";
import { PageHeader, Btn, StatusPill, Toggle, Th, Td } from "@/ui";

export default function ZonesGeographiques({ onNavigate }: { onNavigate: (label: string) => void }) {
  const [list, setList] = useState(zones);
  const toggle = (id: string) => setList((l) => l.map((z) => (z.id === id ? { ...z, active: !z.active } : z)));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Zones géographiques"
        subtitle="Géofencing : zones autorisées et interdites, alertes de sortie."
        actions={<Btn onClick={() => onNavigate("Contrôle des vitesses")}><Plus className="h-3.5 w-3.5 inline-block mr-1" />Nouvelle zone</Btn>}
      />

      {/* Synthèse */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        {[
          { label: "Zones actives", value: list.filter((z) => z.active).length, icon: ShieldCheck, color: C.green },
          { label: "Zones interdites", value: list.filter((z) => z.type === "Interdite").length, icon: AlertTriangle, color: C.red },
          { label: "Alertes aujourd'hui", value: list.reduce((s, z) => s + z.alertsToday, 0), icon: Map, color: C.orange },
        ].map((s) => (
          <div key={s.label} className="group rounded-2xl border px-4 py-3 flex items-center gap-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-lift" style={{ background: C.cardBg, borderColor: C.borderSoft }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: va(s.color, "13%") }}>
              <s.icon className="h-5 w-5" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xl font-black font-mono tabular-nums leading-none" style={{ color: C.text }}>{s.value}</p>
              <p className="text-xs mt-1" style={{ color: C.textMuted }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Cartes zones */}
      <div className="grid gap-3 lg:grid-cols-3">
        {list.map((z) => (
          <div key={z.id} className="rounded-2xl border p-4 space-y-3" style={{ background: C.cardBg, borderColor: C.borderSoft }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg" style={{ background: va(z.color, "13%"), color: z.color }}>{z.id}</span>
                <span className="text-sm font-bold" style={{ color: C.text }}>{z.name}</span>
              </div>
              <Toggle on={z.active} onChange={() => toggle(z.id)} label={`Activer la zone ${z.name}`} />
            </div>
            <div className="rounded-xl border overflow-hidden" style={{ background: C.navy, borderColor: C.border, height: 110, position: "relative" }}>
              <svg viewBox="0 0 640 220" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
                <polygon points={z.poly} fill={va(z.color, "13%")} stroke={z.color} strokeWidth={2} strokeDasharray={z.active ? "0" : "6 4"} />
              </svg>
              <div className="absolute top-2 left-2 rounded-lg px-2 py-1" style={{ background: va(C.navyMid, "80%"), border: "1px solid " + C.border }}>
                <span className="text-[10px]" style={{ color: C.textMuted }}>{z.commune}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: C.textMuted }}>{z.type}</span>
              <span className="flex items-center gap-3">
                <span style={{ color: C.textMuted }}>{z.vehicles} véh.</span>
                {z.alertsToday > 0 ? <StatusPill color={C.orange} label={`${z.alertsToday} alertes`} /> : <StatusPill color={C.green} label="OK" />}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border p-4" style={{ background: C.cardBg, borderColor: C.borderSoft }}>
        <span className="font-bold text-sm block mb-3" style={{ color: C.text }}>Gestion détaillée</span>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                <Th>Zone</Th><Th>Commune</Th><Th>Type</Th><Th>Véhicules</Th><Th>Alertes/jour</Th><Th>Active</Th>
              </tr>
            </thead>
            <tbody>
              {list.map((z) => (
                <tr key={z.id} style={{ borderBottom: `1px solid ${va(C.border, "33%")}` }}>
                  <Td><span className="font-semibold" style={{ color: C.text }}>{z.name}</span></Td>
                  <Td style={{ color: C.textMuted }}>{z.commune}</Td>
                  <Td><StatusPill color={z.type === "Interdite" ? C.red : C.green} label={z.type} /></Td>
                  <Td style={{ color: C.textDim }}>{z.vehicles}</Td>
                  <Td style={{ color: z.alertsToday > 0 ? C.orange : C.textMuted }}>{z.alertsToday}</Td>
                  <Td><Toggle on={z.active} onChange={() => toggle(z.id)} label={`Activer la zone ${z.name}`} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}