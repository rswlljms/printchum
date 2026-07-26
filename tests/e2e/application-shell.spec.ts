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

  await page.getByRole("button", { name: "Theme: system" }).click();
  await page.getByRole("menuitem", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);

  expect(consoleErrors).toEqual([]);
});

test("highlights only the current dashboard route and uses the wide dashboard grid", async ({
  page,
}) => {
  await page.goto("/dashboard");

  const dashboardLink = page.getByRole("link", { name: /Dashboard/ });
  const editorLink = page.getByRole("link", { name: /Create Layout/ });
  await expect(dashboardLink).toHaveAttribute("aria-current", "page");
  await expect(dashboardLink).toHaveAttribute("data-active", "true");
  await expect(editorLink).not.toHaveAttribute("aria-current", "page");
  await expect(editorLink).toHaveAttribute("data-active", "false");

  await expect(
    page.locator('[data-dashboard-layout="wide"]'),
  ).toBeVisible();
  const metricCards = page.locator(
    '[aria-label="Workspace metrics"] > *',
  );
  await expect(metricCards).toHaveCount(4);
  const firstMetric = await metricCards.nth(0).boundingBox();
  const fourthMetric = await metricCards.nth(3).boundingBox();
  expect(firstMetric).not.toBeNull();
  expect(fourthMetric).not.toBeNull();
  expect(fourthMetric?.y).toBeCloseTo(firstMetric?.y ?? 0, 0);
});
