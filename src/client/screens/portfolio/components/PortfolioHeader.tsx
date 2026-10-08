import React from 'react';
import { Calendar, Sparkles, Plus } from 'lucide-react';

interface PortfolioHeaderProps {
  activeCount: number;
  onOpenDealLab: () => void;
  onAddProject: () => void;
}

export const PortfolioHeader: React.FC<PortfolioHeaderProps> = ({
  activeCount,
  onOpenDealLab,
  onAddProject,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Executive Portfolio Overview
          </span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
          Good morning, Hardik. <span className="text-xl font-normal">👋</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>October 5, 2026 · {activeCount} active development projects</span>
          <span>·</span>
          <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.2 rounded border border-amber-200">
            2 items need attention
          </span>
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenDealLab}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold shadow-2xs transition cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Deal Underwriting</span>
        </button>
        <button
          onClick={() => { console.log("Button Clicked!"); onAddProject(); }}
          className="inline-flex items-center justify-center px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition text-xs font-bold shadow-xs cursor-pointer gap-1.5"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>New Project</span>
        </button>
      </div>
    </div>
  );
};
