// ─── Module Conducteurs ───────────────────────────────────────────────────────
import { Users, Award, IdCard, AlertTriangle } from "lucide-react";
import { C } from "@/theme";
import { drivers } from "@/data/mock";
import { PageHeader, Btn, StatusPill, Th, Td, Initial } from "@/ui";

export default function Conducteurs() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Conducteurs"
        subtitle="Profils, permis de conduire, notation et affectation aux véhicules."
        actions={<Btn>➕ Ajouter un conducteur</Btn>}
      />

      {/* Synthèse */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        {[
          { label: "Conducteurs actifs", value: `${drivers.filter((d) => d.status === "En service").length} / ${drivers.length}`, icon: Users, color: C.primary },
          { label: "Note moyenne", value: "4,4 / 5", icon: Award, color: C.orange },
          { label: "Permis à surveiller", value: "2", icon: IdCard, color: C.green },
          { label: "Risque élevé", value: drivers.filter((d) => d.rating < 4).length + " conducteur(s)", icon: AlertTriangle, color: C.red },
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
        <span className="font-bold text-sm block mb-3" style={{ color: C.text }}>Registre des conducteurs</span>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                <Th>Conducteur</Th><Th>Téléphone</Th><Th>Permis</Th><Th>Statut</Th><Th>Note</Th><Th>Incidents</Th><Th>Véhicule</Th><Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => {
                const initials = d.name.split(" ").map((n) => n[0]).slice(0, 2).join("");
                const licenseOk = !d.license.includes("Suspendu") && !d.license.includes("Expire");
                return (
                  <tr key={d.id} style={{ borderBottom: `1px solid ${C.border + "55"}` }}>
                    <Td>
                      <div className="flex items-center gap-2.5">
                        <Initial text={initials} color={d.rating < 4 ? C.red : C.primary} size={8} />
                        <div>
                          <span className="font-semibold" style={{ color: C.text }}>{d.name}</span>
                          <p className="text-[10px] font-mono" style={{ color: C.textMuted }}>{d.id}</p>
                        </div>
                      </div>
                    </Td>
                    <Td className="font-mono" style={{ color: C.textMuted }}>{d.phone}</Td>
                    <Td>
                      <StatusPill color={licenseOk ? C.green : C.red} label={licenseOk ? "Valide" : d.license} />
                    </Td>
                    <Td><StatusPill color={d.color} label={d.status} /></Td>
                    <Td>
                      <span className="font-bold" style={{ color: d.rating < 4 ? C.red : C.text }}>
                        {"★".repeat(Math.round(d.rating))}<span className="text-[10px] opacity-60" style={{ color: C.textMuted }}> {d.rating}</span>
                      </span>
                    </Td>
                    <Td style={{ color: d.incidents > 3 ? C.red : C.textMuted }}>{d.incidents}</Td>
                    <Td><span className="font-mono font-bold" style={{ color: C.primary }}>{d.vehicle}</span></Td>
                    <Td className="flex items-center gap-2">
                      <Btn variant="secondary">Profil</Btn>
                      <Btn variant="danger">Suspendre</Btn>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}