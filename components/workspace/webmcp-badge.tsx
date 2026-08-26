"use client";

import { useState } from "react";

import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useWorkspaceUiStore } from "@/stores/workspace-ui-store";

import { WebMcpDialogContent } from "./webmcp-dialog";
import { WebMcpStatusDot } from "./webmcp-status-dot";

function badgeLabel(status: string, registeredCount: number): string {
  if (status === "registered" && registeredCount > 0) {
    return `WebMCP · ${registeredCount} tools`;
  }
  return "WebMCP";
}

export function WebMcpBadge() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewedAt, setViewedAt] = useState(0);
  const status = useWorkspaceUiStore((state) => state.webMcpStatus);
  const registeredCount = useWorkspaceUiStore(
    (state) => state.webMcpRegisteredCount,
  );

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          setViewedAt(Date.now());
        }
        setDialogOpen(nextOpen);
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="View WebMCP agent tools"
          className={`flex h-8 items-center gap-2 rounded-full border border-[var(--gray-300)] pl-2 pr-3 transition-colors duration-150 hover:bg-[var(--gray-100)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] ${
            status === "registered"
              ? "text-[var(--ink)]"
              : "text-[var(--gray-500)]"
          }`}
        >
          <WebMcpStatusDot active={status === "registered"} />
          <span className="micro-label uppercase">
            {badgeLabel(status, registeredCount)}
          </span>
        </button>
      </DialogTrigger>
      <WebMcpDialogContent viewedAt={viewedAt} />
    </Dialog>
  );
}
