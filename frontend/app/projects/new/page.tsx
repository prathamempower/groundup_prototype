"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ContractModel, LifecycleStage } from "@/lib/types";
import {
  Building2,
  FolderPlus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Layers,
  AlertCircle,
  Clock,
  Landmark,
  Users,
  FileCheck,
  Save,
  CheckCircle2,
  HelpCircle,
  CopyCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function CreateProjectPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isFirstRun =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("firstRun") === "1"
      : false;

  // Stages 0 to 6
  const [stage, setStage] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6>(0);
  const [errorMessage, setErrorMessage] = useState("");

  // Duplicate Check Modal State
  const [duplicateMatches, setDuplicateMatches] = useState<
    Array<{ id: string; name: string; address: string; project_entity: string; similarity_reason: string }>
  >([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  // Form State: Stage 1 (Identity)
  const [name, setName] = useState("");
  const [projectEntity, setProjectEntity] = useState("");
  const [address, setAddress] = useState("");
  const [lifecycleStage, setLifecycleStage] = useState<LifecycleStage>("PRE_CONSTRUCTION");
  const [projectType, setProjectType] = useState("MULTIFAMILY");
  const [startedAt, setStartedAt] = useState("");
  const [targetCompletionAt, setTargetCompletionAt] = useState("");

  // Stage 2 (Acquisition & Debt)
  const [isAcquired, setIsAcquired] = useState<"true" | "false">("true");
  const [acquisitionFunding, setAcquisitionFunding] = useState("ACQUISITION_LOAN");
  const [hasConstructionLoan, setHasConstructionLoan] = useState<"true" | "false">("true");
  const [lenderName, setLenderName] = useState("");

  // Stage 3 (Contract & Governance)
  const [contractModel, setContractModel] = useState<ContractModel>("COST_PLUS");
  const [hybridCustomDetails, setHybridCustomDetails] = useState("");
  const [operatingAccountModel, setOperatingAccountModel] = useState<"DEDICATED" | "SHARED">("DEDICATED");

  // Stage 4 (Delegation Invites)
  const [cfoEmail, setCfoEmail] = useState("");
  const [pmEmail, setPmEmail] = useState("");
  const [gcEmail, setGcEmail] = useState("");
  const [investorEmail, setInvestorEmail] = useState("");

  useEffect(() => {
    if (isFirstRun && typeof window !== "undefined") {
      window.sessionStorage.removeItem("groundup_signup_completed");
    }
  }, [isFirstRun]);

  const duplicateCheckMutation = useMutation({
    mutationFn: () =>
      api.projects.checkDuplicates({
        name,
        address,
        project_entity: projectEntity,
      }),
    onSuccess: (res) => {
      if (res.data && res.data.has_matches && res.data.matches.length > 0) {
        setDuplicateMatches(res.data.matches);
        setShowDuplicateModal(true);
      } else {
        setStage(2);
      }
    },
    onError: () => {
      // If check fails gracefully advance
      setStage(2);
    },
  });

  const createMutation = useMutation({
    mutationFn: () =>
      api.projects.create({
        name,
        project_entity: projectEntity || `${name} LLC`,
        address,
        lifecycle_stage: lifecycleStage,
        contract_model: contractModel,
        status: "SETUP_INCOMPLETE",
        currency: "USD",
        ...(startedAt ? { started_at: new Date(startedAt).toISOString() } : {}),
        ...(targetCompletionAt
          ? { target_completion_at: new Date(targetCompletionAt).toISOString() }
          : {}),
      }),
    onSuccess: (res) => {
      localStorage.setItem("groundup_active_project_id", res.data.id);
      queryClient.invalidateQueries();
      router.push("/readiness");
    },
    onError: (err: Error) => {
      setErrorMessage(err.message || "Failed to create project.");
    },
  });

  const handleStage1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) {
      setErrorMessage("Please enter the project name and address.");
      return;
    }
    setErrorMessage("");
    duplicateCheckMutation.mutate();
  };

  const handleSaveDraft = () => {
    if (!name.trim()) {
      setErrorMessage("Please provide at least a project name to save a draft.");
      return;
    }
    createMutation.mutate();
  };

  const stagesList = [
    { num: 0, title: "Welcome & Choice" },
    { num: 1, title: "Identity & Structure" },
    { num: 2, title: "Acquisition & Debt" },
    { num: 3, title: "Contract & Operating" },
    { num: 4, title: "Team & Delegation" },
    { num: 5, title: "Source Documents" },
    { num: 6, title: "Review & Launch" },
  ];

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
            <Button variant="tertiary" size="sm" onClick={handleSaveDraft} disabled={createMutation.isPending}>
              <Save className="mr-1.5 h-3.5 w-3.5" />
              Save Draft
            </Button>
            <Button variant="secondary" size="sm" onClick={() => router.push("/control-center")}>
              Exit Setup
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded bg-primary-subtle px-2 py-0.5 text-xs font-semibold text-primary">
                Owner Workspace
              </span>
              <span className="text-caption text-text-muted">UF-01 Project Bootstrap</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Project Bootstrap & Governance Setup
            </h1>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-lg border border-danger-subtle bg-danger-subtle/40 p-4 text-sm text-danger flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Two-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Progress Rail */}
          <aside className="lg:col-span-4 rounded-xl border border-border bg-surface p-5 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-4">
              Bootstrap Stages
            </h2>
            <nav className="space-y-1">
              {stagesList.map((s) => (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => s.num <= stage && setStage(s.num as any)}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all ${
                    stage === s.num
                      ? "bg-primary text-white font-semibold"
                      : stage > s.num
                      ? "text-text-primary hover:bg-subtle font-medium"
                      : "text-text-muted cursor-not-allowed opacity-75"
                  }`}
                >
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs ${
                      stage === s.num
                        ? "bg-white text-primary font-bold"
                        : stage > s.num
                        ? "bg-success-subtle text-success font-bold"
                        : "bg-subtle text-text-muted"
                    }`}
                  >
                    {stage > s.num ? "✓" : s.num}
                  </span>
                  <span>{s.title}</span>
                </button>
              ))}
            </nav>

            <div className="mt-8 border-t border-border pt-4 text-xs text-text-muted space-y-2">
              <p className="font-semibold text-text-secondary">Progressive Activation</p>
              <p>
                GroundUp does not require every detail upfront. Core identity creates the workspace;
                detailed financing and milestones can be completed progressively by the team.
              </p>
            </div>
          </aside>

          {/* Right Main Work Area */}
          <main className="lg:col-span-8 rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-xs">
            {/* Stage 0: Welcome & Choices */}
            {stage === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-text-primary">Welcome to Project Setup</h2>
                  <p className="mt-1 text-sm text-text-secondary leading-relaxed">
                    GroundUp AI provides real-time control across identity, loans, budgets, field evidence,
                    and investor distributions. Choose how you would like to initiate this workspace.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div
                    onClick={() => setStage(1)}
                    className="cursor-pointer rounded-xl border-2 border-primary bg-primary-subtle/10 p-5 hover:bg-primary-subtle/20 transition-all"
                  >
                    <FolderPlus className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-bold text-text-primary text-base">Create a New Project</h3>
                    <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                      Establish core entity, acquisition path, loan model, and delegate roles to CFO, PM, and GC.
                    </p>
                    <span className="mt-4 inline-flex items-center text-xs font-bold text-primary">
                      Begin Setup <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </span>
                  </div>

                  <div className="rounded-xl border border-border bg-subtle/50 p-5 opacity-75">
                    <Clock className="h-8 w-8 text-text-muted mb-3" />
                    <h3 className="font-bold text-text-muted text-base">Import Existing Pro-Forma</h3>
                    <p className="mt-1 text-xs text-text-muted leading-relaxed">
                      Reconstruct from historical Excel / QuickBooks files. Available once initial identity is verified.
                    </p>
                    <span className="mt-4 inline-block text-xs font-semibold text-text-muted">
                      Available via Document Inbox
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Stage 1: Identity & Structure */}
            {stage === 1 && (
              <form onSubmit={handleStage1Submit} className="space-y-4">
                <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Stage 1 — Project Identity & Structure
                </h2>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                    Project Display Name *
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!projectEntity) setProjectEntity(`${e.target.value} Partners LLC`);
                    }}
                    placeholder="e.g. 161 Woodlawn Avenue"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                    Legal Ownership Entity (LLC / LP) *
                  </label>
                  <Input
                    type="text"
                    value={projectEntity}
                    onChange={(e) => setProjectEntity(e.target.value)}
                    placeholder="e.g. 161 Woodlawn Partners LLC"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                    Street Address & Municipality *
                  </label>
                  <Input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 161 Woodlawn Ave, Jersey City, NJ"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                      Project Asset Type
                    </label>
                    <Select value={projectType} onValueChange={setProjectType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MULTIFAMILY">Multifamily Residential</SelectItem>
                        <SelectItem value="SINGLE_FAMILY">Single Family Ground-Up</SelectItem>
                        <SelectItem value="MIXED_USE">Mixed-Use Commercial</SelectItem>
                        <SelectItem value="SUBDIVISION">Land Development / Subdivision</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                      Lifecycle Stage
                    </label>
                    <Select
                      value={lifecycleStage}
                      onValueChange={(val) => setLifecycleStage(val as LifecycleStage)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PRE_CONSTRUCTION">Pre-Construction & Permitting</SelectItem>
                        <SelectItem value="CONSTRUCTION">Active Construction</SelectItem>
                        <SelectItem value="ACQUISITION">Acquisition Diligence</SelectItem>
                        <SelectItem value="COMPLETION">Completion & Closeout</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                      Target Construction Start
                    </label>
                    <Input
                      type="date"
                      value={startedAt}
                      onChange={(e) => setStartedAt(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                      Target Completion Date
                    </label>
                    <Input
                      type="date"
                      value={targetCompletionAt}
                      onChange={(e) => setTargetCompletionAt(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-between border-t border-border">
                  <Button type="button" variant="tertiary" onClick={() => setStage(0)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button type="submit" variant="primary" loading={duplicateCheckMutation.isPending}>
                    Next: Capital & Debt <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            )}

            {/* Stage 2: Acquisition, Capital & Debt */}
            {stage === 2 && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <Landmark className="h-5 w-5 text-primary" />
                  Stage 2 — Acquisition & Debt Model
                </h2>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                    Has Property Been Formally Acquired?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { val: "true", label: "Yes, Title / Deed Closed" },
                      { val: "false", label: "No, Under Contract / Diligence" },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setIsAcquired(opt.val as any)}
                        className={`rounded-lg border p-3.5 text-left text-sm font-semibold transition-all ${
                          isAcquired === opt.val
                            ? "border-primary bg-primary-subtle text-primary ring-1 ring-primary"
                            : "border-border text-text-secondary hover:bg-subtle"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                    Acquisition Funding Source
                  </label>
                  <Select value={acquisitionFunding} onValueChange={setAcquisitionFunding}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH_EQUITY">All-Cash Sponsor Equity</SelectItem>
                      <SelectItem value="ACQUISITION_LOAN">Acquisition / Bridge Loan</SelectItem>
                      <SelectItem value="SELLER_FINANCING">Seller Financing</SelectItem>
                      <SelectItem value="OTHER">Other (Specify Custom Structure)</SelectItem>
                    </SelectContent>
                  </Select>

                  {acquisitionFunding === "OTHER" && (
                    <div className="mt-2.5 rounded-lg border border-primary-subtle bg-primary-subtle/10 p-3">
                      <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1">
                        Specify Custom Funding Structure *
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g. PACE equity financing, mezzanine note, or land equity contribution"
                        value={lenderName}
                        onChange={(e) => setLenderName(e.target.value)}
                        required
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                    Active or Planned Construction Loan?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { val: "true", label: "Yes, Construction Loan in Place" },
                      { val: "false", label: "No, All-Equity Self-Funded" },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setHasConstructionLoan(opt.val as any)}
                        className={`rounded-lg border p-3.5 text-left text-sm font-semibold transition-all ${
                          hasConstructionLoan === opt.val
                            ? "border-primary bg-primary-subtle text-primary ring-1 ring-primary"
                            : "border-border text-text-secondary hover:bg-subtle"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {hasConstructionLoan === "true" && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                      Primary Construction Lender Name (Optional)
                    </label>
                    <Input
                      type="text"
                      value={lenderName}
                      onChange={(e) => setLenderName(e.target.value)}
                      placeholder="e.g. Pacific Western Bank"
                    />
                  </div>
                )}

                <div className="pt-4 flex justify-between border-t border-border">
                  <Button type="button" variant="tertiary" onClick={() => setStage(1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button type="button" variant="primary" onClick={() => setStage(3)}>
                    Next: Contract & Governance <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Stage 3: Construction & Operating Model */}
            {stage === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" />
                    Stage 3 — Construction Contract & Operating Model
                  </h2>
                  <p className="mt-1 text-xs text-text-secondary">
                    Select how the General Contractor will bill and how project disbursements are banked.
                  </p>
                </div>

                {/* Contract Model - 2 Column Clean SaaS Grid */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2.5">
                    General Contractor Contract Model
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        value: "COST_PLUS",
                        badge: "Popular",
                        title: "Cost-Plus with Fee Cap",
                        desc: "Verified trade costs + capped GC markup fee.",
                      },
                      {
                        value: "GMP",
                        badge: "AIA G702",
                        title: "Guaranteed Maximum Price",
                        desc: "Capped total price; bills against itemized SOV.",
                      },
                      {
                        value: "FIXED_PRICE",
                        badge: "Lump Sum",
                        title: "Fixed Price",
                        desc: "Disbursements tied strictly to % completion.",
                      },
                      {
                        value: "MILESTONE_BASED",
                        badge: "Staged",
                        title: "Milestone-Based",
                        desc: "Funded upon certified physical milestones.",
                      },
                      {
                        value: "OPEN_BOOK",
                        badge: "Direct Cost",
                        title: "Open-Book Transparency",
                        desc: "100% itemized invoices, payroll & receipts.",
                      },
                      {
                        value: "HYBRID",
                        badge: "Custom",
                        title: "Hybrid / Split Scopes",
                        desc: "Combine fixed & open-book scopes on one job.",
                      },
                    ].map((m) => {
                      const isSelected = contractModel === m.value;
                      return (
                        <div
                          key={m.value}
                          onClick={() => setContractModel(m.value as ContractModel)}
                          className={`group cursor-pointer rounded-xl border p-4 transition-all ${
                            isSelected
                              ? "border-primary bg-primary-subtle/15 ring-1 ring-primary shadow-xs"
                              : "border-border bg-surface hover:border-text-muted/40 hover:bg-subtle/50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-sm text-text-primary">
                              {m.title}
                            </span>
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                isSelected
                                  ? "bg-primary text-white"
                                  : "bg-subtle text-text-muted group-hover:text-text-secondary"
                              }`}
                            >
                              {m.badge}
                            </span>
                          </div>
                          <p className="mt-1.5 text-xs text-text-secondary leading-normal">
                            {m.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Smart Inline Specification for Hybrid Model */}
                  {contractModel === "HYBRID" && (
                    <div className="mt-3 rounded-xl border border-primary-subtle bg-primary-subtle/10 p-3.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1">
                        Define Hybrid Scope Allocation *
                      </label>
                      <Input
                        type="text"
                        autoFocus
                        value={hybridCustomDetails}
                        onChange={(e) => setHybridCustomDetails(e.target.value)}
                        placeholder="e.g. Sitework & Foundation: Cost-Plus; Framing & Finishes: Fixed Lump Sum"
                        className="bg-surface"
                      />
                    </div>
                  )}
                </div>

                {/* Operating Account Model - Clean 2-Card Segment */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2.5">
                    Operating Bank Account Model
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        val: "DEDICATED",
                        badge: "Recommended",
                        title: "Dedicated Account",
                        desc: "Single entity LLC account with 1:1 transaction matching.",
                      },
                      {
                        val: "SHARED",
                        badge: "Transfer Controls",
                        title: "Shared / Commingled",
                        desc: "Master account requiring strict inter-project transfer rules.",
                      },
                    ].map((opt) => {
                      const isSelected = operatingAccountModel === opt.val;
                      return (
                        <div
                          key={opt.val}
                          onClick={() => setOperatingAccountModel(opt.val as any)}
                          className={`group cursor-pointer rounded-xl border p-4 transition-all ${
                            isSelected
                              ? "border-primary bg-primary-subtle/15 ring-1 ring-primary shadow-xs"
                              : "border-border bg-surface hover:border-text-muted/40 hover:bg-subtle/50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-sm text-text-primary">
                              {opt.title}
                            </span>
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                isSelected
                                  ? "bg-primary text-white"
                                  : "bg-subtle text-text-muted group-hover:text-text-secondary"
                              }`}
                            >
                              {opt.badge}
                            </span>
                          </div>
                          <p className="mt-1.5 text-xs text-text-secondary leading-normal">
                            {opt.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 flex justify-between border-t border-border">
                  <Button type="button" variant="tertiary" onClick={() => setStage(2)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button type="button" variant="primary" onClick={() => setStage(4)}>
                    Next: Team Delegation <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Stage 4: Team, Parties & Delegation */}
            {stage === 4 && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Stage 4 — Team, Parties & Role Delegation
                </h2>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Enter participant emails to dispatch scoped invitations. Delegated roles will receive
                  adaptive questions configured specifically for their project responsibilities.
                </p>

                <div className="space-y-4">
                  <div className="rounded-lg border border-border p-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary block mb-1">
                      CFO / Accounting Lead
                    </span>
                    <Input
                      type="email"
                      value={cfoEmail}
                      onChange={(e) => setCfoEmail(e.target.value)}
                      placeholder="cfo@developmentpartners.com"
                    />
                    <span className="text-[11px] text-text-muted mt-1 block">
                      Unlocks: Bank mapping, budget baseline lock, cleared deposit reconciliation.
                    </span>
                  </div>

                  <div className="rounded-lg border border-border p-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary block mb-1">
                      Project Manager (PM)
                    </span>
                    <Input
                      type="email"
                      value={pmEmail}
                      onChange={(e) => setPmEmail(e.target.value)}
                      placeholder="pm@fieldbuilders.com"
                    />
                    <span className="text-[11px] text-text-muted mt-1 block">
                      Unlocks: Milestone Gantt schedule, permit tracking, draw inspection sign-off.
                    </span>
                  </div>

                  <div className="rounded-lg border border-border p-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary block mb-1">
                      General Contractor (GC)
                    </span>
                    <Input
                      type="email"
                      value={gcEmail}
                      onChange={(e) => setGcEmail(e.target.value)}
                      placeholder="lead@generalcontractor.com"
                    />
                    <span className="text-[11px] text-text-muted mt-1 block">
                      Unlocks: Monthly payment application (AIA G702/G703) submissions & lien waivers.
                    </span>
                  </div>
                </div>

                <div className="pt-4 flex justify-between border-t border-border">
                  <Button type="button" variant="tertiary" onClick={() => setStage(3)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button type="button" variant="primary" onClick={() => setStage(5)}>
                    Next: Source Documents <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Stage 5: Source Documents */}
            {stage === 5 && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-primary" />
                  Stage 5 — Living Source-Document Checklist
                </h2>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Based on your configuration, GroundUp has assembled the following document checklist.
                  Items marked missing can be uploaded after launch via the Document Inbox.
                </p>

                <div className="space-y-2.5">
                  {[
                    {
                      doc: "Executed Deed / Acquisition Settlement Statement",
                      gate: "Acquisition Verification",
                      status: isAcquired === "true" ? "Required for Title Gate" : "Pending Diligence",
                    },
                    {
                      doc: "General Contractor Executed Agreement & SOV",
                      gate: "Budget Lock Gate",
                      status: "Required before First Draw",
                    },
                    {
                      doc: "Construction Loan Term Sheet / Loan Agreement",
                      gate: "Submission-Ready Draw Gate",
                      status: hasConstructionLoan === "true" ? "Required" : "N/A All-Equity",
                    },
                    {
                      doc: "Municipal Building Permit Set",
                      gate: "Permit Gate",
                      status: "Assigned to PM",
                    },
                  ].map((row, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border border-border p-3.5 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-text-primary block">{row.doc}</span>
                        <span className="text-text-muted mt-0.5 block">Gate: {row.gate}</span>
                      </div>
                      <span className="rounded bg-subtle px-2.5 py-1 font-medium text-text-secondary">
                        {row.status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex justify-between border-t border-border">
                  <Button type="button" variant="tertiary" onClick={() => setStage(4)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button type="button" variant="primary" onClick={() => setStage(6)}>
                    Next: Review & Launch <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Stage 6: Review & Confirmation */}
            {stage === 6 && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-success" />
                  Stage 6 — Review Project Bootstrap & Confirm
                </h2>

                <div className="rounded-lg border border-border-subtle bg-subtle p-4 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-text-muted block">Project Name:</span>
                      <span className="font-bold text-text-primary">{name}</span>
                    </div>
                    <div>
                      <span className="text-text-muted block">Legal Entity:</span>
                      <span className="font-bold text-text-primary">{projectEntity}</span>
                    </div>
                    <div>
                      <span className="text-text-muted block">Address:</span>
                      <span className="font-medium text-text-secondary">{address}</span>
                    </div>
                    <div>
                      <span className="text-text-muted block">Contract Model:</span>
                      <span className="font-bold text-primary">{contractModel}</span>
                    </div>
                    <div>
                      <span className="text-text-muted block">Operating Account:</span>
                      <span className="font-medium text-text-primary">{operatingAccountModel}</span>
                    </div>
                    <div>
                      <span className="text-text-muted block">Initial Status:</span>
                      <span className="font-bold text-warning">SETUP_INCOMPLETE</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-primary-subtle bg-primary-subtle/10 p-4 text-xs text-text-secondary space-y-1">
                  <p className="font-bold text-text-primary">What happens when you launch:</p>
                  <p>• Project workspace will be generated in <code>SETUP_INCOMPLETE</code> status.</p>
                  <p>• Initial onboarding tasks will be dispatched to CFO and PM.</p>
                  <p>• You will be routed to the Project Readiness Hub to monitor gate unlock states.</p>
                </div>

                <div className="pt-4 flex justify-between border-t border-border">
                  <Button type="button" variant="tertiary" onClick={() => setStage(5)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={() => createMutation.mutate()}
                    loading={createMutation.isPending}
                  >
                    <FolderPlus className="mr-2 h-4 w-4" /> Launch Project Workspace
                  </Button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Duplicate Check Warning Modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-w-lg w-full rounded-xl border border-border bg-surface p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <CopyCheck className="h-6 w-6 text-warning shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-text-primary">
                  Potential Duplicate Project Found
                </h3>
                <p className="mt-1 text-xs text-text-secondary">
                  One or more existing projects match this legal entity or address.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
              {duplicateMatches.map((m) => (
                <div key={m.id} className="rounded-lg border border-border p-3 text-xs bg-subtle">
                  <div className="font-semibold text-text-primary">{m.name}</div>
                  <div className="text-text-muted">{m.address}</div>
                  <div className="text-warning mt-1 font-medium">{m.similarity_reason}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
              <Button
                variant="tertiary"
                onClick={() => {
                  setShowDuplicateModal(false);
                }}
              >
                Edit Information
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowDuplicateModal(false);
                  setStage(2);
                }}
              >
                Proceed Anyway
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
