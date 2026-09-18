// ── Référentiel géographique réel d'Abidjan ────────────────────────────────
// Coordonnées WGS84 authentiques (degrés décimaux) des quartiers, positions de
// départ des véhicules, itinéraires routiers et zones de géorepérage.
// Remplace l'ancien référentiel « 650×420 » en pixels qui ne correspondait à
// aucune réalité terrain : ici, chaque point est plaçable sur une carte
// tuilée (OpenStreetMap / Esri / CARTO) à n'importe quel niveau de zoom.

export type LatLng = { lat: number; lng: number };

/** Centre de supervision : Plateau (Cité Administrative), Abidjan. */
export const ABIDJAN_CENTER: LatLng = { lat: 5.3362, lng: -4.0165 };

/** Zoom de confiance (agglomération d'Abidjan entièrement visible). */
export const ABIDJAN_ZOOM = 12;
/** Bornes de zoom autorisées sur la carte. */
export const ZOOM_RANGE: [number, number] = [9, 18];

// ─── Quartiers de référence (centroïdes réels) ───────────────────────────────
export const quartiers: Record<string, LatLng> = {
  Plateau: { lat: 5.3262, lng: -4.0155 },
  Cocody: { lat: 5.3481, lng: -3.9881 },
  Yopougon: { lat: 5.3368, lng: -4.0864 },
  Marcory: { lat: 5.2963, lng: -3.99 },
  Treichville: { lat: 5.2937, lng: -4.0106 },
  Adjamé: { lat: 5.3555, lng: -4.0232 },
  Abobo: { lat: 5.4219, lng: -4.0186 },
  "Port-Bouët": { lat: 5.2556, lng: -3.9288 },
  Attécoubé: { lat: 5.3407, lng: -4.0453 },
  Koumassi: { lat: 5.293, lng: -3.948 },
  Bingerville: { lat: 5.3556, lng: -3.8855 },
  Songon: { lat: 5.3216, lng: -4.2476 },
  Anyama: { lat: 5.4932, lng: -4.0516 },
};

// ─── Positions réelles des véhicules (sur voirie, cohérentes avec `pos`) ─────
export const vehicleGeo: Record<string, LatLng> = {
  "AA 386 KA": { lat: 5.3307, lng: -4.0752 }, // Yopougon – Bd principal / Niangon
  "AB 450 FC": { lat: 5.3487, lng: -3.9963 }, // Cocody – Bd de France
  "AA 328 XP": { lat: 5.3005, lng: -4.0035 }, // Marcory – Bd de Marseille
  "AB 580 CS": { lat: 5.3234, lng: -4.0168 }, // Plateau – Av. Noguès
  "AB 723 GJ": { lat: 5.2889, lng: -4.0082 }, // Treichville – zone portuaire
  "AA 942 MB": { lat: 5.3521, lng: -4.0265 }, // Adjamé – Bd du Gabon
  "AB 117 DA": { lat: 5.4128, lng: -4.0212 }, // Abobo – Autoroute du Nord
  "AA 607 AC": { lat: 5.2601, lng: -3.936 },  // Port-Bouët – Bd de Vridi
  "AB 235 BF": { lat: 5.3372, lng: -4.0396 }, // Attécoubé – Bd Nangui Abrogoua
  "AA 814 KC": { lat: 5.2948, lng: -3.9545 }, // Koumassi – Bd VGE
  "AB 059 ZX": { lat: 5.3512, lng: -3.8901 }, // Bingerville – route de Bingerville
  "AA 376 TJ": { lat: 5.3245, lng: -4.221 },  // Songon – Rd Songon-Agban
};

