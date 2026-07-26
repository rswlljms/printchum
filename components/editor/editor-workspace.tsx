"use client";

import { Download, Printer, RotateCcw } from "lucide-react";

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

  const orientedPaper = orientPaper(
    toInches(paper.width, paper.unit),
    toInches(paper.height, paper.unit),
    paper.orientation,
  );

  return (
    <div className="mx-auto max-w-[1800px] p-4 sm:p-6">
      <div className="mb-5 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">Create Layout</h2>
          <p className="mt-1 text-sm text-slate-500">
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
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
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
