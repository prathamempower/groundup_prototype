import React, { useState } from 'react';
import { 
  Landmark, 
  DollarSign, 
  Percent, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle, 
  FileCheck2, 
  TrendingUp, 
  Clock, 
  ArrowRight 
} from 'lucide-react';
import { Project, UserRole } from '../../../../shared/types';
import { hasPermission } from '../../../../shared/rbac/matrix';

interface FinancingTabProps {
  currentRole: UserRole;
  projectName?: string;
  selectedProject?: Project;
}

export const FinancingTab: React.FC<FinancingTabProps> = ({
  currentRole,
  projectName = 'Selected Project',
  selectedProject,
}) => {
  const canEdit = hasPermission(currentRole, 'financing:edit');

  const targetBudget = selectedProject?.target_budget || 1820000;
  const loanCommitment = Math.round(targetBudget * 0.77);
  const fundedDisbursed = Math.round(loanCommitment * 0.60);
  const remainingCommitment = loanCommitment - fundedDisbursed;
  const interestRate = 8.75;
  const dailyCarryCost = Math.round((loanCommitment * 0.0875) / 365);
  const totalInterestReserve = Math.round(loanCommitment * 0.08);
  const reserveDrawn = Math.round(totalInterestReserve * 0.55);
  const reserveRemaining = totalInterestReserve - reserveDrawn;
  const runwayMonths = (reserveRemaining / Math.max(1, dailyCarryCost * 30)).toFixed(1);
  const retainageHeld = Math.round(fundedDisbursed * 0.08);

  return (
    <div className="space-y-6">
      {/* Overview Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                Stage 4 · Senior Debt Financing Active
              </span>
              <span className="text-xs text-slate-400 font-mono">BCB Community Bank (External Counterparty)</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{projectName} — Loan & Debt Administration</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Senior construction debt facility, interest reserve runway, and statutory retainage escrow accounting.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-500">Loan Utilization</div>
              <div className="text-lg font-bold font-mono text-purple-700">
                {((fundedDisbursed / loanCommitment) * 100).toFixed(1)}% Drawn
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Facility Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase text-[10px] tracking-wider">Total Facility Commitment</span>
            <Landmark className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            ${loanCommitment.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">BCB Senior Mortgage</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase text-[10px] tracking-wider">Funded to Date (Truth 3)</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-700">
            ${fundedDisbursed.toLocaleString()}
          </div>
          <div className="text-[11px] text-purple-600 mt-1">Confirmed Bank Fedwires</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase text-[10px] tracking-wider">Remaining Undrawn Facility</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            ${remainingCommitment.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Available for remaining draws</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase text-[10px] tracking-wider">Statutory Retainage Held</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700">
            ${retainageHeld.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-600 mt-1">10% withheld until final closeout</div>
        </div>
      </div>

      {/* Interest Reserve Runway Meter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span>Interest Reserve Runway Meter</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Interest carry drawn automatically from lender reserve account at ${dailyCarryCost}/day interest burn rate.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-amber-50 text-amber-800 border border-amber-200">
              {runwayMonths} Months of Runway Remaining
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-600">Reserve Absorbed: ${reserveDrawn.toLocaleString()} ({((reserveDrawn / totalInterestReserve) * 100).toFixed(0)}%)</span>
            <span className="text-emerald-700 font-mono">Reserve Remaining: ${reserveRemaining.toLocaleString()}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden flex">
            <div 
              className="bg-amber-500 h-full transition-all duration-500" 
              style={{ width: `${(reserveDrawn / totalInterestReserve) * 100}%` }}
            />
            <div 
              className="bg-emerald-500 h-full transition-all duration-500" 
              style={{ width: `${(reserveRemaining / totalInterestReserve) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>$0 Initial Commitment</span>
            <span className="font-mono text-slate-600">${totalInterestReserve.toLocaleString()} Total Reserve</span>
          </div>
        </div>

        {/* Carry Penalty Warning */}
        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2 text-xs text-slate-700">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Schedule Delay Carrying Penalty Impact</span>
          </div>
          <p className="leading-relaxed">
            The project currently experiences an 82-day delay on the critical path. At an interest rate of {interestRate}% on the drawn loan balance, every additional day of delay fronted costs <strong className="font-mono text-amber-900">${dailyCarryCost}/day</strong> in debt carrying penalties, resulting in an accumulated <strong className="font-mono text-amber-900">$26,568</strong> carrying penalty against the reserve.
          </p>
        </div>
      </div>

      {/* Loan Terms & Counterparty Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Landmark className="w-4 h-4 text-slate-700" />
          <span>Lender Counterparty & Promissory Terms</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Counterparty Specification</div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Lender Institution</span>
              <strong className="text-slate-900">BCB Community Bank</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Counterparty Type</span>
              <span className="font-mono text-slate-700">External Financial Party (Non-User)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Loan Officer / Contact</span>
              <strong className="text-slate-900">Commercial Lending Division</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Disbursement Channel</span>
              <span className="font-mono text-slate-700">Fedwire Direct to Escrow</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Promissory Note Terms</div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Interest Calculation</span>
              <strong className="text-slate-900">{interestRate}% Floating (SOFR + 2.25%)</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Interest Payment Method</span>
              <strong className="text-slate-900 font-mono">RESERVE (Drawn from Loan)</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Statutory Retainage Rate</span>
              <strong className="text-slate-900 font-mono">10.0% Holdback per Draw</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Loan Maturity</span>
              <strong className="text-slate-900">October 31, 2028</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
