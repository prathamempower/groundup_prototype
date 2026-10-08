import { QuestionDefinition } from '../types';

export const OWNER_PHASE_QUESTIONS: Record<string, QuestionDefinition> = {
  owner_phase: {
    id: 'owner_phase',
    categoryLabel: 'Project Phase',
    title: (state) => {
      const pName = state.owner_project_info?.projectName || 'your project';
      return `What stage of development is ${pName} currently in?`;
    },
    subtitle: 'GroundUp focuses your dashboard on the financial controls that matter right now.',
    type: 'single_select',
    options: [
      {
        value: 'pre_dev',
        label: 'Pre-Development & Underwriting',
        badge: 'Deal Stage',
        description: 'Land acquisition, zoning approvals, architectural planning, and loan term sizing.',
      },
      {
        value: 'active_construction',
        label: 'Active Construction (In Ground / Vertical)',
        badge: 'Execution',
        description: 'Foundations, framing, MEP rough-ins, trade invoices, and monthly lender draw cycles.',
      },
      {
        value: 'disposition',
        label: 'Finishing, Disposition & Unit Closings',
        badge: 'Sales & Closeout',
        description: 'Punch lists, municipal Certificate of Occupancy (CO), and condominium sales escrow.',
      },
    ],
    validate: (state) => ({ valid: Boolean(state.owner_phase), error: 'Please select the current stage.' }),
    getNextQuestionId: (state) => {
      if (state.owner_phase === 'pre_dev') return 'owner_predev_budget';
      if (state.owner_phase === 'disposition') return 'owner_disposition_sales';
      return 'owner_active_budget';
    },
  },

  owner_predev_budget: {
    id: 'owner_predev_budget',
    categoryLabel: 'Underwriting Economics',
    title: 'What are your estimated acquisition and construction target costs?',
    subtitle: 'These values set your baseline pro forma against which variances are tracked.',
    type: 'multi_field',
    fields: [
      { id: 'acquisitionCost', label: 'Land Acquisition Price ($)', type: 'currency', placeholder: 'e.g. 1,000,000', required: true },
      { id: 'estimatedHardCosts', label: 'Estimated Hard Construction Budget ($)', type: 'currency', placeholder: 'e.g. 1,820,000', required: true },
      { id: 'targetArv', label: 'Projected Completed Value / ARV ($)', type: 'currency', placeholder: 'e.g. 3,250,000', required: true },
    ],
    validate: (state) => {
      const data = state.owner_predev_budget || {};
      if (!data.estimatedHardCosts) return { valid: false, error: 'Please enter estimated hard costs.' };
      return { valid: true };
    },
    getNextQuestionId: () => 'owner_financing_type',
  },

  owner_active_budget: {
    id: 'owner_active_budget',
    categoryLabel: 'Construction Financials',
    title: 'What is the approved hard cost budget and contingency buffer?',
    subtitle: 'GroundUp locks this as Budget Truth and tracks every invoice and change order against it.',
    type: 'multi_field',
    fields: [
      { id: 'hardCostBudget', label: 'Contracted Hard Cost Budget ($)', type: 'currency', placeholder: 'e.g. 1,820,000', required: true },
      { 
        id: 'contingencyPct', 
        label: 'Contingency Reserve %', 
        type: 'select', 
        options: [
          { value: '5', label: '5% Contingency' },
          { value: '8', label: '8% Contingency' },
          { value: '10', label: '10% Contingency (Industry Standard)' },
          { value: '15', label: '15% Contingency (High Volatility / Renovation)' },
        ],
        required: true,
      },
    ],
    validate: (state) => {
      const data = state.owner_active_budget || {};
      if (!data.hardCostBudget) return { valid: false, error: 'Please enter contracted hard cost budget.' };
      return { valid: true };
    },
    getNextQuestionId: () => 'owner_financing_type',
  },

  owner_disposition_sales: {
    id: 'owner_disposition_sales',
    categoryLabel: 'Disposition & Sales',
    title: 'What is your projected gross sellout value?',
    type: 'multi_field',
    fields: [
      { id: 'projectedSales', label: 'Total Projected Gross Sales / ARV ($)', type: 'currency', placeholder: 'e.g. 3,250,000', required: true },
      { id: 'contractCount', label: 'Number of Units Under Executed Contract', type: 'number', placeholder: 'e.g. 2', required: false },
    ],
    validate: (state) => {
      const data = state.owner_disposition_sales || {};
      if (!data.projectedSales) return { valid: false, error: 'Please enter projected sales value.' };
      return { valid: true };
    },
    getNextQuestionId: () => 'owner_financing_type',
  },
};
