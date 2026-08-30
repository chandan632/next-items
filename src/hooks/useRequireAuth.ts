"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";

export function useRequireAuth() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) {
      setReady(false);
      return;
    }
    if (!isAuthenticated || !user) {
      setReady(false);
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [loading, isAuthenticated, user, router]);

  return { user, ready: ready && !loading && isAuthenticated };
}
