import { describe, expect, it } from "vitest";

import {
  CM_PER_INCH,
  MM_PER_INCH,
  convertMeasurement,
  fromInches,
  toInches,
} from "@/lib/layout-engine/units";

describe("measurement conversion", () => {
  it("converts supported units to inches", () => {
    expect(toInches(1, "in")).toBe(1);
    expect(toInches(CM_PER_INCH, "cm")).toBeCloseTo(1, 10);
    expect(toInches(MM_PER_INCH, "mm")).toBeCloseTo(1, 10);
  });

  it("converts inches to supported units", () => {
    expect(fromInches(2, "in")).toBe(2);
    expect(fromInches(2, "cm")).toBeCloseTo(5.08, 10);
    expect(fromInches(2, "mm")).toBeCloseTo(50.8, 10);
  });

  it("converts directly between metric units", () => {
    expect(convertMeasurement(10, "cm", "mm")).toBeCloseTo(100, 10);
    expect(convertMeasurement(50.8, "mm", "cm")).toBeCloseTo(5.08, 10);
  });
});
