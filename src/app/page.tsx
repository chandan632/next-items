"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";

import { getLoginPath } from "@/lib/env";
import { useAuth } from "@/hooks/useAuth";

const ItemsDataTable = dynamic(
  () =>
    import("@/components/items/ItemsDataTable").then((m) => m.ItemsDataTable),
  {
    loading: () => <div className="table-app">Loading table…</div>,
    ssr: false,
  },
);

function HomeGate() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const loginPath = getLoginPath();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(loginPath);
    }
  }, [loading, isAuthenticated, router, loginPath]);

  if (loading || !isAuthenticated) {
    return <div className="table-app">Loading…</div>;
  }

  return (
    <Suspense fallback={<div className="table-app">Loading table…</div>}>
      <ItemsDataTable />
    </Suspense>
  );
}

export default function Home() {
  return (
    <main>
      <HomeGate />
    </main>
  );
}
