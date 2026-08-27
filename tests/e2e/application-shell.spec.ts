import { expect, test } from "@playwright/test";

test("shows the workspace at the canonical root URL", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.goto("/");

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "PrintChum Workspace" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Create Layout" }).first()).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toHaveCount(0);
  await expect(page.getByText("Developed by Roswell James Vitaliz")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "View PrintChum source on GitHub, opens in a new tab" }),
  ).toHaveAttribute("href", "https://github.com/rswlljms/printchum");
  await expect(
    page.getByRole("link", { name: "Support PrintChum on Ko-fi, opens in a new tab" }),
  ).toHaveAttribute("href", "https://ko-fi.com/printchum");

  await page.getByRole("button", { name: "Use dark theme" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);

  await page.goto("/editor");
  await expect(page).toHaveURL(/\/$/);

  expect(consoleErrors).toEqual([]);
});
