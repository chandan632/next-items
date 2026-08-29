"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getTableRowHeight,
  getVirtualRange,
  TABLE_OVERSCAN,
  TABLE_ROW_HEIGHT,
  TABLE_VIEWPORT_ROWS,
  type VirtualRange,
} from "@/lib/virtualRange";

const DEFAULT_VIEWPORT = TABLE_VIEWPORT_ROWS * TABLE_ROW_HEIGHT;

export function useVirtualWindow(rowCount: number, resetKey: string | number) {
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(DEFAULT_VIEWPORT);
  const [rowHeight, setRowHeight] = useState(TABLE_ROW_HEIGHT);

  const scrollRef = useCallback((node: HTMLDivElement | null) => {
    setScrollEl(node);
  }, []);

  useEffect(() => {
    setRowHeight(getTableRowHeight());
  }, []);

  useEffect(() => {
    if (!scrollEl) return;

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        setScrollTop(scrollEl.scrollTop);
      });
    };
    scrollEl.addEventListener("scroll", onScroll, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      setViewportHeight(scrollEl.clientHeight || DEFAULT_VIEWPORT);
    });
    resizeObserver.observe(scrollEl);
    setViewportHeight(scrollEl.clientHeight || DEFAULT_VIEWPORT);
    setScrollTop(scrollEl.scrollTop);

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      scrollEl.removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
    };
  }, [scrollEl]);

  useEffect(() => {
    if (!scrollEl) return;
    scrollEl.scrollTop = 0;
    setScrollTop(0);
  }, [resetKey, scrollEl]);

  const range: VirtualRange = getVirtualRange(
    scrollTop,
    viewportHeight,
    rowCount,
    rowHeight,
    TABLE_OVERSCAN,
  );

  return {
    scrollRef,
    range,
    rowHeight,
    viewportStyle: { height: DEFAULT_VIEWPORT } as const,
  };
}
