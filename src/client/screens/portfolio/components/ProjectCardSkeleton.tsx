import React from 'react';

export const ProjectCardSkeleton: React.FC = () => {
  return (
    <div className="border border-slate-200/80 rounded-2xl p-6 bg-white shadow-2xs flex flex-col justify-between gap-5 animate-pulse">
      <div className="space-y-3">
        {/* Top Badges */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-5 w-16 bg-slate-200 rounded-full" />
            <div className="h-5 w-20 bg-slate-100 rounded-full" />
          </div>
          <div className="h-5 w-14 bg-slate-100 rounded-full" />
        </div>

        {/* Title & Address */}
        <div className="space-y-1.5 pt-1">
          <div className="h-5 w-3/4 bg-slate-200 rounded-md" />
          <div className="h-3.5 w-1/2 bg-slate-100 rounded-md" />
        </div>

        {/* Team Avatars Skeleton */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="h-3 w-8 bg-slate-200 rounded" />
            <div className="flex -space-x-1.5">
              <div className="w-6 h-6 rounded-full bg-slate-200 ring-2 ring-white" />
              <div className="w-6 h-6 rounded-full bg-slate-200 ring-2 ring-white" />
              <div className="w-6 h-6 rounded-full bg-slate-200 ring-2 ring-white" />
            </div>
          </div>
          <div className="h-3 w-20 bg-slate-100 rounded" />
        </div>
      </div>

      {/* Progress & Financials */}
      <div className="space-y-3.5">
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <div className="h-3 w-24 bg-slate-200 rounded" />
            <div className="h-3 w-8 bg-slate-200 rounded" />
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full" />
        </div>

        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-2.5 w-10 bg-slate-100 rounded" />
              <div className="h-3.5 w-14 bg-slate-200 rounded" />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="h-3 w-20 bg-slate-100 rounded" />
          <div className="h-3 w-24 bg-slate-200 rounded" />
        </div>
      </div>
    </div>
  );
};
