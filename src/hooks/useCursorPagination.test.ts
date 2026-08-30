import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useCursorPagination } from "@/hooks/useCursorPagination";
import { QUERY_DEFAULTS } from "@/lib/queryParams";
import type { ItemQuery } from "@/lib/types";

describe("useCursorPagination", () => {
  it("pushes current cursor then advances on goNext", () => {
    const setQuery = vi.fn();
    const { result, rerender } = renderHook(
      ({ query }: { query: ItemQuery }) =>
        useCursorPagination(query, setQuery, "filters"),
      { initialProps: { query: { ...QUERY_DEFAULTS, cursor: "" } } },
    );

    expect(result.current.hasPrev).toBe(false);

    act(() => {
      result.current.goNext("cursor-2");
    });
    expect(setQuery).toHaveBeenCalledWith({ cursor: "cursor-2" });

    rerender({ query: { ...QUERY_DEFAULTS, cursor: "cursor-2" } });
    expect(result.current.hasPrev).toBe(true);

    act(() => {
      result.current.goNext("cursor-3");
    });
    expect(setQuery).toHaveBeenLastCalledWith({ cursor: "cursor-3" });
  });

  it("restores previous cursor on goPrev", () => {
    const setQuery = vi.fn();
    const { result, rerender } = renderHook(
      ({ query }: { query: ItemQuery }) =>
        useCursorPagination(query, setQuery, "filters"),
      { initialProps: { query: { ...QUERY_DEFAULTS, cursor: "" } } },
    );

    act(() => {
      result.current.goNext("cursor-2");
    });
    rerender({ query: { ...QUERY_DEFAULTS, cursor: "cursor-2" } });

    act(() => {
      result.current.goPrev();
    });
    expect(setQuery).toHaveBeenLastCalledWith({ cursor: "" });
    expect(result.current.hasPrev).toBe(false);
  });

  it("clears cursor when filterKey changes", () => {
    const setQuery = vi.fn();
    const { rerender } = renderHook(
      ({
        query,
        filterKey,
      }: {
        query: ItemQuery;
        filterKey: string;
      }) => useCursorPagination(query, setQuery, filterKey),
      {
        initialProps: {
          query: { ...QUERY_DEFAULTS, cursor: "deep" },
          filterKey: "status=active",
        },
      },
    );

    rerender({
      query: { ...QUERY_DEFAULTS, cursor: "deep" },
      filterKey: "status=draft",
    });

    expect(setQuery).toHaveBeenCalledWith({ cursor: "" });
  });

  it("ignores goNext without a next cursor", () => {
    const setQuery = vi.fn();
    const { result } = renderHook(() =>
      useCursorPagination(QUERY_DEFAULTS, setQuery, "filters"),
    );

    act(() => {
      result.current.goNext(null);
    });
    expect(setQuery).not.toHaveBeenCalled();
  });
});
