import React from 'react';
import { Upload, Mail, HardDrive, Building, Check } from 'lucide-react';
import { InputSource } from '../types';

interface InputSourceSelectorProps {
  inputSource: InputSource;
  setInputSource: (source: InputSource) => void;
  disabled: boolean;
}

const SOURCES = [
  { id: 'FILE_UPLOAD' as const, label: 'File Upload', icon: Upload, desc: 'PDF, CSV, Excel, Word' },
  { id: 'EMAIL_ATTACHMENT' as const, label: 'Email Attachments', icon: Mail, desc: 'invoices@groundup.ai' },
  { id: 'BANK_FEED' as const, label: 'Bank Integrations', icon: HardDrive, desc: 'ACH & Wire Ledger' },
  { id: 'CONTRACTOR_PORTAL' as const, label: 'Contractor Portals', icon: Building, desc: 'Subcontractor Uploads' },
];

export function InputSourceSelector({
  inputSource,
  setInputSource,
  disabled,
}: InputSourceSelectorProps) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
        Input Sources (Select Ingestion Channel)
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {SOURCES.map((src) => {
          const Icon = src.icon;
          const isSelected = inputSource === src.id;
          return (
            <button
              key={src.id}
              disabled={disabled}
              onClick={() => setInputSource(src.id)}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-semibold shadow-xs ring-1 ring-emerald-500'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`} />
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700" />}
              </div>
              <div>
                <p className="text-xs font-bold">{src.label}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{src.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
