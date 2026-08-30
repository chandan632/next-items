"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import {
  ApiError,
  createUser,
  deleteUser,
  fetchUsers,
  resetUserPassword,
  updateUser,
} from "@/lib/api";
import type { AuthUser, UserRole } from "@/lib/types";
import { getDefaultUserPassword } from "@/lib/env";

const ROLES: UserRole[] = ["viewer", "editor", "admin"];
const defaultUserPassword = getDefaultUserPassword();

type EditState = {
  user: AuthUser;
  role: UserRole;
  is_active: boolean;
} | null;

type ConfirmState = {
  message: string;
  danger?: boolean;
  run: () => Promise<void>;
} | null;

export function UsersAdminPanel() {
  const { user: currentUser } = useRequireAdmin();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(
    null,
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [createRole, setCreateRole] = useState<UserRole>("viewer");
  const [edit, setEdit] = useState<EditState>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchUsers();
      setUsers(rows);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    void reload();
  }, [currentUser, reload]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  if (!currentUser) {
    return null;
  }

  function showMessage(message: string, tone: "success" | "error" = "success") {
    setToast({ message, tone });
  }

  function askConfirm(message: string, run: () => Promise<void>, danger = false) {
    setConfirm({ message, run, danger });
  }

  async function onCreate() {
    setBusy(true);
    try {
      await createUser({ email: createEmail.trim(), role: createRole });
      setCreateOpen(false);
      setCreateEmail("");
      setCreateRole("viewer");
      showMessage(`User created. Default password: ${defaultUserPassword}`);
      await reload();
    } catch (err) {
      showMessage(err instanceof ApiError ? err.message : "Create failed", "error");
    } finally {
      setBusy(false);
    }
  }

  async function onSaveEdit() {
    if (!edit) return;
    setBusy(true);
    try {
      await updateUser(edit.user.id, {
        role: edit.role,
        is_active: edit.is_active,
      });
      setEdit(null);
      showMessage("User updated");
      await reload();
    } catch (err) {
      showMessage(err instanceof ApiError ? err.message : "Update failed", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="table-app">
      <header className="page-header">
        <div>
          <h1>User management</h1>
          <p className="muted">
            Admin only · new users and resets use default password{" "}
            <code>{defaultUserPassword}</code>
          </p>
        </div>
        <div className="header-actions">
          <Link className="btn" href="/account/change-password">
            Change password
          </Link>
          <Link className="btn" href="/">
            Back to items
          </Link>
          <button type="button" className="btn primary" onClick={() => setCreateOpen(true)}>
            Add user
          </button>
          <button type="button" className="btn" onClick={() => void reload()} disabled={loading}>
            Refresh
          </button>
        </div>
      </header>

      {error && <p className="banner banner-error">{error}</p>}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="muted">
                  Loading users…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="muted">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((row) => {
                const isSelf = row.id === currentUser?.id;
                return (
                  <tr key={row.id}>
                    <td>{row.email}</td>
                    <td>{row.role}</td>
                    <td>{row.is_active ? "Active" : "Inactive"}</td>
                    <td>{new Date(row.created_at).toLocaleString()}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="btn"
                          disabled={isSelf}
                          onClick={() =>
                            setEdit({
                              user: row,
                              role: row.role,
                              is_active: row.is_active,
                            })
                          }
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn"
                          onClick={() =>
                            askConfirm(
                              `Reset password for ${row.email} to "${defaultUserPassword}"?`,
                              async () => {
                                setBusy(true);
                                try {
                                  await resetUserPassword(row.id);
                                  showMessage(`Password reset for ${row.email}`);
                                } catch (err) {
                                  showMessage(
                                    err instanceof ApiError ? err.message : "Reset failed",
                                    "error",
                                  );
                                } finally {
                                  setBusy(false);
                                }
                              },
                            )
                          }
                        >
                          Reset password
                        </button>
                        <button
                          type="button"
                          className="btn danger"
                          disabled={isSelf}
                          onClick={() =>
                            askConfirm(
                              `Delete ${row.email}?`,
                              async () => {
                                setBusy(true);
                                try {
                                  await deleteUser(row.id);
                                  showMessage("User deleted");
                                  await reload();
                                } catch (err) {
                                  showMessage(
                                    err instanceof ApiError ? err.message : "Delete failed",
                                    "error",
                                  );
                                } finally {
                                  setBusy(false);
                                }
                              },
                              true,
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={createOpen}
        title="Add user"
        onClose={() => !busy && setCreateOpen(false)}
      >
        <div className="form-stack">
          <label>
            Email
            <input
              className="input"
              type="email"
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              autoComplete="off"
            />
          </label>
          <label>
            Role
            <select
              className="input"
              value={createRole}
              onChange={(e) => setCreateRole(e.target.value as UserRole)}
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>
          <p className="muted">
            Initial password will be <code>{defaultUserPassword}</code>. User should change it after
            first login.
          </p>
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => setCreateOpen(false)} disabled={busy}>
              Cancel
            </button>
            <button
              type="button"
              className="btn primary"
              disabled={busy || !createEmail.trim()}
              onClick={() => void onCreate()}
            >
              Create
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(edit)} title="Edit user" onClose={() => !busy && setEdit(null)}>
        {edit && (
          <div className="form-stack">
            <p className="muted">{edit.user.email}</p>
            <label>
              Role
              <select
                className="input"
                value={edit.role}
                onChange={(e) =>
                  setEdit({ ...edit, role: e.target.value as UserRole })
                }
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={edit.is_active}
                onChange={(e) => setEdit({ ...edit, is_active: e.target.checked })}
              />
              Active
            </label>
            <div className="form-actions">
              <button type="button" className="btn" onClick={() => setEdit(null)} disabled={busy}>
                Cancel
              </button>
              <button
                type="button"
                className="btn primary"
                disabled={busy}
                onClick={() => void onSaveEdit()}
              >
                Save
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        message={confirm?.message ?? ""}
        danger={confirm?.danger}
        busy={busy}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          const action = confirm?.run;
          setConfirm(null);
          if (action) void action();
        }}
      />

      {toast && <Toast message={toast.message} tone={toast.tone} />}
    </main>
  );
}
