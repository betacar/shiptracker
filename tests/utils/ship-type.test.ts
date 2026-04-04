import { describe, it, expect } from "vitest";
import { getShipTypeInfo } from "../../src/utils/ship-type";

describe("getShipTypeInfo", () => {
  it("returns Cargo for code 70", () => {
    const info = getShipTypeInfo(70);
    expect(info.label).toBe("Cargo");
    expect(info.color).toBe("#2ecc71");
  });

  it("returns Tanker for code 80", () => {
    const info = getShipTypeInfo(80);
    expect(info.label).toBe("Tanker");
    expect(info.color).toBe("#e74c3c");
  });

  it("returns Passenger for code 60", () => {
    const info = getShipTypeInfo(60);
    expect(info.label).toBe("Passenger");
    expect(info.color).toBe("#3498db");
  });

  it("returns Fishing for code 30", () => {
    const info = getShipTypeInfo(30);
    expect(info.label).toBe("Fishing");
    expect(info.color).toBe("#f39c12");
  });

  it("returns Tug for code 52", () => {
    expect(getShipTypeInfo(52).label).toBe("Tug");
  });

  it("returns Other for unknown code", () => {
    const info = getShipTypeInfo(999);
    expect(info.label).toBe("Other");
    expect(info.color).toBe("#95a5a6");
  });

  it("returns Other for code 0", () => {
    expect(getShipTypeInfo(0).label).toBe("Other");
  });

  it("returns Cargo (Hazmat A) for code 71", () => {
    expect(getShipTypeInfo(71).label).toBe("Cargo (Hazmat A)");
  });
});
