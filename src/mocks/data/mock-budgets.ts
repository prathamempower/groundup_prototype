import { BudgetVersion, BudgetLine } from '../../types';

export const INITIAL_BUDGET_VERSIONS: BudgetVersion[] = [
  {
    id: 'bv-73-v1',
    project_id: 'proj-73-broadway',
    version_number: 1,
    status: 'APPROVED',
    approved_at: '2025-09-01T00:00:00Z',
    approved_by_user_id: 'user-cfo-1',
    notes: 'GMP Master Budget BCB Bank',
    created_at: '2025-09-01T00:00:00Z',
  },
  {
    id: 'bv-212-v1',
    project_id: 'proj-212-maple',
    version_number: 1,
    status: 'APPROVED',
    approved_at: '2026-02-14T00:00:00Z',
    approved_by_user_id: 'user-cfo-1',
    notes: 'GMP Master Budget Heritage Bank',
    created_at: '2026-02-14T00:00:00Z',
  },
];

export const INITIAL_BUDGET_LINES: BudgetLine[] = [
  // 73 Broadway
  { id: 'bl-73-1', project_id: 'proj-73-broadway', version_id: 'bv-73-v1', category: 'Pre-construction & Permits', cost_code: '01-100', original_amount: 95000 },
  { id: 'bl-73-2', project_id: 'proj-73-broadway', version_id: 'bv-73-v1', category: 'Site Work & Demolition', cost_code: '02-100', original_amount: 78000 },
  { id: 'bl-73-3', project_id: 'proj-73-broadway', version_id: 'bv-73-v1', category: 'Foundation & Concrete', cost_code: '03-300', original_amount: 285000 },
  { id: 'bl-73-4', project_id: 'proj-73-broadway', version_id: 'bv-73-v1', category: 'Framing & Trusses', cost_code: '06-100', original_amount: 440000 },
  { id: 'bl-73-5', project_id: 'proj-73-broadway', version_id: 'bv-73-v1', category: 'Plumbing', cost_code: '22-000', original_amount: 215000 },
  { id: 'bl-73-6', project_id: 'proj-73-broadway', version_id: 'bv-73-v1', category: 'Electrical', cost_code: '26-000', original_amount: 195000 },
  { id: 'bl-73-7', project_id: 'proj-73-broadway', version_id: 'bv-73-v1', category: 'Drywall & Insulation', cost_code: '09-200', original_amount: 165000 },
  { id: 'bl-73-8', project_id: 'proj-73-broadway', version_id: 'bv-73-v1', category: 'Exterior & Roofing', cost_code: '07-100', original_amount: 185000 },
  { id: 'bl-73-9', project_id: 'proj-73-broadway', version_id: 'bv-73-v1', category: 'Interior Finishes', cost_code: '09-600', original_amount: 120000 },
  { id: 'bl-73-10', project_id: 'proj-73-broadway', version_id: 'bv-73-v1', category: 'Contingency', cost_code: '00-500', original_amount: 42000 },

  // 212 Maple Ave
  { id: 'bl-212-1', project_id: 'proj-212-maple', version_id: 'bv-212-v1', category: 'Pre-construction & Permits', cost_code: '01-100', original_amount: 38000 },
  { id: 'bl-212-2', project_id: 'proj-212-maple', version_id: 'bv-212-v1', category: 'Site Work & Demolition', cost_code: '02-100', original_amount: 42000 },
  { id: 'bl-212-3', project_id: 'proj-212-maple', version_id: 'bv-212-v1', category: 'Foundation & Concrete', cost_code: '03-300', original_amount: 135000 },
  { id: 'bl-212-4', project_id: 'proj-212-maple', version_id: 'bv-212-v1', category: 'Framing & Trusses', cost_code: '06-100', original_amount: 185000 },
  { id: 'bl-212-5', project_id: 'proj-212-maple', version_id: 'bv-212-v1', category: 'MEP Rough-in', cost_code: '22-000', original_amount: 110000 },
  { id: 'bl-212-6', project_id: 'proj-212-maple', version_id: 'bv-212-v1', category: 'Drywall & Insulation', cost_code: '09-200', original_amount: 65000 },
  { id: 'bl-212-7', project_id: 'proj-212-maple', version_id: 'bv-212-v1', category: 'Exterior & Roofing', cost_code: '07-100', original_amount: 55000 },
  { id: 'bl-212-8', project_id: 'proj-212-maple', version_id: 'bv-212-v1', category: 'Interior Finishes', cost_code: '09-600', original_amount: 75000 },
  { id: 'bl-212-9', project_id: 'proj-212-maple', version_id: 'bv-212-v1', category: 'Contingency', cost_code: '00-500', original_amount: 35000 },
];
