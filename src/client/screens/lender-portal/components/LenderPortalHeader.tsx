import React from 'react';
import { Project } from '../../../../shared/types';

interface LenderPortalHeaderProps {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
}

export function LenderPortalHeader({
  projects,
  selectedProjectId,
  onSelectProject,
}: LenderPortalHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
            Lender Portal · BCB Community Bank
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Construction Loan Draw Review Queue</h1>
        <p className="text-xs text-slate-500">
          Audit contractor lien waivers, verify inspection sign-offs, and authorize wire disbursements
        </p>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-xs font-semibold text-slate-600">Active Loan:</label>
        <select
          value={selectedProjectId}
          onChange={(e) => onSelectProject(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none shadow-xs cursor-pointer"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.address})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
