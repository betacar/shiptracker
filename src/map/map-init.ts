import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TILE_URL, TILE_ATTRIBUTION, MAP_CENTER, MAP_ZOOM } from "../config";

interface SavedView {
  readonly lat: number;
  readonly lng: number;
  readonly zoom: number;
}

function loadViewFromUrl(): SavedView | null {
  const params = new URLSearchParams(window.location.search);
  const lat = Number(params.get("lat"));
  const lng = Number(params.get("lng"));
  const zoom = Number(params.get("z"));

  if (Number.isFinite(lat) && Number.isFinite(lng) && Number.isFinite(zoom)) {
    return { lat, lng, zoom };
  }
  return null;
}

function saveViewToUrl(map: L.Map): void {
  const center = map.getCenter();
  const params = new URLSearchParams(window.location.search);
  params.set("lat", center.lat.toFixed(4));
  params.set("lng", center.lng.toFixed(4));
  params.set("z", String(map.getZoom()));

  const url = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState(null, "", url);
}

export function initMap(containerId: string): L.Map {
  const saved = loadViewFromUrl();
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

  map.on("moveend", () => saveViewToUrl(map));

  return map;
}
