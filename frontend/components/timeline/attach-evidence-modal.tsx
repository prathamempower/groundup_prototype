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
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { MilestoneItem, MilestoneEvidence } from "@/lib/types";
import { FileUp, Camera, FileCheck, ShieldCheck, Upload } from "lucide-react";

interface AttachEvidenceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestone: MilestoneItem | null;
  projectId: string;
}

export function AttachEvidenceModal({
  open,
  onOpenChange,
  milestone,
  projectId,
}: AttachEvidenceModalProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filename, setFilename] = useState("");
  const [type, setType] = useState<MilestoneEvidence["type"]>("PHOTO");
  const [inspectorName, setInspectorName] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<
    "VERIFIED" | "PENDING_REVIEW" | "DISPUTED"
  >("VERIFIED");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestone) return;

    if (!filename.trim()) {
      setError("Document or file name is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.progress.attachEvidence(milestone.id, {
        filename: filename.trim(),
        type,
        inspector_name: inspectorName.trim() || undefined,
        verification_status: verificationStatus,
        notes: notes.trim(),
        file_size_bytes: Math.floor(Math.random() * 3000000) + 1000000,
      });

      await queryClient.invalidateQueries({ queryKey: ["milestones", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["milestone", milestone.id] });
      await queryClient.invalidateQueries({ queryKey: ["scheduleForecast", projectId] });

      onOpenChange(false);
      setFilename("");
      setNotes("");
      setInspectorName("");
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || "Failed to attach evidence");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulatedDrop = (name: string, evType: MilestoneEvidence["type"]) => {
    setFilename(name);
    setType(evType);
  };

  if (!milestone) return null;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent maxWidth="md">
        <ModalHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-subtle text-primary">
              <FileUp className="h-4 w-4" />
            </div>
            <div>
              <ModalTitle>Attach Progress Evidence</ModalTitle>
              <ModalDescription>
                Upload site photos, engineer certificates, or municipality inspection permits for{" "}
                <span className="font-semibold text-text-primary">{milestone.name}</span>.
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
          {/* Quick preset suggestions */}
          <div className="rounded-md border border-border bg-subtle/40 p-3 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
              Quick Pick Recent Field Captures:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  handleSimulatedDrop(
                    `Site_Photo_${milestone.name.replace(/\s+/g, "_")}_Inspection.jpg`,
                    "PHOTO"
                  )
                }
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface border border-border hover:border-primary text-caption text-text-primary transition-colors"
              >
                <Camera className="h-3.5 w-3.5 text-primary" />
                <span>Field Photo (.jpg)</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSimulatedDrop(
                    `Certified_Inspection_Report_${milestone.name.replace(/\s+/g, "_")}.pdf`,
                    "INSPECTION_REPORT"
                  )
                }
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface border border-border hover:border-primary text-caption text-text-primary transition-colors"
              >
                <FileCheck className="h-3.5 w-3.5 text-success" />
                <span>Special Inspection Report (.pdf)</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSimulatedDrop(
                    `DOB_Permit_Signoff_${milestone.name.replace(/\s+/g, "_")}.pdf`,
                    "PERMIT"
                  )
                }
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface border border-border hover:border-primary text-caption text-text-primary transition-colors"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                <span>City DOB Permit (.pdf)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <FormField label="Evidence File Name" required>
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="e.g. Ultrasonic_Weld_Inspection_Level_4.pdf"
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </FormField>
            </div>

            <div>
              <FormField label="Evidence Type" required>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as MilestoneEvidence["type"])}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="PHOTO">Site Progress Photography</option>
                  <option value="INSPECTION_REPORT">Special Inspection Report</option>
                  <option value="PERMIT">Municipal Permit / DOB Signoff</option>
                  <option value="ENGINEERING_MEMO">Structural Engineering Memo</option>
                </select>
              </FormField>
            </div>

            <div>
              <FormField label="Verification Status">
                <select
                  value={verificationStatus}
                  onChange={(e) =>
                    setVerificationStatus(
                      e.target.value as "VERIFIED" | "PENDING_REVIEW" | "DISPUTED"
                    )
                  }
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="VERIFIED">Verified & Certified</option>
                  <option value="PENDING_REVIEW">Pending Lender / PM Review</option>
                  <option value="DISPUTED">Disputed Discrepancy</option>
                </select>
              </FormField>
            </div>

            <div className="md:col-span-2">
              <FormField
                label="Inspector / Author / Testing Agency"
                helperText="Third-party testing agency or licensed professional engineer"
              >
                <input
                  type="text"
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  placeholder="e.g. ATD Engineering Group, NYC DOB Special Inspections"
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </FormField>
            </div>

            <div className="md:col-span-2">
              <FormField label="Verification Notes & Scope Observations">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Ultrasonic testing conducted on 100% of full-penetration moment welds. Zero defects observed."
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </FormField>
            </div>
          </div>

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
              <Upload className="h-4 w-4" />
              {isSubmitting ? "Uploading..." : "Attach Evidence"}
            </button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
