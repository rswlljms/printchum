"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ComponentProps } from "react";

import { cn } from "@/lib/class-names";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({
  className,
  sideOffset = 6,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "font-technical z-50 rounded-md bg-[var(--ink)] px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-[var(--inverted-ink)]",
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}
