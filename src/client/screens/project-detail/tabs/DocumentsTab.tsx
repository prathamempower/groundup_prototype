import React from 'react';
import {
  CreditCard,
  Check,
  FolderOpen,
  FileText,
} from 'lucide-react';
import { AmexCardTransaction, UserRole } from '../../../../shared/types';

interface DocumentsTabProps {
  currentRole?: UserRole;
  amexTransactions: AmexCardTransaction[];
  onConfirmAmexMatch: (txId: string) => void;
  onSelectDocForReview?: (doc: any) => void;
  onReviewDoc?: (doc: any) => void;
  onOpenInvoices?: () => void;
}

const fmt = (n: number) => '$' + n.toLocaleString();

export const DocumentsTab: React.FC<DocumentsTabProps> = ({
  currentRole = 'OWNER',
  amexTransactions,
  onConfirmAmexMatch,
  onSelectDocForReview,
  onReviewDoc,
  onOpenInvoices,
}) => {
  const handleReview = (doc: any) => {
    onSelectDocForReview?.(doc);
    onReviewDoc?.(doc);
  };
  return (
    <div className="space-y-6">
      {/* Amex Corporate Card Feed */}
      {currentRole !== 'INVESTOR' && currentRole !== 'GENERAL_CONTRACTOR' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-5 h-5 text-blue-700" />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Amex Project Card Feed (Card Ending 8421)</h4>
                <p className="text-xs text-slate-500">Expenses categorized by property every 3 days as described by Hardik</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Live Feed Connected
            </span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-2.5 text-left">Date</th>
                  <th className="px-4 py-2.5 text-left">Vendor</th>
                  <th className="px-4 py-2.5 text-left">AI Category Match</th>
                  <th className="px-4 py-2.5 text-right">Amount</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {amexTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-slate-500">{tx.date}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{tx.vendor}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-800">{tx.ai_suggested_category}</span>
                      <span className="ml-1.5 text-[10px] text-emerald-700 font-mono font-bold">
                        ({tx.ai_confidence}%)
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">{fmt(tx.amount)}</td>
                    <td className="px-4 py-3 text-right">
                      {tx.status === 'MATCHED' ? (
                        <span className="text-emerald-700 font-bold text-[11px] flex items-center justify-end gap-1">
                          <Check className="w-3.5 h-3.5" /> Matched
                        </span>
                      ) : (
                        <button
                          onClick={() => onConfirmAmexMatch(tx.id)}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[10px] font-bold cursor-pointer transition"
                        >
                          Confirm Match
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Document Ingestion Queue */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <FolderOpen className="w-5 h-5 text-slate-700" />
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Source Documents & OCR Staging Queue</h4>
              <p className="text-xs text-slate-500">Every number links to its underlying source document</p>
            </div>
          </div>
          {onOpenInvoices && (
            <button
              onClick={onOpenInvoices}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition flex items-center gap-1.5 self-start sm:self-auto"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Manage All Invoices & Ledger</span>
            </button>
          )}
        </div>

        <div className="space-y-2.5">
          {[
            { id: 'doc-1', name: 'Plumbing_Invoice_Sep.pdf', type: 'INVOICE', confidence: 61, flaggedItems: 1 },
            { id: 'doc-2', name: 'April_Expenses_Ledger.xlsx', type: 'EXPENSE_LEDGER', confidence: 97, flaggedItems: 0 },
            { id: 'doc-3', name: 'BCB_Bank_Statement_Aug.pdf', type: 'BANK_STATEMENT', confidence: 99, flaggedItems: 0 },
          ].map((doc) => (
            <div key={doc.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-slate-500" />
                <div>
                  <div className="font-bold text-slate-900">{doc.name}</div>
                  <div className="text-slate-500 text-[11px]">
                    Classification: {doc.type} · Confidence: {doc.confidence}%
                  </div>
                </div>
              </div>
              {doc.flaggedItems > 0 ? (
                <button
                  onClick={() => handleReview(doc)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs cursor-pointer transition"
                >
                  Review Flagged ({doc.flaggedItems})
                </button>
              ) : (
                <span className="text-emerald-700 font-semibold">✓ Posted to Spend Truth</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
