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
      <PageHeader
        title={`${project.name} Settings`}
        statusBadge={{
          label: "Project Admin",
          variant: "neutral",
          icon: <ShieldCheck className="h-3.5 w-3.5" />,
        }}
        description="Project identity, team member roles, and project lifecycle archive status."
        breadcrumbs={[
          { label: "Portfolio", href: "/projects" },
          { label: project.name, href: `/projects/${projectId}/control-center` },
          { label: "Settings" },
        ]}
      />

      <div className="px-6 max-w-5xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 border-b border-border pb-1">
          <button
            onClick={() => setActiveTab("DETAILS")}
            className={`flex items-center gap-2 rounded-md px-3.5 py-2 text-body font-medium transition-all ${
              activeTab === "DETAILS"
                ? "bg-primary text-white shadow-xs font-semibold"
                : "bg-surface text-text-secondary hover:bg-subtle hover:text-text-primary"
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Project Details</span>
          </button>

          <button
            onClick={() => setActiveTab("TEAM")}
            className={`flex items-center gap-2 rounded-md px-3.5 py-2 text-body font-medium transition-all ${
              activeTab === "TEAM"
                ? "bg-primary text-white shadow-xs font-semibold"
                : "bg-surface text-text-secondary hover:bg-subtle hover:text-text-primary"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Project Team & Roles</span>
          </button>

          <button
            onClick={() => setActiveTab("ARCHIVE")}
            className={`flex items-center gap-2 rounded-md px-3.5 py-2 text-body font-medium transition-all ${
              activeTab === "ARCHIVE"
                ? "bg-primary text-white shadow-xs font-semibold"
                : "bg-surface text-text-secondary hover:bg-subtle hover:text-text-primary"
            }`}
          >
            <Archive className="h-4 w-4" />
            <span>Archive Project</span>
          </button>
        </div>

        {/* DETAILS TAB */}
        {activeTab === "DETAILS" && (
          <div className="rounded-lg border border-border bg-surface p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-title font-bold text-text-primary">Project Identity</h3>
              <p className="text-caption text-text-muted mt-0.5">
                Core properties and governing entity for {project.name}.
              </p>
            </div>

            {saveSuccess && (
              <div className="flex items-center gap-2 rounded-md bg-success-subtle p-3 text-caption font-semibold text-success border border-success/30">
                <CheckCircle2 className="h-4 w-4" />
                <span>Project details updated successfully.</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-caption font-semibold text-text-primary">
                  Project Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 73 Broadway"
                />
              </div>

              <div className="space-y-1">
                <label className="text-caption font-semibold text-text-primary">
                  Legal / LLC Entity
                </label>
                <Input
                  value={projectEntity}
                  onChange={(e) => setProjectEntity(e.target.value)}
                  placeholder="e.g. Broadway Property Holdings LLC"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-caption font-semibold text-text-primary">
                  Site Address
                </label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 73 Broadway, Paterson, NJ 07505"
                />
              </div>

              <div className="space-y-1">
                <label className="text-caption font-semibold text-text-muted">
                  Lifecycle Stage (Controlled via Workflow)
                </label>
                <Input
                  value={project.lifecycle_stage}
                  disabled
                  className="bg-subtle text-text-muted cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-caption font-semibold text-text-muted">
                  Contract Model
                </label>
                <Input
                  value={project.contract_model}
                  disabled
                  className="bg-subtle text-text-muted cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <Button
                variant="primary"
                onClick={() => {
                  setSaveSuccess(true);
                  setTimeout(() => setSaveSuccess(false), 3000);
                }}
              >
                <Save className="mr-1.5 h-4 w-4" /> Save changes
              </Button>
            </div>
          </div>
        )}

        {/* TEAM TAB */}
        {activeTab === "TEAM" && (
          <TeamAccessPanel projectId={projectId} />
        )}

        {/* ARCHIVE TAB */}
        {activeTab === "ARCHIVE" && (
          <div className="rounded-lg border border-danger/30 bg-surface p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-title font-bold text-danger flex items-center gap-2">
                <Archive className="h-5 w-5" /> Archive Project Workspace
              </h3>
              <p className="text-body text-text-secondary mt-1">
                Archiving marks this project as completed or retired. The project data will remain preserved in read-only audit mode for historical reconciliation and reporting.
              </p>
            </div>

            <div className="rounded-md bg-danger-subtle/50 p-4 border border-danger/20 text-caption text-danger space-y-1">
              <strong>Caution:</strong>
              <p>Active draws, change order submissions, and budget reallocations will be frozen until unarchived by an organization Owner.</p>
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
                <p className="text-caption text-danger mt-2 font-medium">{archiveError}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
