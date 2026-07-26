"use client";

import { photoSizePresets } from "@/features/editor/photo-sizes/presets";
import { formatPhotoDimensions } from "@/features/editor/photo-sizes/conversions";

type PhotoSizeSelectorProps = {
  onAddPreset: (presetId: string) => void;
  onAddCustom: () => void;
};

export function PhotoSizeSelector({
  onAddPreset,
  onAddCustom,
}: PhotoSizeSelectorProps) {
  return (
    <div>
      <p className="micro-label mb-2">Standard sizes</p>
      <div className="grid grid-cols-2 gap-2">
        {photoSizePresets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => {
              if (preset.category === "custom") {
                onAddCustom();
              } else {
                onAddPreset(preset.id);
              }
            }}
            className="min-h-20 rounded-lg border border-[var(--gray-200)] bg-[var(--surface)] px-3 py-2.5 text-left hover:bg-[var(--gray-50)]"
            aria-label={
              preset.category === "custom"
                ? "Add custom photo size"
                : `Add ${preset.name} photo size`
            }
          >
            <span className="flex items-start justify-between gap-2">
              <span className="text-xs font-semibold text-[var(--ink)]">
                {preset.name}
              </span>
            </span>
            <span className="font-technical mt-1 block text-[9px] uppercase tracking-wide text-[var(--gray-500)]">
              {preset.category === "custom"
                ? preset.description
                : formatPhotoDimensions(
                    preset.width,
                    preset.height,
                    preset.unit,
                  )}
            </span>
            {preset.category !== "custom" ? (
              <span className="mt-1 block text-[10px] leading-4 text-[var(--gray-500)]">
                {preset.description}
              </span>
            ) : null}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[11px] leading-5 text-[var(--gray-500)]">
        Country-specific passport presets will be added in a later phase.
      </p>
    </div>
  );
}
