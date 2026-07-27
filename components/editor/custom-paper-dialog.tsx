"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

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
import type { MeasurementUnit } from "@/lib/layout-engine/types";
import { convertMeasurement } from "@/lib/paper/conversions";
import {
  paperSettingsSchema,
  type PaperSettingsFormInput,
  type PaperSettingsFormValues,
} from "@/lib/paper/schemas";

type CustomPaperDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  defaultValues: PaperSettingsFormInput;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: PaperSettingsFormValues) => boolean;
};

const fieldClassName =
  "mt-1.5 h-10 w-full rounded-md border border-[var(--gray-200)] bg-[var(--gray-50)] px-3 text-sm text-[var(--ink)]";

const measurementFields = [
  "width",
  "height",
  "margin",
  "horizontalSpacing",
  "verticalSpacing",
] as const;

export function CustomPaperDialog({
  open,
  mode,
  defaultValues,
  onOpenChange,
  onSubmit,
}: CustomPaperDialogProps) {
  const previousUnit = useRef<MeasurementUnit>(defaultValues.unit);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const {
    control,
    formState: { errors, isSubmitting },
    getValues,
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<
    PaperSettingsFormInput,
    unknown,
    PaperSettingsFormValues
  >({
    resolver: zodResolver(paperSettingsSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      reset(defaultValues);
      previousUnit.current = defaultValues.unit;
    }
  }, [defaultValues, open, reset]);

  const unitRegistration = register("unit");
  const unit = useWatch({ control, name: "unit" });
  const orientation = useWatch({ control, name: "orientation" });
  const autoArrangeMode = useWatch({
    control,
    name: "autoArrangeMode",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <p className="micro-label">
            {mode === "create" ? "Save paper preset" : "Edit paper preset"}
          </p>
          <DialogTitle>
            {mode === "create"
              ? "Save reusable custom paper"
              : "Update custom paper"}
          </DialogTitle>
          <DialogDescription>
            Presets stay in memory for this browser session and contain no
            customer photos.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((values) => {
            if (onSubmit(values)) {
              onOpenChange(false);
            } else {
              setMutationError(
                "A custom paper preset already uses this name.",
              );
            }
          })}
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-medium text-[var(--gray-700)] sm:col-span-2">
              Paper name
              <input
                {...register("name")}
                className={fieldClassName}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={
                  errors.name ? "custom-paper-name-error" : undefined
                }
              />
            </label>
            {errors.name ? (
              <p
                id="custom-paper-name-error"
                className="text-xs text-red-600 sm:col-span-2"
              >
                {errors.name.message}
              </p>
            ) : null}

            {measurementFields.map((field) => {
              const label =
                field === "horizontalSpacing"
                  ? "Horizontal spacing"
                  : field === "verticalSpacing"
                    ? "Vertical spacing"
                    : `${field.charAt(0).toUpperCase()}${field.slice(1)}`;
              return (
                <label
                  key={field}
                  className="block text-xs font-medium text-[var(--gray-700)]"
                >
                  {label}
                  <input
                    {...register(field)}
                    className={fieldClassName}
                    type="number"
                    inputMode="decimal"
                    min={field === "width" || field === "height" ? "0.001" : "0"}
                    step="any"
                    aria-invalid={Boolean(errors[field])}
                    aria-describedby={
                      errors[field]
                        ? `custom-paper-${field}-error`
                        : undefined
                    }
                  />
                  {errors[field] ? (
                    <span
                      id={`custom-paper-${field}-error`}
                      className="mt-1 block text-xs text-red-600"
                    >
                      {errors[field]?.message}
                    </span>
                  ) : null}
                </label>
              );
            })}

            <label className="block text-xs font-medium text-[var(--gray-700)]">
              Unit
              <Select
                {...unitRegistration}
                value={unit}
                className={fieldClassName}
                onChange={(event) => {
                  const nextUnit = event.target.value as MeasurementUnit;
                  for (const field of measurementFields) {
                    const value = Number(getValues(field));
                    if (Number.isFinite(value)) {
                      setValue(
                        field,
                        convertMeasurement(
                          value,
                          previousUnit.current,
                          nextUnit,
                        ),
                        { shouldValidate: true },
                      );
                    }
                  }
                  previousUnit.current = nextUnit;
                  void unitRegistration.onChange(event);
                }}
                aria-label="Paper unit"
              >
                <option value="in">Inches</option>
                <option value="cm">Centimeters</option>
                <option value="mm">Millimeters</option>
              </Select>
            </label>

            <label className="block text-xs font-medium text-[var(--gray-700)]">
              Default orientation
              <Select
                {...register("orientation")}
                value={orientation}
                className={fieldClassName}
                aria-label="Default orientation"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </Select>
            </label>

            <label className="flex items-center gap-2 text-xs text-[var(--gray-700)]">
              <input
                type="checkbox"
                {...register("cuttingGuidesEnabled")}
                className="size-4 accent-[var(--ink)]"
              />
              Cutting guides enabled
            </label>
            <label className="flex items-center gap-2 text-xs text-[var(--gray-700)]">
              <input
                type="checkbox"
                {...register("sizeLabelsEnabled")}
                className="size-4 accent-[var(--ink)]"
              />
              Size labels enabled
            </label>
            <label className="flex items-center gap-2 text-xs text-[var(--gray-700)]">
              <input
                type="checkbox"
                {...register("allowPhotoRotation")}
                className="size-4 accent-[var(--ink)]"
              />
              Allow eligible photos to rotate
            </label>
            <label className="block text-xs font-medium text-[var(--gray-700)]">
              Auto-arrange mode
              <Select
                {...register("autoArrangeMode")}
                value={autoArrangeMode}
                className={fieldClassName}
                aria-label="Auto-arrange mode"
              >
                <option value="auto">Auto</option>
                <option value="grid">Grid</option>
              </Select>
            </label>
          </div>

          {mutationError ? (
            <p
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
              role="alert"
            >
              {mutationError}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {mode === "create" ? "Save preset" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
