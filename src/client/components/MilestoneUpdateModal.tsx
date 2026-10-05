// GroundUp AI — Milestone Progress & Inspection Modal
// Project Manager and GC field tool to update progress %, log inspections, and attribute delay sources

import React, { useState } from 'react';
import { X, CheckCircle2, Clock, Camera, AlertTriangle, FileCheck, Building, Calendar } from 'lucide-react';

interface MilestoneUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: {
    name: string;
    planned: string;
    actual: string | null;
    delayDays: number | null;
    status: string;
    source: string;
    progress?: number;
  };
  onUpdateMilestone: (updated: {
    name: string;
    progress: number;
    inspectionResult: 'PASSED' | 'FAILED' | 'PENDING' | 'SCHEDULED';
    inspectorName: string;
    delayDays: number;
    delayCause?: string;
    notes: string;
  }) => void;
}

export function MilestoneUpdateModal({
  isOpen,
  onClose,
  milestone,
  onUpdateMilestone,
}: MilestoneUpdateModalProps) {
  const [progress, setProgress] = useState(milestone.progress || (milestone.status === 'done' ? 100 : 75));
  const [inspectionResult, setInspectionResult] = useState<'PASSED' | 'FAILED' | 'PENDING' | 'SCHEDULED'>('PASSED');
  const [inspectorName, setInspectorName] = useState('Hoboken Municipal Inspector · J. Miller');
  const [delayDays, setDelayDays] = useState(milestone.delayDays || 14);
  const [delayCause, setDelayCause] = useState('MUNICIPAL_PERMIT');
  const [notes, setNotes] = useState('Rough plumbing passed rough township inspection. Green sticker posted on site.');
  const [photoUploaded, setPhotoUploaded] = useState(true);

  if (!isOpen) return null;

  const dailyCarryingCost = 324; // $324/day (9.75% on loan balance)
  const delayCarryingImpact = delayDays * dailyCarryingCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateMilestone({
      name: milestone.name,
      progress,
      inspectionResult,
      inspectorName,
      delayDays,
      delayCause,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{milestone.name} — Progress & Inspection</h3>
              <p className="text-xs text-slate-500">Verified field progress and delay attribution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Progress Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-700">Verified Physical Progress %</label>
              <span className="font-mono font-bold text-sm text-slate-900">{progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progress}
              onChange={(e) => setProgress(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>0% (Not Started)</span>
              <span>50% (Rough-In)</span>
              <span>100% (Substantial Complete)</span>
            </div>
          </div>

          {/* Inspection Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Inspection Status</label>
              <select
                value={inspectionResult}
                onChange={(e) => setInspectionResult(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
              >
                <option value="PASSED">Passed (Signed Off)</option>
                <option value="FAILED">Failed (Correction Notice)</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="PENDING">Pending Inspector</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Inspector / Agency</label>
              <input
                type="text"
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                required
              />
            </div>
          </div>

          {/* Delay Attribution */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Delay Attribution & Carry Impact</span>
              </span>
              <span className="font-mono font-bold text-amber-900">
                +${delayCarryingImpact.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-medium text-amber-800 mb-0.5">Delay Slip (Days)</label>
                <input
                  type="number"
                  min="0"
                  max="180"
                  value={delayDays}
                  onChange={(e) => setDelayDays(parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded font-mono font-bold text-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-amber-800 mb-0.5">Root Cause Tag</label>
                <select
                  value={delayCause}
                  onChange={(e) => setDelayCause(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-amber-300 rounded text-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
                >
                  <option value="MUNICIPAL_PERMIT">Municipal / Permit Delay</option>
                  <option value="UTILITY_INTERCONNECT">PSE&G / Utility Interconnect</option>
                  <option value="WEATHER">Inclement Weather (Rain/Snow)</option>
                  <option value="SUB_PERFORMANCE">Subcontractor Shortage</option>
                  <option value="GC_COORDINATION">GC Material Lead Time</option>
                </select>
              </div>
            </div>

            <div className="text-[11px] text-amber-700">
              Calculation: {delayDays} days × ${dailyCarryingCost}/day = <strong>${delayCarryingImpact.toLocaleString()}</strong> in loan carrying cost.
            </div>
          </div>

          {/* Photo Proof */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Photo Evidence Attached</label>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span className="text-slate-700 font-medium">3 inspection photos geotagged & verified</span>
              </div>
              <span className="text-emerald-700 font-semibold text-[11px]">Ready for draw</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Field Notes & Verification Log</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg transition shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Save Progress & Inspection Log</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
