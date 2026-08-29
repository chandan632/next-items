"use client";

import { PAGE_SIZE_OPTIONS } from "@/lib/columns";

type ItemsToolbarProps = {
  searchInput: string;
  onSearchChange: (value: string) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  onReset: () => void;
  onRefresh: () => void;
  refreshing: boolean;
  initialLoading: boolean;
  onExportAll: () => void;
  onToggleColumns: () => void;
  canEdit: boolean;
  canAdmin: boolean;
  onAdd: () => void;
  onSeed?: () => void;
  onLogout: () => void;
  userEmail?: string;
  recordsLabel: string;
};

export function ItemsToolbar({
  searchInput,
  onSearchChange,
  pageSize,
  onPageSizeChange,
  onReset,
  onRefresh,
  refreshing,
  initialLoading,
  onExportAll,
  onToggleColumns,
  canEdit,
  canAdmin,
  onAdd,
  onSeed,
  onLogout,
  userEmail,
  recordsLabel,
}: ItemsToolbarProps) {
  return (
    <>
      <header className="page-header">
        <div>
          <h1>Items</h1>
          <p className="muted">
            {recordsLabel}
            {userEmail ? ` · ${userEmail}` : ""}
          </p>
        </div>
        <div className="header-actions">
          {canEdit && (
            <button type="button" className="btn primary" onClick={onAdd}>
              Add item
            </button>
          )}
          {canAdmin && onSeed && (
            <button type="button" className="btn" onClick={onSeed}>
              Seed
            </button>
          )}
          <button
            type="button"
            className="btn"
            onClick={onRefresh}
            disabled={initialLoading || refreshing}
          >
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
          <button type="button" className="btn" onClick={onExportAll}>
            Export all
          </button>
          <button type="button" className="btn" onClick={onToggleColumns}>
            Columns
          </button>
          <button type="button" className="btn" onClick={onLogout}>
            Log out
          </button>
        </div>
      </header>

      <div className="toolbar">
        <input
          className="input search"
          type="search"
          placeholder="Search name, SKU, description…"
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Global search"
        />
        <label className="page-size">
          <span className="muted">Rows</span>
          <select
            className="input"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            aria-label="Page size"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn" onClick={onReset}>
          Reset
        </button>
      </div>
    </>
  );
}
