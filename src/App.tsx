// ─── Orchestrateur SISBM CORE ─────────────────────────────────────────────────
// Navigation latérale, en-tête, rendu des écrans (dashboard + 12 modules),
// overlays globaux (popover véhicule, immobilisation, notifications, menu profil).

import { useState } from "react";
import { C, tierOrder } from "@/theme";
import { navItems, notifications, userTier, type Vehicle } from "@/data/mock";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import VehiclePopover from "@/components/VehiclePopover";
import ImmobilizationModal from "@/components/ImmobilizationModal";
import UserMenu from "@/components/UserMenu";
import NotificationsPanel from "@/components/NotificationsPanel";
import Dashboard from "@/pages/Dashboard";
import TrackingGps from "@/pages/TrackingGps";
import ZonesGeographiques from "@/pages/ZonesGeographiques";
import ControleVitesses from "@/pages/ControleVitesses";
import GestionHoraires from "@/pages/GestionHoraires";
import CentreAlertes from "@/pages/CentreAlertes";
import GestionIncidents from "@/pages/GestionIncidents";
import MoteurRegles from "@/pages/MoteurRegles";
import RapportsExports from "@/pages/RapportsExports";
import MaintenancePreventive from "@/pages/MaintenancePreventive";
import Conducteurs from "@/pages/Conducteurs";
import SupervisionSms from "@/pages/SupervisionSms";
import Administration from "@/pages/Administration";

export default function App() {
  const [activeNav, setActiveNav] = useState("Tableau de bord");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [immobilizeTarget, setImmobilizeTarget] = useState<Vehicle | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [tier, setTier] = useState<string>(userTier); // formule simulée — modifiable depuis le menu profil (démo)
  const [showNotif, setShowNotif] = useState(false);
  const [readIds, setReadIds] = useState<Record<string, boolean>>({});

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
        />

        <div className="flex-1 overflow-y-auto p-4" style={{ background: C.bg }}>
          {renderScreen()}
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