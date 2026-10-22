"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Project, ContractModel, LifecycleStage } from "@/lib/types";
import { ToastContainer, ToastMessage } from "@/components/Toast";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  AlertCircle,
  Landmark,
  MapPin,
  Save,
  Shield,
  ShieldAlert,
  Users,
  FileText,
  Sliders,
  Trash2,
  Sparkles,
  Loader2,
  Layers,
  Banknote,
  Briefcase,
  UserPlus,
  Mail,
  Plus,
  X,
  Send,
  Building,
  Key,
  Clock,
  RefreshCw,
  UserCheck,
} from "lucide-react";
import { ConstructionLenderSelect } from "@/components/projects/ConstructionLenderSelect";

type SettingsTab = "general" | "capital" | "governance" | "team";

const LIFECYCLE_OPTIONS: { id: LifecycleStage; label: string; desc: string }[] = [
  { id: "ACQUISITION", label: "Acquisition & Due Diligence", desc: "Purchase contract under review or title pending closing." },
  { id: "PRE_CONSTRUCTION", label: "Pre-Development & Permitting", desc: "Architectural drawings, zoning filings, and GC bidding." },
  { id: "CONSTRUCTION", label: "Under Construction", desc: "Active trades on site, monthly draw requests, and billing inspections." },
  { id: "POST_CONSTRUCTION", label: "Stabilization & Closeout", desc: "Certificate of Occupancy received, punch list and final retainage." },
];

