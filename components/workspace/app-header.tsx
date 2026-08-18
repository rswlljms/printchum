"use client";

import { KofiButton } from "@/components/workspace/kofi-button";
import { ThemeToggle } from "@/components/workspace/theme-toggle";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-18 items-center justify-between gap-4 border-b border-[var(--gray-200)] bg-[color-mix(in_srgb,var(--background)_92%,transparent)] px-4 backdrop-blur-md sm:px-6">
      <div className="flex flex-col justify-center">
        <h1 className="font-display text-lg uppercase text-[var(--ink)]">
          PrintChum Workspace
        </h1>
        <p className="micro-label mt-0.5 hidden whitespace-nowrap sm:block">
          Developed by Roswell James Vitaliz
        </p>
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        <KofiButton />
        <ThemeToggle />
      </div>
    </header>
  );
}
