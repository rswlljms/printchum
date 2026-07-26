import { describe, expect, it } from "vitest";

import {
  containDestinationRectangle,
  coverSourceRectangle,
  keepPhysicalSizeDestinationRectangle,
  normalizedCropToSourceRectangle,
} from "@/lib/canvas/crop-geometry";

describe("Canvas crop geometry", () => {
  it("converts normalized crop state to source-image coordinates", () => {
    expect(
      normalizedCropToSourceRectangle(1000, 800, {
        xPercent: 10,
        yPercent: 25,
        widthPercent: 50,
        heightPercent: 50,
      }),
    ).toEqual({
      x: 100,
      y: 200,
      width: 500,
      height: 400,
    });
  });

  it("crops the source without distortion when filling a target", () => {
    const result = coverSourceRectangle(
      { x: 0, y: 0, width: 800, height: 600 },
      1,
    );

    expect(result).toEqual({
      x: 100,
      y: 0,
      width: 600,
      height: 600,
    });
    expect(result.width / result.height).toBe(1);
  });

  it("letterboxes a crop without changing its aspect ratio", () => {
    const result = containDestinationRectangle(
      { x: 0, y: 0, width: 800, height: 400 },
      { x: 0, y: 0, width: 200, height: 200 },
    );

    expect(result).toEqual({
      x: 0,
      y: 50,
      width: 200,
      height: 100,
    });
    expect(result.width / result.height).toBe(2);
  });

  it("keeps the crop at its reference physical width", () => {
    const result = keepPhysicalSizeDestinationRectangle(
      { x: 0, y: 0, width: 600, height: 900 },
      { x: 0, y: 0, width: 400, height: 500 },
      2,
      100,
    );

    expect(result).toEqual({
      x: 100,
      y: 100,
      width: 200,
      height: 300,
    });
  });

  it("clamps malformed normalized bounds to the source image", () => {
    expect(
      normalizedCropToSourceRectangle(100, 100, {
        xPercent: 90,
        yPercent: 90,
        widthPercent: 50,
        heightPercent: 50,
      }),
    ).toEqual({
      x: 90,
      y: 90,
      width: 10,
      height: 10,
    });
  });
});
