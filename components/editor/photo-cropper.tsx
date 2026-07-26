"use client";

import { Crosshair, RotateCcw } from "lucide-react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { CropMode } from "@/features/editor/types";
import { cn } from "@/lib/class-names";
import { useEditorStore } from "@/stores/editor-store";

const cropModes: ReadonlyArray<{
  id: CropMode;
  label: string;
  description: string;
}> = [
  {
    id: "keep-head-size",
    label: "Keep head size",
    description: "Preserves your zoom while adapting the frame.",
  },
  {
    id: "fill-frame",
    label: "Fill frame",
    description: "Fills the selected photo size edge to edge.",
  },
  {
    id: "fit-with-padding",
    label: "Fit with padding",
    description: "Keeps the full photo visible inside the frame.",
  },
];

export function PhotoCropper() {
  const sourceObjectUrl = useEditorStore((state) => state.sourceObjectUrl);

  if (!sourceObjectUrl) {
    return null;
  }

  return (
    <PhotoCropperSession
      key={sourceObjectUrl}
      sourceObjectUrl={sourceObjectUrl}
    />
  );
}

type PhotoCropperSessionProps = {
  sourceObjectUrl: string;
};

function PhotoCropperSession({
  sourceObjectUrl,
}: PhotoCropperSessionProps) {
  const crop = useEditorStore((state) => state.crop);
  const cropMode = useEditorStore((state) => state.cropMode);
  const targetSize = useEditorStore((state) => state.photoSizes[0]);
  const setNormalizedCrop = useEditorStore((state) => state.setNormalizedCrop);
  const setCropZoom = useEditorStore((state) => state.setCropZoom);
  const setCropRotation = useEditorStore((state) => state.setCropRotation);
  const setCropMode = useEditorStore((state) => state.setCropMode);
  const resetCrop = useEditorStore((state) => state.resetCrop);
  const [cropPosition, setCropPosition] = useState<Point>({ x: 0, y: 0 });

  const aspect = targetSize && targetSize.height > 0
    ? targetSize.width / targetSize.height
    : 1;
  const selectedMode = cropModes.find((mode) => mode.id === cropMode) ?? cropModes[1];

  function handleCropComplete(croppedArea: Area): void {
    setNormalizedCrop({
      xPercent: croppedArea.x,
      yPercent: croppedArea.y,
      widthPercent: croppedArea.width,
      heightPercent: croppedArea.height,
    });
  }

  return (
    <section className="space-y-4" aria-labelledby="crop-heading">
      <div>
        <p className="micro-label">Crop</p>
        <h3 id="crop-heading" className="mt-1 text-sm font-semibold text-[var(--ink)]">
          Frame the photo
        </h3>
      </div>

      <div className="relative h-72 overflow-hidden rounded-xl bg-[var(--gray-900)]">
        <Cropper
          image={sourceObjectUrl}
          crop={cropPosition}
          zoom={crop.zoom}
          rotation={crop.rotation}
          aspect={aspect}
          objectFit={cropMode === "fit-with-padding" ? "contain" : "cover"}
          onCropChange={setCropPosition}
          onCropComplete={handleCropComplete}
          onZoomChange={setCropZoom}
          onRotationChange={setCropRotation}
          zoomWithScroll
          showGrid
        />
      </div>

      <fieldset>
        <legend className="micro-label mb-2">Crop behavior</legend>
        <div className="grid gap-2">
          {cropModes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setCropMode(mode.id)}
              aria-pressed={cropMode === mode.id}
              className={cn(
                "rounded-lg border px-3 py-2 text-left",
                cropMode === mode.id
                  ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--inverted-ink)]"
                  : "border-[var(--gray-200)] bg-[var(--surface)] text-[var(--gray-700)] hover:bg-[var(--gray-50)]",
              )}
            >
              <span className="block text-xs font-medium">{mode.label}</span>
              <span className="mt-0.5 block text-[10px] leading-4 opacity-70">
                {mode.description}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] leading-5 text-[var(--gray-500)]">
          {selectedMode.description}
        </p>
      </fieldset>

      <div className="space-y-4">
        <label className="block">
          <span className="flex items-center justify-between text-xs text-[var(--gray-600)]">
            <span>Zoom</span>
            <span className="font-technical">{crop.zoom.toFixed(2)}×</span>
          </span>
          <input
            className="mt-2 w-full accent-[var(--ink)]"
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={crop.zoom}
            onChange={(event) => setCropZoom(Number(event.target.value))}
          />
        </label>
        <label className="block">
          <span className="flex items-center justify-between text-xs text-[var(--gray-600)]">
            <span>Rotation</span>
            <span className="font-technical">{Math.round(crop.rotation)}°</span>
          </span>
          <input
            className="mt-2 w-full accent-[var(--ink)]"
            type="range"
            min="-180"
            max="180"
            step="1"
            value={crop.rotation}
            onChange={(event) => setCropRotation(Number(event.target.value))}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setCropPosition({ x: 0, y: 0 })}
        >
          <Crosshair className="size-4" />
          Center
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setCropPosition({ x: 0, y: 0 });
            resetCrop();
          }}
        >
          <RotateCcw className="size-4" />
          Reset crop
        </Button>
      </div>
    </section>
  );
}
