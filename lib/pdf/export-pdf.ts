import { createPdfDocument } from "@/lib/pdf/create-pdf-document";
import {
  PdfExportError,
  throwIfExportCancelled,
} from "@/lib/pdf/errors";
import { sanitizePdfFilename } from "@/lib/pdf/filename";
import type {
  PdfExportContext,
  PdfExportInput,
  PdfExportResult,
} from "@/lib/pdf/types";

export interface PdfExportService {
  exportLayout(
    input: PdfExportInput,
    context?: PdfExportContext,
  ): Promise<PdfExportResult>;
}

export const pdfExportService: PdfExportService = {
  async exportLayout(input, context = {}) {
    try {
      throwIfExportCancelled(context.signal);
      const bytes = await createPdfDocument(input, context);
      throwIfExportCancelled(context.signal);
      const blobBytes = bytes.slice().buffer as ArrayBuffer;
      const blob = new Blob([blobBytes], { type: "application/pdf" });
      return {
        blob,
        filename: sanitizePdfFilename(input.options.filename ?? ""),
        pageCount: input.options.pageIndexes.length,
        byteLength: blob.size,
      };
    } catch (error) {
      if (error instanceof PdfExportError) {
        throw error;
      }
      throw new PdfExportError(
        "PDF_GENERATION_FAILED",
        "The PDF could not be generated. Try again with fewer pages.",
      );
    }
  },
};
