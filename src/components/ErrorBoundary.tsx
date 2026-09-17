// ─── Barrière d'erreur globale ────────────────────────────────────────────────
// Sans elle, la moindre exception de rendu laisse une page ENTIÈREMENT blanche,
// sans aucune information (cas rencontré : clé de thème manquante). Ici l'erreur
// est capturée, journalisée et affichée en français, avec deux reprises possibles.
import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[SISBM CORE] Erreur de rendu capturée :", error, info.componentStack);
  }

  /** Réinitialise les préférences locales (thème, notifications lues) puis recharge. */
  private resetPrefs = () => {
    try {
      window.localStorage.removeItem("sisbm-theme");
    } catch {
      /* stockage indisponible : on recharge simplement */
    }
    window.location.reload();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div
        role="alert"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          fontFamily: "'Poppins', sans-serif",
          background: "var(--sisbm-bg, #071B2D)",
          color: "var(--sisbm-text, #F8FAFC)",
        }}
      >
        <div
          style={{
            maxWidth: 560,
            width: "100%",
            padding: 28,
            borderRadius: 16,
            border: "1px solid var(--sisbm-border, #183B5E)",
            background: "var(--sisbm-cardBg, #102B46)",
          }}
        >
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Une erreur est survenue</h1>
          <p style={{ margin: "10px 0 0", fontSize: 14, lineHeight: 1.6, color: "var(--sisbm-textMuted, #94A3B8)" }}>
            L'application n'a pas pu s'afficher correctement. Détail technique :
          </p>
          <pre
            style={{
              margin: "12px 0 0",
              padding: "10px 12px",
              borderRadius: 10,
              overflowX: "auto",
              fontSize: 12,
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              background: "var(--sisbm-soft, #16273D)",
              color: "var(--sisbm-red, #EF4444)",
            }}
          >
            {error.message || String(error)}
          </pre>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 18 }}>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
                background: "var(--sisbm-primary, #1A6BBA)",
                color: "#FFFFFF",
              }}
            >
              Recharger la page
            </button>
            <button
              type="button"
              onClick={this.resetPrefs}
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
                background: "transparent",
                border: "1px solid var(--sisbm-border, #183B5E)",
                color: "var(--sisbm-text, #F8FAFC)",
              }}
            >
              Réinitialiser le thème et recharger
            </button>
          </div>
        </div>
      </div>
    );
  }
}