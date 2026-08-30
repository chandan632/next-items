"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { PasswordInput } from "@/components/ui/PasswordInput";
import { useAuth } from "@/hooks/useAuth";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { ApiError, changePassword } from "@/lib/api";

const PASSWORD_HINT =
  "8–128 characters with at least one uppercase letter, one lowercase letter, and one digit.";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const { user } = useRequireAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setBusy(true);
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      await logout();
      router.replace("/login");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Password change failed");
    } finally {
      setBusy(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <main className="table-app login-page">
      <header className="page-header">
        <div>
          <h1>Change password</h1>
          <p className="muted">{user.email}</p>
        </div>
        <div className="header-actions">
          <Link className="btn" href="/">
            Back to items
          </Link>
        </div>
      </header>

      <form className="login-form" onSubmit={onSubmit}>
        <label htmlFor="current-password">
          Current password
          <PasswordInput
            id="current-password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={setCurrentPassword}
            required
          />
        </label>
        <label htmlFor="new-password">
          New password
          <PasswordInput
            id="new-password"
            autoComplete="new-password"
            value={newPassword}
            onChange={setNewPassword}
            required
            minLength={8}
          />
        </label>
        <label htmlFor="confirm-password">
          Confirm new password
          <PasswordInput
            id="confirm-password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            required
            minLength={8}
          />
        </label>
        <p className="muted">{PASSWORD_HINT}</p>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn primary" disabled={busy}>
          {busy ? "Saving…" : "Update password"}
        </button>
      </form>
    </main>
  );
}
