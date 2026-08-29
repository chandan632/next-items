import { describe, expect, it } from "vitest";

import {
  defaultColumnPrefs,
  moveColumn,
  toggleHiddenColumn,
} from "@/lib/columnPrefs";

describe("columnPrefs", () => {
  it("hides a column", () => {
    const next = toggleHiddenColumn(defaultColumnPrefs(), "sku");
    expect(next.hidden).toContain("sku");
  });

  it("reorders columns", () => {
    const next = moveColumn(defaultColumnPrefs(), "sku", "name");
    expect(next.order[0]).toBe("sku");
    expect(next.order[1]).toBe("name");
  });
});
