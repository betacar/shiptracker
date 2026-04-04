# ShipTracker — Agent Instructions

## Project Overview

Real-time ship tracker. Vanilla TypeScript + Vite + Leaflet. No framework. Static site with WebSocket proxy for AIS data.

## Commands

```bash
npm run dev       # Vite dev server (port 5173, includes WS proxy)
npm run build     # tsc + vite build → dist/
npm test          # vitest run (84 tests)
npm run coverage  # vitest with istanbul (80% threshold)
```

## Architecture

- `src/api/` — Data sources: AISStream (WebSocket, global) and Digitraffic (REST, Baltic fallback)
- `src/map/` — Leaflet map, marker creation/update/removal with heading rotation
- `src/ui/` — Ship detail panel (DOM-based, no innerHTML) and formatters
- `src/utils/` — AIS code lookups (ship type, nav status)
- `src/main.ts` — Bootstrap wiring (excluded from coverage)

## Key Design Decision: WebSocket Proxy

AISStream negotiates HTTP/2 via ALPN but doesn't support WebSocket-over-HTTP/2. Browsers hang. The app proxies `/ais-ws` through:
- **Dev**: Vite plugin (`vite.config.ts`) using Node.js `ws` library (forces HTTP/1.1)
- **Prod**: nginx `proxy_http_version 1.1` (`nginx.conf`)

## Testing

- Vitest with jsdom environment
- Injectable `fetch` for API tests (no mocking library)
- Mock WebSocket constructor for AISStream tests
- Coverage excludes `main.ts` and `map-init.ts` (thin wiring/Leaflet factory)

## Conventions

- Immutable data: all interfaces use `readonly` fields
- No innerHTML: DOM construction via `document.createElement` + `textContent`
- Feature-based file organization, 200-400 lines per file
- Tests mirror source tree under `tests/`
