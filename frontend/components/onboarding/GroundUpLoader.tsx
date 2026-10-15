'use client';

// GroundUp AI: Precision Construction Financial Calibration Loaders
// Impeccable Design: Minimalist architectural linear telemetry, high-trust fintech styling
// Governance: Zero em dashes, zero executive acronyms, zero ungrounded circular spinning slop

import React, { useEffect, useState } from 'react';
import { CheckCircle2, ShieldCheck, Database, HardHat, FileText, Layers, Lock, Cpu } from 'lucide-react';
import { GroundUpMark } from '@/components/brand/GroundUpBrand';

interface GroundUpTransitionLoaderProps {
  isVisible?: boolean;
  message?: string;
  subMessage?: string;
}

export function GroundUpTransitionLoader({
  isVisible = false,
  message = 'Securing workspace data…',
  subMessage = 'Calibrating relational project ledger'
}: GroundUpTransitionLoaderProps) {
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    if (!isVisible) {
      setProgress(15);
      return;
    }
    const timer1 = setTimeout(() => setProgress(55), 80);
    const timer2 = setTimeout(() => setProgress(90), 220);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-200/90 flex flex-col items-center text-center space-y-4">
        
        {/* Architectural Brand Emblem with Precision Pulse */}
        <div className="relative w-14 h-14 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-blue-50 border border-blue-100 animate-pulse" />
          <div className="relative z-10">
            <GroundUpMark size={28} />
          </div>
        </div>

        {/* Informative Micro-Copy */}
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-900 tracking-tight">
            {message}
          </h4>
          <p className="text-xs text-slate-500 font-medium">
            {subMessage}
          </p>
        </div>

        {/* Precision Linear Beam */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-slate-900 to-[#0066ee] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

      </div>
    </div>
  );
}

interface CircularWorkspaceGaugeProps {
  percentage: number;
  stageTitle?: string;
  currentStage?: string;
}

export function CircularWorkspaceGauge({ percentage, stageTitle, currentStage }: CircularWorkspaceGaugeProps) {
  const activeTitle = currentStage || stageTitle || 'Calibrating workspace environment…';
  const clamped = Math.min(Math.max(percentage, 5), 100);

  return (
    <div className="w-full max-w-md mx-auto py-2">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
        {/* Telemetry Header */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#0066ee] animate-pulse" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Calibration Feed
            </span>
          </div>
          <span className="font-mono text-xs font-bold text-slate-900 tabular-nums">
            {clamped}% COMPLETE
          </span>
        </div>

        {/* Precision Dual-Track Progress Bar */}
        <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-slate-900 via-blue-700 to-[#0066ee] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${clamped}%` }}
          />
        </div>

        {/* Dynamic Status Text */}
        <div className="flex items-center justify-between pt-0.5 text-left">
          <span className="text-xs font-semibold text-slate-700 truncate pr-2">
            {activeTitle}
          </span>
          <span className="font-mono text-[10px] text-slate-400 uppercase shrink-0 font-medium">
            ACID SYNC
          </span>
        </div>
      </div>
    </div>
  );
}

// Named alias for architectural calibration
export { CircularWorkspaceGauge as ArchitecturalWorkspaceCalibrator };

