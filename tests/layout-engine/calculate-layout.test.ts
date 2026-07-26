import { describe, expect, it } from "vitest";

import { calculateLayout } from "@/lib/layout-engine/calculate-layout";
import { orientPaper } from "@/lib/layout-engine/paper-sizes";
import {
  LayoutCalculationError,
  type LayoutInput,
  type LayoutItem,
} from "@/lib/layout-engine/types";

const baseInput: LayoutInput = {
  paper: {
    widthInches: 8.5,
    heightInches: 11,
    orientation: "portrait",
  },
  marginInches: 0.25,
  horizontalSpacingInches: 0.125,
  verticalSpacingInches: 0.125,
  items: [
    {
      id: "two-by-two",
      widthInches: 2,
      heightInches: 2,
      quantity: 8,
      allowRotation: false,
    },
  ],
};

function itemsOverlap(first: LayoutItem, second: LayoutItem): boolean {
  return (
    first.xInches < second.xInches + second.widthInches &&
    first.xInches + first.widthInches > second.xInches &&
    first.yInches < second.yInches + second.heightInches &&
    first.yInches + first.heightInches > second.yInches
  );
}

describe("paper orientation", () => {
  it("normalizes portrait and landscape edges", () => {
    expect(orientPaper(11, 8.5, "portrait")).toEqual({
      widthInches: 8.5,
      heightInches: 11,
    });
    expect(orientPaper(8.5, 11, "landscape")).toEqual({
      widthInches: 11,
      heightInches: 8.5,
    });
  });
});

describe("calculateLayout", () => {
  it("respects margins and horizontal and vertical spacing", () => {
    const result = calculateLayout(baseInput);
    const [first, second, , fourth] = result.pages[0].items;

    expect(first.xInches).toBe(0.25);
    expect(first.yInches).toBe(0.25);
    expect(second.xInches).toBeCloseTo(2.375, 10);
    expect(fourth.xInches).toBe(0.25);
    expect(fourth.yInches).toBeCloseTo(2.375, 10);
  });

  it("packs mixed sizes without overlap", () => {
    const result = calculateLayout({
      ...baseInput,
      items: [
        { id: "small", widthInches: 1, heightInches: 1, quantity: 4, allowRotation: false },
        { id: "portrait", widthInches: 1.5, heightInches: 2, quantity: 5, allowRotation: true },
        { id: "large", widthInches: 2, heightInches: 2, quantity: 4, allowRotation: false },
      ],
    });

    for (const page of result.pages) {
      for (let index = 0; index < page.items.length; index += 1) {
        for (let otherIndex = index + 1; otherIndex < page.items.length; otherIndex += 1) {
          expect(itemsOverlap(page.items[index], page.items[otherIndex])).toBe(false);
        }
      }
    }
    expect(result.totalItems).toBe(13);
  });

  it("creates additional pages when the current page is full", () => {
    const result = calculateLayout({
      ...baseInput,
      items: [{ ...baseInput.items[0], quantity: 20 }],
    });

    expect(result.pages).toHaveLength(2);
    expect(result.pages[0].items).toHaveLength(15);
    expect(result.pages[1].items).toHaveLength(5);
    expect(result.totalItems).toBe(20);
  });

  it("uses rotation only when it is allowed and necessary", () => {
    const result = calculateLayout({
      paper: { widthInches: 4, heightInches: 6, orientation: "portrait" },
      marginInches: 0,
      horizontalSpacingInches: 0,
      verticalSpacingInches: 0,
      items: [
        { id: "row-filler", widthInches: 3, heightInches: 2, quantity: 1, allowRotation: false },
        { id: "rotated", widthInches: 2, heightInches: 1, quantity: 1, allowRotation: true },
      ],
    });

    expect(result.pages[0].items[1]).toMatchObject({
      sourceItemId: "rotated",
      rotation: 90,
      widthInches: 1,
      heightInches: 2,
    });
  });

  it("returns identical output for identical input", () => {
    expect(calculateLayout(baseInput)).toEqual(calculateLayout(baseInput));
  });

  it("rejects an oversized item instead of dropping it", () => {
    const calculateOversized = () =>
      calculateLayout({
        ...baseInput,
        items: [
          {
            id: "oversized",
            widthInches: 9,
            heightInches: 12,
            quantity: 1,
            allowRotation: true,
          },
        ],
      });

    expect(calculateOversized).toThrow(LayoutCalculationError);
    try {
      calculateOversized();
    } catch (error) {
      expect(error).toMatchObject({
        code: "ITEM_DOES_NOT_FIT",
        sourceItemId: "oversized",
      });
    }
  });

  it("rejects margins that remove the printable area", () => {
    expect(() =>
      calculateLayout({
        ...baseInput,
        marginInches: 5,
      }),
    ).toThrowError(/Margins leave no printable area/);
  });
});
