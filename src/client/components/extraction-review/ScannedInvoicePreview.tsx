import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface ScannedInvoicePreviewProps {
  invoiceNumber: string;
}

export function ScannedInvoicePreview({ invoiceNumber }: ScannedInvoicePreviewProps) {
  return (
    <div className="p-6 bg-slate-100/70 overflow-y-auto space-y-4">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <span>Original Scanned Document</span>
        <span>Page 1 of 1</span>
      </div>

      <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm space-y-4 text-xs font-serif text-slate-800 relative">
        <div className="border-b border-slate-200 pb-3 flex justify-between items-start">
          <div>
            <div className="font-bold text-sm tracking-wide text-slate-900">NJ PIPE SERVICES LLC</div>
            <div className="text-[11px] text-slate-500">Commercial Plumbing & Heating Contractor</div>
            <div className="text-[11px] text-slate-500">412 River Road, North Bergen, NJ</div>
          </div>
          <div className="text-right">
            <div className="font-bold text-slate-900 font-mono">INVOICE</div>
            <div className="font-mono text-slate-600">{invoiceNumber}</div>
            <div className="text-slate-500">Date: Sep 28, 2026</div>
          </div>
        </div>

        <div>
          <div className="text-[11px] text-slate-500">BILLED TO:</div>
          <div className="font-bold text-slate-900">GroundUp Partners LLC · 73 Broadway Project</div>
        </div>

        <table className="w-full text-[11px] border border-slate-200">
          <thead className="bg-slate-50 border-b border-slate-200 text-left">
            <tr>
              <th className="p-1.5">Description</th>
              <th className="p-1.5 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="p-1.5">Rough-in DWV PVC and copper riser installation for 3 units</td>
              <td className="p-1.5 text-right font-mono font-semibold">$24,800.00</td>
            </tr>
            <tr>
              <td className="p-1.5">Township inspection test and air gauge hookups</td>
              <td className="p-1.5 text-right font-mono font-semibold">$3,600.00</td>
            </tr>
          </tbody>
        </table>

        <div className="p-2.5 rounded-lg border-2 border-amber-400 bg-amber-50/50 flex justify-between items-center relative">
          <span className="font-bold text-slate-900">INVOICE TOTAL DUE:</span>
          <span className="font-mono font-bold text-base text-slate-900">$28,400.00</span>
          <span className="absolute -top-2.5 right-3 bg-amber-500 text-white text-[9px] font-mono px-1.5 py-0.5 rounded font-bold">
            OCR Uncertain · 61%
          </span>
        </div>

        <div className="text-[10px] text-slate-400 italic pt-2">
          Memo: Payment due upon receipt. Inspection passed green tag posted on first floor.
        </div>
      </div>

      <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>SHA256: 4f8b91a27e3... verified source document</span>
      </div>
    </div>
  );
}
