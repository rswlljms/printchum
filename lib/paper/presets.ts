import type { PaperPreset, PaperSettings } from "@/lib/paper/types";

export const paperPresets: readonly PaperPreset[] = [
  {
    id: "letter",
    name: "Letter / Short Bond",
    description: "8.5 × 11 in · office",
    width: 8.5,
    height: 11,
    unit: "in",
    category: "office",
    defaultOrientation: "portrait",
    defaultMargin: 0.25,
    defaultHorizontalSpacing: 0.125,
    defaultVerticalSpacing: 0.125,
  },
  {
    id: "legal",
    name: "Legal",
    description: "8.5 × 14 in · office",
    width: 8.5,
    height: 14,
    unit: "in",
    category: "office",
    defaultOrientation: "portrait",
    defaultMargin: 0.25,
    defaultHorizontalSpacing: 0.125,
    defaultVerticalSpacing: 0.125,
  },
  {
    id: "a4",
    name: "A4",
    description: "210 × 297 mm · office",
    width: 210,
    height: 297,
    unit: "mm",
    category: "office",
    defaultOrientation: "portrait",
    defaultMargin: 5,
    defaultHorizontalSpacing: 3,
    defaultVerticalSpacing: 3,
  },
  {
    id: "a3",
    name: "A3",
    description: "297 × 420 mm · office",
    width: 297,
    height: 420,
    unit: "mm",
    category: "office",
    defaultOrientation: "portrait",
    defaultMargin: 5,
    defaultHorizontalSpacing: 3,
    defaultVerticalSpacing: 3,
  },
  {
    id: "4r",
    name: "4R",
    description: "4 × 6 in · photo",
    width: 4,
    height: 6,
    unit: "in",
    category: "photo",
    defaultOrientation: "portrait",
    defaultMargin: 0.125,
    defaultHorizontalSpacing: 0.0625,
    defaultVerticalSpacing: 0.0625,
  },
  {
    id: "5r",
    name: "5R",
    description: "5 × 7 in · photo",
    width: 5,
    height: 7,
    unit: "in",
    category: "photo",
    defaultOrientation: "portrait",
    defaultMargin: 0.125,
    defaultHorizontalSpacing: 0.0625,
    defaultVerticalSpacing: 0.0625,
  },
  {
    id: "custom",
    name: "Custom",
    description: "Define reusable dimensions",
    width: 8.5,
    height: 11,
    unit: "in",
    category: "custom",
    defaultOrientation: "portrait",
    defaultMargin: 0.25,
    defaultHorizontalSpacing: 0.1,
    defaultVerticalSpacing: 0.1,
  },
] as const;

export function findPaperPreset(
  presetId: string,
): PaperPreset | undefined {
  return paperPresets.find((preset) => preset.id === presetId);
}

export function createPaperSettingsFromPreset(
  preset: PaperPreset,
  displayOptions?: Pick<
    PaperSettings,
    | "cuttingGuidesEnabled"
    | "sizeLabelsEnabled"
    | "allowPhotoRotation"
    | "autoArrangeMode"
  >,
): PaperSettings {
  return {
    presetId: preset.category === "custom" ? null : preset.id,
    name: preset.category === "custom" ? "Custom Paper" : preset.name,
    width: preset.width,
    height: preset.height,
    unit: preset.unit,
    orientation: preset.defaultOrientation,
    margin: preset.defaultMargin,
    horizontalSpacing: preset.defaultHorizontalSpacing,
    verticalSpacing: preset.defaultVerticalSpacing,
    cuttingGuidesEnabled: displayOptions?.cuttingGuidesEnabled ?? true,
    sizeLabelsEnabled: displayOptions?.sizeLabelsEnabled ?? false,
    allowPhotoRotation: displayOptions?.allowPhotoRotation ?? false,
    autoArrangeMode: displayOptions?.autoArrangeMode ?? "auto",
  };
}

