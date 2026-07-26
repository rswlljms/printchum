import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/class-names";

const buttonVariants = cva(
  "font-technical inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-xs font-medium uppercase tracking-[0.08em] transition-[background-color,color,transform] duration-200 disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--ink)] text-[var(--inverted-ink)] hover:-translate-y-px hover:opacity-85",
        outline:
          "border border-[var(--gray-200)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--gray-50)]",
        ghost:
          "text-[var(--gray-600)] hover:bg-[var(--gray-100)] hover:text-[var(--ink)]",
        subtle:
          "border border-[var(--gray-300)] bg-[var(--gray-50)] text-[var(--ink)] hover:bg-[var(--gray-100)]",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 rounded-md px-3 text-[10px]",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot : "button";
    return (
      <Component
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
