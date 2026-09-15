// ─── Composants UI réutilisables SISBM CORE ───────────────────────────────────
// Base de composants mise en place pour standardiser la charte graphique
// (obj. CDC : "poser une base de composants réutilisables").

import { useState, useEffect, type ReactNode } from "react";
import { C } from "@/theme";

// ─── Horloge live ─────────────────────────────────────────────────────────────
export function LiveClock({ compact = false }: { compact?: boolean }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const fmt = (n: number) => String(n).padStart(2, "0");
  const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  return (
    <div className="text-right">
      {!compact && (
        <div className="text-xs" style={{ color: C.textMuted }}>
          {days[time.getDay()]} {time.getDate()} {months[time.getMonth()]} {time.getFullYear()} · UTC+0
        </div>
      )}
      <div className="font-bold text-base tabular-nums" style={{ color: C.text, letterSpacing: "0.05em" }}>
        {fmt(time.getHours())}:{fmt(time.getMinutes())}:{fmt(time.getSeconds())}
      </div>
    </div>
  );
}

// ─── Point clignotant ─────────────────────────────────────────────────────────
export function BlinkDot({ color }: { color: string }) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setOn((v) => !v), 900);
    return () => clearInterval(t);
  }, []);
  return <span className="w-2 h-2 rounded-full inline-block" style={{ background: on ? color : "transparent", transition: "background 0.2s" }} />;
}

// ─── Carte générique ──────────────────────────────────────────────────────────
export function Card({ title, badge, action, children, style, className }: {
  title?: ReactNode; badge?: ReactNode; action?: ReactNode; children: ReactNode;
  style?: React.CSSProperties; className?: string;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${className ?? ""}`} style={{ background: C.cardBg, borderColor: C.border, ...style }}>
      {(title || badge || action) && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            {title && <span className="font-bold text-sm truncate" style={{ color: C.text }}>{title}</span>}
            {badge}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── En-tête de page ──────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions }: {
  title: string; subtitle?: string; actions?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 className="font-black text-xl tracking-tight" style={{ color: C.text }}>{title}</h1>
        {subtitle && <p className="text-sm mt-1" style={{ color: C.textMuted }}>{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

// ─── Bouton ───────────────────────────────────────────────────────────────────
export function Btn({ children, variant = "primary", onClick, disabled, className, label }: {
  children: ReactNode; variant?: "primary" | "secondary" | "danger" | "gold"; onClick?: () => void;
  disabled?: boolean; className?: string; label?: string;
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: C.primary, color: "white", border: "1px solid transparent" },
    secondary: { background: C.navy, color: C.textDim, border: `1px solid ${C.border}` },
    danger: { background: "#7F1D1D", color: "#FCA5A5", border: `1px solid ${C.red}44` },
    gold: { background: "#92400E", color: "#FCD34D", border: "1px solid transparent" },
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`px-3 py-2 rounded-xl font-semibold text-xs transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 ${className ?? ""}`}
      style={styles[variant]}
    >
      {children}
    </button>
  );
}

// ─── Pilule de statut ─────────────────────────────────────────────────────────
export function StatusPill({ color, label, soft = "#22" }: { color: string; label: string; soft?: string }) {
  return (
    <span
      className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] font-semibold leading-none whitespace-nowrap"
      style={{ background: color + soft, color, border: `1px solid ${color}44` }}
    >
      {label}
    </span>
  );
}

// ─── Badge de comptage ────────────────────────────────────────────────────────
export function CountBadge({ n, color = C.red }: { n: number; color?: string }) {
  return (
    <span className="text-xs rounded-full px-2 py-0.5 font-bold min-w-[18px] text-center" style={{ background: color, color: "white" }}>
      {n}
    </span>
  );
}
// ─── Aides tableau ────────────────────────────────────────────────────────────
export function Th({ children }: { children: ReactNode }) {
  return <th className="text-left pb-2.5 pr-3 font-semibold" style={{ color: C.textMuted }}>{children}</th>;
}
export function Td({ children, className, style, colSpan }: { children?: ReactNode; className?: string; style?: React.CSSProperties; colSpan?: number }) {
  return <td colSpan={colSpan} className={`py-3 pr-3 align-middle ${className ?? ""}`} style={style}>{children}</td>;
}

// ─── Interrupteur ─────────────────────────────────────────────────────────────
export function Toggle({ on, onChange, disabled, label }: {
  on: boolean; onChange?: (v: boolean) => void; disabled?: boolean; label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => !disabled && onChange?.(!on)}
      className="relative rounded-full transition-colors flex-shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{ background: on ? C.primary : "#334155", width: 40, height: 22, opacity: disabled ? 0.4 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
    >
      <span className="absolute top-0.5 rounded-full bg-white transition-all" style={{ left: on ? 20 : 4, width: 18, height: 18 }} />
    </button>
  );
}

// ─── Majuscule d'avatar ───────────────────────────────────────────────────────
export function Initial({ text, color = C.primary, size = 9 }: { text: string; color?: string; size?: number }) {
  return (
    <div className="rounded-full flex items-center justify-center font-bold flex-shrink-0" style={{ background: color, color: "white", width: size * 2.4, height: size * 2.4, fontSize: size }}>
      {text}
    </div>
  );
}

// ─── Bandeau de verrouillage de formule ───────────────────────────────────────
export function LockBanner({ tier }: { tier: "gold" | "premium" }) {
  const premium = tier === "premium";
  return (
    <div className="rounded-xl px-4 py-3 border flex items-center gap-3" style={{ background: premium ? "#2E1065" : "#431407", borderColor: premium ? "#6D28D9" : "#92400E" }}>
      <span className="text-lg">🔒</span>
      <div className="flex-1">
        <p className="text-xs font-bold" style={{ color: premium ? "#C4B5FD" : "#FCD34D" }}>
          Module {premium ? "Premium" : "Gold"}
        </p>
        <p className="text-xs" style={{ color: C.textMuted }}>
          Ce module est disponible avec la formule {premium ? "Premium" : "Gold"}. Contactez l'équipe SISBM pour l'activer.
        </p>
      </div>
      <Btn variant="gold">{premium ? "Débloquer" : "Passer Gold"}</Btn>
    </div>
  );
}