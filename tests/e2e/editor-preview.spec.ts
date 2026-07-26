import { expect, test } from "@playwright/test";

test("updates the authoritative preview summary from mock controls", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.goto("/editor");

  await expect(page.getByText("Page 1 of 1")).toBeVisible();
  await page.getByRole("button", { name: "Set E" }).click();
  await expect(page.getByText("Set E", { exact: true }).last()).toBeVisible();
  await expect(page.getByText("8", { exact: true }).last()).toBeVisible();
  expect(consoleErrors).toEqual([]);
});
