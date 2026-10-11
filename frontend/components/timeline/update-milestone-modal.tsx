"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/ui/modal";
import { FormField } from "@/components/ui/form-field";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { MilestoneItem } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { Clock, AlertTriangle, CheckCircle, DollarSign, Calendar } from "lucide-react";

interface UpdateMilestoneModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestone: MilestoneItem | null;
  projectId: string;
}

export function UpdateMilestoneModal({
  open,
  onOpenChange,
  milestone,
  projectId,
}: UpdateMilestoneModalProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [actualStart, setActualStart] = useState("");
  const [actualEnd, setActualEnd] = useState("");
  const [percentComplete, setPercentComplete] = useState<number>(0);
  const [forecastEnd, setForecastEnd] = useState("");
  const [status, setStatus] = useState<MilestoneItem["status"]>("NOT_STARTED");
  const [delayCause, setDelayCause] = useState("");
  const [updateRationale, setUpdateRationale] = useState("");
  const [criticalPath, setCriticalPath] = useState(true);

  // Sync state when milestone opens
  useEffect(() => {
    if (milestone) {
      setActualStart(milestone.actual_start || "");
      setActualEnd(milestone.actual_end || "");
      setPercentComplete(milestone.percent_complete || 0);
      setForecastEnd(milestone.forecast_end || milestone.planned_end);
      setStatus(milestone.status);
      setDelayCause(milestone.delay_cause || "");
      setUpdateRationale(milestone.update_rationale || "");
      setCriticalPath(milestone.critical_path ?? true);
      setError(null);
    }
  }, [milestone, open]);

  if (!milestone) return null;

  // Calculate live delay & carry cost impact
  const plannedEndMs = new Date(milestone.planned_end).getTime();
  const forecastEndMs = forecastEnd ? new Date(forecastEnd).getTime() : plannedEndMs;
  const liveDelayDays = Math.max(0, Math.round((forecastEndMs - plannedEndMs) / (1000 * 60 * 60 * 24)));
  const liveCarryCostCents = Math.round((liveDelayDays / 30) * 18500 * 100);
  const isForecastMoved = forecastEnd !== milestone.forecast_end;
  const isDelayedPastBaseline = liveDelayDays > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Domain rule: moving forecast date requires an explicit reason
    if ((isForecastMoved || isDelayedPastBaseline) && !updateRationale.trim() && !delayCause.trim()) {
      setError("An explicit delay cause or update rationale is mandatory when forecast completion moves.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.progress.updateMilestone(milestone.id, {
        actual_start: actualStart.trim() || undefined,
        actual_end: actualEnd.trim() || undefined,
        percent_complete: percentComplete,
        forecast_end: forecastEnd,
        status: percentComplete === 100 ? "COMPLETED" : isDelayedPastBaseline ? "AT_RISK" : status,
        delay_cause: delayCause.trim() || undefined,
        update_rationale: updateRationale.trim() || delayCause.trim(),
        critical_path: criticalPath,
      });

      await queryClient.invalidateQueries({ queryKey: ["milestones", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["milestone", milestone.id] });
      await queryClient.invalidateQueries({ queryKey: ["scheduleForecast", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["projectDashboard", projectId] });

      onOpenChange(false);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || "Failed to update milestone progress");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent maxWidth="lg">
        <ModalHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-subtle text-primary">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <ModalTitle>Update Milestone Progress & Forecast</ModalTitle>
              <ModalDescription>
                {milestone.name} &bull; Baseline Planned: {formatDate(milestone.planned_start)} to{" "}
                {formatDate(milestone.planned_end)}
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>

        {error && (
          <div className="rounded-md border border-danger/30 bg-danger-subtle p-3 text-caption text-danger flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          {/* Progress Slider & Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-subtle/40 p-3.5 rounded-lg border border-border">
            <div className="md:col-span-2 space-y-1.5">
              <div className="flex justify-between items-center text-caption">
                <span className="font-semibold text-text-primary">Physical Completion Percentage</span>
                <span className="tabular-nums font-bold text-primary text-body">{percentComplete}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={percentComplete}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setPercentComplete(val);
                  if (val === 100) {
                    setStatus("COMPLETED");
                    if (!actualEnd) setActualEnd(new Date().toISOString().split("T")[0]);
                  } else if (val > 0 && status === "NOT_STARTED") {
                    setStatus("IN_PROGRESS");
                    if (!actualStart) setActualStart(new Date().toISOString().split("T")[0]);
                  }
                }}
                className="w-full accent-primary h-2 bg-border rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-text-muted">
                <span>0% (Not Started)</span>
                <span>50% (Mid-Phase)</span>
                <span>100% (Substantially Complete)</span>
              </div>
            </div>

            <div>
              <FormField label="Lifecycle Status">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as MilestoneItem["status"])}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="AT_RISK">At Risk</option>
                  <option value="DELAYED">Delayed</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </FormField>
            </div>
          </div>

          {/* Dates & Forecast */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <FormField label="Actual Start Date" helperText="Date work physically commenced">
                <input
                  type="date"
                  value={actualStart}
                  onChange={(e) => setActualStart(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </FormField>
            </div>

            <div>
              <FormField label="Actual Finish Date" helperText="100% signoff date (if completed)">
                <input
                  type="date"
                  value={actualEnd}
                  onChange={(e) => setActualEnd(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </FormField>
            </div>

            <div>
              <FormField
                label="Forecast Finish Date"
                required
                helperText="Projected completion based on current pace"
              >
                <input
                  type="date"
                  value={forecastEnd}
                  onChange={(e) => setForecastEnd(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </FormField>
            </div>
          </div>

          {/* Real-time Delay & Carry Exposure Impact Card */}
          {liveDelayDays > 0 ? (
            <div className="rounded-lg border border-danger/30 bg-danger-subtle p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-caption font-semibold text-danger">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Critical Schedule Delay Detected: +{liveDelayDays} Days</span>
                </div>
                <div className="text-caption font-semibold text-danger flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" />
                  <span>Est. Financing Carry: ${(liveCarryCostCents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              <p className="text-caption text-text-secondary">
                Moving forecast end to {formatDate(forecastEnd)} extends beyond the baseline deadline ({formatDate(milestone.planned_end)}). At $18,500/month loan interest carry, this delay accumulates financial exposure on senior debt.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-success/30 bg-success-subtle p-3 flex items-center justify-between text-caption text-success">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle className="h-4 w-4" />
                <span>On Schedule &bull; Forecast completion aligns with baseline target</span>
              </div>
              <span className="font-semibold">$0 Financing Carry Impact</span>
            </div>
          )}

          {/* Delay Cause & Update Rationale */}
          <div className="space-y-4">
            <FormField
              label="Delay Cause / Field Issues"
              helperText="Material backorders, labor shortages, permit delays, or weather conditions"
            >
              <input
                type="text"
                value={delayCause}
                onChange={(e) => setDelayCause(e.target.value)}
                placeholder="e.g. Mill fabricator delay on custom ASTM A992 wide-flange beams; port congestion."
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </FormField>

            <FormField
              label="Audit Log Update Rationale"
              required={isDelayedPastBaseline || isForecastMoved}
              helperText={
                isDelayedPastBaseline || isForecastMoved
                  ? "Mandatory explanation recorded in permanent project audit trail."
                  : "Optional notes for schedule record."
              }
            >
              <textarea
                value={updateRationale}
                onChange={(e) => setUpdateRationale(e.target.value)}
                rows={2}
                placeholder="Explain the technical or logistical reason for this progress update..."
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </FormField>
          </div>

          <ModalFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="rounded-md border border-border px-4 py-2 text-body font-medium text-text-secondary hover:bg-subtle"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-body font-medium text-white hover:bg-primary-hover focus-visible:outline-primary disabled:opacity-50"
            >
              {isSubmitting ? "Saving Update..." : "Confirm & Save Progress"}
            </button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
