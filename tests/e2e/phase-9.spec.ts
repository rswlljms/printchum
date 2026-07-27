import { readFile } from "node:fs/promises";

import { expect, test, type Page } from "@playwright/test";
import { PDFDocument } from "pdf-lib";

import { chooseSelectOption } from "./helpers/select-option";

const safePng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

async function prepareLayout(
  page: Page,
  quantity: string,
): Promise<void> {
  await page.goto("/editor");
  await page
    .getByRole("button", { name: "Add 2 × 2 photo size" })
    .click();
  await page
    .locator("[data-photo-size-id]")
    .getByRole("spinbutton", { name: "Quantity for 2 × 2" })
    .fill(quantity);
  await page.locator('input[type="file"]').setInputFiles({
    name: "repository-safe-sample.png",
    mimeType: "image/png",
    buffer: safePng,
  });
  await expect(page.getByRole("button", { name: "Download PDF" })).toBeEnabled();
}

test("downloads a physical client-side PDF without uploading photo data", async ({
  page,
}) => {
  const externalWrites: string[] = [];
  page.on("request", (request) => {
    if (["POST", "PUT", "PATCH"].includes(request.method())) {
      externalWrites.push(request.url());
    }
  });
  await page.addInitScript(() => {
    const trackedWindow = window as typeof window & {
      revokedPdfUrls: number;
    };
    trackedWindow.revokedPdfUrls = 0;
    const createdPdfUrls = new Set<string>();
    const createObjectUrl = URL.createObjectURL.bind(URL);
    const revokeObjectUrl = URL.revokeObjectURL.bind(URL);
    URL.createObjectURL = (object: Blob | MediaSource): string => {
      const url = createObjectUrl(object);
      if (object instanceof Blob && object.type === "application/pdf") {
        createdPdfUrls.add(url);
      }
      return url;
    };
    URL.revokeObjectURL = (url: string): void => {
      if (createdPdfUrls.delete(url)) {
        trackedWindow.revokedPdfUrls += 1;
      }
      revokeObjectUrl(url);
    };
  });
  await prepareLayout(page, "4");

  await page.getByRole("button", { name: "Download PDF" }).click();
  const dialog = page.getByRole("dialog", { name: "Download PDF" });
  await expect(dialog).toContainText("Letter / Short Bond");
  await expect(dialog).toContainText("4");
  await expect(dialog).toContainText(
    "Your PDF is generated in this browser and is not uploaded to PrintChum.",
  );

  const downloadPromise = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "Download PDF" }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).not.toBeNull();
  if (path) {
    const bytes = await readFile(path);
    expect(bytes.subarray(0, 4).toString()).toBe("%PDF");
    expect(bytes.byteLength).toBeGreaterThan(500);
    const document = await PDFDocument.load(bytes);
    expect(document.getPageCount()).toBe(1);
    const size = document.getPage(0).getSize();
    expect(size.width).toBe(612);
    expect(size.height).toBe(792);
  }
  expect(download.suggestedFilename()).toMatch(/^printchum-layout-.*\.pdf$/);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as typeof window & { revokedPdfUrls: number })
            .revokedPdfUrls,
      ),
    )
    .toBe(1);
  expect(externalWrites).toEqual([]);
});

test("exports a valid custom range and blocks an invalid range", async ({
  page,
}) => {
  await prepareLayout(page, "31");
  await expect(page.getByText("Page 1 of 3")).toBeVisible();
  await page.getByRole("button", { name: "Download PDF" }).click();
  const dialog = page.getByRole("dialog", { name: "Download PDF" });
  await chooseSelectOption(
    dialog.getByRole("combobox", { name: "Page range" }),
    "Custom range",
  );
  const range = dialog.getByLabel("Custom page range");
  await range.fill("1-4");
  await expect(dialog.getByRole("alert")).toContainText(
    "outside the 3-page layout",
  );
  await expect(
    dialog.getByRole("button", { name: "Download PDF" }),
  ).toBeDisabled();

  await range.fill("1-2");
  await expect(dialog.getByText("2 of 3 pages selected.")).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "Download PDF" }).click();
  const download = await downloadPromise;
  const path = await download.path();
  if (path) {
    const document = await PDFDocument.load(await readFile(path));
    expect(document.getPageCount()).toBe(2);
  }
  await expect(dialog.getByText("PDF downloaded.")).toBeVisible();
});

test("opens a private print preview with scale guidance and no app navigation", async ({
  page,
}) => {
  await prepareLayout(page, "4");
  await page.getByRole("button", { name: "Print", exact: true }).click();
  const options = page.getByRole("dialog", { name: "Print Layout" });
  await expect(options).toContainText("100% or Actual Size");
  await expect(options).toContainText(
    "Your print layout remains in this browser session.",
  );
  await chooseSelectOption(
    options.getByRole("combobox", { name: "Page range" }),
    "Current page (1)",
  );
  await options.getByRole("button", { name: "Continue to Print" }).click();

  const preview = page.getByTestId("print-preview");
  await expect(preview).toBeVisible();
  await expect(preview.getByRole("heading", { name: "Print preview" })).toBeVisible();
  await expect(preview.getByLabel("Print preview page 1")).toBeVisible();
  await expect(preview).toContainText("100% or Actual Size");
  await expect(preview.getByRole("navigation")).toHaveCount(0);
  await preview.getByRole("button", { name: "Close" }).click();
  await expect(preview).toBeHidden();
});

test("combines different people in one browser-only print layout", async ({
  page,
}) => {
  const writes: string[] = [];
  page.on("request", (request) => {
    if (["POST", "PUT", "PATCH"].includes(request.method())) {
      writes.push(request.url());
    }
  });

  await page.goto("/editor");
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: "person-one.png",
    mimeType: "image/png",
    buffer: safePng,
  });
  await page
    .getByRole("button", { name: /^Add 1 .* 1 photo size$/ })
    .click();
  await page
    .locator("[data-photo-size-id]")
    .getByRole("spinbutton", { name: /^Quantity for 1 .* 1$/ })
    .fill("4");

  await page.getByRole("button", { name: "Add another person" }).click();
  await fileInput.setInputFiles({
    name: "person-two.png",
    mimeType: "image/png",
    buffer: safePng,
  });
  await expect(page.getByText("2 people")).toBeVisible();
  await expect(page.getByText("For Photo 2")).toBeVisible();
  await page
    .getByRole("button", { name: /^Add 2 .* 2 photo size$/ })
    .click();
  await page
    .locator("[data-photo-size-id]")
    .getByRole("spinbutton", { name: /^Quantity for 2 .* 2$/ })
    .fill("2");

  await expect(page.getByText("6 photos", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Edit Photo 1" }).click();
  await expect(page.getByText("For Photo 1")).toBeVisible();
  await expect(
    page.getByRole("spinbutton", { name: /^Quantity for 1 .* 1$/ }),
  ).toHaveValue("4");
  await expect(
    page.getByRole("spinbutton", { name: /^Quantity for 2 .* 2$/ }),
  ).toHaveCount(0);
  expect(writes).toEqual([]);
});
