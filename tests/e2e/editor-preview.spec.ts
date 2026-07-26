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
  const canvas = page.getByRole("img", { name: /Print layout preview/ });
  const initialCanvasBox = await canvas.boundingBox();
  await page.waitForTimeout(500);
  const settledCanvasBox = await canvas.boundingBox();

  expect(initialCanvasBox).not.toBeNull();
  expect(settledCanvasBox).not.toBeNull();
  expect(settledCanvasBox?.height).toBeCloseTo(initialCanvasBox?.height ?? 0, 0);

  await page.getByRole("button", { name: "Set E" }).click();
  await expect(page.getByText("Set E", { exact: true }).last()).toBeVisible();
  await expect(page.getByText("8", { exact: true }).last()).toBeVisible();
  expect(consoleErrors).toEqual([]);
});
