import React from 'react';
import { Download } from 'lucide-react';
import { Project } from '../../../../shared/types';

interface InvestorHeaderProps {
  activeProject: Project;
  onDownload: () => void;
}

export function InvestorHeader({ activeProject, onDownload }: InvestorHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">
            Investor Transparency Portal · Read-Only Access
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Investment Performance & Distribution Schedule</h1>
        <p className="text-xs text-slate-500">
          Investor: Krutarth Shah · Project: {activeProject.name} (73 Broadway, Hoboken)
        </p>
      </div>

      <button
        onClick={onDownload}
        className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        <span>Download Certified Report (PDF)</span>
      </button>
    </div>
  );
}
