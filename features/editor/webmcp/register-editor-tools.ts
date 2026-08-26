import {
  isWebMcpEnabled,
  isWebMcpSupported,
  registerModelContextTools,
  type ModelContextRegistrationResult,
} from "@/lib/webmcp/model-context-bridge";

import { createEditorToolRegistrations } from "./tool-definitions";
import { editorToolCatalog } from "./tool-catalog";

export type EditorToolRegistrationResult =
  | ModelContextRegistrationResult
  | {
      status: "disabled" | "unsupported";
      registeredCount: 0;
      totalCount: number;
    };

/**
 * Registers editor tools with the browser's model context. Safe to call in any
 * browser: without WebMCP support this resolves immediately and the app behaves
 * exactly as before. The signal unregisters all tools when it aborts.
 */
export async function registerEditorTools(
  signal: AbortSignal,
): Promise<EditorToolRegistrationResult> {
  if (!isWebMcpEnabled()) {
    return {
      status: "disabled",
      registeredCount: 0,
      totalCount: editorToolCatalog.length,
    };
  }
  if (!isWebMcpSupported()) {
    return {
      status: "unsupported",
      registeredCount: 0,
      totalCount: editorToolCatalog.length,
    };
  }
  try {
    return await registerModelContextTools(
      createEditorToolRegistrations(),
      signal,
    );
  } catch {
    return {
      status: "failed",
      registeredCount: 0,
      totalCount: editorToolCatalog.length,
    };
  }
}