// ─── Itinéraires réels (polylignes sur les axes d'Abidjan) ───────────────────
// Chaque tracé suit un itinéraire plausible sur voirie réelle : les véhicules
// se déplacent le long de ces polylignes et le tracé affiché sur la carte est
// donc géographiquement crédible (Autoroute du Nord, Bd de Marseille, VGE…).
export const vehicleRoutes: Record<string, LatLng[]> = {
  // Yopougon → Attécoubé → Adjamé (Autoroute du Nord)
  "AA 386 KA": [
    { lat: 5.3307, lng: -4.0752 }, { lat: 5.336, lng: -4.0602 }, { lat: 5.3421, lng: -4.048 },
    { lat: 5.3472, lng: -4.041 }, { lat: 5.351, lng: -4.0345 }, { lat: 5.348, lng: -4.027 },
    { lat: 5.3405, lng: -4.023 }, { lat: 5.332, lng: -4.02 },
  ],
  // Cocody (Bd Latrille) → Plateau → Pont HKB
  "AB 450 FC": [
    { lat: 5.3487, lng: -3.9963 }, { lat: 5.3465, lng: -4.003 }, { lat: 5.342, lng: -4.0085 },
    { lat: 5.337, lng: -4.0115 }, { lat: 5.333, lng: -4.014 }, { lat: 5.329, lng: -4.0168 },
    { lat: 5.3245, lng: -4.018 }, { lat: 5.3205, lng: -4.0165 },
  ],
  // Marcory (Zone 4) → Bd VGE → Koumassi
  "AA 328 XP": [
    { lat: 5.3005, lng: -4.0035 }, { lat: 5.2988, lng: -3.9968 }, { lat: 5.2984, lng: -3.988 },
    { lat: 5.297, lng: -3.9805 }, { lat: 5.296, lng: -3.971 }, { lat: 5.2952, lng: -3.962 },
    { lat: 5.2948, lng: -3.9545 },
  ],
  // Plateau → Bd Mitterrand → Cocody
  "AB 580 CS": [
    { lat: 5.3234, lng: -4.0168 }, { lat: 5.3268, lng: -4.0142 }, { lat: 5.3305, lng: -4.0118 },
    { lat: 5.3345, lng: -3.999 }, { lat: 5.339, lng: -3.9895 }, { lat: 5.3448, lng: -3.985 },
    { lat: 5.3505, lng: -3.9838 },
  ],
  // Treichville (port) → Vridi → Port-Bouët
  "AB 723 GJ": [
    { lat: 5.2889, lng: -4.0082 }, { lat: 5.2845, lng: -3.9975 }, { lat: 5.279, lng: -3.982 },
    { lat: 5.2725, lng: -3.969 }, { lat: 5.2665, lng: -3.953 }, { lat: 5.261, lng: -3.9405 },
    { lat: 5.2601, lng: -3.936 },
  ],
  // Adjamé (Bd du Gabon) → Abobo (Autoroute du Nord)
  "AA 942 MB": [
    { lat: 5.3521, lng: -4.0265 }, { lat: 5.356, lng: -4.0298 }, { lat: 5.365, lng: -4.031 },
    { lat: 5.376, lng: -4.0325 }, { lat: 5.39, lng: -4.03 }, { lat: 5.403, lng: -4.025 },
    { lat: 5.4128, lng: -4.0212 },
  ],
  // Abobo → Adjamé → Plateau (descente sur le centre)
  "AB 117 DA": [
    { lat: 5.4128, lng: -4.0212 }, { lat: 5.401, lng: -4.0245 }, { lat: 5.388, lng: -4.0285 },
    { lat: 5.374, lng: -4.0305 }, { lat: 5.361, lng: -4.029 }, { lat: 5.3521, lng: -4.0265 },
    { lat: 5.342, lng: -4.0235 }, { lat: 5.332, lng: -4.0195 },
  ],
  // Port-Bouët → Aéroport FHB → Koumassi
  "AA 607 AC": [
    { lat: 5.2601, lng: -3.936 }, { lat: 5.263, lng: -3.929 }, { lat: 5.261, lng: -3.9245 },
    { lat: 5.2705, lng: -3.9265 }, { lat: 5.2785, lng: -3.9295 }, { lat: 5.285, lng: -3.935 },
    { lat: 5.2905, lng: -3.943 }, { lat: 5.2948, lng: -3.9545 },
  ],
  // Attécoubé → Bd Nangui Abrogoua → Plateau
  "AB 235 BF": [
    { lat: 5.3372, lng: -4.0396 }, { lat: 5.3345, lng: -4.0355 }, { lat: 5.332, lng: -4.031 },
    { lat: 5.3305, lng: -4.0265 }, { lat: 5.3288, lng: -4.0225 }, { lat: 5.3268, lng: -4.0195 },
    { lat: 5.3234, lng: -4.0168 },
  ],
  // Koumassi → Marcory → Plateau (Pont Charles de Gaulle)
  "AA 814 KC": [
    { lat: 5.2948, lng: -3.9545 }, { lat: 5.296, lng: -3.964 }, { lat: 5.2984, lng: -3.976 },
    { lat: 5.301, lng: -3.988 }, { lat: 5.3035, lng: -3.999 }, { lat: 5.308, lng: -4.0055 },
    { lat: 5.315, lng: -4.0105 }, { lat: 5.3234, lng: -4.0168 },
  ],
  // Bingerville → Riviera → Cocody
  "AB 059 ZX": [
    { lat: 5.3512, lng: -3.8901 }, { lat: 5.347, lng: -3.9005 }, { lat: 5.343, lng: -3.913 },
    { lat: 5.3405, lng: -3.925 }, { lat: 5.345, lng: -3.938 }, { lat: 5.3495, lng: -3.9505 },
    { lat: 5.3535, lng: -3.965 }, { lat: 5.3505, lng: -3.9838 },
  ],
  // Songon → Yopougon → Attécoubé
  "AA 376 TJ": [
    { lat: 5.3245, lng: -4.221 }, { lat: 5.327, lng: -4.195 }, { lat: 5.3295, lng: -4.165 },
    { lat: 5.332, lng: -4.135 }, { lat: 5.3355, lng: -4.102 }, { lat: 5.338, lng: -4.075 },
    { lat: 5.3358, lng: -4.058 }, { lat: 5.339, lng: -4.046 },
  ],
};

