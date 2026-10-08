import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { OnboardingInvoiceItem } from '../types';

interface ManualInvoiceTableProps {
  invoices: OnboardingInvoiceItem[];
  setInvoices: React.Dispatch<React.SetStateAction<OnboardingInvoiceItem[]>>;
}

export function ManualInvoiceTable({ invoices, setInvoices }: ManualInvoiceTableProps) {
  const handleAddSampleLine = () => {
    const newInv: OnboardingInvoiceItem = {
      id: String(Date.now()),
      vendor: 'New Subcontractor Co',
      category: 'Interior Finishes',
      amount: 25000,
      inv: `INV-${Math.floor(100 + Math.random() * 900)}`,
      waiver: true,
    };
    setInvoices([...invoices, newInv]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-slate-500">Directly add subcontractor invoices or receipts</span>
        <button
          type="button"
          onClick={handleAddSampleLine}
          className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Invoice Line
        </button>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
            <tr>
              <th className="py-1.5 px-3">Vendor</th>
              <th>Category</th>
              <th>Amount</th>
              <th className="text-right px-3">Remove</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[11px]">
            {invoices.map((inv, idx) => (
              <tr key={inv.id}>
                <td className="py-1.5 px-3 font-semibold text-slate-800">{inv.vendor}</td>
                <td>{inv.category}</td>
                <td className="font-bold text-slate-900">${inv.amount.toLocaleString()}</td>
                <td className="text-right px-3">
                  <button
                    type="button"
                    onClick={() => setInvoices(invoices.filter((_, i) => i !== idx))}
                    className="text-rose-500 hover:text-rose-700 cursor-pointer"
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
