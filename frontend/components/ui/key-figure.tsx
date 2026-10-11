import * as React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { SourcesButton } from "./source-panel";
import { SourceCitation } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface KeyFigureProps {
  label: string;
  value: string;
  basis: string;
  variance?: {
    formattedAmount: string;
    percentage?: number;
    isFavorable?: boolean;
    comparisonLabel?: string;
  };
  progress?: {
    current: number;
    max: number;
    label?: string;
  };
  citations?: SourceCitation[];
  className?: string;
}

export function KeyFigure({
  label,
  value,
  basis,
  variance,
  progress,
  citations,
  className,
}: KeyFigureProps) {
  const percentUsed = progress && progress.max > 0
    ? Math.min(100, Math.max(0, Math.round((progress.current / progress.max) * 100)))
    : null;

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-gradient-to-br from-surface to-subtle/30 p-5 shadow-sm transition-all duration-200 hover:border-border-strong hover:shadow-md",
        className
      )}
    >
      {/* Label and Sources link */}
      <div className="flex items-center justify-between text-caption font-medium text-text-secondary">
        <span className="font-semibold text-text-secondary uppercase tracking-wider text-[11px]">{label}</span>
        <SourcesButton
          figureLabel={label}
          amountOrValue={value}
          basis={basis}
          citations={citations}
        />
      </div>

      {/* Main KPI Value */}
      <div className="mt-2 text-kpi font-bold tracking-tight text-text-primary tabular-nums">
        {value}
      </div>

      {/* Variance from Baseline / Comparison */}
      {variance && (
        <div className="mt-2 flex items-center gap-1.5 text-caption font-medium">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-caption font-semibold",
              variance.isFavorable
                ? "bg-success-subtle text-success border border-success/30"
                : "bg-danger-subtle text-danger border border-danger/30"
            )}
          >
            {variance.isFavorable ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            <span>
              {variance.formattedAmount}
              {variance.percentage !== undefined && ` (${variance.percentage > 0 ? "+" : ""}${variance.percentage}%)`}
            </span>
          </span>
          <span className="text-text-muted text-[11px]">
            {variance.comparisonLabel || "vs baseline"}
          </span>
        </div>
      )}

      {/* Progress track if provided */}
      {percentUsed !== null && (
        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-text-muted">
            <span>{progress?.label || "Progress"}</span>
            <span className="font-semibold text-text-primary tabular-nums">{percentUsed}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-subtle">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                percentUsed > 85 ? "bg-warning" : "bg-primary-accent"
              )}
              style={{ width: `${percentUsed}%` }}
            />
          </div>
        </div>
      )}

      {/* Basis Line */}
      <div
        className="mt-3 text-[11px] text-text-muted line-clamp-1 border-t border-border/60 pt-2"
        title={basis}
      >
        <span className="font-medium text-text-secondary">Basis:</span> {basis || "Incomplete: Basis not documented"}
      </div>
    </div>
  );
}
