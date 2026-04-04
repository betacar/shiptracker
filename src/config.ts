export const TILE_URL =
  "https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>';

export const MAP_CENTER: [number, number] = [20, 0];
export const MAP_ZOOM = 3;

const wsProtocol = location.protocol === "https:" ? "wss:" : "ws:";
export const AISSTREAM_WS_URL = `${wsProtocol}//${location.host}/ais-ws`;

export const DIGITRAFFIC_LOCATIONS_URL =
  "https://meri.digitraffic.fi/api/ais/v1/locations";
export const DIGITRAFFIC_VESSELS_URL =
  "https://meri.digitraffic.fi/api/ais/v1/vessels";

export const POLL_INTERVAL_MS = 30_000;
export const STALE_THRESHOLD_MS = 5 * 60_000;

export const AIS_HEADING_UNAVAILABLE = 511;
