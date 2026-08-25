import { describe, expect, it } from "vitest";

import { createDefaultExportToggles } from "@/components/editor/export-option-toggles";
import type { PhotoSizeItem } from "@/features/editor/types";
import { createNameplateSettings } from "@/lib/nameplates/presets";

function createPhotoSizeItem(
  overrides: Partial<PhotoSizeItem> = {},
): PhotoSizeItem {
  return {
    id: "photo-size-1",
    source: "custom",
    name: "Passport",
    width: 2,
    height: 2,
    unit: "in",
    quantity: 1,
    allowRotation: false,
    nameplateEnabled: false,
    ...overrides,
  };
}

describe("createDefaultExportToggles", () => {
  it("disables nameplates when every photo size has them disabled", () => {
    const toggles = createDefaultExportToggles({
      photoSizes: [
        createPhotoSizeItem(),
        createPhotoSizeItem({ id: "photo-size-2" }),
      ],
      cuttingGuidesEnabled: true,
      sizeLabelsEnabled: false,
      backgroundMode: "original",
    });

    expect(toggles.includeNameplates).toBe(false);
    expect(toggles.includeBackground).toBe(false);
  });

  it("enables nameplates when at least one photo size enables them", () => {
    const toggles = createDefaultExportToggles({
      photoSizes: [
        createPhotoSizeItem(),
        createPhotoSizeItem({
          id: "photo-size-2",
          nameplateEnabled: true,
          nameplate: createNameplateSettings("name-and-id"),
        }),
      ],
      cuttingGuidesEnabled: false,
      sizeLabelsEnabled: true,
      backgroundMode: "solid",
    });

    expect(toggles.includeNameplates).toBe(true);
    expect(toggles.includeBackground).toBe(true);
  });

  it("ignores nameplates whose settings are disabled while the flag is on", () => {
    const toggles = createDefaultExportToggles({
      photoSizes: [
        createPhotoSizeItem({
          nameplateEnabled: true,
          nameplate: { ...createNameplateSettings(), enabled: false },
        }),
      ],
      cuttingGuidesEnabled: true,
      sizeLabelsEnabled: true,
      backgroundMode: "original",
    });

    expect(toggles.includeNameplates).toBe(false);
  });

  it("marks the background as selected only for non-original modes", () => {
    const baseInput = {
      photoSizes: [createPhotoSizeItem()],
      cuttingGuidesEnabled: true,
      sizeLabelsEnabled: true,
    };

    expect(
      createDefaultExportToggles({
        ...baseInput,
        backgroundMode: "transparent",
      }).includeBackground,
    ).toBe(true);
    expect(
      createDefaultExportToggles({
        ...baseInput,
        backgroundMode: "solid",
      }).includeBackground,
    ).toBe(true);
    expect(
      createDefaultExportToggles({
        ...baseInput,
        backgroundMode: "original",
      }).includeBackground,
    ).toBe(false);
  });

  it("mirrors the paper guide and label settings", () => {
    const toggles = createDefaultExportToggles({
      photoSizes: [],
      cuttingGuidesEnabled: false,
      sizeLabelsEnabled: true,
      backgroundMode: "original",
    });

    expect(toggles.includeCuttingGuides).toBe(false);
    expect(toggles.includeSizeLabels).toBe(true);
  });
});
