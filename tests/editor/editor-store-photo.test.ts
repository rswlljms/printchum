import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useEditorStore } from "@/stores/editor-store";

function createPhoto(type = "image/jpeg"): File {
  return { size: 1024, type } as File;
}

describe("editor photo session lifecycle", () => {
  const createObjectUrl = vi.spyOn(URL, "createObjectURL");
  const revokeObjectUrl = vi.spyOn(URL, "revokeObjectURL");

  beforeEach(() => {
    createObjectUrl.mockReset();
    revokeObjectUrl.mockReset();
    useEditorStore.getState().resetEditor();
  });

  afterEach(() => {
    useEditorStore.getState().disposeSourcePhoto();
  });

  it("revokes the previous object URL when replacing a photo", () => {
    createObjectUrl
      .mockReturnValueOnce("blob:session-photo-1")
      .mockReturnValueOnce("blob:session-photo-2");

    useEditorStore.getState().replaceSourcePhoto(createPhoto());
    useEditorStore.getState().replaceSourcePhoto(createPhoto("image/png"));

    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:session-photo-1");
    expect(useEditorStore.getState().sourceObjectUrl).toBe(
      "blob:session-photo-2",
    );
  });

  it("revokes and clears the active URL when removing a photo", () => {
    createObjectUrl.mockReturnValue("blob:session-photo");
    useEditorStore.getState().replaceSourcePhoto(createPhoto());

    useEditorStore.getState().removeSourcePhoto();

    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:session-photo");
    expect(useEditorStore.getState().sourceFile).toBeNull();
    expect(useEditorStore.getState().sourceObjectUrl).toBeNull();
  });

  it("revokes the active URL when the photo owner is disposed", () => {
    createObjectUrl.mockReturnValue("blob:session-photo");
    useEditorStore.getState().replaceSourcePhoto(createPhoto());
    useEditorStore.getState().addCustomPhotoSize({
      name: "Session size",
      width: 1,
      height: 1,
      unit: "in",
      quantity: 1,
      allowRotation: false,
      nameplateEnabled: false,
    });

    useEditorStore.getState().disposeSourcePhoto();

    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:session-photo");
    expect(useEditorStore.getState().sourceObjectUrl).toBeNull();
    expect(
      useEditorStore.getState().photoSizes[0].sourcePhotoId,
    ).toBeUndefined();
  });

  it("revokes the active URL when resetting the editor", () => {
    createObjectUrl.mockReturnValue("blob:session-photo");
    useEditorStore.getState().replaceSourcePhoto(createPhoto());

    useEditorStore.getState().resetEditor();

    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:session-photo");
    expect(useEditorStore.getState().sourceObjectUrl).toBeNull();
  });

  it("stores normalized crop percentages and resets crop controls", () => {
    useEditorStore.getState().setCropZoom(2);
    useEditorStore.getState().setCropRotation(45);
    useEditorStore.getState().setNormalizedCrop({
      xPercent: 10,
      yPercent: 20,
      widthPercent: 60,
      heightPercent: 70,
    });

    expect(useEditorStore.getState().crop).toEqual({
      xPercent: 10,
      yPercent: 20,
      widthPercent: 60,
      heightPercent: 70,
      zoom: 2,
      rotation: 45,
    });

    useEditorStore.getState().resetCrop();

    expect(useEditorStore.getState().crop).toEqual({
      xPercent: 0,
      yPercent: 0,
      widthPercent: 100,
      heightPercent: 100,
      zoom: 1,
      rotation: 0,
    });
  });

  it("keeps each person's sizes and crop state independent", () => {
    createObjectUrl
      .mockReturnValueOnce("blob:person-1")
      .mockReturnValueOnce("blob:person-2");

    useEditorStore.getState().addSourcePhoto(createPhoto());
    const firstPhotoId =
      useEditorStore.getState().activeSourcePhotoId;
    useEditorStore.getState().addCustomPhotoSize({
      name: "Person 1 size",
      width: 1,
      height: 1,
      unit: "in",
      quantity: 4,
      allowRotation: false,
      nameplateEnabled: false,
    });
    useEditorStore.getState().setCropZoom(1.5);

    useEditorStore.getState().addSourcePhoto(createPhoto("image/png"));
    const secondPhotoId =
      useEditorStore.getState().activeSourcePhotoId;
    useEditorStore.getState().addCustomPhotoSize({
      name: "Person 2 size",
      width: 2,
      height: 2,
      unit: "in",
      quantity: 2,
      allowRotation: false,
      nameplateEnabled: false,
    });
    useEditorStore.getState().setCropZoom(2);

    expect(firstPhotoId).not.toBeNull();
    expect(secondPhotoId).not.toBe(firstPhotoId);
    expect(
      useEditorStore.getState().photoSizes.map((item) => ({
        sourcePhotoId: item.sourcePhotoId,
        quantity: item.quantity,
      })),
    ).toEqual([
      { sourcePhotoId: firstPhotoId, quantity: 4 },
      { sourcePhotoId: secondPhotoId, quantity: 2 },
    ]);

    useEditorStore.getState().selectSourcePhoto(firstPhotoId!);
    expect(useEditorStore.getState().crop.zoom).toBe(1.5);

    useEditorStore.getState().removeSourcePhoto(firstPhotoId!);
    const state = useEditorStore.getState();
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:person-1");
    expect(state.sourcePhotos).toHaveLength(1);
    expect(state.photoSizes).toHaveLength(1);
    expect(state.photoSizes[0].sourcePhotoId).toBe(secondPhotoId);
  });
});
