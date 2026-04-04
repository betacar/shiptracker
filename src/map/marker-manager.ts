import type L from "leaflet";
import type { VesselLocation, VesselMetadata, VesselData } from "../types";
import { createShipMarker, updateShipMarker } from "./marker-factory";
import { STALE_THRESHOLD_MS } from "../config";

interface MarkerEntry {
  marker: L.Marker;
  location: VesselLocation;
  metadata: VesselMetadata | null;
  lastUpdate: number;
}

export interface MarkerManager {
  readonly updatePosition: (location: VesselLocation) => void;
  readonly updateMetadata: (metadata: VesselMetadata) => void;
  readonly getVesselData: (mmsi: number) => VesselData | null;
  readonly getVesselCount: () => number;
  readonly pruneStale: () => void;
}

export function createMarkerManager(
  map: L.Map,
  onShipClick: (mmsi: number) => void,
): MarkerManager {
  const entries = new Map<number, MarkerEntry>();

  function updatePosition(location: VesselLocation): void {
    const existing = entries.get(location.mmsi);

    if (existing) {
      const updatedEntry: MarkerEntry = {
        ...existing,
        location,
        lastUpdate: Date.now(),
      };
      updateShipMarker(existing.marker, location, existing.metadata);
      entries.set(location.mmsi, updatedEntry);
    } else {
      const marker = createShipMarker(location, null, onShipClick);
      marker.addTo(map);
      entries.set(location.mmsi, {
        marker,
        location,
        metadata: null,
        lastUpdate: Date.now(),
      });
    }
  }

  function updateMetadata(metadata: VesselMetadata): void {
    const existing = entries.get(metadata.mmsi);
    if (!existing) return;

    const updatedEntry: MarkerEntry = {
      ...existing,
      metadata,
    };
    updateShipMarker(existing.marker, existing.location, metadata);
    entries.set(metadata.mmsi, updatedEntry);
  }

  function getVesselData(mmsi: number): VesselData | null {
    const entry = entries.get(mmsi);
    if (!entry) return null;
    return { location: entry.location, metadata: entry.metadata };
  }

  function getVesselCount(): number {
    return entries.size;
  }

  function pruneStale(): void {
    const now = Date.now();
    for (const [mmsi, entry] of entries) {
      if (now - entry.lastUpdate > STALE_THRESHOLD_MS) {
        entry.marker.remove();
        entries.delete(mmsi);
      }
    }
  }

  return { updatePosition, updateMetadata, getVesselData, getVesselCount, pruneStale };
}
