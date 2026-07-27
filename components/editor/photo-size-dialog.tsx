"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { convertDisplayedMeasurement } from "@/features/editor/photo-sizes/conversions";
import {
  photoSizeItemSchema,
  type PhotoSizeFormInput,
  type PhotoSizeFormValues,
} from "@/features/editor/photo-sizes/schemas";
import { PHOTO_SIZE_DEFAULT_QUANTITY } from "@/features/editor/photo-sizes/presets";
import type { MeasurementUnit } from "@/lib/layout-engine/types";

type PhotoSizeDialogProps = {
  open: boolean;
  mode: "add" | "edit";
  defaultValues: PhotoSizeFormInput;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: PhotoSizeFormValues) => void;
};

const fieldClassName =
  "mt-1.5 h-10 w-full rounded-md border border-[var(--gray-200)] bg-[var(--gray-50)] px-3 text-sm text-[var(--ink)]";

export function PhotoSizeDialog({
  open,
  mode,
  defaultValues,
  onOpenChange,
  onSubmit,
}: PhotoSizeDialogProps) {
  const previousUnit = useRef<MeasurementUnit>(defaultValues.unit);
  const {
    formState: { errors },
    getValues,
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<PhotoSizeFormInput, unknown, PhotoSizeFormValues>({
    resolver: zodResolver(photoSizeItemSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      reset({
        ...defaultValues,
        quantity:
          mode === "add"
            ? PHOTO_SIZE_DEFAULT_QUANTITY
            : defaultValues.quantity,
        allowRotation: false,
      });
      previousUnit.current = defaultValues.unit;
    }
  }, [defaultValues, mode, open, reset]);

  function handleDialogOpenChange(nextOpen: boolean): void {
    if (nextOpen) {
      reset({
        ...defaultValues,
        quantity:
          mode === "add"
            ? PHOTO_SIZE_DEFAULT_QUANTITY
            : defaultValues.quantity,
        allowRotation: false,
      });
      previousUnit.current = defaultValues.unit;
    }
    onOpenChange(nextOpen);
  }

  const unitRegistration = register("unit");

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent>
        <DialogHeader>
          <p className="micro-label">
            {mode === "add" ? "Custom size" : "Edit size"}
          </p>
          <DialogTitle>
            {mode === "add" ? "Add custom photo size" : "Edit photo size"}
          </DialogTitle>
          <DialogDescription>
            Dimensions remain physically equivalent when you change units.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((values) => {
            onSubmit(values);
            onOpenChange(false);
          })}
          noValidate
        >
          <div className="space-y-4">
            <label className="block text-xs font-medium text-[var(--gray-700)]">
              Name
              <input
                {...register("name")}
                className={fieldClassName}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "photo-size-name-error" : undefined}
              />
            </label>
            {errors.name ? (
              <p id="photo-size-name-error" className="text-xs text-red-600">
                {errors.name.message}
              </p>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--gray-700)]">
                  Width
                  <input
                    {...register("width")}
                    className={fieldClassName}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="any"
                    aria-invalid={Boolean(errors.width)}
                    aria-describedby={errors.width ? "photo-size-width-error" : undefined}
                  />
                </label>
                {errors.width ? (
                  <p id="photo-size-width-error" className="mt-1 text-xs text-red-600">
                    {errors.width.message}
                  </p>
                ) : null}
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--gray-700)]">
                  Height
                  <input
                    {...register("height")}
                    className={fieldClassName}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="any"
                    aria-invalid={Boolean(errors.height)}
                    aria-describedby={errors.height ? "photo-size-height-error" : undefined}
                  />
                </label>
                {errors.height ? (
                  <p id="photo-size-height-error" className="mt-1 text-xs text-red-600">
                    {errors.height.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-medium text-[var(--gray-700)]">
                Unit
                <select
                  {...unitRegistration}
                  className={fieldClassName}
                  onChange={(event) => {
                    const nextUnit = event.target.value as MeasurementUnit;
                    const width = Number(getValues("width"));
                    const height = Number(getValues("height"));
                    if (Number.isFinite(width)) {
                      setValue(
                        "width",
                        convertDisplayedMeasurement(
                          width,
                          previousUnit.current,
                          nextUnit,
                        ),
                        { shouldValidate: true },
                      );
                    }
                    if (Number.isFinite(height)) {
                      setValue(
                        "height",
                        convertDisplayedMeasurement(
                          height,
                          previousUnit.current,
                          nextUnit,
                        ),
                        { shouldValidate: true },
                      );
                    }
                    previousUnit.current = nextUnit;
                    void unitRegistration.onChange(event);
                  }}
                  aria-invalid={Boolean(errors.unit)}
                  aria-describedby={errors.unit ? "photo-size-unit-error" : undefined}
                >
                  <option value="in">Inches</option>
                  <option value="cm">Centimeters</option>
                  <option value="mm">Millimeters</option>
                </select>
              </label>
              <label className="block text-xs font-medium text-[var(--gray-700)]">
                Quantity
                <input
                  {...register("quantity")}
                  className={fieldClassName}
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="500"
                  step="1"
                  aria-invalid={Boolean(errors.quantity)}
                  aria-describedby={errors.quantity ? "photo-size-quantity-error" : undefined}
                />
              </label>
            </div>
            {errors.unit ? (
              <p id="photo-size-unit-error" className="text-xs text-red-600">
                {errors.unit.message}
              </p>
            ) : null}
            {errors.quantity ? (
              <p id="photo-size-quantity-error" className="text-xs text-red-600">
                {errors.quantity.message}
              </p>
            ) : null}

            <input type="hidden" {...register("nameplateEnabled")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === "add" ? "Add size" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
