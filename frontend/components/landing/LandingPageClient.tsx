"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getDefaultRouteForRole } from "@/lib/navigation";
import { LandingPage, OnboardingPrefill } from "./LandingPage";
import { AuthenticatedUser } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export function LandingPageClient() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [hasCheckedSession, setHasCheckedSession] = useState(false);

  // Check if an authenticated user session exists
  const { data: meResponse, isLoading, isSuccess } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.identity.getMe(),
    retry: false,
    staleTime: 30_000,
  });

  useEffect(() => {
    setHasCheckedSession(true);
    if (isSuccess && meResponse?.data) {
      setIsRedirecting(true);
      const role = meResponse.data.role;
      const targetRoute = getDefaultRouteForRole(role);
      router.replace(targetRoute);
    }
  }, [isSuccess, meResponse, router]);

  const handleStartOnboarding = (prefill?: OnboardingPrefill) => {
    if (prefill) {
      try {
        localStorage.setItem("groundup_onboarding_prefill", JSON.stringify(prefill));
      } catch {}
    }
    router.push("/onboarding");
  };

  const handleAuthenticate = (user: AuthenticatedUser) => {
    try {
      localStorage.setItem("groundup_user", JSON.stringify(user));
      localStorage.setItem("groundup_session_seen", "1");
    } catch {}
    if (user.isNewUser) {
      router.push("/onboarding");
    } else {
      router.push("/projects");
    }
  };

  // If redirecting authenticated user to their target dashboard, show skeleton placeholder
  if (isRedirecting) {
    return (
      <main className="min-h-screen bg-background p-6" aria-label="Loading your workspace">
        <div className="mx-auto max-w-7xl space-y-8 pt-8">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-44 rounded-lg" />
            <div className="flex gap-3">
              <Skeleton className="h-9 w-24 rounded-lg" />
              <Skeleton className="h-9 w-32 rounded-lg" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4 rounded-xl" />
            <Skeleton className="h-6 w-1/2 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <LandingPage
      onAuthenticate={handleAuthenticate}
      onStartOnboarding={handleStartOnboarding}
    />
  );
}

export default LandingPageClient;
