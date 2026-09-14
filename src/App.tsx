import { useState, useEffect, useRef } from "react";
import logoUrl from "../image/logo.png";
import {
  Activity, AlertTriangle, ArrowDownToLine, BatteryCharging, Bell, BellRing,
  CarFront, ChevronDown, CircleDashed, Clock3, FileText, Fuel, Gauge,
  KeyRound, LayoutGrid, Map, MapPinned, MessageSquareText, Power, RadioTower,
  Search, Shield, ShieldCheck, TriangleAlert, Users, Wrench,
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, Legend, ResponsiveContainer, LineChart, Line, CartesianGrid,
} from "recharts";

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  navy: "#0F172A",
  navyMid: "#1E293B",
  navyLight: "#334155",
  primary: "#2563EB",
  primaryLight: "#3B82F6",
  green: "#10B981",
  red: "#EF4444",
  orange: "#F59E0B",
  gray: "#64748B",
  text: "#F8FAFC",
  textMuted: "#94A3B8",
  textDim: "#CBD5E1",
  border: "#1E293B",
  cardBg: "#1E293B",
  bg: "#0F172A",
  white: "#FFFFFF",
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const navItems = [
  { icon: LayoutGrid, label: "Tableau de bord", tier: "standard" },
  { icon: MapPinned, label: "Tracking GPS", tier: "standard", badge: 0 },
  { icon: Map, label: "Zones géographiques", tier: "standard" },
  { icon: Gauge, label: "Contrôle des vitesses", tier: "standard" },
  { icon: Clock3, label: "Gestion des horaires", tier: "gold" },
  { icon: BellRing, label: "Centre d'alertes SMS", tier: "standard", badge: 7 },
  { icon: TriangleAlert, label: "Gestion des incidents", tier: "standard", badge: 2 },
  { icon: ShieldCheck, label: "Moteur de règles", tier: "gold" },
  { icon: FileText, label: "Rapports & Exports", tier: "standard" },
  { icon: Wrench, label: "Maintenance préventive", tier: "gold" },
  { icon: Users, label: "Conducteurs", tier: "standard" },
  { icon: MessageSquareText, label: "Supervision SMS & Fact.", tier: "premium" },
  { icon: Shield, label: "Administration & Droits", tier: "premium" },
];

const tierOrder = { standard: 0, gold: 1, premium: 2 };
const userTier = "gold"; // simulate current user tier

const vehicles = [
  { plate: "AA 386 KA", model: "Peugeot Partner", driver: "Traoré S.", pos: "Yopougon", lat: 180, lng: 155, status: "moving", speed: 62, battery: 12.4, gsm: 4, x: 155, y: 155 },
  { plate: "AB 450 FC", model: "Toyota Hilux", driver: "Kouamé B.", pos: "Cocody", lat: 200, lng: 285, status: "alert", speed: 92, battery: 11.8, gsm: 3, x: 295, y: 170 },
  { plate: "AA 328 XP", model: "Renault Master", driver: "Doumbia M.", pos: "Marcory", lat: 290, lng: 200, status: "moving", speed: 35, battery: 12.1, gsm: 4, x: 210, y: 310 },
  { plate: "AB 580 CS", model: "Ford Transit", driver: "Fofana K.", pos: "Plateau", lat: 215, lng: 365, status: "stopped", speed: 0, battery: 9.4, gsm: 2, x: 375, y: 215 },
  { plate: "AB 723 GJ", model: "Mitsubishi L200", driver: "Bamba L.", pos: "Treichville", lat: 290, lng: 415, status: "offline", speed: 0, battery: 0, gsm: 0, x: 495, y: 340 },
];

const statusConfig = {
  moving: { color: C.green, label: "En déplacement", dot: "●" },
  alert: { color: C.orange, label: "En alerte", dot: "●" },
  stopped: { color: C.red, label: "À l'arrêt", dot: "●" },
  offline: { color: C.gray, label: "Hors ligne", dot: "●" },
};

const alerts = [
  { level: "critical", icon: AlertTriangle, title: "Dépassement de vitesse", desc: "AB 450 FC – 92 km/h (zone 70 km/h)", time: "10:12", plate: "AB 450 FC" },
  { level: "critical", icon: RadioTower, title: "Suspicion brouillage GPS (Jamming)", desc: "AB 580 CS – Signal perdu 4 min", time: "09:51", plate: "AB 580 CS" },
  { level: "major", icon: Map, title: "Sortie de zone autorisée", desc: "AA 328 XP – Zone Portuaire franchie", time: "09:47", plate: "AA 328 XP" },
  { level: "major", icon: BatteryCharging, title: "Batterie faible traceur", desc: "AB 580 CS – 9,4V (seuil: 11V)", time: "09:33", plate: "AB 580 CS" },
  { level: "medium", icon: KeyRound, title: "Ignition ON hors horaires", desc: "AA 386 KA – Démarrage 06:41", time: "08:56", plate: "AA 386 KA" },
  { level: "medium", icon: RadioTower, title: "Tracker déconnecté", desc: "AB 723 GJ – Silence 1h 12min", time: "08:21", plate: "AB 723 GJ" },
];

