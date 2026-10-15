"use client";

import React from "react";

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * Clean layout shell for Landing and Onboarding.
 * Renders full-width, clean container without dashboard sidebars.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen w-full overflow-y-auto bg-app text-text-primary">
      {children}
    </div>
  );
}
