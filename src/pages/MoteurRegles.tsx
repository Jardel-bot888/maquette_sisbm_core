// ─── Module Moteur de règles ──────────────────────────────────────────────────
import { useState } from "react";
import { ShieldCheck, Zap, Plus } from "lucide-react";
import { C, va } from "@/theme";import { rules } from "@/data/mock";
import { PageHeader, Btn, StatusPill, Toggle } from "@/ui";

export default function MoteurRegles() {
  const [list, setList] = useState(rules);
  const toggle = (id: string) => setList((l) => l.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Moteur de règles"
        subtitle="Automatisation des alertes : vitesse, géofencing, horaires, maintenance, immobilisation."
        actions={<Btn><Plus className="h-3.5 w-3.5 inline-block mr-1" />Nouvelle règle</Btn>}
      />

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border px-4 py-3" style={{ background: C.cardBg, borderColor: C.border }}>
        <Zap className="h-4 w-4" style={{ color: C.primaryLight }} />
        <span className="text-xs" style={{ color: C.textMuted }}>
          <span className="font-bold" style={{ color: C.text }}>{list.filter((r) => r.enabled).length}</span> règle(s) active(s) sur {list.length} · évaluation toutes les 30 secondes
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {list.map((r) => (
          <div key={r.id} className="rounded-2xl border p-4 flex flex-col gap-3" style={{ background: C.cardBg, borderColor: r.enabled ? C.border : va(C.border, "47%"), opacity: r.enabled ? 1 : 0.55 }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg" style={{ background: va(r.color, "13%"), color: r.color }}>{r.id}</span>
                  <StatusPill color={r.color} label={r.severity} />
                </div>
                <p className="text-sm font-bold" style={{ color: C.text }}>{r.name}</p>
              </div>
              <Toggle on={r.enabled} onChange={() => toggle(r.id)} label={`Activer la règle ${r.name}`} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl px-3 py-2" style={{ background: C.navy, border: `1px solid ${C.border}` }}>
                <p className="text-[10px]" style={{ color: C.textMuted }}>CONDITION</p>
                <p className="mt-0.5 font-medium" style={{ color: C.textDim }}>{r.reason}</p>
              </div>
              <div className="rounded-xl px-3 py-2" style={{ background: C.navy, border: `1px solid ${C.border}` }}>
                <p className="text-[10px]" style={{ color: C.textMuted }}>ACTION</p>
                <p className="mt-0.5 font-medium" style={{ color: C.textDim }}>{r.action}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span style={{ color: C.textMuted }}>Formule : <ShieldCheck className="h-3 w-3 inline-block" style={{ color: C.primaryLight }} /> {r.tier}</span>
              <div className="flex gap-2">
                <Btn variant="secondary">Configurer</Btn>
                <Btn variant="danger">Suppr.</Btn>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}