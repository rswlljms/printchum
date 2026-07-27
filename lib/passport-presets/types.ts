import type { MeasurementUnit } from "@/lib/layout-engine/types";

export type DocumentType = "passport" | "id" | "license" | "custom";

export type PassportPresetStatus =
  | "verified"
  | "review-needed"
  | "custom";

export type PassportPreset = {
  id: string;
  countryCode: string;
  countryName: string;
  documentType: "passport";
  name: string;
  width: number;
  height: number;
  unit: MeasurementUnit;
  allowedBackgroundColors: string[];
  defaultBackgroundColor?: string;
  headHeightMin?: number;
  headHeightMax?: number;
  headHeightUnit?: MeasurementUnit;
  eyeLineMin?: number;
  eyeLineMax?: number;
  eyeLineUnit?: MeasurementUnit;
  notes?: string;
  officialSourceUrl?: string;
  lastVerifiedAt?: string;
  status: PassportPresetStatus;
  isBuiltIn: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NewPassportPreset = Omit<
  PassportPreset,
  | "id"
  | "documentType"
  | "status"
  | "isBuiltIn"
  | "createdAt"
  | "updatedAt"
>;

export type PassportPresetChanges = Partial<NewPassportPreset>;

export type PassportPresetFilter =
  | "all"
  | "favorites"
  | "recent"
  | "built-in"
  | "custom"
  | "verified"
  | "review-needed";
