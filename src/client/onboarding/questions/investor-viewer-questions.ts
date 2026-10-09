import { QuestionDefinition } from '../types';

export const INVESTOR_VIEWER_QUESTIONS: Record<string, QuestionDefinition> = {
  // ROLE: INVESTOR
  investor_profile: {
    id: 'investor_profile',
    categoryLabel: 'Investor Profile',
    title: 'What is your investing entity or individual investor name?',
    type: 'text',
    placeholder: 'e.g. Highline Capital Partners LP or Jane Doe Living Trust',
    validate: (state) => ({
      valid: Boolean(state.investor_profile?.trim()),
      error: 'Please enter investor or fund name.',
    }),
    getNextQuestionId: () => 'investor_position',
  },

  investor_position: {
    id: 'investor_position',
    categoryLabel: 'Capital Position',
    title: 'What is your investment position in this development?',
    subtitle: 'Customizes your debt and equity waterfall visualization.',
    type: 'single_select',
    options: [
      {
        value: 'lp_equity',
        label: 'Limited Partner (LP) Common Equity',
        badge: 'Common Equity',
        description: 'Pro-rata equity participation with preferred return hurdle and sponsor promote split.',
      },
      {
        value: 'pref_equity',
        label: 'Preferred Equity / Mezzanine Capital',
        badge: 'Senior to Common',
        description: 'Fixed priority return before common equity distributions.',
      },
      {
        value: 'jv_partner',
        label: 'Joint Venture (JV) Co-Sponsor',
        badge: 'Co-Sponsor',
        description: 'Full transparency into executive development economics and sponsor profits.',
      },
    ],
    validate: (state) => ({ valid: Boolean(state.investor_position), error: 'Please choose capital position.' }),
    getNextQuestionId: () => 'investor_reporting_tier',
  },

  investor_reporting_tier: {
    id: 'investor_reporting_tier',
    categoryLabel: 'Transparency Level',
    title: 'What reporting frequency and depth do you prefer?',
    type: 'single_select',
    options: [
      {
        value: 'executive_waterfall',
        label: 'Executive Summary & Capital Waterfall',
        badge: 'Executive',
        description: 'High-level dashboard: Capital called, projected IRR, loan balance, and distribution forecast.',
      },
      {
        value: 'full_audit',
        label: 'Full Audit Transparency (Draw Packets & Inspection Proof)',
        badge: 'Deep Transparency',
        description: 'Executive dashboard plus access to certified monthly draw packages and job site photos.',
      },
      {
        value: 'capital_notices',
        label: 'Event Notices Only (Capital Calls & Distributions)',
        badge: 'Minimalist',
        description: 'Email notices on capital contribution events with quarterly PDF statements.',
      },
    ],
    validate: (state) => ({ valid: Boolean(state.investor_reporting_tier), error: 'Please select reporting preference.' }),
    getNextQuestionId: () => null,
  },

  // ROLE: VIEWER
  viewer_affiliation: {
    id: 'viewer_affiliation',
    categoryLabel: 'Professional Role',
    title: 'What is your professional role regarding this development?',
    subtitle: 'Access is limited to read-only view of approved project documents.',
    type: 'single_select',
    options: [
      {
        value: 'legal_title',
        label: 'Legal Counsel / Title Insurance Officer',
        badge: 'Legal & Title',
        description: 'Reviewing title documentation, municipal permits, and lien waiver compliance.',
      },
      {
        value: 'architect_engineer',
        label: 'Architect of Record / Consulting Engineer',
        badge: 'Design & Engineering',
        description: 'Reviewing construction milestones against approved architectural plans.',
      },
      {
        value: 'third_party_auditor',
        label: 'Third-Party Cost Consultant / Bank Field Inspector',
        badge: 'Independent Audit',
        description: 'Independent inspection of work in place and Schedule of Values alignment.',
      },
      {
        value: 'advisory',
        label: 'Board Member / Strategic Advisory',
        badge: 'Advisory',
        description: 'High-level review of project milestones, delivery timelines, and risk registers.',
      },
    ],
    validate: (state) => ({ valid: Boolean(state.viewer_affiliation), error: 'Please select your professional role.' }),
    getNextQuestionId: () => 'viewer_scope',
  },

  viewer_scope: {
    id: 'viewer_scope',
    categoryLabel: 'Access Scope',
    title: 'What primary documentation do you need to inspect?',
    type: 'single_select',
    options: [
      {
        value: 'draw_evidence',
        label: 'Lender Draw Packets, Invoices & Subcontractor Lien Waivers',
        badge: 'Financial Audit',
        description: 'Access to financial source documentation and proof of payment.',
      },
      {
        value: 'plans_permits',
        label: 'Architectural Plans, Municipal Permits & Inspection Sign-Offs',
        badge: 'Building Plans',
        description: 'Access to official architectural plans, zoning approvals, and municipal certificates.',
      },
      {
        value: 'schedule_timeline',
        label: 'Project Milestone Timelines & Physical Completion %',
        badge: 'Schedule',
        description: 'Access to critical path schedule and physical completion percentages.',
      },
    ],
    validate: (state) => ({ valid: Boolean(state.viewer_scope), error: 'Please select documentation scope.' }),
    getNextQuestionId: () => null,
  },
};
