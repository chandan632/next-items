"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";

export function useRequireAdmin() {
  const router = useRouter();
  const { user, loading, canAdmin } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) {
      setReady(false);
      return;
    }
    if (!user || !canAdmin) {
      setReady(false);
      router.replace("/");
      return;
    }
    setReady(true);
  }, [loading, user, canAdmin, router]);

  return { user, ready: ready && !loading && Boolean(user) && canAdmin };
}
