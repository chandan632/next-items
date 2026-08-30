import { apiPath, apiRequest, idempotentHeaders, refreshAccessSession } from "@/lib/api/client";
import type { AuthUser, TokenResponse } from "@/lib/types";

export async function login(
  email: string,
  password: string,
): Promise<TokenResponse> {
  return apiRequest<TokenResponse>(
    apiPath("/auth/login"),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    },
    { skipAuthRetry: true },
  );
}

export async function refreshSession(): Promise<TokenResponse> {
  return refreshAccessSession();
}

export async function logout(): Promise<void> {
  return apiRequest<void>(apiPath("/auth/logout"), { method: "POST" });
}

export async function fetchMe(): Promise<AuthUser> {
  return apiRequest<AuthUser>(apiPath("/auth/me"));
}

export async function changePassword(payload: {
  current_password: string;
  new_password: string;
}): Promise<void> {
  return apiRequest<void>(apiPath("/auth/change-password"), {
    method: "POST",
    headers: idempotentHeaders(),
    body: JSON.stringify(payload),
  });
}
