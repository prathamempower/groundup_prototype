"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface NativeSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  hasError?: boolean;
  sizeVariant?: "sm" | "md";
  containerClassName?: string;
}

const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  (
    {
      className,
      children,
      label,
      helperText,
      hasError = false,
      sizeVariant = "md",
      containerClassName,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;

    return (
      <div className={cn("w-full space-y-1.5 text-left", containerClassName)}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={cn(
              "w-full rounded-xl border bg-white text-slate-800 placeholder:text-slate-400 shadow-2xs font-medium cursor-pointer transition-all duration-150 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-50",
              sizeVariant === "sm"
                ? "h-8 px-2.5 text-xs"
                : "h-9 px-3 py-1.5 text-xs sm:text-[13px]",
              hasError
                ? "border-rose-300 bg-rose-50/20 text-rose-950 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20"
                : "border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/30 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none",
              className
            )}
            {...props}
          >
            {children}
          </select>
        </div>
        {helperText && (
          <p
            className={cn(
              "text-[11px]",
              hasError ? "text-rose-600 font-medium" : "text-slate-500"
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
NativeSelect.displayName = "NativeSelect";

export { NativeSelect };
