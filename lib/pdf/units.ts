import type { LayoutItem } from "@/lib/layout-engine/types";

export const PDF_POINTS_PER_INCH = 72;

export function inchesToPdfPoints(inches: number): number {
  return inches * PDF_POINTS_PER_INCH;
}

export function pdfPointsToInches(points: number): number {
  return points / PDF_POINTS_PER_INCH;
}

export function topLeftToPdfCoordinates(
  pageHeightPoints: number,
  xPoints: number,
  yPoints: number,
  itemHeightPoints: number,
): { x: number; y: number } {
  return {
    x: xPoints,
    y: pageHeightPoints - yPoints - itemHeightPoints,
  };
}

export function layoutItemToPdfRectangle(
  pageHeightPoints: number,
  item: Pick<
    LayoutItem,
    "xInches" | "yInches" | "widthInches" | "heightInches"
  >,
): { x: number; y: number; width: number; height: number } {
  const width = inchesToPdfPoints(item.widthInches);
  const height = inchesToPdfPoints(item.heightInches);
  const coordinates = topLeftToPdfCoordinates(
    pageHeightPoints,
    inchesToPdfPoints(item.xInches),
    inchesToPdfPoints(item.yInches),
    height,
  );
  return { ...coordinates, width, height };
}
