// ─── Carte de supervision Abidjan (compatibilité) ─────────────────────────────
// Fine couche de compatibilité : l'ancienne `AbidjanMap` (repère pixel 650×420 +
// iframe Google Maps) est remplacée par la vraie carte Leaflet temps réel
// (`LiveMap` + flux `useGpsFeed`). L'API du composant est inchangée pour ne pas
// casser le Tableau de bord : `onVehicleClick`, `selectedVehicle`, `height`.
import { useRef, useState } from "react";
import type { Vehicle } from "@/data/mock";
import { useGpsFeed } from "@/data/gpsFeed";
import LiveMap from "@/components/LiveMap";

type Props = {
  onVehicleClick: (v: Vehicle) => void;
  selectedVehicle?: Vehicle | null;
  /** Hauteur de la carte : nombre en px, ou "100%" (défaut) pour remplir son conteneur parent. */
  height?: number | string;
};

export default function AbidjanMap({ onVehicleClick, selectedVehicle, height = "100%" }: Props) {
  const { vehicles: live } = useGpsFeed();
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const [, setZoom] = useState(12);

  return (
    <div style={{ height, minHeight: 320 }} className="relative w-full overflow-hidden rounded-xl">
      <LiveMap
        vehicles={live}
        selectedPlate={selectedVehicle?.plate ?? null}
        layer="standard"
        showGeofences
        follow={false}
        mapRef={mapRef}
        onZoomChange={setZoom}
        onUserInteract={() => {}}
        onSelect={(v) => onVehicleClick(v)}
        onOpenDossier={(v) => onVehicleClick(v)}
      />
    </div>
  );
}
