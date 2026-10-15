"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { NewUserIntakePage } from "@/components/onboarding/NewUserIntakePage";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthenticatedUser } from "@/lib/types";

export default function OnboardingRoutePage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<AuthenticatedUser>({
    id: "usr-initial",
    name: "",
    email: "",
    company: "",
    role: "OWNER",
    isNewUser: true,
    authProvider: "email",
  });

  const [isRedirecting, setIsRedirecting] = useState(false);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("groundup_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.role = "OWNER";
        setCurrentUser(parsed);
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
          role: "OWNER",
          isNewUser: true,
          authProvider: "email",
        });
      }
    } catch {}
  }, []);

  const handleReturnToLanding = () => {
    router.push("/");
  };

  const handleOnboardingComplete = (projectId: string, _reportData: unknown) => {
    setIsRedirecting(true);
    const projectData = (_reportData as any) || {};
    const updatedUser: AuthenticatedUser = {
      id: currentUser.id && currentUser.id !== "usr-initial" ? currentUser.id : `user-${Date.now()}`,
      name: currentUser.name || "Marcus Vance",
      email: currentUser.email || "m.vance@vancedev.com",
      company: currentUser.company || projectData?.organization_name || "Vance Development",
      role: "OWNER",
      isNewUser: false,
      authProvider: "email",
    };
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem("groundup_user", JSON.stringify(updatedUser));
      localStorage.setItem("groundup_active_auth_email", updatedUser.email);
      localStorage.setItem("groundup_session_seen", "1");
      localStorage.setItem("groundup_last_project_id", projectId);
      localStorage.setItem("groundup_active_project_id", projectId);
    } catch {}

    // Direct automatic jump to project portfolio
    router.push("/projects");
  };

  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-blue-600 border-t-transparent mb-4" />
        <h2 className="text-base font-semibold text-slate-900">Setting up your portfolio...</h2>
        <p className="text-xs text-slate-500 mt-1">Directing you to your project portfolio</p>
      </div>
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
