import { getSessionCookieName } from "@/lib/env";

export function setSessionFlagCookie() {
  if (typeof document === "undefined") return;
  const name = getSessionCookieName();
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${encodeURIComponent(name)}=1; Path=/; SameSite=Lax${secure}`;
}

export function clearSessionFlagCookie() {
  if (typeof document === "undefined") return;
  const name = getSessionCookieName();
  document.cookie = `${encodeURIComponent(name)}=; Path=/; Max-Age=0; SameSite=Lax`;
}
