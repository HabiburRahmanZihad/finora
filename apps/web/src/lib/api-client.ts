import { authClient } from "./auth-client";
import type { ApiErrorBody } from "@finora/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

let cachedToken: { token: string; expiresAt: number } | null = null;

/** Fetches (and caches) a short-lived JWT for the current Better Auth session. */
async function getToken(forceRefresh = false): Promise<string | null> {
  if (!forceRefresh && cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const { data } = await authClient.token();
  if (!data?.token) {
    cachedToken = null;
    return null;
  }

  // Better Auth's JWT plugin defaults to a 15 minute expiry; refresh a
  // minute early so in-flight requests don't race the real expiry.
  cachedToken = { token: data.token, expiresAt: Date.now() + 14 * 60 * 1000 };
  return cachedToken.token;
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; retry?: boolean } = {},
): Promise<T> {
  const { method = "GET", body, retry = true } = options;
  const token = await getToken();

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && retry) {
    cachedToken = null;
    return request<T>(path, { ...options, retry: false });
  }

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as ApiErrorBody | null;
    const message = Array.isArray(errorBody?.message)
      ? errorBody.message.join(", ")
      : (errorBody?.message ?? response.statusText);
    throw new ApiError(response.status, message, errorBody);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
