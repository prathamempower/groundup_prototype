import React from 'react';

interface NewProjectHeaderProps {
  onCancel: () => void;
}

export function NewProjectHeader({ onCancel }: NewProjectHeaderProps) {
  return (
    <div className="px-8 py-6 border-b border-slate-200 bg-white shrink-0 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create New Project</h1>
        <p className="text-sm text-slate-500 mt-1">Set up the foundational details for your new development.</p>
      </div>
      <button
        onClick={onCancel}
        className="text-sm font-semibold text-slate-500 hover:text-slate-700 transition cursor-pointer"
      >
        Cancel
      </button>
    </div>
  );
}
