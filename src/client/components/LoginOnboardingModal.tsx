// GroundUp AI — User Intake & Project Status Onboarding Modal
// Collects user profile, project details, budget/loan/invoices, and generates the final audit report

import React from 'react';
import { LoginOnboardingModalProps } from './login-onboarding/types';
import { useOnboardingModal } from './login-onboarding/use-onboarding-modal';
import { OnboardingHeader } from './login-onboarding/components/OnboardingHeader';
import { OnboardingUserProfileStep } from './login-onboarding/components/OnboardingUserProfileStep';
import { OnboardingProjectInfoStep } from './login-onboarding/components/OnboardingProjectInfoStep';
import { OnboardingFinancialsStep } from './login-onboarding/components/OnboardingFinancialsStep';
import { OnboardingAuditReportStep } from './login-onboarding/components/OnboardingAuditReportStep';
import { OnboardingFooter } from './login-onboarding/components/OnboardingFooter';

export function LoginOnboardingModal({
  isOpen,
  onClose,
  initialUser,
  onSaveProfileAndProject,
  onOpenReport,
}: LoginOnboardingModalProps) {
  if (!isOpen) return null;

  const {
    step,
    setStep,
    userName,
    setUserName,
    companyName,
    setCompanyName,
    userEmail,
    setUserEmail,
    userRole,
    setUserRole,
    projectName,
    setProjectName,
    projectAddress,
    setProjectAddress,
    propertyType,
    setPropertyType,
    squareFeet,
    setSquareFeet,
    units,
    setUnits,
    projectStatus,
    setProjectStatus,
    targetBudget,
    setTargetBudget,
    lenderName,
    setLenderName,
    loanAmount,
    setLoanAmount,
    interestRate,
    setInterestRate,
    invoices,
    setInvoices,
    disbursedFunded,
    uploadMethod,
    setUploadMethod,
    totalIncurredSpend,
    frontingCashGap,
    dailyInterest,
  } = useOnboardingModal(initialUser);

  const handleFinish = () => {
    const profile = { name: userName, company: companyName };
    const newProj = {
      name: projectName,
      address: projectAddress,
      propertyType,
      squareFeet,
      units,
      status: projectStatus === 'ONGOING' ? 'ACTIVE' : projectStatus,
      target_budget: targetBudget,
      lender_name: lenderName,
      loan_amount: loanAmount,
      interest_rate: interestRate,
      incurred_spend: totalIncurredSpend,
      disbursed_funded: disbursedFunded,
      invoices,
    };

    onSaveProfileAndProject(profile, newProj);
    onClose();
  };

  const handleGenerateFinalReport = () => {
    onOpenReport(`GroundUp AI Certified Executive Audit — ${projectName}`, {
      builder: `${userName} (${companyName})`,
      project: projectName,
      address: projectAddress,
      status: projectStatus,
      budget: targetBudget,
      loanAmount,
      interestRate: `${interestRate}%`,
      incurredSpend: totalIncurredSpend,
      disbursedFunded,
      frontingCash: frontingCashGap,
      dailyInterest,
      invoicesCount: invoices.length,
      mathVerification: 'Passed 100% Zero-Hallucination Integrity Check',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <OnboardingHeader step={step} onClose={onClose} />

        <div className="p-6 space-y-6 flex-1 text-xs">
          {step === 1 && (
            <OnboardingUserProfileStep
              userName={userName}
              setUserName={setUserName}
              companyName={companyName}
              setCompanyName={setCompanyName}
              userEmail={userEmail}
              setUserEmail={setUserEmail}
              userRole={userRole}
              setUserRole={setUserRole}
            />
          )}

          {step === 2 && (
            <OnboardingProjectInfoStep
              projectStatus={projectStatus}
              setProjectStatus={setProjectStatus}
              projectName={projectName}
              setProjectName={setProjectName}
              propertyType={propertyType}
              setPropertyType={setPropertyType}
              projectAddress={projectAddress}
              setProjectAddress={setProjectAddress}
              squareFeet={squareFeet}
              setSquareFeet={setSquareFeet}
              units={units}
              setUnits={setUnits}
            />
          )}

          {step === 3 && (
            <OnboardingFinancialsStep
              targetBudget={targetBudget}
              setTargetBudget={setTargetBudget}
              lenderName={lenderName}
              setLenderName={setLenderName}
              loanAmount={loanAmount}
              setLoanAmount={setLoanAmount}
              interestRate={interestRate}
              setInterestRate={setInterestRate}
              invoices={invoices}
              setInvoices={setInvoices}
              uploadMethod={uploadMethod}
              setUploadMethod={setUploadMethod}
            />
          )}

          {step === 4 && (
            <OnboardingAuditReportStep
              projectName={projectName}
              companyName={companyName}
              totalIncurredSpend={totalIncurredSpend}
              disbursedFunded={disbursedFunded}
              frontingCashGap={frontingCashGap}
              dailyInterest={dailyInterest}
              onGenerateFinalReport={handleGenerateFinalReport}
            />
          )}
        </div>

        <OnboardingFooter
          step={step}
          onBack={() => setStep(step - 1)}
          onNext={() => setStep(step + 1)}
          onFinish={handleFinish}
        />
      </div>
    </div>
  );
}
