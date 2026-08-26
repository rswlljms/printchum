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
    document.modelContext != null &&
    typeof document.modelContext.registerTool === "function"
  );
}

export type ModelContextRegistrationResult = {
  status: "registered" | "partial" | "blocked" | "failed" | "aborted";
  registeredCount: number;
  totalCount: number;
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
    return { status: "failed", registeredCount: 0, totalCount: tools.length };
  }
  let registeredCount = 0;
  for (const tool of tools) {
    if (signal.aborted) {
      return { status: "aborted", registeredCount, totalCount: tools.length };
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
        return { status: "aborted", registeredCount, totalCount: tools.length };
      }
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        // Permissions-Policy disabled tool registration; degrade silently.
        console.warn("WebMCP tools are disabled by permissions policy.");
        return { status: "blocked", registeredCount, totalCount: tools.length };
      }
      console.warn(`WebMCP: tool "${tool.name}" could not be registered.`, error);
    }
  }
  return {
    status:
      registeredCount === tools.length
        ? "registered"
        : registeredCount > 0
          ? "partial"
          : "failed",
    registeredCount,
    totalCount: tools.length,
  };
}
