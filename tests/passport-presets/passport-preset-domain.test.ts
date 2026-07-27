import { describe, expect, it } from "vitest";

import {
  createCustomPassportPreset,
  duplicatePassportPreset,
  filterPassportPresets,
  recordRecentPassportPreset,
  removeCustomPassportPreset,
  updateCustomPassportPreset,
} from "@/lib/passport-presets/operations";
import { builtInPassportPresets } from "@/lib/passport-presets/presets";
import { passportPresetInputSchema } from "@/lib/passport-presets/schemas";
import type { NewPassportPreset } from "@/lib/passport-presets/types";

const validInput: NewPassportPreset = {
  countryName: "Test Country",
  countryCode: "TC",
  name: "Test Passport",
  width: 35,
  height: 45,
  unit: "mm",
  allowedBackgroundColors: ["#ffffff"],
  defaultBackgroundColor: "#ffffff",
  notes: "Preparation guide.",
  officialSourceUrl: "https://example.com/source",
  lastVerifiedAt: "2025-01-01",
  isFavorite: false,
};

describe("passport preset domain", () => {
  it("provides six unique built-in passport-only records", () => {
    expect(builtInPassportPresets).toHaveLength(6);
    expect(
      new Set(builtInPassportPresets.map((preset) => preset.id)).size,
    ).toBe(6);
    expect(
      builtInPassportPresets.every(
        (preset) =>
          preset.documentType === "passport" &&
          preset.isBuiltIn &&
          preset.status === "review-needed",
      ),
    ).toBe(true);
    expect(
      JSON.stringify(builtInPassportPresets).toLowerCase(),
    ).not.toContain("visa");
  });

  it("validates country, dimensions, colors, ranges, URLs, and dates", () => {
    expect(passportPresetInputSchema.safeParse(validInput).success).toBe(
      true,
    );
    for (const changes of [
      { countryCode: "1" },
      { width: 21, unit: "in" as const },
      {
        allowedBackgroundColors: ["#ffffff"],
        defaultBackgroundColor: "#000000",
      },
      { headHeightMin: 40, headHeightMax: 30 },
      { eyeLineMin: 40, eyeLineMax: 30 },
      { officialSourceUrl: "not-a-url" },
      { lastVerifiedAt: "2999-01-01" },
      { allowedBackgroundColors: ["linear-gradient(red, blue)"] },
    ]) {
      expect(
        passportPresetInputSchema.safeParse({
          ...validInput,
          ...changes,
        }).success,
      ).toBe(false);
    }
  });

  it("creates, edits, duplicates, and removes only custom presets", () => {
    const created = createCustomPassportPreset(
      builtInPassportPresets,
      validInput,
      "2025-01-01T00:00:00.000Z",
    );
    expect(created).not.toBeNull();
    if (!created) {
      return;
    }
    expect(created.isBuiltIn).toBe(false);
    expect(created.status).toBe("custom");

    const allPresets = [...builtInPassportPresets, created];
    const duplicate = duplicatePassportPreset(
      allPresets,
      builtInPassportPresets[0].id,
      "2025-02-01T00:00:00.000Z",
    );
    expect(duplicate?.id).not.toBe(builtInPassportPresets[0].id);
    expect(duplicate?.isBuiltIn).toBe(false);

    expect(
      updateCustomPassportPreset(
        allPresets,
        builtInPassportPresets[0].id,
        { name: "Blocked" },
      ),
    ).toBeNull();
    expect(
      removeCustomPassportPreset(
        allPresets,
        builtInPassportPresets[0].id,
      ),
    ).toBeNull();

    const updated = updateCustomPassportPreset(
      allPresets,
      created.id,
      { name: "Updated Passport" },
    );
    expect(
      updated?.find((preset) => preset.id === created.id)?.name,
    ).toBe("Updated Passport");
    expect(
      removeCustomPassportPreset(allPresets, created.id),
    ).toHaveLength(builtInPassportPresets.length);
  });

  it("filters favorites and maintains unique recent IDs", () => {
    const favoriteId = builtInPassportPresets[0].id;
    expect(
      filterPassportPresets(
        builtInPassportPresets,
        "philippines",
        "favorites",
        [favoriteId],
        [],
      ).map((preset) => preset.id),
    ).toEqual([favoriteId]);
    expect(
      recordRecentPassportPreset(
        [builtInPassportPresets[1].id, favoriteId],
        favoriteId,
      ),
    ).toEqual([favoriteId, builtInPassportPresets[1].id]);
  });
});
