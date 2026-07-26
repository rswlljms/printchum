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

  const summaryRows = [
    ["Paper", paper.name],
    ["Size", `${paperWidth} × ${paperHeight} ${paper.unit}`],
    ["Unit", paper.unit],
    ["Orientation", paper.orientation],
    ["Margin", `${roundMeasurementForDisplay(paper.margin, paper.unit)} ${paper.unit}`],
    [
      "Spacing",
      `${roundMeasurementForDisplay(paper.horizontalSpacing, paper.unit)} × ${roundMeasurementForDisplay(paper.verticalSpacing, paper.unit)} ${paper.unit}`,
    ],
    ["Printable area", `${printableWidth} × ${printableHeight} ${paper.unit}`],
    ["Selected sizes", String(selectedSizeCount)],
    ["Total photos", String(layoutResult?.totalItems ?? 0)],
    ["Pages", String(layoutResult?.pages.length ?? 0)],
    ["Arrange mode", paper.autoArrangeMode],
    ["Service set", selectedServiceSet?.name ?? "Custom"],
    [
      "Set status",
      selectedServiceSet
        ? serviceSetModificationState === "modified"
          ? "Modified"
          : "Applied"
        : "Unselected",
    ],
    ["Estimated price", selectedServiceSet ? formatServiceSetPrice(selectedServiceSet) : "—"],
    ["AI credit impact", "0 credits"],
  ] as const;

  return (
    <aside
      className="space-y-4 xl:sticky xl:top-[88px]"
      aria-label="Layout summary"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <p className="micro-label">06 — summary</p>
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
                <div key={label} className="flex items-center justify-between gap-3 py-2.5">
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
