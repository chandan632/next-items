"use client";

import type { ReactNode } from "react";

import { useRequireAdmin } from "@/hooks/useRequireAdmin";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { ready } = useRequireAdmin();

  if (!ready) {
    return (
      <main className="table-app">
        <p className="muted">Checking access…</p>
      </main>
    );
  }

  return children;
}
