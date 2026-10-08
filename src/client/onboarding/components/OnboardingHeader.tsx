import React from 'react';
import { RotateCcw, LogOut } from 'lucide-react';

interface OnboardingHeaderProps {
  progressPercent: number;
  onReset: () => void;
  onSignOut: () => void;
}

export const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({
  progressPercent,
  onReset,
  onSignOut,
}) => {
  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-20">
      <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm tracking-wider">
            G
          </div>
          <div>
            <span className="font-bold text-slate-900 tracking-tight text-base">GroundUp AI</span>
            <span className="text-xs text-slate-400 font-medium ml-2 hidden sm:inline-block">
              Workspace Setup
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded"
            title="Reset onboarding and start over"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Start Over</span>
          </button>
          <div className="h-4 w-[1px] bg-slate-200" />
          <button
            type="button"
            onClick={onSignOut}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="w-full bg-slate-100 h-1">
        <div 
          className="bg-slate-900 h-1 transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </header>
  );
};
