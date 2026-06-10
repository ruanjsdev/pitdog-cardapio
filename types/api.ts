export interface ApiEnvelope<T> {
  data: T;
}

export interface ApiErrorPayload {
  message: string;
  code?: string;
  errors?: Record<string, string>;
}

export class ApiRequestError extends Error {
  status: number;
  code?: string;
  errors?: Record<string, string>;

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = payload.code;
    this.errors = payload.errors;
  }
}
