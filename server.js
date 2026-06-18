import { createReadStream, existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:http";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const dataDir = process.env.DATA_DIR ?? join(rootDir, "data");
const showcaseFilePath = join(dataDir, "showcase.json");
const distDir = join(rootDir, "dist");
const backendUrl = (process.env.BACKEND_API_URL ?? "https://pitsdog-api-production.up.railway.app").replace(/\/$/, "");
const whatsappBotUrl = (process.env.WHATSAPP_BOT_URL ?? process.env.VITE_WHATSAPP_BOT_URL ?? "https://pits-dog-bot.onrender.com").replace(/\/$/, "");
const whatsappBotPin = process.env.WHATSAPP_ADMIN_PIN ?? process.env.VITE_WHATSAPP_ADMIN_PIN ?? "";
const port = Number(process.env.PORT ?? 3000);
const menuCacheTtlMs = 60 * 1000;
const showcaseLimit = 3;
let menuCache = {
  expiresAt: 0,
  productsById: new Map(),
  combosById: new Map(),
  additionalsById: new Map(),
};

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

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
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

async function readRequestBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

function normalizeShowcaseProductIds(value) {
  const productIds = Array.isArray(value?.productIds) ? value.productIds : [];
  const uniqueIds = [];

  productIds.forEach((productId) => {
    const normalizedId = String(productId ?? "").trim();

    if (normalizedId && !uniqueIds.includes(normalizedId)) {
      uniqueIds.push(normalizedId);
    }
  });

  return uniqueIds.slice(0, showcaseLimit);
}

async function readShowcase() {
  try {
    return {
      productIds: normalizeShowcaseProductIds(JSON.parse(await readFile(showcaseFilePath, "utf8"))),
    };
  } catch {
    return { productIds: [] };
  }
}

async function saveShowcase(payload) {
  const showcase = { productIds: normalizeShowcaseProductIds(payload) };

  await mkdir(dataDir, { recursive: true });
  await writeFile(showcaseFilePath, `${JSON.stringify(showcase, null, 2)}\n`, "utf8");

  return showcase;
}

async function handleShowcase(request, response) {
  if (request.method === "GET" || request.method === "HEAD") {
    sendJson(response, 200, await readShowcase());
    return;
  }

  if (request.method !== "POST" && request.method !== "PUT") {
    sendJson(response, 405, { message: "Metodo nao permitido." });
    return;
  }

  try {
    const body = await readRequestBody(request);
    const payload = JSON.parse(body.toString("utf8") || "{}");

    sendJson(response, 200, await saveShowcase(payload));
  } catch {
    sendJson(response, 400, { message: "Vitrine invalida." });
  }
}

function asArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.content)) return payload.content;

  return [];
}

function getAdditionalName(additional) {
  return additional?.nomeAdicional ?? additional?.nomedAicional ?? additional?.nome ?? "Adicional";
}

async function fetchBackendJson(path) {
  const response = await fetch(`${backendUrl}${path}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Falha ao carregar ${path}: ${response.status}`);
  }

  return response.json();
}

async function getMenuMaps() {
  if (Date.now() < menuCache.expiresAt) return menuCache;

  const [productsResult, combosResult, additionalsResult] = await Promise.allSettled([
    fetchBackendJson("/produtos"),
    fetchBackendJson("/combos"),
    fetchBackendJson("/adicionais"),
  ]);
  const products = productsResult.status === "fulfilled" ? asArray(productsResult.value) : [];
  const combos = combosResult.status === "fulfilled" ? asArray(combosResult.value) : [];
  const additionals = additionalsResult.status === "fulfilled" ? asArray(additionalsResult.value) : [];

  menuCache = {
    expiresAt: Date.now() + menuCacheTtlMs,
    productsById: new Map(products.map((product) => [String(product.id), product])),
    combosById: new Map(combos.map((combo) => [String(combo.id), combo])),
    additionalsById: new Map(additionals.map((additional) => [String(additional.id), additional])),
  };

  return menuCache;
}

