import type { Locator } from "@playwright/test";

export async function chooseSelectOption(
  combobox: Locator,
  optionName: string,
): Promise<void> {
  await combobox.click();
  await combobox
    .page()
    .getByRole("option", { name: optionName, exact: true })
    .click();
}
