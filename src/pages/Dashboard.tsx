// ─── Page Tableau de bord ─────────────────────────────────────────────────────
import { CarFront, MapPinned, CircleDashed, Gauge, Fuel, Map, Clock3, ShieldCheck, FileText } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { C } from "@/theme";
import { kpis, quickActions, fleetPie, incidentBar, type Vehicle } from "@/data/mock";
import { BlinkDot } from "@/ui";
import AbidjanMap from "@/components/AbidjanMap";
import AlertsPanel from "@/components/AlertsPanel";
import FleetTable from "@/components/FleetTable";

const kpiIconMap: Record<string, typeof CarFront> = { CarFront, MapPinned, CircleDashed, Gauge, Fuel };
const actionIconMap: Record<string, typeof CarFront> = { Map, Gauge, Clock3, ShieldCheck, FileText };

type Props = {
  onNavigate: (label: string) => void;
  onVehicleClick: (v: Vehicle) => void;
  onImmobilize: (v: Vehicle) => void;
};

export default function Dashboard({ onNavigate, onVehicleClick, onImmobilize }: Props) {
  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        {kpis.map((kpi, i) => {
          const Icon = kpiIconMap[kpi.icon] ?? CarFront;
          return (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all hover:border-blue-700" style={{ background: C.cardBg, borderColor: C.border, minHeight: 96 }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border flex-shrink-0" style={{ background: "rgba(15, 23, 42, 0.9)", borderColor: "rgba(148, 163, 184, 0.2)" }}>
                <Icon className="h-4 w-4" style={{ color: C.text }} />
              </div>
              <div className="min-w-0 flex-1 leading-none">
                <p className="text-[13px] font-medium leading-none" style={{ color: C.textMuted }}>{kpi.label}</p>
                <p className="mt-2 font-black text-[24px] leading-none tracking-[-0.04em]" style={{ color: C.text }}>{kpi.value}</p>
                <p className="mt-2 text-[12px] leading-none" style={{ color: kpi.subColor === "green" ? C.green : kpi.subColor === "red" ? C.red : C.textMuted }}>{kpi.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Carte + panneau latéral */}
      <div className="flex gap-4 flex-col lg:flex-row items-stretch lg:h-[560px]" style={{ minHeight: 420 }}>
        <div className="flex-1 min-w-0 rounded-xl border flex flex-col overflow-hidden" style={{ background: C.cardBg, borderColor: C.border }}>
          <div className="px-4 py-2.5 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: C.border }}>
            <div className="flex items-center gap-2">
              <BlinkDot color={C.green} />
              <span className="font-bold text-sm" style={{ color: C.text }}>Suivi en temps réel</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: C.green + "22", color: C.green }}>28 véhicules actifs</span>
            </div>
            <button onClick={() => onNavigate("Tracking GPS")} className="text-xs px-2 py-1 rounded-lg border" style={{ background: C.navy, borderColor: C.border, color: C.textMuted }}>
              ⛶ Plein écran
            </button>
          </div>
          <div className="flex-1 min-h-0 p-2">
            <AbidjanMap onVehicleClick={onVehicleClick} />
          </div>
        </div>

        <div className="shrink-0 w-full lg:w-[320px]">
          <AlertsPanel onNavigate={onNavigate} />
        </div>
      </div>
{/* Actions rapides */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
        {quickActions.map((qa, i) => {
          const Icon = actionIconMap[qa.icon] ?? CarFront;
          return (
            <button
              key={i}
              onClick={() => onNavigate(qa.target)}
              className="flex flex-col items-center gap-2 px-3 py-4 rounded-xl border text-center transition-all hover:border-blue-600 group"
              style={{ background: C.cardBg, borderColor: C.border }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all" style={{ background: C.navy }}>
                <Icon className="h-5 w-5" style={{ color: C.text }} />
              </div>
              <p className="text-xs font-semibold" style={{ color: C.text }}>{qa.label}</p>
              <p className="text-[10px] leading-tight" style={{ color: C.textMuted }}>{qa.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Tableau + graphiques */}
      <div className="grid gap-4 xl:grid-cols-2">
        <FleetTable onImmobilize={onImmobilize} onSelect={onVehicleClick} onNavigate={onNavigate} />

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border p-4" style={{ background: "#16273d", borderColor: "#24364f" }}>
            <span className="font-bold text-[16px] block mb-3" style={{ color: C.text }}>État de la flotte</span>
            <div className="flex items-center gap-5 flex-wrap">
              <div className="relative flex-shrink-0">
                <PieChart width={170} height={170}>
                  <Pie data={fleetPie} cx={85} cy={85} innerRadius={42} outerRadius={68} dataKey="value" startAngle={90} endAngle={-270}>
                    {fleetPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="font-black text-[30px] leading-none" style={{ color: C.text }}>28</span>
                  <span className="text-xs mt-1" style={{ color: C.textMuted }}>Total</span>
                </div>
              </div>
              <div className="flex-1 space-y-3 py-2 min-w-[160px]">
                {fleetPie.map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: f.color }} />
                    <span className="text-xs flex-1" style={{ color: C.textDim }}>{f.name}</span>
                    <span className="text-xs font-bold" style={{ color: C.text }}>{f.value}</span>
                    <span className="text-xs" style={{ color: C.textMuted }}>({Math.round((f.value / 28) * 100)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border p-4 flex-1" style={{ background: "#16273d", borderColor: "#24364f" }}>
            <span className="font-bold text-[16px] block mb-3" style={{ color: C.text }}>Évolution des incidents (7j)</span>
            <ResponsiveContainer width="100%" height={155}>
              <BarChart data={incidentBar} barSize={12} barGap={6}>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: C.textMuted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: C.textMuted }} axisLine={false} tickLine={false} width={18} />
                <Tooltip contentStyle={{ background: C.navyMid, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11, color: C.text }} cursor={{ fill: "#ffffff08" }} />
                <Legend wrapperStyle={{ fontSize: 10, color: C.textMuted, paddingTop: 8 }} />
                <Bar dataKey="alertes" name="Alertes" fill={C.primary} radius={[4, 4, 0, 0]} />
                <Bar dataKey="incidents" name="Incidents" fill={C.red} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}