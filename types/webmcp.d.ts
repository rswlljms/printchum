/// <reference types="webmcp-types" />

// webmcp-types@0.1.5 predates executeTool and its cancellation options. Merge
// the missing members into the global namespace until the package catches up.
//
// The current Chrome Imperative API accepts a JSON-string input and an optional
// options object (see https://developer.chrome.com/docs/ai/webmcp/imperative-api).
declare namespace WebMCP {
  interface ModelContextExecuteToolOptions {
    signal?: AbortSignal;
  }

  interface ModelContext {
    executeTool(
      tool: RegisteredTool,
      inputJson?: string,
      options?: ModelContextExecuteToolOptions,
    ): Promise<unknown>;
  }
}
