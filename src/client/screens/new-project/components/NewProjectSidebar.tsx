import React from 'react';
import { Check } from 'lucide-react';
import { WIZARD_STEPS } from '../types';

interface NewProjectSidebarProps {
  currentStepIndex: number;
}

export function NewProjectSidebar({ currentStepIndex }: NewProjectSidebarProps) {
  return (
    <div className="w-72 bg-white border-r border-slate-200 p-8 shrink-0 overflow-y-auto">
      <div className="space-y-8">
        {WIZARD_STEPS.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isPast = index < currentStepIndex;

          return (
            <div key={step.id} className="flex relative">
              {index !== WIZARD_STEPS.length - 1 && (
                <div
                  className={`absolute top-8 left-3.5 w-0.5 h-full -ml-px ${
                    isPast ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${
                  isPast
                    ? 'bg-emerald-500 text-white'
                    : isActive
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {isPast ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{index + 1}</span>}
              </div>
              <div className="ml-4 pb-8">
                <h3
                  className={`text-sm font-bold ${
                    isActive ? 'text-slate-900' : isPast ? 'text-slate-700' : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
