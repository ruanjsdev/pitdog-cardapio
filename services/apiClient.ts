import { ApiEnvelope, ApiRequestError } from "../types/api";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";

export const hasApiUrl = Boolean(API_URL);

// Controle de fila para evitar erro 429 (Too Many Requests)
let requestQueue: Promise<any> = Promise.resolve();
// Cache temporário para evitar pedidos idênticos no mesmo segundo
const inFlightRequests = new Map<string, Promise<any>>();

const unwrapResponse = async <T>(response: Response, url: string): Promise<T> => {
  const text = await response.text();
  let payload = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    console.warn("A API respondeu algo que nao e JSON.", {
      url,
      status: response.status,
      contentType: response.headers.get("content-type"),
      preview: text.slice(0, 160)
    });

    throw new ApiRequestError(response.status, {
      message: `Resposta invalida da API em ${url}`
    });
  }

  if (!response.ok) {
    const fallbackMessages: Record<number, string> = {
      401: "Sessao expirada ou acesso nao autorizado.",
      403: "Voce nao tem permissao para realizar esta acao.",
      404: "Recurso nao encontrado.",
      409: "Nao foi possivel concluir porque existem dados relacionados.",
      429: "Muitas requisicoes em pouco tempo. Aguarde alguns segundos e tente novamente.",
      500: "Erro interno no servidor. Tente novamente ou contate o suporte."
    };

    if (response.status >= 400) {
      console.error("Erro retornado pela API.", { url, status: response.status, payload });
    }

    throw new ApiRequestError(response.status, {
      message:
        payload?.message ??
        payload?.error ??
        fallbackMessages[response.status] ??
        `Nao foi possivel concluir a solicitacao. Erro ${response.status}.`,
      code: payload?.code,
      errors: payload?.errors
    });
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiEnvelope<T>).data;
  }

  return payload as T;
};

export const apiRequest = async <T>(
  path: string,
  options: RequestInit = {}
): Promise<T> => {
  if (!API_URL) {
    throw new Error("VITE_API_URL nao configurada.");
  }

  const headers = new Headers(options.headers);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const url = `${API_URL}${path}`;
  
  // Se já existe uma requisição idêntica acontecendo agora, aproveita a mesma promessa
  if (inFlightRequests.has(url) && (!options.method || options.method === 'GET')) {
    return inFlightRequests.get(url);
  }

  const executeRequest = async (retries = 2): Promise<T> => {
    // Aguarda a requisição anterior terminar + um pequeno temporizador
    await requestQueue;
    if (options.method && options.method !== 'GET') {
      await new Promise(resolve => setTimeout(resolve, 500)); 
    }

    try {
      const response = await fetch(url, {
        ...options,
        cache: options.cache ?? "no-store",
        headers
      });

      if (response.status === 429 && retries > 0) {
        console.warn(`[API] Erro 429 em ${url}. Aguardando 3s para nova tentativa...`);
        await new Promise(resolve => setTimeout(resolve, 3000)); 
        return executeRequest(retries - 1);
      }

      return await unwrapResponse<T>(response, url);
    } finally {
      // Remove do mapa de "em curso" após terminar
      setTimeout(() => inFlightRequests.delete(url), 1000);
    }
  };

  // Enfileira a nova requisição
  const currentRequest = executeRequest();
  
  // Atualiza a fila global para que a próxima requisição espere por esta
  requestQueue = currentRequest.then(() => {}).catch(() => {});
  inFlightRequests.set(url, currentRequest);

  return currentRequest;
};
