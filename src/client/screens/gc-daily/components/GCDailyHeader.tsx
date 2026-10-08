import React from 'react';
import { Project } from '../../../../shared/types';

interface GCDailyHeaderProps {
  activeProject: Project;
}

export const GCDailyHeader: React.FC<GCDailyHeaderProps> = ({ activeProject }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
          <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
            GC Portal · Daily Updates & Cost-Plus Accounting
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Daily Field Logs & Subcontractor Receipts</h1>
        <p className="text-xs text-slate-500">
          Contractor: Sylvia Concrete & Framing · Project: {activeProject.name}
        </p>
      </div>

      <div className="flex items-center gap-2 font-mono text-xs bg-slate-900 text-white px-3.5 py-2 rounded-xl">
        <span>Contract Terms: Cost + 12% GC Markup</span>
      </div>
    </div>
  );
};
