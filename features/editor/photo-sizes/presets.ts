import type {
  NewPhotoSizeItem,
  PhotoSizeItem,
  PhotoSizePreset,
} from "@/features/editor/types";

export const PHOTO_SIZE_DEFAULT_QUANTITY = 1;

export const photoSizePresets: readonly PhotoSizePreset[] = [
  {
    id: "1x1",
    name: "1 × 1",
    description: "Compact ID photo",
    width: 1,
    height: 1,
    unit: "in",
    category: "id",
    defaultQuantity: PHOTO_SIZE_DEFAULT_QUANTITY,
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
    defaultQuantity: PHOTO_SIZE_DEFAULT_QUANTITY,
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
    defaultQuantity: PHOTO_SIZE_DEFAULT_QUANTITY,
    allowRotationByDefault: false,
  },
  {
    id: "passport",
    name: "Passport",
    description: "Common document photo size",
    width: 35,
    height: 45,
    unit: "mm",
    category: "passport",
    defaultQuantity: PHOTO_SIZE_DEFAULT_QUANTITY,
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
    defaultQuantity: PHOTO_SIZE_DEFAULT_QUANTITY,
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
    defaultQuantity: PHOTO_SIZE_DEFAULT_QUANTITY,
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
    defaultQuantity: PHOTO_SIZE_DEFAULT_QUANTITY,
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
    defaultQuantity: PHOTO_SIZE_DEFAULT_QUANTITY,
    allowRotationByDefault: false,
  },
];

let selectedPhotoSizeSequence = 0;

export function createSelectedPhotoSizeId(
  existingIds: readonly string[] = [],
): string {
  let candidate: string;
  do {
    selectedPhotoSizeSequence += 1;
    candidate = `photo-size-${selectedPhotoSizeSequence}`;
  } while (existingIds.includes(candidate));
  return candidate;
}

export function createPhotoSizeItemFromPreset(
  preset: PhotoSizePreset,
  quantity = preset.defaultQuantity,
  existingIds: readonly string[] = [],
): PhotoSizeItem {
  return {
    id: createSelectedPhotoSizeId(existingIds),
    source: "standard",
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
  existingIds: readonly string[] = [],
): PhotoSizeItem {
  return {
    ...item,
    source: item.source ?? "custom",
    id: createSelectedPhotoSizeId(existingIds),
  };
}

export function findPhotoSizePreset(
  presetId: string,
): PhotoSizePreset | undefined {
  return photoSizePresets.find((preset) => preset.id === presetId);
}
