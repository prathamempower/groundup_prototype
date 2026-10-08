import React from 'react';
import { Layers } from 'lucide-react';
import { FinalReportData } from '../../../server/services/pipelineService';

interface FourTruthsAuditTableProps {
  fourTruths: FinalReportData['fourTruths'];
}

export function FourTruthsAuditTable({ fourTruths }: FourTruthsAuditTableProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-600" />
          <span>Four Truths Financial Reconciliation</span>
        </h3>
        <span className="text-[11px] text-slate-400">Rule 2: Multiple truths by domain. Zero forced blending.</span>
      </div>

      <table className="w-full text-left border-collapse border border-slate-200 rounded-xl overflow-hidden">
        <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
          <tr>
            <th className="py-2.5 px-3 border-b border-slate-200">Domain Truth</th>
            <th className="py-2.5 px-3 border-b border-slate-200">Mathematical Formula & Source Lineage</th>
            <th className="py-2.5 px-3 border-b border-slate-200 text-right">Reconciled Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-medium">
          <tr>
            <td className="py-2.5 px-3 font-semibold text-slate-900">1. Budget Truth</td>
            <td className="py-2.5 px-3 text-slate-500">Approved Master Budget + Verified Change Orders</td>
            <td className="py-2.5 px-3 text-right font-bold text-slate-900">
              ${fourTruths.masterBudget.toLocaleString()}
            </td>
          </tr>
          <tr>
            <td className="py-2.5 px-3 font-semibold text-slate-900">2. Spend Truth</td>
            <td className="py-2.5 px-3 text-slate-500">Sum of posted subcontractor invoices with verified lien waivers</td>
            <td className="py-2.5 px-3 text-right font-bold text-slate-900">
              ${fourTruths.incurredSpend.toLocaleString()}
            </td>
          </tr>
          <tr>
            <td className="py-2.5 px-3 font-semibold text-slate-900">3. Funding Truth</td>
            <td className="py-2.5 px-3 text-slate-500">Confirmed lender wire disbursements recorded in draw ledger</td>
            <td className="py-2.5 px-3 text-right font-bold text-slate-900">
              ${fourTruths.lenderDisbursed.toLocaleString()}
            </td>
          </tr>
          <tr className="bg-amber-50/70">
            <td className="py-2.5 px-3 font-bold text-amber-950">4. Developer Cash Exposure</td>
            <td className="py-2.5 px-3 text-amber-800">Spend Truth − Funding Truth (Cash fronted awaiting draw reimbursement)</td>
            <td className="py-2.5 px-3 text-right font-bold text-amber-900">
              ${fourTruths.developerCashExposure.toLocaleString()}
            </td>
          </tr>
          <tr>
            <td className="py-2.5 px-3 font-semibold text-slate-700">Daily Loan Carry Cost</td>
            <td className="py-2.5 px-3 text-slate-500">(Disbursed Loan Balance × {fourTruths.interestRatePct}%) / 365 days</td>
            <td className="py-2.5 px-3 text-right font-bold text-slate-900">
              ${fourTruths.dailyCarryingCost.toFixed(2)} / day
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
