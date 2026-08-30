import { CATEGORIES, COLUMNS, PAGE_SIZE_OPTIONS, STATUSES } from "@/lib/columns";
import type { ItemQuery } from "@/lib/types";

export const QUERY_DEFAULTS: ItemQuery = {
  cursor: "",
  page_size: 10,
  sort_by: "created_at",
  sort_order: "desc",
  q: "",
  category: "",
  status: "",
  min_price: "",
  max_price: "",
  min_quantity: "",
  max_quantity: "",
};

const SORTABLE = new Set(COLUMNS.filter((c) => c.sortable).map((c) => c.id));
const CATEGORY_SET = new Set<string>(CATEGORIES);
const STATUS_SET = new Set<string>(STATUSES);
const PAGE_SIZES = [...PAGE_SIZE_OPTIONS];

export function snapPageSize(raw: number): number {
  if (!Number.isFinite(raw) || raw < 1) return QUERY_DEFAULTS.page_size;
  if ((PAGE_SIZES as number[]).includes(raw)) return raw;

  let best = PAGE_SIZES[0];
  let bestDist = Math.abs(raw - best);
  for (const size of PAGE_SIZES) {
    const dist = Math.abs(raw - size);
    if (dist < bestDist || (dist === bestDist && size > best)) {
      best = size;
      bestDist = dist;
    }
  }
  return best;
}

export function parseQueryParams(params: URLSearchParams): ItemQuery {
  const rawSize =
    Number(params.get("page_size") ?? QUERY_DEFAULTS.page_size) ||
    QUERY_DEFAULTS.page_size;
  const sortBy = params.get("sort_by") ?? QUERY_DEFAULTS.sort_by;
  const category = params.get("category") ?? "";
  const status = params.get("status") ?? "";

  return {
    cursor: params.get("cursor") ?? QUERY_DEFAULTS.cursor,
    page_size: snapPageSize(rawSize),
    sort_by: SORTABLE.has(sortBy as never) ? sortBy : QUERY_DEFAULTS.sort_by,
    sort_order: params.get("sort_order") === "asc" ? "asc" : "desc",
    q: params.get("q") ?? "",
    category: CATEGORY_SET.has(category) ? category : "",
    status: STATUS_SET.has(status) ? status : "",
    min_price: params.get("min_price") ?? "",
    max_price: params.get("max_price") ?? "",
    min_quantity: params.get("min_quantity") ?? "",
    max_quantity: params.get("max_quantity") ?? "",
  };
}
