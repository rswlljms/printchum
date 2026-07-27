import type { NameplateSettings } from "@/lib/nameplates/types";

export const PDF_POINTS_PER_INCH = 72;

export type NameplateMeasurementInput = {
  settings: NameplateSettings;
  photoWidthInches: number;
  pointToInchRatio?: number;
};

export type NameplateMeasurementResult = {
  contentHeightInches: number;
  paddingHeightInches: number;
  borderHeightInches: number;
  totalHeightInches: number;
  lineCount: number;
};

export function countNameplateLines(settings: NameplateSettings): number {
  return [
    settings.primaryText,
    settings.secondaryText,
    settings.thirdLineText,
  ].filter((line) => Boolean(line?.trim())).length;
}

export function measureNameplate({
  settings,
  photoWidthInches,
  pointToInchRatio = 1 / PDF_POINTS_PER_INCH,
}: NameplateMeasurementInput): NameplateMeasurementResult {
  if (!settings.enabled || photoWidthInches <= 0) {
    return {
      contentHeightInches: 0,
      paddingHeightInches: 0,
      borderHeightInches: 0,
      totalHeightInches: 0,
      lineCount: 0,
    };
  }

  const lineCount = countNameplateLines(settings);
  if (lineCount === 0) {
    return {
      contentHeightInches: 0,
      paddingHeightInches: 0,
      borderHeightInches: 0,
      totalHeightInches: 0,
      lineCount: 0,
    };
  }

  const contentHeightInches =
    lineCount *
    settings.fontSizePoints *
    settings.lineSpacing *
    pointToInchRatio;
  const paddingHeightInches =
    settings.paddingPoints * 2 * pointToInchRatio;
  const borderHeightInches = settings.borderEnabled
    ? settings.borderWidthPoints * 2 * pointToInchRatio
    : 0;

  return {
    contentHeightInches,
    paddingHeightInches,
    borderHeightInches,
    totalHeightInches:
      contentHeightInches +
      paddingHeightInches +
      borderHeightInches,
    lineCount,
  };
}

export function isOutsideNameplate(settings: NameplateSettings): boolean {
  return settings.position.endsWith("-outside");
}

export function mayNameplateTextOverflow(
  settings: NameplateSettings,
  photoWidthInches: number,
): boolean {
  const longestLine = Math.max(
    settings.primaryText.length,
    settings.secondaryText?.length ?? 0,
    settings.thirdLineText?.length ?? 0,
  );
  const approximateCharacterWidthInches =
    settings.fontSizePoints * 0.55 / PDF_POINTS_PER_INCH;
  const availableWidthInches = Math.max(
    photoWidthInches -
      settings.paddingPoints * 2 / PDF_POINTS_PER_INCH,
    0,
  );
  return longestLine * approximateCharacterWidthInches > availableWidthInches;
}
