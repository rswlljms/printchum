import { describe, expect, it, vi } from "vitest";

import { drawLayoutPreview } from "@/lib/canvas/draw-layout-preview";
import type { LayoutResult } from "@/lib/layout-engine/types";

function createContext() {
  const drawImage = vi.fn();
  const fillText = vi.fn();
  const context = {
    beginPath: vi.fn(),
    clearRect: vi.fn(),
    clip: vi.fn(),
    drawImage,
    fillRect: vi.fn(),
    fillText,
    lineTo: vi.fn(),
    moveTo: vi.fn(),
    rect: vi.fn(),
    restore: vi.fn(),
    rotate: vi.fn(),
    save: vi.fn(),
    setLineDash: vi.fn(),
    stroke: vi.fn(),
    strokeRect: vi.fn(),
    translate: vi.fn(),
  } as unknown as CanvasRenderingContext2D;

  return { context, drawImage, fillText };
}

const layoutResult: LayoutResult = {
  pages: [
    {
      pageIndex: 0,
      items: [
        {
          id: "small-1",
          sourceItemId: "small",
          pageIndex: 0,
          xInches: 0.25,
          yInches: 0.25,
          widthInches: 1,
          heightInches: 1,
          rotation: 0,
        },
        {
          id: "large-1",
          sourceItemId: "large",
          pageIndex: 0,
          xInches: 1.5,
          yInches: 0.25,
          widthInches: 2,
          heightInches: 2,
          rotation: 0,
        },
      ],
    },
    {
      pageIndex: 1,
      items: [
        {
          id: "small-2",
          sourceItemId: "small",
          pageIndex: 1,
          xInches: 0.25,
          yInches: 0.25,
          widthInches: 1,
          heightInches: 1,
          rotation: 0,
        },
      ],
    },
  ],
  totalItems: 3,
  placedItems: 3,
  unplacedItems: [],
  utilizationPercent: 10,
};

describe("drawLayoutPreview", () => {
  it("renders every LayoutResult item on only the active page", () => {
    const { context, drawImage, fillText } = createContext();
    const commonInput = {
      context,
      viewportWidth: 900,
      viewportHeight: 700,
      paperWidthInches: 8.5,
      paperHeightInches: 11,
      marginInches: 0.25,
      layoutResult,
      previewScale: 1,
      photo: {
        image: {} as CanvasImageSource,
        sourceWidth: 800,
        sourceHeight: 800,
        crop: {
          xPercent: 0,
          yPercent: 0,
          widthPercent: 100,
          heightPercent: 100,
          zoom: 1,
          rotation: 0,
        },
        cropMode: "fill-frame" as const,
        referenceWidthInches: 1,
      },
      cuttingGuides: true,
      sizeLabels: true,
      itemLabels: {
        small: "1 × 1 in",
        large: "2 × 2 in",
      },
    };

    drawLayoutPreview({ ...commonInput, activePageIndex: 0 });

    expect(drawImage).toHaveBeenCalledTimes(2);
    expect(fillText).toHaveBeenCalledWith(
      "1 × 1 in",
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
    );
    expect(fillText).toHaveBeenCalledWith(
      "2 × 2 in",
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
    );

    drawImage.mockClear();
    fillText.mockClear();
    drawLayoutPreview({ ...commonInput, activePageIndex: 1 });

    expect(drawImage).toHaveBeenCalledTimes(1);
    expect(fillText).toHaveBeenCalledTimes(1);
    expect(fillText).toHaveBeenCalledWith(
      "1 × 1 in",
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
    );
  });
});
