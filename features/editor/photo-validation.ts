export const MAX_PHOTO_SIZE_BYTES = 15 * 1024 * 1024;

const ALLOWED_PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export type PhotoValidationErrorCode =
  | "unsupported-file"
  | "file-too-large";

export type PhotoValidationResult =
  | { valid: true }
  | {
      valid: false;
      code: PhotoValidationErrorCode;
      message: string;
    };

type PhotoFileMetadata = Pick<File, "size" | "type">;

export function validatePhotoFile(
  file: PhotoFileMetadata,
): PhotoValidationResult {
  if (!ALLOWED_PHOTO_TYPES.has(file.type.toLowerCase())) {
    return {
      valid: false,
      code: "unsupported-file",
      message: "Choose a JPEG, PNG, or WebP image.",
    };
  }

  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return {
      valid: false,
      code: "file-too-large",
      message: "The photo is too large. Choose an image no larger than 15 MB.",
    };
  }

  return { valid: true };
}
