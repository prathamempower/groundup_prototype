"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-body font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-b from-primary to-primary-hover text-white hover:brightness-105 active:brightness-95 shadow-sm border border-primary/20",
        secondary:
          "bg-surface text-text-primary border border-border hover:border-border-strong hover:bg-subtle active:bg-subtle/80 shadow-xs",
        tertiary:
          "text-primary hover:bg-primary-subtle hover:text-primary-hover active:bg-primary-subtle/80",
        destructive:
          "bg-gradient-to-b from-danger to-danger/90 text-white hover:brightness-105 active:brightness-95 shadow-xs border border-danger/30",
        outline:
          "border border-border bg-surface text-text-primary hover:bg-subtle hover:border-border-strong active:bg-subtle/80 shadow-xs",
        ghost:
          "text-text-secondary hover:bg-subtle hover:text-text-primary",
      },
      size: {
        default: "h-9 px-4 py-2", // 36px
        sm: "h-8 px-3 text-caption", // 32px
        lg: "h-10 px-6 text-body", // 40px (touch)
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading = false, loading = false, children, disabled, ...props }, ref) => {
    const isSpinnerActive = isLoading || loading;
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isSpinnerActive}
        {...props}
      >
        {isSpinnerActive && <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
