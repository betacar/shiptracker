import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("createDataSource", () => {
  const originalEnv = { ...import.meta.env };

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    Object.assign(import.meta.env, originalEnv);
  });

  it("returns isGlobal=true when API key is set", async () => {
    import.meta.env.VITE_AISSTREAM_API_KEY = "test-key-123";

    const { createDataSource } = await import("../../src/api/data-source");
    const { isGlobal } = createDataSource(vi.fn(), vi.fn());
    expect(isGlobal).toBe(true);
  });

  it("returns isGlobal=false when API key is placeholder", async () => {
    import.meta.env.VITE_AISSTREAM_API_KEY = "your-api-key-here";

    const { createDataSource } = await import("../../src/api/data-source");
    const { isGlobal } = createDataSource(vi.fn(), vi.fn());
    expect(isGlobal).toBe(false);
  });

  it("returns isGlobal=false when API key is empty", async () => {
    import.meta.env.VITE_AISSTREAM_API_KEY = "";

    const { createDataSource } = await import("../../src/api/data-source");
    const { isGlobal } = createDataSource(vi.fn(), vi.fn());
    expect(isGlobal).toBe(false);
  });

  it("returns a source with start and stop methods", async () => {
    import.meta.env.VITE_AISSTREAM_API_KEY = "";

    const { createDataSource } = await import("../../src/api/data-source");
    const { source } = createDataSource(vi.fn(), vi.fn());
    expect(typeof source.start).toBe("function");
    expect(typeof source.stop).toBe("function");
  });
});
