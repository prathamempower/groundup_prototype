import React from 'react';
import { Plus, Layers } from 'lucide-react';
import { UserRole } from '../../../../shared/types';
import { hasPermission } from '../../../../shared/rbac/matrix';
import { BudgetLineItem, ChangeOrderItem } from '../types';
import { InlineChangeOrderForm } from './InlineChangeOrderForm';
import { ChangeOrdersList } from './ChangeOrdersList';

interface ChangeOrdersSectionProps {
  changeOrders: ChangeOrderItem[];
  budgetLines: BudgetLineItem[];
  selectedProjectName?: string;
  currentRole: UserRole;
  showInlineAddOrder: boolean;
  setShowInlineAddOrder: (show: boolean) => void;
  inlineScopeType: 'standard' | 'other';
  setInlineScopeType: (scope: 'standard' | 'other') => void;
  inlineCategory: string;
  setInlineCategory: (cat: string) => void;
  inlineCustomCategory: string;
  setInlineCustomCategory: (cat: string) => void;
  inlineSubSection: string;
  setInlineSubSection: (sub: string) => void;
  inlineCostCode: string;
  setInlineCostCode: (code: string) => void;
  inlineAmount: string;
  setInlineAmount: (amt: string) => void;
  inlineReason: string;
  setInlineReason: (r: string) => void;
  inlineCustomReason: string;
  setInlineCustomReason: (r: string) => void;
  inlineDesc: string;
  setInlineDesc: (d: string) => void;
  inlineVisibleToGC: boolean;
  setInlineVisibleToGC: (v: boolean) => void;
  inlineGcNotes: string;
  setInlineGcNotes: (notes: string) => void;
  onOpenChangeOrderModal: () => void;
  onAddChangeOrder: (co: any) => void;
}

const fmt = (n: number) => '$' + n.toLocaleString();

export const ChangeOrdersSection: React.FC<ChangeOrdersSectionProps> = (props) => {
  const {
    changeOrders,
    budgetLines,
    selectedProjectName = 'K&P Construction',
    currentRole,
    showInlineAddOrder,
    setShowInlineAddOrder,
    onOpenChangeOrderModal,
    onAddChangeOrder,
  } = props;

  const handleInlineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(props.inlineAmount) || 0;
    if (parsedAmount <= 0) return;

    const isOtherScope = props.inlineScopeType === 'other';
    const categoryName = isOtherScope
      ? (props.inlineCustomCategory.trim() || 'Other Scope / Custom Trade')
      : props.inlineCategory;

    onAddChangeOrder({
      change_order_number: `CO-00${changeOrders.length + 1}`,
      category: categoryName,
      sub_section: props.inlineSubSection.trim() || undefined,
      cost_code: props.inlineCostCode.trim() || undefined,
      amount: parsedAmount,
      description: props.inlineDesc.trim() || (isOtherScope ? 'Supplemental trade order approved by Owner.' : 'Standard scope revision approved by Owner.'),
      budget_impact: true,
      reason: props.inlineReason === 'OTHER' ? (props.inlineCustomReason.trim() || 'Other Scope') : props.inlineReason,
      custom_reason: props.inlineCustomReason,
      visible_to_gc: props.inlineVisibleToGC,
      gc_notes: props.inlineGcNotes,
      is_other: isOtherScope,
    });

    props.setInlineCustomCategory('');
    props.setInlineSubSection('');
    props.setInlineCostCode('');
    props.setInlineAmount('18500');
    props.setInlineDesc('');
    setShowInlineAddOrder(false);
  };

  const totalApproved = changeOrders.reduce((sum, co) => sum + (Number(co.amount) || 0), 0);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs space-y-0">
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="font-bold text-slate-900 text-sm">Contract Change Orders & Extra Scope Orders</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
              {changeOrders.length} Orders Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Formal change requests and scope amendments submitted, approved, and showed to General Contractor ({selectedProjectName}).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs flex items-center gap-2 shadow-xs">
            <span className="text-slate-500">Total Approved:</span>
            <span className="font-mono font-bold text-slate-900">{fmt(totalApproved)}</span>
          </div>
          <button
            onClick={() => setShowInlineAddOrder(!showInlineAddOrder)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showInlineAddOrder ? 'Close Quick Add' : '+ Add New Order (Sub-Section)'}</span>
          </button>
          {hasPermission(currentRole, 'change_order:create') && (
            <button
              onClick={onOpenChangeOrderModal}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full Order Builder</span>
            </button>
          )}
        </div>
      </div>

      {showInlineAddOrder && (
        <InlineChangeOrderForm
          {...props}
          onSubmit={handleInlineSubmit}
          onCancel={() => setShowInlineAddOrder(false)}
        />
      )}

      <ChangeOrdersList changeOrders={changeOrders} budgetLines={budgetLines} />
    </div>
  );
};
