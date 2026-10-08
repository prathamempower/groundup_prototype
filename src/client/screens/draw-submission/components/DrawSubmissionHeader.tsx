import React from 'react';
import { ChevronRight, UploadCloud } from 'lucide-react';

interface DrawSubmissionHeaderProps {
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitted: boolean;
}

export function DrawSubmissionHeader({
  onBack,
  onSubmit,
  isSubmitting,
  submitted,
}: DrawSubmissionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <button onClick={onBack} className="hover:text-slate-900 font-medium cursor-pointer">
          Portfolio
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <button onClick={onBack} className="hover:text-slate-900 font-medium cursor-pointer">
          212 Maple Ave
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-semibold">Draw #2 — Framing</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs cursor-pointer"
        >
          Save & exit
        </button>

        <button
          onClick={onSubmit}
          disabled={isSubmitting || submitted}
          className="flex items-center gap-2 px-4 py-1.5 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 transition shadow-xs disabled:opacity-50 cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          <span>{submitted ? 'Submitted to Heritage Bank' : isSubmitting ? 'Transmitting package...' : 'Submit to Heritage Bank'}</span>
        </button>
      </div>
    </div>
  );
}
