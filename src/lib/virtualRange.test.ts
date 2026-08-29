import { describe, expect, it } from "vitest";

import { getVirtualRange } from "@/lib/virtualRange";

describe("getVirtualRange", () => {
  it("returns empty range for no rows", () => {
    expect(getVirtualRange(0, 400, 0)).toEqual({
      start: 0,
      end: 0,
      paddingTop: 0,
      paddingBottom: 0,
    });
  });

  it("includes overscan above and below", () => {
    const range = getVirtualRange(410, 492, 500, 41, 6);
    expect(range.start).toBe(Math.max(0, 10 - 6));
    expect(range.end).toBeLessThanOrEqual(500);
    expect(range.paddingTop).toBe(range.start * 41);
    expect(range.paddingBottom).toBe((500 - range.end) * 41);
  });

  it("clamps to list bounds", () => {
    const range = getVirtualRange(0, 492, 8, 41, 6);
    expect(range.start).toBe(0);
    expect(range.end).toBe(8);
    expect(range.paddingBottom).toBe(0);
  });
});
