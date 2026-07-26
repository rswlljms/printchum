import { describe, expect, it } from "vitest";

import {
  calculateLayoutFromMeasurements,
} from "@/lib/layout-engine/calculate-layout";
import { normalizeLayoutInput } from "@/lib/layout-engine/normalize-layout-input";
import type { MeasuredLayoutInput } from "@/lib/layout-engine/types";

const measuredInput: MeasuredLayoutInput = {
  paper: {
    width: 210,
    height: 297,
    unit: "mm",
    orientation: "portrait",
  },
  margin: { value: 0.5, unit: "cm" },
  horizontalSpacing: { value: 3, unit: "mm" },
  verticalSpacing: { value: 0.125, unit: "in" },
  items: [
    {
      id: "passport",
      width: 3.5,
      height: 4.5,
      unit: "cm",
      quantity: 4,
      allowRotation: false,
    },
  ],
};

describe("normalizeLayoutInput", () => {
  it("normalizes paper, margins, spacing, and items to inches", () => {
    const normalized = normalizeLayoutInput(measuredInput);

    expect(normalized.paper.widthInches).toBeCloseTo(210 / 25.4, 10);
    expect(normalized.paper.heightInches).toBeCloseTo(297 / 25.4, 10);
    expect(normalized.marginInches).toBeCloseTo(0.5 / 2.54, 10);
    expect(normalized.horizontalSpacingInches).toBeCloseTo(3 / 25.4, 10);
    expect(normalized.verticalSpacingInches).toBe(0.125);
    expect(normalized.items[0].widthInches).toBeCloseTo(3.5 / 2.54, 10);
    expect(normalized.items[0].heightInches).toBeCloseTo(4.5 / 2.54, 10);
  });

  it("calculates a layout directly from mixed-unit measurements", () => {
    const result = calculateLayoutFromMeasurements(measuredInput);

    expect(result.totalItems).toBe(4);
    expect(result.placedItems).toBe(4);
    expect(result.unplacedItems).toEqual([]);
    expect(result.pages).toHaveLength(1);
  });
});
