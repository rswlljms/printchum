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
            <h2 className="font-semibold text-slate-900">Layout summary</h2>
            <Badge variant="success">
              <CheckCircle2 className="mr-1 size-3" />
              Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {layoutError ? (
            <div className="rounded-[10px] bg-red-50 p-3 text-sm text-red-700" role="alert">
              {layoutError}
            </div>
          ) : (
            <dl className="divide-y divide-slate-100">
              {summaryRows.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3 py-2.5">
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="text-right text-xs font-medium capitalize text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <LockKeyhole className="size-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-950">Privacy protected</p>
              <p className="mt-1 text-xs leading-5 text-blue-800">
                Photo stored only in this browser session. No photo is present in Phase 1.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-slate-900">Selected sizes</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {photoSizes.map((size) => (
              <div key={size.instanceId} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-xs font-medium text-slate-700">{size.name}</span>
                <Badge variant="secondary">× {size.quantity}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
