import React from 'react';
import { Sparkles } from 'lucide-react';

interface DataIntakeHeaderProps {
  onClose: () => void;
}

export const DataIntakeHeader: React.FC<DataIntakeHeaderProps> = ({ onClose }) => {
  return (
    <div className="p-5 border-b border-slate-800 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-semibold text-brand-400 uppercase tracking-wider">
            GroundUp Intake Hub
          </div>
          <h2 className="text-lg font-bold text-white leading-tight">
            Project Data Intake & Ingestion Center
          </h2>
        </div>
      </div>
      <button
        onClick={onClose}
        className="px-4 py-2 rounded-xl bg-surface-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
      >
        Close
      </button>
    </div>
  );
};
