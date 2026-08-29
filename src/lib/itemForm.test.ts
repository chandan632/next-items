import { describe, expect, it } from "vitest";

import {
  EMPTY_ITEM_FORM,
  formValuesToPayload,
  itemToFormValues,
  validateItemForm,
} from "@/lib/itemForm";
import type { Item } from "@/lib/types";

const sampleItem: Item = {
  id: "1",
  name: "Lamp",
  sku: "SKU-1",
  category: "home",
  status: "active",
  price: 12.5,
  quantity: 3,
  description: "Desk lamp",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-02T00:00:00Z",
};

describe("validateItemForm", () => {
  it("rejects empty name", () => {
    expect(validateItemForm({ ...EMPTY_ITEM_FORM, sku: "A", price: "1" })).toBe(
      "Name is required",
    );
  });

  it("rejects invalid price", () => {
    expect(
      validateItemForm({
        ...EMPTY_ITEM_FORM,
        name: "X",
        sku: "A",
        price: "-1",
        quantity: "1",
      }),
    ).toBe("Price must be a non-negative number");
  });

  it("accepts valid values", () => {
    expect(
      validateItemForm({
        ...EMPTY_ITEM_FORM,
        name: "X",
        sku: "A",
        price: "10",
        quantity: "2",
      }),
    ).toBeNull();
  });
});

describe("item form mapping", () => {
  it("maps item to form values", () => {
    expect(itemToFormValues(sampleItem)).toMatchObject({
      name: "Lamp",
      sku: "SKU-1",
      price: "12.5",
      quantity: "3",
    });
  });

  it("maps form values to payload", () => {
    expect(
      formValuesToPayload({
        ...EMPTY_ITEM_FORM,
        name: "  Lamp  ",
        sku: " sku-9 ",
        price: "9.99",
        quantity: "4",
        description: "  nice  ",
      }),
    ).toEqual({
      name: "Lamp",
      sku: "sku-9",
      category: "electronics",
      status: "active",
      price: 9.99,
      quantity: 4,
      description: "nice",
    });
  });
});
