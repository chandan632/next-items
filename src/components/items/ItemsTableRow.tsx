"use client";

import { cellValue } from "@/lib/format";
import type { ColumnId, Item } from "@/lib/types";

type ItemsTableRowProps = {
  item: Item;
  visibleColumns: ColumnId[];
  checked: boolean;
  rowHeight: number;
  busyId: string | null;
  canEdit: boolean;
  onToggle: (id: string) => void;
  onEdit: (item: Item) => void;
  onArchive: (item: Item) => void;
  onDelete: (item: Item) => void;
};

export function ItemsTableRow({
  item,
  visibleColumns,
  checked,
  rowHeight,
  busyId,
  canEdit,
  onToggle,
  onEdit,
  onArchive,
  onDelete,
}: ItemsTableRowProps) {
  const rowBusy = busyId === item.id;

  return (
    <tr className={checked ? "selected" : undefined} style={{ height: rowHeight }}>
      <td className="check-col">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggle(item.id)}
          aria-label={`Select ${item.name}`}
        />
      </td>
      {visibleColumns.map((columnId) => (
        <td key={columnId}>{cellValue(item, columnId)}</td>
      ))}
      {canEdit && (
        <td className="actions">
          <button
            type="button"
            className="linkish"
            disabled={rowBusy || busyId !== null}
            onClick={() => onEdit(item)}
          >
            Edit
          </button>
          <button
            type="button"
            className="linkish"
            disabled={rowBusy || busyId !== null || item.status === "archived"}
            onClick={() => onArchive(item)}
          >
            Archive
          </button>
          <button
            type="button"
            className="linkish danger-text"
            disabled={rowBusy || busyId !== null}
            onClick={() => onDelete(item)}
          >
            Delete
          </button>
        </td>
      )}
    </tr>
  );
}
