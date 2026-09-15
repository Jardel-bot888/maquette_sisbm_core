// ─── Panneau de notifications (cloche) ────────────────────────────────────────
import { C, alertLevelConfig } from "@/theme";
import { notifications } from "@/data/mock";
import { CountBadge } from "@/ui";
import { BellRing } from "lucide-react";

type Props = {
  readIds: Record<string, boolean>;
  onRead: (id: string) => void;
  onReadAll: () => void;
  onClose: () => void;
  onNavigate: (label: string) => void;
};

export default function NotificationsPanel({ readIds, onRead, onReadAll, onClose, onNavigate }: Props) {
  const unread = notifications.filter((n) => !readIds[n.id]).length;
  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div
        className="absolute right-4 top-16 w-[380px] rounded-2xl border shadow-2xl overflow-hidden"
        style={{ background: C.navyMid, borderColor: C.navyLight }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: C.border }}>
          <div className="flex items-center gap-2">
            <BellRing className="h-4 w-4" style={{ color: C.textDim }} />
            <span className="font-bold text-sm" style={{ color: C.text }}>Notifications</span>
            {unread > 0 && <CountBadge n={unread} />}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onReadAll} className="text-xs font-semibold" style={{ color: C.primary }}>
              Tout lire
            </button>
            <button onClick={onClose} className="w-6 h-6 rounded-lg flex items-center justify-center text-xs" style={{ background: C.navy, color: C.textMuted }}>✕</button>
          </div>
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto">
          {notifications.map((n) => {
            const lvl = alertLevelConfig[n.level as keyof typeof alertLevelConfig];
            const isRead = !!readIds[n.id];
            return (
              <button
                key={n.id}
                onClick={() => onRead(n.id)}
                aria-label={isRead ? `Notification lue : ${n.title}` : `Marquer comme lue : ${n.title}`}
                className="w-full flex items-start gap-3 px-4 py-3 text-left border-b transition-colors hover:bg-white/5"
                style={{ borderColor: C.border + "55", background: isRead ? "transparent" : "rgba(26,107,186,0.06)" }}
              >
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-black rounded px-1.5 py-0.5" style={{ background: lvl.badge, color: "white", fontSize: 9 }}>{lvl.label}</span>
                    <span className="text-xs font-mono" style={{ color: C.primary }}>{n.plate}</span>
                    {!isRead && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: C.primary }} />}
                  </span>
                  <span className="block text-xs font-semibold" style={{ color: isRead ? C.textMuted : C.text }}>{n.title}</span>
                  <span className="block text-xs truncate" style={{ color: C.textMuted }}>{n.desc}</span>
                </span>
                <span className="text-[10px] font-mono flex-shrink-0" style={{ color: C.textMuted }}>{n.time}</span>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t" style={{ borderColor: C.border }}>
          <button
            onClick={() => { onClose(); onNavigate("Centre d'alertes SMS"); }}
            className="w-full text-center text-xs font-semibold py-1.5 rounded-lg"
            style={{ color: C.primary }}
          >
            Voir le centre d'alertes →
          </button>
        </div>
      </div>
    </div>
  );
}