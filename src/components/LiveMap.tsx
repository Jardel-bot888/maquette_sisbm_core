// ─── Carte Leaflet temps réel ────────────────────────────────────────────────
// Fond de carte RÉEL et zoomable : tuiles OpenStreetMap / Esri World Imagery /
// CARTO Dark, toutes accessibles SANS clé API. Les véhicules sont de vrais
// marqueurs géolocalisés (WGS84) orientés selon leur cap, avec trace GPS,
// itinéraire parcouru/restant, zones de géorepérage et popup de télémétrie
// traceur. Zoom/pan natifs : molette, pincement, double-clic, clavier, boutons.

import { useEffect, useMemo, useRef } from "react";
import {
  MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Polygon, ScaleControl, AttributionControl, useMap, useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { C, statusConfig, va } from "@/theme";
import { ABIDJAN_CENTER, ABIDJAN_ZOOM, ZOOM_RANGE, distanceKm, formatCoords, geofences, routeLengthKm, vehicleRoutes, type LatLng } from "@/data/geo";
import { formatFixAge, type LiveVehicle } from "@/data/gpsFeed";
import type { Vehicle } from "@/data/mock";

export type MapLayerName = "standard" | "satellite" | "dark";

type TileConfig = {
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string;
  /** Couche d'étiquettes superposée (imagerie satellite). */
  labels?: string;
};

/**
 * Fonds de carte libres et sans clé API — contrainte de la maquette SISBM.
 * L'attribution est affichée dans le bandeau bas de la carte (obligation des
 * fournisseurs, y compris pour une maquette).
 */
export const TILE_LAYERS: Record<MapLayerName, TileConfig> = {
  standard: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors",
    maxZoom: 19,
    subdomains: "abc",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles © Esri — Maxar, Earthstar Geographics",
    maxZoom: 19,
    labels: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "© OpenStreetMap contributors © CARTO",
    maxZoom: 20,
    subdomains: "abcd",
  },
};

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] ?? c));

/**
 * Épingle d'un véhicule : pastille bleu nuit SISBM (identique dans les deux
 * thèmes) cerclée de la couleur du statut, silhouette de véhicule orientée
 * selon le cap réel, plaque lisible et halo pulsé pour les véhicules roulants.
 */
function vehicleIcon(v: LiveVehicle, selected: boolean): L.DivIcon {
  const color = statusConfig[v.status]?.color ?? C.gray;
  const offline = v.status === "offline";
  const moving = v.status === "moving" || v.status === "alert";
  const classes = ["sisbm-pin", selected && "sisbm-pin--selected", offline && "sisbm-pin--offline"]
    .filter(Boolean)
    .join(" ");

  const html = `<div class="${classes}" style="--pin-color:${color};--pin-bearing:${Math.round(v.bearing)}deg">
    ${moving ? '<span class="sisbm-pin__pulse"></span>' : ""}
    <span class="sisbm-pin__body">
      <svg class="sisbm-pin__icon" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="8" y="2.5" width="8" height="19" rx="3" fill="currentColor"></rect>
        <rect class="sisbm-pin__glass" x="9.6" y="6" width="4.8" height="3.6" rx="1"></rect>
        <rect class="sisbm-pin__glass" x="9.6" y="15" width="4.8" height="3" rx="1" opacity="0.7"></rect>
      </svg>
    </span>
    <span class="sisbm-pin__label">${escapeHtml(v.plate)}</span>
  </div>`;

  // icôneSize/icôneAnchor à 0 : le placement est entièrement géré par le CSS
  // (translate(-50%, -50%)), ce qui évite de recalculer une taille au zoom.
  return L.divIcon({ className: "sisbm-marker", html, iconSize: [0, 0], iconAnchor: [0, 0], popupAnchor: [0, -18] });
}

/**
 * Coupe l'itinéraire au point courant : la partie parcourue est tracée pleine,
 * la partie restante en pointillés animés — comme dans un vrai suivi de flotte.
 */
function splitRoute(route: LatLng[], progress: number): { done: LatLng[]; todo: LatLng[] } {
  const total = routeLengthKm(route);
  if (route.length < 2 || total === 0) return { done: route, todo: [] };
  const target = progress * total;
  const done: LatLng[] = [route[0]];
  let acc = 0;
  for (let i = 1; i < route.length; i++) {
    const seg = distanceKm(route[i - 1], route[i]);
    if (acc + seg >= target) {
      const t = seg === 0 ? 0 : (target - acc) / seg;
      const cut: LatLng = {
        lat: route[i - 1].lat + (route[i].lat - route[i - 1].lat) * t,
        lng: route[i - 1].lng + (route[i].lng - route[i - 1].lng) * t,
      };
      done.push(cut);
      return { done, todo: [cut, ...route.slice(i)] };
    }
    acc += seg;
    done.push(route[i]);
  }
  return { done, todo: [] };
}

