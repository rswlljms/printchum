"use client";

import { useEffect, useRef } from "react";

import type {
  CropMode,
  CropState,
  SourcePhoto,
} from "@/features/editor/types";
import { drawLayoutPreview } from "@/lib/canvas/draw-layout-preview";
import type { LayoutResult } from "@/lib/layout-engine/types";
import type { NameplateSettings } from "@/lib/nameplates/types";

type PrintPreviewCanvasProps = {
  paperWidthInches: number;
  paperHeightInches: number;
  marginInches: number;
  layoutResult: LayoutResult;
  pageIndex: number;
  sourcePhotos: SourcePhoto[];
  itemSourcePhotoIds: Readonly<Record<string, string | undefined>>;
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

export function PrintPreviewCanvas({
  paperWidthInches,
  paperHeightInches,
  marginInches,
  layoutResult,
  pageIndex,
  sourcePhotos,
  itemSourcePhotoIds,
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
}: PrintPreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    let cancelled = false;
    const images = sourcePhotos.map((photo) => {
      const image = new Image();
      image.decoding = "async";
      image.src = photo.objectUrl;
      return { photo, image };
    });
    void Promise.all(
      images.map(
        ({ image }) =>
          new Promise<void>((resolve) => {
            if (image.complete) {
              resolve();
              return;
            }
            image.onload = () => resolve();
            image.onerror = () => resolve();
          }),
      ),
    ).then(() => {
      if (cancelled) {
        return;
      }
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const cssWidth = 720;
      const cssHeight = Math.max(
        Math.round(cssWidth * paperHeightInches / paperWidthInches),
        1,
      );
      canvas.width = Math.round(cssWidth * ratio);
      canvas.height = Math.round(cssHeight * ratio);
      canvas.style.aspectRatio = `${paperWidthInches} / ${paperHeightInches}`;
      const context = canvas.getContext("2d");
      if (!context) {
        return;
      }
      const photos = Object.fromEntries(
        images
          .filter(({ image }) => image.naturalWidth > 0)
          .map(({ photo, image }) => [
            photo.id,
            {
              image,
              sourceWidth: image.naturalWidth,
              sourceHeight: image.naturalHeight,
              crop: photo.crop,
              cropMode: photo.cropMode,
              referenceWidthInches,
            },
          ]),
      );
      drawLayoutPreview({
        context,
        viewportWidth: canvas.width,
        viewportHeight: canvas.height,
        paperWidthInches,
        paperHeightInches,
        marginInches,
        layoutResult,
        activePageIndex: pageIndex,
        previewScale: 1,
        photo: null,
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
    });
    return () => {
      cancelled = true;
      images.forEach(({ image }) => {
        image.onload = null;
        image.onerror = null;
        image.src = "";
      });
    };
  }, [
    backgroundColor,
    backgroundMode,
    backgroundRemoved,
    crop,
    cropMode,
    cuttingGuides,
    itemLabels,
    itemNameplates,
    itemSourcePhotoIds,
    layoutResult,
    marginInches,
    pageIndex,
    paperHeightInches,
    paperWidthInches,
    referenceWidthInches,
    sizeLabels,
    sourcePhotos,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="block max-h-[calc(100vh-12rem)] w-auto max-w-full bg-white shadow-[0_24px_70px_-30px_rgba(0,0,0,0.55)]"
      aria-label={`Print preview page ${pageIndex + 1}`}
    />
  );
}
