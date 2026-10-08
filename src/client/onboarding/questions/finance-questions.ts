import { QuestionDefinition } from '../types';

export const FINANCE_QUESTIONS: Record<string, QuestionDefinition> = {
  fin_primary_mandate: {
    id: 'fin_primary_mandate',
    categoryLabel: 'Financial Mandate',
    title: 'What is your primary financial responsibility in GroundUp?',
    subtitle: 'Configures your treasury tools, draw approval authority, and cash flow forecasts.',
    type: 'single_select',
    options: [
      {
        value: 'capital_draws',
        label: 'Construction Loan Administration & Lender Draw Packets',
        badge: 'AIA G702 / Draws',
        description: 'Compiling certified draw packages, tracking retainage, and monitoring lender wire disbursements.',
      },
      {
        value: 'budget_cashflow',
        label: 'Project Cash Flow, AP Matching & Contingency Control',
        badge: 'Budget & Spend',
        description: 'Reconciling daily spend against budget lines and managing contingency absorption.',
      },
      {
        value: 'treasury_investors',
        label: 'Multi-Project Treasury, Capital Calls & LP Waterfalls',
        badge: 'Treasury & Equity',
        description: 'Monitoring portfolio-wide liquidity, LP capital calls, and preferred return hurdles.',
      },
    ],
    validate: (state) => ({ valid: Boolean(state.fin_primary_mandate), error: 'Please choose your primary mandate.' }),
    getNextQuestionId: () => 'fin_draw_standard',
  },

  fin_draw_standard: {
    id: 'fin_draw_standard',
    categoryLabel: 'Draw Standards',
    title: 'What draw packet standard do your construction lenders require?',
    type: 'single_select',
    options: [
      {
        value: 'aia_g702_g703',
        label: 'AIA G702 / G703 Canonical Standard',
        badge: 'Industry Standard',
        description: 'Full Application and Certificate for Payment with Continuation Sheet and notarization.',
      },
      {
        value: 'bank_custom',
        label: 'Lender-Specific Commercial Requisition Form',
        badge: 'Custom Sheet',
        description: 'Export into bank-provided Excel workbooks with attached invoices and inspection affidavits.',
      },
    ],
    validate: (state) => ({ valid: Boolean(state.fin_draw_standard), error: 'Please choose a draw packet format.' }),
    getNextQuestionId: () => 'fin_contingency_governance',
  },

  fin_contingency_governance: {
    id: 'fin_contingency_governance',
    categoryLabel: 'Contingency Governance',
    title: 'What policy governs absorbing budget variances from Contingency?',
    subtitle: 'GroundUp protects your 10% reserve from unchecked cost creep.',
    type: 'single_select',
    options: [
      {
        value: 'strict_owner',
        label: 'Strict: Every contingency reallocation requires Developer / Owner approval',
        badge: 'Owner Sign-Off',
        description: 'No variance absorption occurs without the principal sponsor’s digital sign-off.',
      },
      {
        value: 'cfo_limit_25k',
        label: 'Tiered: Finance authorized up to $25,000; Owner required for larger overruns',
        badge: 'Tiered Authority',
        description: 'Empowers finance to resolve minor line variances while escalating major overruns.',
      },
      {
        value: 'auto_variance',
        label: 'Automatic: Variances under 5% automatically absorbed with audit notification',
        badge: 'Automated',
        description: 'Routine minor price increases absorb seamlessly with an entry logged to the audit trail.',
      },
    ],
    validate: (state) => ({ valid: Boolean(state.fin_contingency_governance), error: 'Please select a contingency policy.' }),
    getNextQuestionId: () => 'fin_reconciliation_cadence',
  },

  fin_reconciliation_cadence: {
    id: 'fin_reconciliation_cadence',
    categoryLabel: 'Reconciliation Cadence',
    title: 'How frequently should Amex card charges and invoices be reconciled?',
    type: 'single_select',
    options: [
      {
        value: 'daily_continuous',
        label: 'Continuous Real-Time Matching (AI matches charges upon arrival)',
        badge: 'Real-Time',
        description: 'Spend Truth is continuously up to date and anomalies trigger immediate alerts.',
      },
      {
        value: 'weekly_batch',
        label: 'Weekly Review Sprint',
        badge: 'Weekly',
        description: 'Batch review and match previous week’s receipts every Monday morning.',
      },
      {
        value: 'monthly_draw',
        label: 'Monthly Prior to Lender Draw Compilation',
        badge: 'Monthly',
        description: 'Reconcile all vendor bills during the monthly draw closing period.',
      },
    ],
    validate: (state) => ({ valid: Boolean(state.fin_reconciliation_cadence), error: 'Please choose a cadence.' }),
    getNextQuestionId: () => null,
  },
};
