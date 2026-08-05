import { expect, test } from "@playwright/test";

const onePixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

test.use({ deviceScaleFactor: 2 });

test("keeps photo editing local and cleans up the object URL", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.addInitScript(() => {
    const sessionWindow = window as typeof window & {
      canvasPhotoDraws: number;
      revokedPhotoUrls: number;
    };
    const originalRevokeObjectUrl = URL.revokeObjectURL.bind(URL);
    const originalDrawImage = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = new Proxy(
      originalDrawImage,
      {
        apply(target, thisArgument, argumentsList) {
          sessionWindow.canvasPhotoDraws += 1;
          return Reflect.apply(target, thisArgument, argumentsList);
        },
      },
    );
    sessionWindow.canvasPhotoDraws = 0;
    sessionWindow.revokedPhotoUrls = 0;
    URL.revokeObjectURL = (objectUrl: string): void => {
      sessionWindow.revokedPhotoUrls += 1;
      originalRevokeObjectUrl(objectUrl);
    };
  });

  await page.goto("/");
  await page
    .getByRole("button", { name: "Add 2 × 2 photo size" })
    .click();
  await page.locator('input[type="file"]').setInputFiles({
    name: "local-test-photo.png",
    mimeType: "image/png",
    buffer: onePixelPng,
  });

  await expect(page.getByAltText("Selected photo preview")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Frame the photo" })).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as typeof window & { canvasPhotoDraws: number })
            .canvasPhotoDraws,
      ),
    )
    .toBeGreaterThan(0);
  const canvasDensity = await page
    .getByRole("img", { name: /Print layout preview/ })
    .evaluate((canvas: HTMLCanvasElement) => ({
      bitmapWidth: canvas.width,
      cssWidth: canvas.getBoundingClientRect().width,
      pixelRatio: window.devicePixelRatio,
    }));
  expect(canvasDensity.pixelRatio).toBe(2);
  expect(canvasDensity.bitmapWidth).toBeGreaterThanOrEqual(
    Math.floor(canvasDensity.cssWidth * canvasDensity.pixelRatio) - 1,
  );
  const zoom = page.getByRole("slider", { name: "Zoom" });
  const drawCountBeforeCropUpdate = await page.evaluate(
    () =>
      (window as typeof window & { canvasPhotoDraws: number })
        .canvasPhotoDraws,
  );
  await zoom.fill("1.5");
  await expect(zoom).toHaveValue("1.5");
  const zoomValue = page.getByRole("spinbutton", { name: "Zoom value" });
  await expect(zoomValue).toHaveValue("1.50");
  await zoomValue.fill("2.25");
  await zoomValue.press("Enter");
  await expect(zoom).toHaveValue("2.25");

  const rotation = page.getByRole("slider", { name: "Rotation" });
  const rotationValue = page.getByRole("spinbutton", {
    name: "Rotation value",
  });
  await rotationValue.fill("-45");
  await rotationValue.press("Enter");
  await expect(rotation).toHaveValue("-45");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as typeof window & { canvasPhotoDraws: number })
            .canvasPhotoDraws,
      ),
    )
    .toBeGreaterThan(drawCountBeforeCropUpdate);

  await page.getByRole("button", { name: "Remove", exact: true }).click();
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
