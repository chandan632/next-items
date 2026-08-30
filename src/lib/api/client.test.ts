import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  apiRequest,
  bindAuth,
  buildQueryString,
} from "@/lib/api/client";
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

describe("apiRequest force logout", () => {
  const clearSession = vi.fn();
  const assign = vi.fn();

  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");
    clearSession.mockReset();
    assign.mockReset();
    bindAuth({
      getAccessToken: () => "stale-token",
      getCsrfToken: () => null,
      setSession: () => {},
      clearSession,
    });
    vi.stubGlobal("fetch", vi.fn());
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { pathname: "/", assign },
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it.each([
    ["PRIVILEGES_CHANGED", "Your access level changed. Please sign in again."],
    ["ACCOUNT_INACTIVE", "Account is inactive. Please sign in again."],
  ] as const)(
    "clears session and redirects on %s without refresh retry",
    async (code, message) => {
      const fetchMock = vi.mocked(fetch);
      fetchMock.mockResolvedValue(
        new Response(
          JSON.stringify({
            success: false,
            error: { code, message },
          }),
          { status: 401, headers: { "Content-Type": "application/json" } },
        ),
      );

      await expect(apiRequest("/items/")).rejects.toMatchObject({
        message,
        status: 401,
        code,
      });

      expect(clearSession).toHaveBeenCalledTimes(1);
      expect(assign).toHaveBeenCalledWith("/login");
      expect(fetchMock).toHaveBeenCalledTimes(1);
    },
  );
});
