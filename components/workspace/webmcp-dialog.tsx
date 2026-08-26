"use client";

import { CodeXml } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  editorToolCatalog,
  type EditorToolCatalogEntry,
} from "@/features/editor/webmcp/tool-catalog";
import { useWorkspaceUiStore } from "@/stores/workspace-ui-store";

import { WebMcpStatusDot } from "./webmcp-status-dot";

const TRY_ASKING_PROMPTS = [
  "Set up A4 with eight 2 × 2 photos and a 5 mm margin.",
  "Apply my school ID service set, then show me page two.",
  "Add passport photos with a nameplate reading Jamie Cruz and ID 2026-0417.",
  "Make the background solid white, then export the PDF.",
];

const TOOL_GROUPS: Array<{
  id: string;
  title: string;
  names: readonly string[];
}> = [
  {
    id: "inspect",
    title: "Inspect layout",
    names: [
      "get-editor-summary",
      "list-paper-presets",
      "list-photo-size-presets",
      "list-service-sets",
      "list-nameplate-presets",
    ],
  },
  {
    id: "configure",
    title: "Configure layout",
    names: [
      "configure-paper",
      "add-photo-size",
      "update-photo-size",
      "remove-photo-size",
      "apply-service-set",
      "configure-nameplate",
      "set-preview-page",
      "set-background",
      "set-crop-mode",
    ],
  },
  {
    id: "output",
    title: "Save & print",
    names: ["save-service-set", "export-pdf", "open-print-dialog"],
  },
];

function groupEntries(names: readonly string[]): EditorToolCatalogEntry[] {
  return names.map((name) => {
    const entry = editorToolCatalog.find((candidate) => candidate.name === name);
    if (!entry) {
      throw new Error(`Tool "${name}" is grouped but missing from the catalog.`);
    }
    return entry;
  });
}

function formatRelativeTime(timestamp: number, now: number): string {
  const seconds = Math.max(0, Math.round((now - timestamp) / 1000));
  if (seconds < 10) {
    return "just now";
  }
  if (seconds < 60) {
    return `${seconds}s ago`;
  }
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  return `${Math.round(minutes / 60)}h ago`;
}

function statusCopy(status: string, registeredCount: number) {
  if (status === "registered") {
    return {
      label: "Tools are available",
      detail:
        "Compatible agents can discover and use these tools while this page is open.",
      count: `${registeredCount} available`,
      active: true,
    };
  }
  if (status === "blocked") {
    return {
      label: "Blocked by permissions policy",
      detail:
        "This page's permissions policy prevents agent tool registration.",
      count: "0 available",
      active: false,
    };
  }
  if (status === "disabled") {
    return {
      label: "Agent tools are turned off",
      detail:
        "WebMCP has been temporarily disabled in this deployment of PrintChum.",
      count: "0 available",
      active: false,
    };
  }
  return {
    label: "Not available in this browser",
    detail:
      "Open PrintChum in a WebMCP browser such as ChatGPT's in-app browser, or enable chrome://flags/#enable-webmcp-testing in Chrome.",
    count: "0 available",
    active: false,
  };
}

function ToolRow({ entry }: { entry: EditorToolCatalogEntry }) {
  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <span
        aria-hidden="true"
        className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border border-[var(--gray-200)] text-[var(--gray-500)]"
      >
        <CodeXml className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <code className="font-technical text-xs text-[var(--ink)]">
            {entry.name}
          </code>
          {entry.readOnly ? (
            <Badge variant="secondary">Read only</Badge>
          ) : null}
        </div>
        <p className="mt-0.5 truncate text-xs leading-5 text-[var(--gray-500)]">
          {entry.summary}
        </p>
      </div>
    </li>
  );
}

