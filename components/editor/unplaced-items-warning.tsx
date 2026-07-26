"use client";

import { AlertTriangle } from "lucide-react";

import type { LayoutResult } from "@/lib/layout-engine/types";

type UnplacedItemsWarningProps = {
  layoutResult: LayoutResult | null;
  itemLabels: Readonly<Record<string, string>>;
};

export function UnplacedItemsWarning({
  layoutResult,
  itemLabels,
}: UnplacedItemsWarningProps) {
  if (!layoutResult || layoutResult.unplacedItems.length === 0) {
    return null;
  }

  const groupedItems = new Map<string, number>();
  for (const item of layoutResult.unplacedItems) {
    groupedItems.set(
      item.sourceItemId,
      (groupedItems.get(item.sourceItemId) ?? 0) + 1,
    );
  }

  return (
    <div
      className="rounded-xl border border-[var(--gray-300)] bg-[var(--gray-50)] p-3"
      role="alert"
    >
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--ink)]" />
        <div>
          <p className="text-xs font-semibold text-[var(--ink)]">
            Some photo sizes cannot fit
          </p>
          <ul className="mt-1 space-y-1 text-[11px] leading-5 text-[var(--gray-600)]">
            {[...groupedItems].map(([sourceItemId, count]) => (
              <li key={sourceItemId}>
                {itemLabels[sourceItemId] ?? "Selected size"}: {count}{" "}
                {count === 1 ? "copy does" : "copies do"} not fit within the
                printable paper area.
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
