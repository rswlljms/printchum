import { z } from "zod";

import { findPaperPreset } from "@/lib/paper/presets";
import { calculatePrintableArea } from "@/lib/paper/printable-area";
import { serviceSetPaperToSettings } from "@/lib/service-sets/apply-service-set";
import { nameplateSettingsSchema } from "@/lib/nameplates/schemas";

const finiteDimension = z.coerce.number<number>().finite().positive();
const hexColor = /^#[0-9a-fA-F]{6}$/;

export const serviceSetPhotoItemSchema = z.object({
  id: z.string().trim().min(1),
  photoSizePresetId: z.string().trim().min(1).optional(),
  passportPresetId: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).max(50),
  width: finiteDimension.max(100),
  height: finiteDimension.max(100),
  unit: z.enum(["in", "cm", "mm"]),
  quantity: z.coerce.number<number>().int().min(1).max(500),
  allowRotation: z.boolean(),
  nameplateEnabled: z.boolean(),
  nameplate: nameplateSettingsSchema.optional(),
});

export const serviceSetPaperSchema = z.discriminatedUnion("source", [
  z.object({
    source: z.literal("preset"),
    presetId: z.string().trim().min(1),
    orientation: z.enum(["portrait", "landscape"]),
    margin: z.coerce.number<number>().finite().min(0),
    horizontalSpacing: z.coerce.number<number>().finite().min(0),
    verticalSpacing: z.coerce.number<number>().finite().min(0),
    unit: z.enum(["in", "cm", "mm"]),
  }),
  z.object({
    source: z.literal("custom"),
    name: z.string().trim().min(1).max(50),
    width: finiteDimension.max(100),
    height: finiteDimension.max(100),
    unit: z.enum(["in", "cm", "mm"]),
    orientation: z.enum(["portrait", "landscape"]),
    margin: z.coerce.number<number>().finite().min(0),
    horizontalSpacing: z.coerce.number<number>().finite().min(0),
    verticalSpacing: z.coerce.number<number>().finite().min(0),
  }),
]);

export const backgroundPreferenceSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("original") }),
  z.object({ mode: z.literal("transparent") }),
  z.object({
    mode: z.literal("solid"),
    color: z.string().regex(hexColor, "Enter a six-digit hex color."),
  }),
]);

export const serviceSetSchema = z
  .object({
    id: z.string().trim().min(1),
    name: z.string().trim().min(1).max(60),
    description: z.string().trim().max(300).optional(),
    status: z.enum(["enabled", "disabled"]),
    isDefault: z.boolean(),
    isBuiltIn: z.boolean(),
    displayOrder: z.number().int().min(0),
    price: z.coerce.number<number>().finite().min(0).max(1_000_000),
    currencyCode: z
      .string()
      .trim()
      .transform((value) => value.toUpperCase())
      .pipe(z.string().regex(/^[A-Z]{3}$/, "Use a three-letter currency code.")),
    photoItems: z.array(serviceSetPhotoItemSchema).min(1).max(50),
    paper: serviceSetPaperSchema,
    background: backgroundPreferenceSchema,
    cuttingGuidesEnabled: z.boolean(),
    sizeLabelsEnabled: z.boolean(),
    allowPhotoRotation: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .superRefine((serviceSet, context) => {
    const itemIds = new Set<string>();
    for (const [index, item] of serviceSet.photoItems.entries()) {
      if (itemIds.has(item.id)) {
        context.addIssue({
          code: "custom",
          path: ["photoItems", index, "id"],
          message: "Photo item IDs must be unique within a Service Set.",
        });
      }
      itemIds.add(item.id);
    }
    if (serviceSet.isDefault && serviceSet.status === "disabled") {
      context.addIssue({
        code: "custom",
        path: ["isDefault"],
        message: "A disabled Service Set cannot be the default.",
      });
    }
    if (
      serviceSet.paper.source === "preset" &&
      !findPaperPreset(serviceSet.paper.presetId)
    ) {
      context.addIssue({
        code: "custom",
        path: ["paper", "presetId"],
        message: "Select a supported paper preset.",
      });
      return;
    }
    const printableArea = calculatePrintableArea(
      serviceSetPaperToSettings(serviceSet.paper, {
        cuttingGuidesEnabled: serviceSet.cuttingGuidesEnabled,
        sizeLabelsEnabled: serviceSet.sizeLabelsEnabled,
        allowPhotoRotation: serviceSet.allowPhotoRotation,
      }),
    );
    if (!printableArea.isValid) {
      context.addIssue({
        code: "custom",
        path: ["paper", "margin"],
        message:
          printableArea.error ?? "The paper configuration has no printable area.",
      });
    }
  });
