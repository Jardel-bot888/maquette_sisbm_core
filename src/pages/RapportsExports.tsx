// ─── Module Rapports & Exports ────────────────────────────────────────────────
import { useState } from "react";
import { FileText, Download, Filter, FileSpreadsheet } from "lucide-react";
import { C, va } from "@/theme";import { allReports } from "@/data/mock";
import { PageHeader, Btn, Th, Td, StatusPill } from "@/ui";

export default function RapportsExports({ onNavigate }: { onNavigate: (label: string) => void }) {
  const [type, setType] = useState("all");
  const rows = type === "all" ? allReports : allReports.filter((r) => r.type === type);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Rapports & Exports"
        subtitle="Catalogue des rapports téléchargeables (PDF / Excel) et génération planifiée."
        actions={<Btn onClick={() => onNavigate("Centre d'alertes SMS")}>⚙️ Planifier un envoi</Btn>}
      />

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2">
        {[{ key: "all", label: "Tous" }, { key: "PDF", label: "PDF" }, { key: "Excel", label: "Excel" }].map((f) => (
          <button
            key={f.key}
            onClick={() => setType(f.key)}
            aria-pressed={type === f.key}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all"
            style={{ background: type === f.key ? va(C.primary, "13%") : C.cardBg, borderColor: type === f.key ? C.primary : C.border, color: type === f.key ? C.primary : C.textMuted }}
          >
            {f.key === "all" ? <Filter className="h-3.5 w-3.5" /> : f.key === "PDF" ? <FileText className="h-3.5 w-3.5" /> : <FileSpreadsheet className="h-3.5 w-3.5" />}
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-xs" style={{ color: C.textMuted }}>{rows.length} rapport(s)</span>
      </div>

      {/* Table */}
      <div className="rounded-2xl border p-4" style={{ background: C.cardBg, borderColor: C.border }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                <Th>Rapport</Th><Th>Format</Th><Th>Périodicité</Th><Th>Poids</Th><Th>Téléchargements</Th><Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={i}
                  className="transition-colors"
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--sisbm-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  style={{ borderBottom: `1px solid ${va(C.border, "33%")}` }}
                >
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: r.type === "PDF" ? va(C.red, "13%") : va(C.green, "13%") }}>
                        {r.type === "PDF" ? <FileText className="h-4 w-4" style={{ color: C.red }} /> : <FileSpreadsheet className="h-4 w-4" style={{ color: C.green }} />}
                      </div>
                      <span className="font-semibold" style={{ color: C.text }}>{r.name}</span>
                    </div>
                  </Td>
                  <Td><StatusPill color={r.type === "PDF" ? C.red : C.green} label={r.type} /></Td>
                  <Td style={{ color: C.textMuted }}>{r.period}</Td>
                  <Td className="font-mono" style={{ color: C.textMuted }}>{r.size}</Td>
                  <Td><span className="font-bold" style={{ color: C.text }}>{r.downloads}</span></Td>
                  <Td className="font-mono" style={{ color: C.textMuted }}>
                    <Btn variant="primary"><Download className="h-3.5 w-3.5 inline-block mr-1" />Télécharger</Btn>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Génération planifiée */}
      <div className="rounded-2xl border p-4 flex items-center justify-between gap-4 flex-wrap" style={{ background: C.soft, borderColor: C.border }}>
        <div>
          <p className="text-sm font-bold" style={{ color: C.text }}>Rapport automatique hebdomadaire</p>
          <p className="text-xs" style={{ color: C.textMuted }}>Envoyé chaque lundi à 07:00 · Destinataires : direction & SOC · Format PDF + Excel</p>
        </div>
        <div className="flex gap-2">
          <Btn variant="secondary">Modifier</Btn>
          <Btn variant="gold">Activer</Btn>
        </div>
      </div>
    </div>
  );
}