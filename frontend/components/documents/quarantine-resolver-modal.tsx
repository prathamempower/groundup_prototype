"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DocumentItem, Project } from "@/lib/types";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  ShieldAlert,
  FolderSync,
  Tag,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface QuarantineResolverModalProps {
  document: DocumentItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
  onResolved?: () => void;
}

type ResolutionMode = "REASSIGN" | "MARK";

export function QuarantineResolverModal({
  document,
  open,
  onOpenChange,
  projects,
  onResolved,
}: QuarantineResolverModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [mode, setMode] = useState<ResolutionMode>("REASSIGN");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [markType, setMarkType] = useState<"DUPLICATE" | "MISFILED" | "IRRELEVANT" | "NOT_APPLICABLE">("MISFILED");
  const [rationale, setRationale] = useState("");

  React.useEffect(() => {
    if (document) {
      setSelectedProjectId(projects.find((project) => project.id !== document.project_id)?.id || "");
      setRationale("");
    }
  }, [document, projects]);

  const reassignMutation = useMutation({
    mutationFn: () =>
      document
        ? api.documents.assignProject(document.id, selectedProjectId, rationale)
        : Promise.reject(new Error("No document")),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["data-quality-issues"] });
      queryClient.invalidateQueries({ queryKey: ["audit-events"] });
      toast({
        title: "Document Reassigned & Unquarantined",
        description: `Successfully moved ${document?.original_filename} to target project workspace.`,
      });
      onResolved?.();
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast({
        title: "Reassignment Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const markMutation = useMutation({
    mutationFn: () =>
      document
        ? api.documents.mark(document.id, markType, rationale, document.duplicate_of_document_id || undefined)
        : Promise.reject(new Error("No document")),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["data-quality-issues"] });
      queryClient.invalidateQueries({ queryKey: ["audit-events"] });
      toast({
        title: `Document Marked as ${markType}`,
        description: `Quarantine resolution recorded with audit rationale.`,
      });
      onResolved?.();
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast({
        title: "Action Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  if (!document) return null;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent maxWidth="md">
        <ModalHeader className="border-b border-border pb-4 bg-danger-subtle/30 -m-6 mb-4 p-6">
          <div className="flex items-center gap-2">
            <span className="rounded bg-danger-subtle p-2 text-danger">
              <ShieldAlert className="h-5 w-5" />
            </span>
            <div>
              <ModalTitle className="text-section font-bold text-text-primary">
                Resolve Quarantined Document
              </ModalTitle>
              <ModalDescription className="text-caption text-text-secondary">
                Document flagged for audit mismatch, duplicate content, or misplaced folder path.
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>

        <div className="space-y-4 text-body">
          {/* Document Summary Card */}
          <div className="bg-subtle/40 p-3.5 rounded-lg border border-border text-xs space-y-2">
            <div className="flex items-center justify-between font-medium">
              <span className="text-text-muted">Filename:</span>
              <span className="font-bold text-text-primary font-mono">{document.original_filename}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Current Flag:</span>
              <span className="text-danger font-semibold bg-danger-subtle px-2 py-0.5 rounded text-[11px]">
                {document.duplicate_of_document_id ? "Duplicate Document" : "Misfiled Document"}
              </span>
            </div>
            {document.notes && (
              <div className="text-[11px] text-text-secondary border-t border-border/60 pt-1.5 italic">
                &quot;{document.notes}&quot;
              </div>
            )}
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex rounded-md bg-subtle p-1 border border-border text-xs">
            <button
              type="button"
              onClick={() => setMode("REASSIGN")}
              className={cn(
                "flex-1 py-1.5 px-3 rounded text-center font-medium transition-all flex items-center justify-center gap-1.5",
                mode === "REASSIGN"
                  ? "bg-surface text-text-primary shadow-xs font-semibold"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              <FolderSync className="h-3.5 w-3.5 text-primary" />
              Reassign to Correct Project
            </button>
            <button
              type="button"
              onClick={() => setMode("MARK")}
              className={cn(
                "flex-1 py-1.5 px-3 rounded text-center font-medium transition-all flex items-center justify-center gap-1.5",
                mode === "MARK"
                  ? "bg-surface text-text-primary shadow-xs font-semibold"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              <Tag className="h-3.5 w-3.5 text-text-secondary" />
              Mark Resolution State
            </button>
          </div>

          {/* Mode 1: Reassign */}
          {mode === "REASSIGN" && (
            <div className="space-y-3">
              <div>
                <label className="block text-caption font-semibold text-text-primary mb-1">
                  Target Project Workspace:
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus-visible:outline-primary"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.project_entity})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-text-muted mt-1">
                  Reassigning will automatically clear the quarantine status and make the document available for OCR review.
                </p>
              </div>

              <div>
                <label className="block text-caption font-semibold text-text-primary mb-1">
                  Audit Rationale:
                </label>
                <textarea
                  rows={2}
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  placeholder="Explain why this document belongs to the target project..."
                  className="w-full rounded-md border border-border bg-surface p-2 text-body text-text-primary placeholder:text-text-muted focus-visible:outline-primary"
                />
              </div>
            </div>
          )}

          {/* Mode 2: Mark */}
          {mode === "MARK" && (
            <div className="space-y-3">
              <div>
                <label className="block text-caption font-semibold text-text-primary mb-1">
                  Resolution Classification:
                </label>
                <select
                  value={markType}
                  onChange={(e) => setMarkType(e.target.value as any)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary focus-visible:outline-primary"
                >
                  <option value="DUPLICATE">Duplicate Version of Existing Document</option>
                  <option value="MISFILED">Misfiled / Awaiting Relocation</option>
                  <option value="IRRELEVANT">Irrelevant / Ineligible Evidence</option>
                  <option value="NOT_APPLICABLE">Not Applicable (Exempt from Audit)</option>
                </select>
              </div>

              <div>
                <label className="block text-caption font-semibold text-text-primary mb-1">
                  Resolution Rationale / Audit Justification:
                </label>
                <textarea
                  rows={2}
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  placeholder="Record justification for marking this resolution..."
                  className="w-full rounded-md border border-border bg-surface p-2 text-body text-text-primary placeholder:text-text-muted focus-visible:outline-primary"
                />
              </div>
            </div>
          )}
        </div>

        <ModalFooter className="border-t border-border pt-4 mt-6">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {mode === "REASSIGN" ? (
            <Button
              variant="primary"
              onClick={() => reassignMutation.mutate()}
              isLoading={reassignMutation.isPending}
            >
              Confirm Reassignment
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => markMutation.mutate()}
              isLoading={markMutation.isPending}
            >
              Apply Resolution
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
