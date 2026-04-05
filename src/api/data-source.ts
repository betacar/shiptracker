import type {
  VesselLocation,
  VesselMetadata,
  DataSource,
  BoundingBox,
} from "../types";
import { createAisStream } from "./aisstream";
import { createDigitrafficSource } from "./digitraffic";

export interface DataSourceResult {
  readonly source: DataSource;
  readonly isGlobal: boolean;
}

export function createDataSource(
  onPosition: (loc: VesselLocation) => void,
  onMetadata: (meta: VesselMetadata) => void,
  onFallback?: () => void,
): DataSourceResult {
  const fallbackSource = createDigitrafficSource(onPosition, onMetadata);

  const aisSource = createAisStream(onPosition, onMetadata, () => {
    fallbackSource.start();
    onFallback?.();
  });

  return {
    source: {
      start: (bounds?: BoundingBox) => aisSource.start(bounds),
      stop: () => {
        aisSource.stop();
        fallbackSource.stop();
      },
      updateBounds: (bounds: BoundingBox) => aisSource.updateBounds?.(bounds),
    },
    isGlobal: true,
  };
}
