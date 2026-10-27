"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import {
  DollarSign,
  Building2,
  ArrowLeft,
  LayoutGrid,
  Table as TableIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import type { DrawItem } from "@/lib/types";
import {
  DRAW_REQUEST_FORM_ITEMS,
  DRAW_REQUEST_TOTALS,
  getDrawTasksByNumber,
} from "@/lib/data/draw-request-form-items";
import { VerifyWorkModal } from "@/components/draws/verify-work-modal";
import { VerifyCostModal } from "@/components/draws/verify-cost-modal";
import { RecordDecisionModal } from "@/components/draws/record-decision-modal";
import { AllocateFundingModal } from "@/components/draws/allocate-funding-modal";
import { ResubmitRevisionModal } from "@/components/draws/resubmit-revision-modal";

export default function DrawDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const projectId = (params?.projectId as string) || "";
  const drawId = (params?.drawId as string) || "";

  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [isVerifyWorkOpen, setIsVerifyWorkOpen] = useState(false);
  const [isVerifyCostOpen, setIsVerifyCostOpen] = useState(false);
  const [isRecordDecisionOpen, setIsRecordDecisionOpen] = useState(false);
  const [isAllocateFundingOpen, setIsAllocateFundingOpen] = useState(false);
  const [isResubmitRevisionOpen, setIsResubmitRevisionOpen] = useState(false);

  // Queries
  const { data: drawData, refetch } = useQuery({
    queryKey: ["draw", drawId],
    queryFn: () => api.draws.getById(drawId),
    enabled: Boolean(drawId),
  });

  const { data: drawsListData } = useQuery({
    queryKey: ["draws", projectId],
    queryFn: () => api.draws.list(projectId),
    enabled: Boolean(projectId),
  });

  // Authentic draw state matching user-provided Draw Request Form image
  const activeDraw: DrawItem | null = React.useMemo(() => {
    let base: DrawItem | null = null;
    if (drawData?.data) {
      base = drawData.data;
    } else {
      const fromList = (drawsListData?.data || []).find(
        (d) => d.id === drawId || String(d.draw_number) === drawId
      );
      if (fromList) {
        base = fromList;
      }
    }

    const drawNumMatch = drawId.match(/(\d+)/);
    const num = base?.draw_number || (drawNumMatch ? parseInt(drawNumMatch[1], 10) : 1);
    const resolvedLines =
      base?.lines && base.lines.length > 0 ? base.lines : getDrawTasksByNumber(num);
    const lineRequestedCents = resolvedLines.reduce(
      (acc, l) => acc + (parseInt(l.requested_amount || "0", 10) || 0),
      0
    );
    const lineApprovedCents = resolvedLines.reduce(
      (acc, l) => acc + (parseInt(l.approved_amount || "0", 10) || 0),
      0
    );
    const lineFundedCents = resolvedLines.reduce(
      (acc, l) => acc + (parseInt(l.funded_amount || "0", 10) || 0),
      0
    );

    if (!base) {
      return {
        id: drawId.startsWith("draw-") ? drawId : `draw-fallback-${num}`,
        project_id: projectId || "df16b577-3585-4fb0-a13a-ffadaca73e0f",
        loan_id: "loan-col-73",
        draw_number: num,
        status: num >= 4 ? "SUBMITTED" : "FUNDED",
        period_start: "2025-06-01",
        period_end: "2025-08-31",
        lender_name: "First National Bank Construction Lending",
        requested_amount: String(lineRequestedCents),
        recommended_amount: String(lineRequestedCents),
        approved_amount: String(lineApprovedCents),
        funded_amount: String(lineFundedCents),
        shortfall_amount: "0",
        lines: resolvedLines,
        conditions: [
          { id: "c1", title: "Lender Title Date-Down Endorsement", status: "SATISFIED", required_for: "Wire Clearance" },
          { id: "c2", title: "Subcontractor Lien Waivers Reconciled", status: "SATISFIED", required_for: "Disbursement" },
          { id: "c3", title: "Certificate of Occupancy for Final Clean-up Release", status: num === 4 ? "OPEN" : "SATISFIED", required_for: "Final Holdback" },
        ],
        packet_checklist: [
          { id: "p1", requirement: "AIA G702 / G703 Application for Payment", status: "COMPLETE", document_name: "G702_Signed.pdf" },
          { id: "p2", requirement: "Transaction Bank Statement Cleared Expenses", status: "COMPLETE", document_name: "BCB_Operating_Stmt.pdf" },
          { id: "p3", requirement: "Draw Bank Loan Wire Confirmation", status: "COMPLETE", document_name: "CRT_Wire_Receipt.pdf" },
        ],
      };
    }

    return {
      ...base,
      requested_amount: base.requested_amount || String(lineRequestedCents),
      approved_amount: base.approved_amount || String(lineApprovedCents),
      funded_amount: base.funded_amount || String(lineFundedCents),
      lines: resolvedLines,
    };
  }, [drawData, drawsListData, drawId, projectId]);

  const refreshAll = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["draws", projectId] });
  };

  if (!activeDraw) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-900 border-t-transparent mx-auto" />
        <p className="mt-3 text-xs text-slate-500">Loading draw application...</p>
      </div>
    );
  }

  const lines = activeDraw.lines && activeDraw.lines.length > 0 ? activeDraw.lines : DRAW_REQUEST_FORM_ITEMS;

  const totalRequestedCents = lines.reduce(
    (acc, l) => acc + (parseInt(l.requested_amount || "0", 10) || 0),
    0
  );

  const totalRecommendedCents = lines.reduce(
    (acc, l) => acc + (parseInt(l.recommended_amount || "0", 10) || 0),
    0
  );

  const totalApprovedCents = lines.reduce(
    (acc, l) => acc + (parseInt(l.approved_amount || "0", 10) || 0),
    0
  );

  const totalFundedCents = lines.reduce(
    (acc, l) => acc + (parseInt(l.funded_amount || "0", 10) || 0),
    0
  );

  const shortfallCents = Math.max(0, totalRequestedCents - totalApprovedCents);
  const isShortFunded = shortfallCents > 0 || activeDraw.status === "PARTIALLY_APPROVED";

  const getStatusBadgeType = (status: DrawItem["status"]) => {
    switch (status) {
      case "FUNDED":
        return "funded" as const;
      case "APPROVED":
        return "verified" as const;
      case "PARTIALLY_APPROVED":
        return "short_funded" as const;
      case "SUBMITTED":
      case "UNDER_REVIEW":
        return "under_review" as const;
      case "REJECTED":
        return "blocked" as const;
      case "CLOSED":
        return "verified" as const;
      default:
        return "proposed" as const;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6 min-w-0">
      {/* Top Header & Breadcrumb Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href={`/projects/${projectId}/draws`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
            title="Back to Draws Register"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Draw Application #{activeDraw.draw_number}
                {activeDraw.revision_label && `-${activeDraw.revision_label}`}
              </h1>
              <StatusBadge
                status={getStatusBadgeType(activeDraw.status)}
                customLabel={activeDraw.status.replace("_", " ")}
              />
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
        </div>
      </div>

      {/* DRAW REQUEST FORM - AUTHENTIC SOV TABLE & MOBILE CARDS */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-4 sm:px-5 py-3 sm:py-3.5 gap-2 flex-wrap">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Draw Request Form
            </h2>
            <span className="rounded-full bg-orange-100 border border-orange-200 px-2.5 py-0.5 text-[11px] font-bold text-[#C85A17]">
              {lines.length} Tasks Requested
            </span>
          </div>

          {/* Mobile view toggle */}
          <div className="sm:hidden flex items-center bg-slate-200/80 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer",
                viewMode === "cards"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <LayoutGrid className="h-3 w-3" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer",
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <TableIcon className="h-3 w-3" />
              <span>Table</span>
            </button>
          </div>
        </div>

        {/* Mobile View: Task Cards (sm:hidden) */}
        {viewMode === "cards" && (
          <div className="sm:hidden p-3.5 space-y-3 bg-slate-50/40">
            {lines.map((line, idx) => {
              const budgetedVal = line.budgeted_amount
                ? formatMoney(line.budgeted_amount)
                : formatMoney(line.requested_amount);
              const requestedVal = formatMoney(line.requested_amount);
              const approvedVal = formatMoney(line.approved_amount);
              const isZeroApproved = parseInt(line.approved_amount || "0", 10) === 0;

              return (
                <div
                  key={line.id}
                  className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-slate-900 text-xs sm:text-[13px] leading-snug">
                      {line.budget_line_name}
                    </span>
                    <span className="text-[10px] font-mono font-medium text-slate-400 shrink-0 bg-slate-100 px-1.5 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                  </div>

                  {line.lender_notes && isZeroApproved && (
                    <div className="text-[11px] text-amber-800 bg-amber-50/90 border border-amber-200 rounded-md p-2">
                      <span className="font-semibold">Note:</span> {line.lender_notes}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-slate-100 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                        Budgeted
                      </span>
                      <span className="font-mono text-xs text-slate-700 block tabular-nums">
                        {budgetedVal}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                        Requested
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-900 block tabular-nums">
                        {requestedVal}
                      </span>
                    </div>

                    <div className="space-y-0.5 text-right">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                        Approved
                      </span>
                      {isZeroApproved ? (
                        <span className="font-mono text-xs font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block tabular-nums">
                          {approvedVal}
                        </span>
                      ) : (
                        <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 inline-block tabular-nums">
                          {approvedVal}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Mobile Totals Card */}
            <div className="rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50/60 via-white to-orange-50/30 p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-orange-200/60 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#C85A17]">
                  Totals Summary
                </span>
                <span className="text-[11px] font-bold text-slate-600 bg-orange-100 border border-orange-200/80 px-2 py-0.5 rounded-full">
                  {lines.length} Tasks
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                    Total Requested
                  </span>
                  <span className="font-mono text-sm font-bold text-slate-900 tabular-nums block">
                    {formatMoney(String(totalRequestedCents))}
                  </span>
                </div>

                <div className="space-y-1 text-right">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 block">
                    Total Approved
                  </span>
                  <span className="font-mono text-sm font-bold text-emerald-700 tabular-nums block">
                    {formatMoney(String(totalApprovedCents))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table View (Desktop always sm:block, mobile when viewMode === "table") */}
        <div
          className={cn(
            "overflow-x-auto custom-scrollbar",
            viewMode === "table" ? "block" : "hidden sm:block"
          )}
        >
          {/* Mobile Swipe Hint */}
          <div className="sm:hidden px-4 py-2 bg-orange-50/90 border-b border-orange-200/60 text-[11px] text-[#C85A17] font-medium flex items-center justify-between">
            <span>Scroll horizontally to view all columns</span>
            <span className="text-xs font-bold">→</span>
          </div>

          <table className="w-full min-w-[620px] text-left text-xs border-collapse">
            {/* Terracotta / Burnt Orange Header matching user specification */}
            <thead>
              <tr className="bg-[#C85A17] text-white font-bold text-xs">
                <th className="py-3.5 px-4 sm:px-5 text-left font-bold tracking-wide border-r border-[#B34F14] w-[46%]">
                  Item Description
                </th>
                <th className="py-3.5 px-4 sm:px-5 text-right font-bold tracking-wide border-r border-[#B34F14] w-[18%]">
                  Budgeted Amount
                </th>
                <th className="py-3.5 px-4 sm:px-5 text-right font-bold tracking-wide border-r border-[#B34F14] w-[18%]">
                  Requested
                </th>
                <th className="py-3.5 px-4 sm:px-5 text-right font-bold tracking-wide w-[18%]">
                  Approved Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-slate-800">
              {lines.map((line) => {
                const budgetedVal = line.budgeted_amount
                  ? formatMoney(line.budgeted_amount)
                  : formatMoney(line.requested_amount);
                const requestedVal = formatMoney(line.requested_amount);
                const approvedVal = formatMoney(line.approved_amount);
                const isZeroApproved = parseInt(line.approved_amount || "0", 10) === 0;

                return (
                  <tr
                    key={line.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Item Description */}
                    <td className="py-3.5 px-4 sm:px-5 border-r border-slate-100">
                      <div className="font-semibold text-slate-900 text-xs sm:text-[13px]">
                        {line.budget_line_name}
                      </div>
                      {line.lender_notes && isZeroApproved && (
                        <div className="text-[11px] text-amber-700 mt-0.5 font-normal">
                          Note: {line.lender_notes}
                        </div>
                      )}
                    </td>

                    {/* Budgeted Amount */}
                    <td className="py-3.5 px-4 sm:px-5 text-right tabular-nums text-slate-700 font-medium text-xs sm:text-[13px] border-r border-slate-100">
                      {budgetedVal}
                    </td>

                    {/* Requested */}
                    <td className="py-3.5 px-4 sm:px-5 text-right tabular-nums text-slate-900 font-semibold text-xs sm:text-[13px] border-r border-slate-100">
                      {requestedVal}
                    </td>

                    {/* Approved Amount */}
                    <td className="py-3.5 px-4 sm:px-5 text-right tabular-nums text-xs sm:text-[13px]">
                      {isZeroApproved ? (
                        <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {approvedVal}
                        </span>
                      ) : (
                        <span className="font-semibold text-slate-900">
                          {approvedVal}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Totals Row */}
            <tfoot>
              <tr className="border-t-2 border-slate-300 bg-slate-50/90 font-bold text-slate-900">
                <td className="py-4 px-4 sm:px-5 text-left font-bold text-xs sm:text-[13px] border-r border-slate-200">
                  Totals:
                </td>
                <td className="py-4 px-4 sm:px-5 text-right border-r border-slate-200">
                  {/* Intentionally blank to match authentic form image */}
                </td>
                <td className="py-4 px-4 sm:px-5 text-right tabular-nums font-bold text-xs sm:text-[13px] text-slate-900 border-r border-slate-200">
                  {formatMoney(String(totalRequestedCents))}
                </td>
                <td className="py-4 px-4 sm:px-5 text-right tabular-nums font-bold text-xs sm:text-[13px] text-emerald-700">
                  {formatMoney(String(totalApprovedCents))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Sub-modals for workflow actions */}

      <VerifyWorkModal
        open={isVerifyWorkOpen}
        onOpenChange={setIsVerifyWorkOpen}
        draw={activeDraw}
        onSuccess={refreshAll}
      />

      <VerifyCostModal
        open={isVerifyCostOpen}
        onOpenChange={setIsVerifyCostOpen}
        draw={activeDraw}
        onSuccess={refreshAll}
      />

      <RecordDecisionModal
        open={isRecordDecisionOpen}
        onOpenChange={setIsRecordDecisionOpen}
        draw={activeDraw}
        onSuccess={refreshAll}
      />

      <AllocateFundingModal
        open={isAllocateFundingOpen}
        onOpenChange={setIsAllocateFundingOpen}
        draw={activeDraw}
        projectId={projectId}
        onSuccess={refreshAll}
      />

      <ResubmitRevisionModal
        open={isResubmitRevisionOpen}
        onOpenChange={setIsResubmitRevisionOpen}
        draw={activeDraw}
        onSuccess={refreshAll}
      />
    </div>
  );
}
