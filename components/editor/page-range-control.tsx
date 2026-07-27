"use client";

import { Select } from "@/components/ui/select";
import { parsePageRange } from "@/lib/pdf/page-range";
import type { PdfPageSelection } from "@/lib/pdf/types";

type PageRangeControlProps = {
  selection: PdfPageSelection;
  customRange: string;
  currentPageIndex: number;
  totalPages: number;
  onSelectionChange: (selection: PdfPageSelection) => void;
  onCustomRangeChange: (range: string) => void;
};

export function resolveSelectedPageIndexes(
  selection: PdfPageSelection,
  customRange: string,
  currentPageIndex: number,
  totalPages: number,
): { pageIndexes: number[]; error: string | null } {
  if (selection === "all") {
    return {
      pageIndexes: Array.from({ length: totalPages }, (_, index) => index),
      error: null,
    };
  }
  if (selection === "current") {
    return {
      pageIndexes:
        currentPageIndex >= 0 && currentPageIndex < totalPages
          ? [currentPageIndex]
          : [],
      error:
        currentPageIndex >= 0 && currentPageIndex < totalPages
          ? null
          : "The current page is unavailable.",
    };
  }
  const result = parsePageRange(customRange, totalPages);
  return result.valid
    ? { pageIndexes: result.pageIndexes, error: null }
    : { pageIndexes: [], error: result.error };
}

export function PageRangeControl({
  selection,
  customRange,
  currentPageIndex,
  totalPages,
  onSelectionChange,
  onCustomRangeChange,
}: PageRangeControlProps) {
  const result = resolveSelectedPageIndexes(
    selection,
    customRange,
    currentPageIndex,
    totalPages,
  );

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium text-[var(--gray-700)]">
        Pages
        <Select
          value={selection}
          onChange={(event) =>
            onSelectionChange(event.target.value as PdfPageSelection)
          }
          className="mt-1.5"
          aria-label="Page range"
        >
          <option value="all">All pages</option>
          <option value="current">
            Current page ({Math.min(currentPageIndex + 1, totalPages)})
          </option>
          <option value="custom">Custom range</option>
        </Select>
      </label>
      {selection === "custom" ? (
        <label className="block text-xs font-medium text-[var(--gray-700)]">
          Custom page range
          <input
            value={customRange}
            onChange={(event) => onCustomRangeChange(event.target.value)}
            placeholder="1-3,5"
            className="mt-1.5 h-10 w-full rounded-lg border border-[var(--gray-200)] bg-[var(--gray-50)] px-3 text-sm"
            aria-invalid={Boolean(result.error)}
            aria-describedby={
              result.error ? "page-range-error" : "page-range-help"
            }
          />
        </label>
      ) : null}
      <p
        id={result.error ? "page-range-error" : "page-range-help"}
        className={`text-xs ${
          result.error ? "font-medium text-red-600" : "text-[var(--gray-500)]"
        }`}
        role={result.error ? "alert" : undefined}
      >
        {result.error ??
          `${result.pageIndexes.length} of ${totalPages} pages selected.`}
      </p>
    </div>
  );
}
