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

test("creates and removes a photo-free custom Service Set in the editor", async ({
  page,
}) => {
  await page.goto("/editor");
  await page.getByRole("button", { name: "Custom set" }).click();
  const dialog = page.getByRole("dialog", { name: "Create Service Set" });
  await dialog
    .getByRole("textbox", { name: "Name", exact: true })
    .fill("Current Layout");
  await expect(
    dialog.getByRole("spinbutton", { name: "Qty" }),
  ).toHaveValue("4");
  await dialog.getByRole("button", { name: "Create Service Set" }).click();

  const customSet = page.getByRole("button", {
    name: "Review Current Layout",
  });
  await expect(customSet).toBeVisible();
  await customSet.click();
  const details = page.getByRole("dialog", { name: "Current Layout" });
  await expect(details).toContainText("2 × 2");
  await expect(page.getByText(/blob:/)).toHaveCount(0);
  await details
    .getByRole("button", { name: "Delete set" })
    .click();
  await page
    .getByRole("dialog", { name: "Delete Service Set?" })
    .getByRole("button", { name: "Delete Service Set" })
    .click();
  await expect(customSet).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Service Sets" }),
  ).toHaveCount(0);
});

test("removes a built-in Service Set from its details dialog", async ({
  page,
}) => {
  await page.goto("/editor");
  const setCard = page.getByRole("button", { name: "Review Set A" });

  await setCard.click();
  await page
    .getByRole("dialog", { name: "Set A" })
    .getByRole("button", { name: "Delete set" })
    .click();
  await page
    .getByRole("dialog", { name: "Delete Service Set?" })
    .getByRole("button", { name: "Delete Service Set" })
    .click();

  await expect(setCard).toHaveCount(0);
});
