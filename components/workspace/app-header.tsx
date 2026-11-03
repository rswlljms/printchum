"use client";

import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/workspace/theme-toggle";
import { WebMcpBadge } from "@/components/workspace/webmcp-badge";
import { WorkspaceModeSwitcher } from "@/components/workspace/workspace-mode-switcher";

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 grid items-center gap-x-6 gap-y-3 border-b border-[var(--gray-200)] bg-[var(--background)] px-4 py-3 sm:grid-cols-[1fr_auto] sm:px-6 lg:h-18 lg:grid-cols-[auto_1fr_auto] lg:py-0">
      <h1 className="font-display text-lg uppercase text-[var(--ink)] sm:col-span-2 lg:col-span-1">
        PrintChum Workspace
      </h1>
      <WorkspaceModeSwitcher />
      <div className="flex items-center gap-3 sm:gap-4">
        {pathname === "/" ? <WebMcpBadge /> : null}
        <ThemeToggle />
      </div>
    </header>
  );
}
