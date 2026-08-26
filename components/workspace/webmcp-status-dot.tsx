"use client";

import { Bot } from "lucide-react";

import { cn } from "@/lib/class-names";

// Monochrome status indicator with the agent glyph from the WebMCP reference.
// Active state fills with ink and inverts the icon; inactive stays gray.
export function WebMcpStatusDot({
  active,
  className,
}: {
  active: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-full",
        active ? "bg-[var(--ink)]" : "bg-[var(--gray-300)]",
        className,
      )}
    >
      <Bot
        className={cn(
          "size-2.5",
          active ? "text-[var(--inverted-ink)]" : "text-[var(--gray-500)]",
        )}
      />
    </span>
  );
}
