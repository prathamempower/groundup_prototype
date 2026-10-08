import React from 'react';
import { ArrowLeft, Check, ChevronRight, Loader2 } from 'lucide-react';
import { WIZARD_STEPS } from '../types';

interface NewProjectActionBarProps {
  currentStepIndex: number;
  isSubmitting: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export function NewProjectActionBar({
  currentStepIndex,
  isSubmitting,
  onBack,
  onNext,
  onSubmit,
}: NewProjectActionBarProps) {
  return (
    <div className="shrink-0 bg-white border-t border-slate-200 p-4 px-8 pr-52 flex items-center justify-between">
      <button
        onClick={onBack}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition cursor-pointer ${
          currentStepIndex === 0 
            ? 'text-slate-500 hover:bg-slate-100' 
            : 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-sm'
        }`}
      >
        {currentStepIndex === 0 ? 'Cancel' : <><ArrowLeft className="w-4 h-4" /> Back</>}
      </button>

      {currentStepIndex < WIZARD_STEPS.length - 1 ? (
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition shadow-sm cursor-pointer"
        >
          Continue <ChevronRight className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-8 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
          ) : (
            <><Check className="w-4 h-4" /> Create Project</>
          )}
        </button>
      )}
    </div>
  );
}
