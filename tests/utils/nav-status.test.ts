import { describe, it, expect } from "vitest";
import { getNavStatusLabel } from "../../src/utils/nav-status";

describe("getNavStatusLabel", () => {
  it("returns 'Under way using engine' for code 0", () => {
    expect(getNavStatusLabel(0)).toBe("Under way using engine");
  });

  it("returns 'At anchor' for code 1", () => {
    expect(getNavStatusLabel(1)).toBe("At anchor");
  });

  it("returns 'Moored' for code 5", () => {
    expect(getNavStatusLabel(5)).toBe("Moored");
  });

  it("returns 'Engaged in fishing' for code 7", () => {
    expect(getNavStatusLabel(7)).toBe("Engaged in fishing");
  });

  it("returns 'Under way sailing' for code 8", () => {
    expect(getNavStatusLabel(8)).toBe("Under way sailing");
  });

  it("returns 'Unknown' for out-of-range code", () => {
    expect(getNavStatusLabel(99)).toBe("Unknown");
  });

  it("returns 'Unknown' for negative code", () => {
    expect(getNavStatusLabel(-1)).toBe("Unknown");
  });
});