async function buildNotificationItems(orderPayload) {
  const items = Array.isArray(orderPayload.itens) ? orderPayload.itens : [];

  if (items.length === 0) return [];

  try {
    const { additionalsById, combosById, productsById } = await getMenuMaps();

    return items.map((item) => {
      const product = item.produtoId ? productsById.get(String(item.produtoId)) : null;
      const combo = item.comboId ? combosById.get(String(item.comboId)) : null;
      const source = product ?? combo;
      const additions = Array.isArray(item.adicionais)
        ? item.adicionais.map((addition) => {
            const additional = additionalsById.get(String(addition.adicionalId));

            return {
              name: getAdditionalName(additional),
              price: additional?.preco,
              quantity: Math.max(1, Number(addition.quantidade ?? 1)),
            };
          })
        : [];

      return {
        additions,
        name: source?.nome ?? item.nome ?? item.name ?? "Item",
        observation: item.observacao ?? item.observation ?? "",
        price: source?.preco ?? item.preco ?? item.price,
        quantity: Math.max(1, Number(item.quantidade ?? item.quantity ?? 1)),
      };
    });
  } catch (error) {
    console.warn("[bot] Nao foi possivel enriquecer itens da notificacao.", error);
    return items;
  }
}

async function notifyWhatsappBot(orderPayload, createdOrder) {
  if (!whatsappBotUrl) return;

  const customerPhone = String(orderPayload.telefoneCliente || "").replace(/\D/g, "");

  if (!customerPhone || orderPayload.tipoPedido === "MESA") return;

  const total = createdOrder?.total ?? orderPayload.total;
  const items = await buildNotificationItems(orderPayload);

  try {
    const response = await fetch(`${whatsappBotUrl}/api/notify-order`, {
      body: JSON.stringify({
        event: "pedido_criado",
        order: {
          code: createdOrder?.numeroPedido ?? createdOrder?.id,
          customerName: orderPayload.nomeCliente,
          customerPhone,
          delivery: orderPayload.tipoPedido,
          items,
          payment: orderPayload.formaPagamento,
          paymentMethod: orderPayload.formaPagamento,
          total,
        },
      }),
      headers: {
        "Content-Type": "application/json",
        ...(whatsappBotPin ? { "x-admin-pin": whatsappBotPin } : {}),
      },
      method: "POST",
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.ok) {
      console.warn("[bot] Notificacao de pedido criada recusada.", payload);
    }
  } catch (error) {
    console.warn("[bot] Falha ao notificar pedido criado.", error);
  }
}

async function proxyApi(request, response) {
  const targetPath = request.url.replace(/^\/api/, "") || "/";
  const targetUrl = `${backendUrl}${targetPath}`;
  const headers = new Headers(request.headers);
  const shouldNotifyCreatedOrder = request.method === "POST" && targetPath.split("?")[0] === "/pedidos";
  const requestBody = request.method === "GET" || request.method === "HEAD" ? undefined : await readRequestBody(request);
  let parsedOrderPayload = null;

  headers.delete("host");
  headers.delete("origin");
  headers.delete("referer");

  if (shouldNotifyCreatedOrder && requestBody?.length) {
    try {
      parsedOrderPayload = JSON.parse(requestBody.toString("utf8"));
    } catch {
      parsedOrderPayload = null;
    }
  }

  try {
    const backendResponse = await fetch(targetUrl, {
      body: requestBody,
      headers,
      method: request.method,
    });

    const responseHeaders = new Headers(backendResponse.headers);
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    const responseBody = Buffer.from(await backendResponse.arrayBuffer());

    response.writeHead(backendResponse.status, Object.fromEntries(responseHeaders.entries()));
    response.end(responseBody);

    if (shouldNotifyCreatedOrder && backendResponse.ok && parsedOrderPayload) {
      let createdOrder = null;

      try {
        createdOrder = JSON.parse(responseBody.toString("utf8") || "null");
        createdOrder = createdOrder?.data ?? createdOrder;
      } catch {
        createdOrder = null;
      }

      void notifyWhatsappBot(parsedOrderPayload, createdOrder);
    }
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

  if (request.url.split("?")[0] === "/api/showcase") {
    void handleShowcase(request, response);
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
