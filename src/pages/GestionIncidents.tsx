// ─── Module Gestion des incidents ─────────────────────────────────────────────
import { useState } from "react";
import { TriangleAlert, ShieldCheck, ClipboardList, ArrowRight } from "lucide-react";
import { C, va } from "@/theme";import { allIncidents } from "@/data/mock";
import { PageHeader, Btn, StatusPill, Th, Td, CountBadge } from "@/ui";

export default function GestionIncidents() {
  const [list, setList] = useState(allIncidents);
  const open = list.filter((i) => i.status === "En cours").length;

  const closeIncident = (id: string) =>
    setList((l) => l.map((i) => (i.id === id ? { ...i, status: "Clôturé", color: C.green } : i)));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Gestion des incidents"
        subtitle="Détection automatique (choc, freinage, vibration) et workflow de traitement."
        actions={<Btn>📋 Procédures SOC</Btn>}
      />

      {/* Synthèse */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        {[
          { label: "Incidents en cours", value: open, icon: TriangleAlert, color: C.red },
          { label: "Clôturés (30j)", value: list.filter((i) => i.status === "Clôturé").length, icon: ShieldCheck, color: C.green },
          { label: "Audit SISBM", value: list.filter((i) => i.status === "Audit SISBM").length, icon: ClipboardList, color: C.primary },
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

      {/* Workflow */}
      <div className="rounded-2xl border p-4" style={{ background: C.cardBg, borderColor: C.borderSoft }}>
        <span className="font-bold text-sm block mb-3" style={{ color: C.text }}>Circuit de traitement</span>
        <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
          {["1. Détection automatique", "2. Qualification SOC", "3. Notification client", "4. Clôture & rapport"].map((s, i) => (
            <div key={s} className="flex items-center gap-2 rounded-xl px-3 py-2 border" style={{ background: C.navy, borderColor: C.border }}>
              <CountBadge n={i + 1} color={C.primary} />
              <span className="text-xs" style={{ color: C.textDim }}>{s}</span>
              {i < 3 && <ArrowRight className="h-3 w-3 ml-auto" style={{ color: C.textMuted }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border p-4" style={{ background: C.cardBg, borderColor: C.borderSoft }}>
        <span className="font-bold text-sm block mb-3" style={{ color: C.text }}>Registre des incidents</span>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                <Th>Réf.</Th><Th>Type d'incident</Th><Th>Véhicule</Th><Th>Zone</Th><Th>Horodatage</Th><Th>Statut</Th><Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {list.map((inc) => (
                <tr key={inc.id} style={{ borderBottom: `1px solid ${va(C.border, "33%")}` }}>
                  <Td><span className="font-mono text-[10px]" style={{ color: C.textMuted }}>{inc.id}</span></Td>
                  <Td><span className="font-semibold" style={{ color: C.text }}>{inc.type}</span></Td>
                  <Td><span className="font-mono font-bold" style={{ color: C.primary }}>{inc.vehicle}</span></Td>
                  <Td style={{ color: C.textMuted }}>{inc.zone}</Td>
                  <Td className="font-mono" style={{ color: C.textMuted }}>{inc.time}</Td>
                  <Td><StatusPill color={inc.color} label={inc.status} /></Td>
                  <Td className="flex items-center gap-2">
                    <Btn variant="secondary" onClick={() => closeIncident(inc.id)}>Clôturer</Btn>
                    <Btn variant="danger" onClick={() => closeIncident(inc.id)}>Assigner</Btn>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}