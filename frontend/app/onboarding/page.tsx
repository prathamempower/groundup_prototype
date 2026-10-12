"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  CircleCheck,
  HelpCircle,
  ShieldCheck,
  Layers,
  FileText,
  AlertTriangle,
  Building2,
  Clock,
  Briefcase,
  ChevronRight,
  Info,
  CheckCircle2,
  ListTodo,
  Check,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { getDefaultRouteForRole, getDefaultWorkspaceRoute } from "@/lib/navigation";
import type { SpecialAnswerType } from "@/lib/types";
import { Button } from "@/components/ui/button";

const specialAnswers: Array<{ value: Exclude<SpecialAnswerType, "STANDARD">; label: string; desc: string }> = [
  {
    value: "UNKNOWN",
    label: "I don’t know yet",
    desc: "Creates an accountable follow-up task instead of assuming an answer.",
  },
  {
    value: "NOT_YET_AVAILABLE",
    label: "Not available yet",
    desc: "Flags this dependency as pending and unblocks unrelated steps.",
  },
  {
    value: "NOT_APPLICABLE",
    label: "Not applicable",
    desc: "Explicitly marks this area as out of scope for this project.",
  },
];

const roleDescriptions: Record<string, { title: string; mission: string; badge: string }> = {
  OWNER: {
    title: "Project Sponsor / Owner",
    mission: "Establish legal identity, financing, GC governance, and approve high-risk project configurations.",
    badge: "Owner Authority",
  },
  CFO: {
    title: "Chief Financial Officer / Accounting",
    mission: "Establish bank accounts, baseline reconciliation cutoff, and budget-to-chart-of-accounts mapping.",
    badge: "Financial Control",
  },
  PM: {
    title: "Project Manager",
    mission: "Lock the milestone schedule, permit tracking authorities, and field verification evidence rules.",
    badge: "Field Operations",
  },
  GC: {
    title: "General Contractor",
    mission: "Configure compliant monthly payment application format, retainage expectations, and lien waiver policies.",
    badge: "Trade Billing",
  },
  INVESTOR: {
    title: "Equity Investor / LP",
    mission: "Set up read-only update distribution preferences, reporting digests, and year-end tax contacts.",
    badge: "Investor Access",
  },
};

