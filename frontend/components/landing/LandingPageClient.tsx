"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LandingPage, OnboardingPrefill } from "./LandingPage";
import { AuthenticatedUser } from "@/lib/types";

export function LandingPageClient() {
  const router = useRouter();

  // Keep user on the landing page even if authenticated
  // Users can click "Dashboard" / "Sign In" or "Start your project" manually when desired
  const handleStartOnboarding = (prefill?: OnboardingPrefill) => {
    if (prefill) {
      try {
        localStorage.setItem("groundup_onboarding_prefill", JSON.stringify(prefill));
      } catch {}
    }
    router.push("/auth/sign-up");
  };

  const handleAuthenticate = (user: AuthenticatedUser) => {
    try {
      localStorage.setItem("groundup_user", JSON.stringify(user));
      localStorage.setItem("groundup_session_seen", "1");
    } catch {}
    router.push("/projects");
  };

  return (
    <LandingPage
      onAuthenticate={handleAuthenticate}
      onStartOnboarding={handleStartOnboarding}
    />
  );
}

export default LandingPageClient;
