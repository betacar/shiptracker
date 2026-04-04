import { describe, it, expect, vi, afterEach } from "vitest";
import {
  parseFeature,
  parseVessel,
  fetchLocations,
  fetchVessels,
  createDigitrafficSource,
} from "../../src/api/digitraffic";
import type { DigitTrafficFeature } from "../../src/api/digitraffic";
import locationsFixture from "../fixtures/digitraffic-locations.json";
import vesselsFixture from "../fixtures/digitraffic-vessels.json";

describe("parseFeature", () => {
  const feature = (locationsFixture
    .features[0] as unknown) as DigitTrafficFeature;

  it("extracts lat/lng from GeoJSON coordinates (lng,lat order)", () => {
    const result = parseFeature(feature);
    expect(result.lat).toBe(55.770832);
    expect(result.lng).toBe(20.85169);
  });

  it("extracts MMSI from properties", () => {
    expect(parseFeature(feature).mmsi).toBe(219598000);
  });

  it("maps all navigation properties", () => {
    const result = parseFeature(feature);
    expect(result.sog).toBe(0.1);
    expect(result.cog).toBe(346.5);
    expect(result.heading).toBe(79);
    expect(result.navStatus).toBe(1);
    expect(result.timestamp).toBe(1718458200000);
  });
});

describe("parseVessel", () => {
  const vessel = vesselsFixture[0];

  it("parses vessel metadata", () => {
    const result = parseVessel(vessel);
    expect(result.mmsi).toBe(219598000);
    expect(result.name).toBe("NORD SUPERIOR");
    expect(result.imo).toBe(9692129);
    expect(result.callSign).toBe("OWPA2");
    expect(result.shipType).toBe(80);
    expect(result.destination).toBe("NL AMS");
  });

  it("converts draught from decimeters to meters", () => {
    const result = parseVessel(vessel);
    expect(result.draught).toBe(11.8);
  });
});

describe("fetchLocations", () => {
  it("fetches and parses location data", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(locationsFixture),
    });

    const locations = await fetchLocations(
      (mockFetch as unknown) as typeof fetch
    );

    expect(mockFetch).toHaveBeenCalledWith(
      "https://meri.digitraffic.fi/api/ais/v1/locations"
    );
    expect(locations).toHaveLength(2);
    expect(locations[0].mmsi).toBe(219598000);
    expect(locations[1].mmsi).toBe(376128000);
  });
});

describe("fetchVessels", () => {
  it("fetches and parses vessel metadata", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(vesselsFixture),
    });

    const vessels = await fetchVessels((mockFetch as unknown) as typeof fetch);

    expect(vessels).toHaveLength(2);
    expect(vessels[0].name).toBe("NORD SUPERIOR");
    expect(vessels[1].name).toBe("FFS ATLAS");
  });
});

describe("createDigitrafficSource", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls onPosition for each location on start", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({ json: () => Promise.resolve(locationsFixture) })
      .mockResolvedValueOnce({ json: () => Promise.resolve(vesselsFixture) });
    vi.stubGlobal("fetch", mockFetch);

    const onPosition = vi.fn();
    const onMetadata = vi.fn();
    const source = createDigitrafficSource(onPosition, onMetadata);

    source.start();

    // Wait for async poll to complete
    await new Promise((r) => setTimeout(r, 50));

    expect(onPosition.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(onPosition.mock.calls[0][0].mmsi).toBe(219598000);

    source.stop();
    vi.unstubAllGlobals();
  });

  it("calls onMetadata for each vessel on start", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({ json: () => Promise.resolve(locationsFixture) })
      .mockResolvedValueOnce({ json: () => Promise.resolve(vesselsFixture) });
    vi.stubGlobal("fetch", mockFetch);

    const onPosition = vi.fn();
    const onMetadata = vi.fn();
    const source = createDigitrafficSource(onPosition, onMetadata);

    source.start();
    await new Promise((r) => setTimeout(r, 50));

    expect(onMetadata.mock.calls.length).toBeGreaterThanOrEqual(2);

    source.stop();
    vi.unstubAllGlobals();
  });

  it("stops polling on stop()", async () => {
    const mockFetch = vi.fn((url: string) => {
      if (url.includes("vessels")) {
        return Promise.resolve({ json: () => Promise.resolve(vesselsFixture) });
      }
      return Promise.resolve({ json: () => Promise.resolve(locationsFixture) });
    });
    vi.stubGlobal("fetch", mockFetch);

    const source = createDigitrafficSource(vi.fn(), vi.fn());
    source.start();
    source.stop();

    await new Promise((r) => setTimeout(r, 100));
    // Initial poll + loadMetadata = 2 calls, no more after stop
    expect(mockFetch.mock.calls.length).toBeLessThanOrEqual(3);

    vi.unstubAllGlobals();
  });
});
