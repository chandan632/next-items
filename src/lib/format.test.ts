import { describe, expect, it } from "vitest";

import { cellValue, formatMoney } from "@/lib/format";
import type { Item } from "@/lib/types";

const item: Item = {
  id: "1",
  name: "Lamp",
  sku: "SKU-1",
  category: "home",
  status: "active",
  price: 12.5,
  quantity: 3,
  description: null,
  created_at: "2026-01-15T00:00:00Z",
  updated_at: "2026-01-16T00:00:00Z",
};

describe("format helpers", () => {
  it("formats money", () => {
    expect(formatMoney(12.5)).toContain("12.50");
  });

  it("formats cell values by column", () => {
    expect(cellValue(item, "name")).toBe("Lamp");
    expect(cellValue(item, "price")).toContain("12.50");
  });
});
