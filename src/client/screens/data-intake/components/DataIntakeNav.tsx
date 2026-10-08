import React from 'react';
import { FileSpreadsheet, Receipt, Calendar, Sparkles } from 'lucide-react';
import { IntakeTab } from '../types';

interface DataIntakeNavProps {
  activeTab: IntakeTab;
  setActiveTab: (tab: IntakeTab) => void;
}

export const DataIntakeNav: React.FC<DataIntakeNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="bg-surface-950 px-5 py-2.5 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
      <button
        onClick={() => setActiveTab('budget')}
        className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
          activeTab === 'budget'
            ? 'bg-brand-500 text-slate-950 font-bold shadow-md shadow-brand-500/20'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <FileSpreadsheet className="w-4 h-4" /> 1. Budget & SOV (CFO)
      </button>
      <button
        onClick={() => setActiveTab('invoice')}
        className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
          activeTab === 'invoice'
            ? 'bg-brand-500 text-slate-950 font-bold shadow-md shadow-brand-500/20'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <Receipt className="w-4 h-4" /> 2. Invoices & Expenses (Accountant)
      </button>
      <button
        onClick={() => setActiveTab('schedule')}
        className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
          activeTab === 'schedule'
            ? 'bg-brand-500 text-slate-950 font-bold shadow-md shadow-brand-500/20'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <Calendar className="w-4 h-4" /> 3. Schedule & Inspections (PM)
      </button>
      <button
        onClick={() => setActiveTab('ai_parse')}
        className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
          activeTab === 'ai_parse'
            ? 'bg-brand-500 text-slate-950 font-bold shadow-md shadow-brand-500/20'
            : 'text-brand-400 hover:text-white'
        }`}
      >
        <Sparkles className="w-4 h-4" /> 4. AI Document Extraction
      </button>
    </div>
  );
};
