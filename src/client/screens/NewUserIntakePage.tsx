// GroundUp AI — Role-Based Sequential Self-Onboarding
// Replaces static multi-tab form with dynamic, context-aware, one-question-at-a-time engine.

import React from 'react';
import { AuthenticatedUser } from '../../shared/types';
import { OnboardingFlow } from '../onboarding/OnboardingFlow';
import { OnboardingCompletionPayload } from '../onboarding/types';

interface NewUserIntakePageProps {
  user: AuthenticatedUser;
  onCompleteIntake: (payloadOrProjectId: any, reportData?: any) => void;
  onCancelOrSignOut: () => void;
}

export function NewUserIntakePage({ user, onCompleteIntake, onCancelOrSignOut }: NewUserIntakePageProps) {
  const handleComplete = (payload: OnboardingCompletionPayload) => {
    onCompleteIntake(payload);
  };

  return (
    <OnboardingFlow
      user={user}
      onComplete={handleComplete}
      onCancelOrSignOut={onCancelOrSignOut}
    />
  );
}

export { OnboardingFlow };
export type { OnboardingCompletionPayload };
