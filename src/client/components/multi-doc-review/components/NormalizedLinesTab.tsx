import React from 'react';
import { FileSpreadsheet, Receipt, Trash2 } from 'lucide-react';
import { NormalizedSOVItem, NormalizedInvoiceItem } from '../types';

interface NormalizedLinesTabProps {
  mode: 'full' | 'sov_only' | 'invoices_only';
  sovItems: NormalizedSOVItem[];
  invoiceItems: NormalizedInvoiceItem[];
  totalBudget: number;
  totalSpend: number;
  onUpdateSOVAmount: (index: number, val: number) => void;
  onUpdateInvoiceAmount: (index: number, val: number) => void;
  onDeleteSOV: (index: number) => void;
  onDeleteInvoice: (index: number) => void;
}

export function NormalizedLinesTab({
  mode,
  sovItems,
  invoiceItems,
  totalBudget,
  totalSpend,
  onUpdateSOVAmount,
  onUpdateInvoiceAmount,
  onDeleteSOV,
  onDeleteInvoice,
}: NormalizedLinesTabProps) {
  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[55vh]">
      {mode !== 'invoices_only' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" /> Normalized Master Budget SOV Lines ({sovItems.length})
            </h3>
            <span className="text-xs font-bold text-emerald-800">
              Subtotal: ${totalBudget.toLocaleString()}
            </span>
          </div>

          {sovItems.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
              No SOV budget items extracted. Upload an Excel (.xlsx), CSV, or budget PDF to populate.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px]">
                    <th className="py-2.5 px-3 font-semibold">CSI Division</th>
                    <th className="py-2.5 px-3 font-semibold">Normalized Category</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Extracted Budget ($)</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Confidence</th>
                    <th className="py-2.5 px-3 font-semibold">Source Documents</th>
                    <th className="py-2.5 px-2 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sovItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="py-2 px-3 font-mono font-bold text-slate-700">{item.costCode}</td>
                      <td className="py-2 px-3 font-medium text-slate-900">{item.category}</td>
                      <td className="py-2 px-3 text-right">
                        <div className="inline-flex items-center border border-slate-200 rounded-lg px-2 py-1 bg-white">
                          <span className="text-slate-400 mr-1">$</span>
                          <input
                            type="number"
                            value={item.amount}
                            onChange={(e) => onUpdateSOVAmount(idx, Number(e.target.value))}
                            className="w-24 text-right font-bold text-xs outline-none"
                          />
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {(item.confidence * 100).toFixed(0)}% Verified
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-500 text-[11px] truncate max-w-xs">{item.sourceDocuments.join(', ')}</td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => onDeleteSOV(idx)}
                          className="text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {mode !== 'sov_only' && (
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-600" /> Normalized Contractor Invoices & Spend ({invoiceItems.length})
            </h3>
            <span className="text-xs font-bold text-amber-800">
              Subtotal: ${totalSpend.toLocaleString()}
            </span>
          </div>

          {invoiceItems.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
              No contractor invoice lines extracted. Upload trade invoices or pay applications to populate.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px]">
                    <th className="py-2.5 px-3 font-semibold">Vendor / Trade Partner</th>
                    <th className="py-2.5 px-3 font-semibold">Invoice #</th>
                    <th className="py-2.5 px-3 font-semibold">Normalized Category</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Net Amount Due ($)</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Confidence</th>
                    <th className="py-2.5 px-3 font-semibold">Source File</th>
                    <th className="py-2.5 px-2 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoiceItems.map((inv, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="py-2 px-3 font-bold text-slate-900">{inv.vendor}</td>
                      <td className="py-2 px-3 font-mono text-slate-600">{inv.invoiceNumber}</td>
                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-medium">
                          {inv.category}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="inline-flex items-center border border-slate-200 rounded-lg px-2 py-1 bg-white">
                          <span className="text-slate-400 mr-1">$</span>
                          <input
                            type="number"
                            value={inv.amount}
                            onChange={(e) => onUpdateInvoiceAmount(idx, Number(e.target.value))}
                            className="w-24 text-right font-bold text-xs outline-none"
                          />
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          {(inv.confidence * 100).toFixed(0)}% Verified
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-500 text-[11px] truncate max-w-xs">{inv.sourceDocument}</td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => onDeleteInvoice(idx)}
                          className="text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
