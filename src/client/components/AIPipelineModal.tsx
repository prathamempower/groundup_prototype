// GroundUp AI — End-to-End AI Processing Pipeline Modal
// 10-Step Architecture from the Master Flowchart

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { AIPipelineModalProps } from './ai-pipeline/types';
import { useAIPipeline } from './ai-pipeline/use-ai-pipeline';
import { AIPipelineHeader } from './ai-pipeline/components/AIPipelineHeader';
import { InputSourceSelector } from './ai-pipeline/components/InputSourceSelector';
import { ProjectDetailsForm } from './ai-pipeline/components/ProjectDetailsForm';
import { StagedDocsList } from './ai-pipeline/components/StagedDocsList';
import { PipelineStepsTrack } from './ai-pipeline/components/PipelineStepsTrack';
import { PipelineSuccessBanner } from './ai-pipeline/components/PipelineSuccessBanner';
import { PipelineFooter } from './ai-pipeline/components/PipelineFooter';

export function AIPipelineModal({
  isOpen,
  onClose,
  onPipelineCompleted,
  onViewFinalReport,
}: AIPipelineModalProps) {
  if (!isOpen) return null;

  const {
    inputSource,
    setInputSource,
    projectName,
    setProjectName,
    projectAddress,
    setProjectAddress,
    targetBudget,
    setTargetBudget,
    uploadedFiles,
    isProcessing,
    currentStepIndex,
    completedSteps,
    executionResult,
    errorMsg,
    handleStartPipeline,
  } = useAIPipeline(onPipelineCompleted);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto flex flex-col text-slate-900">
        <AIPipelineHeader onClose={onClose} />

        <div className="p-6 space-y-6 text-xs text-slate-800 flex-1">
          <InputSourceSelector
            inputSource={inputSource}
            setInputSource={setInputSource}
            disabled={isProcessing}
          />

          <ProjectDetailsForm
            projectName={projectName}
            setProjectName={setProjectName}
            projectAddress={projectAddress}
            setProjectAddress={setProjectAddress}
            targetBudget={targetBudget}
            setTargetBudget={setTargetBudget}
            disabled={isProcessing}
          />

          <StagedDocsList uploadedFiles={uploadedFiles} />

          <PipelineStepsTrack
            isProcessing={isProcessing}
            currentStepIndex={currentStepIndex}
            completedSteps={completedSteps}
            isCompleted={!!executionResult}
          />

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {executionResult && (
            <PipelineSuccessBanner
              projectName={projectName}
              executionResult={executionResult}
              onViewFinalReport={onViewFinalReport}
              onClose={onClose}
            />
          )}
        </div>

        {!executionResult && (
          <PipelineFooter
            isProcessing={isProcessing}
            currentStepIndex={currentStepIndex}
            onClose={onClose}
            onStartPipeline={handleStartPipeline}
          />
        )}
      </div>
    </div>
  );
}
