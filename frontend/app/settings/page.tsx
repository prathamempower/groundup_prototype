"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const router = useRouter();

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list(),
  });

  useEffect(() => {
    if (isLoading) return;
    const activeId =
      projectsData?.data?.current_project_id ||
      projectsData?.data?.projects?.[0]?.id ||
      (typeof window !== "undefined" && (window.localStorage.getItem("groundup_active_project_id") || window.localStorage.getItem("groundup_last_project_id"))) ||
      "";

    if (activeId) {
      router.replace(`/projects/${activeId}/settings`);
    } else {
      router.replace("/projects");
    }
  }, [isLoading, projectsData, router]);

  return null;
}
