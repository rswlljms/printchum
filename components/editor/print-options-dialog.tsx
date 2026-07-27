"use client";

import { Printer } from "lucide-react";
import { useMemo, useState } from "react";

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
import { PdfExportError } from "@/lib/pdf/errors";
import type {
  PdfExportInput,
  PdfPageSelection,
} from "@/lib/pdf/types";
import { validatePdfExport } from "@/lib/pdf/validation";
import { useEditorStore } from "@/stores/editor-store";

export type PrintPreviewConfiguration = ExportToggleOptions & {
  pageIndexes: number[];
};

type PrintOptionsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: (configuration: PrintPreviewConfiguration) => void;
};

export function PrintOptionsDialog({
  open,
  onOpenChange,
  onContinue,
}: PrintOptionsDialogProps) {
  const state = useEditorStore();
  const [selection, setSelection] = useState<PdfPageSelection>("all");
  const [customRange, setCustomRange] = useState(
    () =>
      state.layoutResult && state.layoutResult.pages.length > 1
        ? `1-${state.layoutResult.pages.length}`
        : "1",
  );
  const [toggles, setToggles] = useState<ExportToggleOptions>({
    includeCuttingGuides: state.paper.cuttingGuidesEnabled,
    includeSizeLabels: state.paper.sizeLabelsEnabled,
    includeNameplates: true,
    includeBackground: true,
  });
  const totalPages = state.layoutResult?.pages.length ?? 0;
  const selected = resolveSelectedPageIndexes(
    selection,
    customRange,
    state.activePageIndex,
    totalPages,
  );

  const validation = useMemo(() => {
    if (!state.layoutResult) {
      return {
        error: "Generate a valid print layout before opening print preview.",
        warnings: [] as string[],
      };
    }
    const input: PdfExportInput = {
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
        outputQuality: "high",
        jpegQuality: 0.95,
        pageIndexes: selected.pageIndexes,
      },
    };
    try {
      return {
        error: selected.error,
        warnings: validatePdfExport(input).map((warning) => warning.message),
      };
    } catch (error) {
      return {
        error:
          error instanceof PdfExportError
            ? error.userMessage
            : "The layout is not ready to print.",
        warnings: [] as string[],
      };
    }
  }, [selected.error, selected.pageIndexes, state, toggles]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <p className="micro-label">09 — physical output</p>
          <DialogTitle>Print Layout</DialogTitle>
          <DialogDescription>
            Review the pages and printed details before opening the browser
            print dialog.
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
            </div>
            <PageRangeControl
              selection={selection}
              customRange={customRange}
              currentPageIndex={state.activePageIndex}
              totalPages={totalPages}
              onSelectionChange={setSelection}
              onCustomRangeChange={setCustomRange}
            />
          </div>
          <ExportOptionToggles value={toggles} onChange={setToggles} />
        </div>

        <ExportWarningList warnings={validation.warnings} />
        {validation.error && !selected.error ? (
          <p
            className="rounded-xl border border-[var(--gray-300)] p-3 text-xs font-medium"
            role="alert"
          >
            {validation.error}
          </p>
        ) : null}
        <div className="space-y-2 rounded-xl bg-[var(--gray-50)] p-4 text-xs leading-5">
          <p className="font-semibold">
            For accurate physical dimensions, print at 100% or Actual Size.
            Disable Fit to Page or Scale to Fit in the browser or printer
            dialog.
          </p>
          <p>
            Confirm that the selected printer paper matches the PrintChum
            paper setting.
          </p>
          <p className="text-[var(--gray-500)]">
            Printer hardware and driver settings may slightly affect physical
            output. Verify the first printed sheet with a ruler before
            producing a large batch.
          </p>
        </div>
        <p className="text-xs text-[var(--gray-500)]">
          Your print layout remains in this browser session.
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={Boolean(validation.error)}
            onClick={() =>
              onContinue({
                ...toggles,
                pageIndexes: selected.pageIndexes,
              })
            }
          >
            <Printer className="size-4" />
            Continue to Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
