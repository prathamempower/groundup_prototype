"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
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
  Landmark,
  Users,
  FileCheck,
  CopyCheck,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CreateProjectPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isFirstRun =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("firstRun") === "1"
      : false;

  // Stages 0 to 6
  const [stage, setStage] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6>(0);
  const [stage1Step, setStage1Step] = useState<1 | 2 | 3>(1);
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
  const [contractModel, setContractModel] = useState<ContractModel>("FIXED");
  const [hybridCustomDetails, setHybridCustomDetails] = useState("");
  const [operatingAccountModel, setOperatingAccountModel] = useState<"DEDICATED" | "SHARED">("DEDICATED");

  // Stage 4 (Delegation Invites)
  const [cfoEmail, setCfoEmail] = useState("");
  const [pmEmail, setPmEmail] = useState("");
  const [gcEmail, setGcEmail] = useState("");

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
      router.push(`/projects/${res.data.id}/control-center`);
    },
    onError: (err: Error) => {
      setErrorMessage(err.message || "Failed to create project.");
    },
  });

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
    <div className="min-h-screen bg-[#F2F4F7] flex flex-col justify-center items-center py-8 sm:py-12 px-4 sm:px-6 font-sans">
      {/* Light Untitled-UI Style Elevated Modal Container */}
      <div className="w-full max-w-5xl rounded-[32px] bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)] border border-slate-200/80 overflow-hidden flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
          
          {/* Left Sidebar / Rail */}
          <aside className="lg:col-span-4 bg-[#F8FAFC] border-b lg:border-b-0 lg:border-r border-slate-200/80 p-8 flex flex-col justify-between">
            <div className="space-y-8">
              {/* Brand Header */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
                  <Building2 className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold tracking-tight text-slate-900">
                  GroundUp
                </span>
              </div>

              {/* Progress Steps */}
              <div className="pt-1">
                <nav className="space-y-1.5">
                  {stagesList.map((s) => {
                    const isActive = stage === s.num;
                    const isCompleted = stage > s.num;

                    return (
                      <button
                        key={s.num}
                        type="button"
                        onClick={() => s.num <= stage && setStage(s.num as any)}
                        disabled={s.num > stage}
                        className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                          isActive
                            ? "bg-white text-slate-900 font-bold shadow-xs border border-slate-200"
                            : isCompleted
                            ? "text-slate-800 hover:bg-slate-200/60 font-semibold cursor-pointer"
                            : "text-slate-600 hover:text-slate-900 cursor-not-allowed font-medium"
                        }`}
                      >
                        <div
                          className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                            isActive
                              ? "bg-slate-900 text-white shadow-xs"
                              : isCompleted
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {isCompleted ? <Check className="h-3 w-3 stroke-[3]" /> : s.num + 1}
                        </div>
                        <span className={`truncate text-xs ${isActive ? "text-slate-900 font-bold" : isCompleted ? "text-slate-800 font-semibold" : "text-slate-600"}`}>
                          {s.title}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-200/80 flex items-center justify-between">
              <button
                type="button"
                onClick={() => router.push("/projects")}
                className="text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors cursor-pointer py-1.5 px-3 rounded-lg hover:bg-slate-200/60"
              >
                Exit
              </button>
            </div>
          </aside>

          {/* Right Main Content Area */}
          <main className="lg:col-span-8 p-8 sm:p-12 flex flex-col justify-between bg-white">
            <div>
              {/* Centered / Header Icon Badge */}
              <div className="mb-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm ring-4 ring-slate-100">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>

              {errorMessage && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700 flex items-center gap-2.5 shadow-2xs">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Stage 0: Welcome & Choices */}
              {stage === 0 && (
                <div className="space-y-6">
                  <div>
                    <h2
                      onClick={() => setStage(1)}
                      className="text-2xl font-bold tracking-tight text-slate-900 cursor-pointer"
                    >
                      Create a New Project
                    </h2>
                    <p className="mt-1.5 text-sm text-slate-600">
                      Choose how you want to provision this project workspace.
                    </p>
                  </div>

                  <div className="max-w-md pt-1">
                    {/* Primary Option: Create New */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setStage(1)}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setStage(1)}
                      className="cursor-pointer rounded-xl border-2 border-slate-900 bg-slate-50/60 p-6 transition-all shadow-xs hover:shadow-md hover:border-blue-600 group flex flex-col justify-between min-h-[190px]"
                    >
                      <div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white mb-4 shadow-xs group-hover:scale-105 group-hover:bg-blue-600 transition-all">
                          <FolderPlus className="h-5 w-5" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm">Guided Setup</h3>
                        <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                          Step-by-step setup for entity, capital structure, and governance.
                        </p>
                      </div>
                      <div className="mt-5 inline-flex items-center text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        Begin Setup <ArrowRight className="ml-1 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stage 1: Identity & Structure */}
              {stage === 1 && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold tracking-tight text-slate-900">
                        {stage1Step === 1 && "Project Identity & Legal Entity"}
                        {stage1Step === 2 && "Property Location"}
                        {stage1Step === 3 && "Asset Classification & Schedule"}
                      </h2>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                        Step {stage1Step} of 3
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {stage1Step === 1 && "Name the project and specify its designated legal entity."}
                      {stage1Step === 2 && "Enter the municipal site address for zoning and tax tracking."}
                      {stage1Step === 3 && "Select asset archetype, lifecycle state, and target dates."}
                    </p>
                  </div>

                  <div className="space-y-4 pt-1">
                    {/* Sub-step 1: Project Name & Legal Entity */}
                    {stage1Step === 1 && (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Project Display Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            autoFocus
                            value={name}
                            onChange={(e) => {
                              setName(e.target.value);
                              if (!projectEntity) setProjectEntity(`${e.target.value} Partners LLC`);
                            }}
                            placeholder="e.g. 161 Woodlawn Avenue"
                            required
                            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Legal Ownership Entity (LLC / LP) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={projectEntity}
                            onChange={(e) => setProjectEntity(e.target.value)}
                            placeholder="e.g. 161 Woodlawn Partners LLC"
                            required
                            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                          />
                        </div>
                      </>
                    )}

                    {/* Sub-step 2: Street Address */}
                    {stage1Step === 2 && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Street Address & Municipality <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          autoFocus
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="e.g. 161 Woodlawn Ave, Jersey City, NJ"
                          required
                          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                        />
                      </div>
                    )}

                    {/* Sub-step 3: Asset Type, Lifecycle & Dates */}
                    {stage1Step === 3 && (
                      <>
                        {/* Project Asset Type - Small Cards */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-2">
                            Project Asset Type
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {[
                              { value: "MULTIFAMILY", label: "Multifamily", sub: "Residential" },
                              { value: "SINGLE_FAMILY", label: "Single Family", sub: "Ground-Up" },
                              { value: "MIXED_USE", label: "Mixed-Use", sub: "Commercial" },
                              { value: "SUBDIVISION", label: "Subdivision", sub: "Land Dev" },
                            ].map((type) => {
                              const isSelected = projectType === type.value;
                              return (
                                <button
                                  key={type.value}
                                  type="button"
                                  onClick={() => setProjectType(type.value)}
                                  className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                                    isSelected
                                      ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                                      : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50/70"
                                  }`}
                                >
                                  <span className="block text-xs font-bold leading-tight">{type.label}</span>
                                  <span className={`block text-[11px] mt-0.5 ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                                    {type.sub}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Lifecycle Stage - Small Cards */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-2">
                            Lifecycle Stage
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {[
                              { value: "PRE_CONSTRUCTION", label: "Pre-Con", sub: "Permitting" },
                              { value: "CONSTRUCTION", label: "Active", sub: "Construction" },
                              { value: "ACQUISITION", label: "Acquisition", sub: "Diligence" },
                              { value: "COMPLETION", label: "Completion", sub: "Closeout" },
                            ].map((stageItem) => {
                              const isSelected = lifecycleStage === stageItem.value;
                              return (
                                <button
                                  key={stageItem.value}
                                  type="button"
                                  onClick={() => setLifecycleStage(stageItem.value as LifecycleStage)}
                                  className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                                    isSelected
                                      ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                                      : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50/70"
                                  }`}
                                >
                                  <span className="block text-xs font-bold leading-tight">{stageItem.label}</span>
                                  <span className={`block text-[11px] mt-0.5 ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                                    {stageItem.sub}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                              Target Construction Start
                            </label>
                            <input
                              type="date"
                              value={startedAt}
                              onChange={(e) => setStartedAt(e.target.value)}
                              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 shadow-2xs transition-colors hover:border-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                              Target Completion Date
                            </label>
                            <input
                              type="date"
                              value={targetCompletionAt}
                              onChange={(e) => setTargetCompletionAt(e.target.value)}
                              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 shadow-2xs transition-colors hover:border-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="pt-6 flex justify-between border-t border-slate-200">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        if (stage1Step > 1) {
                          setStage1Step((s) => (s - 1) as any);
                        } else {
                          setStage(0);
                        }
                      }}
                      className="rounded-full px-5 py-2.5 text-xs font-semibold"
                    >
                      <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
                    </Button>

                    {stage1Step < 3 ? (
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => {
                          if (stage1Step === 1 && !name.trim()) {
                            setErrorMessage("Please enter a project name to continue.");
                            return;
                          }
                          if (stage1Step === 2 && !address.trim()) {
                            setErrorMessage("Please enter the property street address.");
                            return;
                          }
                          setErrorMessage("");
                          setStage1Step((s) => (s + 1) as any);
                        }}
                        className="rounded-full px-6 py-2.5 text-xs font-semibold shadow-sm"
                      >
                        Next Step <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="primary"
                        loading={duplicateCheckMutation.isPending}
                        onClick={() => {
                          if (!name.trim() || !address.trim()) {
                            setErrorMessage("Please complete the required project name and address.");
                            return;
                          }
                          setErrorMessage("");
                          duplicateCheckMutation.mutate();
                        }}
                        className="rounded-full px-6 py-2.5 text-xs font-semibold shadow-sm"
                      >
                        Next: Capital & Debt <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Stage 2: Acquisition, Capital & Debt */}
              {stage === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                      <Landmark className="h-5 w-5 text-blue-600" />
                      Acquisition & Debt Structure
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Specify property acquisition status and active construction financing.
                    </p>
                  </div>

                  <div className="space-y-5 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        Has Property Been Formally Acquired?
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { val: "true", label: "Yes, Title / Deed Closed", desc: "Settlement statement recorded." },
                          { val: "false", label: "No, Under Diligence", desc: "Contract pending closing." },
                        ].map((opt) => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => setIsAcquired(opt.val as any)}
                            className={`rounded-xl border p-4 text-left transition-all ${
                              isAcquired === opt.val
                                ? "border-blue-600 bg-blue-50/50 text-slate-900 ring-2 ring-blue-600/20 shadow-xs"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                            }`}
                          >
                            <span className="block text-sm font-semibold text-slate-900">{opt.label}</span>
                            <span className="mt-0.5 block text-xs text-slate-500">{opt.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        Acquisition Funding Source
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {[
                          { value: "CASH_EQUITY", label: "Cash Equity", sub: "Sponsor Equity" },
                          { value: "ACQUISITION_LOAN", label: "Bridge Loan", sub: "Senior Debt" },
                          { value: "SELLER_FINANCING", label: "Seller Note", sub: "Carryback" },
                          { value: "OTHER", label: "Other", sub: "Custom Note" },
                        ].map((item) => {
                          const isSelected = acquisitionFunding === item.value;
                          return (
                            <button
                              key={item.value}
                              type="button"
                              onClick={() => setAcquisitionFunding(item.value)}
                              className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                                isSelected
                                  ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                                  : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50/70"
                              }`}
                            >
                              <span className="block text-xs font-bold leading-tight">{item.label}</span>
                              <span className={`block text-[11px] mt-0.5 ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                                {item.sub}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {acquisitionFunding === "OTHER" && (
                        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Specify Custom Funding Structure *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Mezzanine note, PACE equity, or land contribution"
                            value={lenderName}
                            onChange={(e) => setLenderName(e.target.value)}
                            required
                            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 shadow-2xs focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        Active or Planned Construction Loan?
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { val: "true", label: "Construction Loan in Place", desc: "Disbursements routed via draw inspections." },
                          { val: "false", label: "All-Equity Self-Funded", desc: "Funded directly from sponsor / equity accounts." },
                        ].map((opt) => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => setHasConstructionLoan(opt.val as any)}
                            className={`rounded-xl border p-4 text-left transition-all ${
                              hasConstructionLoan === opt.val
                                ? "border-blue-600 bg-blue-50/50 text-slate-900 ring-2 ring-blue-600/20 shadow-xs"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                            }`}
                          >
                            <span className="block text-sm font-semibold text-slate-900">{opt.label}</span>
                            <span className="mt-0.5 block text-xs text-slate-500">{opt.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {hasConstructionLoan === "true" && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Primary Construction Lender Name (Optional)
                        </label>
                        <input
                          type="text"
                          value={lenderName}
                          onChange={(e) => setLenderName(e.target.value)}
                          placeholder="e.g. Pacific Western Bank"
                          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                        />
                      </div>
                    )}
                  </div>

                  <div className="pt-6 flex justify-between border-t border-slate-200">
                    <Button type="button" variant="secondary" onClick={() => setStage(1)} className="rounded-full px-5 py-2.5 text-xs font-semibold">
                      <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
                    </Button>
                    <Button type="button" variant="primary" onClick={() => setStage(3)} className="rounded-full px-6 py-2.5 text-xs font-semibold shadow-sm">
                      Next: Contract & Governance <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Stage 3: Construction & Operating Model */}
              {stage === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                      <Layers className="h-5 w-5 text-blue-600" />
                      Contract & Operating Model
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Select how the General Contractor will bill and how project disbursements are banked.
                    </p>
                  </div>

                  {/* Contract Model - 2 Column Clean SaaS Grid */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      General Contractor Contract Model
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        {
                          value: "FIXED",
                          badge: "Lump Sum",
                          title: "Fixed",
                          desc: "Predetermined contract amount; disbursements tied to completion milestones and draw inspections.",
                        },
                        {
                          value: "DAILY",
                          badge: "Day Rate",
                          title: "Daily",
                          desc: "Contractor compensation billed on daily rates, actual work days, and verified time logs.",
                        },
                      ].map((m) => {
                        const isSelected = contractModel === m.value || (m.value === "FIXED" && contractModel !== "DAILY");
                        return (
                          <div
                            key={m.value}
                            onClick={() => setContractModel(m.value as ContractModel)}
                            className={`group cursor-pointer rounded-xl border p-4 transition-all ${
                              isSelected
                                ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20 shadow-xs"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-sm text-slate-900">
                                {m.title}
                              </span>
                              <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                  isSelected
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {m.badge}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500 leading-normal">
                              {m.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Operating Account Model - Clean 2-Card Segment */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
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
                                ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20 shadow-xs"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-sm text-slate-900">
                                {opt.title}
                              </span>
                              <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                  isSelected
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {opt.badge}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500 leading-normal">
                              {opt.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-6 flex justify-between border-t border-slate-200">
                    <Button type="button" variant="secondary" onClick={() => setStage(2)} className="rounded-full px-5 py-2.5 text-xs font-semibold">
                      <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
                    </Button>
                    <Button type="button" variant="primary" onClick={() => setStage(4)} className="rounded-full px-6 py-2.5 text-xs font-semibold shadow-sm">
                      Next: Team Delegation <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Stage 4: Team, Parties & Delegation */}
              {stage === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      Team & Role Delegation
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Invite principals, co-owners, or development partners to this project.
                    </p>
                  </div>

                  <div className="space-y-3.5 pt-1">
                    <div className="rounded-xl border border-slate-200 p-4.5 bg-white shadow-2xs hover:border-slate-300 transition-colors">
                      <span className="text-xs font-bold text-slate-900 block mb-1">
                        Co-Owner / Principal Developer
                      </span>
                      <input
                        type="email"
                        value={cfoEmail}
                        onChange={(e) => setCfoEmail(e.target.value)}
                        placeholder="partner@developmentpartners.com"
                        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                      />
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4.5 bg-white shadow-2xs hover:border-slate-300 transition-colors">
                      <span className="text-xs font-bold text-slate-900 block mb-1">
                        Executive Partner / Co-Sponsor
                      </span>
                      <input
                        type="email"
                        value={pmEmail}
                        onChange={(e) => setPmEmail(e.target.value)}
                        placeholder="sponsor@fieldbuilders.com"
                        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                      />
                    </div>
                  </div>

                  <div className="pt-6 flex justify-between border-t border-slate-200">
                    <Button type="button" variant="secondary" onClick={() => setStage(3)} className="rounded-full px-5 py-2.5 text-xs font-semibold">
                      <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
                    </Button>
                    <Button type="button" variant="primary" onClick={() => setStage(5)} className="rounded-full px-6 py-2.5 text-xs font-semibold shadow-sm">
                      Next: Source Documents <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Stage 5: Source Documents */}
              {stage === 5 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                      <FileCheck className="h-5 w-5 text-blue-600" />
                      Source Documents Checklist
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Assembled source document requirements based on your project configuration.
                    </p>
                  </div>

                  <div className="space-y-3 pt-1">
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
                        doc: "Construction Loan Agreement",
                        gate: "Draw Gate",
                        status: hasConstructionLoan === "true" ? "Required" : "N/A All-Equity",
                      },
                      {
                        doc: "Municipal Building Permit Set",
                        gate: "Permit Gate",
                        status: "Pending Municipal Review",
                      },
                    ].map((row, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-xs shadow-2xs hover:border-slate-300 transition-colors"
                      >
                        <div>
                          <span className="font-semibold text-slate-900 block">{row.doc}</span>
                          <span className="text-slate-500 text-[11px] mt-0.5 block">Gate: {row.gate}</span>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700">
                          {row.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 flex justify-between border-t border-slate-200">
                    <Button type="button" variant="secondary" onClick={() => setStage(4)} className="rounded-full px-5 py-2.5 text-xs font-semibold">
                      <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
                    </Button>
                    <Button type="button" variant="primary" onClick={() => setStage(6)} className="rounded-full px-6 py-2.5 text-xs font-semibold shadow-sm">
                      Next: Review & Launch <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Stage 6: Review & Confirmation */}
              {stage === 6 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-emerald-600" />
                      Review & Confirm Setup
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Verify configuration values before provisioning the project workspace.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-4 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Project Name:</span>
                        <span className="font-bold text-slate-900 text-sm mt-0.5 block">{name || "—"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Legal Entity:</span>
                        <span className="font-semibold text-slate-900 mt-0.5 block">{projectEntity || "—"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Address:</span>
                        <span className="text-slate-700 mt-0.5 block">{address || "—"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Contract Model:</span>
                        <span className="font-semibold text-blue-600 mt-0.5 block">{contractModel === "DAILY" ? "Daily" : "Fixed"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Operating Account:</span>
                        <span className="font-medium text-slate-900 mt-0.5 block">{operatingAccountModel}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Initial Status:</span>
                        <span className="font-semibold text-amber-700 mt-0.5 block">Setup Incomplete</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-5 text-xs text-slate-600 space-y-2 shadow-2xs">
                    <p className="font-bold text-slate-900">What happens when you launch:</p>
                    <div className="space-y-1.5 text-slate-500">
                      <p className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        Project workspace will be generated in <code>SETUP_INCOMPLETE</code> status.
                      </p>
                      <p className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        Initial verification checklist will be configured for your review.
                      </p>
                      <p className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        You will be routed to the Project Readiness Hub to monitor gate unlock states.
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-between border-t border-slate-200 mt-auto">
                    <Button type="button" variant="secondary" onClick={() => setStage(5)} className="rounded-full px-5 py-2.5 text-xs font-semibold">
                      <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => createMutation.mutate()}
                      loading={createMutation.isPending}
                      className="rounded-full bg-slate-900 hover:bg-slate-800 text-white px-7 py-2.5 text-xs font-semibold shadow-md shadow-slate-950/20"
                    >
                      <FolderPlus className="mr-1.5 h-4 w-4" /> Launch Project Workspace
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Duplicate Check Warning Modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="max-w-lg w-full rounded-xl border border-slate-200 bg-white p-6 shadow-overlay">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
                <CopyCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Potential Duplicate Project Found
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  One or more existing projects match this legal entity or address.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5 max-h-48 overflow-y-auto">
              {duplicateMatches.map((m) => (
                <div key={m.id} className="rounded-xl border border-slate-200 p-3 text-xs bg-slate-50">
                  <div className="font-semibold text-slate-900">{m.name}</div>
                  <div className="text-slate-500">{m.address}</div>
                  <div className="text-amber-700 mt-1 font-medium">{m.similarity_reason}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <Button
                variant="tertiary"
                onClick={() => {
                  setShowDuplicateModal(false);
                }}
                className="rounded-full px-5 py-2 text-xs font-semibold"
              >
                Edit Information
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowDuplicateModal(false);
                  setStage(2);
                }}
                className="rounded-full px-6 py-2 text-xs font-semibold"
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
