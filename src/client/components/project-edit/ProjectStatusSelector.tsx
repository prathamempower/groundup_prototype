import React from 'react';

interface ProjectStatusSelectorProps {
  status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
  setStatus: (status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED') => void;
}

export function ProjectStatusSelector({ status, setStatus }: ProjectStatusSelectorProps) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
        Project Status
      </label>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setStatus('ACTIVE')}
          className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
            status === 'ACTIVE'
              ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Ongoing
        </button>
        <button
          type="button"
          onClick={() => setStatus('ON_HOLD')}
          className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
            status === 'ON_HOLD'
              ? 'border-amber-500 bg-amber-50 text-amber-800'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          Not Started
        </button>
        <button
          type="button"
          onClick={() => setStatus('COMPLETED')}
          className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
            status === 'COMPLETED'
              ? 'border-blue-600 bg-blue-50 text-blue-800'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          Completed
        </button>
      </div>
    </div>
  );
}
