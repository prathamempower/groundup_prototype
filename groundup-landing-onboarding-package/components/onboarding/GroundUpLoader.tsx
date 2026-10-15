'use client';

// GroundUp AI: Precision Construction Financial Animated Loaders
// Features: Geometric blueprint brand emblem, circular SVG progress gauge,
// animated precision loading bars, and psychological progress feedback.
// Governance: Zero em dashes, zero executive acronyms, zero ungrounded pulsing slop.

import React, { useEffect, useState } from 'react';
import { CheckCircle2, ShieldCheck, Database, HardHat, FileText, Layers } from 'lucide-react';
import { Logo } from '../logo';

interface GroundUpTransitionLoaderProps {
  isVisible?: boolean;
  message?: string;
  subMessage?: string;
}

export function GroundUpTransitionLoader({
  isVisible = false,
  message = 'Securing workspace data...',
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
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-100 flex flex-col items-center text-center space-y-4">
        
        {/* Animated Brand Emblem with Precision Concentric Circles */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-indigo-50 border border-indigo-100 animate-pulse" />
          <svg className="w-16 h-16 absolute -rotate-90" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="3"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="#4f46e5"
              strokeWidth="3.5"
              strokeDasharray={176}
              strokeDashoffset={176 - (176 * progress) / 100}
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
            />
          </svg>
          <div className="relative z-10 w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
            <Layers className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

        {/* Informative Psychological Micro-Copy */}
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-900 tracking-tight">
            {message}
          </h4>
          <p className="text-xs text-slate-500 font-medium">
            {subMessage}
          </p>
        </div>

        {/* Precision Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 rounded-full transition-all duration-300 ease-out"
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
  const radius = 54;
  const circumference = 2 * Math.PI * radius; // ~339.29
  const strokeDashoffset = circumference - (circumference * Math.min(percentage, 100)) / 100;
  const activeTitle = currentStage || stageTitle || 'Calibrating workspace environment...';

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Background Track */}
        <svg className="w-36 h-36 -rotate-90" viewBox="0 0 128 128">
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="8"
          />
          {/* Animated Gauge Ring */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="#0f172a"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {percentage}%
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
            Synchronizing
          </span>
        </div>
      </div>

      <div className="mt-3 text-center">
        <span className="text-xs font-bold text-slate-800 block">
          {activeTitle}
        </span>
      </div>
    </div>
  );
}
