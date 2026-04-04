# ShipTracker

Real-time ship tracking on a dark-themed map. Displays AIS vessel positions worldwide with rotated heading indicators and detailed vessel information on click.

Inspired by the now-defunct [shipradar24.xyz](https://www.shipradar24.xyz/).

## Features

- Full-screen dark map (CARTO dark basemap)
- Ship markers rotated to heading, colored by type (cargo, tanker, passenger, etc.)
- Real-time position updates via AISStream.io WebSocket
- Click any ship for details: name, MMSI, IMO, type, speed, course, destination, dimensions
- Automatic fallback to Digitraffic.fi (Baltic region) if AISStream is unavailable

## Quick Start

```bash
npm install
cp .env.example .env
# Add your AISStream API key to .env (free at https://aisstream.io)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Data Sources

| Source | Coverage | Auth | Protocol |
|--------|----------|------|----------|
| [AISStream.io](https://aisstream.io) | Global | Free API key | WebSocket (proxied via Vite/nginx to force HTTP/1.1) |
| [Digitraffic.fi](https://www.digitraffic.fi/en/marine/) | Baltic Sea | None | REST (30s polling) |

AISStream's server negotiates HTTP/2 via ALPN, but doesn't support WebSocket-over-HTTP/2 (RFC 8441). Browsers hang at `readyState=0`. The app proxies through Vite (dev) or nginx (prod) to force HTTP/1.1 upstream.

## Docker

```bash
docker build --build-arg VITE_AISSTREAM_API_KEY=<your-key> -t shiptracker .
docker run -p 8080:80 shiptracker
```

## Testing

```bash
npm test          # Run all tests
npm run coverage  # Run with coverage (80% threshold)
```

## Tech Stack

- Vite + vanilla TypeScript
- Leaflet + leaflet-rotatedmarker
- Vitest + jsdom (84 tests, 99% statement coverage)
- nginx:alpine (production)

## License

Data: [Digitraffic](https://www.digitraffic.fi/) (CC 4.0 BY), [AISStream](https://aisstream.io). Map tiles: [CARTO](https://carto.com/) + [OpenStreetMap](https://www.openstreetmap.org/copyright).
