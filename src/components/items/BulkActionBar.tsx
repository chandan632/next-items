"use client";

type BulkActionBarProps = {
  selectedCount: number;
  selectAllMatching: boolean;
  total: number;
  busy: boolean;
  canEdit: boolean;
  onSelectAllMatching: () => void;
  onClear: () => void;
  onSetActive: () => void;
  onArchive: () => void;
  onAdjustQty: () => void;
  onDelete: () => void;
  onExportSelected: () => void;
};

export function BulkActionBar({
  selectedCount,
  selectAllMatching,
  total,
  busy,
  canEdit,
  onSelectAllMatching,
  onClear,
  onSetActive,
  onArchive,
  onAdjustQty,
  onDelete,
  onExportSelected,
}: BulkActionBarProps) {
  if (selectedCount <= 0) return null;

  return (
    <div className="bulk-bar">
      <span>
        {selectAllMatching
          ? `${selectedCount.toLocaleString()} matching records selected`
          : `${selectedCount} selected`}
      </span>
      {!selectAllMatching && total > selectedCount && (
        <button type="button" className="linkish" onClick={onSelectAllMatching}>
          Select all {total.toLocaleString()} matching
        </button>
      )}
      {selectAllMatching && (
        <button type="button" className="linkish" onClick={onClear}>
          Clear selection
        </button>
      )}
      <div className="bulk-actions">
        {canEdit && (
          <>
            <button type="button" className="btn" disabled={busy} onClick={onSetActive}>
              Set active
            </button>
            <button type="button" className="btn" disabled={busy} onClick={onArchive}>
              Archive
            </button>
            <button type="button" className="btn" disabled={busy} onClick={onAdjustQty}>
              +10 qty
            </button>
            <button type="button" className="btn danger" disabled={busy} onClick={onDelete}>
              Delete
            </button>
          </>
        )}
        <button type="button" className="btn" onClick={onExportSelected}>
          Export selected
        </button>
      </div>
    </div>
  );
}
