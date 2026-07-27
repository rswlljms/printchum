"use client";

import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  Minus,
  Plus,
  Printer,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type PreviewToolbarProps = {
  activePageIndex: number;
  pageCount: number;
  previewScale: number;
  totalItems: number;
  utilizationPercent: number;
  onPageChange: (page: number) => void;
  onScaleChange: (scale: number) => void;
  outputReady: boolean;
  onReset: () => void;
  onPrint: () => void;
  onDownload: () => void;
};

export function PreviewToolbar({
  activePageIndex,
  pageCount,
  previewScale,
  totalItems,
  utilizationPercent,
  onPageChange,
  onScaleChange,
  outputReady,
  onReset,
  onPrint,
  onDownload,
}: PreviewToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-4">
        <div className="font-technical flex items-center gap-3 text-[10px] uppercase tracking-wider text-[var(--gray-500)]">
          <span>{totalItems} photos</span>
          <span>{utilizationPercent.toFixed(1)}% used</span>
        </div>
        <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(activePageIndex - 1)}
          disabled={activePageIndex <= 0}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="font-technical min-w-24 text-center text-[10px] font-medium uppercase tracking-wider text-[var(--gray-700)]">
          Page {pageCount === 0 ? 0 : activePageIndex + 1} of {pageCount}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(activePageIndex + 1)}
          disabled={activePageIndex >= pageCount - 1}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onScaleChange(previewScale - 0.25)}
          disabled={previewScale <= 0.5}
          aria-label="Zoom out"
        >
          <Minus className="size-4" />
        </Button>
        <span className="font-technical min-w-14 text-center text-[10px] font-medium uppercase tracking-wider text-[var(--gray-600)]">
          {Math.round(previewScale * 100)}%
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onScaleChange(previewScale + 0.25)}
          disabled={previewScale >= 3}
          aria-label="Zoom in"
        >
          <Plus className="size-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onScaleChange(1)}>
          <Maximize2 className="size-3.5" />
          Fit page
        </Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-l border-[var(--gray-200)] pl-3">
        <Button variant="outline" size="sm" onClick={onReset}>
          <RotateCcw className="size-3.5" />
          Reset
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!outputReady}
          onClick={onPrint}
          title={
            outputReady
              ? "Open print options"
              : "Add a photo and a valid layout before printing"
          }
        >
          <Printer className="size-3.5" />
          Print
        </Button>
        <Button
          size="sm"
          disabled={!outputReady}
          onClick={onDownload}
          title={
            outputReady
              ? "Download a print-ready PDF"
              : "Add a photo and a valid layout before exporting"
          }
        >
          <Download className="size-3.5" />
          Download PDF
        </Button>
      </div>
    </div>
  );
}
