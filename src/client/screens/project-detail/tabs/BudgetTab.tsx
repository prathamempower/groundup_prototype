import React from 'react';
import { Shield, Plus } from 'lucide-react';
import { UserRole } from '../../../../shared/types';
import { hasPermission } from '../../../../shared/rbac/matrix';
import { ChangeOrdersSection } from '../components/ChangeOrdersSection';
import { BudgetSovTable } from '../components/BudgetSovTable';
import { BudgetLineItem, ChangeOrderItem } from '../types';

interface BudgetTabProps {
  budgetLines: BudgetLineItem[];
  contingencyRemaining: number;
  changeOrders: ChangeOrderItem[];
  selectedProjectName?: string;
  currentRole: UserRole;
  coFeedbackToast: string | null;
  setCoFeedbackToast: (toast: string | null) => void;
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
  onOpenContingencyModal: (cat?: string) => void;
  onOpenChangeOrderModal: () => void;
  onAddChangeOrder: (co: any) => void;
  onInspectProvenance: (type: 'spend' | 'budget' | 'funded' | 'exposure' | 'delay', category?: string) => void;
}

export const BudgetTab: React.FC<BudgetTabProps> = (props) => {
  const {
    budgetLines,
    contingencyRemaining,
    currentRole,
    onOpenContingencyModal,
    onOpenChangeOrderModal,
    onInspectProvenance,
  } = props;

  return (
    <div className="space-y-6">
      {/* Contingency Reserve Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            10% Reserve Contingency
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            ${contingencyRemaining.toLocaleString()} remaining
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            Initial Reserve: $82,000 · Total Absorbed: $40,000 (1 movement)
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasPermission(currentRole, 'contingency:manage') && (
            <button
              onClick={() => onOpenContingencyModal('Site Work')}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Absorb Overrun from Contingency</span>
            </button>
          )}
          {hasPermission(currentRole, 'change_order:create') && (
            <button
              onClick={onOpenChangeOrderModal}
              className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>New Change Order</span>
            </button>
          )}
        </div>
      </div>

      {/* SOV Budget Table */}
      <BudgetSovTable
        budgetLines={budgetLines}
        currentRole={currentRole}
        onOpenContingencyModal={onOpenContingencyModal}
        onInspectProvenance={onInspectProvenance}
      />

      {/* Contract Change Orders */}
      <ChangeOrdersSection {...props} />
    </div>
  );
};
