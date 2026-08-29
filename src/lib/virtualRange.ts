export const TABLE_ROW_HEIGHT = 41;
export const TABLE_FILTER_OFFSET = 37;
export const TABLE_OVERSCAN = 6;
export const TABLE_VIEWPORT_ROWS = 12;

export type VirtualRange = {
  start: number;
  end: number;
  paddingTop: number;
  paddingBottom: number;
};

function readCssPx(name: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!raw) return fallback;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
}

export function getTableRowHeight(): number {
  return readCssPx("--table-row-height", TABLE_ROW_HEIGHT);
}

export function getTableFilterOffset(): number {
  return readCssPx("--table-filter-offset", TABLE_FILTER_OFFSET);
}

export function getVirtualRange(
  scrollTop: number,
  viewportHeight: number,
  rowCount: number,
  rowHeight = TABLE_ROW_HEIGHT,
  overscan = TABLE_OVERSCAN,
): VirtualRange {
  if (rowCount <= 0) {
    return { start: 0, end: 0, paddingTop: 0, paddingBottom: 0 };
  }

  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const visibleCount = Math.ceil(viewportHeight / rowHeight) + overscan * 2;
  const end = Math.min(rowCount, start + visibleCount);

  return {
    start,
    end,
    paddingTop: start * rowHeight,
    paddingBottom: Math.max(0, (rowCount - end) * rowHeight),
  };
}
