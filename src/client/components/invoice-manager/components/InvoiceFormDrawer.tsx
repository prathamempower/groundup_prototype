import React from 'react';
import { INVOICE_CATEGORIES } from '../types';

interface InvoiceFormDrawerProps {
  isAddingNew: boolean;
  vendorName: string;
  setVendorName: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  amount: number;
  setAmount: (val: number) => void;
  invoiceNumber: string;
  setInvoiceNumber: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  lienWaiver: boolean;
  setLienWaiver: (val: boolean) => void;
  onCancel: () => void;
  onSave: (e: React.FormEvent) => void;
}

export function InvoiceFormDrawer({
  isAddingNew,
  vendorName,
  setVendorName,
  category,
  setCategory,
  amount,
  setAmount,
  invoiceNumber,
  setInvoiceNumber,
  description,
  setDescription,
  lienWaiver,
  setLienWaiver,
  onCancel,
  onSave,
}: InvoiceFormDrawerProps) {
  return (
    <form onSubmit={onSave} className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-4 animate-in fade-in duration-150">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <h3 className="text-xs font-bold text-slate-900">
          {isAddingNew ? '+ Add New Contractor Invoice' : 'Edit Invoice Details'}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
        >
          Cancel
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Vendor / Subcontractor</label>
          <input
            type="text"
            value={vendorName}
            onChange={(e) => setVendorName(e.target.value)}
            placeholder="e.g. Titan Concrete LLC"
            required
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-900 outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Budget Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-900 outline-none"
          >
            {INVOICE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Invoice Amount ($)</label>
          <input
            type="number"
            value={amount === 0 ? '' : amount}
            onFocus={(e) => e.target.select()}
            onChange={(e) => {
              const clean = e.target.value.replace(/^0+(?=\d)/, '');
              setAmount(clean === '' ? 0 : Number(clean));
            }}
            placeholder="0"
            required
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 text-right outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Invoice Number</label>
          <input
            type="text"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            placeholder="INV-4921"
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Scope Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Slab pour, trusses, rough-in materials..."
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={lienWaiver}
            onChange={(e) => setLienWaiver(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
          />
          <span>Lien Waiver Received & Verified</span>
        </label>

        <button
          type="submit"
          className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer"
        >
          {isAddingNew ? 'Post Invoice to Ledger' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
