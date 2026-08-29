"use client";

import { useCallback, useEffect, useState } from "react";

import {
  loadColumnPrefs,
  moveColumn,
  saveColumnPrefs,
  toggleHiddenColumn,
  type ColumnPrefs,
} from "@/lib/columnPrefs";
import { DEFAULT_COLUMN_ORDER } from "@/lib/columns";
import type { ColumnId } from "@/lib/types";

export function useColumnPrefs() {
  const [prefs, setPrefs] = useState<ColumnPrefs>({
    order: DEFAULT_COLUMN_ORDER,
    hidden: [],
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPrefs(loadColumnPrefs());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveColumnPrefs(prefs);
  }, [prefs, ready]);

  const toggleHidden = useCallback((id: ColumnId) => {
    setPrefs((prev) => toggleHiddenColumn(prev, id));
  }, []);

  const reorder = useCallback((fromId: ColumnId, toId: ColumnId) => {
    setPrefs((prev) => moveColumn(prev, fromId, toId));
  }, []);

  const visibleColumns = prefs.order.filter((id) => !prefs.hidden.includes(id));

  return {
    prefs,
    ready,
    visibleColumns,
    toggleHidden,
    reorder,
    setPrefs,
  };
}
