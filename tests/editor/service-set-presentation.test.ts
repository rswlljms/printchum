import { describe, expect, it } from "vitest";

import {
  formatServiceSetPrice,
  summarizeServiceSetItems,
} from "@/features/editor/service-set-presentation";
import { builtInServiceSets } from "@/lib/service-sets/presets";

describe("service-set presentation", () => {
  it("formats prices in Philippine pesos", () => {
    expect(formatServiceSetPrice(builtInServiceSets[0])).toBe("₱40.00");
  });

  it("summarizes each photo size and piece count", () => {
    expect(summarizeServiceSetItems(builtInServiceSets[3])).toEqual([
      { key: "service-set-d-1x1", text: "6 pcs · 1 × 1 in" },
      { key: "service-set-d-2x2", text: "2 pcs · 2 × 2 in" },
    ]);
  });
});
