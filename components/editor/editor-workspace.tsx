"use client";

import { Download, Printer, RotateCcw } from "lucide-react";
import { useEffect } from "react";

import { ConfigurationPanel } from "@/components/editor/configuration-panel";
import { LayoutCanvas } from "@/components/editor/layout-canvas";
import { PreviewToolbar } from "@/components/editor/preview-toolbar";
import { SummaryPanel } from "@/components/editor/summary-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { orientPaper } from "@/lib/layout-engine/paper-sizes";
import { toInches } from "@/lib/layout-engine/units";
import { useEditorStore } from "@/stores/editor-store";

export function EditorWorkspace() {
  const paper = useEditorStore((state) => state.paper);
  const layoutResult = useEditorStore((state) => state.layoutResult);
  const activePageIndex = useEditorStore((state) => state.activePageIndex);
  const previewScale = useEditorStore((state) => state.previewScale);
  const setActivePage = useEditorStore((state) => state.setActivePage);
  const setPreviewScale = useEditorStore((state) => state.setPreviewScale);
  const resetEditor = useEditorStore((state) => state.resetEditor);
  const disposeSourcePhoto = useEditorStore((state) => state.disposeSourcePhoto);

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

  return (
    <div className="page-enter mx-auto max-w-[1800px] p-4 sm:p-6">
      <div className="mb-8 flex flex-col justify-between gap-5 border-b border-[var(--gray-200)] pb-6 xl:flex-row xl:items-end">
        <div>
          <p className="micro-label">01 — editor</p>
          <h2 className="font-display mt-2 text-4xl leading-none text-[var(--ink)]">Create Layout</h2>
          <p className="mt-3 text-sm text-[var(--gray-500)]">
            Configure a print sheet and preview deterministic placement in real time.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={resetEditor}>
            <RotateCcw className="size-4" />
            Reset
          </Button>
          <Button variant="outline" disabled title="Print output is planned for a later phase">
            <Printer className="size-4" />
            Print
          </Button>
          <Button disabled title="PDF export is planned for a later phase">
            <Download className="size-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[320px_minmax(480px,1fr)_280px]">
        <ConfigurationPanel />

        <Card className="min-w-0">
          <CardContent className="space-y-4 p-4">
            <PreviewToolbar
              activePageIndex={activePageIndex}
              pageCount={layoutResult?.pages.length ?? 0}
              previewScale={previewScale}
              onPageChange={setActivePage}
              onScaleChange={setPreviewScale}
            />
            <LayoutCanvas
              paperWidthInches={orientedPaper.widthInches}
              paperHeightInches={orientedPaper.heightInches}
              marginInches={toInches(paper.margin, paper.unit)}
              layoutResult={layoutResult}
              activePageIndex={activePageIndex}
              previewScale={previewScale}
            />
            <div className="font-technical flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-wider text-[var(--gray-500)]">
              <span>Screen preview · physical output is not implemented yet</span>
              <span>
                {orientedPaper.widthInches.toFixed(2)} × {orientedPaper.heightInches.toFixed(2)} in ·{" "}
                {(layoutResult?.utilizationPercent ?? 0).toFixed(1)}% utilized
              </span>
            </div>
          </CardContent>
        </Card>

        <SummaryPanel />
      </div>
    </div>
  );
}
