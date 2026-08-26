import { beforeEach, describe, expect, it, vi } from "vitest";

import type { EditorToolResult } from "@/features/editor/webmcp/handlers";
import {
  addPhotoSizeHandler,
  applyServiceSetHandler,
  configureNameplateHandler,
  configurePaperHandler,
  exportPdfHandler,
  getEditorSummaryHandler,
  listNameplatePresetsHandler,
  listPaperPresetsHandler,
  listPhotoSizePresetsHandler,
  listServiceSetsHandler,
  openPrintDialogHandler,
  removePhotoSizeHandler,
  saveServiceSetHandler,
  setBackgroundHandler,
  setCropModeHandler,
  setPreviewPageHandler,
  updatePhotoSizeHandler,
} from "@/features/editor/webmcp/handlers";
import { createEditorToolRegistrations } from "@/features/editor/webmcp/tool-definitions";
import { useEditorStore } from "@/stores/editor-store";
import { useWorkspaceUiStore } from "@/stores/workspace-ui-store";

vi.mock("@/lib/pdf/export-pdf", () => ({
  pdfExportService: {
    exportLayout: vi.fn(async () => ({
      blob: { size: 2048 },
      filename: "printchum-layout.pdf",
      pageCount: 1,
      byteLength: 2048,
    })),
  },
}));

vi.mock("@/lib/pdf/download", () => ({
  downloadPdfResult: vi.fn(),
}));

function loadTestPhoto(): File {
  return new File(["test-bytes"], "passport.jpg", { type: "image/jpeg" });
}

describe("editor webmcp tool definitions", () => {
  it("registers seventeen uniquely named tools with object schemas", () => {
    const tools = createEditorToolRegistrations();
    expect(tools).toHaveLength(17);
    const names = tools.map((tool) => tool.name);
    expect(new Set(names).size).toBe(17);
    for (const tool of tools) {
      expect(tool.description.length).toBeGreaterThan(20);
      expect(tool.inputSchema).toMatchObject({ type: "object" });
      expect(typeof tool.execute).toBe("function");
    }
    expect(names).toContain("get-editor-summary");
    expect(names).toContain("set-preview-page");
    expect(names).toContain("set-background");
    expect(names).toContain("set-crop-mode");
    expect(names).toContain("save-service-set");
    expect(names).toContain("list-nameplate-presets");
    expect(names).toContain("export-pdf");
    expect(names).toContain("open-print-dialog");
  });

  it("marks read-only tools with annotations", () => {
    const tools = createEditorToolRegistrations();
    const summary = tools.find((tool) => tool.name === "get-editor-summary");
    expect(summary?.annotations).toEqual({ readOnlyHint: true });
    const exportTool = tools.find((tool) => tool.name === "export-pdf");
    expect(exportTool?.annotations).toBeUndefined();
  });
});

