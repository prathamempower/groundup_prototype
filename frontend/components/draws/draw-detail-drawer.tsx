"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { SourcesButton } from "@/components/ui/source-panel";
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

  const totalRequestedCents =
    activeDraw.lines && activeDraw.lines.length > 0
      ? activeDraw.lines.reduce((acc, l) => acc + (parseInt(l.requested_amount || "0", 10) || 0), 0)
      : parseInt(activeDraw.requested_amount || "0", 10) || 0;

  const totalRecommendedCents =
    activeDraw.lines && activeDraw.lines.length > 0
      ? activeDraw.lines.reduce((acc, l) => acc + (parseInt(l.recommended_amount || "0", 10) || 0), 0)
      : parseInt(activeDraw.recommended_amount || "0", 10) || 0;

  const totalApprovedCents =
    activeDraw.lines && activeDraw.lines.length > 0
      ? activeDraw.lines.reduce((acc, l) => acc + (parseInt(l.approved_amount || "0", 10) || 0), 0)
      : parseInt(activeDraw.approved_amount || "0", 10) || 0;

  const totalFundedCents =
    activeDraw.lines && activeDraw.lines.length > 0
      ? activeDraw.lines.reduce((acc, l) => acc + (parseInt(l.funded_amount || "0", 10) || 0), 0)
      : parseInt(activeDraw.funded_amount || "0", 10) || 0;

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

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isDualVerified = Boolean(
    activeDraw.pm_verification?.inspection_passed && activeDraw.cfo_verification?.costs_verified
  );

  const shortfallCents = parseInt(activeDraw.shortfall_amount || "0", 10);
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
          {/* THE FOUR-VALUE FUNDING TRUTH STRIP */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-caption font-semibold uppercase tracking-wider text-text-secondary">
                The Four-Value Funding Truth
              </span>
              <span className="text-caption text-text-muted">
                Cleared cash, not draw approval, is funding truth
              </span>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {/* 1. REQUESTED */}
              <div className="rounded-lg border border-border bg-surface p-3 shadow-xs">
                <span className="text-caption text-text-muted uppercase tracking-wider block">
                  1. Requested Amount
                </span>
                <span className="text-section font-bold tabular-nums text-text-primary mt-1 block">
                  {formatMoney(String(totalRequestedCents))}
                </span>
                <span className="text-[11px] text-text-muted block mt-1">
                  Basis: Certified AIA G702 pay app
                </span>
                <div className="mt-2 pt-2 border-t border-border/60">
                  <SourcesButton
                    figureLabel={`Draw #${activeDraw.draw_number} Requested Amount`}
                    amountOrValue={formatMoney(String(totalRequestedCents))}
                    basis="Developer-certified AIA G702 itemized Schedule of Values"
                    citations={requestedCitations}
                  />
                </div>
              </div>

              {/* 2. RECOMMENDED */}
              <div className="rounded-lg border border-border bg-surface p-3 shadow-xs">
                <span className="text-caption text-text-muted uppercase tracking-wider block">
                  2. Inspector Rec.
                </span>
                <span className="text-section font-bold tabular-nums text-text-secondary mt-1 block">
                  {formatMoney(String(totalRecommendedCents))}
                </span>
                <span className="text-[11px] text-text-muted block mt-1">
                  Basis: Third-party ATD inspection
                </span>
                <div className="mt-2 pt-2 border-t border-border/60">
                  <SourcesButton
                    figureLabel={`Draw #${activeDraw.draw_number} Recommended Amount`}
                    amountOrValue={formatMoney(String(totalRecommendedCents))}
                    basis="Independent architectural/engineering field inspection report"
                    citations={recommendedCitations}
                  />
                </div>
              </div>

              {/* 3. APPROVED */}
              <div className="rounded-lg border border-border bg-surface p-3 shadow-xs">
                <span className="text-caption text-text-muted uppercase tracking-wider block">
                  3. Lender Approved
                </span>
                <span className="text-section font-bold tabular-nums text-primary mt-1 block">
                  {formatMoney(String(totalApprovedCents))}
                </span>
                <span className="text-[11px] text-text-muted block mt-1">
                  Basis: Bank credit committee approval
                </span>
                <div className="mt-2 pt-2 border-t border-border/60">
                  <SourcesButton
                    figureLabel={`Draw #${activeDraw.draw_number} Approved Amount`}
                    amountOrValue={formatMoney(String(totalApprovedCents))}
                    basis="Formal loan advance approval letter from construction lender"
                    citations={approvedCitations}
                  />
                </div>
              </div>

              {/* 4. CLEARED CASH FUNDED */}
              <div className="rounded-lg border-2 border-success/30 bg-success-subtle/10 p-3 shadow-xs">
                <span className="text-caption font-bold text-success uppercase tracking-wider block">
                  4. Cleared Cash Funded
                </span>
                <span className="text-section font-bold tabular-nums text-success mt-1 block">
                  {formatMoney(String(totalFundedCents))}
                </span>
                <span className="text-[11px] text-text-muted block mt-1">
                  Basis: Confirmed bank wire deposit
                </span>
                <div className="mt-2 pt-2 border-t border-border/60">
                  <SourcesButton
                    figureLabel={`Draw #${activeDraw.draw_number} Cleared Cash Funded`}
                    amountOrValue={formatMoney(String(totalFundedCents))}
                    basis="Bank-confirmed wire deposit with status CLEARED"
                    citations={fundedCitations}
                  />
                </div>
              </div>
            </div>
          </div>

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
                        `Lender approved ${formatMoney(activeDraw.approved_amount)} against ${formatMoney(activeDraw.requested_amount)} requested. Withheld funds require condition satisfaction or resubmission.`}
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

          {/* DUAL VERIFICATION CARD */}
          <div className="grid grid-cols-2 gap-4">
            {/* PM Work Verification */}
            <div className="rounded-lg border border-border bg-surface p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-primary" />
                  <span className="text-body font-semibold text-text-primary">
                    PM Work Verification
                  </span>
                </div>
                {activeDraw.pm_verification?.inspection_passed ? (
                  <span className="inline-flex items-center gap-1 rounded bg-success-subtle px-2 py-0.5 text-caption font-semibold text-success">
                    <CheckCircle2 className="h-3 w-3" /> Certified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded bg-subtle px-2 py-0.5 text-caption font-semibold text-text-muted">
                    <Clock className="h-3 w-3" /> Pending Review
                  </span>
                )}
              </div>
              <p className="text-caption text-text-secondary">
                {activeDraw.pm_verification?.notes ||
                  "Independent progress inspection confirmation pending certification."}
              </p>
              {activeDraw.pm_verification && (
                <div className="text-[11px] text-text-muted pt-1">
                  Certified by: {activeDraw.pm_verification.verified_by} • {formatDate(activeDraw.pm_verification.verified_at)}
                </div>
              )}
            </div>

            {/* CFO Cost Verification */}
            <div className="rounded-lg border border-border bg-surface p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-success" />
                  <span className="text-body font-semibold text-text-primary">
                    CFO Cost Verification
                  </span>
                </div>
                {activeDraw.cfo_verification?.costs_verified ? (
                  <span className="inline-flex items-center gap-1 rounded bg-success-subtle px-2 py-0.5 text-caption font-semibold text-success">
                    <CheckCircle2 className="h-3 w-3" /> Certified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded bg-subtle px-2 py-0.5 text-caption font-semibold text-text-muted">
                    <Clock className="h-3 w-3" /> Pending Review
                  </span>
                )}
              </div>
              <p className="text-caption text-text-secondary">
                {activeDraw.cfo_verification
                  ? "All subcontractor invoices cross-referenced and prior advance payments cleared."
                  : "Financial audit of invoice attachments and payment clearance pending."}
              </p>
              {activeDraw.cfo_verification && (
                <div className="text-[11px] text-text-muted pt-1">
                  Certified by: {activeDraw.cfo_verification.verified_by} • {formatDate(activeDraw.cfo_verification.verified_at)}
                </div>
              )}
            </div>
          </div>

          {/* TABS: DRAW LINES TABLE & PACKET CHECKLIST */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("lines")}
                  className={`px-3 py-1.5 text-body-sm font-medium rounded-t border-b-2 transition-colors ${
                    activeTab === "lines"
                      ? "border-primary text-primary"
                      : "border-transparent text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Line Item Schedule of Values ({activeDraw.lines?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab("packet")}
                  className={`px-3 py-1.5 text-body-sm font-medium rounded-t border-b-2 transition-colors ${
                    activeTab === "packet"
                      ? "border-primary text-primary"
                      : "border-transparent text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Lender Packet Checklist & Portal Summary
                </button>
              </div>

              {activeTab === "lines" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAllocateTasksModalOpen(true)}
                  className="h-8 text-xs font-semibold border-primary/40 text-primary hover:bg-primary-subtle"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  Input / Allocate Work Tasks
                </Button>
              )}
            </div>

            {/* TAB 1: DRAW LINES TABLE */}
            {activeTab === "lines" && (
              <div className="rounded-lg border border-border overflow-hidden bg-surface shadow-xs">
                <table className="w-full text-left text-body-sm">
                  <thead className="bg-subtle/50 text-caption font-semibold text-text-secondary border-b border-border">
                    <tr>
                      <th className="py-2.5 px-3">CSI Code & Scope</th>
                      <th className="py-2.5 px-3 text-right">Requested</th>
                      <th className="py-2.5 px-3 text-right">Recommended</th>
                      <th className="py-2.5 px-3 text-right">Approved</th>
                      <th className="py-2.5 px-3 text-right font-bold text-success">Cleared Funded</th>
                      <th className="py-2.5 px-3">Evidence Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {activeDraw.lines && activeDraw.lines.length > 0 ? (
                      activeDraw.lines.map((line) => (
                        <tr key={line.id} className="hover:bg-subtle/20 transition-colors">
                          <td className="py-3 px-3">
                            <span className="font-mono text-caption text-text-muted mr-1.5 font-bold">
                              {line.budget_line_code}
                            </span>
                            <span className="font-medium text-text-primary">
                              {line.budget_line_name}
                            </span>
                            {line.lender_notes && (
                              <p className="text-caption text-warning mt-0.5">
                                Note: {line.lender_notes}
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right tabular-nums text-text-secondary font-medium">
                            {formatMoney(line.requested_amount)}
                          </td>
                          <td className="py-3 px-3 text-right tabular-nums text-text-secondary">
                            {formatMoney(line.recommended_amount)}
                          </td>
                          <td className="py-3 px-3 text-right tabular-nums font-medium text-text-primary">
                            {formatMoney(line.approved_amount)}
                          </td>
                          <td className="py-3 px-3 text-right tabular-nums font-bold text-success">
                            {formatMoney(line.funded_amount)}
                          </td>
                          <td className="py-3 px-3">
                            <StatusBadge
                              status={
                                line.evidence_status === "VERIFIED"
                                  ? "verified"
                                  : line.evidence_status === "PENDING_INSPECTION"
                                  ? "under_review"
                                  : "missing_evidence"
                              }
                              customLabel={line.evidence_status.replace("_", " ")}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-caption text-text-muted italic">
                          No line items attached to this draw application.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {activeDraw.lines && activeDraw.lines.length > 0 && (
                    <tfoot className="bg-subtle/60 font-bold border-t border-border">
                      <tr>
                        <td className="py-3 px-3 text-text-primary font-bold">
                          Total ({activeDraw.lines.length} Tasks Allocated)
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums text-text-primary font-bold">
                          {formatMoney(String(totalRequestedCents))}
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums text-text-secondary font-bold">
                          {formatMoney(String(totalRecommendedCents))}
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums text-text-primary font-bold">
                          {formatMoney(String(totalApprovedCents))}
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums text-success font-bold">
                          {formatMoney(String(totalFundedCents))}
                        </td>
                        <td className="py-3 px-3"></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            )}

            {/* TAB 2: PACKET CHECKLIST & PORTAL SUMMARY */}
            {activeTab === "packet" && (
              <div className="space-y-4">
                {/* Packet Checklist */}
                <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-caption font-semibold uppercase tracking-wider text-text-secondary">
                      Draw Package Required Checklist
                    </span>
                    <span className="text-caption text-text-muted">
                      Certified submission package items
                    </span>
                  </div>

                  <div className="space-y-2">
                    {activeDraw.packet_checklist && activeDraw.packet_checklist.length > 0 ? (
                      activeDraw.packet_checklist.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2.5 rounded border border-border bg-subtle/30 text-body-sm"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-text-muted shrink-0" />
                            <div>
                              <span className="font-semibold text-text-primary block">
                                {item.requirement}
                              </span>
                              {item.document_name && (
                                <span className="text-caption text-primary hover:underline cursor-pointer">
                                  {item.document_name}
                                </span>
                              )}
                              {item.notes && (
                                <span className="text-caption text-warning block">
                                  {item.notes}
                                </span>
                              )}
                            </div>
                          </div>

                          <StatusBadge
                            status={
                              item.status === "COMPLETE"
                                ? "verified"
                                : item.status === "PENDING_SIGNOFF"
                                ? "under_review"
                                : "missing_evidence"
                            }
                            customLabel={item.status.replace("_", " ")}
                          />
                        </div>
                      ))
                    ) : (
                      <p className="text-caption text-text-secondary py-2">
                        No packet checklist items specified for this draw.
                      </p>
                    )}
                  </div>
                </div>

                {/* Portal-Entry Summary */}
                <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-body font-bold text-text-primary">
                        Lender Portal Entry Summary
                      </h4>
                      <p className="text-caption text-text-muted">
                        Fast copy fields for manual entry into bank lending portal (e.g. Columbia Bank / BoA portal)
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-body-sm">
                    <div className="p-3 rounded border border-border bg-subtle/30 flex items-center justify-between">
                      <div>
                        <span className="text-caption text-text-muted block">Loan Commitment ID</span>
                        <span className="font-mono font-bold text-text-primary">
                          {activeDraw.portal_summary?.commitment_id || "COL-2025-73B"}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            activeDraw.portal_summary?.commitment_id || "COL-2025-73B",
                            "commitment"
                          )
                        }
                      >
                        {copiedField === "commitment" ? "Copied!" : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                    </div>

                    <div className="p-3 rounded border border-border bg-subtle/30 flex items-center justify-between">
                      <div>
                        <span className="text-caption text-text-muted block">Gross Application Requested</span>
                        <span className="font-bold tabular-nums text-text-primary">
                          {formatMoney(String(totalRequestedCents))}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(String(totalRequestedCents), "requested")
                        }
                      >
                        {copiedField === "requested" ? "Copied!" : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                    </div>

                    <div className="p-3 rounded border border-border bg-subtle/30 flex items-center justify-between">
                      <div>
                        <span className="text-caption text-text-muted block">Retainage Withheld (10%)</span>
                        <span className="font-bold tabular-nums text-text-muted">
                          {formatMoney(
                            activeDraw.portal_summary?.retainage_withheld ||
                              String(Math.round(totalRequestedCents * 0.1))
                          )}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            activeDraw.portal_summary?.retainage_withheld ||
                              String(Math.round(totalRequestedCents * 0.1)),
                            "retainage"
                          )
                        }
                      >
                        {copiedField === "retainage" ? "Copied!" : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                    </div>

                    <div className="p-3 rounded border border-border bg-subtle/30 flex items-center justify-between">
                      <div>
                        <span className="text-caption text-text-muted block">Net Disbursement Payable</span>
                        <span className="font-bold tabular-nums text-primary">
                          {formatMoney(
                            activeDraw.portal_summary?.net_payable ||
                              String(totalRequestedCents - Math.round(totalRequestedCents * 0.1))
                          )}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            activeDraw.portal_summary?.net_payable ||
                              String(totalRequestedCents - Math.round(totalRequestedCents * 0.1)),
                            "net"
                          )
                        }
                      >
                        {copiedField === "net" ? "Copied!" : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
