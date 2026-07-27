import { expect, test } from "@playwright/test";

import { chooseSelectOption } from "./helpers/select-option";

test("uses the five-section editor order without Passport Presets", async ({
  page,
}) => {
  await page.goto("/editor");

  const configuration = page.getByRole("complementary", {
    name: "Layout configuration",
  });
  const numberedLabels = (
    await configuration.locator(".micro-label").allTextContents()
  ).filter((label) => /^\d{2}\s/.test(label));

  expect(numberedLabels).toEqual([
    "01 — source",
    "02 — sizes",
    "03 — package",
    "04 — output",
  ]);
  await expect(
    page
      .getByRole("complementary", { name: "Layout summary" })
      .getByText("05 — summary", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Passport Presets" }),
  ).toHaveCount(0);
});

test("starts every selected standard photo size at quantity one", async ({
  page,
}) => {
  await page.goto("/editor");

  for (const sizeName of ["1 × 1", "Wallet", "Half Body"]) {
    await page
      .getByRole("button", { name: `Add ${sizeName} photo size` })
      .click();
  }

  const selectedSizes = page.locator("[data-photo-size-id]");
  await expect(selectedSizes).toHaveCount(3);

  for (const selectedSize of await selectedSizes.all()) {
    await expect(
      selectedSize.getByRole("spinbutton", { name: /quantity/i }),
    ).toHaveValue("1");
  }
});

test("increments a repeated preset and clears all selected sizes", async ({
  page,
}) => {
  await page.goto("/editor");
  const addSize = page.getByRole("button", {
    name: "Add 2 × 2 photo size",
  });

  await addSize.click();
  await addSize.click();

  const selectedSizes = page.locator("[data-photo-size-id]");
  await expect(selectedSizes).toHaveCount(1);
  await expect(
    selectedSizes.getByRole("spinbutton", { name: /quantity/i }),
  ).toHaveValue("2");

  await page.getByRole("button", { name: "Clear all" }).click();
  await expect(selectedSizes).toHaveCount(0);
  await expect(page.getByText("No photo sizes selected")).toBeVisible();
});

test("adds, edits, duplicates, and removes a custom photo size", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.goto("/editor");
  await page.getByRole("button", { name: "Add custom photo size" }).click();
  const addDialog = page.getByRole("dialog", {
    name: "Add custom photo size",
  });
  await expect(
    addDialog.getByRole("spinbutton", { name: "Quantity" }),
  ).toHaveValue("1");
  await addDialog.getByRole("textbox", { name: "Name", exact: true }).fill("Metric portrait");
  await chooseSelectOption(
    addDialog.getByRole("combobox", { name: "Unit" }),
    "Centimeters",
  );
  await addDialog.getByLabel("Width", { exact: true }).fill("5.08");
  await addDialog.getByLabel("Height", { exact: true }).fill("7.62");
  await addDialog.getByRole("spinbutton", { name: "Quantity" }).fill("3");
  await addDialog.getByRole("button", { name: "Add size" }).click();

  const metricItem = page.locator("[data-photo-size-id]").filter({
    hasText: "Metric portrait",
  });
  await expect(metricItem).toBeVisible();
  await expect(metricItem).toContainText("5.08 × 7.62 cm");
  const summary = page.getByRole("complementary", { name: "Layout summary" });
  await expect(summary).toContainText("3");

  await page.getByRole("button", { name: "Add custom photo size" }).click();
  const resetDialog = page.getByRole("dialog", {
    name: "Add custom photo size",
  });
  await expect(
    resetDialog.getByRole("spinbutton", { name: "Quantity" }),
  ).toHaveValue("1");
  await resetDialog.getByRole("button", { name: "Cancel" }).click();

  await metricItem.getByRole("button", { name: "Edit Metric portrait" }).click();
  const editDialog = page.getByRole("dialog", { name: "Edit photo size" });
  await chooseSelectOption(
    editDialog.getByRole("combobox", { name: "Unit" }),
    "Inches",
  );
  await expect(editDialog.getByLabel("Width", { exact: true })).toHaveValue("2");
  await expect(editDialog.getByLabel("Height", { exact: true })).toHaveValue("3");
  await editDialog.getByRole("button", { name: "Save changes" }).click();
  await expect(metricItem).toContainText("2 × 3 in");

  await metricItem
    .getByRole("button", { name: "Duplicate Metric portrait" })
    .click();
  await expect(page.locator("[data-photo-size-id]")).toHaveCount(2);
  await expect(page.getByText("Metric portrait Copy", { exact: true })).toBeVisible();

  await metricItem
    .getByRole("button", { name: "Remove Metric portrait", exact: true })
    .click();
  await expect(page.locator("[data-photo-size-id]")).toHaveCount(1);
  await expect(page.getByText("Metric portrait Copy", { exact: true })).toBeVisible();

  expect(consoleErrors).toEqual([]);
});

test("shows a persistent warning for an oversized selected size", async ({
  page,
}) => {
  await page.goto("/editor");
  await page.getByRole("button", { name: "Add custom photo size" }).click();
  const dialog = page.getByRole("dialog", { name: "Add custom photo size" });
  await dialog.getByRole("textbox", { name: "Name", exact: true }).fill("Oversized 12 × 12");
  await dialog.getByLabel("Width", { exact: true }).fill("12");
  await dialog.getByLabel("Height", { exact: true }).fill("12");
  await dialog.getByRole("spinbutton", { name: "Quantity" }).fill("1");
  await dialog.getByRole("button", { name: "Add size" }).click();

  await expect(
    page.getByRole("alert").filter({ hasText: "Some photo sizes cannot fit" }),
  ).toContainText("Oversized 12 × 12");
  await expect(
    page.getByText("No photo sizes fit the selected paper"),
  ).toBeVisible();
  await expect(
    page.getByRole("complementary", { name: "Layout summary" }),
  ).toContainText("1");
});
