import type { MeasurementUnit } from "./types";

export const MM_PER_INCH = 25.4;
export const CM_PER_INCH = 2.54;
export const PDF_POINTS_PER_INCH = 72;
export const PRINT_PIXELS_PER_INCH = 300;

export function toInches(value: number, unit: MeasurementUnit): number {
  switch (unit) {
    case "in":
      return value;
    case "cm":
      return value / CM_PER_INCH;
    case "mm":
      return value / MM_PER_INCH;
  }
}

export function fromInches(value: number, unit: MeasurementUnit): number {
  switch (unit) {
    case "in":
      return value;
    case "cm":
      return value * CM_PER_INCH;
    case "mm":
      return value * MM_PER_INCH;
  }
}

export function convertMeasurement(
  value: number,
  from: MeasurementUnit,
  to: MeasurementUnit,
): number {
  return fromInches(toInches(value, from), to);
}