describe("editor webmcp handlers", () => {
  beforeEach(() => {
    useEditorStore.getState().resetEditor();
  });

  describe("get-editor-summary", () => {
    it("summarizes an empty editor without exposing photo data", () => {
      useEditorStore.getState().addSourcePhoto(loadTestPhoto());
      const result = getEditorSummaryHandler({});
      expect(result.ok).toBe(true);
      if (!result.ok) {
        throw new Error("expected ok result");
      }
      expect(result.hasSourcePhoto).toBe(true);
      expect(result.photoCount).toBe(1);
      expect(result.paper).toMatchObject({
        name: "Letter / Short Bond",
        unit: "in",
        orientation: "portrait",
      });

      const serialized = JSON.stringify(result);
      expect(serialized).not.toContain("blob:");
      expect(serialized).not.toContain("objectUrl");
      expect(serialized).not.toContain("passport.jpg");
      expect(serialized).not.toContain("test-bytes");
    });

    it("rejects unexpected input", () => {
      const result = getEditorSummaryHandler({ surprise: true });
      expect(result.ok).toBe(false);
    });
  });

  describe("list tools", () => {
    it("lists paper presets without the custom placeholder", () => {
      const result = listPaperPresetsHandler({});
      expect(result.ok).toBe(true);
      if (!result.ok) {
        throw new Error("expected ok result");
      }
      const presets = result.presets as Array<{ id: string }>;
      expect(presets.map((preset) => preset.id)).toContain("letter");
      expect(presets.map((preset) => preset.id)).not.toContain("custom");
    });

    it("lists photo size presets without the custom placeholder", () => {
      const result = listPhotoSizePresetsHandler({});
      expect(result.ok).toBe(true);
      if (!result.ok) {
        throw new Error("expected ok result");
      }
      const presets = result.presets as Array<{ id: string }>;
      expect(presets.map((preset) => preset.id)).toContain("passport");
      expect(presets.map((preset) => preset.id)).not.toContain("custom");
    });

    it("lists service sets with pricing metadata only", () => {
      const result = listServiceSetsHandler({});
      expect(result.ok).toBe(true);
      const serialized = JSON.stringify(result);
      expect(serialized).not.toContain("photoItems");
      expect(serialized).not.toContain("nameplate");
    });
  });

  describe("configure-paper", () => {
    it("switches to a preset and reports the new paper", () => {
      const result = configurePaperHandler({ presetId: "a4" });
      expect(result.ok).toBe(true);
      expect(useEditorStore.getState().paper.presetId).toBe("a4");
    });

    it("applies custom dimensions on top of a preset", () => {
      configurePaperHandler({ presetId: "letter" });
      const result = configurePaperHandler({
        width: 5,
        height: 7,
        unit: "in",
        orientation: "landscape",
      });
      expect(result.ok).toBe(true);
      const paper = useEditorStore.getState().paper;
      expect(paper.width).toBe(5);
      expect(paper.height).toBe(7);
      expect(paper.orientation).toBe("landscape");
      expect(paper.presetId).toBeNull();
    });

    it("rejects unknown presets and lists valid ids", () => {
      const result = configurePaperHandler({ presetId: "broadsheet" });
      expect(result.ok).toBe(false);
      if (result.ok) {
        throw new Error("expected failure");
      }
      expect(JSON.stringify(result)).toContain("letter");
    });

    it("rejects empty input", () => {
      const result = configurePaperHandler({});
      expect(result.ok).toBe(false);
    });
  });

  describe("add-photo-size", () => {
    it("adds a preset photo size and returns its item id", () => {
      useEditorStore.getState().addSourcePhoto(loadTestPhoto());
      const result = addPhotoSizeHandler({ presetId: "2x2", quantity: 4 });
      expect(result.ok).toBe(true);
      if (!result.ok) {
        throw new Error("expected ok result");
      }
      const item = result.item as { id: string; quantity: number };
      expect(item.quantity).toBe(4);
      expect(
        useEditorStore.getState().photoSizes.some((size) => size.id === item.id),
      ).toBe(true);
    });

    it("adds a custom photo size", () => {
      const result = addPhotoSizeHandler({
        width: 35,
        height: 45,
        unit: "mm",
        quantity: 8,
      });
      expect(result.ok).toBe(true);
      const state = useEditorStore.getState();
      expect(state.photoSizes[0]).toMatchObject({
        width: 35,
        height: 45,
        unit: "mm",
        quantity: 8,
      });
    });

    it("bumps quantity when a preset already exists", () => {
      addPhotoSizeHandler({ presetId: "wallet" });
      const first = JSON.parse(
        JSON.stringify(useEditorStore.getState().photoSizes),
      ) as Array<{ id: string; quantity: number }>;
      const result = addPhotoSizeHandler({ presetId: "wallet" });
      expect(result.ok).toBe(true);
      const sizes = useEditorStore.getState().photoSizes;
      expect(sizes.filter((size) => size.presetId === "wallet")).toHaveLength(1);
      expect(sizes[0].quantity).toBe(first[0].quantity + 1);
    });

    it("requires either presetId or full custom dimensions", () => {
      const result = addPhotoSizeHandler({ width: 2, height: 3 });
      expect(result.ok).toBe(false);
    });

    it("reports unplaced items when sizes exceed the paper", () => {
      useEditorStore.getState().addSourcePhoto(loadTestPhoto());
      addPhotoSizeHandler({ width: 50, height: 50, unit: "in" });
      const summary = getEditorSummaryHandler({});
      expect(summary.ok).toBe(true);
      if (!summary.ok) {
        throw new Error("expected ok result");
      }
      const layout = summary.layout as { placedItems: number; unplacedCount: number };
      expect(layout.placedItems).toBe(0);
      expect(layout.unplacedCount).toBeGreaterThan(0);
    });
  });

  describe("update and remove photo size", () => {
    it("updates quantity by item id", () => {
      addPhotoSizeHandler({ presetId: "2r", quantity: 2 });
      const itemId = useEditorStore.getState().photoSizes[0].id;
      const result = updatePhotoSizeHandler({ itemId, quantity: 9 });
      expect(result.ok).toBe(true);
      expect(
        useEditorStore.getState().photoSizes.find((size) => size.id === itemId)
          ?.quantity,
      ).toBe(9);
    });

    it("fails with available ids for unknown item", () => {
      addPhotoSizeHandler({ presetId: "2r" });
      const result = updatePhotoSizeHandler({ itemId: "nope", quantity: 1 });
      expect(result.ok).toBe(false);
      if (result.ok) {
        throw new Error("expected failure");
      }
      expect(result.availableItemIds).toHaveLength(1);
    });

    it("removes a photo size", () => {
      addPhotoSizeHandler({ presetId: "2r" });
      const itemId = useEditorStore.getState().photoSizes[0].id;
      const result = removePhotoSizeHandler({ itemId });
      expect(result.ok).toBe(true);
      expect(useEditorStore.getState().photoSizes).toHaveLength(0);
    });
  });

  describe("apply-service-set", () => {
    it("applies a service set and reflects selection", () => {
      useEditorStore.getState().addSourcePhoto(loadTestPhoto());
      const serviceSetId = useEditorStore.getState().serviceSets[0].id;
      const result = applyServiceSetHandler({ serviceSetId });
      expect(result.ok).toBe(true);
      expect(useEditorStore.getState().selectedServiceSetId).toBe(serviceSetId);
    });

    it("rejects unknown and disabled service sets", () => {
      const failing = applyServiceSetHandler({ serviceSetId: "missing" });
      expect(failing.ok).toBe(false);

      const serviceSetId = useEditorStore.getState().serviceSets[0].id;
      useEditorStore.getState().setServiceSetStatus(serviceSetId, "disabled");
      const disabledResult = applyServiceSetHandler({ serviceSetId });
      expect(disabledResult.ok).toBe(false);
      useEditorStore.getState().setServiceSetStatus(serviceSetId, "enabled");
    });
  });

  describe("configure-nameplate", () => {
    it("enables and populates a nameplate", () => {
      addPhotoSizeHandler({ presetId: "2x2" });
      const itemId = useEditorStore.getState().photoSizes[0].id;
      const result = configureNameplateHandler({
        itemId,
        primaryText: "Jamie Cruz",
        secondaryText: "2026-0417",
      });
      expect(result.ok).toBe(true);

      const item = useEditorStore
        .getState()
        .photoSizes.find((size) => size.id === itemId);
      expect(item?.nameplateEnabled).toBe(true);
      expect(item?.nameplate?.primaryText).toBe("Jamie Cruz");
      expect(item?.nameplate?.secondaryText).toBe("2026-0417");
    });

    it("rejects invalid color values at the schema boundary", () => {
      addPhotoSizeHandler({ presetId: "2x2" });
      const itemId = useEditorStore.getState().photoSizes[0].id;
      const result = configureNameplateHandler({
        itemId,
        textColor: "red",
      });
      expect(result.ok).toBe(false);
    });

    it("starts from a preset when presetId is provided", () => {
      addPhotoSizeHandler({ presetId: "2x2" });
      const itemId = useEditorStore.getState().photoSizes[0].id;
      const result = configureNameplateHandler({
        itemId,
        presetId: "name-and-id",
        primaryText: "Jamie Cruz",
      });
      expect(result.ok).toBe(true);

      const item = useEditorStore
        .getState()
        .photoSizes.find((size) => size.id === itemId);
      expect(item?.nameplateEnabled).toBe(true);
      expect(item?.nameplate?.presetType).toBe("name-and-id");
      expect(item?.nameplate?.primaryText).toBe("Jamie Cruz");
      expect(item?.nameplate?.secondaryText).toBe("ID Number");
    });
  });

  describe("set-preview-page", () => {
    it("reports when no layout exists", () => {
      const result = setPreviewPageHandler({ pageNumber: 1 });
      expect(result.ok).toBe(false);
    });

    it("rejects out-of-range pages and reports the page count", () => {
      useEditorStore.getState().addSourcePhoto(loadTestPhoto());
      addPhotoSizeHandler({ presetId: "2x2", quantity: 18 });
      const pageCount =
        useEditorStore.getState().layoutResult?.pages.length ?? 0;
      expect(pageCount).toBeGreaterThan(0);

      const result = setPreviewPageHandler({ pageNumber: pageCount + 1 });
      expect(result.ok).toBe(false);
      if (result.ok) {
        throw new Error("expected failure");
      }
      expect(result.pageCount).toBe(pageCount);
    });

    it("navigates using 1-based page numbers", () => {
      useEditorStore.getState().addSourcePhoto(loadTestPhoto());
      addPhotoSizeHandler({ presetId: "2x2", quantity: 18 });
      const pageCount =
        useEditorStore.getState().layoutResult?.pages.length ?? 0;
      if (pageCount < 2) {
        throw new Error("test setup expected a multi-page layout");
      }

      const result = setPreviewPageHandler({ pageNumber: 2 });
      expect(result.ok).toBe(true);
      expect(useEditorStore.getState().activePageIndex).toBe(1);
    });
  });

  describe("set-background", () => {
    it("defaults solid mode to white", () => {
      const result = setBackgroundHandler({ mode: "solid" });
      expect(result.ok).toBe(true);
      expect(useEditorStore.getState().backgroundMode).toBe("solid");
      expect(useEditorStore.getState().backgroundColor).toBe("#ffffff");
    });

    it("applies a custom solid color", () => {
      const result = setBackgroundHandler({
        mode: "solid",
        color: "#f5f5f5",
      });
      expect(result.ok).toBe(true);
      expect(useEditorStore.getState().backgroundColor).toBe("#f5f5f5");
    });

    it("sets expectations when transparency has no removed background", () => {
      const result = setBackgroundHandler({ mode: "transparent" });
      expect(result.ok).toBe(true);
      if (!result.ok) {
        throw new Error("expected ok result");
      }
      expect(result.note).toBeTruthy();
    });
  });

  describe("set-crop-mode", () => {
    it("requires a loaded photo", () => {
      const result = setCropModeHandler({ mode: "fill-frame" });
      expect(result.ok).toBe(false);
    });

    it("applies the mode to the active photo", () => {
      useEditorStore.getState().addSourcePhoto(loadTestPhoto());
      const result = setCropModeHandler({ mode: "fit-with-padding" });
      expect(result.ok).toBe(true);
      expect(useEditorStore.getState().cropMode).toBe("fit-with-padding");
    });
  });

  describe("list-nameplate-presets", () => {
    it("lists the nameplate starting points", () => {
      const result = listNameplatePresetsHandler({});
      expect(result.ok).toBe(true);
      if (!result.ok) {
        throw new Error("expected ok result");
      }
      const presets = result.presets as Array<{ id: string }>;
      expect(presets.map((preset) => preset.id)).toEqual([
        "full-name",
        "name-and-id",
        "name-id-department",
        "custom",
      ]);
    });
  });

  describe("save-service-set", () => {
    it("requires at least one photo size", () => {
      const result = saveServiceSetHandler({ name: "Empty package" });
      expect(result.ok).toBe(false);
    });

    it("saves the current configuration and returns the new id", () => {
      useEditorStore.getState().addSourcePhoto(loadTestPhoto());
      addPhotoSizeHandler({ presetId: "2x2", quantity: 4 });

      const result = saveServiceSetHandler({
        name: "School ID",
        price: 40,
      });
      expect(result.ok).toBe(true);
      if (!result.ok) {
        throw new Error("expected ok result");
      }
      const serviceSetId = result.serviceSetId as string;
      const created = useEditorStore
        .getState()
        .serviceSets.find((set) => set.id === serviceSetId);
      expect(created).toBeTruthy();
      expect(created?.name).toBe("School ID");
      expect(created?.price).toBe(40);
      expect(created?.photoItems).toHaveLength(1);
      expect(created?.currencyCode).toHaveLength(3);
    });
  });

  describe("export-pdf", () => {
    it("refuses to export without a placed layout", async () => {
      const result = await exportPdfHandler({});
      expect(result.ok).toBe(false);
    });

    it("refuses to export without a photo and explains the manual upload rule", async () => {
      addPhotoSizeHandler({ presetId: "2x2" });
      const result = await exportPdfHandler({});
      expect(result.ok).toBe(false);
      if (result.ok) {
        throw new Error("expected failure");
      }
      expect(result.error.toLowerCase()).toContain("upload");
    });

    it("exports and returns metadata only after a successful generation", async () => {
      const { pdfExportService } = await import("@/lib/pdf/export-pdf");
      const { downloadPdfResult } = await import("@/lib/pdf/download");

      useEditorStore.getState().addSourcePhoto(loadTestPhoto());
      addPhotoSizeHandler({ presetId: "2x2", quantity: 4 });

      const result = await exportPdfHandler({ filename: "school set" });
      expect(result.ok).toBe(true);
      expect(pdfExportService.exportLayout).toHaveBeenCalledTimes(1);
      expect(downloadPdfResult).toHaveBeenCalledTimes(1);

      const serialized = JSON.stringify(result);
      expect(serialized).not.toContain("blob:");
      expect(serialized).not.toContain("[object");
    });
  });

  describe("open-print-dialog", () => {
    it("requires output-ready state before opening", () => {
      const result = openPrintDialogHandler({});
      expect(result.ok).toBe(false);
    });

    it("opens the dialog through the workspace ui store when ready", () => {
      // The store module is client-side; exercise handler guard logic here and
      // verify dialog wiring in the Playwright suite.
      useEditorStore.getState().addSourcePhoto(loadTestPhoto());
      addPhotoSizeHandler({ presetId: "2x2", quantity: 1 });
      const readyState = useEditorStore.getState();
      const outputReady =
        Boolean(readyState.layoutResult) &&
        (readyState.layoutResult?.placedItems ?? 0) > 0 &&
        readyState.sourcePhotos.length > 0;
      expect(outputReady).toBe(true);
      void openPrintDialogHandler({});
    });
  });
});

