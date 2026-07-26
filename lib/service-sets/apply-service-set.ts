import type { PhotoSizeItem } from "@/features/editor/types";
import { createSelectedPhotoSizeId } from "@/features/editor/photo-sizes/presets";
import { convertMeasurement } from "@/lib/paper/conversions";
import {
  createPaperSettingsFromPreset,
  findPaperPreset,
} from "@/lib/paper/presets";
import type { PaperSettings } from "@/lib/paper/types";
import type {
  ApplyServiceSetResult,
  ServiceSet,
  ServiceSetPaperConfig,
} from "@/lib/service-sets/types";

type DisplayOptions = Pick<
  PaperSettings,
  "cuttingGuidesEnabled" | "sizeLabelsEnabled" | "allowPhotoRotation"
>;

export function serviceSetPaperToSettings(
  paper: ServiceSetPaperConfig,
  displayOptions: DisplayOptions,
): PaperSettings {
  if (paper.source === "custom") {
    return {
      presetId: null,
      name: paper.name,
      width: paper.width,
      height: paper.height,
      unit: paper.unit,
      orientation: paper.orientation,
      margin: paper.margin,
      horizontalSpacing: paper.horizontalSpacing,
      verticalSpacing: paper.verticalSpacing,
      ...displayOptions,
      autoArrangeMode: "auto",
    };
  }

  const preset = findPaperPreset(paper.presetId);
  if (!preset) {
    throw new Error("The Service Set uses an unsupported paper preset.");
  }
  const settings = createPaperSettingsFromPreset(preset, {
    ...displayOptions,
    autoArrangeMode: "auto",
  });
  return {
    ...settings,
    orientation: paper.orientation,
    margin: convertMeasurement(paper.margin, paper.unit, settings.unit),
    horizontalSpacing: convertMeasurement(
      paper.horizontalSpacing,
      paper.unit,
      settings.unit,
    ),
    verticalSpacing: convertMeasurement(
      paper.verticalSpacing,
      paper.unit,
      settings.unit,
    ),
  };
}

export function createEditorConfigurationFromServiceSet(
  serviceSet: ServiceSet,
  createId: (existingIds: readonly string[]) => string =
    createSelectedPhotoSizeId,
): ApplyServiceSetResult {
  const photoSizes: PhotoSizeItem[] = [];
  for (const item of serviceSet.photoItems) {
    const existingIds = photoSizes.map((photoSize) => photoSize.id);
    photoSizes.push({
      id: createId(existingIds),
      presetId: item.photoSizePresetId,
      name: item.name,
      width: item.width,
      height: item.height,
      unit: item.unit,
      quantity: item.quantity,
      allowRotation: item.allowRotation,
      nameplateEnabled: item.nameplateEnabled,
    });
  }

  return {
    photoSizes,
    paper: serviceSetPaperToSettings(serviceSet.paper, {
      cuttingGuidesEnabled: serviceSet.cuttingGuidesEnabled,
      sizeLabelsEnabled: serviceSet.sizeLabelsEnabled,
      allowPhotoRotation: serviceSet.allowPhotoRotation,
    }),
    backgroundMode: serviceSet.background.mode,
    backgroundColor:
      serviceSet.background.mode === "solid"
        ? serviceSet.background.color
        : "#ffffff",
  };
}
