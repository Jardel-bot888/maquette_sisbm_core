import { useEffect, useMemo, useState } from "react";
import { Map, Plus, ShieldCheck, AlertTriangle } from "lucide-react";
import { MapContainer, TileLayer, Polygon, useMap } from "react-leaflet";
import L from "leaflet";
import { C, va } from "@/theme";import { zones } from "@/data/mock";
import { PageHeader, Btn, StatusPill, Toggle, Th, Td } from "@/ui";
import { TILE_LAYERS } from "@/components/LiveMap";
import { quartiers, type LatLng } from "@/data/geo";

type Props = {
  onNavigate?: (label: string) => void;
};

/** Rayon de prévisualisation par zone (km) — les zones créées ont leur rayon. */
const ZONE_RADIUS: Record<string, number> = {};

/**
 * Correspondance carte mock (Z-01…Z-05 avec `commune` en français) ↔ centroïde
 * WGS84 réel. Les tracés `poly` du mock sont en pixels (ancien repère 650×420)
 * et ne correspondent à aucun terrain : on prévisualise donc un polygone
 * régulier (~1,3 km) centré sur la commune réelle de la zone.
 */
const ZONE_CENTER: Record<string, LatLng> = {
  "Z-01": quartiers["Treichville"],
  "Z-02": quartiers["Yopougon"],
  "Z-03": quartiers["Cocody"],
  "Z-04": quartiers["Anyama"],
  "Z-05": quartiers["Port-Bouët"],
};

/** Polygone régulier (12 sommets) autour d'un centre, en degrés WGS84. */
function previewPolygon(center: LatLng, radiusKm = 1.3, points = 12): LatLng[] {
  const dLat = radiusKm / 111.32;
  const dLng = radiusKm / (111.32 * Math.cos((center.lat * Math.PI) / 180));
  return Array.from({ length: points }, (_, i) => {
    const a = (i / points) * Math.PI * 2;
    return {
      lat: Math.round((center.lat + Math.sin(a) * dLat) * 10000) / 10000,
      lng: Math.round((center.lng + Math.cos(a) * dLng) * 10000) / 10000,
    };
  });
}

/** Recadre la mini-carte sur le polygone et force le recalcul de taille. */
function ZonePreviewFit({ bounds, active }: { bounds: L.LatLngBounds; active: boolean }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { padding: [14, 14] });
    // Conteneur monté dans une carte de 110 px : sans ce recalcul Leaflet
    // peut laisser des tuiles grises (dimensions connues après montage).
    const t1 = window.setTimeout(() => map.invalidateSize(), 60);
    const t2 = window.setTimeout(() => map.invalidateSize(), 300);
    const parent = map.getContainer().parentElement;
    const obs = new ResizeObserver(() => map.invalidateSize());
    if (parent) obs.observe(parent);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); obs.disconnect(); };
    // `active` inclus : le toggle recrée la couche — on recadre pour
    // garantir un rendu net après chaque bascule.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, bounds, active]);
  return null;
}

// ─── Mini-carte de prévisualisation d'une zone ────────────────────────────────
// Exigence : fond de carte RÉEL (tuiles OSM, sans clé, sans CORS bloquant),
// cadrage automatique sur le polygone (fitBounds) et recalcul de taille
// (invalidateSize + ResizeObserver + dimensions explicites h-28 w-full) pour
// que les tuiles se chargent même dans une carte de 110 px de haut.
function ZonePreview({ zoneId, active, color, radiusKm }: { zoneId: string; active: boolean; color: string; radiusKm?: number }) {
  const center = ZONE_CENTER[zoneId];
  const pts = useMemo(() => (center ? previewPolygon(center, ZONE_RADIUS[zoneId] ?? radiusKm ?? 1.3) : []), [zoneId, center, radiusKm]);
  const bounds = useMemo(
    () => (pts.length > 0 ? L.latLngBounds(pts.map((p) => [p.lat, p.lng] as [number, number])) : null),
    [pts],
  );

  if (!center || !bounds) return null;

  return (
    <MapContainer
      bounds={bounds}
      boundsOptions={{ padding: [14, 14] }}
      scrollWheelZoom={false}
      dragging
      doubleClickZoom={false}
      zoomControl={false}
      attributionControl={false}
      keyboard={false}
      className="h-28 w-full"
      style={{ height: 110, width: "100%", position: "relative", zIndex: 0 }}
    >
      <TileLayer
        url={TILE_LAYERS.standard.url}
        attribution={TILE_LAYERS.standard.attribution}
        maxZoom={TILE_LAYERS.standard.maxZoom}
        subdomains={TILE_LAYERS.standard.subdomains}
      />
      <Polygon
        positions={pts}
        pathOptions={{ color, weight: 2, dashArray: active ? undefined : "6 4", fillColor: color, fillOpacity: 0.15 }}
      />
      <ZonePreviewFit bounds={bounds} active={active} />
    </MapContainer>
  );
}

