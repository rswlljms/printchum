"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { passportPresetInputSchema } from "@/lib/passport-presets/schemas";
import type {
  NewPassportPreset,
  PassportPreset,
} from "@/lib/passport-presets/types";

type PassportPresetFormInput = z.input<
  typeof passportPresetInputSchema
>;
type PassportPresetFormValues = z.output<
  typeof passportPresetInputSchema
>;

type PassportPresetFormProps = {
  open: boolean;
  preset: PassportPreset | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: NewPassportPreset) => boolean;
};

const fieldClassName =
  "mt-1.5 h-10 w-full rounded-md border border-[var(--gray-200)] bg-[var(--gray-50)] px-3 text-sm";

function createFormDefaults(
  preset: PassportPreset | null,
): PassportPresetFormInput {
  return {
    countryName: preset?.countryName ?? "",
    countryCode: preset?.countryCode ?? "",
    documentType: "passport",
    name: preset?.name ?? "",
    width: preset?.width ?? 35,
    height: preset?.height ?? 45,
    unit: preset?.unit ?? "mm",
    allowedBackgroundColors:
      preset?.allowedBackgroundColors ?? ["#ffffff"],
    defaultBackgroundColor:
      preset?.defaultBackgroundColor ?? "#ffffff",
    headHeightMin: preset?.headHeightMin,
    headHeightMax: preset?.headHeightMax,
    headHeightUnit: preset?.headHeightUnit,
    eyeLineMin: preset?.eyeLineMin,
    eyeLineMax: preset?.eyeLineMax,
    eyeLineUnit: preset?.eyeLineUnit,
    notes: preset?.notes ?? "",
    officialSourceUrl: preset?.officialSourceUrl ?? "",
    lastVerifiedAt: preset?.lastVerifiedAt ?? "",
    isFavorite: preset?.isFavorite ?? false,
  };
}