/** Ligne « libellé / valeur » d'une popup de télémétrie. */
function TelemetryRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[10px] whitespace-nowrap" style={{ color: C.textMuted }}>{label}</span>
      <span className={`text-[10px] font-semibold text-right ${mono ? "font-mono" : ""}`} style={{ color: C.text }}>{value}</span>
    </div>
  );
}

/**
 * Pont React ↔ Leaflet : expose l'instance de carte au parent (boutons de zoom,
 * recentrage) et remonte le niveau de zoom + les interactions utilisateur.
 */
function MapBridge({
  mapRef, onZoomChange, onUserInteract,
}: {
  mapRef: { current: L.Map | null };
  onZoomChange: (zoom: number) => void;
  onUserInteract: () => void;
}) {
  const map = useMap();

  useEffect(() => {
    mapRef.current = map;
    onZoomChange(map.getZoom());
    // Le conteneur est souvent dimensionné APRÈS le montage (layout flex) :
    // sans ce recalcul, Leaflet laisse des zones grises.
    const timer = window.setTimeout(() => map.invalidateSize(), 250);
    const observer = new ResizeObserver(() => map.invalidateSize());
    const parent = map.getContainer().parentElement;
    if (parent) observer.observe(parent);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      if (mapRef.current === map) mapRef.current = null;
    };
  }, [map, mapRef, onZoomChange]);

  useMapEvents({
    zoomend: () => onZoomChange(map.getZoom()),
    dragstart: () => onUserInteract(),
  });

  return null;
}

/** Mode suivi : recale la carte sur le véhicule sélectionné à chaque point GPS. */
function FollowVehicle({ vehicle, follow }: { vehicle: LiveVehicle | null; follow: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!follow || !vehicle) return;
    map.setView([vehicle.lat, vehicle.lng], map.getZoom(), { animate: true, duration: 0.9 });
  }, [follow, vehicle, map]);
  return null;
}

/** Points cardinaux français, pour traduire le cap en repère lisible. */
const CARDINALS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"];
const cardinal = (bearing: number) => CARDINALS[Math.round((((bearing % 360) + 360) % 360) / 22.5) % 16];

/** Marqueur d'un véhicule suivi + popup de télémétrie du traceur. */
function VehicleMarker({
  v, selected, onSelect, onOpenDossier,
}: {
  v: LiveVehicle;
  selected: boolean;
  onSelect: (v: LiveVehicle) => void;
  onOpenDossier: (v: Vehicle) => void;
}) {
  // L'icône Leaflet est un fragment DOM : on la reconstruit uniquement lorsque
  // le statut, la sélection ou le cap (par pas de 5°) évoluent — sinon la
  // position est simplement déplacée par `setLatLng`, sans recréer le DOM.
  const bearingStep = Math.round(v.bearing / 5);
  const icon = useMemo(
    () => vehicleIcon(v, selected),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [v.status, v.plate, bearingStep, selected],
  );
  const status = statusConfig[v.status] ?? statusConfig.moving;

  return (
    <Marker position={v} icon={icon} zIndexOffset={selected ? 1000 : 0} eventHandlers={{ click: () => onSelect(v) }}>
      <Popup className="sisbm-popup" autoPan keepInView>
        <div className="w-60">
          <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b" style={{ borderColor: C.borderSoft }}>
            <span className="text-xs font-bold font-mono" style={{ color: C.text }}>{v.plate}</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: va(status.color, "18%"), color: status.color }}>{status.label}</span>
          </div>

          <div className="space-y-1">
            <TelemetryRow label="Véhicule" value={`${v.model} · ${v.driver}`} />
            <TelemetryRow label="Vitesse" value={`${v.speed} km/h`} mono />
            <TelemetryRow label="Cap" value={`${Math.round(v.bearing)}° ${cardinal(v.bearing)}`} mono />
            <TelemetryRow label="Position" value={v.pos} />
            <TelemetryRow label="Coordonnées" value={formatCoords(v)} mono />
            <TelemetryRow label="Traceur" value={`${v.tracker.model} · ${v.tracker.firmware}`} />
            <TelemetryRow label="IMEI" value={v.tracker.imei} mono />
            <TelemetryRow label="SIM" value={`${v.tracker.sim} (${v.tracker.operator})`} mono />
            <TelemetryRow label="GNSS" value={v.satellites > 0 ? `${v.satellites} sat · HDOP ${v.hdop}` : "aucun fix"} mono />
            <TelemetryRow label="Contact moteur" value={v.ignition ? "ON" : "OFF"} />
            <TelemetryRow label="Tension boîtier" value={v.battery > 0 ? `${v.battery.toFixed(1)} V` : "—"} mono />
            <TelemetryRow label="Dernier point" value={formatFixAge(v.lastFix)} />
            <TelemetryRow label="Trajet suivi" value={`${Math.round(v.progress * 100)} % · ${v.odometerKm.toFixed(1)} km`} mono />
          </div>

          <button
            type="button"
            onClick={() => onOpenDossier(v)}
            className="mt-2 w-full rounded-lg py-1.5 text-[11px] font-bold transition-opacity hover:opacity-90"
            style={{ background: C.primary, color: C.white }}
          >
            Fiche véhicule
          </button>
        </div>
      </Popup>
    </Marker>
  );
}

