// GroundUp AI — Sub-Project Phases & Trade Milestone Hierarchy
// Displays nested phases for the active project with progress tracking, budget allocations, and status pills

import React from 'react';
import { Layers, CheckCircle2, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

interface SubPhase {
  id: string;
  name: string;
  category: string;
  budget: number;
  spent: number;
  progress: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING' | 'DELAYED';
  targetDate: string;
}

const DEFAULT_SUB_PHASES: SubPhase[] = [
  {
    id: 'p-1',
    name: 'Phase 1: Site Work & Structural Foundation',
    category: 'Civil & Concrete',
    budget: 340000,
    spent: 340000,
    progress: 100,
    status: 'COMPLETED',
    targetDate: 'Apr 2026',
  },
  {
    id: 'p-2',
    name: 'Phase 2: Heavy Timber Framing & Superstructure',
    category: 'Structural',
    budget: 520000,
    spent: 498000,
    progress: 95,
    status: 'COMPLETED',
    targetDate: 'Jul 2026',
  },
  {
    id: 'p-3',
    name: 'Phase 3: MEP Rough-in & Exterior Envelope',
    category: 'Trades & Systems',
    budget: 480000,
    spent: 362000,
    progress: 75,
    status: 'IN_PROGRESS',
    targetDate: 'Nov 2026',
  },
  {
    id: 'p-4',
    name: 'Phase 4: Interior Architectural Finishes & Fixtures',
    category: 'Finishes',
    budget: 320000,
    spent: 124000,
    progress: 35,
    status: 'IN_PROGRESS',
    targetDate: 'Jan 2027',
  },
  {
    id: 'p-5',
    name: 'Phase 5: Municipal Closeout, Certificate of Occupancy & Sale',
    category: 'Disposition',
    budget: 160000,
    spent: 88400,
    progress: 15,
    status: 'UPCOMING',
    targetDate: 'Mar 2027',
  },
];

const fmt = (n: number) => '$' + n.toLocaleString();

export const SubProjectsPhaseGrid: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Layers className="w-4 h-4 text-slate-700" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Sub-Phases & Trade Milestone Schedule</h3>
            <p className="text-xs text-slate-500">Parent-child breakdown of project lifecycle milestones</p>
          </div>
        </div>
        <span className="text-xs font-bold text-slate-400">5 Sub-Phases Active</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
        {DEFAULT_SUB_PHASES.map((phase) => {
          const isDone = phase.status === 'COMPLETED';
          const isInProgress = phase.status === 'IN_PROGRESS';

          return (
            <div
              key={phase.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition flex flex-col justify-between gap-3 shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {phase.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800'
                        : isInProgress
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isDone ? '✓ Completed' : isInProgress ? 'In Progress' : 'Upcoming'}
                  </span>
                </div>

                <div className="font-bold text-xs text-slate-900 leading-snug">
                  {phase.name}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200/80">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Progress</span>
                  <span className="font-mono font-bold text-slate-900">{phase.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isDone ? 'bg-emerald-600' : 'bg-blue-600'}`}
                    style={{ width: `${phase.progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
                  <span>Spend: <strong className="text-slate-800 font-mono">{fmt(phase.spent)}</strong></span>
                  <span>Target: <strong className="text-slate-800">{phase.targetDate}</strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
