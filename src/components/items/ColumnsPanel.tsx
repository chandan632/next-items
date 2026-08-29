"use client";

import { COLUMNS } from "@/lib/columns";
import type { ColumnPrefs } from "@/lib/columnPrefs";
import type { ColumnId } from "@/lib/types";

type ColumnsPanelProps = {
  prefs: ColumnPrefs;
  onToggle: (id: ColumnId) => void;
};

export function ColumnsPanel({ prefs, onToggle }: ColumnsPanelProps) {
  return (
    <div className="panel">
      <strong>Visible columns</strong>
      <div className="column-checks">
        {COLUMNS.map((col) => (
          <label key={col.id} className="check">
            <input
              type="checkbox"
              checked={!prefs.hidden.includes(col.id)}
              onChange={() => onToggle(col.id)}
            />
            {col.label}
          </label>
        ))}
      </div>
      <p className="hint">Drag column headers to reorder.</p>
    </div>
  );
}
