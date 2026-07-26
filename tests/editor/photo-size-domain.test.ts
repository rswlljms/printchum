import { describe, expect, it } from "vitest";

import {
  convertDisplayedMeasurement,
  exceedsMaximumPhysicalDimension,
} from "@/features/editor/photo-sizes/conversions";
import {
  createPhotoSizeItemFromPreset,
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
    expect(findPhotoSizePreset("wallet")?.defaultQuantity).toBe(2);
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
    expect(first.quantity).toBe(4);
    expect(first.presetId).toBe("2x2");
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
});
