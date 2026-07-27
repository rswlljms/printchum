"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatServiceSetPrice } from "@/features/editor/service-set-presentation";
import {
  fromInches,
  roundMeasurementForDisplay,
} from "@/lib/paper/conversions";
import { calculatePrintableArea } from "@/lib/paper/printable-area";
import { useEditorStore } from "@/stores/editor-store";

export function SummaryPanel() {
  const paper = useEditorStore((state) => state.paper);
  const layoutResult = useEditorStore((state) => state.layoutResult);
  const layoutError = useEditorStore((state) => state.layoutError);
  const selectedServiceSetId = useEditorStore((state) => state.selectedServiceSetId);
  const serviceSets = useEditorStore((state) => state.serviceSets);
  const serviceSetModificationState = useEditorStore(
    (state) => state.serviceSetModificationState,
  );
  const selectedSizeCount = useEditorStore((state) => state.photoSizes.length);
  const photoSizes = useEditorStore((state) => state.photoSizes);
  const backgroundMode = useEditorStore((state) => state.backgroundMode);
  const selectedServiceSet = serviceSets.find((set) => set.id === selectedServiceSetId);
  const printableArea = calculatePrintableArea(paper);
  const paperWidth = roundMeasurementForDisplay(paper.width, paper.unit);
  const paperHeight = roundMeasurementForDisplay(paper.height, paper.unit);
  const printableWidth = roundMeasurementForDisplay(
    fromInches(printableArea.printableWidthInches, paper.unit),
    paper.unit,
  );
  const printableHeight = roundMeasurementForDisplay(
    fromInches(printableArea.printableHeightInches, paper.unit),
    paper.unit,
  );
  const nameplateItems = photoSizes.filter(
    (item) => item.nameplateEnabled && item.nameplate?.enabled,
  );

  const summaryRows = [
    ["Paper", paper.name],
    ["Size", `${paperWidth} × ${paperHeight} ${paper.unit}`],
    ["Orientation", paper.orientation],
    ["Printable area", `${printableWidth} × ${printableHeight} ${paper.unit}`],
    ["Selected sizes", String(selectedSizeCount)],
    [
      "Background",
      backgroundMode === "solid" ? "Solid color" : backgroundMode,
    ],
    [
      "Nameplates",
      `${nameplateItems.length} ${
        nameplateItems.length === 1 ? "size" : "sizes"
      } enabled`,
    ],
    [
      "Photos",
      `${layoutResult?.placedItems ?? 0} placed · ${
        layoutResult?.totalItems ?? 0
      } requested`,
    ],
    ["Pages", String(layoutResult?.pages.length ?? 0)],
    ["Unplaced", String(layoutResult?.unplacedItems.length ?? 0)],
    [
      "Export status",
      layoutResult && layoutResult.placedItems > 0 ? "Ready" : "Needs layout",
    ],
    [
      "Export details",
      `${paper.cuttingGuidesEnabled ? "Guides" : "No guides"} · ${
        paper.sizeLabelsEnabled ? "Labels" : "No labels"
      } · ${backgroundMode}`,
    ],
    ["Output quality", "High · 300 PPI"],
    [
      "Service set",
      selectedServiceSet
        ? `${selectedServiceSet.name} · ${
            serviceSetModificationState === "modified"
              ? "Modified"
              : "Applied"
          } · ${formatServiceSetPrice(selectedServiceSet)}`
        : "Custom",
    ],
  ].filter(
    ([label]) => label !== "Export details" && label !== "Background",
  );

  return (
    <aside
      className="space-y-4 xl:sticky xl:top-[88px]"
      aria-label="Layout summary"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <p className="micro-label">05 — summary</p>
              <h2 className="mt-1 font-semibold text-[var(--ink)]">Layout summary</h2>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {layoutError ? (
            <div className="rounded-xl border border-[var(--ink)] bg-[var(--gray-50)] p-3 text-sm text-[var(--ink)]" role="alert">
              {layoutError}
            </div>
          ) : (
            <dl className="divide-y divide-slate-100">
              {summaryRows.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3 py-1.5">
                  <dt className="font-technical text-[10px] uppercase tracking-wide text-[var(--gray-500)]">{label}</dt>
                  <dd className="text-right text-xs font-medium capitalize text-[var(--gray-800)]">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </CardContent>
      </Card>

    </aside>
  );
}
