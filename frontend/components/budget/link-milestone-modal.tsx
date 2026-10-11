"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BudgetLine, MilestoneItem } from "@/lib/types";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Calendar, Link2, CheckCircle2, Unlink } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface LinkMilestoneModalProps {
  budgetLine: BudgetLine | null;
  milestones: MilestoneItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function LinkMilestoneModal({
  budgetLine,
  milestones,
  open,
  onOpenChange,
  onSuccess,
}: LinkMilestoneModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | "none">("none");

  React.useEffect(() => {
    if (budgetLine) {
      setSelectedMilestoneId(budgetLine.milestone_id || "none");
    }
  }, [budgetLine]);

  const linkMutation = useMutation({
    mutationFn: () =>
      budgetLine
        ? api.budget.linkMilestone(
            budgetLine.id,
            selectedMilestoneId === "none" ? null : selectedMilestoneId
          )
        : Promise.reject(new Error("No line")),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["budget"] });
      queryClient.invalidateQueries({ queryKey: ["milestones"] });
      queryClient.invalidateQueries({ queryKey: ["audit-events"] });
      toast({
        title: "Milestone Link Updated",
        description: `Budget line ${budgetLine?.code} ${
          res.data.milestone_id ? "linked to milestone" : "unlinked"
        }.`,
      });
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast({
        title: "Linking Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  if (!budgetLine) return null;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent maxWidth="md">
        <ModalHeader className="border-b border-border pb-4 -m-6 mb-4 p-6 bg-subtle/30">
          <div className="flex items-center gap-2">
            <span className="rounded bg-primary-subtle p-2 text-primary">
              <Link2 className="h-5 w-5" />
            </span>
            <div>
              <ModalTitle className="text-section font-bold text-text-primary">
                Link Budget Line to Milestone
              </ModalTitle>
              <ModalDescription className="text-caption text-text-secondary">
                Assign {budgetLine.code} - {budgetLine.name} to a project schedule milestone.
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>

        <div className="space-y-4 text-body">
          <div className="bg-subtle/40 p-3.5 rounded-lg border border-border text-xs space-y-1">
            <div className="font-semibold text-text-primary">Selected Budget Line:</div>
            <div className="font-mono text-primary font-bold">
              {budgetLine.code} — {budgetLine.name}
            </div>
          </div>

          <div>
            <label className="block text-caption font-semibold text-text-primary mb-1">
              Associated Project Milestone:
            </label>
            <select
              value={selectedMilestoneId}
              onChange={(e) => setSelectedMilestoneId(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus-visible:outline-primary"
            >
              <option value="none">-- Unlinked (No Milestone Dependency) --</option>
              {milestones.map((ms) => (
                <option key={ms.id} value={ms.id}>
                  {ms.name} ({ms.percent_complete}% Complete • Status: {ms.status})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-text-muted mt-1">
              Linking allows progress verification and draw eligibility tracking against on-site physical milestones.
            </p>
          </div>
        </div>

        <ModalFooter className="border-t border-border pt-4 mt-6">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => linkMutation.mutate()}
            isLoading={linkMutation.isPending}
          >
            Save Milestone Link
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
