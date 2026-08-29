import type { ColumnId } from "./types";

export type ColumnDef = {
  id: ColumnId;
  label: string;
  sortable: boolean;
  filter?: "text" | "category" | "status" | "price" | "quantity";
};

export const COLUMNS: ColumnDef[] = [
  { id: "name", label: "Name", sortable: true, filter: "text" },
  { id: "sku", label: "SKU", sortable: true },
  { id: "category", label: "Category", sortable: true, filter: "category" },
  { id: "status", label: "Status", sortable: true, filter: "status" },
  { id: "price", label: "Price", sortable: true, filter: "price" },
  { id: "quantity", label: "Qty", sortable: true, filter: "quantity" },
  { id: "created_at", label: "Created", sortable: true },
  { id: "updated_at", label: "Updated", sortable: true },
];

export const DEFAULT_COLUMN_ORDER: ColumnId[] = COLUMNS.map((c) => c.id);

export const CATEGORIES = [
  "electronics",
  "clothing",
  "food",
  "home",
  "sports",
  "books",
  "other",
] as const;

export const STATUSES = ["active", "inactive", "archived", "draft"] as const;

export const PAGE_SIZE_OPTIONS = [10, 50, 100, 500] as const;
