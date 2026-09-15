// ─── Module Gestion des horaires ─────────────────────────────────────────────
import { Clock3, CalendarDays, AlertTriangle, CheckCircle2 } from "lucide-react";
import { C } from "@/theme";
import { schedules } from "@/data/mock";
import { PageHeader, Btn, StatusPill, Th, Td } from "@/ui";

export default function GestionHoraires() {
  const violations = schedules.filter((s) => s.color === C.red).length;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Gestion des horaires"
        subtitle="Plages de circulation autorisées par véhicule et détection des usages hors plage."
        actions={<Btn>➕ Planifier un véhicule</Btn>}
      />

      {/* Synthèse */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        {[
          { label: "Véhicules planifiés", value: schedules.length + " / 12", icon: CalendarDays, color: C.primary },
          { label: "Violations aujourd'hui", value: violations, icon: AlertTriangle, color: C.red },
          { label: "Plannings respectés", value: `${schedules.length - violations}`, icon: CheckCircle2, color: C.green },
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

      {/* Frise horaire exemple */}
      <div className="rounded-2xl border p-4" style={{ background: C.cardBg, borderColor: C.border }}>
        <span className="font-bold text-sm block mb-3" style={{ color: C.text }}>Fenêtre autorisée — AB 450 FC (Kouamé B.)</span>
        <div className="flex items-center gap-2">
          {Array.from({ length: 24 }).map((_, h) => {
            const allowed = h >= 6 && h < 22;
            const violation = h >= 6 && h < 7;
            return (
              <div key={h} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full h-8 rounded-md text-center leading-8 text-[9px]"
                  style={{ background: violation ? C.orange : allowed ? C.primary : C.navy, border: `1px solid ${allowed ? C.primaryLight : C.border}` }}
                />
                <span className="text-[9px]" style={{ color: C.textMuted }}>{h}h</span>
              </div>
            );
          })}
        </div>
        <p className="text-xs mt-3" style={{ color: C.textMuted }}>
          <span style={{ color: C.orange }}>■</span> Démarrage détecté à 06:41 (hors plage) · <span style={{ color: C.primary }}>■</span> plage autorisée 06:00 – 22:00 · <span style={{ color: C.textMuted }}>■</span> interdite
        </p>
      </div>

      {/* Table */}
      <div className="rounded-2xl border p-4" style={{ background: C.cardBg, borderColor: C.border }}>
        <span className="font-bold text-sm block mb-3" style={{ color: C.text }}>Plannings par véhicule</span>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                <Th>Véhicule</Th><Th>Conducteur</Th><Th>Fenêtre autorisée</Th><Th>Jours</Th><Th>Statut</Th><Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s.plate} style={{ borderBottom: `1px solid ${C.border + "55"}` }}>
                  <Td><span className="font-mono font-bold" style={{ color: C.text }}>{s.plate}</span></Td>
                  <Td style={{ color: C.textDim }}>{s.driver}</Td>
                  <Td><span className="font-mono" style={{ color: C.text }}>{s.window}</span></Td>
                  <Td style={{ color: C.textMuted }}>{s.days}</Td>
                  <Td><StatusPill color={s.color} label={s.status} /></Td>
                  <Td className="flex items-center gap-2">
                    <Btn variant="secondary">Modifier</Btn>
                    <Btn variant="danger">Suppr.</Btn>
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