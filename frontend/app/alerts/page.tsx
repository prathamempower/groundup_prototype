"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/layout/page-header";
import { AlertsView } from "@/components/alerts/alerts-view";
import { AlertTriangle, ShieldCheck } from "lucide-react";

export default function AlertsPage() {
  const { data: meData } = useQuery({
    queryKey: ["auth-me"],
    queryFn: () => api.identity.getMe(),
  });

  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list(),
  });

  const user = meData?.data;
  const userRole = user?.role || "OWNER";
  const routeProjectId = typeof window !== "undefined"
    ? (window.location.pathname.match(/^\/projects\/([^\/]+)/)?.[1] || "")
    : "";
  const currentProjectId = (routeProjectId && routeProjectId !== "new")
    ? routeProjectId
    : projectsData?.data?.current_project_id || "";
  const currentProject = projectsData?.data?.projects?.find(
    (p) => p.id === currentProjectId
  );

  const { data: alertsData } = useQuery({
    queryKey: ["alerts", currentProjectId],
    queryFn: () => api.alerts.list(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  const openAlertsCount = (alertsData?.data || []).filter(
    (a) => a.status === "OPEN"
  ).length;

  return (
    <div className="flex-1 space-y-6 pb-12">
      <div className="px-6 max-w-7xl mx-auto space-y-6 pt-4">
        <PageHeader
          title="Alerts & Exceptions"
          subtitle={
            currentProject
              ? `Active integrity monitors & exception workflows for ${currentProject.name}`
              : "Project operational alerts, overruns, schedule variances, and data quality issues"
          }
          breadcrumbs={[
            {
              label: "Home",
              href: currentProjectId ? `/projects/${currentProjectId}/control-center` : "/projects",
            },
            { label: "Alerts & Exceptions" },
          ]}
          statusBadge={
            openAlertsCount > 0
              ? {
                  label: `${openAlertsCount} Open Exceptions`,
                  variant: "danger",
                  icon: <AlertTriangle className="h-3.5 w-3.5" />,
                }
              : {
                  label: "All Clear",
                  variant: "success",
                  icon: <ShieldCheck className="h-3.5 w-3.5" />,
                }
          }
        />

        <div>
          {currentProjectId ? (
            <AlertsView
              projectId={currentProjectId}
              projectName={currentProject?.name}
              userRole={userRole}
            />
          ) : (
            <div className="rounded-xl border border-border bg-surface p-12 text-center text-text-muted">
              Select or create a project to review operational alerts and data quality issues.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
