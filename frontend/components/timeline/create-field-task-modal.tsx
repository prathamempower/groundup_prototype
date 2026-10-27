"use client";

import React, { useState } from "react";
import { X, Plus, Calendar, Clock, User, Building2, AlertTriangle } from "lucide-react";
import { ConstructionTask } from "@/lib/data/construction-calendar-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateFieldTaskModalProps {
  open: boolean;
  onClose: () => void;
  defaultDate?: string;
  projectId: string;
  onCreateTask: (newTask: ConstructionTask) => void;
}

export function CreateFieldTaskModal({
  open,
  onClose,
  defaultDate,
  projectId,
  onCreateTask,
}: CreateFieldTaskModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(defaultDate || "2026-10-14");
  const [time, setTime] = useState("10:30 AM");
  const [phaseName, setPhaseName] = useState("Foundation & Concrete Pour");
  const [subcontractor, setSubcontractor] = useState("Apex Concrete Corp");
  const [supervisor, setSupervisor] = useState("David Rossi");
  const [createdBy, setCreatedBy] = useState("Divyanshu Rai (Project Owner)");
  const [scope, setScope] = useState("");
  const [isDelayed, setIsDelayed] = useState(false);
  const [delayDays, setDelayDays] = useState(2);
  const [delayCause, setDelayCause] = useState("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const phaseId = phaseName.includes("Excavation")
      ? "excavation"
      : phaseName.includes("Foundation")
      ? "foundation"
      : phaseName.includes("Framing")
      ? "framing"
      : phaseName.includes("MEP")
      ? "mep"
      : "critical";

    const newTask: ConstructionTask = {
      id: `task-${Date.now()}`,
      project_id: projectId || "default",
      title: title.trim(),
      date,
      time,
      phase_id: phaseId as any,
      phase_name: phaseName,
      status: isDelayed ? "DELAYED" : "IN_PROGRESS",
      is_delayed: isDelayed,
      delay_days: isDelayed ? delayDays : 0,
      delay_cause: isDelayed ? delayCause : undefined,
      trade_subcontractor: subcontractor.trim() || "Site Contractor",
      assigned_time_shift: time,
      site_supervisor: supervisor.trim() || "Field Supervisor",
      created_by: createdBy.trim() || "Divyanshu Rai (Project Owner)",
      created_by_role: "Project Owner",
      created_at: new Date().toISOString(),
      completion_stage_percent: isDelayed ? 20 : 50,
      quality_verification: isDelayed
        ? `Delayed (${delayDays} Days)`
        : "Pending Field Inspection",
      daily_field_work_scope: scope.trim() || "Scheduled site work log.",
      checklist: [
        { id: "c1", label: "Pre-work safety briefing completed", checked: true },
        { id: "c2", label: "Trade inspection sign-off", checked: false },
      ],
      photo_evidence_count: 0,
      photo_logs: [],
    };

    onCreateTask(newTask);
    onClose();
    // Reset
    setTitle("");
    setScope("");
    setIsDelayed(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Plus className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Create Task / Field Log
              </h2>
              <p className="text-[11px] text-slate-500">
                Allocate work to site calendar and assign field supervisors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Concrete Pour Zone 2, Steel Erection, Slump Test..."
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Allocated Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Time / Shift
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="10:30 AM"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Phase Milestone
              </label>
              <Select value={phaseName} onValueChange={(val) => setPhaseName(val)}>
                <SelectTrigger className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900">
                  <SelectValue placeholder="Select phase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Site Excavation & Grading">Site Excavation & Grading</SelectItem>
                  <SelectItem value="Foundation & Concrete Pour">Foundation & Concrete Pour</SelectItem>
                  <SelectItem value="Superstructure Framing">Superstructure Framing</SelectItem>
                  <SelectItem value="MEP Rough-Ins & Utilities">MEP Rough-Ins & Utilities</SelectItem>
                  <SelectItem value="Critical Path & Delays">Critical Path & Delays</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Trade Subcontractor
              </label>
              <input
                type="text"
                value={subcontractor}
                onChange={(e) => setSubcontractor(e.target.value)}
                placeholder="Subcontractor"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Site Supervisor
              </label>
              <input
                type="text"
                value={supervisor}
                onChange={(e) => setSupervisor(e.target.value)}
                placeholder="Supervisor"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Task Created By (Owner)
              </label>
              <input
                type="text"
                value={createdBy}
                onChange={(e) => setCreatedBy(e.target.value)}
                placeholder="Creator"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Field Work Scope & Objectives
            </label>
            <textarea
              rows={2}
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder="Detail the work scope, tests, and deliverables..."
              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          {/* Delay Toggle */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isDelayed}
                onChange={(e) => setIsDelayed(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-xs font-bold text-slate-800">
                Mark task as Delayed (Will show Red Dot on Calendar)
              </span>
            </label>

            {isDelayed && (
              <div className="mt-2.5 pt-2 border-t border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600">Delay Exposure:</span>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={delayDays}
                    onChange={(e) => setDelayDays(Number(e.target.value))}
                    className="w-16 rounded border border-red-300 px-2 py-0.5 text-xs font-bold text-red-700"
                  />
                  <span className="text-xs text-slate-500">days</span>
                </div>
                <input
                  type="text"
                  value={delayCause}
                  onChange={(e) => setDelayCause(e.target.value)}
                  placeholder="Reason for delay (e.g. material backorder, permit approval)"
                  className="w-full rounded border border-red-200 p-1.5 text-xs text-slate-800 focus:outline-none"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/80">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-xs"
            >
              Allocate Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
