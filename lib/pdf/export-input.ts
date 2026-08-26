import type { EditorState } from "@/features/editor/types";
import {
  createDefaultExportToggles,
  type ExportToggleOptions,
} from "@/components/editor/export-option-toggles";
import { createDefaultPdfFilename, sanitizePdfFilename } from "@/lib/pdf/filename";
import type {
  PdfExportInput,
  PdfOutputQuality,
} from "@/lib/pdf/types";

export type PdfExportStateSource = Pick<
  EditorState,
  | "layoutResult"
  | "paper"
  | "photoSizes"
  | "crop"
  | "cropMode"
  | "backgroundMode"
  | "backgroundColor"
  | "backgroundRemoved"
  | "sourceFile"
  | "sourceObjectUrl"
  | "sourcePhotos"
>;

export function resolvePdfJpegQuality(quality: PdfOutputQuality): number {
  return quality === "high" ? 0.95 : 0.82;
}

/**
 * Single source of truth for building a PdfExportInput from editor state.
 * Used by both PdfExportDialog and the WebMCP export-pdf tool so exports
 * always behave identically regardless of entry point.
 */
export function createPdfExportInputFromEditorState(
  state: PdfExportStateSource,
  options: {
    quality?: PdfOutputQuality;
    filename?: string;
    pageIndexes: number[];
    toggles?: ExportToggleOptions;
  },
): PdfExportInput | null {
  if (!state.layoutResult) {
    return null;
  }
  const quality = options.quality ?? "high";
  const toggles =
    options.toggles ??
    createDefaultExportToggles({
      photoSizes: state.photoSizes,
      cuttingGuidesEnabled: state.paper.cuttingGuidesEnabled,
      sizeLabelsEnabled: state.paper.sizeLabelsEnabled,
      backgroundMode: state.backgroundMode,
    });
  return {
    layoutResult: state.layoutResult,
    paper: state.paper,
    photoSizes: state.photoSizes,
    crop: state.crop,
    cropMode: state.cropMode,
    backgroundMode: state.backgroundMode,
    backgroundColor: state.backgroundColor,
    backgroundRemoved: state.backgroundRemoved,
    imageSource:
      state.sourceFile && state.sourceObjectUrl
        ? {
            file: state.sourceFile,
            objectUrl: state.sourceObjectUrl,
            mimeType: state.sourceFile.type as
              | "image/jpeg"
              | "image/png"
              | "image/webp",
          }
        : null,
    imageSources: state.sourcePhotos.map((photo) => ({
      id: photo.id,
      file: photo.file,
      objectUrl: photo.objectUrl,
      mimeType: photo.file.type as
        | "image/jpeg"
        | "image/png"
        | "image/webp",
      crop: photo.crop,
      cropMode: photo.cropMode,
    })),
    options: {
      ...toggles,
      outputQuality: quality,
      jpegQuality: resolvePdfJpegQuality(quality),
      filename: sanitizePdfFilename(
        options.filename ?? "",
        createDefaultPdfFilename(),
      ),
      pageIndexes: options.pageIndexes,
    },
  };
}
