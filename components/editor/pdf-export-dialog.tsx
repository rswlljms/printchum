"use client";

import { Download, LoaderCircle, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import {
  ExportOptionToggles,
  type ExportToggleOptions,
} from "@/components/editor/export-option-toggles";
import { ExportWarningList } from "@/components/editor/export-warning-list";
import {
  PageRangeControl,
  resolveSelectedPageIndexes,
} from "@/components/editor/page-range-control";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { downloadPdfResult } from "@/lib/pdf/download";
import { PdfExportError } from "@/lib/pdf/errors";
import {
  createDefaultPdfFilename,
  sanitizePdfFilename,
} from "@/lib/pdf/filename";
import { pdfExportService } from "@/lib/pdf/export-pdf";
import type {
  ExportStatus,
  PdfExportInput,
  PdfOutputQuality,
  PdfPageSelection,
} from "@/lib/pdf/types";
import { validatePdfExport } from "@/lib/pdf/validation";
import { useEditorStore } from "@/stores/editor-store";

type PdfExportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PdfExportDialog({
  open,
  onOpenChange,
}: PdfExportDialogProps) {
  const state = useEditorStore();
  const [selection, setSelection] = useState<PdfPageSelection>("all");
  const [customRange, setCustomRange] = useState(
    () =>
      state.layoutResult && state.layoutResult.pages.length > 1
        ? `1-${state.layoutResult.pages.length}`
        : "1",
  );
  const [quality, setQuality] = useState<PdfOutputQuality>("high");
  const [filename, setFilename] = useState(createDefaultPdfFilename);
  const [openAfterExport, setOpenAfterExport] = useState(false);
  const [toggles, setToggles] = useState<ExportToggleOptions>({
    includeCuttingGuides: state.paper.cuttingGuidesEnabled,
    includeSizeLabels: state.paper.sizeLabelsEnabled,
    includeNameplates: true,
    includeBackground: true,
  });
  const [status, setStatus] = useState<ExportStatus>("idle");
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const abortController = useRef<AbortController | null>(null);
  const totalPages = state.layoutResult?.pages.length ?? 0;
  const selected = resolveSelectedPageIndexes(
    selection,
    customRange,
    state.activePageIndex,
    totalPages,
  );

  const input = useMemo<PdfExportInput | null>(() => {
    if (!state.layoutResult) {
      return null;
    }
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
        jpegQuality: quality === "high" ? 0.95 : 0.82,
        filename: sanitizePdfFilename(filename),
        pageIndexes: selected.pageIndexes,
      },
    };
  }, [filename, quality, selected.pageIndexes, state, toggles]);

  const validation = useMemo(() => {
    if (!input) {
      return {
        error: "Add at least one photo size and generate a valid layout.",
        warnings: [] as string[],
      };
    }
    try {
      return {
        error: selected.error,
        warnings: validatePdfExport(input).map((warning) => warning.message),
      };
    } catch (validationError) {
      return {
        error:
          validationError instanceof PdfExportError
            ? validationError.userMessage
            : "The layout is not ready to export.",
        warnings: [] as string[],
      };
    }
  }, [input, selected.error]);
  const running = !["idle", "completed", "failed", "cancelled"].includes(
    status,
  );

  async function handleDownload(): Promise<void> {
    if (!input || validation.error) {
      return;
    }
    const controller = new AbortController();
    abortController.current = controller;
    setError(null);
    setStatus("validating");
    try {
      const result = await pdfExportService.exportLayout(input, {
        signal: controller.signal,
        onProgress: (nextProgress) => {
          setStatus(nextProgress.status);
          setProgress({
            current: nextProgress.currentPage,
            total: nextProgress.totalPages,
          });
        },
      });
      if (controller.signal.aborted) {
        setStatus("cancelled");
        return;
      }
      downloadPdfResult(result);
      if (openAfterExport) {
        const objectUrl = URL.createObjectURL(result.blob);
        window.open(objectUrl, "_blank", "noopener,noreferrer");
        setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
      }
      setStatus("completed");
    } catch (exportError) {
      if (
        exportError instanceof PdfExportError &&
        exportError.code === "EXPORT_CANCELLED"
      ) {
        setStatus("cancelled");
      } else {
        setStatus("failed");
        setError(
          exportError instanceof PdfExportError
            ? exportError.userMessage
            : "The PDF could not be generated.",
        );
      }
    } finally {
      abortController.current = null;
    }
  }

  return (
    <Dialog open={open} onOpenChange={running ? undefined : onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <p className="micro-label">09 — physical output</p>
          <DialogTitle>Download PDF</DialogTitle>
          <DialogDescription>
            Export exact physical pages from the current layout.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-[var(--gray-200)] p-3 text-xs">
              <span className="text-[var(--gray-500)]">Paper</span>
              <strong className="text-right">{state.paper.name}</strong>
              <span className="text-[var(--gray-500)]">Orientation</span>
              <strong className="text-right capitalize">
                {state.paper.orientation}
              </strong>
              <span className="text-[var(--gray-500)]">Pages</span>
              <strong className="text-right">{totalPages}</strong>
              <span className="text-[var(--gray-500)]">Placed photos</span>
              <strong className="text-right">
                {state.layoutResult?.placedItems ?? 0}
              </strong>
            </div>
            <PageRangeControl
              selection={selection}
              customRange={customRange}
              currentPageIndex={state.activePageIndex}
              totalPages={totalPages}
              onSelectionChange={setSelection}
              onCustomRangeChange={setCustomRange}
            />
            <label className="block text-xs font-medium">
              Output quality
              <Select
                value={quality}
                onChange={(event) =>
                  setQuality(event.target.value as PdfOutputQuality)
                }
                className="mt-1.5"
              >
                <option value="standard">Standard · 150 PPI</option>
                <option value="high">High · 300 PPI</option>
              </Select>
            </label>
          </div>
          <div className="space-y-4">
            <ExportOptionToggles value={toggles} onChange={setToggles} />
            <label className="block text-xs font-medium">
              Filename
              <input
                value={filename}
                onChange={(event) => setFilename(event.target.value)}
                className="mt-1.5 h-10 w-full rounded-lg border border-[var(--gray-200)] bg-[var(--gray-50)] px-3 text-sm"
              />
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={openAfterExport}
                onChange={(event) => setOpenAfterExport(event.target.checked)}
                className="size-4 accent-[var(--ink)]"
              />
              Open after export where supported
            </label>
          </div>
        </div>

        <ExportWarningList warnings={validation.warnings} />
        {(validation.error && !selected.error) || error ? (
          <p
            className="rounded-xl border border-[var(--gray-300)] p-3 text-xs font-medium"
            role="alert"
            tabIndex={-1}
          >
            {error ?? validation.error}
          </p>
        ) : null}
        <p className="text-xs text-[var(--gray-500)]">
          Your PDF is generated in this browser and is not uploaded to
          PrintChum.
        </p>
        {running || status === "completed" || status === "cancelled" ? (
          <p className="text-xs font-medium" aria-live="polite">
            {status === "rendering-pages"
              ? `Rendering page ${progress.current} of ${progress.total}…`
              : status === "completed"
                ? "PDF downloaded."
                : status === "cancelled"
                  ? "Export cancelled."
                  : `${status.replace("-", " ")}…`}
          </p>
        ) : null}

        <DialogFooter>
          {running ? (
            <Button
              variant="outline"
              onClick={() => abortController.current?.abort()}
            >
              <X className="size-4" />
              Cancel export
            </Button>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}
          <Button
            onClick={() => void handleDownload()}
            disabled={Boolean(validation.error) || running}
          >
            {running ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