export default function OnboardingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [answerValue, setAnswerValue] = useState("");
  const [otherSpecification, setOtherSpecification] = useState("");
  const [specialType, setSpecialType] = useState<Exclude<SpecialAnswerType, "STANDARD"> | null>(null);
  const [reason, setReason] = useState("");
  const [validationError, setValidationError] = useState("");

  const sessionQuery = useQuery({
    queryKey: ["onboardingSession", typeof window === "undefined" ? "" : window.location.search],
    queryFn: () => {
      const projectId =
        typeof window === "undefined"
          ? undefined
          : new URLSearchParams(window.location.search).get("projectId") || undefined;
      return api.onboarding.getCurrentSession(projectId);
    },
    retry: false,
  });

  const userQuery = useQuery({
    queryKey: ["me"],
    queryFn: () => api.identity.getMe(),
  });

  const session = sessionQuery.data?.data;
  const question = session?.next_question;
  const user = userQuery.data?.data;
  const effectiveProjectId = session?.project_id || undefined;

  // Onboarding tasks query
  const tasksQuery = useQuery({
    queryKey: ["onboarding-tasks", effectiveProjectId],
    queryFn: () => (effectiveProjectId ? api.onboarding.getTasks(effectiveProjectId) : null),
    enabled: !!effectiveProjectId,
  });

  // Readiness / configuration approvals query
  const readinessQuery = useQuery({
    queryKey: ["project-readiness-details", effectiveProjectId],
    queryFn: () => (effectiveProjectId ? api.readiness.getProjectReadiness(effectiveProjectId) : null),
    enabled: !!effectiveProjectId,
  });

  const approveConfigMutation = useMutation({
    mutationFn: (versionId: string) => api.readiness.approveConfiguration(versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-readiness-details"] });
      queryClient.invalidateQueries({ queryKey: ["onboarding-tasks"] });
    },
  });

  const rejectConfigMutation = useMutation({
    mutationFn: ({ versionId, reason }: { versionId: string; reason: string }) =>
      api.readiness.rejectConfiguration(versionId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-readiness-details"] });
      queryClient.invalidateQueries({ queryKey: ["onboarding-tasks"] });
    },
  });

  const answerMutation = useMutation({
    mutationFn: () => {
      if (!session || !question) throw new Error("There is no active setup question.");
      return api.onboarding.submitAnswer(
        session.id,
        question.question_key,
        specialType || answerValue,
        specialType || "STANDARD",
        specialType ? reason.trim() : undefined,
        question.question_version,
        answerValue === "OTHER" ? otherSpecification.trim() : undefined
      );
    },
    onSuccess: async () => {
      setAnswerValue("");
      setOtherSpecification("");
      setSpecialType(null);
      setReason("");
      setValidationError("");
      await queryClient.invalidateQueries({ queryKey: ["onboardingSession"] });
      await queryClient.invalidateQueries({ queryKey: ["onboarding-tasks"] });
      await queryClient.invalidateQueries({ queryKey: ["project-readiness-details"] });
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError("");
    if (specialType && !reason.trim()) {
      setValidationError("Add a short note explaining why this information is pending or unknown.");
      return;
    }
    if (!specialType && !answerValue.trim()) {
      setValidationError("Choose or enter an answer to continue.");
      return;
    }
    if (!specialType && answerValue === "OTHER" && !otherSpecification.trim()) {
      setValidationError("Please specify details for the 'Other' selection.");
      return;
    }
    answerMutation.mutate();
  }

  if (sessionQuery.isLoading || userQuery.isLoading) {
    return (
      <div className="mx-auto max-w-5xl animate-pulse space-y-6 px-4 py-12" aria-label="Loading setup">
        <div className="h-10 w-64 rounded bg-subtle" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 rounded-lg bg-subtle lg:col-span-1" />
          <div className="h-96 rounded-lg bg-subtle lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (sessionQuery.error || !session || !user) {
    const message =
      sessionQuery.error instanceof Error
        ? sessionQuery.error.message
        : "We couldn’t load your role setup session.";
    return (
      <section className="mx-auto mt-16 max-w-xl rounded-lg border border-border bg-surface p-8 shadow-sm">
        <div className="flex items-center gap-3 text-danger">
          <AlertTriangle className="h-6 w-6" />
          <h1 className="text-title font-semibold">Setup could not be loaded</h1>
        </div>
        <p className="mt-2 text-body text-text-secondary">{message}</p>
        <Button className="mt-6" onClick={() => void sessionQuery.refetch()}>
          Retry setup
        </Button>
      </section>
    );
  }

  const roleMeta = roleDescriptions[user.role] || {
    title: user.role,
    mission: "Configure project workflow and responsibilities.",
    badge: user.role,
  };

  const tasks = tasksQuery.data?.data || [];
  const readinessData = readinessQuery.data?.data;
  const pendingApprovals = readinessData?.pending_approvals || [];
  const gates = readinessData?.gates || [];

  // Completion State
  if (!question) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] flex flex-col justify-center items-center py-10 px-4 sm:px-6">
        <div className="w-full max-w-4xl rounded-3xl bg-white shadow-xl border border-slate-200/80 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
            {/* Left Support Sidebar */}
            <aside className="lg:col-span-4 bg-[#f8fafc] border-b lg:border-b-0 lg:border-r border-slate-200/80 p-8 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-base font-bold tracking-tight text-slate-900 block leading-tight">
                      GroundUp
                    </span>
                    <span className="text-xs text-slate-500">Readiness Hub</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Role Mandate
                  </span>
                  <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                    <span className="text-xs font-semibold text-slate-900 block">{roleMeta.title}</span>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{roleMeta.mission}</p>
                  </div>
                </div>

                <div className="pt-2 space-y-4 border-t border-slate-200/60">
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Support Desk</div>
                    <a href="mailto:support@groundup.ai" className="text-xs font-semibold text-emerald-700 hover:underline mt-0.5 inline-block">
                      support@groundup.ai
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200/60">
                <button
                  type="button"
                  onClick={() => {
                    const target = effectiveProjectId
                      ? getDefaultWorkspaceRoute(user.role as any, effectiveProjectId)
                      : "/projects";
                    router.push(target);
                  }}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Exit to Workspace
                </button>
              </div>
            </aside>

            {/* Right Main Content */}
            <main className="lg:col-span-8 p-8 sm:p-12 flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm mb-6">
                  <CircleCheck className="h-6 w-6" />
                </div>

                <span className="inline-block rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700 mb-2">
                  {roleMeta.badge} Verified
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Role Setup & Onboarding Complete
                </h1>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  All required governance decisions for your role have been recorded without guessing missing data.
                </p>

                {/* Governance Activation Gates Status */}
                {gates.length > 0 && (
                  <div className="mt-6 text-left rounded-2xl border border-slate-200/80 bg-[#f8fafc] p-5">
                    <h3 className="text-xs font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      Governance & Activation Status
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {gates.map((g) => (
                        <div
                          key={g.id}
                          className="rounded-xl border border-slate-200 bg-white p-3 flex items-center justify-between shadow-2xs"
                        >
                          <div>
                            <div className="text-xs font-semibold text-slate-900">{g.name}</div>
                            <div className="text-[11px] text-slate-500">{g.description}</div>
                          </div>
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                              g.is_unlocked
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                : "bg-amber-50 text-amber-700 border border-amber-200/60"
                            }`}
                          >
                            {g.is_unlocked ? "Unlocked" : "Pending Tasks"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pending Approvals */}
                {user.role === "OWNER" && pendingApprovals.length > 0 && (
                  <div className="mt-6 text-left rounded-2xl border border-amber-200 bg-amber-50/40 p-5">
                    <h3 className="text-xs font-semibold text-amber-900 mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      Pending Configuration Approvals ({pendingApprovals.length})
                    </h3>
                    <div className="space-y-2.5">
                      {pendingApprovals.map((cfg) => (
                        <div
                          key={cfg.id}
                          className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
                        >
                          <div>
                            <div className="font-semibold text-xs text-slate-900">{cfg.title}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{cfg.summary}</div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={rejectConfigMutation.isPending}
                              onClick={() => {
                                const reason = prompt("Enter reason for rejecting this configuration:") || "Rejected by owner";
                                rejectConfigMutation.mutate({ versionId: cfg.id, reason });
                              }}
                              className="rounded-full text-xs font-semibold"
                            >
                              <X className="h-3 w-3 mr-1 text-red-600" /> Reject
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              loading={approveConfigMutation.isPending}
                              onClick={() => approveConfigMutation.mutate(cfg.id)}
                              className="rounded-full bg-slate-900 text-white text-xs font-semibold"
                            >
                              <Check className="h-3 w-3 mr-1" /> Approve
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Accountable Onboarding Tasks */}
                {tasks.length > 0 && (
                  <div className="mt-6 text-left rounded-2xl border border-slate-200/80 bg-[#f8fafc] p-5">
                    <h3 className="text-xs font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <ListTodo className="h-4 w-4 text-emerald-600" />
                      Accountable Onboarding Tasks ({tasks.length})
                    </h3>
                    <div className="space-y-2">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className="rounded-xl border border-slate-200 bg-white p-3 flex items-center justify-between gap-3 shadow-2xs"
                        >
                          <div>
                            <div className="font-semibold text-xs text-slate-900">{task.title}</div>
                            <div className="text-[11px] text-slate-500">
                              Assigned to: <span className="font-medium text-slate-700">{task.assigned_to_role || task.assigned_to_name}</span> • Gate: {task.blocking_gate}
                            </div>
                          </div>
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                              task.status === "RESOLVED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                : "bg-amber-50 text-amber-700 border border-amber-200/60"
                            }`}
                          >
                            {task.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-8 flex justify-end border-t border-slate-200 mt-8">
                <Button
                  variant="primary"
                  onClick={() => router.replace(getDefaultRouteForRole(user.role))}
                  className="rounded-full bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 text-xs font-semibold shadow-sm"
                >
                  Launch {roleMeta.title} Workspace <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-5xl rounded-2xl bg-white shadow-xl border border-slate-200/80 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
          {/* Left Context Rail */}
          <aside className="lg:col-span-4 bg-slate-50/70 border-b lg:border-b-0 lg:border-r border-slate-200/80 p-8 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Brand Header */}
              <header role="banner" className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-base font-bold tracking-tight text-slate-900 block leading-tight">
                      GroundUp
                    </span>
                    <span className="text-xs text-slate-500">Adaptive Setup</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const target = effectiveProjectId
                      ? getDefaultWorkspaceRoute(user.role as any, effectiveProjectId)
                      : "/projects";
                    router.push(target);
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Exit to Workspace
                </button>
              </header>

              {/* Role Mandate Pill */}
              <div className="pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Role Mandate
                </span>
                <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                      {roleMeta.badge}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-900 block mt-1.5">{roleMeta.title}</span>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{roleMeta.mission}</p>
                </div>
              </div>

              {/* Unlocks context */}
              {question.unlocks && (
                <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                  <h4 className="text-xs font-semibold text-blue-950 mb-1 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-blue-600" />
                    What this unlocks
                  </h4>
                  <p className="text-xs text-blue-900/80 leading-relaxed">
                    {question.unlocks}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Step verified</span>
              <span className="text-[11px] text-slate-400 font-medium">Session Active</span>
            </div>
          </aside>

          {/* Right Main Content Area */}
          <main className="lg:col-span-8 p-8 sm:p-12 flex flex-col justify-between">
            <div>
              {/* Brand Icon Header */}
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm mb-6">
                {question.is_high_risk ? <ShieldCheck className="h-5 w-5" /> : <HelpCircle className="h-5 w-5" />}
              </div>

              {/* Title & Help Text */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {question.section?.replace("_", " ") || "Decision Gate"}
                </span>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 leading-snug">
                  {question.prompt}
                </h1>
                {question.help_text && (
                  <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                    {question.help_text}
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                {(validationError || (answerMutation.error instanceof Error && answerMutation.error.message)) && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-700 flex items-center gap-2"
                  >
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                    <span>{validationError || (answerMutation.error as Error).message}</span>
                  </div>
                )}

                {/* Direct Answer Options */}
                {question.options?.length ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-3">
                      Select one option
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {question.options.map((option) => {
                        const isSelected = answerValue === option.value && !specialType;
                        return (
                          <div
                            key={option.value}
                            onClick={() => {
                              setAnswerValue(option.value);
                              setSpecialType(null);
                            }}
                            className={`cursor-pointer rounded-2xl border p-4.5 transition-all flex flex-col justify-between min-h-[92px] ${
                              isSelected
                                ? "border-slate-900 bg-slate-50/80 ring-1 ring-slate-900 shadow-2xs"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-semibold text-slate-900 leading-snug">
                                {option.label}
                              </span>
                              <div
                                className={`h-4 w-4 rounded-full border grid place-items-center shrink-0 mt-0.5 ${
                                  isSelected
                                    ? "border-slate-900 bg-slate-900 text-white"
                                    : "border-slate-300 bg-white"
                                }`}
                              >
                                {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                              </div>
                            </div>
                            <span className="text-[11px] text-slate-400 mt-2">Verified governance choice</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Inline detail if OTHER selected */}
                    {answerValue === "OTHER" && !specialType && (
                      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <label
                          htmlFor="other-specification"
                          className="block text-xs font-semibold text-slate-700 mb-1"
                        >
                          Specify Details *
                        </label>
                        <input
                          id="other-specification"
                          type="text"
                          required
                          autoFocus
                          value={otherSpecification}
                          onChange={(e) => setOtherSpecification(e.target.value)}
                          placeholder="Please describe your specific setup..."
                          className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 shadow-2xs focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                        />
                      </div>
                    )}
                  </div>
                ) : question.input_type === "BOOLEAN" ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-3">
                      Select Yes or No
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { val: "true", label: "Yes, confirmed", desc: "Governance gate verified." },
                        { val: "false", label: "No / Not yet", desc: "Dependencies unresolved." },
                      ].map((opt) => {
                        const isSelected = answerValue === opt.val && !specialType;
                        return (
                          <div
                            key={opt.val}
                            onClick={() => {
                              setAnswerValue(opt.val);
                              setSpecialType(null);
                            }}
                            className={`cursor-pointer rounded-2xl border p-4.5 transition-all flex flex-col justify-between min-h-[92px] ${
                              isSelected
                                ? "border-slate-900 bg-slate-50/80 ring-1 ring-slate-900 shadow-2xs"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-semibold text-slate-900 leading-snug">
                                {opt.label}
                              </span>
                              <div
                                className={`h-4 w-4 rounded-full border grid place-items-center shrink-0 mt-0.5 ${
                                  isSelected
                                    ? "border-slate-900 bg-slate-900 text-white"
                                    : "border-slate-300 bg-white"
                                }`}
                              >
                                {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                              </div>
                            </div>
                            <span className="text-[11px] text-slate-400 mt-2">{opt.desc}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label htmlFor="setup-answer" className="mb-2 block text-xs font-semibold text-slate-700">
                      {question.input_type === "NUMBER" ? "Numerical Value" : "Your Answer"}
                    </label>
                    <input
                      id="setup-answer"
                      type={question.input_type === "NUMBER" ? "number" : "text"}
                      value={answerValue}
                      onChange={(event) => {
                        setAnswerValue(event.target.value);
                        setSpecialType(null);
                      }}
                      placeholder={question.help_text || "Enter details..."}
                      className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    />
                  </div>
                )}

                {/* Special Answers (Unknown / Not Yet Available - Styled as clean pills like screenshot 2) */}
                {question.allow_special_answers && (
                  <div className="pt-4 border-t border-slate-200/80">
                    <span className="text-xs font-semibold text-slate-700 block mb-1">
                      Information not available yet?
                    </span>
                    <p className="text-[11px] text-slate-500 mb-2.5">
                      GroundUp will log an accountable follow-up task instead of assuming data.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {specialAnswers.map((item) => {
                        const isSelected = specialType === item.value;
                        return (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => {
                              setSpecialType(item.value);
                              setAnswerValue("");
                            }}
                            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? "bg-slate-900 text-white shadow-xs"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>

                    {specialType && (
                      <div className="mt-3.5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <label htmlFor="setup-reason" className="block text-xs font-semibold text-slate-700 mb-1">
                          Follow-Up Note & Rationale *
                        </label>
                        <textarea
                          id="setup-reason"
                          required
                          value={reason}
                          onChange={(event) => setReason(event.target.value)}
                          placeholder="Explain why this information is pending and when it will be resolved..."
                          rows={3}
                          className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 shadow-2xs focus:border-emerald-600 focus:outline-none focus:ring-3 focus:ring-emerald-600/15"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Navigation Buttons (Matching Untitled UI "Go back" and "Continue") */}
                <div className="pt-6 flex items-center justify-between border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      const target = effectiveProjectId
                        ? getDefaultWorkspaceRoute(user.role as any, effectiveProjectId)
                        : "/projects";
                      router.push(target);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
                  >
                    <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                    Exit to Workspace
                  </button>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!answerValue && !specialType}
                    loading={answerMutation.isPending}
                    className="rounded-full bg-slate-900 hover:bg-slate-800 text-white px-7 py-2.5 text-xs font-semibold shadow-sm cursor-pointer"
                  >
                    Continue
                  </Button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
