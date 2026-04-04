import L from "leaflet";
import "leaflet-rotatedmarker";
import { AIS_HEADING_UNAVAILABLE } from "../config";
import type { VesselLocation, VesselMetadata } from "../types";
import { getShipTypeInfo, type ShipShape } from "../utils/ship-type";

// All SVGs are top-down views pointing UP (north). Rotation handles the rest.
// Viewbox: 20x28, anchor at center (10, 14).
const SHIP_SVGS: Record<ShipShape, string> = {
  // Cargo: rectangular hull, flat stern, pointed bow, bridge block at stern
  cargo: `<path d="M6 24 L6 8 L10 1 L14 8 L14 24 Z" fill="COLOR" stroke="rgba(0,0,0,0.6)" stroke-width="0.8"/>
    <rect x="7" y="18" width="6" height="4" rx="0.5" fill="rgba(255,255,255,0.3)"/>`,

  // Tanker: wider rounded hull, rounded bow, pipes along deck
  tanker: `<path d="M5 24 Q5 26 10 26 Q15 26 15 24 L15 8 Q15 2 10 1 Q5 2 5 8 Z" fill="COLOR" stroke="rgba(0,0,0,0.6)" stroke-width="0.8"/>
    <line x1="10" y1="6" x2="10" y2="19" stroke="rgba(255,255,255,0.25)" stroke-width="1.5"/>
    <rect x="7.5" y="20" width="5" height="3" rx="0.5" fill="rgba(255,255,255,0.3)"/>`,

  // Passenger: long sleek hull, rounded, multiple deck windows
  passenger: `<path d="M6 25 Q6 27 10 27 Q14 27 14 25 L14 6 Q14 1 10 0 Q6 1 6 6 Z" fill="COLOR" stroke="rgba(0,0,0,0.6)" stroke-width="0.8"/>
    <rect x="7.5" y="8" width="5" height="1.5" rx="0.5" fill="rgba(255,255,255,0.35)"/>
    <rect x="7.5" y="12" width="5" height="1.5" rx="0.5" fill="rgba(255,255,255,0.35)"/>
    <rect x="7.5" y="16" width="5" height="1.5" rx="0.5" fill="rgba(255,255,255,0.35)"/>
    <rect x="8" y="21" width="4" height="3" rx="0.5" fill="rgba(255,255,255,0.3)"/>`,

  // Fishing: small hull with trawl booms extending to sides
  fishing: `<path d="M7 23 L7 9 L10 3 L13 9 L13 23 Z" fill="COLOR" stroke="rgba(0,0,0,0.6)" stroke-width="0.8"/>
    <line x1="10" y1="10" x2="3" y2="16" stroke="COLOR" stroke-width="1.2"/>
    <line x1="10" y1="10" x2="17" y2="16" stroke="COLOR" stroke-width="1.2"/>
    <rect x="8" y="17" width="4" height="3" rx="0.5" fill="rgba(255,255,255,0.3)"/>`,

  // Tug: short stubby hull, wide beam, prominent wheelhouse
  tug: `<path d="M5 22 L5 10 Q5 5 10 4 Q15 5 15 10 L15 22 Q15 25 10 25 Q5 25 5 22 Z" fill="COLOR" stroke="rgba(0,0,0,0.6)" stroke-width="0.8"/>
    <rect x="7" y="8" width="6" height="5" rx="1" fill="rgba(255,255,255,0.35)"/>`,

  // Sailing: hull with triangular sail
  sailing: `<path d="M7 25 L7 10 L10 3 L13 10 L13 25 Q10 27 7 25 Z" fill="COLOR" stroke="rgba(0,0,0,0.6)" stroke-width="0.8"/>
    <path d="M10 5 L10 18 L15 15 Z" fill="rgba(255,255,255,0.4)" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>`,

  // HSC (high speed craft): sharp angular catamaran-like hull
  hsc: `<path d="M4 24 L8 24 L10 1 L12 24 L16 24 L14 26 L6 26 Z" fill="COLOR" stroke="rgba(0,0,0,0.6)" stroke-width="0.8"/>`,

  // Military: angular stealth-like hull
  military: `<path d="M6 24 L4 20 L7 8 L10 1 L13 8 L16 20 L14 24 Z" fill="COLOR" stroke="rgba(0,0,0,0.6)" stroke-width="0.8"/>
    <path d="M8 18 L10 10 L12 18 Z" fill="rgba(255,255,255,0.2)"/>`,

  // Default: simple arrow/chevron
  default: `<path d="M10 0 L20 24 L10 20 L0 24 Z" fill="COLOR" stroke="rgba(0,0,0,0.6)" stroke-width="0.8"/>`,
};

function createShipIcon(color: string, shape: ShipShape): L.DivIcon {
  const svg = SHIP_SVGS[shape].replace(/COLOR/g, color);
  return L.divIcon({
    className: "ship-marker",
    html: `<svg width="20" height="28" viewBox="0 0 20 28" xmlns="http://www.w3.org/2000/svg">${svg}</svg>`,
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
    icon: createShipIcon(info.color, info.shape),
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
  (
    marker as L.Marker & { setRotationAngle: (a: number) => void }
  ).setRotationAngle(heading);

  if (metadata) {
    const info = getShipTypeInfo(metadata.shipType);
    marker.setIcon(createShipIcon(info.color, info.shape));
    marker.setTooltipContent(metadata.name || `MMSI: ${location.mmsi}`);
  }
}
