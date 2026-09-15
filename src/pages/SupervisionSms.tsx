// ─── Module Supervision SMS & Facturation (Premium) ───────────────────────────
import { MessageSquareText, TrendingUp, Coins, AlertTriangle } from "lucide-react";
import { C } from "@/theme";
import { smsAccount, smsHistory } from "@/data/mock";
import { PageHeader, Btn, StatusPill, Th, Td, LockBanner } from "@/ui";

export default function SupervisionSms({ tier = "gold" }: { tier?: string }) {
  const pct = Math.round((smsAccount.monthlyConsumed / smsAccount.monthlyQuota) * 100);
  return (
    <div className="space-y-4">
      <PageHeader
        title="Supervision SMS & Facturation"
        subtitle="Suivi des crédits SMS, tarification à l'envoi et facturation mensuelle."
        actions={<Btn variant="gold">Recharger 5 000 SMS</Btn>}
      />

      {tier !== "premium" && <LockBanner tier="premium" />}

      {/* Compteur */}
      <div className="rounded-2xl border p-5" style={{ background: "#16273d", borderColor: "#24364f" }}>
        <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
          <div>
            <p className="text-xs font-semibold" style={{ color: C.textMuted }}>SOLDE RESTANT</p>
            <p className="text-4xl font-black mt-1" style={{ color: "#FCD34D" }}>{smsAccount.credits}<span className="text-sm font-bold ml-1" style={{ color: C.textMuted }}>SMS</span></p>
            <p className="text-xs mt-1" style={{ color: C.textMuted }}>Tarif : {smsAccount.ratePerSms} F CFA / SMS</p>
          </div>
          <div className="min-w-[220px]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span style={{ color: C.textMuted }}>Consommation du mois</span>
              <span className="font-bold" style={{ color: C.text }}>{smsAccount.monthlyConsumed} / {smsAccount.monthlyQuota}</span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: C.navy }}>
              <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: pct > 90 ? C.red : C.primary }} />
            </div>
            <p className="text-[10px] mt-1.5" style={{ color: C.textMuted }}>Prochaine facture : {smsAccount.billingDate}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        {[
          { label: "SMS envoyés ce mois", value: smsAccount.monthlyConsumed.toLocaleString("fr-FR"), icon: MessageSquareText, color: C.primary },
          { label: "Coût cumulé (mois)", value: `${(smsAccount.monthlyConsumed * smsAccount.ratePerSms).toLocaleString("fr-FR")} F`, icon: Coins, color: C.green },
          { label: "Tendance vs mois dernier", value: "+8%", icon: TrendingUp, color: C.orange },
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

      {/* Historique */}
      <div className="rounded-2xl border p-4" style={{ background: C.cardBg, borderColor: C.border }}>
        <span className="font-bold text-sm block mb-3" style={{ color: C.text }}>Historique des envois</span>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                <Th>Réf.</Th><Th>Heure</Th><Th>Destinataire</Th><Th>Véhicule</Th><Th>Type</Th><Th>Coût</Th><Th>Statut</Th>
              </tr>
            </thead>
            <tbody>
              {smsHistory.map((s) => (
                <tr key={s.id} style={{ borderBottom: `1px solid ${C.border + "55"}` }}>
                  <Td><span className="font-mono text-[10px]" style={{ color: C.textMuted }}>{s.id}</span></Td>
                  <Td className="font-mono" style={{ color: C.textMuted }}>{s.time}</Td>
                  <Td style={{ color: C.textDim }}>{s.to}</Td>
                  <Td><span className="font-mono font-bold" style={{ color: C.primary }}>{s.plate}</span></Td>
                  <Td style={{ color: C.textMuted }}>{s.type}</Td>
                  <Td className="font-mono" style={{ color: C.textMuted }}>{s.cost}</Td>
                  <Td>
                    <span className="inline-flex items-center gap-1">
                      {s.status === "Échec" && <AlertTriangle className="h-3 w-3" style={{ color: C.red }} />}
                      <StatusPill color={s.color} label={s.status} />
                    </span>
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