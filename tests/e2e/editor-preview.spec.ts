import { expect, test } from "@playwright/test";

test("updates the authoritative preview summary from mock controls", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.goto("/");
  await expect(
    page.locator('[data-workspace-accent="halftone"]'),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "No photo sizes selected" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Add 2 × 2 photo size" })
    .click();
  const selectedSize = page.locator("[data-photo-size-id]").first();
  await expect(selectedSize).toBeVisible();
  await selectedSize.getByRole("spinbutton", { name: "Quantity for 2 × 2" }).fill("8");

  await expect(page.getByText("Page 1 of 1")).toBeVisible();
  await expect(page.getByText("8 photos", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Zoom in" }).click();
  await expect(page.getByText("125%", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Fit page" }).click();
  await expect(page.getByText("100%", { exact: true })).toBeVisible();

  const guidesButton = page.getByRole("button", { name: "Guides" });
  const labelsButton = page.getByRole("button", { name: "Labels" });
  await expect(guidesButton).toHaveAttribute("aria-pressed", "true");
  await expect(labelsButton).toHaveAttribute("aria-pressed", "false");
  await labelsButton.click();
  await expect(labelsButton).toHaveAttribute("aria-pressed", "true");

  const canvas = page.getByRole("img", { name: /Print layout preview/ });
  await expect(canvas.locator("..")).toHaveAttribute(
    "data-preview-surface",
    "plain",
  );
  for (let index = 0; index < 8; index += 1) {
    await page.getByRole("button", { name: "Zoom in" }).click();
  }
  await expect(page.getByText("300%", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Zoom in" })).toBeDisabled();
  await expect(page.getByText("Drag to pan · Home to center")).toBeVisible();
  const zoomedCanvasBox = await canvas.boundingBox();
  expect(zoomedCanvasBox).not.toBeNull();
  if (zoomedCanvasBox) {
    await page.mouse.move(
      zoomedCanvasBox.x + zoomedCanvasBox.width / 2,
      zoomedCanvasBox.y + zoomedCanvasBox.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      zoomedCanvasBox.x + zoomedCanvasBox.width / 2 + 80,
      zoomedCanvasBox.y + zoomedCanvasBox.height / 2 + 50,
      { steps: 4 },
    );
    await page.mouse.up();
  }
  await expect
    .poll(async () => Number(await canvas.getAttribute("data-pan-x")))
    .toBeGreaterThan(0);
  await canvas.press("Home");
  await expect(canvas).toHaveAttribute("data-pan-x", "0");
  await expect(canvas).toHaveAttribute("data-pan-y", "0");
  await page.getByRole("button", { name: "Fit page" }).click();
  await expect(page.getByText("100%", { exact: true })).toBeVisible();

  const summary = page.getByRole("complementary", { name: "Layout summary" });
  const initialCanvasBox = await canvas.boundingBox();
  await page.waitForTimeout(500);
  const settledCanvasBox = await canvas.boundingBox();

  expect(initialCanvasBox).not.toBeNull();
  expect(settledCanvasBox).not.toBeNull();
  expect(settledCanvasBox?.height).toBeCloseTo(initialCanvasBox?.height ?? 0, 0);

  await page.getByRole("button", { name: "Review Set E" }).click();
  await page
    .getByRole("dialog", { name: "Set E" })
    .getByRole("button", { name: "Apply Service Set" })
    .click();
  await page
    .getByRole("dialog", { name: "Apply Service Set?" })
    .getByRole("button", { name: "Apply Service Set" })
    .click();
  await expect(page.getByText("Set E applied", { exact: true })).toBeVisible();
  await expect(page.getByText("4 photos", { exact: true })).toBeVisible();

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

await expect
  .poll(async () => {
    const canvasBox = await canvas.boundingBox();
    const viewport = page.viewportSize();

    return Boolean(
      canvasBox &&
        viewport &&
        canvasBox.y >= 0 &&
        canvasBox.y < viewport.height &&
        canvasBox.y + canvasBox.height > 0,
    );
  })
  .toBe(true);

await expect
  .poll(async () => {
    const summaryBox = await summary.boundingBox();
    const viewport = page.viewportSize();

    return Boolean(
      summaryBox &&
        viewport &&
        summaryBox.y >= 0 &&
        summaryBox.y < viewport.height &&
        summaryBox.y + summaryBox.height > 0,
    );
  })
  .toBe(true);

  expect(consoleErrors).toEqual([]);
});
