"use client";

import { create } from "zustand";

export type WebMcpStatus =
  | "unknown"
  | "unsupported"
  | "disabled"
  | "registered"
  | "blocked";

export type WebMcpActivityEntry = {
  name: string;
  outcome: "ok" | "failed";
  at: number;
};

// Activity entries carry tool name, outcome, and time only. Arguments and
// results are never stored so nameplate text and customer data stay out of
// the UI (AGENTS.md §6).
const WEBMCP_ACTIVITY_LIMIT = 10;

type WorkspaceUiState = {
  printDialogOpen: boolean;
  setPrintDialogOpen: (open: boolean) => void;
  webMcpStatus: WebMcpStatus;
  webMcpRegisteredCount: number;
  webMcpActivity: WebMcpActivityEntry[];
  setWebMcpStatus: (status: WebMcpStatus, registeredCount: number) => void;
  recordWebMcpActivity: (entry: WebMcpActivityEntry) => void;
};

export const useWorkspaceUiStore = create<WorkspaceUiState>()((set) => ({
  printDialogOpen: false,
  setPrintDialogOpen: (printDialogOpen) => set({ printDialogOpen }),
  webMcpStatus: "unknown",
  webMcpRegisteredCount: 0,
  webMcpActivity: [],
  setWebMcpStatus: (webMcpStatus, webMcpRegisteredCount) =>
    set({ webMcpStatus, webMcpRegisteredCount }),
  recordWebMcpActivity: (entry) =>
    set((state) => ({
      webMcpActivity: [entry, ...state.webMcpActivity].slice(
        0,
        WEBMCP_ACTIVITY_LIMIT,
      ),
    })),
}));
