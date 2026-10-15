"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { NewUserIntakePage } from "@/components/onboarding/NewUserIntakePage";
import { WorkspaceReadyScreen, ProjectReportData } from "@/components/onboarding/WorkspaceReadyScreen";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthenticatedUser } from "@/lib/types";

export default function OnboardingRoutePage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<AuthenticatedUser>({
    id: "usr-initial",
    name: "",
    email: "",
    company: "",
    role: "Developer / Owner",
    isNewUser: true,
    authProvider: "email",
  });

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("groundup_user");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
        return;
      }
    } catch {}

    try {
      const prefillRaw = localStorage.getItem("groundup_onboarding_prefill");
      if (prefillRaw) {
        const prefill = JSON.parse(prefillRaw);
        setCurrentUser({
          id: `usr-${Date.now()}`,
          name: prefill?.name || "",
          email: prefill?.email || "",
          company: prefill?.company || "",
          role: prefill?.role || "Developer / Owner",
          isNewUser: true,
          authProvider: "email",
        });
      }
    } catch {}
  }, []);

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
      localStorage.setItem("groundup_session_seen", "1");
      localStorage.setItem("groundup_last_project_id", projectId);
      localStorage.setItem("groundup_active_project_id", projectId);
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
          userName={currentUser.name}
          userRole={currentUser.role}
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
