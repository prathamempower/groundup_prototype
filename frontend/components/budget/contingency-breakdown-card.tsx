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
  const totalContingency = hardCostCents + softCostCents;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Contingency Reserves
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Risk mitigation pools for unforeseen site conditions
            </p>
          </div>
          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
            100% Intact
          </span>
        </div>

        {/* Total Summary Row */}
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5 mb-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Active Reserve
            </span>
            <span className="font-mono text-xl font-bold text-slate-900 tabular-nums">
              {formatMoney(String(totalContingency), { showCents: false })}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-medium text-slate-500 block">Committed</span>
            <span className="font-mono text-sm font-semibold text-slate-400 tabular-nums">$0.00</span>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-4">
          {/* Hard Cost */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-xs bg-blue-600" />
                <span className="font-semibold text-slate-800">Hard Cost Contingency</span>
              </div>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {formatMoney(String(hardCostCents), { showCents: false })}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: "100%" }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Site & Structural Work Buffer</span>
              <span className="font-medium text-slate-600">$50,000 available</span>
            </div>
          </div>

          {/* Soft Cost */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-xs bg-emerald-600" />
                <span className="font-semibold text-slate-800">Soft Cost Contingency</span>
              </div>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {formatMoney(String(softCostCents), { showCents: false })}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all"
                style={{ width: "100%" }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Permitting & Engineering Buffer</span>
              <span className="font-medium text-slate-600">$32,470 available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Callout Notice */}
      <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
        <div className="flex items-start gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-semibold text-emerald-950">
              Zero Unfunded Exposure
            </h4>
            <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
              No change orders currently drawing against project contingency pools.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
