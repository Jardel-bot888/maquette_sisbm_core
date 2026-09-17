// ─── Module Centre d'alertes SMS ──────────────────────────────────────────────
import { useState } from "react";
import { BellRing, Send, CheckCircle2, AlertTriangle } from "lucide-react";
import { C, alertLevelConfig, va } from "@/theme";import { smsAlerts } from "@/data/mock";
import { PageHeader, Btn, StatusPill, Th, Td, CountBadge } from "@/ui";

const LEVELS = [
  { key: "all", label: "Toutes", color: C.primary },
  { key: "critical", label: "Critiques", color: C.red },
  { key: "major", label: "Majeures", color: C.orange },
  { key: "medium", label: "Moyennes", color: C.gray },
];

export default function CentreAlertes() {
  const [level, setLevel] = useState("all");
  const [q, setQ] = useState("");
  const rows = smsAlerts.filter((a) => {
    const okLevel = level === "all" || a.level === level;
    const okQ = q === "" || a.plate.toLowerCase().includes(q.toLowerCase()) || a.title.toLowerCase().includes(q.toLowerCase());
    return okLevel && okQ;
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Centre d'alertes SMS"
        subtitle="Toutes les alertes émises par SMS, répartition par sévérité et suivi d'acheminement."
        actions={<Btn><Send className="h-3.5 w-3.5 inline-block mr-1" />Envoyer un test</Btn>}
      />

      {/* Filtres sévérité */}
      <div className="flex flex-wrap items-center gap-2">
        {LEVELS.map((l) => {
          const count = l.key === "all" ? smsAlerts.length : smsAlerts.filter((a) => a.level === l.key).length;
          return (
            <button
              key={l.key}
              onClick={() => setLevel(l.key)}
              aria-pressed={level === l.key}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all"
              style={{ background: level === l.key ? va(l.color, "13%") : C.cardBg, borderColor: level === l.key ? l.color : C.border, color: level === l.key ? l.color : C.textMuted }}
            >
              {l.label} <CountBadge n={count} color={l.color} />
            </button>
          );
        })}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher plaque ou type d'alerte…"
          className="ml-auto px-3 py-2 rounded-xl border outline-none text-xs min-w-[220px]"
          style={{ background: C.navy, borderColor: C.border, color: C.text }}
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border p-4" style={{ background: C.cardBg, borderColor: C.borderSoft }}>
        <span className="font-bold text-sm block mb-3" style={{ color: C.text }}>
          Journal des alertes <span className="font-normal text-xs" style={{ color: C.textMuted }}>({rows.length} résultat(s))</span>
        </span>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                <Th>Réf.</Th><Th>Sévérité</Th><Th>Type d'alerte</Th><Th>Véhicule</Th><Th>Destinataire</Th><Th>Canal</Th><Th>Coût</Th><Th>Statut</Th><Th>Heure</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => {
                const lvl = alertLevelConfig[a.level as keyof typeof alertLevelConfig];
                return (
                  <tr key={a.id} style={{ borderBottom: `1px solid ${va(C.border, "33%")}` }}>
                    <Td><span className="font-mono text-[10px]" style={{ color: C.textMuted }}>{a.id}</span></Td>
                    <Td>
                      <span className="inline-flex items-center gap-1.5">
                        <BellRing className="h-3 w-3" style={{ color: lvl.badge }} />
                        <StatusPill color={lvl.badge} label={lvl.label} />
                      </span>
                    </Td>
                    <Td><span className="font-semibold" style={{ color: C.text }}>{a.title}</span><p className="text-[11px]" style={{ color: C.textMuted }}>{a.desc}</p></Td>
                    <Td><span className="font-mono font-bold" style={{ color: C.primary }}>{a.plate}</span></Td>
                    <Td style={{ color: C.textDim }}>{a.recipient}</Td>
                    <Td style={{ color: C.textMuted }}>{a.chan}</Td>
                    <Td className="font-mono" style={{ color: C.textMuted }}>{a.cost}</Td>
                    <Td><StatusPill color={a.status.includes("Échec") ? C.red : C.green} label={a.status} /></Td>
                    <Td className="font-mono" style={{ color: C.textMuted }}>{a.time}</Td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr><Td colSpan={9} className="py-6 text-center" style={{ color: C.textMuted }}>Aucune alerte ne correspond aux filtres.</Td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats canal */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        {[
          { label: "SMS envoyés (24h)", value: "214", icon: Send, color: C.primary },
          { label: "SMS délivrés", value: "211 (98,6%)", icon: CheckCircle2, color: C.green },
          { label: "Échecs / réessais", value: "3", icon: AlertTriangle, color: C.red },
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
    </div>
  );
}