"use client";

import { CATEGORIES, STATUSES } from "@/lib/columns";
import type { ItemQuery } from "@/lib/types";

export type RangeDraft = {
  min_price: string;
  max_price: string;
  min_quantity: string;
  max_quantity: string;
};

type FilterProps = {
  query: ItemQuery;
  rangeDraft: RangeDraft;
  setQuery: (patch: Partial<ItemQuery>, options?: { resetCursor?: boolean }) => void;
  updateRange: (field: keyof RangeDraft, value: string) => void;
};

function CategoryFilter({ query, setQuery }: FilterProps) {
  return (
    <select
      className="input compact"
      value={query.category}
      onChange={(e) => setQuery({ category: e.target.value }, { resetCursor: true })}
      aria-label="Filter category"
    >
      <option value="">All</option>
      {CATEGORIES.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}

function StatusFilter({ query, setQuery }: FilterProps) {
  return (
    <select
      className="input compact"
      value={query.status}
      onChange={(e) => setQuery({ status: e.target.value }, { resetCursor: true })}
      aria-label="Filter status"
    >
      <option value="">All</option>
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}

function PriceFilter({ rangeDraft, updateRange }: FilterProps) {
  return (
    <div className="range">
      <input
        className="input compact"
        type="number"
        min={0}
        placeholder="Min"
        value={rangeDraft.min_price}
        onChange={(e) => updateRange("min_price", e.target.value)}
        aria-label="Min price"
      />
      <input
        className="input compact"
        type="number"
        min={0}
        placeholder="Max"
        value={rangeDraft.max_price}
        onChange={(e) => updateRange("max_price", e.target.value)}
        aria-label="Max price"
      />
    </div>
  );
}

function QuantityFilter({ rangeDraft, updateRange }: FilterProps) {
  return (
    <div className="range">
      <input
        className="input compact"
        type="number"
        min={0}
        placeholder="Min"
        value={rangeDraft.min_quantity}
        onChange={(e) => updateRange("min_quantity", e.target.value)}
        aria-label="Min quantity"
      />
      <input
        className="input compact"
        type="number"
        min={0}
        placeholder="Max"
        value={rangeDraft.max_quantity}
        onChange={(e) => updateRange("max_quantity", e.target.value)}
        aria-label="Max quantity"
      />
    </div>
  );
}

const FILTER_COMPONENTS = {
  category: CategoryFilter,
  status: StatusFilter,
  price: PriceFilter,
  quantity: QuantityFilter,
} as const;

export function renderColumnFilter(
  filter: keyof typeof FILTER_COMPONENTS | "text" | undefined,
  props: FilterProps,
) {
  if (!filter || filter === "text") return null;
  const Component = FILTER_COMPONENTS[filter];
  return <Component {...props} />;
}
