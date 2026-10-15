"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = (params?.projectId as string) || "";

  useEffect(() => {
    if (projectId) {
      router.replace(`/projects/${projectId}/control-center`);
    } else {
      router.replace("/projects");
    }
  }, [projectId, router]);

  return null;
}