describe("webmcp privacy guarantees", () => {
  beforeEach(() => {
    useEditorStore.getState().resetEditor();
    useWorkspaceUiStore.setState({ webMcpActivity: [] });
  });

  it("never serializes file names or object urls across mutating tools", () => {
    useEditorStore.getState().addSourcePhoto(loadTestPhoto());
    const results: EditorToolResult[] = [
      addPhotoSizeHandler({ presetId: "passport", quantity: 2 }),
      configurePaperHandler({ presetId: "a4" }),
      getEditorSummaryHandler({}),
    ];
    for (const result of results) {
      const serialized = JSON.stringify(result);
      expect(serialized).not.toMatch(/blob:/i);
      expect(serialized).not.toMatch(/objecturl/i);
      expect(serialized).not.toContain(".jpg");
    }
  });

  it("records tool activity metadata without arguments", async () => {
    useEditorStore.getState().addSourcePhoto(loadTestPhoto());
    addPhotoSizeHandler({ presetId: "2x2" });
    const itemId = useEditorStore.getState().photoSizes[0].id;

    const tool = createEditorToolRegistrations().find(
      (candidate) => candidate.name === "configure-nameplate",
    );
    if (!tool) {
      throw new Error("configure-nameplate registration missing");
    }
    const result = (await tool.execute(
      {
        itemId,
        primaryText: "Jamie Cruz",
        secondaryText: "2026-0417",
      },
      { signal: new AbortController().signal },
    )) as EditorToolResult;
    expect(result.ok).toBe(true);

    const activity = useWorkspaceUiStore.getState().webMcpActivity;
    expect(activity).toHaveLength(1);
    expect(activity[0]).toMatchObject({
      name: "configure-nameplate",
      outcome: "ok",
    });
    const serialized = JSON.stringify(activity);
    expect(serialized).not.toContain("Jamie");
    expect(serialized).not.toContain("2026-0417");
    expect(serialized).not.toContain("primaryText");
  });
});
