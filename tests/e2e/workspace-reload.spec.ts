import { expect, test } from "@playwright/test";

const onePixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

test("restores non-photo workspace settings after reload without persisting the photo", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.goto("/");
  await page
    .getByRole("button", { name: "Add 2 × 2 photo size" })
    .click();
  await page
    .getByRole("button", { name: "Use A4 paper" })
    .click();
  await page.getByRole("button", { name: "landscape" }).click();
  await page.getByRole("button", { name: "Labels" }).click();
  await page.locator('input[type="file"]').setInputFiles({
    name: "must-not-persist.png",
    mimeType: "image/png",
    buffer: onePixelPng,
  });

  await expect(page.getByAltText("Selected photo preview")).toBeVisible();
  const serializedWorkspace = await page.evaluate(() =>
    sessionStorage.getItem("printchum-editor-workspace"),
  );
  expect(serializedWorkspace).not.toBeNull();
  expect(serializedWorkspace).not.toContain("must-not-persist");
  expect(serializedWorkspace).not.toContain("blob:");
  expect(serializedWorkspace).not.toContain("sourceFile");
  expect(serializedWorkspace).not.toContain("sourceObjectUrl");

  await page.reload();

  const restoredStorage = await page.evaluate(() => {
    const value = sessionStorage.getItem("printchum-editor-workspace");
    return value ? JSON.parse(value) as unknown : null;
  });
  expect(restoredStorage).toMatchObject({
    state: {
      photoSizes: [{ name: "2 × 2" }],
      paper: { presetId: "a4", orientation: "landscape" },
    },
  });
  await expect(page.locator("[data-photo-size-id]")).toHaveCount(1);
  await expect(
    page.getByRole("complementary", { name: "Layout summary" }),
  ).toContainText("A4");
  await expect(
    page.getByRole("button", { name: "landscape" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Labels" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("button", { name: "Choose photo" })).toBeVisible();
  await page
    .getByRole("button", { name: "Add 2 × 2 photo size" })
    .click();
  await expect(page.locator("[data-photo-size-id]")).toHaveCount(1);
  await expect(
    page.getByRole("spinbutton", { name: "Quantity for 2 × 2" }),
  ).toHaveValue("2");

  expect(consoleErrors).toEqual([]);
});
