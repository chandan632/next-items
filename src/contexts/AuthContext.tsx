"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { ApiError, bindAuth } from "@/lib/api/client";
import { login as apiLogin, logout as apiLogout, refreshSession } from "@/lib/api/auth";
import { clearSessionFlagCookie, setSessionFlagCookie } from "@/lib/sessionCookie";
import type { AuthUser } from "@/lib/types";

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  canEdit: boolean;
  canAdmin: boolean;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

const BOOTSTRAP_MS = 8_000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const tokenRef = useRef<string | null>(null);
  tokenRef.current = accessToken;

  const csrfRef = useRef<string | null>(null);

  const setSession = useCallback(
    (token: string, nextUser: AuthUser, csrfToken?: string | null) => {
      tokenRef.current = token;
      if (csrfToken) csrfRef.current = csrfToken;
      setAccessToken(token);
      setUser(nextUser);
      setSessionFlagCookie();
    },
    [],
  );

  const clearSession = useCallback(() => {
    tokenRef.current = null;
    csrfRef.current = null;
    setAccessToken(null);
    setUser(null);
    clearSessionFlagCookie();
    try {
      sessionStorage.removeItem("items_csrf_token");
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    bindAuth({
      getAccessToken: () => tokenRef.current,
      getCsrfToken: () => csrfRef.current,
      setSession,
      clearSession,
    });
  }, [setSession, clearSession]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const timer = window.setTimeout(() => {
        if (!cancelled) setLoading(false);
      }, BOOTSTRAP_MS);

      try {
        const data = await refreshSession();
        if (cancelled) return;
        setSession(data.access_token, data.user, data.csrf_token ?? null);
      } catch (err) {
        if (!cancelled && err instanceof ApiError && err.status === 401) {
          clearSession();
        }
      } finally {
        window.clearTimeout(timer);
        if (!cancelled) setLoading(false);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [setSession, clearSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await apiLogin(email, password);
      setSession(data.access_token, data.user, data.csrf_token ?? null);
    },
    [setSession],
  );

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      loading,
      isAuthenticated: Boolean(user && accessToken),
      login,
      logout,
      canEdit: user?.role === "editor" || user?.role === "admin",
      canAdmin: user?.role === "admin",
    }),
    [user, accessToken, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
