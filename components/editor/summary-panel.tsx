"use client";

import { CheckCircle2, LockKeyhole } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { serviceSets } from "@/features/editor/mock-data/service-sets";
import { useEditorStore } from "@/stores/editor-store";

export function SummaryPanel() {
  const paper = useEditorStore((state) => state.paper);
  const photoSizes = useEditorStore((state) => state.photoSizes);
  const layoutResult = useEditorStore((state) => state.layoutResult);
  const layoutError = useEditorStore((state) => state.layoutError);
  const selectedServiceSetId = useEditorStore((state) => state.selectedServiceSetId);
  const selectedServiceSet = serviceSets.find((set) => set.id === selectedServiceSetId);

  const summaryRows = [
    ["Paper", paper.name],
    ["Orientation", paper.orientation],
    ["Total photos", String(layoutResult?.totalItems ?? 0)],
    ["Pages", String(layoutResult?.pages.length ?? 0)],
    ["Paper utilization", `${(layoutResult?.utilizationPercent ?? 0).toFixed(1)}%`],
    ["Background", "Original"],
    ["Nameplate", "Off"],
    ["Service set", selectedServiceSet?.name ?? "Custom"],
    ["Estimated price", selectedServiceSet ? `$${selectedServiceSet.price.toFixed(2)}` : "—"],
    ["AI credit impact", "0 credits"],
  ] as const;

  return (
    <aside className="space-y-4" aria-label="Layout summary">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <p className="micro-label">05 — summary</p>
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

      <Card className="border-[var(--gray-300)] bg-[var(--gray-50)]">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--ink)] text-[var(--inverted-ink)]">
              <LockKeyhole className="size-4" />
            </div>
            <div>
              <p className="font-technical text-[10px] font-medium uppercase tracking-wider text-[var(--ink)]">Privacy protected</p>
              <p className="mt-1 text-xs leading-5 text-[var(--gray-600)]">
                Your photo stays in this browser session and is not saved to PrintChum.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <p className="micro-label">06 — sizes</p>
          <h2 className="mt-1 font-semibold text-[var(--ink)]">Selected sizes</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {photoSizes.map((size) => (
              <div key={size.instanceId} className="flex items-center justify-between rounded-lg border border-[var(--gray-200)] bg-[var(--gray-50)] px-3 py-2">
                <span className="text-xs font-medium text-[var(--gray-700)]">{size.name}</span>
                <Badge variant="secondary">× {size.quantity}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
