import type { VesselData } from "../types";
import {
  formatSpeed,
  formatHeading,
  formatCourse,
  formatShipType,
  formatNavStatus,
  formatEta,
  formatDraught,
  formatDimensions,
  formatMmsi,
} from "./panel-formatter";

function createRow(label: string, value: string): HTMLDivElement {
  const row = document.createElement("div");
  row.className = "panel-row";

  const labelEl = document.createElement("span");
  labelEl.className = "panel-label";
  labelEl.textContent = label;

  const valueEl = document.createElement("span");
  valueEl.className = "panel-value";
  valueEl.textContent = value;

  row.appendChild(labelEl);
  row.appendChild(valueEl);
  return row;
}

function createDivider(): HTMLDivElement {
  const div = document.createElement("div");
  div.className = "panel-divider";
  return div;
}

export function buildPanelContent(data: VesselData): DocumentFragment {
  const { location, metadata } = data;
  const name = metadata?.name || "Unknown Vessel";

  const fragment = document.createDocumentFragment();

  // Header
  const header = document.createElement("div");
  header.className = "panel-header";

  const title = document.createElement("h2");
  title.className = "panel-title";
  title.textContent = name;

  const closeBtn = document.createElement("button");
  closeBtn.className = "panel-close";
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.textContent = "\u00D7";

  header.appendChild(title);
  header.appendChild(closeBtn);
  fragment.appendChild(header);

  // Body
  const body = document.createElement("div");
  body.className = "panel-body";

  body.appendChild(createRow("MMSI", formatMmsi(location.mmsi)));
  if (metadata) {
    body.appendChild(createRow("IMO", String(metadata.imo || "N/A")));
    body.appendChild(createRow("Call Sign", metadata.callSign || "N/A"));
  }
  body.appendChild(createRow("Type", formatShipType(metadata?.shipType ?? 0)));

  body.appendChild(createDivider());

  body.appendChild(createRow("Speed", formatSpeed(location.sog)));
  body.appendChild(createRow("Course", formatCourse(location.cog)));
  body.appendChild(createRow("Heading", formatHeading(location.heading)));
  body.appendChild(createRow("Nav Status", formatNavStatus(location.navStatus)));

  body.appendChild(createDivider());

  if (metadata) {
    body.appendChild(createRow("Destination", metadata.destination || "N/A"));
    body.appendChild(createRow("ETA", formatEta(metadata.eta)));
    body.appendChild(createRow("Draught", formatDraught(metadata.draught)));
    body.appendChild(
      createRow(
        "Dimensions",
        formatDimensions(
          metadata.dimensionA,
          metadata.dimensionB,
          metadata.dimensionC,
          metadata.dimensionD,
        ),
      ),
    );
  }

  fragment.appendChild(body);
  return fragment;
}

export function showPanel(
  panelEl: HTMLElement,
  data: VesselData,
  onClose: () => void,
): void {
  panelEl.replaceChildren(buildPanelContent(data));
  panelEl.classList.add("open");

  const closeBtn = panelEl.querySelector(".panel-close");
  closeBtn?.addEventListener("click", () => {
    hidePanel(panelEl);
    onClose();
  });
}

export function hidePanel(panelEl: HTMLElement): void {
  panelEl.classList.remove("open");
}
