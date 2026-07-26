"use client";

import {
  Copy,
  FilePlus2,
  Pencil,
  RotateCw,
  Scissors,
  Tags,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

import { CustomPaperDialog } from "@/components/editor/custom-paper-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/class-names";
import type { MeasurementUnit } from "@/lib/layout-engine/types";
import {
  fromInches,
  roundMeasurementForDisplay,
} from "@/lib/paper/conversions";
import { paperPresets } from "@/lib/paper/presets";
import { calculatePrintableArea } from "@/lib/paper/printable-area";
import type { PaperSettingsFormValues } from "@/lib/paper/schemas";
import type {
  CustomPaperPreset,
  NewCustomPaperPreset,
} from "@/lib/paper/types";
import { useEditorStore } from "@/stores/editor-store";

type DialogState =
  | { mode: "create" }
  | { mode: "edit"; presetId: string }
  | null;

type PaperNumberFieldProps = {
  label: string;
  value: number;
  unit: MeasurementUnit;
  min?: number;
  onCommit: (value: number) => void;
};

function PaperNumberField({
  label,
  value,
  unit,
  min = 0,
  onCommit,
}: PaperNumberFieldProps) {
  const displayValue = roundMeasurementForDisplay(value, unit);
  return (
    <label className="block text-[11px] font-medium text-[var(--gray-600)]">
      {label}
      <span className="relative mt-1.5 block">
        <input
          key={`${label}-${displayValue}`}
          type="number"
          defaultValue={displayValue}
          min={min}
          step="any"
          inputMode="decimal"
          className="h-9 w-full rounded-md border border-[var(--gray-200)] bg-[var(--gray-50)] px-2.5 pr-9 text-xs text-[var(--ink)]"
          aria-label={label}
          onBlur={(event) => onCommit(Number(event.currentTarget.value))}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              event.currentTarget.blur();
            }
          }}
        />
        <span className="font-technical pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] uppercase text-[var(--gray-500)]">
          {unit}
        </span>
      </span>
    </label>
  );
}

function toPresetInput(
  values: PaperSettingsFormValues,
): NewCustomPaperPreset {
  return {
    name: values.name,
    width: values.width,
    height: values.height,
    unit: values.unit,
    orientation: values.orientation,
    margin: values.margin,
    horizontalSpacing: values.horizontalSpacing,
    verticalSpacing: values.verticalSpacing,
    cuttingGuidesEnabled: values.cuttingGuidesEnabled,
    sizeLabelsEnabled: values.sizeLabelsEnabled,
    allowPhotoRotation: values.allowPhotoRotation,
    autoArrangeMode: values.autoArrangeMode,
  };
}

function customPresetToFormValues(
  preset: CustomPaperPreset,
): PaperSettingsFormValues {
  return toPresetInput(preset);
}

