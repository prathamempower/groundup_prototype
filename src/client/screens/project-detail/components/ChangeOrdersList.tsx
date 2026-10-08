import React from 'react';
import { ChangeOrderItem, BudgetLineItem } from '../types';

interface ChangeOrdersListProps {
  changeOrders: ChangeOrderItem[];
  budgetLines: BudgetLineItem[];
}

const fmt = (n: number) => '$' + n.toLocaleString();

export const ChangeOrdersList: React.FC<ChangeOrdersListProps> = ({
  changeOrders,
  budgetLines,
}) => {
  const otherOrders = changeOrders.filter(co => co.is_other || !budgetLines.some(b => b.category === co.category));
  const standardOrders = changeOrders.filter(co => !co.is_other && budgetLines.some(b => b.category === co.category));

  return (
    <div className="divide-y divide-slate-100">
      {otherOrders.map((co) => (
        <div key={co.id} className="p-4 bg-emerald-50/20 hover:bg-emerald-50/40 flex items-start justify-between gap-4 text-xs">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-emerald-800">{co.number}</span>
              <span className="font-bold text-slate-900">{co.category}</span>
              {co.cost_code && <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px]">{co.cost_code}</span>}
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">APPROVED</span>
            </div>
            <p className="text-slate-600">{co.description}</p>
            {co.gc_notes && <p className="text-[11px] text-indigo-700 font-medium">GC Sync: {co.gc_notes}</p>}
          </div>
          <div className="text-right">
            <div className="font-mono font-bold text-sm text-slate-900">{fmt(co.amount)}</div>
            <div className="text-[10px] text-slate-400">{co.date}</div>
          </div>
        </div>
      ))}
      {standardOrders.map((co) => (
        <div key={co.id} className="p-4 hover:bg-slate-50 flex items-start justify-between gap-4 text-xs">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-700">{co.number}</span>
              <span className="font-bold text-slate-900">{co.category}</span>
              {co.cost_code && <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">{co.cost_code}</span>}
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">APPROVED</span>
            </div>
            <p className="text-slate-600">{co.description}</p>
            {co.gc_notes && <p className="text-[11px] text-indigo-700 font-medium">GC Sync: {co.gc_notes}</p>}
          </div>
          <div className="text-right">
            <div className="font-mono font-bold text-sm text-slate-900">{fmt(co.amount)}</div>
            <div className="text-[10px] text-slate-400">{co.date}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
