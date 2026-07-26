import type {
  NewPhotoSizeItem,
  PhotoSizeItem,
  PhotoSizePreset,
} from "@/features/editor/types";

export const photoSizePresets: readonly PhotoSizePreset[] = [
  {
    id: "1x1",
    name: "1 × 1",
    description: "Compact ID photo",
    width: 1,
    height: 1,
    unit: "in",
    category: "id",
    defaultQuantity: 4,
    allowRotationByDefault: false,
  },
  {
    id: "1.5x1.5",
    name: "1.5 × 1.5",
    description: "Square ID photo",
    width: 1.5,
    height: 1.5,
    unit: "in",
    category: "id",
    defaultQuantity: 4,
    allowRotationByDefault: false,
  },
  {
    id: "2x2",
    name: "2 × 2",
    description: "Standard square photo",
    width: 2,
    height: 2,
    unit: "in",
    category: "id",
    defaultQuantity: 4,
    allowRotationByDefault: false,
  },
  {
    id: "passport",
    name: "Passport",
    description: "Placeholder · not official",
    width: 35,
    height: 45,
    unit: "mm",
    category: "passport",
    defaultQuantity: 4,
    allowRotationByDefault: false,
  },
  {
    id: "wallet",
    name: "Wallet",
    description: "Wallet-size portrait",
    width: 2.5,
    height: 3.5,
    unit: "in",
    category: "wallet",
    defaultQuantity: 2,
    allowRotationByDefault: false,
  },
  {
    id: "2r",
    name: "2R",
    description: "Small photo paper",
    width: 2.5,
    height: 3.5,
    unit: "in",
    category: "photo-paper",
    defaultQuantity: 1,
    allowRotationByDefault: false,
  },
  {
    id: "half-body",
    name: "Half Body",
    description: "Portrait print",
    width: 3.5,
    height: 5,
    unit: "in",
    category: "portrait",
    defaultQuantity: 1,
    allowRotationByDefault: false,
  },
  {
    id: "custom",
    name: "Custom",
    description: "Enter your own dimensions",
    width: 2,
    height: 2,
    unit: "in",
    category: "custom",
    defaultQuantity: 1,
    allowRotationByDefault: false,
  },
];

let selectedPhotoSizeSequence = 0;

export function createSelectedPhotoSizeId(): string {
  selectedPhotoSizeSequence += 1;
  return `photo-size-${selectedPhotoSizeSequence}`;
}

export function createPhotoSizeItemFromPreset(
  preset: PhotoSizePreset,
  quantity = preset.defaultQuantity,
): PhotoSizeItem {
  return {
    id: createSelectedPhotoSizeId(),
    presetId: preset.id,
    name: preset.name,
    width: preset.width,
    height: preset.height,
    unit: preset.unit,
    quantity,
    allowRotation: preset.allowRotationByDefault,
    nameplateEnabled: false,
  };
}

export function createCustomPhotoSizeItem(
  item: NewPhotoSizeItem,
): PhotoSizeItem {
  return {
    ...item,
    id: createSelectedPhotoSizeId(),
  };
}

export function findPhotoSizePreset(
  presetId: string,
): PhotoSizePreset | undefined {
  return photoSizePresets.find((preset) => preset.id === presetId);
}
