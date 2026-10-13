"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-xs font-semibold tracking-normal transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.985] cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-xs hover:from-blue-500 hover:to-blue-600 hover:shadow-sm active:from-blue-700 active:to-blue-800 border border-blue-700/40",
        secondary:
          "bg-white text-slate-800 border border-slate-200/90 shadow-2xs hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 active:bg-slate-100",
        tertiary:
          "bg-blue-50 text-blue-700 border border-blue-200/70 hover:bg-blue-100/90 hover:text-blue-800 active:bg-blue-200/80 shadow-2xs",
        destructive:
          "bg-gradient-to-b from-rose-600 to-rose-700 text-white shadow-xs hover:from-rose-500 hover:to-rose-600 active:from-rose-700 active:to-rose-800 border border-rose-700/40",
        outline:
          "border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 shadow-2xs active:bg-slate-100",
        ghost:
          "text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200/70",
        success:
          "bg-gradient-to-b from-emerald-600 to-emerald-700 text-white shadow-xs hover:from-emerald-500 hover:to-emerald-600 active:from-emerald-700 active:to-emerald-800 border border-emerald-700/40",
      },
      size: {
        default: "h-9 px-4 py-2 text-xs",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-5 text-sm",
        icon: "h-8.5 w-8.5",
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