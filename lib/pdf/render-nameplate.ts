import {
  degrees,
  type PDFPage,
  type PDFFont,
  rgb,
} from "pdf-lib";

import type { NameplateSettings } from "@/lib/nameplates/types";
import type { PhysicalRectangle } from "@/lib/pdf/render-model";
import {
  inchesToPdfPoints,
  topLeftToPdfCoordinates,
} from "@/lib/pdf/units";

function parseHexColor(color: string): ReturnType<typeof rgb> {
  const normalized = /^#[0-9a-f]{6}$/i.test(color) ? color.slice(1) : "000000";
  return rgb(
    Number.parseInt(normalized.slice(0, 2), 16) / 255,
    Number.parseInt(normalized.slice(2, 4), 16) / 255,
    Number.parseInt(normalized.slice(4, 6), 16) / 255,
  );
}

export function fitTextToWidth(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
): string {
  const safeText = [...text]
    .map((character) => {
      try {
        font.encodeText(character);
        return character;
      } catch {
        return "?";
      }
    })
    .join("");
  if (!safeText || font.widthOfTextAtSize(safeText, fontSize) <= maxWidth) {
    return safeText;
  }
  const ellipsis = "...";
  if (font.widthOfTextAtSize(ellipsis, fontSize) > maxWidth) {
    return "";
  }
  let visible = safeText;
  while (
    visible.length > 0 &&
    font.widthOfTextAtSize(`${visible}${ellipsis}`, fontSize) > maxWidth
  ) {
    visible = visible.slice(0, -1);
  }
  return `${visible}${ellipsis}`;
}

export function renderPdfNameplate(
  page: PDFPage,
  pageHeightPoints: number,
  rectangle: PhysicalRectangle,
  settings: NameplateSettings,
  regularFont: PDFFont,
  boldFont: PDFFont,
  rotation: 0 | 90,
): void {
  const width = inchesToPdfPoints(rectangle.widthInches);
  const height = inchesToPdfPoints(rectangle.heightInches);
  const position = topLeftToPdfCoordinates(
    pageHeightPoints,
    inchesToPdfPoints(rectangle.xInches),
    inchesToPdfPoints(rectangle.yInches),
    height,
  );
  page.drawRectangle({
    ...position,
    width,
    height,
    color: parseHexColor(settings.backgroundColor),
    borderColor: settings.borderEnabled
      ? parseHexColor(settings.borderColor)
      : undefined,
    borderWidth: settings.borderEnabled
      ? settings.borderWidthPoints
      : undefined,
  });

  const font = settings.fontWeight >= 600 ? boldFont : regularFont;
  const lines = [
    settings.primaryText,
    settings.secondaryText,
    settings.thirdLineText,
  ].filter((line): line is string => Boolean(line?.trim()));
  const lineHeight = settings.fontSizePoints * settings.lineSpacing;
  const contentHeight = lines.length * lineHeight;
  const availableWidth = Math.max(width - settings.paddingPoints * 2, 0);
  const startY = position.y + (height + contentHeight) / 2 - lineHeight;

  lines.forEach((line, index) => {
    const fitted = fitTextToWidth(
      line,
      font,
      settings.fontSizePoints,
      rotation === 90
        ? Math.max(height - settings.paddingPoints * 2, 0)
        : availableWidth,
    );
    const textWidth = font.widthOfTextAtSize(
      fitted,
      settings.fontSizePoints,
    );
    const x =
      settings.textAlign === "left"
        ? position.x + settings.paddingPoints
        : settings.textAlign === "right"
          ? position.x + width - settings.paddingPoints - textWidth
          : position.x + (width - textWidth) / 2;
    const y = startY - index * lineHeight;
    page.drawText(fitted, {
      x: rotation === 90 ? position.x + width / 2 : x,
      y: rotation === 90 ? position.y + settings.paddingPoints : y,
      size: settings.fontSizePoints,
      font,
      color: parseHexColor(settings.textColor),
      rotate: rotation === 90 ? degrees(90) : undefined,
    });
  });
}

export { parseHexColor };
