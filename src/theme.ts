// ─── Theme SISBM CORE ─────────────────────────────────────────────────────────
// Palette institutionnelle, configurations de statuts et de niveaux d'alerte.
// Pièce centrale consommée par tous les composants de l'application.

export const C = {
  navy: "#071B2D",
  navyMid: "#0D233C",
  navyLight: "#183B5E",
  primary: "#1A6BBA",
  primaryLight: "#3A9AEF",
  green: "#10B981",
  red: "#EF4444",
  orange: "#F59E0B",
  gray: "#64748B",
  text: "#F8FAFC",
  textMuted: "#94A3B8",
  textDim: "#CBD5E1",
  border: "#183B5E",
  cardBg: "#102B46",
  bg: "#071B2D",
  white: "#FFFFFF",
}

// ─── Statuts véhicules ────────────────────────────────────────────────────────
export const statusConfig: Record<string, { color: string; label: string; dot: string }> = {
  moving: { color: C.green, label: "En déplacement", dot: "●" },
  alert: { color: C.orange, label: "En alerte", dot: "●" },
  stopped: { color: C.red, label: "À l'arrêt", dot: "●" },
  offline: { color: C.gray, label: "Hors ligne", dot: "●" },
}

// ─── Niveaux d'alerte ─────────────────────────────────────────────────────────
export const alertLevelConfig: Record<string, { bg: string; border: string; badge: string; label: string }> = {
  critical: { bg: "#450A0A", border: C.red, badge: "#EF4444", label: "CRITIQUE" },
  major: { bg: "#431407", border: C.orange, badge: "#F59E0B", label: "MAJEUR" },
  medium: { bg: "#1C1917", border: "#78716C", badge: "#78716C", label: "MOYEN" },
}

// ─── Hiérarchie des formules ──────────────────────────────────────────────────
export const tierOrder: Record<string, number> = { standard: 0, gold: 1, premium: 2 }