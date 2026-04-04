import { describe, it, expect } from "vitest";
import { getEffectiveHeading } from "../../src/map/marker-factory";
import type { VesselLocation } from "../../src/types";

function makeLocation(overrides: Partial<VesselLocation> = {}): VesselLocation {
  return {
    mmsi: 123456789,
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

describe("getEffectiveHeading", () => {
  it("uses true heading when available", () => {
    const loc = makeLocation({ heading: 175, cog: 180 });
    expect(getEffectiveHeading(loc)).toBe(175);
  });

  it("falls back to COG when heading is 511 (unavailable)", () => {
    const loc = makeLocation({ heading: 511, cog: 220 });
    expect(getEffectiveHeading(loc)).toBe(220);
  });

  it("uses heading 0 as valid (due north)", () => {
    const loc = makeLocation({ heading: 0, cog: 90 });
    expect(getEffectiveHeading(loc)).toBe(0);
  });
});
