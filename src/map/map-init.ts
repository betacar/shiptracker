import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TILE_URL, TILE_ATTRIBUTION, MAP_CENTER, MAP_ZOOM } from "../config";

export function initMap(containerId: string): L.Map {
  const map = L.map(containerId, {
    center: MAP_CENTER,
    zoom: MAP_ZOOM,
    zoomControl: true,
    attributionControl: true,
  });

  L.tileLayer(TILE_URL, {
    attribution: TILE_ATTRIBUTION,
    maxZoom: 18,
  }).addTo(map);

  return map;
}
