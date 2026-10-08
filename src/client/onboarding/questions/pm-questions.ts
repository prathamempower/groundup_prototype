import { QuestionDefinition } from '../types';

export const PM_QUESTIONS: Record<string, QuestionDefinition> = {
  pm_project_assignment: {
    id: 'pm_project_assignment',
    categoryLabel: 'Site Assignment',
    title: 'Which job site are you assigned to supervise?',
    subtitle: 'Connects your field supervision tools to the project’s municipal permits and milestone schedule.',
    type: 'single_select',
    options: [
      { value: 'proj-73-broadway', label: '73 Broadway (Hoboken, NJ)', badge: 'Active Build', description: '3-Unit Residential · In Framing Phase' },
      { value: 'proj-161-woodlawn', label: '161 Woodlawn Ave (Ridgewood, NJ)', badge: 'Active Build', description: 'Single-Family Custom · Site Prep Phase' },
      { value: 'proj-392-1st', label: '392 1st Street (Jersey City, NJ)', badge: 'Finishing Phase', description: '3-Unit Condominium · Punch List & CO' },
      { value: 'create_new_site', label: 'Supervise a New Job Site', badge: 'New Setup', description: 'Create and initialize a new construction project schedule' },
    ],
    validate: (state) => ({ valid: Boolean(state.pm_project_assignment), error: 'Please select your project assignment.' }),
    getNextQuestionId: (state) => {
      if (state.pm_project_assignment === 'create_new_site') return 'pm_new_site_info';
      return 'pm_field_tracking_protocol';
    },
  },

  pm_new_site_info: {
    id: 'pm_new_site_info',
    categoryLabel: 'Site Information',
    title: 'Enter the new job site details',
    type: 'multi_field',
    fields: [
      { id: 'siteName', label: 'Job Site Name', placeholder: 'e.g. 420 Washington St', required: true },
      { id: 'siteAddress', label: 'Physical Site Address', placeholder: 'e.g. 420 Washington St, Hoboken, NJ', required: true },
    ],
    validate: (state) => {
      const data = state.pm_new_site_info || {};
      if (!data.siteName?.trim()) return { valid: false, error: 'Job site name is required.' };
      return { valid: true };
    },
    getNextQuestionId: () => 'pm_field_tracking_protocol',
  },

  pm_field_tracking_protocol: {
    id: 'pm_field_tracking_protocol',
    categoryLabel: 'Field Protocol',
    title: 'What is your primary field supervision focus?',
    subtitle: 'Configures your daily operational dashboard priorities.',
    type: 'single_select',
    options: [
      {
        value: 'milestones_inspections',
        label: 'Milestone Progress % & Municipal Inspections',
        badge: 'Inspections',
        description: 'Focus on tracking milestone % gates and municipal building department inspection passes.',
      },
      {
        value: 'daily_logs',
        label: 'Daily Field Work Logs & Trade Headcounts',
        badge: 'Daily Manpower',
        description: 'Focus on logging subcontractor headcounts, daily deliveries, and field progress photos.',
      },
      {
        value: 'comprehensive',
        label: 'Comprehensive Supervision (Milestones + Daily Logs)',
        badge: 'Full Operations',
        description: 'Full supervisory suite: Milestone inspection gates, daily field logs, and delay calculations.',
      },
    ],
    validate: (state) => ({ valid: Boolean(state.pm_field_tracking_protocol), error: 'Please select a tracking focus.' }),
    getNextQuestionId: () => 'pm_municipal_authority',
  },

  pm_municipal_authority: {
    id: 'pm_municipal_authority',
    categoryLabel: 'Municipal Authority',
    title: 'Which municipal township building department has jurisdiction?',
    subtitle: 'GroundUp tags passed inspection documents to this authority before milestone draw lines can unlock.',
    type: 'text',
    placeholder: 'e.g. City of Hoboken Building Dept / Construction Official',
    validate: (state) => ({
      valid: Boolean(state.pm_municipal_authority?.trim()),
      error: 'Please enter municipal inspection authority.',
    }),
    getNextQuestionId: () => 'pm_delay_tracking',
  },

  pm_delay_tracking: {
    id: 'pm_delay_tracking',
    categoryLabel: 'Schedule & Delays',
    title: 'How should job site delays and carrying costs be tracked?',
    subtitle: 'Every day a milestone slips incurs loan interest reserve carrying costs.',
    type: 'single_select',
    options: [
      {
        value: 'strict_carrying_cost',
        label: 'Strict Root-Cause Delay Attribution',
        badge: 'Recommended',
        description: 'Requires tagging delay causes (Weather, Subcontractor Default, City Permitting) with automated daily carrying cost calculation.',
      },
      {
        value: 'standard_schedule',
        label: 'Standard Target Date Adjustment Only',
        badge: 'Basic',
        description: 'Adjust expected milestone completion dates without calculating loan carrying cost penalties.',
      },
    ],
    validate: (state) => ({ valid: Boolean(state.pm_delay_tracking), error: 'Please choose delay tracking mode.' }),
    getNextQuestionId: () => null,
  },
};
