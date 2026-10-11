"use client";

import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { MilestoneItem, MilestoneEvidence } from "@/lib/types";
import { formatDate, formatMoney } from "@/lib/format";
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileCheck,
  FileText,
  Camera,
  ShieldCheck,
  Flame,
  Scale,
  Link as LinkIcon,
  Plus,
  User,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface MilestoneDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestone: MilestoneItem | null;
  allMilestones: MilestoneItem[];
  onOpenUpdateModal: (milestone: MilestoneItem) => void;
  onOpenAttachEvidenceModal: (milestone: MilestoneItem) => void;
  onOpenResolveDiscrepancyModal: (milestone: MilestoneItem) => void;
  onSelectMilestone: (milestone: MilestoneItem) => void;
}

export function MilestoneDetailDrawer({
  open,
  onOpenChange,
  milestone,
  allMilestones,
  onOpenUpdateModal,
  onOpenAttachEvidenceModal,
  onOpenResolveDiscrepancyModal,
  onSelectMilestone,
}: MilestoneDetailDrawerProps) {
  if (!milestone) return null;

  const isDelayed = (milestone.delay_days || 0) > 0;
  const hasConflict =
    milestone.progress_conflict?.has_conflict &&
    milestone.progress_conflict.status === "OPEN";

  // Predecessors and Successors
  const predecessors = allMilestones.filter((m) =>
    milestone.dependencies?.includes(m.id)
  );
  const successors = allMilestones.filter((m) =>
    m.dependencies?.includes(milestone.id)
  );

  const evidenceList = milestone.evidence_attachments || [];

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent width="wide">
        <DrawerHeader>
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {milestone.budget_line_code && (
                <span className="rounded bg-subtle px-2 py-0.5 text-caption font-mono font-semibold text-text-secondary">
                  CSI {milestone.budget_line_code}
                </span>
              )}
              {milestone.critical_path && (
                <span className="inline-flex items-center gap-1 rounded bg-danger-subtle px-2 py-0.5 text-caption font-bold text-danger">
                  <Flame className="h-3.5 w-3.5" /> Critical Path
                </span>
              )}
              {milestone.status === "COMPLETED" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-success-subtle px-2.5 py-0.5 text-caption font-semibold text-success">
                  <CheckCircle className="h-3.5 w-3.5" /> Completed
                </span>
              )}
              {milestone.status === "AT_RISK" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-danger-subtle px-2.5 py-0.5 text-caption font-semibold text-danger">
                  <AlertTriangle className="h-3.5 w-3.5" /> At Risk
                </span>
              )}
              {milestone.status === "IN_PROGRESS" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-subtle px-2.5 py-0.5 text-caption font-semibold text-primary">
                  <Clock className="h-3.5 w-3.5" /> In Progress
                </span>
              )}
              {milestone.status === "NOT_STARTED" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-subtle px-2.5 py-0.5 text-caption font-semibold text-text-muted">
                  Not Started
                </span>
              )}
            </div>

            <DrawerTitle>{milestone.name}</DrawerTitle>
            <DrawerDescription>
              {milestone.description || "Milestone progress, critical path tracking, and evidence inspection."}
            </DrawerDescription>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Active Discrepancy Dispute Banner */}
          {hasConflict && milestone.progress_conflict && (
            <div className="rounded-lg border border-danger/40 bg-danger-subtle/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-caption font-bold text-danger">
                  <Scale className="h-4 w-4" />
                  <span>Progress Verification Dispute Active</span>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenResolveDiscrepancyModal(milestone)}
                  className="rounded-md bg-danger px-3 py-1 text-caption font-medium text-white hover:bg-danger/90"
                >
                  Resolve Dispute
                </button>
              </div>

              <p className="text-caption text-text-secondary">
                PM reports <strong className="text-text-primary">{milestone.progress_conflict.pm_percent}%</strong> completion, but third-party certified inspection ({milestone.progress_conflict.inspector_report_name}) certifies <strong className="text-danger">{milestone.progress_conflict.inspector_percent}%</strong> ({milestone.progress_conflict.discrepancy_percent}% variance &bull; {formatMoney(milestone.progress_conflict.estimated_value_at_risk)} at risk).
              </p>
            </div>
          )}

          {/* Core Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg border border-border bg-surface p-3">
              <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                Progress
              </div>
              <div className="text-title font-bold text-text-primary tabular-nums mt-1">
                {milestone.percent_complete}%
              </div>
              <div className="mt-1 h-1.5 w-full rounded-full bg-subtle overflow-hidden">
                <div
                  className={`h-full ${
                    milestone.status === "COMPLETED"
                      ? "bg-success"
                      : isDelayed
                      ? "bg-danger"
                      : "bg-primary"
                  }`}
                  style={{ width: `${milestone.percent_complete}%` }}
                />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-3">
              <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                Schedule Variance
              </div>
              <div
                className={`text-title font-bold tabular-nums mt-1 ${
                  isDelayed ? "text-danger" : "text-success"
                }`}
              >
                {isDelayed ? `+${milestone.delay_days}d` : "0d"}
              </div>
              <div className="text-[11px] text-text-muted mt-0.5">
                {isDelayed ? "Critical delay" : "On schedule"}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-3">
              <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                Financing Carry
              </div>
              <div
                className={`text-title font-bold tabular-nums mt-1 ${
                  isDelayed ? "text-danger" : "text-text-primary"
                }`}
              >
                {milestone.carry_cost_amount
                  ? formatMoney(milestone.carry_cost_amount)
                  : "$0.00"}
              </div>
              <div className="text-[11px] text-text-muted mt-0.5">
                $18,500 / month carry
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-3">
              <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                Evidence Files
              </div>
              <div className="text-title font-bold text-text-primary tabular-nums mt-1">
                {evidenceList.length}
              </div>
              <div className="text-[11px] text-text-muted mt-0.5">
                Photos, permits, inspections
              </div>
            </div>
          </div>

          {/* Schedule Dates Breakdown */}
          <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
            <h4 className="text-caption font-semibold uppercase tracking-wider text-text-secondary">
              Schedule Dates Comparison
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-md border border-border bg-subtle/30 p-3">
                <span className="text-[11px] font-semibold text-text-muted">Baseline Planned</span>
                <div className="text-body font-semibold text-text-primary tabular-nums mt-1">
                  {formatDate(milestone.planned_start)} &rarr; {formatDate(milestone.planned_end)}
                </div>
                <div className="text-[11px] text-text-muted mt-0.5">Immutable contract baseline</div>
              </div>

              <div className="rounded-md border border-border bg-subtle/30 p-3">
                <span className="text-[11px] font-semibold text-text-muted">Actual Dates</span>
                <div className="text-body font-semibold text-text-primary tabular-nums mt-1">
                  {milestone.actual_start ? formatDate(milestone.actual_start) : "Not started"} &rarr;{" "}
                  {milestone.actual_end ? formatDate(milestone.actual_end) : "Incomplete"}
                </div>
                <div className="text-[11px] text-text-muted mt-0.5">Field execution actuals</div>
              </div>

              <div
                className={`rounded-md border p-3 ${
                  isDelayed
                    ? "border-danger/40 bg-danger-subtle/30"
                    : "border-border bg-subtle/30"
                }`}
              >
                <span className={`text-[11px] font-semibold ${isDelayed ? "text-danger" : "text-text-muted"}`}>
                  Forecast Completion
                </span>
                <div
                  className={`text-body font-bold tabular-nums mt-1 ${
                    isDelayed ? "text-danger" : "text-text-primary"
                  }`}
                >
                  {formatDate(milestone.forecast_end || milestone.planned_end)}
                </div>
                <div className="text-[11px] text-text-muted mt-0.5">
                  {isDelayed ? `+${milestone.delay_days} days past baseline` : "Matches baseline"}
                </div>
              </div>
            </div>
          </div>

          {/* Delay Cause & Mitigation */}
          {milestone.delay_cause && (
            <div className="rounded-lg border border-danger/30 bg-danger-subtle/30 p-4 space-y-2">
              <div className="flex items-center gap-2 text-caption font-bold text-danger">
                <AlertTriangle className="h-4 w-4" />
                <span>Delay Cause & Schedule Attribution</span>
              </div>
              <p className="text-body text-text-primary">{milestone.delay_cause}</p>
              <div className="text-caption text-text-secondary pt-1 border-t border-danger/20">
                Financing exposure accumulation: <span className="font-semibold text-danger">$18,500 / month interest carry</span> on Columbia Bank loan advance.
              </div>
            </div>
          )}

          {/* Linked Budget Line */}
          {milestone.budget_line_name && (
            <div className="rounded-lg border border-border bg-surface p-4 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                Linked CSI Budget Line
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-body font-semibold text-text-primary">
                    {milestone.budget_line_code} &bull; {milestone.budget_line_name}
                  </div>
                  <div className="text-caption text-text-secondary mt-0.5">
                    Responsible Trade: {milestone.responsible_party || "General Contractor"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dependencies Graph Section */}
          <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-caption font-semibold uppercase tracking-wider text-text-secondary">
              <LinkIcon className="h-3.5 w-3.5" />
              <span>Milestone Dependencies</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Predecessors */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-text-muted">Predecessors (Must finish first):</span>
                {predecessors.length === 0 ? (
                  <div className="text-caption text-text-muted italic bg-subtle/30 p-2 rounded">
                    No predecessor dependencies (Initial phase)
                  </div>
                ) : (
                  predecessors.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onSelectMilestone(p)}
                      className="w-full flex items-center justify-between p-2 rounded bg-subtle/40 hover:bg-subtle border border-border/60 text-left transition-colors"
                    >
                      <span className="text-caption font-medium text-text-primary truncate">
                        {p.name}
                      </span>
                      <span className="text-[11px] tabular-nums font-semibold text-text-secondary flex items-center gap-1">
                        {p.percent_complete}% <ArrowRight className="h-3 w-3" />
                      </span>
                    </button>
                  ))
                )}
              </div>

              {/* Successors */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-text-muted">Successors (Blocked by this):</span>
                {successors.length === 0 ? (
                  <div className="text-caption text-text-muted italic bg-subtle/30 p-2 rounded">
                    No downstream successors (Final phase)
                  </div>
                ) : (
                  successors.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => onSelectMilestone(s)}
                      className="w-full flex items-center justify-between p-2 rounded bg-subtle/40 hover:bg-subtle border border-border/60 text-left transition-colors"
                    >
                      <span className="text-caption font-medium text-text-primary truncate">
                        {s.name}
                      </span>
                      <span className="text-[11px] tabular-nums font-semibold text-text-secondary flex items-center gap-1">
                        {s.percent_complete}% <ArrowRight className="h-3 w-3" />
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Evidence Attachments Gallery */}
          <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-caption font-semibold uppercase tracking-wider text-text-secondary">
                <FileCheck className="h-4 w-4 text-primary" />
                <span>Verification Evidence & Certifications ({evidenceList.length})</span>
              </div>
              <button
                type="button"
                onClick={() => onOpenAttachEvidenceModal(milestone)}
                className="flex items-center gap-1 rounded bg-primary-subtle px-2.5 py-1 text-caption font-medium text-primary hover:bg-primary-subtle/80"
              >
                <Plus className="h-3.5 w-3.5" /> Attach Evidence
              </button>
            </div>

            {evidenceList.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-border rounded-lg">
                <FileText className="mx-auto h-6 w-6 text-text-muted" />
                <p className="mt-1 text-caption text-text-muted">
                  No evidence files attached yet. Upload photos, inspection tickets, or DOB permits.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {evidenceList.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-subtle/20 hover:bg-subtle/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-surface border border-border text-primary flex-shrink-0">
                        {ev.type === "PHOTO" && <Camera className="h-4 w-4" />}
                        {ev.type === "INSPECTION_REPORT" && <FileCheck className="h-4 w-4 text-success" />}
                        {ev.type === "PERMIT" && <ShieldCheck className="h-4 w-4 text-blue-600" />}
                        {ev.type === "ENGINEERING_MEMO" && <FileText className="h-4 w-4 text-purple-600" />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-text-primary text-caption truncate">
                          {ev.filename}
                        </div>
                        <div className="text-[11px] text-text-secondary truncate">
                          {ev.inspector_name ? `${ev.inspector_name} • ` : ""}
                          {ev.notes || "Uploaded progress evidence"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 text-[11px]">
                      <span className="inline-flex items-center rounded-full bg-success-subtle px-2 py-0.5 font-semibold text-success">
                        Verified
                      </span>
                      <span className="text-text-muted">{formatDate(ev.uploaded_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audit Trail & History */}
          <div className="rounded-lg border border-border bg-subtle/30 p-3.5 space-y-1.5 text-[11px] text-text-muted">
            <div className="flex items-center justify-between">
              <span>Last updated by: <strong className="text-text-primary">{milestone.last_updated_by || "David Ross (PM)"}</strong></span>
              <span>{milestone.last_updated_at ? formatDate(milestone.last_updated_at) : "Baseline"}</span>
            </div>
            {milestone.update_rationale && (
              <div className="text-text-secondary italic border-t border-border/40 pt-1">
                &ldquo;{milestone.update_rationale}&rdquo;
              </div>
            )}
          </div>
        </div>

        <DrawerFooter>
          <button
            type="button"
            onClick={() => onOpenAttachEvidenceModal(milestone)}
            className="flex items-center justify-center gap-1.5 rounded-md border border-border bg-surface px-4 py-2 text-body font-medium text-text-primary hover:bg-subtle"
          >
            <Plus className="h-4 w-4" />
            Attach Evidence
          </button>
          <button
            type="button"
            onClick={() => onOpenUpdateModal(milestone)}
            className="flex items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2 text-body font-medium text-white hover:bg-primary-hover focus-visible:outline-primary"
          >
            <Clock className="h-4 w-4" />
            Update Progress & Forecast
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
