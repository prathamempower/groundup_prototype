import React from 'react';

interface InlineChangeOrderGCSyncProps {
  inlineVisibleToGC: boolean;
  setInlineVisibleToGC: (v: boolean) => void;
  inlineGcNotes: string;
  setInlineGcNotes: (notes: string) => void;
  selectedProjectName?: string;
}

export const InlineChangeOrderGCSync: React.FC<InlineChangeOrderGCSyncProps> = ({
  inlineVisibleToGC,
  setInlineVisibleToGC,
  inlineGcNotes,
  setInlineGcNotes,
  selectedProjectName,
}) => {
  return (
    <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-indigo-950 font-bold cursor-pointer">
          <input
            type="checkbox"
            checked={inlineVisibleToGC}
            onChange={(e) => setInlineVisibleToGC(e.target.checked)}
            className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
          />
          <span>Show & Submit Order to General Contractor ({selectedProjectName || 'General Contractor'})</span>
        </label>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-200">
          GC Live Portal Broadcast
        </span>
      </div>
      {inlineVisibleToGC && (
        <div>
          <label className="block text-[11px] font-semibold text-indigo-900 mb-1">Authorization Memo to GC:</label>
          <input
            type="text"
            value={inlineGcNotes}
            onChange={(e) => setInlineGcNotes(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-indigo-200 rounded-lg text-xs text-slate-800"
          />
        </div>
      )}
    </div>
  );
};
