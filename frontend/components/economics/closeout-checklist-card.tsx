"use client";

import React from "react";
import { CloseoutReport, PostCloseoutAdjustment } from "@/lib/types";
import { formatMoney, formatDate } from "@/lib/format";
import {
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  FileText,
  Lock,
  Wrench,
  Plus,
  ArrowRight,
} from "lucide-react";

interface CloseoutChecklistCardProps {
  report: CloseoutReport | undefined;
  onOpenApproveCloseoutModal: () => void;
  onOpenPostCloseoutAdjustmentModal: () => void;
  isOwnerOrCFO: boolean;
}

export function CloseoutChecklistCard({
  report,
  onOpenApproveCloseoutModal,
  onOpenPostCloseoutAdjustmentModal,
  isOwnerOrCFO,
}: CloseoutChecklistCardProps) {
  if (!report) return null;

  const isClosed = report.lifecycle_stage === "CLOSED" || report.status === "CLOSED";
  const checklist = report.checklist || [];
  const adjustments = report.post_closeout_adjustments || [];
  const satisfiedCount = checklist.filter((c) => c.is_satisfied).length;
  const pct = Math.round((satisfiedCount / Math.max(1, checklist.length)) * 100);

  return (
    <div className="space-y-6">
      {/* Approved Closeout Banner (if project is CLOSED) */}
      {isClosed && report.approved_closeout_record && (
        <div className="rounded-lg border border-success/40 bg-success-subtle/50 p-4 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-body font-bold text-success">
              <ShieldCheck className="h-5 w-5" />
              <span>Audited Project Closeout Approved</span>
            </div>
            <span className="rounded bg-surface border border-success/30 px-2.5 py-0.5 font-mono text-caption font-semibold text-text-primary">
              Cert #{report.approved_closeout_record.closeout_certificate_id}
            </span>
          </div>

          <p className="text-caption text-text-primary">
            Approved by <strong className="text-text-primary">{report.approved_closeout_record.approved_by}</strong> on{" "}
            {formatDate(report.approved_closeout_record.approved_at)}.
          </p>

          <div className="text-caption text-text-secondary italic border-t border-success/20 pt-1.5">
            &ldquo;{report.approved_closeout_record.rationale}&rdquo;
          </div>
        </div>
      )}

      {/* Closeout Status Header & Progress Meter */}
      <div className="rounded-lg border border-border bg-surface p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-section font-bold text-text-primary flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Project Closeout & Governance Readiness
            </h3>
            <p className="text-caption text-text-secondary mt-0.5">
              Comprehensive municipal, financing, contractor lien, and investor audit validation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isClosed && isOwnerOrCFO && (
              <button
                type="button"
                onClick={onOpenApproveCloseoutModal}
                className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-caption font-semibold text-white hover:bg-primary-hover shadow-xs"
              >
                <Lock className="h-4 w-4" />
                Approve Project Closeout
              </button>
            )}

            {isClosed && isOwnerOrCFO && (
              <button
                type="button"
                onClick={onOpenPostCloseoutAdjustmentModal}
                className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-caption font-semibold text-text-primary hover:bg-subtle"
              >
                <Wrench className="h-4 w-4" />
                Record Post-Closeout Adjustment
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-caption">
            <span className="font-semibold text-text-primary">Closeout Verification Progress</span>
            <span className="font-bold tabular-nums text-text-primary">
              {satisfiedCount} of {checklist.length} Gates Verified ({pct}%)
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-subtle overflow-hidden">
            <div
              className={`h-full ${isClosed ? "bg-success" : pct > 70 ? "bg-primary" : "bg-warning"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Checklist Items */}
        <div className="divide-y divide-border border-t border-border mt-2">
          {checklist.map((item, idx) => (
            <div key={item.id} className="py-3.5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">
                  {item.is_satisfied ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-warning" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-text-primary text-body flex items-center gap-2">
                    <span>{item.title}</span>
                    <span className="rounded bg-subtle px-1.5 py-0.5 text-[10px] font-mono text-text-secondary">
                      {item.category}
                    </span>
                  </div>

                  {item.is_satisfied ? (
                    <div className="text-[11px] text-text-muted mt-0.5 flex items-center gap-2">
                      <span>Verified {item.verified_at ? formatDate(item.verified_at) : "Complete"}</span>
                      {item.verified_by && <span>&bull; by {item.verified_by}</span>}
                      {item.document_name && (
                        <span className="text-primary flex items-center gap-0.5">
                          <FileText className="h-3 w-3" /> {item.document_name}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-caption text-danger mt-0.5 font-medium">
                      Blocked: {item.blocker_reason}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-shrink-0 text-[11px]">
                {item.is_satisfied ? (
                  <span className="inline-flex items-center rounded-full bg-success-subtle px-2.5 py-0.5 font-semibold text-success">
                    Satisfied
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-warning-subtle px-2.5 py-0.5 font-semibold text-warning">
                    Action Required
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Post-Closeout Adjustments Register */}
      {adjustments.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-body font-bold text-text-primary flex items-center gap-2">
                <Wrench className="h-4 w-4 text-warning" />
                Labelled Post-Closeout Adjustments
              </h4>
              <p className="text-caption text-text-secondary">
                Audited warranty repairs and tax true-ups recognized following project closing without modifying historical totals.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full text-left text-body">
              <thead>
                <tr className="border-b border-border bg-subtle/50 text-caption font-semibold text-text-secondary">
                  <th className="py-2.5 px-3">Adjustment Category</th>
                  <th className="py-2.5 px-3">Direction</th>
                  <th className="py-2.5 px-3">Effective Date</th>
                  <th className="py-2.5 px-3">Audited Rationale</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {adjustments.map((adj) => (
                  <tr key={adj.id} className="text-caption hover:bg-subtle/20">
                    <td className="py-3 px-3 font-semibold text-text-primary">
                      {adj.category}
                      {adj.document_name && (
                        <div className="text-[11px] text-primary flex items-center gap-1 mt-0.5">
                          <FileText className="h-3 w-3" /> {adj.document_name}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="rounded bg-subtle px-2 py-0.5 font-mono text-[10px] font-bold">
                        {adj.direction}
                      </span>
                    </td>
                    <td className="py-3 px-3 tabular-nums text-text-secondary">
                      {formatDate(adj.effective_date)}
                    </td>
                    <td className="py-3 px-3 text-text-secondary">
                      {adj.rationale}
                      <div className="text-[10px] text-text-muted mt-0.5">
                        Recorded by {adj.recorded_by}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums font-bold text-text-primary">
                      {adj.direction === "DEBIT" ? "-" : "+"}
                      {formatMoney(adj.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
