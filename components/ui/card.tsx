import type { HTMLAttributes } from "react";

import { cn } from "@/lib/class-names";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--gray-200)] bg-[var(--surface)] shadow-[var(--card-shadow)] transition-[box-shadow,transform] duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pb-3", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pt-2", className)} {...props} />;
}
