import React from 'react';
import { UserRole } from '../../../../shared/types';
import { hasPermission } from '../../../../shared/rbac/matrix';
import { MilestoneItem } from '../types';

interface TimelineTabProps {
  milestones: MilestoneItem[];
  currentRole?: UserRole;
  onSelectMilestoneForEdit?: (m: MilestoneItem) => void;
  onEditMilestone?: (m: MilestoneItem) => void;
}

export const TimelineTab: React.FC<TimelineTabProps> = ({
  milestones,
  currentRole = 'DEVELOPER_OWNER',
  onSelectMilestoneForEdit,
  onEditMilestone,
}) => {
  const handleEdit = (m: MilestoneItem) => {
    onSelectMilestoneForEdit?.(m);
    onEditMilestone?.(m);
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Construction Schedule & Delay Attribution</h3>
          <p className="text-xs text-slate-500">Every milestone slip is attributed to a root cause with carrying cost math</p>
        </div>
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-mono font-bold text-amber-900">
          Cumulative Delay: 82 Days (+${(82 * 324).toLocaleString()} Carry Cost)
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="px-4 py-3 text-left">Milestone</th>
              <th className="px-4 py-3 text-left">Planned</th>
              <th className="px-4 py-3 text-left">Actual</th>
              <th className="px-4 py-3 text-center">Delay Slip</th>
              <th className="px-4 py-3 text-center">Physical Progress</th>
              <th className="px-4 py-3 text-left">Inspection Sign-Off</th>
              <th className="px-4 py-3 text-right">Field Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {milestones.map((m) => (
              <tr key={m.name} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-bold text-slate-900">{m.name}</td>
                <td className="px-4 py-3 font-mono text-slate-500">{m.planned}</td>
                <td className="px-4 py-3 font-mono text-slate-900">{m.actual || '—'}</td>
                <td className="px-4 py-3 text-center">
                  {m.delayDays ? (
                    <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      +{m.delayDays}d
                    </span>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="font-mono font-semibold text-slate-900">{m.progress}%</span>
                </td>
                <td className="px-4 py-3 text-slate-600">{m.source}</td>
                <td className="px-4 py-3 text-right">
                  {hasPermission(currentRole, 'milestone:log_progress') ? (
                    <button
                      onClick={() => handleEdit(m)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-black text-white rounded-lg text-[10px] font-bold cursor-pointer transition"
                    >
                      Log Progress
                    </button>
                  ) : (
                    <span className="text-slate-400 text-[10px] font-medium">Read Only</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
