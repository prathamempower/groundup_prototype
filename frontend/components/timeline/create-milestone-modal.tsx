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
import { FormField } from "@/components/ui/form-field";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { MilestoneItem, BudgetLine } from "@/lib/types";
import { Calendar, Plus, Link as LinkIcon, CheckCircle2 } from "lucide-react";

interface CreateMilestoneModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  existingMilestones: MilestoneItem[];
}

export function CreateMilestoneModal({
  open,
  onOpenChange,
  projectId,
  existingMilestones,
}: CreateMilestoneModalProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [budgetLineId, setBudgetLineId] = useState("");
  const [plannedStart, setPlannedStart] = useState(new Date().toISOString().split("T")[0]);
  const [plannedEnd, setPlannedEnd] = useState(
    new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [forecastEnd, setForecastEnd] = useState(
    new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [criticalPath, setCriticalPath] = useState(true);
  const [responsibleParty, setResponsibleParty] = useState("General Contractor");
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([]);

  // Fetch project budget lines for CSI mapping
  const { data: budgetData } = useQuery({
    queryKey: ["budget", projectId],
    queryFn: () => api.budget.getCurrent(projectId),
    enabled: open,
  });

  const budgetLines: BudgetLine[] = budgetData?.data?.lines || [];

  const handleToggleDependency = (id: string) => {
    setSelectedDependencies((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Milestone name is required.");
      return;
    }
    if (!plannedStart || !plannedEnd) {
      setError("Planned start and planned end dates are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const selectedLine = budgetLines.find((bl) => bl.id === budgetLineId);

    try {
      await api.progress.createMilestone(projectId, {
        name: name.trim(),
        description: description.trim(),
        budget_line_id: budgetLineId || null,
        budget_line_code: selectedLine?.code,
        budget_line_name: selectedLine?.name,
        planned_start: plannedStart,
        planned_end: plannedEnd,
        forecast_end: forecastEnd || plannedEnd,
        critical_path: criticalPath,
        dependencies: selectedDependencies,
        responsible_party: responsibleParty.trim() || "General Contractor",
        percent_complete: 0,
        status: "NOT_STARTED",
      });

      await queryClient.invalidateQueries({ queryKey: ["milestones", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["scheduleForecast", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["projectDashboard", projectId] });

      onOpenChange(false);
      // Reset form
      setName("");
      setDescription("");
      setBudgetLineId("");
      setSelectedDependencies([]);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || "Failed to create milestone");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent maxWidth="lg">
        <ModalHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-subtle text-primary">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <ModalTitle>Create Milestone Plan Item</ModalTitle>
              <ModalDescription>
                Add a construction phase milestone, link CSI budget line, and configure dependencies.
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>

        {error && (
          <div className="rounded-md border border-danger/30 bg-danger-subtle p-3 text-caption text-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <FormField
                label="Milestone Name"
                required
                helperText="e.g. Framing & Structural Steel Erection, Foundation & Subgrade Pours"
              >
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter major milestone name..."
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </FormField>
            </div>

            <div className="md:col-span-2">
              <FormField
                label="Scope Description"
                helperText="Summary of physical work package and inspection requirements"
              >
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="e.g. Erection of 6-story ASTM A992 structural steel framework and floor decking..."
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </FormField>
            </div>

            <div>
              <FormField
                label="Linked Budget Line (SOV)"
                helperText="Maps physical milestone completion to cost category"
              >
                <select
                  value={budgetLineId}
                  onChange={(e) => setBudgetLineId(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">-- Select CSI Budget Line (Optional) --</option>
                  {budgetLines.map((bl) => (
                    <option key={bl.id} value={bl.id}>
                      {bl.code} - {bl.name}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <div>
              <FormField
                label="Responsible Party / Subcontractor"
                helperText="Prime contractor or assigned trade partner"
              >
                <input
                  type="text"
                  value={responsibleParty}
                  onChange={(e) => setResponsibleParty(e.target.value)}
                  placeholder="e.g. Atlantic Iron Works Corp"
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </FormField>
            </div>

            <div>
              <FormField label="Planned Start Date" required>
                <input
                  type="date"
                  value={plannedStart}
                  onChange={(e) => setPlannedStart(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </FormField>
            </div>

            <div>
              <FormField label="Planned Finish Date (Baseline)" required>
                <input
                  type="date"
                  value={plannedEnd}
                  onChange={(e) => {
                    setPlannedEnd(e.target.value);
                    if (!forecastEnd || forecastEnd === plannedEnd) {
                      setForecastEnd(e.target.value);
                    }
                  }}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </FormField>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <input
              type="checkbox"
              id="criticalPathCheck"
              checked={criticalPath}
              onChange={(e) => setCriticalPath(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="criticalPathCheck" className="text-body font-medium text-text-primary cursor-pointer">
              Critical Path Milestone (delays directly push project completion target)
            </label>
          </div>

          {existingMilestones.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border">
              <label className="text-caption font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <LinkIcon className="h-3.5 w-3.5" /> Predecessor Dependencies
              </label>
              <div className="max-h-36 overflow-y-auto rounded-md border border-border bg-subtle/30 p-2 space-y-1.5">
                {existingMilestones.map((em) => {
                  const isSelected = selectedDependencies.includes(em.id);
                  return (
                    <button
                      type="button"
                      key={em.id}
                      onClick={() => handleToggleDependency(em.id)}
                      className={`w-full flex items-center justify-between p-2 rounded text-left transition-colors ${
                        isSelected
                          ? "bg-primary-subtle border border-primary/30 text-primary font-medium"
                          : "bg-surface hover:bg-subtle text-text-primary border border-border/50"
                      }`}
                    >
                      <span className="text-body truncate">{em.name}</span>
                      {isSelected ? (
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      ) : (
                        <span className="text-[11px] text-text-muted">Click to link</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <ModalFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="rounded-md border border-border px-4 py-2 text-body font-medium text-text-secondary hover:bg-subtle"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-body font-medium text-white hover:bg-primary-hover focus-visible:outline-primary disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {isSubmitting ? "Creating..." : "Create Milestone"}
            </button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
