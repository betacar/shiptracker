import {
  DIGITRAFFIC_LOCATIONS_URL,
  DIGITRAFFIC_VESSELS_URL,
  POLL_INTERVAL_MS,
} from "../config";
import type { VesselLocation, VesselMetadata, DataSource } from "../types";

export interface DigitTrafficFeature {
  readonly mmsi: number;
  readonly geometry: {
    readonly type: string;
    readonly coordinates: readonly [number, number];
  };
  readonly properties: {
    readonly mmsi: number;
    readonly sog: number;
    readonly cog: number;
    readonly navStat: number;
    readonly heading: number;
    readonly timestampExternal: number;
  };
}

interface DigitTrafficLocationsResponse {
  readonly type: string;
  readonly features: readonly DigitTrafficFeature[];
}

interface DigitTrafficVessel {
  readonly mmsi: number;
  readonly name: string;
  readonly imo: number;
  readonly callSign: string;
  readonly shipType: number;
  readonly destination: string;
  readonly draught: number;
  readonly eta: number;
}

export function parseFeature(feature: DigitTrafficFeature): VesselLocation {
  const [lng, lat] = feature.geometry.coordinates;
  const props = feature.properties;
  return {
    mmsi: props.mmsi,
    lat,
    lng,
    sog: props.sog,
    cog: props.cog,
    heading: props.heading,
    navStatus: props.navStat,
    timestamp: props.timestampExternal,
  };
}

export function parseVessel(vessel: DigitTrafficVessel): VesselMetadata {
  return {
    mmsi: vessel.mmsi,
    name: vessel.name,
    imo: vessel.imo,
    callSign: vessel.callSign,
    shipType: vessel.shipType,
    destination: vessel.destination,
    draught: vessel.draught / 10,
    eta: vessel.eta,
    dimensionA: 0,
    dimensionB: 0,
    dimensionC: 0,
    dimensionD: 0,
  };
}

export async function fetchLocations(
  fetcher: typeof fetch = fetch
): Promise<readonly VesselLocation[]> {
  const response = await fetcher(DIGITRAFFIC_LOCATIONS_URL);
  const data: DigitTrafficLocationsResponse = await response.json();
  return data.features.map(parseFeature);
}

export async function fetchVessels(
  fetcher: typeof fetch = fetch
): Promise<readonly VesselMetadata[]> {
  const response = await fetcher(DIGITRAFFIC_VESSELS_URL);
  const data: readonly DigitTrafficVessel[] = await response.json();
  return data.map(parseVessel);
}

export function createDigitrafficSource(
  onPosition: (loc: VesselLocation) => void,
  onMetadata: (meta: VesselMetadata) => void
): DataSource {
  let intervalId: ReturnType<typeof setInterval> | null = null;

  async function poll(): Promise<void> {
    const locations = await fetchLocations();
    for (const loc of locations) {
      onPosition(loc);
    }
  }

  async function loadMetadata(): Promise<void> {
    const vessels = await fetchVessels();
    for (const v of vessels) {
      onMetadata(v);
    }
  }

  function start(): void {
    poll();
    loadMetadata();
    intervalId = setInterval(poll, POLL_INTERVAL_MS);
  }

  function stop(): void {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  return { start, stop };
}
