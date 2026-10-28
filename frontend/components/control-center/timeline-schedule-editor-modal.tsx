"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  CalendarClock,
  RotateCcw,
  Save,
} from "lucide-react";
import {
  predictTimelineSchedule,
  toHtmlDateInput,
  fromHtmlDateInput,
  parseDateUTC,
  ComputedMilestoneSchedule,
} from "@/lib/utils/timeline-prediction";
import { cn } from "@/lib/utils";

interface TimelineScheduleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDelayDays?: number;
  initialOverrides?: Record<string, string>;
  onSaveSchedule: (data: {
    delayDays: number;
    userOverrides: Record<string, string>;
    computedMilestones: ComputedMilestoneSchedule[];
    finalCoDate: string;
    interestCarryFormatted: string;
  }) => void;
}

export function TimelineScheduleEditorModal({
  isOpen,
  onClose,
  initialDelayDays = 35,
  initialOverrides = {},
  onSaveSchedule,
}: TimelineScheduleEditorModalProps) {
  const [delayDays, setDelayDays] = useState<number>(initialDelayDays);
  const [userOverrides, setUserOverrides] = useState<Record<string, string>>(initialOverrides);

  // Sync state if initial props change when modal opens
  useEffect(() => {
    if (isOpen) {
      setDelayDays(initialDelayDays);
      setUserOverrides(initialOverrides);
    }
  }, [isOpen, initialDelayDays, initialOverrides]);

  // Compute effective delay days if HVAC target date is directly modified
  const effectiveDelayDays = useMemo(() => {
    if (userOverrides["tl-14"]) {
      const d = parseDateUTC(userOverrides["tl-14"]).getTime();
      const base = parseDateUTC("Oct 20, 2025").getTime();
      return Math.max(0, Math.round((d - base) / (1000 * 60 * 60 * 24)));
    }
    return delayDays;
  }, [userOverrides, delayDays]);

  // Compute live prediction based on current delay and user date overrides
  const predictedSchedule = useMemo(() => {
    return predictTimelineSchedule(effectiveDelayDays, userOverrides);
  }, [effectiveDelayDays, userOverrides]);

  // Handle individual milestone date override
  const handleDateChange = (milestoneId: string, htmlDateVal: string) => {
    if (!htmlDateVal) {
      // Clear override if input cleared
      const nextOverrides = { ...userOverrides };
      delete nextOverrides[milestoneId];
      setUserOverrides(nextOverrides);
      return;
    }
    const formattedDisplay = fromHtmlDateInput(htmlDateVal);
    setUserOverrides((prev) => ({
      ...prev,
      [milestoneId]: formattedDisplay,
    }));
  };

  // Reset a specific milestone back to predicted
  const handleResetMilestone = (milestoneId: string) => {
    setUserOverrides((prev) => {
      const copy = { ...prev };
      delete copy[milestoneId];
      return copy;
    });
  };

  // Re-predict all dates (discard custom manual date overrides)
  const handleAutoPredictAll = () => {
    setUserOverrides({});
  };

  const handleSave = () => {
    onSaveSchedule({
      delayDays: effectiveDelayDays,
      userOverrides,
      computedMilestones: predictedSchedule.milestones,
      finalCoDate: predictedSchedule.finalCoDate,
      interestCarryFormatted: predictedSchedule.interestCarry.formatted,
    });
    onClose();
  };

  const hasAnyOverrides = Object.keys(userOverrides).length > 0;

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent
        maxWidth="xl"
        className="max-h-[92vh] flex flex-col p-0 overflow-hidden bg-white border border-slate-300 shadow-xl"
      >
        {/* Header */}
        <ModalHeader className="px-5 pt-4 pb-3 border-b border-slate-200/90 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2 text-slate-800">
            <CalendarClock className="h-5 w-5 text-blue-600 shrink-0" />
            <ModalTitle className="text-base font-bold text-slate-900">
              Edit Construction Timeline & Milestone Targets
            </ModalTitle>
          </div>
          <ModalDescription className="text-xs text-slate-500 mt-0.5">
            Customize target dates for remaining construction milestones. Downstream milestones auto-predict sequentially from preceding tasks.
          </ModalDescription>
        </ModalHeader>

        {/* Scrollable Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs flex-1">
          {/* Milestones Header & Quick Recalculate */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200">
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Milestones & Target Dates
              </h4>
              <p className="text-[11px] text-slate-500">
                Target dates cascade automatically. You can edit any milestone target date directly below.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {hasAnyOverrides && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAutoPredictAll}
                  className="h-7 text-xs text-blue-700 hover:text-blue-800 hover:bg-blue-50 font-medium gap-1 cursor-pointer"
                  title="Clear custom overrides and recalculate predictions"
                >
                  <RotateCcw className="h-3 w-3" />
                  Auto-Predict All Dates
                </Button>
              )}
            </div>
          </div>

          {/* Milestones List */}
          <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 bg-white">
            {predictedSchedule.milestones.map((milestone, idx) => {
              const isOverridden = milestone.isUserOverridden;
              const htmlDate = toHtmlDateInput(milestone.targetDate);

              return (
                <div
                  key={milestone.id}
                  className={cn(
                    "p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors",
                    milestone.status === "Delayed"
                      ? "bg-amber-50/50"
                      : idx % 2 === 0
                      ? "bg-white"
                      : "bg-slate-50/40"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                        {milestone.code}
                      </span>
                      <span className="font-semibold text-slate-900 truncate">
                        {milestone.name}
                      </span>
                      {isOverridden && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          Custom Target
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                      <span>Predicted: <strong className="font-mono text-slate-700">{milestone.predictedDate}</strong></span>
                      {milestone.delayNotice && (
                        <span className="text-amber-700 font-medium">({milestone.delayNotice})</span>
                      )}
                    </div>
                  </div>

                  {/* Date Input & Controls */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <div className="flex items-center gap-1.5">
                      <label htmlFor={`date-${milestone.id}`} className="text-[11px] text-slate-500">
                        Target:
                      </label>
                      <input
                        id={`date-${milestone.id}`}
                        type="date"
                        value={htmlDate}
                        onChange={(e) => handleDateChange(milestone.id, e.target.value)}
                        className={cn(
                          "px-2 py-1 text-xs font-mono font-medium rounded-md border transition-colors focus:outline-hidden",
                          isOverridden
                            ? "border-amber-400 bg-amber-50/70 text-amber-950 font-bold focus:border-amber-500"
                            : "border-slate-300 bg-white text-slate-800 focus:border-blue-500"
                        )}
                      />
                    </div>

                    {isOverridden && (
                      <button
                        type="button"
                        onClick={() => handleResetMilestone(milestone.id)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Reset to predicted date"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Substantial Completion Impact Card */}
          <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-950 block">
                Projected Substantial Completion & Certificate of Occupancy
              </span>
              <span className="text-xs text-indigo-800">
                Baseline Project Target: <strong>Nov 10, 2025</strong> → Revised Forecast Completion: <strong>{predictedSchedule.finalCoDate}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
              <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 font-bold border border-indigo-300">
                Forecast: {predictedSchedule.finalCoDate}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <ModalFooter className="px-5 py-3 border-t border-slate-200 bg-slate-50/90 flex flex-row items-center justify-end gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSave}
            className="text-xs font-semibold gap-1.5 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" />
            Save Timeline Schedule
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
