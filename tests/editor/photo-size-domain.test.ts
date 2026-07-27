import { describe, expect, it } from "vitest";

import {
  convertDisplayedMeasurement,
  exceedsMaximumPhysicalDimension,
  formatPhotoSizeLabel,
} from "@/features/editor/photo-sizes/conversions";
import {
  PHOTO_SIZE_DEFAULT_QUANTITY,
  createPhotoSizeItemFromPreset,
  createSelectedPhotoSizeId,
  findPhotoSizePreset,
  photoSizePresets,
} from "@/features/editor/photo-sizes/presets";
import { photoSizeItemSchema } from "@/features/editor/photo-sizes/schemas";
import { toInches } from "@/lib/layout-engine/units";

describe("photo-size preset catalog", () => {
  it("contains every Phase 5 preset with configured defaults", () => {
    expect(photoSizePresets.map((preset) => preset.id)).toEqual([
      "1x1",
      "1.5x1.5",
      "2x2",
      "passport",
      "wallet",
      "2r",
      "half-body",
      "custom",
    ]);
    expect(
      photoSizePresets.every(
        (preset) => preset.defaultQuantity === PHOTO_SIZE_DEFAULT_QUANTITY,
      ),
    ).toBe(true);
    expect(PHOTO_SIZE_DEFAULT_QUANTITY).toBe(1);
    expect(findPhotoSizePreset("passport")?.description).not.toContain(
      "Generic",
    );
  });

  it("creates independent selected items from the same preset", () => {
    const preset = findPhotoSizePreset("2x2");
    expect(preset).toBeDefined();
    if (!preset) {
      return;
    }

    const first = createPhotoSizeItemFromPreset(preset);
    const second = createPhotoSizeItemFromPreset(preset);

    expect(first.id).not.toBe(second.id);
    expect(first.quantity).toBe(1);
    expect(first.presetId).toBe("2x2");
  });

  it("skips IDs restored from the workspace session", () => {
    const currentId = createSelectedPhotoSizeId();
    const currentSequence = Number(currentId.replace("photo-size-", ""));
    const restoredNextId = `photo-size-${currentSequence + 1}`;
    const nextId = createSelectedPhotoSizeId([restoredNextId]);

    expect(nextId).not.toBe(restoredNextId);
    expect(nextId).toBe(`photo-size-${currentSequence + 2}`);
  });
});

describe("photo-size validation and conversion", () => {
  it("coerces valid form values and supports all measurement units", () => {
    for (const unit of ["in", "cm", "mm"] as const) {
      const result = photoSizeItemSchema.safeParse({
        name: " Test size ",
        width: "2",
        height: "3",
        unit,
        quantity: "4",
        allowRotation: false,
        nameplateEnabled: false,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Test size");
        expect(result.data.quantity).toBe(4);
      }
    }
  });

  it("rejects malformed, non-finite, and oversized dimensions", () => {
    expect(
      photoSizeItemSchema.safeParse({
        name: "Bad",
        width: "not-a-number",
        height: 2,
        unit: "in",
        quantity: 1,
        allowRotation: false,
        nameplateEnabled: false,
      }).success,
    ).toBe(false);
    expect(exceedsMaximumPhysicalDimension(2541, "mm")).toBe(true);
    expect(
      photoSizeItemSchema.safeParse({
        name: "Oversized",
        width: 2541,
        height: 10,
        unit: "mm",
        quantity: 1,
        allowRotation: false,
        nameplateEnabled: false,
      }).success,
    ).toBe(false);
  });

  it("preserves physical dimensions while changing units", () => {
    const centimeters = convertDisplayedMeasurement(2, "in", "cm");
    const inches = convertDisplayedMeasurement(centimeters, "cm", "in");

    expect(centimeters).toBe(5.08);
    expect(inches).toBe(2);
    expect(toInches(centimeters, "cm")).toBeCloseTo(2, 10);
  });

  it("does not repeat a dimension-based name in the canvas label", () => {
    expect(formatPhotoSizeLabel("2 × 2", 2, 2, "in")).toBe("2 × 2 in");
    expect(formatPhotoSizeLabel("2x2", 2, 2, "in")).toBe("2 × 2 in");
    expect(formatPhotoSizeLabel("Passport", 35, 45, "mm")).toBe(
      "Passport · 35 × 45 mm",
    );
  });
});
