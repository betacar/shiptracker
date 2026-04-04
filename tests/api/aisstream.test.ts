import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  parsePositionReport,
  parseShipStaticData,
  createAisStream,
  CONNECT_TIMEOUT_MS,
} from "../../src/api/aisstream";
import type { AisStreamMessage } from "../../src/api/aisstream";
import positionFixture from "../fixtures/aisstream-position.json";
import staticFixture from "../fixtures/aisstream-static.json";

describe("parsePositionReport", () => {
  it("parses a valid PositionReport into VesselLocation", () => {
    const result = parsePositionReport(positionFixture as AisStreamMessage);

    expect(result).not.toBeNull();
    expect(result!.mmsi).toBe(245473000);
    expect(result!.lat).toBe(51.444588);
    expect(result!.lng).toBe(3.590817);
    expect(result!.sog).toBe(12.3);
    expect(result!.cog).toBe(205.7);
    expect(result!.heading).toBe(205);
    expect(result!.navStatus).toBe(0);
    expect(result!.timestamp).toBeGreaterThan(0);
  });

  it("returns null when PositionReport is missing", () => {
    const msg: AisStreamMessage = {
      MessageType: "PositionReport",
      Message: {},
      MetaData: { MMSI: 123, ShipName: "TEST" },
    };
    expect(parsePositionReport(msg)).toBeNull();
  });
});

describe("parseShipStaticData", () => {
  it("parses a valid ShipStaticData into VesselMetadata", () => {
    const result = parseShipStaticData(staticFixture as AisStreamMessage);

    expect(result).not.toBeNull();
    expect(result!.mmsi).toBe(245473000);
    expect(result!.name).toBe("NORD SUPERIOR");
    expect(result!.imo).toBe(9692129);
    expect(result!.callSign).toBe("OWPA2");
    expect(result!.shipType).toBe(80);
    expect(result!.destination).toBe("NL AMS");
    expect(result!.draught).toBe(11.8);
    expect(result!.dimensionA).toBe(100);
    expect(result!.dimensionB).toBe(100);
    expect(result!.dimensionC).toBe(16);
    expect(result!.dimensionD).toBe(16);
  });

  it("returns null when ShipStaticData is missing", () => {
    const msg: AisStreamMessage = {
      MessageType: "ShipStaticData",
      Message: {},
      MetaData: { MMSI: 123, ShipName: "TEST" },
    };
    expect(parseShipStaticData(msg)).toBeNull();
  });

  it("trims whitespace from name, callSign, destination", () => {
    const msg: AisStreamMessage = {
      ...staticFixture,
      Message: {
        ShipStaticData: {
          ...staticFixture.Message.ShipStaticData,
          Name: "  PADDED NAME  ",
          CallSign: " ABC ",
          Destination: "  PORT  ",
        },
      },
    } as AisStreamMessage;

    const result = parseShipStaticData(msg);
    expect(result!.name).toBe("PADDED NAME");
    expect(result!.callSign).toBe("ABC");
    expect(result!.destination).toBe("PORT");
  });

  it("returns eta=0 when all ETA fields are zero", () => {
    const msg: AisStreamMessage = {
      ...staticFixture,
      Message: {
        ShipStaticData: {
          ...staticFixture.Message.ShipStaticData,
          Eta: { Month: 0, Day: 0, Hour: 0, Minute: 0 },
        },
      },
    } as AisStreamMessage;

    const result = parseShipStaticData(msg);
    expect(result!.eta).toBe(0);
  });
});

describe("createAisStream", () => {
  let mockWs: {
    onopen: (() => void) | null;
    onmessage: ((event: { data: string }) => void) | null;
    onclose: (() => void) | null;
    send: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockWs = {
      onopen: null,
      onmessage: null,
      onclose: null,
      send: vi.fn(),
      close: vi.fn(),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const MockWebSocket = (function (this: any) {
      Object.assign(this, mockWs);
      mockWs = this;
    } as unknown) as typeof WebSocket;
    vi.stubGlobal("WebSocket", MockWebSocket);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("opens WebSocket and sends subscription on connect", () => {
    const onPos = vi.fn();
    const onMeta = vi.fn();
    const source = createAisStream("test-key", onPos, onMeta);

    source.start();
    mockWs.onopen!();

    expect(mockWs.send).toHaveBeenCalledOnce();
    const sent = JSON.parse(mockWs.send.mock.calls[0][0] as string);
    expect(sent.APIKey).toBe("test-key");
    expect(sent.FilterMessageTypes).toContain("PositionReport");
    expect(sent.FilterMessageTypes).toContain("ShipStaticData");
  });

  it("calls onPosition for PositionReport messages", () => {
    const onPos = vi.fn();
    const onMeta = vi.fn();
    const source = createAisStream("key", onPos, onMeta);

    source.start();
    mockWs.onmessage!({ data: JSON.stringify(positionFixture) });

    expect(onPos).toHaveBeenCalledOnce();
    expect(onPos.mock.calls[0][0].mmsi).toBe(245473000);
  });

  it("calls onMetadata for ShipStaticData messages", () => {
    const onPos = vi.fn();
    const onMeta = vi.fn();
    const source = createAisStream("key", onPos, onMeta);

    source.start();
    mockWs.onmessage!({ data: JSON.stringify(staticFixture) });

    expect(onMeta).toHaveBeenCalledOnce();
    expect(onMeta.mock.calls[0][0].name).toBe("NORD SUPERIOR");
  });

  it("closes WebSocket on stop", () => {
    const source = createAisStream("key", vi.fn(), vi.fn());
    source.start();
    source.stop();
    expect(mockWs.close).toHaveBeenCalledOnce();
  });

  it("ignores unknown message types", () => {
    const onPos = vi.fn();
    const onMeta = vi.fn();
    const source = createAisStream("key", onPos, onMeta);

    source.start();
    mockWs.onmessage!({
      data: JSON.stringify({
        MessageType: "Unknown",
        Message: {},
        MetaData: { MMSI: 1, ShipName: "" },
      }),
    });

    expect(onPos).not.toHaveBeenCalled();
    expect(onMeta).not.toHaveBeenCalled();
  });

  it("calls onConnectionFailed after timeout if WebSocket never opens", () => {
    vi.useFakeTimers();
    const onFailed = vi.fn();
    const source = createAisStream("key", vi.fn(), vi.fn(), onFailed);

    source.start();
    expect(onFailed).not.toHaveBeenCalled();

    vi.advanceTimersByTime(CONNECT_TIMEOUT_MS);
    expect(onFailed).toHaveBeenCalledOnce();

    vi.useRealTimers();
  });

  it("does not call onConnectionFailed if WebSocket opens in time", () => {
    vi.useFakeTimers();
    const onFailed = vi.fn();
    const source = createAisStream("key", vi.fn(), vi.fn(), onFailed);

    source.start();
    mockWs.onopen!();

    vi.advanceTimersByTime(CONNECT_TIMEOUT_MS);
    expect(onFailed).not.toHaveBeenCalled();

    source.stop();
    vi.useRealTimers();
  });
});
