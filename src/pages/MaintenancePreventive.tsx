// ─── Module Maintenance préventive ────────────────────────────────────────────
import { Wrench, AlertTriangle, CheckCircle2, CalendarClock } from "lucide-react";
import { C } from "@/theme";
import { maintenance } from "@/data/mock";
import { PageHeader, Btn, StatusPill, Th, Td } from "@/ui";

export default function MaintenancePreventive() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Maintenance préventive"
        subtitle="Échéancier des interventions, alertes proche échéance et historique."
        actions={<Btn>🔧 Planifier une maintenance</Btn>}
      />

      {/* Synthèse */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        {[
          { label: "Interventions urgentes", value: maintenance.filter((m) => m.status === "URGENT").length, icon: AlertTriangle, color: C.red },
          { label: "Échéances < 15 j", value: maintenance.filter((m) => m.days <= 15).length, icon: CalendarClock, color: C.orange },
          { label: "Flotte à jour", value: `${maintenance.filter((m) => m.status === "OK").length} / ${maintenance.length}`, icon: CheckCircle2, color: C.green },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border px-4 py-3 flex items-center gap-3" style={{ background: C.cardBg, borderColor: C.border }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.color + "22" }}>
              <s.icon className="h-5 w-5" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xl font-black leading-none" style={{ color: C.text }}>{s.value}</p>
              <p className="text-xs mt-1" style={{ color: C.textMuted }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border p-4" style={{ background: C.cardBg, borderColor: C.border }}>
        <span className="font-bold text-sm block mb-3" style={{ color: C.text }}>Échéancier des interventions</span>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                <Th>Véhicule</Th><Th>Intervention</Th><Th>Dernière</Th><Th>Prochaine</Th><Th>Jours restants</Th><Th>Kilométrage</Th><Th>Échéance</Th><Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {maintenance.map((m) => (
                <tr key={m.plate} style={{ borderBottom: `1px solid ${C.border + "55"}` }}>
                  <Td>
                    <span className="font-mono font-bold" style={{ color: C.text }}>{m.plate}</span>
                    <p className="text-[11px]" style={{ color: C.textMuted }}>{m.model}</p>
                  </Td>
                  <Td><span className="flex items-center gap-1.5"><Wrench className="h-3.5 w-3.5" style={{ color: C.primaryLight }} /><span style={{ color: C.textDim }}>{m.type}</span></span></Td>
                  <Td className="font-mono" style={{ color: C.textMuted }}>{m.last}</Td>
                  <Td className="font-mono" style={{ color: C.text }}>{m.next}</Td>
                  <Td>
                    <span className="font-bold" style={{ color: m.days <= 5 ? C.red : m.days <= 15 ? C.orange : C.green }}>{m.days} j</span>
                  </Td>
                  <Td className="font-mono" style={{ color: C.textMuted }}>{m.mileage.toLocaleString("fr-FR")} km</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full" style={{ background: C.navy }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.min(m.progress, 100)}%`, background: m.color }} />
                      </div>
                      <StatusPill color={m.color} label={m.status} />
                    </div>
                  </Td>
                  <Td><Btn variant="secondary">Confirmer</Btn></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}