"use client";

import React from "react";
import { ProFormaLineItem, DataBasis } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { SourcesButton } from "@/components/ui/source-panel";
import { ShieldCheck, Clock, FileText, HelpCircle } from "lucide-react";

interface ProFormaTableProps {
  lines: ProFormaLineItem[];
  isClosedProject: boolean;
}

export function ProFormaTable({ lines, isClosedProject }: ProFormaTableProps) {
  // Group lines by category
  const categories = [
    { key: "REVENUE", label: "Gross Revenues & Net Disposition Proceeds" },
    { key: "HARD_COST", label: "Direct Construction Hard Costs" },
    { key: "SOFT_COST", label: "Architecture, Engineering, Legal & Municipal Fees" },
    { key: "FINANCING", label: "Senior Debt Interest, Loan Fees & Carrying Exposure" },
  ];

  const getBasisBadge = (basis: DataBasis) => {
    switch (basis) {
      case "ACTUAL":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-success-subtle px-1.5 py-0.5 text-[10px] font-bold text-success">
            <ShieldCheck className="h-3 w-3" /> Actual Cleared
          </span>
        );
      case "COMMITTED":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-primary-subtle px-1.5 py-0.5 text-[10px] font-bold text-primary">
            <FileText className="h-3 w-3" /> Committed
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-blue-50 text-blue-700 px-1.5 py-0.5 text-[10px] font-bold">
            Approved Budget
          </span>
        );
      case "ESTIMATED":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-amber-50 text-amber-700 px-1.5 py-0.5 text-[10px] font-bold">
            <Clock className="h-3 w-3" /> Estimated
          </span>
        );
      case "MISSING":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-danger-subtle px-1.5 py-0.5 text-[10px] font-bold text-danger">
            <HelpCircle className="h-3 w-3" /> Incomplete
          </span>
        );
    }
  };

  return (
    <div className="rounded-lg border border-border bg-surface shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-body">
          <thead>
            <tr className="border-b border-border bg-subtle/50 text-caption font-semibold text-text-secondary">
              <th className="py-3 px-4">Pro Forma Line Item</th>
              <th className="py-3 px-4 text-center">Data Basis</th>
              <th className="py-3 px-4 text-right">Original Plan</th>
              <th className="py-3 px-4 text-right">Current Forecast</th>
              {isClosedProject && (
                <th className="py-3 px-4 text-right font-bold text-success">
                  Actual Cleared
                </th>
              )}
              <th className="py-3 px-4 text-right">Variance vs Baseline</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.map((cat) => {
              const catLines = lines.filter((l) => l.category === cat.key);
              if (catLines.length === 0) return null;

              const totalOriginal = catLines.reduce((acc, l) => acc + Number(l.original_plan_amount), 0);
              const totalForecast = catLines.reduce((acc, l) => acc + Number(l.current_forecast_amount), 0);
              const totalActual = catLines.reduce((acc, l) => acc + Number(l.actual_cleared_amount || 0), 0);
              const totalVariance = totalForecast - totalOriginal;

              return (
                <React.Fragment key={cat.key}>
                  {/* Category Header Row */}
                  <tr className="bg-subtle/30 font-semibold text-caption text-text-primary">
                    <td colSpan={isClosedProject ? 6 : 5} className="py-2.5 px-4 uppercase tracking-wider">
                      {cat.label}
                    </td>
                  </tr>

                  {/* Line Items */}
                  {catLines.map((line) => {
                    const varianceNum = Number(line.variance_amount);
                    const isFavorable =
                      line.category === "REVENUE" ? varianceNum >= 0 : varianceNum <= 0;

                    return (
                      <tr key={line.id} className="hover:bg-subtle/20 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-medium text-text-primary">{line.line_name}</div>
                          {line.variance_rationale && (
                            <div className="text-[11px] text-text-muted mt-0.5">
                              {line.variance_rationale}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center">
                          {getBasisBadge(line.basis)}
                        </td>

                        <td className="py-3 px-4 text-right tabular-nums text-text-secondary">
                          {formatMoney(line.original_plan_amount)}
                        </td>

                        <td className="py-3 px-4 text-right tabular-nums font-semibold text-text-primary">
                          {formatMoney(line.current_forecast_amount)}
                        </td>

                        {isClosedProject && (
                          <td className="py-3 px-4 text-right tabular-nums font-semibold text-success">
                            {formatMoney(line.actual_cleared_amount || "0")}
                          </td>
                        )}

                        <td className="py-3 px-4 text-right tabular-nums font-medium">
                          {varianceNum === 0 ? (
                            <span className="text-text-muted">$0.00</span>
                          ) : (
                            <span className={isFavorable ? "text-success" : "text-danger"}>
                              {varianceNum > 0 ? "+" : ""}
                              {formatMoney(line.variance_amount)}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Category Subtotal Row */}
                  <tr className="border-t border-b border-border bg-subtle/10 text-caption font-bold">
                    <td className="py-2.5 px-4 text-text-secondary">
                      Subtotal {cat.label.split(" ")[0]}
                    </td>
                    <td className="py-2.5 px-4"></td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-text-secondary">
                      {formatMoney(String(totalOriginal))}
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-text-primary">
                      {formatMoney(String(totalForecast))}
                    </td>
                    {isClosedProject && (
                      <td className="py-2.5 px-4 text-right tabular-nums text-success">
                        {formatMoney(String(totalActual))}
                      </td>
                    )}
                    <td className="py-2.5 px-4 text-right tabular-nums">
                      {totalVariance === 0 ? (
                        <span className="text-text-muted">$0.00</span>
                      ) : (
                        <span
                          className={
                            (cat.key === "REVENUE" && totalVariance >= 0) ||
                            (cat.key !== "REVENUE" && totalVariance <= 0)
                              ? "text-success"
                              : "text-danger"
                          }
                        >
                          {totalVariance > 0 ? "+" : ""}
                          {formatMoney(String(totalVariance))}
                        </span>
                      )}
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