const incidents = [
  { icon: Activity, title: "Accident détecté (Choc G>3)", desc: "AB 450 FC – Cocody, Bd de France", time: "03:12", color: C.red },
  { icon: CircleDashed, title: "Freinage brusque (G-Force)", desc: "AA 328 XP – Yopougon, carrefour N1", time: "07:45", color: C.orange },
];

const reports = [
  { name: "Rapport déplacement quotidien", size: "2,4 Mo", type: "PDF" },
  { name: "Rapport infractions de vitesse", size: "1,8 Mo", type: "PDF" },
  { name: "Rapport consommation carburant", size: "2,1 Mo", type: "Excel" },
  { name: "Rapport des incidents", size: "1,3 Mo", type: "PDF" },
  { name: "Rapport maintenance", size: "1,7 Mo", type: "PDF" },
];

const fleetPie = [
  { name: "En déplacement", value: 20, color: C.green },
  { name: "À l'arrêt", value: 4, color: C.red },
  { name: "Hors ligne", value: 2, color: C.gray },
  { name: "En maintenance", value: 2, color: C.orange },
];

const incidentBar = [
  { date: "12/06", incidents: 3, alertes: 5 },
  { date: "13/06", incidents: 7, alertes: 10 },
  { date: "14/06", incidents: 4, alertes: 8 },
  { date: "15/06", incidents: 5, alertes: 7 },
  { date: "16/06", incidents: 6, alertes: 9 },
  { date: "17/06", incidents: 8, alertes: 12 },
  { date: "18/06", incidents: 2, alertes: 4 },
];

const quickActions = [
  { icon: Map, label: "Gestion des zones" },
  { icon: Gauge, label: "Gestion des vitesses" },
  { icon: Clock3, label: "Gestion des horaires" },
  { icon: ShieldCheck, label: "Moteur de règles" },
  { icon: FileText, label: "Génération rapports" },
];

const alertLevelConfig = {
  critical: { bg: "#450A0A", border: C.red, badge: "#EF4444", label: "CRITIQUE" },
  major: { bg: "#431407", border: C.orange, badge: "#F59E0B", label: "MAJEUR" },
  medium: { bg: "#1C1917", border: "#78716C", badge: "#78716C", label: "MOYEN" },
};

// ─── Clock ────────────────────────────────────────────────────────────────────
function LiveClock() {
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
      <div className="text-xs" style={{ color: C.textMuted }}>
        {days[time.getDay()]} {time.getDate()} {months[time.getMonth()]} {time.getFullYear()} · UTC+0
      </div>
      <div className="font-bold text-base tabular-nums" style={{ color: C.text, letterSpacing: "0.05em" }}>
        {fmt(time.getHours())}:{fmt(time.getMinutes())}:{fmt(time.getSeconds())}
      </div>
    </div>
  );
}

