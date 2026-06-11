import { createReadStream, existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:http";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const distDir = join(rootDir, "dist");
const backendUrl = (process.env.BACKEND_API_URL ?? "https://pitsdog-api-production.up.railway.app").replace(/\/$/, "");
const port = Number(process.env.PORT ?? 3000);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(message);
}

function serveFile(response, filePath) {
  if (!existsSync(filePath)) {
    sendText(response, 404, "Not Found\n");
    return;
  }

  response.writeHead(200, {
    "Cache-Control": filePath.includes("/assets/") ? "public, max-age=31536000, immutable" : "no-cache",
    "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream",
  });
  createReadStream(filePath).pipe(response);
}

async function proxyApi(request, response) {
  const targetPath = request.url.replace(/^\/api/, "") || "/";
  const targetUrl = `${backendUrl}${targetPath}`;
  const headers = new Headers(request.headers);

  headers.delete("host");
  headers.delete("origin");
  headers.delete("referer");

  try {
    const backendResponse = await fetch(targetUrl, {
      body: request.method === "GET" || request.method === "HEAD" ? undefined : request,
      duplex: "half",
      headers,
      method: request.method,
    });

    const responseHeaders = new Headers(backendResponse.headers);
    responseHeaders.set("Access-Control-Allow-Origin", "*");

    response.writeHead(backendResponse.status, Object.fromEntries(responseHeaders.entries()));

    if (!backendResponse.body) {
      response.end();
      return;
    }

    const reader = backendResponse.body.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      response.write(value);
    }

    response.end();
  } catch (error) {
    console.error("[proxy] API request failed", error);
    sendText(response, 502, "Nao foi possivel conectar na API.\n");
  }
}

createServer((request, response) => {
  if (!request.url) {
    sendText(response, 400, "Bad Request\n");
    return;
  }

  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-admin-pin",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Origin": "*",
    });
    response.end();
    return;
  }

  if (request.url.startsWith("/api/") || request.url === "/api") {
    void proxyApi(request, response);
    return;
  }

  const rawPath = decodeURIComponent(request.url.split("?")[0]);
  const safePath = normalize(rawPath).replace(/^(\.\.[/\\])+/, "");
  const requestedFile = join(distDir, safePath === "/" ? "index.html" : safePath);

  if (existsSync(requestedFile)) {
    serveFile(response, requestedFile);
    return;
  }

  serveFile(response, join(distDir, "index.html"));
}).listen(port, () => {
  console.log(`Pits Dog cardapio rodando na porta ${port}`);
});
