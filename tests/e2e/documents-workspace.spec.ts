import { expect, test } from "@playwright/test";

test("opens Documents directly and switches modes with keyboard and browser history", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/documents");

  const navigation = page.getByRole("navigation", { name: "Workspace mode" });
  const pictures = navigation.getByRole("link", { name: "Pictures", exact: true });
  const documents = navigation.getByRole("link", { name: "Documents", exact: true });
  await expect(documents).toHaveAttribute("aria-current", "page");
  await expect(page).toHaveTitle("Documents · PrintChum");
  await expect(page.getByRole("heading", { name: "Document printing is on its way" })).toBeVisible();
  await expect(page.getByRole("button", { name: "View WebMCP agent tools" })).toHaveCount(0);

  await page.reload();
  await expect(documents).toHaveAttribute("aria-current", "page");
  await pictures.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/$/);
  await expect(pictures).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("button", { name: "View WebMCP agent tools" })).toBeVisible();

  await page.goBack();
  await expect(documents).toHaveAttribute("aria-current", "page");
  await page.goForward();
  await expect(pictures).toHaveAttribute("aria-current", "page");
  expect(errors).toEqual([]);
});

test("keeps the photo and crop through a mode switch but clears the photo on refresh", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Choose a local photo").setInputFiles({
    name: "generated-pixel.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await page.getByRole("button", { name: "Add 2 × 2 photo size" }).click();
  await page.getByRole("button", { name: "Use A4 paper" }).click();
  await page.getByRole("slider", { name: "Zoom", exact: true }).fill("2");

  const cropper = page.locator(".reactEasyCrop_Container");
  await cropper.scrollIntoViewIfNeeded();
  const bounds = await cropper.boundingBox();
  if (!bounds) throw new Error("The cropper should be visible");
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width / 2 + 28, bounds.y + bounds.height / 2 + 16, { steps: 5 });
  await page.mouse.up();
  const originalTransform = await page.locator(".reactEasyCrop_Image").evaluate((image) =>
    Array.from(new DOMMatrixReadOnly(getComputedStyle(image).transform).toFloat64Array()),
  );

  const navigation = page.getByRole("navigation", { name: "Workspace mode" });
  for (let visit = 0; visit < 2; visit += 1) {
    await navigation.getByRole("link", { name: "Documents", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Print Documents", exact: true })).toBeVisible();
    await navigation.getByRole("link", { name: "Pictures", exact: true }).click();

    await expect(page.getByAltText("Selected photo preview")).toBeVisible();
    await expect(page.getByRole("button", { name: "Download PDF", exact: true })).toBeEnabled();
    await expect(page.getByRole("spinbutton", { name: "Quantity for 2 × 2" })).toHaveValue("1");
    await expect(page.getByRole("complementary", { name: "Layout summary" })).toContainText("A4");
    await expect.poll(async () => {
      const restored = await page.locator(".reactEasyCrop_Image").evaluate((image) =>
        Array.from(new DOMMatrixReadOnly(getComputedStyle(image).transform).toFloat64Array()),
      );
      return restored.every((value, index) => Math.abs(value - originalTransform[index]) < 0.01);
    }).toBe(true);
  }

  await navigation.getByRole("link", { name: "Documents", exact: true }).click();
  await page.reload();
  await navigation.getByRole("link", { name: "Pictures", exact: true }).click();
  await expect(page.getByRole("button", { name: "Choose photo", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Download PDF", exact: true })).toBeDisabled();
  await expect(page.getByRole("spinbutton", { name: "Quantity for 2 × 2" })).toHaveValue("1");
});
