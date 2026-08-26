"use client";

import { useEffect, useRef, useState } from "react";

import { drawLayoutPreview } from "@/lib/canvas/draw-layout-preview";
import type {
  CropMode,
  CropState,
  SourcePhoto,
} from "@/features/editor/types";
import type { LayoutResult } from "@/lib/layout-engine/types";
import type { NameplateSettings } from "@/lib/nameplates/types";

type LayoutCanvasProps = {
  paperWidthInches: number;
  paperHeightInches: number;
  marginInches: number;
  layoutResult: LayoutResult | null;
  activePageIndex: number;
  previewScale: number;
  sourceObjectUrl: string | null;
  sourcePhotos?: SourcePhoto[];
  itemSourcePhotoIds?: Readonly<Record<string, string | undefined>>;
  crop: CropState;
  cropMode: CropMode;
  referenceWidthInches: number;
  cuttingGuides: boolean;
  sizeLabels: boolean;
  backgroundMode: "original" | "transparent" | "solid";
  backgroundColor: string;
  backgroundRemoved: boolean;
  itemLabels: Readonly<Record<string, string>>;
  itemNameplates: Readonly<Record<string, NameplateSettings | undefined>>;
};

type PreviewPanOffset = {
  x: number;
  y: number;
};

type PreviewDragState = {
  pointerId: number;
  startX: number;
  startY: number;
  origin: PreviewPanOffset;
};

function clampPreviewPan(
  offset: PreviewPanOffset,
  viewportWidth: number,
  viewportHeight: number,
  paperWidthInches: number,
  paperHeightInches: number,
  previewScale: number,
): PreviewPanOffset {
  const padding = 32;
  const fitScale = Math.min(
    (viewportWidth - padding * 2) / paperWidthInches,
    (viewportHeight - padding * 2) / paperHeightInches,
  );
  const paperWidth = paperWidthInches * fitScale * previewScale;
  const paperHeight = paperHeightInches * fitScale * previewScale;
  const maxX = Math.max((paperWidth - viewportWidth) / 2 + padding, 0);
  const maxY = Math.max(
    (paperHeight - viewportHeight) / 2 + padding,
    0,
  );

  return {
    x: Math.max(-maxX, Math.min(offset.x, maxX)),
    y: Math.max(-maxY, Math.min(offset.y, maxY)),
  };
}

