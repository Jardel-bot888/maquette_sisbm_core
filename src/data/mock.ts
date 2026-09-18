// ─── Données simulées SISBM CORE ─────────────────────────────────────────────
// Jeu de données mock cohérent avec les scénarios du rapport fonctionnel
// (véhicules, alertes, incidents, rapports, conducteurs, maintenance, SMS…).

import {
  LayoutGrid, MapPinned, Map, Gauge, Clock3, BellRing, TriangleAlert,
  ShieldCheck, FileText, Wrench, Users, MessageSquareText, Shield,
  type LucideIcon,
} from "lucide-react";
import { C } from "@/theme";
import { ABIDJAN_CENTER, vehicleGeo } from "@/data/geo";

// ─── Navigation ───────────────────────────────────────────────────────────────
export type NavItem = { icon: LucideIcon; label: string; tier: string; badge?: number };

export const navItems: NavItem[] = [
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

export const userTier: string = "gold"; // formule simulée de l'utilisateur courant

// ─── Véhicules ───────────────────────────────────────────────────────────────
// `lat`/`lng` sont désormais de VRAIES coordonnées WGS84 (degrés décimaux),
// résolues depuis le référentiel `@/data/geo` : placées sur une carte tuilée
// (OSM / Esri / CARTO), les positions correspondent au terrain. L'ancien
// référentiel pixel `x/y` (repère arbitraire 650×420) a été supprimé.
export type Vehicle = {
  plate: string; model: string; driver: string; pos: string; lat: number; lng: number;
  status: "moving" | "alert" | "stopped" | "offline"; speed: number; battery: number;
  gsm: number; mileage?: number;
};

type VehicleSeed = Omit<Vehicle, "lat" | "lng">;

/** Résout la position terrain d'un véhicule depuis le référentiel géographique. */
const withGeo = (v: VehicleSeed): Vehicle => {
  const g = vehicleGeo[v.plate] ?? ABIDJAN_CENTER;
  return { ...v, lat: g.lat, lng: g.lng };
};

const seedVehicles: VehicleSeed[] = [
  { plate: "AA 386 KA", model: "Peugeot Partner", driver: "Traoré S.", pos: "Yopougon", status: "moving", speed: 62, battery: 12.4, gsm: 4, mileage: 48320 },
  { plate: "AB 450 FC", model: "Toyota Hilux", driver: "Kouamé B.", pos: "Cocody", status: "alert", speed: 92, battery: 11.8, gsm: 3, mileage: 61204 },
  { plate: "AA 328 XP", model: "Renault Master", driver: "Doumbia M.", pos: "Marcory", status: "moving", speed: 35, battery: 12.1, gsm: 4, mileage: 39510 },
  { plate: "AB 580 CS", model: "Ford Transit", driver: "Fofana K.", pos: "Plateau", status: "stopped", speed: 0, battery: 9.4, gsm: 2, mileage: 55132 },
  { plate: "AB 723 GJ", model: "Mitsubishi L200", driver: "Bamba L.", pos: "Treichville", status: "offline", speed: 0, battery: 0, gsm: 0, mileage: 72890 },
];

export const vehicles: Vehicle[] = seedVehicles.map(withGeo);

// Véhicules étendus pour les listes / tableaux des autres modules
const extraVehicles: VehicleSeed[] = [
  { plate: "AA 942 MB", model: "Kia K2500", driver: "Koné A.", pos: "Adjamé", status: "moving", speed: 41, battery: 12.2, gsm: 4, mileage: 21847 },
  { plate: "AB 117 DA", model: "Toyota Land Cruiser", driver: "Diabaté O.", pos: "Abobo", status: "moving", speed: 55, battery: 12.6, gsm: 4, mileage: 90412 },
  { plate: "AA 607 AC", model: "Mercedes Sprinter", driver: "Ouattara I.", pos: "Port-Bouët", status: "stopped", speed: 0, battery: 11.2, gsm: 3, mileage: 66503 },
  { plate: "AB 235 BF", model: "Peugeot Boxer", driver: "Soro Y.", pos: "Attécoubé", status: "moving", speed: 28, battery: 11.9, gsm: 3, mileage: 33610 },
  { plate: "AA 814 KC", model: "Hyundai H350", driver: "Koffi N.", pos: "Koumassi", status: "moving", speed: 47, battery: 12.0, gsm: 4, mileage: 28913 },
  { plate: "AB 059 ZX", model: "Isuzu D-Max", driver: "Gnahoré F.", pos: "Bingerville", status: "offline", speed: 0, battery: 0, gsm: 1, mileage: 80107 },
  { plate: "AA 376 TJ", model: "Nissan Navara", driver: "Yaou P.", pos: "Songon", status: "stopped", speed: 0, battery: 10.8, gsm: 3, mileage: 44286 },
];

export const allVehicles: Vehicle[] = [...vehicles, ...extraVehicles.map(withGeo)];

// ─── Alertes récentes (dashboard) ─────────────────────────────────────────────
export const alerts = [
  { level: "critical", icon: "AlertTriangle", title: "Dépassement de vitesse", desc: "AB 450 FC – 92 km/h (zone 70 km/h)", time: "10:12", plate: "AB 450 FC" },
  { level: "critical", icon: "RadioTower", title: "Suspicion brouillage GPS (Jamming)", desc: "AB 580 CS – Signal perdu 4 min", time: "09:51", plate: "AB 580 CS" },
  { level: "major", icon: "Map", title: "Sortie de zone autorisée", desc: "AA 328 XP – Zone Portuaire franchie", time: "09:47", plate: "AA 328 XP" },
  { level: "major", icon: "BatteryCharging", title: "Batterie faible traceur", desc: "AB 580 CS – 9,4V (seuil: 11V)", time: "09:33", plate: "AB 580 CS" },
  { level: "medium", icon: "KeyRound", title: "Ignition ON hors horaires", desc: "AA 386 KA – Démarrage 06:41", time: "08:56", plate: "AA 386 KA" },
  { level: "medium", icon: "RadioTower", title: "Tracker déconnecté", desc: "AB 723 GJ – Silence 1h 12min", time: "08:21", plate: "AB 723 GJ" },
];

// ─── Alertes SMS complètes (Centre d'alertes SMS) ─────────────────────────────
export const smsAlerts = [
  { id: "A-1023", level: "critical", title: "Dépassement de vitesse", desc: "AB 450 FC – 92 km/h (limite 70 km/h)", time: "10:12", plate: "AB 450 FC", recipient: "Kouamé B. (+225 07 45 12 34)", chan: "SMS", cost: "25 F", status: "Envoyée" },
  { id: "A-1022", level: "critical", title: "Brouillage GPS (Jamming)", desc: "AB 580 CS – Signal perdu 4 min", time: "09:51", plate: "AB 580 CS", recipient: "SOC SISBM (+225 27 21 75 00)", chan: "SMS + App", cost: "25 F", status: "Envoyée" },
  { id: "A-1021", level: "major", title: "Sortie de zone autorisée", desc: "AA 328 XP – Zone Portuaire franchie", time: "09:47", plate: "AA 328 XP", recipient: "Doumbia M. (+225 01 03 88 21)", chan: "SMS", cost: "25 F", status: "Envoyée" },
  { id: "A-1020", level: "major", title: "Batterie faible traceur", desc: "AB 580 CS – 9,4V (seuil 11V)", time: "09:33", plate: "AB 580 CS", recipient: "Maintenance SISBM", chan: "SMS", cost: "25 F", status: "Envoyée" },
  { id: "A-1019", level: "medium", title: "Ignition ON hors horaires", desc: "AA 386 KA – Démarrage 06:41", time: "08:56", plate: "AA 386 KA", recipient: "Traoré S. (+225 07 08 99 45)", chan: "SMS", cost: "25 F", status: "Envoyée" },
  { id: "A-1018", level: "medium", title: "Tracker déconnecté", desc: "AB 723 GJ – Silence 1h 12min", time: "08:21", plate: "AB 723 GJ", recipient: "Bamba L. (+225 05 44 71 90)", chan: "SMS", cost: "25 F", status: "Échec (réessai)" },
  { id: "A-1017", level: "medium", title: "Démarrage moteur", desc: "AA 942 MB – Ignition ON 07:58", time: "07:58", plate: "AA 942 MB", recipient: "Koné A. (+225 01 40 62 33)", chan: "SMS", cost: "25 F", status: "Envoyée" },
];

// ─── Incidents ────────────────────────────────────────────────────────────────
export const incidents = [
  { icon: "Activity", title: "Accident détecté (Choc G>3)", desc: "AB 450 FC – Cocody, Bd de France", time: "03:12", color: C.red },
  { icon: "CircleDashed", title: "Freinage brusque (G-Force)", desc: "AA 328 XP – Yopougon, carrefour N1", time: "07:45", color: C.orange },
];

export const allIncidents = [
  { id: "INC-2041", type: "Accident détecté (Choc G>3)", vehicle: "AB 450 FC", zone: "Cocody – Bd de France", time: "Aujourd'hui 03:12", status: "En cours", color: C.red },
  { id: "INC-2040", type: "Freinage brusque (G-Force)", vehicle: "AA 328 XP", zone: "Yopougon – Carrefour N1", time: "Aujourd'hui 07:45", status: "En cours", color: C.orange },
  { id: "INC-2039", type: "Remorquage non planifié", vehicle: "AB 580 CS", zone: "Plateau – Av. Noguès", time: "Hier 22:18", status: "Clôturé", color: C.green },
  { id: "INC-2038", type: "Vibration anormale", vehicle: "AA 386 KA", zone: "Yopougon", time: "Hier 16:02", status: "Clôturé", color: C.green },
  { id: "INC-2037", type: "Sortie de route légère", vehicle: "AA 942 MB", zone: "Adjamé – Bd du Gabon", time: "12/06 14:30", status: "Audit SISBM", color: C.primary },
  { id: "INC-2035", type: "Départ sans autorisation", vehicle: "AB 059 ZX", zone: "Bingerville", time: "11/06 09:12", status: "Clôturé", color: C.green },
];

// ─── Rapports ─────────────────────────────────────────────────────────────────
export const reports = [
  { name: "Rapport déplacement quotidien", size: "2,4 Mo", type: "PDF" },
  { name: "Rapport infractions de vitesse", size: "1,8 Mo", type: "PDF" },
  { name: "Rapport consommation carburant", size: "2,1 Mo", type: "Excel" },
  { name: "Rapport des incidents", size: "1,3 Mo", type: "PDF" },
  { name: "Rapport maintenance", size: "1,7 Mo", type: "PDF" },
];

export const allReports = [
  { name: "Rapport déplacement quotidien", type: "PDF", size: "2,4 Mo", period: "Quotidien", downloads: 148 },
  { name: "Rapport infractions de vitesse", type: "PDF", size: "1,8 Mo", period: "Hebdomadaire", downloads: 96 },
  { name: "Rapport consommation carburant", type: "Excel", size: "2,1 Mo", period: "Mensuel", downloads: 74 },
  { name: "Rapport des incidents", type: "PDF", size: "1,3 Mo", period: "Hebdomadaire", downloads: 61 },
  { name: "Rapport maintenance", type: "PDF", size: "1,7 Mo", period: "Mensuel", downloads: 39 },
  { name: "Rapport itinéraires & arrêts", type: "Excel", size: "3,0 Mo", period: "Quotidien", downloads: 52 },
  { name: "Rapport batteries traceurs", type: "PDF", size: "0,9 Mo", period: "Hebdomadaire", downloads: 28 },
];

// ─── Graphiques dashboard ─────────────────────────────────────────────────────
export const fleetPie = [
  { name: "En déplacement", value: 20, color: C.green },
  { name: "À l'arrêt", value: 4, color: C.red },
  { name: "Hors ligne", value: 2, color: C.gray },
  { name: "En maintenance", value: 2, color: C.orange },
];

export const incidentBar = [
  { date: "12/06", incidents: 3, alertes: 5 },
  { date: "13/06", incidents: 7, alertes: 10 },
  { date: "14/06", incidents: 4, alertes: 8 },
  { date: "15/06", incidents: 5, alertes: 7 },
  { date: "16/06", incidents: 6, alertes: 9 },
  { date: "17/06", incidents: 8, alertes: 12 },
  { date: "18/06", incidents: 2, alertes: 4 },
];

export const speedDaily = [
  { day: "Lun", depassements: 9, moyenne: 44 },
  { day: "Mar", depassements: 12, moyenne: 47 },
  { day: "Mer", depassements: 7, moyenne: 43 },
  { day: "Jeu", depassements: 14, moyenne: 49 },
  { day: "Ven", depassements: 18, moyenne: 52 },
  { day: "Sam", depassements: 5, moyenne: 38 },
];

// ─── Raccourcis actions rapides ───────────────────────────────────────────────
export const quickActions = [
  { icon: "Map", label: "Gestion des zones", desc: "Définir les zones autorisées", target: "Zones géographiques" },
  { icon: "Gauge", label: "Gestion des vitesses", desc: "Limites par zone et véhicule", target: "Contrôle des vitesses" },
  { icon: "Clock3", label: "Gestion des horaires", desc: "Plages de circulation", target: "Gestion des horaires" },
  { icon: "ShieldCheck", label: "Moteur de règles", desc: "Automatiser les alertes", target: "Moteur de règles" },
  { icon: "FileText", label: "Génération rapports", desc: "Exports PDF & Excel", target: "Rapports & Exports" },
];

// ─── KPIs dashboard ───────────────────────────────────────────────────────────
export const kpis = [
  { icon: "CarFront", label: "Véhicules en service", value: "24 / 28", sub: "● 86% opérationnels", subColor: "green" },
  { icon: "MapPinned", label: "En déplacement", value: "20", sub: "● Temps réel", subColor: "green" },
  { icon: "CircleDashed", label: "À l'arrêt", value: "4", sub: "● Hors service 2 | Pause 2", subColor: "red" },
  { icon: "Gauge", label: "Vitesse moyenne flotte", value: "48 km/h", sub: "▼ −12% vs hier", subColor: "green" },
  { icon: "Fuel", label: "Consommation estimée", value: "342 L", sub: "▼ −8% vs hier", subColor: "green" },
];

// ─── Notifications (cloche) ───────────────────────────────────────────────────
export const notifications = [
  { id: "n7", level: "critical", title: "Dépassement de vitesse", desc: "AB 450 FC – 92 km/h en zone 70", time: "10:12", plate: "AB 450 FC" },
  { id: "n6", level: "critical", title: "Suspicion brouillage GPS", desc: "AB 580 CS – signal perdu 4 min", time: "09:51", plate: "AB 580 CS" },
  { id: "n5", level: "major", title: "Sortie de zone autorisée", desc: "AA 328 XP – Zone Portuaire", time: "09:47", plate: "AA 328 XP" },
  { id: "n4", level: "major", title: "Batterie traceur faible", desc: "AB 580 CS – 9,4V", time: "09:33", plate: "AB 580 CS" },
  { id: "n3", level: "medium", title: "Ignition hors horaires", desc: "AA 386 KA – 06:41", time: "08:56", plate: "AA 386 KA" },
  { id: "n2", level: "medium", title: "Tracker déconnecté", desc: "AB 723 GJ – silence 1h12", time: "08:21", plate: "AB 723 GJ" },
  { id: "n1", level: "medium", title: "Nouvel incident ouvert", desc: "Accident détecté – AB 450 FC", time: "07:12", plate: "AB 450 FC" },
];

// ─── Zones géographiques (géofencing) ─────────────────────────────────────────
export const zones = [
  { id: "Z-01", name: "Zone Portuaire", commune: "Treichville", type: "Interdite", color: C.red, vehicles: 2, alertsToday: 3, active: true, poly: "90,260 120,240 190,255 210,300 150,330 95,310" },
  { id: "Z-02", name: "Zone industrielle Yopougon", commune: "Yopougon", type: "Autorisée", color: C.green, vehicles: 9, alertsToday: 0, active: true, poly: "40,140 110,130 130,180 70,200 30,185" },
  { id: "Z-03", name: "Résidentiel Cocody", commune: "Cocody", type: "Autorisée", color: C.green, vehicles: 6, alertsToday: 1, active: true, poly: "240,80 300,90 315,140 260,165 225,130" },
  { id: "Z-04", name: "Chantier Grand Stade", commune: "Anyama", type: "Autorisée", color: C.green, vehicles: 3, alertsToday: 0, active: false, poly: "480,40 560,55 585,120 500,140 460,95" },
  { id: "Z-05", name: "Zone non-stop Port-Bouët", commune: "Port-Bouët", type: "Interdite", color: C.red, vehicles: 1, alertsToday: 2, active: true, poly: "300,300 380,290 420,340 350,380 290,350" },
];

// ─── Contrôle des vitesses ────────────────────────────────────────────────────
export const speedRules = [
  { zone: "Zone urbaine (Abidjan)", limit: 60, type: "Par défaut", vehicles: 12, enabled: true },
  { zone: "Résidentiel Cocody", limit: 40, type: "Par zone", vehicles: 6, enabled: true },
  { zone: "Autoroute du Nord", limit: 90, type: "Par zone", vehicles: 4, enabled: true },
  { zone: "Zone Portuaire", limit: 30, type: "Par zone", vehicles: 2, enabled: true },
  { zone: "Périphérie Songon", limit: 70, type: "Par zone", vehicles: 3, enabled: false },
  { zone: "École / Hôpital", limit: 30, type: "Par zone", vehicles: 1, enabled: true },
];

// ─── Gestion des horaires ─────────────────────────────────────────────────────
export const schedules = [
  { plate: "AA 386 KA", driver: "Traoré S.", window: "06:00 – 20:00", days: "Lun–Ven", status: "Respecté", color: C.green },
  { plate: "AB 450 FC", driver: "Kouamé B.", window: "06:00 – 22:00", days: "Lun–Sam", status: "Violation 06:41", color: C.red },
  { plate: "AA 328 XP", driver: "Doumbia M.", window: "07:00 – 18:00", days: "Lun–Ven", status: "Respecté", color: C.green },
  { plate: "AB 580 CS", driver: "Fofana K.", window: "08:00 – 17:00", days: "Lun–Ven", status: "Respecté", color: C.green },
  { plate: "AA 942 MB", driver: "Koné A.", window: "06:30 – 21:00", days: "Lun–Dim", status: "Respecté", color: C.green },
  { plate: "AB 235 BF", driver: "Soro Y.", window: "05:30 – 22:30", days: "Lun–Sam", status: "Dérogation 2 j", color: C.orange },
];

// ─── Moteur de règles ─────────────────────────────────────────────────────────
export const rules = [
  { id: "R-01", name: "Alerte dépassement de vitesse", reason: "Vitesse > limite zone", action: "Notification SMS + App", severity: "MAJEUR", color: C.orange, enabled: true, tier: "standard" },
  { id: "R-02", name: "Sortie de zone autorisée", reason: "Géofence franchie", action: "Notification + rapport", severity: "MAJEUR", color: C.orange, enabled: true, tier: "standard" },
  { id: "R-03", name: "Démarrage hors horaires", reason: "Ignition hors plage autorisée", action: "SMS immédiat", severity: "MOYEN", color: C.gray, enabled: true, tier: "gold" },
  { id: "R-04", name: "Immobilisation à distance", reason: "Vol / non-paiement", action: "Coupure moteur (RELAY)", severity: "CRITIQUE", color: C.red, enabled: false, tier: "gold" },
  { id: "R-05", name: "Maintenance préventive", reason: "Kilométrage ou date atteinte", action: "Planification atelier", severity: "INFO", color: C.primary, enabled: true, tier: "gold" },
  { id: "R-06", name: "Batterie traceur faible", reason: "Tension < 11V", action: "Alerte maintenance", severity: "MOYEN", color: C.gray, enabled: true, tier: "standard" },
];

// ─── Maintenance préventive ───────────────────────────────────────────────────
export const maintenance = [
  { plate: "AB 580 CS", model: "Ford Transit", type: "Vidange moteur", last: "15/05", next: "15/06", days: 3, mileage: 55132, status: "URGENT", color: C.red, progress: 92 },
  { plate: "AB 723 GJ", model: "Mitsubishi L200", type: "Révision 60 000 km", last: "12/02", next: "12/06", days: 8, mileage: 72890, status: "PROCHE", color: C.orange, progress: 78 },
  { plate: "AA 386 KA", model: "Peugeot Partner", type: "Freins avant", last: "20/02", next: "20/06", days: 12, mileage: 48320, status: "PROCHE", color: C.orange, progress: 65 },
  { plate: "AB 450 FC", model: "Toyota Hilux", type: "Vidange moteur", last: "22/03", next: "22/06", days: 14, mileage: 61204, status: "OK", color: C.green, progress: 40 },
  { plate: "AA 328 XP", model: "Renault Master", type: "Filtres + courroie", last: "10/01", next: "10/07", days: 32, mileage: 39510, status: "OK", color: C.green, progress: 22 },
];

// ─── Conducteurs ──────────────────────────────────────────────────────────────
export const drivers = [
  { id: "D-12", name: "Traoré Souleymane", phone: "+225 07 08 99 45", license: "Valide (2027)", status: "En service", rating: 4.8, incidents: 1, vehicle: "AA 386 KA", color: C.green },
  { id: "D-08", name: "Kouamé Bernard", phone: "+225 07 45 12 34", license: "Valide (2028)", status: "En service", rating: 4.2, incidents: 3, vehicle: "AB 450 FC", color: C.green },
  { id: "D-15", name: "Doumbia Moussa", phone: "+225 01 03 88 21", license: "Valide (2026)", status: "En service", rating: 4.5, incidents: 2, vehicle: "AA 328 XP", color: C.green },
  { id: "D-04", name: "Fofana Karim", phone: "+225 05 22 47 10", license: "Expire 08/2026", status: "En pause", rating: 4.9, incidents: 0, vehicle: "AB 580 CS", color: C.orange },
  { id: "D-07", name: "Bamba Lacina", phone: "+225 05 44 71 90", license: "Suspendu", status: "Hors service", rating: 3.5, incidents: 6, vehicle: "AB 723 GJ", color: C.red },
  { id: "D-21", name: "Koné Awa", phone: "+225 01 40 62 33", license: "Valide (2029)", status: "En service", rating: 4.7, incidents: 0, vehicle: "AA 942 MB", color: C.green },
];

// ─── Supervision SMS & Facturation ────────────────────────────────────────────
export const smsAccount = {
  org: "Transports Kouamé",
  credits: 1420,
  ratePerSms: 25,
  monthlyConsumed: 2140,
  monthlyQuota: 3000,
  billingDate: "01/07/2026",
};

export const smsHistory = [
  { id: "S-8841", time: "10:12", to: "Kouamé B. (+225 07 45 12 34)", plate: "AB 450 FC", type: "Alerte vitesse", cost: "25 F", status: "Délivré", color: C.green },
  { id: "S-8840", time: "09:51", to: "SOC SISBM (+225 27 21 75 00)", plate: "AB 580 CS", type: "Brouillage GPS", cost: "25 F", status: "Délivré", color: C.green },
  { id: "S-8839", time: "09:47", to: "Doumbia M. (+225 01 03 88 21)", plate: "AA 328 XP", type: "Sortie de zone", cost: "25 F", status: "Délivré", color: C.green },
  { id: "S-8838", time: "09:33", to: "Maintenance SISBM", plate: "AB 580 CS", type: "Batterie faible", cost: "25 F", status: "Délivré", color: C.green },
  { id: "S-8837", time: "08:56", to: "Traoré S. (+225 07 08 99 45)", plate: "AA 386 KA", type: "Horaires", cost: "25 F", status: "Délivré", color: C.green },
  { id: "S-8836", time: "08:21", to: "Bamba L. (+225 05 44 71 90)", plate: "AB 723 GJ", type: "Déconnexion", cost: "25 F", status: "Échec", color: C.red },
  { id: "S-8835", time: "07:58", to: "Koné A. (+225 01 40 62 33)", plate: "AA 942 MB", type: "Démarrage", cost: "25 F", status: "Délivré", color: C.green },
  { id: "S-8834", time: "06:41", to: "Traoré S. (+225 07 08 99 45)", plate: "AA 386 KA", type: "Démarrage", cost: "25 F", status: "Délivré", color: C.green },
];

// ─── Administration & Droits (RBAC) ───────────────────────────────────────────
export const adminUsers = [
  { id: "U-01", name: "Stéphane Y. Ouattara", email: "s.ouattara@sisbm.ci", role: "Super Admin", tier: "Premium", status: "Actif", lastLogin: "Aujourd'hui 09:12", color: C.red },
  { id: "U-02", name: "Aya Koné", email: "a.kone@sisbm.ci", role: "Superviseur SOC", tier: "Gold", status: "Actif", lastLogin: "Aujourd'hui 08:40", color: C.orange },
  { id: "U-03", name: "Marcel N'Dri", email: "m.ndri@sisbm.ci", role: "Gestionnaire client", tier: "Gold", status: "Actif", lastLogin: "Hier 17:22", color: C.primary },
  { id: "U-04", name: "Fatou Diarra", email: "f.diarra@sisbm.ci", role: "Analyste rapports", tier: "Standard", status: "Inactif", lastLogin: "05/06 12:04", color: C.gray },
  { id: "U-05", name: "Yao Assi", email: "y.assi@sisbm.ci", role: "Technicien", tier: "Standard", status: "Actif", lastLogin: "Aujourd'hui 07:55", color: C.primary },
];