// ─── Zones de géorepérage (autorisations / restrictions) ─────────────────────
export type Geofence = {
  id: string;
  name: string;
  kind: "autorisee" | "restreinte";
  shape: { type: "circle"; center: LatLng; radiusM: number } | { type: "polygon"; points: LatLng[] };
};

export const geofences: Geofence[] = [
  { id: "Z-01", name: "Centre d'affaires – Plateau", kind: "autorisee", shape: { type: "circle", center: { lat: 5.3262, lng: -4.0155 }, radiusM: 2200 } },
  { id: "Z-02", name: "Cocody résidentiel", kind: "autorisee", shape: { type: "circle", center: { lat: 5.347, lng: -3.99 }, radiusM: 2600 } },
  { id: "Z-03", name: "Zone portuaire & Vridi", kind: "restreinte", shape: { type: "polygon", points: [
    { lat: 5.291, lng: -4.01 }, { lat: 5.277, lng: -4.006 }, { lat: 5.276, lng: -3.984 }, { lat: 5.29, lng: -3.986 },
  ] } },
  { id: "Z-04", name: "Yopougon industriel", kind: "restreinte", shape: { type: "circle", center: { lat: 5.336, lng: -4.08 }, radiusM: 3200 } },
];

// ─── Traceurs GPS embarqués (identité boîtier Micodus) ───────────────────────
export type Tracker = {
  imei: string; model: string; firmware: string; protocol: string;
  sim: string; operator: string; satellites: number; hdop: number; voltage: number;
};

export const trackers: Record<string, Tracker> = {
  "AA 386 KA": { imei: "868575040213764", model: "Micodus MV730", firmware: "MV730-GT06S-v3.4.1", protocol: "TCP / GT06S", sim: "+225 07 08 99 45", operator: "Orange CI", satellites: 11, hdop: 0.8, voltage: 12.4 },
  "AB 450 FC": { imei: "868575040213822", model: "Micodus MV730", firmware: "MV730-GT06S-v3.4.1", protocol: "TCP / GT06S", sim: "+225 07 45 12 34", operator: "MTN CI", satellites: 9, hdop: 1.1, voltage: 11.8 },
  "AA 328 XP": { imei: "868575040213901", model: "Micodus MV730", firmware: "MV730-GT06S-v3.4.0", protocol: "TCP / GT06S", sim: "+225 01 03 88 21", operator: "Orange CI", satellites: 12, hdop: 0.7, voltage: 12.1 },
  "AB 580 CS": { imei: "868575040213958", model: "Micodus MV730", firmware: "MV730-GT06S-v3.4.1", protocol: "TCP / GT06S", sim: "+225 05 62 14 07", operator: "Moov Africa", satellites: 4, hdop: 2.4, voltage: 9.4 },
  "AB 723 GJ": { imei: "868575040214013", model: "Micodus MV730", firmware: "MV730-GT06S-v3.3.9", protocol: "TCP / GT06S", sim: "+225 05 44 71 90", operator: "Moov Africa", satellites: 0, hdop: 0, voltage: 0 },
  "AA 942 MB": { imei: "868575040214088", model: "Micodus MV730", firmware: "MV730-GT06S-v3.4.1", protocol: "TCP / GT06S", sim: "+225 01 40 62 33", operator: "MTN CI", satellites: 10, hdop: 0.9, voltage: 12.2 },
  "AB 117 DA": { imei: "868575040214146", model: "Micodus MV730", firmware: "MV730-GT06S-v3.4.1", protocol: "TCP / GT06S", sim: "+225 07 71 30 58", operator: "Orange CI", satellites: 13, hdop: 0.6, voltage: 12.6 },
  "AA 607 AC": { imei: "868575040214203", model: "Micodus MV730", firmware: "MV730-GT06S-v3.4.0", protocol: "TCP / GT06S", sim: "+225 05 12 88 64", operator: "Moov Africa", satellites: 8, hdop: 1.3, voltage: 11.2 },
  "AB 235 BF": { imei: "868575040214269", model: "Micodus MV730", firmware: "MV730-GT06S-v3.4.1", protocol: "TCP / GT06S", sim: "+225 01 55 27 41", operator: "MTN CI", satellites: 9, hdop: 1.2, voltage: 11.9 },
  "AA 814 KC": { imei: "868575040214320", model: "Micodus MV730", firmware: "MV730-GT06S-v3.4.1", protocol: "TCP / GT06S", sim: "+225 07 33 96 12", operator: "Orange CI", satellites: 12, hdop: 0.7, voltage: 12.0 },
  "AB 059 ZX": { imei: "868575040214387", model: "Micodus MV730", firmware: "MV730-GT06S-v3.3.9", protocol: "TCP / GT06S", sim: "+225 05 78 41 26", operator: "Moov Africa", satellites: 0, hdop: 0, voltage: 0 },
  "AA 376 TJ": { imei: "868575040214443", model: "Micodus MV730", firmware: "MV730-GT06S-v3.4.1", protocol: "TCP / GT06S", sim: "+225 01 92 05 77", operator: "MTN CI", satellites: 7, hdop: 1.5, voltage: 10.8 },
};
// ─── Géométrie (fonctions pures, testables) ─────────────────────────────────
const R_EARTH_KM = 6371;
const toRad = (d: number) => (d * Math.PI) / 180;

