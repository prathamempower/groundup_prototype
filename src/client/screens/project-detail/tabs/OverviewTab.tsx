import React from 'react';
import { ArrowUpRight, Shield } from 'lucide-react';
import { UserRole } from '../../../../shared/types';
import { ProjectEconomicsCard } from '../components/ProjectEconomicsCard';
import { LoanFacilityCard } from '../components/LoanFacilityCard';

interface OverviewTabProps {
  totalBudget: number;
  totalSpent: number;
  totalFunded: number;
  cashExposure: number;
  currentRole: UserRole;
  onInspectProvenance: (type: 'spend' | 'budget' | 'funded' | 'exposure' | 'delay', category?: string) => void;
}

const fmt = (n: number) => '$' + n.toLocaleString();

export const OverviewTab: React.FC<OverviewTabProps> = ({
  totalBudget,
  totalSpent,
  totalFunded,
  cashExposure,
  currentRole,
  onInspectProvenance,
}) => {
  const truths = [
    {
      title: '1. Budget Truth',
      val: fmt(totalBudget),
      sub: 'Baseline + Approved COs',
      color: 'text-blue-700',
      dot: 'bg-blue-500',
      type: 'budget' as const,
    },
    {
      title: '2. Spend Truth',
      val: fmt(totalSpent),
      sub: `${Math.round((totalSpent / totalBudget) * 100)}% of Budget Posted`,
      color: 'text-emerald-700',
      dot: 'bg-emerald-500',
      type: 'spend' as const,
    },
    {
      title: '3. Funding Truth',
      val: fmt(totalFunded),
      sub: 'Disbursed by BCB Bank only',
      color: 'text-purple-700',
      dot: 'bg-purple-500',
      type: 'funded' as const,
    },
    {
      title: '4. Progress Truth',
      val: '72% Verified',
      sub: 'Inspection Sign-Offs (Non-Inferred)',
      color: 'text-amber-700',
      dot: 'bg-amber-500',
      type: 'delay' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* The Four Domain Truths */}
      <div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
          The Four Domain Truths (Deterministic · Zero Hallucination)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {truths.map((t) => (
            <div
              key={t.title}
              onClick={() => onInspectProvenance(t.type)}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-slate-400 hover:shadow-sm transition cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="flex items-center gap-1.5 font-bold">
                  <span className={`w-2 h-2 rounded-full ${t.dot}`} />
                  <span>{t.title}</span>
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition" />
              </div>
              <div className={`text-2xl font-bold font-mono tracking-tight ${t.color}`}>
                {t.val}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">{t.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HERO: Developer Cash Exposure */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Hero Metric · Developer Cash Exposure
            </span>
            <div className="text-4xl font-extrabold font-mono text-white mt-2">
              ${cashExposure.toLocaleString()}
            </div>
            <div className="text-xs text-slate-300 mt-1.5 flex items-center gap-2">
              <span>Actual Spend: <strong className="text-white font-mono">{fmt(totalSpent)}</strong></span>
              <span>−</span>
              <span>Lender Disbursed: <strong className="text-purple-300 font-mono">{fmt(totalFunded)}</strong></span>
            </div>
            <p className="text-[11px] text-slate-400 mt-3 max-w-2xl leading-relaxed">
              Out-of-pocket developer equity fronted on site awaiting next lender draw reimbursement. Computed strictly from confirmed records.
            </p>
          </div>
          <button
            onClick={() => onInspectProvenance('exposure')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer self-start sm:self-center flex items-center gap-1.5"
          >
            <span>Audit Lineage</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* PROJECT ECONOMICS: Pro Forma vs. Current Forecast */}
      <ProjectEconomicsCard totalBudget={totalBudget} currentRole={currentRole} />

      {/* LOAN FACILITY & INTEREST RESERVE METER */}
      <LoanFacilityCard />
    </div>
  );
};