// ─── Blinking Dot ─────────────────────────────────────────────────────────────
function BlinkDot({ color }: { color: string }) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setOn((v) => !v), 900);
    return () => clearInterval(t);
  }, []);
  return <span className="w-2 h-2 rounded-full inline-block" style={{ background: on ? color : "transparent", transition: "background 0.2s" }} />;
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({ onNotifClick, onUserMenu }: { onNotifClick: () => void; onUserMenu: () => void }) {
  const [showOrgMenu, setShowOrgMenu] = useState(false);
  return (
    <header
      className="flex items-center gap-3 px-4 py-2.5 border-b flex-shrink-0"
      style={{ background: C.navyMid, borderColor: C.border, minHeight: 60 }}
    >
      <div className="flex items-center gap-3 flex-shrink-0" style={{ minWidth: 250, width: 250 }}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border flex-shrink-0" style={{ background: "#0B1320", borderColor: C.border }}>
            <img src={logoUrl} alt="SISBM logo" className="h-full w-full object-contain p-1.5" />
          </div>
          <span className="font-black text-xl leading-none tracking-tight" style={{ color: C.text }}>SISBM</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full border text-[11px] font-semibold leading-none whitespace-nowrap" style={{ borderColor: C.green, color: C.green, background: "#052E16" }}>
          <BlinkDot color={C.green} />
          Live · Serveur OK
        </div>
      </div>

      <div className="flex-1 min-w-0 max-w-[360px]">
        <div className="flex items-center gap-2 h-10 px-3 rounded-lg border" style={{ background: C.navy, borderColor: C.navyLight }}>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke={C.gray} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            placeholder="Immatriculation, conducteur, zone, traceur…"
            className="bg-transparent text-sm outline-none w-full min-w-0"
            style={{ color: C.textMuted }}
          />
          <kbd className="text-xs px-1.5 py-0.5 rounded leading-none" style={{ background: C.navyLight, color: C.textMuted }}>⌘K</kbd>
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto flex-shrink-0">
        <div className="flex min-w-[160px] justify-center">
          <LiveClock />
        </div>

        <div className="flex items-center gap-2 px-3 h-10 rounded-lg border whitespace-nowrap" style={{ background: "#1C1917", borderColor: "#44403C" }}>
          <span className="text-xs leading-none" style={{ color: C.textMuted }}>SMS restant</span>
          <span className="font-bold text-sm leading-none" style={{ color: "#FCD34D" }}>1 420</span>
          <button className="text-xs px-2 py-1 rounded font-semibold leading-none" style={{ background: "#92400E", color: "#FCD34D" }}>
            Recharger
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowOrgMenu(!showOrgMenu)}
            className="flex items-center gap-2 px-3 h-10 rounded-lg border text-sm whitespace-nowrap"
            style={{ background: C.navy, borderColor: C.navyLight, color: C.text }}
          >
            <span className="w-5 h-5 rounded text-xs font-bold flex items-center justify-center" style={{ background: C.primary }}>T</span>
            <span className="leading-none">Transports Kouamé</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          {showOrgMenu && (
            <div className="absolute right-0 top-full mt-1 w-52 rounded-xl border shadow-2xl py-1 z-50" style={{ background: C.navyMid, borderColor: C.navyLight }}>
              {['Transports Kouamé', 'Logistique Abidjan', 'Fleet CI SAS'].map((org) => (
                <button key={org} onClick={() => setShowOrgMenu(false)} className="w-full text-left px-4 py-2 text-sm hover:bg-[#334155]" style={{ color: C.text }}>
                  {org}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onNotifClick}
          className="relative w-10 h-10 rounded-lg flex items-center justify-center border flex-shrink-0"
          style={{ background: C.navy, borderColor: C.navyLight }}
        >
          <svg className="w-5 h-5" fill="none" stroke={C.textMuted} viewBox="0 0 24 24">
            <path d="M15 17H9m6 0a3 3 0 01-6 0m6 0h3.17A2 2 0 0020 15V9a7 7 0 00-14 0v6a2 2 0 001.83 2H9" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <BlinkDot color={C.red} />
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-xs font-bold flex items-center justify-center" style={{ background: C.red, color: "white", fontSize: 9 }}>7</span>
        </button>

        <button
          onClick={onUserMenu}
          className="flex items-center gap-2 px-2 h-10 rounded-lg border whitespace-nowrap flex-shrink-0"
          style={{ background: C.navy, borderColor: C.navyLight }}
        >
          <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs" style={{ background: C.primary, color: "white" }}>AD</div>
          <div className="text-left leading-none">
            <div className="text-xs font-semibold" style={{ color: C.text }}>Administrateur</div>
            <div className="text-xs mt-0.5" style={{ color: C.textMuted }}>Super Admin</div>
          </div>
          <svg className="w-3 h-3 ml-1" fill="none" stroke={C.gray} viewBox="0 0 24 24">
            <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </header>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive }: { active: string; setActive: (s: string) => void }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside
      className="flex flex-col h-full border-r transition-all duration-300"
      style={{ width: collapsed ? 56 : 220, minWidth: collapsed ? 56 : 220, background: C.navyMid, borderColor: C.border }}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="self-end m-2 w-7 h-7 rounded-lg flex items-center justify-center border"
        style={{ background: C.navy, borderColor: C.navyLight, color: C.textMuted }}
      >
        {collapsed ? "›" : "‹"}
      </button>

      <nav className="flex-1 overflow-y-auto pb-4">
        {navItems.map((item) => {
          const locked = tierOrder[item.tier as keyof typeof tierOrder] > tierOrder[userTier as keyof typeof tierOrder];
          const isActive = active === item.label;
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => !locked && setActive(item.label)}
              title={collapsed ? item.label : undefined}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-all relative group"
              style={{
                background: isActive ? "#1D4ED8" + "33" : "transparent",
                borderLeft: isActive ? `3px solid ${C.primary}` : "3px solid transparent",
                color: locked ? C.navyLight : isActive ? C.text : C.textMuted,
                cursor: locked ? "not-allowed" : "pointer",
              }}
            >
              <span className="text-base w-5 text-center flex-shrink-0 flex items-center justify-center">
                {locked ? <Shield className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </span>
              {!collapsed && (
                <>
                  <span className="flex-1 truncate font-medium" style={{ color: locked ? "#475569" : isActive ? C.text : C.textMuted }}>
                    {item.label}
                  </span>
                  {item.badge ? (
                    <span className="text-xs rounded-full px-1.5 font-bold" style={{ background: C.red, color: "white", minWidth: 18, textAlign: "center" }}>
                      {item.badge}
                    </span>
                  ) : null}
                  {locked && (
                    <span className="text-xs rounded px-1" style={{ background: item.tier === "premium" ? "#4C1D95" : "#78350F", color: item.tier === "premium" ? "#C4B5FD" : "#FCD34D" }}>
                      {item.tier === "premium" ? "Premium" : "Gold"}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer brand */}
      {!collapsed && (
        <div className="px-4 py-4 border-t" style={{ borderColor: C.border }}>
          <div className="flex items-center gap-1 mb-1">
            <div className="grid grid-cols-3 gap-0.5">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-sm" style={{ background: C.primary }} />
              ))}
            </div>
            <span className="font-bold text-sm ml-1" style={{ color: C.text }}>SISBM</span>
          </div>
          <p className="text-xs leading-tight" style={{ color: C.textMuted }}>Sécuriser · Construire<br />Connecter · Former</p>
          <div className="mt-2 text-xs px-2 py-1 rounded" style={{ background: "#1e3a5f", color: C.primaryLight }}>
            Plan Gold · Actif
          </div>
        </div>
      )}
    </aside>
  );
}

// ─── Map ──────────────────────────────────────────────────────────────────────
function AbidjanMap({ onVehicleClick }: { onVehicleClick: (v: typeof vehicles[0]) => void }) {
  const [filterStatus, setFilterStatus] = useState("all");
  const filtered = filterStatus === "all" ? vehicles : vehicles.filter((v) => v.status === filterStatus);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border" style={{ background: C.navyMid, borderColor: C.border }}>
      <iframe
        title="Google Maps Abidjan"
        src="https://www.google.com/maps?q=Abidjan%2C%20C%C3%B4te%20d'Ivoire&z=11&output=embed"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute inset-0 h-full w-full border-0"
      />

      <div className="absolute inset-0 bg-slate-950/10" />

      <div className="absolute inset-0 z-10">
        {filtered.map((v) => {
          const sc = statusConfig[v.status as keyof typeof statusConfig];
          const left = `${(v.x / 650) * 100}%`;
          const top = `${(v.y / 420) * 100}%`;

          return (
            <button
              key={v.plate}
              type="button"
              onClick={() => onVehicleClick(v)}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 rounded-full border shadow-lg"
              style={{
                left,
                top,
                background: sc.color,
                borderColor: "rgba(255,255,255,0.7)",
                boxShadow: `0 0 0 3px ${sc.color}33`,
                padding: "4px 8px",
              }}
              title={`${v.plate} · ${v.pos}`}
            >
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-white" />
              <span className="text-[9px] font-bold text-white tracking-wide">{v.plate}</span>
            </button>
          );
        })}
      </div>

      <div className="absolute top-3 right-3 z-20">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-lg border outline-none"
          style={{ background: C.navyMid, borderColor: C.border, color: C.text }}
        >
          <option value="all">Toutes les catégories</option>
          <option value="moving">En déplacement</option>
          <option value="alert">En alerte</option>
          <option value="stopped">À l'arrêt</option>
          <option value="offline">Hors ligne</option>
        </select>
      </div>

      <div className="absolute bottom-3 right-3 z-20 rounded-xl border shadow-lg px-3 py-2 text-xs space-y-1.5" style={{ background: C.navyMid + "ee", borderColor: C.border }}>
        {Object.entries(statusConfig).map(([k, v]) => (
          <div key={k} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: v.color }} />
            <span style={{ color: C.textDim }}>{v.label}</span>
            <span className="ml-auto font-bold" style={{ color: C.text }}>
              {vehicles.filter((veh) => veh.status === k).length}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Vehicle Popover ──────────────────────────────────────────────────────────
function VehiclePopover({ vehicle, onClose, onImmobilize }: { vehicle: typeof vehicles[0]; onClose: () => void; onImmobilize: () => void }) {
  const sc = statusConfig[vehicle.status as keyof typeof statusConfig];
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div
        className="rounded-2xl border shadow-2xl p-5 w-80"
        style={{ background: C.navyMid, borderColor: C.navyLight }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg" style={{ color: C.text }}>{vehicle.plate}</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: sc.color + "22", color: sc.color, border: `1px solid ${sc.color}` }}>
                {sc.label}
              </span>
            </div>
            <p className="text-sm mt-0.5" style={{ color: C.textMuted }}>{vehicle.model} · {vehicle.driver}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: C.navy, color: C.textMuted }}>✕</button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: "Vitesse", value: `${vehicle.speed} km/h`, icon: "⚡", warn: vehicle.speed > 80 },
            { label: "Contact", value: vehicle.speed > 0 ? "Ignition ON" : "Ignition OFF", icon: "🔑", warn: false },
            { label: "Batterie", value: `${vehicle.battery}V`, icon: "🔋", warn: vehicle.battery < 11 },
            { label: "Signal GSM", value: `${vehicle.gsm}/4`, icon: "📶", warn: vehicle.gsm < 2 },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl p-3" style={{ background: C.navy, border: `1px solid ${stat.warn ? C.red + "44" : C.border}` }}>
              <div className="text-sm mb-0.5">{stat.icon}</div>
              <div className="text-xs" style={{ color: C.textMuted }}>{stat.label}</div>
              <div className="font-bold text-sm" style={{ color: stat.warn ? C.red : C.text }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Position */}
        <div className="rounded-xl px-3 py-2 mb-4 flex items-center gap-2" style={{ background: C.navy, border: `1px solid ${C.border}` }}>
          <span className="text-sm">📍</span>
          <div>
            <p className="text-xs" style={{ color: C.textMuted }}>Dernière position</p>
            <p className="text-sm font-semibold" style={{ color: C.text }}>{vehicle.pos}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onImmobilize}
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl font-semibold text-xs border transition-all hover:opacity-90"
            style={{ background: "#7F1D1D", color: "#FCA5A5", border: `1px solid ${C.red}44` }}
          >
            🔌 Couper moteur
          </button>
          <button className="flex items-center justify-center gap-1.5 py-2 rounded-xl font-semibold text-xs border" style={{ background: C.navy, color: C.textDim, border: `1px solid ${C.border}` }}>
            🎬 Rejouer trajet
          </button>
          <button className="flex items-center justify-center gap-1.5 py-2 rounded-xl font-semibold text-xs border" style={{ background: C.navy, color: C.textDim, border: `1px solid ${C.border}` }}>
            📋 Historique
          </button>
          <button className="flex items-center justify-center gap-1.5 py-2 rounded-xl font-semibold text-xs border" style={{ background: C.navy, color: C.textDim, border: `1px solid ${C.border}` }}>
            🔔 Créer alerte
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Immobilization Modal ─────────────────────────────────────────────────────
function ImmobilizationModal({ vehicle, onClose }: { vehicle: typeof vehicles[0] | null; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"confirm" | "success">("confirm");
  const [checks] = useState([
    { label: "Vitesse nulle vérifiée", ok: vehicle?.speed === 0 },
    { label: "Moteur à l'arrêt ou résiduel", ok: vehicle?.speed === 0 },
    { label: "Signal GPS actif", ok: (vehicle?.gsm ?? 0) > 0 },
    { label: "Connexion traceur établie", ok: vehicle?.status !== "offline" },
  ]);

  if (!vehicle) return null;
  const allChecksOk = checks.every((c) => c.ok);
  const canExecute = reason && password.length >= 4;

  if (step === "success") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.8)" }}>
        <div className="rounded-2xl border p-8 text-center" style={{ background: C.navyMid, borderColor: C.green + "66", width: 360 }}>
          <div className="text-5xl mb-4">✅</div>
          <h3 className="font-bold text-lg mb-2" style={{ color: C.text }}>Commande envoyée</h3>
          <p className="text-sm mb-4" style={{ color: C.textMuted }}>SMS RELAY,1# envoyé au traceur du véhicule {vehicle.plate}. Confirmation attendue sous 30s.</p>
          <button onClick={onClose} className="px-6 py-2 rounded-xl font-semibold text-sm" style={{ background: C.primary, color: "white" }}>Fermer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.8)" }} onClick={onClose}>
      <div className="rounded-2xl border shadow-2xl w-[500px]" style={{ background: C.navyMid, borderColor: C.red + "44" }} onClick={(e) => e.stopPropagation()}>
        {/* Title bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: C.border }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: "#7F1D1D" }}>🔌</div>
            <div>
              <h3 className="font-bold text-sm" style={{ color: C.text }}>Commande d'Immobilisation Sécurisée</h3>
              <p className="text-xs" style={{ color: C.textMuted }}>Micodus MV730 / Relais S20 · {vehicle.plate}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: C.navy, color: C.textMuted }}>✕</button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Warning banner */}
          <div className="rounded-xl px-4 py-3 border" style={{ background: "#431407", borderColor: C.orange + "66" }}>
            <div className="flex items-start gap-2">
              <span className="text-base mt-0.5">⚠️</span>
              <div>
                <p className="text-xs font-bold mb-1" style={{ color: C.orange }}>AVERTISSEMENT DE SÉCURITÉ</p>
                <p className="text-xs leading-relaxed" style={{ color: "#FCD34D" }}>
                  Cette action coupe l'alimentation moteur via relais physique. Elle ne doit être exécutée qu'avec l'accord du responsable de flotte et en conformité avec le cadre légal ivoirien.
                </p>
              </div>
            </div>
          </div>

          {/* 4 safety checks */}
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: C.textMuted }}>Vérification des 4 verrous de sécurité</p>
            <div className="space-y-2">
              {checks.map((c, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: C.navy, border: `1px solid ${c.ok ? C.green + "33" : C.red + "33"}` }}>
                  <span className="text-sm">{c.ok ? "✅" : "❌"}</span>
                  <span className="text-xs" style={{ color: c.ok ? C.green : C.red }}>{c.label}</span>
                  <span className="ml-auto text-xs font-semibold" style={{ color: c.ok ? C.green : C.red }}>{c.ok ? "OK" : "BLOQUANT"}</span>
                </div>
              ))}
            </div>
            {!allChecksOk && (
              <p className="text-xs mt-2 text-center" style={{ color: C.red }}>
                ⛔ Des verrous de sécurité ne sont pas satisfaits. Immobilisation risquée.
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: C.textMuted }}>Motif d'immobilisation *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
              style={{ background: C.navy, borderColor: reason ? C.primary : C.border, color: reason ? C.text : C.textMuted }}
            >
              <option value="">Sélectionner un motif obligatoire…</option>
              <option value="theft">🚨 Vol suspecté</option>
              <option value="hours">🕐 Usage hors horaires autorisés</option>
              <option value="payment">💳 Non-paiement / Impayé</option>
              <option value="emergency">🆘 Urgence sécuritaire</option>
              <option value="maintenance">🔧 Maintenance d'urgence</option>
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: C.textMuted }}>Mot de passe opérateur *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
              style={{ background: C.navy, borderColor: password.length >= 4 ? C.primary : C.border, color: C.text }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t" style={{ borderColor: C.border }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl font-semibold text-sm border" style={{ borderColor: C.border, color: C.textMuted, background: C.navy }}>
            Annuler
          </button>
          <button
            disabled={!canExecute}
            onClick={() => canExecute && setStep("success")}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
            style={{
              background: canExecute ? C.red : "#374151",
              color: canExecute ? "white" : C.gray,
              cursor: canExecute ? "pointer" : "not-allowed",
            }}
          >
            🔌 Exécuter la coupure <span className="text-xs font-mono opacity-70">(RELAY,1#)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, subColor, trend }: {
  icon: any; label: string; value: string; sub: string; subColor: string; trend?: string | null;
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all hover:border-blue-700"
      style={{
        background: C.cardBg,
        borderColor: C.border,
        minHeight: 96,
        boxShadow: "inset 0 0 0 1px rgba(148,163,184,0.05)",
      }}
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full border flex-shrink-0"
        style={{ background: "rgba(15, 23, 42, 0.9)", borderColor: "rgba(148, 163, 184, 0.2)" }}
      >
        <Icon className="h-4 w-4" style={{ color: C.text }} />
      </div>
      <div className="min-w-0 flex-1 leading-none">
        <p className="text-[13px] font-medium leading-none" style={{ color: C.textMuted }}>{label}</p>
        <p className="mt-2 font-black text-[24px] leading-none tracking-[-0.04em]" style={{ color: C.text }}>{value}</p>
        <p className="mt-2 text-[12px] leading-none" style={{ color: subColor === "green" ? C.green : subColor === "red" ? C.red : C.textMuted }}>{sub}</p>
      </div>
    </div>
  );
}

