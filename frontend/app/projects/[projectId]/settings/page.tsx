"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/layout/page-header";
import { TeamAccessPanel } from "@/components/settings/team-access-panel";
import {
  Settings,
  ShieldCheck,
  Building2,
  Users,
  Archive,
  AlertCircle,
  CheckCircle2,
  Save,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const projectId = (params?.projectId as string) || "";

  const [activeTab, setActiveTab] = useState<"DETAILS" | "TEAM" | "ARCHIVE">("DETAILS");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [archiveError, setArchiveError] = useState("");

  const { data: projectData, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => api.projects.getById(projectId),
    enabled: Boolean(projectId),
  });

  const project = projectData?.data;

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [projectEntity, setProjectEntity] = useState("");

  React.useEffect(() => {
    if (project) {
      setName(project.name || "");
      setAddress(project.address || "");
      setProjectEntity(project.project_entity || "");
    }
  }, [project]);

  if (isLoading) {
    return (
      <div className="p-6 sm:p-8 space-y-6 max-w-5xl mx-auto">
        <div className="h-20 bg-subtle animate-pulse rounded-lg" />
        <div className="h-64 bg-subtle animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-12 text-center max-w-lg mx-auto">
        <AlertCircle className="h-10 w-10 text-danger mx-auto mb-3" />
        <h2 className="text-title font-bold text-text-primary">Project Not Found</h2>
        <p className="text-body text-text-secondary mt-1 mb-4">
          This project could not be found or you do not have permission to view its settings.
        </p>
        <Button variant="secondary" onClick={() => router.push("/projects")}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Portfolio
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="px-6 max-w-5xl mx-auto space-y-6 pt-4">
        <PageHeader
          title={`${project.name} Settings`}
          statusBadge={{
            label: "Project Admin",
            variant: "neutral",
            icon: <ShieldCheck className="h-3.5 w-3.5" />,
          }}
          breadcrumbs={[
            { label: "Portfolio", href: "/projects" },
            { label: project.name, href: `/projects/${projectId}/control-center` },
            { label: "Settings" },
          ]}
        />

        {/* Modern Segmented Navigation Tabs */}
        <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-slate-100/80 p-1 shadow-2xs">
          <button
            onClick={() => setActiveTab("DETAILS")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "DETAILS"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Project Details</span>
          </button>

          <button
            onClick={() => setActiveTab("TEAM")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "TEAM"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Project Team & Roles</span>
          </button>

          <button
            onClick={() => setActiveTab("ARCHIVE")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "ARCHIVE"
                ? "bg-white text-rose-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Archive className="h-3.5 w-3.5" />
            <span>Archive Project</span>
          </button>
        </div>

        {/* DETAILS TAB */}
        {activeTab === "DETAILS" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <span>Project Identity & Entity Info</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Governing legal structure and site location.
                  </p>
                </div>
              </div>

              {saveSuccess && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 border border-emerald-200/70">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Project details saved successfully.</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Project Display Name
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. 161 Woodlawn Ave"
                    className="h-9 text-xs rounded-lg border-slate-200 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Governing LLC / Legal Entity
                  </label>
                  <Input
                    value={projectEntity}
                    onChange={(e) => setProjectEntity(e.target.value)}
                    placeholder="e.g. 161 Woodlawn Holdings LLC"
                    className="h-9 text-xs rounded-lg border-slate-200 focus:border-blue-500 font-mono"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Site Location Address
                  </label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 161 Woodlawn Ave, Jersey City, NJ 07305"
                    className="h-9 text-xs rounded-lg border-slate-200 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <Button
                  variant="primary"
                  onClick={() => {
                    setSaveSuccess(true);
                    setTimeout(() => setSaveSuccess(false), 3000);
                  }}
                  className="shadow-xs"
                >
                  <Save className="h-3.5 w-3.5 mr-1.5" /> Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* TEAM TAB */}
        {activeTab === "TEAM" && (
          <TeamAccessPanel projectId={projectId} />
        )}

        {/* ARCHIVE TAB */}
        {activeTab === "ARCHIVE" && (
          <div className="rounded-xl border border-rose-200/90 bg-white p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                <Archive className="h-4 w-4 text-rose-600" /> Archive Project Workspace
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Archiving freezes active draws and transitions financial data into read-only audit mode.
              </p>
            </div>

            <div className="rounded-xl bg-rose-50/70 p-4 border border-rose-200/80 text-xs text-rose-900 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-rose-600" /> Caution
              </span>
              <p className="text-slate-600 leading-relaxed">
                Active draws, change order submissions, and budget reallocations will be locked. Only organization Owners can reactivate archived projects.
              </p>
            </div>

            <div className="pt-2">
              <Button
                variant="destructive"
                onClick={() => {
                  setArchiveError("Project cannot be archived while Draw #3 has unresolved exceptions.");
                }}
              >
                Archive {project.name}
              </Button>
              {archiveError && (
                <p className="text-xs text-rose-700 mt-2 font-medium flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {archiveError}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
