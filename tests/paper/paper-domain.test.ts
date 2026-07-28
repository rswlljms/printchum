import { describe, expect, it } from "vitest";

import {
  convertMeasurement,
  fromInches,
  toInches,
} from "@/lib/paper/conversions";
import {
  createPaperSettingsFromPreset,
  findPaperPreset,
  paperPresets,
} from "@/lib/paper/presets";
import { calculatePrintableArea } from "@/lib/paper/printable-area";
import { paperSettingsSchema } from "@/lib/paper/schemas";

describe("paper domain", () => {
  it("defines every required standard preset once", () => {
    expect(paperPresets.map((preset) => preset.id)).toEqual([
      "letter",
      "legal",
      "a4",
      "a3",
      "4r",
      "5r",
      "custom",
    ]);
    expect(findPaperPreset("letter")).toMatchObject({
      width: 8.5,
      height: 11,
      unit: "in",
    });
    expect(findPaperPreset("legal")).toMatchObject({
      width: 8,
      height: 13,
      unit: "in",
    });
    expect(findPaperPreset("a4")).toMatchObject({
      width: 210,
      height: 297,
      unit: "mm",
    });
    expect(findPaperPreset("a3")).toMatchObject({
      width: 297,
      height: 420,
      unit: "mm",
    });
    expect(findPaperPreset("4r")).toMatchObject({
      width: 4,
      height: 6,
      unit: "in",
    });
    expect(findPaperPreset("5r")).toMatchObject({
      width: 5,
      height: 7,
      unit: "in",
    });
    expect(
      paperPresets
        .filter((preset) => preset.id !== "custom")
        .map((preset) => preset.description),
    ).toEqual([
      "8.5 × 11 inches",
      "8 × 13 inches",
      "210 × 297 millimeters",
      "297 × 420 millimeters",
      "4 × 6 inches",
      "5 × 7 inches",
    ]);
  });

  it("centralizes physically equivalent unit conversion", () => {
    expect(toInches(25.4, "mm")).toBeCloseTo(1, 12);
    expect(fromInches(1, "cm")).toBeCloseTo(2.54, 12);
    expect(convertMeasurement(8.5, "in", "cm")).toBeCloseTo(21.59, 12);
  });

  it("calculates portrait and landscape printable areas without mutating source dimensions", () => {
    const preset = findPaperPreset("letter");
    expect(preset).toBeDefined();
    const portrait = createPaperSettingsFromPreset(preset!);
    const landscape = { ...portrait, orientation: "landscape" as const };

    expect(calculatePrintableArea(portrait)).toMatchObject({
      paperWidthInches: 8.5,
      paperHeightInches: 11,
      printableWidthInches: 8,
      printableHeightInches: 10.5,
      isValid: true,
    });
    expect(calculatePrintableArea(landscape)).toMatchObject({
      paperWidthInches: 11,
      paperHeightInches: 8.5,
      printableWidthInches: 10.5,
      printableHeightInches: 8,
      isValid: true,
    });
    expect(landscape.width).toBe(8.5);
    expect(landscape.height).toBe(11);
  });

  it("rejects invalid printable areas and excessive spacing", () => {
    const preset = findPaperPreset("4r");
    expect(preset).toBeDefined();
    const paper = createPaperSettingsFromPreset(preset!);
    const invalidMargin = { ...paper, margin: 2 };

    expect(calculatePrintableArea(invalidMargin)).toMatchObject({
      isValid: false,
      error: "The current margin leaves no printable area.",
    });
    expect(
      paperSettingsSchema.safeParse({
        ...paper,
        horizontalSpacing: 11,
      }).success,
    ).toBe(false);
    expect(
      paperSettingsSchema.safeParse({
        ...paper,
        verticalSpacing: -1,
      }).success,
    ).toBe(false);
  });
});
