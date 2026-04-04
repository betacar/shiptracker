import { describe, it, expect } from "vitest";
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
} from "../../src/ui/panel-formatter";

describe("formatSpeed", () => {
  it("formats speed with one decimal", () => {
    expect(formatSpeed(12.3)).toBe("12.3 kn");
  });

  it("formats zero speed", () => {
    expect(formatSpeed(0)).toBe("0.0 kn");
  });
});

describe("formatHeading", () => {
  it("formats north heading", () => {
    expect(formatHeading(0)).toBe("0.0\u00B0 (N)");
  });

  it("formats south heading", () => {
    expect(formatHeading(180)).toBe("180.0\u00B0 (S)");
  });

  it("formats SSW heading", () => {
    const result = formatHeading(205.7);
    expect(result).toContain("205.7");
    expect(result).toContain("SSW");
  });

  it("returns N/A for 511 (unavailable)", () => {
    expect(formatHeading(511)).toBe("N/A");
  });
});

describe("formatCourse", () => {
  it("formats course same as heading", () => {
    expect(formatCourse(90)).toContain("E");
  });
});

describe("formatShipType", () => {
  it("returns Cargo for type 70", () => {
    expect(formatShipType(70)).toBe("Cargo");
  });

  it("returns Other for unknown type", () => {
    expect(formatShipType(0)).toBe("Other");
  });
});

describe("formatNavStatus", () => {
  it("returns label for known status", () => {
    expect(formatNavStatus(0)).toBe("Under way using engine");
  });

  it("returns Unknown for invalid status", () => {
    expect(formatNavStatus(99)).toBe("Unknown");
  });
});

describe("formatEta", () => {
  it("returns N/A for zero ETA", () => {
    expect(formatEta(0)).toBe("N/A");
  });

  it("formats a valid ETA timestamp", () => {
    const eta = new Date(2024, 3, 16, 12, 8).getTime();
    const result = formatEta(eta);
    expect(result).toContain("Apr");
    expect(result).toContain("16");
    expect(result).toContain("12:08");
  });
});

describe("formatDraught", () => {
  it("formats draught with one decimal", () => {
    expect(formatDraught(11.8)).toBe("11.8 m");
  });

  it("returns N/A for zero draught", () => {
    expect(formatDraught(0)).toBe("N/A");
  });
});

describe("formatDimensions", () => {
  it("formats length x beam from ABCD", () => {
    expect(formatDimensions(100, 100, 16, 16)).toBe("200m \u00D7 32m");
  });

  it("returns N/A when all dimensions are zero", () => {
    expect(formatDimensions(0, 0, 0, 0)).toBe("N/A");
  });
});

describe("formatMmsi", () => {
  it("converts MMSI to string", () => {
    expect(formatMmsi(245473000)).toBe("245473000");
  });
});
