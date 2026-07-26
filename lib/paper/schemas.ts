import { z } from "zod";

import { toInches } from "@/lib/paper/conversions";

const finiteMeasurement = z.coerce
  .number<number>()
  .finite("Enter a finite number.");

export const paperSettingsSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Enter a paper name.")
      .max(50, "Use 50 characters or fewer."),
    width: finiteMeasurement.positive("Width must be greater than zero."),
    height: finiteMeasurement.positive("Height must be greater than zero."),
    unit: z.enum(["in", "cm", "mm"]),
    orientation: z.enum(["portrait", "landscape"]),
    margin: finiteMeasurement.min(0, "Margin cannot be negative."),
    horizontalSpacing: finiteMeasurement
      .min(0, "Horizontal spacing cannot be negative."),
    verticalSpacing: finiteMeasurement
      .min(0, "Vertical spacing cannot be negative."),
    cuttingGuidesEnabled: z.boolean(),
    sizeLabelsEnabled: z.boolean(),
    allowPhotoRotation: z.boolean(),
    autoArrangeMode: z.enum(["auto", "grid"]),
  })
  .superRefine((settings, context) => {
    const widthInches = toInches(settings.width, settings.unit);
    const heightInches = toInches(settings.height, settings.unit);
    const marginInches = toInches(settings.margin, settings.unit);
    const horizontalSpacingInches = toInches(
      settings.horizontalSpacing,
      settings.unit,
    );
    const verticalSpacingInches = toInches(
      settings.verticalSpacing,
      settings.unit,
    );

    for (const [path, value, message] of [
      ["width", widthInches, "Width cannot exceed 100 inches."],
      ["height", heightInches, "Height cannot exceed 100 inches."],
    ] as const) {
      if (value > 100) {
        context.addIssue({ code: "custom", path: [path], message });
      }
    }

    for (const [path, value, message] of [
      [
        "horizontalSpacing",
        horizontalSpacingInches,
        "Horizontal spacing cannot exceed 10 inches.",
      ],
      [
        "verticalSpacing",
        verticalSpacingInches,
        "Vertical spacing cannot exceed 10 inches.",
      ],
    ] as const) {
      if (value > 10) {
        context.addIssue({ code: "custom", path: [path], message });
      }
    }

    if (
      marginInches * 2 >= Math.min(widthInches, heightInches)
    ) {
      context.addIssue({
        code: "custom",
        path: ["margin"],
        message: "The current margin leaves no printable area.",
      });
    }
  });

export type PaperSettingsFormInput = z.input<typeof paperSettingsSchema>;
export type PaperSettingsFormValues = z.output<typeof paperSettingsSchema>;

