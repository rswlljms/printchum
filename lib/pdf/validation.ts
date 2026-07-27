import { mayNameplateTextOverflow } from "@/lib/nameplates/measurement";
import { calculatePrintableArea } from "@/lib/paper/printable-area";
import { toInches } from "@/lib/paper/conversions";
import { PdfExportError } from "@/lib/pdf/errors";
import type {
  PdfExportInput,
  PdfExportWarning,
} from "@/lib/pdf/types";

export function validatePdfExport(input: PdfExportInput): PdfExportWarning[] {
  if (!input.layoutResult) {
    throw new PdfExportError("NO_LAYOUT", "No layout is available to export.");
  }
  if (input.layoutResult.pages.length === 0) {
    throw new PdfExportError("NO_PAGES", "The layout has no pages to export.");
  }
  if (input.layoutResult.placedItems === 0) {
    throw new PdfExportError(
      "NO_PLACED_ITEMS",
      "Add at least one photo size that fits on the selected paper.",
    );
  }
  const printableArea = calculatePrintableArea(input.paper);
  if (!printableArea.isValid) {
    throw new PdfExportError(
      "INVALID_PAPER",
      printableArea.error ?? "The paper settings are invalid.",
    );
  }
  const imageSources = input.imageSources ?? [];
  if (!input.imageSource && imageSources.length === 0) {
    throw new PdfExportError(
      "IMAGE_MISSING",
      "Choose a photo before exporting the layout.",
    );
  }
  const crops = imageSources.length > 0
    ? imageSources.map((source) => source.crop)
    : [input.crop];
  if (crops.some((crop) =>
    !Number.isFinite(crop.xPercent) ||
    !Number.isFinite(crop.yPercent) ||
    !Number.isFinite(crop.widthPercent) ||
    !Number.isFinite(crop.heightPercent) ||
    crop.widthPercent <= 0 ||
    crop.heightPercent <= 0
  )) {
    throw new PdfExportError(
      "INVALID_CROP",
      "The photo crop is invalid. Reset the crop and try again.",
    );
  }
  if (
    input.options.pageIndexes.length === 0 ||
    input.options.pageIndexes.some(
      (pageIndex) =>
        !Number.isInteger(pageIndex) ||
        pageIndex < 0 ||
        pageIndex >= input.layoutResult.pages.length,
    )
  ) {
    throw new PdfExportError(
      "INVALID_PAGE_RANGE",
      "Select a valid page range.",
    );
  }
  const sourceIds = new Set(input.photoSizes.map((item) => item.id));
  const missingSource = input.layoutResult.pages
    .flatMap((page) => page.items)
    .find((item) => !sourceIds.has(item.sourceItemId));
  if (missingSource) {
    throw new PdfExportError(
      "SOURCE_ITEM_MISSING",
      "A placed photo size is no longer available. Recalculate the layout.",
    );
  }
  if (imageSources.length > 0) {
    const imageSourceIds = new Set(imageSources.map((source) => source.id));
    const missingPhoto = input.layoutResult.pages
      .flatMap((page) => page.items)
      .map((item) =>
        input.photoSizes.find(
          (photoSize) => photoSize.id === item.sourceItemId,
        ),
      )
      .find(
        (photoSize) =>
          photoSize?.sourcePhotoId &&
          !imageSourceIds.has(photoSize.sourcePhotoId),
      );
    if (missingPhoto) {
      throw new PdfExportError(
        "IMAGE_MISSING",
        "A photo used by this layout is no longer available.",
      );
    }
  }

  const warnings: PdfExportWarning[] = [];
  if (input.layoutResult.unplacedItems.length > 0) {
    warnings.push({
      code: "UNPLACED_ITEMS",
      message:
        "Some photo items do not fit on the selected paper and will not be included in the export.",
    });
  }
  if (input.backgroundMode === "transparent" && !input.backgroundRemoved) {
    warnings.push({
      code: "TRANSPARENT_BACKGROUND_UNAVAILABLE",
      message:
        "Transparent output is unavailable because the photo background has not been removed. The original background will be used.",
    });
  }
  if (
    input.photoSizes.some(
      (item) =>
        item.nameplateEnabled &&
        item.nameplate?.enabled &&
        mayNameplateTextOverflow(
          item.nameplate,
          toInches(item.width, item.unit),
        ),
    )
  ) {
    warnings.push({
      code: "NAMEPLATE_TEXT_MAY_TRUNCATE",
      message: "Some nameplate text may be shortened to fit its print area.",
    });
  }
  if (input.options.pageIndexes.length > 20) {
    warnings.push({
      code: "LARGE_PAGE_COUNT",
      message: "Large exports may take longer and use more browser memory.",
    });
  }
  return warnings;
}
