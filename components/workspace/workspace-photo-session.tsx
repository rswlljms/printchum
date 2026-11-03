"use client";

import { useEffect } from "react";

import { useEditorStore } from "@/stores/editor-store";

export function WorkspacePhotoSession() {
  useEffect(() => {
    const { restoreWorkspaceSession, disposeSourcePhoto } = useEditorStore.getState();
    restoreWorkspaceSession();

    // The shared workspace owns the photo lifetime so mode navigation keeps it local and live.
    window.addEventListener("beforeunload", disposeSourcePhoto);
    return () => {
      window.removeEventListener("beforeunload", disposeSourcePhoto);
      disposeSourcePhoto();
    };
  }, []);

  return null;
}
