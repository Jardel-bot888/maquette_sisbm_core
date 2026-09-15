// ─── Menu utilisateur déroulant ───────────────────────────────────────────────
import { C, tierOrder } from "@/theme";

const TIERS = [
  { key: "standard", label: "Standard" },
  { key: "gold", label: "Gold" },
  { key: "premium", label: "Premium" },
] as const;

export default function UserMenu({ onClose, onNavigate, tier, onTierChange }: {
  onClose: () => void;
  onNavigate: (label: string) => void;
  tier: string;
  onTierChange: (t: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div
        className="absolute right-4 top-16 w-56 rounded-xl border shadow-2xl py-1"
        style={{ background: C.navyMid, borderColor: C.navyLight }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b" style={{ borderColor: C.border }}>
          <p className="text-sm font-bold" style={{ color: C.text }}>Administrateur</p>
          <p className="text-xs" style={{ color: C.textMuted }}>admin@sisbm.ci</p>
        </div>
        {/* Sélecteur de formule — démo : déverrouille les 13 écrans */}
        <div className="px-4 py-3 border-b" style={{ borderColor: C.border }}>
          <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: C.textMuted }}>
            Formule simulée
          </p>
          <div className="grid grid-cols-3 gap-1.5" role="group" aria-label="Choisir la formule simulée">
            {TIERS.map((t) => {
              const active = tier === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => onTierChange(t.key)}
                  aria-pressed={active}
                  className="px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                  style={{
                    background: active ? C.primary + "33" : "transparent",
                    borderColor: active ? C.primary : C.navyLight,
                    color: active ? C.text : C.textMuted,
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] mt-2" style={{ color: C.textMuted }}>
            {tierOrder[tier as keyof typeof tierOrder] >= tierOrder.premium
              ? "Tous les modules sont déverrouillés."
              : "Basculez sur Premium pour voir les 2 modules verrouillés."}
          </p>
        </div>
        {[
          { icon: "👤", label: "Mon profil", target: null as string | null },
          { icon: "🛡️", label: "Sécurité & RBAC", target: "Administration & Droits" },
          { icon: "⚙️", label: "Paramètres", target: null },
          { icon: "📋", label: "Journal d'activité", target: null },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => {
              onClose();
              if (item.target) onNavigate(item.target);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5"
            style={{ color: C.textDim }}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
        <div className="border-t my-1" style={{ borderColor: C.border }} />
        <button onClick={onClose} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5" style={{ color: C.red }}>
          <span>🚪</span> Déconnexion
        </button>
      </div>
    </div>
  );
}