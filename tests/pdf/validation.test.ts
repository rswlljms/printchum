import { describe, expect, it } from "vitest";

import type { PdfExportInput } from "@/lib/pdf/types";
import { validatePdfExport } from "@/lib/pdf/validation";

function validInput(): PdfExportInput {
  const file = new File(["safe"], "sample.png", { type: "image/png" });
  return {
    layoutResult: {
      pages: [
        {
          pageIndex: 0,
          items: [
            {
              id: "item-1-1",
              sourceItemId: "item-1",
              pageIndex: 0,
              xInches: 0.25,
              yInches: 0.25,
              widthInches: 2,
              heightInches: 2,
              rotation: 0,
            },
          ],
        },
      ],
      totalItems: 1,
      placedItems: 1,
      unplacedItems: [],
      utilizationPercent: 4,
    },
    paper: {
      presetId: "letter",
      name: "Letter",
      width: 8.5,
      height: 11,
      unit: "in",
      orientation: "portrait",
      margin: 0.25,
      horizontalSpacing: 0.125,
      verticalSpacing: 0.125,
      cuttingGuidesEnabled: false,
      sizeLabelsEnabled: false,
      allowPhotoRotation: false,
      autoArrangeMode: "auto",
    },
    photoSizes: [
      {
        id: "item-1",
        name: "2 × 2",
        width: 2,
        height: 2,
        unit: "in",
        quantity: 1,
        allowRotation: false,
        nameplateEnabled: false,
      },
    ],
    crop: {
      xPercent: 0,
      yPercent: 0,
      widthPercent: 100,
      heightPercent: 100,
      zoom: 1,
      rotation: 0,
    },
    cropMode: "fill-frame",
    backgroundMode: "original",
    backgroundColor: "#ffffff",
    backgroundRemoved: false,
    imageSource: {
      file,
      objectUrl: "blob:local-only",
      mimeType: "image/png",
    },
    options: {
      includeCuttingGuides: false,
      includeSizeLabels: false,
      includeNameplates: true,
      includeBackground: true,
      outputQuality: "high",
      jpegQuality: 0.95,
      pageIndexes: [0],
    },
  };
}

describe("PDF export validation", () => {
  it("accepts a valid browser-only export", () => {
    expect(validatePdfExport(validInput())).toEqual([]);
  });

  it.each([
    ["NO_PAGES", (input: PdfExportInput) => {
      input.layoutResult.pages = [];
    }],
    ["NO_PLACED_ITEMS", (input: PdfExportInput) => {
      input.layoutResult.placedItems = 0;
    }],
    ["IMAGE_MISSING", (input: PdfExportInput) => {
      input.imageSource = null;
    }],
    ["INVALID_CROP", (input: PdfExportInput) => {
      input.crop.widthPercent = 0;
    }],
    ["INVALID_PAGE_RANGE", (input: PdfExportInput) => {
      input.options.pageIndexes = [4];
    }],
    ["SOURCE_ITEM_MISSING", (input: PdfExportInput) => {
      input.photoSizes = [];
    }],
  ])("rejects %s", (code, mutate) => {
    const input = validInput();
    mutate(input);
    expect(() => validatePdfExport(input)).toThrow(
      expect.objectContaining({ code }),
    );
  });

  it("warns before excluding unplaced items", () => {
    const input = validInput();
    input.layoutResult.unplacedItems = [
      {
        id: "item-2-1",
        sourceItemId: "item-2",
        widthInches: 20,
        heightInches: 20,
        allowRotation: false,
        reason: "ITEM_DOES_NOT_FIT",
        message: "Item does not fit.",
      },
    ];
    expect(validatePdfExport(input)[0]?.code).toBe("UNPLACED_ITEMS");
  });

  it("warns and falls back when transparent output is unavailable", () => {
    const input = validInput();
    input.backgroundMode = "transparent";
    expect(validatePdfExport(input)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "TRANSPARENT_BACKGROUND_UNAVAILABLE",
        }),
      ]),
    );
  });
});
