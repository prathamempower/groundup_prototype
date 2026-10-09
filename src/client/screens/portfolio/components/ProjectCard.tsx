import React from 'react';
import {
  ArrowRight,
  Layers,
  Clock,
  AlertTriangle,
  Building,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  HardHat,
  MapPin,
} from 'lucide-react';
import { EnrichedProject } from '../types';
import { formatShortCurrency } from '../portfolio-helpers';

interface ProjectCardProps {
  project: EnrichedProject;
  onSelectProject: (projectId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelectProject }) => {
  const isCompleted = project.status === 'COMPLETED';
  const isActive = project.status === 'ACTIVE';

  // Helper for team avatar initials
  const getInitials = (name: string, fallback: string) => {
    if (!name) return fallback;
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const gcInitials = getInitials(project.gc, 'GC');
  const lenderInitials = getInitials(project.lender, 'LN');

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelectProject(project.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectProject(project.id);
        }
      }}
      className={`group text-left border rounded-2xl p-5 sm:p-6 bg-white transition-all duration-200 ease-out cursor-pointer flex flex-col justify-between gap-5 relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
        isCompleted
          ? 'border-blue-200/80 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5'
          : 'border-slate-200/80 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5'
      }`}
    >
      {/* Top Meta Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Status Badge with Live Dot */}
          <div className="flex items-center gap-1.5">
            {isActive && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Active
              </span>
            )}

            {isCompleted && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/70">
                <CheckCircle2 className="w-3 h-3 text-blue-600" />
                Completed
              </span>
            )}

            {!isActive && !isCompleted && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/70">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                On Hold
              </span>
            )}

            {/* Contract Model Pill */}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              <Layers className="w-3 h-3 text-slate-400" />
              <span>
                {project.gc_contract_model === 'DAILY_LOG_T_M' ? 'Daily T&M' : 'Fixed-Price'}
              </span>
            </span>
          </div>

          {/* Risk Alert Pill (if any) */}
          {project.alerts > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
              <AlertTriangle className="w-3 h-3 text-red-500" />
              <span>{project.alerts} {project.alerts === 1 ? 'Alert' : 'Alerts'}</span>
            </span>
          )}
        </div>

        {/* Project Title & Address */}
        <div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors tracking-tight line-clamp-1">
            {project.name}
          </h3>
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5 line-clamp-1">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{project.address}</span>
            {project.units && (
              <>
                <span className="text-slate-300">·</span>
                <span>{project.units} Units</span>
              </>
            )}
          </div>
        </div>

        {/* Team Avatars Stack */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-400">Team:</span>
            <div className="flex -space-x-1.5 overflow-hidden items-center">
              {/* GC Avatar */}
              <div
                title={`General Contractor: ${project.gc}`}
                className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-white text-[9px] font-bold ring-2 ring-white"
              >
                {gcInitials}
              </div>
              {/* Lender Avatar */}
              <div
                title={`Lender: ${project.lender}`}
                className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-[9px] font-bold ring-2 ring-white"
              >
                {lenderInitials}
              </div>
              {/* Owner Avatar */}
              <div
                title="Developer / Owner: GroundUp Partners"
                className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-[9px] font-bold ring-2 ring-white"
              >
                GU
              </div>
            </div>
          </div>

          <span className="text-[11px] text-slate-500 truncate max-w-[150px] font-medium">
            {project.gc}
          </span>
        </div>
      </div>

      {/* Financial & Progress Metrics */}
      <div className="space-y-3.5">
        {isCompleted ? (
          <div className="grid grid-cols-2 gap-2 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                Final Sale
              </span>
              <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">
                {formatShortCurrency(project.finalSale || 2940000)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                Total Cost
              </span>
              <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">
                {formatShortCurrency(project.totalCost || 2553000)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                Net Profit
              </span>
              <span className="text-sm font-bold font-mono text-emerald-700 mt-0.5 block">
                +{formatShortCurrency(project.netProfit || 387000)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                Realized ROI
              </span>
              <span className="text-sm font-bold font-mono text-blue-700 mt-0.5 block">
                {project.roi || 15.2}%
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-500 font-medium">Verified Progress</span>
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

            {/* 4 Truths Stats Grid */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Budget
                </span>
                <span className="text-xs font-bold font-mono text-slate-900">
                  {formatShortCurrency(project.budget)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Spent
                </span>
                <span className="text-xs font-bold font-mono text-slate-900">
                  {formatShortCurrency(project.spent)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Funded
                </span>
                <span className="text-xs font-bold font-mono text-slate-900">
                  {formatShortCurrency(project.funded)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Exposure
                </span>
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

        {/* Card Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
          <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Clock className="w-3 h-3" />
            <span>{project.lastUpdated}</span>
          </span>

          <span className="inline-flex items-center gap-1 font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
            <span>Open Workspace</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </div>
  );
};
