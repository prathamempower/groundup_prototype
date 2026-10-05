// GroundUp AI — Executive Dashboard Screen
// Shows Live 4 Truths, Hero Developer Cash Exposure, and Role Context

import React from 'react';
import {
  ProjectFourTruthsSummary,
  UserRole,
  USER_ROLES,
} from '../../shared/types';
import {
  ShieldCheck,
  ArrowUpRight,
  Landmark,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Percent,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface DashboardScreenProps {
  summary: ProjectFourTruthsSummary | null;
  activeRole: UserRole;
  onOpenProvenance: (type: 'spend' | 'budget' | 'funded' | 'exposure' | 'delay', cat?: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  summary,
  activeRole,
  onOpenProvenance,
  onNavigateTab,
}) => {
  if (!summary) {
    return (
      <div className="py-24 text-center text-slate-400 space-y-3">
        <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm">Calculating Four Truths from user-entered records...</p>
      </div>
    );
  }

  const roleMeta = USER_ROLES[activeRole];
  const criticalAlerts = summary.active_alerts;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Role Context Pill Banner */}
      <div className="p-3.5 rounded-2xl bg-surface-900 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-400" />
          <span>
            Viewing as <strong className="text-white">{roleMeta.roleTitle}</strong> ({roleMeta.name}):{' '}
            <span className="text-slate-400 hidden sm:inline">{roleMeta.roleDescription}</span>
          </span>
        </div>
        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
          Tenant Scoped
        </span>
      </div>

      {/* Critical Alert Action Bar */}
      {criticalAlerts.length > 0 && (
        <div
          onClick={() => onNavigateTab('alerts')}
          className="p-4 rounded-3xl bg-gradient-to-r from-rose-950/80 to-slate-900 border border-rose-500/40 flex items-center justify-between cursor-pointer hover:border-rose-400 transition shadow-lg shadow-rose-950/40"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 animate-pulse">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                🔴 {criticalAlerts.length} Action Required Items Detected
              </div>
              <div className="text-sm font-semibold text-white mt-0.5">
                {criticalAlerts[0].title}
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-rose-400" />
        </div>
      )}

      {/* HERO METRIC: Developer Cash Exposure (Section 3.3) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-800 via-surface-900 to-slate-950 border border-brand-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-brand-400 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Hero Metric • Developer Cash Exposure
          </span>
          <button
            onClick={() => onOpenProvenance('exposure')}
            className="text-xs text-slate-400 hover:text-brand-300 flex items-center gap-1 bg-surface-950/80 px-3 py-1.5 rounded-xl border border-slate-700/60 transition"
          >
            Audit Lineage <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-3 mb-2">
          <div className="text-4xl sm:text-5xl font-extrabold text-white font-mono tracking-tight">
            ${summary.developer_cash_exposure.toLocaleString()}
          </div>
        </div>

        <div className="text-sm text-slate-300 flex flex-wrap items-center gap-2">
          <span>Total Actual Spend:</span>
          <strong className="text-white font-mono">${summary.total_actual_spend.toLocaleString()}</strong>
          <span className="text-slate-500">−</span>
          <span>Lender Disbursed:</span>
          <strong className="text-purple-300 font-mono">${summary.total_amount_funded.toLocaleString()}</strong>
        </div>

        <p className="text-xs text-slate-400 mt-4 pt-4 border-t border-slate-800/80 leading-relaxed max-w-3xl">
          Out-of-pocket developer equity incurred awaiting lender draw disbursement. Calculated purely from confirmed ledger rows without estimation.
        </p>
      </div>

      {/* THE FOUR TRUTHS SUMMARY MATRIX (Section 0 & Section 3) */}
      <div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
          The Four Domain Truths (Separated & Non-Conflicting)
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Budget Truth */}
          <div
            onClick={() => onOpenProvenance('budget')}
            className="p-5 rounded-3xl bg-surface-900 border border-slate-800 hover:border-brand-500/40 cursor-pointer transition space-y-2 shadow-sm"
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> 1. Budget Truth
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              ${summary.total_current_budget.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
              <span>Baseline + Approved COs</span>
              <span className="text-blue-400 font-semibold">GMP Approved</span>
            </div>
          </div>

          {/* 2. Spend Truth */}
          <div
            onClick={() => onOpenProvenance('spend')}
            className="p-5 rounded-3xl bg-surface-900 border border-slate-800 hover:border-brand-500/40 cursor-pointer transition space-y-2 shadow-sm"
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> 2. Spend Truth
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 font-mono">
              ${summary.total_actual_spend.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
              <span>{Math.round((summary.total_actual_spend / summary.total_current_budget) * 100)}% Spent</span>
              <span className="text-emerald-400 font-semibold">Posted Rows Only</span>
            </div>
          </div>

          {/* 3. Funding Truth */}
          <div
            onClick={() => onOpenProvenance('funded')}
            className="p-5 rounded-3xl bg-surface-900 border border-slate-800 hover:border-brand-500/40 cursor-pointer transition space-y-2 shadow-sm"
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> 3. Funding Truth
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-purple-300 font-mono">
              ${summary.total_amount_funded.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
              <span>Draws Approved: ${summary.total_approved_draws.toLocaleString()}</span>
              <span className="text-purple-400 font-semibold">Disbursed</span>
            </div>
          </div>

          {/* 4. Progress Truth */}
          <div
            onClick={() => onNavigateTab('budget')}
            className="p-5 rounded-3xl bg-surface-900 border border-slate-800 hover:border-brand-500/40 cursor-pointer transition space-y-2 shadow-sm"
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> 4. Progress Truth
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-amber-300 font-mono">
              {Math.round(summary.overall_progress_pct * 100)}% Verified
            </div>
            <div className="text-xs text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
              <span>GC & Municipal Inspections</span>
              <span className="text-amber-400 font-semibold">Non-Inferred</span>
            </div>
          </div>
        </div>
      </div>

      {/* LOAN FACILITY & DAILY CARRYING COST */}
      <div className="p-6 rounded-3xl bg-surface-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Landmark className="w-5 h-5 text-brand-400" />
            <span>Loan Facility & Real-Time Interest Carrying Cost</span>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-800/40">
            {(summary.interest_rate * 100).toFixed(2)}% APR Facility
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-surface-950 p-4 rounded-2xl border border-slate-800">
            <div className="text-xs text-slate-400">Outstanding Drawn Balance</div>
            <div className="text-lg font-bold text-white font-mono mt-1">
              ${summary.loan_balance.toLocaleString()}
            </div>
          </div>

          <div className="bg-surface-950 p-4 rounded-2xl border border-slate-800">
            <div className="text-xs text-slate-400">Daily Carrying Cost</div>
            <div className="text-lg font-bold text-amber-400 font-mono mt-1">
              ${summary.daily_carrying_cost.toLocaleString()} / day
            </div>
          </div>

          <div className="bg-surface-950 p-4 rounded-2xl border border-slate-800">
            <div className="text-xs text-slate-400">Estimated Schedule Delay Cost</div>
            <div className="text-lg font-bold text-rose-400 font-mono mt-1">
              ${summary.estimated_delay_cost.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
