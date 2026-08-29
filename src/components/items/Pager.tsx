"use client";

type PagerProps = {
  page: number;
  totalPages: number;
  disabled: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export function Pager({ page, totalPages, disabled, onPrev, onNext }: PagerProps) {
  return (
    <footer className="pager">
      <button
        type="button"
        className="btn"
        disabled={disabled || page <= 1}
        onClick={onPrev}
      >
        Previous
      </button>
      <span className="muted">
        Page {totalPages === 0 ? 0 : page} of {totalPages}
      </span>
      <button
        type="button"
        className="btn"
        disabled={disabled || totalPages === 0 || page >= totalPages}
        onClick={onNext}
      >
        Next
      </button>
    </footer>
  );
}
