import { expect, test } from "@playwright/test";

const webmcpE2eEnabled = process.env.WEBMCP_E2E === "1";

test.skip(
  !webmcpE2eEnabled,
  "WebMCP E2E requires WEBMCP_E2E=1 plus a WebMCP-enabled Chrome (chrome://flags/#enable-webmcp-testing or an origin-trial build).",
);

const expectedToolNames = [
  "get-editor-summary",
  "list-paper-presets",
  "list-photo-size-presets",
  "list-service-sets",
  "list-nameplate-presets",
  "configure-paper",
  "add-photo-size",
  "update-photo-size",
  "remove-photo-size",
  "apply-service-set",
  "configure-nameplate",
  "set-preview-page",
  "set-background",
  "set-crop-mode",
  "save-service-set",
  "export-pdf",
  "open-print-dialog",
];

test.describe("editor WebMCP tools", () => {
  test("registers tools and executes them against the live editor", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Create Layout" }).first()).toBeVisible();

    const supported = await page.evaluate(
      () => document.modelContext != null,
    );
    test.skip(
      !supported,
      "document.modelContext is unavailable in this browser run; enable the WebMCP testing flag.",
    );

    // The header badge flips to "17 tools" only after the async registration
    // loop completes; wait on it before reading tools, otherwise this races
    // the registration and sees an empty tool list.
    await expect(
      page.getByRole("button", { name: "View WebMCP agent tools" }),
    ).toHaveText(/WebMCP · 17 tools/);

    const toolNames = await page.evaluate(async () => {
      const tools = (await document.modelContext?.getTools()) ?? [];
      return tools.map((tool) => tool.name);
    });
    expect(toolNames).toHaveLength(17);
    // getTools() returns tools sorted by name, not registration order.
    expect([...toolNames].sort()).toEqual([...expectedToolNames].sort());

    const annotationCounts = await page.evaluate(async () => {
      const tools = (await document.modelContext?.getTools()) ?? [];
      return tools.reduce(
        (counts, tool) => {
          if (tool.annotations?.readOnlyHint === true) {
            counts.readOnly += 1;
          } else if (tool.annotations?.readOnlyHint === false) {
            counts.write += 1;
          }
          return counts;
        },
        { readOnly: 0, write: 0 },
      );
    });
    expect(annotationCounts).toEqual({ readOnly: 5, write: 12 });

    async function executeTool(
      name: string,
      args: Record<string, unknown>,
    ): Promise<unknown> {
      return page.evaluate(
        async ({ toolName, toolArgs }) => {
          const tools = (await document.modelContext?.getTools()) ?? [];
          const tool = tools.find((candidate) => candidate.name === toolName);
          if (!tool) {
            throw new Error(`tool not found: ${toolName}`);
          }
          // Chrome hands executeTool a JSON string input and resolves with a
          // JSON string of the tool's return value; parse it for assertions.
          const raw = await document.modelContext?.executeTool(
            tool,
            JSON.stringify(toolArgs),
          );
          return typeof raw === "string" ? JSON.parse(raw) : raw;
        },
        { toolName: name, toolArgs: args },
      );
    }

    const paperResult = (await executeTool("configure-paper", {
      presetId: "a4",
    })) as { ok?: boolean };
    expect(paperResult.ok).toBe(true);
    await expect(
      page.getByText("A4", { exact: true }).first(),
    ).toBeVisible();

    const addResult = (await executeTool("add-photo-size", {
      presetId: "passport",
      quantity: 8,
    })) as { ok?: boolean; item?: { id?: string } };
    expect(addResult.ok).toBe(true);
    expect(addResult.item?.id).toBeTruthy();

    const summary = (await executeTool("get-editor-summary", {})) as {
      ok?: boolean;
      layout?: { placedItems?: number };
    };
    expect(summary.ok).toBe(true);
    expect(summary.layout?.placedItems).toBeGreaterThan(0);

    // Print stays human-gated: the agent can only open the dialog.
    await page.setInputFiles("input[type='file']", {
      name: "passport.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        "base64",
      ),
    });
    const printResult = (await executeTool("open-print-dialog", {})) as {
      ok?: boolean;
    };
    expect(printResult.ok).toBe(true);
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");

    const downloadPromise = page.waitForEvent("download");
    const exportResult = (await executeTool("export-pdf", {
      filename: "webmcp-e2e",
    })) as { ok?: boolean };
    expect(exportResult.ok).toBe(true);
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.pdf$/);

    // Executed tools appear in the human-facing activity log. Assert the first
    // and last tools this test actually executed.
    await page
      .getByRole("button", { name: "View WebMCP agent tools" })
      .click();
    const discoveryDialog = page.getByRole("dialog");
    await expect(discoveryDialog).toBeVisible();
    const activityLog = discoveryDialog.getByLabel("Recent agent activity");
    await expect(
      activityLog.getByText("configure-paper", { exact: true }),
    ).toBeVisible();
    await expect(
      activityLog.getByText("export-pdf", { exact: true }),
    ).toBeVisible();
  });
});
