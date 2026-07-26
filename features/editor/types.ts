import type {
  LayoutResult,
  MeasurementUnit,
  PaperOrientation,
} from "@/lib/layout-engine/types";

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
  width: number;
  height: number;
  unit: MeasurementUnit;
};

export type PhotoSizeItem = PhotoSizePreset & {
  instanceId: string;
  quantity: number;
  allowRotation: boolean;
  nameplateEnabled: boolean;
};

export type PaperPreset = {
  id: string;
  name: string;
  width: number;
  height: number;
  unit: MeasurementUnit;
};

export type PaperSettings = PaperPreset & {
  orientation: PaperOrientation;
  margin: number;
  horizontalSpacing: number;
  verticalSpacing: number;
  cuttingGuides: boolean;
  sizeLabels: boolean;
  allowPhotoRotation: boolean;
  autoArrangeMode: "shelf";
};

export type ServiceSet = {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: "PHP";
  items: Array<{
    sizePresetId: string;
    quantity: number;
  }>;
};

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
  selectedServiceSetId: string | null;
  photoSizes: PhotoSizeItem[];
  paper: PaperSettings;
  nameplate: NameplateSettings;
  layoutMode: "auto" | "grid" | "manual";
  layoutResult: LayoutResult | null;
  layoutError: string | null;
  activePageIndex: number;
  previewScale: number;
};
