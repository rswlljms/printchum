import type {
  NameplatePreset,
  NameplatePresetType,
  NameplateSettings,
} from "@/lib/nameplates/types";

const baseSettings: NameplateSettings = {
  enabled: true,
  presetType: "custom",
  primaryText: "",
  secondaryText: "",
  thirdLineText: "",
  position: "bottom-outside",
  fontSizePoints: 9,
  fontWeight: 500,
  textAlign: "center",
  textColor: "#0a0a0a",
  backgroundColor: "#ffffff",
  borderEnabled: false,
  borderColor: "#0a0a0a",
  borderWidthPoints: 0.5,
  paddingPoints: 3,
  lineSpacing: 1.1,
};

export const nameplatePresets: readonly NameplatePreset[] = [
  {
    id: "full-name",
    name: "Full name",
    description: "One centered name line.",
    settings: {
      ...baseSettings,
      presetType: "full-name",
      primaryText: "Full Name",
    },
  },
  {
    id: "name-and-id",
    name: "Name and ID",
    description: "Name with an ID number below.",
    settings: {
      ...baseSettings,
      presetType: "name-and-id",
      primaryText: "Full Name",
      secondaryText: "ID Number",
    },
  },
  {
    id: "name-id-department",
    name: "Name, ID, department",
    description: "Three-line studio or organization nameplate.",
    settings: {
      ...baseSettings,
      presetType: "name-id-department",
      primaryText: "Full Name",
      secondaryText: "ID Number",
      thirdLineText: "Department",
    },
  },
  {
    id: "custom",
    name: "Custom",
    description: "Start with a blank, fully editable nameplate.",
    settings: {
      ...baseSettings,
      presetType: "custom",
      primaryText: "Full Name",
    },
  },
];

export function createNameplateSettings(
  presetType: NameplatePresetType = "full-name",
): NameplateSettings {
  const preset =
    nameplatePresets.find((candidate) => candidate.id === presetType) ??
    nameplatePresets[0];
  return { ...preset.settings };
}
