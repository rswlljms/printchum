/// <reference types="webmcp-types" />

// webmcp-types@0.1.5 predates the executeTool method documented in the
// WebMCP explainer (https://github.com/webmachinelearning/webmcp) and shipped
// by Chrome's origin trial. Merge it into the global namespace until the
// package catches up.
//
// Chrome expects the input as a JSON string and resolves with a JSON string of
// the tool's return value (see the Imperative API docs:
// executeTool(tool, '{"text": "Buy milk"}')). Passing an object input fails
// with "UnknownError: Failed to parse input arguments".
declare namespace WebMCP {
  interface ModelContext {
    executeTool(tool: RegisteredTool, inputJson?: string): Promise<unknown>;
  }
}

