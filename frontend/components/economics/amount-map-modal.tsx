"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalContent,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import {
  Search,
  Check,
  Copy,
  FileText,
  FileSpreadsheet,
  Users,
  Landmark,
  Coins,
  Building,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AmountBreakdownItem {
  id: string;
  code?: string;
  name: string;
  payeeOrVendor?: string;
  source?: string;
  amountCents: number;
  pctOfTotal: number;
  status: "Verified" | "Paid" | "Disbursed" | "Committed" | "In Review" | "Baseline Approved";
  statusColor?: string;
  date?: string;
  notes?: string;
}

export interface AmountAuditEntry {
  action: string;
  by: string;
  timestamp: string;
  note: string;
}

export interface AmountMapDetail {
  id: string;
  title: string;
  subtitle?: string;
  amountCents: number;
  category: "budget" | "cost" | "variance" | "funding_equity" | "funding_debt" | "capital_stack" | "line_item";
  sourceDocument: {
    name: string;
    type: string;
    section?: string;
    date?: string;
  };
  reconciliationStatus: "100% Reconciled" | "Pending Review" | "Underwritten Baseline" | "Active Draw Allocation" | "Verified in Bank Statement";
  summaryDescription: string;
  breakdown: AmountBreakdownItem[];
  auditTrail?: AmountAuditEntry[];
  solvencyContext?: {
    totalCommitmentCents?: number;
    incurredCostsCents?: number;
    bufferCents?: number;
  };
}

interface AmountMapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detail: AmountMapDetail | null;
}

export function AmountMapModal({
  open,
  onOpenChange,
  detail,
}: AmountMapModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  if (!detail) return null;

  const isNegative = detail.amountCents < 0;
  const absAmountCents = Math.abs(detail.amountCents);

  // Filter breakdown items
  const filteredItems = detail.breakdown.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.payeeOrVendor && item.payeeOrVendor.toLowerCase().includes(q)) ||
      (item.code && item.code.toLowerCase().includes(q))
    );
  });

  const handleCopy = () => {
    const text = `${detail.title}: ${isNegative ? "-" : ""}${formatMoney(absAmountCents)}\n` +
      detail.breakdown
        .map((b) => `${b.name}: ${formatMoney(Math.abs(b.amountCents))} (${b.pctOfTotal}%)`)
        .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getItemBadge = (status: AmountBreakdownItem["status"]) => {
    switch (status) {
      case "In Review":
        return "bg-amber-50 text-amber-800 border-amber-200/70";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200/80";
    }
  };

  // Clean, short title
  const cleanTitle = (detail.title || "")
    .replace("Baseline (Approved PDF)", "")
    .replace("(Workbook General Ledger)", "")
    .replace("Detailed Map", "")
    .replace("Cost Breakdown", "")
    .replace("Breakdown", "")
    .replace("Map", "")
    .replace(/ - /g, " • ")
    .trim();

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0 rounded-xl bg-white border border-slate-200 shadow-xl">
        {/* Header - Clean, spacious, with safe right margin for X button */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-start justify-between gap-6">
          <div className="space-y-0.5">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              {cleanTitle}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              {detail.breakdown.length} line items
            </p>
          </div>

          {/* Right Amount: pr-8 ensures no collision with top-right close icon */}
          <div className="text-right pr-8 shrink-0">
            <p
              className={cn(
                "text-2xl font-bold tabular-nums tracking-tight",
                isNegative ? "text-rose-600" : "text-slate-900"
              )}
            >
              {isNegative ? `-${formatMoney(absAmountCents)}` : formatMoney(absAmountCents)}
            </p>
          </div>
        </div>

        {/* Search Bar - only shown when more than 4 items */}
        {detail.breakdown.length > 4 && (
          <div className="px-6 py-2 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1 text-xs rounded-md border border-slate-200 bg-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>
        )}

        {/* Table Body - Clean, spacious, scannable */}
        <div className="flex-1 overflow-y-auto px-6 py-3">
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-medium bg-slate-50/80">
                  <th className="text-left py-2 px-3">Item</th>
                  <th className="text-left py-2 px-2.5">Code</th>
                  <th className="text-right py-2 px-3">Amount</th>
                  <th className="text-right py-2 px-2.5">Share</th>
                  <th className="text-center py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => {
                  const isNegativeItem = item.amountCents < 0;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-900 leading-snug">
                          {item.name}
                        </div>
                        {item.payeeOrVendor && (
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {item.payeeOrVendor}
                          </div>
                        )}
                        <div className="mt-1 text-[10.5px] text-slate-400 flex items-center gap-1">
                          <span className="text-slate-400 font-medium">Source:</span>
                          <span className="text-slate-600 font-normal truncate max-w-[260px] sm:max-w-[340px]">
                            {item.source || detail.sourceDocument.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2.5 font-mono text-[11px] text-slate-500">
                        {item.code || "—"}
                      </td>
                      <td
                        className={cn(
                          "py-2.5 px-3 text-right font-semibold tabular-nums",
                          isNegativeItem ? "text-rose-600" : "text-slate-900"
                        )}
                      >
                        {isNegativeItem
                          ? `-${formatMoney(Math.abs(item.amountCents))}`
                          : formatMoney(item.amountCents)}
                      </td>
                      <td className="py-2.5 px-2.5 text-right tabular-nums text-slate-500">
                        {item.pctOfTotal > 0 ? `${item.pctOfTotal}%` : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={cn(
                            "inline-block px-2 py-0.5 rounded text-[10px] font-medium border",
                            getItemBadge(item.status)
                          )}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No matching items
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200 font-semibold text-slate-900 bg-slate-50/60">
                  <td className="py-2.5 px-3">Total</td>
                  <td className="py-2.5 px-2.5 text-slate-400 font-normal">
                    {filteredItems.length} items
                  </td>
                  <td
                    className={cn(
                      "py-2.5 px-3 text-right tabular-nums font-bold",
                      isNegative ? "text-rose-600" : "text-slate-900"
                    )}
                  >
                    {isNegative ? `-${formatMoney(absAmountCents)}` : formatMoney(absAmountCents)}
                  </td>
                  <td className="py-2.5 px-2.5 text-right tabular-nums">100%</td>
                  <td className="py-2.5 px-3 text-center text-slate-400">—</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Clean action footer */}
        <div className="px-6 py-2.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-7 text-xs px-2.5 bg-white text-slate-600 hover:bg-slate-50 border-slate-200 rounded-md"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-600 mr-1" /> : <Copy className="h-3 w-3 text-slate-400 mr-1" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-7 px-3 text-xs bg-white text-slate-700 hover:bg-slate-50 border-slate-200 rounded-md font-medium"
          >
            Close
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
