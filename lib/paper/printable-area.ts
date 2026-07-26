import { orientPaper } from "@/lib/layout-engine/paper-sizes";
import { toInches } from "@/lib/paper/conversions";
import type { PaperSettings, PrintableArea } from "@/lib/paper/types";

export function calculatePrintableArea(
  settings: PaperSettings,
): PrintableArea {
  const widthInches = toInches(settings.width, settings.unit);
  const heightInches = toInches(settings.height, settings.unit);
  const marginInches = toInches(settings.margin, settings.unit);

  if (
    !Number.isFinite(widthInches) ||
    !Number.isFinite(heightInches) ||
    widthInches <= 0 ||
    heightInches <= 0
  ) {
    return {
      paperWidthInches: widthInches,
      paperHeightInches: heightInches,
      printableWidthInches: 0,
      printableHeightInches: 0,
      marginInches,
      isValid: false,
      error: "Paper width and height must be finite positive numbers.",
    };
  }

  if (!Number.isFinite(marginInches) || marginInches < 0) {
    return {
      paperWidthInches: widthInches,
      paperHeightInches: heightInches,
      printableWidthInches: 0,
      printableHeightInches: 0,
      marginInches,
      isValid: false,
      error: "Paper margin must be a finite non-negative number.",
    };
  }

  const orientedPaper = orientPaper(
    widthInches,
    heightInches,
    settings.orientation,
  );
  const printableWidthInches =
    orientedPaper.widthInches - marginInches * 2;
  const printableHeightInches =
    orientedPaper.heightInches - marginInches * 2;

  if (printableWidthInches <= 0 || printableHeightInches <= 0) {
    return {
      paperWidthInches: orientedPaper.widthInches,
      paperHeightInches: orientedPaper.heightInches,
      printableWidthInches,
      printableHeightInches,
      marginInches,
      isValid: false,
      error: "The current margin leaves no printable area.",
    };
  }

  return {
    paperWidthInches: orientedPaper.widthInches,
    paperHeightInches: orientedPaper.heightInches,
    printableWidthInches,
    printableHeightInches,
    marginInches,
    isValid: true,
  };
}

