// ─── Module Contrôle des vitesses ─────────────────────────────────────────────
import { useState } from "react";
import { Gauge, AlertTriangle, Timer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from "recharts";
import { C, va } from "@/theme";import { speedRules, speedDaily } from "@/data/mock";
import { PageHeader, Btn, StatusPill, Toggle, Th, Td } from "@/ui";

export default function ControleVitesses() {
  const [list, setList] = useState(speedRules);
  const toggle = (zone: string) => setList((l) => l.map((r) => (r.zone === zone ? { ...r, enabled: !r.enabled } : r)));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Contrôle des vitesses"
        subtitle="Limites par zone, dépassements détectés et réglages."
        actions={<Btn>➕ Ajouter une limite</Btn>}
      />

      {/* Synthèse */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        {[
          { label: "Vitesse moyenne", value: "48 km/h", icon: Gauge, color: C.primary },
          { label: "Dépassements 24h", value: "37", icon: AlertTriangle, color: C.red },
          { label: "Zones limitées", value: `${list.filter((r) => r.enabled).length} actives`, icon: Timer, color: C.orange },
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

      {/* Courbe dépassements */}
      <div className="rounded-2xl border p-4" style={{ background: C.soft, borderColor: C.borderSoft }}>
        <span className="font-bold text-sm block mb-3" style={{ color: C.text }}>Dépassements et vitesse moyenne (7 derniers jours)</span>
        <ResponsiveContainer width="100%" height={180}>
          <ComposedChart data={speedDaily}>
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: C.textMuted }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: C.textMuted }} axisLine={false} tickLine={false} width={24} />
            <Tooltip contentStyle={{ background: C.navyMid, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11, color: C.text }} cursor={{ fill: va(C.primary, "6%") }} />
            <Legend wrapperStyle={{ fontSize: 10, color: C.textMuted, paddingTop: 6 }} />
            <Bar dataKey="depassements" name="Dépassements" fill={C.red} radius={[4, 4, 0, 0]} barSize={14} />
            <Line dataKey="moyenne" name="Vitesse moyenne (km/h)" stroke={C.primaryLight} dot={{ fill: C.primaryLight, r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Table des limites */}
      <div className="rounded-2xl border p-4" style={{ background: C.cardBg, borderColor: C.borderSoft }}>
        <span className="font-bold text-sm block mb-3" style={{ color: C.text }}>Limites configurées</span>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                <Th>Zone</Th><Th>Type</Th><Th>Limite</Th><Th>Véhicules</Th><Th>Active</Th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.zone} style={{ borderBottom: `1px solid ${va(C.border, "33%")}` }}>
                  <Td><span className="font-semibold" style={{ color: C.text }}>{r.zone}</span></Td>
                  <Td><StatusPill color={r.type === "Par défaut" ? C.primary : C.textMuted} label={r.type} soft="13%" /></Td>
                  <Td>
                    <span className="inline-flex items-center gap-1 font-mono font-bold" style={{ color: C.text }}>
                      {r.limit}<span className="text-[10px]" style={{ color: C.textMuted }}> km/h</span>
                    </span>
                  </Td>
                  <Td style={{ color: C.textDim }}>{r.vehicles}</Td>
                  <Td><Toggle on={r.enabled} onChange={() => toggle(r.zone)} label={`Activer la limite de vitesse pour ${r.zone}`} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}