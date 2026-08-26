"use client";

import { useEffect, useMemo, useState } from "react";

import { ConfigurationPanel } from "@/components/editor/configuration-panel";
import { LayoutCanvas } from "@/components/editor/layout-canvas";
import { PdfExportDialog } from "@/components/editor/pdf-export-dialog";
import { PreviewToolbar } from "@/components/editor/preview-toolbar";
import {
  PrintOptionsDialog,
  type PrintPreviewConfiguration,
} from "@/components/editor/print-options-dialog";
import { SummaryPanel } from "@/components/editor/summary-panel";
import { UnplacedItemsWarning } from "@/components/editor/unplaced-items-warning";
import { WebMcpRegistration } from "@/components/editor/webmcp-registration";
import { PrintPreview } from "@/components/print/print-preview";
import { Card, CardContent } from "@/components/ui/card";
import { orientPaper } from "@/lib/layout-engine/paper-sizes";
import { toInches } from "@/lib/layout-engine/units";
import { formatPhotoSizeLabel } from "@/features/editor/photo-sizes/conversions";
import { useEditorStore } from "@/stores/editor-store";
import { useWorkspaceUiStore } from "@/stores/workspace-ui-store";

export function EditorWorkspace() {
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [printConfiguration, setPrintConfiguration] =
    useState<PrintPreviewConfiguration | null>(null);
  const printDialogOpen = useWorkspaceUiStore(
    (state) => state.printDialogOpen,
  );
  const setPrintDialogOpen = useWorkspaceUiStore(
    (state) => state.setPrintDialogOpen,
  );
  const paper = useEditorStore((state) => state.paper);
  const layoutResult = useEditorStore((state) => state.layoutResult);
  const activePageIndex = useEditorStore((state) => state.activePageIndex);
  const previewScale = useEditorStore((state) => state.previewScale);
  const sourceObjectUrl = useEditorStore((state) => state.sourceObjectUrl);
  const sourcePhotos = useEditorStore((state) => state.sourcePhotos);
  const crop = useEditorStore((state) => state.crop);
  const cropMode = useEditorStore((state) => state.cropMode);
  const backgroundMode = useEditorStore((state) => state.backgroundMode);
  const backgroundColor = useEditorStore((state) => state.backgroundColor);
  const backgroundRemoved = useEditorStore(
    (state) => state.backgroundRemoved,
  );
  const photoSizes = useEditorStore((state) => state.photoSizes);
  const setActivePage = useEditorStore((state) => state.setActivePage);
  const setPreviewScale = useEditorStore((state) => state.setPreviewScale);
  const resetEditor = useEditorStore((state) => state.resetEditor);
  const disposeSourcePhoto = useEditorStore((state) => state.disposeSourcePhoto);
  const restoreWorkspaceSession = useEditorStore(
    (state) => state.restoreWorkspaceSession,
  );

  useEffect(() => {
    restoreWorkspaceSession();
  }, [restoreWorkspaceSession]);

  useEffect(() => {
    function handleBeforeUnload(): void {
      disposeSourcePhoto();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      disposeSourcePhoto();
    };
  }, [disposeSourcePhoto]);

  const orientedPaper = orientPaper(
    toInches(paper.width, paper.unit),
    toInches(paper.height, paper.unit),
    paper.orientation,
  );
  const referencePhotoWidthInches = photoSizes[0]
    ? toInches(photoSizes[0].width, photoSizes[0].unit)
    : 1;
  const itemLabels = useMemo(
    () => Object.fromEntries(
      photoSizes.map((photoSize) => [
        photoSize.id,
        formatPhotoSizeLabel(
          photoSize.name,
          photoSize.width,
          photoSize.height,
          photoSize.unit,
        ),
      ]),
    ),
    [photoSizes],
  );
  const itemNameplates = useMemo(
    () =>
      Object.fromEntries(
        photoSizes.map((photoSize) => [
          photoSize.id,
          photoSize.nameplateEnabled
            ? photoSize.nameplate
            : undefined,
        ]),
      ),
    [photoSizes],
  );
  const itemSourcePhotoIds = useMemo(
    () =>
      Object.fromEntries(
        photoSizes.map((photoSize) => [
          photoSize.id,
          photoSize.sourcePhotoId,
        ]),
      ),
    [photoSizes],
  );
  const outputReady =
    Boolean(layoutResult) &&
    (layoutResult?.placedItems ?? 0) > 0 &&
    sourcePhotos.length > 0;

  return (
    <div
      className="page-enter mx-auto max-w-[1800px] p-4 sm:p-6"
    >
      <WebMcpRegistration />
      <div className="mb-8 border-b border-[var(--gray-200)] pb-6">
        <div>
          <p className="micro-label">Editor</p>
          <h2 className="font-display mt-2 text-4xl leading-none text-[var(--ink)]">Create Layout</h2>
          <p className="mt-3 text-sm text-[var(--gray-500)]">
            Configure a print sheet and preview deterministic placement in real time.
          </p>
        </div>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[320px_minmax(480px,1fr)_280px]">
        <ConfigurationPanel />

        <Card className="min-w-0 xl:sticky xl:top-[88px]">
          <CardContent className="space-y-4 p-4">
            <UnplacedItemsWarning
              layoutResult={layoutResult}
              itemLabels={itemLabels}
            />
            <PreviewToolbar
              activePageIndex={activePageIndex}
              pageCount={layoutResult?.pages.length ?? 0}
              previewScale={previewScale}
              totalItems={layoutResult?.totalItems ?? 0}
              utilizationPercent={layoutResult?.utilizationPercent ?? 0}
              onPageChange={setActivePage}
              onScaleChange={setPreviewScale}
              outputReady={outputReady}
              onReset={resetEditor}
              onPrint={() => setPrintDialogOpen(true)}
              onDownload={() => setPdfDialogOpen(true)}
            />
            <LayoutCanvas
              paperWidthInches={orientedPaper.widthInches}
              paperHeightInches={orientedPaper.heightInches}
              marginInches={toInches(paper.margin, paper.unit)}
              layoutResult={layoutResult}
              activePageIndex={activePageIndex}
              previewScale={previewScale}
              sourceObjectUrl={sourceObjectUrl}
              sourcePhotos={sourcePhotos}
              itemSourcePhotoIds={itemSourcePhotoIds}
              crop={crop}
              cropMode={cropMode}
              referenceWidthInches={referencePhotoWidthInches}
              cuttingGuides={paper.cuttingGuidesEnabled}
              sizeLabels={paper.sizeLabelsEnabled}
              backgroundMode={backgroundMode}
              backgroundColor={backgroundColor}
              backgroundRemoved={backgroundRemoved}
              itemLabels={itemLabels}
              itemNameplates={itemNameplates}
            />
            <div className="font-technical flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-wider text-[var(--gray-500)]">
              <span>Screen preview · PDF and print use this LayoutResult</span>
              <span>
                {orientedPaper.widthInches.toFixed(2)} × {orientedPaper.heightInches.toFixed(2)} in ·{" "}
                {(layoutResult?.utilizationPercent ?? 0).toFixed(1)}% utilized
              </span>
            </div>
          </CardContent>
        </Card>

        <SummaryPanel />
      </div>
      {pdfDialogOpen ? (
        <PdfExportDialog
          open
          onOpenChange={setPdfDialogOpen}
        />
      ) : null}
      {printDialogOpen ? (
        <PrintOptionsDialog
          open
          onOpenChange={setPrintDialogOpen}
          onContinue={(configuration) => {
            setPrintDialogOpen(false);
            setPrintConfiguration(configuration);
          }}
        />
      ) : null}
      {printConfiguration ? (
        <PrintPreview
          configuration={printConfiguration}
          onClose={() => setPrintConfiguration(null)}
        />
      ) : null}
    </div>
  );
}
