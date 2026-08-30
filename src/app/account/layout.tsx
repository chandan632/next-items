"use client";

import type { ReactNode } from "react";

import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function AccountLayout({ children }: { children: ReactNode }) {
  const { ready } = useRequireAuth();

  if (!ready) {
    return (
      <main className="table-app">
        <p className="muted">Checking access…</p>
      </main>
    );
  }

  return children;
}
