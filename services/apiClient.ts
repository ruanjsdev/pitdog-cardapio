import { ApiEnvelope, ApiRequestError } from "../types/api";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";

export const hasApiUrl = Boolean(API_URL);

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
    throw new ApiRequestError(response.status, {
      message:
        payload?.message ??
        payload?.error ??
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

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const url = `${API_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers
  });

  return unwrapResponse<T>(response, url);
};
