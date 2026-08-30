"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { ItemQuery } from "@/lib/types";

export function useCursorPagination(
  query: ItemQuery,
  setQuery: (patch: Partial<ItemQuery>, options?: { resetCursor?: boolean }) => void,
  filterKey: string,
) {
  const [stack, setStack] = useState<(string | null)[]>([null]);
  const filterRef = useRef(filterKey);

  useEffect(() => {
    if (filterKey === filterRef.current) return;
    filterRef.current = filterKey;
    setStack([null]);
    if (query.cursor) {
      setQuery({ cursor: "" });
    }
  }, [filterKey, query.cursor, setQuery]);

  const hasPrev = stack.length > 1;

  const goNext = useCallback(
    (nextCursor: string | null) => {
      if (!nextCursor) return;
      setStack((current) => [...current, query.cursor || null]);
      setQuery({ cursor: nextCursor });
    },
    [query.cursor, setQuery],
  );

  const goPrev = useCallback(() => {
    setStack((current) => {
      if (current.length <= 1) return current;
      const nextStack = current.slice(0, -1);
      const previousCursor = nextStack[nextStack.length - 1] ?? "";
      setQuery({ cursor: previousCursor });
      return nextStack;
    });
  }, [setQuery]);

  const resetStack = useCallback(() => {
    setStack([null]);
  }, []);

  return { hasPrev, goNext, goPrev, resetStack };
}
