import type { ColumnId, Item } from "./types";

export function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

export function cellValue(item: Item, columnId: ColumnId): string {
  switch (columnId) {
    case "price":
      return formatMoney(item.price);
    case "created_at":
    case "updated_at":
      return formatDate(item[columnId]);
    default:
      return String(item[columnId] ?? "");
  }
}
