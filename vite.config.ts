import { defineConfig } from "vitest/config";
import type { ViteDevServer } from "vite";
import { WebSocketServer, WebSocket as NodeWS } from "ws";

function aisProxyPlugin() {
  return {
    name: "ais-ws-proxy",
    configureServer(server: ViteDevServer) {
      const wss = new WebSocketServer({ noServer: true });

      server.httpServer?.on("upgrade", (req, socket, head) => {
        if (req.url !== "/ais-ws") return;

        wss.handleUpgrade(req, socket, head, (client) => {
          const buffered: string[] = [];
          let upstreamReady = false;

          const upstream = new NodeWS(
            "wss://stream.aisstream.io/v0/stream",
          );

          // Buffer client messages until upstream is ready
          client.on("message", (data) => {
            const msg = data.toString();
            if (upstreamReady && upstream.readyState === NodeWS.OPEN) {
              upstream.send(msg);
            } else {
              buffered.push(msg);
            }
          });

          upstream.on("open", () => {
            upstreamReady = true;
            // Flush buffered messages (includes subscription)
            for (const msg of buffered) {
              upstream.send(msg);
            }
            buffered.length = 0;
          });

          upstream.on("message", (data) => {
            if (client.readyState === NodeWS.OPEN)
              client.send(data.toString());
          });

          client.on("close", () => upstream.close());
          upstream.on("close", () => client.close());
          upstream.on("error", () => client.close());
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [aisProxyPlugin()],
  test: {
    environment: "jsdom",
    coverage: {
      provider: "istanbul",
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
      include: ["src/**/*.ts"],
      exclude: ["src/main.ts", "src/map/map-init.ts"],
    },
  },
});
