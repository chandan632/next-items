"use client";

import { useCallback, useState } from "react";

export type SelectionMode = "include" | "exclude";

export type BulkPayload = {
  select_all: boolean;
  ids?: string[];
  exclude_ids?: string[];
};

export function useItemSelection() {
  const [mode, setMode] = useState<SelectionMode>("include");
  const [ids, setIds] = useState<Set<string>>(() => new Set());

  const clear = useCallback(() => {
    setMode("include");
    setIds(new Set());
  }, []);

  const selectedCount = useCallback(
    (total: number) => (mode === "include" ? ids.size : Math.max(0, total - ids.size)),
    [mode, ids],
  );

  const isSelected = useCallback(
    (id: string) => (mode === "include" ? ids.has(id) : !ids.has(id)),
    [mode, ids],
  );

  const toggleRow = useCallback((id: string) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const togglePage = useCallback(
    (pageIds: string[]) => {
      if (mode === "include") {
        const allSelected =
          pageIds.length > 0 && pageIds.every((id) => ids.has(id));
        setIds((prev) => {
          const next = new Set(prev);
          if (allSelected) pageIds.forEach((id) => next.delete(id));
          else pageIds.forEach((id) => next.add(id));
          return next;
        });
        return;
      }

      const allSelected =
        pageIds.length > 0 && pageIds.every((id) => !ids.has(id));
      setIds((prev) => {
        const next = new Set(prev);
        if (allSelected) pageIds.forEach((id) => next.add(id));
        else pageIds.forEach((id) => next.delete(id));
        return next;
      });
    },
    [mode, ids],
  );

  const selectAllMatching = useCallback(() => {
    setMode("exclude");
    setIds(new Set());
  }, []);

  const toBulkPayload = useCallback((): BulkPayload => {
    if (mode === "include") {
      return {
        select_all: false,
        ids: ids.size ? Array.from(ids) : undefined,
      };
    }
    return {
      select_all: true,
      exclude_ids: ids.size ? Array.from(ids) : undefined,
    };
  }, [mode, ids]);

  return {
    mode,
    ids,
    selectedCount,
    isSelected,
    toggleRow,
    togglePage,
    selectAllMatching,
    clear,
    toBulkPayload,
  };
}
