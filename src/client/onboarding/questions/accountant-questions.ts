import { QuestionDefinition } from '../types';

export const ACCOUNTANT_QUESTIONS: Record<string, QuestionDefinition> = {
  acct_focus: {
    id: 'acct_focus',
    categoryLabel: 'Accounting Focus',
    title: 'What is your primary day-to-day workflow in GroundUp?',
    type: 'single_select',
    options: [
      {
        value: 'ap_invoicing',
        label: 'Accounts Payable & Trade Invoice Coding',
        badge: 'AP Coding',
        description: 'Ingesting trade invoices, OCR extraction, and matching items to budget cost codes.',
      },
      {
        value: 'waiver_compliance',
        label: 'Lien Waiver Audit & Subcontractor Compliance',
        badge: 'Compliance',
        description: 'Tracking conditional and unconditional waivers across all tiers of subcontractors.',
      },
      {
        value: 'gl_close',
        label: 'Monthly General Ledger Close & Reconciliation',
        badge: 'GL Close',
        description: 'Matching construction spend to bank operating statements and exporting journal entries.',
      },
    ],
    validate: (state) => ({ valid: Boolean(state.acct_focus), error: 'Please choose an accounting focus.' }),
    getNextQuestionId: () => 'acct_cost_code_format',
  },

  acct_cost_code_format: {
    id: 'acct_cost_code_format',
    categoryLabel: 'Cost Code Standard',
    title: 'Which cost code classification system does your organization use?',
    type: 'single_select',
    options: [
      {
        value: 'csi_16',
        label: 'CSI 16-Division MasterFormat',
        badge: 'Standard 16',
        description: '01 General, 02 Sitework, 03 Concrete, 04 Masonry, 05 Metals, 06 Wood & Plastics...',
      },
      {
        value: 'csi_50',
        label: 'CSI 50-Division Modern MasterFormat',
        badge: 'Detailed 50',
        description: 'Granular sub-trade breakdowns for complex commercial construction.',
      },
      {
        value: 'custom_categories',
        label: 'Custom Development Budget Categories',
        badge: 'Simplified',
        description: 'High-level real estate buckets (Land, Hard Costs, Soft Costs, Financing, Marketing).',
      },
    ],
    validate: (state) => ({ valid: Boolean(state.acct_cost_code_format), error: 'Please select a cost code standard.' }),
    getNextQuestionId: () => 'acct_waiver_strictness',
  },

  acct_waiver_strictness: {
    id: 'acct_waiver_strictness',
    categoryLabel: 'Lien Waiver Policy',
    title: 'What rule should be enforced when a subcontractor lien waiver is missing?',
    subtitle: 'Protects the project from dual-liability under mechanics lien laws.',
    type: 'single_select',
    options: [
      {
        value: 'hard_block',
        label: 'Hard Block: Block invoice payment approval until unconditional waiver is verified',
        badge: 'Strict Audit',
        description: 'Zero disbursements allowed to any vendor with an outstanding prior-draw waiver.',
      },
      {
        value: 'warning_flag',
        label: 'Audit Flag: Highlight missing waiver but permit payment processing with notice',
        badge: 'Flag & Continue',
        description: 'Displays a high-priority warning flag on the reconciliation dashboard.',
      },
    ],
    validate: (state) => ({ valid: Boolean(state.acct_waiver_strictness), error: 'Please select a policy.' }),
    getNextQuestionId: () => null,
  },
};
