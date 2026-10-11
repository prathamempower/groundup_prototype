"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  ReadinessGate,
  OnboardingTask,
  ConfigurationVersion,
  UserRole,
} from "@/lib/types";
import { PageHeader } from "@/components/layout/page-header";
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  ArrowRight,
  ListTodo,
  FileText,
  UserCheck,
  Building2,
  Clock,
  Sparkles,
  History,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

export default function ReadinessPage() {
  const queryClient = useQueryClient();

  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedCfgId, setSelectedCfgId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionSuccessMessage, setActionSuccessMessage] = useState("");

  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.identity.getMe(),
  });

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list(),
  });

  const currentProjectId = projectsData?.data?.current_project_id || "";
  const currentProject = projectsData?.data?.projects.find((p) => p.id === currentProjectId);
  const currentUser = meData?.data;
  const isOwner = currentUser?.role === "OWNER";

  const { data: readinessData, isLoading: readinessLoading } = useQuery({
    queryKey: ["readiness", currentProjectId],
    queryFn: () => api.readiness.getProjectReadiness(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  const readiness = readinessData?.data;

  // Approve Configuration Mutation
  const approveCfgMutation = useMutation({
    mutationFn: (cfgId: string) => api.readiness.approveConfiguration(cfgId),
    onSuccess: (res) => {
      setActionSuccessMessage(`Successfully approved configuration: ${res.data.title}`);
      queryClient.invalidateQueries();
    },
  });

  // Reject Configuration Mutation
  const rejectCfgMutation = useMutation({
    mutationFn: (args: { cfgId: string; reason: string }) =>
      api.readiness.rejectConfiguration(args.cfgId, args.reason),
    onSuccess: () => {
      setRejectModalOpen(false);
      setRejectReason("");
      setSelectedCfgId(null);
      setActionSuccessMessage("Configuration version rejected.");
      queryClient.invalidateQueries();
    },
  });

  const handleOpenReject = (cfgId: string) => {
    setSelectedCfgId(cfgId);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!selectedCfgId || !rejectReason.trim()) return;
    rejectCfgMutation.mutate({ cfgId: selectedCfgId, reason: rejectReason });
  };

  const filteredTasks = (readiness?.open_tasks || []).filter((task) => {
    if (roleFilter === "ALL") return true;
    return task.assigned_to_role === roleFilter;
  });

  if (projectsLoading || (Boolean(currentProjectId) && readinessLoading)) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <div className="text-center text-text-secondary">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p>Evaluating project readiness gates...</p>
        </div>
      </div>
    );
  }

  if (!currentProjectId || !currentProject) {
    return (
      <div className="mx-auto max-w-3xl p-6 sm:p-8">
        <PageHeader
          title="Set up your first project"
          subtitle="Create a project to see its readiness checklist and next steps."
        />
        <div className="mt-6 rounded-lg border border-border bg-surface p-8 text-center">
          <Building2 className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 text-sm text-text-secondary">
            Your organization does not have a project yet. Start by adding the project details.
          </p>
          <Link href="/projects/new" className="mt-5 inline-flex">
            <Button variant="primary">Create your first project</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Project Readiness & Activation Gates"
        subtitle={`Readiness checklist and governance approvals for ${currentProject.name}.`}
        breadcrumbs={[
          { label: currentProject.name, href: "/control-center" },
          { label: "Readiness & Setup" },
        ]}
        actions={
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/documents">
            <Button variant="primary" size="sm">
              <FileText className="mr-1.5 h-4 w-4" />
              Upload project documents
              </Button>
            </Link>
          <Link href="/settings">
            <Button variant="secondary" size="sm">
              <Building2 className="mr-1.5 h-4 w-4" />
              Team and invitations
              </Button>
            </Link>
          <Link href="/onboarding">
            <Button variant="tertiary" size="sm">
              <Sparkles className="mr-1.5 h-4 w-4" />
              Resume role setup
            </Button>
          </Link>
        </div>
        }
      />

      {actionSuccessMessage && (
        <div className="rounded-md border border-success-subtle bg-success-subtle/30 p-4 text-sm text-success flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccessMessage("")}
            className="text-xs font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Overall Score Banner */}
      <div className="rounded-lg border border-border bg-surface p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary font-mono text-2xl font-bold">
            {readiness?.overall_readiness_pct || 0}%
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              Overall Project Operational Readiness
            </h2>
            <p className="text-body text-text-secondary mt-0.5 text-sm">
              {readiness?.overall_readiness_pct === 100
                ? "All 4 governance gates unlocked. Fully verified financial & reporting operations."
                : "2 of 4 gates active. Resolved prerequisites allow progressive activation without blocking other workflows."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-caption text-text-muted">Viewing as:</span>
          <span className="rounded bg-subtle px-2.5 py-1 text-xs font-semibold text-text-primary">
            {currentUser?.name} ({currentUser?.role})
          </span>
        </div>
      </div>

      {/* 4 Readiness Gates Grid */}
      <div>
        <h3 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Progressive Activation Gates
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(readiness?.gates || []).map((gate) => {
            const isUnlocked = gate.is_unlocked;
            return (
              <div
                key={gate.id}
                className={`rounded-lg border bg-surface p-6 shadow-sm transition-all ${
                  isUnlocked ? "border-success/30" : "border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        isUnlocked
                          ? "bg-success-subtle text-success"
                          : "bg-warning-subtle text-warning"
                      }`}
                    >
                      {isUnlocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-text-primary text-base">{gate.name}</h4>
                      <span className="text-caption text-text-muted">{gate.description}</span>
                    </div>
                  </div>

                  <span
                    className={`rounded px-2 py-0.5 text-xs font-bold ${
                      isUnlocked
                        ? "bg-success-subtle text-success"
                        : "bg-warning-subtle text-warning"
                    }`}
                  >
                    {isUnlocked ? "UNLOCKED" : "BLOCKED"}
                  </span>
                </div>

                {/* Prerequisites Checklist */}
                <div className="mt-4 pt-4 border-t border-border-subtle space-y-2.5">
                  {(gate.prerequisites || []).map((prereq, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between gap-3 text-sm"
                    >
                      <div className="flex items-start gap-2">
                        {prereq.is_met ? (
                          <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                        )}
                        <div>
                          <span
                            className={
                              prereq.is_met
                                ? "text-text-primary"
                                : "text-text-primary font-medium"
                            }
                          >
                            {prereq.label}
                          </span>
                          {prereq.blocker_description && (
                            <span className="block text-caption text-warning mt-0.5">
                              {prereq.blocker_description}
                            </span>
                          )}
                        </div>
                      </div>

                      {prereq.action_href && (
                        <Link
                          href={prereq.action_href}
                          className="shrink-0 text-caption font-semibold text-primary hover:underline flex items-center gap-0.5"
                        >
                          Resolve <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Owner High-Risk Configuration Approvals */}
      <div className="rounded-lg border border-border bg-surface p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              Owner Governance & Configuration Approvals
            </h3>
            <p className="text-body text-text-secondary text-sm mt-0.5">
              High-risk policies proposed by CFO, PM, or GC require formal Owner sign-off before becoming active.
            </p>
          </div>

          {!isOwner && (
            <span className="rounded bg-warning-subtle px-2.5 py-1 text-xs font-semibold text-warning">
              Owner Sign-off Required
            </span>
          )}
        </div>

        <div className="space-y-4">
          {(readiness?.pending_approvals || []).length === 0 ? (
            <div className="rounded-md border border-border-subtle bg-subtle p-6 text-center text-text-muted text-sm">
              <CheckCircle2 className="mx-auto h-6 w-6 text-success mb-2" />
              No pending configuration approvals for this project.
            </div>
          ) : (
            (readiness?.pending_approvals || []).map((cfg) => (
              <div
                key={cfg.id}
                className="rounded-lg border border-border p-4 bg-subtle/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-primary text-sm">{cfg.title}</span>
                    <span className="rounded bg-warning-subtle px-2 py-0.5 text-xs font-semibold text-warning">
                      Pending Owner Approval
                    </span>
                  </div>
                  <p className="text-caption text-text-secondary">{cfg.summary}</p>
                  <span className="text-caption text-text-muted block">
                    Proposed by {cfg.proposed_by} on {new Date(cfg.proposed_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isOwner ? (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => approveCfgMutation.mutate(cfg.id)}
                        loading={approveCfgMutation.isPending}
                      >
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleOpenReject(cfg.id)}
                      >
                        Reject
                      </Button>
                    </>
                  ) : (
                    <span className="text-caption text-text-muted italic">
                      Awaiting owner approval
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delegated Onboarding Tasks Table */}
      <div className="rounded-lg border border-border bg-surface p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-primary" />
              Delegated Setup Work Items
            </h3>
            <p className="text-body text-text-secondary text-sm mt-0.5">
              Tasks created from onboarding answers, missing evidence, and unmapped accounts.
            </p>
          </div>

          {/* Role Filter Chips */}
          <div className="flex items-center gap-1.5 bg-subtle p-1 rounded-md border border-border-subtle text-caption">
            {["ALL", "CFO", "PM", "GC"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  roleFilter === r
                    ? "bg-surface text-text-primary shadow-xs font-semibold"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {r === "ALL" ? "All Roles" : r}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-border-subtle">
          {filteredTasks.length === 0 ? (
            <div className="py-8 text-center text-text-muted text-sm">
              No open tasks found for this filter.
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text-primary text-sm">
                      {task.title}
                    </span>
                    <span className="rounded bg-primary-subtle px-2 py-0.5 text-xs font-semibold text-primary">
                      {task.assigned_to_role}
                    </span>
                    <span className="rounded bg-danger-subtle px-2 py-0.5 text-xs font-semibold text-danger">
                      Blocks {task.blocking_gate.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-caption text-text-secondary">{task.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-caption text-text-muted">
                    Assigned to {task.assigned_to_name}
                  </span>
                  <Link
                    href={
                      task.task_type === "ACCOUNT_MAPPING"
                        ? "/reconciliation"
                        : task.task_type === "EVIDENCE_UPLOAD"
                        ? "/documents"
                        : "/budget"
                    }
                  >
                    <Button variant="secondary" size="sm">
                      View Source <ExternalLink className="ml-1.5 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reject Configuration Modal */}
      <Modal open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <ModalContent maxWidth="md">
          <ModalHeader>
            <ModalTitle>Reject Proposed Configuration Version</ModalTitle>
            <ModalDescription>
              Provide a formal reason for why this configuration was rejected. This will be logged in the project audit history.
            </ModalDescription>
          </ModalHeader>

          <div className="py-2 space-y-3">
            <label className="block text-body font-medium text-text-secondary">
              Rejection Rationale *
            </label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Master shared account allocation requires 3rd party audit review before activation."
              rows={3}
              required
            />
          </div>

          <ModalFooter>
            <Button variant="tertiary" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              loading={rejectCfgMutation.isPending}
            >
              Confirm Rejection
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
