"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AlertsView } from "@/components/alerts/alerts-view";

export default function AlertsPage() {
  const params = useParams();
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
  const routeProjectId =
    (params?.projectId as string) ||
    (typeof window !== "undefined"
      ? window.location.pathname.match(/^\/projects\/([^/]+)/)?.[1] || ""
      : "");
  const currentProjectId =
    routeProjectId && routeProjectId !== "new"
      ? routeProjectId
      : projectsData?.data?.current_project_id ||
        projectsData?.data?.projects?.[0]?.id ||
        "df16b577-3585-4fb0-a13a-ffadaca73e0f";
  const currentProject = projectsData?.data?.projects?.find(
    (p) => p.id === currentProjectId
  );

  return (
    <div className="flex-1 pb-12">
      <AlertsView
        projectId={currentProjectId}
        projectName={currentProject?.name || "73 Broadway"}
        userRole={userRole}
      />
    </div>
  );
}
