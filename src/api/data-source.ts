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
  const apiKey = import.meta.env.VITE_AISSTREAM_API_KEY as string | undefined;

  if (apiKey && apiKey !== "your-api-key-here") {
    const fallbackSource = createDigitrafficSource(onPosition, onMetadata);

    const aisSource = createAisStream(apiKey, onPosition, onMetadata, () => {
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

  return {
    source: createDigitrafficSource(onPosition, onMetadata),
    isGlobal: false,
  };
}
