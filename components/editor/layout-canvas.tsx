"use client";

import { useEffect, useRef } from "react";

import { drawLayoutPreview } from "@/lib/canvas/draw-layout-preview";
import type { LayoutResult } from "@/lib/layout-engine/types";

type LayoutCanvasProps = {
  paperWidthInches: number;
  paperHeightInches: number;
  marginInches: number;
  layoutResult: LayoutResult | null;
  activePageIndex: number;
  previewScale: number;
};

export function LayoutCanvas(props: LayoutCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    paperWidthInches,
    paperHeightInches,
    marginInches,
    layoutResult,
    activePageIndex,
    previewScale,
  } = props;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !layoutResult) {
      return;
    }

    let animationFrame = 0;
    let viewportWidth = Math.max(Math.floor(container.clientWidth), 1);
    let viewportHeight = Math.max(Math.floor(container.clientHeight), 1);

    const draw = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      const bitmapWidth = Math.floor(viewportWidth * pixelRatio);
      const bitmapHeight = Math.floor(viewportHeight * pixelRatio);

      if (canvas.width !== bitmapWidth || canvas.height !== bitmapHeight) {
        canvas.width = bitmapWidth;
        canvas.height = bitmapHeight;
      }

      const context = canvas.getContext("2d");
      if (!context) {
        return;
      }
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      drawLayoutPreview({
        context,
        viewportWidth,
        viewportHeight,
        paperWidthInches,
        paperHeightInches,
        marginInches,
        layoutResult,
        activePageIndex,
        previewScale,
      });
    };

    const scheduleDraw = (width: number, height: number) => {
      viewportWidth = Math.max(Math.floor(width), 1);
      viewportHeight = Math.max(Math.floor(height), 1);
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(draw);
    };

    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        scheduleDraw(entry.contentRect.width, entry.contentRect.height);
      }
    });
    observer.observe(container);
    scheduleDraw(container.clientWidth, container.clientHeight);

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
    };
  }, [
    activePageIndex,
    layoutResult,
    marginInches,
    paperHeightInches,
    paperWidthInches,
    previewScale,
  ]);

  return (
    <div
      ref={containerRef}
      className="halftone-field relative h-[clamp(520px,65vh,760px)] w-full overflow-hidden rounded-xl border border-[var(--gray-200)] bg-[var(--gray-100)]"
    >
      {layoutResult ? (
        <canvas
          ref={canvasRef}
          className="block size-full"
          role="img"
          aria-label={`Print layout preview, page ${activePageIndex + 1} of ${layoutResult.pages.length}`}
        />
      ) : (
        <div className="flex size-full items-center justify-center p-8 text-center">
          <div>
            <p className="font-medium text-[var(--gray-700)]">No layout available</p>
            <p className="mt-1 text-sm text-[var(--gray-500)]">Adjust the settings to generate a preview.</p>
          </div>
        </div>
      )}
    </div>
  );
}