export function WebMcpDialogContent({ viewedAt }: { viewedAt: number }) {
  const status = useWorkspaceUiStore((state) => state.webMcpStatus);
  const registeredCount = useWorkspaceUiStore(
    (state) => state.webMcpRegisteredCount,
  );
  const activity = useWorkspaceUiStore((state) => state.webMcpActivity);

  const statusInfo = statusCopy(status, registeredCount);
  const readOnlyCount = editorToolCatalog.filter(
    (entry) => entry.readOnly,
  ).length;

  return (
    <DialogContent className="max-w-2xl space-y-5" aria-describedby={undefined}>
      <DialogHeader>
        <p className="micro-label uppercase">Built for your agent</p>
        <DialogTitle>WebMCP</DialogTitle>
        <DialogDescription>
          Structured layout tools that compatible AI agents can discover and
          use.
        </DialogDescription>
      </DialogHeader>

      <section aria-labelledby="webmcp-what" className="space-y-2">
        <h3 id="webmcp-what" className="text-sm font-semibold text-[var(--ink)]">
          What is WebMCP?
        </h3>
        <p className="text-sm leading-6 text-[var(--gray-500)]">
          WebMCP lets websites expose clear, structured actions to AI agents.
          Here, those actions let an agent configure your photo layout
          directly in this browser while the page is open.
        </p>
      </section>

      <section
        aria-label="Tool availability"
        className="flex items-center justify-between gap-3 rounded-xl border border-[var(--gray-200)] bg-[var(--gray-50)] px-4 py-3.5"
      >
        <div className="flex items-start gap-2.5">
          <WebMcpStatusDot
            active={statusInfo.active}
            className="mt-0.5"
          />
          <div>
            <p className="text-sm font-medium text-[var(--ink)]">
              {statusInfo.label}
            </p>
            <p className="mt-1 text-xs leading-5 text-[var(--gray-500)]">
              {statusInfo.detail}
            </p>
          </div>
        </div>
        <span className="micro-label shrink-0 uppercase">
          {statusInfo.count}
        </span>
      </section>

      <p className="text-xs leading-5 text-[var(--gray-500)]">
        Tools change layout settings only. Your photo stays in this browser,
        and agents never receive image data.
      </p>

      <section aria-label="WebMCP tools" className="space-y-2">
        <Accordion type="multiple" className="space-y-2.5">
          {TOOL_GROUPS.map((group) => {
            const entries = groupEntries(group.names);
            return (
              <AccordionItem key={group.id} value={group.id}>
                <AccordionTrigger aria-label={`${group.title}, ${entries.length} tools`}>
                  <span className="text-sm font-medium text-[var(--ink)]">
                    {group.title}
                  </span>
                  <span className="micro-label uppercase">
                    {entries.length} tools
                    {entries.every((entry) => entry.readOnly)
                      ? " · read only"
                      : ""}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="divide-y divide-[var(--gray-100)]">
                    {entries.map((entry) => (
                      <ToolRow key={entry.name} entry={entry} />
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
        <p className="micro-label px-1 uppercase">
          {editorToolCatalog.length} tools · {readOnlyCount} read only
        </p>
      </section>

      <section aria-labelledby="webmcp-try-asking" className="space-y-2">
        <h3
          id="webmcp-try-asking"
          className="micro-label uppercase text-[var(--gray-500)]"
        >
          Try asking
        </h3>
        <ul className="space-y-2">
          {TRY_ASKING_PROMPTS.map((prompt) => (
            <li
              key={prompt}
              className="rounded-lg border border-[var(--gray-200)] px-3.5 py-2.5 text-xs leading-5 text-[var(--gray-600)]"
            >
              “{prompt}”
            </li>
          ))}
        </ul>
      </section>

      {activity.length > 0 ? (
        <section aria-labelledby="webmcp-activity" className="space-y-2">
          <h3
            id="webmcp-activity"
            className="micro-label uppercase text-[var(--gray-500)]"
          >
            Recent agent activity
          </h3>
          <ul className="space-y-1.5">
            {activity.map((entry, index) => (
              <li
                key={`${entry.name}-${entry.at}-${index}`}
                className="flex items-center justify-between gap-3 text-xs text-[var(--gray-600)]"
              >
                <code className="font-technical text-[var(--ink)]">
                  {entry.name}
                </code>
                <span className="flex items-center gap-2">
                  <span>{entry.outcome === "ok" ? "ok" : "failed"}</span>
                  <span className="text-[var(--gray-400)]">
                    {formatRelativeTime(entry.at, viewedAt)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </DialogContent>
  );
}