export function PaperSettingsPanel() {
  const paper = useEditorStore((state) => state.paper);
  const customPaperPresets = useEditorStore(
    (state) => state.customPaperPresets,
  );
  const layoutError = useEditorStore((state) => state.layoutError);
  const setPaperPreset = useEditorStore((state) => state.setPaperPreset);
  const setPaperName = useEditorStore((state) => state.setPaperName);
  const setPaperDimensions = useEditorStore(
    (state) => state.setPaperDimensions,
  );
  const setPaperUnit = useEditorStore((state) => state.setPaperUnit);
  const setPaperOrientation = useEditorStore(
    (state) => state.setPaperOrientation,
  );
  const setPaperMargin = useEditorStore((state) => state.setPaperMargin);
  const setHorizontalSpacing = useEditorStore(
    (state) => state.setHorizontalSpacing,
  );
  const setVerticalSpacing = useEditorStore(
    (state) => state.setVerticalSpacing,
  );
  const setCuttingGuidesEnabled = useEditorStore(
    (state) => state.setCuttingGuidesEnabled,
  );
  const setSizeLabelsEnabled = useEditorStore(
    (state) => state.setSizeLabelsEnabled,
  );
  const setGlobalPhotoRotation = useEditorStore(
    (state) => state.setGlobalPhotoRotation,
  );
  const setAutoArrangeMode = useEditorStore(
    (state) => state.setAutoArrangeMode,
  );
  const saveCustomPaperPreset = useEditorStore(
    (state) => state.saveCustomPaperPreset,
  );
  const updateCustomPaperPreset = useEditorStore(
    (state) => state.updateCustomPaperPreset,
  );
  const duplicateCustomPaperPreset = useEditorStore(
    (state) => state.duplicateCustomPaperPreset,
  );
  const removeCustomPaperPreset = useEditorStore(
    (state) => state.removeCustomPaperPreset,
  );
  const applyCustomPaperPreset = useEditorStore(
    (state) => state.applyCustomPaperPreset,
  );
  const [dialogState, setDialogState] = useState<DialogState>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const printableArea = calculatePrintableArea(paper);
  const editingPreset =
    dialogState?.mode === "edit"
      ? customPaperPresets.find(
          (preset) => preset.id === dialogState.presetId,
        )
      : undefined;
  const dialogDefaults = useMemo<PaperSettingsFormValues>(() => {
    if (editingPreset) {
      return customPresetToFormValues(editingPreset);
    }
    return {
      name:
        paper.presetId === null || paper.presetId.startsWith("custom-paper-")
          ? paper.name
          : `${paper.name} Custom`,
      width: paper.width,
      height: paper.height,
      unit: paper.unit,
      orientation: paper.orientation,
      margin: paper.margin,
      horizontalSpacing: paper.horizontalSpacing,
      verticalSpacing: paper.verticalSpacing,
      cuttingGuidesEnabled: paper.cuttingGuidesEnabled,
      sizeLabelsEnabled: paper.sizeLabelsEnabled,
      allowPhotoRotation: paper.allowPhotoRotation,
      autoArrangeMode: paper.autoArrangeMode,
    };
  }, [editingPreset, paper]);

  function selectPreset(presetId: string): void {
    setPaperPreset(presetId);
    if (presetId === "custom") {
      setDialogState({ mode: "create" });
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="micro-label">04 — output</p>
              <h2 className="mt-1 font-semibold text-[var(--ink)]">
                Paper settings
              </h2>
            </div>
            {paper.presetId === null ? (
              <span className="rounded-full border border-[var(--gray-300)] px-2 py-1 font-technical text-[9px] uppercase text-[var(--gray-500)]">
                Modified
              </span>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <p className="micro-label mb-2">Paper presets</p>
            <div className="grid grid-cols-2 gap-2">
              {paperPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => selectPreset(preset.id)}
                  className={cn(
                    "min-h-16 rounded-lg border px-3 py-2 text-left transition-colors",
                    paper.presetId === preset.id
                      ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--inverted-ink)]"
                      : "border-[var(--gray-200)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--gray-50)]",
                  )}
                  aria-pressed={paper.presetId === preset.id}
                  aria-label={`Use ${preset.name} paper`}
                >
                  <span className="block text-[11px] font-semibold">
                    {preset.name}
                  </span>
                  <span className="font-technical mt-1 block text-[8px] uppercase opacity-65">
                    {preset.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-[var(--gray-200)] pt-4">
            <label className="block text-[11px] font-medium text-[var(--gray-600)]">
              Paper name
              <input
                key={paper.name}
                defaultValue={paper.name}
                className="mt-1.5 h-9 w-full rounded-md border border-[var(--gray-200)] bg-[var(--gray-50)] px-2.5 text-xs text-[var(--ink)]"
                aria-label="Paper name"
                onBlur={(event) => setPaperName(event.currentTarget.value)}
              />
            </label>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <PaperNumberField
                label="Paper width"
                value={paper.width}
                unit={paper.unit}
                min={0.001}
                onCommit={(width) =>
                  setPaperDimensions(
                    width,
                    paper.height,
                    paper.unit,
                  )
                }
              />
              <PaperNumberField
                label="Paper height"
                value={paper.height}
                unit={paper.unit}
                min={0.001}
                onCommit={(height) =>
                  setPaperDimensions(
                    paper.width,
                    height,
                    paper.unit,
                  )
                }
              />
            </div>
            <label className="mt-3 block text-[11px] font-medium text-[var(--gray-600)]">
              Measurement unit
              <select
                value={paper.unit}
                onChange={(event) =>
                  setPaperUnit(event.target.value as MeasurementUnit)
                }
                className="mt-1.5 h-9 w-full rounded-md border border-[var(--gray-200)] bg-[var(--gray-50)] px-2.5 text-xs text-[var(--ink)]"
                aria-label="Measurement unit"
              >
                <option value="in">Inches</option>
                <option value="cm">Centimeters</option>
                <option value="mm">Millimeters</option>
              </select>
            </label>
          </div>

          <div>
            <p className="micro-label mb-2">Orientation</p>
            <div className="grid grid-cols-2 gap-2">
              {(["portrait", "landscape"] as const).map(
                (orientation) => (
                  <Button
                    key={orientation}
                    type="button"
                    variant={
                      paper.orientation === orientation
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => setPaperOrientation(orientation)}
                    aria-pressed={paper.orientation === orientation}
                  >
                    {orientation}
                  </Button>
                ),
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <PaperNumberField
              label="Margin"
              value={paper.margin}
              unit={paper.unit}
              onCommit={setPaperMargin}
            />
            <span aria-hidden="true" />
            <PaperNumberField
              label="Horizontal spacing"
              value={paper.horizontalSpacing}
              unit={paper.unit}
              onCommit={setHorizontalSpacing}
            />
            <PaperNumberField
              label="Vertical spacing"
              value={paper.verticalSpacing}
              unit={paper.unit}
              onCommit={setVerticalSpacing}
            />
          </div>

          {layoutError ? (
            <div
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
              role="alert"
            >
              {layoutError}
            </div>
          ) : null}

          <div className="rounded-lg border border-[var(--gray-200)] bg-[var(--gray-50)] p-3">
            <p className="micro-label">Printable area</p>
            <p className="mt-1 text-xs font-medium text-[var(--ink)]">
              {roundMeasurementForDisplay(
                fromInches(
                  printableArea.printableWidthInches,
                  paper.unit,
                ),
                paper.unit,
              )}{" "}
              ×{" "}
              {roundMeasurementForDisplay(
                fromInches(
                  printableArea.printableHeightInches,
                  paper.unit,
                ),
                paper.unit,
              )}{" "}
              {paper.unit}
            </p>
          </div>

          <div>
            <p className="micro-label mb-2">Preview details</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={
                  paper.cuttingGuidesEnabled ? "default" : "outline"
                }
                size="sm"
                onClick={() =>
                  setCuttingGuidesEnabled(
                    !paper.cuttingGuidesEnabled,
                  )
                }
                aria-pressed={paper.cuttingGuidesEnabled}
              >
                <Scissors className="size-3.5" />
                Guides
              </Button>
              <Button
                type="button"
                variant={
                  paper.sizeLabelsEnabled ? "default" : "outline"
                }
                size="sm"
                onClick={() =>
                  setSizeLabelsEnabled(!paper.sizeLabelsEnabled)
                }
                aria-pressed={paper.sizeLabelsEnabled}
              >
                <Tags className="size-3.5" />
                Labels
              </Button>
              <Button
                type="button"
                variant={
                  paper.allowPhotoRotation ? "default" : "outline"
                }
                size="sm"
                className="col-span-2"
                onClick={() =>
                  setGlobalPhotoRotation(!paper.allowPhotoRotation)
                }
                aria-pressed={paper.allowPhotoRotation}
              >
                <RotateCw className="size-3.5" />
                Auto-rotate eligible sizes
              </Button>
            </div>
          </div>

          <div>
            <p className="micro-label mb-2">Arrange mode</p>
            <div className="grid grid-cols-2 gap-2">
              {(["auto", "grid"] as const).map((mode) => (
                <Button
                  key={mode}
                  type="button"
                  variant={
                    paper.autoArrangeMode === mode
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => setAutoArrangeMode(mode)}
                  aria-pressed={paper.autoArrangeMode === mode}
                >
                  {mode}
                </Button>
              ))}
            </div>
            <p className="mt-2 text-[10px] leading-4 text-[var(--gray-500)]">
              Grid uses the current deterministic row-packing foundation.
            </p>
          </div>

          <div className="border-t border-[var(--gray-200)] pt-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="micro-label">Reusable custom presets</p>
                <p className="mt-1 text-[10px] text-[var(--gray-500)]">
                  Stored in frontend memory only.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => setDialogState({ mode: "create" })}
              >
                <FilePlus2 className="size-3" />
                Save current
              </Button>
            </div>

            {feedback ? (
              <p
                className="mt-3 rounded-lg border border-[var(--gray-300)] bg-[var(--ink)] px-3 py-2 text-xs text-[var(--inverted-ink)]"
                role="status"
              >
                {feedback}
              </p>
            ) : null}

            {customPaperPresets.length === 0 ? (
              <div className="mt-3 rounded-lg border border-dashed border-[var(--gray-300)] p-3 text-center">
                <p className="text-xs font-medium text-[var(--ink)]">
                  No saved custom paper
                </p>
                <p className="mt-1 text-[10px] text-[var(--gray-500)]">
                  Configure the current paper, then save it for reuse.
                </p>
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {customPaperPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className={cn(
                      "rounded-lg border p-2.5",
                      paper.presetId === preset.id
                        ? "border-[var(--ink)]"
                        : "border-[var(--gray-200)]",
                    )}
                  >
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => {
                        applyCustomPaperPreset(preset.id);
                        setFeedback(`${preset.name} applied.`);
                      }}
                      aria-label={`Apply ${preset.name}`}
                    >
                      <span className="block text-xs font-semibold text-[var(--ink)]">
                        {preset.name}
                      </span>
                      <span className="font-technical mt-1 block text-[9px] uppercase text-[var(--gray-500)]">
                        {roundMeasurementForDisplay(
                          preset.width,
                          preset.unit,
                        )}{" "}
                        ×{" "}
                        {roundMeasurementForDisplay(
                          preset.height,
                          preset.unit,
                        )}{" "}
                        {preset.unit}
                      </span>
                    </button>
                    <div className="mt-2 grid grid-cols-3 gap-1 border-t border-[var(--gray-200)] pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setDialogState({
                            mode: "edit",
                            presetId: preset.id,
                          })
                        }
                        aria-label={`Edit ${preset.name}`}
                      >
                        <Pencil className="size-3" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          duplicateCustomPaperPreset(preset.id);
                          setFeedback(`${preset.name} duplicated.`);
                        }}
                        aria-label={`Duplicate ${preset.name}`}
                      >
                        <Copy className="size-3" />
                        Copy
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          removeCustomPaperPreset(preset.id);
                          setFeedback(`${preset.name} deleted.`);
                        }}
                        aria-label={`Delete ${preset.name}`}
                      >
                        <Trash2 className="size-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {dialogState ? (
        <CustomPaperDialog
          key={
            dialogState.mode === "edit"
              ? dialogState.presetId
              : `create-${paper.name}`
          }
          open
          mode={dialogState.mode}
          defaultValues={dialogDefaults}
          onOpenChange={(open) => {
            if (!open) {
              setDialogState(null);
            }
          }}
          onSubmit={(values) => {
            if (dialogState.mode === "edit") {
              const updated = updateCustomPaperPreset(
                dialogState.presetId,
                toPresetInput(values),
              );
              if (updated) {
                setFeedback(`${values.name} updated.`);
              }
              return updated;
            }
            const savedId = saveCustomPaperPreset(
              toPresetInput(values),
            );
            if (savedId) {
              setFeedback(`${values.name} saved.`);
            }
            return Boolean(savedId);
          }}
        />
      ) : null}
    </>
  );
}
