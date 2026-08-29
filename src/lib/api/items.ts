import {
  apiBase,
  apiFetch,
  apiPath,
  apiRequest,
  buildQueryString,
  idempotentHeaders,
} from "@/lib/api/client";
import type {
  BulkAction,
  Item,
  ItemListResponse,
  ItemQuery,
  ItemStatus,
} from "@/lib/types";

export async function fetchItems(
  query: ItemQuery,
  signal?: AbortSignal,
): Promise<ItemListResponse> {
  return apiRequest(`${apiPath("/items/")}?${buildQueryString(query)}`, {
    signal,
  });
}

export async function createItem(payload: {
  name: string;
  sku: string;
  category: string;
  status: string;
  price: number;
  quantity: number;
  description: string | null;
}): Promise<Item> {
  return apiRequest(apiPath("/items/"), {
    method: "POST",
    headers: idempotentHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function updateItem(
  id: string,
  payload: Partial<{
    name: string;
    sku: string;
    category: string;
    status: ItemStatus;
    price: number;
    quantity: number;
    description: string | null;
  }>,
): Promise<Item> {
  return apiRequest(apiPath(`/items/${id}`), {
    method: "PATCH",
    headers: idempotentHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function deleteItem(id: string) {
  return apiRequest<void>(apiPath(`/items/${id}`), {
    method: "DELETE",
    headers: idempotentHeaders(),
  });
}

export async function updateItemStatus(id: string, status: ItemStatus) {
  return updateItem(id, { status });
}

export async function bulkAction(payload: {
  action: BulkAction;
  ids?: string[];
  exclude_ids?: string[];
  select_all?: boolean;
  q?: string;
  category?: string;
  status?: string;
  min_price?: number;
  max_price?: number;
  min_quantity?: number;
  max_quantity?: number;
  status_value?: ItemStatus;
  quantity_delta?: number;
}) {
  return apiRequest<{ matched: number; modified: number; action: BulkAction }>(
    apiPath("/items/bulk"),
    {
      method: "POST",
      headers: idempotentHeaders(),
      body: JSON.stringify(payload),
    },
  );
}

export async function seedItems(payload?: { count?: number; clear?: boolean }) {
  return apiRequest<{ inserted: number; total: number }>(apiPath("/items/seed"), {
    method: "POST",
    headers: idempotentHeaders(),
    body: JSON.stringify({
      count: payload?.count ?? 5000,
      clear: payload?.clear ?? false,
    }),
  });
}

export function exportUrl(
  query: ItemQuery,
  options: { ids?: string[]; selectAll: boolean },
): string {
  const params: Record<string, string | number | boolean | undefined> = {
    sort_by: query.sort_by,
    sort_order: query.sort_order,
    q: query.q || undefined,
    category: query.category || undefined,
    status: query.status || undefined,
    min_price: query.min_price || undefined,
    max_price: query.max_price || undefined,
    min_quantity: query.min_quantity || undefined,
    max_quantity: query.max_quantity || undefined,
    select_all: options.selectAll,
  };
  if (!options.selectAll && options.ids?.length) {
    params.ids = options.ids.join(",");
  }
  return `${apiBase()}${apiPath("/items/export")}?${buildQueryString(params)}`;
}

export async function downloadExport(
  query: ItemQuery,
  options: { ids?: string[]; selectAll: boolean },
) {
  const url = exportUrl(query, options);
  const response = await apiFetch(url);
  if (!response.ok) {
    throw new Error(`Export failed (${response.status})`);
  }
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = "items-export.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}
