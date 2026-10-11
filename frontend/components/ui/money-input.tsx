"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface MoneyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value?: number | string | null; // Cents (minor units) or dollar value string
  onChange?: (cents: number) => void;
  currency?: string;
  hasError?: boolean;
}

export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  (
    {
      className,
      value,
      onChange,
      currency = "$",
      hasError = false,
      disabled,
      placeholder = "0.00",
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = React.useState<string>("");

    // Synchronize external value (cents) to formatted display
    React.useEffect(() => {
      if (value === null || value === undefined || value === "") {
        setDisplayValue("");
        return;
      }
      const numCents = typeof value === "string" ? parseFloat(value) : value;
      if (isNaN(numCents)) {
        setDisplayValue("");
        return;
      }
      const dollars = (numCents / 100).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      setDisplayValue(dollars);
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9.]/g, "");
      const parts = raw.split(".");
      let formattedRaw = parts[0];
      if (parts.length > 1) {
        formattedRaw += "." + parts[1].slice(0, 2);
      }
      setDisplayValue(formattedRaw);

      if (onChange) {
        const dollars = parseFloat(formattedRaw);
        if (!isNaN(dollars)) {
          onChange(Math.round(dollars * 100));
        } else {
          onChange(0);
        }
      }
    };

    const handleBlur = () => {
      if (!displayValue) return;
      const dollars = parseFloat(displayValue.replace(/,/g, ""));
      if (!isNaN(dollars)) {
        setDisplayValue(
          dollars.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      }
    };

    return (
      <div className="relative flex items-center">
        <span className="pointer-events-none absolute left-3 select-none text-body font-medium text-text-secondary">
          {currency}
        </span>
        <input
          type="text"
          inputMode="decimal"
          ref={ref}
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "flex h-9 w-full rounded-md border bg-surface pl-7 pr-3 py-1.5 text-right font-sans text-body tabular-nums text-text-primary placeholder:text-text-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-subtle disabled:opacity-50",
            hasError
              ? "border-danger focus-visible:ring-danger"
              : "border-border hover:border-border-strong focus:border-primary",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
MoneyInput.displayName = "MoneyInput";
