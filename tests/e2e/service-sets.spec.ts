import { expect, test } from "@playwright/test";

test("reviews and applies a Service Set through the authoritative preview", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.goto("/editor");
  await page.getByRole("button", { name: "Review Set A" }).click();
  const details = page.getByRole("dialog", { name: "Set A" });
  await expect(details).toContainText("4 pcs");
  await expect(details).toContainText("Letter / Short Bond");
  await details.getByRole("button", { name: "Apply Service Set" }).click();

  await expect(page.locator("[data-photo-size-id]")).toHaveCount(1);
  await expect(
    page.getByRole("spinbutton", { name: "Quantity for 1 × 1" }),
  ).toHaveValue("4");
  const summary = page.getByRole("complementary", {
    name: "Layout summary",
  });
  await expect(summary).toContainText("Set A");
  await expect(summary).toContainText("Applied");
  await expect(summary).toContainText("₱40.00");
  await expect(page.getByText("4 photos", { exact: true })).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test("confirms replacement, tracks modification, and reapplies the set", async ({
  page,
}) => {
  await page.goto("/editor");
  await page.getByRole("button", { name: "Add 2 × 2 photo size" }).click();

  await page.getByRole("button", { name: "Review Set B" }).click();
  await page
    .getByRole("dialog", { name: "Set B" })
    .getByRole("button", { name: "Apply Service Set" })
    .click();
  const confirmation = page.getByRole("dialog", {
    name: "Apply Service Set?",
  });
  await confirmation.getByRole("button", { name: "Cancel" }).click();
  await expect(
    page.getByRole("spinbutton", { name: "Quantity for 2 × 2" }),
  ).toHaveValue("1");

  await page.getByRole("button", { name: "Review Set B" }).click();
  await page
    .getByRole("dialog", { name: "Set B" })
    .getByRole("button", { name: "Apply Service Set" })
    .click();
  await page
    .getByRole("dialog", { name: "Apply Service Set?" })
    .getByRole("button", { name: "Apply Service Set" })
    .click();
  await expect(
    page.getByRole("spinbutton", { name: "Quantity for 1.5 × 1.5" }),
  ).toHaveValue("4");

  await page
    .getByRole("button", { name: "Increase quantity for 1.5 × 1.5" })
    .click();
  await expect(
    page.getByText("Set B · Modified", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reapply" }).click();
  await expect(page.getByText("Set B applied")).toBeVisible();
  await expect(
    page.getByRole("spinbutton", { name: "Quantity for 1.5 × 1.5" }),
  ).toHaveValue("4");
});

test("creates, duplicates, disables, defaults, and deletes custom Service Sets", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  await page.goto("/service-sets");
  await page.getByRole("button", { name: "Create Service Set" }).first().click();
  const form = page.getByRole("dialog", { name: "Create Service Set" });
  await form.getByRole("textbox", { name: "Name", exact: true }).fill(
    "Studio Basic",
  );
  await form.getByRole("spinbutton", { name: "Price" }).fill("75");
  await form.getByRole("button", { name: "Create Service Set" }).click();
  await expect(page.getByText("Studio Basic created.")).toBeVisible();

  const customCard = page
    .locator("[data-service-set-id]")
    .filter({
      has: page.getByRole("heading", {
        name: "Studio Basic",
        exact: true,
      }),
    });
  await customCard.getByRole("button", { name: "Duplicate" }).click();
  await expect(page.getByText("Studio Basic duplicated.")).toBeVisible();
  await expect(page.getByText("Studio Basic Copy", { exact: true })).toBeVisible();

  await customCard.getByRole("button", { name: "Default" }).click();
  await expect(
    customCard.locator("span").filter({ hasText: /^Default$/ }),
  ).toBeVisible();
  await customCard.getByRole("button", { name: "Disable" }).click();
  await expect(customCard.getByText("disabled", { exact: true })).toBeVisible();
  await expect(
    customCard.locator("span").filter({ hasText: /^Default$/ }),
  ).toHaveCount(0);

  await customCard.getByRole("button", { name: "Delete" }).click();
  const confirmation = page.getByRole("dialog", {
    name: "Delete Service Set?",
  });
  await confirmation
    .getByRole("button", { name: "Delete custom set" })
    .click();
  await expect(page.getByText("Studio Basic deleted.")).toBeVisible();
  await expect(customCard).toHaveCount(0);
  expect(consoleErrors).toEqual([]);
});

test("saves the current editor configuration as a photo-free Service Set", async ({
  page,
}) => {
  await page.goto("/editor");
  await page.getByRole("button", { name: "Add 2 × 2 photo size" }).click();
  await page
    .getByRole("button", { name: "Save current as Service Set" })
    .click();
  const dialog = page.getByRole("dialog", { name: "Save as Service Set" });
  await dialog
    .getByRole("textbox", { name: "Service Set name" })
    .fill("Current Layout");
  await dialog.getByRole("button", { name: "Save Service Set" }).click();
  await expect(page.getByText("Current Layout saved.")).toBeVisible();

  await page.getByRole("link", { name: "Custom set" }).click();
  await expect(page).toHaveURL(/\/service-sets/);
  await expect(page.getByText("Current Layout", { exact: true })).toBeVisible();
  await expect(page.getByText(/blob:/)).toHaveCount(0);
});
