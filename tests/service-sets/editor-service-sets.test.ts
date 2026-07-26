import { beforeEach, describe, expect, it, vi } from "vitest";

import { createInitialServiceSets } from "@/lib/service-sets/presets";
import { useEditorStore } from "@/stores/editor-store";

function createPhoto(): File {
  return { size: 1024, type: "image/jpeg" } as File;
}

describe("editor Service Set integration", () => {
  beforeEach(() => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:active-photo");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    useEditorStore.getState().resetEditor();
    useEditorStore.setState({ serviceSets: createInitialServiceSets() });
  });

  it("applies a complete set and recalculates LayoutResult", () => {
    expect(
      useEditorStore.getState().applyServiceSet("service-set-d"),
    ).toBe(true);
    const state = useEditorStore.getState();
    expect(state.photoSizes.map((item) => item.quantity)).toEqual([6, 2]);
    expect(state.paper.presetId).toBe("letter");
    expect(state.layoutResult?.totalItems).toBe(8);
    expect(state.serviceSetModificationState).toBe("applied");
  });

  it("preserves the active photo and normalized crop while applying", () => {
    useEditorStore.getState().replaceSourcePhoto(createPhoto());
    useEditorStore.getState().setCropZoom(2);
    useEditorStore.getState().setNormalizedCrop({
      xPercent: 10,
      yPercent: 15,
      widthPercent: 70,
      heightPercent: 80,
    });
    const before = useEditorStore.getState();

    useEditorStore.getState().applyServiceSet("service-set-c");
    const after = useEditorStore.getState();
    expect(after.sourceFile).toBe(before.sourceFile);
    expect(after.sourceObjectUrl).toBe("blob:active-photo");
    expect(after.crop).toEqual(before.crop);
  });

  it("marks configuration changes as modified and reapply restores applied", () => {
    useEditorStore.getState().applyServiceSet("service-set-b");
    const itemId = useEditorStore.getState().photoSizes[0].id;
    useEditorStore.getState().setPhotoSizeQuantity(itemId, 9);
    expect(useEditorStore.getState().serviceSetModificationState).toBe(
      "modified",
    );
    expect(useEditorStore.getState().reapplySelectedServiceSet()).toBe(true);
    expect(useEditorStore.getState().photoSizes[0].quantity).toBe(4);
    expect(useEditorStore.getState().serviceSetModificationState).toBe(
      "applied",
    );
  });

  it("does not mark photo or crop-only changes as modified", () => {
    useEditorStore.getState().applyServiceSet("service-set-a");
    useEditorStore.getState().replaceSourcePhoto(createPhoto());
    useEditorStore.getState().setCropZoom(2.5);
    useEditorStore.getState().setPreviewScale(2);
    expect(useEditorStore.getState().serviceSetModificationState).toBe(
      "applied",
    );
  });

  it("rejects disabled sets and keeps the current configuration", () => {
    useEditorStore
      .getState()
      .setServiceSetStatus("service-set-c", "disabled");
    const before = useEditorStore.getState().photoSizes;
    expect(
      useEditorStore.getState().applyServiceSet("service-set-c"),
    ).toBe(false);
    expect(useEditorStore.getState().photoSizes).toBe(before);
  });

  it("saves current editor configuration without photo or crop data", () => {
    useEditorStore.getState().addPhotoSizeFromPreset("2x2");
    useEditorStore.getState().replaceSourcePhoto(createPhoto());
    const id = useEditorStore.getState().saveCurrentEditorAsServiceSet({
      name: "Saved package",
      description: "Reusable layout",
      price: 75,
      currencyCode: "PHP",
    });
    const saved = useEditorStore
      .getState()
      .serviceSets.find((set) => set.id === id);
    expect(saved).toBeDefined();
    expect(saved).not.toHaveProperty("sourceFile");
    expect(saved).not.toHaveProperty("sourceObjectUrl");
    expect(saved).not.toHaveProperty("crop");
    expect(JSON.stringify(saved)).not.toContain("blob:");
  });
});
