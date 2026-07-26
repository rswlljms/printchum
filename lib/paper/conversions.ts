import type { MeasurementUnit } from "@/lib/layout-engine/types";
import {
  convertMeasurement,
  fromInches,
  toInches,
} from "@/lib/layout-engine/units";

export { CM_PER_INCH, MM_PER_INCH } from "@/lib/layout-engine/units";
export { convertMeasurement, fromInches, toInches };

export function roundMeasurementForDisplay(
  value: number,
  unit: MeasurementUnit,
): number {
  const precision = unit === "in" ? 3 : unit === "cm" ? 2 : 1;
  return Number(value.toFixed(precision));
}

export function convertMeasurementForDisplay(
  value: number,
  from: MeasurementUnit,
  to: MeasurementUnit,
): number {
  return roundMeasurementForDisplay(convertMeasurement(value, from, to), to);
}

