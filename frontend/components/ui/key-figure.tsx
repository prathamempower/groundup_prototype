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
  showBasis?: boolean;
  className?: string;
}

export function KeyFigure({
  label,
  value,
  basis,
  variance,
  progress,
  citations,
  showBasis = false,
  className,
}: KeyFigureProps) {
  const percentUsed = progress && progress.max > 0
    ? Math.min(100, Math.max(0, Math.round((progress.current / progress.max) * 100)))
    : null;

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs transition-all duration-200 hover:border-slate-300 hover:shadow-xs",
        className
      )}
    >
      {/* Label and Sources link */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px]">{label}</span>
        <SourcesButton
          figureLabel={label}
          amountOrValue={value}
          basis={basis}
          citations={citations}
        />
      </div>

      {/* Main KPI Value */}
      <div className="mt-2 text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
        {value}
      </div>

      {/* Variance from Baseline / Comparison */}
      {variance && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold border",
              variance.isFavorable
                ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                : "bg-red-50 text-red-700 border-red-200/60"
            )}
          >
            {variance.isFavorable ? (
              <ArrowUpRight className="h-3 w-3 stroke-[2.5]" />
            ) : (
              <ArrowDownRight className="h-3 w-3 stroke-[2.5]" />
            )}
            <span>
              {variance.formattedAmount}
              {variance.percentage !== undefined && ` (${variance.percentage > 0 ? "+" : ""}${variance.percentage}%)`}
            </span>
          </span>
          <span className="text-slate-400 text-[11px]">
            {variance.comparisonLabel || "vs baseline"}
          </span>
        </div>
      )}

      {/* Progress track if provided */}
      {percentUsed !== null && (
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>{progress?.label || "Progress"}</span>
            <span className="font-semibold text-slate-900 tabular-nums">{percentUsed}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                percentUsed > 85 ? "bg-amber-500" : "bg-blue-600"
              )}
              style={{ width: `${percentUsed}%` }}
            />
          </div>
        </div>
      )}

      {/* Optional Basis Line */}
      {showBasis && (
        <div
          className="mt-3 text-[11px] text-slate-400 border-t border-slate-100 pt-2"
          title={basis}
        >
          <span className="font-medium text-slate-500">Basis:</span> {basis || "Not documented"}
        </div>
      )}
    </div>
  );
}
