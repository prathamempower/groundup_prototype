"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DateInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, hasError = false, disabled, value, onChange, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        <input
          type="date"
          ref={ref}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={cn(
            "flex h-9 w-full rounded-md border bg-surface px-3 py-1.5 text-body text-text-primary placeholder:text-text-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-subtle disabled:opacity-50",
            hasError
              ? "border-danger focus-visible:ring-danger"
              : "border-border hover:border-border-strong focus:border-primary",
            className
          )}
          {...props}
        />
        <CalendarIcon className="pointer-events-none absolute right-3 h-4 w-4 text-text-muted" />
      </div>
    );
  }
);
DateInput.displayName = "DateInput";
