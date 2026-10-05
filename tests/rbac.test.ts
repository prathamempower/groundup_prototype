// GroundUp AI — RBAC Permission & Authorization Unit Tests
// Tests role boundaries, screen access gates, and least-privilege enforcement

import { describe, it, expect } from 'vitest';
import { 
  hasPermission, 
  hasAllPermissions, 
  hasAnyPermission, 
  isScreenPermitted, 
  getPermittedScreens, 
  getRoleDefaultScreen,
  ROLE_PERMISSIONS,
  ROLE_ALLOWED_SCREENS,
  ROLE_ACCESS_PROFILES
} from '../src/shared/rbac/matrix';
import { UserRole } from '../src/shared/types';

describe('RBAC: Role Permission Matrix & Boundaries', () => {
  it('DEVELOPER_OWNER has root access across all critical capabilities', () => {
    const ownerPermissions = ROLE_PERMISSIONS.DEVELOPER_OWNER;
    expect(ownerPermissions).toContain('project:create');
    expect(ownerPermissions).toContain('project:view_financials');
    expect(ownerPermissions).toContain('deal_lab:access');
    expect(ownerPermissions).toContain('change_order:approve');
    expect(ownerPermissions).toContain('contingency:manage');
    expect(ownerPermissions).toContain('draw:create_packet');
    expect(ownerPermissions).toContain('project:settings');

    expect(hasPermission('DEVELOPER_OWNER', 'project:view_financials')).toBe(true);
    expect(hasPermission('DEVELOPER_OWNER', 'deal_lab:access')).toBe(true);
    expect(getRoleDefaultScreen('DEVELOPER_OWNER')).toBe('portfolio');
  });

  it('LENDER is strictly isolated to draw review, waiver audits, and wire releases', () => {
    expect(hasPermission('LENDER', 'draw:review_queue')).toBe(true);
    expect(hasPermission('LENDER', 'draw:approve_lines')).toBe(true);
    expect(hasPermission('LENDER', 'draw:disburse_wire')).toBe(true);
    expect(hasPermission('LENDER', 'waiver:audit_view')).toBe(true);

    // Forbidden actions
    expect(hasPermission('LENDER', 'project:create')).toBe(false);
    expect(hasPermission('LENDER', 'project:view_financials')).toBe(false);
    expect(hasPermission('LENDER', 'deal_lab:access')).toBe(false);
    expect(hasPermission('LENDER', 'change_order:approve')).toBe(false);
    expect(hasPermission('LENDER', 'contingency:manage')).toBe(false);
    expect(hasPermission('LENDER', 'project:settings')).toBe(false);

    // Screen gates
    expect(isScreenPermitted('LENDER', 'lender-portal')).toBe(true);
    expect(isScreenPermitted('LENDER', 'document-intake')).toBe(true);
    expect(isScreenPermitted('LENDER', 'deal-lab')).toBe(false);
    expect(isScreenPermitted('LENDER', 'budget')).toBe(false);
    expect(isScreenPermitted('LENDER', 'investor-portal')).toBe(false);
    expect(getRoleDefaultScreen('LENDER')).toBe('lender-portal');
  });

  it('GC_FIXED cannot view proprietary developer pro forma, investor waterfall or bank facilities', () => {
    expect(hasPermission('GC_FIXED', 'milestone_claim:submit')).toBe(true);
    expect(hasPermission('GC_FIXED', 'milestone:view')).toBe(true);
    expect(hasPermission('GC_FIXED', 'change_order:create')).toBe(true);

    // Proprietary data shielding
    expect(hasPermission('GC_FIXED', 'project:view_financials')).toBe(false);
    expect(hasPermission('GC_FIXED', 'investor:view_waterfall')).toBe(false);
    expect(hasPermission('GC_FIXED', 'deal_lab:access')).toBe(false);
    expect(hasPermission('GC_FIXED', 'draw:disburse_wire')).toBe(false);

    // Screen gates
    expect(isScreenPermitted('GC_FIXED', 'gc-fixed-portal')).toBe(true);
    expect(isScreenPermitted('GC_FIXED', 'timeline')).toBe(true);
    expect(isScreenPermitted('GC_FIXED', 'deal-lab')).toBe(false);
    expect(isScreenPermitted('GC_FIXED', 'investor-portal')).toBe(false);
    expect(isScreenPermitted('GC_FIXED', 'lender-portal')).toBe(false);
    expect(getRoleDefaultScreen('GC_FIXED')).toBe('gc-fixed-portal');
  });

  it('GC_DAILY can only post field logs and view milestones', () => {
    expect(hasPermission('GC_DAILY', 'field_log:create')).toBe(true);
    expect(hasPermission('GC_DAILY', 'milestone:view')).toBe(true);

    // Prohibited
    expect(hasPermission('GC_DAILY', 'project:view_financials')).toBe(false);
    expect(hasPermission('GC_DAILY', 'deal_lab:access')).toBe(false);
    expect(hasPermission('GC_DAILY', 'investor:view_waterfall')).toBe(false);

    // Screen gates
    expect(isScreenPermitted('GC_DAILY', 'gc-daily-portal')).toBe(true);
    expect(isScreenPermitted('GC_DAILY', 'timeline')).toBe(true);
    expect(isScreenPermitted('GC_DAILY', 'budget')).toBe(false);
    expect(getRoleDefaultScreen('GC_DAILY')).toBe('gc-daily-portal');
  });

  it('INVESTOR has read-only transparency and cannot mutate budgets, draws, or field operations', () => {
    expect(hasPermission('INVESTOR', 'investor:view_waterfall')).toBe(true);
    expect(hasPermission('INVESTOR', 'investor:download_report')).toBe(true);
    expect(hasPermission('INVESTOR', 'unit_sales:view')).toBe(true);

    // Prohibited modifications
    expect(hasPermission('INVESTOR', 'budget:edit')).toBe(false);
    expect(hasPermission('INVESTOR', 'change_order:create')).toBe(false);
    expect(hasPermission('INVESTOR', 'change_order:approve')).toBe(false);
    expect(hasPermission('INVESTOR', 'draw:create_packet')).toBe(false);
    expect(hasPermission('INVESTOR', 'milestone_claim:submit')).toBe(false);
    expect(hasPermission('INVESTOR', 'waiver:audit_manage')).toBe(false);

    // Screen gates
    expect(isScreenPermitted('INVESTOR', 'investor-portal')).toBe(true);
    expect(isScreenPermitted('INVESTOR', 'disposition')).toBe(true);
    expect(isScreenPermitted('INVESTOR', 'budget')).toBe(false);
    expect(isScreenPermitted('INVESTOR', 'settings')).toBe(false);
    expect(getRoleDefaultScreen('INVESTOR')).toBe('investor-portal');
  });

  it('hasAllPermissions and hasAnyPermission evaluate composite permission lists accurately', () => {
    expect(hasAllPermissions('DEVELOPER_OWNER', ['budget:view', 'budget:edit', 'change_order:approve'])).toBe(true);
    expect(hasAllPermissions('PM', ['milestone:view', 'budget:edit'])).toBe(false);

    expect(hasAnyPermission('PM', ['budget:edit', 'milestone:view'])).toBe(true);
    expect(hasAnyPermission('LENDER', ['deal_lab:access', 'investor:view_waterfall'])).toBe(false);
  });

  it('Every role has a defined access profile and designated default landing screen', () => {
    const roles: UserRole[] = [
      'DEVELOPER_OWNER',
      'CFO',
      'PM',
      'LENDER',
      'GC_FIXED',
      'GC_DAILY',
      'INVESTOR',
      'ACCOUNTANT',
    ];

    roles.forEach(role => {
      const screens = getPermittedScreens(role);
      const defaultScreen = getRoleDefaultScreen(role);
      const profile = ROLE_ACCESS_PROFILES[role];

      expect(screens.length).toBeGreaterThan(0);
      expect(screens).toContain(defaultScreen);
      expect(profile).toBeDefined();
      expect(profile.accessLevel).toBeTruthy();
      expect(profile.badge).toBeTruthy();
    });
  });
});
