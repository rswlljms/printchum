import { describe, expect, it } from "vitest";

import { photoSizePresets } from "@/features/editor/mock-data/photo-size-presets";
import {
  formatServiceSetPrice,
  summarizeServiceSetItems,
} from "@/features/editor/service-set-presentation";
import type { ServiceSet } from "@/features/editor/types";

const serviceSet: ServiceSet = {
  id: "set-test",
  name: "Set Test",
  price: 40,
  currency: "PHP",
  items: [
    { sizePresetId: "1x1", quantity: 1 },
    { sizePresetId: "2x2", quantity: 4 },
  ],
};

describe("service-set presentation", () => {
  it("formats prices in Philippine pesos", () => {
    expect(formatServiceSetPrice(serviceSet)).toBe("₱40.00");
  });

  it("summarizes each photo size and piece count", () => {
    expect(summarizeServiceSetItems(serviceSet, photoSizePresets)).toEqual([
      { key: "1x1-0", text: "1 pc · 1 × 1 in" },
      { key: "2x2-1", text: "4 pcs · 2 × 2 in" },
    ]);
  });
});
