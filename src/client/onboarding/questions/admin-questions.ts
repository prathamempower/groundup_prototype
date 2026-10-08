import { QuestionDefinition } from '../types';

export const ADMIN_QUESTIONS: Record<string, QuestionDefinition> = {
  admin_workspace_scope: {
    id: 'admin_workspace_scope',
    categoryLabel: 'Workspace Setup',
    title: 'What is the corporate structure of your organization?',
    subtitle: 'Configures entity relationships and multi-company ledger consolidation.',
    type: 'single_select',
    options: [
      {
        value: 'single_company',
        label: 'Single Development Operating Company',
        badge: 'Single Entity',
        description: 'All projects and bank accounts belong to one primary real estate development firm.',
      },
      {
        value: 'multi_entity',
        label: 'Multi-Entity Holding Structure (Parent + Special Purpose LLCs)',
        badge: 'Multi-Entity',
        description: 'Separate LLC legal entities per asset (e.g. 73 Broadway LLC) rolling up to a parent sponsor.',
      },
    ],
    validate: (state) => ({ valid: Boolean(state.admin_workspace_scope), error: 'Please select organization structure.' }),
    getNextQuestionId: () => 'admin_company_details',
  },

  admin_company_details: {
    id: 'admin_company_details',
    categoryLabel: 'Organization Identity',
    title: 'Enter your organization’s legal entity information',
    subtitle: 'This information appears on certified AIA draw packets, lien waiver registers, and investor distributions.',
    type: 'multi_field',
    fields: [
      { id: 'entityName', label: 'Company Legal Entity Name', placeholder: 'e.g. GroundUp Development Partners LLC', required: true },
      { id: 'taxId', label: 'Tax ID / EIN (Optional)', placeholder: 'e.g. XX-XXXXXXX', required: false },
      { id: 'headquarters', label: 'Principal Office City & State', placeholder: 'e.g. Jersey City, NJ', required: true },
    ],
    validate: (state) => {
      const data = state.admin_company_details || {};
      if (!data.entityName?.trim()) return { valid: false, error: 'Entity name is required.' };
      return { valid: true };
    },
    getNextQuestionId: () => 'admin_erp_integration',
  },

  admin_erp_integration: {
    id: 'admin_erp_integration',
    categoryLabel: 'Accounting Integration',
    title: 'Which general ledger or ERP accounting system does your company use?',
    subtitle: 'GroundUp syncs trade disbursements and matched invoice lines directly with your ledger.',
    type: 'single_select',
    options: [
      {
        value: 'quickbooks',
        label: 'QuickBooks Online / Desktop',
        badge: 'Direct Sync',
        description: 'Bi-directional sync of vendors, chart of accounts, and bills.',
      },
      {
        value: 'xero',
        label: 'Xero Cloud Accounting',
        badge: 'Direct Sync',
        description: 'Automated invoice mapping and bank feed reconciliation.',
      },
      {
        value: 'yardi_mri',
        label: 'Yardi Voyager / MRI Software',
        badge: 'Enterprise Real Estate',
        description: 'Property management and general ledger synchronization for enterprise developers.',
      },
      {
        value: 'manual_csv',
        label: 'Standard CSV / Excel Ingestion',
        badge: 'Manual Export',
        description: 'Standardized monthly journal export without continuous API sync.',
      },
    ],
    validate: (state) => ({ valid: Boolean(state.admin_erp_integration), error: 'Please select an accounting system.' }),
    getNextQuestionId: () => 'admin_card_spend',
  },

  admin_card_spend: {
    id: 'admin_card_spend',
    categoryLabel: 'Spend Tracking',
    title: 'How do you capture credit card expenses and material receipts?',
    subtitle: 'Eliminates receipt chasing by continuously matching field transactions to budget cost codes.',
    type: 'single_select',
    options: [
      {
        value: 'amex_feed',
        label: 'American Express Corporate Card Feed',
        badge: 'Real-Time Feed',
        description: 'Continuous daily card feed with automated AI receipt-to-line matching.',
      },
      {
        value: 'brex_ramp',
        label: 'Brex or Ramp Corporate Cards',
        badge: 'Webhook Sync',
        description: 'Automated spend ingestion with mobile receipt capture.',
      },
      {
        value: 'manual_claims',
        label: 'Traditional Expense Claims & Invoices Only',
        badge: 'AP Only',
        description: 'All field expenditures are submitted as traditional AP bills.',
      },
    ],
    validate: (state) => ({ valid: Boolean(state.admin_card_spend), error: 'Please select a spend tracking method.' }),
    getNextQuestionId: () => 'admin_invite_roles',
  },

  admin_invite_roles: {
    id: 'admin_invite_roles',
    categoryLabel: 'Team Onboarding',
    title: 'Who should be invited to your workspace?',
    subtitle: 'GroundUp will send secure invitations with strict data shields pre-applied to each role.',
    type: 'multi_field',
    fields: [
      { id: 'pmEmail', label: 'Project Manager Email (Field & Schedule)', placeholder: 'pm@company.com' },
      { id: 'cfoEmail', label: 'CFO / Financial Controller Email (Treasury & Draws)', placeholder: 'cfo@company.com' },
      { id: 'gcEmail', label: 'Primary General Contractor Email (Pay Applications)', placeholder: 'gc@buildpartner.com' },
    ],
    allowSkip: true,
    getNextQuestionId: () => null,
  },
};
