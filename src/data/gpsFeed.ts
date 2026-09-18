// ─── Flux GPS temps réel — simulation de la remontée des traceurs ────────────
// Store unique au niveau module, alimenté par un « heartbeat » d'une seconde :
// chaque véhicule roulant progresse RÉELLEMENT le long de sa polyligne
// d'itinéraire (interpolation géodésique sur coordonnées WGS84), met à jour son
// cap, sa vitesse, ses satellites, son HDOP, la tension de son boîtier et
// empile sa trace. Carte et listes consomment le MÊME flux via
// `useSyncExternalStore` → elles restent synchronisées au point près.

import { useCallback, useSyncExternalStore } from "react";
import { allVehicles, type Vehicle } from "@/data/mock";
import {
  ABIDJAN_CENTER, nearestQuartier, pointOnRoute, routeLengthKm, trackers, vehicleGeo, vehicleRoutes,
  type LatLng, type Tracker,
} from "@/data/geo";

/** Véhicule suivi : fusion véhicule + identité traceur + état GNSS courant. */
export type LiveVehicle = Vehicle & {
  bearing: number;      // cap en degrés (0° = Nord, sens horaire)
  satellites: number;   // satellites accrochés par le récepteur GNSS
  hdop: number;         // dilution horizontale de précision (< 1 = excellent)
  ignition: boolean;    // contact moteur
  ignitionAt: number;   // horodatage du dernier changement de contact (ms epoch)
  lastFix: number;      // horodatage du dernier point GPS (ms epoch)
  trail: LatLng[];      // trace récente réellement parcourue
  progress: number;     // avancement 0 → 1 sur l'itinéraire
  odometerKm: number;   // distance parcourue depuis l'ouverture du flux
  baseMileage: number;  // kilométrage compteur au démarrage du flux
  baseSpeed: number;    // vitesse de consigne (la vitesse affichée oscille autour)
  tracker: Tracker;     // identité du boîtier embarqué
  stopSince: number | null; // début de l'arrêt courant (null si en mouvement)
};

type FeedState = {
  vehicles: LiveVehicle[];
  paused: boolean;
  tick: number;
  lastTick: number;
};

const TICK_MS = 1000;
const TRAIL_MAX = 40;
/** Silence radio au-delà duquel un traceur est considéré hors ligne. */
const SILENCE_OFFLINE_MS = 72 * 60 * 1000; // 1 h 12 min

const routeOf = (plate: string): LatLng[] => vehicleRoutes[plate] ?? [vehicleGeo[plate] ?? ABIDJAN_CENTER];

const FALLBACK_TRACKER: Tracker = {
  imei: "—", model: "Micodus MV730", firmware: "—", protocol: "TCP / GT06S",
  sim: "—", operator: "—", satellites: 0, hdop: 0, voltage: 0,
};

const trackerOf = (plate: string): Tracker => trackers[plate] ?? FALLBACK_TRACKER;

const round1 = (n: number) => Math.round(n * 10) / 10;
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/**
 * Reconstitue la trace déjà parcourue avant l'ouverture de l'écran : sans cela,
 * le tracé apparaîtrait vide plusieurs dizaines de secondes. L'espacement
 * s'adapte à la longueur de l'itinéraire (≈ 40 % de celui-ci).
 */
function seedTrail(route: LatLng[], progress: number): LatLng[] {
  const len = routeLengthKm(route);
  if (len === 0) return [{ ...route[0] }];
  const step = Math.min(len * 0.0125, 0.2) / len;
  const pts: LatLng[] = [];
  for (let i = TRAIL_MAX - 1; i >= 0; i--) {
    const p = progress - i * step;
    if (p < 0) break;
    pts.push(pointOnRoute(route, p).point);
  }
  return pts.length > 1 ? pts : [{ ...route[0] }];
}

