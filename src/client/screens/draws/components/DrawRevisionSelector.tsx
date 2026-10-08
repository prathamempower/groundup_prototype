import React from 'react';
import { Draw } from '../../../../shared/types';

interface DrawRevisionSelectorProps {
  draws: Draw[];
  selectedDrawId: string | null;
  onSelectDraw: (id: string) => void;
}

export function DrawRevisionSelector({
  draws,
  selectedDrawId,
  onSelectDraw,
}: DrawRevisionSelectorProps) {
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2">
      {draws.map((d) => {
        const isSelected = d.id === selectedDrawId;

        return (
          <button
            key={d.id}
            onClick={() => onSelectDraw(d.id)}
            className={`p-4 rounded-3xl shrink-0 text-left border transition cursor-pointer ${
              isSelected
                ? 'bg-surface-800 border-brand-500 shadow-lg shadow-brand-500/10'
                : 'bg-surface-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">Draw #{d.draw_number}</span>
              {d.revision_number > 0 && (
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-mono font-bold">
                  Rev {d.revision_number}
                </span>
              )}
            </div>
            <div className="text-xs font-mono text-slate-300 mt-1">
              ${d.requested_total.toLocaleString()}
            </div>
          </button>
        );
      })}
    </div>
  );
}
