import {
  apiPath,
  apiRequest,
  idempotentHeaders,
} from "@/lib/api/client";
import type { AdminUserCreate, AuthUser, UserAdminUpdate } from "@/lib/types";

export async function fetchUsers(signal?: AbortSignal): Promise<AuthUser[]> {
  return apiRequest<AuthUser[]>(apiPath("/auth/users/"), { signal });
}

export async function createUser(payload: AdminUserCreate): Promise<AuthUser> {
  return apiRequest<AuthUser>(apiPath("/auth/users/"), {
    method: "POST",
    headers: idempotentHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function updateUser(
  userId: string,
  payload: UserAdminUpdate,
): Promise<AuthUser> {
  return apiRequest<AuthUser>(apiPath(`/auth/users/${userId}`), {
    method: "PATCH",
    headers: idempotentHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function deleteUser(userId: string): Promise<void> {
  return apiRequest<void>(apiPath(`/auth/users/${userId}`), {
    method: "DELETE",
    headers: idempotentHeaders(),
  });
}

export async function resetUserPassword(userId: string): Promise<AuthUser> {
  return apiRequest<AuthUser>(apiPath(`/auth/users/${userId}/reset-password`), {
    method: "POST",
    headers: idempotentHeaders(),
  });
}
