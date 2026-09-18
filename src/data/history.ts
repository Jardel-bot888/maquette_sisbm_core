// ─── Historique des trajets — reconstitution horodatée (maquette) ──────────
// Exigence module 2 « Tracking GPS » : historique détaillé + relecture.
// Trajets horodatés (départ/arrivée), distance, durée, vitesse max, arrêts,
// contact moteur. Génération déterministe sur 7 j (démo stable) + persistance
// locale 30 j. En production, ce store est remplacé par le backend sécurisé
// (collecte traceur → stockage chiffré + RBAC) ; la structure reste identique.
import { allVehicles } from "@/data/mock";
import {
  ABIDJAN_CENTER, nearestQuartier, pointOnRoute, routeLengthKm, vehicleRoutes,
  type LatLng,
} from "@/data/geo";

export type TripPoint = LatLng & { t: number };
export type EngineMark = { type: "ignition_on" | "ignition_off"; t: number; pos: string };
export type TripStop = { at: number; durationMin: number; pos: string };


export type Trip = {
  id: string; plate: string; date: string; dayKey: string;
  startT: number; endT: number; startPos: string; endPos: string;
  distanceKm: number; durationMin: number; maxSpeed: number; avgSpeed: number;
  stops: TripStop[]; engine: EngineMark[]; points: TripPoint[];
};

const DAY_MS = 86_400_000;
const RETENTION_DAYS = 30;
const STORE_KEY = "sisbm-trips-v1";

/** Hash déterministe (stable entre rechargements) pour une démo reproductible. */
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}

const pad2 = (n: number) => String(n).padStart(2, "0");
export function dayKeyOf(t: number): string {
  const d = new Date(t);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
export function dateLabelOf(t: number): string {
  const d = new Date(t);
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}
export function timeLabelOf(t: number): string {
  const d = new Date(t);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}
/** Durée « 1 h 24 » / « 38 min » comme sur une console de supervision. */
export function formatDuration(min: number): string {
  if (min < 60) return `${Math.round(min)} min`;
  return `${Math.floor(min / 60)} h ${pad2(Math.round(min % 60))}`;
}

/** Construit 1 à 3 trajets plausibles pour un véhicule et un jour donné. */
function buildDayTrips(plate: string, dayStart: number, seed: number): Trip[] {
  const route = vehicleRoutes[plate] ?? [ABIDJAN_CENTER];
  const len = Math.max(0.5, routeLengthKm(route));
  const rnd = (n: number) => {
    seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff;
    return seed % n;
  };
  const count = 1 + (rnd(3) % 2 === 0 ? 1 : 0) + (rnd(5) === 0 ? 1 : 0);
  const trips: Trip[] = [];
  for (let k = 0; k < count; k++) {
    const depH = 6 + rnd(13);
    const depM = rnd(60);
    const startT = dayStart + (depH * 60 + depM) * 60_000;
    const frac = 0.25 + rnd(70) / 100;
    const dist = Math.max(1.2, len * frac);
    const avg = 28 + rnd(30);
    const durMin = Math.max(12, (dist / avg) * 60);
    const endT = startT + durMin * 60_000;
    const f0 = (k * 0.3 + rnd(20) / 100) % 1;
    const p0 = pointOnRoute(route, f0).point;
    const p1 = pointOnRoute(route, Math.min(0.99, f0 + frac)).point;
    const startPos = nearestQuartier(p0);
    const endPos = nearestQuartier(p1);
    const n = Math.max(6, Math.min(60, Math.round(durMin / 3)));
    const points: TripPoint[] = [];
    for (let i = 0; i <= n; i++) {
      const f = i / n;
      points.push({
        lat: p0.lat + (p1.lat - p0.lat) * f,
        lng: p0.lng + (p1.lng - p0.lng) * f,
        t: startT + f * (endT - startT),
      });
    }
    const stops: TripStop[] = durMin > 45
      ? [{ at: startT + (endT - startT) / 2, durationMin: 8 + rnd(20), pos: nearestQuartier(points[Math.floor(n / 2)]) }]
      : [];
    trips.push({
      id: `${plate}-${dayKeyOf(startT)}-${k}`,
      plate, date: dateLabelOf(startT), dayKey: dayKeyOf(startT),
      startT, endT, startPos, endPos,
      distanceKm: Math.round(dist * 10) / 10,
      durationMin: Math.round(durMin),
      maxSpeed: Math.min(118, avg + 18 + rnd(22)),
      avgSpeed: avg, stops,
      engine: [
        { type: "ignition_on", t: startT, pos: startPos },
        { type: "ignition_off", t: endT, pos: endPos },
      ],
      points,
    });
  }
  return trips.sort((a, b) => a.startT - b.startT);
}

/** 7 derniers jours (aujourd'hui inclus) pour tout le parc. */
export function buildWeekHistory(now = Date.now()): Trip[] {
  const midnight = new Date(now);
  midnight.setHours(0, 0, 0, 0);
  const all: Trip[] = [];
  allVehicles.forEach((v) => {
    for (let d = 6; d >= 0; d--) {
      if (v.status === "offline" && d < 2) continue;
      all.push(...buildDayTrips(v.plate, midnight.getTime() - d * DAY_MS, hashStr(v.plate) + d * 97));
    }
  });
  return all.sort((a, b) => b.startT - a.startT);
}

/** Synthèse parc sur une période (bandeau de l'onglet Historique). */
export function summarizeTrips(trips: Trip[]) {
  const km = trips.reduce((s, t) => s + t.distanceKm, 0);
  const min = trips.reduce((s, t) => s + t.durationMin, 0);
  const max = trips.reduce((m, t) => Math.max(m, t.maxSpeed), 0);
  const stops = trips.reduce((s, t) => s + t.stops.length, 0);
  return { count: trips.length, km: Math.round(km), durationMin: Math.round(min), maxSpeed: max, stops };
}

/** Persistance maquette : cache + rétention 30 j (prod → backend chiffré). */
export function loadCachedTrips(): Trip[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as Trip[];
    const cutoff = Date.now() - RETENTION_DAYS * DAY_MS;
    return Array.isArray(arr) ? arr.filter((t) => t.endT > cutoff) : [];
  } catch { return []; }
}
export function saveCachedTrips(trips: Trip[]) {
  try {
    const cutoff = Date.now() - RETENTION_DAYS * DAY_MS;
    localStorage.setItem(STORE_KEY, JSON.stringify(trips.filter((t) => t.endT > cutoff).slice(0, 600)));
  } catch { /* quota / navigation privée : l'historique reste en mémoire */ }
}
export const TRIP_RETENTION_LABEL = `Conservation ${RETENTION_DAYS} j (maquette : navigateur — cible prod : stockage sécurisé SISBM)`;