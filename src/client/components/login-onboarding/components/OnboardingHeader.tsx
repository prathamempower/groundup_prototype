import React from 'react';
import { X } from 'lucide-react';

interface OnboardingHeaderProps {
  step: number;
  onClose: () => void;
}

const STEP_LABELS: Record<number, string> = {
  1: 'User Details & Organization',
  2: 'Project Info & Status Selection',
  3: 'Budget, Loan & Invoices Intake',
  4: 'Final Certified Audit Report',
};

export function OnboardingHeader({ step, onClose }: OnboardingHeaderProps) {
  return (
    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-black text-white text-xs font-bold flex items-center justify-center">
            G
          </span>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Data Intake & Project Audit Setup
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Step {step} of 4: {STEP_LABELS[step]}
        </p>
      </div>

      <button
        onClick={onClose}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
