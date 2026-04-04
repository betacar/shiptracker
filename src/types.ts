export interface VesselLocation {
  readonly mmsi: number;
  readonly lat: number;
  readonly lng: number;
  readonly sog: number;
  readonly cog: number;
  readonly heading: number;
  readonly navStatus: number;
  readonly timestamp: number;
}

export interface VesselMetadata {
  readonly mmsi: number;
  readonly name: string;
  readonly imo: number;
  readonly callSign: string;
  readonly shipType: number;
  readonly destination: string;
  readonly draught: number;
  readonly eta: number;
  readonly dimensionA: number;
  readonly dimensionB: number;
  readonly dimensionC: number;
  readonly dimensionD: number;
}

export interface VesselData {
  readonly location: VesselLocation;
  readonly metadata: VesselMetadata | null;
}

export interface DataSourceCallbacks {
  readonly onPosition: (location: VesselLocation) => void;
  readonly onMetadata: (metadata: VesselMetadata) => void;
}

export interface DataSource {
  readonly start: () => void;
  readonly stop: () => void;
}
