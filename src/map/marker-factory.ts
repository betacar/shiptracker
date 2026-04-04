import L from "leaflet";
import "leaflet-rotatedmarker";
import { AIS_HEADING_UNAVAILABLE } from "../config";
import type { VesselLocation, VesselMetadata } from "../types";
import { getShipTypeInfo } from "../utils/ship-type";

function createShipIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: "ship-marker",
    html: `<svg width="20" height="28" viewBox="0 0 20 28" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 0 L20 24 L10 20 L0 24 Z" fill="${color}" stroke="rgba(0,0,0,0.6)" stroke-width="1"/>
    </svg>`,
    iconSize: [20, 28],
    iconAnchor: [10, 14],
  });
}

export function getEffectiveHeading(location: VesselLocation): number {
  return location.heading !== AIS_HEADING_UNAVAILABLE
    ? location.heading
    : location.cog;
}

export function createShipMarker(
  location: VesselLocation,
  metadata: VesselMetadata | null,
  onClick: (mmsi: number) => void,
): L.Marker {
  const shipType = metadata?.shipType ?? 0;
  const info = getShipTypeInfo(shipType);
  const heading = getEffectiveHeading(location);
  const label = metadata?.name || `MMSI: ${location.mmsi}`;

  const marker = L.marker([location.lat, location.lng], {
    icon: createShipIcon(info.color),
    rotationAngle: heading,
    rotationOrigin: "center center",
  } as L.MarkerOptions);

  marker.bindTooltip(label, {
    direction: "top",
    offset: [0, -14],
    className: "ship-tooltip",
  });

  marker.on("click", () => onClick(location.mmsi));

  return marker;
}

export function updateShipMarker(
  marker: L.Marker,
  location: VesselLocation,
  metadata: VesselMetadata | null,
): void {
  marker.setLatLng([location.lat, location.lng]);

  const heading = getEffectiveHeading(location);
  (marker as L.Marker & { setRotationAngle: (a: number) => void }).setRotationAngle(heading);

  if (metadata) {
    const info = getShipTypeInfo(metadata.shipType);
    marker.setIcon(createShipIcon(info.color));
    marker.setTooltipContent(metadata.name || `MMSI: ${location.mmsi}`);
  }
}
