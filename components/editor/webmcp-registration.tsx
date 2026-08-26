"use client";

import { useEffect } from "react";

import { registerEditorTools } from "@/features/editor/webmcp/register-editor-tools";
import { useWorkspaceUiStore } from "@/stores/workspace-ui-store";

export function WebMcpRegistration() {
  useEffect(() => {
    const controller = new AbortController();
    void registerEditorTools(controller.signal).then((result) => {
      // Ignore the result if unmount cleanup already aborted this attempt.
      if (controller.signal.aborted) {
        return;
      }
      if (result.status === "aborted") {
        return;
      }
      useWorkspaceUiStore
        .getState()
        .setWebMcpStatus(result.status, result.registeredCount);
    });
    return () => {
      controller.abort();
      useWorkspaceUiStore.getState().setWebMcpStatus("unknown", 0);
    };
  }, []);

  return null;
}
