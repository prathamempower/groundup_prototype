"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  DollarSign,
  ArrowRightLeft,
  Building2,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Sparkles,
} from "lucide-react";

export interface ReviewItemData {
  id: string;
  date: string;
  account: string;
  description: string;
  type: string;
  direction: string;
  amount: string;
  proposedLink: string;
  whyMatches: string;
  evidence: string;
  status: string;
  resolutionType?: string;
  resolutionNote?: string;
}

export type ResolutionActionType =
  | "REQUEST_INVOICE"
  | "ASSIGN_TRADE"
  | "TRANSFER_PROJECT"
  | "CONFIRM_DRAW"
  | "SETTLE_LIABILITY"
  | "EXCLUDE_NON_PROJECT";

interface ActionConfig {
  id: ResolutionActionType;
  label: string;
  description: string;
  defaultReason: string;
  quickTags: string[];
  icon: React.ComponentType<{ className?: string }>;
}

const ACTION_OPTIONS: ActionConfig[] = [
  {
    id: "REQUEST_INVOICE",
    label: "Request Invoice / Receipt",
    description: "Require contractor or PM to submit signed invoice, lien waiver, or delivery ticket.",
    defaultReason: "Requested formal signed invoice and lien waiver from vendor prior to disbursement release.",
    quickTags: [
      "Missing signed lien waiver",
      "Field delivery slip required",
      "Awaiting contractor final invoice",
    ],
    icon: FileText,
  },
  {
    id: "ASSIGN_TRADE",
    label: "Assign to Budget Code",
    description: "Link directly to an approved CSI construction trade line item.",
    defaultReason: "Allocated directly to Division trade scope verified against contractor work order.",
    quickTags: [
      "Verified work order",
      "Approved change order scope",
      "Direct trade material purchase",
    ],
    icon: DollarSign,
  },
  {
    id: "TRANSFER_PROJECT",
    label: "Project Advance / Loan",
    description: "Temporary balance-sheet loan between sister project entities (zero P&L impact).",
    defaultReason: "Temporary liquidity advance between project entities. Scheduled for repayment on next draw.",
    quickTags: [
      "Advance to 73 Broadway",
      "Repay on next bank draw",
      "Bridge financing allocation",
    ],
    icon: ArrowRightLeft,
  },
  {
    id: "CONFIRM_DRAW",
    label: "Link to Bank Draw Inflow",
    description: "Match incoming deposit to approved construction lender draw inspection proceeds.",
    defaultReason: "Confirmed as construction loan draw proceeds from senior lender inspection report.",
    quickTags: [
      "Senior loan draw proceeds",
      "Lender wire confirmation",
      "Equity contribution funding",
    ],
    icon: Building2,
  },
  {
    id: "SETTLE_LIABILITY",
    label: "Card Liability Settlement",
    description: "Operating account settlement paying card balance (avoids double-counting spend).",
    defaultReason: "Corporate card statement payment covering individual verified receipts; excluded from double-counting.",
    quickTags: [
      "Monthly card statement paydown",
      "Field tools credit settlement",
      "Operating debit to card issuer",
    ],
    icon: CreditCard,
  },
  {
    id: "EXCLUDE_NON_PROJECT",
    label: "Exclude (Non-Project Scope)",
    description: "Exclude from project budget and capital forecast with permanent audit notation.",
    defaultReason: "Non-project operational overhead; excluded from capital budget and equity forecast.",
    quickTags: [
      "Corporate overhead expense",
      "Owner distribution draw",
      "Non-project reimbursable",
    ],
    icon: AlertTriangle,
  },
];

interface OwnerResolutionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ReviewItemData | null;
  onResolve: (itemId: string, actionType: ResolutionActionType, reason: string) => void;
}

