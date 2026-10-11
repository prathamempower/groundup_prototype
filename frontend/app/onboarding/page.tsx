"use client";

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
} from "lucide-react";
import { api } from "@/lib/api";
import { getDefaultRouteForRole } from "@/lib/navigation";
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

  // Completion State
  if (!question) {
    return (
      <main className="min-h-screen bg-app px-4 py-12 sm:px-6">
        <section className="mx-auto max-w-2xl rounded-xl border border-border bg-surface p-8 sm:p-10 text-center shadow-sm">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success-subtle text-success">
            <CircleCheck className="h-10 w-10" />
          </div>
          <span className="mt-4 inline-block rounded-full bg-success-subtle px-3 py-1 text-xs font-semibold text-success">
            {roleMeta.badge} Verified
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-text-primary">
            Role Setup Complete
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-body text-text-secondary leading-relaxed">
            All required governance and decision-graph steps for your role have been recorded.
            Your answers establish the project's baseline without fabricating missing data.
          </p>

          <div className="mt-8 rounded-lg border border-border-subtle bg-subtle p-4 text-left">
            <h3 className="text-caption font-bold uppercase tracking-wider text-text-muted mb-2">
              Next Actionable Step
            </h3>
            <p className="text-body font-medium text-text-primary flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-primary shrink-0" />
              Proceed to your workspace to view assigned tasks and project readiness status.
            </p>
          </div>

          <Button
            className="mt-8 w-full sm:w-auto"
            size="lg"
            variant="primary"
            onClick={() => router.replace(getDefaultRouteForRole(user.role))}
          >
            Launch {roleMeta.title} Workspace <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-app">
      {/* Top Navbar */}
      <header className="border-b border-border bg-surface px-6 py-3.5 sticky top-0 z-20 shadow-xs">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-hover text-white shadow-xs">
              <Layers className="h-4 w-4" />
            </div>
            <span className="text-section font-bold tracking-tight text-text-primary">
              GroundUp <span className="text-primary-accent font-extrabold">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-caption text-text-secondary border-r border-border pr-3 mr-1">
              <Building2 className="h-4 w-4 text-text-muted" />
              <span>Org: {user.organization_id.substring(0, 8)}...</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push(getDefaultRouteForRole(user.role))}
            >
              Exit to Workspace
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Top Header */}
          <header className="mb-8 border-b border-border pb-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="rounded bg-primary-subtle px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
                    {roleMeta.badge}
                  </span>
                  <span className="text-caption text-text-muted">Adaptive Decision Graph</span>
                </div>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-text-primary">
                  {roleMeta.title} Setup
                </h1>
              </div>
            </div>
          </header>

        {/* Two-Column Focused Desktop Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Context Rail */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Role Mandate
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {roleMeta.mission}
              </p>
            </div>

            {question.unlocks && (
              <div className="rounded-xl border border-primary-subtle bg-primary-subtle/10 p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-2 flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  What this unlocks
                </h3>
                <p className="text-sm text-text-primary leading-relaxed">
                  {question.unlocks}
                </p>
              </div>
            )}

            {question.is_high_risk && (
              <div className="rounded-xl border border-warning/40 bg-warning-subtle/20 p-5">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-warning">
                      Owner Governance Policy
                    </h4>
                    <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                      This question configures high-risk financial, contractual, or access parameters.
                      Submitting a value creates a pending version requiring Owner sign-off before production activation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-border bg-surface p-5 text-xs text-text-muted space-y-2">
              <div className="flex items-center gap-2 font-medium text-text-secondary">
                <Info className="h-4 w-4 text-primary" />
                <span>Zero False Data Guarantee</span>
              </div>
              <p>
                GroundUp never forces fabricated dates or numbers. If information is not yet available,
                select the option below to generate a transparent follow-up task.
              </p>
            </div>
          </aside>

          {/* Main Question Work Area */}
          <section className="lg:col-span-8 rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-subtle text-primary">
                {question.is_high_risk ? <ShieldCheck className="h-5 w-5" /> : <HelpCircle className="h-5 w-5" />}
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {question.section?.replace("_", " ") || "Decision Gate"}
                </span>
                <h2 className="mt-1 text-xl font-bold tracking-tight text-text-primary">
                  {question.prompt}
                </h2>
                {question.help_text && (
                  <p className="mt-1.5 text-sm text-text-secondary leading-relaxed">
                    {question.help_text}
                  </p>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {(validationError || (answerMutation.error instanceof Error && answerMutation.error.message)) && (
                <div
                  role="alert"
                  className="rounded-lg border border-danger bg-danger-subtle/40 p-4 text-sm text-danger flex items-center gap-2.5"
                >
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{validationError || (answerMutation.error as Error).message}</span>
                </div>
              )}

              {/* Direct Answer Options */}
              {question.options?.length ? (
                <fieldset className="space-y-2.5">
                  <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-text-muted">
                    Choose one permitted option
                  </legend>
                  {question.options.map((option) => {
                    const isSelected = answerValue === option.value && !specialType;
                    const isOther = option.value === "OTHER" || option.label.toLowerCase().includes("other");
                    return (
                      <div key={option.value} className="space-y-2">
                        <label
                          className={`flex min-h-12 cursor-pointer items-start gap-3.5 rounded-lg border p-4 transition-all ${
                            isSelected
                              ? "border-primary bg-primary-subtle/15 ring-1 ring-primary"
                              : "border-border hover:bg-subtle"
                          }`}
                        >
                          <input
                            type="radio"
                            name="setup-answer"
                            value={option.value}
                            checked={isSelected}
                            onChange={() => {
                              setAnswerValue(option.value);
                              setSpecialType(null);
                            }}
                            className="mt-0.5 h-4 w-4 accent-primary"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-text-primary leading-normal block">
                              {option.label}
                            </span>
                          </div>
                        </label>

                        {/* Smart Inline Specification Input */}
                        {isSelected && isOther && (
                          <div className="ml-7 rounded-lg border border-primary-subtle bg-surface p-3.5 shadow-xs">
                            <label
                              htmlFor="other-specification"
                              className="block text-xs font-bold uppercase tracking-wider text-primary mb-1.5"
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
                              className="h-10 w-full rounded-md border border-border bg-subtle px-3 text-sm text-text-primary focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <p className="mt-1 text-[11px] text-text-muted">
                              This specification will be recorded into project governance and configuration baseline.
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </fieldset>
              ) : question.input_type === "BOOLEAN" ? (
                <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <legend className="col-span-full mb-2 text-xs font-bold uppercase tracking-wider text-text-muted">
                    Select Yes or No
                  </legend>
                  {[
                    { val: "true", label: "Yes, confirmed" },
                    { val: "false", label: "No / Not yet" },
                  ].map((option) => (
                    <label
                      key={option.val}
                      className={`flex min-h-12 cursor-pointer items-center gap-3.5 rounded-lg border p-4 transition-all ${
                        answerValue === option.val && !specialType
                          ? "border-primary bg-primary-subtle/15 ring-1 ring-primary"
                          : "border-border hover:bg-subtle"
                      }`}
                    >
                      <input
                        type="radio"
                        name="setup-answer"
                        value={option.val}
                        checked={answerValue === option.val && !specialType}
                        onChange={() => {
                          setAnswerValue(option.val);
                          setSpecialType(null);
                        }}
                        className="h-4 w-4 accent-primary"
                      />
                      <span className="text-sm font-medium text-text-primary">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </fieldset>
              ) : (
                <div>
                  <label htmlFor="setup-answer" className="mb-2 block text-xs font-bold uppercase tracking-wider text-text-muted">
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
                    className="h-11 w-full rounded-lg border border-border bg-surface px-4 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              )}

              {/* Special Answers (Unknown / Not Yet Available) */}
              {question.allow_special_answers && (
                <div className="border-t border-border pt-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                    Missing Information? Explicit Non-Answers
                  </h3>
                  <p className="text-xs text-text-secondary mb-3">
                    If this detail is pending or unknown, select a non-answer below. A reasoned follow-up task will be generated.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {specialAnswers.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => {
                          setSpecialType(item.value);
                          setAnswerValue("");
                        }}
                        aria-pressed={specialType === item.value}
                        className={`rounded-lg border p-3 text-left transition-all ${
                          specialType === item.value
                            ? "border-primary bg-primary-subtle text-primary ring-1 ring-primary"
                            : "border-border text-text-secondary hover:bg-subtle"
                        }`}
                      >
                        <span className="block text-xs font-bold">{item.label}</span>
                        <span className="mt-1 block text-[11px] text-text-muted leading-tight">
                          {item.desc}
                        </span>
                      </button>
                    ))}
                  </div>

                  {specialType && (
                    <div className="mt-4 rounded-lg border border-primary-subtle bg-subtle p-4">
                      <label htmlFor="setup-reason" className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                        Follow-Up Note & Rationale *
                      </label>
                      <textarea
                        id="setup-reason"
                        required
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        placeholder="Explain why this information is pending and when it will be resolved..."
                        rows={3}
                        className="w-full rounded-lg border border-border bg-surface p-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <p className="mt-1.5 text-xs text-text-muted">
                        This note will be attached to an accountable onboarding task in the Alert Center.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-border pt-6">
                <Button
                  type="button"
                  variant="tertiary"
                  onClick={() => router.push("/readiness")}
                >
                  View Current Readiness
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={!answerValue && !specialType}
                  loading={answerMutation.isPending}
                >
                  Confirm & Advance to Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
        </div>
      </div>
    </main>
  </div>
  );
}
