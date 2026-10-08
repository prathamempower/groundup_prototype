import React from 'react';

interface InvoiceIntakeTabProps {
  invoiceCategory: string;
  setInvoiceCategory: (cat: string) => void;
  vendorName: string;
  setVendorName: (vendor: string) => void;
  invoiceAmount: string;
  setInvoiceAmount: (amt: string) => void;
  invoiceDate: string;
  setInvoiceDate: (date: string) => void;
  invoiceDesc: string;
  setInvoiceDesc: (desc: string) => void;
  lienWaiver: boolean;
  setLienWaiver: (waiver: boolean) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const InvoiceIntakeTab: React.FC<InvoiceIntakeTabProps> = ({
  invoiceCategory,
  setInvoiceCategory,
  vendorName,
  setVendorName,
  invoiceAmount,
  setInvoiceAmount,
  invoiceDate,
  setInvoiceDate,
  invoiceDesc,
  setInvoiceDesc,
  lienWaiver,
  setLienWaiver,
  loading,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-xl mx-auto">
      <div>
        <h3 className="text-sm font-bold text-white">Direct Contractor Invoice Entry</h3>
        <p className="text-xs text-slate-400">Directly posted to Spend Truth upon confirmation.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block text-slate-300 font-medium mb-1">Trade Category</label>
          <input
            type="text"
            value={invoiceCategory}
            onChange={(e) => setInvoiceCategory(e.target.value)}
            required
            className="w-full bg-surface-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-slate-300 font-medium mb-1">Vendor / Subcontractor</label>
          <input
            type="text"
            value={vendorName}
            onChange={(e) => setVendorName(e.target.value)}
            required
            className="w-full bg-surface-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block text-slate-300 font-medium mb-1">Invoice Amount ($)</label>
          <input
            type="number"
            step="0.01"
            value={invoiceAmount}
            onChange={(e) => setInvoiceAmount(e.target.value)}
            required
            className="w-full bg-surface-950 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold"
          />
        </div>
        <div>
          <label className="block text-slate-300 font-medium mb-1">Invoice Date</label>
          <input
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
            required
            className="w-full bg-surface-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
          />
        </div>
      </div>

      <div className="text-xs">
        <label className="block text-slate-300 font-medium mb-1">Work Description / Scope</label>
        <textarea
          rows={2}
          value={invoiceDesc}
          onChange={(e) => setInvoiceDesc(e.target.value)}
          className="w-full bg-surface-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
        />
      </div>

      <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-950 border border-slate-800 text-xs text-slate-300">
        <input
          type="checkbox"
          id="waiver"
          checked={lienWaiver}
          onChange={(e) => setLienWaiver(e.target.checked)}
          className="rounded border-slate-700 text-brand-500 focus:ring-brand-500"
        />
        <label htmlFor="waiver" className="cursor-pointer font-medium">
          Unconditional Progress Lien Waiver received and verified
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-md shadow-brand-500/20 cursor-pointer"
      >
        {loading ? 'Posting...' : 'Post Invoice to Spend Truth'}
      </button>
    </form>
  );
};
