/// <reference types="webmcp-types" />

// webmcp-types@0.1.5 predates the executeTool method documented in the
// WebMCP explainer (https://github.com/webmachinelearning/webmcp) and shipped
// by Chrome's origin trial. Merge it into the global namespace until the
// package catches up.
declare namespace WebMCP {
  interface ModelContext {
    executeTool(
      tool: RegisteredTool,
      inputObject?: Record<string, unknown>,
    ): Promise<unknown>;
  }
}
