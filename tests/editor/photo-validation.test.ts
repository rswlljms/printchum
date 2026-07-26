import { describe, expect, it } from "vitest";

import {
  MAX_PHOTO_SIZE_BYTES,
  validatePhotoFile,
} from "@/features/editor/photo-validation";

describe("validatePhotoFile", () => {
  it.each(["image/jpeg", "image/png", "image/webp"])(
    "accepts %s photos",
    (type) => {
      expect(validatePhotoFile({ type, size: 1024 })).toEqual({ valid: true });
    },
  );

  it("rejects unsupported photo formats with a user-readable error", () => {
    expect(validatePhotoFile({ type: "image/gif", size: 1024 })).toEqual({
      valid: false,
      code: "unsupported-file",
      message: "Choose a JPEG, PNG, or WebP image.",
    });
  });

  it("rejects photos over the file-size limit", () => {
    expect(
      validatePhotoFile({
        type: "image/jpeg",
        size: MAX_PHOTO_SIZE_BYTES + 1,
      }),
    ).toEqual({
      valid: false,
      code: "file-too-large",
      message: "The photo is too large. Choose an image no larger than 15 MB.",
    });
  });

  it("accepts a photo exactly at the file-size limit", () => {
    expect(
      validatePhotoFile({
        type: "image/png",
        size: MAX_PHOTO_SIZE_BYTES,
      }),
    ).toEqual({ valid: true });
  });
});
