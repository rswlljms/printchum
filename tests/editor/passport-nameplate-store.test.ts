import { beforeEach, describe, expect, it } from "vitest";

import { createNameplateSettings } from "@/lib/nameplates/presets";
import { builtInPassportPresets } from "@/lib/passport-presets/presets";
import { useEditorStore } from "@/stores/editor-store";

describe("editor passport and nameplate actions", () => {
  beforeEach(() => {
    useEditorStore.setState({
      passportPresets: builtInPassportPresets.map((preset) => ({
        ...preset,
        allowedBackgroundColors: [...preset.allowedBackgroundColors],
      })),
      favoritePassportPresetIds: [],
      recentPassportPresetIds: [],
      selectedPassportPresetId: null,
      passportBackgroundRecommendation: null,
    });
    useEditorStore.getState().resetEditor();
  });

  it("applies a passport preset without changing photo or crop state", () => {
    const sourceFile = new File(["safe-test"], "fixture.png", {
      type: "image/png",
    });
    const crop = {
      xPercent: 10,
      yPercent: 12,
      widthPercent: 70,
      heightPercent: 75,
      zoom: 1.5,
      rotation: 8,
    };
    useEditorStore.setState({
      sourceFile,
      sourceObjectUrl: "blob:test-only",
      crop,
    });

    expect(
      useEditorStore.getState().applyPassportPreset("passport-ph"),
    ).toBe(true);
    const state = useEditorStore.getState();
    expect(state.sourceFile).toBe(sourceFile);
    expect(state.sourceObjectUrl).toBe("blob:test-only");
    expect(state.crop).toEqual(crop);
    expect(state.photoSizes[0]).toMatchObject({
      passportPresetId: "passport-ph",
      source: "passport",
      width: 35,
      height: 45,
      unit: "mm",
      quantity: 1,
      nameplateEnabled: false,
    });
    expect(state.recentPassportPresetIds).toEqual(["passport-ph"]);
    expect(state.backgroundColor).toBe("#ffffff");

    expect(
      useEditorStore.getState().applyPassportPreset("passport-ph"),
    ).toBe(true);
    const passportItems = useEditorStore
      .getState()
      .photoSizes.filter((item) => item.passportPresetId === "passport-ph");
    expect(passportItems).toHaveLength(2);
    expect(passportItems[0].id).not.toBe(passportItems[1].id);
  });

  it("toggles favorites and protects built-in preset mutations", () => {
    useEditorStore
      .getState()
      .togglePassportPresetFavorite("passport-ph");
    expect(
      useEditorStore.getState().favoritePassportPresetIds,
    ).toEqual(["passport-ph"]);
    expect(
      useEditorStore
        .getState()
        .updateCustomPassportPreset("passport-ph", {
          name: "Blocked",
        }),
    ).toBe(false);
    expect(
      useEditorStore
        .getState()
        .removeCustomPassportPreset("passport-ph"),
    ).toBe(false);
  });

  it("applies nameplates per size and to all without changing IDs", () => {
    useEditorStore.getState().addPhotoSizeFromPreset("1x1");
    useEditorStore.getState().addPhotoSizeFromPreset("2x2");
    const [first, second] = useEditorStore.getState().photoSizes;
    useEditorStore
      .getState()
      .setPhotoSizeNameplatePreset(first.id, "name-and-id");
    expect(
      useEditorStore.getState().updatePhotoSizeNameplate(first.id, {
        primaryText: "Studio Test",
        position: "bottom-outside",
      }),
    ).toBe(true);
    const pageCountBefore =
      useEditorStore.getState().layoutResult?.pages.length;
    useEditorStore
      .getState()
      .applyNameplateToAllPhotoSizes(first.id);
    const state = useEditorStore.getState();
    expect(state.photoSizes.map((item) => item.id)).toEqual([
      first.id,
      second.id,
    ]);
    expect(
      state.photoSizes.every(
        (item) =>
          item.nameplate?.primaryText === "Studio Test" &&
          item.nameplateEnabled,
      ),
    ).toBe(true);
    expect(state.layoutResult?.pages.length).toBeGreaterThanOrEqual(
      pageCountBefore ?? 0,
    );
  });

  it("stores nameplate metadata in Service Sets without photo data", () => {
    useEditorStore.getState().addPhotoSizeFromPreset("2x2");
    const itemId = useEditorStore.getState().photoSizes[0].id;
    const settings = {
      ...createNameplateSettings(),
      primaryText: "Repository Test",
    };
    useEditorStore.getState().updatePhotoSizeNameplate(itemId, settings);
    const serviceSetId = useEditorStore
      .getState()
      .saveCurrentEditorAsServiceSet({
        name: "Nameplate package",
        description: "Metadata only",
        price: 40,
        currencyCode: "PHP",
      });
    expect(serviceSetId).not.toBeNull();
    const serviceSet = useEditorStore
      .getState()
      .serviceSets.find((item) => item.id === serviceSetId);
    expect(serviceSet?.photoItems[0].nameplate).toMatchObject({
      primaryText: "Repository Test",
      position: "bottom-outside",
    });
    expect(JSON.stringify(serviceSet)).not.toContain("blob:");
    expect(JSON.stringify(serviceSet)).not.toContain("crop");

    if (serviceSetId) {
      expect(
        useEditorStore.getState().applyServiceSet(serviceSetId),
      ).toBe(true);
      expect(
        useEditorStore.getState().photoSizes[0].nameplate,
      ).toMatchObject({ primaryText: "Repository Test" });
    }
  });
});
