import { useState, useEffect, useMemo } from 'react';
import { AuthenticatedUser } from '../../../shared/types';
import { OnboardingState, QuestionDefinition, SetupTask, OnboardingCompletionPayload } from '../types';
import { QUESTION_DEFINITIONS } from '../questionGraph';
import { generateSetupTasks, resolveTargetWorkspace, buildCreatedProject } from '../taskGenerator';

const STORAGE_KEY = 'groundup_onboarding_draft';

export function useOnboarding(
  user: AuthenticatedUser,
  onComplete: (payload: OnboardingCompletionPayload) => void
) {
  const [history, setHistory] = useState<string[]>(['role']);
  const currentQuestionId = history[history.length - 1];

  const [state, setState] = useState<OnboardingState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.state) return parsed.state;
      }
    } catch {}
    return {
      userName: user.name || '',
      userCompany: user.company || '',
      userEmail: user.email || '',
    };
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewStep, setShowReviewStep] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, history }));
    } catch {}
  }, [state, history]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentQuestionId, showReviewStep]);

  const currentQuestion: QuestionDefinition | undefined = QUESTION_DEFINITIONS[currentQuestionId];

  const setupTasks: SetupTask[] = useMemo(() => generateSetupTasks(state), [state]);
  const workspaceDetails = useMemo(() => resolveTargetWorkspace(state), [state]);

  const resolvedTitle = useMemo(() => {
    if (!currentQuestion) return '';
    return typeof currentQuestion.title === 'function' ? currentQuestion.title(state) : currentQuestion.title;
  }, [currentQuestion, state]);

  const resolvedSubtitle = useMemo(() => {
    if (!currentQuestion?.subtitle) return '';
    return typeof currentQuestion.subtitle === 'function' ? currentQuestion.subtitle(state) : currentQuestion.subtitle;
  }, [currentQuestion, state]);

  const progressPercent = useMemo(() => {
    if (showReviewStep) return 100;
    const stepCount = history.length;
    const estimatedTotal = state.role === 'OWNER' ? 7 : 5;
    return Math.min(Math.round((stepCount / estimatedTotal) * 100), 92);
  }, [history.length, state.role, showReviewStep]);

  const handleUpdateField = (fieldKey: string, value: any) => {
    setValidationError(null);
    setState(prev => ({ ...prev, [fieldKey]: value }));
  };

  const handleUpdateSubField = (parentKey: string, subFieldKey: string, value: any) => {
    setValidationError(null);
    setState(prev => ({
      ...prev,
      [parentKey]: {
        ...(prev[parentKey] || {}),
        [subFieldKey]: value,
      },
    }));
  };

  const handleFinalComplete = () => {
    setIsSubmitting(true);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}

    const project = buildCreatedProject(state, user.id);
    const payload: OnboardingCompletionPayload = {
      role: workspaceDetails.role,
      targetScreen: workspaceDetails.targetScreen,
      project: project || undefined,
      setupTasks,
      answers: state,
      userName: state.userName || user.name,
      userCompany: state.userCompany || user.company,
    };

    setTimeout(() => {
      onComplete(payload);
    }, 400);
  };

  const handleContinue = () => {
    if (showReviewStep) {
      handleFinalComplete();
      return;
    }
    if (!currentQuestion) return;

    if (currentQuestion.validate) {
      const validation = currentQuestion.validate(state);
      if (!validation.valid) {
        setValidationError(validation.error || 'Please provide a valid answer to continue.');
        return;
      }
    }

    setValidationError(null);
    const nextQuestionId = currentQuestion.getNextQuestionId(state);

    if (nextQuestionId === null) {
      setShowReviewStep(true);
    } else {
      setHistory(prev => [...prev, nextQuestionId]);
    }
  };

  const handleBack = () => {
    setValidationError(null);
    if (showReviewStep) {
      setShowReviewStep(false);
      return;
    }
    if (history.length > 1) {
      setHistory(prev => prev.slice(0, prev.length - 1));
    }
  };

  const handleSkip = () => {
    if (!currentQuestion?.allowSkip) return;
    setValidationError(null);
    const nextQuestionId = currentQuestion.getNextQuestionId(state);
    if (nextQuestionId === null) {
      setShowReviewStep(true);
    } else {
      setHistory(prev => [...prev, nextQuestionId]);
    }
  };

  const handleReset = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setHistory(['role']);
    setShowReviewStep(false);
    setValidationError(null);
    setState({
      userName: user.name || '',
      userCompany: user.company || '',
      userEmail: user.email || '',
    });
  };

  return {
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
  };
}
