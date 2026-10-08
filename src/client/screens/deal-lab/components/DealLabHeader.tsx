import React from 'react';
import { ArrowLeft, Calculator, FileText, TrendingUp } from 'lucide-react';

interface DealLabHeaderProps {
  onBack: () => void;
  onReset: () => void;
  onSave: () => void;
}

export const DealLabHeader: React.FC<DealLabHeaderProps> = ({
  onBack,
  onReset,
  onSave,
}) => {
  return (
    <div className="bg-white border-b border-slate-200/80 px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 text-sm font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Portfolio
        </button>
        <div className="h-6 w-px bg-slate-200" />
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold leading-tight">Deal Lab — Underwriting Calculator</h1>
          </div>
        </div>
        <span className="ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
          Pre-Acquisition Analysis
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onReset} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer">
          Reset
        </button>
        <button className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer">
          <FileText className="w-4 h-4" />
          Export PDF
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 cursor-pointer"
        >
          Save as New Project <TrendingUp className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
