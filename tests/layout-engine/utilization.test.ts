import { describe, expect, it } from "vitest";

import type { LayoutPage } from "@/lib/layout-engine/types";
import { calculateUtilizationPercent } from "@/lib/layout-engine/utilization";

describe("calculateUtilizationPercent", () => {
  it("returns zero for an empty result", () => {
    expect(calculateUtilizationPercent([], 8, 10.5)).toBe(0);
  });

  it("uses printable area across every page", () => {
    const pages: LayoutPage[] = [
      {
        pageIndex: 0,
        items: [
          {
            id: "item-1",
            sourceItemId: "item",
            pageIndex: 0,
            xInches: 0,
            yInches: 0,
            widthInches: 2,
            heightInches: 2,
            rotation: 0,
          },
        ],
      },
      {
        pageIndex: 1,
        items: [
          {
            id: "item-2",
            sourceItemId: "item",
            pageIndex: 1,
            xInches: 0,
            yInches: 0,
            widthInches: 2,
            heightInches: 2,
            rotation: 0,
          },
        ],
      },
    ];

    expect(calculateUtilizationPercent(pages, 4, 4)).toBe(25);
  });
});
