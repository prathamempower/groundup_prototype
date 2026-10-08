export type ProjectFormData = {
  projectName?: string;
  propertyAddress?: string;
  projectType?: string;
  developmentStrategy?: string;
  projectEntity?: string;
  currentStage?: string;
  acquisitionStatus?: string;
  acquisitionDate?: string;
  acquisitionCost?: string;
  fundingMethod?: string;
  lenderName?: string;
  interestRate?: string;
  interestPaymentMethod?: 'RESERVE' | 'MONTHLY_OUT_OF_POCKET';
  contractModel?: 'FIXED_PRICE' | 'OPEN_BOOK';
  hardCosts?: string;
  softCosts?: string;
  contingencyPct?: string;
  hudDocumentName?: string;
  estimatedTotalCost?: string;
  targetCompletionDate?: string;
  projectManager?: string;
};

export type FormStep = {
  id: string;
  title: string;
  description: string;
};

export const WIZARD_STEPS: FormStep[] = [
  { id: 'foundation', title: 'Project Foundation', description: 'Basic details and strategy' },
  { id: 'status', title: 'Acquisition & Closing', description: 'Entity, HUD, and acquisition details' },
  { id: 'financials', title: 'Financing & Contract', description: 'Loan terms, GC model & Pro Forma' },
  { id: 'review', title: 'Review & Create', description: 'Confirm project details' }
];
