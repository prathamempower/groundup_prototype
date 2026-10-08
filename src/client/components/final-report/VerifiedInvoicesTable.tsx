import React from 'react';
import { Check } from 'lucide-react';
import { FinalReportData } from '../../../server/services/pipelineService';

interface VerifiedInvoicesTableProps {
  verifiedInvoices: FinalReportData['verifiedInvoices'];
}

export function VerifiedInvoicesTable({ verifiedInvoices }: VerifiedInvoicesTableProps) {
  return (
    <div>
      <h3 className="text-sm font-bold text-slate-900 mb-2">
        Verified Subcontractor Invoices Ledger ({verifiedInvoices.length})
      </h3>
      <table className="w-full text-left border-collapse border border-slate-200 rounded-xl overflow-hidden">
        <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
          <tr>
            <th className="py-2.5 px-3 border-b border-slate-200">Vendor</th>
            <th className="py-2.5 px-3 border-b border-slate-200">Category</th>
            <th className="py-2.5 px-3 border-b border-slate-200">Invoice #</th>
            <th className="py-2.5 px-3 border-b border-slate-200">Date</th>
            <th className="py-2.5 px-3 border-b border-slate-200 text-right">Amount</th>
            <th className="py-2.5 px-3 border-b border-slate-200 text-center">Lien Waiver</th>
            <th className="py-2.5 px-3 border-b border-slate-200">Source Document</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-medium">
          {verifiedInvoices.map((inv, i) => (
            <tr key={i} className="hover:bg-slate-50/50">
              <td className="py-2 px-3 font-semibold text-slate-900">{inv.vendor}</td>
              <td className="py-2 px-3 text-slate-600">{inv.category}</td>
              <td className="py-2 px-3 font-mono text-[11px] text-slate-700">{inv.invoiceNumber}</td>
              <td className="py-2 px-3 text-slate-500">{inv.date}</td>
              <td className="py-2 px-3 text-right font-bold text-slate-900">${inv.amount.toLocaleString()}</td>
              <td className="py-2 px-3 text-center">
                {inv.lienWaiverVerified ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
                    <Check className="w-3 h-3" /> Received
                  </span>
                ) : (
                  <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold">
                    Pending
                  </span>
                )}
              </td>
              <td className="py-2 px-3 text-slate-400 text-[10px] truncate max-w-[140px]">{inv.sourceDocument}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
