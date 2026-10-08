import React from 'react';
import { UploadCloud } from 'lucide-react';
import { OnboardingInvoiceItem } from '../types';
import { FinancialInputsGrid } from './FinancialInputsGrid';
import { ManualInvoiceTable } from './ManualInvoiceTable';
import { MultiDocDropzone } from './MultiDocDropzone';

interface OnboardingFinancialsStepProps {
  targetBudget: number;
  setTargetBudget: (val: number) => void;
  lenderName: string;
  setLenderName: (val: string) => void;
  loanAmount: number;
  setLoanAmount: (val: number) => void;
  interestRate: number;
  setInterestRate: (val: number) => void;
  invoices: OnboardingInvoiceItem[];
  setInvoices: React.Dispatch<React.SetStateAction<OnboardingInvoiceItem[]>>;
  uploadMethod: 'manual' | 'doc-upload';
  setUploadMethod: (method: 'manual' | 'doc-upload') => void;
}

export function OnboardingFinancialsStep({
  targetBudget,
  setTargetBudget,
  lenderName,
  setLenderName,
  loanAmount,
  setLoanAmount,
  interestRate,
  setInterestRate,
  invoices,
  setInvoices,
  uploadMethod,
  setUploadMethod,
}: OnboardingFinancialsStepProps) {
  const totalIncurred = invoices.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-4">
      <FinancialInputsGrid
        targetBudget={targetBudget}
        setTargetBudget={setTargetBudget}
        lenderName={lenderName}
        setLenderName={setLenderName}
        loanAmount={loanAmount}
        setLoanAmount={setLoanAmount}
        interestRate={interestRate}
        setInterestRate={setInterestRate}
      />

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase">
              Incurred Invoices & Receipts ({invoices.length})
            </label>
            <p className="text-[11px] text-slate-500">
              Total Incurred: <strong className="text-slate-900">${totalIncurred.toLocaleString()}</strong>
            </p>
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
            <button
              type="button"
              onClick={() => setUploadMethod('manual')}
              className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                uploadMethod === 'manual' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Method 1: Manual Ledger
            </button>
            <button
              type="button"
              onClick={() => setUploadMethod('doc-upload')}
              className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer flex items-center gap-1 ${
                uploadMethod === 'doc-upload' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <UploadCloud className="w-3 h-3 text-emerald-700" />
              Method 2: Multi-Doc Ingestion
            </button>
          </div>
        </div>

        {uploadMethod === 'manual' ? (
          <ManualInvoiceTable invoices={invoices} setInvoices={setInvoices} />
        ) : (
          <MultiDocDropzone setInvoices={setInvoices} />
        )}
      </div>
    </div>
  );
}
