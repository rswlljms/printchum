import { describe, expect, it } from "vitest";

import { calculateLayout } from "@/lib/layout-engine/calculate-layout";
import { orientPaper } from "@/lib/layout-engine/paper-sizes";
import type {
  LayoutInput,
  LayoutItem,
} from "@/lib/layout-engine/types";

const EPSILON = 1e-9;

function overlaps(first: LayoutItem, second: LayoutItem): boolean {
  return (
    first.xInches < second.xInches + second.widthInches - EPSILON &&
    first.xInches + first.widthInches > second.xInches + EPSILON &&
    first.yInches < second.yInches + second.heightInches - EPSILON &&
    first.yInches + first.heightInches > second.yInches + EPSILON
  );
}

function expectValidPlacement(input: LayoutInput): void {
  const result = calculateLayout(input);
  const paper = orientPaper(
    input.paper.widthInches,
    input.paper.heightInches,
    input.paper.orientation,
  );

  for (const page of result.pages) {
    for (const item of page.items) {
      expect(item.pageIndex).toBe(page.pageIndex);
      expect(item.xInches).toBeGreaterThanOrEqual(input.marginInches - EPSILON);
      expect(item.yInches).toBeGreaterThanOrEqual(input.marginInches - EPSILON);
      expect(item.xInches + item.widthInches).toBeLessThanOrEqual(
        paper.widthInches - input.marginInches + EPSILON,
      );
      expect(item.yInches + item.heightInches).toBeLessThanOrEqual(
        paper.heightInches - input.marginInches + EPSILON,
      );
    }

    for (let index = 0; index < page.items.length; index += 1) {
      for (
        let comparisonIndex = index + 1;
        comparisonIndex < page.items.length;
        comparisonIndex += 1
      ) {
        expect(overlaps(page.items[index], page.items[comparisonIndex])).toBe(false);
      }
    }
  }
}

const complexInput: LayoutInput = {
  paper: {
    widthInches: 11,
    heightInches: 8.5,
    orientation: "landscape",
  },
  marginInches: 0.3,
  horizontalSpacingInches: 0.15,
  verticalSpacingInches: 0.2,
  items: [
    { id: "square", widthInches: 2, heightInches: 2, quantity: 17, allowRotation: false },
    { id: "portrait", widthInches: 1.4, heightInches: 1.9, quantity: 23, allowRotation: true },
    { id: "wide", widthInches: 2.8, heightInches: 1.2, quantity: 11, allowRotation: true },
  ],
};

describe("layout invariants", () => {
  it("keeps a large mixed, multi-page layout inside bounds without overlap", () => {
    const result = calculateLayout(complexInput);

    expect(result.pages.length).toBeGreaterThan(1);
    expect(result.totalItems).toBe(51);
    expect(result.placedItems).toBe(51);
    expect(result.unplacedItems).toEqual([]);
    expectValidPlacement(complexInput);
  });

  it("expands quantities with stable IDs in declared item order", () => {
    const result = calculateLayout({
      ...complexInput,
      items: [
        { id: "first", widthInches: 1, heightInches: 1, quantity: 3, allowRotation: false },
        { id: "second", widthInches: 1, heightInches: 1, quantity: 2, allowRotation: false },
      ],
    });

    expect(result.pages.flatMap((page) => page.items.map((item) => item.id))).toEqual([
      "first-1",
      "first-2",
      "first-3",
      "second-1",
      "second-2",
    ]);
  });

  it("returns no empty page when every item is oversized", () => {
    const result = calculateLayout({
      paper: { widthInches: 4, heightInches: 6, orientation: "portrait" },
      marginInches: 0.25,
      horizontalSpacingInches: 0,
      verticalSpacingInches: 0,
      items: [
        { id: "oversized", widthInches: 5, heightInches: 7, quantity: 3, allowRotation: true },
      ],
    });

    expect(result.pages).toEqual([]);
    expect(result.totalItems).toBe(3);
    expect(result.placedItems).toBe(0);
    expect(result.unplacedItems).toHaveLength(3);
    expect(result.utilizationPercent).toBe(0);
  });

  it("is deterministic across repeated complex calculations", () => {
    const expected = JSON.stringify(calculateLayout(complexInput));

    for (let iteration = 0; iteration < 10; iteration += 1) {
      expect(JSON.stringify(calculateLayout(complexInput))).toBe(expected);
    }
  });
});
