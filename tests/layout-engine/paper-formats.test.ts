import { describe, expect, it } from "vitest";

import {
  calculateLayout,
  calculateLayoutFromMeasurements,
} from "@/lib/layout-engine/calculate-layout";
import type {
  LayoutInput,
  MeasuredLayoutInput,
} from "@/lib/layout-engine/types";

function createTwoByTwoInput(
  widthInches: number,
  heightInches: number,
  quantity: number,
  orientation: "portrait" | "landscape" = "portrait",
): LayoutInput {
  return {
    paper: { widthInches, heightInches, orientation },
    marginInches: 0.25,
    horizontalSpacingInches: 0.125,
    verticalSpacingInches: 0.125,
    items: [
      {
        id: "two-by-two",
        widthInches: 2,
        heightInches: 2,
        quantity,
        allowRotation: false,
      },
    ],
  };
}

function createA4Input(
  quantity: number,
  orientation: "portrait" | "landscape",
): MeasuredLayoutInput {
  return {
    paper: { width: 210, height: 297, unit: "mm", orientation },
    margin: { value: 5, unit: "mm" },
    horizontalSpacing: { value: 3, unit: "mm" },
    verticalSpacing: { value: 3, unit: "mm" },
    items: [
      {
        id: "passport",
        width: 35,
        height: 45,
        unit: "mm",
        quantity,
        allowRotation: false,
      },
    ],
  };
}

describe("standard paper formats", () => {
  it("lays out Letter paper with deterministic overflow", () => {
    const result = calculateLayout(createTwoByTwoInput(8.5, 11, 20));

    expect(result.pages.map((page) => page.items.length)).toEqual([15, 5]);
    expect(result.totalItems).toBe(20);
    expect(result.unplacedItems).toEqual([]);
  });

  it("uses Philippine Legal paper dimensions", () => {
    const result = calculateLayout(createTwoByTwoInput(8, 13, 16));

    expect(result.pages.map((page) => page.items.length)).toEqual([15, 1]);
  });

  it("normalizes and lays out portrait A4 paper in millimeters", () => {
    const result = calculateLayoutFromMeasurements(createA4Input(31, "portrait"));

    expect(result.pages.map((page) => page.items.length)).toEqual([30, 1]);
  });

  it("changes capacity deterministically for landscape A4", () => {
    const portrait = calculateLayoutFromMeasurements(createA4Input(29, "portrait"));
    const landscape = calculateLayoutFromMeasurements(createA4Input(29, "landscape"));

    expect(portrait.pages).toHaveLength(1);
    expect(landscape.pages.map((page) => page.items.length)).toEqual([28, 1]);
  });
});
