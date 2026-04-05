export interface Env {
  ASSETS: Fetcher;
  AISSTREAM_API_KEY: string;
}

const UPSTREAM_URL = "https://stream.aisstream.io/v0/stream";

function injectApiKey(data: string | ArrayBuffer, apiKey: string): string {
  const text = typeof data === "string" ? data : new TextDecoder().decode(data);
  try {
    const msg = JSON.parse(text);
    if (msg.BoundingBoxes && !msg.APIKey) {
      return JSON.stringify({ ...msg, APIKey: apiKey });
    }
  } catch {
    // Not JSON, pass through
  }
  return text;
}

async function handleWebSocketProxy(
  request: Request,
  apiKey: string,
): Promise<Response> {
  const upgradeHeader = request.headers.get("Upgrade");
  if (!upgradeHeader || upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected Upgrade: websocket", { status: 426 });
  }

  const upstreamResponse = await fetch(UPSTREAM_URL, {
    headers: { Upgrade: "websocket" },
  });

  if (upstreamResponse.status !== 101) {
    return new Response("Upstream WebSocket handshake failed", {
      status: upstreamResponse.status,
    });
  }

  const upstream = upstreamResponse.webSocket;
  if (!upstream) {
    return new Response("Upstream did not return a WebSocket", { status: 502 });
  }
  upstream.accept();

  const pair = new WebSocketPair();
  const [clientSocket, serverSocket] = Object.values(pair);
  serverSocket.accept();

  serverSocket.addEventListener("message", (event) => {
    try {
      const enriched = injectApiKey(event.data, apiKey);
      upstream.send(enriched);
    } catch {
      serverSocket.close(1011, "Upstream send failed");
    }
  });

  upstream.addEventListener("message", (event) => {
    try {
      serverSocket.send(event.data);
    } catch {
      upstream.close(1011, "Client send failed");
    }
  });

  serverSocket.addEventListener("close", (event) => {
    upstream.close(event.code, event.reason);
  });
  upstream.addEventListener("close", (event) => {
    serverSocket.close(event.code, event.reason);
  });
  serverSocket.addEventListener("error", () =>
    upstream.close(1011, "Client error"),
  );
  upstream.addEventListener("error", () =>
    serverSocket.close(1011, "Upstream error"),
  );

  return new Response(null, { status: 101, webSocket: clientSocket });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/ais-ws") {
      return handleWebSocketProxy(request, env.AISSTREAM_API_KEY);
    }

    return env.ASSETS.fetch(request);
  },
};
