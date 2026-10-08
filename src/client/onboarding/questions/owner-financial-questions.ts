import { QuestionDefinition } from '../types';

export const OWNER_FINANCIAL_QUESTIONS: Record<string, QuestionDefinition> = {
  owner_financing_type: {
    id: 'owner_financing_type',
    categoryLabel: 'Capital Structure',
    title: (state) => {
      const pName = state.owner_project_info?.projectName || 'the project';
      return `How is ${pName} being financed?`;
    },
    subtitle: 'Lenders are external institutions linked to your project; your selection determines whether draw packet workflows are enabled.',
    type: 'single_select',
    options: [
      {
        value: 'debt_equity',
        label: 'Construction Loan + Sponsor / LP Equity',
        badge: 'Standard Bank Facility',
        description: 'Requires external construction lender draw packets (AIA G702/G703) and retainage release workflows.',
      },
      {
        value: 'all_equity',
        label: '100% Sponsor & Private Equity (All-Cash)',
        badge: 'Self-Funded',
        description: 'Self-funded capital. No external bank draw approvals, inspections, or retainage escrow required.',
      },
    ],
    validate: (state) => ({ valid: Boolean(state.owner_financing_type), error: 'Please select financing structure.' }),
    getNextQuestionId: (state) => {
      if (state.owner_financing_type === 'debt_equity') return 'owner_lender_details';
      return 'owner_gc_contract_model';
    },
  },

  owner_lender_details: {
    id: 'owner_lender_details',
    categoryLabel: 'Construction Lender',
    title: 'Which external bank or lender is financing the construction loan?',
    subtitle: 'Lenders do not log into GroundUp as users; GroundUp compiles certified draw packages to submit to their loan officers.',
    type: 'multi_field',
    fields: [
      { id: 'lenderName', label: 'Lender Institution Name', placeholder: 'e.g. BCB Community Bank, Chase, Valley Bank', required: true },
      { id: 'loanCommitment', label: 'Total Loan Commitment ($)', type: 'currency', placeholder: 'e.g. 1,400,000', required: true },
      { 
        id: 'retainagePct', 
        label: 'Contractual Retainage Withholding %', 
        type: 'select', 
        options: [
          { value: '10', label: '10% Retainage Withheld (Standard)' },
          { value: '5', label: '5% Retainage Withheld' },
          { value: '0', label: '0% (No Retainage)' },
        ],
        required: true,
      },
    ],
    validate: (state) => {
      const data = state.owner_lender_details || {};
      if (!data.lenderName?.trim()) return { valid: false, error: 'Lender name is required.' };
      if (!data.loanCommitment) return { valid: false, error: 'Loan commitment amount is required.' };
      return { valid: true };
    },
    getNextQuestionId: () => 'owner_gc_contract_model',
  },

  owner_gc_contract_model: {
    id: 'owner_gc_contract_model',
    categoryLabel: 'Contract Delivery Method',
    title: 'What contract model are you using with your General Contractor?',
    subtitle: 'This defines the verification proof required before invoices and draws can be authorized.',
    type: 'single_select',
    options: [
      {
        value: 'FIXED_PRICE',
        label: 'Fixed-Price / Lump-Sum Milestone Contract',
        badge: 'AIA G702 / G703',
        description: 'Contractor bills against Schedule of Values (SOV) upon completed physical milestones with municipal inspection sign-offs.',
      },
      {
        value: 'DAILY_UPDATES',
        label: 'Cost-Plus / Time & Materials with Daily Logs',
        badge: 'Open-Book',
        description: 'Contractor submits daily field logs, worker headcounts, delivery tickets, and trade receipts with agreed markup.',
      },
      {
        value: 'SELF_PERFORM',
        label: 'Owner-Builder / Direct Subcontractors',
        badge: 'Direct Trades',
        description: 'Developer acts as prime builder and hires trade subcontractors (framing, plumbing, electrical) directly.',
      },
    ],
    validate: (state) => ({ valid: Boolean(state.owner_gc_contract_model), error: 'Please choose GC contract model.' }),
    getNextQuestionId: () => 'owner_approval_governance',
  },

  owner_approval_governance: {
    id: 'owner_approval_governance',
    categoryLabel: 'Financial Governance',
    title: 'What approval governance policy should be enforced?',
    subtitle: 'Prevents unauthorized payments by establishing signing thresholds for change orders and draw releases.',
    type: 'single_select',
    options: [
      {
        value: 'solo',
        label: 'Solo Executive Authorization',
        badge: 'Direct Control',
        description: 'Owner personally reviews and executes all change order authorizations and draw packet submissions.',
      },
      {
        value: 'dual_25k',
        label: 'Dual-Signature Above $25,000',
        badge: 'Enterprise Control',
        description: 'Requires both Developer and Financial Controller / CFO co-approval for variances or wires exceeding $25,000.',
      },
    ],
    validate: (state) => ({ valid: Boolean(state.owner_approval_governance), error: 'Please select an approval policy.' }),
    getNextQuestionId: () => null,
  },
};
