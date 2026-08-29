import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { QUERY_DEFAULTS } from "@/lib/queryParams";
import type { ItemListResponse } from "@/lib/types";

const fetchItems = vi.fn();

vi.mock("@/lib/api", () => ({
  ApiError: class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  },
  fetchItems: (...args: unknown[]) => fetchItems(...args),
}));

import { ApiError } from "@/lib/api";
import { useItemsData } from "@/hooks/useItemsData";

const samplePage: ItemListResponse = {
  data: [
    {
      id: "1",
      name: "Lamp",
      sku: "SKU-1",
      category: "home",
      status: "active",
      price: 12,
      quantity: 3,
      description: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  ],
  meta: { page: 1, page_size: 10, total: 1, total_pages: 1 },
};

describe("useItemsData", () => {
  beforeEach(() => {
    fetchItems.mockReset();
  });

  it("loads items and aborts in-flight fetch on unmount", async () => {
    let resolveFetch!: (value: ItemListResponse) => void;
    fetchItems.mockImplementation(
      (_query: unknown, signal?: AbortSignal) =>
        new Promise<ItemListResponse>((resolve, reject) => {
          resolveFetch = resolve;
          signal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        }),
    );

    const { result, unmount } = renderHook(() => useItemsData(QUERY_DEFAULTS));
    expect(result.current.initialLoading).toBe(true);

    unmount();
    resolveFetch(samplePage);

    await waitFor(() => {
      expect(fetchItems).toHaveBeenCalledTimes(1);
      const signal = fetchItems.mock.calls[0][1] as AbortSignal;
      expect(signal.aborted).toBe(true);
    });
  });

  it("surfaces ApiError message", async () => {
    fetchItems.mockRejectedValue(new ApiError("boom from api", 500));

    const { result } = renderHook(() => useItemsData(QUERY_DEFAULTS));

    await waitFor(() => {
      expect(result.current.initialLoading).toBe(false);
    });

    expect(result.current.error).toBe("boom from api");
    expect(result.current.data).toBeNull();
  });

  it("refresh keeps previous data with initialLoading false", async () => {
    fetchItems
      .mockResolvedValueOnce(samplePage)
      .mockImplementationOnce(
        () =>
          new Promise<ItemListResponse>((resolve) => {
            setTimeout(() => resolve({ ...samplePage, meta: { ...samplePage.meta, total: 2 } }), 50);
          }),
      );

    const { result } = renderHook(() => useItemsData(QUERY_DEFAULTS));

    await waitFor(() => {
      expect(result.current.data?.meta.total).toBe(1);
      expect(result.current.initialLoading).toBe(false);
    });

    act(() => {
      result.current.reload();
    });

    await waitFor(() => {
      expect(result.current.refreshing).toBe(true);
    });
    expect(result.current.initialLoading).toBe(false);
    expect(result.current.data?.meta.total).toBe(1);

    await waitFor(() => {
      expect(result.current.refreshing).toBe(false);
      expect(result.current.data?.meta.total).toBe(2);
    });
  });
});
