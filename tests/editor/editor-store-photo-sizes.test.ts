import { beforeEach, describe, expect, it } from "vitest";

import { useEditorStore } from "@/stores/editor-store";

describe("editor photo-size actions", () => {
  beforeEach(() => {
    useEditorStore.getState().resetEditor();
  });

  it("adds preset sizes with unique selected IDs and recalculates layout", () => {
    const store = useEditorStore.getState();
    store.addPhotoSizeFromPreset("2x2");
    useEditorStore.getState().addPhotoSizeFromPreset("2x2");

    const state = useEditorStore.getState();
    expect(state.photoSizes).toHaveLength(2);
    expect(state.photoSizes[0].id).not.toBe(state.photoSizes[1].id);
    expect(state.layoutResult?.totalItems).toBe(8);
  });

  it("adds and edits a custom size in centimeters", () => {
    useEditorStore.getState().addCustomPhotoSize({
      name: "Custom cm",
      width: 5.08,
      height: 7.62,
      unit: "cm",
      quantity: 3,
      allowRotation: false,
      nameplateEnabled: false,
    });
    const itemId = useEditorStore.getState().photoSizes[0].id;

    useEditorStore.getState().updatePhotoSize(itemId, {
      name: "Edited custom",
      width: 2,
      height: 3,
      unit: "in",
      quantity: 5,
    });

    const state = useEditorStore.getState();
    expect(state.photoSizes[0]).toMatchObject({
      id: itemId,
      name: "Edited custom",
      width: 2,
      height: 3,
      unit: "in",
      quantity: 5,
    });
    expect(state.layoutResult?.totalItems).toBe(5);
  });

  it("duplicates next to the source and removes only one instance", () => {
    useEditorStore.getState().addPhotoSizeFromPreset("wallet");
    const source = useEditorStore.getState().photoSizes[0];

    useEditorStore.getState().duplicatePhotoSize(source.id);
    const duplicatedState = useEditorStore.getState();
    expect(duplicatedState.photoSizes).toHaveLength(2);
    expect(duplicatedState.photoSizes[1].id).not.toBe(source.id);
    expect(duplicatedState.photoSizes[1]).toMatchObject({
      name: "Wallet Copy",
      width: source.width,
      height: source.height,
      unit: source.unit,
      quantity: source.quantity,
      allowRotation: source.allowRotation,
      nameplateEnabled: source.nameplateEnabled,
    });

    useEditorStore.getState().removePhotoSize(source.id);
    expect(useEditorStore.getState().photoSizes).toHaveLength(1);
    expect(useEditorStore.getState().photoSizes[0].id).toBe(
      duplicatedState.photoSizes[1].id,
    );
  });

  it("clamps quantity and recalculates after every quantity mutation", () => {
    useEditorStore.getState().addPhotoSizeFromPreset("1x1");
    const itemId = useEditorStore.getState().photoSizes[0].id;

    useEditorStore.getState().setPhotoSizeQuantity(itemId, 0);
    expect(useEditorStore.getState().photoSizes[0].quantity).toBe(1);
    expect(useEditorStore.getState().layoutResult?.totalItems).toBe(1);

    useEditorStore.getState().setPhotoSizeQuantity(itemId, 999);
    expect(useEditorStore.getState().photoSizes[0].quantity).toBe(500);
    expect(useEditorStore.getState().layoutResult?.totalItems).toBe(500);
  });

  it("propagates rotation and nameplate flags without rendering a nameplate", () => {
    useEditorStore.getState().addCustomPhotoSize({
      name: "Rotation fit",
      width: 10,
      height: 7,
      unit: "in",
      quantity: 1,
      allowRotation: false,
      nameplateEnabled: false,
    });
    const itemId = useEditorStore.getState().photoSizes[0].id;
    expect(useEditorStore.getState().layoutResult?.unplacedItems).toHaveLength(1);

    useEditorStore.getState().setPhotoSizeRotation(itemId, true);
    useEditorStore.getState().setPhotoSizeNameplate(itemId, true);

    const state = useEditorStore.getState();
    expect(state.photoSizes[0].allowRotation).toBe(true);
    expect(state.photoSizes[0].nameplateEnabled).toBe(true);
    expect(state.layoutResult?.unplacedItems).toHaveLength(0);
    expect(state.layoutResult?.pages[0].items[0].rotation).toBe(90);
  });

  it("supports deterministic mixed-size and mixed-unit layouts", () => {
    useEditorStore.getState().addPhotoSizeFromPreset("1x1");
    useEditorStore.getState().addCustomPhotoSize({
      name: "Metric",
      width: 35,
      height: 45,
      unit: "mm",
      quantity: 2,
      allowRotation: false,
      nameplateEnabled: false,
    });

    useEditorStore.getState().recalculateLayout();
    const firstResult = useEditorStore.getState().layoutResult;
    useEditorStore.getState().recalculateLayout();
    const secondResult = useEditorStore.getState().layoutResult;

    expect(firstResult).toEqual(secondResult);
    expect(firstResult?.totalItems).toBe(6);
  });

  it("returns an empty layout after removing the final size", () => {
    useEditorStore.getState().addPhotoSizeFromPreset("2x2");
    const itemId = useEditorStore.getState().photoSizes[0].id;
    useEditorStore.getState().removePhotoSize(itemId);

    const state = useEditorStore.getState();
    expect(state.photoSizes).toEqual([]);
    expect(state.layoutResult).toMatchObject({
      pages: [],
      totalItems: 0,
      placedItems: 0,
      unplacedItems: [],
      utilizationPercent: 0,
    });
  });

  it("reports oversized custom items without crashing", () => {
    useEditorStore.getState().addCustomPhotoSize({
      name: "Too large",
      width: 12,
      height: 12,
      unit: "in",
      quantity: 2,
      allowRotation: true,
      nameplateEnabled: false,
    });

    const result = useEditorStore.getState().layoutResult;
    expect(result?.pages).toEqual([]);
    expect(result?.unplacedItems).toHaveLength(2);
  });
});
