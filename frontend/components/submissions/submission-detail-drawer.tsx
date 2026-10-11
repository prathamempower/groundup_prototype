"use client";

import React, { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { StatusBadge, StatusBadgeType } from "@/components/ui/status-badge";
import { formatMoney, formatDate } from "@/lib/format";
import { GCSubmission, UserRole } from "@/lib/types";
import {
  FileText,
  Camera,
  FileCheck,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { ReviewSubmissionModal } from "./review-submission-modal";

interface SubmissionDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  submission: GCSubmission | null;
  currentRole: UserRole;
  onRefresh?: () => void;
}

export function SubmissionDetailDrawer({
  isOpen,
  onClose,
  submission,
  currentRole,
  onRefresh,
}: SubmissionDetailDrawerProps) {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (!submission) return null;

  const isGC = currentRole === "GC";
  const canReview = !isGC && ["PM", "CFO", "OWNER"].includes(currentRole);

  const getStatusBadgeVariant = (status: GCSubmission["status"]): StatusBadgeType => {
    switch (status) {
      case "APPROVED":
        return "verified";
      case "UNDER_REVIEW":
        return "under_review";
      case "REJECTED":
        return "blocked";
      case "SUBMITTED":
        return "proposed";
      default:
        return "provisional";
    }
  };

  const getTypeBadgeLabel = (type: GCSubmission["type"]) => {
    switch (type) {
      case "PROGRESS_CLAIM":
        return "Progress Claim";
      case "COST_EVIDENCE":
        return "Cost Evidence";
      case "CHANGE_ORDER_REQUEST":
        return "Change Order Request";
    }
  };

  return (
    <>
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent width="wide">
          <DrawerHeader>
            <DrawerTitle>{submission.submission_number} — {submission.title}</DrawerTitle>
            <DrawerDescription>
              {submission.contractor_name} • Submitted {formatDate(submission.submitted_at)}
            </DrawerDescription>
          </DrawerHeader>

          <DrawerBody className="space-y-6 pb-8">
            {/* Header Status & Type */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface-hover/50 p-4">
              <div className="flex items-center gap-2">
                <span className="rounded bg-primary-subtle px-2 py-0.5 text-caption font-semibold text-primary">
                  {getTypeBadgeLabel(submission.type)}
                </span>
                <span className="text-caption text-text-muted">
                  Contract: <strong>{submission.contract_model}</strong>
                </span>
              </div>

              <StatusBadge
                status={getStatusBadgeVariant(submission.status)}
                customLabel={submission.status.replace("_", " ")}
              />
            </div>

            {/* 4 Financial / Metric Summary Tiles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-lg border border-border bg-surface p-3">
                <div className="text-caption text-text-muted">Gross Claim</div>
                <div className="font-mono text-body font-bold text-text-primary mt-1 tabular-nums">
                  {formatMoney(submission.claimed_amount)}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-surface p-3">
                <div className="text-caption text-text-muted">
                  Retainage ({submission.retainage_rate_pct}%)
                </div>
                <div className="font-mono text-body font-semibold text-warning mt-1 tabular-nums">
                  {formatMoney(submission.retainage_amount)}
                </div>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary-subtle/30 p-3">
                <div className="text-caption font-semibold text-primary">Net Payable</div>
                <div className="font-mono text-body font-bold text-primary mt-1 tabular-nums">
                  {formatMoney(submission.net_payable_amount)}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-surface p-3">
                <div className="text-caption text-text-muted">
                  {submission.type === "CHANGE_ORDER_REQUEST" ? "Schedule Delay" : "Progress Claimed"}
                </div>
                <div className="font-mono text-body font-semibold text-text-primary mt-1 tabular-nums">
                  {submission.type === "CHANGE_ORDER_REQUEST"
                    ? `+${submission.schedule_delay_days || 0} days`
                    : `${submission.current_claimed_pct || 100}% (${submission.incremental_claimed_pct ? `+${submission.incremental_claimed_pct}%` : "100%"})`}
                </div>
              </div>
            </div>

            {/* Sponsor Review Governance Gates */}
            <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-body font-semibold text-text-primary">
                    Sponsor 3-Party Governance Review
                  </h3>
                  <p className="text-caption text-text-muted">
                    Requires independent certifications from PM, CFO, and Owner before draw inclusion.
                  </p>
                </div>

                {canReview && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsReviewModalOpen(true)}
                  >
                    Certify Gate ({currentRole})
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                {submission.reviews.map((rev) => {
                  const isApproved = rev.status === "APPROVED";
                  const isRejected = rev.status === "REJECTED";
                  return (
                    <div
                      key={rev.role}
                      className={`rounded-lg border p-3 space-y-1.5 text-caption ${
                        isApproved
                          ? "border-success/30 bg-success-subtle/20"
                          : isRejected
                          ? "border-danger/30 bg-danger-subtle/20"
                          : "border-border bg-surface-hover/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-text-primary">
                          {rev.role === "PM"
                            ? "Project Manager"
                            : rev.role === "CFO"
                            ? "CFO Audit"
                            : "Owner Signoff"}
                        </span>
                        {isApproved ? (
                          <span className="flex items-center gap-1 font-semibold text-success">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Approved
                          </span>
                        ) : isRejected ? (
                          <span className="flex items-center gap-1 font-semibold text-danger">
                            <XCircle className="h-3.5 w-3.5" />
                            Rejected
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-text-muted font-medium">
                            <Clock className="h-3.5 w-3.5 text-warning" />
                            Pending
                          </span>
                        )}
                      </div>

                      <div className="text-text-secondary text-caption">
                        {rev.reviewer_name ? (
                          <div>• By {rev.reviewer_name}</div>
                        ) : (
                          <div>• Awaiting review</div>
                        )}
                        {rev.reviewed_at && (
                          <div className="text-text-muted">• {formatDate(rev.reviewed_at)}</div>
                        )}
                      </div>

                      {rev.comments && (
                        <p className="rounded bg-surface p-1.5 text-caption text-text-primary border border-border/50 italic mt-1">
                          &ldquo;{rev.comments}&rdquo;
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submission Context & Scope */}
            <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
              <h3 className="text-body font-semibold text-text-primary">
                Submission Scope & Metadata
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-caption">
                <div>
                  <span className="text-text-muted">Contractor:</span>
                  <span className="font-medium text-text-primary ml-2">{submission.contractor_name}</span>
                </div>

                <div>
                  <span className="text-text-muted">Submitted By:</span>
                  <span className="font-medium text-text-primary ml-2">{submission.submitted_by}</span>
                </div>

                <div>
                  <span className="text-text-muted">Date Submitted:</span>
                  <span className="font-medium text-text-primary ml-2">{formatDate(submission.submitted_at)}</span>
                </div>

                <div>
                  <span className="text-text-muted">CSI Division:</span>
                  <span className="font-medium text-text-primary ml-2">
                    {submission.csi_code} — {submission.csi_category || "Hard Costs"}
                  </span>
                </div>

                {submission.milestone_name && (
                  <div className="md:col-span-2">
                    <span className="text-text-muted">Milestone Plan:</span>
                    <span className="font-medium text-text-primary ml-2">{submission.milestone_name}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-border">
                <span className="text-caption font-medium text-text-secondary block mb-1">
                  Description & Scope Notes:
                </span>
                <p className="text-caption text-text-primary leading-relaxed bg-surface-hover/40 p-2.5 rounded-md">
                  {submission.description}
                </p>
              </div>
            </div>

            {/* Evidence Attachments Gallery */}
            <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-body font-semibold text-text-primary">
                  Supporting Evidence & Submissions ({submission.evidence_items.length})
                </h3>
                <span className="text-caption text-text-muted">
                  {submission.invoice_numbers.length > 0 &&
                    `Invoices: ${submission.invoice_numbers.join(", ")}`}
                </span>
              </div>

              <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
                {submission.evidence_items.map((ev) => (
                  <div key={ev.id} className="p-3 flex items-center justify-between text-caption bg-surface hover:bg-surface-hover transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-hover text-text-muted mt-0.5">
                        {ev.type === "PHOTO" ? (
                          <Camera className="h-4 w-4 text-primary" />
                        ) : ev.type === "LIEN_WAIVER" ? (
                          <FileCheck className="h-4 w-4 text-success" />
                        ) : (
                          <FileText className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-text-primary flex items-center gap-2">
                          <span>{ev.filename}</span>
                          {ev.invoice_number && (
                            <span className="rounded bg-primary-subtle px-1.5 py-0.2 text-caption text-primary font-mono">
                              #{ev.invoice_number}
                            </span>
                          )}
                        </div>
                        <div className="text-text-muted text-caption mt-0.5">
                          {ev.vendor_name && <span>{ev.vendor_name} • </span>}
                          {ev.amount && <span>{formatMoney(ev.amount)} • </span>}
                          <span>{ev.type}</span>
                          {ev.notes && <span> — {ev.notes}</span>}
                        </div>
                      </div>
                    </div>

                    {ev.type === "PHOTO" && (
                      <button
                        type="button"
                        onClick={() => setSelectedPhoto(ev.filename)}
                        className="text-primary hover:underline font-medium text-caption flex items-center gap-1"
                      >
                        <span>Preview</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Generated Governance Tasks */}
            <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
              <h3 className="text-body font-semibold text-text-primary">
                Delegated Sponsor Tasks ({submission.created_task_ids.length})
              </h3>
              <p className="text-caption text-text-muted">
                Submitting this package automatically populated actionable tasks in the Sponsor/PM/CFO Readiness dashboard.
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded bg-surface-hover text-caption border border-border">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-primary-subtle px-1.5 py-0.5 font-bold text-primary">PM</span>
                    <span className="text-text-primary">Verify physical milestone progress & inspect 5 site photos</span>
                  </div>
                  <span className="text-text-muted font-medium">David Ross</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-surface-hover text-caption border border-border">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-primary-subtle px-1.5 py-0.5 font-bold text-primary">CFO</span>
                    <span className="text-text-primary">Verify cost substantiation, lien waivers & 10% retainage</span>
                  </div>
                  <span className="text-text-muted font-medium">Sarah Lin</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-surface-hover text-caption border border-border">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-primary-subtle px-1.5 py-0.5 font-bold text-primary">OWNER</span>
                    <span className="text-text-primary">Authorize sponsor approval for draw inclusion</span>
                  </div>
                  <span className="text-text-muted font-medium">Marcus Vance</span>
                </div>
              </div>
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Review Gate Modal */}
      <ReviewSubmissionModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        submission={submission}
        currentRole={currentRole}
        onSuccess={() => {
          onRefresh?.();
        }}
      />

      {/* Photo Lightbox Preview Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-2xl w-full rounded-lg bg-surface p-4 shadow-xl space-y-3"
          >
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h4 className="text-body font-semibold text-text-primary flex items-center gap-2">
                <Camera className="h-4 w-4 text-primary" />
                {selectedPhoto}
              </h4>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="text-text-muted hover:text-text-primary"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video w-full rounded-lg bg-surface-hover border border-border flex flex-col items-center justify-center text-text-muted space-y-2">
              <Camera className="h-12 w-12 text-primary/40" />
              <div className="text-caption font-medium text-text-secondary">
                Site Inspection Photo Preview Canvas
              </div>
              <div className="text-caption text-text-muted">
                Metadata: Timestamp 2025-09-18 • GPS 40.7128° N, 74.0060° W
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
