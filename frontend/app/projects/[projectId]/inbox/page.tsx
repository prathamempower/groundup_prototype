"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { InboxView } from "@/components/inbox/inbox-view";

export default function InboxPage() {
  const params = useParams();
  const urlProjectId = (params?.projectId as string) || "";

  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list(),
  });

  const projects = projectsData?.data?.projects || [];
  const currentProjectId = urlProjectId || projectsData?.data?.current_project_id || projects[0]?.id || "";
  const currentProject = projects.find((p) => p.id === currentProjectId) || projects.find((p) => p.name.includes("161 Woodlawn")) || projects[0];

  return (
    <div className="h-[calc(100vh-4rem)] w-full overflow-hidden">
      <InboxView
        projectId={currentProject?.id || "p-161-woodlawn"}
        projectName={currentProject?.name || "161 Woodlawn Ave"}
      />
    </div>
  );
}
