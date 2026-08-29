import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useItemSelection } from "@/hooks/useItemSelection";

describe("useItemSelection", () => {
  it("tracks include mode selections", () => {
    const { result } = renderHook(() => useItemSelection());

    act(() => {
      result.current.toggleRow("a");
      result.current.toggleRow("b");
    });

    expect(result.current.mode).toBe("include");
    expect(result.current.selectedCount(100)).toBe(2);
    expect(result.current.isSelected("a")).toBe(true);
    expect(result.current.isSelected("c")).toBe(false);
    expect(result.current.toBulkPayload()).toEqual({
      select_all: false,
      ids: expect.arrayContaining(["a", "b"]),
    });
  });

  it("toggles mode via selectAllMatching then uncheck yields exclude count total-1", () => {
    const { result } = renderHook(() => useItemSelection());

    act(() => {
      result.current.selectAllMatching();
    });
    expect(result.current.mode).toBe("exclude");
    expect(result.current.selectedCount(100)).toBe(100);
    expect(result.current.toBulkPayload()).toEqual({
      select_all: true,
      exclude_ids: undefined,
    });

    act(() => {
      result.current.toggleRow("x");
    });

    expect(result.current.mode).toBe("exclude");
    expect(result.current.selectedCount(100)).toBe(99);
    expect(result.current.isSelected("x")).toBe(false);
    expect(result.current.isSelected("y")).toBe(true);
    expect(result.current.toBulkPayload()).toEqual({
      select_all: true,
      exclude_ids: ["x"],
    });
  });

  it("clears selection back to empty include mode", () => {
    const { result } = renderHook(() => useItemSelection());

    act(() => {
      result.current.selectAllMatching();
      result.current.toggleRow("x");
      result.current.clear();
    });

    expect(result.current.mode).toBe("include");
    expect(result.current.ids.size).toBe(0);
    expect(result.current.selectedCount(50)).toBe(0);
    expect(result.current.toBulkPayload()).toEqual({
      select_all: false,
      ids: undefined,
    });
  });

  it("shapes toBulkPayload for include and exclude modes", () => {
    const { result } = renderHook(() => useItemSelection());

    expect(result.current.toBulkPayload()).toEqual({
      select_all: false,
      ids: undefined,
    });

    act(() => {
      result.current.toggleRow("a");
    });
    expect(result.current.toBulkPayload()).toEqual({
      select_all: false,
      ids: ["a"],
    });

    act(() => {
      result.current.selectAllMatching();
    });
    expect(result.current.toBulkPayload()).toEqual({
      select_all: true,
      exclude_ids: undefined,
    });

    act(() => {
      result.current.toggleRow("b");
      result.current.toggleRow("c");
    });
    expect(result.current.toBulkPayload()).toEqual({
      select_all: true,
      exclude_ids: expect.arrayContaining(["b", "c"]),
    });
  });
});
