// ─── Orchestrateur SISBM CORE ─────────────────────────────────────────────────
// Navigation latérale, en-tête, rendu des écrans (dashboard + 12 modules),
// overlays globaux (popover véhicule, immobilisation, notifications, menu profil).

import { useState, Suspense, lazy } from "react";
import { C, tierOrder, useTheme } from "@/theme";
import { navItems, notifications, userTier, type Vehicle } from "@/data/mock";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import VehiclePopover from "@/components/VehiclePopover";
import ImmobilizationModal from "@/components/ImmobilizationModal";
import UserMenu from "@/components/UserMenu";
import NotificationsPanel from "@/components/NotificationsPanel";
// ─── Pages en chargement différé : chaque module devient un chunk séparé ──────
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const TrackingGps = lazy(() => import("@/pages/TrackingGps"));
const ZonesGeographiques = lazy(() => import("@/pages/ZonesGeographiques"));
const ControleVitesses = lazy(() => import("@/pages/ControleVitesses"));
const GestionHoraires = lazy(() => import("@/pages/GestionHoraires"));
const CentreAlertes = lazy(() => import("@/pages/CentreAlertes"));
const GestionIncidents = lazy(() => import("@/pages/GestionIncidents"));
const MoteurRegles = lazy(() => import("@/pages/MoteurRegles"));
const RapportsExports = lazy(() => import("@/pages/RapportsExports"));
const MaintenancePreventive = lazy(() => import("@/pages/MaintenancePreventive"));
const Conducteurs = lazy(() => import("@/pages/Conducteurs"));
const SupervisionSms = lazy(() => import("@/pages/SupervisionSms"));
const Administration = lazy(() => import("@/pages/Administration"));

export default function App() {
  const [activeNav, setActiveNav] = useState("Tableau de bord");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [immobilizeTarget, setImmobilizeTarget] = useState<Vehicle | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [tier, setTier] = useState<string>(userTier); // formule simulée — modifiable depuis le menu profil (démo)
  const [showNotif, setShowNotif] = useState(false);
  const [readIds, setReadIds] = useState<Record<string, boolean>>({});
  const { theme, toggleTheme } = useTheme(); // sombre / clair — persisté (localStorage)

  const unreadCount = notifications.filter((n) => !readIds[n.id]).length;

  const navigate = (label: string) => {
    const item = navItems.find((i) => i.label === label);
    if (item && tierOrder[item.tier as keyof typeof tierOrder] > tierOrder[tier as keyof typeof tierOrder]) return;
    setActiveNav(label);
    setShowNotif(false);
    setShowUserMenu(false);
  };

  const handleImmobilize = (v: Vehicle) => {
    setSelectedVehicle(null);
    setImmobilizeTarget(v);
  };

  const handleVehicleClick = (v: Vehicle) => setSelectedVehicle(v);

  const renderScreen = () => {
    switch (activeNav) {
      case "Tracking GPS":
        return <TrackingGps onVehicleClick={handleVehicleClick} />;
      case "Zones géographiques":
        return <ZonesGeographiques onNavigate={navigate} />;
      case "Contrôle des vitesses":
        return <ControleVitesses />;
      case "Gestion des horaires":
        return <GestionHoraires />;
      case "Centre d'alertes SMS":
        return <CentreAlertes />;
      case "Gestion des incidents":
        return <GestionIncidents />;
      case "Moteur de règles":
        return <MoteurRegles />;
      case "Rapports & Exports":
        return <RapportsExports onNavigate={navigate} />;
      case "Maintenance préventive":
        return <MaintenancePreventive />;
      case "Conducteurs":
        return <Conducteurs />;
      case "Supervision SMS & Fact.":
        return <SupervisionSms tier={tier} />;
      case "Administration & Droits":
        return <Administration onNavigate={navigate} tier={tier} />;
      case "Tableau de bord":
      default:
        return (
          <Dashboard
            onNavigate={navigate}
            onVehicleClick={handleVehicleClick}
            onImmobilize={handleImmobilize}
          />
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: C.bg, fontFamily: "Inter, sans-serif" }}>
      <Sidebar active={activeNav} setActive={setActiveNav} tier={tier} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header
          onNotifClick={() => setShowNotif(!showNotif)}
          onUserMenu={() => setShowUserMenu(!showUserMenu)}
          onNavigate={navigate}
          unreadCount={unreadCount}
          notifOpen={showNotif}
          userMenuOpen={showUserMenu}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <div className="flex-1 overflow-y-auto p-4" style={{ background: C.bg }}>
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-64 text-sm" style={{ color: C.textMuted }} role="status" aria-live="polite">
                Chargement du module…
              </div>
            }
          >
            {renderScreen()}
          </Suspense>
        </div>
      </div>

      {/* Overlays globaux */}
      {selectedVehicle && (
        <VehiclePopover
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          onImmobilize={() => handleImmobilize(selectedVehicle)}
        />
      )}
      {immobilizeTarget && (
        <ImmobilizationModal vehicle={immobilizeTarget} onClose={() => setImmobilizeTarget(null)} />
      )}
      {showUserMenu && <UserMenu onClose={() => setShowUserMenu(false)} onNavigate={navigate} tier={tier} onTierChange={setTier} />}
      {showNotif && (
        <NotificationsPanel
          readIds={readIds}
          onRead={(id) => setReadIds((r) => ({ ...r, [id]: true }))}
          onReadAll={() => setReadIds(Object.fromEntries(notifications.map((n) => [n.id, true])))}
          onClose={() => setShowNotif(false)}
          onNavigate={navigate}
        />
      )}
    </div>
  );
}