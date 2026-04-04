import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TILE_URL, TILE_ATTRIBUTION, MAP_CENTER, MAP_ZOOM } from "../config";

const STORAGE_KEY = "shiptracker:view";

interface SavedView {
  readonly lat: number;
  readonly lng: number;
  readonly zoom: number;
}

function loadSavedView(): SavedView | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedView;
    if (
      typeof parsed.lat === "number" &&
      typeof parsed.lng === "number" &&
      typeof parsed.zoom === "number"
    ) {
      return parsed;
    }
  } catch {
    // Ignore corrupt data
  }
  return null;
}

function saveView(map: L.Map): void {
  const center = map.getCenter();
  const view: SavedView = {
    lat: center.lat,
    lng: center.lng,
    zoom: map.getZoom(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(view));
}

export function initMap(containerId: string): L.Map {
  const saved = loadSavedView();
  const center: [number, number] = saved
    ? [saved.lat, saved.lng]
    : MAP_CENTER;
  const zoom = saved?.zoom ?? MAP_ZOOM;

  const map = L.map(containerId, {
    center,
    zoom,
    zoomControl: true,
    attributionControl: true,
  });

  L.tileLayer(TILE_URL, {
    attribution: TILE_ATTRIBUTION,
    maxZoom: 18,
  }).addTo(map);

  map.on("moveend", () => saveView(map));

  return map;
}
