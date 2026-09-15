// ─── Barre de navigation latérale SISBM CORE ──────────────────────────────────
import { useState } from "react";
import { Shield } from "lucide-react";
import logoUrl from "../../image/logo.png";
import { C, tierOrder, va } from "@/theme";
import { navItems, userTier } from "@/data/mock";

export default function Sidebar({ active, setActive, tier = userTier }: { active: string; setActive: (s: string) => void; tier?: string }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside
      className="flex flex-col h-full border-r transition-all duration-300 shrink-0"
      style={{ width: collapsed ? 56 : 220, minWidth: collapsed ? 56 : 220, background: C.sideBg, borderColor: C.sideBorder }}
    >
      {/* Bandeau aligné sur la hauteur de la navbar (h-16) : le bouton reste confiné
          dans la colonne latérale et ne peut plus passer par-dessus la zone du logo SISBM. */}
      <div className="flex items-center justify-end h-16 px-2 border-b shrink-0" style={{ borderColor: C.sideBorder }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Déplier la navigation" : "Replier la navigation"}
          aria-expanded={!collapsed}
          title={collapsed ? "Déplier la navigation" : "Replier la navigation"}
          className="w-7 h-7 rounded-lg flex items-center justify-center border shrink-0"
          style={{ background: C.sideBgAlt, borderColor: C.sideBorder, color: C.sideTextMuted }}
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto pb-4">
        {navItems.map((item) => {
          const locked = tierOrder[item.tier as keyof typeof tierOrder] > tierOrder[tier as keyof typeof tierOrder];
          const isActive = active === item.label;
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => !locked && setActive(item.label)}
              title={collapsed ? item.label : undefined}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-all relative group"
              style={{
                background: isActive ? va(C.sideAccent, "22%") : "transparent",
                borderLeft: isActive ? `3px solid ${C.sideAccent}` : "3px solid transparent",
                color: locked ? C.sideTextMuted : isActive ? C.sideText : C.sideTextMuted,
                cursor: locked ? "not-allowed" : "pointer",
              }}
            >
              <span className="text-base w-5 text-center flex-shrink-0 flex items-center justify-center">
                {locked ? <Shield className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </span>
              {!collapsed && (
                <>
                  <span className="flex-1 truncate font-medium" style={{ color: locked ? C.sideTextMuted : isActive ? C.sideText : C.sideTextMuted }}>
                    {item.label}
                  </span>
                  {item.badge ? (
                    <span className="text-xs rounded-full px-1.5 font-bold" style={{ background: C.red, color: "#FFFFFF", minWidth: 18, textAlign: "center" }}>
                      {item.badge}
                    </span>
                  ) : null}
                  {locked && (
                    <span className="text-[10px] rounded px-1" style={{ background: va(C.sideAccent, "35%"), color: C.sideText }}>
                      {item.tier === "premium" ? "Premium" : "Gold"}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer brand */}
      {!collapsed && (
        <div className="px-4 py-4 border-t" style={{ borderColor: C.sideBorder }}>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border flex-shrink-0" style={{ background: C.sideBgAlt, borderColor: C.sideBorder }}>
              <img src={logoUrl} alt="SISBM logo" className="h-full w-full object-contain p-1.5" />
            </div>
            <div className="min-w-0">
              <div className="font-black text-sm tracking-tight" style={{ color: C.sideText }}>SISBM CORE</div>
              <div className="text-[11px] truncate" style={{ color: C.sideTextMuted }}>Supervision de flotte</div>
            </div>
          </div>
          <div className="mt-3 space-y-0.5 text-[11px] leading-tight" style={{ color: C.sideTextMuted }}>
            <div>Sécuriser · Construire</div>
            <div>Connecter · Former</div>
          </div>
          <div className="mt-3 inline-flex items-center rounded-lg border px-2.5 py-1.5 text-[11px] font-medium leading-none" style={{ background: va(C.sideAccent, "22%"), borderColor: C.sideAccent, color: C.sideText }}>
            Plan {tier === "premium" ? "Premium" : tier === "gold" ? "Gold" : "Standard"} · Actif
          </div>
        </div>
      )}
    </aside>
  );
}