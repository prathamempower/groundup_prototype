import React from 'react';

interface LineData {
  category: string;
  available: number;
  spent: number;
  budget: number;
}

interface SelectLinesStepProps {
  availableLines: LineData[];
  selectedLines: Record<string, { selected: boolean; amount: number }>;
  grossRequested: number;
  onToggleLine: (category: string) => void;
  onAmountChange: (category: string, amount: number) => void;
}

export function SelectLinesStep({
  availableLines,
  selectedLines,
  grossRequested,
  onToggleLine,
  onAmountChange,
}: SelectLinesStepProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>Select completed budget categories to claim on this draw:</span>
        <span className="font-semibold text-slate-900 font-mono">
          Gross: ${grossRequested.toLocaleString()}
        </span>
      </div>

      <div className="space-y-2 border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-80 overflow-y-auto">
        {availableLines.slice(0, 8).map((line) => {
          const state = selectedLines[line.category] || { selected: false, amount: 0 };
          return (
            <div
              key={line.category}
              className={`p-3 flex items-center justify-between transition ${
                state.selected ? 'bg-slate-50/80' : 'hover:bg-slate-50/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={state.selected}
                  onChange={() => onToggleLine(line.category)}
                  className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 cursor-pointer"
                />
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{line.category}</div>
                  <div className="text-xs text-slate-500">
                    Budget: ${line.budget.toLocaleString()} · Incurred: ${line.spent.toLocaleString()}
                  </div>
                </div>
              </div>

              {state.selected && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono">$</span>
                  <input
                    type="number"
                    value={state.amount}
                    onChange={(e) => onAmountChange(line.category, parseFloat(e.target.value) || 0)}
                    className="w-28 px-2 py-1 bg-white border border-slate-300 rounded font-mono text-sm font-bold text-slate-900 text-right focus:ring-1 focus:ring-slate-900 outline-none"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
