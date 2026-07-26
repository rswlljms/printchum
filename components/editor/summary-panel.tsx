"use client";

import { CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { serviceSets } from "@/features/editor/mock-data/service-sets";
import { formatServiceSetPrice } from "@/features/editor/service-set-presentation";
import { useEditorStore } from "@/stores/editor-store";

export function SummaryPanel() {
  const paper = useEditorStore((state) => state.paper);
  const layoutResult = useEditorStore((state) => state.layoutResult);
  const layoutError = useEditorStore((state) => state.layoutError);
  const selectedServiceSetId = useEditorStore((state) => state.selectedServiceSetId);
  const selectedSizeCount = useEditorStore((state) => state.photoSizes.length);
  const selectedServiceSet = serviceSets.find((set) => set.id === selectedServiceSetId);

  const summaryRows = [
    ["Paper", paper.name],
    ["Orientation", paper.orientation],
    ["Selected sizes", String(selectedSizeCount)],
    ["Total photos", String(layoutResult?.totalItems ?? 0)],
    ["Pages", String(layoutResult?.pages.length ?? 0)],
    ["Paper utilization", `${(layoutResult?.utilizationPercent ?? 0).toFixed(1)}%`],
    ["Unplaced", String(layoutResult?.unplacedItems.length ?? 0)],
    ["Background", "Original"],
    ["Nameplate", "Off"],
    ["Service set", selectedServiceSet?.name ?? "Custom"],
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
            <Badge variant="success">
              <CheckCircle2 className="mr-1 size-3" />
              Live
            </Badge>
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
