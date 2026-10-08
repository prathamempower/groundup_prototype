import { QuestionDefinition } from '../types';

export const GC_QUESTIONS: Record<string, QuestionDefinition> = {
  gc_business_profile: {
    id: 'gc_business_profile',
    categoryLabel: 'Contractor Profile',
    title: 'What is your contracting company information?',
    subtitle: 'Identifies your business on payment applications, certified affidavits, and lien waivers.',
    type: 'multi_field',
    fields: [
      { id: 'gcCompanyName', label: 'GC Business Legal Name', placeholder: 'e.g. Metro Builds LLC or K&P Construction', required: true },
      { id: 'licenseNumber', label: 'General Contractor License #', placeholder: 'e.g. NJ-HIC-13VH09876500', required: true },
      { id: 'stateOfLicensure', label: 'State of Licensure', placeholder: 'e.g. New Jersey', required: true },
    ],
    validate: (state) => {
      const data = state.gc_business_profile || {};
      if (!data.gcCompanyName?.trim()) return { valid: false, error: 'Company name is required.' };
      if (!data.licenseNumber?.trim()) return { valid: false, error: 'License number is required.' };
      return { valid: true };
    },
    getNextQuestionId: () => 'gc_contract_type',
  },

  gc_contract_type: {
    id: 'gc_contract_type',
    categoryLabel: 'Billing Structure',
    title: 'What contract delivery structure are you operating under?',
    subtitle: 'This switches your GroundUp portal between Milestone Claims and Daily Field Logs.',
    type: 'single_select',
    options: [
      {
        value: 'FIXED_PRICE',
        label: 'Fixed-Price / Lump-Sum Milestone Contract',
        badge: 'Milestone Claims',
        description: 'You submit payment claims against approved Schedule of Values (SOV) lines with photo proof & inspection passes.',
      },
      {
        value: 'DAILY_UPDATES',
        label: 'Cost-Plus / Time & Materials Contract',
        badge: 'Daily Work Logs',
        description: 'You log daily manpower headcounts, subcontractor hours, and material invoices with contractual markup.',
      },
    ],
    validate: (state) => ({ valid: Boolean(state.gc_contract_type), error: 'Please select contract structure.' }),
    getNextQuestionId: (state) => {
      if (state.gc_contract_type === 'FIXED_PRICE') return 'gc_billing_schedule';
      return 'gc_markup_rates';
    },
  },

  gc_billing_schedule: {
    id: 'gc_billing_schedule',
    categoryLabel: 'Draw Application Schedule',
    title: 'When do you submit your payment applications?',
    type: 'single_select',
    options: [
      {
        value: 'monthly_cutoff',
        label: 'Monthly Draw Cycle (by 25th of each month)',
        badge: 'Standard Cycle',
        description: 'Applications packaged monthly for the lender’s upcoming draw inspection cycle.',
      },
      {
        value: 'milestone_event',
        label: 'Event-Driven (Immediately upon milestone completion)',
        badge: 'Fast Turnaround',
        description: 'Applications submitted as soon as an inspection passes, regardless of the calendar day.',
      },
    ],
    validate: (state) => ({ valid: Boolean(state.gc_billing_schedule), error: 'Please select billing schedule.' }),
    getNextQuestionId: () => 'gc_waiver_protocol',
  },

  gc_markup_rates: {
    id: 'gc_markup_rates',
    categoryLabel: 'Cost-Plus Rates',
    title: 'What are your contractual markup rates and daily log cutoffs?',
    type: 'multi_field',
    fields: [
      { id: 'markupPct', label: 'Contractual Overhead & Profit Markup %', placeholder: 'e.g. 12%', required: true },
      { id: 'cutoffTime', label: 'Daily Field Log Cutoff Time', placeholder: 'e.g. 5:00 PM EST', required: true },
    ],
    validate: (state) => {
      const data = state.gc_markup_rates || {};
      if (!data.markupPct?.trim()) return { valid: false, error: 'Markup rate is required.' };
      return { valid: true };
    },
    getNextQuestionId: () => 'gc_waiver_protocol',
  },

  gc_waiver_protocol: {
    id: 'gc_waiver_protocol',
    categoryLabel: 'Lien Waiver Compliance',
    title: 'How do you collect and submit subcontractor lien waivers?',
    subtitle: 'Owners and title companies require lien waivers to prevent mechanics liens against the property.',
    type: 'single_select',
    options: [
      {
        value: 'digital_with_draw',
        label: 'Digital Waivers Submitted with Each Pay Application',
        badge: 'Recommended',
        description: 'Subcontractors sign conditional lien waivers digitally prior to draw payment release.',
      },
      {
        value: 'post_disbursement',
        label: 'Unconditional Waivers Submitted Following Payment',
        badge: 'Post-Payment',
        description: 'Unconditional lien waivers provided within 10 business days after receiving funds.',
      },
    ],
    validate: (state) => ({ valid: Boolean(state.gc_waiver_protocol), error: 'Please select a lien waiver protocol.' }),
    getNextQuestionId: () => null,
  },
};
