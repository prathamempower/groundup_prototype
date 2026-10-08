import React from 'react';
import { MilestoneInput } from '../types';

interface ScheduleIntakeTabProps {
  milestones: MilestoneInput[];
  setMilestones: React.Dispatch<React.SetStateAction<MilestoneInput[]>>;
  loading: boolean;
  onSaveSchedule: () => void;
}

export const ScheduleIntakeTab: React.FC<ScheduleIntakeTabProps> = ({
  milestones,
  setMilestones,
  loading,
  onSaveSchedule,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white">Project Schedule & Verified Progress %</h3>
        <p className="text-xs text-slate-400">Physical percent completion verified by GC inspections.</p>
      </div>

      <div className="space-y-2">
        {milestones.map((m, idx) => (
          <div key={idx} className="p-3 rounded-2xl bg-surface-950 border border-slate-800 grid grid-cols-12 gap-2 items-center text-xs">
            <div className="col-span-4">
              <label className="text-[10px] text-slate-400 block mb-0.5">Milestone</label>
              <input
                type="text"
                value={m.milestone}
                onChange={(e) => {
                  const updated = [...milestones];
                  updated[idx].milestone = e.target.value;
                  setMilestones(updated);
                }}
                className="w-full bg-surface-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white"
              />
            </div>
            <div className="col-span-3">
              <label className="text-[10px] text-slate-400 block mb-0.5">Trade</label>
              <input
                type="text"
                value={m.trade}
                onChange={(e) => {
                  const updated = [...milestones];
                  updated[idx].trade = e.target.value;
                  setMilestones(updated);
                }}
                className="w-full bg-surface-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white"
              />
            </div>
            <div className="col-span-3">
              <label className="text-[10px] text-slate-400 block mb-0.5">Target Completion</label>
              <input
                type="date"
                value={m.planned_end}
                onChange={(e) => {
                  const updated = [...milestones];
                  updated[idx].planned_end = e.target.value;
                  setMilestones(updated);
                }}
                className="w-full bg-surface-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] text-slate-400 block mb-0.5">Progress %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={Math.round(m.verified_progress_pct * 100)}
                onChange={(e) => {
                  const updated = [...milestones];
                  updated[idx].verified_progress_pct = (parseFloat(e.target.value) || 0) / 100;
                  setMilestones(updated);
                }}
                className="w-full bg-surface-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-amber-300 font-mono font-bold"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-3 border-t border-slate-800">
        <button
          onClick={onSaveSchedule}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-md shadow-brand-500/20 cursor-pointer"
        >
          {loading ? 'Saving...' : 'Update Schedule & Progress Truth'}
        </button>
      </div>
    </div>
  );
};
