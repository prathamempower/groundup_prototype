import React, { useState } from 'react';
import { SITE_PHOTOS } from './draw-submission/mock-data';
import { DrawSubmissionHeader } from './draw-submission/components/DrawSubmissionHeader';
import { DrawSubmissionStepper } from './draw-submission/components/DrawSubmissionStepper';
import { SiteProgressStep } from './draw-submission/steps/SiteProgressStep';
import { ReceiptsMatchingStep } from './draw-submission/steps/ReceiptsMatchingStep';
import { LineItemsStep } from './draw-submission/steps/LineItemsStep';
import { LenderPackageStep } from './draw-submission/steps/LenderPackageStep';

interface DrawSubmissionScreenProps {
  onBack: () => void;
  onSubmitSuccess: () => void;
}

export function DrawSubmissionScreen({ onBack, onSubmitSuccess }: DrawSubmissionScreenProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitToHeritageBank = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      onSubmitSuccess();
    }, 1200);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <DrawSubmissionHeader
        onBack={onBack}
        onSubmit={handleSubmitToHeritageBank}
        isSubmitting={isSubmitting}
        submitted={submitted}
      />

      <DrawSubmissionStepper
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
      />

      {currentStep === 1 && (
        <SiteProgressStep
          sitePhotos={SITE_PHOTOS}
          onViewChecklist={() => setCurrentStep(4)}
        />
      )}

      {currentStep === 2 && <ReceiptsMatchingStep />}

      {currentStep === 3 && <LineItemsStep />}

      {currentStep === 4 && (
        <LenderPackageStep onSubmit={handleSubmitToHeritageBank} />
      )}
    </div>
  );
}
