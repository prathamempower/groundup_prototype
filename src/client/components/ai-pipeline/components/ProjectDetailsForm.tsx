import React from 'react';

interface ProjectDetailsFormProps {
  projectName: string;
  setProjectName: (name: string) => void;
  projectAddress: string;
  setProjectAddress: (addr: string) => void;
  targetBudget: string;
  setTargetBudget: (budget: string) => void;
  disabled: boolean;
}

export function ProjectDetailsForm({
  projectName,
  setProjectName,
  projectAddress,
  setProjectAddress,
  targetBudget,
  setTargetBudget,
  disabled,
}: ProjectDetailsFormProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
      <div>
        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
          Project Name
        </label>
        <input
          type="text"
          disabled={disabled}
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-slate-900 outline-none"
        />
      </div>
      <div>
        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
          Project Address
        </label>
        <input
          type="text"
          disabled={disabled}
          value={projectAddress}
          onChange={(e) => setProjectAddress(e.target.value)}
          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-slate-900 outline-none"
        />
      </div>
      <div>
        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
          Target Budget ($)
        </label>
        <input
          type="number"
          disabled={disabled}
          value={targetBudget}
          onChange={(e) => setTargetBudget(e.target.value)}
          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-slate-900 outline-none"
        />
      </div>
    </div>
  );
}
