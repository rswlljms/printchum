import { z } from "zod";

import { toInches } from "@/lib/layout-engine/units";
import { solidColorSchema } from "@/lib/nameplates/schemas";

const optionalPositiveNumber = z.preprocess(
  (value) => value === "" || value === null ? undefined : value,
  z.coerce.number<number>().finite().positive().optional(),
);
const optionalMeasurementUnit = z.preprocess(
  (value) => value === "" || value === null ? undefined : value,
  z.enum(["in", "cm", "mm"]).optional(),
);

export const passportPresetInputSchema = z
  .object({
    countryName: z.string().trim().min(1).max(80),
    countryCode: z
      .string()
      .trim()
      .transform((value) => value.toUpperCase())
      .pipe(z.string().regex(/^[A-Z]{2,3}$/, "Use a two- or three-letter country code.")),
    documentType: z.literal("passport").default("passport"),
    name: z.string().trim().min(1).max(100),
    width: z.coerce.number<number>().finite().positive(),
    height: z.coerce.number<number>().finite().positive(),
    unit: z.enum(["in", "cm", "mm"]),
    allowedBackgroundColors: z.array(solidColorSchema).min(1),
    defaultBackgroundColor: solidColorSchema.optional(),
    headHeightMin: optionalPositiveNumber,
    headHeightMax: optionalPositiveNumber,
    headHeightUnit: optionalMeasurementUnit,
    eyeLineMin: optionalPositiveNumber,
    eyeLineMax: optionalPositiveNumber,
    eyeLineUnit: optionalMeasurementUnit,
    notes: z.string().trim().max(1000).optional(),
    officialSourceUrl: z.union([z.url(), z.literal("")]).optional(),
    lastVerifiedAt: z.string().optional(),
    isFavorite: z.boolean().default(false),
  })
  .superRefine((value, context) => {
    if (
      toInches(value.width, value.unit) > 20 ||
      toInches(value.height, value.unit) > 20
    ) {
      context.addIssue({
        code: "custom",
        path: ["width"],
        message: "Passport dimensions cannot exceed 20 inches.",
      });
    }
    if (
      value.defaultBackgroundColor &&
      !value.allowedBackgroundColors.some(
        (color) =>
          color.toLowerCase() === value.defaultBackgroundColor?.toLowerCase(),
      )
    ) {
      context.addIssue({
        code: "custom",
        path: ["defaultBackgroundColor"],
        message: "The default background must be one of the allowed colors.",
      });
    }
    if (
      value.headHeightMin !== undefined &&
      value.headHeightMax !== undefined &&
      value.headHeightMin > value.headHeightMax
    ) {
      context.addIssue({
        code: "custom",
        path: ["headHeightMax"],
        message: "Head-height maximum must be at least the minimum.",
      });
    }
    if (
      value.eyeLineMin !== undefined &&
      value.eyeLineMax !== undefined &&
      value.eyeLineMin > value.eyeLineMax
    ) {
      context.addIssue({
        code: "custom",
        path: ["eyeLineMax"],
        message: "Eye-line maximum must be at least the minimum.",
      });
    }
    if (value.lastVerifiedAt) {
      const timestamp = Date.parse(value.lastVerifiedAt);
      if (
        !Number.isFinite(timestamp) ||
        timestamp > Date.now()
      ) {
        context.addIssue({
          code: "custom",
          path: ["lastVerifiedAt"],
          message: "Use a valid verification date that is not in the future.",
        });
      }
    }
  });
