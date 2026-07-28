import { describe, expect, it } from "vitest";

import {
  inchesToPdfPoints,
  layoutItemToPdfRectangle,
  pdfPointsToInches,
  topLeftToPdfCoordinates,
} from "@/lib/pdf/units";

describe("PDF units and geometry", () => {
  it("converts inches and PDF points", () => {
    expect(inchesToPdfPoints(8.5)).toBe(612);
    expect(pdfPointsToInches(792)).toBe(11);
  });

  it.each([
    ["Letter", 8.5, 11, 612, 792],
    ["Legal", 8, 13, 576, 936],
    ["4R", 4, 6, 288, 432],
  ])(
    "creates exact %s page dimensions",
    (_name, width, height, widthPoints, heightPoints) => {
      expect(inchesToPdfPoints(width)).toBe(widthPoints);
      expect(inchesToPdfPoints(height)).toBe(heightPoints);
    },
  );

  it("creates accurate A4 dimensions", () => {
    expect(inchesToPdfPoints(210 / 25.4)).toBeCloseTo(595.276, 3);
    expect(inchesToPdfPoints(297 / 25.4)).toBeCloseTo(841.89, 2);
  });

  it("converts top-left coordinates to the PDF bottom-left origin", () => {
    expect(topLeftToPdfCoordinates(792, 18, 36, 144)).toEqual({
      x: 18,
      y: 612,
    });
  });

  it("converts a LayoutResult item rectangle without recalculating placement", () => {
    expect(
      layoutItemToPdfRectangle(792, {
        xInches: 0.25,
        yInches: 0.5,
        widthInches: 2,
        heightInches: 3,
      }),
    ).toEqual({
      x: 18,
      y: 540,
      width: 144,
      height: 216,
    });
  });
});
