import { afterEach, describe, expect, it, vi } from "vitest";

import { buildQueryString } from "@/lib/api/client";
import { exportUrl } from "@/lib/api/items";
import { QUERY_DEFAULTS } from "@/lib/queryParams";

describe("buildQueryString", () => {
  it("omits empty, null, and undefined values", () => {
    expect(
      buildQueryString({
        q: "lamp",
        category: "",
        status: undefined,
        page: 1,
        active: true,
        skip: null,
      }),
    ).toBe("q=lamp&page=1&active=true");
  });

  it("stringifies numbers and booleans", () => {
    expect(buildQueryString({ page_size: 50, select_all: false })).toBe(
      "page_size=50&select_all=false",
    );
  });
});

describe("exportUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("builds export URL with filters and select_all", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");
    const url = exportUrl(
      {
        ...QUERY_DEFAULTS,
        q: "desk",
        category: "home",
        status: "active",
        sort_by: "name",
        sort_order: "asc",
      },
      { selectAll: true },
    );

    expect(url.startsWith("http://api.test/api/v1/items/export?")).toBe(true);
    const qs = new URL(url).searchParams;
    expect(qs.get("q")).toBe("desk");
    expect(qs.get("category")).toBe("home");
    expect(qs.get("status")).toBe("active");
    expect(qs.get("sort_by")).toBe("name");
    expect(qs.get("sort_order")).toBe("asc");
    expect(qs.get("select_all")).toBe("true");
    expect(qs.has("ids")).toBe(false);
  });

  it("includes ids when not select-all", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");
    const url = exportUrl(QUERY_DEFAULTS, {
      selectAll: false,
      ids: ["a", "b"],
    });
    const qs = new URL(url).searchParams;
    expect(qs.get("select_all")).toBe("false");
    expect(qs.get("ids")).toBe("a,b");
  });
});
