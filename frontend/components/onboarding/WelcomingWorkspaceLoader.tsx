"use client";

import React, { useEffect, useState } from "react";
import { GroundUpMark } from "@/components/brand/GroundUpBrand";

interface WelcomingWorkspaceLoaderProps {
  projectName?: string;
  onFinished?: () => void;
}

export function WelcomingWorkspaceLoader({
  projectName,
  onFinished,
}: WelcomingWorkspaceLoaderProps) {
  const [phase, setPhase] = useState<"preparing" | "ready">("preparing");
  const [progress, setProgress] = useState(20);

  const displayProject = projectName?.trim() || "73 Broadway";

  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(70);
    }, 350);

    const t2 = setTimeout(() => {
      setProgress(100);
      setPhase("ready");
    }, 850);

    const t3 = setTimeout(() => {
      if (onFinished) onFinished();
    }, 1250);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onFinished]);

  return (
    <div className="min-h-[380px] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
      {/* Apple-grade Minimalist Emblem with Subtle Depth */}
      <div className="w-14 h-14 rounded-2xl bg-white shadow-xs border border-slate-200/80 flex items-center justify-center mb-5">
        <GroundUpMark size={28} />
      </div>

      {/* Dignified Clean Headline */}
      <h2 className="text-xl font-semibold text-slate-900 tracking-tight mb-2">
        {phase === "ready" ? `Opening ${displayProject}` : `Preparing ${displayProject}`}
      </h2>

      {/* Single Quiet Status Label */}
      <p className="text-xs text-slate-500 font-normal mb-6 transition-all duration-300">
        {phase === "ready" ? "Workspace ready" : "Setting up project workspace"}
      </p>

      {/* Whisper-Thin Apple HIG Progress Beam (2px) */}
      <div className="w-44 h-0.5 bg-slate-200/80 rounded-full overflow-hidden">
        <div
          className="h-full bg-slate-900 rounded-full transition-all duration-400 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
