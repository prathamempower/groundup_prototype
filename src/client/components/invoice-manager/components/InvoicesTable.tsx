import React from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Expense } from '../../../../shared/types';

interface InvoicesTableProps {
  invoices: Expense[];
  isAddingNew: boolean;
  editingInvoiceId: string | null;
  onStartAdd: () => void;
  onStartEdit: (inv: Expense) => void;
  onDeleteInvoice: (id: string, vendor: string) => void;
}

export function InvoicesTable({
  invoices,
  isAddingNew,
  editingInvoiceId,
  onStartAdd,
  onStartEdit,
  onDeleteInvoice,
}: InvoicesTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-900">Current Invoices ({invoices.length})</span>
        {!isAddingNew && !editingInvoiceId && (
          <button
            onClick={onStartAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Single Invoice</span>
          </button>
        )}
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase">
              <th className="py-2.5 px-3">VENDOR</th>
              <th className="py-2.5 px-3">CATEGORY</th>
              <th className="py-2.5 px-3">INV #</th>
              <th className="py-2.5 px-3 text-right">AMOUNT</th>
              <th className="py-2.5 px-3 text-center">WAIVER</th>
              <th className="py-2.5 px-3 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50 transition">
                <td className="py-3 px-3 font-semibold text-slate-900">
                  {inv.vendor_name}
                  <p className="text-[10px] text-slate-400 font-normal">{inv.description}</p>
                </td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                    {inv.category}
                  </span>
                </td>
                <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                  {inv.invoice_id || '—'}
                </td>
                <td className="py-3 px-3 text-right font-bold text-slate-900">
                  ${inv.amount.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-center">
                  {inv.lien_waiver_received ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Yes
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-amber-200">
                      <AlertCircle className="w-3 h-3 text-amber-500" /> Missing
                    </span>
                  )}
                </td>
                <td className="py-3 px-3 text-right space-x-1">
                  <button
                    onClick={() => onStartEdit(inv)}
                    className="p-1.5 text-slate-400 hover:text-slate-900 rounded hover:bg-slate-100 transition cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteInvoice(inv.id, inv.vendor_name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
