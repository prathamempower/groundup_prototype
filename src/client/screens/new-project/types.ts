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
  { id: 'status', title: 'Current Status', description: 'Entity and acquisition details' },
  { id: 'financials', title: 'Financials & Schedule', description: 'Costs and timelines' },
  { id: 'review', title: 'Review & Create', description: 'Confirm project details' }
];
