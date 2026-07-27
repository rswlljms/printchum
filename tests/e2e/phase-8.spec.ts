import { expect, test } from "@playwright/test";

test("searches and applies the Philippines passport preset", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  await page.goto("/editor");

  await page
    .getByRole("textbox", { name: "Search passport presets" })
    .fill("Philippines");
  await page
    .getByRole("button", {
      name: "Open Philippines Passport details",
    })
    .click();
  const details = page.getByRole("dialog", {
    name: "Philippines Passport",
  });
  await expect(details).toContainText("35 × 45 mm");
  await expect(details).toContainText("Final acceptance depends");
  await details.getByRole("button", { name: "Apply preset" }).click();

  const selected = page.locator("[data-photo-size-id]").filter({
    hasText: "Philippines Passport",
  });
  await expect(selected).toBeVisible();
  await expect(selected).toContainText("35 × 45 mm");
  await expect(
    page.getByRole("complementary", { name: "Layout summary" }),
  ).toContainText("#ffffff recommended");
  await expect(page.locator("canvas[role='img']")).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test("favorites and filters passport presets", async ({ page }) => {
  await page.goto("/editor");
  await page
    .getByRole("button", {
      name: "Open Philippines Passport details",
    })
    .click();
  const details = page.getByRole("dialog", {
    name: "Philippines Passport",
  });
  await details
    .getByRole("button", {
      name: "Add Philippines Passport to favorites",
    })
    .click();
  await page.keyboard.press("Escape");

  await page.getByLabel("Filter").selectOption("favorites");
  await expect(
    page.getByRole("button", {
      name: "Open Philippines Passport details",
    }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Open Philippines Passport details",
    })
    .click();
  await page
    .getByRole("dialog", { name: "Philippines Passport" })
    .getByRole("button", {
      name: "Remove Philippines Passport from favorites",
    })
    .click();
  await page.keyboard.press("Escape");
  await expect(
    page.getByText("No passport presets found", { exact: true }),
  ).toBeVisible();
});

test("creates, edits, and deletes a custom passport preset", async ({
  page,
}) => {
  await page.goto("/passport-presets");
  await page
    .getByRole("button", { name: "Create Custom Preset" })
    .first()
    .click();
  const createDialog = page.getByRole("dialog", {
    name: "Create Custom Preset",
  });
  await createDialog.getByLabel("Country name").fill("Sampleland");
  await createDialog.getByLabel("Country code").fill("SL");
  await createDialog.getByLabel("Preset name").fill("Sample Passport");
  await createDialog.getByRole("button", {
    name: "Create Custom Preset",
  }).click();

  const customRow = page.locator("article").filter({
    hasText: "Sample Passport",
  });
  await expect(customRow).toBeVisible();
  await customRow.getByRole("button", { name: "Edit" }).click();
  const editDialog = page.getByRole("dialog", {
    name: "Edit Sample Passport",
  });
  await editDialog.getByLabel("Preset name").fill("Updated Passport");
  await editDialog.getByRole("button", { name: "Save changes" }).click();

  const updatedRow = page.locator("article").filter({
    hasText: "Updated Passport",
  });
  await expect(updatedRow).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await updatedRow.getByRole("button", { name: "Delete" }).click();
  await expect(updatedRow).toHaveCount(0);
  await expect(
    page.getByText("No custom passport presets", { exact: true }),
  ).toBeVisible();
});

test("configures an outside nameplate and applies it to all sizes", async ({
  page,
}) => {
  await page.goto("/editor");
  await page
    .getByRole("button", { name: "Add 2 × 2 photo size" })
    .click();
  await page
    .getByRole("button", { name: "Add 1 × 1 photo size" })
    .click();
  const firstItem = page.locator("[data-photo-size-id]").first();
  await firstItem
    .getByRole("button", { name: "Configure nameplate" })
    .click();
  const editor = page.getByRole("dialog", {
    name: "Configure nameplate",
  });
  await editor
    .getByRole("button", { name: "Enable Nameplate" })
    .click();
  await editor.getByLabel("Preset").selectOption("name-id-department");
  await editor.getByLabel("Primary text").fill("Studio Test");
  await editor.getByLabel("Position").selectOption("bottom-outside");
  await editor
    .getByRole("button", { name: "Apply to all sizes" })
    .click();
  await editor.getByRole("button", { name: "Done" }).click();

  await expect(page.locator("[data-photo-size-id]")).toHaveCount(2);
  await expect(
    page.locator("[data-photo-size-id]").getByText("Nameplate on"),
  ).toHaveCount(2);
  await expect(page.locator("[data-nameplate-count='2']")).toBeVisible();
  await expect(
    page.getByRole("complementary", { name: "Layout summary" }),
  ).toContainText("2 sizes enabled");
});

test("requires confirmation for a passport nameplate", async ({
  page,
}) => {
  await page.goto("/editor");
  await page
    .getByRole("button", {
      name: "Open Philippines Passport details",
    })
    .click();
  await page
    .getByRole("dialog", { name: "Philippines Passport" })
    .getByRole("button", { name: "Apply preset" })
    .click();
  await page
    .getByRole("button", {
      name: "Configure nameplate for Philippines Passport",
    })
    .click();
  const editor = page.getByRole("dialog", {
    name: "Configure nameplate",
  });
  await editor
    .getByRole("button", { name: "Enable Nameplate" })
    .click();
  await expect(editor.getByRole("alert")).toContainText(
    "not part of official passport-photo requirements",
  );
  await editor.getByRole("button", { name: "Cancel" }).click();
  await expect(editor.getByText("Nameplate disabled")).toBeVisible();
  await editor
    .getByRole("button", { name: "Enable Nameplate" })
    .click();
  await editor.getByRole("button", { name: "Enable anyway" }).click();
  await expect(editor.getByRole("alert")).toBeVisible();
  await editor.getByRole("button", { name: "Done" }).click();
  await expect(
    page.getByRole("button", {
      name: "Configure nameplate for Philippines Passport",
    }),
  ).toContainText("Nameplate on");
});

test("duplicates a built-in preset and removes only the custom copy", async ({
  page,
}) => {
  await page.goto("/passport-presets");
  const builtInRow = page.locator("article").filter({
    hasText: "Philippines Passport",
  });
  await builtInRow.getByRole("button", { name: "Duplicate" }).click();
  const copyRow = page.locator("article").filter({
    hasText: "Philippines Passport Copy",
  });
  await expect(copyRow).toBeVisible();
  await copyRow.getByRole("button", { name: "Edit" }).click();
  const editDialog = page.getByRole("dialog", {
    name: "Edit Philippines Passport Copy",
  });
  await editDialog
    .getByLabel("Preset name")
    .fill("Philippines Studio Copy");
  await editDialog.getByRole("button", { name: "Save changes" }).click();
  const editedCopy = page.locator("article").filter({
    hasText: "Philippines Studio Copy",
  });
  page.once("dialog", (dialog) => dialog.accept());
  await editedCopy.getByRole("button", { name: "Delete" }).click();
  await expect(editedCopy).toHaveCount(0);
  await expect(builtInRow).toBeVisible();
  await expect(
    builtInRow.getByRole("button", { name: "Edit" }),
  ).toHaveCount(0);
});

test("moves a nameplate inside and updates physical summary metrics", async ({
  page,
}) => {
  await page.goto("/editor");
  await page
    .getByRole("button", { name: "Add 2 × 2 photo size" })
    .click();
  await page
    .getByRole("button", { name: "Configure nameplate for 2 × 2" })
    .click();
  const editor = page.getByRole("dialog", {
    name: "Configure nameplate",
  });
  await editor
    .getByRole("button", { name: "Enable Nameplate" })
    .click();
  await editor.getByLabel("Position").selectOption("bottom-outside");
  await editor.getByLabel("Position").selectOption("bottom-inside");
  await editor.getByRole("button", { name: "Done" }).click();

  const summary = page.getByRole("complementary", {
    name: "Layout summary",
  });
  await expect(summary).toContainText("1 size enabled");
  await expect(summary).toContainText("Inside nameplates");
  await expect(summary).toContainText("1");
  await expect(summary).toContainText("Outside nameplates");
  await expect(page.locator("[data-nameplate-count='1']")).toBeVisible();
});

test("updates three-line typography and Canvas live", async ({ page }) => {
  await page.goto("/editor");
  await page
    .getByRole("button", { name: "Add 2 × 2 photo size" })
    .click();
  await page
    .getByRole("button", { name: "Configure nameplate for 2 × 2" })
    .click();
  const editor = page.getByRole("dialog", {
    name: "Configure nameplate",
  });
  await editor
    .getByRole("button", { name: "Enable Nameplate" })
    .click();
  await editor.getByLabel("Preset").selectOption("name-id-department");
  await editor.getByLabel("Primary text").fill("Person Name");
  await editor.getByLabel("Secondary text").fill("ID 001");
  await editor.getByLabel("Third line").fill("Production");
  await editor.getByText("Advanced style").click();
  await editor.getByLabel("Font size (pt)").fill("10");
  await editor.getByLabel("Alignment").selectOption("left");
  await editor.getByLabel("Draw border").check();
  await expect(page.locator("[data-nameplate-count='1']")).toBeVisible();
  await editor.getByRole("button", { name: "Done" }).click();
  await expect(
    page.getByRole("button", {
      name: "Configure nameplate for 2 × 2",
    }),
  ).toContainText("Nameplate on");
});

test("saves and reapplies nameplate settings through a Service Set", async ({
  page,
}) => {
  await page.goto("/editor");
  await page
    .getByRole("button", { name: "Add 2 × 2 photo size" })
    .click();
  await page
    .getByRole("button", { name: "Configure nameplate for 2 × 2" })
    .click();
  const editor = page.getByRole("dialog", {
    name: "Configure nameplate",
  });
  await editor
    .getByRole("button", { name: "Enable Nameplate" })
    .click();
  await editor.getByLabel("Primary text").fill("Saved Nameplate");
  await editor.getByRole("button", { name: "Done" }).click();

  await page
    .getByRole("button", { name: "Save current as Service Set" })
    .click();
  const saveDialog = page.getByRole("dialog", {
    name: "Save as Service Set",
  });
  await saveDialog
    .getByRole("textbox", { name: "Service Set name" })
    .fill("Nameplate Set");
  await saveDialog
    .getByRole("button", { name: "Save Service Set" })
    .click();
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.locator("[data-photo-size-id]")).toHaveCount(0);

  await page.getByRole("button", { name: "Review Nameplate Set" }).click();
  await page
    .getByRole("dialog", { name: "Nameplate Set" })
    .getByRole("button", { name: "Apply Service Set" })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Configure nameplate for 2 × 2",
    }),
  ).toContainText("Nameplate on");
  await expect(page.locator("[data-nameplate-count='1']")).toBeVisible();
});
