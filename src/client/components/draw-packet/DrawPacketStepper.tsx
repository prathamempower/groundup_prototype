import React from 'react';

export type DrawStep = 1 | 2 | 3 | 4;

interface DrawPacketStepperProps {
  step: DrawStep;
  setStep: (step: DrawStep) => void;
}

const STEP_ITEMS: Array<{ s: DrawStep; label: string }> = [
  { s: 1, label: 'Select Lines' },
  { s: 2, label: 'Audit Conditions' },
  { s: 3, label: 'Retainage Math' },
  { s: 4, label: 'Packet Summary' },
];

export function DrawPacketStepper({ step, setStep }: DrawPacketStepperProps) {
  return (
    <div className="px-6 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between text-xs shrink-0">
      {STEP_ITEMS.map((item) => {
        const isActive = step === item.s;
        const isCompleted = step > item.s;

        return (
          <button
            key={item.s}
            type="button"
            onClick={() => setStep(item.s)}
            className={`flex items-center gap-1.5 font-semibold transition py-1.5 px-2 rounded-lg cursor-pointer ${
              isActive
                ? 'text-slate-900 border-b-2 border-slate-900 pb-1'
                : isCompleted
                ? 'text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50/70'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span
              className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : isCompleted
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isCompleted ? '✓' : item.s}
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
