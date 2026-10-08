import React from 'react';
import { Eye } from 'lucide-react';

interface GCSyncSectionProps {
  visibleToGC: boolean;
  setVisibleToGC: (visible: boolean) => void;
  gcName: string;
  gcNotes: string;
  setGcNotes: (notes: string) => void;
}

export function GCSyncSection({
  visibleToGC,
  setVisibleToGC,
  gcName,
  gcNotes,
  setGcNotes,
}: GCSyncSectionProps) {
  return (
    <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={visibleToGC}
            onChange={(e) => setVisibleToGC(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <span className="font-bold text-slate-900 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>Show & Submit to General Contractor ({gcName})</span>
          </span>
        </label>
        <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
          GC Portal Sync
        </span>
      </div>
      <p className="text-[11px] text-slate-600 pl-6 leading-relaxed">
        When approved, this change order will automatically be submitted and displayed in the GC Contractor Portal, updating the GC contract baseline and authorizing trade billing.
      </p>
      {visibleToGC && (
        <div className="pl-6 pt-1">
          <input
            type="text"
            value={gcNotes}
            onChange={(e) => setGcNotes(e.target.value)}
            placeholder="Notes / instructions to GC..."
            className="w-full px-2.5 py-1.5 bg-white text-slate-800 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>
      )}
    </div>
  );
}
