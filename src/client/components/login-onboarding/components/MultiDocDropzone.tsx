import React from 'react';
import { UploadCloud } from 'lucide-react';
import { OnboardingInvoiceItem } from '../types';

interface MultiDocDropzoneProps {
  setInvoices: React.Dispatch<React.SetStateAction<OnboardingInvoiceItem[]>>;
}

export function MultiDocDropzone({ setInvoices }: MultiDocDropzoneProps) {
  const handleFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newParsed: OnboardingInvoiceItem[] = [];
      Array.from(files).forEach((f, i) => {
        const ext = f.name.split('.').pop()?.toLowerCase();
        let cat = 'Materials & Finishes';
        let vendor = f.name.replace(/\.[^/.]+$/, '');
        let amt = Math.floor(18000 + Math.random() * 45000);

        if (ext === 'aiag702' || ext === 'aiag703' || f.name.toLowerCase().includes('g702') || f.name.toLowerCase().includes('g703')) {
          vendor = 'General Contractor (AIA Progress)';
          cat = 'AIA G702/G703 Schedule';
          amt = 64500;
        } else if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
          vendor = 'SOV Master Cost Ledger';
          cat = 'Direct Hard Costs';
          amt = 52000;
        } else if (ext === 'zip') {
          vendor = 'Subcontractor Invoice Batch';
          cat = 'Structural & MEP Package';
          amt = 89000;
        } else if (ext === 'pdf') {
          cat = 'Framing & Lumber';
          amt = 34500;
        }

        newParsed.push({
          id: `uploaded-${Date.now()}-${i}`,
          vendor,
          category: cat,
          amount: amt,
          inv: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
          waiver: true,
        });
      });
      setInvoices((prev) => [...prev, ...newParsed]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-4 text-center transition bg-slate-50/50">
        <UploadCloud className="w-7 h-7 text-emerald-700 mx-auto mb-1" />
        <p className="text-xs font-semibold text-slate-800">Upload Invoices, SOVs, or Draw Packages</p>
        <p className="text-[11px] text-slate-500 mt-0.5">Supports PDF, Word, ZIP, Excel, AIA G702 & G703</p>
        <div className="mt-3 flex items-center justify-center gap-2">
          <label className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold cursor-pointer transition shadow-xs inline-flex items-center gap-1.5">
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Browse Files to Ingest</span>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.zip,.xlsx,.xls,.csv,.aiag702,.aiag703"
              className="hidden"
              onChange={handleFilesUpload}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
