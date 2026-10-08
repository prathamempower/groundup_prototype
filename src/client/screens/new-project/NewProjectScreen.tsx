import React, { useState, useEffect } from 'react';
import { ProjectFormData, WIZARD_STEPS } from './types';
import { NewProjectHeader } from './components/NewProjectHeader';
import { NewProjectSidebar } from './components/NewProjectSidebar';
import { FoundationStep } from './components/FoundationStep';
import { StatusStep } from './components/StatusStep';
import { FinancialsStep } from './components/FinancialsStep';
import { ReviewStep } from './components/ReviewStep';
import { NewProjectActionBar } from './components/NewProjectActionBar';

interface NewProjectScreenProps {
  onComplete: (data?: ProjectFormData) => void;
  onCancel: () => void;
}

export function NewProjectScreen({ onComplete, onCancel }: NewProjectScreenProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<ProjectFormData>(() => {
    const saved = localStorage.getItem('newProjectFormData');
    return saved ? JSON.parse(saved) : {};
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    localStorage.setItem('newProjectFormData', JSON.stringify(formData));
  }, [formData]);

  const handleChange = (field: keyof ProjectFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStepIndex < WIZARD_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    } else {
      onCancel();
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      localStorage.removeItem('newProjectFormData');
      onComplete(formData);
    }, 800);
  };

  const currentStep = WIZARD_STEPS[currentStepIndex];

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      <NewProjectHeader onCancel={onCancel} />

      <div className="flex-1 flex overflow-hidden">
        <NewProjectSidebar currentStepIndex={currentStepIndex} />

        <div className="flex-1 flex flex-col relative bg-slate-50">
          <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl mx-auto pb-8">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
              {currentStep.id === 'foundation' && (
                <FoundationStep formData={formData} onChange={handleChange} />
              )}
              {currentStep.id === 'status' && (
                <StatusStep formData={formData} onChange={handleChange} />
              )}
              {currentStep.id === 'financials' && (
                <FinancialsStep formData={formData} onChange={handleChange} />
              )}
              {currentStep.id === 'review' && (
                <ReviewStep formData={formData} />
              )}
            </div>
          </div>

          </div>
          <NewProjectActionBar
            currentStepIndex={currentStepIndex}
            isSubmitting={isSubmitting}
            onBack={handleBack}
            onNext={handleNext}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
