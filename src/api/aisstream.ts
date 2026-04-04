import { AISSTREAM_WS_URL } from "../config";
import type { VesselLocation, VesselMetadata, DataSource } from "../types";

export interface AisStreamMessage {
  readonly MessageType: string;
  readonly Message: {
    readonly PositionReport?: {
      readonly UserID: number;
      readonly NavigationalStatus: number;
      readonly Sog: number;
      readonly Longitude: number;
      readonly Latitude: number;
      readonly Cog: number;
      readonly TrueHeading: number;
      readonly Timestamp: number;
    };
    readonly ShipStaticData?: {
      readonly UserID: number;
      readonly ImoNumber: number;
      readonly CallSign: string;
      readonly Name: string;
      readonly Type: number;
      readonly Dimension: {
        readonly A: number;
        readonly B: number;
        readonly C: number;
        readonly D: number;
      };
      readonly MaximumStaticDraught: number;
      readonly Destination: string;
      readonly Eta: {
        readonly Month: number;
        readonly Day: number;
        readonly Hour: number;
        readonly Minute: number;
      };
    };
  };
  readonly MetaData: {
    readonly MMSI: number;
    readonly ShipName: string;
    readonly latitude?: number;
    readonly longitude?: number;
    readonly time_utc?: string;
  };
}

export function parsePositionReport(
  msg: AisStreamMessage,
): VesselLocation | null {
  const report = msg.Message.PositionReport;
  if (!report) return null;

  return {
    mmsi: msg.MetaData.MMSI,
    lat: report.Latitude,
    lng: report.Longitude,
    sog: report.Sog,
    cog: report.Cog,
    heading: report.TrueHeading,
    navStatus: report.NavigationalStatus,
    timestamp: Date.now(),
  };
}

export function parseShipStaticData(
  msg: AisStreamMessage,
): VesselMetadata | null {
  const data = msg.Message.ShipStaticData;
  if (!data) return null;

  const eta = data.Eta;
  const etaTimestamp = encodeEta(eta.Month, eta.Day, eta.Hour, eta.Minute);

  return {
    mmsi: msg.MetaData.MMSI,
    name: data.Name.trim(),
    imo: data.ImoNumber,
    callSign: data.CallSign.trim(),
    shipType: data.Type,
    destination: data.Destination.trim(),
    draught: data.MaximumStaticDraught,
    eta: etaTimestamp,
    dimensionA: data.Dimension.A,
    dimensionB: data.Dimension.B,
    dimensionC: data.Dimension.C,
    dimensionD: data.Dimension.D,
  };
}

function encodeEta(
  month: number,
  day: number,
  hour: number,
  minute: number,
): number {
  if (month === 0 && day === 0 && hour === 0 && minute === 0) return 0;
  const now = new Date();
  const year =
    month < now.getMonth() + 1 ? now.getFullYear() + 1 : now.getFullYear();
  return new Date(year, month - 1, day, hour, minute).getTime();
}

export const CONNECT_TIMEOUT_MS = 10_000;

export function createAisStream(
  apiKey: string,
  onPosition: (loc: VesselLocation) => void,
  onMetadata: (meta: VesselMetadata) => void,
  onConnectionFailed?: () => void,
): DataSource {
  let ws: WebSocket | null = null;
  let connectTimer: ReturnType<typeof setTimeout> | null = null;
  let connected = false;
  let stopped = false;

  function clearConnectTimer(): void {
    if (connectTimer !== null) {
      clearTimeout(connectTimer);
      connectTimer = null;
    }
  }

  function start(): void {
    stopped = false;
    ws = new WebSocket(AISSTREAM_WS_URL);

    connectTimer = setTimeout(() => {
      if (!connected && !stopped) {
        stop();
        onConnectionFailed?.();
      }
    }, CONNECT_TIMEOUT_MS);

    ws.onopen = () => {
      connected = true;
      clearConnectTimer();
      ws?.send(
        JSON.stringify({
          APIKey: apiKey,
          BoundingBoxes: [
            [
              [-90, -180],
              [90, 180],
            ],
          ],
          FilterMessageTypes: ["PositionReport", "ShipStaticData"],
        }),
      );
    };

    ws.onmessage = (event: MessageEvent) => {
      const msg: AisStreamMessage = JSON.parse(String(event.data));

      if (msg.MessageType === "PositionReport") {
        const location = parsePositionReport(msg);
        if (location) onPosition(location);
      } else if (msg.MessageType === "ShipStaticData") {
        const metadata = parseShipStaticData(msg);
        if (metadata) onMetadata(metadata);
      }
    };

    ws.onclose = () => {
      if (!stopped) {
        setTimeout(start, 5000);
      }
    };
  }

  function stop(): void {
    stopped = true;
    clearConnectTimer();
    if (ws) {
      ws.onclose = null;
      ws.close();
      ws = null;
    }
  }

  return { start, stop };
}
