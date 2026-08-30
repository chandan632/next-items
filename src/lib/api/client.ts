import {
  apiPath,
  getApiBaseUrl,
  getCsrfCookieName,
  getCsrfHeaderName,
  getLoginPath,
} from "@/lib/env";
import type { AuthUser, TokenResponse } from "@/lib/types";

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  requestId?: string;

  constructor(
    message: string,
    status: number,
    options?: { code?: string; details?: unknown; requestId?: string },
  ) {
    super(message);
    this.status = status;
    this.code = options?.code;
    this.details = options?.details;
    this.requestId = options?.requestId;
  }
}

type AuthBindings = {
  getAccessToken: () => string | null;
  getCsrfToken: () => string | null;
  setSession: (token: string, user: AuthUser, csrfToken?: string | null) => void;
  clearSession: () => void;
};

type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  meta?: unknown;
  error?: { code?: string; message?: string; details?: unknown };
  request_id?: string;
};

let auth: AuthBindings = {
  getAccessToken: () => null,
  getCsrfToken: () => null,
  setSession: () => {},
  clearSession: () => {},
};

let csrfTokenRef: string | null = null;

let refreshInFlight: Promise<TokenResponse | null> | null = null;

const CSRF_STORAGE_KEY = "items_csrf_token";

function readStoredCsrf(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    return sessionStorage.getItem(CSRF_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredCsrf(token: string | null) {
  if (typeof sessionStorage === "undefined") return;
  try {
    if (token) sessionStorage.setItem(CSRF_STORAGE_KEY, token);
    else sessionStorage.removeItem(CSRF_STORAGE_KEY);
  } catch {
    // ignore quota / private mode
  }
}

export function bindAuth(bindings: AuthBindings) {
  auth = bindings;
  csrfTokenRef = bindings.getCsrfToken() ?? readStoredCsrf();
}

export function peekAccessToken() {
  return auth.getAccessToken();
}

export function peekCsrfToken() {
  return csrfTokenRef ?? auth.getCsrfToken() ?? readStoredCsrf();
}

function setCsrfToken(token: string | null) {
  csrfTokenRef = token;
  writeStoredCsrf(token);
}

function apiBase() {
  return getApiBaseUrl();
}

export function buildQueryString(
  query: Record<string, string | number | boolean | undefined | null>,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  return params.toString();
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const parts = document.cookie.split(";").map((p) => p.trim());
  for (const part of parts) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = decodeURIComponent(part.slice(0, idx));
    if (key === name) return decodeURIComponent(part.slice(idx + 1));
  }
  return null;
}

function withCsrf(headers: Headers) {
  const token = peekCsrfToken() ?? readCookie(getCsrfCookieName());
  if (token && !headers.has(getCsrfHeaderName())) {
    headers.set(getCsrfHeaderName(), token);
  }
}

function unwrapBody<T>(body: unknown): T {
  if (
    body &&
    typeof body === "object" &&
    "success" in body &&
    (body as ApiEnvelope<T>).success === true
  ) {
    return (body as ApiEnvelope<T>).data as T;
  }
  return body as T;
}

async function parseError(response: Response): Promise<never> {
  let message = `Request failed (${response.status})`;
  let code: string | undefined;
  let details: unknown;
  let requestId: string | undefined;
  try {
    const body = await response.json();
    if (body?.error) {
      message = body.error.message ?? message;
      code = body.error.code;
      details = body.error.details;
      requestId = body.request_id;
    } else {
      message = body?.detail ?? message;
      if (typeof body?.detail === "object" && body?.detail?.message) {
        message = body.detail.message;
      }
    }
  } catch {
  }
  throw new ApiError(message, response.status, { code, details, requestId });
}

function isAuthPath(path: string) {
  const login = apiPath("/auth/login");
  const refresh = apiPath("/auth/refresh");
  return path.startsWith(login) || path.startsWith(refresh);
}

async function performRefresh(): Promise<TokenResponse | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const headers = new Headers();
      withCsrf(headers);
      const response = await fetch(`${apiBase()}${apiPath("/auth/refresh")}`, {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers,
      });
      if (!response.ok) return null;
      const raw = await response.json();
      const data = unwrapBody<TokenResponse>(raw);
      auth.setSession(data.access_token, data.user, data.csrf_token ?? null);
      if (data.csrf_token) setCsrfToken(data.csrf_token);
      return data;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export async function refreshAccessSession(): Promise<TokenResponse> {
  const data = await performRefresh();
  if (!data) {
    throw new ApiError("Session expired. Please sign in again.", 401, {
      code: "UNAUTHORIZED",
    });
  }
  return data;
}

async function tryRefresh(): Promise<boolean> {
  return (await performRefresh()) !== null;
}

function redirectToLogin() {
  if (typeof window === "undefined") return;
  const loginPath = getLoginPath();
  if (window.location.pathname === loginPath) return;
  window.location.assign(loginPath);
}

export async function apiFetch(
  pathOrUrl: string,
  init?: RequestInit,
  options?: { skipAuthRetry?: boolean },
): Promise<Response> {
  const isAbsolute = /^https?:\/\//i.test(pathOrUrl);
  const resolvedPath = isAbsolute
    ? pathOrUrl
    : pathOrUrl.startsWith("/api/")
      ? pathOrUrl
      : apiPath(pathOrUrl);
  const url = isAbsolute ? pathOrUrl : `${apiBase()}${resolvedPath}`;
  const headers = new Headers(init?.headers);
  const token = auth.getAccessToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const method = (init?.method ?? "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    withCsrf(headers);
  }

  const pathForAuthCheck = isAbsolute
    ? pathOrUrl.replace(apiBase(), "")
    : resolvedPath;

  const response = await fetch(url, {
    cache: "no-store",
    credentials: "include",
    ...init,
    headers,
  });

  if (
    response.status === 401 &&
    !options?.skipAuthRetry &&
    !isAuthPath(pathForAuthCheck)
  ) {
    let forceLogoutCode: string | undefined;
    try {
      const body = await response.clone().json();
      forceLogoutCode =
        body?.error?.code ??
        (typeof body?.detail === "object" ? body?.detail?.code : undefined);
    } catch {
      // ignore parse errors
    }

    if (
      forceLogoutCode === "PRIVILEGES_CHANGED" ||
      forceLogoutCode === "ACCOUNT_INACTIVE"
    ) {
      auth.clearSession();
      setCsrfToken(null);
      redirectToLogin();
      throw new ApiError(
        forceLogoutCode === "PRIVILEGES_CHANGED"
          ? "Your access level changed. Please sign in again."
          : "Account is inactive. Please sign in again.",
        401,
        { code: forceLogoutCode },
      );
    }

    const refreshed = await tryRefresh();
    if (refreshed) {
      return apiFetch(pathOrUrl, init, { skipAuthRetry: true });
    }
    auth.clearSession();
    setCsrfToken(null);
    redirectToLogin();
    throw new ApiError("Unauthorized", 401, { code: "UNAUTHORIZED" });
  }

  return response;
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
  options?: { skipAuthRetry?: boolean },
): Promise<T> {
  const response = await apiFetch(path, init, options);

  if (!response.ok) await parseError(response);
  if (response.status === 204) return undefined as T;
  const raw = await response.json();
  if (
    raw &&
    typeof raw === "object" &&
    "success" in raw &&
    "meta" in raw &&
    Array.isArray((raw as ApiEnvelope<unknown>).data)
  ) {
    return {
      data: (raw as ApiEnvelope<unknown>).data,
      meta: (raw as { meta: unknown }).meta,
    } as T;
  }
  return unwrapBody<T>(raw);
}

export function idempotentHeaders(extra?: HeadersInit): HeadersInit {
  return {
    "Content-Type": "application/json",
    "Idempotency-Key": crypto.randomUUID(),
    ...extra,
  };
}

export { apiBase, apiPath, unwrapBody };
