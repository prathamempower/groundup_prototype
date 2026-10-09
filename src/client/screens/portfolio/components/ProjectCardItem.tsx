// GroundUp AI — Enterprise-Grade Minimal Project Summary Card
// Top-level uncluttered view for the Portfolio dashboard with seamless drill-down to detail view

import React from 'react';
import {
  ArrowRight,
  Building2,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Layers,
  Banknote,
  Sparkles,
} from 'lucide-react';
import { EnrichedProject } from '../types';
import { formatShortCurrency } from '../portfolio-helpers';

interface ProjectCardItemProps {
  project: EnrichedProject;
  onSelectProject: (id: string) => void;
}

export const ProjectCardItem: React.FC<ProjectCardItemProps> = ({ project, onSelectProject }) => {
  const isCompleted = project.status === 'COMPLETED';

  return (
    <div
      onClick={() => onSelectProject(project.id)}
      className={`group relative bg-white border rounded-2xl p-6 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer flex flex-col justify-between select-none ${
        isCompleted ? 'border-blue-100 bg-gradient-to-b from-blue-50/20 to-white' : 'border-slate-200/90'
      }`}
    >
      {/* Top Section: Category, Phase & Status Badges */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200/80">
              {project.category || 'Multifamily'}
            </span>
            {project.units && (
              <span className="text-slate-400 text-xs font-semibold">
                {project.units} {project.units === 1 ? 'Unit' : 'Units'} · {project.squareFeet?.toLocaleString() || 3500} SF
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {project.alerts > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <ShieldAlert className="w-3 h-3 text-amber-600" />
                <span>{project.alerts} {project.alerts === 1 ? 'Alert' : 'Alerts'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>On Track</span>
              </span>
            )}

            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                isCompleted
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {isCompleted ? 'Completed' : 'Active'}
            </span>
          </div>
        </div>

        {/* Project Title & Address */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-2">
            <span>{project.name}</span>
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{project.address}</span>
          </div>
        </div>

        {/* Key Operational Partners */}
        <div className="flex items-center gap-3 text-xs text-slate-600 mb-5 pb-4 border-b border-slate-100 flex-wrap">
          <div className="flex items-center gap-1 font-medium">
            <span className="text-slate-400">GC:</span>
            <span className="text-slate-800 font-semibold">{project.gc}</span>
          </div>
          <span className="text-slate-300">·</span>
          <div className="flex items-center gap-1 font-medium">
            <span className="text-slate-400">Lender:</span>
            <span className="text-slate-800 font-semibold">{project.lender}</span>
          </div>
        </div>
      </div>

      {/* Middle/Bottom: High-Level Progress & Metrics */}
      <div>
        {isCompleted ? (
          <div className="grid grid-cols-3 gap-2 bg-blue-50/60 p-3.5 rounded-xl border border-blue-100 text-center mb-4">
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Final Sale</div>
              <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                {formatShortCurrency(project.finalSale || 2940000)}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Net Profit</div>
              <div className="text-sm font-bold font-mono text-emerald-700 mt-0.5">
                +{formatShortCurrency(project.netProfit || 387000)}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Realized ROI</div>
              <div className="text-sm font-bold font-mono text-blue-700 mt-0.5">
                {project.roi || 15.2}%
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 mb-4">
            {/* Minimal Progress Bar */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-500 font-semibold">{project.currentPhase || 'Construction Progress'}</span>
                <span className="font-mono font-bold text-slate-900">{project.progress}%</span>
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

            {/* High-Level Financial Snapshot */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-left">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Budget</span>
                <span className="text-xs font-bold font-mono text-slate-900">{formatShortCurrency(project.budget)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Spent</span>
                <span className="text-xs font-bold font-mono text-slate-900">{formatShortCurrency(project.spent)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Exposure</span>
                <span
                  className={`text-xs font-bold font-mono ${
                    project.cashExposure > 0 ? 'text-amber-700 font-bold' : 'text-slate-900'
                  }`}
                >
                  {formatShortCurrency(project.cashExposure)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Drill-Down Action Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">
          <span>Drill Down into Project</span>
          <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-all duration-200">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
