import {
  isWebMcpEnabled,
  isWebMcpSupported,
  registerModelContextTools,
  type ModelContextRegistrationResult,
} from "@/lib/webmcp/model-context-bridge";

import { createEditorToolRegistrations } from "./tool-definitions";

export type EditorToolRegistrationResult =
  ModelContextRegistrationResult & {
    disabled: boolean;
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
    return { registeredCount: 0, blocked: false, disabled: true };
  }
  if (!isWebMcpSupported()) {
    return { registeredCount: 0, blocked: false, disabled: false };
  }
  const result = await registerModelContextTools(
    createEditorToolRegistrations(),
    signal,
  );
  return { ...result, disabled: false };
}
