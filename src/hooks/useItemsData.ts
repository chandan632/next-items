"use client";

import { useEffect, useRef, useState } from "react";

import { queryKey } from "@/hooks/useItemsUrlState";
import { ApiError, fetchItems } from "@/lib/api";
import type { ItemListResponse, ItemQuery } from "@/lib/types";

type UseItemsDataResult = {
  data: ItemListResponse | null;
  error: string | null;
  initialLoading: boolean;
  refreshing: boolean;
  reload: () => void;
};

export function useItemsData(query: ItemQuery): UseItemsDataResult {
  const [data, setData] = useState<ItemListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const hasDataRef = useRef(false);
  const serializedKey = queryKey(query);
  const queryRef = useRef(query);
  queryRef.current = query;

  useEffect(() => {
    const controller = new AbortController();
    const currentQuery = queryRef.current;

    async function load() {
      if (hasDataRef.current) setRefreshing(true);
      else setInitialLoading(true);
      setError(null);

      try {
        const result = await fetchItems(currentQuery, controller.signal);
        if (controller.signal.aborted) return;
        setData(result);
        hasDataRef.current = true;
      } catch (err) {
        if (controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof ApiError ? err.message : "Failed to load items");
        if (!hasDataRef.current) setData(null);
      } finally {
        if (!controller.signal.aborted) {
          setInitialLoading(false);
          setRefreshing(false);
        }
      }
    }

    void load();
    return () => controller.abort();
  }, [serializedKey, reloadToken]);

  return {
    data,
    error,
    initialLoading,
    refreshing,
    reload: () => setReloadToken((n) => n + 1),
  };
}
