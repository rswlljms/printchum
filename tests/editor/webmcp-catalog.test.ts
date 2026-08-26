import { describe, expect, it } from "vitest";

import { createEditorToolRegistrations } from "@/features/editor/webmcp/tool-definitions";
import { editorToolCatalog } from "@/features/editor/webmcp/tool-catalog";

describe("editor webmcp tool catalog", () => {
  it("contains seventeen uniquely named kebab-case tools", () => {
    expect(editorToolCatalog).toHaveLength(17);
    const names = editorToolCatalog.map((entry) => entry.name);
    expect(new Set(names).size).toBe(17);
    for (const name of names) {
      expect(name).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("marks exactly the five read tools as read only", () => {
    const readOnly = editorToolCatalog.filter((entry) => entry.readOnly);
    expect(readOnly.map((entry) => entry.name)).toEqual([
      "get-editor-summary",
      "list-paper-presets",
      "list-photo-size-presets",
      "list-service-sets",
      "list-nameplate-presets",
    ]);
  });

  it("writes substantive, positive descriptions for every tool", () => {
    for (const entry of editorToolCatalog) {
      expect(
        entry.description.length,
        `${entry.name} description is too short`,
      ).toBeGreaterThanOrEqual(40);
      expect(
        entry.description.startsWith("Don't") ||
          entry.description.startsWith("Do not"),
        `${entry.name} description uses negative language`,
      ).toBe(false);
    }
  });

  it("provides a short human-facing summary for every tool", () => {
    for (const entry of editorToolCatalog) {
      expect(
        entry.summary.length,
        `${entry.name} summary is too short`,
      ).toBeGreaterThanOrEqual(10);
      expect(
        entry.summary.length,
        `${entry.name} summary is too long for the compact row`,
      ).toBeLessThanOrEqual(90);
    }
  });

  it("states the visible effect for every mutating tool", () => {
    for (const entry of editorToolCatalog) {
      if (entry.readOnly) {
        continue;
      }
      expect(
        entry.description,
        `${entry.name} should describe its visible effect`,
      ).toMatch(/visible|preview|updates?|immediately/i);
    }
  });

  it("stays in parity with the registered tool definitions", () => {
    const registrations = createEditorToolRegistrations();
    expect(registrations).toHaveLength(editorToolCatalog.length);
    const emittedNames = registrations.map((tool) => tool.name);
    expect(emittedNames).toEqual(
      editorToolCatalog.map((entry) => entry.name),
    );
    for (const [index, tool] of registrations.entries()) {
      const entry = editorToolCatalog[index];
      expect(tool.title).toBe(entry.title);
      expect(tool.description).toBe(entry.description);
      if (entry.readOnly) {
        expect(tool.annotations).toEqual({ readOnlyHint: true });
      } else {
        expect(tool.annotations).toBeUndefined();
      }
    }
  });
});
