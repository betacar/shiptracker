import { describe, it, expect, vi } from "vitest";
import { createDataSource } from "../../src/api/data-source";

describe("createDataSource", () => {
  it("returns isGlobal=true (always uses AISStream via proxy)", () => {
    const { isGlobal } = createDataSource(vi.fn(), vi.fn());
    expect(isGlobal).toBe(true);
  });

  it("returns a source with start, stop, and updateBounds", () => {
    const { source } = createDataSource(vi.fn(), vi.fn());
    expect(typeof source.start).toBe("function");
    expect(typeof source.stop).toBe("function");
    expect(typeof source.updateBounds).toBe("function");
  });
});
