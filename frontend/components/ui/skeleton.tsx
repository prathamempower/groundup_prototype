import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-slate-100 shimmer-wave relative overflow-hidden",
        className
      )}
      {...props}
    />
  );
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2.5", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-3.5 rounded",
            i === lines - 1 ? "w-2/3" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-28 rounded" />
        <Skeleton className="h-7 w-7 rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-7 w-36 rounded-md" />
        <Skeleton className="h-3 w-24 rounded" />
      </div>
      <div className="pt-2 border-t border-slate-100">
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonTable({
  rows = 5,
  columns = 5,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-xs",
        className
      )}
    >
      {/* Table Header */}
      <div className="flex items-center gap-6 bg-slate-50/75 px-5 py-3.5 border-b border-slate-200/80">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn(
              "h-3 rounded",
              i === 0 ? "w-36" : i === columns - 1 ? "w-16 ml-auto" : "w-24"
            )}
          />
        ))}
      </div>
      {/* Table Rows */}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="flex items-center gap-6 px-5 py-4">
            {Array.from({ length: columns }).map((_, colIdx) => (
              <Skeleton
                key={colIdx}
                className={cn(
                  "h-4 rounded",
                  colIdx === 0
                    ? "w-44"
                    : colIdx === columns - 1
                    ? "w-16 ml-auto"
                    : "w-24"
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonPageHeader() {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs mb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-52 rounded-md" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <Skeleton className="h-3.5 w-72 rounded" />
        </div>
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-8.5 w-24 rounded-lg" />
          <Skeleton className="h-8.5 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
