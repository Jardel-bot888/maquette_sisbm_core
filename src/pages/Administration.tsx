// ─── Module Administration & Droits (Premium) ─────────────────────────────────
import { Shield, Users, KeyRound, Activity } from "lucide-react";
import { C, va } from "@/theme";import { adminUsers } from "@/data/mock";
import { PageHeader, Btn, StatusPill, Th, Td, Initial, LockBanner } from "@/ui";

const MATRIX = [
  { role: "Super Admin", cols: [true, true, true, true, true] },
  { role: "Superviseur SOC", cols: [true, true, true, false, false] },
  { role: "Gestionnaire client", cols: [true, false, true, true, false] },
  { role: "Analyste rapports", cols: [false, false, true, true, false] },
  { role: "Technicien", cols: [false, true, false, false, true] },
];
const MODULES = ["Dashboard", "Immobilisation", "Géofencing", "Rapports", "Maintenance"];

export default function Administration({ onNavigate, tier = "gold" }: { onNavigate: (label: string) => void; tier?: string }) {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Administration & Droits"
        subtitle="Utilisateurs, rôles (RBAC) et matrice d'accès par module."
        actions={<Btn onClick={() => onNavigate("Conducteurs")}>➕ Inviter un utilisateur</Btn>}
      />

      {tier !== "premium" && <LockBanner tier="premium" />}

      {/* Synthèse */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        {[
          { label: "Utilisateurs actifs", value: `${adminUsers.filter((u) => u.status === "Actif").length} / ${adminUsers.length}`, icon: Users, color: C.primary },
          { label: "Rôles définis", value: "5", icon: Shield, color: C.orange },
          { label: "Sessions aujourd'hui", value: "3", icon: Activity, color: C.green },
          { label: "Droits critiques", value: "2 Super Admin", icon: KeyRound, color: C.red },
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

      {/* Utilisateurs */}
      <div className="rounded-2xl border p-4" style={{ background: C.cardBg, borderColor: C.borderSoft }}>
        <span className="font-bold text-sm block mb-3" style={{ color: C.text }}>Utilisateurs</span>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                <Th>Utilisateur</Th><Th>Rôle</Th><Th>Formule</Th><Th>Statut</Th><Th>Dernière connexion</Th><Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {adminUsers.map((u) => {
                const initials = u.name.split(" ").map((n) => n[0]).slice(0, 2).join("");
                return (
                  <tr key={u.id} style={{ borderBottom: `1px solid ${va(C.border, "33%")}` }}>
                    <Td>
                      <div className="flex items-center gap-2.5">
                        <Initial text={initials} color={u.color} size={8} />
                        <div>
                          <span className="font-semibold" style={{ color: C.text }}>{u.name}</span>
                          <p className="text-[10px]" style={{ color: C.textMuted }}>{u.email}</p>
                        </div>
                      </div>
                    </Td>
                    <Td><StatusPill color={u.color} label={u.role} /></Td>
                    <Td style={{ color: C.textMuted }}>{u.tier}</Td>
                    <Td><StatusPill color={u.status === "Actif" ? C.green : C.gray} label={u.status} /></Td>
                    <Td className="font-mono" style={{ color: C.textMuted }}>{u.lastLogin}</Td>
                    <Td className="flex items-center gap-2">
                      <Btn variant="secondary">Éditer</Btn>
                      <Btn variant="danger">Révoquer</Btn>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Matrice RBAC */}
      <div className="rounded-2xl border p-4" style={{ background: C.cardBg, borderColor: C.borderSoft }}>
        <span className="font-bold text-sm block mb-3" style={{ color: C.text }}>Matrice d'accès par rôle</span>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                <Th>Rôle</Th>
                {MODULES.map((m) => <Th key={m}>{m}</Th>)}
              </tr>
            </thead>
            <tbody>
              {MATRIX.map((row, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${va(C.border, "33%")}` }}>
                  <Td><span className="font-semibold" style={{ color: C.text }}>{row.role}</span></Td>
                  {row.cols.map((on, j) => (
                    <Td key={j}>
                      <span style={{ fontSize: 14, color: on ? C.green : C.gray }}>{on ? "✓" : "—"}</span>
                    </Td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}