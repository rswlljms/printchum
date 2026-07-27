"use client";

import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPhotoDimensions } from "@/features/editor/photo-sizes/conversions";
import { PASSPORT_PRESET_DISCLAIMER } from "@/lib/passport-presets/presets";
import type { PassportPreset } from "@/lib/passport-presets/types";

type PassportPresetDetailDialogProps = {
  preset: PassportPreset | null;
  favorite: boolean;
  hasPassportItem: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (
    presetId: string,
    mode: "add" | "replace",
  ) => void;
  onDuplicate: (presetId: string) => void;
  onToggleFavorite: (presetId: string) => void;
};

export function PassportPresetDetailDialog({
  preset,
  favorite,
  hasPassportItem,
  onOpenChange,
  onApply,
  onDuplicate,
  onToggleFavorite,
}: PassportPresetDetailDialogProps) {
  return (
    <Dialog
      open={Boolean(preset)}
      onOpenChange={(open) => onOpenChange(open)}
    >
      <DialogContent>
        {preset ? (
          <>
            <DialogHeader>
              <p className="micro-label">
                {preset.countryCode} — {preset.status}
              </p>
              <DialogTitle>{preset.name}</DialogTitle>
              <DialogDescription>
                Review the preparation metadata before adding this size.
              </DialogDescription>
            </DialogHeader>

            <dl className="divide-y divide-[var(--gray-200)] rounded-xl border border-[var(--gray-200)] px-3">
              {[
                [
                  "Dimensions",
                  formatPhotoDimensions(
                    preset.width,
                    preset.height,
                    preset.unit,
                  ),
                ],
                [
                  "Background",
                  preset.allowedBackgroundColors.join(", "),
                ],
                [
                  "Default",
                  preset.defaultBackgroundColor ?? "No preference",
                ],
                [
                  "Last verified",
                  preset.lastVerifiedAt ?? "Not verified",
                ],
                [
                  "Source",
                  preset.officialSourceUrl
                    ? "Official-source placeholder"
                    : "Not provided",
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-4 py-2.5 text-xs"
                >
                  <dt className="font-technical uppercase text-[var(--gray-500)]">
                    {label}
                  </dt>
                  <dd className="text-right text-[var(--ink)]">{value}</dd>
                </div>
              ))}
              {preset.headHeightMin !== undefined ||
              preset.headHeightMax !== undefined ? (
                <div className="flex justify-between gap-4 py-2.5 text-xs">
                  <dt className="font-technical uppercase text-[var(--gray-500)]">
                    Head height
                  </dt>
                  <dd>
                    {preset.headHeightMin ?? "—"}–{preset.headHeightMax ?? "—"}{" "}
                    {preset.headHeightUnit ?? preset.unit}
                  </dd>
                </div>
              ) : null}
              {preset.eyeLineMin !== undefined ||
              preset.eyeLineMax !== undefined ? (
                <div className="flex justify-between gap-4 py-2.5 text-xs">
                  <dt className="font-technical uppercase text-[var(--gray-500)]">
                    Eye line
                  </dt>
                  <dd>
                    {preset.eyeLineMin ?? "—"}–{preset.eyeLineMax ?? "—"}{" "}
                    {preset.eyeLineUnit ?? preset.unit}
                  </dd>
                </div>
              ) : null}
            </dl>

            {preset.notes ? (
              <p className="text-xs leading-5 text-[var(--gray-600)]">
                {preset.notes}
              </p>
            ) : null}
            <p className="rounded-lg border border-[var(--gray-200)] bg-[var(--gray-50)] p-3 text-xs leading-5 text-[var(--gray-600)]">
              {PASSPORT_PRESET_DISCLAIMER}
            </p>
            {preset.defaultBackgroundColor ? (
              <p className="text-xs leading-5 text-[var(--gray-600)]">
                The selected passport preset recommends a specific background.
                Background removal must be completed before a replacement
                background can be applied accurately.
              </p>
            ) : null}

            <DialogFooter className="flex-wrap">
              <Button
                type="button"
                variant="outline"
                onClick={() => onToggleFavorite(preset.id)}
                aria-label={
                  favorite
                    ? `Remove ${preset.name} from favorites`
                    : `Add ${preset.name} to favorites`
                }
              >
                <Star
                  className="size-3.5"
                  fill={favorite ? "currentColor" : "none"}
                />
                {favorite ? "Favorited" : "Favorite"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onDuplicate(preset.id)}
              >
                Duplicate as custom
              </Button>
              {hasPassportItem ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onApply(preset.id, "add")}
                  >
                    Add another
                  </Button>
                  <Button
                    type="button"
                    onClick={() => onApply(preset.id, "replace")}
                    title="Replaces existing passport-derived sizes while preserving unrelated sizes"
                  >
                    Replace existing
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  onClick={() => onApply(preset.id, "add")}
                >
                  Apply preset
                </Button>
              )}
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
