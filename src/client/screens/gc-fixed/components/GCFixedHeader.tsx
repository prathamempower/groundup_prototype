import React from 'react';
import { FileCheck } from 'lucide-react';
import { Project } from '../../../../shared/types';

interface GCFixedHeaderProps {
  activeProject: Project;
  onOpenClaimModal: () => void;
}

export const GCFixedHeader: React.FC<GCFixedHeaderProps> = ({
  activeProject,
  onOpenClaimModal,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">
            GC Contractor Portal · Fixed Lump-Sum Contract
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Milestone Payment Claims & Proof of Work</h1>
        <p className="text-xs text-slate-500">
          Contractor: Kunal Shah Development · Project: {activeProject.name}
        </p>
      </div>

      <button
        onClick={onOpenClaimModal}
        className="px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-2"
      >
        <FileCheck className="w-4 h-4" />
        <span>+ Submit Milestone Payment Claim</span>
      </button>
    </div>
  );
};
