import type { PhotoSizeItem } from "@/features/editor/types";
import type {
  MeasurementUnit,
  PaperOrientation,
} from "@/lib/layout-engine/types";
import type { PaperSettings } from "@/lib/paper/types";
import type { NameplateSettings } from "@/lib/nameplates/types";

export type ServiceSetStatus = "enabled" | "disabled";

export type BackgroundPreference =
  | { mode: "original" }
  | { mode: "transparent" }
  | { mode: "solid"; color: string };

export type ServiceSetPhotoItem = {
  id: string;
  photoSizePresetId?: string;
  name: string;
  width: number;
  height: number;
  unit: MeasurementUnit;
  quantity: number;
  allowRotation: boolean;
  nameplateEnabled: boolean;
  nameplate?: NameplateSettings;
};

export type ServiceSetPaperConfig =
  | {
      source: "preset";
      presetId: string;
      orientation: PaperOrientation;
      margin: number;
      horizontalSpacing: number;
      verticalSpacing: number;
      unit: MeasurementUnit;
    }
  | {
      source: "custom";
      name: string;
      width: number;
      height: number;
      unit: MeasurementUnit;
      orientation: PaperOrientation;
      margin: number;
      horizontalSpacing: number;
      verticalSpacing: number;
    };

export type ServiceSet = {
  id: string;
  name: string;
  description?: string;
  status: ServiceSetStatus;
  isDefault: boolean;
  isBuiltIn: boolean;
  displayOrder: number;
  price: number;
  currencyCode: string;
  photoItems: ServiceSetPhotoItem[];
  paper: ServiceSetPaperConfig;
  background: BackgroundPreference;
  cuttingGuidesEnabled: boolean;
  sizeLabelsEnabled: boolean;
  allowPhotoRotation: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NewServiceSet = Omit<
  ServiceSet,
  "id" | "isBuiltIn" | "displayOrder" | "createdAt" | "updatedAt"
>;

export type ServiceSetChanges = Partial<
  Omit<ServiceSet, "id" | "isBuiltIn" | "createdAt">
>;

export type ServiceSetModificationState =
  | "unselected"
  | "applied"
  | "modified";

export type AppliedServiceSetSnapshot = {
  serviceSetId: string;
  serviceSetName: string;
  price: number;
  currencyCode: string;
  normalizedConfigurationHash: string;
  appliedAt: string;
};

export type ServiceSetComparableConfiguration = {
  photoSizes: PhotoSizeItem[];
  paper: PaperSettings;
  backgroundMode: "original" | "transparent" | "solid";
  backgroundColor: string;
};

export type ApplyServiceSetResult = {
  photoSizes: PhotoSizeItem[];
  paper: PaperSettings;
  backgroundMode: "original" | "transparent" | "solid";
  backgroundColor: string;
};
