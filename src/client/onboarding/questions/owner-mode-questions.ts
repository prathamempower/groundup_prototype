import { QuestionDefinition } from '../types';

export const OWNER_MODE_QUESTIONS: Record<string, QuestionDefinition> = {
  owner_mode: {
    id: 'owner_mode',
    categoryLabel: 'Project Setup',
    title: 'How would you like to begin with your projects?',
    subtitle: 'Choose whether to launch your flagship construction project or configure a multi-property portfolio.',
    type: 'single_select',
    options: [
      {
        value: 'new_project',
        label: 'Set up an active development project',
        badge: 'Recommended',
        description: 'Configure project address, target budget, construction lender, and general contractor.',
      },
      {
        value: 'existing_portfolio',
        label: 'Manage a multi-project portfolio',
        description: 'Set up cross-project financial monitoring and portfolio-wide contingency controls.',
      },
      {
        value: 'join_org',
        label: 'Connect to an existing workspace',
        description: 'Join an organization already configured by your administrator or partners.',
      },
    ],
    validate: (state) => ({ valid: Boolean(state.owner_mode), error: 'Please choose an option.' }),
    getNextQuestionId: (state) => {
      if (state.owner_mode === 'join_org') return 'owner_join_workspace';
      if (state.owner_mode === 'existing_portfolio') return 'owner_portfolio_scale';
      return 'owner_project_info';
    },
  },

  owner_join_workspace: {
    id: 'owner_join_workspace',
    categoryLabel: 'Organization Access',
    title: 'Enter your Organization Workspace Code or Domain',
    subtitle: 'GroundUp connects your profile with your company’s centralized projects and security policies.',
    type: 'text',
    placeholder: 'e.g. org_groundup_horizon or company-domain.com',
    validate: (state) => ({
      valid: Boolean(state.owner_join_workspace && state.owner_join_workspace.trim().length >= 3),
      error: 'Please enter a valid workspace code or company domain.',
    }),
    getNextQuestionId: () => null,
  },

  owner_portfolio_scale: {
    id: 'owner_portfolio_scale',
    categoryLabel: 'Portfolio Scope',
    title: 'How many active and pipeline projects are currently in your portfolio?',
    type: 'single_select',
    options: [
      { value: '1_to_3', label: '1 to 3 Projects', description: 'Early to mid-stage development portfolio' },
      { value: '4_to_10', label: '4 to 10 Projects', description: 'Established commercial / residential pipeline' },
      { value: '10_plus', label: '10+ Projects', description: 'Enterprise real estate development firm' },
    ],
    validate: (state) => ({ valid: Boolean(state.owner_portfolio_scale), error: 'Please select portfolio scale.' }),
    getNextQuestionId: () => 'owner_project_info',
  },

  owner_project_info: {
    id: 'owner_project_info',
    categoryLabel: 'Project Information',
    title: 'What is the name and location of your primary project?',
    subtitle: 'This establishes your project’s financial center for budgets, draws, contracts, and municipal permits.',
    type: 'multi_field',
    fields: [
      { id: 'projectName', label: 'Project Name', placeholder: 'e.g. 73 Broadway or Parkview Residences', required: true },
      { id: 'projectAddress', label: 'Site Address', placeholder: 'e.g. 73 Broadway, Hoboken, NJ', required: true },
      { 
        id: 'assetClass', 
        label: 'Building Type', 
        type: 'select', 
        options: [
          { value: 'MULTIFAMILY', label: 'Multi-Family Residential' },
          { value: 'MIXED_USE', label: 'Mixed-Use (Commercial / Residential)' },
          { value: 'SINGLE_FAMILY', label: 'Single-Family Development / Subdivision' },
          { value: 'COMMERCIAL', label: 'Commercial Office / Retail' },
        ],
        required: true,
      },
      { id: 'units', label: 'Total Planned Units', type: 'number', placeholder: 'e.g. 4', required: true },
      { id: 'squareFeet', label: 'Gross Building Area (Sq Ft)', type: 'number', placeholder: 'e.g. 4800', required: true },
    ],
    validate: (state) => {
      const data = state.owner_project_info || {};
      if (!data.projectName?.trim()) return { valid: false, error: 'Project Name is required.' };
      if (!data.projectAddress?.trim()) return { valid: false, error: 'Site Address is required.' };
      if (!data.units || Number(data.units) <= 0) return { valid: false, error: 'Please enter valid unit count.' };
      return { valid: true };
    },
    getNextQuestionId: () => 'owner_phase',
  },
};
