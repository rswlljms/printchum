import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/class-names";

const badgeVariants = cva(
  "font-technical inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.1em]",
  {
    variants: {
      variant: {
        default:
          "border-[var(--ink)] bg-[var(--ink)] text-[var(--inverted-ink)]",
        secondary:
          "border-[var(--gray-300)] bg-transparent text-[var(--gray-600)]",
        success:
          "border-[var(--gray-300)] bg-[var(--gray-50)] text-[var(--ink)]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
