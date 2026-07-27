"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PhotoSizeItem } from "@/features/editor/types";
import {
  mayNameplateTextOverflow,
} from "@/lib/nameplates/measurement";
import { nameplatePresets } from "@/lib/nameplates/presets";
import type {
  NameplateFontWeight,
  NameplatePosition,
  NameplatePresetType,
  NameplateTextAlign,
} from "@/lib/nameplates/types";
import { toInches } from "@/lib/paper/conversions";
import { useEditorStore } from "@/stores/editor-store";

type NameplateEditorProps = {
  item: PhotoSizeItem | null;
  onOpenChange: (open: boolean) => void;
};

const fieldClassName =
  "mt-1.5 h-10 w-full rounded-md border border-[var(--gray-200)] bg-[var(--gray-50)] px-3 text-sm";

export function NameplateEditor({
  item,
  onOpenChange,
}: NameplateEditorProps) {
  const setEnabled = useEditorStore(
    (state) => state.setPhotoSizeNameplate,
  );
  const setPreset = useEditorStore(
    (state) => state.setPhotoSizeNameplatePreset,
  );
  const updateNameplate = useEditorStore(
    (state) => state.updatePhotoSizeNameplate,
  );
  const resetNameplate = useEditorStore(
    (state) => state.resetPhotoSizeNameplate,
  );
  const applyToAll = useEditorStore(
    (state) => state.applyNameplateToAllPhotoSizes,
  );
  const [passportWarningPending, setPassportWarningPending] =
    useState(false);

  if (!item) {
    return null;
  }

  const settings = item.nameplate;
  const mayOverflow =
    settings?.enabled &&
    mayNameplateTextOverflow(
      settings,
      toInches(item.width, item.unit),
    );

  function enableNameplate(): void {
    if (!item) {
      return;
    }
    if (item.passportPresetId) {
      setPassportWarningPending(true);
      return;
    }
    setEnabled(item.id, true);
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          setPassportWarningPending(false);
        }
        onOpenChange(open);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <p className="micro-label">Nameplate — {item.name}</p>
          <DialogTitle>Configure nameplate</DialogTitle>
          <DialogDescription>
            Text remains in this browser session and is rendered from the same
            physical layout geometry as the photo.
          </DialogDescription>
        </DialogHeader>

        {!item.nameplateEnabled || !settings?.enabled ? (
          <div className="rounded-xl border border-dashed border-[var(--gray-300)] p-5 text-center">
            <p className="font-semibold">Nameplate disabled</p>
            <p className="mt-1 text-xs leading-5 text-[var(--gray-500)]">
              Enable a nameplate to add names, ID numbers, or department
              information to this photo size.
            </p>
            {passportWarningPending ? (
              <div
                className="mt-4 rounded-lg border border-[var(--ink)] bg-[var(--gray-50)] p-3 text-left"
                role="alert"
              >
                <p className="text-xs font-semibold">
                  Nameplates are normally not part of official passport-photo
                  requirements.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPassportWarningPending(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setEnabled(item.id, true);
                      setPassportWarningPending(false);
                    }}
                  >
                    Enable anyway
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                className="mt-4"
                onClick={enableNameplate}
              >
                Enable Nameplate
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {item.passportPresetId ? (
              <p
                className="rounded-lg border border-[var(--ink)] bg-[var(--gray-50)] p-3 text-xs leading-5"
                role="alert"
              >
                Nameplates are normally not part of official passport-photo
                requirements.
              </p>
            ) : null}
            <label className="block text-xs font-medium">
              Preset
              <select
                value={settings.presetType}
                onChange={(event) =>
                  setPreset(
                    item.id,
                    event.target.value as NameplatePresetType,
                  )
                }
                className={fieldClassName}
              >
                {nameplatePresets.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </label>
            {[
              ["primaryText", "Primary text", settings.primaryText],
              [
                "secondaryText",
                "Secondary text",
                settings.secondaryText ?? "",
              ],
              [
                "thirdLineText",
                "Third line",
                settings.thirdLineText ?? "",
              ],
            ].map(([field, label, value]) => (
              <label key={field} className="block text-xs font-medium">
                {label}
                <input
                  value={value}
                  maxLength={100}
                  onChange={(event) =>
                    updateNameplate(item.id, {
                      [field]: event.target.value,
                    })
                  }
                  className={fieldClassName}
                />
              </label>
            ))}
            {mayOverflow ? (
              <p className="text-xs font-medium" role="alert">
                This text may be too long for the selected photo width.
              </p>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-medium">
                Position
                <select
                  value={settings.position}
                  onChange={(event) =>
                    updateNameplate(item.id, {
                      position: event.target.value as NameplatePosition,
                    })
                  }
                  className={fieldClassName}
                >
                  <option value="bottom-outside">Bottom outside</option>
                  <option value="bottom-inside">Bottom inside</option>
                  <option value="top-outside">Top outside</option>
                  <option value="top-inside">Top inside</option>
                </select>
              </label>
              <label className="text-xs font-medium">
                Alignment
                <select
                  value={settings.textAlign}
                  onChange={(event) =>
                    updateNameplate(item.id, {
                      textAlign: event.target.value as NameplateTextAlign,
                    })
                  }
                  className={fieldClassName}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </label>
            </div>

            <details className="rounded-xl border border-[var(--gray-200)] p-3">
              <summary className="cursor-pointer text-xs font-semibold">
                Advanced style
              </summary>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="text-xs">
                  Font size (pt)
                  <input
                    type="number"
                    min="5"
                    max="72"
                    value={settings.fontSizePoints}
                    onChange={(event) =>
                      updateNameplate(item.id, {
                        fontSizePoints: Number(event.target.value),
                      })
                    }
                    className={fieldClassName}
                  />
                </label>
                <label className="text-xs">
                  Font weight
                  <select
                    value={settings.fontWeight}
                    onChange={(event) =>
                      updateNameplate(item.id, {
                        fontWeight: Number(
                          event.target.value,
                        ) as NameplateFontWeight,
                      })
                    }
                    className={fieldClassName}
                  >
                    {[400, 500, 600, 700].map((weight) => (
                      <option key={weight} value={weight}>
                        {weight}
                      </option>
                    ))}
                  </select>
                </label>
                {[
                  ["textColor", "Text color", settings.textColor],
                  [
                    "backgroundColor",
                    "Background color",
                    settings.backgroundColor,
                  ],
                  ["borderColor", "Border color", settings.borderColor],
                ].map(([field, label, value]) => (
                  <label key={field} className="text-xs">
                    {label}
                    <input
                      type="color"
                      value={value}
                      onChange={(event) =>
                        updateNameplate(item.id, {
                          [field]: event.target.value,
                        })
                      }
                      className="mt-1.5 h-10 w-full rounded-md border border-[var(--gray-200)] p-1"
                    />
                  </label>
                ))}
                {[
                  [
                    "paddingPoints",
                    "Padding (pt)",
                    settings.paddingPoints,
                    0,
                    40,
                    0.5,
                  ],
                  [
                    "lineSpacing",
                    "Line spacing",
                    settings.lineSpacing,
                    0.8,
                    3,
                    0.1,
                  ],
                  [
                    "borderWidthPoints",
                    "Border width (pt)",
                    settings.borderWidthPoints,
                    0,
                    10,
                    0.25,
                  ],
                ].map(([field, label, value, min, max, step]) => (
                  <label key={String(field)} className="text-xs">
                    {label}
                    <input
                      type="number"
                      min={min}
                      max={max}
                      step={step}
                      value={value}
                      onChange={(event) =>
                        updateNameplate(item.id, {
                          [String(field)]: Number(event.target.value),
                        })
                      }
                      className={fieldClassName}
                    />
                  </label>
                ))}
                <label className="col-span-2 flex items-center gap-2 rounded-lg border border-[var(--gray-200)] p-3 text-xs">
                  <input
                    type="checkbox"
                    checked={settings.borderEnabled}
                    onChange={(event) =>
                      updateNameplate(item.id, {
                        borderEnabled: event.target.checked,
                      })
                    }
                  />
                  Draw border
                </label>
              </div>
            </details>
          </div>
        )}

        <DialogFooter className="flex-wrap">
          {item.nameplateEnabled ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => resetNameplate(item.id)}
              >
                <RotateCcw className="size-3.5" />
                Reset
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => applyToAll(item.id)}
              >
                Apply to all sizes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEnabled(item.id, false)}
              >
                Disable
              </Button>
            </>
          ) : null}
          <Button type="button" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
