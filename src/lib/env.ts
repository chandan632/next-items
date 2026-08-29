const DEFAULT_DEV_API_URL = "http://localhost:8000";

function requirePublic(name: string, fallback?: string): string {
  const value = process.env[name]?.trim();
  if (value) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error(`${name} is required in production`);
  }
  if (fallback !== undefined) return fallback;
  throw new Error(`${name} is not set`);
}

export function getApiBaseUrl(): string {
  return requirePublic("NEXT_PUBLIC_API_URL", DEFAULT_DEV_API_URL).replace(
    /\/$/,
    "",
  );
}

export function getApiPrefix(): string {
  const raw = requirePublic("NEXT_PUBLIC_API_PREFIX", "/api/v1");
  const trimmed = raw.startsWith("/") ? raw : `/${raw}`;
  return trimmed.replace(/\/$/, "") || "/api/v1";
}

export function apiPath(path: string): string {
  const prefix = getApiPrefix();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized.startsWith(prefix)) return normalized;
  return `${prefix}${normalized}`;
}

export function getAppName(): string {
  return requirePublic("NEXT_PUBLIC_APP_NAME", "Items");
}

export function getLoginPath(): string {
  const path = requirePublic("NEXT_PUBLIC_LOGIN_PATH", "/login");
  return path.startsWith("/") ? path : `/${path}`;
}

export function getCsrfCookieName(): string {
  return requirePublic("NEXT_PUBLIC_CSRF_COOKIE_NAME", "csrf_token");
}

export function getCsrfHeaderName(): string {
  return requirePublic("NEXT_PUBLIC_CSRF_HEADER_NAME", "X-CSRF-Token");
}

export function getSessionCookieName(): string {
  return requirePublic("NEXT_PUBLIC_SESSION_COOKIE_NAME", "items_session");
}
