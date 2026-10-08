// GroundUp AI — Role-Based Dynamic Self-Onboarding Engine Tests
// Verifies sequential question evaluation, role-specific branch paths, dynamic skipping,
// setup task generation, and workspace resolution.

import { describe, it, expect } from 'vitest';
import { QUESTION_DEFINITIONS } from '../src/client/onboarding/questionGraph';
import { generateSetupTasks, resolveTargetWorkspace, buildCreatedProject } from '../src/client/onboarding/taskGenerator';
import { OnboardingState } from '../src/client/onboarding/types';

describe('Role-Based Dynamic Onboarding Engine', () => {
  it('Q1 role selection defines the valid app user roles (and excludes Lender)', () => {
    const rootQ = QUESTION_DEFINITIONS.role;
    expect(rootQ).toBeDefined();
    expect(rootQ.type).toBe('single_select');

    const roleValues = rootQ.options?.map(o => o.value) || [];
    expect(roleValues).toContain('OWNER');
    expect(roleValues).toContain('PROJECT_MANAGER');
    expect(roleValues).toContain('GENERAL_CONTRACTOR');
    expect(roleValues).toContain('FINANCE');
    expect(roleValues).toContain('ACCOUNTANT');
    expect(roleValues).toContain('INVESTOR');
    expect(roleValues).toContain('VIEWER');

    // Lender is NOT an app user
    expect(roleValues).not.toContain('LENDER');
  });

  describe('Owner Dynamic Flow & Skipping', () => {
    it('branches into owner_mode after selecting OWNER', () => {
      const state: OnboardingState = { role: 'OWNER' };
      const nextId = QUESTION_DEFINITIONS.role.getNextQuestionId(state);
      expect(nextId).toBe('owner_mode');
    });

    it('dynamically skips external lender questions when financing is all-equity', () => {
      const stateAllEquity: OnboardingState = {
        role: 'OWNER',
        owner_financing_type: 'all_equity',
      };
      const nextId = QUESTION_DEFINITIONS.owner_financing_type.getNextQuestionId(stateAllEquity);
      // Directly skips to GC contract model, never asks lender questions
      expect(nextId).toBe('owner_gc_contract_model');
    });

    it('requires lender details when financing is debt & equity', () => {
      const stateDebt: OnboardingState = {
        role: 'OWNER',
        owner_financing_type: 'debt_equity',
      };
      const nextId = QUESTION_DEFINITIONS.owner_financing_type.getNextQuestionId(stateDebt);
      expect(nextId).toBe('owner_lender_details');
    });

    it('generates bank loan upload task when debt financing is configured', () => {
      const state: OnboardingState = {
        role: 'OWNER',
        owner_financing_type: 'debt_equity',
        owner_lender_details: { lenderName: 'BCB Community Bank', retainagePct: '10' },
        owner_gc_contract_model: 'FIXED_PRICE',
      };
      const tasks = generateSetupTasks(state);
      expect(tasks.some(t => t.id === 'task-link-lender-loan')).toBe(true);
      expect(tasks.some(t => t.id === 'task-upload-sov')).toBe(true);
    });

    it('resolves Owner destination workspace to project-detail or portfolio', () => {
      const stateNewProj: OnboardingState = { role: 'OWNER', owner_mode: 'new_project' };
      const resolved = resolveTargetWorkspace(stateNewProj);
      expect(resolved.role).toBe('DEVELOPER_OWNER');
      expect(resolved.targetScreen).toBe('project-detail');

      const statePortfolio: OnboardingState = { role: 'OWNER', owner_mode: 'existing_portfolio' };
      expect(resolveTargetWorkspace(statePortfolio).targetScreen).toBe('portfolio');
    });
  });

  describe('General Contractor Dynamic Branching', () => {
    it('branches into Fixed Price billing cycle when FIXED_PRICE is chosen', () => {
      const stateFixed: OnboardingState = {
        role: 'GENERAL_CONTRACTOR',
        gc_contract_type: 'FIXED_PRICE',
      };
      const nextId = QUESTION_DEFINITIONS.gc_contract_type.getNextQuestionId(stateFixed);
      expect(nextId).toBe('gc_billing_schedule');
    });

    it('branches into markup rates when DAILY_UPDATES (cost-plus) is chosen', () => {
      const stateDaily: OnboardingState = {
        role: 'GENERAL_CONTRACTOR',
        gc_contract_type: 'DAILY_UPDATES',
      };
      const nextId = QUESTION_DEFINITIONS.gc_contract_type.getNextQuestionId(stateDaily);
      expect(nextId).toBe('gc_markup_rates');
    });

    it('routes Fixed Price GC to gc-fixed-portal and Daily GC to gc-daily-portal', () => {
      const fixedResult = resolveTargetWorkspace({ role: 'GENERAL_CONTRACTOR', gc_contract_type: 'FIXED_PRICE' });
      expect(fixedResult.role).toBe('GC_FIXED');
      expect(fixedResult.targetScreen).toBe('gc-fixed-portal');

      const dailyResult = resolveTargetWorkspace({ role: 'GENERAL_CONTRACTOR', gc_contract_type: 'DAILY_UPDATES' });
      expect(dailyResult.role).toBe('GC_DAILY');
      expect(dailyResult.targetScreen).toBe('gc-daily-portal');
    });
  });

  describe('Finance & Accountant Dynamic Resolution', () => {
    it('routes Finance role to cfo-recon with high-priority draw setup task', () => {
      const state: OnboardingState = { role: 'FINANCE', fin_draw_standard: 'aia_g702_g703' };
      const resolved = resolveTargetWorkspace(state);
      expect(resolved.role).toBe('CFO');
      expect(resolved.targetScreen).toBe('cfo-recon');

      const tasks = generateSetupTasks(state);
      expect(tasks.some(t => t.id === 'task-fin-draw-template')).toBe(true);
    });

    it('routes Accountant to document-intake when AP invoicing is primary focus', () => {
      const state: OnboardingState = { role: 'ACCOUNTANT', acct_focus: 'ap_invoicing' };
      const resolved = resolveTargetWorkspace(state);
      expect(resolved.role).toBe('ACCOUNTANT');
      expect(resolved.targetScreen).toBe('document-intake');
    });
  });

  describe('Project Manager & Investor Workspaces', () => {
    it('routes Project Manager to timeline workspace with municipal permits task', () => {
      const state: OnboardingState = {
        role: 'PROJECT_MANAGER',
        pm_municipal_authority: 'City of Hoboken Construction Code',
        pm_delay_tracking: 'strict_carrying_cost',
      };
      const resolved = resolveTargetWorkspace(state);
      expect(resolved.role).toBe('PM');
      expect(resolved.targetScreen).toBe('timeline');

      const tasks = generateSetupTasks(state);
      expect(tasks.some(t => t.id === 'task-link-municipal-permits')).toBe(true);
      expect(tasks.some(t => t.id === 'task-configure-carrying-costs')).toBe(true);
    });

    it('routes Investor to investor-portal with capital commitment task', () => {
      const state: OnboardingState = { role: 'INVESTOR', investor_position: 'lp_equity' };
      const resolved = resolveTargetWorkspace(state);
      expect(resolved.role).toBe('INVESTOR');
      expect(resolved.targetScreen).toBe('investor-portal');

      const tasks = generateSetupTasks(state);
      expect(tasks.some(t => t.id === 'task-investor-verify-commitment')).toBe(true);
    });
  });

  describe('Validation & Project Construction', () => {
    it('validates required fields on owner_project_info', () => {
      const validate = QUESTION_DEFINITIONS.owner_project_info.validate!;
      expect(validate({}).valid).toBe(false);
      expect(validate({ owner_project_info: { projectName: 'Test Proj', projectAddress: '123 Main St', units: 4 } }).valid).toBe(true);
    });

    it('builds a normalized Project record from owner answers', () => {
      const state: OnboardingState = {
        role: 'OWNER',
        owner_project_info: {
          projectName: '73 Broadway',
          projectAddress: '73 Broadway, Hoboken, NJ',
          units: 3,
          squareFeet: 4800,
        },
        owner_active_budget: {
          hardCostBudget: 1820000,
          contingencyPct: 10,
        },
        owner_financing_type: 'debt_equity',
        owner_lender_details: {
          lenderName: 'BCB Community Bank',
        },
      };

      const project = buildCreatedProject(state, 'user-dev-1');
      expect(project).not.toBeNull();
      expect(project?.name).toBe('73 Broadway');
      expect(project?.target_budget).toBe(1820000);
      expect(project?.contingency_initial).toBe(182000);
      expect(project?.lender_name).toBe('BCB Community Bank');
    });
  });
});
