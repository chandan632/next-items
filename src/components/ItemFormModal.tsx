"use client";

import { FormEvent, useEffect, useState } from "react";

import { Modal } from "@/components/ui/Modal";
import { CATEGORIES, STATUSES } from "@/lib/columns";
import {
  EMPTY_ITEM_FORM,
  formValuesToPayload,
  itemToFormValues,
  type ItemFormValues,
  validateItemForm,
} from "@/lib/itemForm";
import type { Item } from "@/lib/types";

type ItemFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  item?: Item | null;
  busy?: boolean;
  onClose: () => void;
  onSubmit: (values: ReturnType<typeof formValuesToPayload>) => Promise<void>;
};

export function ItemFormModal({
  open,
  mode,
  item,
  busy = false,
  onClose,
  onSubmit,
}: ItemFormModalProps) {
  const [values, setValues] = useState<ItemFormValues>(EMPTY_ITEM_FORM);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setValues(item ? itemToFormValues(item) : EMPTY_ITEM_FORM);
  }, [open, item]);

  function setField<K extends keyof ItemFormValues>(key: K, value: ItemFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const validationError = validateItemForm(values);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    try {
      await onSubmit(formValuesToPayload(values));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  return (
    <Modal
      open={open}
      title={mode === "create" ? "Add item" : "Edit item"}
      onClose={onClose}
      busy={busy}
    >
      <form className="item-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            className="input"
            value={values.name}
            onChange={(e) => setField("name", e.target.value)}
          />
        </label>
        <label>
          SKU
          <input
            className="input"
            value={values.sku}
            onChange={(e) => setField("sku", e.target.value)}
          />
        </label>
        <label>
          Category
          <select
            className="input"
            value={values.category}
            onChange={(e) =>
              setField("category", e.target.value as ItemFormValues["category"])
            }
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select
            className="input"
            value={values.status}
            onChange={(e) =>
              setField("status", e.target.value as ItemFormValues["status"])
            }
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label>
          Price
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={values.price}
            onChange={(e) => setField("price", e.target.value)}
          />
        </label>
        <label>
          Quantity
          <input
            className="input"
            type="number"
            min={0}
            step={1}
            value={values.quantity}
            onChange={(e) => setField("quantity", e.target.value)}
          />
        </label>
        <label className="full">
          Description
          <textarea
            className="input"
            rows={3}
            value={values.description}
            onChange={(e) => setField("description", e.target.value)}
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="btn" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="btn primary" disabled={busy}>
            {busy ? "Saving…" : mode === "create" ? "Create" : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
