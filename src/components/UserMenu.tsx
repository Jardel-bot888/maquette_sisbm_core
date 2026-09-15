// ─── Menu utilisateur déroulant ───────────────────────────────────────────────
import { C } from "@/theme";

export default function UserMenu({ onClose, onNavigate }: { onClose: () => void; onNavigate: (label: string) => void }) {
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