"use client";

import { ThemeToggle } from "@/components/workspace/theme-toggle";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-18 items-center justify-between border-b border-[var(--gray-200)] bg-[color-mix(in_srgb,var(--background)_92%,transparent)] px-4 backdrop-blur-md sm:px-6">
      <h1 className="font-display text-lg uppercase text-[var(--ink)]">
        PrintChum Workspace
      </h1>
      <ThemeToggle />
    </header>
  );
}
