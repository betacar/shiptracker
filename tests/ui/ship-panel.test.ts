import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildPanelContent, showPanel, hidePanel } from "../../src/ui/ship-panel";
import type { VesselData, VesselLocation, VesselMetadata } from "../../src/types";

function makeLocation(overrides: Partial<VesselLocation> = {}): VesselLocation {
  return {
    mmsi: 245473000,
    lat: 51.4,
    lng: 3.5,
    sog: 12.3,
    cog: 205.7,
    heading: 205,
    navStatus: 0,
    timestamp: Date.now(),
    ...overrides,
  };
}

function makeMetadata(overrides: Partial<VesselMetadata> = {}): VesselMetadata {
  return {
    mmsi: 245473000,
    name: "NORD SUPERIOR",
    imo: 9692129,
    callSign: "OWPA2",
    shipType: 80,
    destination: "NL AMS",
    draught: 11.8,
    eta: new Date(2024, 3, 16, 12, 0).getTime(),
    dimensionA: 100,
    dimensionB: 100,
    dimensionC: 16,
    dimensionD: 16,
    ...overrides,
  };
}

describe("buildPanelContent", () => {
  it("renders vessel name as title", () => {
    const data: VesselData = { location: makeLocation(), metadata: makeMetadata() };
    const fragment = buildPanelContent(data);
    const container = document.createElement("div");
    container.appendChild(fragment);

    const title = container.querySelector(".panel-title");
    expect(title?.textContent).toBe("NORD SUPERIOR");
  });

  it("renders Unknown Vessel when no metadata", () => {
    const data: VesselData = { location: makeLocation(), metadata: null };
    const fragment = buildPanelContent(data);
    const container = document.createElement("div");
    container.appendChild(fragment);

    expect(container.querySelector(".panel-title")?.textContent).toBe("Unknown Vessel");
  });

  it("includes MMSI row", () => {
    const data: VesselData = { location: makeLocation(), metadata: makeMetadata() };
    const fragment = buildPanelContent(data);
    const container = document.createElement("div");
    container.appendChild(fragment);

    const rows = container.querySelectorAll(".panel-row");
    const mmsiRow = Array.from(rows).find(
      (r) => r.querySelector(".panel-label")?.textContent === "MMSI",
    );
    expect(mmsiRow?.querySelector(".panel-value")?.textContent).toBe("245473000");
  });

  it("includes speed row", () => {
    const data: VesselData = { location: makeLocation({ sog: 8.5 }), metadata: null };
    const fragment = buildPanelContent(data);
    const container = document.createElement("div");
    container.appendChild(fragment);

    const rows = container.querySelectorAll(".panel-row");
    const speedRow = Array.from(rows).find(
      (r) => r.querySelector(".panel-label")?.textContent === "Speed",
    );
    expect(speedRow?.querySelector(".panel-value")?.textContent).toBe("8.5 kn");
  });

  it("has a close button", () => {
    const data: VesselData = { location: makeLocation(), metadata: makeMetadata() };
    const fragment = buildPanelContent(data);
    const container = document.createElement("div");
    container.appendChild(fragment);

    expect(container.querySelector(".panel-close")).not.toBeNull();
  });

  it("includes metadata fields when available", () => {
    const data: VesselData = { location: makeLocation(), metadata: makeMetadata() };
    const fragment = buildPanelContent(data);
    const container = document.createElement("div");
    container.appendChild(fragment);

    const labels = Array.from(container.querySelectorAll(".panel-label")).map(
      (el) => el.textContent,
    );
    expect(labels).toContain("IMO");
    expect(labels).toContain("Call Sign");
    expect(labels).toContain("Destination");
    expect(labels).toContain("ETA");
    expect(labels).toContain("Draught");
    expect(labels).toContain("Dimensions");
  });

  it("excludes metadata fields when metadata is null", () => {
    const data: VesselData = { location: makeLocation(), metadata: null };
    const fragment = buildPanelContent(data);
    const container = document.createElement("div");
    container.appendChild(fragment);

    const labels = Array.from(container.querySelectorAll(".panel-label")).map(
      (el) => el.textContent,
    );
    expect(labels).not.toContain("IMO");
    expect(labels).not.toContain("Call Sign");
    expect(labels).not.toContain("Destination");
  });
});

describe("showPanel / hidePanel", () => {
  let panelEl: HTMLElement;

  beforeEach(() => {
    panelEl = document.createElement("div");
    panelEl.id = "ship-panel";
  });

  it("adds 'open' class on showPanel", () => {
    const data: VesselData = { location: makeLocation(), metadata: makeMetadata() };
    showPanel(panelEl, data, vi.fn());
    expect(panelEl.classList.contains("open")).toBe(true);
  });

  it("removes 'open' class on hidePanel", () => {
    panelEl.classList.add("open");
    hidePanel(panelEl);
    expect(panelEl.classList.contains("open")).toBe(false);
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    const data: VesselData = { location: makeLocation(), metadata: makeMetadata() };
    showPanel(panelEl, data, onClose);

    const closeBtn = panelEl.querySelector(".panel-close") as HTMLElement;
    closeBtn.click();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("removes 'open' class when close button is clicked", () => {
    const data: VesselData = { location: makeLocation(), metadata: makeMetadata() };
    showPanel(panelEl, data, vi.fn());
    expect(panelEl.classList.contains("open")).toBe(true);

    const closeBtn = panelEl.querySelector(".panel-close") as HTMLElement;
    closeBtn.click();
    expect(panelEl.classList.contains("open")).toBe(false);
  });
});
