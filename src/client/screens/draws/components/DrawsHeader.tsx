import React from 'react';
import { Layers, RefreshCw } from 'lucide-react';

interface DrawsHeaderProps {
  loading: boolean;
  onRefresh: () => void;
}

export function DrawsHeader({ loading, onRefresh }: DrawsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-brand-400" /> Draw Tracker & Revisions
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Append-only revision chains • Historical records are never overwritten.
        </p>
      </div>
      <button
        onClick={onRefresh}
        className="p-2 rounded-xl bg-surface-900 border border-slate-700 text-slate-400 hover:text-white cursor-pointer"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}
