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

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const layoutResult = props.layoutResult;
    if (!canvas || !container || !layoutResult) {
      return;
    }

    let animationFrame = 0;
    const draw = () => {
      const bounds = container.getBoundingClientRect();
      const width = Math.max(Math.floor(bounds.width), 1);
      const height = Math.max(Math.floor(bounds.height), 1);
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const context = canvas.getContext("2d");
      if (!context) {
        return;
      }
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      drawLayoutPreview({
        context,
        viewportWidth: width,
        viewportHeight: height,
        paperWidthInches: props.paperWidthInches,
        paperHeightInches: props.paperHeightInches,
        marginInches: props.marginInches,
        layoutResult,
        activePageIndex: props.activePageIndex,
        previewScale: props.previewScale,
      });
    };

    const scheduleDraw = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(draw);
    };
    const observer = new ResizeObserver(scheduleDraw);
    observer.observe(container);
    scheduleDraw();

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
    };
  }, [props]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-[520px] w-full overflow-hidden rounded-xl bg-slate-200/60"
    >
      {props.layoutResult ? (
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Print layout preview, page ${props.activePageIndex + 1} of ${props.layoutResult.pages.length}`}
        />
      ) : (
        <div className="flex min-h-[520px] items-center justify-center p-8 text-center">
          <div>
            <p className="font-medium text-slate-700">No layout available</p>
            <p className="mt-1 text-sm text-slate-500">Adjust the settings to generate a preview.</p>
          </div>
        </div>
      )}
    </div>
  );
}
