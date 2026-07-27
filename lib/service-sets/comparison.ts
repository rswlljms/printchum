import { toInches } from "@/lib/paper/conversions";
import type {
  ServiceSetComparableConfiguration,
} from "@/lib/service-sets/types";

function normalizedNumber(value: number): string {
  return Number(value.toFixed(6)).toString();
}

export function createServiceSetConfigurationFingerprint(
  configuration: ServiceSetComparableConfiguration,
): string {
  const photoSizes = configuration.photoSizes.map((item) =>
    [
      item.presetId ?? "",
      item.name.trim(),
      normalizedNumber(toInches(item.width, item.unit)),
      normalizedNumber(toInches(item.height, item.unit)),
      item.quantity,
      item.allowRotation ? 1 : 0,
      item.nameplateEnabled ? 1 : 0,
      item.nameplate ? JSON.stringify(item.nameplate) : "",
    ].join("|"),
  );
  const paper = configuration.paper;
  return [
    `photos:${photoSizes.join(";")}`,
    `paper:${paper.presetId ?? ""}|${paper.name.trim()}|${normalizedNumber(
      toInches(paper.width, paper.unit),
    )}|${normalizedNumber(toInches(paper.height, paper.unit))}|${
      paper.orientation
    }|${normalizedNumber(toInches(paper.margin, paper.unit))}|${normalizedNumber(
      toInches(paper.horizontalSpacing, paper.unit),
    )}|${normalizedNumber(toInches(paper.verticalSpacing, paper.unit))}|${
      paper.cuttingGuidesEnabled ? 1 : 0
    }|${paper.sizeLabelsEnabled ? 1 : 0}|${
      paper.allowPhotoRotation ? 1 : 0
    }`,
    `background:${configuration.backgroundMode}|${
      configuration.backgroundMode === "solid"
        ? configuration.backgroundColor.toLowerCase()
        : ""
    }`,
  ].join("::");
}
