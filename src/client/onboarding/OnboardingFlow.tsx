import React from 'react';
import { ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { AuthenticatedUser } from '../../shared/types';
import { OnboardingCompletionPayload } from './types';
import { useOnboarding } from './hooks/use-onboarding';
import { OnboardingHeader } from './components/OnboardingHeader';
import { OnboardingSingleSelect } from './components/OnboardingSingleSelect';
import { OnboardingTextInput, OnboardingMultiField } from './components/OnboardingInputs';
import { OnboardingReviewStep } from './components/OnboardingReviewStep';

interface OnboardingFlowProps {
  user: AuthenticatedUser;
  onComplete: (payload: OnboardingCompletionPayload) => void;
  onCancelOrSignOut: () => void;
}

export function OnboardingFlow({ user, onComplete, onCancelOrSignOut }: OnboardingFlowProps) {
  const {
    history,
    state,
    validationError,
    isSubmitting,
    showReviewStep,
    currentQuestion,
    setupTasks,
    workspaceDetails,
    resolvedTitle,
    resolvedSubtitle,
    progressPercent,
    handleUpdateField,
    handleUpdateSubField,
    handleContinue,
    handleBack,
    handleSkip,
    handleReset,
    handleFinalComplete,
  } = useOnboarding(user, onComplete);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-slate-900 selection:text-white">
      <OnboardingHeader
        progressPercent={progressPercent}
        onReset={handleReset}
        onSignOut={onCancelOrSignOut}
      />

      <main className="flex-1 flex flex-col max-w-2xl w-full mx-auto px-6 pt-10 pb-16">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 bg-slate-200/70 px-2.5 py-1 rounded-md">
              {showReviewStep ? 'Final Review' : `Step ${history.length} · ${currentQuestion?.categoryLabel || 'Configuration'}`}
            </span>
          </div>

          {history.length > 1 && !showReviewStep && (
            <button
              type="button"
              data-testid="back-btn"
              onClick={handleBack}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}
        </div>

        {!showReviewStep && currentQuestion && (
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-8 sm:p-10 transition-all">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-2.5 leading-snug">
                {resolvedTitle}
              </h1>
              {resolvedSubtitle && (
                <p className="text-sm sm:text-base text-slate-500 font-normal leading-relaxed">
                  {resolvedSubtitle}
                </p>
              )}
            </div>

            {validationError && (
              <div className="mb-6 flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{validationError}</span>
              </div>
            )}

            {currentQuestion.type === 'single_select' && currentQuestion.options && (
              <OnboardingSingleSelect
                questionId={currentQuestion.id}
                options={currentQuestion.options}
                selectedValue={state[currentQuestion.id]}
                onSelect={(val) => handleUpdateField(currentQuestion.id, val)}
              />
            )}

            {currentQuestion.type === 'text' && (
              <OnboardingTextInput
                value={state[currentQuestion.id] || ''}
                placeholder={currentQuestion.placeholder}
                onChange={(val) => handleUpdateField(currentQuestion.id, val)}
                onEnter={handleContinue}
              />
            )}

            {currentQuestion.type === 'multi_field' && currentQuestion.fields && (
              <OnboardingMultiField
                fields={currentQuestion.fields}
                values={state[currentQuestion.id] || {}}
                onSubFieldChange={(fieldId, val) => handleUpdateSubField(currentQuestion.id, fieldId, val)}
              />
            )}

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <div>
                {currentQuestion.allowSkip ? (
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    Skip for now
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400">
                    Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono text-[10px] border border-slate-200">Enter ↵</kbd> to continue
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  data-testid="continue-btn"
                  onClick={handleContinue}
                  className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-xs cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {showReviewStep && (
          <OnboardingReviewStep
            state={state}
            workspaceDetails={workspaceDetails}
            setupTasks={setupTasks}
            isSubmitting={isSubmitting}
            onBack={handleBack}
            onComplete={handleFinalComplete}
          />
        )}
      </main>

      <footer className="border-t border-slate-200/80 py-4 px-6 text-center text-xs text-slate-400">
        GroundUp AI · Autonomous Real Estate Construction Finance & Underwriting
      </footer>
    </div>
  );
}
