"use client";

import React from "react";
import { formatMoney } from "@/lib/format";
import { CheckCircle2 } from "lucide-react";

interface ContingencyBreakdownCardProps {
  hardCostCents?: number;
  softCostCents?: number;
  onMoveContingency?: () => void;
}

export function ContingencyBreakdownCard({
  hardCostCents = 5000000, // $50,000.00
  softCostCents = 3247000, // $32,470.00
}: ContingencyBreakdownCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-900">
            Contingency Allocation & Reserves
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Physical construction (hard costs) vs administrative & soft cost buffers
          </p>
        </div>

        {/* Progress Bars */}
        <div className="space-y-5">
          {/* Hard Cost */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">Hard Cost Contingency</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {formatMoney(String(hardCostCents))}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-600"
                style={{ width: "85%" }}
              />
            </div>
          </div>

          {/* Soft Cost */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">Soft Cost Contingency</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {formatMoney(String(softCostCents))}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: "55%" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Callout Notice */}
      <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
        <div className="flex items-start gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-semibold text-slate-900">
              No Pending Contingency Deductions
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              100% of reserves remain uncommitted and available for project exposure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
