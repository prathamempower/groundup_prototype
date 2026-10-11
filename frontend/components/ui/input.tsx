import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", hasError = false, disabled, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border bg-surface px-3 py-1.5 text-body text-text-primary placeholder:text-text-muted shadow-xs transition-all duration-150 file:border-0 file:bg-transparent file:text-caption file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:border-primary disabled:cursor-not-allowed disabled:bg-subtle disabled:opacity-50",
          hasError
            ? "border-danger focus-visible:ring-danger"
            : "border-border hover:border-border-strong",
          className
        )}
        ref={ref}
        disabled={disabled}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