// ─── Module Zones géographiques (géofencing) ──────────────────────────────────

// ─── Modale de création d'une zone ────────────────────────────────────────────
// Le bouton « Nouvelle zone » n'avait aucun onClick : la création était
// impossible. Cette modale crée une vraie zone (id auto Z-06…, nom, commune
// du référentiel `quartiers`, type Autorisée/Interdite + rayon) qui apparaît
// aussitôt dans les cartes (mini-carte Leaflet via ZONE_CENTER), le tableau
// et les compteurs. Persistance locale (localStorage) : la maquette n'a pas
// de backend, les zones créées survivent au rechargement comme les trajets.
const COMMUNES = ["Plateau", "Cocody", "Yopougon", "Marcory", "Treichville", "Adjamé", "Abobo", "Port-Bouët", "Attécoubé", "Koumassi", "Bingerville", "Songon", "Anyama"];

export type CreatedZone = { id: string; name: string; commune: string; type: string; color: string; vehicles: number; alertsToday: number; active: boolean; radiusKm: number };

const CREATED_KEY = "sisbm-zones-created-v1";

function loadCreatedZones(): CreatedZone[] {
  try {
    const raw = localStorage.getItem(CREATED_KEY);
    const arr = raw ? (JSON.parse(raw) as CreatedZone[]) : [];
    return Array.isArray(arr) ? arr.filter((z) => z && z.id && z.name) : [];
  } catch { return []; }
}

function saveCreatedZones(list: CreatedZone[]) {
  try { localStorage.setItem(CREATED_KEY, JSON.stringify(list.slice(0, 50))); }
  catch { /* quota / navigation privée : les zones restent en mémoire */ }
}

function ZoneCreateModal({ nextId, onClose, onCreate }: {
  nextId: string;
  onClose: () => void;
  onCreate: (z: CreatedZone) => void;
}) {
  const [name, setName] = useState("");
  const [commune, setCommune] = useState(COMMUNES[0]);
  const [type, setType] = useState("Autorisée");
  const [radiusKm, setRadiusKm] = useState(1.3);
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const clean = name.trim();
    if (clean.length < 3) { setError("Nommez la zone (3 caractères minimum)."); return; }
    onCreate({
      id: nextId, name: clean, commune, type,
      color: type === "Interdite" ? C.red : C.green,
      vehicles: 0, alertsToday: 0, active: true, radiusKm,
    });
  };

  const inputStyle = { background: C.navy, borderColor: C.border, color: C.text };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose} role="dialog" aria-modal="true" aria-label="Créer une zone">
      <div className="rounded-2xl border p-5 w-full max-w-md space-y-4" style={{ background: C.cardBg, borderColor: C.border }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <p className="font-bold text-base" style={{ color: C.text }}>Nouvelle zone</p>
            <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>Identifiant auto : <span className="font-mono font-bold">{nextId}</span> · prévisualisée sur fond de carte dès sa création.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: C.navy, color: C.textMuted }}>✕</button>
        </div>

        <label className="block text-xs font-semibold" style={{ color: C.textDim }}>
          Nom de la zone
          <input
            value={name} onChange={(e) => { setName(e.target.value); setError(null); }}
            placeholder="Ex. Dépôt Bassam"
            className="mt-1 w-full text-sm px-3 py-2 rounded-xl border outline-none"
            style={inputStyle}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs font-semibold" style={{ color: C.textDim }}>
            Commune (centrage carte)
            <select value={commune} onChange={(e) => setCommune(e.target.value)} className="mt-1 w-full text-sm px-3 py-2 rounded-xl border outline-none" style={inputStyle}>
              {COMMUNES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="block text-xs font-semibold" style={{ color: C.textDim }}>
            Type
            <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 w-full text-sm px-3 py-2 rounded-xl border outline-none" style={inputStyle}>
              <option value="Autorisée">Autorisée</option>
              <option value="Interdite">Interdite</option>
            </select>
          </label>
        </div>

        <label className="block text-xs font-semibold" style={{ color: C.textDim }}>
          Rayon de la zone : <span className="font-mono" style={{ color: C.text }}>{radiusKm.toFixed(1)} km</span>
          <input type="range" min={0.5} max={3} step={0.1} value={radiusKm} onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="mt-2 w-full" aria-label="Rayon de la zone en kilomètres" />
        </label>

        {error && <p className="text-xs font-semibold" style={{ color: C.red }} role="alert">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Btn variant="secondary" onClick={onClose}>Annuler</Btn>
          <Btn variant="primary" onClick={submit}>Créer la zone</Btn>
        </div>
      </div>
    </div>
  );
}

