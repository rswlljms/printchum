import { describe, expect, it } from "vitest";

import {
  EDITOR_WORKSPACE_SESSION_VERSION,
  createPersistedEditorWorkspace,
  parseEditorWorkspaceSessionStorage,
  parsePersistedEditorWorkspace,
} from "@/features/editor/workspace-session";
import type { EditorState } from "@/features/editor/types";
import { useEditorStore } from "@/stores/editor-store";

describe("editor workspace session persistence", () => {
  it("persists only the explicit non-photo workspace allowlist", () => {
    useEditorStore.getState().resetEditor();
    useEditorStore.getState().addPhotoSizeFromPreset("2x2");
    useEditorStore.getState().setPaperPreset("a4");

    const state = useEditorStore.getState();
    const persisted = createPersistedEditorWorkspace(state);
    const serialized = JSON.stringify(persisted);

    expect(persisted.photoSizes).toHaveLength(1);
    expect(persisted.paper.presetId).toBe("a4");
    expect(parsePersistedEditorWorkspace(persisted)?.paper.presetId).toBe(
      "a4",
    );
    expect(
      parseEditorWorkspaceSessionStorage(
        JSON.stringify({
          state: persisted,
          version: EDITOR_WORKSPACE_SESSION_VERSION,
        }),
      ),
    ).not.toBeNull();
    expect(serialized).not.toContain("sourceFile");
    expect(serialized).not.toContain("sourceObjectUrl");
    expect(serialized).not.toContain('"crop"');
    expect(serialized).not.toContain("primaryText");
    expect(serialized).not.toContain("secondaryText");
    expect(serialized).not.toContain("layoutResult");
  });

  it("validates restored paper and rejects malformed session state", () => {
    useEditorStore.getState().resetEditor();
    const persisted = createPersistedEditorWorkspace(
      useEditorStore.getState(),
    );

    expect(parsePersistedEditorWorkspace(persisted)).not.toBeNull();
    expect(
      parsePersistedEditorWorkspace({
        ...persisted,
        paper: {
          ...persisted.paper,
          margin: Number.POSITIVE_INFINITY,
        },
      }),
    ).toBeNull();
  });

  it("rejects duplicate custom preset IDs from external session data", () => {
    useEditorStore.getState().resetEditor();
    const state = useEditorStore.getState();
    const customPreset = {
      id: "custom-paper-restored",
      presetId: null,
      name: "Restored paper",
      width: 6,
      height: 8,
      unit: "in" as const,
      orientation: "portrait" as const,
      margin: 0.25,
      horizontalSpacing: 0.1,
      verticalSpacing: 0.1,
      cuttingGuidesEnabled: true,
      sizeLabelsEnabled: false,
      allowPhotoRotation: false,
      autoArrangeMode: "auto" as const,
      createdAt: "2026-07-26T00:00:00.000Z",
      updatedAt: "2026-07-26T00:00:00.000Z",
    };
    const persisted = createPersistedEditorWorkspace({
      ...state,
      customPaperPresets: [customPreset, customPreset],
    } as EditorState);

    expect(parsePersistedEditorWorkspace(persisted)).toBeNull();
  });
});
