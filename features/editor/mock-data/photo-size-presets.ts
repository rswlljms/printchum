import type { PhotoSizePreset } from "../types";

export const photoSizePresets: PhotoSizePreset[] = [
  { id: "1x1", name: "1 × 1 in", width: 1, height: 1, unit: "in" },
  { id: "1.5x1.5", name: "1.5 × 1.5 in", width: 1.5, height: 1.5, unit: "in" },
  { id: "2x2", name: "2 × 2 in", width: 2, height: 2, unit: "in" },
  { id: "passport", name: "Passport", width: 35, height: 45, unit: "mm" },
  { id: "visa", name: "Visa", width: 2, height: 2, unit: "in" },
  { id: "wallet", name: "Wallet", width: 2.5, height: 3.5, unit: "in" },
  { id: "2r", name: "2R", width: 2.5, height: 3.5, unit: "in" },
  { id: "half-body", name: "Half Body", width: 3.5, height: 5, unit: "in" },
  { id: "custom", name: "Custom", width: 2, height: 2, unit: "in" },
];

export function createPhotoSizeItem(
  preset: PhotoSizePreset,
  quantity: number,
): import("../types").PhotoSizeItem {
  return {
    ...preset,
    instanceId: `${preset.id}-selection`,
    quantity,
    allowRotation: false,
    nameplateEnabled: false,
  };
}
