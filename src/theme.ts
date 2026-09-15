// ─── Theme SISBM CORE ─────────────────────────────────────────────────────────
// Thème dynamique sombre / clair piloté par des variables CSS posées sur
// <html data-theme="dark|light">. Le helper `v(name)` produit une référence
// var(--sisbm-*) utilisable dans les styles inline : la bascule de thème ne
// nécessite alors AUCUNE re-propagation dans les 25 fichiers consommateurs.
// Les valeurs hexadécimales historiques du thème sombre sont conservées dans
// DARK_VARS ; les composants restent visuellement identiques par défaut.

import { useState, useEffect, useCallback } from "react";

export type ThemeName = "dark" | "light";

/** Valeur de couleur résoluble dans les deux thèmes (var CSS ou couleur fixe). */
export type ThemedColor = string;

/** Référence une variable CSS du thème : `v("navy")` → `var(--sisbm-navy)`. */
export function v(key: string): string {
  return `var(--sisbm-${key})`;
}

/**
 * Applique une opacité à une couleur du thème.
 * - Référence var(--sisbm-*) → color-mix() (suit le thème courant).
 * - Couleur fixe (hex issue des mocks) → suffixe alpha hexadécimal.
 */
export function va(color: string, amount: string): string {
  const m = /^var\(--sisbm-([a-zA-Z]+)\)$/.exec(color.trim());
  if (m) return `color-mix(in srgb, var(--sisbm-${m[1]}) ${amount}, transparent)`;
  const pct = parseFloat(amount) / 100;
  if (!Number.isNaN(pct)) {
    const hex = color.trim();
    const full = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(hex);
    if (full) {
      let h = full[1];
      if (h.length === 3) h = h.split("").map((c) => c + c).join("");
      const alpha = Math.round(pct * 255).toString(16).padStart(2, "0");
      return `#${h}${alpha}`;
    }
  }
  return color;
}

// ─── Valeurs sombres (rendu historique — inchangées) ──────────────────────────
type VarMap = Record<string, string>;


const DARK_VARS: VarMap = {
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
  hover: "rgba(255,255,255,0.05)",
  soft: "#16273D",
  switchOff: "#334155",
};

// ─── Valeurs claires ─────────────────────────────────────────────────────────
const LIGHT_VARS: VarMap = {
  navy: "#FFFFFF",
  navyMid: "#FFFFFF",
  navyLight: "#E2E8F0",
  primary: "#0F4C8A",
  primaryLight: "#1A6BBA",
  green: "#059669",
  red: "#DC2626",
  orange: "#D97706",
  gray: "#64748B",
  text: "#1A2332",
  textMuted: "#6B7A90",
  textDim: "#334155",
  border: "#E2E8F0",
  cardBg: "#FFFFFF",
  bg: "#F0F4F8",
  white: "#FFFFFF",
  hover: "rgba(15,76,138,0.06)",
  soft: "#E8F0FE",
  switchOff: "#CBD5E1",
};

export const themeVars: Record<ThemeName, VarMap> = {
  dark: DARK_VARS,
  light: LIGHT_VARS,
};

/**
 * Objet de compatibilité historique : `C.navy` → `var(--sisbm-navy)`, etc.
 * Les anciennes concaténations alpha (`C.primary + "22"`) doivent être
 * remplacées par `va(C.primary, "13%")` qui suit le thème courant.
 */
type ThemeRef = Record<string, string>;
export const C: ThemeRef = {
  navy: v("navy"),
  navyMid: v("navyMid"),
  navyLight: v("navyLight"),
  primary: v("primary"),
  primaryLight: v("primaryLight"),
  green: v("green"),
  red: v("red"),
  orange: v("orange"),
  gray: v("gray"),
  text: v("text"),
  textMuted: v("textMuted"),
  textDim: v("textDim"),
  border: v("border"),
  cardBg: v("cardBg"),
  bg: v("bg"),
  white: v("white"),
  hover: v("hover"),
  soft: v("soft"),
  switchOff: v("switchOff"),
};

const STORAGE_KEY = "sisbm-theme";

/** Applique un thème : variables CSS + attribut data-theme sur <html>. */
export function applyTheme(theme: ThemeName) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const vars = themeVars[theme];
  Object.keys(vars).forEach((k) => {
    root.style.setProperty(`--sisbm-${k}`, vars[k]);
  });
  root.dataset.theme = theme;
}

function readStoredTheme(): ThemeName {
  if (typeof window === "undefined") return "dark";
  try {
    const val = window.localStorage.getItem(STORAGE_KEY);
    return val === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

/** Hook thème : bascule sombre/clair avec persistance localStorage. */
export function useTheme() {
  const [theme, setTheme] = useState<ThemeName>(() => {
    const stored = readStoredTheme();
    // Pose immédiate des variables pour éviter tout flash au 1er rendu
    // (le state initial sera identique → pas de double application).
    if (typeof document !== "undefined" && !document.documentElement.dataset.theme) {
      applyTheme(stored);
    }
    return stored;
  });

  useEffect(() => {
    applyTheme(theme);
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* stockage indisponible — le thème reste en mémoire */
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  return { theme, setTheme, toggleTheme };
}

// ─── Hiérarchie des formules ──────────────────────────────────────────────────
export const tierOrder: Record<string, number> = { standard: 0, gold: 1, premium: 2 };

// ─── Statuts véhicules ────────────────────────────────────────────────────────
// Couleurs via variables de thème : vives sur fond sombre, assombries sur fond
// clair pour garantir le contraste du texte des pastilles.
export const statusConfig: Record<string, { color: string; label: string; dot: string }> = {
  moving: { color: C.green, label: "En déplacement", dot: "●" },
  alert: { color: C.orange, label: "En alerte", dot: "●" },
  stopped: { color: C.red, label: "À l'arrêt", dot: "●" },
  offline: { color: C.gray, label: "Hors ligne", dot: "●" },
}

// ─── Niveaux d'alerte ─────────────────────────────────────────────────────────
// Fonds = teinte translucide de la couleur de niveau : le composite fonctionne
// aussi bien sur une carte sombre que sur une carte blanche, et le texte suit
// automatiquement le thème (pas de fond clair sous un texte clair en sombre).
export const alertLevelConfig: Record<string, { bg: string; border: string; badge: string; label: string }> = {
  critical: { bg: va(C.red, "14%"), border: C.red, badge: C.red, label: "CRITIQUE" },
  major: { bg: va(C.orange, "14%"), border: C.orange, badge: C.orange, label: "MAJEUR" },
  medium: { bg: va(C.gray, "14%"), border: C.gray, badge: C.gray, label: "MOYEN" },
}