export default function ZonesGeographiques({ onNavigate }: Props) {
  const [created, setCreated] = useState<CreatedZone[]>(() => loadCreatedZones());
  const [list, setList] = useState(() => [...zones]);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => { saveCreatedZones(created); }, [created]);

  const allZones = useMemo(() => [...list, ...created.map((c) => ({ ...c, poly: "" }))], [list, created]);
  const nextId = `Z-${String(6 + created.length).padStart(2, "0")}`;

  const createZone = (z: CreatedZone) => {
    // Centre réel de la nouvelle zone (commune choisie + rayon) pour sa mini-carte.
    ZONE_CENTER[z.id] = quartiers[z.commune] ?? quartiers["Plateau"];
    ZONE_RADIUS[z.id] = z.radiusKm;
    setCreated((prev) => [...prev, z]);
    setShowCreate(false);
  };
  const toggle = (id: string) => {
    setList((l) => l.map((z) => (z.id === id ? { ...z, active: !z.active } : z)));
    setCreated((l) => l.map((z) => (z.id === id ? { ...z, active: !z.active } : z)));
  };

  const toggleFromAll = (id: string) => toggle(id);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Zones géographiques"
        subtitle="Géofencing : zones autorisées et interdites, alertes de sortie."
        actions={<Btn onClick={() => onNavigate?.("Contrôle des vitesses")}><Plus className="h-3.5 w-3.5 inline-block mr-1" />Nouvelle zone</Btn>}
      />

      {/* Synthèse */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        {[
          { label: "Zones actives", value: list.filter((z) => z.active).length, icon: ShieldCheck, color: C.green },
          { label: "Zones interdites", value: list.filter((z) => z.type === "Interdite").length, icon: AlertTriangle, color: C.red },
          { label: "Alertes aujourd'hui", value: list.reduce((s, z) => s + z.alertsToday, 0), icon: Map, color: C.orange },
        ].map((s) => (
          <div key={s.label} className="group rounded-2xl border px-4 py-3 flex items-center gap-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-lift" style={{ background: C.cardBg, borderColor: C.borderSoft }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: va(s.color, "13%") }}>
              <s.icon className="h-5 w-5" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xl font-black font-mono tabular-nums leading-none" style={{ color: C.text }}>{s.value}</p>
              <p className="text-xs mt-1" style={{ color: C.textMuted }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Cartes zones */}
      <div className="grid gap-3 lg:grid-cols-3">
        {list.map((z) => (
          <div key={z.id} className="rounded-2xl border p-4 space-y-3" style={{ background: C.cardBg, borderColor: C.borderSoft }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg" style={{ background: va(z.color, "13%"), color: z.color }}>{z.id}</span>
                <span className="text-sm font-bold" style={{ color: C.text }}>{z.name}</span>
              </div>
              <Toggle on={z.active} onChange={() => toggle(z.id)} label={`Activer la zone ${z.name}`} />
            </div>
            <div className="rounded-xl border overflow-hidden h-28 w-full relative" style={{ borderColor: C.border, height: 110 }}>
              <ZonePreview zoneId={z.id} active={z.active} color={z.color} />
              <div className="absolute top-2 left-2 z-[500] rounded-lg px-2 py-1 pointer-events-none" style={{ background: va(C.navyMid, "80%"), border: "1px solid " + C.border }}>
                <span className="text-[10px]" style={{ color: C.textMuted }}>{z.commune}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: C.textMuted }}>{z.type}</span>
              <span className="flex items-center gap-3">
                <span style={{ color: C.textMuted }}>{z.vehicles} véh.</span>
                {z.alertsToday > 0 ? <StatusPill color={C.orange} label={`${z.alertsToday} alertes`} /> : <StatusPill color={C.green} label="OK" />}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border p-4" style={{ background: C.cardBg, borderColor: C.borderSoft }}>
        <span className="font-bold text-sm block mb-3" style={{ color: C.text }}>Gestion détaillée</span>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                <Th>Zone</Th><Th>Commune</Th><Th>Type</Th><Th>Véhicules</Th><Th>Alertes/jour</Th><Th>Active</Th>
              </tr>
            </thead>
            <tbody>
              {list.map((z) => (
                <tr key={z.id} style={{ borderBottom: `1px solid ${va(C.border, "33%")}` }}>
                  <Td><span className="font-semibold" style={{ color: C.text }}>{z.name}</span></Td>
                  <Td style={{ color: C.textMuted }}>{z.commune}</Td>
                  <Td><StatusPill color={z.type === "Interdite" ? C.red : C.green} label={z.type} /></Td>
                  <Td style={{ color: C.textDim }}>{z.vehicles}</Td>
                  <Td style={{ color: z.alertsToday > 0 ? C.orange : C.textMuted }}>{z.alertsToday}</Td>
                  <Td><Toggle on={z.active} onChange={() => toggle(z.id)} label={`Activer la zone ${z.name}`} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}