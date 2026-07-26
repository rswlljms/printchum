import { expect, test } from "@playwright/test";

test("redirects to the editor and shows the application shell", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.goto("/");

  await expect(page).toHaveURL(/\/editor$/);
  await expect(page.getByText("PrintChum", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Create Layout" }).first()).toBeVisible();
  await expect(page.getByText("Browser session ready")).toBeVisible();
  expect(consoleErrors).toEqual([]);
});
