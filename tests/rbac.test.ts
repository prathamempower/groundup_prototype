import { describe, it, expect } from 'vitest';
import { 
  hasPermission, 
  hasAllPermissions, 
  hasAnyPermission, 
  isScreenPermitted, 
  getPermittedScreens, 
  getRoleDefaultScreen,
  isProjectTabPermitted,
  getPermittedProjectTabs,
  getRoleDefaultTab,
  ROLE_PERMISSIONS,
  ROLE_ACCESS_PROFILES,
  GROUNDUP_ROLES,
} from '../src/shared/rbac';
import { UserRole } from '../src/shared/rbac/types';

describe('RBAC: GroundUp Roles, Permissions & Navigation Matrix', () => {
  it('OWNER has full administrative and portfolio capabilities', () => {
    expect(hasPermission('OWNER', 'project:create')).toBe(true);
    expect(hasPermission('OWNER', 'project:view_financials')).toBe(true);
    expect(hasPermission('OWNER', 'deal_lab:access')).toBe(true);
    expect(hasPermission('OWNER', 'change_order:approve')).toBe(true);
    expect(hasPermission('OWNER', 'contingency:manage')).toBe(true);
    expect(hasPermission('OWNER', 'draw:create_packet')).toBe(true);
    expect(getRoleDefaultScreen('OWNER')).toBe('portfolio');
    expect(getRoleDefaultTab('OWNER')).toBe('overview');
  });

  it('INVESTOR has read-only transparency and cannot access budget or draw mutation tabs', () => {
    expect(hasPermission('INVESTOR', 'investor:view_waterfall')).toBe(true);
    expect(hasPermission('INVESTOR', 'investor:download_report')).toBe(true);
    expect(hasPermission('INVESTOR', 'unit_sales:view')).toBe(true);

    // Prohibited mutations
    expect(hasPermission('INVESTOR', 'budget:edit')).toBe(false);
    expect(hasPermission('INVESTOR', 'change_order:create')).toBe(false);
    expect(hasPermission('INVESTOR', 'draw:create_packet')).toBe(false);

    // Tab gating ensures no 403 screen is ever encountered
    expect(isProjectTabPermitted('INVESTOR', 'overview')).toBe(true);
    expect(isProjectTabPermitted('INVESTOR', 'disposition')).toBe(true);
    expect(isProjectTabPermitted('INVESTOR', 'documents')).toBe(true);
    expect(isProjectTabPermitted('INVESTOR', 'budget')).toBe(false);
    expect(isProjectTabPermitted('INVESTOR', 'draws')).toBe(false);

    const investorTabs = getPermittedProjectTabs('INVESTOR');
    expect(investorTabs).toEqual(['overview', 'disposition', 'documents']);
    expect(getRoleDefaultTab('INVESTOR')).toBe('overview');
  });

  it('GENERAL_CONTRACTOR can submit milestone claims and field logs but cannot see pro forma financials', () => {
    expect(hasPermission('GENERAL_CONTRACTOR', 'milestone_claim:submit')).toBe(true);
    expect(hasPermission('GENERAL_CONTRACTOR', 'field_log:create')).toBe(true);
    expect(hasPermission('GENERAL_CONTRACTOR', 'change_order:create')).toBe(true);

    // Prohibited proprietary figures
    expect(hasPermission('GENERAL_CONTRACTOR', 'project:view_financials')).toBe(false);
    expect(hasPermission('GENERAL_CONTRACTOR', 'investor:view_waterfall')).toBe(false);
    expect(hasPermission('GENERAL_CONTRACTOR', 'deal_lab:access')).toBe(false);

    // Project tabs
    expect(isProjectTabPermitted('GENERAL_CONTRACTOR', 'timeline')).toBe(true);
    expect(isProjectTabPermitted('GENERAL_CONTRACTOR', 'budget')).toBe(false);
    expect(isProjectTabPermitted('GENERAL_CONTRACTOR', 'draws')).toBe(false);
    expect(getRoleDefaultTab('GENERAL_CONTRACTOR')).toBe('timeline');
  });

  it('PROJECT_MANAGER manages schedule, inspections, and delays', () => {
    expect(hasPermission('PROJECT_MANAGER', 'milestone:view')).toBe(true);
    expect(hasPermission('PROJECT_MANAGER', 'milestone:log_progress')).toBe(true);
    expect(hasPermission('PROJECT_MANAGER', 'delay:attribute')).toBe(true);

    expect(isProjectTabPermitted('PROJECT_MANAGER', 'timeline')).toBe(true);
    expect(isProjectTabPermitted('PROJECT_MANAGER', 'draws')).toBe(false);
  });

  it('FINANCE and ACCOUNTANT have full ledger and reconciliation authority', () => {
    expect(hasPermission('FINANCE', 'accounting:recon_matrix')).toBe(true);
    expect(hasPermission('FINANCE', 'contingency:manage')).toBe(true);
    expect(hasPermission('FINANCE', 'draw:create_packet')).toBe(true);
    expect(getRoleDefaultTab('FINANCE')).toBe('budget');

    expect(hasPermission('ACCOUNTANT', 'accounting:recon_matrix')).toBe(true);
    expect(hasPermission('ACCOUNTANT', 'waiver:audit_manage')).toBe(true);
    expect(hasPermission('ACCOUNTANT', 'contingency:manage')).toBe(false);
  });

  it('All GroundUp roles have canonical definitions, access profiles, and default landings', () => {
    const canonicalRoles: UserRole[] = [
      'OWNER',
      'PROJECT_MANAGER',
      'GENERAL_CONTRACTOR',
      'FINANCE',
      'ACCOUNTANT',
      'INVESTOR',
      'VIEWER',
    ];

    canonicalRoles.forEach((role) => {
      const screens = getPermittedScreens(role);
      const defaultScreen = getRoleDefaultScreen(role);
      const tabs = getPermittedProjectTabs(role);
      const defaultTab = getRoleDefaultTab(role);
      const def = GROUNDUP_ROLES[role];
      const profile = ROLE_ACCESS_PROFILES[role];

      expect(screens.length).toBeGreaterThan(0);
      expect(screens).toContain(defaultScreen);
      expect(tabs.length).toBeGreaterThan(0);
      expect(tabs).toContain(defaultTab);
      expect(def).toBeDefined();
      expect(def.roleTitle).toBeTruthy();
      expect(profile).toBeDefined();
      expect(profile.badge).toBeTruthy();
    });
  });

  it('Supports legacy aliases and treats LENDER strictly as an external Party with no user permissions', () => {
    expect(hasPermission('DEVELOPER_OWNER', 'project:create')).toBe(true);
    expect(hasPermission('CFO', 'accounting:recon_matrix')).toBe(true);
    expect(hasPermission('PM', 'delay:attribute')).toBe(true);
    expect(hasPermission('GC_FIXED', 'milestone_claim:submit')).toBe(true);
    expect(hasPermission('GC_DAILY', 'field_log:create')).toBe(true);
    expect(hasPermission('LENDER', 'draw:review_queue')).toBe(false);
    expect(hasPermission('LENDER', 'project:create')).toBe(false);
  });
});
