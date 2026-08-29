import type { Item, ItemCategory, ItemStatus } from "./types";

export type ItemFormValues = {
  name: string;
  sku: string;
  category: ItemCategory;
  status: ItemStatus;
  price: string;
  quantity: string;
  description: string;
};

export const EMPTY_ITEM_FORM: ItemFormValues = {
  name: "",
  sku: "",
  category: "electronics",
  status: "active",
  price: "",
  quantity: "0",
  description: "",
};

export function itemToFormValues(item: Item): ItemFormValues {
  return {
    name: item.name,
    sku: item.sku,
    category: item.category,
    status: item.status,
    price: String(item.price),
    quantity: String(item.quantity),
    description: item.description ?? "",
  };
}

export function formValuesToPayload(values: ItemFormValues) {
  return {
    name: values.name.trim(),
    sku: values.sku.trim(),
    category: values.category,
    status: values.status,
    price: Number(values.price),
    quantity: Number(values.quantity),
    description: values.description.trim() || null,
  };
}

export function validateItemForm(values: ItemFormValues): string | null {
  if (!values.name.trim()) return "Name is required";
  if (!values.sku.trim()) return "SKU is required";
  if (values.price === "" || Number.isNaN(Number(values.price)) || Number(values.price) < 0) {
    return "Price must be a non-negative number";
  }
  if (
    values.quantity === "" ||
    Number.isNaN(Number(values.quantity)) ||
    Number(values.quantity) < 0 ||
    !Number.isInteger(Number(values.quantity))
  ) {
    return "Quantity must be a non-negative integer";
  }
  return null;
}
