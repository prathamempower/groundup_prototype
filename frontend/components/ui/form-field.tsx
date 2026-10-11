import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
  label?: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  required,
  helperText,
  error,
  htmlFor,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-label font-medium text-text-primary flex items-center justify-between"
        >
          <span>{label}</span>
          {required && (
            <span className="text-caption text-text-secondary font-normal">
              (Required)
            </span>
          )}
        </label>
      )}

      {children}

      {error ? (
        <p className="flex items-center gap-1.5 text-caption text-danger" role="alert">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-caption text-text-muted">{helperText}</p>
      ) : null}
    </div>
  );
}
