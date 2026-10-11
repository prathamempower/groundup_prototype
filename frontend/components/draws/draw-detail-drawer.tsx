"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import type { DrawItem } from "@/lib/types";

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
}: DrawDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<"lines" | "packet" | "conditions">("lines");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!open || !draw) return null;

  const handleMarkSubmitted = async () => {
    setIsSubmittingAction(true);
    try {
      await api.draws.markSubmitted(draw.id);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleResolveCondition = async (condId: string) => {
    setIsSubmittingAction(true);
    try {
      await api.draws.resolveCondition(draw.id, condId, "Certified on-site engineering inspection completed.");
      onRefresh();
    } catch (err) {
      console.error(err);
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
    draw.pm_verification?.inspection_passed && draw.cfo_verification?.costs_verified
  );

  const shortfallCents = parseInt(draw.shortfall_amount || "0", 10);
  const isShortFunded = shortfallCents > 0 || draw.status === "PARTIALLY_APPROVED";

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
                    Draw Application #{draw.draw_number}
                    {draw.revision_label && `-${draw.revision_label}`}
                  </DrawerTitle>
                  <StatusBadge
                    status={getStatusBadgeType(draw.status)}
                    customLabel={draw.status.replace("_", " ")}
                  />
                  {draw.parent_draw_id && (
                    <span className="inline-flex items-center gap-1 rounded bg-subtle px-2 py-0.5 text-caption font-mono text-text-secondary">
                      <GitBranch className="h-3 w-3" /> Child Revision
                    </span>
                  )}
                </div>
                <p className="text-caption text-text-secondary mt-0.5">
                  {draw.lender_name} • Period: {draw.period_start} to {draw.period_end}
                </p>
              </div>
            </div>

            {/* Header Action Buttons based on lifecycle status */}
            <div className="flex items-center gap-2">
              {draw.status === "DRAFT" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onVerifyWork}
                    className="flex items-center gap-1.5"
                  >
                    <ClipboardCheck className="h-3.5 w-3.5" />
                    {draw.pm_verification?.inspection_passed ? "Work Certified" : "Verify Work (PM)"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onVerifyCost}
                    className="flex items-center gap-1.5"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {draw.cfo_verification?.costs_verified ? "Cost Certified" : "Verify Cost (CFO)"}
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

              {(draw.status === "SUBMITTED" || draw.status === "UNDER_REVIEW") && (
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

              {(isShortFunded || draw.status === "APPROVED") && (
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
                  {formatMoney(draw.requested_amount)}
                </span>
                <span className="text-[11px] text-text-muted block mt-1">
                  Basis: Certified AIA G702 pay app
                </span>
                <div className="mt-2 pt-2 border-t border-border/60">
                  <SourcesButton
                    figureLabel={`Draw #${draw.draw_number} Requested Amount`}
                    amountOrValue={formatMoney(draw.requested_amount)}
                    basis="Developer-certified AIA G702 itemized Schedule of Values"
                    citations={[
                      {
                        document_id: "doc_73_draw1_packet",
                        document_name: "AIA G702 Pay Application Line 6",
                        page_number: 1,
                        row_number: 6,
                        reviewer: "David Ross",
                        reviewed_at: "2025-06-05T10:00:00Z",
                        extraction_version: "2025.3",
                      },
                    ]}
                  />
                </div>
              </div>

              {/* 2. RECOMMENDED */}
              <div className="rounded-lg border border-border bg-surface p-3 shadow-xs">
                <span className="text-caption text-text-muted uppercase tracking-wider block">
                  2. Inspector Rec.
                </span>
                <span className="text-section font-bold tabular-nums text-text-secondary mt-1 block">
                  {formatMoney(draw.recommended_amount)}
                </span>
                <span className="text-[11px] text-text-muted block mt-1">
                  Basis: Third-party ATD inspection
                </span>
                <div className="mt-2 pt-2 border-t border-border/60">
                  <SourcesButton
                    figureLabel={`Draw #${draw.draw_number} Recommended Amount`}
                    amountOrValue={formatMoney(draw.recommended_amount)}
                    basis="Independent architectural/engineering field inspection report"
                    citations={[
                      {
                        document_id: "doc_73_draw3_insp",
                        document_name: "ATD Field Inspection Report Page 2",
                        page_number: 2,
                        row_number: 12,
                        reviewer: "David Ross",
                        reviewed_at: "2025-09-19T09:40:00Z",
                        extraction_version: "2025.3",
                      },
                    ]}
                  />
                </div>
              </div>

              {/* 3. APPROVED */}
              <div className="rounded-lg border border-border bg-surface p-3 shadow-xs">
                <span className="text-caption text-text-muted uppercase tracking-wider block">
                  3. Lender Approved
                </span>
                <span className="text-section font-bold tabular-nums text-primary mt-1 block">
                  {formatMoney(draw.approved_amount)}
                </span>
                <span className="text-[11px] text-text-muted block mt-1">
                  Basis: Bank credit committee approval
                </span>
                <div className="mt-2 pt-2 border-t border-border/60">
                  <SourcesButton
                    figureLabel={`Draw #${draw.draw_number} Approved Amount`}
                    amountOrValue={formatMoney(draw.approved_amount)}
                    basis="Formal loan advance approval letter from construction lender"
                    citations={[
                      {
                        document_id: "doc_73_draw1_packet",
                        document_name: "Lender Credit Committee Formal Advance Notice",
                        page_number: 1,
                        reviewer: "Sarah Lin",
                        reviewed_at: "2025-09-28T16:00:00Z",
                        extraction_version: "2025.3",
                      },
                    ]}
                  />
                </div>
              </div>

              {/* 4. CLEARED CASH FUNDED */}
              <div className="rounded-lg border-2 border-success/30 bg-success-subtle/10 p-3 shadow-xs">
                <span className="text-caption font-bold text-success uppercase tracking-wider block">
                  4. Cleared Cash Funded
                </span>
                <span className="text-section font-bold tabular-nums text-success mt-1 block">
                  {formatMoney(draw.funded_amount || "0")}
                </span>
                <span className="text-[11px] text-text-muted block mt-1">
                  Basis: Confirmed bank wire deposit
                </span>
                <div className="mt-2 pt-2 border-t border-border/60">
                  <SourcesButton
                    figureLabel={`Draw #${draw.draw_number} Cleared Cash Funded`}
                    amountOrValue={formatMoney(draw.funded_amount || "0")}
                    basis="Bank-confirmed wire deposit with status CLEARED"
                    citations={[
                      {
                        document_id: "doc_73_columbia_stmt_sept",
                        document_name: "Columbia Bank Cleared Wire Ref #CB-84920",
                        page_number: 2,
                        row_number: 14,
                        reviewer: "Sarah Lin",
                        reviewed_at: "2025-10-01T11:20:00Z",
                        extraction_version: "2025.3",
                      },
                    ]}
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
                      {draw.lender_decision_notes ||
                        `Lender approved ${formatMoney(draw.approved_amount)} against ${formatMoney(draw.requested_amount)} requested. Withheld funds require condition satisfaction or resubmission.`}
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
              {draw.conditions && draw.conditions.length > 0 && (
                <div className="pt-2 border-t border-warning/20 space-y-2">
                  <span className="text-caption font-semibold uppercase tracking-wider text-text-secondary block">
                    Outstanding Lender Conditions & Action Items
                  </span>
                  <div className="space-y-2">
                    {draw.conditions.map((cond) => (
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
                {draw.pm_verification?.inspection_passed ? (
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
                {draw.pm_verification?.notes ||
                  "Independent progress inspection confirmation pending certification."}
              </p>
              {draw.pm_verification && (
                <div className="text-[11px] text-text-muted pt-1">
                  Certified by: {draw.pm_verification.verified_by} • {formatDate(draw.pm_verification.verified_at)}
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
                {draw.cfo_verification?.costs_verified ? (
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
                {draw.cfo_verification
                  ? "All subcontractor invoices cross-referenced and prior advance payments cleared."
                  : "Financial audit of invoice attachments and payment clearance pending."}
              </p>
              {draw.cfo_verification && (
                <div className="text-[11px] text-text-muted pt-1">
                  Certified by: {draw.cfo_verification.verified_by} • {formatDate(draw.cfo_verification.verified_at)}
                </div>
              )}
            </div>
          </div>

          {/* TABS: DRAW LINES TABLE & PACKET CHECKLIST */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-border pb-1">
              <button
                onClick={() => setActiveTab("lines")}
                className={`px-3 py-1.5 text-body-sm font-medium rounded-t border-b-2 transition-colors ${
                  activeTab === "lines"
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                Line Item Schedule of Values ({draw.lines?.length || 0})
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

            {/* TAB 1: DRAW LINES TABLE */}
            {activeTab === "lines" && (
              <div className="rounded-lg border border-border overflow-hidden bg-surface">
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
                    {draw.lines && draw.lines.length > 0 ? (
                      draw.lines.map((line) => (
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
                          <td className="py-3 px-3 text-right tabular-nums text-text-secondary">
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
                    {(draw.packet_checklist || [
                      { id: "1", requirement: "AIA G702 / G703 Pay Application", status: "COMPLETE", document_name: "73_Broadway_Lender_Draw_1_Certified.pdf" },
                      { id: "2", requirement: "Certified ATD Progress Inspection Report", status: "COMPLETE", document_name: "Inspection_Report_Certified.pdf" },
                      { id: "3", requirement: "Conditional Lien Waivers from Major Subcontractors", status: "COMPLETE", document_name: "Lien_Waivers_Sept.pdf" },
                      { id: "4", requirement: "Mechanical Engineering Certificate", status: "PENDING_SIGNOFF", notes: "Lender condition blocking disbursement" },
                    ]).map((item) => (
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
                    ))}
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
                          {draw.portal_summary?.commitment_id || "COL-2025-73B"}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            draw.portal_summary?.commitment_id || "COL-2025-73B",
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
                          {formatMoney(draw.requested_amount)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(draw.requested_amount, "requested")
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
                            draw.portal_summary?.retainage_withheld ||
                              String(Math.round(parseInt(draw.requested_amount, 10) * 0.1))
                          )}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            draw.portal_summary?.retainage_withheld ||
                              String(Math.round(parseInt(draw.requested_amount, 10) * 0.1)),
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
                            draw.portal_summary?.net_payable ||
                              String(
                                parseInt(draw.requested_amount, 10) -
                                  Math.round(parseInt(draw.requested_amount, 10) * 0.1)
                              )
                          )}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            draw.portal_summary?.net_payable ||
                              String(
                                parseInt(draw.requested_amount, 10) -
                                  Math.round(parseInt(draw.requested_amount, 10) * 0.1)
                              ),
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
            Draw Record ID: {draw.id} • Loan Ref: {draw.loan_id}
          </span>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close Workbench
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
