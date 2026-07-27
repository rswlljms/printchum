import { describe, expect, it } from "vitest";

import {
  createDefaultPdfFilename,
  sanitizePdfFilename,
} from "@/lib/pdf/filename";

describe("PDF filenames", () => {
  it("creates a deterministic timestamped default", () => {
    expect(
      createDefaultPdfFilename(new Date(2026, 6, 27, 9, 5)),
    ).toBe("printchum-layout-2026-07-27-0905.pdf");
  });

  it.each([
    ["studio/layout:one", "studio-layout-one.pdf"],
    ["layout", "layout.pdf"],
    ["layout.pdf.pdf", "layout.pdf"],
    ['my "layout" <one>', "my -layout- -one.pdf"],
  ])("sanitizes %s", (input, expected) => {
    expect(sanitizePdfFilename(input, "fallback.pdf")).toBe(expected);
  });

  it("uses a safe fallback for empty input", () => {
    expect(sanitizePdfFilename("  ", "printchum.pdf")).toBe(
      "printchum.pdf",
    );
  });

  it("does not derive filenames from customer nameplate text", () => {
    expect(createDefaultPdfFilename(new Date(2026, 0, 1))).not.toContain(
      "customer",
    );
  });
});
