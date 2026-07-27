import { z } from "zod";

export const solidColorSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value) ||
      /^(?:rgb|hsl)a?\([^)]*\)$/i.test(value) ||
      /^[a-z]+$/i.test(value),
    "Enter a valid solid color.",
  )
  .refine(
    (value) => !/gradient|url|var\(/i.test(value),
    "Gradients and image colors are not supported.",
  );

export const nameplateSettingsSchema = z
  .object({
    enabled: z.boolean(),
    presetType: z.enum([
      "full-name",
      "name-and-id",
      "name-id-department",
      "custom",
    ]),
    primaryText: z.string().trim().max(100),
    secondaryText: z.string().trim().max(100).optional(),
    thirdLineText: z.string().trim().max(100).optional(),
    position: z.enum([
      "bottom-inside",
      "bottom-outside",
      "top-inside",
      "top-outside",
    ]),
    fontSizePoints: z.coerce.number<number>().finite().min(5).max(72),
    fontWeight: z.union([
      z.literal(400),
      z.literal(500),
      z.literal(600),
      z.literal(700),
    ]),
    textAlign: z.enum(["left", "center", "right"]),
    textColor: solidColorSchema,
    backgroundColor: solidColorSchema,
    borderEnabled: z.boolean(),
    borderColor: solidColorSchema,
    borderWidthPoints: z.coerce.number<number>().finite().min(0).max(10),
    paddingPoints: z.coerce.number<number>().finite().min(0).max(40),
    lineSpacing: z.coerce.number<number>().finite().min(0.8).max(3),
  })
  .superRefine((value, context) => {
    if (value.enabled && value.primaryText.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["primaryText"],
        message:
          "Primary text is required when the nameplate is enabled.",
      });
    }
  });