function seed(): LiveVehicle[] {
  return allVehicles.map((v, i) => {
    const route = routeOf(v.plate);
    const len = routeLengthKm(route);
    const progress = 0.5 + (i % 5) * 0.08;         // véhicules répartis sur leur itinéraire
    const { point, bearing } = pointOnRoute(route, progress);
    const tracker = trackerOf(v.plate);
    const offline = v.status === "offline";
    const stopped = v.status === "stopped";
    return {
      ...v,
      // Un traceur hors ligne ne remonte plus de point : la position reste figée.
      lat: point.lat,
      lng: point.lng,
      pos: nearestQuartier(point),
      bearing: Math.round(bearing),
      satellites: tracker.satellites,
      hdop: tracker.hdop,
      ignition: !offline && !stopped,
      lastFix: offline ? Date.now() - SILENCE_OFFLINE_MS : Date.now() - 6000,
      trail: offline ? [] : seedTrail(route, progress),
      progress,
      odometerKm: 0,
      baseMileage: v.mileage ?? 0,
      baseSpeed: v.speed,
      tracker,
      ignitionAt: Date.now(),
      stopSince: v.status === "stopped" ? Date.now() - 25 * 60 * 1000 : null,
    };
  });
}

/**
 * Avance un véhicule d'un tick de télémétrie.
 * - Roulant (moving / alert) : progression le long de l'itinéraire, nouveau
 *   point GPS horodaté, cap recalculé, trace empilée, odomètre incrémenté.
 * - À l'arrêt (stopped) : moteur coupé, plus de mouvement, GNSS conservé.
 * - Hors ligne (offline) : aucun point, satellites à 0, dernier fix figé.
 */
function advance(v: LiveVehicle, tick: number): LiveVehicle {
  const now = Date.now();
  if (v.status === "stopped" || v.status === "offline") {
    const offline = v.status === "offline";
    return {
      ...v,
      speed: 0,
      ignition: false,
      satellites: offline ? 0 : v.satellites,
      hdop: offline ? 0 : round1(clamp(1.4 + Math.sin(tick / 7) * 0.3, 0.9, 2.4)),
      lastFix: offline ? v.lastFix : now,
      battery: round1(clamp(v.battery - 0.0005, 9.2, 12.8)),
      gsm: offline ? 0 : clamp(v.gsm + ((tick % 29 === 0) ? -1 : 0) + ((tick % 41 === 0) ? 1 : 0), 0, 4),
      stopSince: v.stopSince ?? now,
    };
  }

  const route = routeOf(v.plate);
  const len = routeLengthKm(route);
  // Oscillation douce autour de la vitesse de consigne : le compteur de vitesse
  // « respire » comme un vrai relevé OBD, sans saut irréaliste.
  const wave = Math.sin(tick / 3 + v.plate.charCodeAt(v.plate.length - 1));
  const speed = clamp(Math.round(v.baseSpeed + wave * 3.5), 4, 118);
  const advanceKm = (speed * TICK_MS) / 3_600_000;
  const progress = len === 0 ? 0 : (v.progress + advanceKm / len) % 1;
  const { point, bearing } = pointOnRoute(route, progress);
  const odometerKm = round1(v.odometerKm + advanceKm);

  return {
    ...v,
    lat: point.lat,
    lng: point.lng,
    pos: nearestQuartier(point),
    speed,
    bearing: Math.round(bearing),
    ignition: true,
    satellites: clamp(v.satellites + (tick % 11 === 0 ? 1 : 0) - (tick % 17 === 0 ? 1 : 0), 5, 14),
    hdop: round1(clamp(0.7 + Math.sin(tick / 5) * 0.35, 0.5, 1.6)),
    lastFix: Date.now(),
    battery: round1(clamp(v.battery - 0.002, 9.2, 12.8)),
    trail: [...v.trail, point].slice(-TRAIL_MAX),
    progress,
    odometerKm,
    mileage: v.baseMileage + Math.round(odometerKm),
  };
}

// ─── Store (singleton de module) ─────────────────────────────────────────────
let state: FeedState = { vehicles: seed(), paused: false, tick: 0, lastTick: Date.now() };
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function commit(next: FeedState) {
  state = next;
  listeners.forEach((l) => l());
}

function heartbeat() {
  if (state.paused) return;
  const tick = state.tick + 1;
  const next = state.vehicles.map((v) => advance(v, tick));
  // Chaque point remonte est analyse : depassement de vitesse et suspicion de
  // brouillage GNSS sont detectes ICI, sur le flux, pas dans un mock statique.
  next.forEach((v) => scanAlerts(v, tick));
  commit({ vehicles: next, paused: false, tick, lastTick: Date.now() });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Le heartbeat ne tourne que lorsqu'un écran consomme le flux (aucun coût
  // CPU lorsque la carte est démontée).
  if (listeners.size === 1 && timer === null) timer = setInterval(heartbeat, TICK_MS);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };
}

