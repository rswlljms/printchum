import { afterEach, describe, expect, it } from "vitest";

import { registerEditorTools } from "@/features/editor/webmcp/register-editor-tools";
import { isWebMcpEnabled } from "@/lib/webmcp/model-context-bridge";

const ENV_VAR = "NEXT_PUBLIC_WEBMCP_ENABLED";

function setEnv(value: string | undefined): void {
  if (value == null) {
    delete process.env[ENV_VAR];
  } else {
    process.env[ENV_VAR] = value;
  }
}

describe("webmcp kill switch", () => {
  afterEach(() => {
    setEnv(undefined);
  });

  it("is enabled when the variable is unset", () => {
    setEnv(undefined);
    expect(isWebMcpEnabled()).toBe(true);
  });

  it("is enabled for truthy values", () => {
    for (const value of ["true", "1", "on", "yes"]) {
      setEnv(value);
      expect(isWebMcpEnabled()).toBe(true);
    }
  });

  it("is disabled by explicit off values regardless of case or spacing", () => {
    for (const value of ["false", "0", "off", "FALSE", "Off", " 0 "]) {
      setEnv(value);
      expect(isWebMcpEnabled()).toBe(false);
    }
  });

  it("short-circuits registration while disabled without touching model context", async () => {
    setEnv("false");
    const result = await registerEditorTools(new AbortController().signal);
    expect(result).toEqual({
      status: "disabled",
      registeredCount: 0,
      totalCount: 17,
    });
  });

  it("reports supported-but-unavailable instead of disabled on normal runtimes", async () => {
    setEnv(undefined);
    const result = await registerEditorTools(new AbortController().signal);
    expect(result).toEqual({
      status: "unsupported",
      registeredCount: 0,
      totalCount: 17,
    });
  });
});
