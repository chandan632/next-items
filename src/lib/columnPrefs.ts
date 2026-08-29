import { DEFAULT_COLUMN_ORDER } from "./columns";
import type { ColumnId } from "./types";

export type ColumnPrefs = {
  order: ColumnId[];
  hidden: ColumnId[];
};

export const COLUMN_STORAGE_KEY = "items-table-columns-v1";

export function defaultColumnPrefs(): ColumnPrefs {
  return { order: DEFAULT_COLUMN_ORDER, hidden: [] };
}

export function loadColumnPrefs(): ColumnPrefs {
  if (typeof window === "undefined") return defaultColumnPrefs();
  try {
    const raw = localStorage.getItem(COLUMN_STORAGE_KEY);
    if (!raw) return defaultColumnPrefs();
    const parsed = JSON.parse(raw) as ColumnPrefs;
    const order = parsed.order?.filter((id) => DEFAULT_COLUMN_ORDER.includes(id));
    return {
      order: order?.length ? order : DEFAULT_COLUMN_ORDER,
      hidden: (parsed.hidden ?? []).filter((id) => DEFAULT_COLUMN_ORDER.includes(id)),
    };
  } catch {
    return defaultColumnPrefs();
  }
}

export function saveColumnPrefs(prefs: ColumnPrefs) {
  localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify(prefs));
}

export function toggleHiddenColumn(prefs: ColumnPrefs, id: ColumnId): ColumnPrefs {
  const hidden = prefs.hidden.includes(id)
    ? prefs.hidden.filter((x) => x !== id)
    : [...prefs.hidden, id];
  if (hidden.length >= DEFAULT_COLUMN_ORDER.length) return prefs;
  return { ...prefs, hidden };
}

export function moveColumn(
  prefs: ColumnPrefs,
  fromId: ColumnId,
  toId: ColumnId,
): ColumnPrefs {
  if (fromId === toId) return prefs;
  const order = [...prefs.order];
  const from = order.indexOf(fromId);
  const to = order.indexOf(toId);
  if (from < 0 || to < 0) return prefs;
  order.splice(from, 1);
  order.splice(to, 0, fromId);
  return { ...prefs, order };
}
