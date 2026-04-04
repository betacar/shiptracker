import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMarkerManager } from "../../src/map/marker-manager";
import type { VesselLocation, VesselMetadata } from "../../src/types";

function makeLocation(overrides: Partial<VesselLocation> = {}): VesselLocation {
  return {
    mmsi: 100000000,
    lat: 51.0,
    lng: 3.5,
    sog: 10,
    cog: 180,
    heading: 175,
    navStatus: 0,
    timestamp: Date.now(),
    ...overrides,
  };
}

function makeMetadata(overrides: Partial<VesselMetadata> = {}): VesselMetadata {
  return {
    mmsi: 100000000,
    name: "TEST VESSEL",
    imo: 1234567,
    callSign: "ABCD",
    shipType: 70,
    destination: "TEST PORT",
    draught: 5.0,
    eta: 0,
    dimensionA: 50,
    dimensionB: 50,
    dimensionC: 10,
    dimensionD: 10,
    ...overrides,
  };
}

function createMockMap() {
  return ({
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
  } as unknown) as import("leaflet").Map;
}

describe("createMarkerManager", () => {
  let map: import("leaflet").Map;
  let onClick: (mmsi: number) => void;

  beforeEach(() => {
    map = createMockMap();
    onClick = vi.fn<(mmsi: number) => void>();
  });

  it("starts with zero vessels", () => {
    const manager = createMarkerManager(map, onClick);
    expect(manager.getVesselCount()).toBe(0);
  });

  it("adds a new vessel on first position update", () => {
    const manager = createMarkerManager(map, onClick);
    manager.updatePosition(makeLocation());
    expect(manager.getVesselCount()).toBe(1);
  });

  it("updates existing vessel position without duplicating", () => {
    const manager = createMarkerManager(map, onClick);
    manager.updatePosition(makeLocation({ lat: 51.0 }));
    manager.updatePosition(makeLocation({ lat: 52.0 }));
    expect(manager.getVesselCount()).toBe(1);
  });

  it("tracks multiple vessels by MMSI", () => {
    const manager = createMarkerManager(map, onClick);
    manager.updatePosition(makeLocation({ mmsi: 111111111 }));
    manager.updatePosition(makeLocation({ mmsi: 222222222 }));
    manager.updatePosition(makeLocation({ mmsi: 333333333 }));
    expect(manager.getVesselCount()).toBe(3);
  });

  it("returns vessel data after position update", () => {
    const manager = createMarkerManager(map, onClick);
    const loc = makeLocation({ mmsi: 111111111 });
    manager.updatePosition(loc);

    const data = manager.getVesselData(111111111);
    expect(data).not.toBeNull();
    expect(data!.location.mmsi).toBe(111111111);
    expect(data!.metadata).toBeNull();
  });

  it("returns null for unknown MMSI", () => {
    const manager = createMarkerManager(map, onClick);
    expect(manager.getVesselData(999999999)).toBeNull();
  });

  it("attaches metadata to existing vessel", () => {
    const manager = createMarkerManager(map, onClick);
    manager.updatePosition(makeLocation({ mmsi: 111111111 }));
    manager.updateMetadata(makeMetadata({ mmsi: 111111111, name: "MY SHIP" }));

    const data = manager.getVesselData(111111111);
    expect(data!.metadata).not.toBeNull();
    expect(data!.metadata!.name).toBe("MY SHIP");
  });

  it("ignores metadata for unknown vessel", () => {
    const manager = createMarkerManager(map, onClick);
    manager.updateMetadata(makeMetadata({ mmsi: 999999999 }));
    expect(manager.getVesselCount()).toBe(0);
  });

  it("prunes stale entries", () => {
    const manager = createMarkerManager(map, onClick);
    const loc = makeLocation({ mmsi: 111111111 });
    manager.updatePosition(loc);
    expect(manager.getVesselCount()).toBe(1);

    // Fast-forward time past stale threshold
    vi.spyOn(Date, "now").mockReturnValue(Date.now() + 6 * 60_000);
    manager.pruneStale();
    expect(manager.getVesselCount()).toBe(0);

    vi.restoreAllMocks();
  });

  it("keeps recent entries when pruning", () => {
    const manager = createMarkerManager(map, onClick);
    manager.updatePosition(makeLocation({ mmsi: 111111111 }));

    // Only 1 minute has passed — not stale
    vi.spyOn(Date, "now").mockReturnValue(Date.now() + 60_000);
    manager.pruneStale();
    expect(manager.getVesselCount()).toBe(1);

    vi.restoreAllMocks();
  });
});
