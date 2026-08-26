import { afterEach, describe, expect, it, vi } from "vitest";

import {
  registerModelContextTools,
  type ModelContextRegistrationResult,
} from "@/lib/webmcp/model-context-bridge";

function makeTool(name: string): WebMCP.ModelContextTool {
  return { name } as unknown as WebMCP.ModelContextTool;
}

type RegisterToolFn = (
  tool: WebMCP.ModelContextTool,
  options: { signal: AbortSignal },
) => Promise<void>;

function stubModelContext(registerTool: RegisterToolFn) {
  const modelContext = { registerTool: vi.fn(registerTool) };
  const fakeDocument = { modelContext };
  // isWebMcpSupported() checks both window and document.
  vi.stubGlobal("window", {});
  vi.stubGlobal("document", fakeDocument);
  return modelContext;
}

describe("registerModelContextTools abort handling", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("stops silently when cleanup aborts mid-registration", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    stubModelContext(
      (_tool, { signal }) =>
        new Promise<void>((_resolve, reject) => {
          signal.addEventListener("abort", () => {
            reject(
              new DOMException(
                "signal is aborted without reason",
                "AbortError",
              ),
            );
          });
        }),
    );
    const controller = new AbortController();
    const pending: Promise<ModelContextRegistrationResult> =
      registerModelContextTools([makeTool("get-editor-summary")], controller.signal);
    controller.abort();
    await expect(pending).resolves.toEqual({
      registeredCount: 0,
      blocked: false,
    });
    expect(warn).not.toHaveBeenCalled();
  });

  it("skips all tools without calling registerTool when already aborted", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const modelContext = stubModelContext(async () => {});
    const controller = new AbortController();
    controller.abort();
    const result = await registerModelContextTools(
      [makeTool("a"), makeTool("b")],
      controller.signal,
    );
    expect(result).toEqual({ registeredCount: 0, blocked: false });
    expect(modelContext.registerTool).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });

  it("still warns and continues on non-abort registration failures", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    stubModelContext(async (_tool, { signal }) => {
      if (signal.aborted) {
        throw new DOMException("aborted", "AbortError");
      }
      if (_tool.name === "bad-tool") {
        throw new TypeError("registration rejected");
      }
    });
    const result = await registerModelContextTools(
      [makeTool("bad-tool"), makeTool("good-tool")],
      new AbortController().signal,
    );
    expect(result).toEqual({ registeredCount: 1, blocked: false });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(
      'WebMCP: tool "bad-tool" could not be registered.',
      expect.any(TypeError),
    );
  });
});
