import { describe, expect, it } from "vitest";

import { parseQueryParams, QUERY_DEFAULTS, snapPageSize } from "@/lib/queryParams";

describe("snapPageSize", () => {
  it("keeps valid options", () => {
    expect(snapPageSize(10)).toBe(10);
    expect(snapPageSize(500)).toBe(500);
  });

  it("snaps oversized values to nearest option", () => {
    expect(snapPageSize(9999)).toBe(500);
  });

  it("snaps in-between values to nearest option", () => {
    expect(snapPageSize(25)).toBe(10);
    expect(snapPageSize(40)).toBe(50);
    expect(snapPageSize(60)).toBe(50);
  });

  it("defaults invalid or non-finite sizes", () => {
    expect(snapPageSize(0)).toBe(QUERY_DEFAULTS.page_size);
    expect(snapPageSize(-5)).toBe(QUERY_DEFAULTS.page_size);
    expect(snapPageSize(Number.NaN)).toBe(QUERY_DEFAULTS.page_size);
  });
});

describe("parseQueryParams", () => {
  it("rejects invalid sort_by / category / status", () => {
    const query = parseQueryParams(
      new URLSearchParams("sort_by=nope&category=cars&status=bogus"),
    );
    expect(query.sort_by).toBe(QUERY_DEFAULTS.sort_by);
    expect(query.category).toBe("");
    expect(query.status).toBe("");
  });

  it("snaps invalid page_size to a valid option", () => {
    const query = parseQueryParams(new URLSearchParams("page_size=9999"));
    expect(query.page_size).toBe(500);
  });

  it("accepts valid sort_by / category / status", () => {
    const query = parseQueryParams(
      new URLSearchParams("sort_by=name&category=home&status=active&page_size=50"),
    );
    expect(query.sort_by).toBe("name");
    expect(query.category).toBe("home");
    expect(query.status).toBe("active");
    expect(query.page_size).toBe(50);
  });

  it("defaults missing params", () => {
    const query = parseQueryParams(new URLSearchParams());
    expect(query).toMatchObject(QUERY_DEFAULTS);
  });

  it("parses cursor from the URL", () => {
    const query = parseQueryParams(new URLSearchParams("cursor=abc123"));
    expect(query.cursor).toBe("abc123");
  });
});