// ─── Alerts Panel ─────────────────────────────────────────────────────────────
function AlertsPanel() {
  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      {/* Alerts */}
      <div className="rounded-xl border p-4" style={{ background: C.cardBg, borderColor: C.border }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm" style={{ color: C.text }}>Alertes récentes</span>
            <span className="text-xs rounded-full px-2 py-0.5 font-bold" style={{ background: C.red, color: "white" }}>7</span>
          </div>
          <button className="text-xs font-semibold" style={{ color: C.primary }}>Voir tout</button>
        </div>
        <div className="space-y-2.5">
          {alerts.map((a, i) => {
            const lvl = alertLevelConfig[a.level as keyof typeof alertLevelConfig];
            const Icon = a.icon;
            return (
              <div key={i} className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl border" style={{ background: lvl.bg, borderColor: lvl.border + "44" }}>
                <span className="flex-shrink-0 mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-white/5">
                  <Icon className="h-3.5 w-3.5" style={{ color: C.text }} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-black rounded px-1.5 py-0.5" style={{ background: lvl.badge, color: "white", fontSize: 9 }}>{lvl.label}</span>
                    <span className="text-xs font-mono" style={{ color: C.primary }}>{a.plate}</span>
                  </div>
                  <p className="text-xs font-semibold truncate" style={{ color: C.text }}>{a.title}</p>
                  <p className="text-xs truncate" style={{ color: C.textMuted }}>{a.desc}</p>
                </div>
                <span className="text-xs flex-shrink-0 font-mono" style={{ color: C.textMuted }}>{a.time}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Incidents */}
      <div className="rounded-xl border p-4" style={{ background: C.cardBg, borderColor: C.border }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm" style={{ color: C.text }}>Incidents en cours</span>
            <span className="text-xs rounded-full px-2 py-0.5 font-bold" style={{ background: C.orange, color: "white" }}>2</span>
          </div>
          <button className="text-xs font-semibold" style={{ color: C.primary }}>Voir tout</button>
        </div>
        <div className="space-y-2.5">
          {incidents.map((inc, i) => {
            const Icon = inc.icon;
            return (
              <div key={i} className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl border" style={{ background: inc.color + "11", borderColor: inc.color + "33" }}>
                <span className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg bg-white/5">
                  <Icon className="h-3.5 w-3.5" style={{ color: C.text }} />
                </span>
                <div className="flex-1">
                  <p className="text-xs font-semibold" style={{ color: C.text }}>{inc.title}</p>
                  <p className="text-xs" style={{ color: C.textMuted }}>{inc.desc}</p>
                </div>
                <span className="text-xs font-mono" style={{ color: C.textMuted }}>{inc.time}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reports */}
      <div className="rounded-xl border p-4" style={{ background: C.cardBg, borderColor: C.border }}>
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-sm" style={{ color: C.text }}>Rapports populaires</span>
          <button className="text-xs font-semibold" style={{ color: C.primary }}>Voir tout</button>
        </div>
        <div className="space-y-2">
          {reports.map((r, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: r.type === "PDF" ? "#450A0A" : "#052E16" }}>
                <span className="text-xs font-bold" style={{ color: r.type === "PDF" ? C.red : C.green }}>{r.type === "PDF" ? "P" : "X"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: C.text }}>{r.name}</p>
                <p className="text-xs" style={{ color: C.textMuted }}>{r.type} – {r.size}</p>
              </div>
              <button className="text-xs px-2 py-1 rounded-lg font-medium flex-shrink-0 border" style={{ borderColor: C.border, color: C.textDim, background: C.navy }}>
                ⬇
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Fleet Table ──────────────────────────────────────────────────────────────
function FleetTable({ onImmobilize }: { onImmobilize: (v: typeof vehicles[0]) => void }) {
  return (
    <div className="rounded-2xl border p-4" style={{ background: "#16273d", borderColor: "#24364f" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-[16px]" style={{ color: C.text }}>Flux des véhicules en direct</span>
          <span className="text-xs" style={{ color: C.textMuted }}>(dernières 24h)</span>
        </div>
        <div className="flex items-center gap-2">
          {[
            { label: "Tous", active: true },
            { label: "En déplacement", active: false },
            { label: "À l'arrêt", active: false },
          ].map((f) => (
            <button
              key={f.label}
              className="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all"
              style={{
                background: f.active ? "#1f2d3d" : "transparent",
                color: f.active ? C.text : C.textMuted,
                border: `1px solid ${f.active ? "#3a4c63" : C.border}`,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Véhicule", "Conducteur", "Dernière position", "Statut", "Vitesse", "Batterie", "Actions"].map((h) => (
                <th key={h} className="text-left pb-2.5 pr-3 font-semibold" style={{ color: C.textMuted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v, i) => {
              const sc = statusConfig[v.status as keyof typeof statusConfig];
              return (
                <tr key={i} className="group transition-colors" style={{ borderBottom: `1px solid ${C.border + "55"}` }}>
                  <td className="py-3 pr-3 align-middle">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: sc.color }} />
                      <div>
                        <span className="font-mono font-bold" style={{ color: C.text }}>{v.plate}</span>
                        <p className="text-xs" style={{ color: C.textMuted }}>{v.model}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3 align-middle" style={{ color: C.textDim }}>{v.driver}</td>
                  <td className="py-3 pr-3 align-middle" style={{ color: C.textMuted }}>{v.pos}</td>
                  <td className="py-3 pr-3 align-middle">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] font-semibold leading-none" style={{ background: sc.color + "22", color: sc.color, border: `1px solid ${sc.color}44` }}>
                      {sc.label}
                    </span>
                  </td>
                  <td className="py-3 pr-3 align-middle">
                    <span className="inline-flex items-center leading-none font-mono font-bold" style={{ color: v.speed > 80 ? C.red : v.speed > 0 ? C.green : C.textMuted }}>
                      {v.speed} km/h
                    </span>
                  </td>
                  <td className="py-3 pr-3 align-middle">
                    <span className="font-mono" style={{ color: v.battery < 11 ? C.red : v.battery < 12 ? C.orange : C.green }}>
                      {v.battery > 0 ? `${v.battery}V` : "N/A"}
                    </span>
                  </td>
                  <td className="py-3 align-middle">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onImmobilize(v)}
                        className="px-2 py-1 rounded-lg text-xs font-semibold border"
                        style={{ background: "#7F1D1D", color: "#FCA5A5", borderColor: C.red + "44" }}
                      >
                        🔌 Couper
                      </button>
                      <button className="px-2 py-1 rounded-lg text-xs border" style={{ background: C.navy, color: C.textMuted, borderColor: C.border }}>📋</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button className="mt-4 text-xs font-semibold flex items-center gap-1" style={{ color: C.primary }}>
        Voir tous les véhicules →
      </button>
    </div>
  );
}

// ─── User Menu Dropdown ───────────────────────────────────────────────────────
function UserMenu({ onClose }: { onClose: () => void }) {
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
          { icon: "👤", label: "Mon profil" },
          { icon: "🛡️", label: "Sécurité & RBAC" },
          { icon: "⚙️", label: "Paramètres" },
          { icon: "📋", label: "Journal d'activité" },
        ].map((item) => (
          <button key={item.label} onClick={onClose} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5" style={{ color: C.textDim }}>
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

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeNav, setActiveNav] = useState("Tableau de bord");
  const [selectedVehicle, setSelectedVehicle] = useState<typeof vehicles[0] | null>(null);
  const [immobilizeTarget, setImmobilizeTarget] = useState<typeof vehicles[0] | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const handleImmobilize = (v: typeof vehicles[0]) => {
    setSelectedVehicle(null);
    setImmobilizeTarget(v);
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: C.bg, fontFamily: "Inter, sans-serif" }}>
      {/* Sidebar */}
      <Sidebar active={activeNav} setActive={setActiveNav} />

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onNotifClick={() => setShowNotif(!showNotif)}
          onUserMenu={() => setShowUserMenu(!showUserMenu)}
        />

        {/* Dashboard content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: C.bg }}>
          {/* KPIs */}
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(5, minmax(0, 1fr))" }}>
            {[
              { icon: CarFront, label: "Véhicules en service", value: "24 / 28", sub: "● 86% opérationnels", subColor: "green" },
              { icon: MapPinned, label: "En déplacement", value: "20", sub: "● Temps réel", subColor: "green" },
              { icon: CircleDashed, label: "À l'arrêt", value: "4", sub: "● Hors service 2 | Pause 2", subColor: "red" },
              { icon: Gauge, label: "Vitesse moyenne flotte", value: "48 km/h", sub: "▼ −12% vs hier", subColor: "green" },
              { icon: Fuel, label: "Consommation estimée", value: "342 L", sub: "▼ −8% vs hier", subColor: "green" },
            ].map((kpi, i) => <KpiCard key={i} {...kpi} />)}
          </div>

          {/* Map + Right panel */}
          <div className="flex gap-4" style={{ height: 420 }}>
            {/* Map */}
            <div className="flex-1 rounded-xl border flex flex-col overflow-hidden" style={{ background: C.cardBg, borderColor: C.border }}>
              <div className="px-4 py-2.5 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: C.border }}>
                <div className="flex items-center gap-2">
                  <BlinkDot color={C.green} />
                  <span className="font-bold text-sm" style={{ color: C.text }}>Suivi en temps réel</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: C.green + "22", color: C.green }}>28 véhicules actifs</span>
                </div>
                <button className="text-xs px-2 py-1 rounded-lg border" style={{ background: C.navy, borderColor: C.border, color: C.textMuted }}>⛶ Plein écran</button>
              </div>
              <div className="flex-1 p-2">
                <AbidjanMap onVehicleClick={setSelectedVehicle} />
              </div>
            </div>

            {/* Right panel */}
            <div style={{ width: 320, minWidth: 320 }}>
              <AlertsPanel />
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
            {quickActions.map((qa, i) => {
              const Icon = qa.icon;
              return (
                <button
                  key={i}
                  className="flex flex-col items-center gap-2 px-3 py-4 rounded-xl border text-center transition-all hover:border-blue-600 group"
                  style={{ background: C.cardBg, borderColor: C.border }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all" style={{ background: C.navy }}>
                    <Icon className="h-5 w-5" style={{ color: C.text }} />
                  </div>
                  <p className="text-xs font-semibold" style={{ color: C.text }}>{qa.label}</p>
                </button>
              );
            })}
          </div>

          {/* Bottom: Table + Charts */}
          <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <FleetTable onImmobilize={handleImmobilize} />

            {/* Charts column */}
            <div className="flex flex-col gap-4">
              {/* Fleet pie */}
              <div className="rounded-2xl border p-4" style={{ background: "#16273d", borderColor: "#24364f" }}>
                <span className="font-bold text-[16px] block mb-3" style={{ color: C.text }}>État de la flotte</span>
                <div className="flex items-center gap-5">
                  <div className="relative flex-shrink-0">
                    <PieChart width={170} height={170}>
                      <Pie data={fleetPie} cx={85} cy={85} innerRadius={42} outerRadius={68} dataKey="value" startAngle={90} endAngle={-270}>
                        {fleetPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                    </PieChart>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="font-black text-[30px] leading-none" style={{ color: C.text }}>28</span>
                      <span className="text-xs mt-1" style={{ color: C.textMuted }}>Total</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3 py-2">
                    {fleetPie.map((f, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: f.color }} />
                        <span className="text-xs flex-1" style={{ color: C.textDim }}>{f.name}</span>
                        <span className="text-xs font-bold" style={{ color: C.text }}>{f.value}</span>
                        <span className="text-xs" style={{ color: C.textMuted }}>({Math.round((f.value / 28) * 100)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bar chart */}
              <div className="rounded-2xl border p-4 flex-1" style={{ background: "#16273d", borderColor: "#24364f" }}>
                <span className="font-bold text-[16px] block mb-3" style={{ color: C.text }}>Évolution des incidents (7j)</span>
                <ResponsiveContainer width="100%" height={155}>
                  <BarChart data={incidentBar} barSize={12} barGap={6}>
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: C.textMuted }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: C.textMuted }} axisLine={false} tickLine={false} width={18} />
                    <Tooltip contentStyle={{ background: C.navyMid, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11, color: C.text }} cursor={{ fill: "#ffffff08" }} />
                    <Legend wrapperStyle={{ fontSize: 10, color: C.textMuted, paddingTop: 8 }} />
                    <Bar dataKey="alertes" name="Alertes" fill={C.primary} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="incidents" name="Incidents" fill={C.red} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlays */}
      {selectedVehicle && (
        <VehiclePopover vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} onImmobilize={() => handleImmobilize(selectedVehicle)} />
      )}
      {immobilizeTarget && (
        <ImmobilizationModal vehicle={immobilizeTarget} onClose={() => setImmobilizeTarget(null)} />
      )}
      {showUserMenu && <UserMenu onClose={() => setShowUserMenu(false)} />}
    </div>
  );
}
