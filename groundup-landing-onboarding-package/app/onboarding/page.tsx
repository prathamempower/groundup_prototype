"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { NewUserIntakePage } from "@/components/onboarding/NewUserIntakePage";
import { WorkspaceReadyScreen, ProjectReportData } from "@/components/onboarding/WorkspaceReadyScreen";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthenticatedUser } from "@/lib/types";

export default function OnboardingRoutePage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<AuthenticatedUser>(() => {
    try {
      const stored = localStorage.getItem("groundup_user");
      if (stored) return JSON.parse(stored);
    } catch {}

    let prefill: { name?: string; email?: string; company?: string; role?: string } | null = null;
    try {
      const prefillRaw = localStorage.getItem("groundup_onboarding_prefill");
      if (prefillRaw) prefill = JSON.parse(prefillRaw);
    } catch {}

    return {
      id: `usr-${Date.now()}`,
      name: prefill?.name || "",
      email: prefill?.email || "",
      company: prefill?.company || "",
      role: prefill?.role || "Developer / Owner",
      isNewUser: true,
      authProvider: "email",
    };
  });

  const [completedProject, setCompletedProject] = useState<{
    id: string;
    name: string;
    data: ProjectReportData;
  } | null>(null);

  const handleReturnToLanding = () => {
    router.push("/");
  };

  const handleOnboardingComplete = (projectId: string, reportData: unknown) => {
    const updatedUser: AuthenticatedUser = {
      ...currentUser,
      isNewUser: false,
    };
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem("groundup_user", JSON.stringify(updatedUser));
      localStorage.setItem("groundup_last_project_id", projectId);
    } catch {}

    const projectData = (reportData as ProjectReportData) || {};
    setCompletedProject({
      id: projectId,
      name: projectData?.name || "New Project Workspace",
      data: projectData,
    });
  };

  if (completedProject) {
    return (
      <ErrorBoundary onReset={handleReturnToLanding}>
        <WorkspaceReadyScreen
          projectName={completedProject.name}
          projectData={completedProject.data}
          onRestartOnboarding={() => setCompletedProject(null)}
          onReturnToLanding={handleReturnToLanding}
        />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary onReset={handleReturnToLanding}>
      <NewUserIntakePage
        user={currentUser}
        onCompleteIntake={handleOnboardingComplete}
        onCancelOrSignOut={handleReturnToLanding}
      />
    </ErrorBoundary>
  );
}