const getSnapshot = () => state;

export type LiveAlert = {
  id: string; plate: string; kind: "overspeed" | "jamming";
  title: string; detail: string; t: number; level: "critical" | "major";
};

let alerts: LiveAlert[] = [];
const seenOverspeed = new Set<string>();
const jamTicks: Record<string, number> = {};

function raiseAlert(a: LiveAlert) {
  alerts = [a].concat(alerts).slice(0, 12);
}

/** Analyse chaque point remonte : depassement de vitesse et brouillage GNSS. */

function scanAlerts(v: LiveVehicle, tick: number) {
  const rolling = v.status === "moving" || v.status === "alert";
  if (rolling && v.speed > 80 && !seenOverspeed.has(v.plate)) {
    seenOverspeed.add(v.plate);
    raiseAlert({
      id: "ov-" + v.plate + "-" + tick, plate: v.plate, kind: "overspeed",
      title: "Dépassement de vitesse", detail: v.plate + " — " + v.speed + " km/h à " + v.pos,
      t: Date.now(), level: "major",
    });
  }
  if (!rolling) seenOverspeed.delete(v.plate);
  const jammed = !offlineOf(v) && (v.satellites <= 3 || v.hdop >= 2.2);
  jamTicks[v.plate] = jammed ? (jamTicks[v.plate] || 0) + 1 : 0;
  if (jamTicks[v.plate] === 5) {
    raiseAlert({
      id: "jam-" + v.plate + "-" + tick, plate: v.plate, kind: "jamming",
      title: "Suspicion brouillage GPS", detail: v.plate + " — " + v.satellites + " sat · HDOP " + v.hdop,
      t: Date.now(), level: "critical",
    });
  }
}

function offlineOf(v: LiveVehicle) { return v.status === "offline"; }

export const feedVehicles = () => state.vehicles;
export const feedAlerts = () => alerts;
export const dismissAlert = (id: string) => { alerts = alerts.filter((a) => a.id !== id); listeners.forEach((l) => l()); };
export const findLiveVehicle = (plate: string | null | undefined) =>
  plate ? state.vehicles.find((v) => v.plate === plate) ?? null : null;
export const isFeedPaused = () => state.paused;

/** Suspend la remontée (utile pour figer une capture ou lire un point). */
export function pauseFeed() {
  if (!state.paused) commit({ ...state, paused: true });
}

/** Reprend la remontée. */
export function resumeFeed() {
  if (state.paused) commit({ ...state, paused: false, lastTick: Date.now() });
}

/** Rejoue le trajet d'un véhicule depuis le début de son itinéraire. */
export function replayRoute(plate: string) {
  const start = pointOnRoute(routeOf(plate), 0).point;
  commit({
    ...state,
    vehicles: state.vehicles.map((v) =>
      v.plate === plate
        ? { ...v, progress: 0, trail: [start], odometerKm: 0, mileage: v.baseMileage, lastFix: Date.now() }
        : v,
    ),
  });
}

/** Hook : abonnement au flux temps réel partagé. */
export function useAlertsFeed() {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { alerts: feedAlerts(), dismiss: dismissAlert };
}

export function useGpsFeed() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    vehicles: snap.vehicles,
    paused: snap.paused,
    tick: snap.tick,
    lastTick: snap.lastTick,
    pause: useCallback(pauseFeed, []),
    resume: useCallback(resumeFeed, []),
    replay: useCallback(replayRoute, []),
    alerts: feedAlerts(),
  };
}

/** Durée d'arrêt courant (« à l'arrêt depuis 25 min »). */
export function formatStopAge(stopSince: number | null, now = Date.now()): string | null {
  if (!stopSince) return null;
  const m = Math.max(0, Math.round((now - stopSince) / 60_000));
  if (m < 1) return "à l'arrêt depuis < 1 min";
  if (m < 60) return `à l'arrêt depuis ${m} min`;
  return `à l'arrêt depuis ${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`;
}

/** Ancienneté d'un point GPS, formulée comme dans une console de supervision. */
export function formatFixAge(lastFix: number, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - lastFix) / 1000));
  if (s < 10) return "à l'instant";
  if (s < 60) return `il y a ${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `il y a ${m} min`;
  return `il y a ${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`;
}