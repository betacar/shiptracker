import "./styles/main.css";
import { initMap } from "./map/map-init";
import { createMarkerManager } from "./map/marker-manager";
import { createDataSource } from "./api/data-source";
import { showPanel, hidePanel } from "./ui/ship-panel";
import { STALE_THRESHOLD_MS } from "./config";

const map = initMap("map");
const panelEl = document.getElementById("ship-panel")!;
const countEl = document.querySelector("#ship-count span")!;
const loadingEl = document.getElementById("loading")!;
const bannerEl = document.getElementById("fallback-banner")!;

let firstDataReceived = false;

function updateCount(count: number): void {
  countEl.textContent = String(count);
}

function handleShipClick(mmsi: number): void {
  const data = markerManager.getVesselData(mmsi);
  if (!data) return;

  showPanel(panelEl, data, () => {
    hidePanel(panelEl);
  });
}

const markerManager = createMarkerManager(map, handleShipClick);

const { source, isGlobal } = createDataSource(
  (location) => {
    if (!firstDataReceived) {
      firstDataReceived = true;
      loadingEl.classList.add("hidden");
    }
    markerManager.updatePosition(location);
    updateCount(markerManager.getVesselCount());
  },
  (metadata) => {
    markerManager.updateMetadata(metadata);
  },
  () => {
    bannerEl.textContent =
      "AISStream connection failed — falling back to Baltic region";
    bannerEl.classList.remove("hidden");
  }
);

if (!isGlobal) {
  bannerEl.classList.remove("hidden");
}

// Close panel when clicking the map
map.on("click", () => {
  hidePanel(panelEl);
});

// Prune stale markers periodically
setInterval(() => {
  markerManager.pruneStale();
  updateCount(markerManager.getVesselCount());
}, STALE_THRESHOLD_MS);

source.start();
