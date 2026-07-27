import { describe, expect, it } from "vitest";

import type { PhotoSizeItem } from "@/features/editor/types";
import type { LayoutResult } from "@/lib/layout-engine/types";
import { createNameplateSettings } from "@/lib/nameplates/presets";
import { createRenderPages } from "@/lib/pdf/render-model";

const paper = {
  presetId: "letter",
  name: "Letter",
  width: 8.5,
  height: 11,
  unit: "in" as const,
  orientation: "portrait" as const,
  margin: 0.25,
  horizontalSpacing: 0.125,
  verticalSpacing: 0.125,
  cuttingGuidesEnabled: true,
  sizeLabelsEnabled: false,
  allowPhotoRotation: true,
  autoArrangeMode: "auto" as const,
};

const photo: PhotoSizeItem = {
  id: "photo-1",
  name: "2 × 3",
  width: 2,
  height: 3,
  unit: "in",
  quantity: 1,
  allowRotation: true,
  nameplateEnabled: false,
};

function layout(rotation: 0 | 90): LayoutResult {
  return {
    pages: [
      {
        pageIndex: 0,
        items: [
          {
            id: "photo-1-1",
            sourceItemId: "photo-1",
            pageIndex: 0,
            xInches: 0.25,
            yInches: 0.5,
            widthInches: rotation === 90 ? 3 : 2,
            heightInches: rotation === 90 ? 2 : 3,
            rotation,
          },
        ],
      },
    ],
    totalItems: 1,
    placedItems: 1,
    unplacedItems: [],
    utilizationPercent: 6,
  };
}

describe("shared PDF render model", () => {
  it("preserves LayoutResult placement deterministically", () => {
    const first = createRenderPages(
      layout(0),
      paper,
      [photo],
      {
        xPercent: 0,
        yPercent: 0,
        widthPercent: 100,
        heightPercent: 100,
        zoom: 1,
        rotation: 0,
      },
      "fill-frame",
    );
    expect(first).toEqual(
      createRenderPages(
        layout(0),
        paper,
        [photo],
        first[0].items[0].crop,
        "fill-frame",
      ),
    );
    expect(first[0].items[0].placement).toEqual({
      xInches: 0.25,
      yInches: 0.5,
      widthInches: 2,
      heightInches: 3,
    });
  });

  it("transforms rotated photo geometry once", () => {
    const page = createRenderPages(
      layout(90),
      paper,
      [photo],
      {
        xPercent: 0,
        yPercent: 0,
        widthPercent: 100,
        heightPercent: 100,
        zoom: 1,
        rotation: 0,
      },
      "fill-frame",
    )[0];
    expect(page.items[0].rotation).toBe(90);
    expect(page.items[0].photoRect).toEqual({
      xInches: 0.25,
      yInches: 0.5,
      widthInches: 3,
      heightInches: 2,
    });
  });

  it("uses layout-engine outside-nameplate measurements", () => {
    const nameplate = {
      ...createNameplateSettings("full-name"),
      position: "bottom-outside" as const,
    };
    const namedPhoto = {
      ...photo,
      nameplateEnabled: true,
      nameplate,
    };
    const namedLayout = layout(0);
    namedLayout.pages[0].items[0] = {
      ...namedLayout.pages[0].items[0],
      heightInches: 3.3,
      photoWidthInches: 2,
      photoHeightInches: 3,
      nameplateHeightInches: 0.3,
      nameplatePosition: "bottom-outside",
    };
    const item = createRenderPages(
      namedLayout,
      paper,
      [namedPhoto],
      {
        xPercent: 0,
        yPercent: 0,
        widthPercent: 100,
        heightPercent: 100,
        zoom: 1,
        rotation: 0,
      },
      "fill-frame",
    )[0].items[0];
    expect(item.photoRect.heightInches).toBe(3);
    expect(item.nameplateRect?.xInches).toBe(0.25);
    expect(item.nameplateRect?.yInches).toBe(3.5);
    expect(item.nameplateRect?.widthInches).toBe(2);
    expect(item.nameplateRect?.heightInches).toBeCloseTo(0.3);
  });
});
