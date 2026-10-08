import React from 'react';
import { AlertTriangle, Lock } from 'lucide-react';
import { UserRole } from '../../../../shared/types';
import { hasPermission } from '../../../../shared/rbac/matrix';

interface ProjectEconomicsCardProps {
  totalBudget: number;
  currentRole: UserRole;
}

const fmt = (n: number) => '$' + n.toLocaleString();

export const ProjectEconomicsCard: React.FC<ProjectEconomicsCardProps> = ({
  totalBudget,
  currentRole,
}) => {
  if (!hasPermission(currentRole, 'project:view_financials')) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center space-y-2">
        <div className="mx-auto w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500">
          <Lock className="w-5 h-5" />
        </div>
        <h4 className="font-bold text-slate-800 text-sm">Developer Pro Forma Economics Shielded</h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Proprietary land acquisition basis, developer equity margins, and pro forma target ROI are confidential to Developer/Owner and CFO roles.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Project Economics — Pro Forma vs. Current Forecast</h3>
          <p className="text-xs text-slate-500">Continuous profit tracking: what you originally planned vs what you will actually take home</p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
          Profit Drift: -$195,000 (ROI: 27.7% → 17.9%)
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="text-slate-500 text-[10px]">Acquisition Cost</div>
          <div className="font-bold text-slate-900 text-sm mt-0.5">$1,000,000</div>
          <div className="text-[10px] text-slate-400">Cash / Land HUD-1</div>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="text-slate-500 text-[10px]">Construction Budget</div>
          <div className="font-bold text-slate-900 text-sm mt-0.5">{fmt(totalBudget)}</div>
          <div className="text-[10px] text-red-600">+$120K over baseline</div>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="text-slate-500 text-[10px]">Interest & Carrying</div>
          <div className="font-bold text-slate-900 text-sm mt-0.5">$225,000</div>
          <div className="text-[10px] text-amber-600">+$75K delay carry</div>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="text-slate-500 text-[10px]">Target Sales Price (ARV)</div>
          <div className="font-bold text-emerald-700 text-sm mt-0.5">$3,250,000</div>
          <div className="text-[10px] text-emerald-600">Comps confirmed</div>
        </div>
      </div>

      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs">
        <div className="font-bold text-amber-900 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Why Did Projected Profit Drop by $195,000?</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
          <div className="flex items-start gap-2 bg-white/80 p-2 rounded-lg border border-amber-100">
            <span className="text-red-600 font-bold font-mono">-$120,000</span>
            <span>Construction hard cost overruns (Site work & extra foundation piles)</span>
          </div>
          <div className="flex items-start gap-2 bg-white/80 p-2 rounded-lg border border-amber-100">
            <span className="text-red-600 font-bold font-mono">-$75,000</span>
            <span>Additional carrying interest from 82 days of schedule delay</span>
          </div>
        </div>
      </div>
    </div>
  );
};