export function LayoutCanvas(props: LayoutCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedPhotoRef = useRef<{
    objectUrl: string;
    image: HTMLImageElement;
    width: number;
    height: number;
  } | null>(null);
  const loadedPhotosRef = useRef<
    Map<
      string,
      {
        objectUrl: string;
        image: HTMLImageElement;
        width: number;
        height: number;
      }
    >
  >(new Map());
  const [imageRevision, setImageRevision] = useState(0);
  const [panOffset, setPanOffset] = useState<PreviewPanOffset>({
    x: 0,
    y: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef<PreviewDragState | null>(null);
  const {
    paperWidthInches,
    paperHeightInches,
    marginInches,
    layoutResult,
    activePageIndex,
    previewScale,
    sourceObjectUrl,
    sourcePhotos = [],
    itemSourcePhotoIds = {},
    crop,
    cropMode,
    referenceWidthInches,
    cuttingGuides,
    sizeLabels,
    backgroundMode,
    backgroundColor,
    backgroundRemoved,
    itemLabels,
    itemNameplates,
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
    let isActive = true;
    const loadedPhotos = loadedPhotosRef.current;
    const activeIds = new Set(sourcePhotos.map((photo) => photo.id));
    for (const id of loadedPhotos.keys()) {
      if (!activeIds.has(id)) {
        loadedPhotos.delete(id);
      }
    }

    const images = sourcePhotos.map((photo) => {
      const current = loadedPhotos.get(photo.id);
      if (current?.objectUrl === photo.objectUrl) {
        return null;
      }
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        if (!isActive) {
          return;
        }
        loadedPhotos.set(photo.id, {
          objectUrl: photo.objectUrl,
          image,
          width: image.naturalWidth,
          height: image.naturalHeight,
        });
        setImageRevision((revision) => revision + 1);
      };
      image.src = photo.objectUrl;
      return image;
    });

    return () => {
      isActive = false;
      images.forEach((image) => {
        if (image) {
          image.onload = null;
          image.onerror = null;
        }
      });
    };
  }, [sourcePhotos]);

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
      const photos = Object.fromEntries(
        sourcePhotos.flatMap((sourcePhoto) => {
          const loaded = loadedPhotosRef.current.get(sourcePhoto.id);
          return loaded?.objectUrl === sourcePhoto.objectUrl
            ? [
                [
                  sourcePhoto.id,
                  {
                    image: loaded.image,
                    sourceWidth: loaded.width,
                    sourceHeight: loaded.height,
                    crop: sourcePhoto.crop,
                    cropMode: sourcePhoto.cropMode,
                    referenceWidthInches,
                  },
                ],
              ]
            : [];
        }),
      );
      const clampedPanOffset = clampPreviewPan(
        panOffset,
        viewportWidth,
        viewportHeight,
        paperWidthInches,
        paperHeightInches,
        previewScale,
      );
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
        panOffsetX: clampedPanOffset.x,
        panOffsetY: clampedPanOffset.y,
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
        photos,
        itemSourcePhotoIds,
        cuttingGuides,
        sizeLabels,
        backgroundMode,
        backgroundColor,
        backgroundRemoved,
        itemLabels,
        itemNameplates,
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
    backgroundColor,
    backgroundMode,
    backgroundRemoved,
    crop,
    cropMode,
    cuttingGuides,
    imageRevision,
    itemLabels,
    itemNameplates,
    itemSourcePhotoIds,
    layoutResult,
    marginInches,
    paperHeightInches,
    paperWidthInches,
    panOffset,
    previewScale,
    referenceWidthInches,
    sizeLabels,
    sourceObjectUrl,
    sourcePhotos,
  ]);

  function updatePanOffset(
    nextOffset: PreviewPanOffset,
  ): void {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    setPanOffset(
      clampPreviewPan(
        nextOffset,
        container.clientWidth,
        container.clientHeight,
        paperWidthInches,
        paperHeightInches,
        previewScale,
      ),
    );
  }

  function finishDragging(
    pointerId: number,
    target: HTMLCanvasElement,
  ): void {
    if (dragStateRef.current?.pointerId !== pointerId) {
      return;
    }
    if (target.hasPointerCapture(pointerId)) {
      target.releasePointerCapture(pointerId);
    }
    dragStateRef.current = null;
    setIsDragging(false);
  }

  return (
    <div
      ref={containerRef}
      className="relative h-[clamp(520px,65vh,760px)] w-full overflow-hidden rounded-xl border border-[var(--gray-200)] bg-[var(--background)]"
      data-preview-surface="plain"
      data-nameplate-count={
        Object.values(itemNameplates).filter(
          (settings) => settings?.enabled,
        ).length
      }
    >
      {layoutResult && layoutResult.pages.length > 0 ? (
        <>
          <canvas
            ref={canvasRef}
            className={`block size-full touch-none outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ink)] ${
              previewScale > 1
                ? isDragging
                  ? "cursor-grabbing"
                  : "cursor-grab"
                : "cursor-default"
            }`}
            role="img"
            tabIndex={previewScale > 1 ? 0 : -1}
            data-paper-width-inches={paperWidthInches}
            data-paper-height-inches={paperHeightInches}
            data-cutting-guides={cuttingGuides}
            data-size-labels={sizeLabels}
            data-preview-scale={previewScale}
            data-pan-x={panOffset.x}
            data-pan-y={panOffset.y}
            aria-label={`Print layout preview, page ${activePageIndex + 1} of ${layoutResult.pages.length}, ${layoutResult.placedItems} photos placed${previewScale > 1 ? ". Drag or use arrow keys to pan." : ""}`}
            onPointerDown={(event) => {
              if (previewScale <= 1) {
                return;
              }
              event.currentTarget.setPointerCapture(event.pointerId);
              dragStateRef.current = {
                pointerId: event.pointerId,
                startX: event.clientX,
                startY: event.clientY,
                origin: panOffset,
              };
              setIsDragging(true);
            }}
            onPointerMove={(event) => {
              const dragState = dragStateRef.current;
              if (
                !dragState ||
                dragState.pointerId !== event.pointerId
              ) {
                return;
              }
              updatePanOffset({
                x:
                  dragState.origin.x +
                  event.clientX -
                  dragState.startX,
                y:
                  dragState.origin.y +
                  event.clientY -
                  dragState.startY,
              });
            }}
            onPointerUp={(event) =>
              finishDragging(event.pointerId, event.currentTarget)
            }
            onPointerCancel={(event) =>
              finishDragging(event.pointerId, event.currentTarget)
            }
            onKeyDown={(event) => {
              if (previewScale <= 1) {
                return;
              }
              const step = event.shiftKey ? 48 : 20;
              const movement = {
                ArrowLeft: { x: step, y: 0 },
                ArrowRight: { x: -step, y: 0 },
                ArrowUp: { x: 0, y: step },
                ArrowDown: { x: 0, y: -step },
              }[event.key];
              if (movement) {
                event.preventDefault();
                updatePanOffset({
                  x: panOffset.x + movement.x,
                  y: panOffset.y + movement.y,
                });
              } else if (event.key === "Home") {
                event.preventDefault();
                updatePanOffset({ x: 0, y: 0 });
              }
            }}
          />
          {previewScale > 1 ? (
            <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-[var(--gray-300)] bg-[var(--background)] px-3 py-1.5 font-technical text-[9px] uppercase tracking-wider text-[var(--gray-600)] shadow-sm">
              Drag to pan · Home to center
            </div>
          ) : null}
        </>
      ) : (
        <div className="flex size-full items-center justify-center p-8 text-center">
          <div>
            <p className="font-medium text-[var(--gray-700)]">
              {layoutResult && layoutResult.totalItems > 0
                ? "No photo sizes fit the selected paper"
                : "Your layout preview will appear here"}
            </p>
            <p className="mt-1 text-sm text-[var(--gray-500)]">
              {layoutResult && layoutResult.totalItems > 0
                ? "Edit the selected dimensions or choose a larger paper preset."
                : "Add a standard or custom photo size to generate a layout."}
            </p>
            {layoutResult && layoutResult.totalItems > 0 ? null : (
              <p className="mt-1 text-xs text-[var(--gray-400)]">
                Or ask your agent to arrange the layout for you.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
