import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { SovLineInput } from '../types';

interface BudgetIntakeTabProps {
  sovLines: SovLineInput[];
  setSovLines: React.Dispatch<React.SetStateAction<SovLineInput[]>>;
  loading: boolean;
  onSaveBudget: () => void;
}

export const BudgetIntakeTab: React.FC<BudgetIntakeTabProps> = ({
  sovLines,
  setSovLines,
  loading,
  onSaveBudget,
}) => {
  const addSovRow = () => {
    setSovLines([...sovLines, { category: '', sub_category: '', cost_code: '', amount: 0 }]);
  };

  const removeSovRow = (index: number) => {
    setSovLines(sovLines.filter((_, i) => i !== index));
  };

  const totalBaseline = sovLines.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">Master Budget & Schedule of Values (SOV)</h3>
          <p className="text-xs text-slate-400">Approved baseline contract allocations by trade category.</p>
        </div>
        <button
          onClick={addSovRow}
          className="px-3 py-1.5 rounded-xl bg-surface-800 hover:bg-slate-700 text-brand-400 text-xs font-semibold flex items-center gap-1 border border-slate-700 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Line
        </button>
      </div>

      <div className="space-y-2">
        {sovLines.map((row, idx) => (
          <div key={idx} className="p-3 rounded-2xl bg-surface-950 border border-slate-800 grid grid-cols-12 gap-2 items-center text-xs">
            <div className="col-span-4">
              <label className="text-[10px] text-slate-400 block mb-0.5">Category Name</label>
              <input
                type="text"
                value={row.category}
                onChange={(e) => {
                  const updated = [...sovLines];
                  updated[idx].category = e.target.value;
                  setSovLines(updated);
                }}
                className="w-full bg-surface-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-medium focus:border-brand-500"
                placeholder="Trade Category"
              />
            </div>
            <div className="col-span-3">
              <label className="text-[10px] text-slate-400 block mb-0.5">Sub-scope / Notes</label>
              <input
                type="text"
                value={row.sub_category || ''}
                onChange={(e) => {
                  const updated = [...sovLines];
                  updated[idx].sub_category = e.target.value;
                  setSovLines(updated);
                }}
                className="w-full bg-surface-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white focus:border-brand-500"
                placeholder="Scope description"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] text-slate-400 block mb-0.5">Cost Code</label>
              <input
                type="text"
                value={row.cost_code || ''}
                onChange={(e) => {
                  const updated = [...sovLines];
                  updated[idx].cost_code = e.target.value;
                  setSovLines(updated);
                }}
                className="w-full bg-surface-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-300 font-mono focus:border-brand-500"
                placeholder="00-000"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] text-slate-400 block mb-0.5">Original Amount ($)</label>
              <input
                type="number"
                value={row.amount === 0 ? '' : row.amount}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const clean = e.target.value.replace(/^0+(?=\d)/, '');
                  const updated = [...sovLines];
                  updated[idx].amount = clean === '' ? 0 : Number(clean);
                  setSovLines(updated);
                }}
                placeholder="0"
                className="w-full bg-surface-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-emerald-400 font-mono font-bold focus:border-brand-500"
              />
            </div>
            <div className="col-span-1 text-right pt-3">
              <button
                onClick={() => removeSovRow(idx)}
                className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-800">
        <div className="text-xs text-slate-400">
          Total Baseline Budget:{' '}
          <strong className="text-white font-mono text-sm">${totalBaseline.toLocaleString()}</strong>
        </div>
        <button
          onClick={onSaveBudget}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-md shadow-brand-500/20 cursor-pointer"
        >
          {loading ? 'Saving...' : 'Save & Approve Master SOV'}
        </button>
      </div>
    </div>
  );
};
