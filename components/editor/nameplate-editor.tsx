"use client";

import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
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

  return (
    <Dialog
      open
      onOpenChange={onOpenChange}
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
            <Button
              type="button"
              className="mt-4"
              onClick={() => setEnabled(item.id, true)}
            >
              Enable Nameplate
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <label className="block text-xs font-medium">
              Preset
              <Select
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
              </Select>
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
                <Select
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
                </Select>
              </label>
              <label className="text-xs font-medium">
                Alignment
                <Select
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
                </Select>
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
                  <Select
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
                  </Select>
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
