// Kill switch for the WebMCP feature (shipping-and-launch skill): flipping
// NEXT_PUBLIC_WEBMCP_ENABLED to "false"/"0"/"off" disables agent tools without
// a code change. Unset or any other value keeps the feature available.
const DISABLED_VALUES = new Set(["false", "0", "off"]);

export function isWebMcpEnabled(): boolean {
  const value = process.env.NEXT_PUBLIC_WEBMCP_ENABLED;
  if (value == null || value === "") {
    return true;
  }
  return !DISABLED_VALUES.has(value.trim().toLowerCase());
}

export function isWebMcpSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof document !== "undefined" &&
    "modelContext" in document &&
    document.modelContext != null
  );
}

export type ModelContextRegistrationResult = {
  registeredCount: number;
  blocked: boolean;
};

/**
 * Registers tools with document.modelContext, the browser-mediated entry point
 * for AI agents. Registration is aborted when the provided signal aborts, which
 * unregisters the tools (used by React mount/unmount cleanup).
 */
export async function registerModelContextTools(
  tools: readonly WebMCP.ModelContextTool[],
  signal: AbortSignal,
): Promise<ModelContextRegistrationResult> {
  if (!isWebMcpSupported()) {
    return { registeredCount: 0, blocked: false };
  }
  let registeredCount = 0;
  for (const tool of tools) {
    if (signal.aborted) {
      break;
    }
    try {
      await document.modelContext?.registerTool(tool, { signal });
      registeredCount += 1;
    } catch (error) {
      if (
        signal.aborted ||
        (error instanceof DOMException && error.name === "AbortError")
      ) {
        // Cleanup aborted registration (StrictMode remount or unmount);
        // expected, so stop silently without warning.
        return { registeredCount, blocked: false };
      }
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        // Permissions-Policy disabled tool registration; degrade silently.
        console.warn("WebMCP tools are disabled by permissions policy.");
        return { registeredCount, blocked: true };
      }
      console.warn(`WebMCP: tool "${tool.name}" could not be registered.`, error);
    }
  }
  return { registeredCount, blocked: false };
}
