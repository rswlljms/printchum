import { describe, expect, it } from "vitest";

import { parsePageRange } from "@/lib/pdf/page-range";

describe("parsePageRange", () => {
  it.each([
    ["1", [0]],
    ["1-3", [0, 1, 2]],
    ["1,3,5", [0, 2, 4]],
    ["1-3,5", [0, 1, 2, 4]],
    ["3,1-2,3", [0, 1, 2]],
  ])("parses %s into sorted unique indexes", (value, expected) => {
    expect(parsePageRange(value, 5)).toEqual({
      valid: true,
      pageIndexes: expected,
    });
  });

  it.each(["0", "-1", "1-", "a", "1--2", "2-1", "1,,2"])(
    "rejects malformed range %s",
    (value) => {
      expect(parsePageRange(value, 5).valid).toBe(false);
    },
  );

  it("rejects pages beyond the layout", () => {
    expect(parsePageRange("1-4", 3)).toEqual({
      valid: false,
      error: "Page 4 is outside the 3-page layout.",
    });
  });
});
