import { expect, test } from "@playwright/test";

import { chooseSelectOption } from "./helpers/select-option";

test("selects standard paper, changes orientation, and preserves A4 dimensions across units", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.goto("/");
  await page
    .getByRole("button", { name: "Add 2 × 2 photo size" })
    .click();
  await page
    .getByRole("button", { name: "Use Letter / Short Bond paper" })
    .click();

  const canvas = page.getByRole("img", {
    name: /Print layout preview/,
  });
  await expect(canvas).toHaveAttribute(
    "data-paper-width-inches",
    "8.5",
  );
  await expect(canvas).toHaveAttribute(
    "data-paper-height-inches",
    "11",
  );

  await page.getByRole("button", { name: "landscape" }).click();
  await expect(canvas).toHaveAttribute(
    "data-paper-width-inches",
    "11",
  );
  await expect(canvas).toHaveAttribute(
    "data-paper-height-inches",
    "8.5",
  );

  await page.getByRole("button", { name: "Use A4 paper" }).click();
  await chooseSelectOption(
    page.getByRole("combobox", { name: "Measurement unit" }),
    "Inches",
  );
  await expect(page.getByRole("spinbutton", { name: "Paper width" })).toHaveValue(
    "8.268",
  );
  await expect(page.getByRole("spinbutton", { name: "Paper height" })).toHaveValue(
    "11.693",
  );

  await chooseSelectOption(
    page.getByRole("combobox", { name: "Measurement unit" }),
    "Millimeters",
  );
  await expect(page.getByRole("spinbutton", { name: "Paper width" })).toHaveValue(
    "210",
  );
  await expect(page.getByRole("spinbutton", { name: "Paper height" })).toHaveValue(
    "297",
  );

  expect(consoleErrors).toEqual([]);
});

test("validates paper margin and updates Canvas-only guides and labels", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Add 2 × 2 photo size" })
    .click();

  const canvas = page.getByRole("img", {
    name: /Print layout preview/,
  });
  const margin = page.getByRole("spinbutton", { name: "Margin" });
  await margin.fill("6");
  await margin.press("Tab");
  await expect(
    page.getByRole("alert").filter({
      hasText: "The current margin leaves no printable area.",
    }).first(),
  ).toContainText("The current margin leaves no printable area.");
  await expect(canvas).toBeVisible();

  await margin.fill("0.5");
  await margin.press("Tab");
  await expect(
    page.getByText("The current margin leaves no printable area."),
  ).toHaveCount(0);

  const guides = page.getByRole("button", { name: "Guides" });
  const labels = page.getByRole("button", { name: "Labels" });
  await expect(canvas).toHaveAttribute("data-cutting-guides", "true");
  await expect(canvas).toHaveAttribute("data-size-labels", "false");
  await guides.click();
  await labels.click();
  await expect(canvas).toHaveAttribute("data-cutting-guides", "false");
  await expect(canvas).toHaveAttribute("data-size-labels", "true");
});

test("creates, applies, duplicates, renames, and deletes session-only custom paper presets", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Use Custom paper" }).click();

  const createDialog = page.getByRole("dialog", {
    name: "Save reusable custom paper",
  });
  await createDialog
    .getByRole("textbox", { name: "Paper name" })
    .fill("Studio Sheet");
  await createDialog.getByRole("spinbutton", { name: "Width" }).fill("6");
  await createDialog.getByRole("spinbutton", { name: "Height" }).fill("8");
  await createDialog.getByRole("spinbutton", { name: "Margin" }).fill("0.25");
  await createDialog
    .getByRole("spinbutton", { name: "Horizontal spacing" })
    .fill("0.1");
  await createDialog
    .getByRole("spinbutton", { name: "Vertical spacing" })
    .fill("0.2");
  await createDialog.getByRole("button", { name: "Save preset" }).click();

  await expect(createDialog).toBeHidden();
  const summary = page.getByRole("complementary", {
    name: "Layout summary",
  });
  await expect(summary).toContainText("Studio Sheet");
  await expect(summary).toContainText("6 × 8 in");

  await page
    .getByRole("button", { name: "Duplicate Studio Sheet" })
    .click();
  await page
    .getByRole("button", { name: "Edit Studio Sheet Copy" })
    .click();
  const editDialog = page.getByRole("dialog", {
    name: "Update custom paper",
  });
  await editDialog
    .getByRole("textbox", { name: "Paper name" })
    .fill("Studio Sheet Alternate");
  await editDialog.getByRole("button", { name: "Save changes" }).click();

  await page
    .getByRole("button", { name: "Delete Studio Sheet", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Apply Studio Sheet Alternate" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Apply Studio Sheet", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Apply Studio Sheet Alternate" })
    .click();
  await expect(summary).toContainText("Studio Sheet Alternate");
});
