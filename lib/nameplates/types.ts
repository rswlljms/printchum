export type NameplatePosition =
  | "bottom-inside"
  | "bottom-outside"
  | "top-inside"
  | "top-outside";

export type NameplateTextAlign = "left" | "center" | "right";

export type NameplateFontWeight = 400 | 500 | 600 | 700;

export type NameplatePresetType =
  | "full-name"
  | "name-and-id"
  | "name-id-department"
  | "custom";

export type NameplateSettings = {
  enabled: boolean;
  presetType: NameplatePresetType;
  primaryText: string;
  secondaryText?: string;
  thirdLineText?: string;
  position: NameplatePosition;
  fontSizePoints: number;
  fontWeight: NameplateFontWeight;
  textAlign: NameplateTextAlign;
  textColor: string;
  backgroundColor: string;
  borderEnabled: boolean;
  borderColor: string;
  borderWidthPoints: number;
  paddingPoints: number;
  lineSpacing: number;
};

export type NameplatePreset = {
  id: NameplatePresetType;
  name: string;
  description: string;
  settings: NameplateSettings;
};
