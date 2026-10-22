"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  DollarSign,
  ArrowRightLeft,
  Building2,
  CreditCard,
  Ban,
  MoreHorizontal,
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
  | "CONFIRM_DRAW"
  | "SETTLE_LIABILITY"
  | "EXCLUDE_NON_PROJECT"
  | "OTHER";

interface ActionConfig {
  id: ResolutionActionType;
  label: string;
  quickTags: string[];
  icon: React.ComponentType<{ className?: string }>;
}

const ACTION_OPTIONS: ActionConfig[] = [
  {
    id: "REQUEST_INVOICE",
    label: "Request Invoice",
    quickTags: ["Lien waiver needed", "Delivery ticket missing", "Contractor invoice"],
    icon: FileText,
  },
  {
    id: "ASSIGN_TRADE",
    label: "Assign to budget",
    quickTags: ["Trade contractor", "Change order", "Materials"],
    icon: DollarSign,
  },
  {
    id: "CONFIRM_DRAW",
    label: "Draw deposit",
    quickTags: ["Bank draw deposit", "Lender wire", "Equity draw"],
    icon: Building2,
  },
  {
    id: "SETTLE_LIABILITY",
    label: "Credit card payment",
    quickTags: ["Credit card payoff", "Operating card", "Expense report"],
    icon: CreditCard,
  },
  {
    id: "EXCLUDE_NON_PROJECT",
    label: "Exclude expense",
    quickTags: ["Non-project expense", "Owner draw", "Personal expense"],
    icon: Ban,
  },
  {
    id: "OTHER",
    label: "Other",
    quickTags: ["Custom action", "Pending clarification", "Title / Escrow", "Permit adjustment"],
    icon: MoreHorizontal,
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
  const [customAction, setCustomAction] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (open && item) {
      setCustomAction("");
      if (item.resolutionType) {
        setSelectedAction(item.resolutionType as ResolutionActionType);
        setReason(item.resolutionNote || "");
        return;
      }

      let initialAction: ResolutionActionType = "REQUEST_INVOICE";
      if (item.evidence === "Missing") {
        initialAction = "REQUEST_INVOICE";
      } else if (item.proposedLink.toLowerCase().includes("unallocated") || item.direction === "in") {
        initialAction = "CONFIRM_DRAW";
      } else if (item.proposedLink.toLowerCase().includes("liability")) {
        initialAction = "SETTLE_LIABILITY";
      } else {
        initialAction = "ASSIGN_TRADE";
      }

      setSelectedAction(initialAction);
      setReason("");
    }
  }, [open, item]);

  if (!item) return null;

  const currentAction = ACTION_OPTIONS.find((a) => a.id === selectedAction);

  const handleSelectAction = (actionId: ResolutionActionType) => {
    setSelectedAction(actionId);
  };

  const handleAddTag = (tag: string) => {
    if (selectedAction === "OTHER" && !customAction) {
      setCustomAction(tag);
    } else {
      setReason((prev) => (prev.trim() ? `${prev.trim()} · ${tag}` : tag));
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      let finalReason = reason.trim();
      if (selectedAction === "OTHER") {
        if (customAction.trim()) {
          finalReason = finalReason ? `${customAction.trim()} · ${finalReason}` : customAction.trim();
        } else if (!finalReason) {
          finalReason = "Others: Custom resolution";
        }
      } else {
        finalReason = finalReason || currentAction?.label || "Resolved by owner";
      }
      onResolve(item.id, selectedAction, finalReason);
      setIsSubmitting(false);
      onOpenChange(false);
    }, 100);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent maxWidth="md" className="p-5">
        <ModalHeader className="pb-3 border-b border-slate-100 pr-10">
          <div className="flex items-center gap-3">
            <ModalTitle className="text-base font-bold text-slate-900">
              Resolve Transaction
            </ModalTitle>
            <span
              className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                item.direction === "in"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-slate-100 text-slate-800 border-slate-200"
              }`}
            >
              {item.amount}
            </span>
          </div>
        </ModalHeader>

        {/* Clean, compact 1-line transaction info */}
        <div className="flex items-center justify-between py-2.5 text-xs border-b border-slate-100 text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">{item.description}</span>
            <span className="text-slate-400">·</span>
            <span>{item.account}</span>
          </div>
          <span className="text-slate-500 font-medium font-mono text-[11px] bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
            {item.date}
          </span>
        </div>

        {/* Action Grid: 6 clean, compact buttons without wordy paragraphs */}
        <div className="space-y-1.5 pt-3">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Resolution Action
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ACTION_OPTIONS.map((action) => {
              const Icon = action.icon;
              const isSelected = selectedAction === action.id;

              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => handleSelectAction(action.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                    isSelected
                      ? "border-slate-900 bg-slate-100 text-slate-900 shadow-xs font-bold ring-1 ring-slate-900/10"
                      : "border-slate-200 bg-white hover:border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isSelected ? "text-slate-900" : "text-slate-500"
                    }`}
                  />
                  <span className="truncate">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* If 'Others' is selected, field to mention specific custom action */}
        {selectedAction === "OTHER" && (
          <div className="space-y-1.5 pt-3">
            <label className="text-[11px] font-semibold text-slate-700 block">
              Specify Other Action
            </label>
            <input
              type="text"
              value={customAction}
              onChange={(e) => setCustomAction(e.target.value)}
              placeholder="Mention the specific action (e.g. Escrow deposit, municipal permit fee, title adjustment)..."
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        )}

        {/* Short, optional reason input */}
        <div className="space-y-1.5 pt-3">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Owner Note / Reason
          </label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="Add note or instruction (e.g. Lien waiver required before next draw)..."
            className="text-xs font-normal text-slate-900 resize-none"
          />

          {/* Minimal quick tags */}
          {currentAction && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {currentAction.quickTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddTag(tag)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  + {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        <ModalFooter className="border-t border-slate-100 pt-3 flex items-center justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs text-slate-500 h-8 px-3"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 h-8 px-4"
          >
            Save Resolution
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
