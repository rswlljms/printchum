import { z } from "zod";

const measurementUnitSchema = z.enum(["in", "cm", "mm"]);
const paperOrientationSchema = z.enum(["portrait", "landscape"]);

export const getEditorSummarySchema = z.object({}).strict();

export const listPaperPresetsSchema = z.object({}).strict();

export const listPhotoSizePresetsSchema = z.object({}).strict();

export const listServiceSetsSchema = z.object({}).strict();

export const listNameplatePresetsSchema = z.object({}).strict();

export const configurePaperSchema = z
  .object({
    presetId: z
      .string()
      .optional()
      .describe(
        "Standard paper preset id, e.g. 'letter', 'legal', 'a4', 'a3', '4r', '5r'.",
      ),
    width: z.number().positive().max(1000).optional().describe(
      "Custom paper width. Requires height and unit when used without presetId.",
    ),
    height: z.number().positive().max(1000).optional().describe(
      "Custom paper height.",
    ),
    unit: measurementUnitSchema
      .optional()
      .describe("Unit for custom dimensions, margin, and spacing values."),
    orientation: paperOrientationSchema
      .optional()
      .describe("Paper orientation."),
    margin: z
      .number()
      .min(0)
      .max(100)
      .optional()
      .describe("Page margin in the paper's current display unit."),
    horizontalSpacing: z
      .number()
      .min(0)
      .max(100)
      .optional()
      .describe("Gap between photos horizontally, in the display unit."),
    verticalSpacing: z
      .number()
      .min(0)
      .max(100)
      .optional()
      .describe("Gap between photos vertically, in the display unit."),
    cuttingGuidesEnabled: z
      .boolean()
      .optional()
      .describe("Whether cutting guides are drawn on the output."),
  })
  .strict()
  .refine(
    (input) =>
      Object.values(input).some((value) => value !== undefined),
    { message: "Provide at least one paper setting to change." },
  );

export const addPhotoSizeSchema = z
  .object({
    presetId: z
      .string()
      .optional()
      .describe(
        "Photo size preset id, e.g. '2x2', 'passport', 'wallet', '2r', 'half-body'. Omit to use custom dimensions.",
      ),
    width: z.number().positive().max(100).optional().describe(
      "Custom photo width. Use instead of presetId together with height and unit.",
    ),
    height: z.number().positive().max(100).optional().describe(
      "Custom photo height.",
    ),
    unit: measurementUnitSchema.optional().describe(
      "Unit for custom dimensions (required with custom width/height).",
    ),
    quantity: z
      .number()
      .int()
      .min(1)
      .max(500)
      .optional()
      .describe("Number of copies to place. Defaults to the preset default."),
    allowRotation: z
      .boolean()
      .optional()
      .describe("Allow this photo size to rotate 90° during packing."),
  })
  .strict()
  .refine(
    (input) =>
      input.presetId !== undefined ||
      (input.width !== undefined &&
        input.height !== undefined &&
        input.unit !== undefined),
    {
      message:
        "Provide presetId, or all three of width, height, and unit for a custom size.",
    },
  );

export const updatePhotoSizeSchema = z
  .object({
    itemId: z.string().min(1).describe("Id of the photo size item to update."),
    quantity: z
      .number()
      .int()
      .min(1)
      .max(500)
      .optional()
      .describe("New copy count for this photo size."),
    allowRotation: z.boolean().optional(),
    nameplateEnabled: z
      .boolean()
      .optional()
      .describe("Enable or disable the nameplate attached to this photo size."),
  })
  .strict()
  .refine(
    (input) =>
      input.quantity !== undefined ||
      input.allowRotation !== undefined ||
      input.nameplateEnabled !== undefined,
    { message: "Provide at least one field to update." },
  );

export const removePhotoSizeSchema = z
  .object({
    itemId: z.string().min(1).describe("Id of the photo size item to remove."),
  })
  .strict();

export const applyServiceSetSchema = z
  .object({
    serviceSetId: z
      .string()
      .min(1)
      .describe("Id of the service set to apply, from list-service-sets."),
  })
  .strict();

export const configureNameplateSchema = z
  .object({
    itemId: z
      .string()
      .min(1)
      .describe("Id of the photo size item whose nameplate to configure."),
    presetId: z
      .enum(["full-name", "name-and-id", "name-id-department", "custom"])
      .optional()
      .describe(
        "Start from a saved nameplate layout before applying overrides.",
      ),
    primaryText: z.string().max(120).optional().describe(
      "Main line text, typically a full name.",
    ),
    secondaryText: z.string().max(120).optional().describe(
      "Second line text, such as an ID or student number.",
    ),
    thirdLineText: z.string().max(120).optional().describe(
      "Third line text, such as a department or section.",
    ),
    position: z
      .enum([
        "bottom-inside",
        "bottom-outside",
        "top-inside",
        "top-outside",
      ])
      .optional(),
    fontSizePoints: z.number().int().min(4).max(72).optional(),
    fontWeight: z.union([z.literal(400), z.literal(500), z.literal(600), z.literal(700)]).optional(),
    textAlign: z.enum(["left", "center", "right"]).optional(),
    textColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    borderEnabled: z.boolean().optional(),
    borderColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  })
  .strict()
  .refine(
    (input) =>
      Object.entries(input).some(
        ([key, value]) => key !== "itemId" && value !== undefined,
      ),
    { message: "Provide at least one nameplate setting besides itemId." },
  );

export const exportPdfSchema = z
  .object({
    filename: z
      .string()
      .max(140)
      .optional()
      .describe(
        "Download file name without extension. Defaults to a timestamped name.",
      ),
    quality: z
      .enum(["standard", "high"])
      .optional()
      .describe("Raster output quality. High uses ~300 PPI. Default high."),
  })
  .strict();

export const openPrintDialogSchema = z.object({}).strict();

export const setPreviewPageSchema = z
  .object({
    pageNumber: z
      .number()
      .int()
      .min(1)
      .max(500)
      .describe("Page number to display in the preview, starting at 1."),
  })
  .strict();

export const setBackgroundSchema = z
  .object({
    mode: z
      .enum(["original", "transparent", "solid"])
      .describe(
        "original keeps the uploaded photo, transparent suits photos with the background removed, solid composites over a color.",
      ),
    color: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/)
      .optional()
      .describe("Hex color for solid mode. Defaults to white."),
  })
  .strict();

export const setCropModeSchema = z
  .object({
    mode: z
      .enum(["keep-head-size", "fill-frame", "fit-with-padding"])
      .describe(
        "keep-head-size preserves the subject's apparent size across sizes, fill-frame fills each frame and may crop edges, fit-with-padding fits the whole crop with padding.",
      ),
  })
  .strict();

export const saveServiceSetSchema = z
  .object({
    name: z
      .string()
      .min(1)
      .max(60)
      .describe("Name for the saved service set."),
    description: z
      .string()
      .max(200)
      .optional()
      .describe("Short description of the package."),
    price: z
      .number()
      .min(0)
      .max(100000)
      .optional()
      .describe("Price for the package. Defaults to 0."),
    currencyCode: z
      .string()
      .length(3)
      .optional()
      .describe(
        "ISO currency code. Defaults to the user's most recent service set currency.",
      ),
  })
  .strict();
