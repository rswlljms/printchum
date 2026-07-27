import { PDFDocument, StandardFonts } from "pdf-lib";
import { describe, expect, it } from "vitest";

import { fitTextToWidth } from "@/lib/pdf/render-nameplate";

describe("PDF nameplate text fitting", () => {
  it("keeps short text and empty optional lines unchanged", async () => {
    const document = await PDFDocument.create();
    const font = await document.embedFont(StandardFonts.Helvetica);
    expect(fitTextToWidth("Studio", font, 10, 100)).toBe("Studio");
    expect(fitTextToWidth("", font, 10, 100)).toBe("");
  });

  it("uses deterministic ellipsis for long text", async () => {
    const document = await PDFDocument.create();
    const font = await document.embedFont(StandardFonts.Helvetica);
    const fitted = fitTextToWidth(
      "A very long studio customer label",
      font,
      10,
      40,
    );
    expect(fitted.endsWith("...")).toBe(true);
    expect(font.widthOfTextAtSize(fitted, 10)).toBeLessThanOrEqual(40);
  });

  it("replaces characters unsupported by the built-in PDF font", async () => {
    const document = await PDFDocument.create();
    const font = await document.embedFont(StandardFonts.Helvetica);
    expect(fitTextToWidth("Name 😀", font, 10, 100)).toBe("Name ?");
  });
});
