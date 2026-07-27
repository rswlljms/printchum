import { expect, test } from "@playwright/test";

test("redirects to the single-page editor and shows its compact shell", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.goto("/");

  await expect(page).toHaveURL(/\/editor$/);
  await expect(page.getByText("PrintChum workspace", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Create Layout" }).first()).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toHaveCount(0);

  await page.getByRole("button", { name: "Theme: system" }).click();
  await page.getByRole("menuitem", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);

  expect(consoleErrors).toEqual([]);
});
