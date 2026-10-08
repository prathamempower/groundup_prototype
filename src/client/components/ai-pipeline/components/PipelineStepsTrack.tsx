import React from 'react';
import { Layers, RefreshCw } from 'lucide-react';
import { PipelineStepLog, STEP_DEFINITIONS } from '../types';

interface PipelineStepsTrackProps {
  isProcessing: boolean;
  currentStepIndex: number;
  completedSteps: PipelineStepLog[];
  isCompleted: boolean;
}

export function PipelineStepsTrack({
  isProcessing,
  currentStepIndex,
  completedSteps,
  isCompleted,
}: PipelineStepsTrackProps) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <div className="p-3 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-600" /> Data Processing Pipeline Execution
        </span>
        <span className="text-[11px] text-slate-500 font-medium">
          {isProcessing
            ? `Processing Step ${currentStepIndex} of 10...`
            : isCompleted
            ? 'All 10 Steps Complete · Verified'
            : 'Ready to Process'}
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {STEP_DEFINITIONS.map((step) => {
          const isStepDone =
            isCompleted ||
            (!isProcessing && completedSteps.some((s) => s.stepNumber === step.number)) ||
            (isProcessing && currentStepIndex > step.number);
          const isStepCurrent = isProcessing && currentStepIndex === step.number;
          const completedLog = completedSteps.find((s) => s.stepNumber === step.number);

          return (
            <div
              key={step.number}
              className={`p-3 flex items-start gap-3 transition ${
                isStepCurrent ? 'bg-amber-50/50' : isStepDone ? 'bg-emerald-50/30' : 'bg-white'
              }`}
            >
              <div className="mt-0.5">
                {isStepDone ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                    ✓
                  </div>
                ) : isStepCurrent ? (
                  <RefreshCw className="w-5 h-5 text-amber-600 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-semibold">
                    {step.number}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p
                    className={`text-xs font-bold ${
                      isStepDone
                        ? 'text-emerald-950'
                        : isStepCurrent
                        ? 'text-amber-900'
                        : 'text-slate-700'
                    }`}
                  >
                    Step {step.number}: {step.name}
                  </p>
                  {isStepDone && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                      {completedLog?.confidence ? `${(completedLog.confidence * 100).toFixed(0)}% Conf` : '100%'}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {completedLog?.description || step.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
