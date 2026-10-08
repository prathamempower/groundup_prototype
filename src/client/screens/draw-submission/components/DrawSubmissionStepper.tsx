import React from 'react';

interface DrawSubmissionStepperProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

const STEPS = [
  { step: 1, label: 'Site progress' },
  { step: 2, label: 'Receipts & matching' },
  { step: 3, label: 'Line items' },
  { step: 4, label: 'Lender package' },
];

export function DrawSubmissionStepper({
  currentStep,
  setCurrentStep,
}: DrawSubmissionStepperProps) {
  return (
    <div className="border-b border-slate-200 pb-3 flex items-center gap-8 text-xs font-medium">
      {STEPS.map(({ step, label }) => {
        const isActive = currentStep === step;
        return (
          <button
            key={step}
            onClick={() => setCurrentStep(step)}
            className={`flex items-center gap-2 transition cursor-pointer ${
              isActive ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                isActive ? 'bg-black text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {step}
            </span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
