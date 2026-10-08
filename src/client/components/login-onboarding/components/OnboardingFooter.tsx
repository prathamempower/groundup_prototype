import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface OnboardingFooterProps {
  step: number;
  onBack: () => void;
  onNext: () => void;
  onFinish: () => void;
}

export function OnboardingFooter({
  step,
  onBack,
  onNext,
  onFinish,
}: OnboardingFooterProps) {
  return (
    <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50 rounded-b-2xl">
      {step > 1 ? (
        <button
          onClick={onBack}
          className="px-4 py-2 border border-slate-200 bg-white rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
        >
          Back
        </button>
      ) : (
        <div />
      )}

      {step < 4 ? (
        <button
          onClick={onNext}
          className="flex items-center gap-1.5 px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-black transition shadow-xs cursor-pointer"
        >
          <span>Next</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      ) : (
        <button
          onClick={onFinish}
          className="flex items-center gap-1.5 px-6 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 transition shadow-xs cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Launch Project & View Dashboard</span>
        </button>
      )}
    </div>
  );
}
