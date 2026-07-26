"use client";

import { ChevronLeft, ChevronRight, Maximize2, Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

type PreviewToolbarProps = {
  activePageIndex: number;
  pageCount: number;
  previewScale: number;
  onPageChange: (page: number) => void;
  onScaleChange: (scale: number) => void;
};

export function PreviewToolbar({
  activePageIndex,
  pageCount,
  previewScale,
  onPageChange,
  onScaleChange,
}: PreviewToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
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
          onClick={() => onScaleChange(previewScale - 0.1)}
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
          onClick={() => onScaleChange(previewScale + 0.1)}
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
  );
}