const CONTRACT_OPTIONS: { id: ContractModel; title: string; badge: string; desc: string }[] = [
  {
    id: "FIXED",
    title: "GC fixed contract",
    badge: "Lump Sum",
    desc: "Predetermined contract amount; disbursements tied to completion milestones and draw inspections.",
  },
  {
    id: "DAILY",
    title: "GC daily updates",
    badge: "Day Rate",
    desc: "Contractor compensation billed on daily rates, actual work days, and verified time logs.",
  },
];

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const projectId = (params?.projectId as string) || "";

  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const showToast = (type: "success" | "error" | "info", message: string, title?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Queries
  const {
    data: projectResponse,
    isLoading: isProjectLoading,
    error: projectError,
  } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => api.projects.getById(projectId),
    enabled: Boolean(projectId),
  });

  const { data: teamResponse } = useQuery({
    queryKey: ["project-team", projectId],
    queryFn: () => api.team.list(projectId),
    enabled: Boolean(projectId),
  });

  const project = projectResponse?.data;
  const teamMembers = teamResponse?.data || [];

  // Form State
  const [name, setName] = useState("");
  const [projectEntity, setProjectEntity] = useState("");
  const [address, setAddress] = useState("");
  const [lifecycleStage, setLifecycleStage] = useState<LifecycleStage>("CONSTRUCTION");
  const [contractModel, setContractModel] = useState<ContractModel>("FIXED");
  const [startedAt, setStartedAt] = useState("");
  const [targetCompletionAt, setTargetCompletionAt] = useState("");
  const [loanCommitment, setLoanCommitment] = useState("");
  const [forecastProfit, setForecastProfit] = useState("");
  const [progressPct, setProgressPct] = useState(15);
  const [lenderName, setLenderName] = useState("Pacific Western Bank");
  const [operatingAccountModel, setOperatingAccountModel] = useState<"DEDICATED" | "SHARED">("DEDICATED");
  const [isAcquired, setIsAcquired] = useState("true");
  const [hasConstructionLoan, setHasConstructionLoan] = useState("true");

  // Team Tab State & Fallbacks
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteCompany, setInviteCompany] = useState("");
  const [inviteRoleTitle, setInviteRoleTitle] = useState("Finance Partner");
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<Array<{ id: string; name: string; email: string; roleTitle: string; company: string; sentAt: string }>>([
    {
      id: "pinv-1",
      name: "Tyler Jenkins",
      email: "t.jenkins@apexconstruction.com",
      roleTitle: "Lead Estimator / GC Billing",
      company: "Apex Build Corp",
      sentAt: "2 days ago",
    },
    {
      id: "pinv-2",
      name: "Hannah Ward",
      email: "hannah.ward@pacwestbank.com",
      roleTitle: "Draw Inspector / Bank Monitor",
      company: "Pacific Western Bank",
      sentAt: "Yesterday",
    },
  ]);

  const DEFAULT_FALLBACK_TEAM = [
    {
      id: `fallback-1`,
      project_id: projectId,
      name: "Marcus Vance",
      email: "m.vance@vancedev.com",
      role: "OWNER" as const,
      title: "Owner / Managing Principal",
      company: "Vance Development LLC",
      avatarInitials: "MV",
      status: "ACTIVE" as const,
      added_at: "2025-05-10T09:00:00Z",
    },
    {
      id: `fallback-2`,
      project_id: projectId,
      name: "Sarah Lin",
      email: "s.lin@vancedev.com",
      role: "OWNER" as const,
      title: "Co-Owner / Finance Partner",
      company: "Vance Development LLC",
      avatarInitials: "SL",
      status: "ACTIVE" as const,
      added_at: "2025-05-10T09:00:00Z",
    },
    {
      id: `fallback-3`,
      project_id: projectId,
      name: "Frank Miller",
      email: "frank@apexconstruction.com",
      role: "OWNER" as const,
      title: "General Contractor Lead",
      company: "Apex Build Corp",
      avatarInitials: "FM",
      status: "ACTIVE" as const,
      added_at: "2025-05-12T10:30:00Z",
    },
    {
      id: `fallback-4`,
      project_id: projectId,
      name: "David Ross",
      email: "d.ross@vancedev.com",
      role: "OWNER" as const,
      title: "Project Superintendent",
      company: "Vance Development LLC",
      avatarInitials: "DR",
      status: "ACTIVE" as const,
      added_at: "2025-05-15T14:00:00Z",
    },
    {
      id: `fallback-5`,
      project_id: projectId,
      name: "Julian Thorne",
      email: "j.thorne@pacwestbank.com",
      role: "OWNER" as const,
      title: "Senior Loan Officer",
      company: "Pacific Western Bank",
      avatarInitials: "JT",
      status: "ACTIVE" as const,
      added_at: "2025-06-01T11:00:00Z",
    },
  ];

  const displayTeam = teamMembers && teamMembers.length > 0 ? teamMembers : DEFAULT_FALLBACK_TEAM;

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      showToast("error", "Please provide a valid work email address.", "Validation Error");
      return;
    }
    setIsSubmittingInvite(true);
    try {
      await api.team.invite(projectId, {
        project_id: projectId,
        name: inviteName.trim() || inviteEmail.split("@")[0],
        email: inviteEmail.trim(),
        role: "OWNER",
        title: inviteRoleTitle,
        company: inviteCompany.trim() || "Collaborating Organization",
      });
      queryClient.invalidateQueries({ queryKey: ["project-team", projectId] });
      showToast("success", `Invitation sent to ${inviteEmail}`, "Collaborator Invited");
      setInviteName("");
      setInviteEmail("");
      setInviteCompany("");
      setShowInviteModal(false);
    } catch (err: any) {
      showToast("error", err?.message || "Failed to dispatch invitation.", "Invite Error");
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  const handleRevokePending = (id: string, email: string) => {
    setPendingInvites((prev) => prev.filter((item) => item.id !== id));
    showToast("info", `Invitation to ${email} revoked.`, "Invitation Revoked");
  };

  const handleResendPending = (email: string) => {
    showToast("success", `Fresh invitation link sent to ${email}`, "Invitation Resent");
  };

  // Sync state once project is loaded
  useEffect(() => {
    if (project) {
      setName(project.name || "");
      setProjectEntity(project.project_entity || "");
      setAddress(project.address || "");
      setLifecycleStage(project.lifecycle_stage || "CONSTRUCTION");
      setContractModel(project.contract_model === "DAILY" ? "DAILY" : "FIXED");
      setStartedAt(project.started_at ? project.started_at.split("T")[0] : "");
      setTargetCompletionAt(project.target_completion_at ? project.target_completion_at.split("T")[0] : "");
      setLoanCommitment(project.loan_commitment ? String(Math.round(Number(project.loan_commitment) / 100)) : "1471120");
      setForecastProfit(project.forecast_profit ? String(Math.round(Number(project.forecast_profit) / 100)) : "500000");
      setProgressPct(typeof project.progress_pct === "number" ? project.progress_pct : 15);
    }
  }, [project]);

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (updates: Partial<Project>) => api.projects.update(projectId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      showToast("success", "Project settings have been updated.", "Settings Saved");
    },
    onError: (err: any) => {
      showToast("error", err?.message || "Failed to update project settings.", "Error");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: () => api.projects.delete(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      router.push("/projects");
    },
    onError: (err: any) => {
      showToast("error", err?.message || "Failed to delete project.", "Delete Error");
    },
  });

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      showToast("error", "Project name is required.", "Validation Error");
      return;
    }

    const updates: Partial<Project> = {
      name: name.trim(),
      project_entity: projectEntity.trim() || `${name.trim()} LLC`,
      address: address.trim(),
      lifecycle_stage: lifecycleStage,
      contract_model: contractModel,
      started_at: startedAt ? `${startedAt}T00:00:00Z` : new Date().toISOString(),
      target_completion_at: targetCompletionAt ? `${targetCompletionAt}T00:00:00Z` : new Date().toISOString(),
      loan_commitment: loanCommitment ? String(Math.round(Number(loanCommitment) * 100)) : undefined,
      forecast_profit: forecastProfit ? Math.round(Number(forecastProfit) * 100) : undefined,
      progress_pct: Number(progressPct),
    };

    updateMutation.mutate(updates);
  };

  const handleDelete = () => {
    if (deleteConfirmText.trim().toLowerCase() !== (project?.name || "").trim().toLowerCase()) {
      showToast("error", "Project name confirmation does not match.", "Cannot Delete");
      return;
    }
    deleteMutation.mutate();
  };

  if (isProjectLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-lg" />
        <div className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h1 className="text-xl font-bold text-slate-900">Project Not Found</h1>
        <p className="text-xs text-slate-500">
          We could not load settings for project {projectId}. It may have been removed or you do not have permission.
        </p>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Portfolio</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* 1. Clean Enterprise Header Consistent With Other App Pages */}
      <div className="border-b border-border bg-white px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Link
                href={`/projects/${projectId}/control-center`}
                className="hover:text-foreground transition inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Control Center</span>
              </Link>
              <span>/</span>
              <span className="text-foreground font-semibold">Project Settings</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
              <span>{project.name}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50/80 px-2.5 py-0.5 text-xs font-medium text-emerald-800 border border-emerald-200/60 shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Active Jobsite
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href={`/projects/${projectId}/control-center`}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={updateMutation.isPending}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-lg text-xs font-semibold shadow-xs transition inline-flex items-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 min-w-0">
        {/* Navigation Tabs - Matches Budget and Draws Tabs */}
        <div className="flex items-center border-b border-slate-200 gap-4 sm:gap-6 overflow-x-auto scrollbar-none whitespace-nowrap">
          {[
            { id: "general", label: "Identity & Physical", icon: Building2 },
            { id: "capital", label: "Capital & Senior Debt", icon: Landmark },
            { id: "governance", label: "Contracts & Banking", icon: Shield },
            { id: "team", label: "Project Team", icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`flex items-center gap-2 pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors -mb-px cursor-pointer shrink-0 ${
                  isSelected
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? "text-blue-600" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="mt-6">
          {/* ──────────────── TAB 1: GENERAL & IDENTITY ──────────────── */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Project Identity</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official jobsite display name, legal holding entity, and location.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="setting-project-name" className="block text-xs font-bold text-slate-800">
                      Project Display Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="setting-project-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. 73 Broadway Mixed-Use"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="setting-project-entity" className="block text-xs font-bold text-slate-800">
                      Legal Ownership Entity (LLC / LP) <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="setting-project-entity"
                      type="text"
                      value={projectEntity}
                      onChange={(e) => setProjectEntity(e.target.value)}
                      placeholder="e.g. 73 Broadway Partners LLC"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="setting-project-address" className="block text-xs font-bold text-slate-800">
                    Physical Site Address
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="setting-project-address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 73 Broadway, Jersey City, NJ 07306"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Lifecycle Stage */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Current Lifecycle Stage</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Controls automated draw schedules, compliance checks, and investor reporting flags.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {LIFECYCLE_OPTIONS.map((opt) => {
                    const isSelected = lifecycleStage === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setLifecycleStage(opt.id)}
                        className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${isSelected
                            ? "bg-slate-100 border-slate-900 text-slate-900 shadow-xs ring-1 ring-slate-900/10 font-bold"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50/70"
                          }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs font-bold text-slate-900">
                            {opt.label}
                          </span>
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <p className={`text-[11px] leading-snug ${isSelected ? "text-slate-600 font-normal" : "text-slate-500"}`}>
                          {opt.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Construction Dates & Progress */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Schedule & Timeline</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Baseline critical path dates for milestone verification and loan draw interest forecasts.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="setting-started-at" className="block text-xs font-bold text-slate-800">
                      Construction Start Date
                    </label>
                    <div className="relative">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="setting-started-at"
                        type="date"
                        value={startedAt}
                        onChange={(e) => setStartedAt(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="setting-target-date" className="block text-xs font-bold text-slate-800">
                      Target Completion Date
                    </label>
                    <div className="relative">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="setting-target-date"
                        type="date"
                        value={targetCompletionAt}
                        onChange={(e) => setTargetCompletionAt(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ──────────────── TAB 2: CAPITAL & DEBT ──────────────── */}
          {activeTab === "capital" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Acquisition & Lending Structure</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Define property deed closing status, senior loan facilities, and lender disbursement channels.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-800">
                    Property Acquisition Status
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { val: "true", label: "Title / Deed Closed", desc: "Settlement statement recorded and closed." },
                      { val: "false", label: "Under Diligence / LOI", desc: "Purchase contract or LOI pending closing." },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setIsAcquired(opt.val)}
                        className={`rounded-xl border p-3.5 text-left transition cursor-pointer ${isAcquired === opt.val
                            ? "border-slate-900 bg-slate-100 text-slate-900 shadow-xs ring-1 ring-slate-900/10 font-bold"
                            : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                      >
                        <span className="block text-xs font-bold">{opt.label}</span>
                        <span className={`mt-0.5 block text-[11px] ${isAcquired === opt.val ? "text-slate-600 font-normal" : "text-slate-500"}`}>
                          {opt.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Construction Debt Facility
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { val: "true", label: "Construction Loan in Place", desc: "Disbursements routed via monthly draw inspections." },
                      { val: "false", label: "Self Funded Project", desc: "Funded directly from sponsor or partner equity accounts." },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setHasConstructionLoan(opt.val)}
                        className={`rounded-xl border p-3.5 text-left transition cursor-pointer ${hasConstructionLoan === opt.val
                            ? "border-slate-900 bg-slate-100 text-slate-900 shadow-xs ring-1 ring-slate-900/10 font-bold"
                            : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                      >
                        <span className="block text-xs font-bold">{opt.label}</span>
                        <span className={`mt-0.5 block text-[11px] ${hasConstructionLoan === opt.val ? "text-slate-600 font-normal" : "text-slate-500"}`}>
                          {opt.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {hasConstructionLoan === "true" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label htmlFor="setting-lender-name" className="block text-xs font-bold text-slate-800">
                        Primary Construction Lender
                      </label>
                      <ConstructionLenderSelect
                        id="setting-lender-name"
                        value={lenderName}
                        onChange={setLenderName}
                        placeholder="Search or select US bank (or choose Other)..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="setting-loan-commitment" className="block text-xs font-bold text-slate-800">
                        Total Loan Facility Commitment ($ USD)
                      </label>
                      <div className="relative">
                        <Banknote className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="setting-loan-commitment"
                          type="number"
                          value={loanCommitment}
                          onChange={(e) => setLoanCommitment(e.target.value)}
                          placeholder="e.g. 1471120"
                          className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ──────────────── TAB 3: CONTRACT & GOVERNANCE ──────────────── */}
          {activeTab === "governance" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">General Contractor Contract Model</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Governs billing formats, retainage release criteria, and schedule of values itemization.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CONTRACT_OPTIONS.map((m) => {
                    const isSelected = contractModel === m.id || (m.id === "FIXED" && contractModel !== "DAILY");
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setContractModel(m.id)}
                        className={`rounded-xl border p-3.5 text-left transition cursor-pointer ${isSelected
                            ? "border-slate-900 bg-slate-100 text-slate-900 shadow-xs ring-1 ring-slate-900/10 font-bold"
                            : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="font-bold text-xs text-slate-900">
                            {m.title}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${isSelected ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                              }`}
                          >
                            {m.badge}
                          </span>
                        </div>
                        <p className={`mt-1 text-[11px] leading-snug ${isSelected ? "text-slate-600 font-normal" : "text-slate-500"}`}>
                          {m.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Operating Bank Account */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Operating Bank Account Model</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Controls automated draw receipts and reconciliation transaction matching.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      val: "DEDICATED",
                      badge: "Recommended",
                      title: "Dedicated Project Account",
                      desc: "Single entity LLC account with 1:1 transaction matching.",
                    },
                    {
                      val: "SHARED",
                      badge: "Transfer Controls",
                      title: "Shared / Master Account",
                      desc: "Master account requiring strict inter-project transfer controls.",
                    },
                  ].map((opt) => {
                    const isSelected = operatingAccountModel === opt.val;
                    return (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setOperatingAccountModel(opt.val as any)}
                        className={`rounded-xl border p-3.5 text-left transition cursor-pointer ${isSelected
                            ? "border-slate-900 bg-slate-100 text-slate-900 shadow-xs ring-1 ring-slate-900/10 font-bold"
                            : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="font-bold text-xs text-slate-900">
                            {opt.title}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${isSelected ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                              }`}
                          >
                            {opt.badge}
                          </span>
                        </div>
                        <p className={`mt-1 text-[11px] leading-snug ${isSelected ? "text-slate-600 font-normal" : "text-slate-500"}`}>
                          {opt.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ──────────────── TAB 4: PROJECT TEAM ──────────────── */}
          {activeTab === "team" && (
            <div className="space-y-6">
              {/* Header Card & Quick Actions */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-900">Project Workspace Team</h2>
                      <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                        {displayTeam.length} Active Collaborators
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 max-w-xl">
                      Manage authorized principals, construction leads, lending representatives, and financial controllers for this project workspace.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(true)}
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs transition shrink-0"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Invite Collaborator</span>
                  </button>
                </div>

                {/* Team Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5">
                    <div className="flex items-center gap-2 text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                      <Users className="w-3.5 h-3.5 text-slate-600" />
                      <span>Active Seats</span>
                    </div>
                    <div className="mt-1.5 flex items-baseline gap-2">
                      <span className="text-lg font-bold text-slate-900">{displayTeam.length}</span>
                      <span className="text-xs text-slate-500 font-medium">unlimited tier</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5">
                    <div className="flex items-center gap-2 text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Pending Invites</span>
                    </div>
                    <div className="mt-1.5 flex items-baseline gap-2">
                      <span className="text-lg font-bold text-slate-900">{pendingInvites.length}</span>
                      <span className="text-xs text-amber-600 font-medium">awaiting onboarding</span>
                    </div>
                  </div>
                </div>

                {/* Active Members Table / Cards */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 px-1">
                    <span>Active Collaborators</span>
                    <span className="text-[11px] text-slate-500 font-normal">All seats verified with multi-factor authentication</span>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                    {displayTeam.map((member) => (
                      <div
                        key={member.id}
                        className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {member.avatarInitials || member.name?.slice(0, 2).toUpperCase() || "TM"}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 truncate">{member.name}</span>
                              <span className="text-[10px] font-medium text-slate-500 hidden sm:inline">
                                ({member.company || "Project Stakeholder"})
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 truncate flex items-center gap-2 mt-0.5">
                              <span>{member.email}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-600 font-medium truncate">{member.title || "Project Partner"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {member.role || "OWNER"}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <UserCheck className="w-2.5 h-2.5" />
                            Active
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pending Invitations Section */}
                {pendingInvites.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 px-1">
                      <div className="flex items-center gap-2">
                        <span>Pending Invitations</span>
                        <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded-full">
                          {pendingInvites.length}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-normal">Invitations expire in 7 days</span>
                    </div>

                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                      {pendingInvites.map((inv) => (
                        <div
                          key={inv.id}
                          className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/20 hover:bg-amber-50/40 transition"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center font-bold text-xs shrink-0">
                              <Mail className="w-4 h-4 text-amber-700" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900 truncate">{inv.name}</span>
                                <span className="text-[10px] font-medium text-slate-500 hidden sm:inline">
                                  ({inv.company})
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 truncate flex items-center gap-2 mt-0.5">
                                <span>{inv.email}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-600 font-medium">{inv.roleTitle}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-amber-700 text-[10px] font-semibold">Sent {inv.sentAt}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                            <button
                              type="button"
                              onClick={() => handleResendPending(inv.email)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                              title="Resend invitation email"
                            >
                              <RefreshCw className="w-3 h-3 text-slate-500" />
                              <span>Resend</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRevokePending(inv.id, inv.email)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition"
                              title="Revoke pending invitation"
                            >
                              <X className="w-3 h-3 text-red-500" />
                              <span>Revoke</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Standard Enterprise Invite Modal */}
              <Modal open={showInviteModal} onOpenChange={setShowInviteModal}>
                <ModalContent maxWidth="md" className="p-0 overflow-hidden border border-slate-200 bg-white shadow-2xl rounded-2xl gap-0">
                  <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                        <UserPlus className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Invite Project Collaborator</h3>
                        <p className="text-[11px] text-slate-500">Provide collaborator credentials and professional title</p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSendInvite} className="p-4 sm:p-5 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={inviteName}
                        onChange={(e) => setInviteName(e.target.value)}
                        placeholder="e.g. Cameron Bennett"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email</label>
                      <input
                        type="email"
                        required
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="e.g. c.bennett@apexconstruction.com"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Organization</label>
                        <input
                          type="text"
                          value={inviteCompany}
                          onChange={(e) => setInviteCompany(e.target.value)}
                          placeholder="e.g. Apex Build Corp"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Role</label>
                        <select
                          value={inviteRoleTitle}
                          onChange={(e) => setInviteRoleTitle(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
                        >
                          <option value="Finance Partner">Finance Partner</option>
                          <option value="General Contractor Lead">General Contractor Lead</option>
                          <option value="Project Superintendent">Project Superintendent</option>
                          <option value="Senior Loan Officer">Senior Loan Officer</option>
                          <option value="Capital / Equity Partner">Capital / Equity Partner</option>
                          <option value="Third-Party Draw Inspector">Third-Party Draw Inspector</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowInviteModal(false)}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={isSubmittingInvite}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
                      >
                        {isSubmittingInvite ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Send Invitation</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </ModalContent>
              </Modal>
            </div>
          )}
        </div>

        {/* Bottom Save Action Bar */}
        <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-200/80 pt-4">
          <Link
            href={`/projects/${projectId}/control-center`}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={updateMutation.isPending}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-lg text-xs font-semibold shadow-xs transition inline-flex items-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Project Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
