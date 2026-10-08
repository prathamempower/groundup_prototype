import React from 'react';
import { ArrowRight } from 'lucide-react';
import { EnrichedProject } from '../types';
import { formatShortCurrency } from '../portfolio-helpers';

interface ProjectCardItemProps {
  project: EnrichedProject;
  onSelectProject: (id: string) => void;
}

export const ProjectCardItem: React.FC<ProjectCardItemProps> = ({ project, onSelectProject }) => {
  return (
    <div
      className={`border rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all ${
        project.status === 'COMPLETED'
          ? 'bg-blue-50/20 border-blue-200/70'
          : 'bg-white border-slate-200/90'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Identity & Status */}
        <div className="flex-1 min-w-[260px]">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                project.status === 'ACTIVE'
                  ? project.alerts > 0
                    ? 'bg-amber-500 ring-2 ring-amber-100'
                    : 'bg-emerald-500 ring-2 ring-emerald-100'
                  : 'bg-blue-500 ring-2 ring-blue-100'
              }`}
            />
            <h3 className="text-base font-bold text-slate-900">{project.name}</h3>
            <span
              className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase tracking-wider ${
                project.status === 'ACTIVE'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              {project.status}
            </span>
            {project.alerts > 0 && (
              <span className="inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-bold bg-red-100 text-red-700 ml-1">
                {project.alerts} alerts
              </span>
            )}
          </div>

          <div className="text-xs text-slate-500 mb-3">{project.address}</div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <span className="text-slate-400">GC:</span> {project.gc}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <span className="text-slate-400">Lender:</span> {project.lender}
            </span>
            <span>·</span>
            <span className="text-slate-400">Updated {project.lastUpdated}</span>
          </div>
        </div>

        {/* Middle: 4 Truths or Completed Metrics */}
        {project.status === 'COMPLETED' ? (
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <div>
              <div className="text-[11px] text-slate-500 font-medium">Final Disposition</div>
              <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                {formatShortCurrency(project.finalSale || 2940000)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-medium">Total Cost</div>
              <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                {formatShortCurrency(project.totalCost || 2553000)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-medium">Net Developer Profit</div>
              <div className="text-sm font-bold font-mono text-emerald-700 mt-0.5">
                +{formatShortCurrency(project.netProfit || 387000)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-medium">Realized ROI</div>
              <div className="text-sm font-bold font-mono text-blue-700 mt-0.5">
                {project.roi || 15.2}%
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 space-y-3 max-w-xl">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500 font-medium">Verified Progress</span>
                <span className="font-bold text-slate-900">{project.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    project.alerts > 0 ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Financial Stats Bar */}
            <div className="grid grid-cols-4 gap-2 pt-1 border-t border-slate-100 text-left">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Budget</span>
                <span className="text-xs font-bold font-mono text-slate-900">{formatShortCurrency(project.budget)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Spent</span>
                <span className="text-xs font-bold font-mono text-slate-900">{formatShortCurrency(project.spent)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Funded</span>
                <span className="text-xs font-bold font-mono text-slate-900">{formatShortCurrency(project.funded)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Exposure</span>
                <span
                  className={`text-xs font-bold font-mono ${
                    project.cashExposure > 0 ? 'text-amber-700 font-black' : 'text-slate-900'
                  }`}
                >
                  {formatShortCurrency(project.cashExposure)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Right: Action */}
        <div className="flex lg:flex-col items-center justify-end gap-2 shrink-0">
          <button
            onClick={() => onSelectProject(project.id)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <span>View Project</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
