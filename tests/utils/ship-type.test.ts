import { describe, it, expect } from "vitest";
import { getShipTypeInfo } from "../../src/utils/ship-type";

describe("getShipTypeInfo", () => {
  it("returns Cargo with cargo shape for code 70", () => {
    const info = getShipTypeInfo(70);
    expect(info.label).toBe("Cargo");
    expect(info.color).toBe("#2ecc71");
    expect(info.shape).toBe("cargo");
  });

  it("returns Tanker with tanker shape for code 80", () => {
    const info = getShipTypeInfo(80);
    expect(info.label).toBe("Tanker");
    expect(info.color).toBe("#e74c3c");
    expect(info.shape).toBe("tanker");
  });

  it("returns Passenger with passenger shape for code 60", () => {
    const info = getShipTypeInfo(60);
    expect(info.label).toBe("Passenger");
    expect(info.color).toBe("#3498db");
    expect(info.shape).toBe("passenger");
  });

  it("returns Fishing with fishing shape for code 30", () => {
    const info = getShipTypeInfo(30);
    expect(info.label).toBe("Fishing");
    expect(info.color).toBe("#f39c12");
    expect(info.shape).toBe("fishing");
  });

  it("returns Tug with tug shape for code 52", () => {
    const info = getShipTypeInfo(52);
    expect(info.label).toBe("Tug");
    expect(info.shape).toBe("tug");
  });

  it("returns Other with default shape for unknown code", () => {
    const info = getShipTypeInfo(999);
    expect(info.label).toBe("Other");
    expect(info.color).toBe("#95a5a6");
    expect(info.shape).toBe("default");
  });

  it("returns Other for code 0", () => {
    expect(getShipTypeInfo(0).label).toBe("Other");
  });

  it("returns Cargo (Hazmat A) for code 71", () => {
    expect(getShipTypeInfo(71).label).toBe("Cargo (Hazmat A)");
    expect(getShipTypeInfo(71).shape).toBe("cargo");
  });

  it("returns sailing shape for code 36", () => {
    expect(getShipTypeInfo(36).shape).toBe("sailing");
  });

  it("returns hsc shape for code 40", () => {
    expect(getShipTypeInfo(40).shape).toBe("hsc");
  });

  it("returns military shape for code 35", () => {
    expect(getShipTypeInfo(35).shape).toBe("military");
  });
});
