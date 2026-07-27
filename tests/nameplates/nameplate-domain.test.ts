import { describe, expect, it } from "vitest";

import { calculateLayout } from "@/lib/layout-engine/calculate-layout";
import {
  countNameplateLines,
  measureNameplate,
  PDF_POINTS_PER_INCH,
} from "@/lib/nameplates/measurement";
import { createNameplateSettings } from "@/lib/nameplates/presets";
import { nameplateSettingsSchema } from "@/lib/nameplates/schemas";

describe("nameplate domain", () => {
  it("validates enabled content, typography, borders, and positions", () => {
    const valid = createNameplateSettings("name-id-department");
    expect(nameplateSettingsSchema.safeParse(valid).success).toBe(true);
    for (const changes of [
      { fontSizePoints: 4 },
      { fontWeight: 300 },
      { borderWidthPoints: 11 },
      { paddingPoints: 41 },
      { lineSpacing: 0.7 },
      { position: "middle" },
      { textColor: "linear-gradient(red, blue)" },
    ]) {
      expect(
        nameplateSettingsSchema.safeParse({
          ...valid,
          ...changes,
        }).success,
      ).toBe(false);
    }
  });

  it("allows the primary line to be cleared while editing", () => {
    const settings = {
      ...createNameplateSettings(),
      primaryText: "",
    };

    expect(nameplateSettingsSchema.safeParse(settings).success).toBe(true);
  });

  it("uses deterministic points-to-inches measurement", () => {
    const settings = createNameplateSettings("name-id-department");
    const measurement = measureNameplate({
      settings,
      photoWidthInches: 2,
    });
    expect(PDF_POINTS_PER_INCH).toBe(72);
    expect(countNameplateLines(settings)).toBe(3);
    expect(measurement.lineCount).toBe(3);
    expect(measurement.totalHeightInches).toBeCloseTo(
      (
        3 * settings.fontSizePoints * settings.lineSpacing +
        2 * settings.paddingPoints
      ) / 72,
      10,
    );
    expect(
      measureNameplate({
        settings: { ...settings, enabled: false },
        photoWidthInches: 2,
      }).totalHeightInches,
    ).toBe(0);
  });

  it("changes packing only for outside nameplates without overlap", () => {
    const baseInput = {
      paper: {
        widthInches: 4,
        heightInches: 4,
        orientation: "portrait" as const,
      },
      marginInches: 0,
      horizontalSpacingInches: 0,
      verticalSpacingInches: 0,
      items: [
        {
          id: "photo",
          widthInches: 2,
          heightInches: 2,
          quantity: 4,
          allowRotation: false,
        },
      ],
    };
    const inside = calculateLayout({
      ...baseInput,
      items: [
        {
          ...baseInput.items[0],
          nameplate: {
            enabled: true,
            position: "bottom-inside" as const,
            heightInches: 0.5,
          },
        },
      ],
    });
    const outsideInput = {
      ...baseInput,
      items: [
        {
          ...baseInput.items[0],
          nameplate: {
            enabled: true,
            position: "bottom-outside" as const,
            heightInches: 0.5,
          },
        },
      ],
    };
    const outside = calculateLayout(outsideInput);

    expect(inside.pages).toHaveLength(1);
    expect(inside.pages[0].items[0].heightInches).toBe(2);
    expect(outside.pages).toHaveLength(2);
    expect(outside.pages[0].items[0].heightInches).toBe(2.5);
    expect(calculateLayout(outsideInput)).toEqual(outside);

    for (const page of outside.pages) {
      for (const [index, item] of page.items.entries()) {
        for (const other of page.items.slice(index + 1)) {
          const separated =
            item.xInches + item.widthInches <= other.xInches ||
            other.xInches + other.widthInches <= item.xInches ||
            item.yInches + item.heightInches <= other.yInches ||
            other.yInches + other.heightInches <= item.yInches;
          expect(separated).toBe(true);
        }
      }
    }
  });

  it("keeps rotated nameplate geometry deterministic", () => {
    const input = {
      paper: {
        widthInches: 3,
        heightInches: 5,
        orientation: "portrait" as const,
      },
      marginInches: 0,
      horizontalSpacingInches: 0,
      verticalSpacingInches: 0,
      items: [
        {
          id: "rotated",
          widthInches: 4,
          heightInches: 2,
          quantity: 1,
          allowRotation: true,
          nameplate: {
            enabled: true,
            position: "top-outside" as const,
            heightInches: 0.5,
          },
        },
      ],
    };
    const result = calculateLayout(input);
    expect(result.pages[0].items[0]).toMatchObject({
      rotation: 90,
      widthInches: 2.5,
      heightInches: 4,
      photoWidthInches: 4,
      photoHeightInches: 2,
      nameplateHeightInches: 0.5,
      nameplatePosition: "top-outside",
    });
    expect(calculateLayout(input)).toEqual(result);
  });
});