export function OwnerResolutionModal({
  open,
  onOpenChange,
  item,
  onResolve,
}: OwnerResolutionModalProps) {
  const [selectedAction, setSelectedAction] = useState<ResolutionActionType>("REQUEST_INVOICE");
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize recommendation based on item attributes
  React.useEffect(() => {
    if (open && item) {
      if (item.resolutionType && item.resolutionNote) {
        setSelectedAction(item.resolutionType as ResolutionActionType);
        setReason(item.resolutionNote);
        return;
      }

      let initialAction: ResolutionActionType = "REQUEST_INVOICE";

      if (item.evidence === "Missing") {
        initialAction = "REQUEST_INVOICE";
      } else if (item.proposedLink.toLowerCase().includes("unallocated")) {
        initialAction = "CONFIRM_DRAW";
      } else if (item.proposedLink.toLowerCase().includes("transfer")) {
        initialAction = "TRANSFER_PROJECT";
      } else if (item.proposedLink.toLowerCase().includes("liability")) {
        initialAction = "SETTLE_LIABILITY";
      } else {
        initialAction = "ASSIGN_TRADE";
      }

      setSelectedAction(initialAction);
      const conf = ACTION_OPTIONS.find((a) => a.id === initialAction);
      setReason(conf ? conf.defaultReason : "");
    }
  }, [open, item]);

  if (!item) return null;

  const currentActionConfig = ACTION_OPTIONS.find((a) => a.id === selectedAction);

  const handleSelectAction = (actionId: ResolutionActionType) => {
    setSelectedAction(actionId);
    const conf = ACTION_OPTIONS.find((a) => a.id === actionId);
    if (conf) {
      setReason(conf.defaultReason);
    }
  };

  const handleAddQuickTag = (tag: string) => {
    setReason((prev) => {
      if (!prev.trim()) return tag;
      if (prev.includes(tag)) return prev;
      return `${prev.trim()} · ${tag}`;
    });
  };

  const handleSubmit = () => {
    if (!reason.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onResolve(item.id, selectedAction, reason.trim());
      setIsSubmitting(false);
      onOpenChange(false);
    }, 150);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent maxWidth="lg" className="p-6">
        <ModalHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <ModalTitle className="text-base font-bold text-slate-900">
                Specify Owner Resolution
              </ModalTitle>
              <ModalDescription className="text-xs text-slate-500 mt-0.5">
                Prescribe the specific accounting action and audit reason to resolve this transaction.
              </ModalDescription>
            </div>
            <span
              className={`font-mono text-xs font-bold px-2.5 py-1 rounded-md ${
                item.direction === "in"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-slate-100 text-slate-900"
              }`}
            >
              {item.amount}
            </span>
          </div>
        </ModalHeader>

        {/* Transaction Summary Card */}
        <div className="rounded-lg border border-slate-200/90 bg-slate-50/60 p-3.5 space-y-2 mt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900">{item.description}</span>
            <span className="font-mono text-slate-500">{item.date}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Account</span>
              <span className="font-medium text-slate-800">{item.account}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Current Scope</span>
              <span className="font-medium text-slate-800">{item.proposedLink}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Evidence Status</span>
              <span
                className={`font-bold ${
                  item.evidence === "Strong"
                    ? "text-emerald-700"
                    : item.evidence === "Missing"
                    ? "text-rose-700"
                    : "text-amber-700"
                }`}
              >
                {item.evidence}
              </span>
            </div>
          </div>
        </div>

        {/* Action Selection Grid */}
        <div className="space-y-2 mt-4">
          <label className="text-xs font-bold text-slate-800 block">
            Select Resolution Action:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ACTION_OPTIONS.map((action) => {
              const Icon = action.icon;
              const isSelected = selectedAction === action.id;

              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => handleSelectAction(action.id)}
                  className={`flex items-start gap-2.5 p-3 rounded-lg border text-left transition-all ${
                    isSelected
                      ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 mt-0.5 shrink-0 ${
                      isSelected ? "text-white" : "text-slate-500"
                    }`}
                  />
                  <div>
                    <span className="text-xs font-bold block">{action.label}</span>
                    <span
                      className={`text-[10px] leading-snug mt-0.5 block ${
                        isSelected ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {action.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Audit Reason / Instruction Textarea */}
        <div className="space-y-1.5 pt-2 mt-2">
          <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span>Owner Instruction & Specific Reason:</span>
            <span className="text-[10px] text-slate-400 font-normal">Audit-logged</span>
          </label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Specify reason, requirements, or documentation needed to clear this item..."
            className="text-xs font-normal text-slate-900"
          />

          {/* Quick preset chips */}
          {currentActionConfig && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-slate-400" /> Quick tags:
              </span>
              {currentActionConfig.quickTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddQuickTag(tag)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-600 hover:border-slate-300 hover:bg-slate-100 transition-colors"
                >
                  + {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        <ModalFooter className="border-t border-slate-100 pt-3 flex items-center justify-between mt-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs text-slate-500"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={!reason.trim() || isSubmitting}
            onClick={handleSubmit}
            className="text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800"
          >
            Confirm Resolution
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
