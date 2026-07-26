import type {
  MeasurementUnit,
  PaperOrientation,
} from "@/lib/layout-engine/types";

export type PaperPresetCategory =
  | "office"
  | "photo"
  | "regional"
  | "custom";

export type AutoArrangeMode = "auto" | "grid";

export type PaperPreset = {
  id: string;
  name: string;
  description?: string;
  width: number;
  height: number;
  unit: MeasurementUnit;
  category: PaperPresetCategory;
  defaultOrientation: PaperOrientation;
  defaultMargin: number;
  defaultHorizontalSpacing: number;
  defaultVerticalSpacing: number;
};

export type PaperSettings = {
  presetId: string | null;
  name: string;
  width: number;
  height: number;
  unit: MeasurementUnit;
  orientation: PaperOrientation;
  margin: number;
  horizontalSpacing: number;
  verticalSpacing: number;
  cuttingGuidesEnabled: boolean;
  sizeLabelsEnabled: boolean;
  allowPhotoRotation: boolean;
  autoArrangeMode: AutoArrangeMode;
};

export type CustomPaperPreset = PaperSettings & {
  id: string;
  presetId: null;
  createdAt: string;
  updatedAt: string;
};

export type NewCustomPaperPreset = Omit<
  CustomPaperPreset,
  "id" | "presetId" | "createdAt" | "updatedAt"
>;

export type CustomPaperPresetChanges = Partial<NewCustomPaperPreset>;

export type PrintableArea = {
  paperWidthInches: number;
  paperHeightInches: number;
  printableWidthInches: number;
  printableHeightInches: number;
  marginInches: number;
  isValid: boolean;
  error?: string;
};

