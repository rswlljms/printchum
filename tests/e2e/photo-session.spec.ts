import { expect, test } from "@playwright/test";

const onePixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

test("keeps photo editing local and cleans up the object URL", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.addInitScript(() => {
    const sessionWindow = window as typeof window & { revokedPhotoUrls: number };
    const originalRevokeObjectUrl = URL.revokeObjectURL.bind(URL);
    sessionWindow.revokedPhotoUrls = 0;
    URL.revokeObjectURL = (objectUrl: string): void => {
      sessionWindow.revokedPhotoUrls += 1;
      originalRevokeObjectUrl(objectUrl);
    };
  });

  await page.goto("/editor");
  await page.locator('input[type="file"]').setInputFiles({
    name: "local-test-photo.png",
    mimeType: "image/png",
    buffer: onePixelPng,
  });

  await expect(page.getByAltText("Selected photo preview")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Frame the photo" })).toBeVisible();
  await expect(
    page.getByText(
      "Your photo stays in this browser session and is not saved to PrintChum.",
    ).first(),
  ).toBeVisible();

  const zoom = page.getByRole("slider", { name: "Zoom" });
  await zoom.fill("1.5");
  await expect(zoom).toHaveValue("1.5");

  await page.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByRole("button", { name: "Choose photo" })).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as typeof window & { revokedPhotoUrls: number })
            .revokedPhotoUrls,
      ),
    )
    .toBe(1);

  expect(consoleErrors).toEqual([]);
});
