export type PdfExportErrorCode =
  | "NO_LAYOUT"
  | "NO_PAGES"
  | "NO_PLACED_ITEMS"
  | "INVALID_PAPER"
  | "INVALID_PAGE_RANGE"
  | "IMAGE_MISSING"
  | "IMAGE_DECODE_FAILED"
  | "INVALID_CROP"
  | "NAMEPLATE_INVALID"
  | "SOURCE_ITEM_MISSING"
  | "EXPORT_CANCELLED"
  | "PDF_GENERATION_FAILED";

export class PdfExportError extends Error {
  constructor(
    public readonly code: PdfExportErrorCode,
    public readonly userMessage: string,
  ) {
    super(userMessage);
    this.name = "PdfExportError";
  }
}

export function throwIfExportCancelled(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new PdfExportError(
      "EXPORT_CANCELLED",
      "PDF generation was cancelled.",
    );
  }
}
