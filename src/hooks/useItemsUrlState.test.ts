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
  it("changes when filters change but not page alone", () => {
    const base = readQuery(new URLSearchParams("page=1&status=active"));
    const nextPage = readQuery(new URLSearchParams("page=2&status=active"));
    const nextStatus = readQuery(new URLSearchParams("page=1&status=draft"));
    expect(filterKey(base)).toBe(filterKey(nextPage));
    expect(filterKey(base)).not.toBe(filterKey(nextStatus));
  });
});
