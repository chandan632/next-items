import { describe, expect, it } from "vitest";

import { filterKey, readQuery } from "@/hooks/useItemsUrlState";

describe("readQuery", () => {
  it("accepts page sizes up to 500", () => {
    const query = readQuery(new URLSearchParams("page_size=500"));
    expect(query.page_size).toBe(500);
  });

  it("clamps oversized page_size", () => {
    const query = readQuery(new URLSearchParams("page_size=9999"));
    expect(query.page_size).toBe(500);
  });

  it("defaults page_size to 10", () => {
    expect(readQuery(new URLSearchParams()).page_size).toBe(10);
  });
});

describe("filterKey", () => {
  it("changes when filters change but not cursor alone", () => {
    const base = readQuery(new URLSearchParams("cursor=abc&status=active"));
    const nextCursor = readQuery(new URLSearchParams("cursor=def&status=active"));
    const nextStatus = readQuery(new URLSearchParams("cursor=abc&status=draft"));
    expect(filterKey(base)).toBe(filterKey(nextCursor));
    expect(filterKey(base)).not.toBe(filterKey(nextStatus));
  });
});
