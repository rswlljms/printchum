import type {
  CropMode,
  CropState,
  PhotoSizeItem,
} from "@/features/editor/types";
import type { LayoutResult } from "@/lib/layout-engine/types";
import type { PaperSettings } from "@/lib/paper/types";

export type PdfImageMimeType =
  | "image/jpeg"
  | "image/png"
  | "image/webp";

export type PdfImageSource = {
  file: File;
  objectUrl: string;
  mimeType: PdfImageMimeType;
};

export type PdfPhotoSource = PdfImageSource & {
  id: string;
  crop: CropState;
  cropMode: CropMode;
};

export type PdfOutputQuality = "standard" | "high";
export type PdfPageSelection = "all" | "current" | "custom";

export type PdfExportOptions = {
  includeCuttingGuides: boolean;
  includeSizeLabels: boolean;
  includeNameplates: boolean;
  includeBackground: boolean;
  outputQuality: PdfOutputQuality;
  jpegQuality: number;
  filename?: string;
  pageIndexes: number[];
};

export type PdfExportInput = {
  layoutResult: LayoutResult;
  paper: PaperSettings;
  photoSizes: PhotoSizeItem[];
  crop: CropState;
  cropMode: CropMode;
  backgroundMode: "original" | "transparent" | "solid";
  backgroundColor: string;
  backgroundRemoved: boolean;
  imageSource: PdfImageSource | null;
  imageSources?: PdfPhotoSource[];
  options: PdfExportOptions;
};

export type ExportStatus =
  | "idle"
  | "validating"
  | "preparing-images"
  | "rendering-pages"
  | "finalizing"
  | "completed"
  | "failed"
  | "cancelled";

export type PdfExportProgress = {
  status: ExportStatus;
  currentPage: number;
  totalPages: number;
};

export type PdfExportResult = {
  blob: Blob;
  filename: string;
  pageCount: number;
  byteLength: number;
};

export type PdfExportWarning = {
  code:
    | "UNPLACED_ITEMS"
    | "TRANSPARENT_BACKGROUND_UNAVAILABLE"
    | "NAMEPLATE_TEXT_MAY_TRUNCATE"
    | "LARGE_PAGE_COUNT";
  message: string;
};

export type PdfExportContext = {
  signal?: AbortSignal;
  onProgress?: (progress: PdfExportProgress) => void;
};
