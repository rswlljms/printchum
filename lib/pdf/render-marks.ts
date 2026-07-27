import type { PDFPage, PDFFont } from "pdf-lib";
import { rgb } from "pdf-lib";

import type { PhysicalRectangle } from "@/lib/pdf/render-model";
import {
  inchesToPdfPoints,
  topLeftToPdfCoordinates,
} from "@/lib/pdf/units";

export function renderPdfCuttingGuides(
  page: PDFPage,
  pageHeightPoints: number,
  rectangle: PhysicalRectangle,
): void {
  const x = inchesToPdfPoints(rectangle.xInches);
  const top = inchesToPdfPoints(rectangle.yInches);
  const width = inchesToPdfPoints(rectangle.widthInches);
  const height = inchesToPdfPoints(rectangle.heightInches);
  const y = pageHeightPoints - top - height;
  const length = 5;
  const color = rgb(0.12, 0.12, 0.12);
  const line = (
    start: { x: number; y: number },
    end: { x: number; y: number },
  ): void => {
    page.drawLine({ start, end, thickness: 0.5, color });
  };
  for (const edgeX of [x, x + width]) {
    line({ x: edgeX, y: y - length }, { x: edgeX, y: y + length });
    line(
      { x: edgeX, y: y + height - length },
      { x: edgeX, y: y + height + length },
    );
  }
  for (const edgeY of [y, y + height]) {
    line({ x: x - length, y: edgeY }, { x: x + length, y: edgeY });
    line(
      { x: x + width - length, y: edgeY },
      { x: x + width + length, y: edgeY },
    );
  }
}

export function renderPdfSizeLabel(
  page: PDFPage,
  pageHeightPoints: number,
  rectangle: PhysicalRectangle,
  label: string,
  font: PDFFont,
): void {
  const width = inchesToPdfPoints(rectangle.widthInches);
  const height = inchesToPdfPoints(rectangle.heightInches);
  const position = topLeftToPdfCoordinates(
    pageHeightPoints,
    inchesToPdfPoints(rectangle.xInches),
    inchesToPdfPoints(rectangle.yInches),
    height,
  );
  const fontSize = Math.max(6, Math.min(9, width / 12));
  const stripHeight = fontSize + 5;
  page.drawRectangle({
    x: position.x,
    y: position.y,
    width,
    height: stripHeight,
    color: rgb(1, 1, 1),
    opacity: 0.88,
  });
  const available = Math.max(width - 6, 0);
  let fitted = label;
  while (
    fitted.length > 0 &&
    font.widthOfTextAtSize(fitted, fontSize) > available
  ) {
    fitted = fitted.slice(0, -1);
  }
  const textWidth = font.widthOfTextAtSize(fitted, fontSize);
  page.drawText(fitted, {
    x: position.x + (width - textWidth) / 2,
    y: position.y + (stripHeight - fontSize) / 2 + 1,
    size: fontSize,
    font,
    color: rgb(0.08, 0.08, 0.08),
  });
}