/** Distance orthodromique (km) entre deux points WGS84. */
export function distanceKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R_EARTH_KM * Math.asin(Math.min(1, Math.sqrt(s)));
}

/** Cap (azimut) en degrés de `a` vers `b` : 0° = Nord, sens horaire. */
export function bearingBetween(a: LatLng, b: LatLng): number {
  const dLng = toRad(b.lng - a.lng);
  const y = Math.sin(dLng) * Math.cos(toRad(b.lat));
  const x = Math.cos(toRad(a.lat)) * Math.sin(toRad(b.lat)) -
    Math.sin(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

/** Longueur cumulée d'une polyligne (km). */
export function routeLengthKm(route: LatLng[]): number {
  let total = 0;
  for (let i = 1; i < route.length; i++) total += distanceKm(route[i - 1], route[i]);
  return total;
}

/** Point à `progress` (0 → 1) de la distance totale, avec le cap du segment. */
export function pointOnRoute(route: LatLng[], progress: number): { point: LatLng; bearing: number } {
  if (route.length === 0) return { point: ABIDJAN_CENTER, bearing: 0 };
  if (route.length === 1) return { point: route[0], bearing: 0 };
  const total = routeLengthKm(route);
  if (total === 0) return { point: route[0], bearing: 0 };
  const p = ((progress % 1) + 1) % 1;
  let target = p * total;
  for (let i = 1; i < route.length; i++) {
    const seg = distanceKm(route[i - 1], route[i]);
    if (target <= seg || i === route.length - 1) {
      const t = seg === 0 ? 0 : Math.min(1, target / seg);
      const a = route[i - 1];
      const b = route[i];
      return {
        point: { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t },
        bearing: bearingBetween(a, b),
      };
    }
    target -= seg;
  }
  return { point: route[route.length - 1], bearing: 0 };
}

/** Quartier de référence le plus proche d'un point (alimente l'étiquette « pos »). */
export function nearestQuartier(point: LatLng): string {
  let best = "Abidjan";
  let bestD = Number.POSITIVE_INFINITY;
  Object.entries(quartiers).forEach(([name, c]) => {
    const d = distanceKm(point, c);
    if (d < bestD) { bestD = d; best = name; }
  });
  return bestD > 12 ? "Abidjan" : best;
}

/** Coordonnées lisibles pour un humain : 5.33620° N, 4.01650° O. */
export function formatCoords(point: LatLng | undefined | null): string {
  if (!point || typeof point.lat !== "number" || typeof point.lng !== "number") return "—";
  const ns = point.lat >= 0 ? "N" : "S";
  const ew = point.lng >= 0 ? "E" : "O";
  return `${Math.abs(point.lat).toFixed(5)}° ${ns}, ${Math.abs(point.lng).toFixed(5)}° ${ew}`;
}