export function PassportPresetForm({
  open,
  preset,
  onOpenChange,
  onSubmit,
}: PassportPresetFormProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<
    PassportPresetFormInput,
    unknown,
    PassportPresetFormValues
  >({
    resolver: zodResolver(passportPresetInputSchema),
    defaultValues: createFormDefaults(preset),
  });
  const colors =
    useWatch({ control, name: "allowedBackgroundColors" }) ?? [];

  useEffect(() => {
    if (open) {
      reset(createFormDefaults(preset));
    }
  }, [open, preset, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <p className="micro-label">
            {preset ? "Edit custom preset" : "Create custom preset"}
          </p>
          <DialogTitle>
            {preset ? `Edit ${preset.name}` : "Create Custom Preset"}
          </DialogTitle>
          <DialogDescription>
            Store preparation metadata only. Customer photos and crop data are
            never included.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((values) => {
            if (onSubmit(values)) {
              onOpenChange(false);
            }
          })}
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["countryName", "Country name"],
              ["countryCode", "Country code"],
              ["name", "Preset name"],
            ].map(([field, label]) => (
              <label
                key={field}
                className={
                  field === "name"
                    ? "block text-xs font-medium sm:col-span-2"
                    : "block text-xs font-medium"
                }
              >
                {label}
                <input
                  {...register(
                    field as "countryName" | "countryCode" | "name",
                  )}
                  className={fieldClassName}
                  aria-invalid={Boolean(
                    errors[
                      field as "countryName" | "countryCode" | "name"
                    ],
                  )}
                />
              </label>
            ))}
            <label className="block text-xs font-medium">
              Width
              <input
                {...register("width")}
                type="number"
                step="any"
                className={fieldClassName}
                aria-invalid={Boolean(errors.width)}
              />
            </label>
            <label className="block text-xs font-medium">
              Height
              <input
                {...register("height")}
                type="number"
                step="any"
                className={fieldClassName}
                aria-invalid={Boolean(errors.height)}
              />
            </label>
            <label className="block text-xs font-medium sm:col-span-2">
              Unit
              <select {...register("unit")} className={fieldClassName}>
                <option value="in">Inches</option>
                <option value="cm">Centimeters</option>
                <option value="mm">Millimeters</option>
              </select>
            </label>

            <fieldset className="space-y-2 sm:col-span-2">
              <legend className="text-xs font-medium">
                Allowed background colors
              </legend>
              {colors.map((color, index) => (
                <div
                  key={`${index}-${color}`}
                  className="flex items-center gap-2"
                >
                  <input
                    type="color"
                    value={color}
                    onChange={(event) => {
                      const next = [...colors];
                      next[index] = event.target.value;
                      setValue("allowedBackgroundColors", next, {
                        shouldValidate: true,
                      });
                    }}
                    className="h-10 w-14 rounded-md border border-[var(--gray-200)] p-1"
                    aria-label={`Allowed background color ${index + 1}`}
                  />
                  <code className="flex-1 text-xs">{color}</code>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={colors.length <= 1}
                    onClick={() =>
                      setValue(
                        "allowedBackgroundColors",
                        colors.filter(
                          (_candidate, colorIndex) =>
                            colorIndex !== index,
                        ),
                        { shouldValidate: true },
                      )
                    }
                    aria-label={`Remove background color ${index + 1}`}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setValue(
                    "allowedBackgroundColors",
                    [...colors, "#eeeeee"],
                    { shouldValidate: true },
                  )
                }
              >
                <Plus className="size-3.5" />
                Add background color
              </Button>
            </fieldset>

            <label className="block text-xs font-medium sm:col-span-2">
              Default background
              <select
                {...register("defaultBackgroundColor")}
                className={fieldClassName}
              >
                {colors.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </label>

            <details className="sm:col-span-2 rounded-xl border border-[var(--gray-200)] p-3">
              <summary className="cursor-pointer text-xs font-semibold">
                Optional guidance and source metadata
              </summary>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  ["headHeightMin", "Head-height minimum"],
                  ["headHeightMax", "Head-height maximum"],
                  ["eyeLineMin", "Eye-line minimum"],
                  ["eyeLineMax", "Eye-line maximum"],
                ].map(([field, label]) => (
                  <label key={field} className="text-xs">
                    {label}
                    <input
                      {...register(
                        field as
                          | "headHeightMin"
                          | "headHeightMax"
                          | "eyeLineMin"
                          | "eyeLineMax",
                      )}
                      type="number"
                      step="any"
                      className={fieldClassName}
                    />
                  </label>
                ))}
                <label className="text-xs">
                  Head-height unit
                  <select
                    {...register("headHeightUnit")}
                    className={fieldClassName}
                  >
                    <option value="">Not set</option>
                    <option value="in">in</option>
                    <option value="cm">cm</option>
                    <option value="mm">mm</option>
                  </select>
                </label>
                <label className="text-xs">
                  Eye-line unit
                  <select
                    {...register("eyeLineUnit")}
                    className={fieldClassName}
                  >
                    <option value="">Not set</option>
                    <option value="in">in</option>
                    <option value="cm">cm</option>
                    <option value="mm">mm</option>
                  </select>
                </label>
                <label className="text-xs sm:col-span-2">
                  Notes
                  <textarea
                    {...register("notes")}
                    className="mt-1.5 min-h-20 w-full rounded-md border border-[var(--gray-200)] bg-[var(--gray-50)] p-3 text-sm"
                  />
                </label>
                <label className="text-xs sm:col-span-2">
                  Official-source URL
                  <input
                    {...register("officialSourceUrl")}
                    type="url"
                    className={fieldClassName}
                  />
                </label>
                <label className="text-xs">
                  Last verified
                  <input
                    {...register("lastVerifiedAt")}
                    type="date"
                    className={fieldClassName}
                  />
                </label>
                <label className="mt-6 flex items-center gap-2 text-xs">
                  <input type="checkbox" {...register("isFavorite")} />
                  Add to favorites
                </label>
              </div>
            </details>
          </div>

          {Object.keys(errors).length > 0 ? (
            <p
              className="mt-4 rounded-lg border border-[var(--ink)] p-3 text-xs"
              role="alert"
            >
              Review the highlighted preset fields and try again.
            </p>
          ) : null}

          <input type="hidden" {...register("documentType")} />
          <DialogFooter className="mt-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {preset ? "Save changes" : "Create Custom Preset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
