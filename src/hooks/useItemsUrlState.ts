"use client";

import { startTransition, useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { parseQueryParams, QUERY_DEFAULTS } from "@/lib/queryParams";
import type { ItemQuery } from "@/lib/types";

export { QUERY_DEFAULTS };

export function readQuery(params: URLSearchParams): ItemQuery {
  return parseQueryParams(params);
}

export function filterKey(query: ItemQuery): string {
  return [
    query.q,
    query.category,
    query.status,
    query.min_price,
    query.max_price,
    query.min_quantity,
    query.max_quantity,
    query.sort_by,
    query.sort_order,
    query.page_size,
  ].join("|");
}

export function queryKey(query: ItemQuery): string {
  return [
    query.cursor,
    query.page_size,
    query.sort_by,
    query.sort_order,
    query.q,
    query.category,
    query.status,
    query.min_price,
    query.max_price,
    query.min_quantity,
    query.max_quantity,
  ].join("|");
}

function toSearchParams(next: ItemQuery): string {
  const params = new URLSearchParams();
  (Object.keys(QUERY_DEFAULTS) as (keyof ItemQuery)[]).forEach((key) => {
    const value = next[key];
    const fallback = QUERY_DEFAULTS[key];
    if (value === undefined || value === null || value === "" || value === fallback) {
      return;
    }
    params.set(key, String(value));
  });
  return params.toString();
}

export function useItemsUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = useMemo(() => readQuery(searchParams), [searchParams]);

  const setQuery = useCallback(
    (patch: Partial<ItemQuery>, options?: { resetCursor?: boolean }) => {
      const current = readQuery(searchParams);
      const next: ItemQuery = {
        ...current,
        ...patch,
        cursor: options?.resetCursor ? "" : (patch.cursor ?? current.cursor),
      };
      const qs = toSearchParams(next);
      const href = qs ? `${pathname}?${qs}` : pathname;
      startTransition(() => {
        router.replace(href, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  return { query, setQuery };
}
