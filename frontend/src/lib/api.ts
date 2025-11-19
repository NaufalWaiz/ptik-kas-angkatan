export const DEFAULT_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

export interface ApiRequestOptions extends RequestInit {
  requireAuth?: boolean;
  token?: string;
}

export async function apiRequest<T>(
  baseUrl: string,
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  if (!baseUrl) {
    throw new Error("API base URL is not defined");
  }

  const normalizedBase = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;
  const url = `${normalizedBase}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers(options.headers ?? {});
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (options.requireAuth) {
    if (!options.token) {
      throw new Error("Authentication is required for this request");
    }
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      payload?.message || payload?.error || response.statusText || "Request failed";
    throw new Error(message);
  }

  return payload as T;
}
