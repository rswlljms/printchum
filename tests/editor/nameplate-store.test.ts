import { beforeEach, describe, expect, it } from "vitest";

import { createNameplateSettings } from "@/lib/nameplates/presets";
import { useEditorStore } from "@/stores/editor-store";

describe("editor nameplate actions", () => {
  beforeEach(() => {
    useEditorStore.getState().resetEditor();
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

  it("allows the primary nameplate text to be completely cleared", () => {
    useEditorStore.getState().addPhotoSizeFromPreset("2x2");
    const itemId = useEditorStore.getState().photoSizes[0].id;
    useEditorStore
      .getState()
      .setPhotoSizeNameplatePreset(itemId, "full-name");

    expect(
      useEditorStore.getState().updatePhotoSizeNameplate(itemId, {
        primaryText: "",
      }),
    ).toBe(true);
    expect(
      useEditorStore.getState().photoSizes[0].nameplate?.primaryText,
    ).toBe("");
  });

  it("preserves spaces while primary nameplate text is entered", () => {
    useEditorStore.getState().addPhotoSizeFromPreset("2x2");
    const itemId = useEditorStore.getState().photoSizes[0].id;
    useEditorStore
      .getState()
      .setPhotoSizeNameplatePreset(itemId, "full-name");

    for (const primaryText of ["Roswell", "Roswell ", "Roswell James"]) {
      expect(
        useEditorStore.getState().updatePhotoSizeNameplate(itemId, {
          primaryText,
        }),
      ).toBe(true);
      expect(
        useEditorStore.getState().photoSizes[0].nameplate?.primaryText,
      ).toBe(primaryText);
    }
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
