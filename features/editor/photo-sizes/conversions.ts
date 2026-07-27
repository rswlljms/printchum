import type {
  MeasurementUnit,
} from "@/lib/layout-engine/types";
import {
  convertMeasurement,
  toInches,
} from "@/lib/layout-engine/units";

const DISPLAY_PRECISION: Record<MeasurementUnit, number> = {
  in: 3,
  cm: 2,
  mm: 1,
};

export function roundMeasurementForDisplay(
  value: number,
  unit: MeasurementUnit,
): number {
  const factor = 10 ** DISPLAY_PRECISION[unit];
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function convertDisplayedMeasurement(
  value: number,
  fromUnit: MeasurementUnit,
  toUnit: MeasurementUnit,
): number {
  return roundMeasurementForDisplay(
    convertMeasurement(value, fromUnit, toUnit),
    toUnit,
  );
}

export function exceedsMaximumPhysicalDimension(
  value: number,
  unit: MeasurementUnit,
): boolean {
  return toInches(value, unit) > 100;
}

export function formatPhotoDimensions(
  width: number,
  height: number,
  unit: MeasurementUnit,
): string {
  return `${width} × ${height} ${unit}`;
}

function normalizeDimensionLabel(value: string): string {
  return value
    .toLowerCase()
    .replace(/\b(?:in|cm|mm)\b/g, "")
    .replace(/[×x]/g, "x")
    .replace(/\s+/g, "")
    .trim();
}

export function formatPhotoSizeLabel(
  name: string,
  width: number,
  height: number,
  unit: MeasurementUnit,
): string {
  const dimensions = formatPhotoDimensions(width, height, unit);

  if (normalizeDimensionLabel(name) === normalizeDimensionLabel(dimensions)) {
    return dimensions;
  }

  return `${name} · ${dimensions}`;
}
