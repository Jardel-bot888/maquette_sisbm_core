// ─── Barre de navigation latérale SISBM CORE ──────────────────────────────────
import { useState } from "react";
import { Shield } from "lucide-react";
import logoUrl from "../../image/logo.png";
import { C, tierOrder, va } from "@/theme";
import { navItems, userTier } from "@/data/mock";
import { BlinkDot } from "@/ui";

export default function Sidebar({ active, setActive, tier = userTier }: { active: string; setActive: (s: string) => void; tier?: string }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside
      className="flex flex-col h-full border-r transition-all duration-300 shrink-0"
      style={{ width: collapsed ? 56 : 220, minWidth: collapsed ? 56 : 220, background: C.sideBg, borderColor: C.sideBorder }}
    >
      {/* Bandeau aligné sur la hauteur de la navbar (h-16) : emplacement UNIQUE de la
          marque (logo + « SISBM » + badge Live). Le logo fait office de bouton
          repli/dépli : la marque reste donc visible même en mode replié. */}
      <div className="flex items-center gap-2 h-16 px-2 border-b shrink-0 overflow-hidden" style={{ borderColor: C.sideBorder }}>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Déplier la navigation" : "Replier la navigation"}
          aria-expanded={!collapsed}
          title={collapsed ? "Déplier la navigation" : "Replier la navigation"}
          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border shrink-0 cursor-pointer transition-all hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ background: C.sideBgAlt, borderColor: collapsed ? C.sideBorder : C.sideAccent }}
        >
          <img src={logoUrl} alt="SISBM" className="h-full w-full object-contain p-1" />
        </button>

        {!collapsed && (
          <>
            <span className="font-black text-lg leading-none tracking-tight whitespace-nowrap min-w-0 truncate" style={{ color: C.sideText }}>
              SISBM
            </span>
            <span
              className="ml-auto inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold leading-none whitespace-nowrap shrink-0"
              style={{ borderColor: C.sideGreen, color: C.sideGreen, background: va(C.sideGreen, "13%") }}
            >
              <BlinkDot color={C.sideGreen} />
              Live
            </span>
          </>
        )}
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

      {/* Footer : accroche + formule. La marque n'y figure plus (elle est déjà en haut
          du volet) → aucune duplication dans la même colonne. */}
      {!collapsed && (
        <div className="px-4 py-4 border-t" style={{ borderColor: C.sideBorder }}>
          <div className="space-y-0.5 text-[11px] leading-tight" style={{ color: C.sideTextMuted }}>
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