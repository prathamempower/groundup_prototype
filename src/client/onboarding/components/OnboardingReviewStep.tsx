import React from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Layers,
  Clock,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { OnboardingState, SetupTask } from '../types';

interface OnboardingReviewStepProps {
  state: OnboardingState;
  workspaceDetails: { roleDisplayName: string; targetScreen: string };
  setupTasks: SetupTask[];
  isSubmitting: boolean;
  onBack: () => void;
  onComplete: () => void;
}

export const OnboardingReviewStep: React.FC<OnboardingReviewStepProps> = ({
  state,
  workspaceDetails,
  setupTasks,
  isSubmitting,
  onBack,
  onComplete,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-8 sm:p-10 transition-all">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
            <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Launch
          </span>
          <span className="text-xs font-medium text-slate-400">· Review Configuration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-2">
          Review Your GroundUp Workspace Setup
        </h1>
        <p className="text-sm text-slate-500">
          Confirm your configuration parameters and the automated setup tasks generated for your role.
        </p>
      </div>

      {/* Summary Cards Grid */}
      <div className="space-y-4 mb-8">
        {/* Role & Access Shield */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Role & Destination Workspace
            </div>
            <div className="text-base font-bold text-slate-900">
              {workspaceDetails.roleDisplayName}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Target Screen: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[11px] text-slate-700">/{workspaceDetails.targetScreen}</code>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        {/* Project / Setup Context */}
        {state.role === 'OWNER' && state.owner_project_info && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Configured Flagship Project
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <div className="text-slate-400 font-medium">Project</div>
                <div className="font-semibold text-slate-800">{state.owner_project_info.projectName}</div>
              </div>
              <div>
                <div className="text-slate-400 font-medium">Units</div>
                <div className="font-semibold text-slate-800">{state.owner_project_info.units} Units</div>
              </div>
              <div>
                <div className="text-slate-400 font-medium">Delivery Model</div>
                <div className="font-semibold text-slate-800">
                  {state.owner_gc_contract_model === 'DAILY_UPDATES' ? 'Cost-Plus Daily Logs' : 'Fixed-Price Milestones'}
                </div>
              </div>
              <div>
                <div className="text-slate-400 font-medium">Financing</div>
                <div className="font-semibold text-slate-800">
                  {state.owner_financing_type === 'debt_equity' ? state.owner_lender_details?.lenderName || 'Debt Loan' : 'All Equity'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generated Outstanding Setup Tasks */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              Outstanding Setup Tasks ({setupTasks.length})
            </span>
            <span className="text-[11px] text-slate-400">Generated from your answers</span>
          </div>

          <div className="space-y-2">
            {setupTasks.map(task => (
              <div
                key={task.id}
                className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-start gap-3 hover:border-slate-300 transition-colors"
              >
                <div className={`mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase shrink-0 ${
                  task.priority === 'HIGH' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-600'
                }`}>
                  {task.priority}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 leading-snug">
                    {task.title}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                    {task.description}
                  </div>
                </div>
                {task.estimatedMinutes && (
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium shrink-0">
                    <Clock className="w-3 h-3" />
                    <span>{task.estimatedMinutes}m</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Edit Answers</span>
        </button>

        <button
          type="button"
          data-testid="complete-btn"
          disabled={isSubmitting}
          onClick={onComplete}
          className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-7 py-3 rounded-xl font-bold text-sm transition-all shadow-md disabled:opacity-70 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Configuring Workspace...</span>
            </>
          ) : (
            <>
              <span>Complete Setup & Launch Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
