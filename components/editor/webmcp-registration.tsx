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
      if (result.disabled) {
        useWorkspaceUiStore.getState().setWebMcpStatus("disabled", 0);
      } else if (result.blocked) {
        useWorkspaceUiStore
          .getState()
          .setWebMcpStatus("blocked", result.registeredCount);
      } else if (result.registeredCount > 0) {
        useWorkspaceUiStore
          .getState()
          .setWebMcpStatus("registered", result.registeredCount);
      } else {
        useWorkspaceUiStore.getState().setWebMcpStatus("unsupported", 0);
      }
    });
    return () => {
      controller.abort();
      useWorkspaceUiStore.getState().setWebMcpStatus("unknown", 0);
    };
  }, []);

  return null;
}
