import { beforeEach, describe, expect, it } from "vitest";

import { toInches } from "@/lib/paper/conversions";
import type { NewCustomPaperPreset } from "@/lib/paper/types";
import { useEditorStore } from "@/stores/editor-store";

function clearCustomPaperPresets(): void {
  for (const preset of useEditorStore.getState().customPaperPresets) {
    useEditorStore.getState().removeCustomPaperPreset(preset.id);
  }
}

function createCustomPreset(
  name: string,
): NewCustomPaperPreset {
  return {
    name,
    width: 6,
    height: 8,
    unit: "in",
    orientation: "portrait",
    margin: 0.25,
    horizontalSpacing: 0.1,
    verticalSpacing: 0.2,
    cuttingGuidesEnabled: true,
    sizeLabelsEnabled: false,
    allowPhotoRotation: false,
    autoArrangeMode: "auto",
  };
}

describe("editor paper settings", () => {
  beforeEach(() => {
    clearCustomPaperPresets();
    useEditorStore.getState().resetEditor();
  });

  it("applies standard presets and recalculates page overflow", () => {
    useEditorStore.getState().addCustomPhotoSize({
      name: "2 × 2",
      width: 2,
      height: 2,
      unit: "in",
      quantity: 18,
      allowRotation: false,
      nameplateEnabled: false,
    });

    useEditorStore.getState().setPaperPreset("letter");
    expect(useEditorStore.getState().layoutResult?.pages).toHaveLength(2);

    useEditorStore.getState().setPaperPreset("legal");
    const legalState = useEditorStore.getState();
    expect(legalState.paper).toMatchObject({
      presetId: "legal",
      name: "Legal",
      width: 8.5,
      height: 14,
      unit: "in",
    });
    expect(legalState.layoutResult?.pages).toHaveLength(1);
  });

  it("preserves physical dimensions and spacing through unit changes", () => {
    useEditorStore.getState().setPaperPreset("a4");
    const millimeterPaper = useEditorStore.getState().paper;
    const widthInches = toInches(
      millimeterPaper.width,
      millimeterPaper.unit,
    );
    const marginInches = toInches(
      millimeterPaper.margin,
      millimeterPaper.unit,
    );

    useEditorStore.getState().setPaperUnit("in");
    const inchPaper = useEditorStore.getState().paper;
    expect(inchPaper.width).toBeCloseTo(widthInches, 12);
    expect(inchPaper.margin).toBeCloseTo(marginInches, 12);
    expect(inchPaper.horizontalSpacing).not.toBe(
      inchPaper.verticalSpacing + 1,
    );

    useEditorStore.getState().setPaperUnit("mm");
    const restoredPaper = useEditorStore.getState().paper;
    expect(restoredPaper.width).toBeCloseTo(210, 10);
    expect(restoredPaper.height).toBeCloseTo(297, 10);
    expect(restoredPaper.margin).toBeCloseTo(5, 10);
  });

  it("changes orientation without swapping stored source dimensions", () => {
    useEditorStore.getState().setPaperPreset("letter");
    useEditorStore.getState().setPaperOrientation("landscape");
    const state = useEditorStore.getState();

    expect(state.paper.width).toBe(8.5);
    expect(state.paper.height).toBe(11);
    expect(state.paper.orientation).toBe("landscape");
  });

  it("keeps the last valid layout when a margin is invalid", () => {
    useEditorStore.getState().addPhotoSizeFromPreset("2x2");
    const previousPaper = useEditorStore.getState().paper;
    const previousLayout = useEditorStore.getState().layoutResult;

    useEditorStore.getState().setPaperMargin(100);
    const state = useEditorStore.getState();

    expect(state.paper).toEqual(previousPaper);
    expect(state.layoutResult).toEqual(previousLayout);
    expect(state.layoutError).toBe(
      "The current margin leaves no printable area.",
    );
  });

  it("updates utilization when a valid margin changes", () => {
    useEditorStore.getState().addPhotoSizeFromPreset("2x2");
    const firstUtilization =
      useEditorStore.getState().layoutResult?.utilizationPercent ?? 0;

    useEditorStore.getState().setPaperMargin(0.5);
    const secondUtilization =
      useEditorStore.getState().layoutResult?.utilizationPercent ?? 0;

    expect(secondUtilization).toBeGreaterThan(firstUtilization);
  });

  it("combines global and per-item rotation with an AND rule", () => {
    useEditorStore.getState().addCustomPhotoSize({
      name: "Rotation fit",
      width: 10,
      height: 7,
      unit: "in",
      quantity: 1,
      allowRotation: true,
      nameplateEnabled: false,
    });
    expect(useEditorStore.getState().layoutResult?.unplacedItems).toHaveLength(
      1,
    );

    useEditorStore.getState().setGlobalPhotoRotation(true);
    expect(useEditorStore.getState().layoutResult?.unplacedItems).toHaveLength(
      0,
    );
    expect(
      useEditorStore.getState().layoutResult?.pages[0].items[0].rotation,
    ).toBe(90);

    useEditorStore.getState().setGlobalPhotoRotation(false);
    expect(useEditorStore.getState().photoSizes[0].allowRotation).toBe(true);
    expect(useEditorStore.getState().layoutResult?.unplacedItems).toHaveLength(
      1,
    );
  });

  it("marks manually changed preset dimensions as modified", () => {
    useEditorStore.getState().setPaperPreset("letter");
    useEditorStore.getState().setPaperDimensions(8, 10, "in");
    expect(useEditorStore.getState().paper).toMatchObject({
      presetId: null,
      width: 8,
      height: 10,
    });
  });

  it("creates, updates, duplicates, applies, and deletes unique custom presets", () => {
    const firstId = useEditorStore
      .getState()
      .saveCustomPaperPreset(createCustomPreset("Studio sheet"));
    expect(firstId).not.toBeNull();
    expect(
      useEditorStore
        .getState()
        .saveCustomPaperPreset(createCustomPreset("Studio sheet")),
    ).toBeNull();

    const duplicateId = useEditorStore
      .getState()
      .duplicateCustomPaperPreset(firstId!);
    expect(duplicateId).not.toBeNull();
    expect(duplicateId).not.toBe(firstId);

    expect(
      useEditorStore.getState().updateCustomPaperPreset(duplicateId!, {
        name: "Studio sheet alternate",
      }),
    ).toBe(true);
    useEditorStore.getState().applyCustomPaperPreset(duplicateId!);
    expect(useEditorStore.getState().paper).toMatchObject({
      presetId: duplicateId,
      name: "Studio sheet alternate",
      horizontalSpacing: 0.1,
      verticalSpacing: 0.2,
    });

    useEditorStore.getState().removeCustomPaperPreset(duplicateId!);
    expect(useEditorStore.getState().paper.presetId).toBeNull();
    expect(useEditorStore.getState().paper.name).toBe(
      "Studio sheet alternate",
    );
    expect(
      useEditorStore.getState().customPaperPresets.map((preset) => preset.id),
    ).toEqual([firstId]);
  });

  it("keeps empty photo-size layouts deterministic across paper changes", () => {
    useEditorStore.getState().setPaperPreset("a3");
    const firstResult = useEditorStore.getState().layoutResult;
    useEditorStore.getState().recalculateLayout();
    const secondResult = useEditorStore.getState().layoutResult;

    expect(firstResult).toEqual(secondResult);
    expect(secondResult).toMatchObject({
      pages: [],
      totalItems: 0,
      unplacedItems: [],
    });
  });
});

