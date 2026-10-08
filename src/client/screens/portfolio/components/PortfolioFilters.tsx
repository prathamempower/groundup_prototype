import React from 'react';
import { Search } from 'lucide-react';
import { PortfolioFilter } from '../types';

interface PortfolioFiltersProps {
  totalCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filter: PortfolioFilter;
  setFilter: (filter: PortfolioFilter) => void;
}

export const PortfolioFilters: React.FC<PortfolioFiltersProps> = ({
  totalCount,
  searchQuery,
  setSearchQuery,
  filter,
  setFilter,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-3">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Development Portfolio</h2>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
          {totalCount} Projects
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter projects or lenders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 w-48 sm:w-60 shadow-2xs"
          />
        </div>

        <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/60">
          {(['All', 'Active', 'Completed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                filter === tab
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
