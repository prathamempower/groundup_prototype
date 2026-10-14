"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney, formatDate } from "@/lib/format";
import { api } from "@/lib/api";
import {
  Landmark,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ClipboardCheck,
  ShieldCheck,
  FileText,
  DollarSign,
  GitBranch,
  Building2,
  Send,
  AlertCircle,
  Copy,
  ExternalLink,
  FileSpreadsheet,
} from "lucide-react";
import type { DrawItem, DrawLine } from "@/lib/types";
import {
  DRAW_REQUEST_FORM_ITEMS,
  DRAW_REQUEST_TOTALS,
} from "@/lib/data/draw-request-form-items";
import { AllocateDrawTasksModal } from "./allocate-draw-tasks-modal";

interface DrawDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draw: DrawItem | null;
  onVerifyWork: () => void;
  onVerifyCost: () => void;
  onRecordDecision: () => void;
  onAllocateFunding: () => void;
  onResubmitRevision: () => void;
  onRefresh: () => void;
  onUpdateDraw?: (updatedDraw: DrawItem) => void;
}

export function DrawDetailDrawer({
  open,
  onOpenChange,
  draw,
  onVerifyWork,
  onVerifyCost,
  onRecordDecision,
  onAllocateFunding,
  onResubmitRevision,
  onRefresh,
  onUpdateDraw,
}: DrawDetailDrawerProps) {
  const [internalDraw, setInternalDraw] = useState<DrawItem | null>(draw);
  const [isAllocateTasksModalOpen, setIsAllocateTasksModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"lines" | "packet" | "conditions">("lines");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    setInternalDraw(draw);
  }, [draw]);

  const activeDraw = internalDraw || draw;

  const { data: documentsData } = useQuery({
    queryKey: ["documents", activeDraw?.project_id],
    queryFn: () => api.documents.list(activeDraw!.project_id),
    enabled: Boolean(activeDraw?.project_id && open),
  });

  if (!activeDraw) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="w-full max-w-4xl bg-surface" />
      </Drawer>
    );
  }

  const projectDocs = documentsData?.data || [];
  const primaryDoc = projectDocs[0];
  const payAppDoc = projectDocs.find((d) => d.document_type === "BUDGET_SOV" || d.original_filename?.toLowerCase().includes("budget") || d.original_filename?.toLowerCase().includes("application")) || primaryDoc;
  const inspDoc = projectDocs.find((d) => d.document_type === "INSPECTION" || d.original_filename?.toLowerCase().includes("report") || d.original_filename?.toLowerCase().includes("inspection")) || primaryDoc;
  const advanceNoticeDoc = projectDocs.find((d) => d.document_type === "CONTRACT" || d.original_filename?.toLowerCase().includes("loan")) || primaryDoc;
  const bankWireDoc = projectDocs.find((d) => d.document_type === "BANK_STATEMENT" || d.original_filename?.toLowerCase().includes("bank") || d.original_filename?.toLowerCase().includes("statement")) || primaryDoc;

  const requestedCitations = payAppDoc
    ? [
        {
          document_id: payAppDoc.id,
          document_name: payAppDoc.original_filename,
          page_number: 1,
          row_number: 6,
          reviewer: "David Ross (PM)",
          reviewed_at: payAppDoc.uploaded_at,
          extraction_version: "v1.0",
        },
      ]
    : [];

  const recommendedCitations = inspDoc
    ? [
        {
          document_id: inspDoc.id,
          document_name: inspDoc.original_filename,
          page_number: 1,
          row_number: 12,
          reviewer: "David Ross (PM)",
          reviewed_at: inspDoc.uploaded_at,
          extraction_version: "v1.0",
        },
      ]
    : [];

  const approvedCitations = advanceNoticeDoc
    ? [
        {
          document_id: advanceNoticeDoc.id,
          document_name: advanceNoticeDoc.original_filename,
          page_number: 1,
          reviewer: "Sarah Lin (CFO)",
          reviewed_at: advanceNoticeDoc.uploaded_at,
          extraction_version: "v1.0",
        },
      ]
    : [];

  const fundedCitations = bankWireDoc
    ? [
        {
          document_id: bankWireDoc.id,
          document_name: bankWireDoc.original_filename,
          page_number: 1,
          row_number: 14,
          reviewer: "Sarah Lin (CFO)",
          reviewed_at: bankWireDoc.uploaded_at,
          extraction_version: "v1.0",
        },
      ]
    : [];

  if (!open || !activeDraw) return null;

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

  const handleSaveTasks = (newLines: DrawLine[], newTotalCents: number) => {
    const updated: DrawItem = {
      ...activeDraw,
      lines: newLines,
      requested_amount: String(newTotalCents),
      recommended_amount: String(newTotalCents),
      approved_amount: String(newTotalCents),
    };
    setInternalDraw(updated);
    onUpdateDraw?.(updated);
  };

  const handleMarkSubmitted = async () => {
    setIsSubmittingAction(true);
    try {
      await api.draws.markSubmitted(activeDraw.id);
      onRefresh();
    } catch {
      // Error is handled via response interceptors
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleResolveCondition = async (condId: string) => {
    setIsSubmittingAction(true);
    try {
      await api.draws.resolveCondition(activeDraw.id, condId, "Certified on-site engineering inspection completed.");
      onRefresh();
    } catch {
      // Error is handled via response interceptors
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const isDualVerified = Boolean(
    activeDraw.pm_verification?.inspection_passed && activeDraw.cfo_verification?.costs_verified
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
        return "provisional" as const;
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="w-full max-w-4xl flex flex-col h-full bg-surface">
        <DrawerHeader className="border-b border-border bg-subtle/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary-subtle p-2 text-primary">
                <Landmark className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DrawerTitle className="text-section font-bold text-text-primary">
                    Draw Application #{activeDraw.draw_number}
                    {activeDraw.revision_label && `-${activeDraw.revision_label}`}
                  </DrawerTitle>
                  <StatusBadge
                    status={getStatusBadgeType(activeDraw.status)}
                    customLabel={activeDraw.status.replace("_", " ")}
                  />
                  {activeDraw.parent_draw_id && (
                    <span className="inline-flex items-center gap-1 rounded bg-subtle px-2 py-0.5 text-caption font-mono text-text-secondary">
                      <GitBranch className="h-3 w-3" /> Child Revision
                    </span>
                  )}
                </div>
                <p className="text-caption text-text-secondary mt-0.5">
                  {activeDraw.lender_name} • Period: {activeDraw.period_start} to {activeDraw.period_end}
                </p>
              </div>
            </div>

            {/* Header Action Buttons based on lifecycle status */}
            <div className="flex items-center gap-2">
              {activeDraw.status === "DRAFT" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onVerifyWork}
                    className="flex items-center gap-1.5"
                  >
                    <ClipboardCheck className="h-3.5 w-3.5" />
                    {activeDraw.pm_verification?.inspection_passed ? "Work Certified" : "Verify Work (PM)"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onVerifyCost}
                    className="flex items-center gap-1.5"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {activeDraw.cfo_verification?.costs_verified ? "Cost Certified" : "Verify Cost (CFO)"}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleMarkSubmitted}
                    disabled={!isDualVerified || isSubmittingAction}
                    className="flex items-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Submit to Lender
                  </Button>
                </>
              )}

              {(activeDraw.status === "SUBMITTED" || activeDraw.status === "UNDER_REVIEW") && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onRecordDecision}
                  className="flex items-center gap-1.5"
                >
                  <Building2 className="h-3.5 w-3.5" />
                  Record Lender Decision
                </Button>
              )}

              {(isShortFunded || activeDraw.status === "APPROVED") && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAllocateFunding}
                    className="flex items-center gap-1.5 text-success border-success/30 hover:bg-success-subtle/20"
                  >
                    <DollarSign className="h-3.5 w-3.5" />
                    Allocate Cash Wire
                  </Button>
                  {isShortFunded && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={onResubmitRevision}
                      className="flex items-center gap-1.5"
                    >
                      <GitBranch className="h-3.5 w-3.5" />
                      Create Resubmission Revision
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* SHORT-FUNDED ALERT BANNER & CONDITIONS */}
          {isShortFunded && (
            <div className="rounded-lg border border-warning/40 bg-warning-subtle/30 p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-body font-bold text-text-primary">
                      Short-Funded Application: {formatMoney(String(shortfallCents))} Withheld
                    </h4>
                    <p className="text-body-sm text-text-secondary mt-0.5">
                      {activeDraw.lender_decision_notes ||
                        `Lender approved ${formatMoney(String(totalApprovedCents))} against ${formatMoney(String(totalRequestedCents))} requested. Withheld funds holdback on Final Clean-up pending inspection.`}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={onResubmitRevision}
                  className="shrink-0 bg-surface text-primary border-primary/30 hover:bg-primary-subtle"
                >
                  <GitBranch className="h-3.5 w-3.5 mr-1.5" />
                  Prepare Resubmission Revision
                </Button>
              </div>

              {/* Conditions List */}
              {activeDraw.conditions && activeDraw.conditions.length > 0 && (
                <div className="pt-2 border-t border-warning/20 space-y-2">
                  <span className="text-caption font-semibold uppercase tracking-wider text-text-secondary block">
                    Outstanding Lender Conditions & Action Items
                  </span>
                  <div className="space-y-2">
                    {activeDraw.conditions.map((cond) => (
                      <div
                        key={cond.id}
                        className="flex items-center justify-between p-2.5 bg-surface rounded border border-border text-body-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                cond.status === "SATISFIED" ? "bg-success" : "bg-warning"
                              }`}
                            />
                            <span className="font-semibold text-text-primary">{cond.title}</span>
                            <span className="text-caption text-text-muted">
                              ({cond.status})
                            </span>
                          </div>
                          <p className="text-caption text-text-secondary mt-0.5 pl-4">
                            Required for: {cond.required_for}
                          </p>
                        </div>

                        {cond.status === "OPEN" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={isSubmittingAction}
                            onClick={() => handleResolveCondition(cond.id)}
                            className="shrink-0 text-caption"
                          >
                            Mark Satisfied
                          </Button>
                        )}
                        {cond.status === "SATISFIED" && (
                          <span className="inline-flex items-center gap-1 text-caption text-success font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Satisfied
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DRAW REQUEST FORM TABLE WORKBENCH */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div className="flex items-center gap-2">
                <span className="text-body font-bold text-text-primary">
                  Draw Request Form
                </span>
                <span className="rounded-full bg-orange-100 border border-orange-200 text-[#C85A17] text-caption font-bold px-2 py-0.5">
                  {lines.length} Tasks Requested
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAllocateTasksModalOpen(true)}
                className="h-8 text-xs font-semibold border-slate-300 text-[#C85A17] hover:bg-orange-50 cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5 text-[#C85A17]" />
                Input / Allocate Work Tasks
              </Button>
            </div>

            {/* AUTHENTIC DRAW REQUEST FORM TABLE */}
            <div className="rounded-lg border border-slate-200 overflow-hidden bg-white shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                {/* Terracotta / Burnt Orange Header matching user specification */}
                <thead>
                  <tr className="bg-[#C85A17] text-white font-bold text-xs">
                    <th className="py-3 px-4 text-left font-bold tracking-wide border-r border-[#B34F14] w-[46%]">
                      Item Description
                    </th>
                    <th className="py-3 px-4 text-right font-bold tracking-wide border-r border-[#B34F14] w-[18%]">
                      Budgeted Amount
                    </th>
                    <th className="py-3 px-4 text-right font-bold tracking-wide border-r border-[#B34F14] w-[18%]">
                      Requested
                    </th>
                    <th className="py-3 px-4 text-right font-bold tracking-wide w-[18%]">
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
                      <tr key={line.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 border-r border-slate-100">
                          <span className="font-semibold text-slate-900 text-xs sm:text-[13px] block">
                            {line.budget_line_name}
                          </span>
                          {line.lender_notes && isZeroApproved && (
                            <span className="text-[11px] text-amber-700 mt-0.5 block font-normal">
                              Note: {line.lender_notes}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-slate-700 font-medium text-xs sm:text-[13px] border-r border-slate-100">
                          {budgetedVal}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-slate-900 font-semibold text-xs sm:text-[13px] border-r border-slate-100">
                          {requestedVal}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-xs sm:text-[13px]">
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
                <tfoot>
                  <tr className="border-t-2 border-slate-300 bg-slate-50/90 font-bold text-slate-900">
                    <td className="py-3.5 px-4 text-left font-bold text-xs sm:text-[13px] border-r border-slate-200">
                      Totals:
                    </td>
                    <td className="py-3.5 px-4 text-right border-r border-slate-200">
                      {/* Blank to match user form */}
                    </td>
                    <td className="py-3.5 px-4 text-right tabular-nums font-bold text-xs sm:text-[13px] text-slate-900 border-r border-slate-200">
                      {formatMoney(String(totalRequestedCents))}
                    </td>
                    <td className="py-3.5 px-4 text-right tabular-nums font-bold text-xs sm:text-[13px] text-emerald-700">
                      {formatMoney(String(totalApprovedCents))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <DrawerFooter className="border-t border-border bg-subtle/20 px-6 py-3 flex items-center justify-between">
          <span className="text-caption text-text-muted font-mono">
            Draw Record ID: {activeDraw.id} • Loan Ref: {activeDraw.loan_id}
          </span>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close Workbench
          </Button>
        </DrawerFooter>

        <AllocateDrawTasksModal
          open={isAllocateTasksModalOpen}
          onOpenChange={setIsAllocateTasksModalOpen}
          drawNumber={activeDraw.draw_number}
          initialLines={activeDraw.lines}
          onSave={handleSaveTasks}
        />
      </DrawerContent>
    </Drawer>
  );
}
