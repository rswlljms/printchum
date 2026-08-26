import { expect, test } from "@playwright/test";

test.describe("WebMCP discovery surface", () => {
  test("exposes the agent tool catalog to humans in any browser", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Create Layout" }).first(),
    ).toBeVisible();

    const badge = page.getByRole("button", {
      name: "View WebMCP agent tools",
    });
    await expect(badge).toBeVisible();

    await badge.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("What is WebMCP?")).toBeVisible();
    await expect(dialog.getByText("Try asking")).toBeVisible();
    await expect(
      dialog.getByText(
        "Tools can inspect or change layout settings and start visible output actions. Your photo stays in this browser, and agents never receive image data.",
      ),
    ).toBeVisible();
    await expect(
      dialog.getByText("17 tools · 5 read only · 10 write · 2 execute", {
        exact: true,
      }),
    ).toBeVisible();

    const toolList = dialog.getByLabel("WebMCP tools");
    const inspectGroup = toolList.getByRole("button", {
      name: /Inspect layout, 5 tools/,
    });
    const configureGroup = toolList.getByRole("button", {
      name: /Configure layout, 9 tools/,
    });
    const outputGroup = toolList.getByRole("button", {
      name: /Save & print, 3 tools/,
    });
    await expect(inspectGroup).toBeVisible();
    await expect(configureGroup).toBeVisible();
    await expect(outputGroup).toBeVisible();
    await expect(
      toolList.getByText("5 tools · read only", { exact: true }),
    ).toBeVisible();
    await expect(
      toolList.getByText("9 tools · write", { exact: true }),
    ).toBeVisible();
    await expect(
      toolList.getByText("3 tools · 1 write · 2 execute", { exact: true }),
    ).toBeVisible();

    // Collapsed by default; expanding reveals compact tool rows.
    await inspectGroup.click();
    await expect(
      toolList.getByText("get-editor-summary", { exact: true }),
    ).toBeVisible();
    await expect(toolList.getByText("Read only").first()).toBeVisible();

    await configureGroup.click();
    await outputGroup.click();
    await expect(toolList.getByRole("listitem")).toHaveCount(17);
    await expect(
      toolList.getByText("set-background", { exact: true }),
    ).toBeVisible();
    await expect(
      toolList.getByText("export-pdf", { exact: true }),
    ).toBeVisible();
    await expect(toolList.getByText("Execute").first()).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(badge).toBeFocused();

    expect(consoleErrors).toEqual([]);
  });
});
