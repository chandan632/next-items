"use client";

import { useState } from "react";

import {
  renderColumnFilter,
  type RangeDraft,
} from "@/components/items/filters/registry";
import { COLUMNS } from "@/lib/columns";
import type { ColumnId, ItemQuery } from "@/lib/types";

type ItemsTableHeaderProps = {
  visibleColumns: ColumnId[];
  query: ItemQuery;
  rangeDraft: RangeDraft;
  setQuery: (patch: Partial<ItemQuery>, options?: { resetCursor?: boolean }) => void;
  updateRange: (field: keyof RangeDraft, value: string) => void;
  allPageSelected: boolean;
  somePageSelected: boolean;
  selectAllMatching: boolean;
  onTogglePage: () => void;
  onSort: (columnId: ColumnId) => void;
  onReorder: (fromId: ColumnId, toId: ColumnId) => void;
  showActions: boolean;
};

export function ItemsTableHeader({
  visibleColumns,
  query,
  rangeDraft,
  setQuery,
  updateRange,
  allPageSelected,
  somePageSelected,
  selectAllMatching,
  onTogglePage,
  onSort,
  onReorder,
  showActions,
}: ItemsTableHeaderProps) {
  const [dragColumn, setDragColumn] = useState<ColumnId | null>(null);
  const filterProps = { query, rangeDraft, setQuery, updateRange };

  return (
    <thead>
      <tr>
        <th className="check-col">
          <input
            type="checkbox"
            checked={allPageSelected || selectAllMatching}
            ref={(el) => {
              if (el) {
                el.indeterminate = somePageSelected && !selectAllMatching;
              }
            }}
            onChange={onTogglePage}
            aria-label="Select current page"
          />
        </th>
        {visibleColumns.map((columnId) => {
          const col = COLUMNS.find((c) => c.id === columnId)!;
          const sorted = query.sort_by === columnId;
          const ariaSort = sorted
            ? query.sort_order === "asc"
              ? "ascending"
              : "descending"
            : "none";
          return (
            <th
              key={columnId}
              draggable
              aria-sort={col.sortable ? ariaSort : undefined}
              onDragStart={() => setDragColumn(columnId)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (!dragColumn) return;
                onReorder(dragColumn, columnId);
                setDragColumn(null);
              }}
            >
              {col.sortable ? (
                <button
                  type="button"
                  className="sort-btn"
                  onClick={() => onSort(columnId)}
                >
                  {col.label}
                  {sorted ? (query.sort_order === "asc" ? " ↑" : " ↓") : ""}
                </button>
              ) : (
                col.label
              )}
            </th>
          );
        })}
        {showActions && <th>Actions</th>}
      </tr>
      <tr className="filter-row">
        <th />
        {visibleColumns.map((columnId) => {
          const col = COLUMNS.find((c) => c.id === columnId)!;
          const filter = renderColumnFilter(col.filter, filterProps);
          return <th key={columnId}>{filter}</th>;
        })}
        {showActions && <th />}
      </tr>
    </thead>
  );
}
