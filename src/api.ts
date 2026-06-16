export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface ApiErrorPayload {
  error?: string;
  message?: string;
  code?: string;
  details?: unknown;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return (await response.json()) as T;
  }

  let payload: ApiErrorPayload | null = null;

  try {
    payload = (await response.json()) as ApiErrorPayload;
  } catch {
    payload = null;
  }

  throw new ApiError(
    payload?.error ?? payload?.message ?? `A requisição falhou com status ${response.status}.`,
    response.status,
    payload?.code,
    payload?.details
  );
}

export async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  return parseResponse<T>(response);
}

export function getErrorMessage(error: unknown, fallback = 'Erro inesperado.') {
  if (error instanceof ApiError || error instanceof Error) {
    return error.message;
  }

  return fallback;
}