type Props = {
  vehicles: LiveVehicle[];
  selectedPlate?: string | null;
  layer?: MapLayerName;
  showGeofences?: boolean;
  follow?: boolean;
  /** Instance Leaflet exposée au parent (boutons de zoom, recentrage). */
  mapRef: { current: L.Map | null };
  onZoomChange: (zoom: number) => void;
  onUserInteract: () => void;
  onSelect: (v: LiveVehicle) => void;
  onOpenDossier: (v: Vehicle) => void;
};

/**
 * Carte de supervision : tuiles réelles (aucune clé API), zoom/pan natifs,
 * véhicules suivis par traceur, traces GPS, itinéraire parcouru/restant du
 * véhicule sélectionné et zones de géorepérage.
 */
export default function LiveMap({
  vehicles, selectedPlate, layer = "standard", showGeofences = true, follow = false,
  mapRef, onZoomChange, onUserInteract, onSelect, onOpenDossier,
}: Props) {
  const tiles = TILE_LAYERS[layer];
  const selected = vehicles.find((v) => v.plate === selectedPlate) ?? null;
  const route = selected ? vehicleRoutes[selected.plate] ?? null : null;
  const segments = route && selected ? splitRoute(route, selected.progress) : null;
  const zoneClass = (kind: string) => (kind === "restreinte" ? "sisbm-zone--restreinte" : "sisbm-zone--autorisee");

  return (
    <MapContainer
      center={ABIDJAN_CENTER}
      zoom={ABIDJAN_ZOOM}
      minZoom={ZOOM_RANGE[0]}
      maxZoom={ZOOM_RANGE[1]}
      zoomControl={false}
      attributionControl
      style={{ height: "100%", width: "100%" }}
    >
      {/* `key` sur la couche : force le remplacement des tuiles au changement de fond. */}
      <TileLayer key={layer} url={tiles.url} attribution={tiles.attribution} maxZoom={tiles.maxZoom} subdomains={tiles.subdomains ?? "abc"} />
      {tiles.labels && <TileLayer key={`${layer}-labels`} url={tiles.labels} maxZoom={tiles.maxZoom} />}
      <ScaleControl position="bottomleft" imperial={false} />
      <AttributionControl position="bottomright" prefix={false} />

      {showGeofences && geofences.map((z) =>
        z.shape.type === "circle" ? (
          <Circle key={z.id} center={z.shape.center} radius={z.shape.radiusM} pathOptions={{ className: zoneClass(z.kind), interactive: false }} />
        ) : (
          <Polygon key={z.id} positions={z.shape.points} pathOptions={{ className: zoneClass(z.kind), interactive: false }} />
        ),
      )}

      {segments && (
        <>
          <Polyline positions={segments.done} pathOptions={{ className: "sisbm-route-done", interactive: false }} />
          {segments.todo.length > 1 && (
            <Polyline positions={segments.todo} pathOptions={{ className: "sisbm-route-todo", interactive: false }} />
          )}
        </>
      )}

      {/* Trace GPS réelle : positions successives remontées par le traceur.
          La clé inclut le statut car Leaflet n'applique le `className` d'un
          tracé qu'à sa création — recréer la couche fait donc suivre la couleur. */}
      {vehicles.filter((v) => v.trail.length > 1).map((v) => (
        <Polyline
          key={`trail-${v.plate}-${v.status}`}
          positions={v.trail}
          pathOptions={{ className: `sisbm-trail sisbm-trail--${v.status}`, interactive: false }}
        />
      ))}

      {vehicles.map((v) => (
        <VehicleMarker key={v.plate} v={v} selected={v.plate === selectedPlate} onSelect={onSelect} onOpenDossier={onOpenDossier} />
      ))}

      <MapBridge mapRef={mapRef} onZoomChange={onZoomChange} onUserInteract={onUserInteract} />
      <FollowVehicle vehicle={follow ? selected : null} follow={follow} />
    </MapContainer>
  );
}