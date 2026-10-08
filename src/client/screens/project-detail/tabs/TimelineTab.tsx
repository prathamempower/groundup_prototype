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
  currentRole = 'OWNER',
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

      {/* Geotagged Photo Proof Hub */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Geotagged Photo Proof Hub</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Deterministic photographic evidence with embedded EXIF GPS timestamps backing milestone completion.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            4 Certified Field Proofs
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Foundation Grade Beams',
              milestone: 'Foundation & Excavation',
              gps: '40.7439° N, 74.0323° W',
              date: 'Oct 04, 2026 09:14 AM',
              status: 'Town Inspector Passed',
              color: 'bg-emerald-500',
            },
            {
              title: 'Framing 3rd Floor Trusses',
              milestone: 'Superstructure Framing',
              gps: '40.7439° N, 74.0323° W',
              date: 'Oct 06, 2026 02:40 PM',
              status: 'AIA Field Verification',
              color: 'bg-blue-500',
            },
            {
              title: 'Rough DWV Pressure Test',
              milestone: 'MEP Rough-Ins',
              gps: '40.7439° N, 74.0323° W',
              date: 'Oct 07, 2026 11:22 AM',
              status: 'Pressure Gauge 50 PSI',
              color: 'bg-emerald-500',
            },
            {
              title: 'Helical Piles Torque Log',
              milestone: 'Foundation & Excavation',
              gps: '40.7439° N, 74.0323° W',
              date: 'Oct 08, 2026 04:15 PM',
              status: 'Engineer Stamped',
              color: 'bg-purple-500',
            },
          ].map((photo, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 hover:border-slate-300 transition">
              <div className="h-28 bg-slate-200 rounded-lg flex items-center justify-center relative overflow-hidden text-slate-400 font-mono text-[11px]">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-2">
                  <span className="text-[10px] text-white font-mono">{photo.gps}</span>
                </div>
                <span>[FIELD IMAGE EVIDENCE]</span>
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900 truncate">{photo.title}</div>
                <div className="text-[11px] text-slate-500 truncate">{photo.milestone}</div>
              </div>
              <div className="text-[10px] font-mono text-slate-400 flex justify-between pt-1 border-t border-slate-200/60">
                <span>{photo.date.split(' ')[0]}</span>
                <span className="font-semibold text-emerald-700">{photo.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
