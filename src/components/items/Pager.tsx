"use client";

type PagerProps = {
  total: number;
  pageSize: number;
  hasPrev: boolean;
  hasMore: boolean;
  disabled: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export function Pager({
  total,
  pageSize,
  hasPrev,
  hasMore,
  disabled,
  onPrev,
  onNext,
}: PagerProps) {
  return (
    <footer className="pager">
      <button
        type="button"
        className="btn"
        disabled={disabled || !hasPrev}
        onClick={onPrev}
      >
        Previous
      </button>
      <span className="muted">
        {total === 0 ? "No items" : `${total.toLocaleString()} total`}
        {total > 0 ? ` · showing up to ${pageSize}` : ""}
      </span>
      <button
        type="button"
        className="btn"
        disabled={disabled || !hasMore}
        onClick={onNext}
      >
        Next
      </button>
    </footer>
  );
}
