"use client";

import { useEffect, useRef, useState } from "react";

import { drawLayoutPreview } from "@/lib/canvas/draw-layout-preview";
import type { CropMode, CropState } from "@/features/editor/types";
import type { LayoutResult } from "@/lib/layout-engine/types";

type LayoutCanvasProps = {
  paperWidthInches: number;
  paperHeightInches: number;
  marginInches: number;
  layoutResult: LayoutResult | null;
  activePageIndex: number;
  previewScale: number;
  sourceObjectUrl: string | null;
  crop: CropState;
  cropMode: CropMode;
  referenceWidthInches: number;
  cuttingGuides: boolean;
  sizeLabels: boolean;
  itemLabels: Readonly<Record<string, string>>;
};

export function LayoutCanvas(props: LayoutCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedPhotoRef = useRef<{
    objectUrl: string;
    image: HTMLImageElement;
    width: number;
    height: number;
  } | null>(null);
  const [imageRevision, setImageRevision] = useState(0);
  const {
    paperWidthInches,
    paperHeightInches,
    marginInches,
    layoutResult,
    activePageIndex,
    previewScale,
    sourceObjectUrl,
    crop,
    cropMode,
    referenceWidthInches,
    cuttingGuides,
    sizeLabels,
    itemLabels,
  } = props;

  useEffect(() => {
    if (!sourceObjectUrl) {
      loadedPhotoRef.current = null;
      return;
    }

    let isActive = true;
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      if (isActive) {
        loadedPhotoRef.current = {
          objectUrl: sourceObjectUrl,
          image,
          width: image.naturalWidth,
          height: image.naturalHeight,
        };
        setImageRevision((revision) => revision + 1);
      }
    };
    image.src = sourceObjectUrl;

    return () => {
      isActive = false;
      if (loadedPhotoRef.current?.objectUrl === sourceObjectUrl) {
        loadedPhotoRef.current = null;
      }
      image.onload = null;
      image.onerror = null;
    };
  }, [sourceObjectUrl]);

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
      const loadedPhoto = loadedPhotoRef.current;
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
        photo:
          loadedPhoto?.objectUrl === sourceObjectUrl
            ? {
                image: loadedPhoto.image,
                sourceWidth: loadedPhoto.width,
                sourceHeight: loadedPhoto.height,
                crop,
                cropMode,
                referenceWidthInches,
              }
            : null,
        cuttingGuides,
        sizeLabels,
        itemLabels,
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
    crop,
    cropMode,
    cuttingGuides,
    imageRevision,
    itemLabels,
    layoutResult,
    marginInches,
    paperHeightInches,
    paperWidthInches,
    previewScale,
    referenceWidthInches,
    sizeLabels,
    sourceObjectUrl,
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
          aria-label={`Print layout preview, page ${activePageIndex + 1} of ${layoutResult.pages.length}, ${layoutResult.placedItems} photos placed`}
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
