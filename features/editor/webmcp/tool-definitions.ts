import { z } from "zod";

import { useWorkspaceUiStore } from "@/stores/workspace-ui-store";

import { editorToolCatalog } from "./tool-catalog";
import type { EditorToolResult } from "./handlers";
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
} from "./handlers";
import {
  addPhotoSizeSchema,
  applyServiceSetSchema,
  configureNameplateSchema,
  configurePaperSchema,
  exportPdfSchema,
  getEditorSummarySchema,
  listNameplatePresetsSchema,
  listPaperPresetsSchema,
  listPhotoSizePresetsSchema,
  listServiceSetsSchema,
  openPrintDialogSchema,
  removePhotoSizeSchema,
  saveServiceSetSchema,
  setBackgroundSchema,
  setCropModeSchema,
  setPreviewPageSchema,
  updatePhotoSizeSchema,
} from "./input-schemas";

type Handler = (
  input: unknown,
  options: WebMCP.ToolExecuteCallbackOptions,
) => EditorToolResult | Promise<EditorToolResult>;

const toolBindings: Record<string, { schema: z.ZodType; handler: Handler }> = {
  "get-editor-summary": {
    schema: getEditorSummarySchema,
    handler: getEditorSummaryHandler,
  },
  "list-paper-presets": {
    schema: listPaperPresetsSchema,
    handler: listPaperPresetsHandler,
  },
  "list-photo-size-presets": {
    schema: listPhotoSizePresetsSchema,
    handler: listPhotoSizePresetsHandler,
  },
  "list-service-sets": {
    schema: listServiceSetsSchema,
    handler: listServiceSetsHandler,
  },
  "list-nameplate-presets": {
    schema: listNameplatePresetsSchema,
    handler: listNameplatePresetsHandler,
  },
  "configure-paper": {
    schema: configurePaperSchema,
    handler: configurePaperHandler,
  },
  "add-photo-size": {
    schema: addPhotoSizeSchema,
    handler: addPhotoSizeHandler,
  },
  "update-photo-size": {
    schema: updatePhotoSizeSchema,
    handler: updatePhotoSizeHandler,
  },
  "remove-photo-size": {
    schema: removePhotoSizeSchema,
    handler: removePhotoSizeHandler,
  },
  "apply-service-set": {
    schema: applyServiceSetSchema,
    handler: applyServiceSetHandler,
  },
  "configure-nameplate": {
    schema: configureNameplateSchema,
    handler: configureNameplateHandler,
  },
  "set-preview-page": {
    schema: setPreviewPageSchema,
    handler: setPreviewPageHandler,
  },
  "set-background": {
    schema: setBackgroundSchema,
    handler: setBackgroundHandler,
  },
  "set-crop-mode": {
    schema: setCropModeSchema,
    handler: setCropModeHandler,
  },
  "save-service-set": {
    schema: saveServiceSetSchema,
    handler: saveServiceSetHandler,
  },
  "export-pdf": {
    schema: exportPdfSchema,
    handler: (input, options) => exportPdfHandler(input, options),
  },
  "open-print-dialog": {
    schema: openPrintDialogSchema,
    handler: openPrintDialogHandler,
  },
};

const catalogNames = new Set(editorToolCatalog.map((entry) => entry.name));
for (const name of Object.keys(toolBindings)) {
  if (!catalogNames.has(name)) {
    throw new Error(
      `WebMCP tool "${name}" has a binding but is missing from the tool catalog.`,
    );
  }
}

function toInputSchema(schema: z.ZodType): object {
  return z.toJSONSchema(schema) as object;
}

// Activity entries carry the tool name, outcome, and time only. Arguments and
// results are never recorded, so nameplate text and customer data stay out of
// the UI (AGENTS.md §6).
function executeAndRecord(
  name: string,
  handler: Handler,
  inputObject: Record<string, unknown>,
  options: WebMCP.ToolExecuteCallbackOptions = {
    signal: new AbortController().signal,
  },
): Promise<EditorToolResult> {
  const throwIfCancelled = (): void => {
    if (options.signal.aborted) {
      throw (
        options.signal.reason ??
        new DOMException("The tool execution was cancelled.", "AbortError")
      );
    }
  };

  return Promise.resolve()
    .then(() => {
      throwIfCancelled();
      return handler(inputObject, options);
    })
    .then((result) => {
      throwIfCancelled();
      useWorkspaceUiStore.getState().recordWebMcpActivity({
        name,
        outcome: result.ok ? "ok" : "failed",
        at: Date.now(),
      });
      return result;
    })
    .catch((error: unknown) => {
      if (options.signal.aborted) {
        throw error;
      }
      useWorkspaceUiStore.getState().recordWebMcpActivity({
        name,
        outcome: "failed",
        at: Date.now(),
      });
      return {
        ok: false,
        error: "The tool failed unexpectedly. Try again.",
      } satisfies EditorToolResult;
    });
}

/**
 * Joins the agent-facing catalog (names, descriptions, annotations) with the
 * schema/handler bindings. Throws at import time when the two drift apart so
 * the catalog shown to humans can never diverge from what agents receive.
 */
export function createEditorToolRegistrations(): WebMCP.ModelContextTool[] {
  return editorToolCatalog.map((entry) => {
    const binding = toolBindings[entry.name];
    if (!binding) {
      throw new Error(
        `WebMCP tool "${entry.name}" is listed in the catalog without a schema/handler binding.`,
      );
    }
    return {
      name: entry.name,
      title: entry.title,
      description: entry.description,
      inputSchema: toInputSchema(binding.schema),
      execute: (
        inputObject: Record<string, unknown>,
        options: WebMCP.ToolExecuteCallbackOptions,
      ) => executeAndRecord(entry.name, binding.handler, inputObject, options),
      // WebMCP exposes a binary read-only hint. PrintChum's finer write/execute
      // distinction remains in the catalog; both are non-read-only to agents.
      annotations: {
        readOnlyHint: entry.permission === "read",
        untrustedContentHint: entry.untrustedContentHint ?? false,
      },
    };
  });
}
