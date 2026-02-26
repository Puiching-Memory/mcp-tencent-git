/**
 * Tencent Git (腾讯工蜂) REST API Client
 * Base URL: https://git.code.tencent.com/api/v3
 * Auth: PRIVATE-TOKEN header
 */

const BASE_URL = process.env.TENCENT_GIT_BASE_URL || "https://git.code.tencent.com";
const API_BASE = `${BASE_URL}/api/v3`;
const PRIVATE_TOKEN = process.env.TENCENT_GIT_TOKEN || "";

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  params?: Record<string, string | number | boolean | undefined>;
  body?: Record<string, unknown>;
}

export class TencentGitApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public responseBody: string
  ) {
    super(`Tencent Git API Error: ${status} ${statusText} - ${responseBody}`);
    this.name = "TencentGitApiError";
  }
}

export async function apiRequest<T = unknown>(options: ApiRequestOptions): Promise<T> {
  const { method = "GET", path, params, body } = options;

  if (!PRIVATE_TOKEN) {
    throw new Error(
      "TENCENT_GIT_TOKEN environment variable is not set. " +
      "Please set it to your Tencent Git private token. " +
      "You can find it at: https://git.code.tencent.com/profile/account"
    );
  }

  // Build URL with query parameters
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const headers: Record<string, string> = {
    "PRIVATE-TOKEN": PRIVATE_TOKEN,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (body && (method === "POST" || method === "PUT")) {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url.toString(), fetchOptions);

  if (!response.ok) {
    const responseBody = await response.text();
    throw new TencentGitApiError(response.status, response.statusText, responseBody);
  }

  // Some endpoints return empty body (e.g., DELETE)
  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

/**
 * Encode project ID for URL path.
 * If it's a number, use as-is. If it's a namespace/path, URL-encode it.
 */
export function encodeProjectId(id: string | number): string {
  if (typeof id === "number" || /^\d+$/.test(String(id))) {
    return String(id);
  }
  return encodeURIComponent(String(id));
}
