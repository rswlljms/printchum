import { z } from "zod";

import { exceedsMaximumPhysicalDimension } from "@/features/editor/photo-sizes/conversions";

export const photoSizeItemSchema = z
  .object({
    name: z.string().trim().min(1, "Enter a size name.").max(50, "Use 50 characters or fewer."),
    width: z.coerce
      .number<number>()
      .finite("Enter a valid width.")
      .positive("Width must be greater than zero."),
    height: z.coerce
      .number<number>()
      .finite("Enter a valid height.")
      .positive("Height must be greater than zero."),
    unit: z.enum(["in", "cm", "mm"], {
      message: "Choose inches, centimeters, or millimeters.",
    }),
    quantity: z.coerce
      .number<number>()
      .int("Quantity must be a whole number.")
      .min(1, "Quantity must be at least 1.")
      .max(500, "Quantity cannot exceed 500."),
    allowRotation: z.boolean(),
    nameplateEnabled: z.boolean(),
  })
  .superRefine((value, context) => {
    if (exceedsMaximumPhysicalDimension(value.width, value.unit)) {
      context.addIssue({
        code: "custom",
        path: ["width"],
        message: "Width cannot exceed 100 inches.",
      });
    }
    if (exceedsMaximumPhysicalDimension(value.height, value.unit)) {
      context.addIssue({
        code: "custom",
        path: ["height"],
        message: "Height cannot exceed 100 inches.",
      });
    }
  });

export type PhotoSizeFormInput = z.input<typeof photoSizeItemSchema>;
export type PhotoSizeFormValues = z.output<typeof photoSizeItemSchema>;
