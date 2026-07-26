"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
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
import { photoSizePresets } from "@/features/editor/photo-sizes/presets";
import { paperPresets } from "@/lib/paper/presets";
import { serviceSetSchema } from "@/lib/service-sets/schemas";
import type { ServiceSet } from "@/lib/service-sets/types";

type ServiceSetFormInput = z.input<typeof serviceSetSchema>;
type ServiceSetFormValues = z.output<typeof serviceSetSchema>;

type ServiceSetFormProps = {
  open: boolean;
  serviceSet: ServiceSet | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ServiceSetFormValues) => boolean;
};

let formPhotoSequence = 0;

function nextFormPhotoId(): string {
  formPhotoSequence += 1;
  return `form-service-photo-${formPhotoSequence}`;
}

const fieldClassName =
  "mt-1.5 h-10 w-full rounded-md border border-[var(--gray-200)] bg-[var(--gray-50)] px-3 text-sm text-[var(--ink)]";

function createFormDefaults(serviceSet: ServiceSet | null): ServiceSet {
  if (serviceSet) {
    return {
      ...serviceSet,
      photoItems: serviceSet.photoItems.map((item) => ({ ...item })),
      paper: { ...serviceSet.paper },
      background: { ...serviceSet.background },
    };
  }
  const timestamp = new Date().toISOString();
  return {
    id: "pending-service-set",
    name: "",
    description: "",
    status: "enabled",
    isDefault: false,
    isBuiltIn: false,
    displayOrder: 0,
    price: 40,
    currencyCode: "PHP",
    photoItems: [
      {
        id: nextFormPhotoId(),
        photoSizePresetId: "2x2",
        name: "2 × 2",
        width: 2,
        height: 2,
        unit: "in",
        quantity: 4,
        allowRotation: false,
        nameplateEnabled: false,
      },
    ],
    paper: {
      source: "preset",
      presetId: "letter",
      orientation: "portrait",
      margin: 0.25,
      horizontalSpacing: 0.125,
      verticalSpacing: 0.125,
      unit: "in",
    },
    background: { mode: "original" },
    cuttingGuidesEnabled: true,
    sizeLabelsEnabled: false,
    allowPhotoRotation: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function ServiceSetForm({
  open,
  serviceSet,
  onOpenChange,
  onSubmit,
}: ServiceSetFormProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<ServiceSetFormInput, unknown, ServiceSetFormValues>({
    resolver: zodResolver(serviceSetSchema),
    defaultValues: createFormDefaults(serviceSet),
  });
  const { append, fields, remove } = useFieldArray({
    control,
    name: "photoItems",
  });
  const paperSource = useWatch({ control, name: "paper.source" });
  const backgroundMode = useWatch({ control, name: "background.mode" });

  useEffect(() => {
    if (open) {
      reset(createFormDefaults(serviceSet));
    }
  }, [open, reset, serviceSet]);

  function addPhotoPreset(presetId: string): void {
    const preset = photoSizePresets.find(
      (candidate) =>
        candidate.id === presetId && candidate.category !== "custom",
    );
    if (!preset) {
      return;
    }
    append({
      id: nextFormPhotoId(),
      photoSizePresetId: preset.id,
      name: preset.name,
      width: preset.width,
      height: preset.height,
      unit: preset.unit,
      quantity: 1,
      allowRotation: false,
      nameplateEnabled: false,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <p className="micro-label">
            {serviceSet ? "Edit custom package" : "Create reusable package"}
          </p>
          <DialogTitle>
            {serviceSet ? `Edit ${serviceSet.name}` : "Create Service Set"}
          </DialogTitle>
          <DialogDescription>
            Stores layout configuration only. Customer photos and crop data are
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
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="space-y-4">
              <p className="micro-label">01 — package details</p>
              <label className="block text-xs font-medium">
                Name
                <input
                  {...register("name")}
                  className={fieldClassName}
                  aria-invalid={Boolean(errors.name)}
                />
              </label>
              {errors.name ? (
                <p className="text-xs text-red-600">{errors.name.message}</p>
              ) : null}
              <label className="block text-xs font-medium">
                Description
                <textarea
                  {...register("description")}
                  className="mt-1.5 min-h-20 w-full rounded-md border border-[var(--gray-200)] bg-[var(--gray-50)] px-3 py-2 text-sm"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-medium">
                  Price
                  <input
                    {...register("price")}
                    type="number"
                    min="0"
                    max="1000000"
                    step="0.01"
                    className={fieldClassName}
                    aria-invalid={Boolean(errors.price)}
                    aria-describedby={
                      errors.price ? "service-set-price-error" : undefined
                    }
                  />
                </label>
                <label className="block text-xs font-medium">
                  Currency
                  <input
                    {...register("currencyCode")}
                    maxLength={3}
                    className={fieldClassName}
                    aria-invalid={Boolean(errors.currencyCode)}
                    aria-describedby={
                      errors.currencyCode
                        ? "service-set-currency-error"
                        : undefined
                    }
                  />
                </label>
              </div>
              {errors.price ? (
                <p id="service-set-price-error" className="text-xs text-red-600">
                  {errors.price.message}
                </p>
              ) : null}
              {errors.currencyCode ? (
                <p
                  id="service-set-currency-error"
                  className="text-xs text-red-600"
                >
                  {errors.currencyCode.message}
                </p>
              ) : null}
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-medium">
                  Status
                  <select {...register("status")} className={fieldClassName}>
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </label>
                <label className="mt-6 flex items-center gap-2 rounded-lg border border-[var(--gray-200)] px-3 text-xs">
                  <input
                    type="checkbox"
                    {...register("isDefault")}
                    className="size-4 accent-[var(--ink)]"
                  />
                  Set as default
                </label>
              </div>

              <div className="border-t border-[var(--gray-200)] pt-4">
                <div className="flex items-end gap-2">
                  <label className="flex-1 text-xs font-medium">
                    Add standard photo size
                    <select
                      id="service-set-photo-preset"
                      className={fieldClassName}
                      defaultValue="1x1"
                    >
                      {photoSizePresets
                        .filter((preset) => preset.category !== "custom")
                        .map((preset) => (
                          <option key={preset.id} value={preset.id}>
                            {preset.name}
                          </option>
                        ))}
                    </select>
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const element = document.getElementById(
                        "service-set-photo-preset",
                      );
                      if (element instanceof HTMLSelectElement) {
                        addPhotoPreset(element.value);
                      }
                    }}
                  >
                    <Plus className="size-3.5" />
                    Add
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-xl border border-[var(--gray-200)] p-3"
                  >
                    <input
                      type="hidden"
                      {...register(`photoItems.${index}.id`)}
                    />
                    <input
                      type="hidden"
                      {...register(
                        `photoItems.${index}.photoSizePresetId`,
                      )}
                    />
                    <div className="grid grid-cols-[1fr_80px_auto] gap-2">
                      <label className="text-xs">
                        Size name
                        <input
                          {...register(`photoItems.${index}.name`)}
                          className={fieldClassName}
                        />
                      </label>
                      <label className="text-xs">
                        Qty
                        <input
                          {...register(`photoItems.${index}.quantity`)}
                          type="number"
                          min="1"
                          max="500"
                          className={fieldClassName}
                        />
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mt-6"
                        onClick={() => remove(index)}
                        aria-label={`Remove photo item ${index + 1}`}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <label className="text-xs">
                        Width
                        <input
                          {...register(`photoItems.${index}.width`)}
                          type="number"
                          step="any"
                          className={fieldClassName}
                        />
                      </label>
                      <label className="text-xs">
                        Height
                        <input
                          {...register(`photoItems.${index}.height`)}
                          type="number"
                          step="any"
                          className={fieldClassName}
                        />
                      </label>
                      <label className="text-xs">
                        Unit
                        <select
                          {...register(`photoItems.${index}.unit`)}
                          className={fieldClassName}
                        >
                          <option value="in">in</option>
                          <option value="cm">cm</option>
                          <option value="mm">mm</option>
                        </select>
                      </label>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          {...register(
                            `photoItems.${index}.allowRotation`,
                          )}
                        />
                        Allow rotation
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          {...register(
                            `photoItems.${index}.nameplateEnabled`,
                          )}
                        />
                        Nameplate placeholder
                      </label>
                    </div>
                  </div>
                ))}
                {errors.photoItems?.root?.message ? (
                  <p className="text-xs text-red-600">
                    {errors.photoItems.root.message}
                  </p>
                ) : null}
              </div>
            </section>

            <section className="space-y-4">
              <p className="micro-label">02 — output defaults</p>
              <label className="block text-xs font-medium">
                Paper source
                <select
                  value={paperSource}
                  onChange={(event) => {
                    const source = event.target.value;
                    if (source === "custom") {
                      setValue("paper", {
                        source: "custom",
                        name: "Custom Paper",
                        width: 8.5,
                        height: 11,
                        unit: "in",
                        orientation: "portrait",
                        margin: 0.25,
                        horizontalSpacing: 0.125,
                        verticalSpacing: 0.125,
                      });
                    } else {
                      setValue("paper", {
                        source: "preset",
                        presetId: "letter",
                        unit: "in",
                        orientation: "portrait",
                        margin: 0.25,
                        horizontalSpacing: 0.125,
                        verticalSpacing: 0.125,
                      });
                    }
                  }}
                  className={fieldClassName}
                >
                  <option value="preset">Standard preset</option>
                  <option value="custom">Custom paper</option>
                </select>
              </label>

              {paperSource === "preset" ? (
                <label className="block text-xs font-medium">
                  Paper preset
                  <select
                    {...register("paper.presetId")}
                    className={fieldClassName}
                    onChange={(event) => {
                      const preset = paperPresets.find(
                        (candidate) =>
                          candidate.id === event.target.value,
                      );
                      if (preset && preset.category !== "custom") {
                        setValue("paper", {
                          source: "preset",
                          presetId: preset.id,
                          unit: preset.unit,
                          orientation: preset.defaultOrientation,
                          margin: preset.defaultMargin,
                          horizontalSpacing:
                            preset.defaultHorizontalSpacing,
                          verticalSpacing:
                            preset.defaultVerticalSpacing,
                        });
                      }
                    }}
                  >
                    {paperPresets
                      .filter((preset) => preset.category !== "custom")
                      .map((preset) => (
                        <option key={preset.id} value={preset.id}>
                          {preset.name}
                        </option>
                      ))}
                  </select>
                </label>
              ) : (
                <div className="space-y-3">
                  <label className="block text-xs font-medium">
                    Custom paper name
                    <input
                      {...register("paper.name")}
                      className={fieldClassName}
                    />
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="text-xs">
                      Width
                      <input
                        {...register("paper.width")}
                        type="number"
                        step="any"
                        className={fieldClassName}
                      />
                    </label>
                    <label className="text-xs">
                      Height
                      <input
                        {...register("paper.height")}
                        type="number"
                        step="any"
                        className={fieldClassName}
                      />
                    </label>
                    <label className="text-xs">
                      Unit
                      <select
                        {...register("paper.unit")}
                        className={fieldClassName}
                      >
                        <option value="in">in</option>
                        <option value="cm">cm</option>
                        <option value="mm">mm</option>
                      </select>
                    </label>
                  </div>
                </div>
              )}

              <label className="block text-xs font-medium">
                Orientation
                <select
                  {...register("paper.orientation")}
                  className={fieldClassName}
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <label className="text-xs">
                  Margin
                  <input
                    {...register("paper.margin")}
                    type="number"
                    min="0"
                    step="any"
                    className={fieldClassName}
                  />
                </label>
                <label className="text-xs">
                  H spacing
                  <input
                    {...register("paper.horizontalSpacing")}
                    type="number"
                    min="0"
                    step="any"
                    className={fieldClassName}
                  />
                </label>
                <label className="text-xs">
                  V spacing
                  <input
                    {...register("paper.verticalSpacing")}
                    type="number"
                    min="0"
                    step="any"
                    className={fieldClassName}
                  />
                </label>
              </div>

              <label className="block text-xs font-medium">
                Background preference
                <select
                  value={backgroundMode}
                  onChange={(event) => {
                    const mode = event.target.value;
                    if (mode === "solid") {
                      setValue("background", {
                        mode,
                        color: "#ffffff",
                      });
                    } else if (
                      mode === "original" ||
                      mode === "transparent"
                    ) {
                      setValue("background", { mode });
                    }
                  }}
                  className={fieldClassName}
                >
                  <option value="original">Original</option>
                  <option value="transparent">Transparent</option>
                  <option value="solid">Solid color</option>
                </select>
              </label>
              {backgroundMode === "solid" ? (
                <label className="block text-xs font-medium">
                  Background color
                  <input
                    type="color"
                    {...register("background.color")}
                    className="mt-1.5 h-10 w-full rounded-md border border-[var(--gray-200)] p-1"
                  />
                </label>
              ) : null}
              {backgroundMode === "transparent" ? (
                <p className="rounded-lg bg-[var(--gray-50)] p-3 text-xs text-[var(--gray-500)]">
                  Transparent output requires background removal when the AI
                  integration is connected.
                </p>
              ) : null}

              <div className="space-y-2 rounded-xl border border-[var(--gray-200)] p-3 text-xs">
                {[
                  ["cuttingGuidesEnabled", "Cutting guides"],
                  ["sizeLabelsEnabled", "Size labels"],
                  ["allowPhotoRotation", "Global photo rotation"],
                ].map(([field, label]) => (
                  <label
                    key={field}
                    className="flex items-center justify-between gap-3"
                  >
                    {label}
                    <input
                      type="checkbox"
                      {...register(
                        field as
                          | "cuttingGuidesEnabled"
                          | "sizeLabelsEnabled"
                          | "allowPhotoRotation",
                      )}
                      className="size-4 accent-[var(--ink)]"
                    />
                  </label>
                ))}
              </div>

              {errors.root?.message ? (
                <p className="text-xs text-red-600">
                  {errors.root.message}
                </p>
              ) : null}
            </section>
          </div>

          <input type="hidden" {...register("id")} />
          <input type="hidden" {...register("isBuiltIn")} />
          <input type="hidden" {...register("displayOrder")} />
          <input type="hidden" {...register("createdAt")} />
          <input type="hidden" {...register("updatedAt")} />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {serviceSet ? "Save changes" : "Create Service Set"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
