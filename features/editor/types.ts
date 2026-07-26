import type {
  LayoutResult,
  MeasurementUnit,
} from "@/lib/layout-engine/types";
import type {
  CustomPaperPreset,
  PaperSettings,
} from "@/lib/paper/types";
import type {
  AppliedServiceSetSnapshot,
  ServiceSet,
  ServiceSetModificationState,
} from "@/lib/service-sets/types";

export type {
  CustomPaperPreset,
  PaperPreset,
  PaperSettings,
} from "@/lib/paper/types";

export type CropMode =
  | "keep-head-size"
  | "fill-frame"
  | "fit-with-padding";

export type CropState = {
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  zoom: number;
  rotation: number;
};

export type PhotoSizePreset = {
  id: string;
  name: string;
  description?: string;
  width: number;
  height: number;
  unit: MeasurementUnit;
  category:
    | "id"
    | "passport"
    | "wallet"
    | "photo-paper"
    | "portrait"
    | "custom";
  defaultQuantity: number;
  allowRotationByDefault: boolean;
};

export type PhotoSizeItem = {
  id: string;
  presetId?: string;
  name: string;
  width: number;
  height: number;
  unit: MeasurementUnit;
  quantity: number;
  allowRotation: boolean;
  nameplateEnabled: boolean;
};

export type NewPhotoSizeItem = Omit<PhotoSizeItem, "id">;

export type PhotoSizeItemChanges = Partial<
  Omit<PhotoSizeItem, "id" | "presetId">
>;

export type NameplateSettings = {
  enabled: boolean;
  primaryText: string;
  secondaryText: string;
  thirdLine: string;
};

export type EditorState = {
  sourceFile: File | null;
  sourceObjectUrl: string | null;
  crop: CropState;
  cropMode: CropMode;
  backgroundMode: "original" | "transparent" | "solid";
  backgroundColor: string;
  backgroundRemoved: boolean;
  serviceSets: ServiceSet[];
  selectedServiceSetId: string | null;
  appliedServiceSetSnapshot: AppliedServiceSetSnapshot | null;
  serviceSetModificationState: ServiceSetModificationState;
  photoSizes: PhotoSizeItem[];
  paper: PaperSettings;
  customPaperPresets: CustomPaperPreset[];
  nameplate: NameplateSettings;
  layoutMode: "auto" | "grid" | "manual";
  layoutResult: LayoutResult | null;
  layoutError: string | null;
  activePageIndex: number;
  previewScale: number;
};
