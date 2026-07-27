"use client";

import {
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Printer,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { PrintPreviewConfiguration } from "@/components/editor/print-options-dialog";
import { PrintPreviewCanvas } from "@/components/print/print-preview-canvas";
import { Button } from "@/components/ui/button";
import { formatPhotoSizeLabel } from "@/features/editor/photo-sizes/conversions";
import { orientPaper } from "@/lib/layout-engine/paper-sizes";
import { toInches } from "@/lib/paper/conversions";
import { PdfExportError } from "@/lib/pdf/errors";
import { pdfExportService } from "@/lib/pdf/export-pdf";
import { printPdfResult, type PrintSession } from "@/lib/print/print-coordinator";
import { useEditorStore } from "@/stores/editor-store";

type PrintPreviewProps = {
  configuration: PrintPreviewConfiguration;
  onClose: () => void;
};

export function PrintPreview({
  configuration,
  onClose,
}: PrintPreviewProps) {
  const state = useEditorStore();
  const [selectedOffset, setSelectedOffset] = useState(0);
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const printSession = useRef<PrintSession | null>(null);
  const pageIndex =
    configuration.pageIndexes[selectedOffset] ??
    configuration.pageIndexes[0] ??
    0;
  const paper = orientPaper(
    toInches(state.paper.width, state.paper.unit),
    toInches(state.paper.height, state.paper.unit),
    state.paper.orientation,
  );
  const itemLabels = useMemo(
    () =>
      Object.fromEntries(
        state.photoSizes.map((item) => [
          item.id,
          formatPhotoSizeLabel(
            item.name,
            item.width,
            item.height,
            item.unit,
          ),
        ]),
      ),
    [state.photoSizes],
  );
  const itemNameplates = useMemo(
    () =>
      Object.fromEntries(
        state.photoSizes.map((item) => [
          item.id,
          configuration.includeNameplates &&
          item.nameplateEnabled &&
          item.nameplate?.enabled
            ? item.nameplate
            : undefined,
        ]),
      ),
    [configuration.includeNameplates, state.photoSizes],
  );

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      printSession.current?.dispose();
    };
  }, []);

  async function handlePrint(): Promise<void> {
    if (
      !state.layoutResult ||
      state.sourcePhotos.length === 0
    ) {
      setError("The layout is no longer available to print.");
      return;
    }
    setPrinting(true);
    setError(null);
    try {
      const result = await pdfExportService.exportLayout({
        layoutResult: state.layoutResult,
        paper: state.paper,
        photoSizes: state.photoSizes,
        crop: state.crop,
        cropMode: state.cropMode,
        backgroundMode: state.backgroundMode,
        backgroundColor: state.backgroundColor,
        backgroundRemoved: state.backgroundRemoved,
        imageSource: {
          file: state.sourcePhotos[0].file,
          objectUrl: state.sourcePhotos[0].objectUrl,
          mimeType: state.sourcePhotos[0].file.type as
            | "image/jpeg"
            | "image/png"
            | "image/webp",
        },
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
          ...configuration,
          outputQuality: "high",
          jpegQuality: 0.95,
          pageIndexes: configuration.pageIndexes,
          filename: "printchum-print-layout.pdf",
        },
      });
      printSession.current?.dispose();
      printSession.current = await printPdfResult(result);
    } catch (printError) {
      setError(
        printError instanceof PdfExportError
          ? printError.userMessage
          : printError instanceof Error
            ? printError.message
            : "The browser could not open the print dialog.",
      );
    } finally {
      setPrinting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col bg-[var(--background)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="print-preview-title"
      data-testid="print-preview"
    >
      <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-[var(--gray-200)] bg-[var(--surface)] px-4 py-3 sm:px-6">
        <div>
          <p className="micro-label">PrintChum · browser-only output</p>
          <h2 id="print-preview-title" className="font-semibold">
            Print preview
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setSelectedOffset((value) => Math.max(value - 1, 0))
              }
              disabled={selectedOffset === 0}
              aria-label="Previous print page"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="font-technical min-w-28 text-center text-[10px] uppercase">
              Page {pageIndex + 1} · {selectedOffset + 1} of{" "}
              {configuration.pageIndexes.length}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setSelectedOffset((value) =>
                  Math.min(
                    value + 1,
                    configuration.pageIndexes.length - 1,
                  ),
                )
              }
              disabled={
                selectedOffset >= configuration.pageIndexes.length - 1
              }
              aria-label="Next print page"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <Button
            onClick={() => void handlePrint()}
            disabled={printing}
          >
            {printing ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Printer className="size-4" />
            )}
            Print
          </Button>
          <Button variant="outline" onClick={onClose}>
            <X className="size-4" />
            Close
          </Button>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col items-center overflow-auto bg-[var(--gray-100)] p-5">
        {state.layoutResult && state.sourcePhotos.length > 0 ? (
          <PrintPreviewCanvas
            paperWidthInches={paper.widthInches}
            paperHeightInches={paper.heightInches}
            marginInches={toInches(state.paper.margin, state.paper.unit)}
            layoutResult={state.layoutResult}
            pageIndex={pageIndex}
            sourcePhotos={state.sourcePhotos}
            itemSourcePhotoIds={Object.fromEntries(
              state.photoSizes.map((item) => [
                item.id,
                item.sourcePhotoId,
              ]),
            )}
            crop={state.crop}
            cropMode={state.cropMode}
            referenceWidthInches={
              state.photoSizes[0]
                ? toInches(
                    state.photoSizes[0].width,
                    state.photoSizes[0].unit,
                  )
                : 1
            }
            cuttingGuides={configuration.includeCuttingGuides}
            sizeLabels={configuration.includeSizeLabels}
            backgroundMode={state.backgroundMode}
            backgroundColor={state.backgroundColor}
            backgroundRemoved={state.backgroundRemoved}
            itemLabels={itemLabels}
            itemNameplates={itemNameplates}
          />
        ) : (
          <div className="m-auto max-w-md rounded-2xl border border-[var(--gray-200)] bg-[var(--surface)] p-6 text-center">
            <h3 className="font-semibold">Nothing to print</h3>
            <p className="mt-2 text-sm text-[var(--gray-500)]">
              Generate a valid print layout before opening the print dialog.
            </p>
          </div>
        )}
        {error ? (
          <p
            className="mt-4 rounded-xl bg-[var(--surface)] p-3 text-xs font-medium"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        <p className="mt-4 max-w-2xl text-center text-xs text-[var(--gray-600)]">
          Print at 100% or Actual Size, disable Fit to Page, and confirm that
          the printer paper matches {state.paper.name}.
        </p>
      </main>
    </div>
  );
}
